## XIONProfile — Linktree cho Web3 trên XION

Web app cho phép user đăng nhập bằng social login, tạo profile/portfolio cá nhân bằng drag-and-drop, decorate thoải mái, share qua link `xionprofile.com/username`. Approach: **MVP UI trước, tích hợp XION Abstraxion sau** — giúp bạn vibe-code solo nhanh, có sản phẩm chạy được rồi mới gắn blockchain.

---

### Phase 1 — MVP (lần này build)

**1. Landing page**
- Hero glassmorphism, gradient aurora (deep navy `#1a1a2e` → indigo `#16213e`, accent mint `#4ade80` & purple `#a78bfa`)
- Tagline "Your Web3 identity, beautifully crafted — free forever on XION"
- CTA "Claim your xionprofile" → mở modal chọn username + social login
- Section: live demo profile preview, feature highlights, "How it works" 3 bước
- Font: Space Grotesk (heading) + DM Sans (body)

**2. Auth (mock cho MVP)**
- Lovable Cloud auth: Email + Google sign-in (mô phỏng "social login → wallet" UX của XION Meta Account)
- Sau signup: chọn username duy nhất → tạo profile trống
- Profile của user lưu ở Cloud database (không lên chain — free 100%, load nhanh)

**3. Editor — Drag & Drop Studio**
Layout 3 cột:
- **Trái:** thư viện block (kéo vào canvas)
- **Giữa:** mobile-frame canvas live preview, kéo-thả-sắp-xếp-lại block
- **Phải:** inspector chỉnh sửa block đang chọn + tab "Theme"

**Block types:**
- *Cơ bản:* Link button, Heading, Text, Avatar, Social icons (X, GitHub, Discord, Telegram, Farcaster, Lens)
- *Web3:* Wallet address (copy + QR), NFT showcase (grid ảnh + link explorer), Token balance card
- *Media:* Image, YouTube/Vimeo embed, Spotify embed
- *Advanced:* Tip jar (XION — UI sẵn, hook on-chain ở Phase 2), Contact form (gửi vào Cloud), Calendar embed

**4. Customization Studio (full)**
- **Background:** solid color, gradient (2-3 stop, angle), upload ảnh, preset aurora gradients
- **Fonts:** ~15 Google Fonts pairs cho heading + body
- **Buttons:** shape (pill / rounded / square / outline / glass), shadow, hover effect
- **Animations:** entrance (fade, slide, scale) cho block, hover micro-interactions
- **Theme presets:** 8 sẵn (Glass Aurora, Neon Mint, Minimal Paper, Brutalist, Retro Synthwave, Sakura, Midnight, Sunset)
- **Custom CSS** (advanced toggle, optional)

**5. Public profile page** `/{username}`
- Render full block list với theme đã chọn
- SEO meta + OG image động
- Nút "Built with XIONProfile" footer (có thể tắt)
- Share button (copy link, QR code)

**6. Dashboard**
- List profiles của user, analytics đơn giản (view count, click count per block)
- Edit / Preview / Share / Delete

---

### Phase 2 — XION Integration (sau khi MVP duyệt)
- Tích hợp `@burnt-labs/abstraxion` thay mock auth → social login thật → Meta Account trên XION testnet
- Treasury contract config để gasless cho user (free 100%)
- Wire Tip jar block với XION tx thật
- Optional: pin profile metadata snapshot lên chain để verify ownership

---

### Technical details

- **Frontend:** React + Vite + TypeScript + Tailwind (đã có), shadcn/ui
- **Drag & drop:** `@dnd-kit/core` + `@dnd-kit/sortable` (accessible, performant, modern)
- **State:** Zustand cho editor state; React Query cho server data
- **Backend:** Lovable Cloud
  - Tables: `profiles` (user_id, username unique, theme jsonb, settings jsonb), `blocks` (profile_id, type, order, config jsonb), `analytics_events`
  - Storage bucket: `avatars`, `profile-media` (public)
  - RLS: user chỉ edit profile của mình; public read profiles + blocks theo username
- **Routing:** thêm routes `/auth`, `/dashboard`, `/editor/:profileId`, `/:username`
- **Design tokens:** mở rộng `index.css` với HSL semantic tokens cho glass aurora theme + utility cho glassmorphism (backdrop-blur, gradient borders)

---

### Out of scope (lần này)
- XION on-chain integration (Phase 2)
- Custom domain mapping `xionprofile.com/...` (cần domain thật + DNS — sẽ làm khi deploy)
- Marketplace theme cộng đồng, premium features (project free 100%)
- Multi-language

Bấm **Implement plan** để mình bắt đầu build Phase 1.