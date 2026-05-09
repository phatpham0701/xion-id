# Design: harden-ci-admin-tests-error-boundary

## CI hardening (`.github/workflows/ci.yml`)

**Before:** `actions/checkout@v6` (nonexistent), lint silenced with
`continue-on-error: true`, no test step, `npm install` (non-reproducible).

**After:**
- `actions/checkout@v4` + `actions/setup-node@v4` (current stable).
- `npm ci --legacy-peer-deps` for reproducible installs.
- `Lint → Test → Build` in sequence; any failure blocks the run.
- Stub `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_ENABLE_XION_PROVIDER`
  injected for both `Test` and `Build` steps so the Supabase client initialises
  without real credentials.
- `package-lock.json` synced: six packages (`@dnd-kit/*`, `qrcode`, `zustand`,
  `@types/qrcode`) were in `package.json` but absent from the lock file, causing
  `npm ci` to abort.
- All 11 pre-existing ESLint errors fixed (no new lint rules added).

## Admin email env migration (`src/lib/admin.ts`)

**Before:** `const ADMIN_EMAILS = ["phatpham0701@gmail.com"]` — hardcoded.

**After:**
```ts
export function parseAdminEmails(raw?: string | null): string[]
export function isConfiguredAdminEmail(email?: string | null, adminEmails?: string[]): boolean
```
Both are pure, side-effect-free, and directly testable.

The module-level `ADMIN_EMAILS` constant is derived from `parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS)`. `VITE_ADMIN_EMAILS` is **optional** and intended only for dev/demo/recovery environments. When absent or empty, `isConfiguredAdminEmail` always returns `false` and `user_roles` is the sole authority.

The stale comment referencing a specific person by name has been replaced with
a role-neutral explanation.

## Sport lifestyle + admin unit tests

### `src/test/sportLifestyle.test.ts` (276 lines, 40+ assertions)
Covers: `SPORT_BADGES` catalogue integrity (50 badges, unique IDs, valid interests
and tiers), `getTierFromProofs` (11 boundary cases), `getRankScore` (monotonicity),
`getSuggestedBadges` (5 per interest), `getMatchedOpportunities`, `getCountdown`
(past/future/invalid), `sanitizeSportLifestyleState` (null, clamp, strip unknown
IDs, proof cap, interest validation), localStorage round-trip, `demoLeaderboard`
(size, sort order, sequential rank).

### `src/test/admin.test.ts`
Tests `parseAdminEmails` and `isConfiguredAdminEmail` directly via their exported
signatures — no logic reimplemented inside the test file. Covers: undefined/null/empty/
whitespace input, single email, comma-separated with mixed case and whitespace, blank
entries, case-insensitivity, whitespace tolerance, membership false-positive guard.
Also retains `AuditAction` exhaustiveness guard (17 actions, dot-separated format).

## ErrorBoundary (`src/components/ErrorBoundary.tsx`)

Class-based boundary wrapping all routes in `App.tsx`. On error:
- `console.error` always fires (diagnostics preserved in all environments).
- The UI message shows `error.message` **only in `import.meta.env.DEV`**; production
  shows the generic string `"An unexpected error occurred."` to avoid leaking
  internal stack details or sensitive module names.
- "Try again" resets boundary state; "Go home" hard-navigates to `/`.

## Mobile navbar (`src/components/landing/Navbar.tsx`)

Added a hamburger button (`Menu`/`X` toggle from lucide-react) visible only below
the `sm` breakpoint. The dropdown uses a `max-h` CSS transition for animation.
Nav content is conditionally rendered (`{open && <nav>…</nav>}`) so collapsed links
are fully unmounted — keyboard users cannot tab into invisible links.

## Lockfile cleanup
`bun.lock` and `bun.lockb` (Bun package manager artefacts) deleted. `npm` is the
canonical package manager per README and CI. Keeping both created confusion about
which lockfile is authoritative.

## Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| `VITE_ADMIN_EMAILS` not set → existing admins lose env shortcut access | `user_roles` table still grants access; env var was always optional |
| `parseAdminEmails` default param references module-level `ADMIN_EMAILS` before it is declared | TypeScript hoists `const` to temporal dead zone; the function is only *called* after module init completes, so there is no TDZ issue at runtime |
| `npm ci` stricter than `npm install` → install may fail if lock drifts again | Lock file is now fully synced; CI will catch drift on the next PR |
| ErrorBoundary hides message in production | `console.error` still logs the full stack; developers can inspect DevTools |
| Mobile menu unmounts on close → no close animation | Acceptable UX trade-off; open animation and hamburger transition remain smooth |
