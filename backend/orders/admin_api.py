from rest_framework import serializers

from .models import Order


class AdminOrderActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[
            "processing", "shipped", "delivered", "cancelled", "refunded",
        ]
    )
    tracking_number = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        order = self.context["order"]
        valid = not order.is_finalized
        if not valid:
            raise serializers.ValidationError(
                {"action": "This order cannot be changed anymore."}
            )
        if attrs["action"] == "shipped" and not attrs.get("tracking_number"):
            raise serializers.ValidationError(
                {"tracking_number": "Tracking number is required when shipping."}
            )
        return attrs


class AdminOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "number", "user_email", "full_name", "phone", "status",
            "payment_status", "subtotal", "shipping_fee", "total",
            "tracking_number", "items", "created_at",
        ]

    def get_items(self, obj):
        return [i.product_name for i in obj.items.all()]
