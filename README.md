# Gõ Seattle Catering

Authentic Vietnamese catering & takeout webapp for **Gõ Seattle Catering** (Seattle, WA).

> _Cooking with love provides food for the soul · Hương Vị Việt — Taste of Vietnam_

## Features

- 🏠 **Public site** — home, about, contact, full menu (62 items across 6 categories)
- 🛒 **Online ordering** — cart, customizable toppings, pickup scheduling, pay-at-pickup
- 🎉 **Catering requests** — event-quote form (weddings, parties, corporate, family)
- 👤 **Customer accounts** — register, login, view order & request history
- 🛠 **Admin dashboard** — manage orders, catering requests, menu (prices + availability)
- 🎨 **Brand-matched theme** — black + gold, matches the existing flyer / logo

## Tech stack

| Layer        | Tool                                            |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling      | Tailwind CSS                                    |
| Database     | SQLite via Prisma 5                             |
| Auth         | NextAuth.js (credentials)                       |
| Cart state   | Zustand (persisted to localStorage)             |
| Validation   | Zod                                             |
| Icons        | lucide-react                                    |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (First time only) generate Prisma client + database
npx prisma migrate dev --name init

# 3. Seed the database with categories, menu items, admin user, etc.
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts

| Role     | Email                          | Password    |
| -------- | ------------------------------ | ----------- |
| Admin    | admin@goseattlecatering.com    | admin123    |
| Customer | demo@example.com               | demo123     |

### Reset / re-seed the database

```bash
npm run db:reset   # drops + re-runs migrations
npm run db:seed    # repopulates menu + users
```

## Environment

Copy `.env.example` → `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

## Project structure

```
src/
├── app/
│   ├── (public)
│   │   ├── page.tsx               # Home
│   │   ├── menu/                  # /menu — browse + add to cart
│   │   ├── cart/                  # /cart
│   │   ├── checkout/              # /checkout
│   │   ├── order/[orderNumber]/   # Order confirmation
│   │   ├── catering/              # /catering — request form + success
│   │   ├── about/
│   │   └── contact/
│   ├── auth/{login,register}/
│   ├── account/                   # Customer dashboard
│   ├── admin/                     # Admin dashboard (orders, catering, menu)
│   └── api/                       # REST endpoints (orders, catering, register, admin/*)
├── components/                    # Logo, Header, Footer, Providers, Toaster
├── lib/                           # prisma, auth, utils, enums, cart-store, site config
└── types/                         # next-auth.d.ts
prisma/
├── schema.prisma
├── seed.ts                        # Full menu from the flyer
└── migrations/
public/
└── images/                        # logo + menu reference photos
```

## Key flows

### Place a takeout order

1. Browse `/menu` → add items (drinks support toppings)
2. Open `/cart` → adjust quantities
3. `/checkout` → fill contact + pickup time → submit
4. Lands on `/order/[orderNumber]` confirmation page

### Submit a catering request

1. `/catering` → fill event details (type, date, guests, style, budget)
2. Submit → lands on `/catering/success?n=…`

### Admin

1. Sign in at `/auth/login` with admin credentials
2. Navigate to `/admin`
   - Overview cards + recent activity
   - `/admin/orders` — list, filter by status, click row → update status
   - `/admin/catering` — list, filter, click → set status / quoted amount / notes
   - `/admin/menu` — toggle availability, update price, edit description

## Pricing & tax

- All prices are in USD, taken directly from the flyer images.
- Sales tax applied at checkout: **10.25%** (Seattle/WA combined rate). Adjust in `src/lib/utils.ts` (`TAX_RATE`).

## What's NOT included (yet)

- Online payment (Stripe) — orders are "pay at pickup". Schema/routes are ready to wire up later.
- Real email sending — confirmations log to the server console. Add an SMTP integration (e.g. Resend, Nodemailer) when ready.
- Image uploads in admin (the seed uses category reference photos in `/public/images/menu/`).

## Production build

```bash
npm run build
npm run start    # runs at http://localhost:3000
```

For deployment to Vercel: set the same env vars and use a managed Postgres (swap the Prisma datasource from `sqlite` → `postgresql` and update `DATABASE_URL`).

## License

Built for Gõ Seattle Catering. Not for redistribution.
