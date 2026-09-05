from django.urls import path

from . import views

urlpatterns = [
    path("initiate/", views.InitiatePaymentView.as_view(), name="payment-initiate"),
    path("status/", views.PaymentStatusView.as_view(), name="payment-status"),
    path("webhook/opay/", views.opay_webhook, name="opay-webhook"),
]