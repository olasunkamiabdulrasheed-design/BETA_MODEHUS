from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from catalog.models import Category, Product, ProductVariant
from orders.models import Order


class OrderFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="buyer@example.com", password="Testpass123!"
        )
        self.staff = User.objects.create_user(
            email="staff@example.com", password="Testpass123!", is_staff=True
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        category = Category.objects.create(name="Agbada")
        self.product = Product.objects.create(
            name="Agbada Royal", price=Decimal("30000.00"), category=category
        )
        self.variant = ProductVariant.objects.create(
            product=self.product, size="L", color="Gold",
            sku="AGR-ROYAL", price=Decimal("30000.00"), stock=10,
        )
        self.address = {
            "full_name": "Bola Ade", "phone": "08012345678",
            "street": "12 Awolowo Road", "city": "Ibadan",
            "state": "Oyo", "country": "Nigeria",
        }

    def _checkout(self, quantity=2):
        self.client.post(
            "/api/v1/cart/", {"variant_id": self.variant.id, "quantity": quantity}
        )
        return self.client.post(
            "/api/v1/orders/", {"address": self.address}, format="json"
        )

    def test_checkout_creates_order_with_totals(self):
        res = self._checkout()
        self.assertEqual(res.status_code, 201)
        order = res.data
        self.assertIn("BM-", order["number"])
        self.assertEqual(str(order["subtotal"]), "60000.00")
        self.assertEqual(str(order["total"]), "63000.00")  # + 3000 delivery
        self.assertEqual(order["status"], "pending_payment")
        self.assertEqual(len(order["items"]), 1)
        # stock must NOT be decremented before payment
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 10)

    def test_orders_list_scoped_to_user(self):
        self._checkout()
        self.client.force_authenticate(self.staff)
        staff_res = self.client.get("/api/v1/orders/")
        self.assertIn("BM-", staff_res.data["results"][0]["number"])
        other = User.objects.create_user(email="other@example.com", password="Testpass123!")
        self.client.force_authenticate(other)
        res = self.client.get("/api/v1/orders/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["results"]), 0)

    def test_admin_action_ship_requires_tracking(self):
        order_number = self._checkout().data["number"]
        self.client.force_authenticate(self.staff)
        order = Order.objects.get(number=order_number)
        order.payment_status = order.PaymentStatus.PAID
        order.save(update_fields=["payment_status"])

        bad = self.client.put(
            f"/api/v1/orders/admin/{order_number}/",
            {"action": "shipped"},
            format="json",
        )
        self.assertEqual(bad.status_code, 400)

        good = self.client.put(
            f"/api/v1/orders/admin/{order_number}/",
            {"action": "shipped", "tracking_number": "TRK-123"},
            format="json",
        )
        self.assertEqual(good.status_code, 200)
        self.assertEqual(good.data["status"], "shipped")
        self.assertEqual(good.data["tracking_number"], "TRK-123")

    def test_admin_stats_requires_staff(self):
        self.client.force_authenticate(self.user)
        res = self.client.get("/api/v1/orders/admin/stats/")
        self.assertEqual(res.status_code, 403)
        self.client.force_authenticate(self.staff)
        res = self.client.get("/api/v1/orders/admin/stats/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("revenue", res.data)
        self.assertIn("order_counts", res.data)