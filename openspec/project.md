# XIONID OpenSpec Project

## Product positioning
- XIONID is a pitch-safe consumer identity and rewards passport.
- Public UI should be Web2-first, consumer-friendly, and avoid Web3-heavy wording.

## Admin scope
- Admin dashboard is an internal operator control room.

## Data and demo model
- Rewards/campaigns are demo/localStorage unless a specific spec migrates them.
- `wallet_badges` is the source of truth for admin-issued badges.
- `user_roles` controls admin access, with Paulus demo email allowlist.

## Engineering constraints
- Preserve existing Lovable/GitHub foundation.
- Avoid full rebuilds.
