
# Phase 2 – Step 1: Abstraxion Wallet Foundation

Bước đầu tiên của Xion integration: cho phép user đăng nhập ví XION qua Abstraxion (Meta Account / social login), lưu địa chỉ `xion1...` vào profile, và chuẩn bị schema cho các step sau (tip jar, on-chain badges, NFT scanner).

## Phạm vi step này

1. Cài Abstraxion SDK + cấu hình XION testnet-2 với treasury của bạn.
2. Bọc app bằng `AbstraxionProvider` (có config gasless qua treasury).
3. Tạo hook `useXionWallet()` thống nhất (connect / disconnect / address / status).
4. Mở rộng `profiles` table với `xion_address` + `wallet_connected_at`.
5. UI mới trong **Dashboard** & **Editor**: nút "Connect XION Wallet" với badge trạng thái.
6. Hiển thị địa chỉ XION (truncated `xion1m6...8h`) trên public profile khi đã connect.
7. Tạo bảng `wallet_badges` (chưa cấp badge — chỉ schema + RLS, để Step 3 fill data on-chain).

Các step **chưa làm** trong lần này (sẽ làm tiếp sau khi Step 1 chạy ổn):
- Step 2: Tip Jar gửi XION on-chain qua treasury.
- Step 3: Edge function scanner quét tx history → cấp badges (OG 2024, NFT Holder, Tipper, dApp user…).
- Step 4: Tip history + analytics.

## Technical details

### Packages
- `@burnt-labs/abstraxion` — Meta Account / social login wallet
- `@burnt-labs/abstraxion-core`
- `@burnt-labs/ui` — base styles cho modal Abstraxion (chỉ import CSS)
- `@cosmjs/stargate` — sẵn sàng cho Step 2 query/broadcast

### Cấu hình XION (file mới `src/lib/xion.ts`)
```ts
export const XION_CONFIG = {
  treasury: "xion1m69vedc7x4p0rx3gkgwyrk87qnqda62evvwut7923evqztnx97gq3cst8h",
  rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
  restUrl: "https://api.xion-testnet-2.burnt.com:443",
  chainId: "xion-testnet-2",
  denom: "uxion",
  explorerTx: (h: string) => `https://explorer.burnt.com/xion-testnet-2/tx/${h}`,
  explorerAddr: (a: string) => `https://explorer.burnt.com/xion-testnet-2/account/${a}`,
};
```
Không cần secret — đây là endpoints public testnet. Step sau nếu chuyển mainnet, swap qua `import.meta.env`.

### Provider tree (`src/App.tsx`)
Bọc thêm `AbstraxionProvider` ngay trong `BrowserRouter`, truyền `treasury`, `rpcUrl`, `restUrl`. Import `@burnt-labs/abstraxion/dist/index.css` ở `main.tsx`.

### Hook `src/hooks/useXionWallet.ts`
Wrap `useAbstraxionAccount` + `useModal` của Abstraxion để expose API tối giản cho UI:
```ts
{ address, isConnected, isConnecting, connect(), disconnect(), openModal() }
```
Khi `address` xuất hiện và user đã đăng nhập Supabase → gọi `syncWalletToProfile(address)` (upsert `xion_address` + `wallet_connected_at` vào profile của user).

### Database changes (migration)
```sql
-- profiles: thêm 2 cột
ALTER TABLE public.profiles
  ADD COLUMN xion_address text,
  ADD COLUMN wallet_connected_at timestamptz;

CREATE UNIQUE INDEX profiles_xion_address_unique
  ON public.profiles(xion_address) WHERE xion_address IS NOT NULL;

-- wallet_badges: chuẩn bị cho Step 3
CREATE TYPE public.badge_kind AS ENUM (
  'og_2024','og_2025','nft_collector','nft_minter','tipper',
  'dapp_explorer','campaign_participant','contest_winner','whale','early_adopter'
);

CREATE TABLE public.wallet_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  xion_address text NOT NULL,
  kind public.badge_kind NOT NULL,
  tier int NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, kind)
);

ALTER TABLE public.wallet_badges ENABLE ROW LEVEL SECURITY;

-- ai cũng xem được (public profile hiển thị badge)
CREATE POLICY "Badges viewable by everyone"
  ON public.wallet_badges FOR SELECT USING (true);

-- chỉ owner xoá; insert/update do service role làm (qua scanner edge fn ở Step 3)
CREATE POLICY "Owners can delete their badges"
  ON public.wallet_badges FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
```
RLS giữ nguyên pattern hiện có. `xion_address` không bị giới hạn unique cứng giữa user (cùng ví không thể link 2 profile, nhờ partial unique index).

### UI changes

**`src/components/dashboard/WalletCard.tsx` (mới)**
Card glass hiển thị:
- Chưa connect → button "Connect XION Wallet" (gradient primary, icon ⚡).
- Đã connect → avatar gradient + địa chỉ truncated + "Copy" + "View on explorer" + "Disconnect".
- Placeholder section "Badges (verified on-chain)" với skeleton + chú thích "Step 3 sẽ tự động quét và cấp huy hiệu".

Nhúng card này vào **Dashboard** (cột phải, trên `AnalyticsPanel`) và một version compact trong header **Editor**.

**`src/pages/PublicProfile.tsx`**
Khi `profile.xion_address` có giá trị → render badge nhỏ dưới display name:
```
⚡ xion1m6...st8h   ✓ Verified wallet
```
Click mở explorer ở tab mới. Chỉ hiển thị nếu owner đã connect.

**`src/components/editor/BlockRenderer.tsx`** — block `wallet`
Nếu `c.address` rỗng nhưng owner đã connect ví → auto fallback dùng `profile.xion_address` thay vì để trống. Việc này khiến block "wallet" trở nên zero-config.

### Validation & UX
- Toast: "Wallet connected ⚡" / "Disconnected".
- Đang connecting hiển thị Loader2 spinner trong button.
- Nếu Abstraxion modal bị đóng giữa chừng → silent (không toast lỗi).
- Lỗi thực sự (treasury sai, RPC down) → `toast.error` kèm description ngắn.

### Files sẽ tạo / sửa
- create `src/lib/xion.ts`
- create `src/hooks/useXionWallet.ts`
- create `src/components/dashboard/WalletCard.tsx`
- edit `src/App.tsx` (bọc `AbstraxionProvider`)
- edit `src/main.tsx` (import CSS Abstraxion)
- edit `src/pages/Dashboard.tsx` (mount `WalletCard`)
- edit `src/pages/Editor.tsx` (compact wallet status ở header)
- edit `src/pages/PublicProfile.tsx` (verified wallet badge)
- edit `src/components/editor/BlockRenderer.tsx` (fallback address cho block `wallet`)
- migration: cột `xion_address` + bảng `wallet_badges`

## Acceptance criteria
1. Bấm "Connect XION Wallet" → modal Abstraxion mở → đăng nhập email/social → modal đóng → địa chỉ `xion1...` xuất hiện trong card.
2. Reload trang → wallet vẫn connected (Abstraxion tự persist), `xion_address` đã ghi vào DB.
3. Bấm "Disconnect" → ví ngắt, địa chỉ biến mất khỏi UI (DB giữ nguyên để badges Step 3 không mất — chỉ clear khi user xoá hẳn profile).
4. Public profile của user hiển thị verified wallet badge với địa chỉ truncated.
5. Block `wallet` trong editor tự lấy địa chỉ XION nếu owner để trống config.
6. Không có console error; bundle build sạch.

Nếu OK mình bắt đầu thực thi ngay. Sau khi Step 1 chạy mượt, mình tiếp tục Step 2 (Tip Jar on-chain).
