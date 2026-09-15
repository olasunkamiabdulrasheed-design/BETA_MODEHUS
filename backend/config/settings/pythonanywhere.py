from .base import *  # noqa: F401,F403

DEBUG = False

# SQLite on PythonAnywhere free tier (no PostgreSQL needed)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

ALLOWED_HOSTS = ["eddiemich.pythonanywhere.com"]

# Accept any betamodehus / beta-modehus vercel origin (production + previews)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://(?:betamodehus|beta-modehus)[\w-]*\.vercel\.app$"
]
CORS_ALLOWED_ORIGINS = []
CSRF_TRUSTED_ORIGINS = ["https://beta-modehus.vercel.app"]

DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Email to console (no SMTP credentials needed for demo)
MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.console.EmailBackend",
    }
}

# Simulated payments in prod (no OPay keys needed for demo).
# SIMULATE_PAYMENTS lets the built-in gateway run even though DEBUG=False.
# To require real OPay keys instead, set SIMULATE_PAYMENTS=False.
SIMULATE_PAYMENTS = True
STORE_BASE_URL = env("STORE_BASE_URL", "https://beta-modehus.vercel.app")  # noqa: F405
