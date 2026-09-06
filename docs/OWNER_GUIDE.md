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