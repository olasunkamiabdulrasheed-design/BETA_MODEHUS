# BETA_MODEHUS

> For Better Elegance and Luxury — a complete Nigerian fashion e-commerce platform.

Full-stack single-vendor store for BETA_MODEHUS (Ibadan South-East, Oyo State).
Customers browse, order and pay online (OPay Checkout); the owner runs the whole
store from a custom admin dashboard plus Django's content admin.

## Tech stack

| Layer    | Technology |
| -------- | ---------- |
| Backend  | Django 6.1 · Django REST Framework · SimpleJWT (JWT auth) · django-filter |
| Database | PostgreSQL (production) / SQLite (local development) |
| Payments | OPay Checkout (international Cashier API; live + test modes) |
| Media    | Cloudinary (production) / local `media/` (development) |
| Email    | Gmail SMTP via Django 6.1 `MAILERS` (transactional order emails) |
| Frontend | React 18 · Vite · Tailwind CSS v4 · React Router v6 · axios |
| Serving  | gunicorn + nginx (see `deploy/`) |

## Quickstart (development)

Two terminals, from the repo root.

**Terminal 1 — backend** (PowerShell):

```powershell
cd backend
.\.venv\Scripts\activate.bat
python manage.py migrate
python manage.py seed_catalog      # optional demo catalog + admin user
python manage.py runserver 8000
```

**Terminal 2 — frontend**:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open **http://localhost:5173** (use `localhost`, not `127.0.0.1` — Vite binds `::1`).
The API lives at `http://127.0.0.1:8000/api/v1/`.

## Documentation

Start with [`docs/START_HERE.md`](docs/START_HERE.md), then:

- **Project structure** — [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)
- **How features work** — [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md)
- **Feature list** — [`docs/FEATURES.md`](docs/FEATURES.md)
- **API reference** — [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)
- **Owner's guide** — [`docs/OWNER_GUIDE.md`](docs/OWNER_GUIDE.md)
- **FAQ** — [`docs/FAQ.md`](docs/FAQ.md)
- **Go-live runbook** — [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Changelog** — [`docs/PROJECT_NOTES.md`](docs/PROJECT_NOTES.md)

## Tests

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py test
```

18 automated tests cover cart, checkout, payments, reviews and admin actions.

## Secrets (never commit these)

All configuration lives in environment variables — copy `backend/.env.example`
to `backend/.env` and fill in: OPay merchant/public/private keys, Gmail SMTP app
password, `DJANGO_SECRET_KEY`, and Cloudinary URL. Never push the `.env` file.