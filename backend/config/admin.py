from django.contrib import admin

from catalog.models import Product
from common.models import ContactMessage
from orders.models import Order

_original_index = admin.site.index


def _vault_index(request, extra_context=None):
    """Inject at-a-glance store statistics into the Vault dashboard."""
    extra_context = dict(extra_context or {})
    extra_context["vault_stats"] = [
        ("Products", Product.objects.count()),
        ("Active products", Product.objects.filter(is_active=True).count()),
        ("Orders", Order.objects.count()),
        ("Orders awaiting payment", Order.objects.exclude(payment_status="paid").count()),
        ("Contact messages", ContactMessage.objects.count()),
        ("Messages to action", ContactMessage.objects.filter(is_handled=False).count()),
    ]
    return _original_index(request, extra_context=extra_context)


admin.site.index = _vault_index