from django.db import transaction

from .models import Cart, CartItem


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@transaction.atomic
def add_item(cart, variant, quantity=1):
    if variant.stock < quantity:
        raise ValueError(f"Only {variant.stock} units available.")
    item, _ = CartItem.objects.get_or_create(
        cart=cart,
        variant=variant,
        defaults={"quantity": quantity},
    )
    if not _:
        new_qty = item.quantity + quantity
        if variant.stock < new_qty:
            raise ValueError(f"Only {variant.stock} units available.")
        item.quantity = new_qty
        item.save()
    return item


@transaction.atomic
def merge_guest_items(cart, items, validate):
    """Merge validated guest cart items into the account cart safely (caps at stock)."""
    for entry in items:
        variant, quantity = entry["variant"], entry["quantity"]
        existing = CartItem.objects.filter(cart=cart, variant=variant).first()
        total_qty = quantity + (existing.quantity if existing else 0)
        if total_qty > variant.stock:
            total_qty = variant.stock
        if existing:
            existing.quantity = total_qty
            existing.save(update_fields=["quantity", "updated_at"])
        else:
            CartItem.objects.create(cart=cart, variant=variant, quantity=total_qty)