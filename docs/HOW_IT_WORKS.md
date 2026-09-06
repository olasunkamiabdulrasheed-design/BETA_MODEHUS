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