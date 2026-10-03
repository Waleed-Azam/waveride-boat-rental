# WaveRide — Boat Rental Platform

Full-stack demo implementation of the boat rental marketplace described in the Upwork posting.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database (SQLite for demo — switch to PostgreSQL in .env for production)
npx prisma generate
npx prisma db push
npx prisma db seed

# 3. Run the dev server
npm run dev
```

Then open http://localhost:3000

## Demo accounts (password: `demo1234`)

| Role | Email | Dashboard |
|---|---|---|
| Admin | admin@boatrent.com | /admin |
| Boat Owner | owner@boatrent.com | /dashboard/owner |
| Boat Owner 2 | maria@boatrent.com | /dashboard/owner |
| Travel Agency | agency@boatrent.com | /dashboard/agency |
| Customer | customer@boatrent.com | /dashboard |

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — full-stack React, SSR, API routes
- **Tailwind CSS + shadcn/ui** — design system
- **Prisma ORM** — SQLite in demo, ready for PostgreSQL
- **NextAuth.js (Auth.js v5)** — auth with credentials provider (extensible to OAuth)
- **Recharts** — analytics charts
- **react-day-picker + custom calendar grid** — availability calendars
- **date-fns, zod, sonner, lucide-react** — supporting libraries

## Project structure

```
src/
  app/
    page.tsx                    # Landing page
    boats/                      # Public boat listing + detail pages
    how-it-works/               # How it works page
    destinations/               # Destinations page
    login/, register/           # Auth pages
    dashboard/                  # Customer dashboard
    dashboard/owner/            # Boat Owner portal
    dashboard/agency/           # Travel Agency portal
    admin/                      # Admin panel
    api/
      auth/[...nextauth]/       # NextAuth routes
      register/                 # Registration
      boats/                    # Boats CRUD
      bookings/                 # Bookings CRUD
      sync/push                 # Outbound sync to external platform
      sync/webhook              # Inbound webhook from external platform
      admin/stats               # Admin analytics
  components/                   # UI components (shadcn/ui + custom)
  lib/                          # Prisma client, auth config, utils
prisma/
  schema.prisma                 # Data model
  seed.ts                       # Demo data seed
PROPOSAL.md                     # Fixed-price proposal for the client
```

## Two-way API sync

- **Outbound**: When a boat/booking changes, `syncStatus` flips to `pending`. Clicking "Push to External API" simulates POSTing those changes (with realistic latency & failure rates) and updates the `SyncLog`.
- **Inbound**: `/api/sync/webhook` accepts `booking.created`, `booking.cancelled`, and `availability.changed` events — the same events a real partner platform (e.g. Nautal, Sailo, Boataround, Click&Boat) would send. Local calendars update in real time.
- **Calendar colors**: Blue = locally booked, Purple = externally booked (read-only), Gray = blocked, Yellow = maintenance.
- **No double bookings**: The booking endpoint checks both local and external-blocked dates atomically; conflicts return HTTP 409.
- **Production hardening**: The demo simulates the API, but is structured so swapping the simulated fetches for real partner endpoints + HMAC signing is mechanical.

## Production deployment

- Recommended stack: Vercel (app) + Neon/Supabase (Postgres) + Upstash Redis (sync queue)
- Switch `DATABASE_URL` in `.env` to Postgres, run `prisma migrate deploy`
- Connect Stripe/EveryPay for real payments (payment records are already modeled)
- Add OAuth providers (Google, Facebook) via NextAuth
- Point the sync endpoint URLs at real partner API endpoints and add HMAC verification
