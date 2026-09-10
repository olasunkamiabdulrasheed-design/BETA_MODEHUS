import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ContactMessage
from .serializers import ContactMessageSerializer

logger = logging.getLogger(__name__)


class ContactCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        self._notify_admin(message)
        return Response(
            {"detail": "Thanks for reaching out - we will reply shortly."},
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def _notify_admin(message):
        try:
            context = {"message": message}
            body = render_to_string("emails/admin/contact_message.txt", context)
            send_mail(
                f"Contact form: {message.subject}",
                body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.ADMIN_EMAIL],
                fail_silently=False,
            )
        except Exception:
            # A failed notification must never break the customer's message.
            logger.exception("Could not send contact form email.")
            return False
        return True