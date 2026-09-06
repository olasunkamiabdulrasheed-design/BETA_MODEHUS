# FAQ — common owner questions

**Payment failed / customer says they paid but it shows unpaid**
Reconcile via Payments → the customer can tap Pay now; the app asks OPay for the
real status (`/cashier/status`) and, if truly paid, marks the order paid and
decrements stock. Amount mismatches are rejected deliberately — trust the app.

**I changed the delivery fee — old orders stay the same?**
Yes. Orders snapshot their totals (subtotal + fee) at checkout time. The new fee
applies to new orders only.

**Why is stock lower than I expected?**
Stock is decremented at confirmed payment only. It may also be merged from guest
carts at login, so totals reflect real committed sales.

**Can a customer review without buying?**
No — verified purchase only (paid + processing/shipped/delivered), one review
per product, and you moderate everything from the dashboard.

**Email not reaching customers?**
In development they print to the console by design. In production, confirm the
Gmail SMTP app password in `.env`. Emails never block checkout — they are
best-effort.

**Do I need my own hosting?**
Yes — follow `docs/DEPLOYMENT.md` (VPS + nginx + gunicorn + PostgreSQL). OPay
live keys are issued to your registered merchant account; test mode uses the
test keys.