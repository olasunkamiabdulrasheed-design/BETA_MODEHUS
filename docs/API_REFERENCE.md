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
---

# API Reference — part 2: cart and orders

## Cart (auth)

### GET /cart/
→ `{ items: [{id, variant {product,product_name,image,size,color,price}, quantity, line_total}], subtotal, item_count }`

### POST /cart/items/
```json
{ "variant": 12, "quantity": 2 }
```
→ 201 (with the cart); quantity capped at available stock; duplicates merge.

### POST /cart/merge/
```json
{ "items": [ { "variant": 4, "quantity": 1 }, { "variant": 9, "quantity": 3 } ] }
```
Called automatically after login with the guest cart from localStorage.

### PATCH /cart/items/<id>/ — `{ "quantity": 3 }`
### DELETE /cart/items/<id>/ — removes line
### POST /cart/clear/ — empties the cart (used after successful checkout)

## Orders (auth)

### POST /orders/
```json
{ "address": 5, "notes": "Call before delivery" }
```
Uses the saved address (snapshot) → computes subtotal, delivery fee (free above
threshold) → creates order + items in a transaction → **no stock change** → 201
`{ number, total, delivery_fee, payment_status: "pending" }`.

### GET /orders/ → the caller's orders (newest first, paginated)
### GET /orders/<number>/ → detail incl. items, address snapshot, status history

### Public shipping settings (no auth)
`GET /orders/shipping-setting/` → `{ delivery_fee, free_shipping_threshold }` —
drives the live fee/subtotal preview before login/orders.

---

# API Reference — part 3: payments and reviews

## Payments

### POST /payments/initiate/  (auth, order owner)
```json
{ "order_number": "BM-20260906-XXXX" }
```
Creates/reuses a Payment for the order, returns:
```json
{ "payment_reference": "BM-...", "cashier_url": "https://cashier.opayweb.com/...",
  "amount": "14500.00", "currency": "NGN", "order": { "number": "...", "total": 14500 } }
```
Frontend redirects the browser to `cashier_url`. Needs OPay keys in `.env`;
without them → graceful `502`.

### GET /payments/status/?reference=<ref>  (auth, order owner)
Polls OPay `/cashier/status` → `{ status: "pending"|"paid"|"failed", payment_status, order_status, amount_kobo, paid_amount_kobo }`.
On `paid`: verifies amount == order total (kobo), then `mark_payment_success`.

### POST /payments/webhook/opay/  (signature-protected)
OPay notifies the app; the handler verifies the HMAC signature (lenient DEBUG,
strict production), fetches the real status and reconciles. Return `200` always.

## Reviews

### GET /reviews/?product=<id>&status=approved  (public)
→ paginated approved reviews with user name, rating, comment, verified_purchase.

### POST /reviews/  (auth, verified purchaser)
```json
{ "product": 12, "rating": 5, "comment": "..." }
```
→ 201 as `pending`. One per product; only paid+fulfilled customers.

### POST /reviews/<id>/moderate/  (staff)
```json
{ "action": "approve" | "reject" }
```
Sets public visibility; `pending` list for staff shows everything first.

---

# API Reference — part 4: owner (staff) endpoints

Every endpoint here requires a logged-in **staff** user (`IsAdminUser`).

## Orders admin

### GET /orders/admin/stats/
Dashboard numbers without drilling down:
```json
{ "order_counts": { "total": 120, "pending_payment": 3, "processing": 5, "shipped": 8,
    "delivered": 100, "cancelled": 2, "refunded": 2 },
  "revenue": { "total": "1425000.00", "today": "25000.00", "paid_orders": 113 },
  "pending_fulfillment": 5,
  "new_customers_30d": 17,
  "recent_orders": [ { "number": "...", "customer": "...", "status": "...", "total": "..." } ],
  "low_stock": [ { "name": "...", "variant": "...", "stock": 2 } ],
  "bestsellers": [ { "name": "...", "units_sold": 14, "revenue": "..." } ] }
```

### GET /orders/admin/   (all orders)
Query params on the regular order list for staff: `status=<pipeline>`,
`q=<order-number|phone|customer name>`, `page`. Non-staff never sees this.

### PATCH /orders/admin/<number>/  — advance the pipeline
```json
{ "action": "mark_processing" | "mark_shipped" | "mark_delivered" | "cancel" }
```
- `mark_shipped` REQUIRES `{ "tracking_number": "..." }` — validates before saving.
- Final states (delivered/cancelled/refunded) are locked; further changes rejected
  with 400. Shipping a `pending_payment` order is rejected.

## Reviews admin
`GET /reviews/?status=pending` (staff see all) + `POST /reviews/<id>/moderate/`
as described in part 3.

## Settings
### GET /orders/shipping-setting/  (everyone, read-only)
### PUT /orders/shipping-setting/  (staff)
```json
{ "delivery_fee": 3000, "free_shipping_threshold": 100000 }
```
Applies to new orders only.

---

# API Reference — part 5: copy-paste curl samples

```bash
BASE=http://127.0.0.1:8000/api/v1

# sign up → tokens
curl -X POST $BASE/auth/signup/ -H "Content-Type: application/json" \
  -d @- <<'EOF'
{ "email": "bola@example.com", "password": "StrongP@ss1", "password2": "StrongP@ss1",
  "full_name": "Bola Ade", "phone": "08012345678" }
EOF

# public catalog (no auth needed)
curl "$BASE/catalog/products/?search=lace&ordering=-price"

# add to cart (auth: header below)
TOKEN=<access-token>
curl -X POST $BASE/cart/items/ -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d "{\"variant\": 12, \"quantity\": 2}"

# checkout → new order
curl -X POST $BASE/orders/ -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d "{\"address\": 5}"

# pay (returns cashier URL to open in a browser)
curl -X POST $BASE/payments/initiate/ -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d "{\"order_number\": \"BM-…\"}"

# staff: dashboard stats
curl "$BASE/orders/admin/stats/" -H "Authorization: Bearer $ADMIN_TOKEN"

# staff: ship an order (tracking required)
curl -X PATCH $BASE/orders/admin/BM-…/ -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"mark_shipped\", \"tracking_number\": \"GT03…\"}"
```
