# Project Structure

Part 1: Backend. Part 2 (frontend + deploy) is appended below in the file history —
see the end of this file.

## One-line summary

`backend/` is a Django 6.1 + DRF API that owns all business logic. Each folder
below is a Django "app" with a single job; the app that talks to the outside
world (payments/emails) is kept isolated so mistakes never corrupt orders.

```
backend/
├── config/           Django project glue (settings, urls, wsgi/asgi)
│   ├── settings/
│   │   ├── base.py   everything shared (DB, JWT, CORS, OPay, email, throttling)
│   │   ├── dev.py    local development (DEBUG on, SQLite, console email)
│   │   └── prod.py   production (Postgres, HTTPS, Cloudinary, SMTP)
│   └── urls.py       route table: /admin, /api/v1/*, /health/
├── common/           shared bits used everywhere
│   ├── permissions.py    IsAdminUser (staff only)
│   └── pagination.py     StandardPagination (20/page, {count,next,results})
├── accounts/         customers & staff
│   ├── models.py         User (custom, email = username), Address
│   ├── serializers.py    signup / login / me / address
│   └── urls.py           /auth/signup|login|refresh|me|addresses
├── catalog/          the shop window
│   ├── models.py         Category, Brand, Product, ProductVariant, ProductImage
│   ├── serializers.py    product detail with variants + images + stats
│   ├── filters.py        search (name/desc), category, brand, min/max price, featured
│   └── urls.py           /categories, /brands, /products
├── cart/             shopping cart (per authenticated user)
│   ├── models.py         Cart, CartItem
│   ├── services.py       add_item w/ stock caps, merge_guest_items
│   └── urls.py           /cart/ (+ items/<id>/, merge/, clear/)
├── orders/           orders + checkout
│   ├── models.py         Order (status + payment_status), OrderItem, ShippingSetting
│   ├── services.py       create_order_from_cart (transactional), notify_new_order
│   ├── admin_api.py      AdminOrderActionSerializer (ship requires tracking)
│   └── urls.py           /orders/ , /<number>/, /shipping-setting/, /admin/<number>/, /admin/stats/
├── payments/         OPay Checkout integration
│   ├── client.py         OpayClient (create_cashier, query_status, HMAC signing)
│   ├── services.py       create_payment_for_order, mark_payment_success (stock),
│   │                     reconcile_payment (poll + webhook)
│   └── urls.py           /payments/initiate|status|webhook/opay/
├── reviews/          verified-purchase product reviews
│   ├── models.py         Review (pending/approved/rejected)
│   └── urls.py           /reviews/ , /<pk>/moderate/
├── notifications/    transactional email notifications
│   └── service.py        order received, payment confirmed, order status, low stock
├── reports/          (reserved) reporting helpers, stats live under orders/admin/stats
└── templates/emails/ plain-text email templates (order/, admin/)
```

## The Django apps in detail

### common
`IsAdminUser` = `is_staff` check used on all owner-only endpoints
(orders admin, review moderation, shipping settings writes).

### accounts
`User` is a custom model using **email as the login identifier** (no username).
Related: `Address` (snapshotted into orders at checkout so future edits to an
address never rewrite history). JWT access+refresh on signup/login.

### catalog
Product → Variant (size/color/SKU/stock) → Images (variant-aware gallery).
`effective_price` lets a variant inherit the product price when blank.
`primary_image` / `average_rating` are cached caches-backed properties used by
the list serializer — the products endpoint runs in **4 queries** total.

### cart
One cart per user. `add_item` caps quantity at available stock. Guest carts live
in the browser (`localStorage`) and are **merged** into the backend cart on
login via `/cart/merge/`, also capped at stock.

### orders
`create_order_from_cart` validates stock, writes the address snapshot, and
computes totals (free shipping above `free_shipping_threshold`). Crucially it
does **not** decrement stock — that happens only after a confirmed payment.
`ShippingSetting` is a singleton editable from the admin dashboard.

### payments
`client.py` talks to OPay (test or live base URL chosen by `DEBUG`). Signatures
are HMAC-SHA512 over the sorted payload. `mark_payment_success` is the ONLY
place stock is decremented, is wrapped in a transaction, and is idempotent
(calling it twice never double-decrements). Payments are reconciled via OPay's
`/cashier/status` and by the webhook.

### reviews
Customer must be a **verified purchaser** (paid order in processing/shipped/
delivered) to review, and can review each product once. New reviews default to
`pending` for moderation in the dashboard.

### notifications
Every email is best-effort: wrapped in try/except, so a failed email can never
break an order or payment. Console backend in dev; `MAILERS` SMTP for Gmail in
production.

## Where the API routes really live

See `docs/API_REFERENCE.md` for the full table.
---

# Project Structure — Part 2: frontend and deploy

## Frontend (React + Vite + Tailwind v4)

```
frontend/
├── index.html          SPA shell (favicon = real BETA_MODEHUS logo)
├── vite.config.js      dev server + proxies (/api, /media, /health -> 127.0.0.1:8000)
└── src/
    ├── main.jsx        React entry: Router > AuthProvider > CartProvider > App
    ├── App.jsx         route table for every page
    ├── index.css       Tailwind v4 theme tokens (gold/midnight brand palette)
    ├── api/client.js   axios instance, JWT refresh interceptor, currency()
    ├── components/
    │   ├── Layout.jsx      sticky header + footer + <Outlet /> for routes
    │   └── ProductCard.jsx reusable product tiles (home + catalog)
    ├── context/
    │   ├── AuthContext.jsx    user session, login/signup/logout, token persistence
    │   └── CartContext.jsx    cart state; guest localStorage cart auto-merges on login
    └── pages/
        ├── Home.jsx           hero, featured, category cards, USPs
        ├── Catalog.jsx        search + category + sorting + price filter
        ├── ProductDetail.jsx  gallery, size/color picker, add-to-cart, reviews (+ form)
        ├── Cart.jsx           line items, qty steppers, remove, subtotal
        ├── Checkout.jsx       saved-address picker + delivery form -> POST /orders
        ├── Orders.jsx         customer order history
        ├── OrderDetail.jsx    items, address, Pay-now button, status polling
        ├── PaymentCallback.jsx OPay return page, polls /payments/status
        ├── Account.jsx        profile, address book CRUD, recent orders
        ├── Admin.jsx          staff dashboard (Dashboard/Orders/Reviews/Settings tabs)
        ├── Login.jsx / Signup.jsx
        └── NotFound.jsx
```

Spotlight — where data flows:

- **api/client.js** — every request carries `Authorization: Bearer <access>`; a
  401 trigger auto-refreshes via `/auth/refresh/` and retries once. Tokens live
  in `localStorage` under `bm_tokens`.
- **AuthContext** — holds the signed-in user; drives the navbar (Login/Signup vs
  account name + Logout) and the `is_staff` gate on `/admin`.
- **CartContext** — shoppers can add to cart WITHOUT an account (stored in
  `localStorage` under `bm_cart`). On login the guest items are posted to
  `/cart/merge/`, then the backend cart is loaded.
- **Cart badge** — `Layout` shows a live item-count bubble fed by the context.
- **Admin.jsx** — the owner-only dashboard. Guards with `user?.is_staff`; tabs
  call the admin APIs and PATCH/PUT status + settings.

## Deploy assets

```
deploy/
├── betamodehus.service   systemd unit: gunicorn (3 workers, unix socket, logs)
└── nginx.conf            site config: serves frontend/dist, proxies /api /admin
                          /health, static/media, SPA fallback, asset caching
```

`config/settings/prod.py` flips to DEBUG=False, Postgres, HTTPS security headers,
Cloudinary storage and Gmail SMTP. Follow `docs/DEPLOYMENT.md` to go live.
