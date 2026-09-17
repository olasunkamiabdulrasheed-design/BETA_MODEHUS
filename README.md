# BETA_MODEHUS

> **For Better Elegance and Luxury** — a complete Nigerian fashion e-commerce
> platform: a customer storefront, a full REST API, and an owner dashboard.

This is the single document to read if you want to understand what the project
is, how it is put together, how money and orders flow through it, and how to run
and deploy it. Every section below can be read on its own.

---

## Contents

1. [Live deployment](#1-live-deployment)
2. [Technology stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Repository structure](#4-repository-structure)
5. [Storefront features](#5-storefront-features)
6. [Owner console features](#6-owner-console-features)
7. [Backend applications](#7-backend-applications)
8. [Data model](#8-data-model)
9. [Authentication and roles](#9-authentication-and-roles)
10. [API reference — catalog](#10-api-reference--catalog)
11. [API reference — cart](#11-api-reference--cart)
12. [API reference — orders](#12-api-reference--orders)
13. [API reference — payments](#13-api-reference--payments)
14. [API reference — reviews and contact](#14-api-reference--reviews-and-contact)
15. [API reference — owner/admin endpoints](#15-api-reference--owneradmin-endpoints)
16. [Local setup — backend](#16-local-setup--backend)
17. [Local setup — frontend](#17-local-setup--frontend)
18. [Environment variables](#18-environment-variables)
19. [Seeding and demo data](#19-seeding-and-demo-data)
20. [Testing](#20-testing)
21. [Owner workflow — products and inventory](#21-owner-workflow--products-and-inventory)
22. [Owner workflow — orders and fulfilment](#22-owner-workflow--orders-and-fulfilment)
23. [Customer workflow](#23-customer-workflow)
24. [Deployment — backend on PythonAnywhere](#24-deployment--backend-on-pythonanywhere)
25. [Deployment — frontend on Vercel](#25-deployment--frontend-on-vercel)
26. [CI/CD and release process](#26-cicd-and-release-process)
27. [Troubleshooting and FAQ](#27-troubleshooting-and-faq)
28. [Security and data handling](#28-security-and-data-handling)
29. [Roadmap, credentials and licence](#29-roadmap-credentials-and-licence)

---

## 1. Live deployment

| Piece | URL | Host | Cost |
|-------|-----|------|------|
| Storefront | https://beta-modehus.vercel.app | Vercel | free |
| REST API | https://eddiemich.pythonanywhere.com/api/v1/ | PythonAnywhere | free |
| Django admin ("vault") | https://eddiemich.pythonanywhere.com/vault/ | PythonAnywhere | free |
| Health check | .../health/ and .../api/v1/health/ | PythonAnywhere | free |

The hosted demo runs with **`SIMULATE_PAYMENTS = True`**, so checkout completes
end-to-end without real OPay keys and **no card is ever charged**. Switch it off
once real payment credentials exist.

The storefront and the API are two separate services on two hosts, so the
frontend is built with `VITE_API_URL` pointing at the PythonAnywhere API.
## 2. Technology stack

**Backend**

| Concern | Technology |
|---------|------------|
| Framework | Django 6.1 + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Filtering | django-filter |
| Ports/storage | PostgreSQL (prod) or SQLite (dev/staging) via `DATABASE_URL`-style settings |
| Media | Local file storage, or Cloudinary when `CLOUDINARY_URL` is set |
| Email | Gmail SMTP for transactional order emails |
| API docs | drf-spectacular (OpenAPI schema + Swagger/ReDoc) |
| Serving | gunicorn + WhiteNoise (PythonAnywhere), Docker/nginx optional |

**Frontend**

| Concern | Technology |
|---------|------------|
| UI | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| HTTP | axios with JWT interceptor |
| Icons | lucide-react |

## 3. Architecture

The API is the single source of truth. The React app never talks to the
database directly; it only calls `/api/v1/...`. Payment is asynchronous: the
API creates a payment, the customer pays, and either the provider webhook or the
simulated checkout page flips the order to paid.

```text
        Browser (React + Tailwind)
                 |
                 |  HTTPS + JWT (Authorization: Bearer ...)
                 v
   +-------------------------------------------+
   |        Django REST API  /api/v1/          |
   |  accounts cart catalog orders payments     |
   |  reviews common notifications reports      |
   +-------------------------------------------+
        |                |                 |
        v                v                 v
   PostgreSQL      media storage      OPay Checkout
   / SQLite        (local/Cloudinary) (or simulator)
                 ^
                 |  webhook / callback
      Browser (callback) or OPay -> payment status
```

Two admin surfaces sit on top of the same API:

- **Owner console** at `/backstage` in the React app (staff-only), for
  day-to-day product, stock and order work.
- **Django admin** at `/vault/`, the low-level content admin.

## 4. Repository structure

```text
BETA_MODEHUS/
|-- backend/                 Django project
|   |-- accounts/            users, addresses, JWT auth, change password
|   |-- catalog/             categories, brands, products, variants, images
|   |-- cart/                server-side cart and guest-cart merge
|   |-- orders/              orders, order items, shipping settings, stats
|   |-- payments/            OPay integration + payment simulator
|   |-- reviews/             product reviews with purchase verification
|   |-- common/              contact messages
|   |-- notifications/       order email helpers
|   |-- reports/             reporting helpers
|   |-- config/              settings (base/dev/prod/pythonanywhere), urls, wsgi
|   |-- catalog_seed.json    checked-in demo fixture (products + media refs)
|   |-- media_seed.zip       checked-in demo images
|   |-- manage.py
|-- frontend/                React storefront + owner console
|   |-- src/
|   |   |-- api/             axios client, currency helper
|   |   |-- context/         Auth + Cart providers
|   |   |-- components/      Layout, ProductCard, EmptyState, Spinner, ...
|   |   |-- hooks/           useDocumentTitle
|   |   |-- pages/           Home, Catalog, ProductDetail, Cart, Checkout, ...
|   |   `-- utils/           formatting helpers
|   |-- public/              logo, hero images, robots.txt, sitemap.xml
|   `-- index.html
|-- docs/                    deeper reference material
|-- DEPLOY.md                step-by-step hosting notes
|-- CHANGELOG.md
`-- README.md                (this file)
```
## 5. Storefront features

- **Home** — hero, featured products, category feeds, contact section.
- **Catalog** — search, category / brand / size / colour / price / rating /
  availability / featured filters, pagination.
- **Product page** — image gallery, size & colour variant picker, stock-aware
  quantity, add to cart, WhatsApp order shortcut, reviews, related products.
- **Cart** — server-side cart, quantity controls, live totals, guest cart merge
  on login.
- **Checkout** — saved addresses, delivery details, shipping fee, order
  creation, then payment.
- **Payment** — OPay checkout in production; a gold "simulated checkout" page in
  the demo.
- **Orders** — order history and a detail page with status, tracking number and
  a "Pay now" retry for unpaid orders.
- **Account** — profile, addresses, change password.
- **Contact** — message form saved to the API and emailed to the owner.
## 6. Owner console features

The owner console lives at `/backstage` and is only reachable by staff users
(`is_staff = true`).

- **Dashboard** — revenue and order stats, low-stock list, recent orders.
- **Products** — create/edit/publish products, set price, category, brand,
  description, specifications and featured flag.
- **Variants** — sizes, colours, per-variant price and stock (colour has an
  optional hex swatch).
- **Images** — upload product images and mark a cover image; images can be tied
  to a specific variant.
- **Orders** — view all orders, change status, set a tracking number.
- **Reviews** — approve or hide customer reviews.
- **Shipping** — set the flat delivery fee, free-shipping threshold and
  low-stock threshold.

The Django admin at `/vault/` shows the same data plus the raw tables and a
Vault dashboard summary.
## 7. Backend applications

| App | Responsibility |
|-----|----------------|
| `accounts` | Custom email-based user, addresses, signup/login/refresh, profile, change password |
| `catalog` | Categories, brands, products, variants, images, public + admin APIs |
| `cart` | One cart per user, cart items, guest-cart merge, clear |
| `orders` | Orders, order items, shipping settings, owner stats, status changes |
| `payments` | Initiate/verify payments, OPay webhook, simulated checkout |
| `reviews` | Reviews tied to verified purchases, moderation |
| `common` | Contact messages |
| `notifications` | Order/status email helpers |
| `reports` | Aggregation helpers used by dashboards |

## 8. Data model

Key relationships:

```text
User 1---* Address
User 1---1 Cart 1---* CartItem *---1 ProductVariant
Category 1---* Product *---1 Brand
Product 1---* ProductVariant
Product 1---* ProductImage (optionally *---1 ProductVariant)
User 1---* Order 1---* OrderItem
Order 1---* Payment
Product 1---* Review *---1 User (optional Order for verified badge)
ShippingSetting (singleton-ish row of fees/thresholds)
ContactMessage
```

Notable fields:

- `Product`: `name`, `slug`, `category`, `brand`, `price`, `sku`, `status`
  (`draft` / `published`), `is_active`, `is_featured`, `specifications` (JSON).
- `ProductVariant`: `size`, `color`, `color_hex`, `sku`, `price`, `stock`,
  `is_active`.
- `Order`: `number`, address snapshot, `subtotal`, `shipping_fee`, `total`,
  `status`, `payment_status`, `tracking_number`.
- `OrderItem`: product/variant snapshot (`product_name`, `variant_label`, `sku`),
  `unit_price`, `quantity`, `line_total`.
- `Payment`: `reference`, `provider_reference`, `amount`, `status`,
  `raw_response`.
- `Review`: `rating`, `comment`, `status`, verified-purchase flag derived from a
  paid order.

Quantities, prices and totals are stored on the server; the client never
calculates what it owes.

## 9. Authentication and roles

- Auth is **JWT**: `POST /auth/login/` returns access + refresh tokens; the
  axios client sends `Authorization: Bearer <access>` and refreshes on 401.
- **Anonymous** visitors can browse, search and use a guest cart.
- **Customer** — a normal account: cart, checkout, orders, reviews, addresses.
- **Staff / owner** (`is_staff`) — everything above, plus `/backstage` and the
  Django admin. The storefront hides shopping links from staff accounts and
  shows the dashboard link instead.
- Tokens are stored client-side and cleared on logout.
## 10. API reference — catalog

Public, no auth required (`/api/v1/`).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/categories/` | List active categories |
| GET | `/categories/<slug>/` | Category detail |
| GET | `/brands/` | List active brands |
| GET | `/products/` | List published products |
| GET | `/products/<slug>/` | Product detail with variants and images |

`/products/` supports: `search`, `category`, `brand`, `size`, `color`,
`min_price`, `max_price`, `min_rating`, `availability`, `is_featured`, plus
ordering and pagination.

Each product in a list also carries `min_price`, `primary_image`, `rating`,
`is_available` and `total_stock` (sum of variant stock), so cards can render
without extra requests.
## 11. API reference — cart

Authenticated (`Authorization: Bearer ...`). One server-side cart per user.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/cart/` | Current cart with items and totals |
| PATCH/DELETE | `/cart/items/<id>/` | Change quantity / remove an item |
| POST | `/cart/items/<id>/remove/` | Remove an item |
| POST | `/cart/merge/` | Merge a guest cart into the user cart on login |
| POST | `/cart/clear/` | Empty the cart |

Stock and price are always re-read from the database, never trusted from the
client.

## 12. API reference — orders

Authenticated. Customers see only their own orders; staff see everything.

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/orders/` | List my orders / create an order from the cart |
| GET | `/orders/<number>/` | Order detail |
| GET | `/orders/shipping-setting/` | Current delivery fee and thresholds |
| GET | `/orders/admin/stats/` | Owner dashboard stats (staff) |
| POST | `/orders/admin/<number>/` | Change status / set tracking (staff) |

Creating an order snapshots the delivery address and the line items, then
reserves nothing until payment: stock is reduced when the order is placed and
released/adjusted as the owner processes it.

## 13. API reference — payments

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/payments/initiate/` | user | Create a payment and get a checkout URL |
| GET | `/payments/status/` | user | Poll a payment's status |
| POST | `/payments/webhook/opay/` | provider | OPay callback that marks an order paid |

In the demo, `SIMULATE_PAYMENTS = True` serves a local gold checkout page
instead of calling OPay; confirming it triggers the same code path as a real
webhook.

## 14. API reference — reviews and contact

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/reviews/?product=<slug>` | public | List approved reviews |
| POST | `/reviews/` | user | Post a review |
| POST | `/reviews/<id>/moderate/` | staff | Approve / hide a review |
| POST | `/contact/` | public | Send a contact message |

A review is marked **verified purchase** when the reviewer has a paid order
containing that product.

## 15. API reference — owner/admin endpoints

All require a staff account.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/products/` | List products including drafts |
| GET/POST/PATCH/DELETE | `/admin/products/<id>/` | Manage a product |
| POST | `/admin/products/<id>/images/` | Upload an image; set cover/variant |
| DELETE | `/admin/products/<id>/images/<img_id>/` | Remove an image |
| POST | `/admin/variants/` | Create a variant |
| PATCH | `/admin/variants/<id>/` | Edit a variant (price, stock, active) |
| GET | `/admin/catalog/...` | See catalog app |
| GET | `/orders/admin/stats/` | Dashboard statistics |
| POST | `/orders/admin/<number>/` | Update order status / tracking |
## 16. Local setup — backend

Requirements: Python 3.12+, and a virtualenv.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env            # then edit .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_catalog   # optional demo data
.\.venv\Scripts\python.exe manage.py runserver 8000
```

The API is now at `http://127.0.0.1:8000/api/v1/`. Settings module defaults to
`config.settings.dev`; switch to `config.settings.prod` or
`config.settings.pythonanywhere` with `--settings=` when needed.
## 17. Local setup — frontend

Requires Node 20+ (see `.nvmrc`).

```powershell
cd frontend
npm.cmd install
copy .env.example .env.local     # set VITE_API_URL if needed
npm.cmd run dev
```

Open **http://localhost:5173** (use `localhost`, not `127.0.0.1`). In development
the Vite proxy forwards `/api` to the local Django server, so leaving
`VITE_API_URL` unset works out of the box. For a deployed frontend point it at
the full API URL, e.g.
`VITE_API_URL=https://eddiemich.pythonanywhere.com/api/v1`.

Production build:

```powershell
npm.cmd run build     # outputs frontend/dist
```

## 18. Environment variables

**Backend (`backend/.env`)** — see `backend/.env.example`:

| Variable | Meaning |
|----------|---------|
| `DJANGO_SECRET_KEY` | Django signing key |
| `DJANGO_DEBUG` | `True` locally, `False` in production |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed to call the API |
| `DATABASE_URL` | Postgres in production; SQLite otherwise |
| `DEFAULT_SHIPPING_FEE` | Fallback flat delivery fee |
| `SIMULATE_PAYMENTS` | `True` = local checkout, `False` = real OPay |
| `OPAY_MERCHANT_ID` / `OPAY_PUBLIC_KEY` / `OPAY_PRIVATE_KEY` | OPay keys |
| `EMAIL_HOST_PASSWORD` | Gmail app password for order emails |
| `CLOUDINARY_URL` | Enables Cloudinary media storage when set |

**Frontend (`frontend/.env.local`)**:

| Variable | Meaning |
|----------|---------|
| `VITE_API_URL` | Absolute API base including `/api/v1` |

`VITE_*` values are baked in at build time, so changing one requires a rebuild.
Never commit real `.env` files.
## 19. Seeding and demo data

Two ways to fill the store:

**From the checked-in fixture (fast, no image generation):**

```bash
cd backend
python manage.py loaddata ./catalog_seed.json --settings=config.settings.pythonanywhere
unzip -o media_seed.zip -d .        # restores backend/media
```

**Generate everything from scratch (creates placeholder images):**

```powershell
.\.venv\Scripts\python.exe manage.py seed_catalog
```

`seed_catalog` is idempotent: it creates the 15 categories, a brand, ~18
products with variants and placeholder images, plus an admin user if none
exists. Set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to control the password
(otherwise a random one is generated and printed).

## 20. Testing

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py test
```

The suite covers the public catalog API and filters, admin product/image APIs,
cart, checkout, payments, reviews and the seed command (60 tests, all green).
Frontend has no unit tests yet; verify changes with `npm.cmd run build`.

## 21. Owner workflow — products and inventory

1. Log in at `/backstage` with a staff account.
2. **Products** — create a product: name, category, brand, price, SKU, optional
   description and specifications, published/draft status, featured flag.
3. **Variants** — add one row per size/colour combination with its own price and
   stock. A product with no variants shows "Sold out".
4. **Images** — upload images and mark one as the cover; optionally attach an
   image to a variant so it swaps when the customer picks that variant.
5. **Stock** — edit variant stock at any time; low-stock items appear on the
   dashboard once they fall under the shipping setting's threshold.

Products set to **draft** never appear on the storefront.

## 22. Owner workflow — orders and fulfilment

1. A new order arrives as **Pending Payment** / payment **pending**.
2. When payment succeeds, the order becomes paid and moves to **Processing**.
3. From `/backstage` orders (or `/vault/`), the owner moves the order through
   **Processing -> Shipped -> Delivered**, adding a tracking number.
4. If an order is not paid, the owner can leave it pending or cancel it. The
   customer can retry payment from their order page.
5. Order totals are frozen at checkout: later price changes do not alter past
   orders.
## 23. Customer workflow

1. **Browse** the home page and catalog; filter and search.
2. **Open a product**, choose size and colour, then add to cart (or tap
   "WhatsApp order").
3. **Review the cart** and proceed to checkout (guests are asked to log in;
   their cart is merged into the account).
4. **Enter delivery details** or pick a saved address; the shipping fee is
   applied.
5. **Place the order** — an order number is generated and the status is
   Pending Payment.
6. **Pay** — redirected to OPay (or the simulated checkout in the demo).
7. **Track** the order from the orders page: Processing, Shipped, Delivered,
   with a tracking number when the owner adds one.
8. **Review** the product after a paid order.
## 24. Deployment — backend on PythonAnywhere

Free tier, no card. Full detail is in `DEPLOY.md`; the short version:

```bash
# Bash console on PythonAnywhere
git clone https://github.com/<user>/BETA_MODEHUS.git
cd BETA_MODEHUS/backend
mkvirtualenv --python=/usr/bin/python3.12 betamodehus
pip install -r requirements.txt
python manage.py migrate --settings=config.settings.pythonanywhere
python manage.py collectstatic --settings=config.settings.pythonanywhere --noinput
python manage.py loaddata ./catalog_seed.json --settings=config.settings.pythonanywhere
unzip -o media_seed.zip -d .        # restore demo images
```

Then in the **Web** tab: set the source/working directory to
`.../BETA_MODEHUS/backend`, point the virtualenv at `betamodehus`, set the WSGI
file to `config/wsgi_pythonanywhere.py`, and add static mappings:

| URL | Directory |
|-----|-----------|
| `/static/` | `.../backend/staticfiles` |
| `/media/` | `.../backend/media` |

To ship backend changes after a push:

```bash
cd ~/BETA_MODEHUS/backend && git pull
```

then click **Reload** in the Web tab. PythonAnywhere does **not** auto-deploy.
## 25. Deployment — frontend on Vercel

1. Import the GitHub repo at vercel.com, set **Root Directory** to `frontend`.
2. Framework preset: Vite (auto-detected).
3. Add environment variable `VITE_API_URL=https://eddiemich.pythonanywhere.com/api/v1`
   (Production).
4. Deploy.

Vercel rebuilds automatically on every push to `main`. Because `VITE_API_URL`
is baked in at build time, changing it requires a redeploy. Redeploy the
**newest** deployment — redeploying a superseded one fails with a "more recent
Production Deployment" error.

Backend CORS must allow the frontend origin. In
`config/settings/pythonanywhere.py` the allowed origins are the
`beta-modehus`/`betamodehus` Vercel URLs via
`CORS_ALLOWED_ORIGIN_REGEXES`, plus `CSRF_TRUSTED_ORIGINS` and
`STORE_BASE_URL` for redirects.