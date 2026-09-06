from django.urls import include, path

from . import views
from .admin_api import (
    AdminProductDetailView,
    AdminProductImagesView,
    AdminProductListView,
    AdminVariantPatchView,
)

urlpatterns = [
    path("categories/", views.CategoryViewSet.as_view({"get": "list"}), name="category-list"),
    path(
        "categories/<slug:slug>/",
        views.CategoryViewSet.as_view({"get": "retrieve"}),
        name="category-detail",
    ),
    path("brands/", views.BrandViewSet.as_view({"get": "list"}), name="brand-list"),
    path("products/", views.ProductViewSet.as_view({"get": "list", "post": "create"}), name="product-list"),
    path(
        "products/<slug:slug>/",
        views.ProductViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="product-detail",
    ),
    path("admin/products/", AdminProductListView.as_view(), name="admin-product-list"),
    path("admin/products/<int:pk>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("admin/products/<int:pk>/images/", AdminProductImagesView.as_view(), name="admin-product-images"),
    path("admin/products/<int:pk>/images/<int:img_id>/", AdminProductImagesView.as_view(), name="admin-product-image-detail"),
    path("admin/variants/<int:pk>/", AdminVariantPatchView.as_view(), name="admin-variant-detail"),
]