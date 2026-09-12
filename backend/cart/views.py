from rest_framework import serializers, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer

from .models import CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    MergeCartSerializer,
)
from .services import add_item, get_or_create_cart, merge_guest_items

QuantitySerializer = inline_serializer(
    name="CartQuantityUpdate",
    fields={"quantity": serializers.IntegerField(max_value=10000)},
)


class CartView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

    @extend_schema(request=AddToCartSerializer, responses=CartSerializer)
    def post(self, request):
        cart = get_or_create_cart(request.user)
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            add_item(cart, serializer.validated_data["variant"], serializer.validated_data["quantity"])
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemUpdateView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=QuantitySerializer, responses=CartSerializer)
    def patch(self, request, pk):
        cart = get_or_create_cart(request.user)
        try:
            item = CartItem.objects.select_related("variant", "variant__product").get(
                pk=pk, cart=cart
            )
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get("quantity")
        if quantity is None or not str(quantity).lstrip("-").isdigit() or int(quantity) < 1:
            return Response({"quantity": "Must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)
        quantity = int(quantity)
        if item.variant.stock < quantity:
            return Response(
                {"detail": f"Only {item.variant.stock} units available."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartSerializer(cart).data)


class CartItemRemoveView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def delete(self, request, pk):
        cart = get_or_create_cart(request.user)
        deleted, _ = CartItem.objects.filter(pk=pk, cart=cart).delete()
        if not deleted:
            return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CartSerializer(cart).data)


class MergeGuestCartView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=MergeCartSerializer, responses=CartSerializer)
    def post(self, request):
        serializer = MergeCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request.user)
        mergeable = []
        for entry in serializer.validated_data["items"]:
            variant = entry["variant"]
            product = variant.product
            still_available = (
                product.is_active
                and product.status == product.Status.PUBLISHED
                and variant.is_active
                and variant.stock > 0
            )
            if still_available:
                mergeable.append(entry)
        merge_guest_items(cart, mergeable, validate=lambda x: True)
        return Response(CartSerializer(cart).data)


class ClearCartView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def post(self, request):
        cart = get_or_create_cart(request.user)
        cart.clear()
        return Response(CartSerializer(cart).data)