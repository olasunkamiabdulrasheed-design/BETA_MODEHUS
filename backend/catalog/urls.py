from django.urls import include, path

from . import views

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
]