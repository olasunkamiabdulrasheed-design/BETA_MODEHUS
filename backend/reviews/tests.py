from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User

from accounts.models import User
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem
from reviews.models import Review


class ReviewTests(TestCase):
    def setUp(self):
        self.verified = User.objects.create_user(
            email="buyer@example.com", password="Testpass123!"
        )
        self.stranger = User.objects.create_user(
            email="stranger@example.com", password="Testpass123!"
        )
        self.staff = User.objects.create_user(
            email="staff@example.com", password="Testpass123!", is_staff=True
        )
        self.client = APIClient()
        category = Category.objects.create(name="Agbada")
        self.product = Product.objects.create(
            name="Agbada Royal", price=Decimal("30000.00"), category=category
        )
        self.variant = ProductVariant.objects.create(
            product=self.product, size="L", color="Gold",
            sku="AGR-ROYAL", price=Decimal("30000.00"), stock=10,
        )
        self.order = Order.objects.create(
            user=self.verified, full_name="Bola Ade", phone="08012345678",
            street="12 Awolowo Road", city="Ibadan", state="Oyo",
            total=Decimal("30000.00"), status=Order.Status.PROCESSING,
            payment_status=Order.PaymentStatus.PAID,
        )
        OrderItem.objects.create(
            order=self.order, product=self.product, variant=self.variant,
            product_name=self.product.name, variant_label="L / Gold",
            sku="AGR-ROYAL", unit_price=Decimal("30000.00"),
            quantity=1, line_total=Decimal("30000.00"),
        )

    def _post(self, client, data=None):
        return client.post(
            "/api/v1/reviews/",
            data or {"product": self.product.id, "rating": 5, "comment": "Fit is perfect!"},
            format="json",
        )

    def test_only_verified_purchase_can_review(self):
        self.client.force_authenticate(self.stranger)
        res = self._post(self.client)
        self.assertEqual(res.status_code, 400)
        self.assertIn("verified", str(res.data).lower())

        self.client.force_authenticate(self.verified)
        res = self._post(self.client)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data["verified_purchase"])

    def test_duplicate_review_rejected(self):
        self.client.force_authenticate(self.verified)
        self.assertEqual(self._post(self.client).status_code, 201)
        res = self._post(self.client)
        self.assertEqual(res.status_code, 400)
        self.assertIn("already reviewed", str(res.data))

    def test_public_list_only_shows_approved(self):
        Review.objects.create(
            user=self.verified, product=self.product, rating=5,
            comment="Nice", status=Review.Status.REJECTED,
        )
        other = User.objects.create_user(email="other@x.com", password="Testpass123!")
        Review.objects.create(
            user=other, product=self.product, rating=1,
            comment="Pending", status=Review.Status.PENDING,
        )

        anon = APIClient()
        res = anon.get(f"/api/v1/reviews/?product={self.product.slug}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["results"]), 0)

        self.client.force_authenticate(self.staff)
        res = self.client.get("/api/v1/reviews/?status=rejected")
        self.assertEqual(len(res.data["results"]), 1)
        res = self.client.get("/api/v1/reviews/?status=pending")
        self.assertEqual(len(res.data["results"]), 1)

    def test_staff_can_moderate(self):
        review = Review.objects.create(
            user=self.verified, product=self.product, rating=5,
            comment="Nice", status=Review.Status.PENDING,
        )
        self.client.force_authenticate(self.staff)
        res = self.client.patch(
            f"/api/v1/reviews/{review.pk}/moderate/", {"status": "approved"}
        )
        self.assertEqual(res.status_code, 200)
        review.refresh_from_db()
        self.assertEqual(review.status, Review.Status.APPROVED)