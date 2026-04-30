# Audit & Upgrade: Templates + Dashboard

## Findings — Templates (current state)

Reading `src/lib/templates.ts`, all 12 templates exist but suffer from real problems:

**Problem 1 — Identical filler content.** Almost every template uses the same generic placeholders:
- `name: "Your Name"`, `subtitle: "@yourhandle"` repeated in 8+ templates
- Bio text is vague ("A little about me…", "One short line about you.")
- Links are mostly empty: `url: "https://"`, `url: "https://cal.com/"`, `contract: ""`, `tokenId: ""`
- Result: when a user picks "Musician" vs "Developer", the rendered preview looks structurally similar — same avatar, same empty buttons

**Problem 2 — Weak differentiation.** Templates only differ in:
- Theme (background/font/accent) — this works
- Block ordering — minor
- A handful of link titles
But the *content depth* is the same shallow ~6 blocks. A creator template should feel like a creator profile out of the box.

**Problem 3 — Empty Web3 blocks are useless.** `wallet { address: "xion1..." }`, `nft { contract: "", tokenId: "" }`, `token_balance { token: "XION" }` (renders "— XION") all show placeholder dashes. User has to wire everything before it looks like anything.

**Problem 4 — Missing template variety.** No templates for: photographer, fitness coach, restaurant/local business, event, link-in-bio for IG/TikTok influencer, gamer/streamer, DAO/community, student.

**Problem 5 — No preview-first UX.** The gallery cards show only stacked grey rectangles — the user can't tell what makes "Designer" different from "Writer".

## Findings — Dashboard (current state)

Reading `src/pages/Dashboard.tsx`, the dashboard has only:
- Profile card with handle + URL + 3 buttons (Edit / Templates / Preview)
- 2 stat cards (views, clicks — last 7 days)
- A "Coming soon: XION wallet" placeholder

**Problems:**
1. **No way to edit display name, bio, or avatar from the dashboard.** Only `username` is set during onboarding; `display_name`, `bio`, `avatar_url` columns exist but have no UI.
2. **No publish/unpublish toggle.** `is_published` is enforced on the public route but there's no UI to flip it. Users can't take their profile offline.
3. **No QR code or share affordance** — critical for a link-in-bio product (people put it on phone screens, business cards, IG bios).
4. **Stats are anemic.** Just two numbers. No trend, no "top blocks", no "where clicks went", no time-series.
5. **No recent activity** — last visitors / last clicked block.
6. **Dead "Coming soon" card** wastes prime real estate.
7. **Onboarding doesn't suggest templates** — a fresh user lands on an empty editor instead of being nudged to start from a template.

## Plan

### Part 1 — Rewrite all templates with real, differentiated content

Replace placeholder text with concrete, persona-specific copy and realistic example URLs (still editable, but immediately recognizable). Each template gets:
- A **distinct persona name** (e.g. "Maya Chen" for Designer, "DJ Solace" for Musician) so previews feel alive
- A **specific bio** (1–2 sentences) that signals the persona
- **Real example URLs** pointing to category-appropriate destinations (e.g. real Spotify artist URL pattern, real GitHub URL pattern) — user replaces with their own
- **Visible Web3 content**: use a sample XION address + named NFT collection so the block renders meaningfully on first paste

Expand from 12 → **15 templates**, adding:
- **Photographer** (image-heavy, gallery-style)
- **Streamer / Gamer** (Twitch + Discord + game schedule)
- **Local Business** (hours, location, menu link, booking)

Each template will have ~7–10 blocks (currently 4–7), giving genuine starting content.

### Part 2 — Improve template gallery preview

Update `TemplateCard` in `TemplateGallery.tsx`:
- Render an actual mini preview using `BlockRenderer` (scaled down) instead of grey rectangles — so Designer shows an image block, Musician shows a music embed shape, Web3 shows a wallet card
- Show block count + block-type chips ("3 links · 1 NFT · tip jar")
- Add a "Live demo" link that opens the template as a real public profile preview at `/preview/template/:id`

### Part 3 — Make the dashboard genuinely useful

Replace current dashboard layout with:

**Header card (left, large):**
- Editable inline: avatar (upload to Supabase Storage), display name, bio
- Username (read-only with "request change" disabled — handles are permanent)
- Publish toggle switch (writes `is_published`) — clearly shows "Public" / "Hidden"
- Copy link, Open in new tab, **Download QR code** (use `qrcode` library, generate PNG)

**Quick actions row:**
- Edit blocks → /editor
- Browse templates → /templates
- Share → opens dialog with QR + social share buttons (Twitter, copy embed code)

**Analytics panel (right column):**
- Views (7d) with sparkline (group by day)
- Clicks (7d) with sparkline
- **Top 5 blocks by clicks** (last 30 days) — joined with block titles
- Click-through rate

**Recent activity list (below):**
- Last 10 events (view or click) with timestamp + block title (for clicks)
- Empty state with CTA: "Share your link to start collecting visits"

**Onboarding nudge:**
- After claiming handle, redirect to `/templates` (not editor) with a banner "Pick a starting point — you can customize everything"
- If user has 0 blocks, dashboard shows a prominent "Start from a template" hero card instead of analytics

### Technical details

**Files to edit:**
- `src/lib/templates.ts` — rewrite all entries, add 3 new ones
- `src/components/templates/TemplateGallery.tsx` — real previews via `BlockRenderer`, block-type chips
- `src/pages/Templates.tsx` — banner copy for onboarded users
- `src/pages/Dashboard.tsx` — full rewrite into sectioned layout
- `src/pages/Editor.tsx` — minor: redirect new users to templates

**Files to create:**
- `src/components/dashboard/ProfileEditorCard.tsx` — inline edit display_name, bio, avatar, publish toggle
- `src/components/dashboard/ShareDialog.tsx` — QR code + social share
- `src/components/dashboard/AnalyticsPanel.tsx` — sparklines, top blocks
- `src/components/dashboard/RecentActivity.tsx` — event feed
- `src/components/templates/TemplatePreview.tsx` — scaled mini-render of template using real `BlockRenderer`
- `src/pages/TemplatePreview.tsx` — full-page live preview at `/preview/template/:id`

**Dependencies to add:**
- `qrcode` (tiny, ~20KB) — for QR PNG generation. No external service needed.

**Database:**
- No schema changes required. All needed columns (`display_name`, `bio`, `avatar_url`, `is_published`) and the `analytics_events` table already exist.
- Need a Supabase Storage bucket `avatars` (public read, authenticated write to own folder) — will create via migration if it doesn't exist.

**Analytics queries:**
- Daily sparkline: `select date_trunc('day', created_at)::date as day, count(*) from analytics_events where profile_id = ? and event_type = ? and created_at > now() - interval '7 days' group by 1`
- Top blocks: join `analytics_events.block_id` with `blocks` table on click events, group by block_id, order by count desc limit 5

### Out of scope (Phase 2)
- XION wallet integration (Abstraxion social login + on-chain tip jar)
- Custom domain support
- Team/multi-profile accounts

### Approval checkpoint
After approval I will: rewrite templates → upgrade gallery previews → rebuild dashboard → wire QR + share dialog → add analytics panels.
