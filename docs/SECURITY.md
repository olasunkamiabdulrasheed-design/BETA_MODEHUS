# Security model

## Authentication & sessions
- JWT access (1h) + refresh (7d), rotation with blacklist on every refresh.
- Access never stored server-side; refresh tokens are rotated, so a leaked
  refresh token is useless after its first use.
- All `admin` actions require `IsAdminUser` (`is_staff`).

## Payments (OPay)
- HMAC-SHA512 signature over the alphabetically-sorted JSON payload, verified
  on cashier-status calls and the webhook.
- Amounts compared in kobo — a paid total that differs from the order total is
  REJECTED and logged (`mark_payment_success` raises).
- Webhook is, by design, best-effort: status polling is the source of truth.
- In DEBUG the signature check is lenient; production requires it.

## Stock integrity
- `mark_payment_success` runs in a transaction with `select_for_update`;
  idempotent (a second SUCCESS call does nothing), shortfall is clamped to 0 and
  reported in `raw_response.stock_shortfall` rather than going negative.

## Data & secrets
- `.env` holds all secrets; it is gitignored and mirrored by `.env.example`
  (no real values).
- Production settings fail fast if `DJANGO_SECRET_KEY` is absent.
- HTTPS-only production (HSTS, secure cookies), `SECURE_CONTENT_TYPE_NOSNIFF`,
  `X_FRAME_OPTIONS: DENY`, trusted origins pinned via env.
- API throttling: 100 req/h anonymous, 1000 req/h per user by default.

## Known boundaries
- Rate limits are per-host/user within a single server; a global edge proxy
  (Cloudflare) is recommended at scale.