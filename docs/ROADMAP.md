# Roadmap & backlog

Everything in Phases 1–17 is shipped (`docs/PROJECT_NOTES.md`). What could come next:

## Nice-to-have (ranked)

1. **Order invoices (PDF)** — generate/download a receipt per order.
2. **Coupons & discount codes** — percentage or amount off, optional min-spend.
3. **Stock-in / restock alerts** — notify the owner in-app, not just low-stock email.
4. **Multi-currency display** — show USD equivalently for diaspora shoppers.
5. **Search suggestions + recent searches** — faster discovery on the Shop page.
6. **Installable PWA** — offline cart + push notifications for order updates.
7. **Google Analytics / Meta pixel** — conversion tracking for ads.
8. **Split-payment (Pay on Delivery)** — mark as COD; workflow already supports
   an order without OPay.

## Before going live (must-do, needs your credentials)

- [ ] OPay LIVE keys + webhook secret in `.env` (`OPAY_CB_URL` set)
- [ ] Gmail SMTP app password in `.env`
- [ ] Real `DJANGO_SECRET_KEY`, Cloudinary URL, Postgres details
- [ ] Follow `docs/DEPLOYMENT.md` and run the `CHECKS.md` checklist