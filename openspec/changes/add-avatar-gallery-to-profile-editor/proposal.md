# Add avatar gallery to profile editor

## Summary

Add post-onboarding avatar selection from the existing 24 premium XIONID onboarding avatars so users can update their profile identity avatar after completing onboarding.

## Scope

- Add a built-in avatar gallery entry point to `ProfileEditorCard`.
- Reuse existing onboarding avatar metadata/helpers and picker UI.
- Store the selected built-in avatar asset path in `profiles.avatar_url`.

## Non-goals

- No Supabase schema change.
- Do not change auth logic.
- Do not change onboarding guard behavior.
- Do not change reset account behavior.
- Do not delete or clean up existing uploaded avatar files from Supabase storage.

## Behavior

- Preserve the existing custom image upload flow.
- Users can open a dialog, choose one of the 24 XIONID avatars, and save it.
- If the current avatar is a custom uploaded image, the picker defaults to `runner-male` but does not overwrite `profiles.avatar_url` until the user clicks **Save avatar**.
- On save, update `profiles.avatar_url` to `/avatars/onboarding/<filename>.webp` and refresh the editable profile state.
