# Fix: Onboarding Profile Guard — P0 Account/Profile Integrity

## Change ID
`fix-onboarding-profile-guard`

## Severity
P0 — Active data loss for existing users.

## Problem Statement

`Dashboard.tsx` gates the `OnboardingFlow` on the demo localStorage flag
`getDemoState().onboarded`. When that flag is `false` — which happens whenever
localStorage is absent (incognito, new device, cleared cache, or an admin demo
reset) — the `OnboardingFlow` component is rendered even for users who already
have a fully populated profile.

`OnboardingFlow.finish()` unconditionally calls:

```ts
supabase
  .from("profiles")
  .update({ username: clean, display_name: displayName.trim(), avatar_url: avatarUrl })
  .eq("id", profile.id)
```

`avatarUrl` is always a freshly generated emoji SVG data-URL, so even if the
user clicks through without changing their username or display name, their real
avatar is overwritten. If they change the pre-filled values, username and
display_name are also silently overwritten.

## Unsafe Code Paths

### Primary path (Dashboard.tsx:115)

```
authenticated user → /dashboard (RequireAuth passes)
→ profiles table fetch → profile loaded (username already set)
→ getDemoState().onboarded === false  (localStorage empty / cleared)
→ <OnboardingFlow profile={profile} onSaved={setProfile} />
→ user clicks "Continue" + "Open Dashboard"
→ supabase.from("profiles").update({ username, display_name, avatar_url })
   ↑ OVERWRITES real data with onboarding-time values
→ completeDemoOnboarding() sets localStorage onboarded=true
→ navigate("/dashboard")
```

### Contributing path (Navbar.tsx — "Demo" link)

The Navbar "Demo" entry points to `/auth`. For an authenticated user,
`RedirectIfAuthed` redirects them to `/dashboard`. If localStorage is empty
they hit the primary path above. This is not independently exploitable but
shortens the repro steps.

## Root Cause

`demoOnboarded` (a transient localStorage flag) is used as a proxy for "this
user has never completed onboarding." This assumption breaks because:

1. localStorage resets on incognito, new device, or cache clear.
2. An admin demo reset (`resetDemoState()`) forces `onboarded=false`.
3. The flag was never persisted to Supabase, so users who joined before the
   flag existed will always read `false` from seed data.

The database already provides a reliable signal: new users have `username = NULL`
(confirmed by the `handle_new_user` trigger which inserts without a username).
Existing users always have a non-null username.

## Proposed Fix (minimal, one-line gate change)

Replace the localStorage-based gate in `Dashboard.tsx` with a database-backed
check:

```diff
- if (!demoOnboarded) {
+ if (!profile.username) {
    return <OnboardingFlow profile={profile} onSaved={setProfile} />;
  }
```

Additionally remove the now-dead `demoOnboarded` state and its `useEffect`
listener, and the `getDemoState` import if it becomes unused.

This preserves correct new-user onboarding (username is null after sign-up
trigger) while permanently preventing OnboardingFlow from appearing for any user
who already has a username in the database.

## Invariants Preserved

- New users still see OnboardingFlow (username is null from `handle_new_user` trigger).
- After OnboardingFlow completes, username is set → refresh never shows OnboardingFlow again.
- `completeDemoOnboarding()` still fires (for demo analytics), but no longer controls routing.
- No Supabase schema changes required.
- No migration required.
- Auth, XION/Abstraxion, admin, badges, rewards — unaffected.

## Files Affected

| File | Change |
|---|---|
| `src/pages/Dashboard.tsx` | Replace `!demoOnboarded` gate with `!profile.username`; remove dead state/effect |

## OpenSpec Delta

No spec text changes required. The existing `demo-mode/spec.md` requirement
("Demo controls must not be confused with production database controls") is
being enforced by this fix.
