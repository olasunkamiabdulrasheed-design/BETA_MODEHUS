# BETA_MODEHUS — Master Build Plan

Status: **In progress** — Phase 1 of 17 (see `PROJECT_NOTES.md`).

## 1. Confirmed Business Requirements Summary

- **Store:** BETA_MODEHUS — *"For Better Elegance and Luxury."*
- **Type:** Nigerian online fashion/clothing store (web app only; no mobile app).
- **Location:** Ibadan South-East, Oyo State, Nigeria. Country: Nigeria.
- **Currency/Timezone:** NGN (₦) · Africa/Lagos.
- **Contact:** Hotline 08077063971 · WhatsApp 07012124050 ·
  betamodehus@gmail.com (also admin email).
- **Social:** TikTok @beta_modehus01 · Instagram @beta_modehus01.
- **Logo:** placeholder file in frontend; replaceable from
  `frontend/public/logo` (see below).
- **Products:** Clothing only, ~10–15 categories (Agbada, Senator Wear, Kaftan,
  Native Shirts, Native Trousers, Two-Piece, Ankara, Lace, Men's Shirts,
  Trousers, Dresses, Jumpsuits, Hoodies, Jackets, Shorts). Variants = size +
  color (+ configurable attributes), each variant has own SKU & stock.
- **Inventory:** tracked at variant level; decremented only after **verified**
  payment; no overselling; configurable low-stock threshold; "Sold Out" display.
- **Shipping:** nationwide Nigeria; one configurable fixed delivery fee stored in
  admin settings (never hard-coded in frontend); full checkout address fields.
- **Payments:** OPay Checkout, NGN, sandbox first → production later. Backend
  verifies payment + handles webhooks; order marked paid only after verification.
- **Email:** Gmail SMTP via betamodehus@gmail.com (app password). Admin gets
  new-order emails; customers get order/payment/processing/shipped/delivered
  emails + receipt.
- **Cart:** guest cart; account cart persists; merge on login; backend re-validates.
- **Orders:** PENDING_PAYMENT → PROCESSING → SHIPPED → DELIVERED (+ FAILED /
  CANCELLED / REFUNDED). Permanent unique order numbers; historical prices frozen.
- **Reviews:** verified purchases only, no duplicates, admin moderation.
- **Search/filter:** full-text search; filter by category, size, color, brand,
  price, rating, availability; sort by relevance/newest/price/rating/bestselling.
- **Brand/UI:** premium Nigerian fashion feel, elegant + luxury, responsive,
  configurable branding (logo/colors/slogan/contact via admin settings).

## 2. Architecture Decisions (locked)

| Decision | Choice | Reason |
| --- | --- | --- |
| DB | PostgreSQL (prod), SQLite (dev) | Postgres TBD on deployment; SQLite zero-setup local dev; Postgres-only features (full-text search) guarded. |
| Auth | JWT access/refresh via simplejwt | Stateless, standard. |
| Users | Custom user model (email as username) | Required before first migration; role flag for one admin. |
| Payments | OPay Checkout REST API | Per requirements; backend-verified, idempotent webhooks. |
| Email | Django SMTP → Gmail | Owner-selected; env-managed app password; volume-limited (documented). |
| Files | Cloudinary primary | Per requirements; no S3/Firebase without concrete reason. |
| Async | None (no Celery/Redis) | Scale does not justify infrastructure; emails sent after commit. |
| Search | Django full-text (Postgres) / icontains fallback (SQLite) + django-filter | Small catalogue; no Elasticsearch. |
| Frontend | React + Vite + JS + Tailwind + Axios + React Router | Standard, fast dev. |
| Money | Decimal everywhere, `max_digits`, NGN (no float) | Financial integrity. |
| Stock | Decrement after verified payment; `select_for_update` + transaction | Prevent overselling. |
| Orders | DB transaction, idempotent creation | Keep order/payment integrity. |

## 3. Database Model Relationship Map

```
User (custom, email login, is_staff=admin)
 └ Address (1:N user, full Nigerian delivery fields, default flag)
Category (1:N self for nesting optional)
Brand (optional)
Product (category N:1, brand N:1)
 ├ ProductVariant (N:1 product; size, color, attribute, SKU, price?, stock)
 │   └ where price on variant == 0 -> inherit product price
 ├ ProductImage (N:1 product; or variant image for color preview)
 ├ Review (N:1 product; 1:1 verified via OrderItem)
Cart (1:1 user) ─ CartItem (N:1 cart) → variant + qty
ShippingSetting (singleton: delivery fee, free-shipping threshold, low-stock threshold)
Order (user, number unique, status, payment_status, totals, address snapshot FK)
 └ OrderItem (product, variant snapshot, name, sku, unit price, qty, line total)
Payment (order, provider ref, amount, status, attempts, raw webhook)
NotificationLog (audit: who/sent/what)
```

## 4. API Contract (v1)

Public:
- `GET /api/v1/products/` (list + filter + sort + search)
- `GET /api/v1/products/{slug}/` (detail + variants + images + reviews)
- `GET /api/v1/categories/`, `GET /api/v1/brands/`
- `POST /api/v1/auth/signup/`, `POST /api/v1/auth/login/`,
  `POST /api/v1/auth/refresh/`
- Cart (guest): `GET/POST/PATCH/DELETE /api/v1/cart/`

Authenticated customer:
- `GET/PATCH /api/v1/account/me/`, addresses CRUD
- Checkout: `POST /api/v1/orders/`
- `GET /api/v1/orders/`, `GET /api/v1/orders/{number}/`
- Payment: `POST /api/v1/payments/initiate/`,
  `GET /api/v1/payments/{ref}/status/`
- Reviews: `POST /api/v1/products/{slug}/reviews/` (verified only)

Admin (+ header `X-Is-Admin` role / staff permission):
- Full CRUD products/categories/brands/variants/images
- `GET/PATCH /api/v1/admin/orders/`, status transitions
- `GET /api/v1/admin/reports/...`, `GET /api/v1/admin/dashboard/`
- `GET /api/v1/admin/reviews/` moderation
- Settings: `GET/PUT /api/v1/admin/settings/`
- Webhook (public but signature-verified): `POST /api/v1/webhooks/opay/`

## 5. OPay Payment Flow (trusted)

1. `POST /payments/initiate/` → backend creates Order + Payment record.
2. Backend creates OPay transaction via OPay Checkout API (server calls,
   sandbox = `testapi.opaycheckout.com`, live = `liveapi.opaycheckout.com`).
3. Frontend redirects customer to OPay hosted checkout. NEVER trusts this alone.
4. OPay redirect calls back `?reference=...`; customer sees pending.
5. Backend verifies transaction server-side with OPay (amount + currency +
   reference match). Only success → order `PAID`, stock decremented.
6. Webhook `POST /webhooks/opay/` — signature validated, idempotent
   (per provider reference), updates states safely.

Secrets live in `.env`; exact env-variable list documented in `backend/.env.example`.

## 6. Email Notification Map

| Event | Recipient | Content |
| --- | --- | --- |
| Order placed + paid | Admin (betamodehus@gmail.com) | Customer, items, qty, prices, total, address, phone/WhatsApp, shipping |
| Order confirmation | Customer | Order number, summary, receipt/ticket |
| Payment confirmation | Customer | Receipt + payment reference |
| Processing / Shipped | Customer | Status update + shipping info |
| Delivered | Customer | Delivery confirmation + review invitation |

## 7. Build Phases

Phase 1 Init/git/docs (in progress) · 2 Backend foundation · 3 Catalog ·
4 Auth/profiles/addresses · 5 Cart · 6 Checkout/orders · 7 OPay · 8 Admin orders ·
9 Email notifications · 10 Reviews · 11 Search/filter · 12 Admin dashboard/reports ·
13 Frontend foundation · 14 Storefront · 15 Admin UI · 16 Testing · 17 Hardening/deploy.

Each completed phase = commit + push + `PROJECT_NOTES.md` update.

## 8. Missing / TBD Items

- OPay merchant account & credentials (add via `.env` when available).
- Gmail app password for SMTP.
- Real product photos (replace placeholder/seed images from admin).
- Real logo file (replace `frontend/public/logo/beta_modehus-logo.svg`).
- GitHub remote (user creating repo; push starts once remote is provided).
- Exact deployment host (recommendation pending final phase).