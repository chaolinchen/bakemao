# BakeMao — CONTEXT

## SNAPSHOT（v0.1.3 | 2026-04-17）

- **GitHub**：[github.com/chaolinchen/bakemao](https://github.com/chaolinchen/bakemao)（`main` 已推送；Type A：**push main → Vercel 自動部署**，已 `vercel git connect` 連結專案）
- **Vercel Production**：[bakemao.vercel.app](https://bakemao.vercel.app)（專案 `chaolins-projects-7a1f0e81/bakemao`）
- **環境變數**：已於 Vercel 設定 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`（**Production + Development**；數值來自本機 **Maomemo** 的 `.env.local`，與 MaoMemo **共用同一 Supabase 專案**）。Preview（PR）專用變數若需與 Production 一致，請至 Vercel Dashboard → Environment Variables 為 **Preview** 新增（CLI 對非 `main` 分支須逐分支指定）。
- **自訂網域**：已在 Vercel 專案加入 **bakemao.smallfatmao.com**；DNS 尚在 **GoDaddy**（`ns33/ns34.domaincontrol.com`），請依 Vercel 指示新增 **`A bakemao → 76.76.21.21`**（或改用 Vercel nameservers），驗證通過後才會正式指向站點。
- **資料庫**：請在 **該 Supabase 專案** 執行 `supabase/migrations/0001_create_recipes.sql`（若尚未執行），儲存配方與登入才會正常。
- Next.js 14 App Router + Tailwind + Zustand + Vitest、`@ducanh2912/next-pwa`、計算引擎與 MoldSelector 無限迴圈修正等（見前版 SNAPSHOT）

## 目前狀態

- 自動化部署鏈結：GitHub ↔ Vercel 已就緒；下次 `git push origin main` 會觸發新 deployment。
- 若日後 BakeMao 要**獨立 Supabase 專案**：於 Supabase 新建專案後，在 Vercel 覆寫上述兩個 `NEXT_PUBLIC_*` 即可。

## 下一步

- 完成 **bakemao.smallfatmao.com** 的 DNS A 記錄（或 CNAME，依 Vercel 當下指示為準）
- Supabase：OAuth（Google／Apple）若尚未為該 redirect URL 設定，請於 Dashboard 補上
- 補 PWA 多尺寸圖示、`offlineSync` 完整化、實機測
