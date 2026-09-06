# API Reference — part 1: auth and catalog

Base URL: `/api/v1` (dev: `http://127.0.0.1:8000/api/v1/`).

Auth is **JWT Bearer** unless noted. All paginated lists return
`{ count, next, previous, results }` (20 per page).

---

## Auth  — `/auth/*`

### POST /auth/signup/
Create an account (returns tokens immediately).
```json
{ "email": "bola@example.com", "password": "StrongP@ss1", "password2": "StrongP@ss1",
  "full_name": "Bola Ade", "phone": "08012345678" }
```
→ 201 `{ user, access, refresh, message }`

### POST /auth/login/
```json
{ "email": "bola@example.com", "password": "StrongP@ss1" }
```
→ 200 `{ access, refresh, user }`

### POST /auth/refresh/
```json
{ "refresh": "<refresh-token>" }
```
→ 200 `{ access }` (rotation enabled: returns a new refresh too)

### GET /auth/me/  (auth)
→ 200 `{ id, email, full_name, phone, whatsapp, is_staff, date_joined }`

### Addresses (auth)
- `GET /auth/addresses/` → list of the caller's addresses
- `POST /auth/addresses/` → create
- `GET|PUT|PATCH|DELETE /auth/addresses/<id>/`
```json
{ "full_name": "Bola Ade", "phone": "08012345678", "whatsapp": "",
  "house_number": "12", "street": "Awolowo Road", "area": "", "city": "Ibadan",
  "state": "Oyo", "country": "Nigeria", "landmark": "",
  "delivery_instructions": "", "is_default": true }
```

---

## Catalog (public)

### GET /categories/
→ list `{ id, name, slug, product_count }`

### GET /brands/
→ list of active brands

### GET /products/
Query params: `search`, `category` (slug), `brand` (slug), `min_price`, `max_price`,
`is_featured`, `ordering` (`price`, `-price`, `created_at`), `page`.
List item: name, slug, min_price (from variants) / price, primary_image,
average_rating, category, brand, is_in_stock.

### GET /products/<slug>/
Full detail: description, specifications, gallery images (with size/color tags),
active variants (size, color, color_hex, sku, effective_price, stock), ratings.

> The list endpoint is optimized: **4 DB queries** for the entire page regardless
> of product count.