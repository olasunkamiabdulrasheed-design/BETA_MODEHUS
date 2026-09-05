from django.urls import path

from . import views

urlpatterns = [
    path("", views.ReviewListCreateView.as_view(), name="review-list-create"),
    path("<int:pk>/moderate/", views.ReviewModerateView.as_view(), name="review-moderate"),
]