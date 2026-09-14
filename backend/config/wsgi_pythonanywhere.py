import os
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.pythonanywhere")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()