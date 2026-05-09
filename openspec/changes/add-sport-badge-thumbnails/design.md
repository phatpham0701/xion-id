# Design: Sport Badge Thumbnails

## Approach
The thumbnail system is generated from the existing `SportBadgeDefinition` shape. Sport interest and tier visual metadata are separated into `src/lib/badgeVisuals.ts` so components can map the existing badge catalog to a consistent visual language without changing `src/lib/sportLifestyle.ts`.

## Visual language
Thumbnails use a premium XIONID Orbit Seal style:
- rounded/octagonal seal silhouette
- central lucide-react sport icon
- subtle orbit ring and signal dot
- tier-specific frame treatment
- sport/category accent color
- readable badge name and tier label
- optional progress or earned state

## Metadata model
- Interest metadata maps each `SportInterest` to a lucide icon, accent color, glow treatment, and short label.
- Tier metadata maps each `BadgeTier` to a frame, surface, glow, and label treatment.
- Helper functions provide a stable API:
  - `getSportInterestVisual(interest)`
  - `getBadgeTierVisual(tier)`

## Constraints
- Do not create one asset or component per badge.
- Do not add static PNG files.
- Do not alter the badge source-of-truth data model unless unavoidable.
- Do not affect `wallet_badges` or admin-issued badge flows.
- Keep the component presentation-only and deterministic.

## Data flow
`SPORT_BADGES` remains the source of truth for the sport badge list. A rendered badge passes its existing `SportBadgeDefinition` into `SportBadgeThumbnail`, which derives icon and styling from `badge.interest` and `badge.tierIntent`.
