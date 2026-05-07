# Admin Dashboard Spec Delta

## Added Requirements

### Requirement: Admin Badge Catalog Manager
Admins MUST be able to browse and operate the pitch/demo badge catalog from `/admin/badges` without editing source code.

#### Scenario: Browse built-in Sport Lifestyle badges
- WHEN an admin opens `/admin/badges`
- THEN the page MUST show a Badge Catalog view containing the 50 built-in Sport Lifestyle Engine badges
- AND badges MUST be searchable and filterable by sport interest and tier
- AND each catalog badge MUST show name, tier, sport interest, proof hint, and description.

#### Scenario: Create a demo custom catalog badge
- WHEN an admin creates a custom catalog badge
- THEN the badge MUST be stored as browser-local admin demo state
- AND it MUST be clearly treated as demo/local catalog data, not production database state.

#### Scenario: Issue a catalog badge to a profile
- WHEN an admin issues a selected catalog badge to a profile
- THEN the app MUST persist that issue in `wallet_badges`
- AND it MUST use a safe existing enum `kind` value
- AND it MUST store the catalog badge identity, name, tier intent, proof hint, description, and sport interest inside `wallet_badges.metadata`.

#### Scenario: Issue multiple catalog badges sharing a safe enum row
- WHEN an admin issues multiple catalog badges that map to the same safe enum `kind` for the same profile
- THEN the app MUST not fail on the `profile_id` plus `kind` uniqueness constraint
- AND it MUST merge distinct catalog badge metadata into the existing `wallet_badges` row intentionally.

#### Scenario: Preserve issued badge operations
- WHEN an admin switches to issued badges
- THEN existing issue/remove/list behavior for `wallet_badges` MUST continue to work.
