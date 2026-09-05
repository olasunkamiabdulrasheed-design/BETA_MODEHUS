from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from catalog.models import Category, Product, ProductVariant


class CartAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="buyer@example.com", password="Testpass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        category = Category.objects.create(name="Agbada")
        self.product = Product.objects.create(
            name="Agbada Royal", price=Decimal("30000.00"), category=category
        )
        self.variant = ProductVariant.objects.create(
            product=self.product, size="L", color="Gold",
            sku="AGR-ROYAL-GOLD-L", price=Decimal("30000.00"), stock=5,
        )

    def test_add_returns_cart_with_line_totals(self):
        res = self.client.post(
            "/api/v1/cart/", {"variant_id": self.variant.id, "quantity": 2}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["item_count"], 2)
        self.assertEqual(str(res.data["subtotal"]), "60000.00")
        self.assertEqual(res.data["items"][0]["sku"], "AGR-ROYAL-GOLD-L")

    def test_quantity_capped_by_stock(self):
        res = self.client.post(
            "/api/v1/cart/", {"variant_id": self.variant.id, "quantity": 10}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Only 5 units available", str(res.data))

    def test_update_quantity(self):
        self.client.post("/api/v1/cart/", {"variant_id": self.variant.id, "quantity": 1})
        cart = self.client.get("/api/v1/cart/").data
        item_id = cart["items"][0]["id"]
        res = self.client.patch(f"/api/v1/cart/items/{item_id}/", {"quantity": 4})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["item_count"], 4)

    def test_remove_and_clear(self):
        self.client.post("/api/v1/cart/", {"variant_id": self.variant.id, "quantity": 1})
        cart = self.client.get("/api/v1/cart/").data
        item_id = cart["items"][0]["id"]
        res = self.client.delete(f"/api/v1/cart/items/{item_id}/remove/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["item_count"], 0)
        self.client.post("/api/v1/cart/", {"variant_id": self.variant.id, "quantity": 2})
        res = self.client.post("/api/v1/cart/clear/")
        self.assertEqual(res.data["item_count"], 0)

    def test_merge_guest_items(self):
        res = self.client.post(
            "/api/v1/cart/merge/",
            {"items": [{"variant_id": self.variant.id, "quantity": 3}]},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["item_count"], 3)

    def test_requires_auth(self):
        anon = APIClient()
        res = anon.get("/api/v1/cart/")
        self.assertEqual(res.status_code, 401)