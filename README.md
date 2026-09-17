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