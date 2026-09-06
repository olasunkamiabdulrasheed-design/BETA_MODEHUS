# BETA_MODEHUS — Production Deployment Guide

Everything you need to take the store live. The exact reference docs for every
step live in `docs/PROJECT_NOTES.md`; this file is the runbook for launch day.

## Architecture

    Internet ──▶ nginx :443 (TLS)
                  ├── /            → frontend/dist  (React SPA)
                  ├── /api /admin /health  → gunicorn (Django DRF) via unix socket
                  └── /static /media       → Django (or Cloudinary)
    gunicorn ──▶ PostgreSQL
    Payments ──▶ OPay Checkout (live)
    Email ─────▶ Gmail SMTP

## 1. Server basics (Ubuntu 24.04 LTS, any VPS)

    sudo apt update && sudo apt upgrade -y
    sudo apt install -y nginx postgresql postgresql-contrib python3-venv python3-pip \
      certbot python3-certbot-nginx git ufw
    sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable

Point `A` records at the server:
    betamodehus.com    → <server-ip>
    www.betamodehus.com → <server-ip>
    api.betamodehus.com → <server-ip>

## 2. Database

    sudo -u postgres psql
      CREATE USER betamodehus WITH PASSWORD 'STRONG-DB-PASSWORD';
      CREATE DATABASE betamodehus OWNER betamodehus;
      \q

## 3. Application files

    sudo mkdir -p /var/www/betamodehus /var/log/betamodehus
    sudo chown -R $USER:www-data /var/www/betamodehus /var/log/betamodehus
    cd /var/www/betamodehus
    git clone https://github.com/olasunkamiabdulrasheed-design/BETA_MODEHUS.git .
    cd backend
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt

Create `backend/.env` (copy from `backend/.env.example`). The important values:

    DJANGO_DEBUG=false
    DJANGO_SECRET_KEY=<generate: python3 -c 'import secrets; print(secrets.token_urlsafe(64))'>
    DJANGO_ALLOWED_HOSTS=api.betamodehus.com,betamodehus.com,www.betamodehus.com
    CORS_ALLOWED_ORIGINS=https://betamodehus.com,https://www.betamodehus.com
    DJANGO_CSRF_TRUSTED_ORIGINS=https://betamodehus.com,https://www.betamodehus.com
    STORE_BASE_URL=https://betamodehus.com
    OPAY_CB_URL=https://betamodehus.com/payment/callback

    POSTGRES_DB=betamodehus
    POSTGRES_USER=betamodehus
    POSTGRES_PASSWORD=<the one from step 2>
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432

    # OPay LIVE credentials (from OPay dashboard)
    OPAY_MERCHANT_ID=...
    OPAY_PUBLIC_KEY=...
    OPAY_PRIVATE_KEY=...
    OPAY_WEBHOOK_SECRET=...
    # leave OPAY_BASE_URL unset — base.py picks liveapi.opaycheckout.com when DEBUG=false

    # Gmail SMTP (app password, not your normal password)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_HOST_USER=betamodehus@gmail.com
    EMAIL_HOST_PASSWORD=<16-char app password>

    # Cloudinary (product images hosted on the CDN)
    CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

Prepare Django:

    .venv/bin/python manage.py migrate
    .venv/bin/python manage.py collectstatic --noinput
    .venv/bin/python manage.py seed_catalog       # optional first-time catalog

## 4. Run gunicorn as a service

    sudo cp deploy/betamodehus.service /etc/systemd/system/
    sudo nano /etc/systemd/system/betamodehus.service   # fix paths if needed
    sudo systemctl daemon-reload
    sudo systemctl enable --now betamodehus
    sudo journalctl -u betamodehus -f        # watch logs

## 5. Frontend build

    cd /var/www/betamodehus/frontend
    cp .env.example .env.production          # edit if the API is on a separate domain
    npm ci
    npm run build                            # outputs to frontend/dist

## 6. nginx + HTTPS

    sudo cp deploy/nginx.conf /etc/nginx/sites-available/betamodehus
    sudo ln -s /etc/nginx/sites-available/betamodehus /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default   # optional
    sudo nginx -t && sudo systemctl reload nginx

    sudo certbot --nginx -d betamodehus.com -d www.betamodehus.com -d api.betamodehus.com

## 7. Launch checklist

- [ ] `curl https://betamodehus.com/health/` → `{"status":"ok"}`
- [ ] HSTS headers present: `curl -sI https://betamodehus.com | grep -i strict`
- [ ] Place a test order end-to-end (guest → signup → cart merge → checkout → OPay live)
- [ ] Confirm OPay webhook returns, then verify stock decreased exactly once + emails sent
- [ ] Staff account: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`, then
      `.venv/bin/python manage.py seed_catalog` (creates the staff user)
- [ ] Set delivery fee / free-shipping threshold in the admin dashboard → Settings tab
- [ ] Set `DJANGO_SECRET_KEY` (raising check in prod.py fails fast if missing)

## 8. Day-to-day ops

    sudo systemctl restart betamodehus        # after a deploy
    cd /var/www/betamodehus && git pull && cd frontend && npm run build   # new release

Backup daily (cron):

    0 3 * * * pg_dump betamodehus | gzip > /var/backups/betamodehus-$(date +\%F).sql.gz

## Important notes

- Stock is only decremented AFTER OPay confirms a SUCCESS payment
  (`mark_payment_success`), and exactly once (idempotent).
- Amounts are compared in kobo (total × 100); mismatches are rejected and logged.
- Emails never break flows — exceptions are swallowed and logged.
- Reviews are only possible for verified purchasers and are moderated in the dashboard.

## Architecture notes / cost of keeping hygiene

- Backend: Django 6.1 + DRF + SimpleJWT, `config.settings.prod`.
- Frontend: React (Vite build) — served as static files by nginx.
- Media: Cloudinary in prod (keeps the origin server lean); local `media/` in dev.