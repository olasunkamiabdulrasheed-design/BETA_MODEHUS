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
    min_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "category", "brand", "price",
            "min_price", "primary_image", "rating", "is_available",
            "is_featured", "short_description", "created_at",
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        return image.image.url if image else None

    def get_rating(self, obj):
        return obj.average_rating


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