from django.db.models import Avg, Count, F, Q
from django_filters import rest_framework as filters

from .models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category__slug")
    brand = filters.CharFilter(field_name="brand__slug")
    size = filters.CharFilter(method="filter_size")
    color = filters.CharFilter(method="filter_color")
    min_price = filters.NumberFilter(method="filter_min_price")
    max_price = filters.NumberFilter(method="filter_max_price")
    min_rating = filters.NumberFilter(method="filter_min_rating")
    availability = filters.BooleanFilter(method="filter_availability")
    is_featured = filters.BooleanFilter(field_name="is_featured")
    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Product
        fields = ["category", "brand", "size", "color", "min_price", "max_price", "min_rating", "availability", "is_featured"]

    @staticmethod
    def published(qs):
        return qs.filter(status=Product.Status.PUBLISHED, is_active=True)

    def filter_size(self, queryset, name, value):
        return queryset.filter(variants__size__iexact=value, variants__is_active=True)

    def filter_color(self, queryset, name, value):
        return queryset.filter(variants__color__iexact=value, variants__is_active=True)

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(price__gte=value)

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(price__lte=value)

    def filter_min_rating(self, queryset, name, value):
        return queryset.annotate(
            avg_rating=Avg("reviews__rating", filter=Q(reviews__status="approved"))
        ).filter(avg_rating__gte=value)

    def filter_availability(self, queryset, name, value):
        if value:
            return queryset.filter(variants__is_active=True, variants__stock__gt=0).distinct()
        return queryset.exclude(variants__is_active=True, variants__stock__gt=0).distinct()

    def filter_search(self, queryset, name, value):
        q = Q(name__icontains=value) | Q(
            description__icontains=value
        ) | Q(short_description__icontains=value) | Q(sku__icontains=value) | Q(
            category__name__icontains=value
        ) | Q(brand__name__icontains=value)
        return queryset.filter(q).distinct()


ORDERING_OPTIONS = {
    "newest": "-created_at",
    "price_low": "price",
    "price_high": "-price",
    "top_rated": "-avg_rating",
    "best_selling": "-total_sold",
    "relevance": "-created_at",
}

def apply_sorting(queryset, sort):
    sort = sort or "newest"
    if sort == "top_rated":
        return queryset.annotate(
            avg_rating=Avg("reviews__rating", filter=Q(reviews__status="approved"))
        ).order_by("-avg_rating", "-created_at")
    if sort == "best_selling":
        return queryset.annotate(
            total_sold=Count(
                "order_items", filter=Q(order_items__order__payment_status="paid")
            )
        ).order_by("-total_sold", "-created_at")
    return queryset.order_by(ORDERING_OPTIONS.get(sort, "-created_at"))