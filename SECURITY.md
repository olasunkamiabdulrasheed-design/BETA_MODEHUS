# Security Policy

## Reporting a vulnerability
Please email **olasunkamiabdulrasheed@gmail.com** with details and steps to
reproduce. Do not open a public issue for security problems.

## Scope
- Django API (`backend/`) and the deployed instance on PythonAnywhere.
- React storefront (`frontend/`) and the deployed instance on Vercel.

## Notes for this deployment
- The demo runs with `SIMULATE_PAYMENTS = True`; no real card data is handled.
- Never commit `.env` files or API keys. The repository only ships
  `.env.example` templates.
- Server-side secrets belong in `config/settings/pythonanywhere.py` or the
  hosting dashboard's environment variables.
