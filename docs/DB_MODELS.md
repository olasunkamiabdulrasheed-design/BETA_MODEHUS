# Database Models — quick overview

All tables are managed automatically by Django migrations (`python manage.py migrate`).

## Accounts
| Model | Key fields |
| --- | --- |
| `User` | email (login), full_name, phone, whatsapp, is_staff, is_active |
| `Address` | full_name, phone, house_number, street, city, state, country, is_default (per user) |

## Catalog
| Model | Key fields |
| --- | --- |
| `Category` | name, slug, description, active, banner image |
| `Brand` | name, slug |
| `Product` | name, slug, description, specifications, price (base), category, brand, is_featured, is_active |
| `ProductVariant` | product FK, size, color, color_hex, SKU (unique), stock, price/effective_price, is_active |
| `ProductImage` | variant FK (optional → gallery-scoped), image URL, alt, sort_order |

## Cart
| Model | Key fields |
| --- | --- |
| `Cart` | user (one per user) |
| `CartItem` | cart FK, variant FK, quantity (capped at stock) |

## Orders
| Model | Key fields |
| --- | --- |
| `Order` | number (unique), user, status (pending_payment/processing/shipped/delivered/cancelled/refunded), payment_status, subtotal, delivery_fee, total, address snapshot, notes |
| `OrderItem` | order FK, product/variant name+image snapshot, size/color, unit_price, quantity |
| `ShippingSetting` | singleton: delivery_fee, free_shipping_threshold |

## Payments
| Model | Key fields |
| --- | --- |
| `Payment` | order FK, reference (unique), amount_kobo, currency, status (pending/paid/failed/refunded), raw_response (JSON audit), paid_at |

## Reviews
| Model | Key fields |
| --- | --- |
| `Review` | product FK, user FK (unique together), rating 1–5, comment, status (pending/approved/rejected), verified_purchase |

## Notes
- Orders copy address + product data **as snapshots**, never live references —
  edits later can't rewrite history.
- Payments store the full OPay payload in `raw_response` for audit/debugging.