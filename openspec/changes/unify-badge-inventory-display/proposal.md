# Change Proposal: unify-badge-inventory-display

## Goal
Unify badge display so admin-issued `wallet_badges` render inside the existing premium badge UI.

## Problems
- `/badges` currently shows two badge systems.
- Demo badges appear in the main `BadgesPanel`.
- `wallet_badges` appear in a separate lower “On-chain badge inventory” block.
- This is confusing for users and founders.

## Product Decision
Option 1 is selected:
- Keep existing demo badges/sample badges.
- Add `wallet_badges` into the same premium Demo UI Inventory.
- Do not show a separate “On-chain badge inventory” section.
- User should see one unified badge inventory.

## Non-goals
- Do not redesign the whole page.
- Do not change Supabase schema.
- Do not change admin routes.
- Do not remove demo badges in this phase.
- Do not rebuild the scanner flow.
- Do not introduce Web3-heavy public wording.

## Scope
Allowed files for future implementation:
- `src/pages/BadgesAll.tsx`
- `src/components/dashboard/BadgesPanel.tsx`
- `src/lib/badgeScanner.ts`
- `src/pages/admin/AdminBadges.tsx` only if mapping alignment is needed

## Expected Outcome
- Users see a single unified badge inventory surface in the existing premium UI.
- Admin-issued badges from `wallet_badges` and demo/sample badges coexist in one visual system.
- Inventory language remains pitch-safe and Web2-first.
