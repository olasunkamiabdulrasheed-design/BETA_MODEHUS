from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    MergeCartSerializer,
)
from .services import add_item, get_or_create_cart, merge_guest_items


class CartView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

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

    def delete(self, request, pk):
        cart = get_or_create_cart(request.user)
        deleted, _ = CartItem.objects.filter(pk=pk, cart=cart).delete()
        if not deleted:
            return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CartSerializer(cart).data)


class MergeGuestCartView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MergeCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request.user)
        merge_guest_items(cart, serializer.validated_data["items"], validate=lambda x: True)
        return Response(CartSerializer(cart).data)


class ClearCartView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = get_or_create_cart(request.user)
        cart.clear()
        return Response(CartSerializer(cart).data)