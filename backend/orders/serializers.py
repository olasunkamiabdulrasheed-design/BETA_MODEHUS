from rest_framework import serializers

from accounts.serializers import AddressSerializer
from .models import Order, OrderItem, ShippingSetting


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id", "product_name", "variant_label", "sku",
            "unit_price", "quantity", "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id", "number", "status", "status_display", "payment_status",
            "payment_status_display", "subtotal", "shipping_fee", "total",
            "full_name", "phone", "whatsapp", "house_number", "street", "area",
            "city", "state", "country", "landmark", "delivery_instructions",
            "tracking_number", "items", "address", "created_at", "updated_at",
        ]


class CheckoutSerializer(serializers.Serializer):
    address = AddressSerializer(write_only=True)
    shipping_method = serializers.CharField(default="nationwide")

    def create(self, validated_data):
        from .services import CheckoutError, create_order_from_cart, notify_new_order

        user = self.context["request"].user
        address_data = validated_data["address"]
        address_data.setdefault("is_default", True)
        address_serializer = AddressSerializer(
            data=address_data, context={"request": self.context["request"]}
        )
        address_serializer.is_valid(raise_exception=True)
        address = address_serializer.save()
        try:
            order = create_order_from_cart(
                user, address, validated_data.get("shipping_method", "nationwide")
            )
        except CheckoutError as exc:
            raise serializers.ValidationError({"cart": str(exc)})
        notify_new_order(order)
        return order


class ShippingSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingSetting
        fields = ["delivery_fee", "free_shipping_threshold", "low_stock_threshold"]