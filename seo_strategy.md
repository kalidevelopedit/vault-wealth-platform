# SEO Strategy

## In scope
- Public landing page (`/`)
- Public marketing pages under `/why-vault`, `/products`, `/accounts`, `/pricing`, and company/legal pages
- Public shareability, crawlability, indexation, structured data, favicon, robots, sitemap, and AI crawler visibility

## Out of scope
- Authenticated investor application routes (`/dashboard`, `/invest`, `/assets/**`, `/wallet`, `/profile`, `/settings`, `/wealth-builder`, `/convert`)
- Onboarding and login/account flows except where they affect shared public shell behavior
- Admin routes (`/admin/**`)

## Target audience
- Prospective investors and institutional clients evaluating the platform

## Primary keywords
- Unknown — likely brokerage, institutional trading, retirement accounts, crypto trading, forex trading, and investment platform terms

## Dismissed categories
- (None yet)

## Notes
- Frontend is a React + Vite SPA using Wouter client-side routing.
- Public marketing pages currently share one static HTML shell in `artifacts/investment-platform/index.html`.
- AI crawlers and social preview bots can only read the initial HTML shell, not route-rendered React content.
