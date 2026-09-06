# BETA_MODEHUS — Documentation Index

Start here. Every document is short and answers one question; open the ones you need.

## The essentials

| Document | What it answers |
| --- | --- |
| [../README.md](../README.md) | What is this project, how do I run it locally? |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Where is everything in the codebase? |
| [HOW_IT_WORKS.md](HOW_IT_WORKS.md) | How do cart, payments, stock and emails actually work? |
| [FEATURES.md](FEATURES.md) | What does the store do, end to end? |

## Builders / developers

| Document | What it answers |
| --- | --- |
| [API_REFERENCE.md](API_REFERENCE.md) | Every REST endpoint, request body and response |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Taking the store live (server, nginx, HTTPS) |
| [PROJECT_NOTES.md](PROJECT_NOTES.md) | Full build log / changelog from day one |

## The store owner

| Document | What it answers |
| --- | --- |
| [OWNER_GUIDE.md](OWNER_GUIDE.md) | How to run the shop day-to-day |
| [FAQ.md](FAQ.md) | Common owner questions ("why is stock missing?", "how do invoices work?") |

## Where the code lives

```
backend/     Django API, business logic, payments, admin APIs, tests
frontend/    React storefront (customers + admin dashboard)
deploy/      gunicorn systemd unit + nginx config for production
docs/        these documents
```

## Money / payment flow (read this before anything else)

1. Customer checks out -> order created as `pending_payment`, **stock untouched**.
2. Customer pays on the OPay cashier page.
3. OPay redirects back and fires a webhook; the app confirms status, then:
   - order -> `processing`, payment -> paid;
   - variant stock decreases **exactly once** (idempotent);
   - customer + owner receive emails.
4. Owner advances the order: `processing` -> `shipped` (tracking number required) -> `delivered`.

More detail in [HOW_IT_WORKS.md](HOW_IT_WORKS.md) and [OWNER_GUIDE.md](OWNER_GUIDE.md).