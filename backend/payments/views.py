import hashlib
import hmac
import json
import logging

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .client import OpayError, PAYMENT_STATUS, verify_callback_signature
from .models import Payment
from .services import create_payment_for_order, reconcile_payment

logger = logging.getLogger(__name__)


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.number", read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "id", "reference", "provider_reference", "order_number", "order_status",
            "amount", "currency", "status", "payment_status_display", "created_at",
        ]


class InitiatePaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from orders.models import Order

        order_number = request.data.get("order_number")
        if not order_number:
            return Response(
                {"order_number": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            order = Order.objects.get(number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if order.payment_status == order.PaymentStatus.PAID:
            return Response(
                {"detail": "This order is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status not in (order.Status.PENDING_PAYMENT, order.Status.FAILED):
            return Response(
                {"detail": "This order cannot be paid right now."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment, cashier_url = create_payment_for_order(
                order, return_url=request.data.get("return_url")
            )
        except OpayError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "reference": payment.reference,
                "order_number": order.number,
                "payment_url": cashier_url,
            }
        )


class PaymentStatusView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reference = request.query_params.get("reference")
        if not reference:
            return Response(
                {"reference": "This query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            payment = Payment.objects.select_related("order").get(
                reference=reference, order__user=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            reconcile_payment(payment)
        except OpayError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY
            )
        return Response(PaymentSerializer(payment).data)


@csrf_exempt
def opay_webhook(request):
    """OPay callback endpoint. Prefer reconciling via /cashier/status — this
    handler only marks payments paid so the store keeps operating even if an
    edge case slips through, and is a no-op when verification fails."""
    if request.method != "POST":
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    raw_body = request.body
    secret = settings.OPAY_WEBHOOK_SECRET or settings.OPAY_PUBLIC_KEY
    provided = (
        request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        or request.headers.get("X-Opay-Signature", "")
    )
    if provided and not verify_callback_signature(secret, raw_body, provided):
        return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)
    if not provided and not settings.DEBUG:
        return Response({"detail": "Missing signature."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except (ValueError, UnicodeDecodeError):
        return Response({"detail": "Invalid JSON."}, status=status.HTTP_400_BAD_REQUEST)

    reference = payload.get("reference") or payload.get("orderNo")
    if not reference:
        return Response(
            {"detail": "reference required."}, status=status.HTTP_400_BAD_REQUEST
        )

    payment = (
        Payment.objects.filter(reference=reference).first()
        or Payment.objects.filter(provider_reference=reference).first()
    )
    if payment is None:
        logger.warning("OPay webhook for unknown reference: %s", reference)
        return Response({"code": "00000", "message": "SUCCESSFUL"})

    status_value = payload.get("status")
    if status_value == "SUCCESS":
        try:
            from .services import mark_payment_success

            mark_payment_success(payment, raw=payload)
        except ValueError as exc:
            logger.error("Webhook reconciliation failed: %s", exc)
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )
    elif status_value in ("FAIL", "CLOSE"):
        mapped = PAYMENT_STATUS.get(status_value)
        if mapped and payment.status != Payment.Status.SUCCESS:
            payment.status = mapped
            payment.raw_response = payload
            payment.save(update_fields=["status", "raw_response", "updated_at"])

    return Response({"code": "00000", "message": "SUCCESSFUL"})