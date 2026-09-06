# How It Works — part 1: auth and the cart

## Authentication (JWT)

1. `AuthContext` keeps the signed-in user; tokens (`bm_tokens`) persist in localStorage.
2. Every API call sends `Authorization: Bearer <access>` via the axios interceptor.
3. On a 401 the interceptor silently refreshes with `/auth/refresh/` (rotation ON,
   old refresh tokens are blacklisted) and retries the request once.
4. Logout locally clears tokens AND the merged backend cart stays intact server-side.

## The cart: guest first

- A shopper who is NOT logged in still gets a working cart. Items + quantities are
  saved in `localStorage` (`bm_cart`), capped at available stock.
- On login (or signup→login), `CartProvider` posts the guest items to
  `/cart/merge/`; the backend merges them (re-capping at stock, combining duplicates)
  and returns the server cart, which then takes over.
- The header cart badge always shows the live total across guest/server states.

## Size/color and stock

- A product = many variants (size × color × SKU × stock).
- The product page only allows adding a variant that is active and in stock; the
  server ALSO re-checks stock on every add/quantity change — the client never
  overrides the server.
---

# How It Works — part 2: checkout, payment engine, and returns on money

## Checkout (backend flow)

1. `POST /orders/` validates the address, then `create_order_from_cart` runs in a
   **transaction**: re-validates variant stock, writes the address snapshot,
   copies product name/images into `OrderItem` (history-proof), computes
   subtotal + delivery fee (free ≥ threshold) and stores the total.
2. The cart is emptied and the order is `pending_payment`. **Stock is untouched.**

## Payment engine

1. `POST /payments/initiate/` builds a Payment (`reference`, amount in **kobo**),
   signs the payload (HMAC-SHA512) and calls OPay Checkout's cashier API to get
   `cashier_url`.
2. The frontend redirects the customer. They pay on OPay's page.
3. On return, `PaymentCallback.jsx` polls `GET /payments/status/` until resolved.
4. OPay ALSO sends `POST /webhook/opay/` (signature verified, amount compared in
   kobo). Both reconciliation paths converge on the SAME function:
   `mark_payment_success`, which — inside a transaction with row locks — flips the
   order to `processing`/payment paid and decrements stock **exactly once**.
5. Paid → emails go out (customer confirmation + owner alert). Idempotency +
   `select_for_update` guarantee no double decrement even if webhook & poll race.

## Why stock only after payment

No money, no stock movement — this keeps "cancelled/reserved" carts from eating
inventory and keeps the low-stock signal honest. Refunds set payment → `refunded`
and leave fulfilled units alone (stock policy is FIFO-manual).

---

# How It Works — part 3: emails, reviews, admin dashboard

## Emails (best-effort, never blocks)

`notifications/service.py` sends plain-text email from `templates/emails/`:

| Trigger | To | Content |
| --- | --- | --- |
| Order placed (unpaid) | customer | order received, Pay now link |
| Payment confirmed | customer + owner | items, total, next step |
| Shipped | customer | tracking number |
| Delivered | customer | thanks + review invite |
| Low stock | owner | variants under threshold |

Every send is wrapped in try/except — a mail outage never breaks checkout.
Dev prints to console; production uses Gmail SMTP via `MAILERS`.

## Reviews

Verified purchase check: review allowed only for users with a `processing`/
`shipped`/`delivered` paid order containing that product (one review per
user×product). New reviews are `pending` until the dashboard moderates.

## Admin dashboard (frontend `/admin`, staff only)

- **Dashboard tab**: `order_counts`, revenue (total/today), awaiting fulfilment,
  new customers (30d), recent orders, low stock, bestsellers — served by
  `/orders/admin/stats/` in 1–2 queries.
- **Orders tab**: all orders with `status` + `q` filters; advance actions with the
  tracking-number rule enforced server-side.
- **Reviews tab**: pending first; approve/reject from the list.
- **Settings tab**: read/write `shipping-setting` (delivery fee + free threshold).
