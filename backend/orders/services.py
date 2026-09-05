from decimal import Decimal

from django.db import transaction

from cart.models import Cart
from .models import Order, OrderItem, ShippingSetting


class CheckoutError(Exception):
    pass


@transaction.atomic
def create_order_from_cart(user, address, shipping_method="nationwide"):
    """
    Build an order from the user's cart inside a transaction.

    Uses select_for_update on variants to prevent overselling; stock is NOT
    decremented here — it is decremented only after verified OPay payment.
    """
    try:
        cart = Cart.objects.get(user=user)
    except Cart.DoesNotExist:
        raise CheckoutError("Your cart is empty.")

    items = list(
        cart.items.select_related("variant", "variant__product").select_for_update()
    )
    if not items:
        raise CheckoutError("Your cart is empty.")

    setting = ShippingSetting.get()
    subtotal = Decimal("0")
    order_items = []
    for item in items:
        variant = item.variant
        product = variant.product
        if not (
            product.is_active
            and product.status == product.Status.PUBLISHED
            and variant.is_active
        ):
            raise CheckoutError(f"{product.name} is no longer available.")
        unit_price = variant.effective_price
        line_total = unit_price * item.quantity
        subtotal += line_total
        order_items.append(
            (
                item,
                {
                    "product": product,
                    "variant": variant,
                    "product_name": product.name,
                    "variant_label": ", ".join(
                        filter(None, [variant.size, variant.color])
                    ),
                    "sku": variant.sku or product.sku,
                    "unit_price": unit_price,
                    "quantity": item.quantity,
                    "line_total": line_total,
                },
            )
        )

    shipping_fee = Decimal("0")
    if setting.free_shipping_threshold and subtotal >= setting.free_shipping_threshold:
        shipping_fee = Decimal("0")
    else:
        shipping_fee = setting.delivery_fee

    order = Order.objects.create(
        user=user,
        address=address,
        full_name=address.full_name,
        phone=address.phone,
        whatsapp=address.whatsapp,
        house_number=address.house_number,
        street=address.street,
        area=address.area,
        city=address.city,
        state=address.state,
        country=address.country or "Nigeria",
        landmark=address.landmark,
        delivery_instructions=address.delivery_instructions,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=subtotal + shipping_fee,
    )

    for _item, data in order_items:
        OrderItem.objects.create(order=order, **data)

    cart.clear()
    return order