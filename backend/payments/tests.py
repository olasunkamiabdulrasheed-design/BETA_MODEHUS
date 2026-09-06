from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from accounts.models import User
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem
from payments.models import Payment
from payments.services import mark_payment_success, reconcile_payment


class PaymentFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="buyer@example.com", password="Testpass123!"
        )
        category = Category.objects.create(name="Agbada")
        self.product = Product.objects.create(
            name="Agbada Royal", price=Decimal("30000.00"), category=category
        )
        self.variant = ProductVariant.objects.create(
            product=self.product, size="L", color="Gold",
            sku="AGR-ROYAL", price=Decimal("30000.00"), stock=10,
        )
        self.order = Order.objects.create(
            user=self.user, full_name="Bola Ade", phone="08012345678",
            street="12 Awolowo Road", city="Ibadan", state="Oyo",
            subtotal=Decimal("60000.00"), shipping_fee=Decimal("3000.00"),
            total=Decimal("63000.00"),
        )
        OrderItem.objects.create(
            order=self.order, product=self.product, variant=self.variant,
            product_name=self.product.name, variant_label="L / Gold",
            sku="AGR-ROYAL", unit_price=Decimal("30000.00"),
            quantity=2, line_total=Decimal("60000.00"),
        )
        self.payment = Payment.objects.create(
            order=self.order, reference="BM1-ABC123", amount=Decimal("63000.00")
        )

    def _success_payload(self):
        return {
            "reference": self.payment.reference,
            "status": "SUCCESS",
            "amount": {"total": 6300000},  # kobo
        }

    def test_mark_payment_success_decrements_stock_once(self):
        mark_payment_success(self.payment, raw=self._success_payload())
        self.payment.refresh_from_db()
        self.order.refresh_from_db()
        self.variant.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.SUCCESS)
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)
        self.assertEqual(self.order.status, Order.Status.PROCESSING)
        self.assertEqual(self.variant.stock, 8)

        # idempotent — second call must NOT decrement again
        mark_payment_success(self.payment, raw=self._success_payload())
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 8)

    def test_amount_mismatch_raises(self):
        payload = self._success_payload()
        payload["amount"]["total"] = 1
        with self.assertRaises(ValueError):
            mark_payment_success(self.payment, raw=payload)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.PENDING)

    def test_reconcile_success_patches_status(self):
        with patch("payments.services.OpayClient") as mock_client:
            mock_client.return_value.query_status.return_value = self._success_payload()
            order = reconcile_payment(self.payment)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.SUCCESS)
        self.assertEqual(order.payment_status, Order.PaymentStatus.PAID)

    def test_reconcile_failure_flips_order_to_failed(self):
        with patch("payments.services.OpayClient") as mock_client:
            mock_client.return_value.query_status.return_value = {
                "reference": self.payment.reference, "status": "FAIL",
            }
            order = reconcile_payment(self.payment)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.FAILED)
        self.assertEqual(order.status, Order.Status.FAILED)