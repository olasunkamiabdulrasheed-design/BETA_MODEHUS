# Owner's Guide — part 1: running the shop every day

There are TWO management screens. Learn both:

| Screen | URL | What it is for |
| --- | --- | --- |
| **Custom dashboard** | `/backstage` on the store | orders, reviews, settings, stats |
| **Django admin** | backend `/vault/` (Django) | products, variants, images, stock |

## Your daily routine (the short version)

1. Log in with your staff account (email + the password set at seeding).
2. Open the **Dashboard** — check `Awaiting fulfilment` and `Low stock`.
3. Go to **Orders** → open each paid order → **Mark processing**.
4. When you dispatch, **Mark shipped** (enter the tracking number) — a status
   email goes to the customer automatically.
5. When it arrives, **Mark delivered**. Done — money is in your OPay wallet.

## Golden rules

- Stock decreases ONLY after a confirmed payment, exactly once. Never edit stock
  down "for safety" before payment.
- Never change an order that is `delivered`/`cancelled`/`refunded` — it is
  finalised and locked.
- Payment failures are normal with card decline — the customer can tap
  **Pay now** again from their order page.
---

# Owner's Guide — part 2: using the custom dashboard

Open the store frontend and click the person icon → **Admin dashboard** (only
visible/usable for staff accounts).

## Dashboard tab
Read, don't click much:
- **Sales health**: paid order revenue (total + today) — this is money that
  landed in your OPay wallet.
- **Awaiting fulfilment** = paid orders waiting for you to dispatch. Your queue.
- **Low stock** = variants you must restock soon (threshold-driven).
- **Bestsellers** = what to bulk-order next.

## Orders tab — the heart of the store
1. Search bar: type an order number, phone or customer name. Status pills filter
   (e.g. "processing" shows everything you need to ship today).
2. Open an order: see every item (size/colour/price), the customer's address
   snapshot, subtotal, delivery fee, total.
3. Actions:
   - **Processing** — confirm payment arrived; optional.
   - **Shipped** — a tracking number is required; type it, save. Customer is
     emailed automatically with the tracking number.
   - **Delivered** — customer is emailed and invited to review.
   - **Cancel** — only while not finalised.
4. Rules the system enforces for you: can't mark shipped if unpaid, can't change an
   order that's delivered/cancelled/refunded.

## Reviews tab
New reviews appear here first as **pending**. Read them, then Approve (they go
public on the product page) or Reject (they never go public).

## Settings tab
- Delivery fee (flat-rate) and **free delivery above N naira**.
- Instant effect on the storefront; applies to new orders only.

---

# Owner's Guide — part 3: Django admin for products and stock

The backend admin at `http://127.0.0.1:8000/vault/` is where the catalog is
managed. It reappears on your domain at `yourdomain.com/vault/` behind HTTPS.

## Add a product
1. **Add category** / **Add brand** first if the product is new to those.
2. **Products → Add product**: name, description, base price, category, brand,
   tick **Featured** for the homepage carousel, save.
3. In the product page scroll to **Add another Product variant**: pick size and
   colour, set SKU (unique), stock, and optionally a variant-specific price
   (leave blank to inherit the base price). Save.
4. **Add another Product image** per variant/colour so the gallery swaps images
   when the shopper changes colour.

## Edit stock on the fly
Orders → spend a little time each morning:
**Product variants** filter by SKU → update `stock` → save. Stock shown on the
storefront is live; sales decrement it automatically at payment.

## Reading order data
Orders list shows number, customer, total, status, payment_status. Click any
order for items and the address snapshot. Payments shows every payment with the
raw OPay response stored for audit.

## Users & reviews
Users → emails, active flags (deactivate = block account). Reviews → change
status directly if you prefer to moderate here instead of the dashboard.

> Tip: keep the custom dashboard for day-to-day; use Django admin when you need
> to change catalog content or dig into raw records.

## Products tab (new)
The dashboard now manages the catalog too:
- Filter pills: All / Featured / Inactive / Out of stock + search box.
- Each row: image, name + category, price (lowest variant), stock badge (red=0,
  amber=≤ threshold), units sold, status, and one-click **Feature**/**Enable** toggles.
- **Add product** opens the editor: name, category + brand (dropdowns from the
  store), base price, SKU (optional), status, featured/active, description.
- **Edit** opens the same editor plus an inline **variants** panel where you can
  retype stock and price directly on each size/colour — saved on blur. Delete a
  product (blocked if it has orders) or a variant.
- Deep image/gallery management stays in the Django admin.
