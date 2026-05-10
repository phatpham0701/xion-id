# Change: Add Reset Account Danger Zone

## Problem
Users need a clear way to intentionally reset their account setup and return to onboarding. This must be explicit, confirmed, and safe because resetting profile identity fields can affect public profile visibility and onboarding state.

## Goal
Add a destructive-but-confirmed `Reset account` action inside the user profile/settings area.

## Scope
- Add a red danger-zone block inside `ProfileEditorCard`.
- Add an explicit yes/no confirmation dialog.
- Reset only profile identity/setup fields:
  - `username`
  - `display_name`
  - `avatar_url`
  - `bio`
  - `is_published`
- Let the existing Dashboard onboarding guard route the user back to onboarding after reset.

## Non-goals
- Do not delete the auth user.
- Do not delete admin role records.
- Do not delete issued badge records.
- Do not change onboarding logic from PR #19.
- Do not touch Supabase schema or migrations.
- Do not change public landing copy.

## Safety Notes
This action intentionally sets `username` to `null`. After PR #19, `needsOnboarding(profile)` treats a profile with missing username as incomplete, so the user will be returned to onboarding through the existing guard.
