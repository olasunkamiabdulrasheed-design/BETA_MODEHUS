from .base import *  # noqa: F401,F403

DEBUG = False

# A real secret key is mandatory in production.
if not env("DJANGO_SECRET_KEY"):
    raise RuntimeError(
        "DJANGO_SECRET_KEY must be set in the production .env file."
    )

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    ["api.betamodehus.com", "betamodehus.com", "www.betamodehus.com"],
)

# The storefront (nginx) sits behind these origins; update for your real domain.
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    ["https://betamodehus.com", "https://www.betamodehus.com"],
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    ["https://betamodehus.com", "https://www.betamodehus.com"],
)

# nginx terminates TLS and forwards the original scheme.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "betamodehus"),
        "USER": env("POSTGRES_USER", "betamodehus"),
        "PASSWORD": env("POSTGRES_PASSWORD", ""),
        "HOST": env("POSTGRES_HOST", "localhost"),
        "PORT": env("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": 60,
    }
}

# Secure cookies / HTTPS
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env_int("DJANGO_HSTS_SECONDS", 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False

# Real email (Gmail SMTP via MAILERS)
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

# Media uploads go to Cloudinary; static files stay local on the server
# (collected by `manage.py collectstatic` and served by nginx).
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
STATIC_ROOT = BASE_DIR / "staticfiles"
CLOUDINARY_URL = env("CLOUDINARY_URL", "")

INSTALLED_APPS += ["cloudinary_storage"]  # noqa: F405