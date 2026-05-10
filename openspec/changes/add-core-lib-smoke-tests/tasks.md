# Tasks

- [x] Identify all untested core library modules in `src/lib/`.
- [x] Write `smoke.blocks.test.ts` — BLOCK_LIBRARY catalog shape, `getBlockMeta`, categories.
- [x] Write `smoke.blockValidation.test.ts` — `validateBlockConfig` for all 15 block types, `summarizeIssues`.
- [x] Write `smoke.blockRanking.test.ts` — scoring, sorting modes, persona boosts, localStorage prefs round-trip.
- [x] Write `smoke.theme.test.ts` — `themeFromJson`, BACKGROUNDS/FONTS/BUTTON_SHAPES/BUTTON_STYLES, `themeStyleVars`.
- [x] Write `smoke.templates.test.ts` — TEMPLATES catalog invariants, `getTemplate`, FEATURED_TEMPLATES, STARTER_TO_TEMPLATE.
- [x] Write `smoke.brand.test.ts` — BRAND constants, `profileUrl`, RESERVED_USERNAMES.
- [x] Write `smoke.tipJar.test.ts` — `xionToUxion`/`uxionToXion`/`formatXion` with boundary inputs.
- [x] Write `smoke.demoMode.test.ts` — full demo lifecycle: state init, all actions, ID availability, campaign support.
- [x] Confirm all 286 tests pass locally (`npm test`).
- [x] Review assertions for brittleness — prefer invariant checks over frozen exact catalog counts.
- [x] Add OpenSpec proposal and tasks docs.
- [x] Verify package-lock.json is not modified (test-only change).
