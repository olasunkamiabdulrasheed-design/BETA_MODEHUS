# BETA_MODEHUS — Project Notes (Living Change Log)

Read this file first. Every meaningful change is recorded here with the exact
files touched and the reason, so any developer/AI can reconstruct what has been
done and what remains.

## Phase status

| Phase | Status |
| --- | --- |
| 1 Init / git / docs | In progress |
| 2 Backend foundation | Not started |
| 3 Catalog + seed | Not started |
| 4 Auth / profiles / addresses | Not started |
| 5 Cart | Not started |
| 6 Checkout / orders | Not started |
| 7 OPay payment | Not started |
| 8 Admin orders | Not started |
| 9 Email notifications | Not started |
| 10 Reviews | Not started |
| 11 Search / filtering | Not started |
| 12 Admin dashboard / reports | Not started |
| 13 Frontend foundation | Not started |
| 14 Storefront | Not started |
| 15 Admin UI | Not started |
| 16 Testing | Not started |
| 17 Hardening / deployment | Not started |

---

## Change log

### 2026-09-04 — Phase 2: backend foundation delivered (server running)

**What:** Django project boots, custom user model works, health check returns 200.

**Files added/changed:**
- `backend/requirements.txt` — pinned deps (Django 6.1.1, DRF 3.18.0, SimpleJWT
  5.5.1, django-filter 26.1, django-cors-headers 4.9.0, Pillow, psycopg 3,
  cloudinary, django-cloudinary-storage, python-dotenv).
- `backend/config/` — settings split `base/dev/prod`, `urls.py` w/ health check,
  `manage.py`/`wsgi` default to dev settings.
- `backend/accounts/` — custom `User` (email login, no username), `UserManager`,
  full `Address` model (all checkout delivery fields, default flag), admin.
- `backend/common/` — `StandardPagination`, `IsAdminUser`/`IsOwnerOrReadOnly`.
- `backend/catalog/` — `Category`, `Brand`, `Product`, `ProductVariant`
  (size+color+attrs, own SKU/stock/price, unique per size/color), `ProductImage`
  (variant-linked for color preview). SearchVector removed to stay SQLite-safe.
- `backend/.env.example` — full secret template (OPay/Gmail/Cloudinary/Postgres/JWT).
- Migrations applied for accounts + catalog; `manage.py check` clean.

**Verified:** `python manage.py check` → no issues; `GET /health/` → 200.

**Notes:** pip on this machine could not reach `files.pythonhosted.org`; the
Tencent PyPI mirror (`https://mirrors.cloud.tencent.com/pypi/simple`) is used for
installs. Django 6.1 uses the new `MAILERS` email setting (console in dev, SMTP
in prod).

### 2026-09-04 — Phase 1: project scaffolding + documentation (initial commit)

**What:** Created the repository skeleton and master documentation so that every
subsequent phase has a clear reference and a living record of changes.

**Files added:**
- `.gitignore` — excludes Python/Node artifacts, `.env` secrets, sqlite db,
  media, static collected, editor files.
- `README.md` — project overview, tech stack, layout, quick start, secrets guide.
- `docs/BUILD_PLAN.md` — confirmed business requirements, locked architecture
  decisions, DB model map, API contract, OPay flow, email map, phase list, TBD items.
- `docs/PROJECT_NOTES.md` — this living change log.

**Why:** The master instruction requires documentation-first delivery: capture
confirmed decisions before any code so the implementation does not invent
business rules. Git was initialized on branch `main` (user will provide a remote
so we can push continuously).