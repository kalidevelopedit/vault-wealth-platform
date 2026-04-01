# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is the **Vault Wealth** institutional investment platform — a full-stack financial application with auth, KYC onboarding, a trading dashboard, and admin portal.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **State**: React Query (TanStack Query)
- **Auth**: express-session (cookie-based)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/             # Express API server (port 8080)
│   └── investment-platform/    # React+Vite frontend (port 22767)
├── lib/                        # Shared libraries
│   ├── api-spec/               # OpenAPI spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas from OpenAPI
│   └── db/                     # Drizzle ORM schema + DB connection
├── scripts/                    # Utility scripts
│   └── src/seed.ts             # Database seed script
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Routes (Frontend)

| Path | Description |
|------|-------------|
| `/` | Landing page (public) |
| `/login` | User sign in |
| `/register` | Create new account |
| `/onboarding` | 8-step KYC wizard (new users) |
| `/dashboard` | Investor portfolio dashboard |
| `/invest` | Trade crypto/stocks/commodities |
| `/assets/crypto` | Crypto asset list |
| `/assets/stocks` | Stock asset list |
| `/assets/commodities` | Commodities list |
| `/assets/:symbol` | Individual asset detail |
| `/wallet` | Deposits & withdrawals |
| `/profile` | User profile management |
| `/admin` | Admin portal login (passcode: 2468) |
| `/admin/dashboard` | Admin user management |
| `/admin/users/:id` | Admin user detail + KYC approval |

## API Endpoints

All API routes are prefixed with `/api`. The server runs on port 8080, the frontend proxies `/api/*` through Vite.

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in (returns session cookie)
- `POST /api/auth/logout` — sign out
- `GET /api/auth/me` — get current user

### Onboarding (KYC)
- `POST /api/onboarding/preferences`
- `POST /api/onboarding/profile`
- `POST /api/onboarding/kyc-documents`
- `POST /api/onboarding/selfie`
- `POST /api/onboarding/submit`
- `GET /api/onboarding/status`

### Portfolio
- `GET /api/portfolio/summary`
- `GET /api/portfolio/performance`
- `GET /api/portfolio/holdings`
- `GET /api/portfolio/asset-mix`

### Assets
- `GET /api/assets/list?type=crypto|stock|commodity`
- `GET /api/assets/search?q=...`
- `GET /api/assets/:symbol`
- `GET /api/assets/:symbol/chart`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions/buy`
- `POST /api/transactions/sell`
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`

### Watchlist
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:symbol`

### Market
- `GET /api/market/news`
- `GET /api/market/summary`

### Users
- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `GET /api/users/balance`

### Admin
- `POST /api/admin/login` — passcode: 2468
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/kyc-status`

## Demo Credentials

- **User**: `demo@vestplatform.com` / `demo1234`
  - KYC approved, onboarding complete
  - Has 6 holdings (BTC, ETH, AAPL, MSFT, GOLD, SILVER)
  - Cash balance: ~$16,345
  - Total portfolio: ~$64,243

- **Admin Portal**: passcode `2468`

## Database Schema

Tables: `users`, `assets`, `holdings`, `transactions`, `kyc_documents`, `watchlist`, `news`, `price_history`, `activity_log`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` during typecheck; JS bundling is esbuild/vite

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/scripts run seed` — seed the database with demo data

## Design System (Premium Minimalist)

Completed full UI/UX redesign per the premium-minimalist brief:

**Color Palette:**
- Background: `#f8f7f4` (warm off-white) — `38 14% 96%` HSL
- Card: `#ffffff`
- Border: `#e6e3dc` (warm hairline) — `38 10% 89%` HSL
- Foreground: `#111111` (charcoal)
- Muted text: `#707070`
- Primary navy: `#162d4a` / Sidebar dark: `#0d1520`
- Gain: `#2b6b4e` (muted institutional green) — no bright emerald
- Loss: `#943636` (muted institutional red) — no bright red

**Pages redesigned:**
- Login / Register — white form panel + dark navy left panel split layout
- AppLayout sidebar — near-black navy (`#0d1520`), refined typography, no section labels
- Dashboard — muted gain/loss, refined KPI strip, clean data tables
- Wallet — removed dark navy card, dot-based status indicators (no colored badges)
- Profile — clean white avatar/identity card (no dark header)
- AssetList / AssetDetail / Invest — muted colors, bordered symbol icons, clean trade widget
- Admin pages — cleaned up colored badge references

**Typography:** Inter, thin-line icons (strokeWidth 1.5), spaced label tracking `0.16em`–`0.18em`

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI spec (40+ endpoints)
- `artifacts/investment-platform/src/App.tsx` — Frontend routing
- `artifacts/investment-platform/src/index.css` — Global styles + design tokens
- `artifacts/investment-platform/src/components/layout/AppLayout.tsx` — Sidebar nav
- `artifacts/api-server/src/app.ts` — Express app setup
- `artifacts/api-server/src/routes/index.ts` — Route mounting
- `lib/db/src/schema/index.ts` — Database schema
- `scripts/src/seed.ts` — Demo data seed
