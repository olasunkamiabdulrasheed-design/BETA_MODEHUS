from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Brand, Category, Product, ProductVariant


class AdminCatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from accounts.models import User

        self.staff = User.objects.create_user(
            email="admin@betamodehus.com",
            password="pass-12345",
            is_staff=True,
            is_superuser=True,
        )
        self.user = User.objects.create_user(email="buyer@betamodehus.com", password="pass-12345")
        self.category = Category.objects.create(name="Gowns")
        self.brand = Brand.objects.create(name="BetaMode")
        self.product = Product.objects.create(
            name="Lace Gown", category=self.category, brand=self.brand, price=45000, sku="LG-1"
        )
        self.variant = ProductVariant.objects.create(
            product=self.product, size="M", color="Gold", sku="LG-M-G", price=45000, stock=10
        )

    def _auth(self, user):
        self.client.force_authenticate(user)

    def test_admin_product_list_requires_staff(self):
        self._auth(self.user)
        res = self.client.get("/api/v1/admin/products/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_product_list_shows_stock_and_price(self):
        self._auth(self.staff)
        res = self.client.get("/api/v1/admin/products/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        item = res.data[0]
        self.assertEqual(item["name"], "Lace Gown")
        self.assertEqual(item["total_stock"], 10)
        self.assertEqual(item["variant_count"], 1)
        self.assertEqual(float(item["min_price"]), 45000.0)

    def test_admin_product_list_search_filter(self):
        self._auth(self.staff)
        Product.objects.create(name="Beads Set", category=self.category, price=5000, sku="BEADS-1")
        res = self.client.get("/api/v1/admin/products/?search=beads")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["name"], "Beads Set")

    def test_admin_create_update_delete_product(self):
        self._auth(self.staff)
        res = self.client.post(
            "/api/v1/admin/products/",
            {
                "name": "Kaftan",
                "category_id": self.category.id,
                "brand_id": self.brand.id,
                "price": "25000",
                "status": "published",
                "sku": "KAFTAN-1",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        pid = res.data["id"]

        res = self.client.patch(
            f"/api/v1/admin/products/{pid}/",
            {"price": "20000", "is_featured": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(res.data["price"]), 20000.0)

        res = self.client.delete(f"/api/v1/admin/products/{pid}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=pid).exists())

    def test_admin_creators_rejected_for_non_staff(self):
        self._auth(self.user)
        res = self.client.post(
            "/api/v1/admin/products/",
            {"name": "Hijack", "category_id": self.category.id, "price": "1000"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_variant_stock_and_price_patch(self):
        self._auth(self.staff)
        res = self.client.patch(
            f"/api/v1/admin/variants/{self.variant.id}/",
            {"stock": 3, "price": "40000"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["stock"], 3)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 3)

    def test_admin_variant_delete(self):
        self._auth(self.staff)
        res = self.client.delete(f"/api/v1/admin/variants/{self.variant.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProductVariant.objects.filter(pk=self.variant.id).exists())