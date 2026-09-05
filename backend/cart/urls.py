from django.urls import path

from . import views

urlpatterns = [
    path("", views.CartView.as_view(), name="cart"),
    path("items/<int:pk>/", views.CartItemUpdateView.as_view(), name="cart-item-update"),
    path("items/<int:pk>/remove/", views.CartItemRemoveView.as_view(), name="cart-item-remove"),
    path("merge/", views.MergeGuestCartView.as_view(), name="cart-merge"),
    path("clear/", views.ClearCartView.as_view(), name="cart-clear"),
]