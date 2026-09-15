#!/usr/bin/env bash
# One-shot PythonAnywhere backend setup for BETA_MODEHUS.
# Run inside the PythonAnywhere Bash console AFTER cloning the repo:
#
#   git clone https://github.com/olasunkamiabdulrasheed-design/BETA_MODEHUS.git
#   cd BETA_MODEHUS/backend
#   bash deploy_pythonanywhere.sh
#
# Afterwards: Web tab -> Add a new web app -> Manual configuration (Python 3.12)
# Set source + working dir to .../BETA_MODEHUS/backend, virtualenv betamodehus,
# and paste config/wsgi_pythonanywhere.py into the WSGI file. Then Reload.

set -e

PA_USER=$(whoami)
echo ">> PythonAnywhere user: $PA_USER (backend URL will be https://$PA_USER.pythonanywhere.com)"

if ! command -v mkvirtualenv >/dev/null 2>&1; then
  echo ">> virtualenvwrapper not available; using python -m venv instead"
  python3 -m venv venv
  source venv/bin/activate
else
  if ! workon betamodehus >/dev/null 2>&1; then
    mkvirtualenv --python=/usr/bin/python3.12 betamodehus
  else
    echo ">> virtualenv 'betamodehus' already exists"
  fi
fi

echo ">> Installing dependencies..."
pip install -r requirements.txt

SETTINGS=config.settings.pythonanywhere

echo ">> Pinning ALLOWED_HOSTS to https://$PA_USER.pythonanywhere.com ..."
sed -i "s/ALLOWED_HOSTS = \[.*\]/ALLOWED_HOSTS = [\"$PA_USER.pythonanywhere.com\"]/" config/settings/pythonanywhere.py

echo ">> Running migrations..."
python manage.py migrate --settings=$SETTINGS

echo ">> Collecting static files..."
python manage.py collectstatic --settings=$SETTINGS --noinput

echo ">> Creating superuser (owner account for /vault/)..."
python manage.py createsuperuser --settings=$SETTINGS

echo ">> Allowed hosts pinned to: https://$PA_USER.pythonanywhere.com"
echo ">> Backend setup done. Now create the web app in the Web tab."