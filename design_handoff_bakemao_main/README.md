# Handoff: BakeMao 主畫面 · 3 個方向

## Overview
BakeMao（烘焙貓）主畫面重設計。這支單頁 PWA-like 的工具讓使用者做：
1. 設定「共做幾個成品」總份數（快選 chips + stepper）。
2. 新增一個或多個「配方組」，每組指定配方名、模具類型 / 蛋糕類型 / 尺寸 / 高度 → 系統算出此組需要的麵糊總重，再搭配材料比例（%）或克數，產出該組每種材料的實際克數與合計。
3. 下方 **備料彙總** 自動把各組配方的相同材料加總，顯示總公斤數，方便使用者對照採購。

這份 handoff 包含三個視覺方向的 HTML 原型，功能資訊架構一致，差別在視覺語彙。

## About the Design Files
本資料夾中的 HTML / JSX 檔案是 **設計參考原型**，不是要直接上線的生產程式碼。任務是：把這些 HTML 設計在目標專案既有的技術環境（React / Vue / SwiftUI / native 等）以既有的元件庫與樣式規範 **重新實作**。如果目標專案尚未定案技術棧，選擇最適合該專案屬性的框架再行實作即可。

## Fidelity
**High-fidelity（hifi）。** 所有顏色、字級、間距、圓角、陰影皆為最終設計稿；開發時請依下方 Design Tokens 與各 option 的數值精確實作。

## Design Directions (三個方向，選一)

### A · 雲朵奶蓋 Cloudy Cream (`option-1-cloud.jsx`)
- 最貼近 BakeMao logo 的貼紙風。
- 背景：天空藍 `#E6EEF5` + 奶油漸層。
- 卡片：奶油白 `#FFFBF2` + 2.5px 巧克力描邊 `#6B4A2F` + `0 4px 0 #6B4A2F` 的 offset 實心陰影（neubrutalism feel，但柔化圓角）。
- 主色強調：`#C8602A`（chip active / count pill / CTA）。
- 裝飾：4 點星形 sparkle（天空藍 `#6BA3D6` + 蜜橘 `#FFB38C`）。
- 字體：Baloo 2 + Noto Sans TC。

### B · 毛球泡泡 Mao Bubble (`option-2-bubble.jsx`)
- 圓滾滾泡泡風，圓角更大（24–32px），色塊更飽和。
- 背景：奶粉橘 `#FFF1E6`，含泡泡裝飾。
- 卡片有 `::after` 白色反光橢圓，營造「泡泡質感」。
- 材料列卡片化（不是表格），每列一顆泡泡。
- 備料彙總為深橘 `#C8602A` 反白區塊，層級對比強烈。
- 最具個性；適合主打「療癒 / 可愛」品牌定位。

### C · 手作筆記 Recipe Note (`option-3-notebook.jsx`)
- Editorial 食譜筆記本風格。
- 背景：米紙 `#F7EFE0` + 橫線紋理（repeating-linear-gradient）。
- 卡片為 1.5px 細描邊 + 3px offset 硬陰影，模擬紙張貼在桌上。
- 裝飾：washi tape、Recipe 戳章（旋轉 2°）、斜紋信封頂邊。
- 材料區是真正的表格（2 位數編號 + 名稱 + 值 + 刪除），最貼近「食譜筆記」的理性感。
- 小寫 uppercase 標籤（`01 · YIELD`、`INGREDIENTS`、`RESULT`）增加編排節奏。

## Screens / Views (皆為單頁滾動)

全頁寬度基準：**460 px**（行動裝置），最上層以 sticky header 固定品牌列。

### 1. Brand Header (sticky top)
- 左：`maologo.png` 40–44px + 標題 `BakeMao` (22px, weight 800) + 副標 `烘 焙 貓` / `RECIPE NOTE` (10–11px, letter-spacing 3px)
- 右：`我的配方` 導引按鈕（pill 或 text-link 依方向調整）
- 下緣：2–2.5px 巧克力實線分隔

### 2. 份數卡（Yield Card）
- 大標：`共做幾個成品？`（右側顯示目前份數 pill `6 個`）
- 副標：`蛋糕幾個、塔幾個、杯子蛋糕幾個…`（淺灰 `#9E8672`）
- 快選 chips：`1 / 2 / 4 / 6 / 12 / 24 / 48 / 100`（active chip 填 `#C8602A`）
- Stepper：`−` / 數字 / `+`，底色淺奶橘或天空藍

### 3. Section Header「多組配方計算」
- 左標題 + sparkle icon
- 右三顆 action：`截圖`（camera icon）/ `範本配方`（深色）/ `+ 新配方`（主橘）

### 4. 進階：備料損耗比例（collapsed row）
- 標籤 `進階` + 文字 `備料損耗比例` + 右側 `展開設定 ▾`

### 5. 配方卡（Recipe Card）— 本頁核心
一張大型卡片，內含：
1. **卡片頭**：配方名 input（預設「法式磅蛋糕」）+ `複製` / `✕` icon buttons
2. **輸入模式切換**：`% 比例輸入` / `g 克數輸入`（segmented control）
3. **目標量切換**：`輸入克數` / `按模具算`
4. **模具設定面板**（內縮 sub-panel）：
   - 模具類型：`圓模（吋）` / `塔圈（cm）` / `杯型`
   - 蛋糕類型：`慕斯類` / `磅蛋糕` / `海綿蛋糕` / `戚風蛋糕` / `自訂`
   - **打發說明 info box**：badge `奶油打發` + `此設定約需 465 g 麵糊` + 描述（兩行） + `例：磅蛋糕、瑪德蓮、費南雪` + 小字 `比重 0.85 · 填充率 50%`
   - 尺寸：`吋` / `cm` 單位切換 + 數字 chips `4 5 6 7 8 9 10 12`
   - 模具高度 input + `cm`
   - `共 464.95 g (1cc≈1g)`（橘色總量）
5. **份數列**：`份數` + 小 stepper + `沿用 6 份` 繼承標籤
6. **提示**：`主要材料（通常為麵粉）設 100，其他材料填相對比例`
7. **材料列**：每列 = 材料名（可含品牌 `· 總統牌`）+ % 輸入框 + `複製` / `刪除` 連結。第一列為「基底 100%」以強調色底標示
8. `+ 新增材料` dashed 按鈕
9. `合計 360.0 %` + `?` 小圓 tooltip trigger
10. **計算結果區塊**：每種材料一列 = 名稱 + 克數（monospace）+ 進度條；底部 `合計 2789.7 g`（主橘）+ `顯示計算過程` 連結

### 6. 新增組合（Add Group）
- 寬 dashed 按鈕 `+ 新增組合`，視覺比「新增材料」更大、更顯眼，暗示可加整組新配方。

### 7. 備料彙總（Summary）
- 頭部：`備料彙總`（方向 B 為深橘反白、C 為斜紋信封帶） + 副標 `共 4 種材料 · 2.79 kg` + `▲ 收起`
- 材料列：同計算結果的列樣式（名 + 克數 + bar）
- 最底 `合計 2.79 kg` 大字（24px, monospace, 主橘）

### 8. 儲存配方（Fixed bottom CTA）
- 固定在底部、全寬膠囊／矩形按鈕。主橘底白字（A、C）或深棕底白字（B），`letter-spacing: 2px`、`font-weight: 800`。

## Interactions & Behavior
- **Chips（份數、尺寸、蛋糕類型）**：點擊即切換 active；模具類型／單位切換會更新後面的 chip 單位與預設尺寸邏輯。
- **Stepper**：`−` / `+` 分別對目前值 ±1，最小值 1，無上限；長按可加速（非必要）。
- **% / g 模式切換**：切換會讓下方材料列單位跟著變（% → g 會以目前總麵糊量回推克數）。
- **目標量「按模具算」**：開啟模具面板；選好類型與尺寸後，系統依 `容量(cc) × 比重 × 填充率` 計算 `此設定約需 X g 麵糊`，這是材料列的分母基準。
- **份數「沿用」**：點「沿用 6 份」會把配方組份數同步為頁面總份數。
- **計算結果 bar**：長度按該列克數 / 該組最大克數 × 100%。
- **新增組合**：push 一張新的配方卡到列表，備料彙總自動累加相同材料。
- **儲存配方**：目前為前端行為；未來可綁定「我的配方」清單。

狀態：所有 chips / steppers / inputs 皆為受控元件，初始值見 `shared.jsx` 的 `FAKE_STATE`。

## State Management
建議的資料結構：
```ts
type Ingredient = { id: string; name: string; brand?: string; pct: number; g: number };
type RecipeGroup = {
  id: string;
  name: string;
  mode: 'percent' | 'gram';
  target: 'gram' | 'mold';
  moldType: 'round' | 'tart' | 'cup';
  cakeType: 'mousse' | 'pound' | 'sponge' | 'chiffon' | 'custom';
  moldUnit: 'inch' | 'cm';
  moldSize: number;
  moldHeight: number;
  moldBatterNeed: number; // g
  qty: number;
  ingredients: Ingredient[];
};
type PageState = {
  totalQty: number;
  lossRatio: number; // 進階設定
  groups: RecipeGroup[];
};
```

Derived values（純計算，用 selector / useMemo 實作）：
- 每組 `totalPct = Σ pct`
- 每組 `totalG = Σ g`（依模式換算）
- 頁面 `summary` = 依材料名（+ brand）聚合所有組的 `g`，再乘上 `(1 + lossRatio)`
- `summaryKg = Σ summary.g / 1000`

## Design Tokens
```
Color — 巧克力主軸
  --mao-choco-900: #3D2918   // 深棕底 / notch
  --mao-choco-700: #4A3322   // 主要文字
  --mao-choco-500: #6B4A2F   // 描邊 / 次文字
  --mao-choco-300: #9E8672   // 灰字
  --mao-choco-200: #B0A090

Color — 橘系強調
  --mao-orange-700: #8B3B1C  // 深橘文字（whip badge）
  --mao-orange-500: #C8602A  // 主橘 CTA / 強調
  --mao-orange-300: #E8955A
  --mao-orange-200: #FFB38C
  --mao-orange-100: #FFD089  // 金黃重點

Color — 奶油底
  --mao-cream-100: #FFFBF2   // 卡片底
  --mao-cream-200: #FFF3E6
  --mao-cream-300: #FFE1C7   // 內嵌面板 / chip hover
  --mao-cream-400: #FFE9D1

Color — 方向背景
  (A) sky: #E6EEF5 + sky accent #6BA3D6
  (B) bubble: #FFF1E6
  (C) paper: #F7EFE0 + 橫線 rgba(107,74,47,0.05) 1px / 30px

Color — 刪除 / 警告
  --mao-danger: #B54728

Typography
  Display / 中文: 'Noto Sans TC' 700/800
  Display / 英數: 'Baloo 2' 700/800
  Numeric: 'Roboto Mono' 600/700
  Sizes: 10 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 16 / 17 / 18 / 22 / 24
  letter-spacing:
    - 副標 sticker: 3–4 px
    - CTA: 2 px
    - uppercase lbl (C方向): 2–4 px

Radius
  A: chip 14, card 24, pill 999, inner 12–18
  B: chip 18, card 28–32, pill 999, bubble step 24
  C: card 4–6（紙張感），chip 3–4

Shadow
  A/B: 0 4–5 px 0 #6B4A2F（offset 實心）+ 陰影偶用 0 10px 22px rgba(107,74,47,0.25)
  C: 3px 3px 0 #6B4A2F（硬印章陰影）

Border
  A/B: 2–2.5 px solid #6B4A2F
  C: 1.5 px solid #6B4A2F

Spacing (padding / gap)
  4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 22
```

## Assets
- `assets/maologo.png` — 使用者提供的 BakeMao 三花貓貼紙 logo（896×1195 PNG）
- Sparkle 與 paw print 為 inline SVG（見 `shared.jsx`），可直接移植

## Files
```
design_handoff_bakemao_main/
├── README.md                     (本檔案)
├── BakeMao 主畫面.html            (入口；design_canvas 同時呈現三個方向)
├── shared.jsx                    (共用狀態 FAKE_STATE、MaoLogo、Sparkle、ICONS)
├── option-1-cloud.jsx            (方向 A 完整 React 元件 + CSS)
├── option-2-bubble.jsx           (方向 B)
├── option-3-notebook.jsx         (方向 C)
├── design-canvas.jsx             (展示用畫布框架，實作時不需要)
└── assets/
    └── maologo.png
```

開發順序建議：
1. 先按 Design Tokens 建 CSS 變數／Tailwind theme。
2. 抽共用元件：`Chip`、`Stepper`、`SegmentedControl`、`StickerCard`、`IngredientRow`、`ResultBar`。
3. 依所選方向（A / B / C）套上視覺差異層。
4. 接真實 state & 計算邏輯（見 State Management）。
5. 備料彙總用 selector 從 `groups` 實時聚合。
