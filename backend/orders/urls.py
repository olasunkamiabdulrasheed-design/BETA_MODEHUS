from django.urls import path

from . import views

urlpatterns = [
    path("", views.OrderListCreateView.as_view(), name="order-list-create"),
    path("shipping-setting/", views.ShippingSettingView.as_view(), name="shipping-setting"),
    path("<str:number>/", views.OrderDetailView.as_view(), name="order-detail"),
]