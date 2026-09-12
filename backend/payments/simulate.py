from django.conf import settings
from django.http import Http404, HttpResponseNotAllowed, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render

from .client import _kobo
from .models import Payment
from .services import mark_payment_success


def _only_debug(request):
    if not settings.DEBUG:
        raise Http404


def simulate_page(request, reference):
    _only_debug(request)
    payment = get_object_or_404(Payment, reference=reference, status=Payment.Status.PENDING)
    order = payment.order
    return render(
        request,
        "payments/simulate_checkout.html",
        {
            "order": order,
            "payment": payment,
            "amount_kobo": _kobo(payment.amount),
            "return_url": settings.STORE_BASE_URL.rstrip("/"),
        },
    )


def simulate_confirm(request, reference):
    _only_debug(request)
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    payment = get_object_or_404(Payment, reference=reference)
    mark_payment_success(
        payment, raw={"simulated": True, "amount": {"total": _kobo(payment.amount)}}
    )
    next_url = (
        settings.STORE_BASE_URL.rstrip("/")
        + f"/payment/callback?reference={payment.reference}&order={payment.order.number}&dev=1"
    )
    return HttpResponseRedirect(next_url)