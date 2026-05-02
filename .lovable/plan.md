# XionID — Roadmap & Status

## ✅ Completed

### Step 1 — XION wallet connection (Abstraxion)
- `AbstraxionProvider` configured with treasury fallback + iframe-aware connect.
- `useXionWallet` hook + `WalletCard` syncs `xion_address` to `profiles`.

### Step 2 — On-chain Tip Jar (gasless)
- `tip_jar` block + `LiveTipJarBlock` (visitor signs, treasury pays gas).
- `tips` table + `TipAnalyticsCard` (totals + recent tippers, skeleton loaders).

### Step 3 — NFT Gallery on-chain
- `nft_gallery` block + `LiveNftGalleryBlock`.
- CW721 client over LCD smart-query, IPFS → HTTP rewrite.

### Step 4 — Wallet history + auto badges
- `badgeScanner` queries LCD `cosmos/tx/v1beta1/txs`.
- `BadgesCard` + `PublicBadgesStrip`.

### Step 5 — Server-side tip verifier ✅ (NEW)
- Edge function `verify-tip`:
  - Validates tx via XION LCD: `MsgSend` only, recipient = profile.xion_address, denom `uxion`, code = 0, amount within sane bounds.
  - Writes `tips` with **service role** (bypasses RLS).
  - Idempotent on unique `tx_hash`; returns `verified | already_recorded | pending`.
  - In-memory IP rate limit (20 req/min).
- Migration: dropped public INSERT policy on `tips`. Clients can no longer spoof tips. Indexes added for `(profile_id, created_at)` and `tx_hash`.
- Frontend: `verifyAndRecordTip` replaces client INSERT, with one background retry after 8s if LCD hasn't indexed yet.
- Analytics: tip success now logs `tip_sent` (whitelisted event type).

### Security hardening
- Linter: 0 warnings.
- Avatars bucket: public-by-object only.
- `analytics_events`: whitelisted event types.
- `has_role`: EXECUTE revoked from anon/authenticated.
- `tips`: server-only writes.

---

## 🟡 Recommended next

### Step 6 — XION token-gated content
- New block `gated_link` with config `{ url, requirement: { type: 'token' | 'nft' | 'badge', contract?, minBalance?, kind? } }`.
- Client checks CW20/CW721/`wallet_badges` and reveals CTA.

### Step 7 — Public showcase feed + leaderboards
- `/explore`, `/leaderboard/tippers`, `/leaderboard/og`.

### Step 8 — Custom domain (Pro perk).

### Step 9 — Pro tier billing (Stripe edge function).

---

## 🔒 RLS posture

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|
| `profiles` | public | own | own | own | username trigger |
| `blocks` | public | owner | owner | owner | |
| `tips` | public | **server only** | denied | denied | verified by `verify-tip` edge function |
| `wallet_badges` | public | owner | owner | owner | unique (profile_id, kind) |
| `analytics_events` | profile owner | anon+authed (whitelisted event_type) | denied | denied | append-only |
| `user_roles` | own row | admin | admin | admin | escalation-safe |
| `storage.objects` (avatars) | by-object | own folder | own folder | own folder | |
