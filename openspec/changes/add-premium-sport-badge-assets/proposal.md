# Change: Add Premium Sport Badge Assets

## Problem
The Sport Lifestyle Badge system currently renders reusable generated thumbnail visuals from badge metadata. The final 50 optimized premium sport badge WebP assets now exist in `public/badges/sport/`, but the display layer does not prefer those assets yet.

## Goal
Add 50 premium sport badge assets for the existing Sport Lifestyle Badge system and use those image assets for badge display while preserving current badge logic and claim behavior.

## Scope
- Add static metadata for the 10 sport categories × 5 tiers premium WebP assets.
- Prefer premium image assets in `SportBadgeThumbnail` when category and tier mapping exists.
- Preserve the existing generated thumbnail visual as a fallback for missing, unmapped, or failed image assets.
- Add tests for sport badge asset metadata integrity and safe lookup helpers.

## Non-goals
- Do not change wallet_badges/admin-issued badge behavior.
- Do not change auth logic.
- Do not change Supabase schema.
- Do not change badge claim/scoring logic.
- Do not add dependencies.
- Do not mix sport lifestyle demo badges with wallet_badges.
