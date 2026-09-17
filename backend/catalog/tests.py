import tempfile

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from .models import Brand, Category, Product, ProductImage, ProductVariant


class PublicCatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Gowns", slug="gowns")
        self.brand = Brand.objects.create(name="BetaMode", slug="betamode")
        self.lace = Product.objects.create(
            name="Lace Gown", category=self.category, brand=self.brand,
            price=45000, sku="PUB-1", is_featured=True,
        )
        ProductVariant.objects.create(
            product=self.lace, size="M", color="Gold",
            sku="PUB-1-M-G", price=45000, stock=10,
        )
        self.kaftan = Product.objects.create(
            name="Premium Kaftan", category=self.category, brand=self.brand,
            price=25000, sku="PUB-2",
        )
        ProductVariant.objects.create(
            product=self.kaftan, size="L", color="Blue",
            sku="PUB-2-L-B", price=25000, stock=0, is_active=True,
        )
        self.hidden = Product.objects.create(
            name="Cheap Draft", category=self.category, brand=self.brand,
            price=1000, sku="PUB-3", status=Product.Status.DRAFT,
        )

    def test_list_only_returns_published_active_products(self):
        res = self.client.get("/api/v1/products/")
        self.assertEqual(res.status_code, 200)
        slugs = {p["slug"] for p in res.data["results"]}
        self.assertIn(self.lace.slug, slugs)
        self.assertNotIn(self.hidden.slug, slugs)

    def test_search_matches_name_and_category(self):
        res = self.client.get("/api/v1/products/?search=lace")
        self.assertEqual(len(res.data["results"]), 1)
        self.assertEqual(res.data["results"][0]["name"], "Lace Gown")

    def test_filter_by_category_slug(self):
        res = self.client.get("/api/v1/products/?category=gowns")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data["results"]), 2)

    def test_price_range_filter(self):
        res = self.client.get("/api/v1/products/?min_price=30000")
        slugs = {p["slug"] for p in res.data["results"]}
        self.assertIn(self.lace.slug, slugs)
        self.assertNotIn(self.kaftan.slug, slugs)

    def test_featured_filter(self):
        res = self.client.get("/api/v1/products/?is_featured=True")
        slugs = {p["slug"] for p in res.data["results"]}
        self.assertEqual(slugs, {self.lace.slug})

    def test_product_detail_exposes_variants(self):
        res = self.client.get(f"/api/v1/products/{self.lace.slug}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["variants"]), 1)
        self.assertEqual(res.data["variants"][0]["size"], "M")

    def test_list_exposes_total_stock(self):
        res = self.client.get("/api/v1/products/")
        by_slug = {p["slug"]: p for p in res.data["results"]}
        self.assertEqual(by_slug[self.lace.slug]["total_stock"], 10)
        self.assertEqual(by_slug[self.kaftan.slug]["total_stock"], 0)


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

    def test_admin_product_image_upload_and_primary(self):
        import tempfile
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.test import override_settings

        png = BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 8 + b"chunk")
        upload = SimpleUploadedFile("gown.png", png.getvalue(), content_type="image/png")

        self._auth(self.staff)
        with tempfile.TemporaryDirectory() as tmp, override_settings(
            MEDIA_ROOT=tmp, DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage"
        ):
            res = self.client.post(
                f"/api/v1/admin/products/{self.product.id}/images/",
                {"image": upload, "is_primary": "true"},
                format="multipart",
            )
            self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
            img_id = res.data["id"]
            self.assertTrue(res.data["is_primary"])

            res = self.client.get(f"/api/v1/admin/products/{self.product.id}/images/")
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(len(res.data), 1)

            res = self.client.patch(
                f"/api/v1/admin/products/{self.product.id}/images/{img_id}/",
                {"alt_text": "Gold lace gown"},
                format="json",
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
            self.assertEqual(res.data["alt_text"], "Gold lace gown")

            res = self.client.delete(f"/api/v1/admin/products/{self.product.id}/images/{img_id}/")
            self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(self.product.images.count(), 0)

    def test_admin_product_images_required_staff(self):
        self._auth(self.user)
        res = self.client.get(f"/api/v1/admin/products/{self.product.id}/images/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_variant_create(self):
        self._auth(self.staff)
        res = self.client.post(
            "/api/v1/admin/variants/",
            {
                "product": self.product.id,
                "size": "L",
                "color": "Black",
                "sku": "LG-L-B",
                "price": "48000",
                "stock": 5,
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(res.data["label"], "L, Black")
        variant = ProductVariant.objects.get(pk=res.data["id"])
        self.assertEqual(variant.color, "Black")
        self.assertEqual(variant.stock, 5)

    def test_admin_variant_create_rejects_duplicate(self):
        self._auth(self.staff)
        res = self.client.post(
            "/api/v1/admin/variants/",
            {"product": self.product.id, "size": "M", "color": "Gold", "sku": "LG-M-G-2"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ProductVariant.objects.filter(product=self.product).count(), 1)

    def test_admin_variant_create_requires_staff(self):
        self._auth(self.user)
        res = self.client.post(
            "/api/v1/admin/variants/",
            {"product": self.product.id, "size": "XL", "color": "Blue"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_image_upload_linked_to_variant_colour(self):
        import tempfile
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.test import override_settings

        png = BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 8 + b"chunk")
        upload = SimpleUploadedFile("black.png", png.getvalue(), content_type="image/png")

        self._auth(self.staff)
        with tempfile.TemporaryDirectory() as tmp, override_settings(
            MEDIA_ROOT=tmp, DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage"
        ):
            res = self.client.post(
                f"/api/v1/admin/products/{self.product.id}/images/",
                {"image": upload, "variant_id": str(self.variant.id)},
                format="multipart",
            )
            self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
            self.assertEqual(res.data["variant_id"], self.variant.id)
            self.assertEqual(self.product.images.first().variant_id, self.variant.id)

            bad = self.client.post(
                f"/api/v1/admin/products/{self.product.id}/images/",
                {"image": upload, "variant_id": "999999"},
                format="multipart",
            )
            self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)


class HealthEndpointTests(TestCase):
    def test_root_health_endpoint(self):
        res = self.client.get("/health/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_versioned_health_endpoint(self):
        res = self.client.get("/api/v1/health/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["service"], "betamodehus-api")


class PushMediaToCloudinaryTests(TestCase):
    def test_command_requires_cloudinary_storage(self):
        with self.assertRaises(CommandError):
            call_command("push_media_to_cloudinary")


class SeedCatalogCommandTests(TestCase):
    def test_seed_creates_catalogue_without_errors(self):
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                call_command("seed_catalog", verbosity=0)

        self.assertGreaterEqual(Category.objects.count(), 15)
        self.assertGreaterEqual(Product.objects.count(), 18)
        self.assertTrue(ProductVariant.objects.exists())
        self.assertTrue(ProductImage.objects.exists())

    def test_seed_is_idempotent(self):
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                call_command("seed_catalog", verbosity=0)
                first = Product.objects.count()
                call_command("seed_catalog", verbosity=0)

        self.assertEqual(Product.objects.count(), first)