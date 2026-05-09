# Proposal: harden-ci-admin-tests-error-boundary

## Goal
Harden the XIONID repository foundation across five dimensions: CI reliability,
admin email configuration security, test coverage, error resilience, and mobile
layout accessibility.

## Problems being solved

### 1. CI was completely broken
`actions/checkout@v6` and `actions/setup-node@v6` do not exist. The `lint` step
had `continue-on-error: true`, silently hiding 11 errors. There was no test step.
The build step had no stub Supabase env vars, so it failed on clean runners.
`npm install` was used instead of `npm ci`, meaning installs were non-reproducible.

### 2. Admin email was hardcoded
`phatpham0701@gmail.com` was hardcoded in source. This is a security smell: any
developer reading the code knows which Google account has full admin access, and
removing it requires a code change and deploy.

### 3. Zero automated tests
`sportLifestyle.ts` (50 badges, tier logic, scoring, localStorage, sanitization)
and `admin.ts` (email parsing, role check) had no unit tests.

### 4. Render crashes show a blank screen
No React Error Boundary existed. Any unhandled render error produced a blank
screen with no recovery path for the user.

### 5. Mobile navbar was broken
Nav links were `hidden md:flex` with no mobile alternative. Users on phones
could not navigate without typing URLs directly.

## Non-goals
- No lazy-loading performance changes.
- No Husky or pre-commit hooks.
- No new runtime dependencies.
- No Supabase migrations.
- No redesign of any existing page or component.
