from rest_framework import generics, permissions, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from common.permissions import IsAdminUser
from .models import Order, OrderItem, ShippingSetting
from .serializers import CheckoutSerializer, OrderSerializer, ShippingSettingSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Order.objects.all()
        else:
            qs = Order.objects.filter(user=self.request.user)

        status_q = self.request.query_params.get("status")
        if status_q and status_q in Order.Status.values:
            qs = qs.filter(status=status_q)

        query = self.request.query_params.get("q")
        if query:
            qs = qs.filter(
                Q(number__icontains=query)
                | Q(phone__icontains=query)
                | Q(full_name__icontains=query)
            )
        return qs

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
        return ShippingSetting.get()


class AdminStatsView(views.APIView):
    """Dashboard numbers for the admin frontend: revenue, order counts,
    pending fulfillment, low-stock items and bestsellers."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        from datetime import timedelta

        from django.db.models import Min, Sum
        from django.utils import timezone

        from accounts.models import User
        from catalog.models import Product

        settings = Order.objects
        counts = {c: settings.filter(status=c).count() for c, _ in Order.Status.choices}

        paid = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
            status__in=[
                Order.Status.PROCESSING, Order.Status.SHIPPED, Order.Status.DELIVERED,
                Order.Status.PENDING_PAYMENT,
            ],
        )
        rev_total = paid.aggregate(t=Sum("total"))["t"] or 0
        today = timezone.localdate()
        rev_today = paid.filter(created_at__date=today).aggregate(t=Sum("total"))["t"] or 0

        low_threshold = ShippingSetting.get().low_stock_threshold
        low_stock = (
            Product.objects.filter(is_active=True)
            .annotate(remaining=Min("variants__stock"))
            .filter(remaining__lte=low_threshold)
            .order_by("remaining")[:12]
        )
        low = [
            {
                "id": p.id, "name": p.name, "slug": p.slug,
                "remaining_stock": p.remaining or 0,
                "thumbnail": p.primary_image.url if p.primary_image else None,
            }
            for p in low_stock
        ]

        bestsellers = (
            OrderItem.objects.filter(order__payment_status="paid")
            .values("product_id", "product_name")
            .annotate(units=Sum("quantity"), revenue=Sum("line_total"))
            .order_by("-units")[:8]
        )
        thumb_map = {
            p.id: p.primary_image.url if p.primary_image else None
            for p in Product.objects.filter(id__in=[b["product_id"] for b in bestsellers])
        }

        recent = list(
            Order.objects.order_by("-created_at")[:8].values(
                "number", "full_name", "total", "status", "payment_status", "created_at"
            )
        )

        month_ago = timezone.now() - timedelta(days=30)
        return Response(
            {
                "order_counts": counts,
                "revenue": {
                    "total": str(rev_total),
                    "today": str(rev_today),
                    "paid_orders": paid.count(),
                },
                "pending_fulfillment": Order.objects.filter(
                    payment_status="paid",
                    status__in=[Order.Status.PROCESSING, Order.Status.SHIPPED],
                ).count(),
                "new_customers_30d": User.objects.filter(date_joined__gte=month_ago).count(),
                "recent_orders": recent,
                "low_stock": low,
                "bestsellers": [
                    {
                        "product_name": b["product_name"],
                        "units_sold": b["units"],
                        "revenue": str(b["revenue"]),
                        "thumbnail": thumb_map.get(b["product_id"]),
                    }
                    for b in bestsellers
                ],
            }
        )


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