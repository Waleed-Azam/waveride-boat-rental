# WaveRide — Boat Rental Platform Proposal

**Prepared for:** Greek-Islands Charter Client (Athens, Greece)
**Date:** October 2026
**Project Type:** Fixed-Price, End-to-End Delivery
**Timeline:** 8–10 weeks (matches the 1–3 month window)
**Engagement:** Less than 30 hrs/week, ongoing support after launch

---

## 1. Project Summary

WaveRide is a full-stack boat rental marketplace tailored for the Greek charter market. It enables customers to search and book boats in real time, gives boat owners a fleet-management console, provides travel agencies with a dedicated reservation portal, and ships an admin panel — all wired through a **two-way API sync layer** that keeps availability, bookings, changes and cancellations in lock-step with external booking platforms to eliminate double bookings.

---

## 2. Scope of Work

### 2.1 Public-Facing Website
- Modern, mobile-responsive landing page with hero, search, fleet categories, social proof
- Searchable boat listings with filters (location, type, price, guests)
- Detailed boat pages with image gallery, specs, amenities, reviews, and charter info
- Real-time availability calendar with date-range selector
- Booking request flow with guest counts, special requests, instant price calculation
- Destination guides (Mykonos, Santorini, Paros, Crete, Corfu, Athens Riviera, …)
- How-it-works & About sections

### 2.2 Customer Accounts
- Email/password registration & sign-in (NextAuth.js)
- Personal dashboard (upcoming trips, past trips, recommended boats)
- Booking management (view, cancel)

### 2.3 Boat Owner Portal
- **Fleet dashboard** — active boats, pending requests, revenue snapshot, sync queue
- **Boat management** — add/edit boats with images, specs, amenities, pricing
- **Availability calendar** — 3-month view, bulk date actions (block / maintenance / available), color-coded for local vs. external bookings
- **Bookings inbox** — confirm / cancel requests, customer details
- **Sync Center** — push-to-external button, activity log, external-ID mapping, error visibility

### 2.4 Travel Agency Portal
- Fleet browsing at preferential visibility
- Multi-booking management for clients
- Client roster with booking history and total value
- Agency-branded dashboard with KPIs

### 2.5 Admin Panel
- Platform KPIs (users, boats, bookings, revenue, sync health)
- Revenue & booking-volume charts (Recharts)
- All-bookings table with filtering
- All-users table with roles & counts
- Fleet-wide boat list with sync status
- **Sync Monitor** — queue, failed items, full activity log, manual push trigger, webhook tester
- Destination & boat-type analytics

### 2.6 Two-Way API Integration (Key Requirement)
- **Outbound sync**: When a boat is created/updated or a booking is made/changed/cancelled locally, the event is queued and pushed to the external booking platform via REST. Each entity is mapped via `externalId`.
- **Inbound webhooks**: The platform exposes a `/api/sync/webhook` endpoint that the external platform can call with `booking.created`, `booking.cancelled`, and `availability.changed` events to update local calendars in real time.
- **Sync log**: Every push/pull is logged with status, direction, payload hash, and error message (visible to owners and admins).
- **Conflict prevention**: Booking endpoint validates against both local and external-blocked dates atomically; UI surfaces sync errors and retry controls.
- **Production hardening notes**: HMAC signature verification, idempotency keys, exponential back-off retries, and webhook replay are included in the production plan (demo uses simulated API).

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Full-stack React, SSR/SSG, API routes, excellent DX & SEO |
| Language | **TypeScript** | Type safety across frontend & backend |
| UI | **Tailwind CSS + shadcn/ui** | Beautiful, accessible, fully-customizable components |
| Database | **PostgreSQL** (demo uses SQLite) | Production-grade relational DB; Prisma migrations make switching trivial |
| ORM | **Prisma** | Type-safe queries, great migrations, mature |
| Auth | **NextAuth.js (Auth.js v5)** | Credentials provider, session management, extensible to OAuth |
| Calendar | **react-day-picker + custom grid** | Date range selection, custom disabled/blocked day rendering |
| Charts | **Recharts** | Lightweight, composable React charts |
| Forms/Validation | **React Hook Form + Zod** | Type-safe validation (demonstrated in register API) |
| Payments (stub) | Mock payments table, ready to wire to Stripe/EveryPay | Greek-preferred PSP integration planned |
| Hosting | **Vercel** (app) + **Neon/Supabase** (DB) + **Upstash Redis** (queue) | One-click deploy, global edge |

---

## 4. Fixed-Price Proposal: **€18,500**

| Milestone | Deliverables | Price | Payment |
|---|---|---|---|
| **M1 – Discovery & Design (2 weeks)** | Wireframes, UI/UX mockups (Figma), schema & API contract sign-off, sample data model, external API alignment meeting | €3,500 | 20% on kickoff |
| **M2 – Core Platform (3 weeks)** | Public site, auth, boat listings, detail pages, booking flow, customer dashboard, seeded database | €5,500 | 30% on UAT delivery |
| **M3 – Owner & Agency Portals (2 weeks)** | Boat management, availability calendar (3-month), bookings inbox, agency portal, role-based access control | €4,000 | 20% on UAT delivery |
| **M4 – Admin & Two-Way Sync (2 weeks)** | Admin dashboard, analytics, sync engine (outbound push + inbound webhooks), sync log, conflict protection, idempotency | €3,500 | 20% on UAT delivery |
| **M5 – Testing, Deployment & Training (1 week)** | E2E + load testing, production deployment, live DNS/SSL, admin/owner training session, handover docs, 2-week bug-fix warranty | €2,000 | 10% on launch |
| **Ongoing** | Hosting, monitoring, feature iterations | TBD retainer | Monthly |

**Total: €18,500 fixed price**, payable against milestones. Source code & IP transferred on final payment.

---

## 5. Delivery Timeline (Total 10 weeks)

```
Week 1-2   ▓▓▓▓▓▓▓▓   Discovery, Design, API contract
Week 3-5   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Core platform (public + bookings)
Week 6-7   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓   Owner & Agency portals
Week 8-9   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓   Admin + Two-way API sync
Week 10    ▓▓▓▓▓▓▓   Testing, deploy, training
```

---

## 6. Assumptions & Exclusions
- External booking platform provides REST API documentation + sandbox credentials before M4
- Client supplies boat data, copy, and imagery (we provide placeholders)
- Payment processing: Stripe/EveryPay merchant account provided by client
- Hosting costs paid directly by client (~€30–€150/month depending on scale)
- Domain & DNS access provided by client
- Translations (English/Greek) can be added post-launch if requested

---

## 7. What You're Looking At Right Now

This repository is a **fully-functional demo** of the platform that implements every major feature described above:

```
credentials (password for all): demo1234
  admin@boatrent.com     → Admin panel
  owner@boatrent.com     → Boat Owner dashboard
  agency@boatrent.com    → Travel Agency dashboard
  customer@boatrent.com  → Customer dashboard
```

Run locally:
```bash
cd boat-rental-platform
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
Then open http://localhost:3000

---

## 8. Why This Approach
- **One codebase, one deployment** — Next.js gives us SSR marketing pages, an authenticated app, and backend APIs without stitching together multiple services.
- **Demonstrated sync architecture** — the demo already pushes & receives sync events and logs them; wiring to a real external API is a matter of replacing the simulated fetch with the partner's documented endpoints and adding HMAC auth.
- **Greek-market ready** — EUR defaults, Greek copy placeholders, Athens-based timezone.
- **Scalable** — PostgreSQL + Prisma + Next.js API routes comfortably serve tens of thousands of MAVs; we can move the sync worker to a queue (BullMQ/Inngest) when needed.

Looking forward to building this for you. ⚓
