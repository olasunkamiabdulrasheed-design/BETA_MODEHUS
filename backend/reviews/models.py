from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="reviews"
    )
    product = models.ForeignKey(
        "catalog.Product", on_delete=models.CASCADE, related_name="reviews"
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.APPROVED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"], name="unique_user_product_review"
            )
        ]

    def __str__(self):
        return f"{self.user.email} -> {self.product.name} ({self.rating}*)"

    @property
    def verified_purchase(self):
        return (
            self.user is not None
            and self.product.order_items.filter(
                order__user=self.user,
                order__payment_status="paid",
                order__status__in=["processing", "shipped", "delivered"],
            ).exists()
        )