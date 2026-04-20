# BakeMao — CONTEXT
> ⚠️ 開始工作前必讀全域規則：`/vibecoding/AGENTS.md`

## SNAPSHOT（v0.2.4 | 2026-04-20）

- **GitHub**：[github.com/chaolinchen/bakemao](https://github.com/chaolinchen/bakemao)；**Vercel**：[bakemao.vercel.app](https://bakemao.vercel.app)
- **`GET /api/version`**：Hub 狀態頁用；prod 有 `VERCEL_GIT_COMMIT_SHA` 時 `commit` 為 7 位 SHA。
- **資料庫／登入**：**Neon** + **`neon/001_init.sql`**；**NextAuth v5** + Google；**不要**再用 `supabase/migrations/`（僅歷史）。必備 env：`AUTH_SECRET`、`AUTH_URL`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`DATABASE_URL`（`vercel env pull .env.local`）。**`AUTH_URL`** 須與實際 origin 一致（本機常用 `http://localhost:3000`）；**Google OAuth 重新導向 URI** 見本節下段。
- **Zustand 地雷（已修）**：模具目標改由 **`computeResult` + `src/lib/moldParts.ts`（`getMoldParts`）** 推導；**`CalcResult`** 若用 `useCalcStore(s => ({...}))` 必搭配 **`useShallow`**，否則易 **Maximum update depth**。
- **驗證**：最近一次 **`npm run build`**／**`npm test`（Vitest 8 題）** 已通過；**middleware** 已改為單獨 **`auth.config.ts`（Edge 不拉 Neon）**，prod middleware 約 **79KB**；全站 **`useKeyboardOffset`** 設 **`--keyboard-offset`（行動端鍵盤）** 與 SaveRecipeBar 底部補白。
- **功能進度**：**TASK-12 ∼ 17** 已完成（見 `CURSOR_TASKS.md`）；首頁含 **備料彙總**（`SummaryCard`）、多組配方卡；「新配方」會重置份數 6／損耗 0。

**Google Cloud OAuth 重新導向 URI（NextAuth）**：正式 `https://bakemao.smallfatmao.com/api/auth/callback/google`；本機 `http://localhost:3000/api/auth/callback/google`；可選 `https://bakemao.vercel.app/api/auth/callback/google`。舊 **Supabase** callback 可刪。

**PWA**：`@ducanh2912/next-pwa`；dev 可能顯示 PWA disabled；production 才有完整 SW。

---

## 本機開發：背景會看到很多 process？

通常 **只須開一個** `npm run dev`。**一組** Next dev 會出現 **兩個**相關 process，屬正常：

| 你看到的 | 說明 |
|---------|------|
| `node …/next dev` | CLI 父进程 |
| `next-server (v14.x)` | 實際 Listen **:3000** 的服務 |

**不需要**兩組各開一次；若 **3000、3001 同時有 next**，代表**重複啟動**，應只保留一組或關掉舊的。**Cursor / 其他 agent 的背景 terminal** 若已結束，相關 process 也應一併消失；若埠仍被占，用 `lsof -i :3000` 查 PID 再結束。

---

## 測試應在哪裡做？

| 類型 | 指令 / 位置 |
|------|-------------|
| **單元測試（計算引擎等）** | 專案根目錄：`npm test`（等同 `vitest run`），對應 `src/lib/*.test.ts` |
| **建置／型別／Lint** | `npm run build`（含 `next lint` + typecheck） |
| **手動端對端** | 瀏覽器：`http://localhost:3000`（計算、登入、儲存配方、`/recipes`、分享圖） |
| **線上驗證** | 部署網址（例 `https://bakemao.smallfatmao.com`）：確認 **Vercel 環境變數**與 **Google redirect URI** 已含該 origin |

目前 **無** Playwright／Cypress 專案內 E2E 腳本；若要自動化瀏覽器測試需另加。

---

## 疑難：`.next` chunk 遺失（`Cannot find module './xxx.js'`）

多發生在換套件、中斷建置或 dev 久掛之後。處理：**刪除 `.next` 目錄** → 再執行 `npm run dev` 或 `npm run build`。

---

## Neon：初始化資料庫（必做）

1. [Neon Console](https://console.neon.tech) → 複製連線字串 → `.env.local` 的 `DATABASE_URL`（勿 commit）。
2. Neon **SQL Editor** 執行 **`neon/001_init.sql`** 整份。
3. **Vercel** → bakemao → **Environment Variables**：同上變數，儲存後 **Redeploy**。

---

## 目前狀態（給 agent 續作）

- **規格**：仍以 **`PRD_BakeMao_v1.0.md`**（**v1.6**，含 §20／§21）為準；MVP 技術棧為 **Next.js 14、Neon、NextAuth**，非 Supabase Auth。
- **TASK-16**：首頁已整合多組配方主流程；`RecipeComponent` 擴充欄位見 `calcStore.ts`；舊儲存（僅 `lines`）從「我的配方」開啟時會遷移為單一組合。
- **已結案：Maximum update depth**  
  - **模具**：不再用 `useEffect` 把推導容積寫回 store；**`calcStore.computeResult`** 依 **`moldUi` + `getMoldParts`** 與畫面「共 X g」對齊。  
  - **結果區**：**`CalcResult.tsx`** 多欄位 snapshot 已用 **`useShallow`** 包物件 selector。  
  其他元件多為單一欄位 `useCalcStore((s) => s.x)`，無需 shallow。
- **建置品質**：`npm run build`、`npm test` 上次執行成功；若遇 **`Cannot find module './xxx.js'`** 或怪錯，先 **`rm -rf .next`** 再 dev／build。
- **待優化（非阻塞）**：PWA 圖示細節、`offlineSync.ts` 連線後重送。

## 下一步（產品向）

- 本機／線上再手動確認 **首頁多組配方**、儲存／載入、舊配方遷移。
- **手機實測**：PWA、離線、分享圖；**Google OAuth**：後台只保留正式＋本機（＋選用 vercel.app）redirect。
- **工程**：BakeMao 已設為 **git push main → Vercel 自動部署**（見 `AGENTS.md`），一般無需再手動 `vercel --prod`。
