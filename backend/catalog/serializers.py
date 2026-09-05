from rest_framework import serializers

from .models import Brand, Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active", "sort_order", "product_count"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "is_active"]


class VariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id", "size", "color", "color_hex", "attributes", "sku",
            "price", "effective_price", "stock", "is_active", "is_in_stock",
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "sort_order", "variant"]


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    brand = serializers.CharField(source="brand.name", read_only=True, default=None)
    primary_image = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "category", "brand", "price",
            "min_price", "primary_image", "rating", "is_available",
            "is_featured", "short_description", "created_at",
        ]

    def _variants(self, obj):
        return list(obj.variants.all())

    def get_primary_image(self, obj):
        images = obj.images.all()
        image = next((i for i in images if i.is_primary), images[0] if images else None)
        return image.image.url if image else None

    def get_min_price(self, obj):
        variants = self._variants(obj)
        if variants:
            cheapest = min(
                (v.price if v.price is not None else obj.price for v in variants),
                key=lambda x: x,
            )
            return f"{cheapest:.2f}"
        return f"{obj.price:.2f}"

    def get_is_available(self, obj):
        return bool(self._variants(obj))

    def get_rating(self, obj):
        count = getattr(obj, "rating_count", 0) or 0
        value = getattr(obj, "rating_value", 0) or 0
        return {"rating": round(float(value), 1), "count": count}


class ProductDetailSerializer(ProductListSerializer):
    description = serializers.CharField(read_only=True)
    specifications = serializers.JSONField(read_only=True)
    sku = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    variants = VariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = serializers.ListField(child=serializers.CharField(), read_only=True)
    colors = serializers.ListField(child=serializers.DictField(), read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description", "specifications", "sku", "status",
            "variants", "images", "sizes", "colors", "updated_at",
        ]