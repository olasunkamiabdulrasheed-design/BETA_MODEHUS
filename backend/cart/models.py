from django.db import models


class Cart(models.Model):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.email}"

    def clear(self):
        self.items.all().delete()

    @property
    def item_count(self):
        return sum(i.quantity for i in self.items.all())

    @property
    def subtotal(self):
        total = 0
        for item in self.items.select_related("variant", "variant__product"):
            total += item.line_total
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(
        "catalog.ProductVariant", on_delete=models.CASCADE, related_name="cart_items"
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["cart", "variant"], name="unique_cart_variant")
        ]

    @property
    def product(self):
        return self.variant.product

    @property
    def unit_price(self):
        return self.variant.effective_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.variant} x{self.quantity}"