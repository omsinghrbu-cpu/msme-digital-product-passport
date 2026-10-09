# Digital Product Passport for MSMEs

A Semester V IDEA Lab MVP for low-cost product traceability. Each product has a public QR-verifiable passport and an append-only, SHA-256 hash-linked lifecycle history. This is **not blockchain**: records live in PostgreSQL, while linked hashes make changes evident during verification.

## What it demonstrates

- Manufacturer and admin JWT login with role checks
- Product/passport creation and QR-code generation
- Manufacturing, inspection, shipping and ownership-transfer events
- Immutable-style event records: every event stores `previous_hash` + `current_hash`
- Public, no-login passport verification page
- Admin integrity scan and audit log

## Quick start (Windows / PowerShell)

1. Install Node.js 20+ and PostgreSQL 15+.
2. Create a database: `createdb dpp_msme` (or use pgAdmin).
3. In this folder, copy `.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.
4. Run `npm install`, then `npm run install:all`.
5. Run `npm --prefix server run migrate`, then `npm run seed`.
6. Start both apps with `npm run dev`.
7. Open `http://localhost:5173`.

Demo users (password: `Demo@123`):

| Role | Email |
| --- | --- |
| Manufacturer | manufacturer@greenweave.demo |
| Admin | admin@passport.demo |

The seed product can be checked publicly at `http://localhost:5173/verify/DPP-GW-2026-0001`.

## API summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create manufacturer account |
| POST | `/api/auth/login` | Get JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/products` | List/create products |
| GET | `/api/products/:id` | Product + events |
| POST | `/api/products/:id/events` | Append lifecycle event |
| GET | `/api/products/:id/qr` | QR PNG data URL |
| GET | `/api/verify/:passportId` | Public passport and integrity result |
| GET | `/api/admin/integrity-check` | Scan all passports (admin) |
| GET | `/api/admin/audit-logs` | Audit history (admin) |

## Packages and services

- **React + Vite + Tailwind CSS:** frontend (fully local)
- **Express + pg:** REST API and PostgreSQL access (local PostgreSQL or free Supabase database)
- **jsonwebtoken + bcryptjs:** login and role control
- **qrcode:** local QR image generation—no third-party API
- **Node `crypto`:** built-in SHA-256 hashing—no third-party API
- **Zod:** request validation; **Postman collection** in `server/postman/`

For deployment, use Vercel (client) plus Render/Railway/free Supabase Postgres if desired. Set `VITE_API_URL` to the hosted server URL.

## Integrity model 

For each event, the API calculates `SHA256(previousHash + canonicalEventData)`. The next record points to it. During verification, the server recomputes every hash and checks the links. Editing a stored event breaks its own hash or the link to the next record. Application users cannot edit or delete lifecycle events through the API.
