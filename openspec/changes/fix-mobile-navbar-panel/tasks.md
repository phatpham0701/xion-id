# Tasks — fix-mobile-navbar-panel

## T1 — Mobile panel positioning ✅
- Replace the previous full-width/transparent mobile dropdown with a right-aligned floating panel.
- Anchor it below the mobile CTA/hamburger area.
- Keep it above hero content with a high z-index.

## T2 — Panel visual containment ✅
- Add background, border, rounded corners, shadow, and backdrop blur to the panel container.
- Keep menu links readable and separated from hero text.

## T3 — Preserve behavior ✅
- Keep desktop nav unchanged.
- Keep logged-in users routed to `/dashboard`.
- Keep logged-out users routed to `/auth`.
- Keep menu close-on-click behavior.

## Manual smoke checklist
- [ ] Mobile landing page: tap hamburger; menu opens inside a right-aligned panel.
- [ ] Panel does not overlap hero text in a transparent/blurred way.
- [ ] Close button remains on the right beside the CTA.
- [ ] Tap Product/Templates/Demo/Sign in/Dashboard closes the menu.
- [ ] Desktop navbar remains unchanged.
- [ ] Logged-in mobile user sees Dashboard CTA.
- [ ] Logged-out mobile user sees Get started CTA.

## Known limitations
- Visual verification should be done on a real mobile viewport after deployment.
