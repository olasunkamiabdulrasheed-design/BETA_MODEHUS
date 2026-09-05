# BETA_MODEHUS — Project Notes (Living Change Log)

Read this file first. Every meaningful change is recorded here with the exact
files touched and the reason, so any developer/AI can reconstruct what has been
done and what remains.

## Phase status

| Phase | Status |
| --- | --- |
| 1 Init / git / docs | Done |
| 2 Backend foundation | Done |
| 3 Catalog + seed | Done |
| 4 Auth / profiles / addresses | Done |
| 5 Cart | Done |
| 6 Checkout / orders | Done |
| 7 OPay payment | Done |
| 8 Admin orders | Done |
| 9 Email notifications | Done |
| 10 Reviews | Done |
| 11 Search / filtering | Done |
| 12 Admin dashboard / reports | Not started |
| 13 Frontend foundation | Done (storefront pages continue in Phase 14) |
| 14 Storefront | Not started |
| 15 Admin UI | Not started |
| 16 Testing | Not started |
| 17 Hardening / deployment | Not started |

---

## Change log

### 2026-09-04 — Phase 2: backend foundation delivered (server running)

**What:** Django project boots, custom user model works, health check returns 200.

**Files added/changed:**
- `backend/requirements.txt` — pinned deps (Django 6.1.1, DRF 3.18.0, SimpleJWT
  5.5.1, django-filter 26.1, django-cors-headers 4.9.0, Pillow, psycopg 3,
  cloudinary, django-cloudinary-storage, python-dotenv).
- `backend/config/` — settings split `base/dev/prod`, `urls.py` w/ health check,
  `manage.py`/`wsgi` default to dev settings.
- `backend/accounts/` — custom `User` (email login, no username), `UserManager`,
  full `Address` model (all checkout delivery fields, default flag), admin.
- `backend/common/` — `StandardPagination`, `IsAdminUser`/`IsOwnerOrReadOnly`.
- `backend/catalog/` — `Category`, `Brand`, `Product`, `ProductVariant`
  (size+color+attrs, own SKU/stock/price, unique per size/color), `ProductImage`
  (variant-linked for color preview). SearchVector removed to stay SQLite-safe.
- `backend/.env.example` — full secret template (OPay/Gmail/Cloudinary/Postgres/JWT).
- Migrations applied for accounts + catalog; `manage.py check` clean.

**Verified:** `python manage.py check` → no issues; `GET /health/` → 200.

**Notes:** pip on this machine could not reach `files.pythonhosted.org`; the
Tencent PyPI mirror (`https://mirrors.cloud.tencent.com/pypi/simple`) is used for
installs. Django 6.1 uses the new `MAILERS` email setting (console in dev, SMTP
in prod).

### 2026-09-04 — Phase 1: project scaffolding + documentation (initial commit)

**What:** Created the repository skeleton and master documentation so that every
subsequent phase has a clear reference and a living record of changes.

**Files added:**
- `.gitignore` — excludes Python/Node artifacts, `.env` secrets, sqlite db,
  media, static collected, editor files.
- `README.md` — project overview, tech stack, layout, quick start, secrets guide.
- `docs/BUILD_PLAN.md` — confirmed business requirements, locked architecture
  decisions, DB model map, API contract, OPay flow, email map, phase list, TBD items.
- `docs/PROJECT_NOTES.md` — this living change log.

**Why:** The master instruction requires documentation-first delivery: capture
confirmed decisions before any code so the implementation does not invent
business rules. Git was initialized on branch `main` (user will provide a remote
so we can push continuously).

### 2026-09-05 — Phases 5-7: cart, checkout, OPay payment — full verified flow

**What:** Built the complete purchase flow end-to-end: authenticated cart
management, checkout order creation, OPay Cashier integration, and graceful
payment-error handling. Smoke tested: signup → add-to-cart → checkout → order
created (with shipping fee) → payment initiation → correct error when OPay not
configured.

**Files added/changed:**
- `backend/cart/serializers.py`, `cart/services.py`, `cart/views.py`, `cart/urls.py`
  — authenticated CartView (GET/POST), CartItemUpdateView (PATCH qty), CartItemRemoveView
  (DELETE), MergeGuestCartView (POST), ClearCartView (POST); services handle stock
  validation, caps at available stock; merge_guest_items caps at stock.
- `backend/orders/services.py` — `create_order_from_cart()`: transactional, uses
  `select_for_update` on variants to prevent race conditions, validates availability,
  snapshots address, applies `ShippingSetting.get()` delivery fee (free if subtotal
  meets `free_shipping_threshold`); stock NOT decremented here (deferred to verified
  payment only).
- `backend/orders/serializers.py`, `orders/views.py`, `orders/urls.py` —
  `CheckoutSerializer` (nested AddressSerializer → saves/uses address, calls service),
  `OrderSerializer` (list/detail with nested items + address), `OrderListCreateView`,
  `OrderDetailView`, `ShippingSettingView` (admin-only singleton).
- `backend/payments/client.py` — `OpayClient` against OPay Cashier OpenAPI v1:
  `create_cashier()` (bearer = public key), `query_status()` (bearer = HMAC-SHA512
  of sorted-JSON payload signed with private key). Full spec followed: amounts in kobo,
  responses parsed, errors raised as `OpayError`.
- `backend/payments/services.py` — `create_payment_for_order()` (creates/queries OPay,
  stores `cashierUrl`), `mark_payment_success()` (idempotent: flips payment + order,
  decrements variant stock via `select_for_update`; on stock shortfall clamps to 0 and
  logs flag in `raw_response["stock_shortfall"]` — pragmatic admin-alert choice),
  `reconcile_payment()` (calls OPay status, applies result).
- `backend/payments/views.py` — `InitiatePaymentView` (POST, auth), `PaymentStatusView`
  (GET, auth, reconciles live), `opay_webhook()` (POST AllowAny, optional HMAC
  signature verification, idempotent status mapping).
- `backend/payments/urls.py` — `/payments/initiate/`, `/payments/status/`, `/payments/webhook/opay/`
- `backend/config/urls.py` — wired `cart.urls`, `orders.urls`, `payments.urls` under `/api/v1/`.
- `backend/config/settings/base.py` — added `OPAY_PRIVATE_KEY` env var.
- `backend/.env.example` — added `OPAY_PRIVATE_KEY` line, clarified public vs private key.
- `backend/orders/models.py` — `ShippingSetting.get()` now seeds `delivery_fee` from
  `settings.DEFAULT_SHIPPING_FEE` on first creation (singleton).
- `docs/PROJECT_NOTES.md` — updated phase status table; this entry.

**Verified (smoke test against live runserver):**
- `POST /api/v1/auth/signup/` → 201 with tokens
- `GET  /api/v1/products/` → 200 list; `GET /api/v1/products/{slug}/` → 200 with variants
- `POST /api/v1/cart/` (variant_id, qty) → 200 cart with 2 items, subtotal 36000
- `POST /api/v1/orders/` (nested address) → 201 order BM-*, shipping ₦3,000, total ₦39,000, pending_payment
- `GET  /api/v1/orders/{number}/` → 200
- `GET  /api/v1/cart/` → 200 empty (0 items) after checkout
- `POST /api/v1/payments/initiate/` → 502 graceful error when OPay creds absent (expected)

**Notes:** OPay credentials (merchant ID, public key, private key, webhook secret) must
be added to `.env` before live testing. Amounts are in kobo for OPay (`total * 100`).
Stock decrement only happens inside `mark_payment_success` after successful reconciliation.
`DEFAULT_SHIPPING_FEE` env value (₦3,000) is used as the initial delivery fee for
the `ShippingSetting` singleton; admin can override from admin UI.

### 2026-09-05 — Phases 8-10: admin order actions, email notifications, reviews

**What:** Added the remaining commerce back-office pieces: admin order status
transitions with email alerts, customer + admin email templates via the Django
MAILERS console/SMTP backends, and a verified-purchase-only reviews API with
admin moderation.

**Files added/changed:**
- `backend/orders/models.py` — added `Order.is_finalized` property (delivered/cancelled/refunded).
- `backend/orders/admin_api.py` — `AdminOrderActionSerializer` (validates action,
  requires tracking number for shipping, blocks finalized orders).
- `backend/orders/views.py` — `AdminOrderActionView` (PATCH by order number, applies
  status + tracking, sends status email). Fixed a broken import line from an earlier edit.
- `backend/orders/urls.py` — `admin/<str:number>/` route.
- `backend/orders/services.py` — `notify_new_order()` (customer + admin emails, called
  outside the checkout transaction so mail failure never rolls back an order).
- `backend/orders/serializers.py` — `CheckoutSerializer.create` calls `notify_new_order()`.
- `backend/notifications/service.py` — mail helpers with try/except (email failures logged,
  never break order/payment flow); customer: order placed, payment confirmed, status update,
  payment failed; admin: new order, low stock alert.
- `backend/templates/emails/order/*.txt` — 4 customer plain-text templates.
- `backend/templates/emails/admin/*.txt` — 2 admin plain-text templates.
- `backend/payments/services.py` — `mark_payment_success` now sends payment-confirmed email,
  checks low stock (per `ShippingSetting.low_stock_threshold`) and alerts admin.
- `backend/reviews/serializers.py`, `reviews/views.py`, `reviews/urls.py` — public
  approved-reviews list (filter by product), create restricted to verified purchasers
  (paid + processing/shipped/delivered), `get_or_create` duplicate guard, `PATCH
  /<pk>/moderate/` for admin (approve/reject).
- `backend/config/urls.py` — wired `reviews.urls` under `/api/v1/reviews/`.
- `docs/PROJECT_NOTES.md` — updated phase status table; this entry.

**Verified (live server):**
- Admin login 200; admin orders list 200 (3 orders); `PATCH /orders/admin/{n}/`
  `{"action":"shipped","tracking_number":"TRACK-123"}` → 200 status shipped; shipping
  without tracking → 400 (enforced); repeated on final states → blocked.
- `GET /reviews/?product=1` → 200; `GET /orders/shipping-setting/` → 200 ₦3,000.
- Checkout emails fire: customer "Order received" + admin "New order" rendered by the
  console backend (dev) with correct order items/totals/address.
- Full customer flow re-verified end-to-end (signup → cart → checkout → payment
  graceful 502 without OPay keys).

**Notes:** Create a `smokeadmin` staff user before testing admin endpoints. OPay webhook
verification uses a signature header when present; in debug mode unsigned callbacks are
accepted so local testing works.

### 2026-09-05 — Phase 13: frontend foundation (Vite + React + Tailwind) + catalog performance

**What:** Scaffolded the storefront web app with full BETA_MODEHUS branding and
fixed a major products-API performance problem (32 SQL queries per page → 4).

**Files added/changed (frontend):**
- `frontend/package.json`, `package-lock.json`, `vite.config.js` (dev proxy /api →
  127.0.0.1:8000), `index.html` (SEO title/description), `public/logo.svg`
  (replaceable placeholder logo).
- `frontend/src/index.css` — Tailwind v4 `@theme` with brand tokens (gold/midnight
  palette, display serif), utility classes (`.btn-gold`, `.input-bm`, `.container-bm`).
- `frontend/src/main.jsx` — mounts app inside `BrowserRouter` + `AuthProvider`.
- `frontend/src/api/client.js` — axios instance, JWT request header, silent token
  refresh on 401 (`/auth/refresh/`), `currency()` NGN formatter.
- `frontend/src/context/AuthContext.jsx` — login/signup/logout + session restore.
- `frontend/src/App.jsx`, `components/Layout.jsx` — header (logo, nav, auth links,
  admin link for staff), footer (contact/social/location), gold accent bar.
- `frontend/src/pages/Home.jsx` — hero, USP strip, featured grid, category cards.
- `frontend/src/pages/Catalog.jsx` — search box, category dropdown, sort dropdown.
- `frontend/src/pages/ProductDetail.jsx` — size/color selection (variant-aware color
  chips + gallery image swap), quantity, add-to-cart, WhatsApp order, reviews list.
- `frontend/src/pages/Login.jsx`, `Signup.jsx`, `NotFound.jsx`.

**Backend performance (files: `catalog/views.py`, `catalog/serializers.py`, `catalog/filters.py`):**
- `select_related("category","brand")` — removes 2 FK queries per product.
- `Prefetch("images", ...ordered)` + `Prefetch("variants", is_active sorted by price)`
  — removes image + variants queries per product (was hitting `is_available`,
  `min_price` properties which each re-queried).
- Review rating/rating_count now annotated via `Subquery(Avg/Count)` instead of a
  per-product aggregate.
- Added `is_featured` filter (was being silently ignored by the Home page).
- Verified: products list went from **32 queries to 4**, `min_price`/`is_available`
  fixed (seed variants have NULL price that inherits product price via
  `effective_price`).
- `reviews/views.py` — list filter accepts product slug or id.

**Verified:** `npm build` clean; combined stack runs (backend :8000, Vite :5173,
proxy works); `/health/` ok; products through proxy ~1.1s first-hit (Vite prebundles
deps on first request — subsequent loads are cached and fast).

**Notes:** Dev servers run `python manage.py runserver :8000` and `npm run dev`
(Frontend must be reached via `http://localhost:5173`, not `127.0.0.1`, because
Vite binds `::1`). Vite first-request latency is a dev-only cost; the production
build (`npm run build`) serves the prebuilt 242 kB JS bundle.