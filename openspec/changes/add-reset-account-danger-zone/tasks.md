# Tasks — add-reset-account-danger-zone

## T1 — Danger zone UI ✅
- Add a red danger-zone block inside the profile/settings card.
- Add a visible `Reset account` destructive button.

## T2 — Confirmation dialog ✅
- Add yes/no confirmation before reset.
- Explain what is reset and what is preserved.

## T3 — Safe reset behavior ✅
- Reset profile identity/setup fields only:
  - `username`
  - `display_name`
  - `avatar_url`
  - `bio`
  - `is_published`
- Scope the update to both `profile.id` and current `user.id`.
- Do not delete auth user, admin roles, or issued badges.

## T4 — Onboarding return ✅
- After successful reset, call `onChange` with the returned profile.
- Existing Dashboard `needsOnboarding(profile)` guard should show onboarding when username is null.

## Manual smoke checklist
- [ ] User opens Dashboard profile/settings card and sees red Danger zone.
- [ ] Clicking Reset account opens confirmation dialog.
- [ ] Clicking No cancels with no DB changes.
- [ ] Clicking Yes clears username/display name/avatar/bio/public visibility.
- [ ] User is returned to onboarding after reset.
- [ ] Issued badges remain intact.
- [ ] Admin role remains intact.

## Known limitations
- This does not delete uploaded avatar files from storage.
- This does not reset local demo badge/reward state.
