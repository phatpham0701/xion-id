
# Step 5 — Server-side tip verifier + product flow polish

Mục tiêu: chặn spoofed tips (hiện tại bất kỳ ai cũng có thể `INSERT` vào `tips` với `tx_hash` giả vì RLS chỉ check độ dài), đồng thời tinh chỉnh trải nghiệm tip để feel mượt và đáng tin hơn.

---

## A. Server-side tip verifier (bảo mật)

### A1. Edge function mới: `verify-tip`
- Đường dẫn: `supabase/functions/verify-tip/index.ts`
- `verify_jwt = false` (anon visitor cũng tip được, không cần đăng nhập).
- Input (Zod-validated):
  ```ts
  { tx_hash: string(40..128), profile_id: uuid, block_id?: uuid, message?: string(<=280) }
  ```
- Logic:
  1. Lookup `profiles` (service role) để lấy `xion_address` của recipient. Nếu profile không có ví → 400.
  2. Gọi LCD: `GET {restUrl}/cosmos/tx/v1beta1/txs/{tx_hash}`.
     - Retry 5 lần × 1.2s (mempool propagation), bỏ cuộc nếu vẫn 404.
     - Yêu cầu `tx_response.code === 0`.
  3. Parse `tx.body.messages[]` chỉ chấp nhận `@type === "/cosmos.bank.v1beta1.MsgSend"`:
     - `to_address === profile.xion_address`
     - tổng `amount` denom `uxion`, > 0, ≤ `1_000_000_000_000` (1M XION sanity cap)
     - Lấy `from_address` đầu tiên làm `sender_address`.
  4. Insert vào `tips` qua **service role** (bỏ qua RLS):
     - `tx_hash` UNIQUE → conflict = 200 idempotent (`{ status: "already_recorded" }`).
  5. Trả về `{ status: "verified", amount_uxion, sender_address, block_height }`.
- Rate limit nhẹ: in-memory map `ip → 10 req / 60s`.
- CORS đầy đủ + log gọn (hash, profile_id, status).

### A2. Migration — khóa bảng `tips`
- DROP policy `"Anyone can insert a tip after on-chain broadcast"`.
- Không tạo policy INSERT mới → mọi insert bằng anon/authed key bị từ chối; chỉ service role (edge function) ghi được.
- Giữ policy SELECT public, vẫn không UPDATE/DELETE.
- Thêm index nếu chưa có: `CREATE INDEX IF NOT EXISTS tips_profile_created_idx ON tips (profile_id, created_at DESC);`.

### A3. Frontend đổi đường ghi tip
- `src/lib/tipJar.ts`:
  - Bỏ insert trực tiếp trong `recordTip`. Thay bằng `verifyAndRecordTip(...)` gọi `supabase.functions.invoke("verify-tip", { body: ... })`.
  - Trả về `{ status: "verified" | "already_recorded" | "pending" }`.
- `src/components/blocks/LiveTipJarBlock.tsx`:
  - Sau khi `sendTip` xong → hiện toast “Confirming on-chain…”, gọi verifier (đã có retry trong edge function).
  - Nếu verifier trả `pending` (hash chưa indexed sau ~6s) → vẫn show success UI với explorer link, badge nhỏ “Verifying…”, và background retry 1 lần sau 8s.
  - Nếu `verified` / `already_recorded` → success UI bình thường.

---

## B. Polish flow sản phẩm (gom nhiều fix nhỏ)

### B1. `useXionWallet` — tránh re-prompt khi refresh
- Hiện tại refresh → Abstraxion modal có thể tự mở lại nếu session hỏng. Bọc `login()` trong try/catch + chỉ mở modal khi user nhấn nút. Không tự gọi `login()` ở mount (đã đúng, nhưng thêm guard `isConnecting` để tránh double-prompt khi user click nhanh).
- Thêm callback “open in new tab” nếu chạy trong iframe Lovable preview (dùng `window.top !== window.self` check). Hiện popup Abstraxion bị chặn khi nhúng iframe → show toast hướng dẫn mở preview ở tab mới.

### B2. Empty / loading states đồng bộ
- `TipAnalyticsCard`: loading skeleton thay vì dấu “—”.
- `BadgesCard`: nếu chưa connect ví → CTA “Connect wallet to scan badges” trỏ tới `WalletCard`.
- `LiveTipJarBlock` empty state khi owner chưa có ví: thêm nút share để owner tự thấy (chỉ render khi `isOwner` — pass thêm prop từ `PublicProfile`).

### B3. `recordTip` legacy export
- Giữ `recordTip` là wrapper deprecated gọi `verifyAndRecordTip` để không vỡ import khác (nếu có).

### B4. Analytics
- Đổi `trackEvent(profileId, "block_click", blockId)` thành `"tip_sent"` cho tip thành công (đã nằm trong whitelist `analytics_events`).

---

## C. QA checklist sau khi triển khai

1. Build & typecheck pass.
2. Manual: gửi tip thật từ một ví test → row `tips` xuất hiện qua edge function, không qua client insert.
3. Negative test: thử `supabase.from("tips").insert({...})` từ console → bị từ chối bởi RLS (no INSERT policy).
4. Negative test: gọi `verify-tip` với `tx_hash` ngẫu nhiên → 404/422, không tạo row.
5. Idempotency: gọi `verify-tip` 2 lần cùng `tx_hash` → lần 2 trả `already_recorded`, không duplicate.
6. Linter Supabase: 0 warning mới.
7. Cập nhật `.lovable/plan.md`: Step 5 → ✅, đẩy Step 6 (token-gated content) lên “Recommended next”.

---

## Files dự kiến

- **new** `supabase/functions/verify-tip/index.ts`
- **new** migration: drop tip insert policy + index
- **edit** `src/lib/tipJar.ts` (verifyAndRecordTip + deprecate recordTip)
- **edit** `src/components/blocks/LiveTipJarBlock.tsx` (gọi verifier, pending UX)
- **edit** `src/components/dashboard/TipAnalyticsCard.tsx` (skeleton)
- **edit** `src/components/dashboard/BadgesCard.tsx` (CTA khi chưa có ví)
- **edit** `src/hooks/useXionWallet.ts` (iframe guard, double-click guard)
- **edit** `.lovable/plan.md` (đánh dấu Step 5 done)

Sau khi bạn duyệt, tôi sẽ chuyển sang default mode để triển khai theo đúng thứ tự A → B → C.
