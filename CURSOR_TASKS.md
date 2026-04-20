# BakeMao 烘焙貓 — Cursor 工作清單
> PRD 完整規格請見 `PRD_BakeMao_v1.0.md`（當前版本：**v1.6**）
> 本文件供 Cursor 獨立執行，不需要頻繁詢問 Claude
> 更新：2026-04-18 — **TASK-12 ∼ 15 已完成**（含 TASK-13 行動端鍵盤遮擋）。  
> **近期**：已修復首頁 **Maximum update depth**（Zustand 物件 selector → `useShallow`；模具改 **`computeResult` + `getMoldParts`**）。驗證以 `CONTEXT.md` **SNAPSHOT v0.2.1** 為準。

---

## 進度狀態

| Task | 狀態 | 備註 |
|------|------|------|
| TASK-00 | ✅ 完成 | 專案初始化 |
| TASK-01 | ✅ 完成 | molds.json、ingredients.json |
| TASK-02 | ✅ 完成 | calculator.ts |
| TASK-03 | ✅ 完成 | MoldSelector.tsx |
| TASK-04 | ✅ 完成 | RecipeInput.tsx |
| TASK-05 | ✅ 完成 | IngredientSearchSheet.tsx |
| TASK-06 | ✅ 完成 | CalcResult.tsx |
| TASK-07 | ✅ 完成 | 主頁面組裝 |
| TASK-08 | ✅ 完成 | PWA 設定 |
| TASK-09 | ✅ 完成 | **Neon** 整合 + 登入 |
| TASK-10 | ✅ 完成 | 配方管理頁（含 mold UI 還原、pointer: coarse 左滑刪除） |
| TASK-11 | ✅ 完成 | 分享結果圖（logo.svg 浮水印 + 文字後備） |
| TASK-12 | ✅ 完成 | 模具清單補充 + MoldSelector UX 改善（含 Segment 命名修正）|
| TASK-13 | ✅ 完成 | 行動端鍵盤遮擋修正（主頁輸入框）|
| TASK-14 | ✅ 完成 | Middleware 500 + 儲存配方 UX + 耗損預設修正 + Onboarding hint |
| TASK-15 | ✅ 完成 | **IngredientSearchSheet 鍵盤感知（P0 Bug Fix）** |
| TASK-16 | ✅ 完成 | **多組配方主流程整合重設計** |
| TASK-17 | ✅ 完成 | **多組配方 UX 修正（P1 彙總／P2 列表+刪除+mode／P3 新配方）** |

---

## Post-MVP 改善

### TASK-12：模具清單補充 + MoldSelector UX 改善

**molds.json 補充：**
```json
{ "id": "loaf-450", "name": "吐司模（450g）", "type": "rectangle", "length": 20, "width": 10, "height": 10, "volume": 2000 },
{ "id": "loaf-12", "name": "吐司模（12兩）", "type": "rectangle", "length": 24, "width": 11, "height": 11, "volume": 2904 },
{ "id": "tart-7cm", "name": "塔模（7cm）", "type": "fixed", "volume": 35 },
{ "id": "tart-10cm", "name": "塔模（10cm）", "type": "fixed", "volume": 100 }
```

**MoldSelector.tsx 改動：**
1. `calcStore.ts` 預設 `presetId` 從 `pudding-90` 改為 `round-6`
2. 下拉選單最底部加 disabled option：`── 找不到？請切換下方計算方式 ──`
3. Segment Control 上方標題改為：「沒有合適模具？按形狀自行計算：」
4. **Segment 的「馬芬」選項改名為「杯型×數量」**（原因：與 dropdown 的「馬芬模」重名造成混淆；「杯型×數量」意思是「輸入單杯容積 × 數量」，更精確）
5. 模具容積顯示改為「共 XXX g（以 1cc≈1g 換算）」（原本只顯示「共 XXX g」，加括弧說明換算關係）

**P1 待補（下次迭代）：**
- 費南雪模（30cc）
- 戚風模 15cm
- 烤盤（28×30cm，瑞士卷/布朗尼）
- 磅蛋糕模（迷你）

---

### TASK-13：行動端鍵盤遮擋修正

**Step 1**：建立 `/src/hooks/useKeyboardOffset.ts`
```ts
import { useEffect } from 'react'

export function useKeyboardOffset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handler = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop
      document.documentElement.style.setProperty(
        '--keyboard-offset',
        `${Math.max(0, offset)}px`
      )
    }
    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    return () => {
      vv.removeEventListener('resize', handler)
      vv.removeEventListener('scroll', handler)
    }
  }, [])
}
```

**Step 2**：在 `src/app/layout.tsx` 呼叫 `useKeyboardOffset()`

**Step 3**：`globals.css` 加：
```css
:root { --keyboard-offset: 0px; }
```

**Step 4**：`SaveRecipeBar`（及任何 fixed bottom 元件）加：
```tsx
style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--keyboard-offset, 0px))' }}
```

**Step 5**：所有 `<NumberInput>` 加：
```tsx
onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
```

完成後：`git add . && git commit -m "fix: 補模具清單 + 行動端鍵盤遮擋修正" && git push origin main`

---

### TASK-14：Middleware 500 + 儲存配方 UX + Onboarding hint

#### A. Middleware 500 修正（Edge Runtime 不支援 Neon TCP）

新建 `/src/auth.config.ts`：
```ts
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [Google],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isRecipes = request.nextUrl.pathname.startsWith('/recipes')
      if (isRecipes) return isLoggedIn
      return true
    },
  },
  pages: { signIn: '/api/auth/signin' },
}
```

修改 `src/middleware.ts`：
```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/recipes/:path*'],
}
```

`src/auth.ts` 不動（保留 NeonAdapter）。

#### B. 儲存配方 UX 修正（SaveRecipeBar.tsx）

**問題 1：順序錯誤** — 未登入時先跳命名 dialog，填完才告知需登入。
**修法**：`onClick` 先檢查 session，未登入直接開 auth sheet，已登入才開命名 dialog。

```tsx
// 把 Button onClick 改為：
onClick={() => {
  if (status !== 'authenticated') {
    setAuthOpen(true)
  } else {
    setNameOpen(true)
  }
}}
```

**問題 2：Apple 登入按鈕** — 未設定 APPLE_ID，按鈕不應出現。
**修法**：auth sheet 裡移除 Apple 登入按鈕，只保留 Google 登入。

#### C. 耗損區塊預設邏輯修正（RecipeInput.tsx）

**問題：** 目前顯示的是手動輸入 `%` 模式，「使用快捷」才切換到 Segment。**應該反過來。**

**修法：**
- 預設：顯示「備用 +0 / +1 / +2」三個 Segment 按鈕
- 右側加「進階」小字按鈕（`text-xs text-muted`）
- 點「進階」後：Segment 隱藏 → 顯示「耗損比例 0-30%」手動輸入欄
- 進階模式下右側顯示「使用快捷」小字，可切回 Segment

#### D. 首頁 Onboarding hint

在 `src/app/page.tsx` 的計算頁最頂部（Header 下方）加一個可關閉的提示條，只在第一次使用時顯示（localStorage flag）：

```tsx
// 顯示條件：localStorage.getItem('bakemao_onboarded') 不存在
// 內容：「第一次使用？選模具 → 輸入配方比例 → 即時看克數結果」
// 右側 × 關閉，關閉後寫入 localStorage.setItem('bakemao_onboarded', '1')
// 樣式：暖色背景（#FDF3E7），小字，不搶主畫面視覺
```

完成後：`git add . && git commit -m "fix: middleware 500 + 儲存配方流程 + 耗損預設 + onboarding hint" && git push origin main`

---

### TASK-15：IngredientSearchSheet 鍵盤感知修正（P0 Bug）

**問題：** 開啟「新增材料」底部 Sheet 後，iOS 鍵盤彈出動畫（約 250ms）期間，鍵盤 toolbar 暫時蓋住食材列表，造成**列表閃爍消失再出現**。

**根本原因：** Sheet 高度是靜態 CSS，未監聽 `visualViewport`，不感知鍵盤高度變化。

**修法：在 `IngredientSearchSheet.tsx` 內加入動態高度：**

```tsx
// 在 component 頂部加入 state + effect
const [sheetMaxHeight, setSheetMaxHeight] = useState<number | undefined>(undefined)

useEffect(() => {
  const vv = window.visualViewport
  if (!vv) return
  const update = () => {
    // vv.height = 鍵盤彈出後的可見視窗高度
    // vv.offsetTop = 頁面被往上推的距離
    setSheetMaxHeight(vv.height + vv.offsetTop - 8) // 8px = 頂部安全邊距
  }
  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
  update() // 初始化
  return () => {
    vv.removeEventListener('resize', update)
    vv.removeEventListener('scroll', update)
  }
}, [])
```

**套用到 Sheet 容器：**
```tsx
// Sheet 外層容器（目前可能用 fixed bottom-0 的 div）加上 style：
<div
  className="fixed bottom-0 left-0 right-0 bg-[#FEF9F4] rounded-t-2xl overflow-hidden flex flex-col"
  style={sheetMaxHeight ? { maxHeight: sheetMaxHeight } : undefined}
  // ⚠️ 不要加 transition，讓高度跟著鍵盤動畫即時更新，避免二次跳動
>
```

**同步修正 IngredientSearchSheet 的搜尋框 hint text：**
- `placeholder` 從「搜尋…」改為「搜尋食材，找不到可直接輸入」
- 列表底部「直接使用「XXX」」選項：字體改為 `text-base font-medium`（比一般列表項目更顯眼）+ 左側加 ➕ icon

**驗收條件：**
- [ ] iOS Safari 實機：開啟 Sheet → 鍵盤彈出 → 列表不閃爍
- [ ] 鍵盤收起 → Sheet 高度恢復正常，可看到更多列表項目
- [ ] 搜尋框始終在鍵盤上方可見（不被蓋住）
- [ ] 找不到食材時「直接使用」選項清晰可見

完成後：`git add . && git commit -m "fix: IngredientSearchSheet keyboard-aware height (iOS flash bug)" && git push origin main`

---

## 專案初始化

### TASK-00：建立 Next.js 專案 ✅
```
- Next.js 14（App Router）
- TypeScript
- Tailwind CSS
- Zustand（狀態管理）
- Vitest（單元測試）
- 部署目標：bakemao.smallfatmao.com（Vercel）
- 套件：
    @ducanh2912/next-pwa（⚠️ 不要用 next-pwa，App Router 相容性有問題）
    ⚠️ 不要安裝 @supabase/supabase-js 或 @supabase/ssr（已改用 Neon）
    @neondatabase/serverless（資料庫）
    html2canvas
    zustand
- 字體：Playfair Display、DM Mono、Noto Sans TC、Noto Serif TC（next/font/google）
- 完整目錄結構參考：ARCHITECTURE.md §2
```

### TASK-01：建立靜態資料 JSON
位置：`/src/data/`

**molds.json** — 常見模具規格
```json
[
  { "id": "pudding-100", "name": "布丁模（標準）", "type": "fixed", "volume": 100 },
  { "id": "pudding-120", "name": "布丁模（胖胖杯）", "type": "fixed", "volume": 120 },
  { "id": "pudding-90",  "name": "布丁模（考試用）", "type": "fixed", "volume": 90 },
  { "id": "muffin-100", "name": "馬芬模（標準）", "type": "fixed", "volume": 100 },
  { "id": "muffin-63",  "name": "馬芬模（迷你）", "type": "fixed", "volume": 63 },
  { "id": "muffin-242", "name": "馬芬模（巨型）", "type": "fixed", "volume": 242 },
  { "id": "cupcake-82", "name": "杯子蛋糕紙杯（標準）", "type": "fixed", "volume": 82 },
  { "id": "cupcake-166","name": "杯子蛋糕紙杯（大）", "type": "fixed", "volume": 166 },
  { "id": "chiffon-17", "name": "戚風模 17cm", "type": "chiffon", "volumes": { "small": 700, "medium": 800, "large": 900 }},
  { "id": "chiffon-20", "name": "戚風模 20cm", "type": "chiffon", "volumes": { "small": 1000, "medium": 1100, "large": 1200 }},
  { "id": "round-6",   "name": "圓形 6吋", "type": "cylinder", "diameter": 15, "height": 6, "volume": 1060 },
  { "id": "round-8",   "name": "圓形 8吋", "type": "cylinder", "diameter": 20, "height": 6, "volume": 1885 },
  { "id": "round-10",  "name": "圓形 10吋", "type": "cylinder", "diameter": 25, "height": 6, "volume": 2945 },
  { "id": "loaf",      "name": "磅蛋糕模（標準）", "type": "rectangle", "length": 17, "width": 8, "height": 6, "volume": 816 }
]
```

**ingredients.json** — 80 種常見食材（含品牌）
```json
[
  {
    "id": "cake-flour",
    "name": "低筋麵粉",
    "aliases": ["低粉", "薄力粉"],
    "brands": [
      { "name": "日清山茶花", "protein_pct": 8.5 },
      { "name": "水手牌", "protein_pct": 8.0 }
    ]
  },
  {
    "id": "bread-flour",
    "name": "高筋麵粉",
    "aliases": ["高粉", "強力粉"],
    "brands": [
      { "name": "金像", "protein_pct": 11.5 }
    ]
  },
  { "id": "sugar", "name": "細砂糖", "aliases": ["白砂糖", "砂糖"] },
  { "id": "brown-sugar", "name": "二砂" },
  { "id": "powdered-sugar", "name": "糖粉" },
  { "id": "unsalted-butter", "name": "無鹽奶油",
    "brands": [
      { "name": "Président", "water_pct": 16 },
      { "name": "艾許", "water_pct": 18 }
    ]
  },
  { "id": "salted-butter", "name": "有鹽奶油" },
  { "id": "vegetable-oil", "name": "植物油", "aliases": ["沙拉油"] },
  { "id": "whole-egg", "name": "全蛋", "aliases": ["雞蛋"] },
  { "id": "egg-white", "name": "蛋白" },
  { "id": "egg-yolk", "name": "蛋黃" },
  { "id": "milk", "name": "鮮奶", "aliases": ["牛奶"] },
  { "id": "heavy-cream", "name": "動物性鮮奶油", "aliases": ["鮮奶油"] },
  { "id": "whipping-cream", "name": "植物性鮮奶油" },
  { "id": "vanilla-powder", "name": "香草粉" },
  { "id": "vanilla-extract", "name": "香草精" },
  { "id": "cocoa-powder", "name": "可可粉" },
  { "id": "matcha-powder", "name": "抹茶粉" },
  { "id": "baking-powder", "name": "泡打粉" },
  { "id": "baking-soda", "name": "小蘇打粉" },
  { "id": "yeast", "name": "酵母" },
  { "id": "salt", "name": "鹽" },
  { "id": "honey", "name": "蜂蜜" },
  { "id": "corn-starch", "name": "玉米澱粉", "aliases": ["太白粉"] },
  { "id": "cream-cheese", "name": "奶油乳酪", "aliases": ["cream cheese"] },
  { "id": "water", "name": "水" }
]
```

---

## P0 核心功能

### TASK-02：計算引擎（純 TypeScript，無 UI）
位置：`/src/lib/calculator.ts`

```typescript
// 型別定義
type IngredientInput = {
  name: string
  brand?: string
  value: number        // 模式A：百分比；模式B：克數
  isFixed: boolean     // true = 固定克數，不隨 target 縮放
}

type CalcMode = 'percent' | 'gram'

type TargetInput =
  | { type: 'mold'; volumeCC: number; quantity: number }
  | { type: 'gram'; totalGram: number }

type LossInput =
  | { type: 'preset'; extra: 0 | 1 | 2 }  // 備用 +0/+1/+2 個
  | { type: 'manual'; ratio: number }       // 0.0 ~ 0.3

// 主要輸出
type CalcResult = {
  targetGram: number
  lossRatio: number
  unitGram: number           // 每 1% 對應克數（模式A）或每 1g 對應的縮放比（模式B）
  ingredients: {
    name: string
    brand?: string
    pct: number              // 最終百分比（兩模式都顯示）
    gram: number             // 最終克數
    isFixed: boolean
  }[]
  totalPct: number           // 比例材料的百分比總和
  totalGram: number          // 所有材料的克數總和（含固定）
}

// 請實作：
// 1. calcLossRatio(input: LossInput): number
//    - preset +0 → 1.0（無耗損）
//    - preset +1 → 基於每個容器容量反推多做 1 個的比例
//    - preset +2 → 同上，多做 2 個
//    - manual → 直接用 1 / (1 - ratio)
// 2. calculate(mode: CalcMode, ingredients: IngredientInput[], target: TargetInput, loss: LossInput): CalcResult
```

**單元測試**（`/src/lib/calculator.test.ts`）：
- 布丁 18 個 × 90cc，總% 165.5，耗損 10%：鮮奶應為 1088g
- 模式B：輸入鮮奶 1088g、砂糖 163g，反推後改目標 2000g，驗算比例不變
- 固定材料焦糖 100g 在目標克數改變時應保持 100g
- 目標克數 0 時所有比例材料為 0g，固定材料不變

---

### TASK-03：模具選擇元件
位置：`/src/components/MoldSelector.tsx`

- 頂部：模具快選 Dropdown（資料來自 molds.json）
- 選後自動帶入下方尺寸欄位（可手動覆蓋）
- 形狀切換 Segment：圓柱 / 長方 / 馬芬 / 直接輸入cc
  - 圓柱：直徑(cm) + 高(cm) → 即時計算容積
  - 長方：長 + 寬 + 高(cm)
  - 馬芬：單個容積(cc) + 數量 Stepper（1～99）
  - 直接輸入cc：單一數字欄位
- 戚風模特殊處理：選後顯示「偏小 / 標準 / 偏大」三個選項，對應固定容積
- 目標類型 Toggle：「選模具」/ 「輸入總克數」
- 即時顯示「共 XXX g」（唯讀）
- 所有數字欄位：inputMode="decimal"，pattern="[0-9]*"

---

### TASK-04：配方輸入元件
位置：`/src/components/RecipeInput.tsx`

- 頂部：模式 Toggle「我有百分比配方 / 我有克數配方」
  - 切換時顯示 confirm dialog「切換模式會清空目前輸入，確定嗎？」
- 材料清單：可捲動
  - 每行：材料名稱 + 品牌（可選）+ 數值（% 或 g）+ 類型 Toggle（比例/固定）
  - Swipe left 或長按顯示刪除按鈕，點擊需 confirm
- 底部固定：「+ 新增材料」按鈕（48px 高）→ 開啟 IngredientSearchSheet
- 底部顯示合計（模式A：總%；模式B：總g）
- 耗損設定：預設顯示「備用 +0 / +1 / +2」Segment；右側「進階」小字 → 展開手動輸入 %

---

### TASK-05：食材搜尋 Bottom Sheet
位置：`/src/components/IngredientSearchSheet.tsx`

- 觸發後從底部滑出，背景 overlay
- 搜尋框自動 focus，inputMode="search"
- 即時過濾 ingredients.json（名稱 + aliases）
- 顯示匹配清單（名稱 + 別名小字）
- 找不到 → 顯示「直接使用「XXX」」選項
- 選定後：若該食材有品牌資料 → 顯示品牌選擇（可略過）
- 完成 → 回傳 { name, brand } 給父元件，Sheet 收起

---

### TASK-06：計算結果元件
位置：`/src/components/CalcResult.tsx`

- 接收 CalcResult 資料，全部即時響應（無需按鈕觸發）
- 比例材料區塊：
  - 各行：材料名稱（18px Noto Serif TC）+ 克數（28px Bold DM Mono，右對齊）
  - 橫條：最大克數材料 = 100% 寬度，其他等比，高度 4px，色 #C8602A
- 固定材料區塊：獨立區塊（淡奶油背景），標示「固定用量」小字
- 底部：耗損說明小字「含 X% 備用量」
- 空狀態（無材料或目標為 0）：貓咪空碗插圖 + 「還沒有材料，新增一個吧」

---

### TASK-07：主頁面組裝
位置：`/src/app/page.tsx`

- 頁面結構（單頁，可捲動）：
  ```
  Header（品牌 logo + 「我的配方」入口）
  MoldSelector
  RecipeInput
  CalcResult（sticky bottom 或內嵌）
  ```
- 狀態管理：使用 React Context 或 Zustand 統一管理計算引擎 state
- Wake Lock：進入頁面後自動申請，離開時釋放
- 離線 Banner：偵測 navigator.onLine，離線時頂部顯示提示條

---

## P1 功能

### TASK-08：PWA 設定
- next-pwa 設定，cache-first strategy
- manifest.json：名稱「BakeMao 烘焙貓」、主色 #C8602A、背景 #F7F0E6
- 快取靜態資料（molds.json、ingredients.json）

### TASK-09：Neon 整合 + 登入

> ⚠️ 資料庫已由 Supabase 改為 **Neon**（postgresql）
> ⚠️ 移除 @supabase/ssr、@supabase/supabase-js；安裝 @neondatabase/serverless
> ⚠️ 移除 src/lib/supabase/ 目錄；改建 src/lib/db.ts

**步驟：**

1. **移除舊套件**
   ```bash
   npm uninstall @supabase/ssr @supabase/supabase-js
   npm install @neondatabase/serverless
   ```

2. **建立 DB 客戶端** `/src/lib/db.ts`
   ```typescript
   import { neon } from '@neondatabase/serverless'
   export const sql = neon(process.env.DATABASE_URL!)
   ```

3. **環境變數**（`.env.local` 已建立）
   ```
   DATABASE_URL=postgresql://...（已設定，見 .env.local）
   ```
   Vercel 也需要設定 `DATABASE_URL`。

4. **建立資料表**（在 Neon Dashboard SQL Editor 執行）
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id          TEXT PRIMARY KEY,           -- provider user ID
     provider    TEXT NOT NULL,              -- 'google' | 'apple'
     email       TEXT,
     created_at  TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE IF NOT EXISTS recipes (
     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id          TEXT REFERENCES users(id) NOT NULL,
     name             TEXT NOT NULL CHECK (char_length(name) <= 30),
     mode             TEXT NOT NULL CHECK (mode IN ('percent', 'gram')),
     target_type      TEXT NOT NULL CHECK (target_type IN ('mold', 'gram')),
     target_gram      NUMERIC CHECK (target_gram >= 0),
     mold_id          TEXT,
     mold_params      JSONB,
     quantity         INT DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 99),
     loss_type        TEXT CHECK (loss_type IN ('preset', 'manual')),
     loss_value       NUMERIC,
     ingredients      JSONB NOT NULL,
     is_pinned        BOOLEAN DEFAULT false,
     client_updated_at TIMESTAMPTZ,
     created_at       TIMESTAMPTZ DEFAULT now(),
     updated_at       TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX IF NOT EXISTS recipes_user_id_idx
     ON recipes (user_id, updated_at DESC);
   ```

5. **Auth 方案**：使用 NextAuth.js（next-auth v5）搭配 Neon adapter
   ```bash
   npm install next-auth@beta @auth/neon-adapter
   ```
   - Google OAuth provider
   - Apple Sign In provider
   - session 存 JWT（無需 session table）

6. **儲存流程**（同原規格）：
   1. 點擊儲存 → 未登入 → Bottom Sheet 顯示登入選項
   2. 登入成功 → 自動儲存 → Toast「已儲存 ✓」
   3. 已登入 → 直接儲存，顯示命名 Dialog（預設「配方 YYYY/MM/DD HH:mm」，最多 30 字）

7. **離線時**：暫存 localStorage，連線後自動同步（offlineSync.ts 邏輯不變）

### TASK-10：配方管理頁
位置：`/src/app/recipes/page.tsx`

- 需登入才能進入，未登入跳轉登入
- 列表顯示：配方名稱、材料數量、最後更新時間
- 點擊載入 → 還原計算頁所有狀態
- Swipe left 刪除，需 confirm

### TASK-11：分享結果圖
位置：`/src/lib/shareImage.ts`

- 使用 html2canvas 截取 CalcResult 元件
- 加入 BakeMao logo 浮水印（右下角）
- 輸出為 PNG，呼叫 Web Share API（支援時）或直接下載
- 完全前端生成，離線可用

---

## 補充說明

**Edge Case 處理原則（直接 coding，不需問 Claude）：**
- 百分比 / 克數輸入負數 → 自動取絕對值
- 輸入 0 → 欄位紅框 + 提示「請輸入大於 0 的數字」，但不阻擋其他計算
- 模具尺寸不完整 → 容積顯示「—」，結果不更新
- 材料清單為空 → 顯示空狀態，不計算

**每次 commit 前必須更新 CHANGELOG.md：**
- 在對應版本區塊補上這次的改動項目
- 版本號規則：bug fix → patch（1.0.x）、新功能 → minor（1.x.0）

**不需要詢問 Claude 的決策：**
- 動畫時長、easing 細節
- 具體的 Tailwind class 選擇
- RWD breakpoint 數值
- Toast 顯示秒數

**需要詢問 Claude 的情況：**
- 計算邏輯結果與預期不符
- Supabase schema 需要調整
- 新增 PRD 未定義的功能

---

## TASK：新增 `/api/version` endpoint

**目的：** 讓 `smallfatmao.com/status` 狀態頁可以查詢本服務的版本與部署資訊。

**新增檔案：** `src/app/api/version/route.ts`

```ts
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export function GET() {
  return NextResponse.json({
    service: 'bakemao',
    version: process.env.npm_package_version ?? 'unknown',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
    deployedAt: process.env.VERCEL_GIT_COMMIT_DATE ?? null,
  })
}
```

**驗收：**
- `curl https://bakemao.smallfatmao.com/api/version` 回傳 JSON
- commit 為 7 位 SHA，非 'local'

```bash
git add . && git commit -m "feat: add /api/version endpoint" && git push origin main
```

---

## TASK-16：多組配方主流程整合重設計

> ✅ 已整合進首頁；`src/app/design-preview/` 已刪除。

### 背景

目前主頁是「MoldSelector + RecipeInput + CalcResult + MultiComponentSection（附加區塊）」四段並列。新架構整合為一套多組配方流程：單組 = 只有一張卡片的特例。

### 架構變更

#### 1. Store 調整（`src/store/calcStore.ts`）

在 `RecipeComponent` 型別補欄位：

```ts
interface RecipeComponent {
  // 既有欄位保留不動
  id: string
  name: string
  ingredients: IngredientLine[]
  gramPerUnit: number
  // 新增：
  targetMode: 'gram' | 'mold'   // 預設 'gram'
  moldPresetId: string | null    // 對應 molds.json 的 id，null = 自訂
  moldType: 'round' | 'tart' | 'cup'  // 按模具算時的類型
  moldSize: number               // 吋數或 cm，杯型不用
  cupCount: number               // 杯型用
  customQty: number | null       // null = 繼承全局 compQuantity
}
```

`compQuantity` 維持原有全局設定。

#### 2. `MultiComponentSection.tsx` 改動

**ComponentCard 新增「目標量模式」區塊**，放在「每個重量」輸入上方：

```
[輸入克數 | 按模具算]  ← Segmented control（兩個選項各佔 50%）

輸入克數模式：
  每份 [____] g

按模具算模式：
  模具類型：[圓模（吋）] [塔圈（cm）] [杯型]
  尺寸快速按鈕：
    圓模：4 / 5 / 6 / 7 / 8 / 9 / 10 / 12
    塔圈：6 / 7 / 8 / 9 / 10 / 12 / 15
    杯型：6連 / 12連 / 24連
  容積顯示：「共 XXX g（1cc≈1g）」← 複用 MoldSelector 現有邏輯
```

Segmented control 樣式：外層 `border border-[#D9C9B5] bg-[#FAF6F0] rounded-lg p-0.5`，選中項 `bg-white text-[#C8602A] shadow-sm rounded-md`。

**份數 override 區塊**（現有材料列表上方）：

```
份數 [−] [X] [＋]  繼承全局 / 已自訂 × 重置
```

- 預設繼承 `compQuantity`（顯示「繼承全局」灰字）
- 手動改後顯示橘色 badge「已自訂 × 重置」，點擊重置回 null

#### 3. 主頁 `page.tsx` 調整

移除單獨的 `<MoldSelector />` 和 `<RecipeInput />` 區塊。

改為：啟動時直接顯示多組配方流程（預設一張空白卡片），不再需要「＋ 同時計算多組配方」按鈕。

```tsx
// 新的 main 內容
<main className="mx-auto flex max-w-lg flex-col gap-4 p-4">
  <GlobalQtyCard />       {/* 全局份數，見下方 */}
  <MultiComponentSection />
  <SaveRecipeBar />       {/* 維持現有位置 */}
</main>
```

#### 4. 新增 `GlobalQtyCard` 元件（或整合進 MultiComponentSection）

```
共做幾個？                    6 個
[1] [2] [4] [6] [8] [12]
```

快速按鈕同現有 MultiComponentSection 的「要做幾個」UI，抽到獨立卡片放頂部。

### 計算邏輯

按模具算的 `gramPerUnit` 計算（複用 `getMoldGram` 或現有 `computeResult`）：

| 模具類型 | 公式 |
|---------|------|
| 圓模 | π × (size/2 × 2.54)² × 高度（預設 5cm）|
| 塔圈 | π × (size/2)² × 高度（預設 2.5cm）|
| 杯型 | 單杯容積（預設 90cc）× 連數 |

`gramPerUnit` = 容積（cc）× 1（1cc≈1g）。這個值即直接傳入 `calculateExam()`。

### 驗收條件

- [x] 主頁移除舊的 MoldSelector + RecipeInput 區塊
- [x] 預設顯示一張空白卡片（而非「＋ 同時計算多組配方」按鈕）
- [x] 每張卡片有 Segmented control 切換目標量模式
- [x] 按模具算模式：三種模具類型 + 尺寸按鈕 + 容積顯示
- [x] 份數 override：繼承全局 / 已自訂 badge 可重置
- [x] 既有配方儲存功能（SaveRecipeBar）不受影響
- [x] 既有 `/recipes` 頁面正常讀取（含舊 `lines` 遷移）
- [ ] 手機版（375px）無橫向捲軸（請手動確認）

### 完成後

1. 刪除 `src/app/design-preview/` 目錄
2. 更新 CHANGELOG.md（minor version，例：v1.7.0）
3. `git add . && git commit -m "feat: integrate multi-component as main flow (TASK-16)" && git push origin main`

---

## TASK-17：多組配方 UX 修正（四人評審結論）

> 來源：UX 設計師 / CEO / PM / 用戶測試（小雅）四方評審
> 執行順序：P1 → P2 → P3，每項可獨立 commit

---

### TASK-17-P1：全局材料彙總卡（總備料清單）

**問題：** 用戶填完多組配方後，仍需手動心算各組克數加總，無法一鍵看出「這次共需幾克低筋麵粉」。

**新增元件：** `src/components/SummaryCard.tsx`

邏輯：
- 遍歷所有 `components`，將每組 `result.ingredients` 依 `name + brand` 合併加總
- 只在至少一組有有效結果時顯示
- 預設折疊（展開才顯示詳細列表）

UI 規格：
```
┌─────────────────────────────────┐
│ 備料彙總                  ▼ 展開 │
│ 共 N 種材料・{totalGram} g       │
└─────────────────────────────────┘

展開後：
  低筋麵粉   350.0 g  ████████░░
  奶油       175.0 g  ████░░░░░░
  細砂糖     120.0 g  ███░░░░░░░
  ...
  合計       XXX.X g
```

放置位置：`page.tsx` 的 `<MultiComponentSection />` 下方、`<SaveRecipeBar />` 上方。

**驗收：**
- [x] 跨組同名材料正確合併（例：兩組都有「低筋麵粉」→ 加總顯示）
- [x] 只有一組且無結果時不顯示
- [x] 折疊/展開動作正常
- [x] 任一組材料或份數變動後即時更新

---

### TASK-17-P2：配方列表顯示優化 + 儲存/載入驗證

**問題 A：配方列表無法辨識多組格式**

`src/components/recipes/RecipeCard.tsx`（或列表頁）現在顯示「N 項材料」，應改為：
- 多組配方：`{N} 個組合・{M} 項材料`
- 舊格式單組：維持「{M} 項材料」

**問題 B：刪除單行材料的確認彈窗摩擦過高**

`MultiComponentSection.tsx` 的刪除材料目前觸發 `ConfirmDialog`，改為：
- 直接刪除（無確認彈窗）
- 刪除後在底部顯示 Toast「已刪除 {材料名稱}」+ 可 Undo（3 秒內）

**問題 C：mode 切換來回，手填克數被靜默覆蓋**

確認 `setComponentTargetMode` 切換至 `mold` 再切回 `gram` 時，`gramPerUnit` 是否保留原本手填的值。若會被清空，修改邏輯：切換 mode 時不修改 `gramPerUnit`，由 `gramForCalc` 的 useMemo 決定使用哪個值。

**驗收：**
- [x] 配方列表：多組顯示「X 個組合・N 項材料」
- [x] 刪除材料：無彈窗，有 Toast + Undo
- [x] gram → mold → gram 來回切換，原本填的克數不消失
- [ ] 至少載入 3 筆舊格式配方確認克數正確（請手動）

---

### TASK-17-P3：清除改為「開始新配方」

**問題：** 「清除」後立刻補一張空白卡，視覺幾乎沒有回饋；份數和損耗率也沒重置，語意不一致。

**改動：**

1. `MultiComponentSection.tsx` section header 的「清除」按鈕文字改為「新配方」
2. 確認彈窗文字改為：
   - 標題：「開始新配方？」
   - 說明：「目前的配方組合將被清除，份數設定將重置為 6。」
3. `clearComponents()` 動作同時執行：
   - 清空 `components`
   - 重置 `compQuantity` 為 6（預設）
   - 重置 `compLossRate` 為 0

**驗收：**
- [x] 按鈕文字為「新配方」
- [x] 確認後份數回到 6、損耗率回到 0
- [x] `useLayoutEffect` 補一張空白卡的行為不變

---

### 完成後

更新 CHANGELOG.md（patch version，例：v1.7.1）

```bash
git add . && git commit -m "fix: multi-component UX improvements (TASK-17)" && git push origin main
```
