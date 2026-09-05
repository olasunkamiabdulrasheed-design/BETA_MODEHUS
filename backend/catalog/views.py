from django.db.models import Avg, Count, OuterRef, Prefetch, Q, Subquery
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from common.permissions import IsAdminUser
from .filters import ProductFilter, apply_sorting
from .models import Brand, Category, Product, ProductImage, ProductVariant
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

        # Avoid N+1: prefetch images + active variants, and annotate review
        # aggregates (catalog->reviews import kept lazy to avoid circulars).
        from reviews.models import Review

        approved = Review.objects.filter(product=OuterRef("pk"), status="approved")
        qs = qs.select_related("category", "brand").prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.order_by("-is_primary", "sort_order", "id"),
            ),
            Prefetch(
                "variants",
                queryset=ProductVariant.objects.filter(is_active=True).order_by("price", "id"),
            ),
        ).annotate(
            rating_value=Subquery(
                approved.values("product").annotate(v=Avg("rating")).values("v")
            ),
            rating_count=Subquery(
                approved.values("product").annotate(c=Count("id")).values("c")
            ),
        )
        return apply_sorting(qs, sort)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer