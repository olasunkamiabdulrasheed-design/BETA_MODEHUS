# Changelog

All notable changes to BETA_MODEHUS are recorded here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Change-password endpoint (`POST /api/v1/auth/password/`) and account UI.
- Related products on the product page.
- Low-stock badge driven by the new `total_stock` list field.
- EmptyState, Spinner and shared date helpers in the storefront.
- Back-to-top button and skip-to-content link.
- Per-page titles, Open Graph tags and a web app manifest.
- `/api/v1/health/` alias for the health check.
- Seed command tests; backend suite now 60 tests.

### Changed
- `seed_catalog` honours `MEDIA_ROOT` and works on Django 5.1.
- Admin "Open Django admin" link derives from the API origin.

### Fixed
- Absolute `MEDIA_URL` so product images load behind PythonAnywhere.
- CORS/CSRF origins for `beta-modehus.vercel.app`.

## [0.1.0]
- Initial storefront, catalog, cart, checkout, orders, simulated payments.
