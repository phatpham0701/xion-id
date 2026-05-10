# Add premium onboarding avatars

## Summary
Replace the onboarding emoji avatar placeholders with the 24 uploaded premium WebP avatar assets while continuing to store the selection in `profiles.avatar_url`.

## Motivation
The current two-step onboarding flow uses emoji-generated data URLs, which do not match the premium identity presentation expected for XIONID. The uploaded onboarding avatar assets provide a higher-quality, asset-backed selection experience without changing authentication, onboarding guards, reset account behavior, or the Supabase schema.

## Scope
- Add typed onboarding avatar metadata and fallback helpers.
- Add a premium responsive avatar picker component.
- Update onboarding identity step to persist selected avatar asset paths in `avatar_url`.
- Preserve safe fallback handling for existing emoji/data URL profile avatars.
- Add unit tests for avatar metadata, defaults, and legacy fallback behavior.

## Non-goals
- No auth logic changes.
- No Dashboard onboarding guard changes.
- No reset account behavior changes.
- No Supabase schema changes.
- No new dependencies.
