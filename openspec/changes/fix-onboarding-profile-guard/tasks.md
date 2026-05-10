# Tasks — fix-onboarding-profile-guard

## Status: Implemented in PR #19.

---

## T1 — Code fix (Dashboard.tsx) ✅

**File:** `src/pages/Dashboard.tsx`

1. ✅ Changed onboarding gate from `if (!demoOnboarded)` to `if (needsOnboarding(profile))`.
2. ✅ Removed the `demoOnboarded` useState declaration.
3. ✅ Removed the `useEffect` that refreshed `demoOnboarded` from demo localStorage.
4. ✅ Removed the `getDemoState` import (replaced with `needsOnboarding` from `@/lib/onboarding`).
5. ✅ Sport lifestyle state and its `xionid:sport-lifestyle:change` listener preserved.

---

## T2 — Onboarding helper ✅

**File:** `src/lib/onboarding.ts` (new)

- `hasCompleteProfile(profile)` — returns true when profile exists and username is non-empty/non-whitespace.
- `needsOnboarding(profile)` — returns true only when profile exists but username is missing/empty; returns false for null/undefined profile (missing-data state handled by Dashboard's own fallback).
- No dependency on demoMode, localStorage, getDemoState, or completeDemoOnboarding.

---

## T3 — Tests ✅

**File:** `src/test/onboarding.test.ts` (new)

Covers:
- `hasCompleteProfile` with username / empty / whitespace / null / null-profile / undefined-profile
- `needsOnboarding` with username / empty / whitespace / null / null-profile / undefined-profile
- `needsOnboarding` with localStorage stubbed to empty — proves isolation from demo state

---

## T4 — demoOnboarded routing dependency removed ✅

The `demoOnboarded` localStorage gate is completely gone from the Dashboard
routing path. `completeDemoOnboarding()` in `OnboardingFlow.tsx` still fires
after onboarding (harmless for demo analytics) but no longer controls routing.

---

## T5 — Optional: Navbar auth-awareness ✅

**File:** `src/components/landing/Navbar.tsx`

- Authenticated users on the homepage now see a "Dashboard" CTA instead of
  "Sign in" / "Get started", routing to `/dashboard` on both desktop and mobile.
- Unauthenticated users see the original "Sign in" / "Get started" → `/auth`.
- No visual redesign; existing CSS classes preserved.

---

## T6 — Build / lint / test ✅

Run before merge:

```
npm run lint
npm test
npm run build
```

---

## Manual smoke checklist

- [ ] Existing user with username signs in in incognito (localStorage empty) → dashboard main view, no OnboardingFlow.
- [ ] Existing user after admin demo reset → dashboard main view, no OnboardingFlow.
- [ ] Existing profile username / display_name / avatar_url unchanged after fresh browser session.
- [ ] Existing user signs out and signs back in → dashboard main view, no OnboardingFlow.
- [ ] New user with null username → OnboardingFlow still appears.
- [ ] New user completes onboarding → username set → dashboard main view.
- [ ] Refresh after onboarding → OnboardingFlow does not reappear.
- [ ] Logged-in user visiting homepage → sees "Dashboard" CTA, not "Sign in".
- [ ] Logged-in user clicks "Dashboard" CTA → routes to /dashboard (not /auth).
- [ ] Logged-out user visiting homepage → sees "Sign in" and "Get started" → /auth.

---

## Known Limitations

- If a user manually clears their `username` column in the DB (not a product-accessible path), they would re-enter OnboardingFlow. This is the correct behavior.
- The demo `onboarded` flag in localStorage is still written by `completeDemoOnboarding()` (called in `OnboardingFlow.finish()`). It is now harmless to routing but could be cleaned up in a separate pass if desired.
