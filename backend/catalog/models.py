import uuid

from django.db import models
from django.utils.text import slugify


def product_image_upload_path(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    return f"products/{instance.product_id}/{uuid.uuid4().hex}.{ext}"


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "category"
            slug, n = base, 1
            while Category.objects.filter(slug=slug).exists():
                n += 1
                slug = f"{base}-{n}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or "brand"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    sku = models.CharField(max_length=120, unique=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PUBLISHED
    )
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "is_active"]),
            models.Index(fields=["category", "status"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "product"
            slug, n = base, 1
            while Product.objects.filter(slug=slug).exists():
                n += 1
                slug = f"{base}-{n}"
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_available(self):
        return (
            self.status == self.Status.PUBLISHED
            and self.is_active
            and self.variants.filter(is_active=True).exists()
        )

    @property
    def min_price(self):
        return self.variants.filter(is_active=True).order_by("price").values_list(
            "price", flat=True
        ).first() or self.price

    @property
    def total_stock(self):
        return sum(
            v.stock
            for v in self.variants.filter(is_active=True)
        )

    @property
    def primary_image(self):
        image = self.images.filter(is_primary=True).first() or self.images.first()
        return image.image if image else None

    @property
    def average_rating(self):
        value = self.reviews.filter(status="approved").aggregate(
            avg=models.Avg("rating"), count=models.Count("id")
        )
        return {
            "rating": round(value["avg"] or 0, 1),
            "count": value["count"],
        }

    @property
    def sizes(self):
        return list(
            dict.fromkeys(
                v.size
                for v in self.variants.filter(is_active=True)
                if v.size
            )
        )

    @property
    def colors(self):
        return [
            {"name": c.color, "hex": c.color_hex}
            for c in self.variants.filter(is_active=True)
            if c.color
        ]

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )
    size = models.CharField(max_length=20, blank=True, default="")
    color = models.CharField(max_length=60, blank=True, default="")
    color_hex = models.CharField(max_length=9, blank=True, default="")
    attributes = models.JSONField(default=dict, blank=True)
    sku = models.CharField(max_length=120, blank=True, unique=True)
    price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Leave blank to inherit the product price.",
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["size", "color"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "size", "color"],
                name="unique_product_variant",
            )
        ]

    @property
    def effective_price(self):
        return self.price if self.price is not None else self.product.price

    @property
    def is_in_stock(self):
        return self.is_active and self.stock > 0

    def __str__(self):
        label = ", ".join(filter(None, [self.size, self.color]))
        return f"{self.product.name} ({label or 'default'})"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="images",
        help_text="Associate to a color variant so the gallery previews change on color select.",
    )
    image = models.ImageField(upload_to=product_image_upload_path)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(
                pk=self.pk
            ).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} image #{self.pk}"