# Tasks: add-premium-sport-badge-assets

- [x] Read repository and OpenSpec guardrails.
- [x] Inspect current sport badge assets in `public/badges/sport/`.
- [x] Inspect sport lifestyle badge metadata and thumbnail rendering code.
- [x] Add premium sport badge asset metadata helper.
- [x] Update `SportBadgeThumbnail` to prefer premium image assets.
- [x] Preserve generated visual fallback for unmapped or failed assets.
- [x] Add asset metadata tests.
- [ ] Run lint, tests, and production build. (Attempted; blocked because `npm ci` cannot install `@testing-library/dom` from the registry with HTTP 403, leaving local CLIs unavailable.)
- [ ] Complete manual smoke checklist. (Manual browser pass pending because dependencies could not be installed in this environment.)
