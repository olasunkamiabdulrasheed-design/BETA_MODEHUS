# Owner's Guide — part 1: running the shop every day

There are TWO management screens. Learn both:

| Screen | URL | What it is for |
| --- | --- | --- |
| **Custom dashboard** | `/admin` on the store | orders, reviews, settings, stats |
| **Django admin** | backend `/admin/` (Django) | products, variants, images, stock |

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
