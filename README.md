# XIONID

XIONID is a pitch-safe Sport Lifestyle Engine demo for athletes, creators, teams, brands, and community operators. It presents a consumer-friendly identity and rewards passport where lifestyle activity can be packaged into profiles, badges, ranks, and opportunities.

**Core line:** Prove your lifestyle. Build your rank. Unlock opportunities.

## Current positioning

XIONID is positioned as a Sport Lifestyle Engine: a profile and rewards experience that helps users turn sport, wellness, creator, and community activity into a visible identity layer. The product is intentionally Web2-first for the current pitch cycle so reviewers can evaluate the user loop without needing wallets, chain transactions, or Web3 onboarding.

## Current demo status

This repository is Foundation-review ready as a pitch-safe demo. The current implementation focuses on the end-to-end product story, operator flows, and UI clarity. App behavior, routes, dashboard logic, admin flows, badge logic, Vite chunk strategy, and Supabase schema are intentionally left unchanged by this hygiene update.

## Live vs simulated

### Live in the demo

- Public marketing and profile surfaces.
- Authentication route and protected dashboard shell.
- Profile editor and template browsing flows.
- Badge inventory display backed by the current app data model.
- Admin dashboard routes for operator review.
- Demo campaign, rewards, QR, challenge, and opportunity screens.
- Supabase client configuration via Vite environment variables.

### Simulated or deferred

- Rewards and campaigns use demo/browser-local state unless a feature spec explicitly promotes them to production data.
- Brand, sponsor, and Foundation opportunities are represented as pitch-safe product flows rather than live commercial fulfillment.
- XION/Burnt wallet, chain, treasury, and transaction integration are deferred until Foundation alignment.
- On-chain issuance and Web3 provider behavior are disabled by default with `VITE_ENABLE_XION_PROVIDER=false`.

## Main product loop

1. A user lands on XIONID and understands the lifestyle value proposition.
2. The user signs in and opens the dashboard.
3. The user edits a public-facing identity profile.
4. The user collects or displays badges that prove lifestyle signals.
5. The user reviews challenges, rewards, campaigns, and opportunities.
6. Operators use the admin dashboard to inspect users, profiles, badges, and demo state.
7. After Foundation alignment, selected proof, rewards, or settlement flows can be connected to XION/Burnt infrastructure.

## Key routes

- `/` — public landing page.
- `/auth` — sign-in and authentication entry point.
- `/dashboard` — authenticated user dashboard.
- `/editor` — profile editing studio.
- `/templates` — public template gallery.
- `/preview/template/:id` — template preview page.
- `/badges` — user badge inventory surface.
- `/rewards` and `/opportunities` — opportunity and reward surfaces.
- `/challenges` — challenge discovery surface.
- `/campaigns` and `/c/:id` — campaign demo surfaces.
- `/qr` — QR sharing center.
- `/:username` — public profile route, including demo profiles such as `/paulus`.
- `/admin` and `/admin/*` — protected operator dashboard routes.

## Admin dashboard overview

The admin dashboard is an internal operator control room. It provides review surfaces for accounts, published profiles, issued badges, rewards, campaigns, audit-style activity, health checks, and demo controls. Admin-only pages are protected by the app's authorization flow and are not intended as public marketing pages.

## Tech stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- Supabase
- Vitest
- ESLint

## Environment setup

Create a local `.env` file from the committed example:

```bash
cp .env.example .env
```

Required variables are documented in `.env.example`:

```bash
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_ENABLE_XION_PROVIDER=false
VITE_CHAIN_ID=xion-testnet-2
VITE_RPC_URL=https://rpc.xion-testnet-2.burnt.com:443
VITE_REST_URL=https://api.xion-testnet-2.burnt.com
VITE_GAS_PRICE=0.001uxion
VITE_TREASURY_ADDRESS=
VITE_AUTH_APP_URL=https://auth.testnet.burnt.com
```

Keep real secrets and deployment-specific values in local or platform-managed environment settings. Do not commit `.env`.

## Local development commands

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Preview the production build locally:

```bash
npm run preview
```

## CI and build notes

- `npm run build` is the primary production build check.
- `npm run lint` is the primary static lint check.
- `npm run test` runs the Vitest suite when tests are present.
- The Vite build may report chunk-size warnings; those are informational unless a release specifically targets bundle splitting.
- CI/deployment environments should provide Supabase values through managed environment variables rather than committed files.

## XION/Burnt integration status

XION/Burnt integration is intentionally deferred until Foundation alignment. The repository includes environment variable placeholders for chain and auth configuration so the integration path is visible, but the current pitch-safe demo does not add wallet onboarding, provider activation, on-chain badge issuance, treasury movement, or Web3 transaction flows.

## Roadmap after pitch

- Confirm Foundation requirements for XION/Burnt auth, wallet, and chain touchpoints.
- Decide which proof, badge, reward, or settlement events should become on-chain.
- Replace simulated opportunity fulfillment with partner-ready workflows.
- Harden admin audit, role, and operational controls for production use.
- Add analytics and reporting for lifestyle rank, badge conversion, and opportunity engagement.
- Expand public profile templates and creator/team onboarding flows.
