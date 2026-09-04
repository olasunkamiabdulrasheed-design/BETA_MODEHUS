from django.contrib import admin
from django.utils.html import format_html

from .models import Brand, Category, Product, ProductImage, ProductVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "sort_order"]
    list_editable = ["is_active", "sort_order"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active"]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    readonly_fields = ["thumb"]

    def thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" />', obj.image.url
            )
        return "-"

    thumb.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name", "slug", "category", "price", "status", "is_active", "is_featured",
        "total_stock", "created_at",
    ]
    list_filter = ["status", "is_active", "is_featured", "category"]
    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductVariantInline, ProductImageInline]
    list_editable = ["status", "is_active", "is_featured"]