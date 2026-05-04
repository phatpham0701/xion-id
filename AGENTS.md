# AGENTS

## Repository workflow guardrails
- GitHub `main` is the source of truth.
- Before coding, read `openspec/project.md` and all relevant spec files under `openspec/specs/`.
- Before any non-trivial code change, create or inspect an `openspec/changes/<change-id>/` folder.
- Keep PRs small and focused.
- Do not mix already-merged PR changes into a new PR.
- Update/rebase against `main` before implementation.

## Required delivery format
When returning work, include:
- Changed files list
- Build/typecheck result
- Manual test checklist
- Known limitations
