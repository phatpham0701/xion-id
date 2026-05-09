
## Mục tiêu
Tạo trang lịch sử thay đổi cho từng `profile`: ai sửa, sự kiện gì, lúc nào, diff nội dung — và cho phép admin khôi phục về một version cụ thể.

## 1. Database (migration)

Tạo bảng `profile_history` để snapshot mọi thay đổi:

```text
profile_history
├─ id              uuid pk
├─ profile_id     uuid (ref profiles.id)
├─ actor_id       uuid  (auth.uid() lúc đổi, nullable)
├─ actor_email    text  (snapshot)
├─ event          text  ('insert' | 'update' | 'delete' | 'restore' | 'demo_seed')
├─ source         text  ('user' | 'admin' | 'trigger' | 'demo')
├─ before         jsonb (toàn bộ row trước đó, null khi insert)
├─ after          jsonb (toàn bộ row sau đó, null khi delete)
├─ changed_keys   text[] (các cột đổi giá trị)
└─ created_at     timestamptz default now()
```

- Index: `(profile_id, created_at desc)`
- RLS: chỉ admin (`has_role(auth.uid(),'admin')`) đọc; insert qua trigger `SECURITY DEFINER`.

Trigger `profiles_audit_trg` AFTER INSERT/UPDATE/DELETE → ghi 1 dòng vào `profile_history`. Tính `changed_keys` bằng cách so từng key giữa `OLD` và `NEW` (json).

## 2. Backend hook cho sự kiện ngoài DB

- `src/lib/demoMode.ts` "Seed Paulus" hiện ghi đè state local trên trình duyệt → **không** ảnh hưởng DB. Để vẫn xuất hiện trong history, thêm hàm `logProfileEvent(profileId, event, before, after)` (insert vào `profile_history` qua RPC `SECURITY DEFINER` chỉ cho admin) và gọi trong `AdminDemoControls` khi seed/reset.

## 3. UI — trang `/admin/profiles/:profileId/history`

Trong `src/pages/admin/`:
- `AdminProfileHistory.tsx`
  - Header: avatar + `@username` + nút "Back to profile".
  - Bảng/timeline các bản ghi `profile_history` (mới → cũ): thời gian, actor (email), event, badge nguồn (user/admin/demo), danh sách `changed_keys`.
  - Click 1 dòng → mở `Sheet` với **diff view**: hiển thị từng key trong `changed_keys` ở dạng 2 cột "Trước / Sau" (text bình thường; với `theme`/`settings` jsonb thì pretty-print + highlight key đổi).
  - Nút **"Restore this version"** (chỉ hiện cho event có `before` hoặc `after`):
    - Confirm dialog.
    - Gọi `supabase.from('profiles').update(snapshot).eq('id', profileId)` với snapshot là `after` (hoặc `before` nếu user muốn về trạng thái trước đó).
    - Trigger sẽ tự ghi 1 dòng `event='restore'`.
    - Ghi `admin_audit_logs` với action mới `profile.restore`.

Thêm link "View history" trong `AdminProfiles.tsx` ở mỗi row, và route mới trong `App.tsx` (bọc bởi `RequireAdmin`).

## 4. Lib helper

- `src/lib/profileHistory.ts`
  - `fetchProfileHistory(profileId)`
  - `computeDiff(before, after)` → `{ key, before, after }[]`
  - `restoreProfileSnapshot(profileId, snapshot)`

## 5. Types & audit action

- `src/lib/admin.ts` → thêm `'profile.restore'` vào `AuditAction`.
- `src/integrations/supabase/types.ts` sẽ tự regenerate sau migration.

## 6. Test thủ công

1. Sửa display_name của 1 profile → xuất hiện 1 dòng `update` với `changed_keys=['display_name']`, diff đúng.
2. Vào `/admin/demo` bấm Seed Paulus → xuất hiện dòng `demo_seed` (source=`demo`).
3. Bấm Restore ở 1 version cũ → profile rollback, có dòng mới `event='restore'`.
4. Non-admin truy cập trang → bị `RequireAdmin` chặn.

## Giới hạn đã biết

- Diff jsonb hiển thị dạng pretty JSON, không phải word-level diff.
- History chỉ tính từ thời điểm bật trigger trở đi (không khôi phục được thay đổi trước migration).
- "Demo seed" chỉ được log nếu thao tác qua `AdminDemoControls`; sửa tay `localStorage` không ghi nhận.
