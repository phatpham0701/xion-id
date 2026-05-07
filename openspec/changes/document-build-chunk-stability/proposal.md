# Change: Document build chunk stability guardrails

## Problem
The production site can blank-screen even when Lovable preview works if Vite manual chunking separates React-dependent packages into isolated chunks with unsafe initialization order.

A real incident happened in production: the `qrcode` manual chunk accidentally captured `react-qr-code`, which depends on React. The resulting production bundle raised a TDZ/runtime error such as `Cannot access 'St' before initialization` / React `forwardRef` initialization failure, leaving `#root` empty and only the static pre-hydration shell visible.

## Goal
Capture a permanent OpenSpec rule so future Lovable/Codex changes do not reintroduce unsafe chunk splitting.

## Scope
- Document Vite manual chunk safety rules.
- Require React-dependent packages to remain in the React/vendor graph unless proven safe.
- Require production smoke tests for blank-screen/chunk TDZ issues.
- Preserve pitch-safe production reliability over aggressive micro-optimization.

## Non-goals
- No product UI changes.
- No routing changes.
- No database changes.
- No new dependency changes.
