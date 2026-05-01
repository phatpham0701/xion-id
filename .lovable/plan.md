# Step 2 — On-chain Tip Jar (gasless via Treasury)

## A) Quick fix first
Convert `App` from arrow to function declaration in `src/App.tsx` to silence the `Function components cannot be given refs` warning from `lovable-tagger`.

## B) Tip Jar — what we build

A new block type **`tip_jar`** that any visitor can use to send XION (uxion) directly to the profile owner's wallet, with the gas fee sponsored by your treasury contract (so visitors pay 0 gas).

### User flow
1. Owner adds "Tip Jar" block from the Block Library → picks suggested amounts (e.g. 1 / 5 / 10 XION) + optional message prompt.
2. Visitor opens public profile → clicks "Tip 5 XION" → Abstraxion modal opens (Meta Account login if not connected) → signs → tx broadcast → success toast with Mintscan link.
3. Tip is recorded on-chain (MsgSend) AND mirrored into a new `tips` table for analytics/leaderboard.

### Database (1 migration)
```sql
create table public.tips (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,            -- recipient profile
  block_id uuid,                        -- which tip_jar block
  recipient_address text not null,      -- owner's xion_address at time of tip
  sender_address text not null,         -- visitor's xion_address
  amount_uxion bigint not null,         -- raw uxion amount
  message text,                         -- optional, max 280 chars
  tx_hash text not null unique,
  block_height bigint,
  created_at timestamptz not null default now()
);
-- RLS: public SELECT (for leaderboards), INSERT allowed for anon+authed
--      (tx_hash uniqueness + on-chain verification keeps it honest)
```
Add `tip_jar` to the existing `block_type` enum.

### Files to create
- `src/lib/tipJar.ts` — build `MsgSend`, broadcast via `useAbstraxionSigningClient`, parse tx hash/height, record into `tips` table.
- `src/components/blocks/TipJarBlock.tsx` — visitor-facing UI: amount chips, custom amount, optional message, "Connect & Tip" button, success state with explorer link.
- `src/components/blocks/TipJarInspector.tsx` — owner editor: title, suggested amounts, allow custom amount, allow message, min/max amount.
- `src/hooks/useTipHistory.ts` — fetch tips for a profile (recent + totals).
- `src/components/dashboard/TipAnalyticsCard.tsx` — owner dashboard widget: total received, tip count, top tippers, recent tips list with explorer links.

### Files to edit
- `src/lib/blocks.ts` — register `tip_jar` block type with default config.
- `src/components/editor/BlockLibrary.tsx` — add Tip Jar to library (with ⚡ icon, "On-chain" badge).
- `src/components/editor/BlockRenderer.tsx` — render `TipJarBlock` for `tip_jar` type.
- `src/components/editor/Inspector.tsx` — wire `TipJarInspector` for `tip_jar`.
- `src/pages/Dashboard.tsx` — add `TipAnalyticsCard` to the right column (only if owner has at least one tip_jar block).
- `src/App.tsx` — fix forwardRef warning.

### Technical details
- **Gasless**: pass treasury address in `granter` field of fee, so the treasury fee grant pays gas. This is already enabled because `AbstraxionProvider` is configured with `treasury`.
- **Validation**: amount must be > 0 and ≤ 1000 XION (sanity cap, configurable per block). Message capped at 280 chars, sanitized.
- **Owner must have wallet connected**: if profile owner has no `xion_address`, the Tip Jar block renders a friendly "Owner hasn't connected a wallet yet" state instead of a broken button.
- **Tip recording**: after broadcast success, client-side `INSERT` into `tips` with the on-chain tx_hash. Uniqueness on `tx_hash` prevents duplicates. (A future hardening step would be a server-side verifier edge function — noted for Step 3.)
- **Analytics**: also fire an `analytics_events` row with `event_type = 'tip_sent'` for the existing analytics panel.

### Out of scope for this step (saved for later)
- NFT gallery on-chain fetch → Step 3
- Wallet history scan + auto badges (OG 2024, NFT collector, dApp explorer) → Step 4
- Server-side tip verifier edge function → hardening pass
