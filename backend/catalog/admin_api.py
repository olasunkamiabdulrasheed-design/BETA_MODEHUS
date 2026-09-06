from django.db.models import OuterRef, Subquery, Sum
from rest_framework import serializers, status
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdminUser
from orders.models import Order, OrderItem
from .models import Brand, Category, Product, ProductImage, ProductVariant


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "url", "alt_text", "is_primary", "sort_order"]

    def get_url(self, obj):
        return obj.image.url if obj.image else None


class AdminProductListSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(source="category.id")
    category_name = serializers.CharField(source="category.name")
    brand_id = serializers.IntegerField(source="brand.id", read_only=True, default=None)
    brand_name = serializers.CharField(source="brand.name", read_only=True, default=None)
    min_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    total_stock = serializers.IntegerField(read_only=True)
    variant_count = serializers.IntegerField(read_only=True)
    units_sold = serializers.IntegerField(read_only=True, default=0)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "category_id", "category_name",
            "brand_id", "brand_name", "price", "min_price", "total_stock",
            "variant_count", "units_sold", "status", "is_active",
            "is_featured", "image", "updated_at",
        ]

    def get_image(self, obj):
        img = obj.primary_image
        return img.url if img else None


class AdminProductWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all()
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        source="brand", queryset=Brand.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id", "name", "short_description", "description", "price", "sku",
            "category_id", "brand_id", "status", "is_active", "is_featured",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class AdminProductListView(ListCreateAPIView):
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = Product.objects.select_related("category", "brand").prefetch_related("images", "variants")
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(name__icontains=search)
        flag = self.request.query_params.get("flag", "")
        if flag == "featured":
            qs = qs.filter(is_featured=True)
        elif flag == "inactive":
            qs = qs.filter(is_active=False)
        elif flag == "out":
            qs = qs.filter(variants__is_active=True).exclude(variants__stock__gt=0).distinct()
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminProductWriteSerializer
        return AdminProductListSerializer

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        paid = Order.PaymentStatus.PAID
        qs = qs.annotate(
            units_sold=(
                Subquery(
                    OrderItem.objects.filter(
                        product=OuterRef("pk"), order__payment_status=paid
                    )
                    .values("product")
                    .annotate(s=Sum("quantity"))
                    .values("s")
                )
            )
        )
        data = AdminProductListSerializer(qs, many=True).data
        for item, product in zip(data, qs):
            active = [v for v in product.variants.all() if v.is_active]
            item["variant_count"] = len(active)
            item["total_stock"] = sum(v.stock for v in active)
            if active:
                item["min_price"] = min((v.price if v.price is not None else product.price) for v in active)
            else:
                item["min_price"] = product.price
            item["units_sold"] = item["units_sold"] or 0
        return Response(data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminProductDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = AdminProductWriteSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminVariantPatchView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = ProductVariant.objects.all()

    def update(self, request, *args, **kwargs):
        variant = self.get_object()
        data = {}
        for field in ("stock", "price", "is_active"):
            if field in request.data:
                data[field] = request.data[field]
        if not data:
            return Response({"detail": "Nothing to update."}, status=status.HTTP_400_BAD_REQUEST)
        for field, value in data.items():
            setattr(variant, field, value)
        variant.save()
        return Response(
            {
                "id": variant.id,
                "product": variant.product.name,
                "label": ", ".join(filter(None, [variant.size, variant.color])),
                "stock": variant.stock,
                "price": str(variant.effective_price),
                "is_active": variant.is_active,
            }
        )

    def destroy(self, request, *args, **kwargs):
        variant = self.get_object()
        variant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductImagesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        product = Product.objects.prefetch_related("images").get(pk=pk)
        return Response(ProductImageSerializer(product.images.all(), many=True).data)

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        file = request.FILES.get("image")
        if not file:
            return Response({"detail": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)
        image_obj = ProductImage.objects.create(
            product=product,
            image=file,
            alt_text=request.data.get("alt_text", ""),
            is_primary=bool(request.data.get("is_primary")),
        )
        return Response(ProductImageSerializer(image_obj).data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, img_id):
        image_obj = ProductImage.objects.filter(product_id=pk, pk=img_id).first()
        if not image_obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        image_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk, img_id):
        image_obj = ProductImage.objects.filter(product_id=pk, pk=img_id).first()
        if not image_obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if "is_primary" in request.data:
            image_obj.is_primary = bool(request.data["is_primary"])
        if "alt_text" in request.data:
            image_obj.alt_text = request.data["alt_text"]
        image_obj.save()
        return Response(ProductImageSerializer(image_obj).data)