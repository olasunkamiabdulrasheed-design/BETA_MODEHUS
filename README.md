# BETA_MODEHUS

> **For Better Elegance and Luxury** — a complete Nigerian fashion e-commerce
> platform: a customer storefront, a full REST API, and an owner dashboard.

This is the single document to read if you want to understand what the project
is, how it is put together, how money and orders flow through it, and how to run
and deploy it. Every section below can be read on its own.

---

## Contents

1. [Live deployment](#1-live-deployment)
2. [Technology stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Repository structure](#4-repository-structure)
5. [Storefront features](#5-storefront-features)
6. [Owner console features](#6-owner-console-features)
7. [Backend applications](#7-backend-applications)
8. [Data model](#8-data-model)
9. [Authentication and roles](#9-authentication-and-roles)
10. [API reference — catalog](#10-api-reference--catalog)
11. [API reference — cart](#11-api-reference--cart)
12. [API reference — orders](#12-api-reference--orders)
13. [API reference — payments](#13-api-reference--payments)
14. [API reference — reviews and contact](#14-api-reference--reviews-and-contact)
15. [API reference — owner/admin endpoints](#15-api-reference--owneradmin-endpoints)
16. [Local setup — backend](#16-local-setup--backend)
17. [Local setup — frontend](#17-local-setup--frontend)
18. [Environment variables](#18-environment-variables)
19. [Seeding and demo data](#19-seeding-and-demo-data)
20. [Testing](#20-testing)
21. [Owner workflow — products and inventory](#21-owner-workflow--products-and-inventory)
22. [Owner workflow — orders and fulfilment](#22-owner-workflow--orders-and-fulfilment)
23. [Customer workflow](#23-customer-workflow)
24. [Deployment — backend on PythonAnywhere](#24-deployment--backend-on-pythonanywhere)
25. [Deployment — frontend on Vercel](#25-deployment--frontend-on-vercel)
26. [CI/CD and release process](#26-cicd-and-release-process)
27. [Troubleshooting and FAQ](#27-troubleshooting-and-faq)
28. [Security and data handling](#28-security-and-data-handling)
29. [Roadmap, credentials and licence](#29-roadmap-credentials-and-licence)

---

## 1. Live deployment

| Piece | URL | Host | Cost |
|-------|-----|------|------|
| Storefront | https://beta-modehus.vercel.app | Vercel | free |
| REST API | https://eddiemich.pythonanywhere.com/api/v1/ | PythonAnywhere | free |
| Django admin ("vault") | https://eddiemich.pythonanywhere.com/vault/ | PythonAnywhere | free |
| Health check | .../health/ and .../api/v1/health/ | PythonAnywhere | free |

The hosted demo runs with **`SIMULATE_PAYMENTS = True`**, so checkout completes
end-to-end without real OPay keys and **no card is ever charged**. Switch it off
once real payment credentials exist.

The storefront and the API are two separate services on two hosts, so the
frontend is built with `VITE_API_URL` pointing at the PythonAnywhere API.