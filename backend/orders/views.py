from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.permissions import IsAdminUser
from .models import Order
from .serializers import CheckoutSerializer, OrderSerializer, ShippingSettingSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CheckoutSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data, status=status.HTTP_201_CREATED
        )


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = "number"

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)


class ShippingSettingView(generics.RetrieveUpdateAPIView):
    """Customers may read the delivery fee/preview totals; only staff may change it."""

    serializer_class = ShippingSettingSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsAdminUser()]
        return [permissions.AllowAny()]

    def get_object(self):
        from .models import ShippingSetting

        return ShippingSetting.get()


class AdminOrderActionView(generics.RetrieveUpdateAPIView):
    """Admin single-order management: view any order and advance its status."""

    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer
    lookup_field = "number"

    def get_queryset(self):
        return Order.objects.all()

    def update(self, request, *args, **kwargs):
        from .admin_api import AdminOrderActionSerializer
        from notifications.service import send_order_status

        order = self.get_object()
        serializer = AdminOrderActionSerializer(
            data=request.data, context={"order": order}
        )
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        order.status = action
        order.tracking_number = serializer.validated_data.get("tracking_number", "")
        order.save(update_fields=["status", "tracking_number", "updated_at"])
        send_order_status(order)
        return Response(self.get_serializer(order).data)