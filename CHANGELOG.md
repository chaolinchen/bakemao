# BakeMao 烘焙貓 — Changelog

---

## v1.9.0 — 2026-06-28（整頁 UX 改版）
### UX
- **A 第一屏焦點**：「共做幾個成品？」份數卡大幅精簡（stepper 與標題同列、移除副標與大數字徽章），讓材料/結果更快進入視線。
- **B 工具列收斂**：分享/配方本/範本/匯出CSV → 收成「範本／配方本／分享／匯出」3 顆；CSV 從桌機限定移進「分享／匯出」面板（手機也能用）。
- **C 備料一鍵直達**：手機新增右下角常駐「🛒 備料 X g」快捷，點了捲到備料彙總（桌機已 sticky 故隱藏）。
- **D 份數去重**：單一組合時隱藏「每組份數 override」，消除與「共做幾個」兩個份數的混淆。
- **E 減視覺噪音**：材料列改輕邊框、去立體陰影，重 treatment 留給主卡片/主按鈕。
- **F 組合卡進階收合**：蛋糕類型說明（描述/例子/比重）改「這是什麼？」收合，預設只留打發程度＋所需麵糊克數。
- **單位改公克**：備料彙總一律顯示公克（≥1000 加千分位逗號），不再用公斤。

### Fix
- **PWA 更新提示按了消不掉**：根因＝`/api/version` 回 7 碼 SHA 但 `NEXT_PUBLIC_COMMIT` 是 40 碼，永遠不相等。改成都正規化 7 碼比對；更新流程改註銷 SW＋清快取＋重載，加「更新中…」狀態，橫幅移到 header 下方不蓋 logo。

---

## v1.8.1 — 2026-06-28（釋出前驗證修正）
### Fix
- **移除 `/recipes` 的「Apple 登入」死按鈕**：Apple provider 僅在 `APPLE_ID/SECRET` 存在時註冊（目前未設），但登入頁無條件顯示 Apple 鈕 → 點了會壞。改為只留 Google，並補 logo＋價值說明（登入後可跨裝置同步）＋「不登入也能用本機配方本」說明。
- **雲端份數 >99 寫入失敗**：`recipes.quantity` 有 `CHECK 1..99`，但 App 份數可到 999 → 大批量雲端備份會 500。`quantity` 僅 metadata（真實份數存在 ingredients blob），改夾到 1..99 避免寫入失敗。
- **「第一次使用？」訊息重複**：頂部橫幅與空狀態卡片都寫「第一次使用？」→ 卡片標題改「快速開始」。

### 驗證（實機/真帳號）
- 雲端 E2E（偽造 Auth.js JWT session 打 dev API + Neon）：未登入 401／POST 新增／PUT 就地更新不重複（更新後仍 1 筆）／另存變 2 筆／他人帳號 PUT 我的配方 404（權限隔離）全通過。
- 分享 IG 備料卡：實際產圖確認（材料/克數/合計/落款正確，長按存圖 overlay 正常）。

---

## v1.8.0 — 2026-06-28
### Feature
- **雲端備份比照本機支援「新增 / 更新哪一份」**：儲存面板重構為「儲存到哪裡（本機配方本／雲端同步）×儲存方式（新增一份／更新現有→挑清單）」。雲端新增 `PUT /api/recipes/[id]` 更新端點、`POST` 回傳新 id；切到雲端且已登入時抓取雲端配方清單供挑選覆蓋；未登入顯示登入提示。修正先前雲端每次備份都 INSERT 造成重複的問題。
- **PWA 新版本提示**：主畫面 App（service worker 快取）跑舊版時，App 內跳出「有新版本可用」橫幅，點「更新」即 `registration.update()`＋skipWaiting＋reload。作法＝build 時把 commit SHA 烘進前端（next.config `env.NEXT_PUBLIC_COMMIT`），與 `/api/version`（走網路）的線上 commit 比對，不同就提示；dev／無 commit 時自動停用。

---

## v1.7.0 — 2026-06-28
### Fix（克數模式計算錯誤，核心 bug）
- **克數模式每份總克重算錯**：原本 `gramForCalc` 取「基底材料克重」而非「全部材料克數加總」，導致輸入固定克數（如 水 25／水 25／細砂糖 100）反而被縮小（顯示 18.5／18.5／74.1）。修正為以加總（150g）為每份目標 → 損耗 10% 時正確輸出 27.8／27.8／111.1（=150÷0.9）；不設損耗時原樣輸出 25／25／100。
- **備料彙總／分享／CSV 在克數模式全失效**：`effectiveGramPerUnit` 與彙總迴圈完全忽略克數模式（用 `gramPerUnit=0` + 比例欄 `value=0`）→ 跨組合彙總空白。新增共用 `componentGramPerUnit` / `componentIngredientInputs`，卡片、彙總、分享、CSV、儲存全部走同一邏輯。
- **儲存配方 FAB 不出現**：`hasAnyResult` 只認 `gramPerUnit>0`，克數模式永遠 false → 存不了。改用 `componentGramPerUnit`。
- **重複材料名 React key 衝突**：同名材料（兩個「水」）結果列 key 重複可能漏列，改加 index。
- 損耗率公式經查證為台灣烘焙慣例 `材料 = 目標 ÷ (1−損耗率)`，與程式一致，無需更動。

### Feature
- **儲存配方一律詢問「新增一份／更新現有」**：只要配方本已有配方，儲存面板就出現「儲存方式」切換；選「更新現有」可從清單挑要覆蓋哪一份（radio，選了自動帶入該份名稱）。從配方本載入的會預設選中該份。不必先載入也能覆蓋任一份（`updateRecipe` + store `loadedRecipeId` 追蹤）。

### UX
- **修畫面跳動**：`NumberInput` 移除每次 focus 都 `scrollIntoView({block:'center'})`（每點一個欄位就置中是跳動主因）；視窗外欄位仍由瀏覽器原生帶入畫面。
- **克數模式簡化（Hick's Law）**：移除每列「設基底／基底✓」按鈕與會隨輸入跳動的橘色基底高亮（基底選擇對克數結果零影響，是假決策）；改為每列顯示「佔比 N%」純資訊 + 清楚說明文字。
- **克數模式隱藏無用的「每份目標」欄位**與「設 100」提示（克數模式由材料加總得每份總重）。
- **損耗率說明改寫**：點明它是「可選的安全餘量」、會整鍋等比放大不改變比例、家庭少量設 0 即可（回答「固定 g 要不要算損耗」的疑問；損耗本質是成品重⇄備料量的換算，與輸入 % 或 g 無關）。

---

## v1.6.1 — 2026-05-09
### Fix
- **FAB 跑版**：`pb-24` 改為 `calc(7rem + env(safe-area-inset-bottom))` 確保 Home Bar 裝置上 FAB 不蓋住底部內容。
- **截圖跑版+資訊不足**：移除 `html2canvas`，改用 Canvas API 手繪配方卡（含組合名稱、材料名/品牌/百分比/克數、小計/總計）；手機支援 `navigator.share`，不支援則長按存圖 overlay。

### UX
- **分享按鈕合併**：「截圖」與「IG 備料卡」合併為單一「分享」按鈕，開啟 BottomSheet 後再選擇配方截圖或 IG 備料卡。

---

## v1.6.0 — 2026-05-09
### Fix
- **百分比小數點輸入**：`NumberInput` 改用 internal local state（`isFocused` ref），避免 controlled re-render 在用戶輸入 `"1."` 時吃掉小數點；移除干擾 iOS 鍵盤類型的 `pattern` 屬性。
- **範本配方 Dialog 滾動**：`MultiTemplateDialog` 加 `max-h-[85dvh] overflow-y-auto overscroll-contain` + `useEffect` 鎖定 `body overflow`，修復背景跟著滑動 & 按鈕被遮擋。
- **搜尋食材 placeholder 亂碼**：JSX 字串屬性不解析 `\uXXXX`，改為直接中文。
- **搜尋食材鍵盤遮擋**：`IngredientSearchSheet` 追蹤 `keyboardHeight`（via `visualViewport`），傳入 `BottomSheet` 新增的 `bottomOffset` prop，讓 panel 浮在鍵盤上方。
- **品牌需點兩次**：`IngredientSearchSheet` 從「條件渲染不同 BottomSheet」改為「單一 BottomSheet + 內部 view 切換」，避免 unmount/remount 造成 iOS 首次 tap 被吸收。
- **模具體積浮點數**：長方形模具容積顯示 `toFixed(2)`，不再出現 `222.76799999...`。
- **成品預設值**：store / GlobalQtyCard / MultiComponentSection 預設值 `6` → `1`（新用戶/清空後更直覺）。

### Feat
- **儲存配方 → FAB**：從全寬 sticky bar 改為左下角 `fixed` 浮動 pill 按鈕；無結果時不顯示；鍵盤打開時自動隱藏（`visualViewport` 偵測）；不再佔用 layout 空間。
- **長方形模具**（v3.3 已在，補記）：尺寸 長/寬/高 cm 輸入，公式 `l×w×h×fillRate×gravity`。

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
