from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.permissions import IsAdminUser
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Review.objects.select_related("user", "product").filter(
            status=Review.Status.APPROVED
        )
        product = self.request.query_params.get("product")
        if product:
            if product.isdigit():
                return qs.filter(product_id=product)
            return qs.filter(product__slug=product)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReviewCreateSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        review, created = Review.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={
                "rating": serializer.validated_data["rating"],
                "comment": serializer.validated_data.get("comment", ""),
            },
        )
        if not created:
            return Response(
                {"detail": "You have already reviewed this product."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            ReviewSerializer(review).data, status=status.HTTP_201_CREATED
        )


class ReviewModerateView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]
    queryset = Review.objects.all()

    def patch(self, request, pk):
        review = self.get_object()
        status_value = request.data.get("status")
        if status_value not in ("approved", "rejected"):
            return Response(
                {"status": 'Must be "approved" or "rejected".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review.status = status_value
        review.save(update_fields=["status", "updated_at"])
        return Response(ReviewSerializer(review).data)