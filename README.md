# Vaultline · Production-Ready Fintech Demo

A full-stack-looking banking, investment, and crypto web app built on a **mocked backend**. The frontend is wired exactly as a real product would be — typed API client, hierarchical React Query cache, real auth flows, role-based routing, audit logs, admin console — and the entire backend is intercepted in-browser by **MSW**, with state persisted to `localStorage` and reset-able with a single command.

## What's inside

- **Auth** — register → email verify → login → optional 2FA → reset password → change password → revoke sessions
- **User app** — dashboard with running portfolio, transactions with CSV export, internal transfers with PIN + receipt, send hub, receive (QR for bank + each crypto wallet)
- **Investments** — three lock packages (3 / 6 / 12 mo), live ROI preview, real countdown to maturity, auto-settlement
- **Crypto** — five wallets (BTC, ETH, USDT, BNB, SOL), live-feel price ticker that ticks every 30 s, per-asset 30-day chart, send + receive with QR
- **Settings** — profile, password, 2FA setup with recovery codes, transaction PIN, session manager, notification preferences
- **Admin console** — KPI overview with charts, user search & moderation, balance adjustments with audit log, pending transaction approvals, investment package CRUD, immutable audit log, site settings with live primary-colour preview

## Stack

| Concern              | Choice                                            |
| -------------------- | ------------------------------------------------- |
| Framework            | **Next.js 15** (App Router, RSC where it helps)   |
| Language             | **TypeScript strict**                             |
| Styling              | **Tailwind v4** with CSS-first `@theme` tokens    |
| UI primitives        | **Radix UI** + shadcn-style wrappers in `components/ui` |
| Forms                | **React Hook Form** + **Zod** resolvers           |
| Data fetching        | **TanStack Query v5**                             |
| Charts               | **Recharts**                                      |
| Mocked API           | **MSW v2** + **@faker-js/faker**                  |
| Icons                | **lucide-react**                                  |
| Toasts               | **sonner**                                        |
| Theme switch         | **next-themes**                                   |
| Date utilities       | **date-fns**                                      |
| QR codes             | **qrcode.react**                                  |

No `tailwind.config.js`. All design tokens live in `app/globals.css` inside `@theme { … }`. Dark mode is a `.dark` class on `<html>`; the admin console layers `.admin-scope` to subtly shift its palette.

## Getting started

```bash
pnpm install                          # or npm install / yarn install
npx msw init public/ --save           # writes the MSW service worker into /public (one-time)
pnpm dev                              # http://localhost:3000
```

The `package.json` already declares `msw.workerDirectory`, so `msw init` knows where to write `mockServiceWorker.js`. If you skip this step the worker won't intercept fetches and you'll see network errors on every API call.

Build & run:

```bash
pnpm build
pnpm start
```

The MSW service worker is started automatically in the browser by `MockProvider`. The first load takes ~300 ms longer than subsequent ones while the worker registers.

### Environment

The single variable is:

```bash
NEXT_PUBLIC_API_BASE_URL=/api   # default
```

Copy `.env.example` to `.env.local` if you want to override.

## Demo accounts

| Role  | Email                  | Password     | Notes                                   |
| ----- | ---------------------- | ------------ | --------------------------------------- |
| User  | `demo@vaultline.app`   | `Password1!` | Pre-seeded with balance, transactions, and one active investment |
| Admin | `admin@vaultline.app`  | `Admin123!`  | Auto-redirects to `/admin`              |

**Other shortcuts in the mock backend:**

- Any 2FA challenge accepts `123456` (or one of the recovery codes generated during setup).
- The default transaction PIN for both demo accounts is `1234`.
- Registration returns a `_devToken` field — paste it into `/verify-email` to complete signup without an email server.

## Resetting the mock DB

State is persisted under the `ft.mock.db` key in `localStorage`. To start fresh:

```js
localStorage.removeItem("ft.mock.db");
location.reload();
```

This re-seeds users, packages, crypto prices, and the audit log from a deterministic seed (`faker.seed(424242)`).

## Project structure

```
app/
  (auth)/        login, register, verify-email, forgot/reset, 2fa
  (user)/        dashboard, transactions, transfer, send, receive, investments, crypto, settings
  (admin)/       overview, users, transactions, investments, audit-log, settings
components/
  ui/            Radix-based shadcn-style primitives
  auth/          AuthCard, PinInput, OtpInput, PasswordStrengthMeter
  dashboard/     BalanceCard, QuickActions, RecentTransactions, PortfolioChart, AccountInfo
  investments/   PackageCard, InvestmentModal, LockCountdown, ActiveInvestmentRow
  crypto/        WalletCard, PriceTicker, SendCryptoModal, ReceiveCryptoModal, CryptoChart
  admin/         AdminSidebar, StatsGrid
  shared/        Sidebar, Topbar, MobileNav, ThemeToggle, EmptyState, ConfirmDialog, Logo
hooks/           useAuth, useData, useAdmin, useCountdown
lib/
  api/           client (typed fetch), endpoints, queryKeys
  auth/          session cookie helpers
  utils/         cn, format
mocks/
  db.ts          in-memory store, persistence, seeding
  helpers.ts     ok/created/fail/auth guards
  browser.ts     setupWorker
  handlers/      auth, user, transactions, transfers, investments, crypto, admin
schemas/         every form's Zod schema with inferred types
types/           shared TypeScript types
providers/       ThemeProvider, QueryProvider, MockProvider
```

## Swapping to a real backend

1. Set `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com` in `.env.local`.
2. Remove the `<MockProvider>` wrapper from `app/layout.tsx`, or short-circuit it to render its children unconditionally.

The MSW worker only registers in the browser when `MockProvider` mounts it, so the production bundle ships without runtime MSW once you remove the provider.

The typed `lib/api/client.ts` already speaks JSON, attaches the bearer token from `localStorage`, and surfaces structured `ApiError` instances with `fieldErrors` ready for `form.setError`. No call site needs to change.

## Notes for production

- The `mocks/` folder, `@faker-js/faker`, and `msw` should move from `dependencies` to `devDependencies` (or behind a `NODE_ENV !== "production"` import guard) for real deployments — left in `dependencies` here so a single `pnpm install` brings up a working demo.
- The Tailwind v4 `@theme` block is the only place to change brand colours. The admin console's `.admin-scope` overrides primary/sidebar so it always reads as a separate environment regardless of the user palette.
- Investment maturity is simulated client-side: every `GET /investments` calls `settleMaturedInvestments` which credits principal + ROI and writes the corresponding transaction. In a real backend, that runs as a scheduled job.

## Licence

MIT — use it as a starting point for your own product.
