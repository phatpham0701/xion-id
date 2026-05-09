# Tasks

## Implementation checklist
- [x] Add OpenSpec proposal, design, and tasks for `add-sport-badge-thumbnails`.
- [x] Create `src/lib/badgeVisuals.ts` with interest and tier visual metadata.
- [x] Create `src/components/badges/SportBadgeThumbnail.tsx`.
- [x] Replace the generic sport badge card icon in `src/pages/BadgesAll.tsx` with `SportBadgeThumbnail`.
- [x] Add the selected suggested badge thumbnail to `src/components/dashboard/VerifyLifestyleDialog.tsx`.
- [x] Confirm `wallet_badges` / admin-issued badge inventory rendering remains unchanged.
- [ ] Run `npm run build` and fix TypeScript/build errors.

## Manual test checklist
- [ ] `/badges` renders all 50 sport badges.
- [ ] Verify Lifestyle dialog shows the selected badge thumbnail.
- [ ] Simulate accepted proof still updates local sport lifestyle state.
- [ ] Existing admin-issued badge inventory section still renders when `wallet_badges` rows are present.
