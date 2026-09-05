from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    verified_purchase = serializers.BooleanField(read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = Review
        fields = [
            "id", "user", "user_name", "product", "rating", "comment",
            "verified_purchase", "status", "created_at",
        ]
        read_only_fields = ["user", "verified_purchase", "status", "created_at"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Review
        fields = ["product", "rating", "comment"]

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]

        has_verified = (
            product.order_items.filter(
                order__user=user,
                order__payment_status="paid",
                order__status__in=["processing", "shipped", "delivered"],
            ).exists()
        )
        if not has_verified:
            raise serializers.ValidationError(
                {"detail": "Only verified purchasers can review this product."}
            )
        return attrs