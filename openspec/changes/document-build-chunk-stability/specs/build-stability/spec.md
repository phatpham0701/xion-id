# Build Stability Spec

## Requirements

### Requirement: Manual chunks must not split React-dependent packages unsafely
Production builds MUST NOT place React-dependent packages into isolated manual chunks unless the package is known to be initialization-order safe.

React-dependent packages include, but are not limited to:
- `react-qr-code`
- `lucide-react`
- `@radix-ui/*`
- React UI wrappers around QR/chart/icon libraries
- any package importing `react`, `react/jsx-runtime`, `forwardRef`, `memo`, `createContext`, or hooks

These packages SHOULD remain in the default React/vendor graph unless there is a measured need and a production smoke test proves safety.

#### Scenario: QR libraries
- WHEN configuring `manualChunks` for QR functionality
- THEN only the pure JavaScript `qrcode` package MAY be split into a `qrcode` chunk
- AND `react-qr-code` MUST NOT be captured by broad conditions such as `id.includes("qrcode")` or `id.includes("qr-code")`
- AND React-dependent QR packages MUST remain in vendor/default chunking

#### Scenario: Icon libraries
- WHEN configuring chunks for icon libraries
- THEN `lucide-react` MUST NOT be split into an independent `icons` chunk unless production smoke tests confirm no React initialization failure
- AND any error like `Cannot read properties of undefined (reading 'forwardRef')` MUST be treated as a release blocker

### Requirement: Production blank-screen smoke test
Every PR that changes `vite.config.ts`, `manualChunks`, build settings, dependency versions, or React-dependent libraries MUST include a production smoke test checklist.

The checklist MUST verify:
- production build completes
- root route `/` mounts React into `#root`
- `#root` is not empty after load
- static `#pre-shell` is hidden after React mounts
- browser Console has no TDZ errors like `Cannot access 'X' before initialization`
- browser Console has no React initialization errors like `forwardRef` undefined
- key routes load: `/`, `/dashboard`, `/badges`, `/challenges`, `/opportunities`

### Requirement: Stability over micro-optimization for pitch builds
For Foundation pitch readiness, production reliability MUST take priority over aggressive manual chunk optimization.

If a chunk optimization causes or risks runtime initialization errors, the optimization MUST be reverted or narrowed even if it slightly increases bundle size.
