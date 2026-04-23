# BakeMao 烘焙貓 — Changelog

---

## v1.5.1 — 2026-04-23
### Chore
- MultiComponentSection.tsx（1400 行）拆成三個檔案：MultiComponentCard.tsx（~380 行）、MultiTemplateDialog.tsx（~110 行）、MultiComponentSection.tsx（~250 行）
- 落實單檔 ≤ 400 行規則，降低未來 session 讀檔成本

---

## v1.5.0 — 2026-04-23
### Feat
- 統一儲存入口：SaveRecipeBar 底部按鈕改為「儲存配方」，BottomSheet 內提供「存到配方本（本機·免登入）」與「雲端備份（Google 登入）」兩選項
- 未登入時點雲端備份直接跳 Google OAuth，不再顯示額外對話框
### Fix
- 移除多組工具列的「存配方」按鈕（功能已整合至底部統一入口）
- 工具列改為兩行排版：第一行標題＋「＋新配方」，第二行截圖/配方本/範本/CSV，解決手機按鈕換行問題

---

## v1.4.3 — 2026-04-23
### Fix
- 截圖改為擷取 `#multi-section-root` 而非整個 `main`，解決含 GlobalQtyCard 的跑版問題；onclone 隱藏所有按鈕與 `[data-screenshot-hide]` 元素
- 截圖彈窗新增「IG 備料卡分享」按鈕，使用跨組合彙整材料清單生成 1080×1080 卡片
- 過濾空白名稱材料列（`name.trim() === ''` 不渲染），消除清單中的空白卡片
- SavedRecipesSheet 標題下方加副標題「本機儲存，不需登入」，區隔本機與雲端儲存

---

## v1.4.2 — 2026-04-23
### Fix
- B1：SaveRecipeBar 底部大按鈕改為「雲端備份配方」，與多組件區「存到配方本」語意明確分離（雲端登入 vs 本機 localStorage）
- B2：克數輸入模式補顯「每份合計：XXXg」即時數值，讓師傅確認每份用料總重是否符合預期

---

## v1.4.1 — 2026-04-23
### Fix
- Enter 跳欄後延遲 100ms 再 scrollIntoView，解決 iOS 鍵盤開啟時基準偏移問題
- IG 分享圖克數格式：整數顯示整數（100g），有小數才顯示一位（12.5g）

---

## v1.4.0 — 2026-04-23
### Feat
- 全域 Toast 系統（pub/sub，底部 pill，2.5s 自動消失）；儲存配方改用 Toast 取代行內綠字
- SavedRecipesSheet 改版：刪除鍵移至左側（防誤觸），多組件配方卡片顯示組件名稱縮略（最多 3 個）
- Enter 跳欄後補 scrollIntoView({ block: 'center' }) 確保欄位置中
### Fix
- Print CSS：@page A4 margin、page-break-inside avoid、克數粗體、材料分隔線
- IG Canvas：長文字 truncateText 截斷保護 + requestAnimationFrame Safari race condition 修復
- IG Canvas 克數格式統一 toFixed(1)

---

## v1.3.0 — 2026-04-23
### Feat
- 烘焙百分比可折疊說明 tooltip（`[?] 什麼是烘焙百分比？`），單配方＋多組件模式皆有
- NumberInput Enter 鍵自動跳下一個 `[data-ingredient-input]` 欄位
- 配方儲存/配方本（localStorage，最多 20 筆）：SavedRecipesSheet 底部抽屜，含名稱/日期/類型 badge/載入/刪除二次確認
- IG 分享圖：1080×1080 Canvas 直接生成（generateIgCard），品牌色+橫條比例圖，shareIgCard 支援 Web Share API
- @media print 列印樣式：隱藏按鈕/nav，A4 版面，克數大字
### Fix
- html2canvas 截圖跑版：補 windowWidth / scrollX / scrollY / height，解決手機版跑版
- MultiComponentSection html2canvas 截圖 height 改用 scrollHeight（截完整內容）

---

## v1.2.5 — 2026-04-22
### Feat（v3.0 設計改版 Option A 雲朵奶蓋）
- 設計系統：sky blue bg #E6EEF5、cream #FFFBF2、chocolate #6B4A2F、orange #C8602A；.mao-card、.mao-pill CSS class
- 字型：Baloo 2 + Roboto Mono + Noto Sans TC
- 新元件：Sparkle.tsx（4-point star）、Button.tsx、Stepper.tsx 全面改版
- 全頁面套用新設計（page.tsx、GlobalQtyCard、SummaryCard、SaveRecipeBar、MultiComponentSection、share、recipes）
- 三花貓 SVG logo（maologo.png）、背景改 #FDF8F2
- kg 自動格式（fmtG() helper，≥1000g 顯示 X.XX kg）
- CSV 桌機限定（hidden sm:inline）
- 分享頁：「在計算機中開啟」→「用 BakeMao 開啟」+跨組合備料彙總

---

## v1.2.4 — 2026-04-21
### Feat
- **麵糊比重 + 填充率**：「按模具算」模式新增蛋糕類型選擇器（慕斯/磅蛋糕/海綿蛋糕/戚風蛋糕/自訂）。
  公式：`gramPerUnit = 模具容積(cc) × 填充率 × 比重`
  - 慕斯/生乳酪：比重 1.0，填充率 95%（等同舊行為）
  - 磅蛋糕：比重 0.85，填充率 50%
  - 海綿蛋糕：比重 0.46，填充率 60%（8吋 ≈ 537g ✓）
  - 戚風蛋糕：比重 0.42，填充率 65%
  - 自訂：用戶自填比重 + 填充率
- **範本配方**同步綁定蛋糕類型（磅蛋糕→pound、戚風→chiffon、海綿→sponge）

---

## v1.2.3 — 2026-04-21
### Feat
- **SummaryCard 折疊提示**：折疊狀態改為「▸ 備料彙總（N 項）」，展開則顯示「備料彙總」。
- **範本配方**：MultiComponentSection 標題列新增「範本配方」按鈕，選擇後自動帶入法式磅蛋糕或戚風蛋糕的百分比配方。

### Fix / UX
- **新配方 Dialog 按鈕順序**：改為「先儲存配方（主按鈕）→ 取消 → 直接清空（紅色 ghost）」，降低誤觸清空風險。
- **份數 badge tooltip**：「沿用 N 份」與「已自訂 × 重置」badge 加上 `title` 說明每組可獨立設份數的邏輯。

---

## v1.2.2 — 2026-04-21
### Fix
- 「開始新配方？」對話說明對齊 TASK-17-P3（明確寫出份數重置為 6、損耗重置為 0%）。

---

## v1.2.1 — 2026-04-20
### Fix
- **TASK-17-P1**：`SummaryCard` 備料彙總（跨組 `name+brand` 合併克數，預設折疊）。
- **TASK-17-P2**：配方列表顯示「X 個組合・N 項材料」；刪除材料改 Toast + 3 秒內復原；`gram ↔ mold` 切換不再覆寫手填 `gramPerUnit`。
- **TASK-17-P3**：「新配方」取代「清除」；確認後重置份數為 6、損耗為 0（`clearComponents`）。

---

## v1.2.0 — 2026-04-20
### Feat
- **TASK-16**：首頁改為多組配方主流程——`GlobalQtyCard`（共做幾個）+ `MultiComponentSection`；每張組合卡可切換「輸入克數／按模具算」、份數覆寫與重置；舊單組配方儲存可載入並遷移為單一組合；移除 `/design-preview` 原型頁。

---

## v1.1.7 — 2026-04-18
### Feat
- **`GET /api/version`**：回傳 `service`、`version`、`commit`（7 位）、`deployedAt`，供 Hub `smallfatmao.com/status` 使用（Edge runtime）。

---
## v1.1.6 — 2026-04-18
### Fix
- **TASK-13** 行動端鍵盤遮擋：新增 `useKeyboardOffset` 設 `--keyboard-offset`；`SaveRecipeBar` 底部 `padding-bottom` 含 safe-area 與鍵盤偏移；`NumberInput` 預設 focus 時 `scrollIntoView`；IngredientSearchSheet 搜尋框同上（PRD §21-5）。

### Chore
- `public/sw.js`：PWA precache 清單更新。

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
