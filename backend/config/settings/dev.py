from .base import *  # noqa: F401,F403

DEBUG = True

CORS_ORIGIN_ALLOW_ALL = True

# Dev: print mail to the console by default so no credentials are required.
# If a Gmail App Password is set in .env, send real mail via Gmail SMTP.
if env("EMAIL_HOST_PASSWORD"):
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.smtp.EmailBackend",
            "OPTIONS": {
                "host": env("EMAIL_HOST", "smtp.gmail.com"),
                "port": env_int("EMAIL_PORT", 587),
                "username": env("EMAIL_HOST_USER", ""),
                "password": env("EMAIL_HOST_PASSWORD", ""),
                "use_tls": True,
                "timeout": 30,
            },
        }
    }
else:
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.console.EmailBackend",
        }
    }