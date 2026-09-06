# Features — part 1: what customers get

## Browsing
- Home: hero, value props, featured products, category cards.
- Shop: live search, category + brand filters, price bounds, sort (price,
  newest), pagination, and stock badges.

## Product page
- Gallery that swaps images by selected colour, size/colour pickers, live price,
  stock indicator, quantity limits, add-to-cart, WhatsApp order button.

## Cart & checkout
- Guest cart that survives reloads and merges into the account on login.
- Checkout with saved-address one-tap filling, live delivery-fee preview
  (free delivery above the threshold), and a full NG address form.

## Payment (OPay Checkout)
- Order placed → redirected to the secure OPay cashier; payment status polled on
  return; orders stay `pending payment` until confirmed.

## Account area
- Profile, reusable address book (add/delete), order history + totals, order
  detail with Pay-now and tracking number.

## Reviews
- Verified purchasers can rate 1–5 stars + a comment (once per product); pending
  reviews are moderated before becoming public.
---

# Features — part 2: what the owner gets

## Custom dashboard (`/admin`)

- **Dashboard tab** — one-panel snapshot: order counts per status, revenue total +
  today, orders awaiting fulfilment, new customers (30 days), recent orders, low-stock
  variants, bestsellers. All values are server-computed.
- **Orders tab** — full order list with status pills and search (`q` matches order
  number, phone or name; `status` filter), opening any order shows items + address,
  and one-click action buttons: processing → shipped (tracking number required) →
  delivered, or cancel. Final states lock.
- **Reviews tab** — every review, pending first, approve/reject inline.
- **Settings tab** — delivery fee and free-delivery threshold, saved instantly.

## Django admin (`/admin/` on the backend)

- Product manager: create/edit products, variants (size, colour, SKU, price, stock),
  images, categories, brands, featured flags.
- Full view of users, addresses, orders, payments, reviews — read-only convenience
  when you need raw data, with search/filter/export built in.

- **Products tab** — the whole catalog in one table: search + filters (Featured/Inactive/Out of stock),
  price, live stock badge, units sold, one-click Feature/Enable toggles. The editor drawer creates or
  edits a product (name, category, brand, price, SKU, status, description), edits variant stock/price
  inline, and deletes products/variants. Categories and brand lists come from the store itself.
