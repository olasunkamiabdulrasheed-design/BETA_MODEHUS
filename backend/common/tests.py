from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from .models import ContactMessage

PAYLOAD = {
    "name": "Tester",
    "email": "tester@example.com",
    "phone": "08000000000",
    "subject": "Sizing help",
    "message": "Do you have this in XL?",
}

LOCMEM_MAILERS = override_settings(
    MAILERS={
        "default": {"BACKEND": "django.core.mail.backends.locmem.EmailBackend"},
    }
)


class ContactEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_contact_list_is_public_and_requires_no_auth(self):
        res = self.client.get("/api/v1/contact/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_submit_contact_creates_message(self):
        res = self.client.post("/api/v1/contact/", PAYLOAD, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("detail", res.data)
        self.assertTrue(ContactMessage.objects.filter(email="tester@example.com").exists())

    @LOCMEM_MAILERS
    def test_submit_contact_emails_admin(self):
        res = self.client.post("/api/v1/contact/", PAYLOAD, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Sizing help", mail.outbox[0].subject)
        self.assertIn("tester@example.com", mail.outbox[0].body)

    def test_submit_contact_requires_message_and_reply_fields(self):
        res = self.client.post("/api/v1/contact/", {"name": "T"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ContactMessage.objects.exists())