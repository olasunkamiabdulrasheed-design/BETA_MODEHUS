# Deploy BETA_MODEHUS

Two services, zero dollar cost to start.

---

## 1. Backend (Render)

### First time
1. Push this repo to GitHub
2. Go to **render.com** → **New** → **Blueprint** → pick your repo
3. Render reads `render.yaml` and creates:
   - `betamodehus-api` (Python web service)
   - `betamodehus-db` (PostgreSQL database)
4. In the Render dashboard, open **betamodehus-api** → **Environment** tab
5. Fill in the secrets marked `sync: false`:
   ```
   CLOUDINARY_URL=          # paste real URL or leave empty (uses local media)
   EMAIL_HOST_PASSWORD=     # paste Gmail App Password or leave empty (console)
   OPAY_MERCHANT_ID=        # paste OPay sandbox key or leave empty (simulated)
   OPAY_PUBLIC_KEY=
   OPAY_PRIVATE_KEY=
   ```
6. Click **Manual Deploy** → **Deploy latest commit**

### First deploy does this automatically
- Installs Python + pip dependencies
- Runs `collectstatic` (serves compressed CSS/JS)
- Starts gunicorn on the Render-assigned URL

### Your backend URL
After deploy, Render gives you a URL like:
```
https://betamodehus-api.onrender.com
```
Test it: visit `https://betamodehus-api.onrender.com/api/v1/health/`

---

## 2. Frontend (Vercel)

### First time
1. Go to **vercel.com** → **New Project** → import your GitHub repo
2. Set the **Root Directory** to `frontend`
3. Vercel auto-detects Vite — build settings are pre-filled
4. Add one environment variable:
   ```
   VITE_API_URL = https://betamodehus-api.onrender.com/api/v1
   ```
5. Click **Deploy**

### Your frontend URL
Vercel gives you a URL like:
```
https://betamodehus.vercel.app
```

---

## 3. Connect them

Back in Render, update `CORS_ALLOWED_ORIGINS` to include your Vercel URL:
```
CORS_ALLOWED_ORIGINS = https://betamodehus.vercel.app
DJANGO_CSRF_TRUSTED_ORIGINS = https://betamodehus.vercel.app
STORE_BASE_URL = https://betamodehus.vercel.app
```
Then **Manual Deploy** → **Clear build cache & deploy**

---

## 4. Seed some products

1. Create a superuser (run in Render Shell or locally against production DB):
   ```bash
   python manage.py createsuperuser
   ```
2. Visit `https://betamodehus-api.onrender.com/vault/` → log in
3. Add categories, brands, products, and images through the admin

---

## 5. Test the full flow

1. Visit the Vercel URL → browse products
2. Add to cart → checkout
3. On payment, you'll see the **DEV SIMULATION** page (gold themed)
4. Click **Confirm Payment** → redirected to callback → order is PAID
5. Check the admin dashboard at `/vault/` → orders show as processing

---

## When he gives you the credentials

Just paste them into **Render → Environment** — no code changes:

| What | Where to paste | What changes |
|------|---------------|--------------|
| Cloudinary URL | `CLOUDINARY_URL` | Real product images |
| OPay keys | `OPAY_MERCHANT_ID`, `OPAY_PUBLIC_KEY`, `OPAY_PRIVATE_KEY` | Real payments |
| Gmail password | `EMAIL_HOST_PASSWORD` | Real order emails |

After pasting, click **Manual Deploy** → the backend restarts with live credentials.

---

## Cost

| Service | Free tier | Paid |
|---------|-----------|------|
| Render (API + DB) | $0/month (spins down after inactivity) | $7/month always-on |
| Vercel (frontend) | $0/month (100GB bandwidth) | $20/month pro |

**Total to showcase: $0/month.**
