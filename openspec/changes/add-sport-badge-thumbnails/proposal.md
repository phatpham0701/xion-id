# Add Sport Lifestyle Badge thumbnail system

## Why this is needed
The Sport Lifestyle badge catalog already defines 50 pilot badges from 10 sport interests and 5 badge tiers, but the UI currently presents them with a generic award icon. This makes the inventory harder to scan and does not communicate the premium XIONID identity, category, or tier differences that users should see when exploring badges or selecting a proof target.

## What changes
- Add reusable visual metadata for each existing sport interest and badge tier.
- Add a reusable `SportBadgeThumbnail` component that renders a generated visual thumbnail for any existing `SportBadgeDefinition`.
- Use the thumbnail on the `/badges` sport badge grid.
- Use the thumbnail in the Verify Lifestyle dialog for the currently selected suggested badge.

## What does not change
- No changes to the `SPORT_BADGES` generation model or the 50 badge definitions.
- No static PNG badge assets are introduced.
- No Supabase migrations are added.
- No changes are made to `wallet_badges`, admin-issued badge behavior, or admin badge flows.
- No real verification flow is implemented.
- No route, payment, XION, or public profile redesign work is included.

## Success criteria
- `/badges` continues to render all 50 sport lifestyle badges from `SPORT_BADGES`.
- Every rendered sport badge has a generated thumbnail with the correct sport interest icon and tier styling.
- The Verify Lifestyle dialog updates the thumbnail when the selected suggested badge changes.
- Existing localStorage/demo proof simulation behavior remains unchanged.
- Existing admin-issued badge inventory rendering remains intact.
- `npm run build` completes successfully.
