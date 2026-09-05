import logging
import secrets

from django.conf import settings
from django.db import transaction

from .client import PAYMENT_STATUS, OpayClient, OpayError, _kobo
from .models import Payment

logger = logging.getLogger(__name__)


def _make_reference(order):
    return f"BM{order.pk}-{secrets.token_hex(4).upper()}"


def create_payment_for_order(order, return_url=None):
    """Create (or reuse) a Pending payment for an order and start an OPay
    Cashier session. Returns (payment, cashier_url)."""
    payment = order.payments.filter(status=Payment.Status.PENDING).first()
    if payment is None:
        payment = Payment.objects.create(
            order=order, reference=_make_reference(order), amount=order.total,
        )

    client = OpayClient()
    callback_url = settings.OPAY_CB_URL
    if not callback_url.endswith("/"):
        callback_url += "/"
    callback_url += f"?reference={payment.reference}"

    try:
        data = client.create_cashier(
            reference=payment.reference,
            amount=payment.amount,
            product_name=f"{order.number}",
            return_url=return_url,
            callback_url=callback_url,
            user_email=order.user.email,
            user_mobile=order.phone,
        )
        payment.provider_reference = data.get("orderNo", "")
        payment.raw_response = data
        payment.save(update_fields=["provider_reference", "raw_response", "updated_at"])
        return payment, data.get("cashierUrl")
    except OpayError as exc:
        payment.status = Payment.Status.FAILED
        payment.raw_response = {"error": str(exc)}
        payment.save(update_fields=["status", "raw_response", "updated_at"])
        raise


@transaction.atomic
def mark_payment_success(payment, raw=None):
    """Idempotently apply a confirmed successful payment: flip payment + order
    to paid, and decrement variant stock exactly once."""
    if payment.status == Payment.Status.SUCCESS:
        return payment.order

    order = payment.order
    if raw and raw.get("amount", {}).get("total") is not None:
        paid_kobo = raw["amount"]["total"]
        if paid_kobo != _kobo(payment.amount):
            logger.error(
                "Amount mismatch for %s: expected %s got %s",
                payment.reference, _kobo(payment.amount), paid_kobo,
            )
            raise ValueError(f"Paid amount does not match order total ({payment.reference}).")

    payment.status = Payment.Status.SUCCESS
    payment.raw_response = raw or payment.raw_response
    payment.save(update_fields=["status", "raw_response", "updated_at"])

    order.payment_status = order.PaymentStatus.PAID
    if order.status == order.Status.PENDING_PAYMENT:
        order.status = order.Status.PROCESSING
    order.save(update_fields=["status", "payment_status", "updated_at"])

    for item in order.items.select_related("variant", "variant__product").select_for_update():
        if item.variant is None:
            continue
        shortfall = 0
        if item.variant.stock < item.quantity:
            shortfall = item.quantity - item.variant.stock
            logger.warning(
                "Stock shortfall on %s (%s): needed %s have %s",
                item.variant.sku, order.number, item.quantity, item.variant.stock,
            )
            item.variant.stock = 0
        else:
            item.variant.stock -= item.quantity
        item.variant.save(update_fields=["stock", "updated_at"])
        if shortfall:
            flags = dict(payment.raw_response or {})
            flags.setdefault("stock_shortfall", {})[item.variant.sku] = shortfall
            payment.raw_response = flags
            payment.save(update_fields=["raw_response"])

    order.recalc_totals()
    _low_stock_check()
    _notification_after_paid(order)
    return order


def _notification_after_paid(order):
    from notifications.service import send_payment_confirmed

    send_payment_confirmed(order)


def _low_stock_check():
    from catalog.models import ProductVariant
    from orders.models import ShippingSetting

    threshold = ShippingSetting.get().low_stock_threshold
    low = [
        v
        for v in ProductVariant.objects.filter(
            is_active=True, stock__lte=threshold
        )
        .select_related("product")
        .all()
    ]
    if not low:
        return
    products = []
    for v in low:
        products.append(
            {"name": v.product.name, "sku": v.sku, "total_stock": v.stock}
        )
    from notifications.service import send_admin_low_stock

    send_admin_low_stock(products)


def reconcile_payment(payment):
    """Ask OPay for the latest status and apply it idempotently."""
    client = OpayClient()
    data = client.query_status(reference=payment.reference)
    status = data.get("status")
    if status == "SUCCESS":
        return mark_payment_success(payment, raw=data)
    mapped = PAYMENT_STATUS.get(status, payment.status)
    if mapped != payment.status and payment.status != Payment.Status.SUCCESS:
        if mapped in (Payment.Status.FAILED, Payment.Status.CANCELLED):
            payment.status = mapped
            payment.raw_response = data
            payment.save(update_fields=["status", "raw_response", "updated_at"])
            order = payment.order
            if order.payment_status == order.PaymentStatus.PENDING:
                order.status = order.Status.FAILED if mapped == Payment.Status.FAILED \
                    else order.Status.CANCELLED
                order.save(update_fields=["status", "updated_at"])
    return payment.order