# Change: Add Admin Badge Catalog Manager

## Problem
The admin dashboard can currently issue/remove `wallet_badges`, but it does not expose the Sport Lifestyle Engine badge catalog. The 50 sport lifestyle badges are defined in code and visible to the app, but admins cannot browse, search, edit demo copy, create custom demo badges, or issue a selected sport badge from a visual catalog.

## Goal
Make `/admin/badges` useful as an operator control room for both:
- issued profile badges (`wallet_badges` source of truth), and
- the pitch/demo badge catalog used by the Sport Lifestyle Engine.

## Scope
- Add a visual Admin Badge Catalog tab in `/admin/badges`.
- Show all 50 built-in sport lifestyle badges grouped/filterable by sport and tier.
- Allow local demo overrides/custom badge creation without database migration.
- Allow issuing a selected catalog badge to a profile by storing catalog metadata in `wallet_badges.metadata` while keeping the constrained `badge_kind` enum safe.
- Preserve existing issue/remove behavior for `wallet_badges`.

## Non-goals
- No Supabase schema migration.
- No enum migration for 50 badge kinds.
- No production-grade badge CMS yet.
- No public profile rendering changes in this change.
