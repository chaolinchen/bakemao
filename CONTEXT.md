# BakeMao — CONTEXT

## SNAPSHOT（v0.1.4 | 2026-04-17）

- **GitHub**：[github.com/chaolinchen/bakemao](https://github.com/chaolinchen/bakemao)；**Vercel**：[bakemao.vercel.app](https://bakemao.vercel.app)（已 `git connect`，push `main` 自動部署）
- **Supabase**：程式只會「連到你填的那個專案」——**儀表板不會自動出現名為 BakeMao 的專案**，必須自行**新建一個 Supabase Project**（名稱可自取，例如 `bakemao`），再依下文貼 URL／anon key、跑 SQL。
- **自訂網域**：`bakemao.smallfatmao.com` 已掛在 Vercel；DNS 須在網域商依 Vercel 指示設定。
- Next.js 14、`@ducanh2912/next-pwa`、計算引擎、Zustand、MoldSelector 迴圈修正等（略）

---

## Supabase：從零建立 BakeMao 用專案（必做）

若後台**沒有**可給 BakeMao 用的專案，請照序做（約 5–10 分鐘）：

### 1）新建專案

1. 開 [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. **Name**：自訂（例：`bakemao`）— 這只是顯示名稱，不必與 App 名稱相同  
3. **Database password**、**Region**（選離台灣近一點，例如 Tokyo / Singapore）依需求填寫 → 建立並等開機完成

### 2）複製 URL 與 anon key

1. Project → **Settings** → **API**
2. 複製 **Project URL** → 對應 `NEXT_PUBLIC_SUPABASE_URL`
3. 複製 **anon public** key → 對應 `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   （不要用 `service_role` 放進前端或 `NEXT_PUBLIC_*`。）

### 3）本機 `.env.local`（可選，方便本機 `npm run dev`）

在 `bakemao/` 目錄建立 `.env.local`（勿 commit），內容參考 `.env.example`，貼上兩個變數。

### 4）Vercel 環境變數

1. [Vercel](https://vercel.com) → 專案 **bakemao** → **Settings** → **Environment Variables**
2. 編輯或新增同一組 **Production**（與需要的話 **Preview**）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 儲存後 **Redeploy** 一次 Production（Deployments → 右上角 … → Redeploy），讓線上 bundle 用到新金鑰

### 5）建立資料表（recipes）

1. Supabase → **SQL Editor** → **New query**
2. 打開本 repo：`supabase/migrations/0001_create_recipes.sql`，**整份貼上** → **Run**
3. 左側 **Table Editor** 應可看到 **`recipes`** 表

### 6）OAuth（Google / Apple）— 登入與導向網址

1. **Authentication** → **Providers**：啟用 Google／Apple（依需求）
2. **Authentication** → **URL Configuration** → **Redirect URLs** 至少加入：
   - `https://bakemao.vercel.app/auth/callback`
   - `https://bakemao.smallfatmao.com/auth/callback`（若已綁定網域）
   - 本機開發可加：`http://localhost:3000/auth/callback`

---

## 目前狀態

- 部署：GitHub ↔ Vercel 已連線；**Supabase 要你自己建專案 + 跑 migration** 後，儲存配方與登入才會對應到正確資料庫。
- 若先前 Vercel 曾指向「別的專案」的金鑰：請依上節 **§4** 改成**新專案**的 URL／anon key。

## 下一步

- 完成 **bakemao.smallfatmao.com** DNS
- 依 §6 補齊 OAuth 與 Redirect URLs
- 補 PWA 圖示、offline 同步實作、實機測
