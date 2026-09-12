from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

PASSWORD = "Str0ngPassw0rd!"

SIGNUP = {
    "email": "new@example.com",
    "password": PASSWORD,
    "password2": PASSWORD,
    "full_name": "New User",
}


class SignupTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_returns_tokens_and_creates_user(self):
        res = self.client.post("/api/v1/auth/signup/", SIGNUP, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertIn("user", res.data)
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_signup_rejects_mismatched_passwords(self):
        payload = {**SIGNUP, "password2": "Different1!"}
        res = self.client.post("/api/v1/auth/signup/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="new@example.com").exists())

    def test_signup_rejects_duplicate_email_case_insensitive(self):
        User.objects.create_user(email="dup@example.com", password=PASSWORD)
        res = self.client.post(
            "/api/v1/auth/signup/", {**SIGNUP, "email": "DUP@example.com"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(email="login@example.com", password=PASSWORD, full_name="Login User")

    def test_login_returns_access_user_payload(self):
        res = self.client.post(
            "/api/v1/auth/login/",
            {"email": "login@example.com", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["email"], "login@example.com")

    def test_login_rejects_bad_credentials(self):
        res = self.client.post(
            "/api/v1/auth/login/",
            {"email": "login@example.com", "password": "wrongpass1"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class MeTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_me_requires_auth(self):
        res = self.client.get("/api/v1/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_profile_with_token(self):
        User.objects.create_user(email="me@example.com", password=PASSWORD, full_name="Me User")
        login = self.client.post(
            "/api/v1/auth/login/",
            {"email": "me@example.com", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        res = self.client.get("/api/v1/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "me@example.com")
        self.assertEqual(res.data["full_name"], "Me User")