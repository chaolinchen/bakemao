# BakeMao 烘焙貓 — Changelog

---

## v1.1.5 — 2026-04-18
### Docs
- `CONTEXT.md`：待優化與下一步對齊 TASK-13、PRD §21-5（Sheet 搜尋框 scrollIntoView）、Vercel 自動部署說明。
- `CURSOR_TASKS.md`：頁首進度說明改為 12／14／15 已完成、TASK-13 待做。

---
## v1.1.4 — 2026-04-18
### Docs
- `PRD_BakeMao_v1.0.md` 同步至 **v1.6**（§20 多群組材料 workaround、§21 IngredientSearchSheet 鍵盤感知、模具 Segment／cc 換算、耗損、文案）。

### Feat
- 首頁 Onboarding 第二行：提示以「【群組名】」前綴區分材料（對齊 PRD §20）。

### Chore
- `public/sw.js`：PWA precache 清單更新（對齊最近一次 production build）。

---
## v1.1.3 — 2026-04-18
### Feat
- 模具清單：吐司 450g、12兩、塔模 7cm / 10cm。
- MoldSelector：下拉底部提示、形狀區標題、「杯型×數量」命名、容積附 1cc≈1g 說明；預設模具改為圓形 6 吋。

---
## v1.1.2 — 2026-04-18
### Fix
- Middleware: Edge 專用 `auth.config.ts`，避免 middleware 拉 Neon pool 造成 500。
- 儲存配方：未登入先開登入 sheet；auth sheet 移除未設定的 Apple 按鈕。
- 耗損預設改為備用 +0 / +1 / +2 快捷（loss preset）。

### Feat
- Onboarding 提示條（localStorage `bakemao_onboarded`，可關閉）。

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
