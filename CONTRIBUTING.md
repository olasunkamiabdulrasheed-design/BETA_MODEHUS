# Contributing

## Setup
- Backend: `cd backend`, create a venv, `pip install -r requirements.txt`,
  copy `.env.example` to `.env`, then `python manage.py migrate` and
  `python manage.py seed_catalog`.
- Frontend: `cd frontend`, `npm install`, copy `.env.example` to `.env.local`,
  then `npm run dev`.

## Before you push
- Backend: `python manage.py test` (must stay green).
- Frontend: `npm run build` (must build clean).

## Commit style
Use `type(scope): summary` — e.g. `feat(cart): show delivery estimate`.
Keep commits small and focused; one concern per commit.

## Conventions
- Don't add comments unless they explain something non-obvious.
- Follow the existing Tailwind design tokens (`midnight-*`, `gold-*`).
- Never commit secrets; use environment variables.
