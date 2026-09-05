import secrets

from django.db import models
from django.utils import timezone

from catalog.models import Product, ProductVariant


def generate_order_number():
    return f"BM-{timezone.localdate().year}-{secrets.token_hex(4).upper()}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    number = models.CharField(max_length=40, unique=True, default=generate_order_number)
    user = models.ForeignKey(
        "accounts.User", on_delete=models.PROTECT, related_name="orders"
    )
    address = models.ForeignKey(
        "accounts.Address", on_delete=models.SET_NULL, null=True, blank=True
    )
    # Address snapshot — preserved forever even if the address record changes.
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20, blank=True)
    house_number = models.CharField(max_length=50, blank=True)
    street = models.CharField(max_length=255)
    area = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120)
    country = models.CharField(max_length=120, default="Nigeria")
    landmark = models.CharField(max_length=255, blank=True)
    delivery_instructions = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    tracking_number = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.number

    def recalc_totals(self):
        subtotal = sum((i.line_total for i in self.items.all()))
        self.subtotal = subtotal
        self.total = subtotal + self.shipping_fee
        self.save(update_fields=["subtotal", "total", "updated_at"])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_items"
    )
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, blank=True
    )
    product_name = models.CharField(max_length=200)
    variant_label = models.CharField(max_length=120, blank=True)
    sku = models.CharField(max_length=120, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class ShippingSetting(models.Model):
    """Singleton store settings editable from the admin dashboard."""

    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    free_shipping_threshold = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Subtotal above this ships free. Leave empty to disable.",
    )
    low_stock_threshold = models.PositiveIntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Shipping settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        from django.conf import settings

        obj, created = cls.objects.get_or_create(pk=1)
        if created:
            obj.delivery_fee = settings.DEFAULT_SHIPPING_FEE
            obj.low_stock_threshold = settings.DEFAULT_LOW_STOCK_THRESHOLD
            obj.save(update_fields=["delivery_fee", "low_stock_threshold"])
        return obj

    def __str__(self):
        return f"Delivery fee: {self.delivery_fee}"