# Tasks — fix-onboarding-profile-guard

## Status: Investigation complete. Pending approval to implement.

---

## T1 — Code fix (Dashboard.tsx)

**File:** `src/pages/Dashboard.tsx`

1. Change onboarding gate on line 115 from `if (!demoOnboarded)` to `if (!profile.username)`.
2. Remove the `demoOnboarded` useState declaration (line 44).
3. Remove the `useEffect` that refreshes `demoOnboarded` (lines 47–51).
4. Remove the `getDemoState` import on line 20 if it becomes unused after the above removals.

No other files require changes.

---

## T2 — Tests

Add tests in `src/test/` (or alongside the component) covering:

1. **New user gate**: Dashboard renders `OnboardingFlow` when `profile.username` is null/empty.
2. **Existing user guard**: Dashboard does NOT render `OnboardingFlow` when `profile.username` is set, regardless of `getDemoState().onboarded` value.
3. **Post-onboarding guard**: After `OnboardingFlow` calls `onSaved` with a profile that has a username, the Dashboard switches to the main view without re-rendering OnboardingFlow.

---

## T3 — Manual smoke checklist

- [ ] **New user flow**: Sign up with a fresh account → Dashboard shows OnboardingFlow → complete it → dashboard main view appears → refresh: OnboardingFlow does NOT reappear.
- [ ] **Existing user — incognito**: Sign in as an existing user (username set) in an incognito window (localStorage empty) → Dashboard loads directly to main view, no OnboardingFlow.
- [ ] **Existing user — after demo reset**: Admin resets demo state via `/admin/demo` → existing user reloads `/dashboard` → main view, no OnboardingFlow.
- [ ] **Existing user — avatar preserved**: Existing user with a real avatar visits dashboard in incognito → avatar is not overwritten in the DB.
- [ ] **Username preserved**: Existing user's username, display_name remain unchanged after a fresh browser session.
- [ ] **Sign-out → re-login**: Existing user signs out, signs back in → main dashboard (not OnboardingFlow).
- [ ] **Admin demo controls**: `/admin/demo` reset still works; localStorage demo state resets correctly; demo badge/rewards/campaign state resets correctly.
- [ ] **ProfileEditorCard edits**: display_name and bio edits from the main dashboard still save correctly.

---

## Known Limitations

- This fix does not prevent OnboardingFlow from running if a user manually clears their `username` in the DB (edge case — not a known user path).
- The demo `onboarded` flag in localStorage remains and is still written by `completeDemoOnboarding()`. It is now harmless to routing but could be cleaned up in a follow-up pass (out of scope).
