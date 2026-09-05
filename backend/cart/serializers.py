from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(read_only=True)
    product_id = serializers.IntegerField(source="variant.product_id", read_only=True)
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    product_slug = serializers.CharField(source="variant.product.slug", read_only=True)
    product_image = serializers.SerializerMethodField()
    size = serializers.CharField(source="variant.size", read_only=True)
    color = serializers.CharField(source="variant.color", read_only=True)
    color_hex = serializers.CharField(source="variant.color_hex", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    in_stock = serializers.BooleanField(source="variant.is_in_stock", read_only=True)
    max_stock = serializers.IntegerField(source="variant.stock", read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id", "variant", "quantity", "product_id", "product_name", "product_slug",
            "product_image", "size", "color", "color_hex", "sku",
            "unit_price", "line_total", "in_stock", "max_stock",
        ]

    def get_product_image(self, obj):
        image = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return image.image.url if image else None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "item_count", "subtotal"]


class AddToCartSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        from catalog.models import ProductVariant

        try:
            variant = ProductVariant.objects.select_related("product").get(
                id=attrs["variant_id"]
            )
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError({"variant_id": "Variant does not exist."})
        product = variant.product
        if not (product.is_active and product.status == product.Status.PUBLISHED and variant.is_active):
            raise serializers.ValidationError({"variant_id": "This product is not available."})
        if variant.stock < attrs["quantity"]:
            raise serializers.ValidationError(
                {"quantity": f"Only {variant.stock} units available."}
            )
        attrs["variant"] = variant
        return attrs


class MergeCartSerializer(serializers.Serializer):
    items = serializers.ListField(child=AddToCartSerializer(), allow_empty=True)