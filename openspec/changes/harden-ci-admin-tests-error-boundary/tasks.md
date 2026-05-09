# Tasks: harden-ci-admin-tests-error-boundary

## Checklist

### CI
- [x] 1. Replace `actions/checkout@v6` → `@v4`, `setup-node@v6` → `@v4`.
- [x] 2. Switch `npm install` → `npm ci --legacy-peer-deps`.
- [x] 3. Add `Test` step (`npm run test`) between Lint and Build.
- [x] 4. Remove `continue-on-error: true` from Lint step.
- [x] 5. Inject stub Supabase env vars for both Test and Build steps.
- [x] 6. Sync `package-lock.json` (6 missing packages added).
- [x] 7. Fix all 11 pre-existing ESLint errors.

### Security
- [x] 8. Remove hardcoded `phatpham0701@gmail.com` from `admin.ts`.
- [x] 9. Export `parseAdminEmails` and `isConfiguredAdminEmail` as pure helpers.
- [x] 10. Document `VITE_ADMIN_EMAILS` in `.env.example` as dev/demo/recovery only.
- [x] 11. Add startup env-var validation warning in `main.tsx`.

### Tests
- [x] 12. Write `sportLifestyle.test.ts` covering catalogue, tiers, scoring, localStorage, sanitization, leaderboard (40+ assertions).
- [x] 13. Write `admin.test.ts` testing `parseAdminEmails` and `isConfiguredAdminEmail` directly.
- [x] 14. Retain `AuditAction` exhaustiveness guard in `admin.test.ts`.

### Error boundary
- [x] 15. Create `src/components/ErrorBoundary.tsx` (class component).
- [x] 16. Wrap all routes in `App.tsx` with `<ErrorBoundary>`.
- [x] 17. Show raw `error.message` only in `import.meta.env.DEV`; show generic message in production.

### Layout
- [x] 18. Add mobile hamburger menu to `Navbar` (hamburger button + animated dropdown).
- [x] 19. Conditionally render nav content so closed links are not keyboard-reachable.

### Cleanup
- [x] 20. Delete `bun.lock` and `bun.lockb`.

## Manual validation checklist (pre-merge)
- [ ] `npm ci --legacy-peer-deps` completes without errors.
- [ ] `npm run lint` exits with 0 errors.
- [ ] `npm run test` all tests pass.
- [ ] `npm run build` succeeds.
- [ ] On mobile viewport: hamburger visible, tap opens dropdown with all links, tap again closes it.
- [ ] Sign in with email in `VITE_ADMIN_EMAILS` → admin panel accessible.
- [ ] Sign in with email NOT in `VITE_ADMIN_EMAILS` → user_roles table checked (no bypass).
- [ ] Trigger a render error in DEV → full `error.message` shown in UI.
- [ ] Trigger a render error in production build → generic "An unexpected error occurred." shown, full error in console only.
- [ ] "Try again" button resets the boundary; "Go home" navigates to `/`.
