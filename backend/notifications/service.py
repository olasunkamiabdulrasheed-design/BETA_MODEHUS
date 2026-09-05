import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

ADMIN_EMAIL = settings.ADMIN_EMAIL
FROM_EMAIL = settings.DEFAULT_FROM_EMAIL


def _send(subject, recipient, context, template):
    try:
        body = render_to_string(template, context)
        send_mail(
            subject,
            body,
            FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        return True
    except Exception:
        # Email must never break an order/payment flow; log and continue.
        logger.exception("Failed to send email: %s -> %s", template, recipient)
        return False


# --- Customer notifications -------------------------------------------------


def send_new_order(order):
    context = {
        "order": order,
        "store": "BETA_MODEHUS",
        "store_url": settings.STORE_BASE_URL,
    }
    _send(
        f"Order {order.number} received — BETA_MODEHUS",
        order.user.email,
        context,
        "emails/order/order_placed.txt",
    )


def send_payment_confirmed(order):
    context = {
        "order": order,
        "store": "BETA_MODEHUS",
        "store_url": settings.STORE_BASE_URL,
    }
    _send(
        f"Payment confirmed — Order {order.number}",
        order.user.email,
        context,
        "emails/order/payment_confirmed.txt",
    )


def send_order_status(order):
    subject = {
        "processing": "Your order is being processed",
        "shipped": "Your order has been shipped",
        "delivered": "Your order has been delivered",
        "cancelled": "Your order was cancelled",
        "refunded": "Your order was refunded",
    }
    label = subject.get(order.status, f"Order status update — {order.number}")
    context = {
        "order": order,
        "store": "BETA_MODEHUS",
        "store_url": settings.STORE_BASE_URL,
    }
    _send(
        f"{label} — Order {order.number}",
        order.user.email,
        context,
        "emails/order/status_update.txt",
    )


def send_failed_payment(order):
    context = {
        "order": order,
        "store": "BETA_MODEHUS",
        "store_url": settings.STORE_BASE_URL,
    }
    _send(
        f"Payment issue — Order {order.number}",
        order.user.email,
        context,
        "emails/order/payment_failed.txt",
    )


# --- Admin notifications ----------------------------------------------------


def send_admin_new_order(order):
    context = {
        "order": order,
        "store": "BETA_MODEHUS",
        "absolute_url": f"{settings.STORE_BASE_URL}/admin/orders",
    }
    _send(
        f"New order {order.number}",
        ADMIN_EMAIL,
        context,
        "emails/admin/new_order.txt",
    )


def send_admin_low_stock(products):
    context = {
        "products": products,
        "store": "BETA_MODEHUS",
        "absolute_url": f"{settings.STORE_BASE_URL}/admin/products",
    }
    _send(
        "Low stock alert — BETA_MODEHUS",
        ADMIN_EMAIL,
        context,
        "emails/admin/low_stock.txt",
    )