# Change: Fix Mobile Navbar Panel

## Problem
On mobile web view, the landing page mobile navigation dropdown appears as a transparent/full-width overlay below the header. When opened, menu links visually overlap the hero content, making the navigation look blurred and misaligned.

## Goal
Make the mobile menu behave like a contained right-aligned panel anchored under the mobile CTA/hamburger area.

## Scope
- Update `src/components/landing/Navbar.tsx` only.
- Keep desktop navigation unchanged.
- Keep authenticated vs unauthenticated CTA behavior from PR #19.
- Preserve current public copy and shell-safe positioning.

## Non-goals
- No auth/onboarding changes.
- No dashboard changes.
- No product copy rewrite.
- No broad landing redesign.
- No new dependencies.
