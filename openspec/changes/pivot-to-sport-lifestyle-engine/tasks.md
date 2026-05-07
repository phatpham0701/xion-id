# Tasks: pivot-to-sport-lifestyle-engine

## OpenSpec Definition
- [x] Create product pivot proposal.
- [x] Define onboarding/dashboard requirements.
- [x] Define sport lifestyle passport requirements.
- [x] Define sport badge and five-tier requirements.
- [x] Define lifestyle verification requirements.
- [x] Define personal challenge requirements.
- [x] Define sport leaderboard requirements.
- [x] Define lifestyle opportunities requirements.

## Future Implementation Checklist
- [ ] Confirm branch is updated against GitHub `main` before coding. (Attempted `git fetch origin main`; repository has no `origin` remote configured in this environment.)
- [x] Audit existing auth/onboarding/dashboard routes and identify minimal changes.
- [x] Route signed-in users with completed basic identity directly to Dashboard.
- [x] Add or adapt basic identity completion for username, display name, avatar, and optional AI/3D avatar placeholder.
- [x] Add Dashboard primary CTA: “Verify your lifestyle”.
- [x] Add sport lifestyle interest selection and persist selected interests.
- [x] Add suggestion logic for badges, challenges, proof types, and opportunities based on selected interests.
- [x] Add proof submission/simulation flow for the pilot.
- [x] Add five-tier sport lifestyle badge model: Bronze, Silver, Gold, Diamond, Elite.
- [x] Add personal challenge creation with deadline and countdown.
- [x] Add rank progression from repeated proofs, challenge completions, and referrals.
- [x] Add matched lifestyle opportunities surface without generic voucher marketplace behavior.
- [x] Keep public copy Web2-first and sport-lifestyle-first.
- [ ] Run build/typecheck. (Attempted; dependency install/build is blocked by registry access to @burnt-labs/abstraxion in this environment.)
- [ ] Complete manual test checklist for auth, onboarding, dashboard CTA, proof simulation, badge awarding, challenges, leaderboard, and opportunities. (Manual browser pass pending because dependencies could not be installed.)
