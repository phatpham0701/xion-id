# Change: Add Core Library Smoke Tests

## Problem
Seven core library modules (`blocks`, `blockValidation`, `blockRanking`, `theme`,
`templates`, `brand`, `tipJar`, `demoMode`) had zero test coverage. Regressions
in catalog shape, validation logic, scoring/sorting, or demo state mutations could
go undetected until a runtime error reached users.

## Goal
Add a smoke-level test suite that gives the CI pipeline basic signal on each
module:
- Key catalogs have the right shape and internal consistency (unique ids, required
  fields, valid enum values).
- Pure utility functions (`xionToUxion`, `themeFromJson`, `validateBlockConfig`,
  etc.) behave correctly at boundary inputs.
- localStorage round-trips for demo state, block prefs, and sport lifestyle state
  work as expected.
- Demo actions (`issueDemoBadge`, `claimDemoReward`, `createDemoCampaign`, etc.)
  mutate state correctly without side effects.

## Scope
- 8 new `src/test/smoke.*.test.ts` files, ~228 tests.
- No changes to runtime code, database schema, or product behavior.
- Tests run inside the existing Vitest + jsdom setup.

## Non-goals
- This PR does **not** address the P0 account/profile overwrite incident.
  That incident requires a separate targeted fix with its own incident spec.
- No new npm dependencies.
- No UI or API changes.
- No Supabase migration or schema change.
