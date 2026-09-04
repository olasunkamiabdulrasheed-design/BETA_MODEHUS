from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from common.permissions import IsAdminUser
from .filters import ProductFilter, apply_sorting
from .models import Brand, Category, Product
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(
                product_count=Count(
                    "products",
                    filter=Q(products__status=Product.Status.PUBLISHED, products__is_active=True),
                    distinct=True,
                )
            )
        )


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = "slug"
    pagination_class = None


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"
    filterset_class = ProductFilter
    filterset_fields = ["category", "brand"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            qs = Product.objects.all()
        else:
            qs = Product.objects.filter(status=Product.Status.PUBLISHED, is_active=True)
        qs = ProductFilter(self.request.query_params, queryset=qs).qs.distinct()
        sort = self.request.query_params.get("sort")
        return apply_sorting(qs, sort)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer