from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    order = models.ForeignKey(
        "orders.Order", on_delete=models.PROTECT, related_name="payments"
    )
    reference = models.CharField(max_length=120, unique=True)
    provider_reference = models.CharField(max_length=160, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="NGN")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.status})"