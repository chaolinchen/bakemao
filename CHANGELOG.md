# BakeMao 烘焙貓 — Changelog

---

## v1.1.1 — 2026-04-18
### Fix
- IngredientSearchSheet：以 `visualViewport` 動態 `maxHeight`（`BottomSheet` 新增 `panelStyle`）修正 iOS 鍵盤彈出時列表閃爍；placeholder 改為「搜尋食材，找不到可直接輸入」；「直接使用」列加上 ➕ 圖示、字級 `text-base font-medium`。

---

## v1.0.0 — 2026-04-17
### Feat（MVP 首次上線）
- 計算引擎：模式 A（百分比）/ 模式 B（克數反推）
- 模具選擇：14 種預設模具、圓柱/長方/馬芬/直接 cc 自訂
- 配方輸入：食材搜尋（含別名）、品牌選擇、比例/固定切換
- 計算結果：即時顯示克數、橫條比例圖、耗損說明
- 配方管理：Google 登入、儲存/載入/刪除配方（Neon PostgreSQL）
- 分享結果圖：html2canvas + logo 浮水印
- PWA：離線可用、Wake Lock、App Shell 快取
- 修復 Maximum update depth（Zustand useShallow）

### Tech
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Zustand（狀態管理）
- Neon（serverless PostgreSQL，prod + dev branch）
- NextAuth.js v5 + @auth/neon-adapter（Google OAuth）
- @ducanh2912/next-pwa
