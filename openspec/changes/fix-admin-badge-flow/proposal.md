# Proposal: fix-admin-badge-flow

## Goal
Fix badge issuing, badge inventory visibility, admin badge viewer, and auth redirect issues.

## Non-goals
- Do not redesign app.
- Do not modify landing page.
- Do not rebuild scanner.
- Do not change auth provider.
- Do not duplicate already-merged PR #1 changes.

## Allowed files for future implementation
- `src/pages/admin/AdminBadges.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/BadgesAll.tsx`
- `src/lib/admin.ts`
- `src/components/admin/AdminLayout.tsx`
- `src/lib/badgeScanner.ts`
