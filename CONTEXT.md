# BakeMao — CONTEXT

## SNAPSHOT（v0.1.1 | 2026-04-17）

- Next.js 14 App Router + Tailwind + Zustand + Vitest
- `@ducanh2912/next-pwa`（PWA / `public/sw.js`）
- 計算引擎 `src/lib/calculator.ts` + 單元測試
- 主頁：模具、配方、結果、Wake Lock、離線 Banner、儲存（Supabase + localStorage 離線佇列 stub）
- MoldSelector：修正 `useEffect` 依賴 `parts` 物件 + 重複 `setState` 造成的 Maximum update depth infinite loop
- 配方頁 `/recipes`、分享圖 `html2canvas`

## 目前狀態

- **已完成**：CURSOR_TASKS TASK-00～11 對應之程式骨架與核心流程；`npm run build` 可通過
- **需設定**：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`；執行 `supabase/migrations/0001_create_recipes.sql`；OAuth 於 Supabase Dashboard 設定 Google/Apple
- **預設 Supabase client fallback**：無 env 時仍可 build，上線前務必換成真實金鑰

## 下一步

- 補 PWA 多尺寸圖示（`public/icons/*`）與品牌 `logo.png`（分享浮水印可替換為圖檔）
- 完善 `offlineSync` 連線後上傳、衝突處理
- 實機測 iOS PWA / Wake Lock / html2canvas 字體
