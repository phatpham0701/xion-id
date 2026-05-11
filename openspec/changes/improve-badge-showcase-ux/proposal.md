# Change: Improve Badge Showcase UX

## Problem
The `/badges` page now displays the 50 premium sport lifestyle badge WebP assets, but the current card treatment still emphasizes colored frames and internal gradient surfaces more than the badge artwork. The page needs to feel like a premium visual showcase while preserving the existing sport lifestyle proof model and admin-issued badge inventory behavior.

## Goal
Improve `/badges` as a premium visual showcase for the 50 sport lifestyle badges by making the badge artwork the visual focus, adding tier-based browsing, and giving each badge a focused detail experience.

## Scope
- Add a `showcase` variant to `SportBadgeThumbnail` that keeps premium assets prominent with a lighter transparent/dark spotlight stage and safe generated fallback.
- Add tier filter behavior using the Five-tier badge system section.
- Add a badge detail spotlight modal for selected sport lifestyle badges.
- Keep `/badges` mobile-friendly and preserve the existing Verify button and `VerifyLifestyleDialog` behavior.

## Non-goals
- No schema changes.
- No auth logic changes.
- No sport badge claim, scoring, or proof progression logic changes.
- No `wallet_badges` or admin-issued badge behavior changes.
- No dependencies added.
- No badge assets moved or renamed.
