# Checks — verifying every flow works

Run both servers (backend :8000, frontend :5173) as described in the README.
Each check = one long step; mark off until green.

## Customer flows
- [ ] Home loads with hero + featured products (images real)
- [ ] Shop: search "lace", filter a category, sort by price asc/desc
- [ ] Product page: switch colour → gallery updates; add size to cart
- [ ] Add to cart while logged OUT → reload page → cart still full
- [ ] Sign up, log in → guest cart auto-merged (combined, capped at stock)

## Money
- [ ] Checkout with saved address + delivery fee preview → order placed
- [ ] Order shows `pending payment`, stock UNCHANGED
- [ ] Pay via cashier (test keys) → return page polls → order `processing`,
      payment paid, stock decremented exactly once, no negative stock
- [ ] A declined/failed payment leaves order intact; "Pay now" retries

## Orders & reviews
- [ ] Owner dashboard: Dashboard stats match totals; Orders filters work
- [ ] Ship order with tracking → customer sees tracking + email sent
- [ ] Customer (verified purchase) reviews product → shows as `pending`
      in dashboard; approving makes it public on product page
- [ ] Owner can't set delivered without going through processing/shipped

## Admin
- [ ] `/backstage` dashboard rejects non-staff (redirect/login)
- [ ] Django admin at backend `/vault/` edits products, variants, images
- [ ] Shipping setting change affects ONLY new orders

## Production sanity (`python manage.py check` + test suite)
- [ ] `python manage.py test` → 18/18 pass
- [ ] With `DJANGO_SECRET_KEY` env set, server boots on `prod.py` (DEBUG=False)