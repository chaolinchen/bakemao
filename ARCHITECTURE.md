# BakeMao 烘焙貓 — 系統架構規劃
**版本：arch-v1.0 | 日期：2026-04-17**

---

## 1. 技術選型確認與理由

### Next.js 14 App Router
- App Router Server Components 讓靜態資料（molds.json、ingredients.json）可在伺服器端預渲染，利於 SEO
- `next/font` 整合 Google Fonts，自動 preload 並 self-host，消除 FOUT
- `generateMetadata` 支援未來各模具規格 SEO 落地頁動態 Open Graph
- **注意：** 計算引擎與 Wake Lock 屬客戶端邏輯，對應頁面需標記 `'use client'`

### Neon（替代 Supabase）
- Supabase 免費帳號已達 2 個專案上限，改用 Neon
- Neon：serverless PostgreSQL，免費方案無專案數量限制，0.5GB 儲存（配方文字資料充足）
- 搭配 NextAuth.js v5 + @auth/neon-adapter 處理 Google OAuth / Apple Sign In
- 行列級安全改由應用層 `WHERE user_id = session.user.id` 實作（無 RLS）
- `DATABASE_URL` 已設定於 `.env.local`，Vercel 需同步設定

### Vercel
- Next.js 官方部署平台，零配置 CI/CD
- Edge Network 台灣延遲低（Tokyo PoP）
- 子域名 `bakemao.smallfatmao.com` 透過 Custom Domain 設定

### next-pwa
- ⚠️ 使用 `@ducanh2912/next-pwa`（fork 版），而非原始 `next-pwa`，已修復 App Router 相容性問題

### html2canvas
- 純前端 Canvas 截圖，符合「分享結果圖離線可用」需求
- ⚠️ 跨域圖片需 `useCORS: true`，品牌 logo 建議放入 `/public` 或 Base64 內嵌
- ⚠️ 截圖前需 `await document.fonts.ready` 確保字體載入

---

## 2. 目錄結構

```
/bakemao
├── public/
│   ├── icons/                    # PWA icon 集（72/96/128/144/152/192/384/512px）
│   ├── logo.png                  # 品牌 logo（html2canvas 用）
│   ├── images/
│   │   └── cat-empty-bowl.svg    # 空狀態插圖
│   └── manifest.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout：字體載入、Providers 注入
│   │   ├── page.tsx              # 首頁（計算主頁面）
│   │   ├── recipes/
│   │   │   └── page.tsx          # 配方管理列表頁（需登入）
│   │   └── globals.css           # Tailwind base、CSS 變數（色彩 token）
│   │
│   ├── components/
│   │   ├── ui/                   # 無業務邏輯的基礎元件
│   │   │   ├── Button.tsx
│   │   │   ├── SegmentControl.tsx
│   │   │   ├── NumberInput.tsx   # inputMode="decimal"，整合 pattern
│   │   │   ├── BottomSheet.tsx   # 通用 Bottom Sheet 容器
│   │   │   ├── Dialog.tsx        # Confirm Dialog
│   │   │   ├── Toast.tsx
│   │   │   ├── Banner.tsx        # 離線提示頂部條
│   │   │   └── Stepper.tsx       # 數量 +/- 元件
│   │   │
│   │   ├── MoldSelector.tsx
│   │   ├── RecipeInput.tsx
│   │   ├── IngredientSearchSheet.tsx
│   │   ├── CalcResult.tsx
│   │   ├── LossControl.tsx
│   │   ├── IngredientRow.tsx
│   │   ├── ResultBar.tsx
│   │   ├── SaveButton.tsx
│   │   ├── AuthSheet.tsx
│   │   ├── RecipeNameDialog.tsx
│   │   └── RecipeCard.tsx
│   │
│   ├── lib/
│   │   ├── calculator.ts         # 計算引擎（純函數）
│   │   ├── calculator.test.ts    # 單元測試
│   │   ├── db.ts                 # Neon serverless client
│   │   ├── shareImage.ts         # html2canvas + Web Share API
│   │   ├── wakeLock.ts           # Wake Lock API 封裝
│   │   ├── offlineSync.ts        # localStorage 暫存 + 連線後自動同步
│   │   └── moldsVolume.ts        # 模具容積計算（圓柱/長方公式）
│   │
│   ├── data/
│   │   ├── molds.json
│   │   └── ingredients.json
│   │
│   ├── hooks/
│   │   ├── useWakeLock.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── useRecipes.ts
│   │   └── useCalcState.ts
│   │
│   ├── store/
│   │   └── calcStore.ts          # Zustand store
│   │
│   ├── types/
│   │   ├── calculator.ts
│   │   ├── mold.ts
│   │   ├── ingredient.ts
│   │   └── recipe.ts
│   │
│   └── middleware.ts             # NextAuth session refresh
│
├── supabase/
│   └── migrations/
│       └── 0001_create_recipes.sql
│
├── next.config.ts                # next-pwa 設定
├── tailwind.config.ts            # 色彩 token、字體
└── vitest.config.ts              # 單元測試設定
```

---

## 3. 資料流架構：Zustand（選用理由）

| 面向 | React Context | Zustand |
|------|--------------|---------|
| 即時計算性能 | 每次 keypress 觸發整棵樹 re-render | 細粒度訂閱，僅相關元件更新 |
| localStorage 整合 | 需額外實作 | `persist` middleware 內建 |
| Provider 層數 | 需巢狀 Provider | 單一 store 文件，無 Provider |

### Store 結構

```typescript
calcStore（Zustand）
├── mode: CalcMode                    // 'percent' | 'gram'
├── targetInput: TargetInput
├── lossInput: LossInput
├── ingredients: IngredientInput[]
├── result: CalcResult | null         // 衍生值，每次 action 後同步計算
│
└── Actions:
    ├── setMode()                     // 切換模式（含 confirm 清空）
    ├── setTarget()
    ├── setLoss()
    ├── addIngredient()
    ├── updateIngredient()
    ├── removeIngredient()
    └── loadRecipe()                  // 從已儲存配方還原全部狀態

Middleware: persist（key: 'bakemao_calc_state'，還原上次未完成計算）
```

---

## 4. 計算引擎設計

### 原則：純函數、無副作用、可測試

```typescript
// 函數拆分
calcLossRatio(input: LossInput, quantity?: number): number
  // preset +0 → 1.0
  // preset +1 → (quantity + 1) / quantity
  // preset +2 → (quantity + 2) / quantity
  // manual → 1 / (1 - ratio)

calcTargetGram(target: TargetInput): number
  // mold → volumeCC * quantity
  // gram → totalGram

inferPercents(ingredients: IngredientInput[]): number[]
  // 模式 B：各材料g / 比例材料總g * 100，固定材料為 0

calculate(mode, ingredients, target, loss): CalcResult
  // 1. calcTargetGram
  // 2. calcLossRatio
  // 3. unitGram = targetGram / lossRatio / totalPct
  // 4. 各材料 gram = isFixed ? value : pct * unitGram
  // 5. 組裝 CalcResult
```

---

## 5. PWA + 離線策略

### Service Worker 快取層

| 層 | 對象 | 策略 |
|----|------|------|
| App Shell | `/_next/static/**`、`/icons/**` | CacheFirst，永久 |
| 靜態資料 JSON | `molds.json`、`ingredients.json` | CacheFirst，隨 SW 版本更新 |
| 字體 | Google Fonts | CacheFirst，365 天 |
| 頁面 | `/`、`/recipes` | NetworkFirst，失敗回傳快取 |

### 離線同步流程

```
儲存配方離線時 → localStorage 'bakemao_pending_saves'
window online 事件 → 逐一 Supabase upsert → 清除 localStorage
衝突處理：client_updated_at > server updated_at 才 upsert，否則提示用戶
```

### manifest.json
```json
{
  "name": "BakeMao 烘焙貓",
  "short_name": "BakeMao",
  "theme_color": "#C8602A",
  "background_color": "#F7F0E6",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/"
}
```

---

## 6. Neon Database Schema

> 資料庫：Neon（serverless PostgreSQL）
> 連線：`@neondatabase/serverless`，使用 `DATABASE_URL` 環境變數
> Auth：NextAuth.js v5 + @auth/neon-adapter（Google OAuth / Apple Sign In）
> 安全：應用層過濾 `WHERE user_id = session.user.id`（無 RLS）

```sql
-- 在 Neon Dashboard SQL Editor 執行

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,           -- NextAuth provider account ID
  provider   TEXT NOT NULL,              -- 'google' | 'apple'
  email      TEXT,
  name       TEXT,
  image      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT REFERENCES users(id) NOT NULL,
  name              TEXT NOT NULL CHECK (char_length(name) <= 30),
  mode              TEXT NOT NULL CHECK (mode IN ('percent', 'gram')),
  target_type       TEXT NOT NULL CHECK (target_type IN ('mold', 'gram')),
  target_gram       NUMERIC CHECK (target_gram >= 0),
  mold_id           TEXT,
  mold_params       JSONB,
  quantity          INT DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 99),
  loss_type         TEXT CHECK (loss_type IN ('preset', 'manual')),
  loss_value        NUMERIC,
  ingredients       JSONB NOT NULL,
  is_pinned         BOOLEAN DEFAULT false,
  client_updated_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 配方列表頁效能 index
CREATE INDEX IF NOT EXISTS recipes_user_id_updated_at_idx
  ON recipes (user_id, updated_at DESC);
```

### ingredients JSONB 結構
```json
[
  {
    "name": "低筋麵粉",
    "brand": "日清山茶花",
    "value": 100,
    "isFixed": false,
    "pct": 100,
    "gram": 350.5
  }
]
```
`pct` 與 `gram` 儲存計算結果快照，列表頁顯示摘要無需重算。

---

## 7. 關鍵技術風險

| 風險 | 嚴重度 | 解法 |
|------|--------|------|
| next-pwa App Router 相容性 | 高 | 使用 `@ducanh2912/next-pwa` |
| html2canvas 字體截圖失真 | 中 | `await document.fonts.ready`；字體 self-host |
| iOS Safari PWA 安裝限制 | 中 | 手動提示 UI；Apple Sign In 用系統瀏覽器開啟 |
| 即時計算輸入延遲（20+材料）| 低 | Zustand 細粒度訂閱；`startTransition` 備選 |
| offlineSync 多裝置衝突 | 低 | `client_updated_at` 比對；MVP 簡單處理 |
| Wake Lock iOS 16.3以下不支援 | 低 | feature detection 靜默降級 |
| 耗損 preset 固定材料語意 | 低 | 結果頁小字說明「固定材料不納入備用計算」 |

---

## 8. 部署架構與 SOP

### 專案定位

| 項目 | 內容 |
|------|------|
| 本地路徑 | `vibecoding/bakemao/` |
| GitHub Repo | `chaolinchen/bakemao`（待建立）|
| Vercel 專案 | `bakemao`（待建立）|
| 正式網址 | `bakemao.smallfatmao.com` |
| 部署方式 | **git push 自動部署**（Type A）|
| Branch | `main` |

### 初次建立步驟（只做一次）

```bash
# 1. 建立 GitHub repo
gh repo create chaolinchen/bakemao --public

# 2. 本地初始化
cd vibecoding/bakemao
git init
git remote add origin https://github.com/chaolinchen/bakemao.git
git branch -M main

# 3. 在 Vercel 匯入 GitHub repo
# Vercel Dashboard → Add New Project → Import chaolinchen/bakemao
# Framework: Next.js（自動偵測）
# Project Name: bakemao

# 4. 設定自訂域名
# Vercel Project → Settings → Domains → 新增 bakemao.smallfatmao.com
# DNS：在 smallfatmao.com 的 DNS 設定新增 CNAME bakemao → cname.vercel-dns.com

# 5. 設定環境變數（Vercel Dashboard 或 CLI）
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add AUTH_GOOGLE_ID
vercel env add AUTH_GOOGLE_SECRET
```

### 日常開發流程

```bash
# 一般功能開發
git add .
git commit -m "feat: 描述改動"
git push origin main
# → Vercel 自動 build + deploy，約 30-60 秒上線

# 較大功能（需要 preview 確認）
git checkout -b feat/功能名稱
git add . && git commit -m "feat: xxx"
git push origin feat/功能名稱
# → Vercel 產生 preview URL，確認後 merge 到 main
```

### 環境變數清單

| 變數 | 說明 | 放哪裡 |
|------|------|--------|
| `DATABASE_URL` | Neon PostgreSQL 連線字串 | `.env.local` + Vercel |
| `AUTH_SECRET` | NextAuth.js 簽名金鑰 | `.env.local` + Vercel |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | `.env.local` + Vercel |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | `.env.local` + Vercel |
| `AUTH_APPLE_ID` | Apple Sign In（選用）| `.env.local` + Vercel |
| `AUTH_APPLE_SECRET` | Apple Sign In（選用）| `.env.local` + Vercel |

> `.env.local` 不進 git（`.gitignore` 確認排除）
> `DATABASE_URL` 已設定於 `.env.local`（Neon ap-southeast-1 region）

---

## 9. 實作優先序

```
Week 1（P0 Core）：
  TASK-00 初始化 → TASK-01 靜態資料 → TASK-02 計算引擎+測試
  → TASK-03 模具選擇 → TASK-04 配方輸入 → TASK-05 食材搜尋
  → TASK-06 計算結果 → TASK-07 主頁面組裝

Week 2（P1 Features）：
  TASK-08 PWA → TASK-09 Supabase Auth+儲存
  → TASK-10 配方管理 → TASK-11 分享圖

Week 3（QA）：
  iOS Safari 實機 → 離線流程 → html2canvas 品質 → Lighthouse PWA audit
```
