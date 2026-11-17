# Cadence

Cycling training site and shop. [TanStack Start](https://tanstack.com/start) (React 19, plain JavaScript) on a Nitro Node server, with SQLite (Drizzle ORM), Stripe Checkout and Nodemailer.

## Setup

```bash
npm ci
cp .env.example .env     # then fill in the values
npm run db:migrate       # creates data/app.db and applies drizzle/ migrations
npm run db:seed          # loads Product.json and Clip.json (safe to re-run)
npm run dev
```

Requires Node 22+. `better-sqlite3` is a native module, so `npm ci` needs a build toolchain (or a prebuilt binary for your platform).

## Environment variables

See `.env.example`. Secrets stay in `.env` (git-ignored), never in code.

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Public site URL. Used for Stripe success/cancel URLs and email links. |
| `DATABASE_URL` | SQLite file path. Optional, default `./data/app.db`. |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_test_...` in development). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Mail server. Defaults to `localhost:1025`. |
| `MAIL_FROM` | Sender address for emails. |
| `ADMIN_EMAIL` | Optional. Gets a "New sale" email per paid order. |

## Stripe webhook

Add an endpoint in the Stripe dashboard pointing at `https://<your-domain>/api/stripe-webhook`, listening for `checkout.session.completed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

The thank-you page also confirms the payment directly with Stripe, so a missed webhook does not lose an order.

## Build and run in production

```bash
npm run build
npm run start    # node .output/server/index.mjs
```

The database is a single file, so the host needs a **persistent disk**: serverless platforms and Cloudflare Workers will not work. Back up `data/app.db` regularly.

## Project layout

- `src/routes/` file-based pages; `src/routes/api/stripe-webhook.js` is the webhook.
- `src/lib/server-fns.js`, `src/lib/checkout.js` server functions (products, clips, checkout, purchase confirmation).
- `src/lib/purchases.server.js` marks orders paid and sends the emails. Email failures are logged to the server console.
- `src/db/schema.js` Drizzle schema; migrations live in `drizzle/` (`npx drizzle-kit generate` after schema changes).
- `emails/` HTML email templates (`{{variable}}` placeholders).
- `scripts/` `migrate.mjs` and `import.mjs` (data import).

## Notes

- There is no user login: the shop is a one-off payment with no accounts.
- `base44/` holds the old Base44 definitions of the entities and functions this app was migrated from. It is kept for reference only and is not used at runtime.
