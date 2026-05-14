# Deploy guide — Vercel + GoDaddy domain

End-to-end steps to ship Gõ Seattle Catering to production.

---

## Prerequisites

- GitHub account (you have)
- A Vercel account — sign up free at <https://vercel.com> (use GitHub OAuth)
- A GoDaddy domain (already purchased)

---

## 0. Important: SQLite ↔ PostgreSQL switch

Local dev uses **SQLite** (fast, zero-setup). Production uses **PostgreSQL** (works on Vercel).

When ready to deploy:

```bash
bash scripts/prepare-deploy.sh
```

This swaps `prisma/schema.prisma` to Postgres + regenerates migrations.

To switch back to SQLite for continued local dev:

```bash
bash scripts/restore-sqlite.sh
```

---

## 1. Push code to GitHub

From the project root:

```bash
cd /Users/huytran/autoapp/go-seattle-catering

# Init git if not already
git init
git add .
git commit -m "Initial commit — Gõ Seattle Catering"

# Create a new repo on github.com (private recommended), then:
git branch -M main
git remote add origin https://github.com/<your-username>/go-seattle-catering.git
git push -u origin main
```

> Make sure `.env` is NOT pushed — `.gitignore` already excludes it.

---

## 2. Connect Vercel

1. Go to <https://vercel.com/new>
2. **Import Git Repository** → pick `go-seattle-catering`
3. Framework Preset: **Next.js** (auto-detected)
4. Click **Deploy** (it will fail the first time — that's OK, we need DB + Blob first)

---

## 3. Add Vercel Postgres

1. From the project dashboard → **Storage** tab → **Create Database** → **Postgres**
2. Pick region close to Seattle (e.g. **iad1** / Washington DC, or **sfo1** / SF)
3. Name it `goseattle-db`
4. Click **Create & Connect**

Vercel auto-injects these env vars into your project:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- (plus a few others you don't need)

---

## 4. Add Vercel Blob storage

1. Same project → **Storage** tab → **Create Database** → **Blob**
2. Name it `goseattle-uploads`
3. Click **Create**

Auto-injected env var:
- `BLOB_READ_WRITE_TOKEN`

---

## 5. Add NextAuth env vars

Project → **Settings** → **Environment Variables** → add 2 vars (for **Production + Preview + Development**):

| Key | Value |
|---|---|
| `NEXTAUTH_SECRET` | Generate locally: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-vercel-url.vercel.app` (update later to custom domain) |

---

## 6. Redeploy

Project → **Deployments** → click the latest → **Redeploy** (use existing Build Cache: no).

This time the build will:
1. `prisma generate` — generate client
2. `prisma migrate deploy` — create Postgres tables
3. `next build` — build the site

If migrate fails, check the build logs — usually a missing env var.

---

## 7. Seed the production database

The DB is empty after migration. To create the admin user + menu items, run seed against prod:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link this project
cd /Users/huytran/autoapp/go-seattle-catering
vercel link

# Pull production env into a local file
vercel env pull .env.production

# Run seed against production DB (one-time)
DOTENV_CONFIG_PATH=.env.production npx ts-node --project prisma/tsconfig.json -r dotenv/config prisma/seed.ts

# Clean up — don't keep prod env on your machine
rm .env.production
```

**Important:** after seeding, log in once at `https://your-url.vercel.app/auth/login` with `admin@goseattlecatering.com` / `admin123` and **change the password** (or update via DB).

---

## 8. Connect GoDaddy domain

### In Vercel

1. Project → **Settings** → **Domains** → enter your domain (e.g. `goseattlecatering.com`)
2. Vercel shows DNS records you need to add. Two options:

**Option A — Recommended: change Nameservers**
- Vercel gives you 2 nameservers (e.g. `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
- Easiest if you only use this domain for the website

**Option B — DNS records only (keep GoDaddy nameservers)**
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

### In GoDaddy

1. Login → **My Products** → find your domain → **DNS**

**For Option A (Nameservers):**
- Scroll to **Nameservers** → **Change** → **I'll use my own nameservers**
- Paste the 2 Vercel nameservers → Save
- Wait 1–24 hours for propagation

**For Option B (DNS records):**
- **DNS Records** → delete existing A record on `@`
- **Add** → Type: **A** · Name: **@** · Value: **76.76.21.21** · TTL: 1 hour
- **Add** → Type: **CNAME** · Name: **www** · Value: **cname.vercel-dns.com** · TTL: 1 hour
- Save
- Wait 10–60 min for propagation

### Verify

- Run: `dig goseattlecatering.com +short` — should return `76.76.21.21`
- Visit `https://goseattlecatering.com` — Vercel auto-provisions SSL within minutes

### Update NEXTAUTH_URL

Once the domain works, go back to Vercel → **Settings** → **Environment Variables**:
- Update `NEXTAUTH_URL` from `https://xxx.vercel.app` to `https://goseattlecatering.com`
- **Redeploy** to pick up the new value

---

## 9. (Optional) Stripe live mode

When ready to take real payments:

1. Login to Stripe Dashboard → switch to **Live mode** (top right)
2. **Developers** → **API keys** → copy live `pk_live_...` + `sk_live_...`
3. In your deployed site: **Admin → Settings → Payments**
4. Switch mode to **LIVE** + paste keys + Save
5. Stripe Dashboard → **Webhooks** → **Add endpoint**:
   - URL: `https://goseattlecatering.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `checkout.session.async_payment_succeeded`
6. Copy the webhook signing secret → paste into admin Settings → Save

---

## Troubleshooting

**Build fails with `Cannot find module '@vercel/blob'`**
→ Make sure `package.json` has `"@vercel/blob"` in dependencies, then redeploy.

**`Cannot reach database` on first deploy**
→ Check Vercel Postgres is connected to the project (Settings → Storage), redeploy.

**`prisma migrate deploy` does nothing in build logs**
→ Migrations folder must be committed. Run `npx prisma migrate dev --name init` locally against a test Postgres, commit the new `prisma/migrations/` folder, push.

**`NEXTAUTH_URL` mismatch causes login redirect to wrong domain**
→ Re-check the env var value. After changing, redeploy.

**Uploaded images return 404**
→ Vercel Blob must be created and `BLOB_READ_WRITE_TOKEN` must exist in env. Check via Settings → Environment Variables.

---

## Local development going forward

Now that the DB is Postgres, local dev needs a Postgres connection. Easiest:

```bash
# Pull the dev branch URLs from Vercel
vercel env pull .env.local
npm run dev
```

This points local dev at the same Vercel Postgres branch (or a dedicated dev branch if you create one in Vercel).
