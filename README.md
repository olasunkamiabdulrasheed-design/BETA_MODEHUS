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
30. [API conventions and pagination](#30-api-conventions-and-pagination)
31. [Order and payment lifecycle](#31-order-and-payment-lifecycle)
32. [Email notifications](#32-email-notifications)
33. [Command cheat sheet](#33-command-cheat-sheet)
34. [Local data reset](#34-local-data-reset)
35. [Glossary](#35-glossary)
36. [Support and contacts](#36-support-and-contacts)
37. [Handover checklist](#37-handover-checklist)
38. [Performance notes](#38-performance-notes)
39. [Accessibility notes](#39-accessibility-notes)
40. [Extended FAQ](#40-extended-faq)
41. [Project history](#41-project-history)
42. [Credits](#42-credits)
43. [Data dictionary](#43-data-dictionary)
44. [Settings modules](#44-settings-modules)
45. [Known limitations and future work](#45-known-limitations-and-future-work)
46. [Maintaining this document](#46-maintaining-this-document)
47. [One-page summary](#47-one-page-summary)

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
| Media | Local file storage, or Cloudinary when `CLOUDINARY_URL` is set; existing files migrate via `push_media_to_cloudinary` |
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
| `CLOUDINARY_URL` | Enables Cloudinary media storage when set (e.g. `cloudinary://API_KEY:API_SECRET@cloud_name`) |

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

### 24.1 Cloudinary media on PythonAnywhere

Media can live on Cloudinary (CDN) instead of the local `/media/` folder. Only
`CLOUDINARY_URL` is required — the app derives the cloud name, API key and API
secret from it automatically.

```bash
cd ~/BETA_MODEHUS/backend
git pull
nano .env          # add one line:
# CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@cloud_name
```

Then upload the already-shipped local files and repoint the database in one
command:

```bash
python manage.py push_media_to_cloudinary --dry-run --settings=config.settings.pythonanywhere
python manage.py push_media_to_cloudinary --settings=config.settings.pythonanywhere
```

`--dry-run` lists what would upload (no changes); the real run uploads each
`ProductImage` file and stores the Cloudinary public id back into the database.
After it finishes, **Reload** the web app and confirm product images load from
`res.cloudinary.com`.

Two PythonAnywhere-specific gotchas that required code fixes:

- **Django 6 removed `DEFAULT_FILE_STORAGE`** — the media backend is now chosen
  via `STORAGES["default"]` in `config/settings/base.py`.
- **The PA console has no direct internet** — outbound HTTPS goes through the
  `proxy.server:3128` proxy that `curl` uses automatically. The pure-python
  Cloudinary client does not, and it builds its connection pool once at import
  time, so the push command configures the proxy (from `HTTPS_PROXY`) and swaps
  the pool for a proxy manager itself. Running the same command on a machine
  with normal internet needs nothing special.
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
## 26. CI/CD and release process

- **Source of truth** is the `main` branch on GitHub.
- **Backend** is pulled manually on PythonAnywhere and reloaded. There is a
  GitHub Actions workflow (`.github/workflows/ci.yml`) that installs
  requirements and runs the test suite on push, so a red build should block a
  release.
- **Frontend** auto-builds on Vercel from `main`.
- **Commit style**: `type(scope): summary` (e.g. `fix(cart): clamp quantity`).
  Keep commits small and focused.
- Before pushing: `manage.py test` green and `npm run build` clean.

Suggested release flow: branch -> commit -> PR -> CI green -> merge to `main`
-> Vercel deploys -> `git pull` + Reload on PythonAnywhere.
## 27. Troubleshooting and FAQ

**Images are broken on the storefront.**
Check the `/media/` static mapping on PythonAnywhere and confirm `MEDIA_URL` in
`pythonanywhere.py` is absolute (`https://<user>.pythonanywhere.com/media/`).

**CORS error in the browser console.**
The frontend origin is not allowed. Add it to `CORS_ALLOWED_ORIGIN_REGEXES`
(or `CORS_ALLOWED_ORIGINS`) in `pythonanywhere.py`, then Reload.

**Products do not load / empty catalog.**
The database is empty. Seed it (`loaddata` or `seed_catalog`). Note that
`loaddata` needs the explicit path `./catalog_seed.json`.

**Vercel still calls the old API.**
`VITE_API_URL` changed after the last build. Redeploy the newest deployment.

**Payment page is the gold demo page.**
`SIMULATE_PAYMENTS = True`. Set it to `False` once OPay keys are present.

**Checkout says the item is out of stock.**
A variant's stock is zero; the owner must add stock, or the customer must pick
another size/colour.

**Where is the owner login?**
`/backstage` in the storefront, or `/vault/` for the Django admin. The account
needs `is_staff = true`.
## 28. Security and data handling

- **JWT auth** with short-lived access tokens and refresh tokens; the client
  refreshes automatically and clears tokens on logout.
- **Server-side pricing**: totals, shipping and stock are computed on the
  server, so the client cannot change what it owes.
- **Staff-only surfaces**: `/backstage`, `/vault/` and the admin API require
  `is_staff`.
- **Secrets** live in environment variables and are never committed. The repo
  ships `.env.example` templates only. See `SECURITY.md` for the reporting
  policy.
- **Payments** are verified against the provider (signature/webhook) or the
  simulator; an order is only marked paid on a successful verification.
- **Media** is uploaded to the configured storage (local in the demo,
  Cloudinary when configured).

## 29. Roadmap, credentials and licence

**Still needed to go fully live**

| Item | What it unlocks |
|------|-----------------|
| OPay merchant/public/private keys | Real card & transfer payments |
| Gmail app password | Real order emails |
| Cloudinary URL (optional) | Cloud media storage + CDN |
| Paid PythonAnywhere tier (optional) | Always-on API (free tier sleeps) |

**Nice-to-haves**: wishlist, discount codes, SMS/WhatsApp notifications,
invoice PDFs, richer analytics, frontend unit tests.

**Licence**: MIT — see `LICENSE`. Built for BETA_MODEHUS.
## 30. API conventions and pagination

- Base path: `/api/v1/`. All requests and responses are JSON (file uploads use
  `multipart/form-data`).
- Auth header: `Authorization: Bearer <access_token>`. A `401` means the token
  is missing or expired — the client refreshes and retries.
- List endpoints are paginated and return `{ count, next, previous, results }`.
  Pass `?page=2` to move through pages; `page_size` may be supported per view.
- Filter query parameters follow the field names, e.g.
  `/products/?category=agbada&min_price=20000&is_featured=True`.
- Success codes: `200` read/update, `201` create, `204` delete.
- Error codes: `400` invalid input (field errors), `401` unauthenticated,
  `403` not allowed, `404` missing, `409`/`400` business-rule conflicts such as
  insufficient stock.
- Money is returned as decimal strings (e.g. `"45000.00"`); format it in the UI.
## 31. Order and payment lifecycle

```text
Cart -> Place order
  status = pending_payment, payment = pending
        |
        |  pay (OPay checkout or simulator)
        v
  payment = success  ->  status = processing
        |
        |  owner ships
        v
  status = shipped  (tracking number set)
        |
        |  delivered
        v
  status = delivered

Alternatives: payment = failed (customer can retry from the order page),
status = cancelled, status = refunded.
```

Rules:

- Stock is decremented when the order is placed; a failed/cancelled order
  releases it back.
- An order can only be paid while its status is Pending Payment or Failed.
- Only the owner sets Shipped/Delivered and the tracking number.
- Reviews are only attached to a paid order containing the product.
## 32. Email notifications

When email is configured (`EMAIL_HOST_PASSWORD` etc.), the backend sends
transactional emails for order events — order placed, payment received and
status changes — using Django's mail framework and the templates in
`backend/templates/`. In the demo, email is optional: if no password is set,
orders still work and the owner watches `/backstage` instead.
## 33. Command cheat sheet

```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe manage.py runserver 8000
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py makemigrations
.\.venv\Scripts\python.exe manage.py test
.\.venv\Scripts\python.exe manage.py seed_catalog
.\.venv\Scripts\python.exe manage.py createsuperuser

# Frontend
cd frontend
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run preview

# Git
git status
git add <files>
git commit -m "type(scope): summary"
git push
```

On PythonAnywhere the same manage.py commands use
`--settings=config.settings.pythonanywhere` and the venv's `python`.
## 34. Local data reset

To wipe local state and start clean (SQLite + media):

```powershell
cd backend
Remove-Item db.sqlite3 -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force media\products -ErrorAction SilentlyContinue
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_catalog
```

This deletes local orders, users and products only. It never touches production,
Cloudinary, or the checked-in `catalog_seed.json` / `media_seed.zip`.

## 35. Glossary

| Term | Meaning |
|------|---------|
| **Variant** | A specific size/colour of a product, with its own SKU, price and stock |
| **Vault** | The Django admin at `/vault/` |
| **Backstage** | The custom owner dashboard at `/backstage` |
| **Simulated payment** | A local stand-in for OPay used when `SIMULATE_PAYMENTS = True` |
| **Verified purchase** | A review by someone with a paid order for that product |
| **ISR / demo seed** | The generated demo catalog created by `seed_catalog` |
| **PA** | PythonAnywhere, the backend host |
## 36. Support and contacts

- **Store WhatsApp / phone**: see the floating WhatsApp button and the contact
  section in the storefront.
- **Technical owner**: repository maintainer
  (`olasunkamiabdulrasheed@gmail.com`).
- **Security reports**: email rather than opening a public issue.

## 37. Handover checklist

- [ ] Backend reachable: `GET /health/` returns `{"status": "ok"}`.
- [ ] Frontend loads and lists products.
- [ ] Logos and product images render (media mapping correct).
- [ ] Owner can log in at `/backstage`; regular signup works.
- [ ] Add to cart, checkout, pay (simulated) and see the order in `/backstage`.
- [ ] Images load over HTTPS (no mixed-content warnings).
- [ ] CORS allows the live frontend origin.
- [ ] `manage.py test` green and `npm run build` clean.
- [ ] Real OPay/Gmail credentials handed over or documented.
## 38. Performance notes

- Product lists return everything a card needs (`primary_image`, `min_price`,
  `rating`, `is_available`, `total_stock`) so the grid needs only one request.
- Images are `loading="lazy"` with a lightweight fade-in skeleton.
- The catalog, cart and checkout are separate pages, so the first paint stays
  small.
- Server-side totals avoid recomputation and double-spending.
- If traffic grows, move SQLite to Postgres (already supported) and turn on
  Cloudinary for media.

## 39. Accessibility notes

- Skip-to-content link, labelled quantity controls, and semantic headings.
- Colour is never the only signal (stock state has text, not just colour).
- Focus styles on interactive elements; keyboard-operable controls.
- Alt text on product images; `aria-hidden` on purely decorative spinners.
## 40. Extended FAQ

**Can I run this without a credit card?**
Yes — Vercel and PythonAnywhere free tiers, SQLite, local media, and simulated
payments. Total cost: $0.

**Do I need Cloudinary?**
No. Media works from local storage; Cloudinary is optional for a CDN.

**Can the owner use a phone?**
Yes; the storefront and owner console are responsive. Day-to-day work (orders,
stock) is doable on mobile.

**What happens when the free PythonAnywhere app sleeps?**
The first request after a while is slow while it wakes. Upgrading removes this.

**How do I add a new category?**
Create it in the owner/admin and assign products to it.

**Are guest carts supported?**
Yes, and they merge into the account cart on login.
## 41. Project history

Built as a full-stack replacement for a manual Instagram/WhatsApp ordering flow.
The work happened in layers: data models and APIs first, then the storefront,
then the owner console, then payment integration and finally deployment and
hardening (CORS, media, seeding, tests). See `CHANGELOG.md` and
`git log` for the detailed sequence.

Release notes worth knowing:

- Catalog, cart, checkout and orders work end-to-end with simulated payments.
- The owner console covers products, stock, images, orders and reviews.
- The storefront ships with SEO tags, a web manifest, `robots.txt` and a
  sitemap.
- The backend suite covers 60 tests; the frontend builds clean.

## 42. Credits

- **Client**: BETA_MODEHUS — For Better Elegance and Luxury (Ibadan, Oyo State).
- **Built with**: Django & Django REST Framework, React, Vite, Tailwind CSS.
- **Licence**: MIT (see `LICENSE`).
## 43. Data dictionary

**accounts**
- `User`: `email` (login), `full_name`, `phone`, `whatsapp`, plus Django's
  `is_staff` / `is_active` / password hash.
- `Address`: delivery details (`house_number`, `street`, `area`, `city`,
  `state`, `country`, `landmark`, `delivery_instructions`), `is_default`.

**catalog**
- `Category`: `name`, `slug`, `description`, `is_active`, `sort_order`.
- `Brand`: `name`, `slug`, `is_active`.
- `Product`: `name`, `slug`, `category`, `brand`, `short_description`,
  `description`, `specifications` (JSON), `price`, `sku`, `status`, `is_active`,
  `is_featured`.
- `ProductVariant`: `size`, `color`, `color_hex`, `attributes` (JSON), `sku`,
  `price`, `stock`, `is_active`.
- `ProductImage`: `image`, `alt_text`, `is_primary`, `sort_order`, optional
  `variant`.

**cart**
- `Cart`: one per user.
- `CartItem`: `cart`, `variant`, `quantity`.

**orders**
- `Order`: address snapshot, `subtotal`, `shipping_fee`, `total`, `status`,
  `payment_status`, `tracking_number`.
- `OrderItem`: `product_name`, `variant_label`, `sku`, `unit_price`, `quantity`,
  `line_total`.
- `ShippingSetting`: `delivery_fee`, `free_shipping_threshold`,
  `low_stock_threshold`.

**payments** — `Payment`: `reference`, `provider_reference`, `amount`,
`currency`, `status`, `raw_response`.

**reviews** — `Review`: `user`, `product`, optional `order`, `rating`,
`comment`, `status`.

**common** — `ContactMessage`: `name`, `email`, `phone`, `subject`, `message`,
`is_handled`.
## 44. Settings modules

| Module | Use |
|--------|-----|
| `config.settings.base` | Shared settings and env loading |
| `config.settings.dev` | Local development (`DEBUG=True`, SQLite, Vite CORS) |
| `config.settings.prod` | Hardened production defaults |
| `config.settings.pythonanywhere` | The live demo: `DEBUG=False`, `SIMULATE_PAYMENTS=True`, allowed hosts, CORS/CSRF for the Vercel frontend, absolute `MEDIA_URL` |

Select one with `--settings=config.settings.<name>` (or
`DJANGO_SETTINGS_MODULE`). Only `pythonanywhere.py` is tuned for the free demo
host; `prod.py` is the starting point for a real server.
## 45. Known limitations and future work

- PythonAnywhere free tier sleeps when idle; the first request wakes it.
- SQLite in the demo — fine for a showcase, move to Postgres for real traffic.
- No discount codes, wishlists or gift cards yet.
- Emails are sent from a Gmail account; a transactional provider would be more
  reliable at scale.
- The frontend has no automated tests yet.
- Payment is single-provider (OPay); the interface is small enough to add
  others.

## 46. Maintaining this document

Keep this README in sync when you change behaviour:

- New endpoint -> add it to the relevant API section.
- New model/field -> update the data dictionary.
- New env var -> add it to the environment variables table.
- New host or URL -> update Live deployment.
- Any user-visible change -> add a `CHANGELOG.md` entry.

When in doubt, prefer a short accurate section over a long stale one.
## 47. One-page summary

BETA_MODEHUS is a free-to-host, full-stack fashion store. The React storefront
talks only to a Django REST API; the API owns pricing, stock, orders and
payments; the owner runs everything from `/backstage` (or the Django admin at
`/vault/`). In the demo, payment is simulated so the whole order lifecycle works
with no keys and no card. Shipping a change means: commit and push, let Vercel
rebuild the frontend, and on PythonAnywhere `git pull` then Reload. Deeper
detail lives in `docs/`, but this file is the complete, self-contained guide.