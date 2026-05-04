# Design: unify-badge-inventory-display

## Architecture Intent
- `wallet_badges` remains the source of truth for admin-issued badges.
- `BadgesPanel` remains the display layer.
- Demo badges remain as sample/demo badges during the pitch phase.

## Display Model
- The `/badges` experience should render one unified inventory grid.
- The unified grid combines:
  - Existing demo/sample badges already used by `BadgesPanel`.
  - Adapted `wallet_badges` records.
- The separate “On-chain badge inventory” section is removed or hidden.

## Data Mapping Strategy
- Add an adapter/helper that maps `wallet_badges` rows into `BadgesPanel` display objects.
- Keep mapping explicit for known admin badge kinds:
  - Tipper
  - Whale
  - OG
- Preserve compatibility with existing filtering/sorting dimensions (category, tier, recently issued).

## Fallback Behavior
- Unknown `wallet_badge` kinds should still render safely in the unified grid.
- Unknown kinds should use fallback values for:
  - title
  - icon
  - category
- Fallback rendering must avoid broken UI states and preserve user comprehension.

## Content and Language
- Public-facing copy remains consumer-friendly and Web2-first.
- Avoid Web3-heavy terminology in the primary inventory experience.
- Demo/local badges remain visibly understood as sample/demo evidence during pitch mode.

## Out of Scope
- Supabase schema changes.
- Admin route redesign.
- Scanner flow rebuild.
- Full badge page redesign.
