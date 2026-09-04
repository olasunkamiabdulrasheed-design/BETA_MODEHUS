from .base import *  # noqa: F401,F403

DEBUG = True

CORS_ORIGIN_ALLOW_ALL = True

# Keep sending mail to console in development so no credentials are required.
MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.console.EmailBackend",
    }
}