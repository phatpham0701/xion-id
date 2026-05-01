# XionID — Roadmap & Status

## ✅ Completed

### Step 1 — XION wallet connection (Abstraxion)
- `AbstraxionProvider` configured with treasury, gasless gas-grant.
- `useXionWallet` hook + `WalletCard` syncs `xion_address` to `profiles`.

### Step 2 — On-chain Tip Jar (gasless)
- `tip_jar` block + `LiveTipJarBlock` (visitor signs, treasury pays gas).
- `tips` table + `TipAnalyticsCard` (totals + recent tippers).

### Step 3 — NFT Gallery on-chain
- `nft_gallery` block + `LiveNftGalleryBlock`.
- CW721 client over LCD smart-query (`tokens`, `nft_info`, `contract_info`).
- IPFS → HTTP rewrite, off-chain metadata merge.

### Step 4 — Wallet history + auto badges
- `badgeScanner` queries LCD `cosmos/tx/v1beta1/txs` for sender + recipient.
- Awards: OG 2024/2025, NFT Collector, NFT Minter, Tipper, dApp Explorer (tiered).
- `BadgesCard` (dashboard scan UI) + `PublicBadgesStrip` (public profile).

### Security hardening
- Linter: **0 warnings**.
- Avatars bucket: public read by-object only, listing blocked.
- `analytics_events`: only allows whitelisted event types.
- `has_role`: EXECUTE revoked from anon/authenticated (RLS still works via SECURITY DEFINER).

---

## 🟡 Recommended next

### Step 5 — Server-side tip verifier (hardening)
**Why:** today the client inserts into `tips` after broadcast. A bad actor could call the API directly and lie about `tx_hash`. Public leaderboards are one INSERT away from being polluted.

**Plan:**
- Edge function `verify-tip` that takes `{ tx_hash, profile_id }`, queries the LCD `txs/{hash}` endpoint, parses `MsgSend` events, validates: sender, recipient (= profile.xion_address), amount, denom = `uxion`.
- Lock down the `tips` INSERT policy to only allow rows where `tx_hash` matches a row in a new `verified_tips` view written by the edge function (or simply remove client INSERT and let the edge function do it via service role).
- Add rate limit by IP + sender_address.

### Step 6 — XION token-gated content
**Why:** unlock new use cases — gated link, gated calendar booking, gated download.

**Plan:**
- New block `gated_link` with config `{ url, requirement: { type: 'token' | 'nft' | 'badge', contract?, minBalance?, kind? } }`.
- Check on the client: query CW20 / CW721 / `wallet_badges` and reveal CTA only when satisfied.
- Server-side enforcement deferred until a backend reverse-proxy is added.

### Step 7 — Public showcase feed + leaderboards
- `/explore` — paginated feed of top profiles by tips received this week.
- `/leaderboard/tippers` — top tippers (sender_address aggregate).
- `/leaderboard/og` — earliest XION wallets connected on XionID.
- These motivate users to set up a profile (social pressure + visibility).

### Step 8 — Custom domain support
- Per-profile custom domain mapping via Cloudflare-for-SaaS-style.
- Verified via TXT record.
- (Out of scope until billing exists — most useful as a Pro perk.)

### Step 9 — Pro tier (optional)
- Custom domain, more blocks per profile, priority badge scan, deeper analytics.
- Payments via Stripe edge function (Lovable Stripe connector).

---

## 🔒 RLS posture (audit checklist)

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|
| `profiles` | public | own (`auth.uid() = user_id`) | own | own | username uniqueness via trigger |
| `blocks` | public | profile owner | profile owner | profile owner | |
| `tips` | public | anon+authed (length+amount checks) | **denied** | **denied** | tx_hash unique; needs server verifier (Step 5) |
| `wallet_badges` | public | profile owner | profile owner | profile owner | unique on (profile_id, kind) |
| `analytics_events` | profile owner | anon+authed (whitelisted event_type) | **denied** | **denied** | append-only |
| `user_roles` | own row only | admin only | admin only | admin only | privilege-escalation safe |
| `storage.objects` (avatars) | public-by-object (no listing) | own folder | own folder | own folder | |
