# BETA_MODEHUS — E-Commerce Web Application

> **For Better Elegance and Luxury.**

A single-admin Nigerian fashion e-commerce web application. One store owner
manages products, inventory, orders, payments, shipping and reports, while
customers browse, cart, checkout, pay through **OPay**, track orders and leave
verified-purchase reviews.

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Backend      | Python 3.14 · Django 6.1 · Django REST Framework        |
| Frontend     | React 18 · JavaScript · Tailwind CSS · Vite · Axios     |
| Database     | PostgreSQL (production) · SQLite (local development)    |
| Auth         | JWT (djangorestframework-simplejwt)                     |
| Payments     | OPay Checkout (sandbox → production)                    |
| Image files  | Cloudinary (primary)                                    |
| Email        | Django SMTP (Gmail) with environment-managed secrets    |
| Search       | PostgreSQL/Django full-text + django-filter             |

## Project Layout

```
BETA_MODEHUS/
├── backend/                # Django REST API
│   ├── config/             # Project settings (base/dev/prod)
│   ├── apps/               # Django apps
│   │   ├── accounts/       # Users, JWT auth, profiles, addresses
│   │   ├── catalog/        # Categories, brands, products, variants
│   │   ├── cart/           # Guest + account carts
│   │   ├── orders/         # Orders, shipping, receipts
│   │   ├── payments/       # OPay transactions & verification
│   │   ├── reviews/        # Verified-purchase reviews
│   │   ├── notifications/  # Email notifications
│   │   └── reports/        # Dashboard + reports
│   └── .env.example        # Environment variable template
├── frontend/               # React + Vite + Tailwind storefront/admin
├── docs/
│   ├── BUILD_PLAN.md       # Master build plan & architecture
│   └── PROJECT_NOTES.md    # Living change log (read FIRST)
└── README.md
```

## Quick Start

### Backend (Dev)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # PowerShell
pip install -r requirements.txt
copy .env.example .env        # then fill any real values
python manage.py migrate
python manage.py seed_catalog # optional demo products
python manage.py runserver
```

### Frontend (Dev)

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- **docs/PROJECT_NOTES.md** — living change log. Read this first to see exactly
  what has been built, what changed in each commit, and what remains.
- **docs/BUILD_PLAN.md** — full architecture, build phases and decisions.

## Secrets

Never put real secrets in source code. Copy `.env.example` to `.env` and fill
real values there. The full list of required environment variables (OPay,
Gmail, Cloudinary, PostgreSQL, JWT) is documented in `.env.example` and
`docs/BUILD_PLAN.md`.