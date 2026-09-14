# Deploy BETA_MODEHUS

Two services, zero dollar cost, **no credit card required**.

- **Backend** → PythonAnywhere (free tier, no card)
- **Frontend** → Vercel (free tier, no card)

---

## 1. Backend (PythonAnywhere)

### First time

1. Sign up at **pythonanywhere.com** (no card). The site name becomes your URL:
   ```
   https://olasunkami.pythonanywhere.com
   ```

2. **Bash console** → clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BETA_MODEHUS.git
   cd BETA_MODEHUS/backend
   ```

3. Create a virtualenv and install:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.12 betamodehus
   pip install -r requirements.txt
   ```

4. Migrate and collect static:
   ```bash
   python manage.py migrate --settings=config.settings.pythonanywhere
   python manage.py collectstatic --settings=config.settings.pythonanywhere --noinput
   python manage.py createsuperuser   # admin for /vault/
   ```

5. **Web tab** → **Add a new web app** → **Manual configuration** → Python 3.12.
   Set these fields:
   - **Source code**: `/home/olasunkami/BETA_MODEHUS/backend`
   - **Working directory**: `/home/olasunkami/BETA_MODEHUS/backend`
   - **Virtualenv**: `/home/olasunkami/.virtualenvs/betamodehus`
   - **WSGI configuration file** (edit file):
     ```python
     import sys
     sys.path.append('/home/olasunkami/BETA_MODEHUS/backend')
     import os
     os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.pythonanywhere'
     from django.core.wsgi import get_wsgi_application
     application = get_wsgi_application()
     ```
     (equivalent to the checked-in `backend/config/wsgi_pythonanywhere.py`)

6. **Reload** the web app. Test:
   ```
   https://olasunkami.pythonanywhere.com/api/v1/health/
   ```

> The demo uses `SIMULATE_PAYMENTS = True` (set in `config/settings/pythonanywhere.py`),
> so checkout works end‑to‑end with no OPay keys. Set it to `False` once real keys exist.

---

## 2. Frontend (Vercel)

### First time

1. Go to **vercel.com** → **New Project** → import your GitHub repo
2. Set the **Root Directory** to `frontend`
3. Vercel auto-detects Vite — build settings are pre-filled
4. Add one environment variable:
   ```
   VITE_API_URL = https://olasunkami.pythonanywhere.com/api/v1
   ```
5. Click **Deploy**

### Your frontend URL
```
https://betamodehus.vercel.app
```

---

## 3. Connect them

The checked-in `config/settings/pythonanywhere.py` already allows the Vercel origins:

```
CORS_ALLOWED_ORIGINS = https://betamodehus.vercel.app
CSRF_TRUSTED_ORIGINS  = https://betamodehus.vercel.app
STORE_BASE_URL        = https://betamodehus.vercel.app
```

To use a different Vercel URL, edit `pythonanywhere.py` and **Reload** the web app.

---

## 4. Seed some products

1. Visit `https://olasunkami.pythonanywhere.com/vault/` → log in as the superuser
2. Add categories, brands, products, images, and colour variants through the admin

---

## 5. Test the full flow

1. Visit the Vercel URL → browse products
2. Add to cart → checkout
3. On payment, you'll see the gold **simulated checkout** page
4. Click **Confirm Payment** → redirected to callback → order is PAID
5. Check `/vault/` → orders show as processing

---

## When he gives you the credentials

No code changes needed on the frontend. On PythonAnywhere, either add them to
`config/settings/pythonanywhere.py` (super-easy) and **Reload**:

| What | Add to pythonanywhere.py | What changes |
|------|--------------------------|--------------|
| Cloudinary URL | `CLOUDINARY_URL = "cloudinary://..."` | Real product images |
| OPay keys | `OPAY_MERCHANT_ID`, `OPAY_PUBLIC_KEY`, `OPAY_PRIVATE_KEY` | Real payments (set `SIMULATE_PAYMENTS=False`) |
| Gmail password | `EMAIL_HOST_PASSWORD` | Real order emails |

---

## Cost

| Service | Free tier | Paid |
|---------|-----------|------|
| PythonAnywhere (backend incl. SQLite) | $0/month | $5/month always-on |
| Vercel (frontend) | $0/month (100GB bandwidth) | $20/month pro |

**Total to showcase: $0/month.**