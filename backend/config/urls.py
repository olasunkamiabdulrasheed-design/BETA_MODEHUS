from django.contrib import admin
from django.http import JsonResponse
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({"status": "ok", "service": "betamodehus-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health"),
]