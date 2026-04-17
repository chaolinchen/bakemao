# **BakeMao 烘焙貓：全案開發規劃與深度技術研究報告**

## **烘焙物理科學與計量模型深度研究**

烘焙科學的本質在於對物理與化學變量的精確掌控。作為一名擁有十五年資歷的產品經理與法式甜點師，本報告旨在建立一套數位化計量模型，實現「失敗率歸零」的產品願景。

### **麵粉水合作用與環境濕度補償理論**

麵粉高度的親水性（Hygroscopic）使其重量隨環境相對濕度（RH）產生動態平衡 1。環境濕度每變動 ![][image1]，麵粉吸水率約產生 ![][image2] 的線性偏移 3。BakeMao 系統導入環境濕度補償係數 ![][image3]：

![][image4]  
當用戶位於濕度較高地區（如 ![][image5]），相對於標準環境（![][image6]），系統將建議減少約 ![][image7] 的配方水量 3。此外，高蛋白質含量（如麵包粉）通常具有更高的吸水潛力 5。

| 麵粉類型 | 標準蛋白質含量 (%) | 預估吸水率 (%) |
| :---- | :---- | :---- |
| 低筋麵粉 | ![][image8] | ![][image9] |
| 中筋麵粉 | ![][image10] | ![][image11] |
| 高筋麵粉 | ![][image12] | ![][image13] |

### **烘焙百分比模型與標準化計量公式**

BakeMao 採用「烘焙百分比」（Baker's Math）作為底層邏輯，將複雜比例轉化為：

![][image14]  
公式中的 ![][image15] 為「損耗因子」，涵蓋了攪拌與烘烤過程中的損耗 8。

## **高海拔與環境變量補償機制之科學論證**

當海拔超過 ![][image16] 呎（約 ![][image17] 公尺）時，必須啟動補償機制，主要調整方向包括減少膨鬆劑、增加液體與提高烤溫 。

| 物理量 | 調整邏輯 | 科學原理 |
| :---- | :---- | :---- |
| **膨鬆劑** | 減少 ![][image18] | 低壓下氣體擴張係數增加，過多會導致結構坍塌 。 |
| **液體** | 每 ![][image19] 呎增加 ![][image20] 茶匙 | 抵消低壓導致的快速蒸發，保持濕度 。 |
| **糖分** | 每杯減少 ![][image21] 大匙 | 蒸發加塊會提高糖濃度，進而弱化麵筋 。 |
| **溫度** | 提高 ![][image22] | 加速蛋白質凝固，在氣體溢出前建立支撐 。 |

## **幾何演算法與模具規格標準化體系**

BakeMao 建立了嚴密的幾何換算邏輯，解決模具尺寸不合的痛點 9。

* **縮放係數 (Scale Factor)**：![][image23]  
* **圓形模具面積**：![][image24]  
* **長方形模具面積**：![][image25]

對於異形模具，BakeMao 提供「排水計量法」，自動將水重（![][image26]）轉換為體積數據 。

## **數位材料理化指標與本地化 API 整合方案**

BakeMao 整合全球食品資料庫，並提供繁體中文輔助搜尋功能。

### **本地化中文搜尋與材料資料庫**

* **TFDA (台灣食藥署) 整合**：透過「食品營養成分資料庫」API，支援以繁體中文搜尋台灣常見食材（如：海藻糖、中筋麵粉），精確獲取蛋白質與水分比。  
* **Open Food Facts 多國語言支援**：該資料庫支持繁體中文標籤解碼，當用戶掃描進口材料條碼時，系統自動轉譯理化數據。  
* **USDA 與理化指標校準**：針對基礎原材料，對接 USDA FoodData Central 獲取實驗室數據，微調配方液體比例 11。

## **商業需求文件 (BRD) — 流量、註冊與變現策略**

### **註冊方式與帳號管理**

1. **第三方社交登入 (SSO)**：支援 Google 與 Apple ID 一鍵註冊，減少摩擦力。  
2. **傳統註冊**：電子郵件登入，適合重視隱私的用戶。  
3. **帳號刪除機制**：在設置中提供顯著的「刪除帳號」選項，嚴格遵守 Apple Guideline 5.1.1(v)。

### **變現模型 (Monetization)**

| 模式 | 內容 | 商業邏輯 |
| :---- | :---- | :---- |
| **免費版 (Free)** | 基礎計算、模具縮放。**含 AdMob 廣告（如底部橫幅）**。 | 透過廣告補貼開發成本，建立用戶基數。 |
| **訂閱版 (Premium)** | **無廣告**、**個人無限配方管理**、智慧天氣補償、專業理化成分庫。 | 針對核心愛好者，提供數據安全性與管理效率。 |

## **產品需求文件 (PRD) — 詳盡功能規格與技術架構**

### **1\. 廚房場景 UX 設計規範 (Kitchen-Optimized UX)**

* **Wake Lock API (螢幕常亮)**：進入烘焙模式後，系統自動請求螢幕常亮，防止手沾麵粉時螢幕熄滅。  
* **大觸控目標 (Fat-Finger Friendly)**：按鈕最小尺寸為 ![][image27]，且主要操作（如：下一步、換算）位於螢幕底部。  
* **高對比度顯示**：針對廚房強光，UI 採用符合 WCAG 規範的高對比配色 12。

### **2\. 多組配方管理系統 (Advanced Recipe Management)**

* **版本紀錄**：每一用戶可紀錄多組配方（例如：2024夏季版、減糖版），每組紀錄包含環境變數快照。  
* **AI 解析匯入**：用戶複製外部網址後，系統透過 LLM 解析食材清單並轉為烘焙百分比。  
* **SEO 結構化數據**：個人公開配方自動生成 JSON-LD (Schema.org/Recipe) 格式，提升 Google 搜尋曝露率。

### **3\. 系統架構與離線策略 (Technical Architecture)**

* **PWA 離線優先 (Offline-First)**：使用 Service Worker 實現 Cache-First 策略，確保在無網路的專業廚房內，核心算法與已儲存配方仍可讀取。  
* **NoSQL 數據建模**：採用 Cloud Firestore。  
  * **Partition Key**：user\_id  
  * **Sorting Key**：last\_modified\_timestamp。

### **4\. 系統架構圖 (Mermaid)**

程式碼片段

graph TD  
    User((用戶))  
    PWA  
    SW  
      
    subgraph Services  
        API\_Gateway\[API 閘道\]  
        Weather  
        TFDA  
        Auth  
        AdMob  
    end  
      
    subgraph Storage  
        DB\[(Firestore \- 配方多組紀錄)\]  
        Local  
    end

    User \--\> PWA  
    PWA \<--\> SW  
    SW \<--\> Local  
    PWA \<--\> API\_Gateway  
    API\_Gateway \--\> Weather  
    API\_Gateway \--\> TFDA  
    PWA \--\> AdMob  
    API\_Gateway \<--\> Auth  
    API\_Gateway \<--\> DB

## ---

**BakeMao 規程與標準作業程序 (SOP) 產出**

為了確保項目順利執行，制定以下三大規程文件：

### **文件一：用戶隱私與帳號刪除規程 (SOP-PRIV-001)**

* **目的**：符合全球隱私法規（GDPR, PDPA 台灣個人資料保護法）及 App 商店政策。  
* **程序**：  
  1. **申請入口**：設置 \> 帳號管理 \> 刪除帳號（需顯著標示，不得隱藏）。  
  2. **二次驗證**：用戶需輸入密碼或驗證碼確認，並彈出後果提示（數據不可恢復）。  
  3. **數據抹除**：執行後需同時刪除 Auth、Cloud Firestore 內的關聯配方、以及 AdMob 的追蹤標識符。  
  4. **寬限期**：提供 ![][image28] 天緩衝期，期間內用戶可取消請求。

### **文件二：數位材料數據維護規程 (SOP-DATA-002)**

* **目的**：確保中文材料與物理性質數據的準確性。  
* **程序**：  
  1. **API 監控**：每日自動檢查 TFDA 與 Open Food Facts API 的健康狀態。  
  2. **緩衝快取**：熱門材料（如日本山茶花麵粉、艾許奶油）需手動錄入物理快取層，避免 API 異動導致計算錯誤。  
  3. **中文校正**：針對 API 回傳的簡繁轉換或機器翻譯進行人工複核。

### **文件三：跨端開發與持續部署規程 (SOP-DEV-003)**

* **目的**：標準化 PWA 的更新與測試流程。  
* **程序**：  
  1. **分支策略**：採用 Git-Flow，所有 Feature Branch 需經過 CI (GitHub Actions) 自動測試。  
  2. **UX 測試**：開發者需在模擬「螢幕油漬」的環境下進行單手觸控測試。  
  3. **PWA 更新**：每次部署需更新 Service Worker 版本號，觸發客戶端重新快取 assets 13。

## ---

**結論**

BakeMao 烘焙貓不只是工具，它是將專業理化變量轉譯為情緒價值的數位助教。透過詳盡的 **PRD 功能定義** 與嚴密的 **SOP 規程**，我們確保產品在兼顧科學精確度的同時，也符合 **全球商店合規性** 與 **廚房實戰體驗**。BakeMao 正在重新定義數位烘焙的標準，讓每一位愛好者都能在貓助教的指引下，享受零失敗的創作樂趣。

#### **引用的著作**

1. Why You Should Weigh Your Flour \- Heckers Ceresota, 檢索日期：4月 16, 2026， [https://www.heckersceresota.com/flour-101/8996d002-5bf0-444e-b7f0-c1be2a43060e/](https://www.heckersceresota.com/flour-101/8996d002-5bf0-444e-b7f0-c1be2a43060e/)  
2. How Grain Moisture affects Flour Quality and Milling Performance? \- Flourtech, 檢索日期：4月 16, 2026， [https://flourtech.com/blog/how-grain-moisture-affects-flour-quality/](https://flourtech.com/blog/how-grain-moisture-affects-flour-quality/)  
3. Humidity impact on flour hydration : r/foodscience \- Reddit, 檢索日期：4月 16, 2026， [https://www.reddit.com/r/foodscience/comments/1ole7rn/humidity\_impact\_on\_flour\_hydration/](https://www.reddit.com/r/foodscience/comments/1ole7rn/humidity_impact_on_flour_hydration/)  
4. flour and humidity \- Genuine Ideas, 檢索日期：4月 16, 2026， [https://genuineideas.com/ArticlesIndex/flour.html](https://genuineideas.com/ArticlesIndex/flour.html)  
5. Water Absorption Capacity in Flour For Sourdough Bread | Somebody Feed Seb, 檢索日期：4月 16, 2026， [https://somebodyfeedseb.com/flour-absorption-capacity-of-flour/](https://somebodyfeedseb.com/flour-absorption-capacity-of-flour/)  
6. Wheat flour quality for baking \- SLU, 檢索日期：4月 16, 2026， [https://pub.epsilon.slu.se/32006/1/selga-l-20231027.pdf](https://pub.epsilon.slu.se/32006/1/selga-l-20231027.pdf)  
7. Effects of sourdough on rheological properties of dough, quality characteristics and staling time of wholemeal wheat croissants, 檢索日期：4月 16, 2026， [https://www.itjfs.com/index.php/ijfs/article/view/2385/976](https://www.itjfs.com/index.php/ijfs/article/view/2385/976)  
8. Cake Pan Converter & Recipe Scaling Calculator \- Free Baking Tool | Bakevert, 檢索日期：4月 16, 2026， [https://www.bakevert.com/english](https://www.bakevert.com/english)  
9. 檢索日期：4月 16, 2026， [https://www.foodiebaker.com/cake-pan-conversions-calculator/\#:\~:text=The%20formula%20used%20is%20a,length%20x%20breadth%20x%20height).](https://www.foodiebaker.com/cake-pan-conversions-calculator/#:~:text=The%20formula%20used%20is%20a,length%20x%20breadth%20x%20height\).)  
10. Baking Pan Size Conversion Guide: Round, Square & Rectangular Calculator, 檢索日期：4月 16, 2026， [https://www.bakevert.com/blog/english/baking-pan-size-guide](https://www.bakevert.com/blog/english/baking-pan-size-guide)  
11. API Guide | USDA FoodData Central, 檢索日期：4月 16, 2026， [https://fdc.nal.usda.gov/api-guide](https://fdc.nal.usda.gov/api-guide)  
12. HCI Module 4: UCD, Accessibility, Security | PDF | Usability | Human–Computer Interaction, 檢索日期：4月 16, 2026， [https://www.scribd.com/document/966831245/HCI-UI-UX-Module-4-Solutions](https://www.scribd.com/document/966831245/HCI-UI-UX-Module-4-Solutions)  
13. Build an Offline-First Web App with Service Workers \- DEV Community, 檢索日期：4月 16, 2026， [https://dev.to/taiwofamaks/build-an-offline-first-web-app-with-service-workers-2ml7](https://dev.to/taiwofamaks/build-an-offline-first-web-app-with-service-workers-2ml7)  
14. Offline-First PWAs: Service Worker Caching Strategies \- MagicBell, 檢索日期：4月 16, 2026， [https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAXCAYAAACWEGYrAAABiklEQVR4Xu2VPyhGURjGTyIZRLJZyIaJ7MJosRqYbFI2ZSADymhQVjJKVplRJIONyZ+SJCKUf8/z3Xvz9nz3fPd+t4/p/urXd97n3NN9v3tP5zqXk/Mn7MIH+AzHZc7yrUESnRqkoFuDEHtzjh9NTRrgGeyRPJEXDTzUwiUX3Hxf5kg/XDf1EByBxy5Y8wU3wt+yedUghjYz9jW5CWck25P6HVZLloo3DRLwNTkLl03dARdNPQ+nTV0WlWqyBl6Yegc2h2NulTRvzEulmiSc64OD8M7kn7DK1F7mPH7EZHTAxcNGDjQ0rMJJU6/ACVOT6AkX0e6Rm1kzWh8sK4JNHmpYgiczrnPBejZ9Y/JEsrzuIw09XEvNta3hmGfm1u9UabI0ybMviWG4bepGV/yl4V5NRZYmTzSMQRvqjcm09pKlyVMNhXvYJBmPIa7lURVxZcYF+EmKk49cMzoWLCtwCW9dcJNIbvxzc03EKFzTMITrpsIxD35+Sv+dFrigocA/wGa7dCInJ6dMfgDCO2YsSvHXWwAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAXCAYAAAC/F5msAAACVElEQVR4Xu2XQUhVQRSGT1QmYa7ExGhRQQa2bOOi3CglWC2DoKBEFy1yEe2FEKxNi6idG3EjboKIhCSIWrWP2kRCQUXhRkQt087PzOB5/525717obup+8PPm/HNm7rvnzdy5T6SmpuY/YEP1RfWAOww32CjCSTYq4oRqWNXKHTl0Ubxl2j98fMp4e1RPVNvGK8w6Gwn2qaak/EU6xY25r7qkeq+62pDhQA7roOnf7z0bT6vGxBUEfc9VX1XHTV5hfrER4Yhply1ELB8eFwM38U71QnWB+sCoZOeyKwSgyEfJK8wmG03gL5PHOYnnr6omyRukmDkj2bnemHa/atHEpamyEN3i8rHqsLUCsTmaFQLYceOq8yaOzVmKKgsB1sSNgR6pbov79RgUYk52cmPbA6vomqpH9dv4n1WHTJzLRELYZ+xBZyVO2UKAJdm5wdR4+HspbjNxAA/sCfIeU9xLcQPHEsKKYA9qd8MypG4kRdgeV/wnFFuFfKw+VP0kL8Y8xZj/psSvkUvZAWUKcU+yp9JuyV8ZgdPicnZxhwHvDBdNjHycLoFl025KlYVALh+T4I40zrOi+mBiEE6JFvIDh1WfyEN+P8WFqboQ19lUDkjjPGjjgWcZ8X6KWB+8PooL87cKEb64/ZVeSXyf4+H21MR4iWK+q2bY9LwUt3UYXH+I4gyzCeHUYA/CjQVwc9/ETRyEPz4fTc5l7+Pt0IJC448Sjjzsd+zh2N7F/B1eC5K4CXGvz2/Z9OCofubbA6q7pu+f4zUbxC1xRYw9m2pqampqmvEHx1am0W88LQsAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAYAAAARfGZ1AAABEklEQVR4XmNgGAWDCUwF4v9o+BRU7g4Qs0PZJIOPQPwTiNnQxKMZIAaDLCIZHGKAaOxCl0ACIPkj6IKEQDwDRONjdAk0AFLjjC5ICMDClRAgRg0KaGGAaHqDLoEFCKMLEAIwV3uiS1ADEBsk6ACUqgjqI9ZwG3QBBiL0EWs4KO0jAxYGIvRdZYAokkGXQAJpQFyIJlYGxLeB+AoQ/wZieVRpCGBmgBj+D10CCkA58zS6IBB8AuLXUHY8EN9FkkMBIFfDgqeXAVJ2ZAHxNyBOQVKHDJCDZCsQz0LiYwVhQLwciHcAcQiaHDJgYkA1HMTmRuJTBNYD8TwoG5Q//kLZOVCaIgAyTBSJDwq+80j8UTAAAAD3Z0HMTP6RGAAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAYCAYAAABz00ofAAAD1ElEQVR4Xu2YWaiNURTHl6koQ5ni6R6FKDzIkHnOgzKkeDG8CCkS8aDURcZCkiK8yFSUNxF1zQkZMpVS5nnKPLP+d+91zvqWvb9zzsu9bn2/+ne+/V977/a3zx4/ooyMjIyM/5z5rN+sz6zFJqb5YY0QH1lfvb6wPrBesy6xRqp8lnfk8j1lPWG9YL30sYasZ6x7rDv+97mP1RatWC2taWjAGmhNT471R6U/kesvy37WAmvGQIVQe+VNUX5z5VsQv2ZNj5TvYAM1SAtybdjF2uyfRyVyOO6TG3TjyeXZkQxXD9AHKt2GtYl1nQrveYH1VuUpihQMkRbrTC6GkWJpSi6GqVmbhNoOb4xJX1Vp8IvcbBaQ56hKAzviMbtzxksFle6zJrmlJq3jd1M8to5cbKMN1CCjKdy+b6wl/hmzGXlmFMLVoJN1WTyfV2lwWj0PYx1R6ZJApR2tybwnF1tlA560PwUjBjFM9VLpRYU6oaGJaBLsQcWoIFcPNsP6ytdtXurTdj/b5v2cTx8j907CPPp31pTFOAoXWk3O32oDirSOT4uFGERuw27s04PJTWV4oaVMd0IaOGFIW1A3yg1X8Sofw5+uWev9scpDGntABSWX0MesdipdEljbUOEJ1inWDZ8+S+EXFjpR4YVi+pnPXRxM/xCy2b1i9WQt9+mcylMMnLCkTQdM7Kb3exh/hfcXGn8LuWVUmMg6qNKgrUkHQeU7jYcd/qTxLDg2oexMG/AgtsaaKVyxhgHLHerECaqJiaWBTkC52f4X0pviLe/FOr7S+BbkselZ5I6bUTA9bEEB/hBrKuQlQkygeKwYFyk8GCx25IbAcmEvM7KESvtkLe+bz+FY7/0RxtccNmnkn+Sf67HuqliC7RTuoGbk/P424MFGldbxslyVQyNyZTCNu1PhfGynulBK/ciD+4gF528pLzMBe51mj/dbG1+oIHcx1CC/njnRNsY6D0dA+LjthVhELr7XBjyInbNmEW6T63wLRg3qm+rTuBXjIjMtnyMOyoXyyfIj4LlSpYGs/TFsTAZjF+XZPHliHX+Zkv4yVjeVxvEMcVygQiCGM3Q54OgaAxs5Nmppr5zBi4E/H59CLDhv66XqO7mbqSZt8Jxh9bMmuTLaT/QtvkXgm4q8BPRIZ2B6e78PuQuGnE5W+mcph6PZQx+by3qjYjhuSaw2QXuxmeLPw+DB+V++KQmyzOH9AA4WseNqV4p/IsF+IqvAZHIrQ9lMZx1nHbKBOgi+zVSR65QBJqbZQO7aL8taiMQoNuCegPgcih+PMzIyMjIyMjLqMH8BHlsrqeTbLMoAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAYCAYAAABz00ofAAAD1UlEQVR4Xu2YaaiOWxTHl+EayvDBEKXOUZdL4YMMkXvRVZQypEvKUBJSJCIpdVwZC/mgiPvtGoryTXTNc8glLjcl83SNmbmm9bfWPu961nn2877ny+HU86t/51n/tfY+z7vf/ey9n5coJycnJ+c7ZxbrE+s1a57LWf73RhovWW9Vb1gvWI9ZZ1iDTJ3nGUndPdZd1n+sh5qrz7rPus66on8faK6maecNprE3lHqsft5UylmfTfyKZLw821izvRkDHUJtjTfO+M2M70H+vDeV0L69T9Qg4R6sMNk8N0gm3QiSmk3J9Nc2N03cirWWdYEK/Z5iPTU1RQkN08jKdSTJYaZ4mpDk8Gh+S3APJ1hPWHNcLoCac877SPI0B1Czx8TAz3g83eXOywSdbvUmyVKTNfB/Ujy3kiS3xidqmNj9BfA0o2ay8zHIti2uT5oYHDHXA1m7TVwS6PRHbzLPSXJLfULJ+lIwY5Br7hMZ9KBCn9CARDYJ9qBSiN1fYCFJjd/PNqhfrvFfJJ8pMJM11MTF/k8VhlN6o2Uk/nqfMGQNfFYujZ9JNuxGGv9C8ijDS1vK7CBkgXtAn//q9dhkmg6ojy/dskL9YcZDjD2gjJJL6B1WGxOXBNY2dHiQdZh1UeNjlP6BAx2oMLgxfaisLs47byhhs3vE6s76XeNyU5MFaq+5GGtx4B/1uhkPLFbf7wvrSJbRwCjWDhOD1i5OBZ3/4Tzs8Iec58GxCW2n+ISC3HJvZvC3NxxY7tAnTlCx42AaFS6eRNLPEI0vaRwb+Arne1Dj46kkx80oeDx8wwD8/t40IB9rO5LiuWKcpvTJ4NnujRLBsmPvPazlvSsrhFXq/+p8yy4Xo360XtdhXTW5BBspfYCakvh9fUKpS9kDH5ar6vADSRs8xl2pcD72j3qglP73kdTZl6iG6oX20/Qae51ls/otnR8oI3kxtKDePjnRe4wNHo6A8Fv4hDKXJL/FJxTkjnuzCJdJBt+DWYP+xmuMt2K8yEyorIiDDRBtfzJeF/UwOQKIK0wMwtofw+fCZOxkPF9TSWzgz1LSX0RywwH8VoE8XqDSQG6wN4uAo2sMbOTYqMP9Lkimo2Aj9rX7SfpoYLz3VPVtFjWxyXOU1cebJG2snxhb/BaB31TCh4Bu2wKmp/q9SF4wwulkiV6HdjjS3dLcDJK3w5DDbAu5bwm+UGzyWHNxIsG9/ZaoKCxz+HwAB4vYcbUzxX8iwY9jYRUYQ7IyVJuJrL2snT5RC8Eyhd9R5pN8ATFWkxw1w7KWRmIWO8LGPZ3ix+OcnJycnJycnFrMF7WMJ1WFDA6AAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAXCAYAAACmnHcKAAACM0lEQVR4Xu2Wv0sXcRjHn6wGMSMCEQSD0qHGwDBBskVw1L2GyM1RUlvCSfwDIsihRQQHV6NAaVDRMGhqq6BU1KWpEBSt591zn/s+974f31sEwXvBG+75ce/PfT5397kTqag4l/xVbai+ccHRphrgpOcyJ5QuTmRwjxNKQyRPGf85VWt0PCk2sUdx1RiP8rncEWtgjfimHPYlfR500TdRLc+fLxJxr+ogOv6qmlG99k3MbdWu6qNqU9WRLBeyp5oXG+id6kKyHOP9J6gWyJqMZ1j1knIpOlVrnCzJtmQ/QkwZf754H2ORjl2cC+5EmcGy2JLTmcwV1ScX/1E1ujiXm2KDPRWb/S+xHaMMP8QmsyJ2MbPJcoz3R99UsvyfG6olMb9Dqb13Y6rp0FSPdrEBHkYxHjvEQ6GhAGyhfkWXKQ54f4DHM8v/sdiCNLvckTsG1yhOcEn1gHJhBesxyAmx875Qjv1x58v435XkY4xFWBC7c1ddvpAPYoM940IJcF6ZC63nf19sBwx8V/10ceYYWYOHybygvAerjZ43lGc/eLA/qOfP5yDGOxXAZyEFDw52ohzepzzwUqIH3xkP++H3hP1BkT/uwi3Kof+ti1fdcQyaeHtFDl9ezvmLui62NXt6xHqeuFyfpP2fS9o/0K96z0kx33WKU7SIFbrF/qmwp2MDyPsl8eB/6rOqSWwlUV9MdBjefzSK2T/AYwReSa2Gj+hvVzuTnHCCCP+R/nGrqKg47/wDcCKbgzgPlq8AAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAXCAYAAABH92JbAAACIUlEQVR4Xu2WP0hWURjGXyPNrSgqBKFoqOaoJYPKcAhaLChyKB3aGoq2WsUIgqA9cMrRycW1yUGkIWhyKIKKCCWLIvzzPr3n1Pme7z3f1eJeG84PHvD+znvuec9V7z0ihUKh8P9xSXOL5RY5qLmi2cUDDXNWM8hyk2Butv9pzXqHHPhT6vJTs6A5pZnRPGwdboQezarmnuaRWN9HWyry3BWrHxPrH/vpaqkQK7ivuam5qrkc8kFzPanzwFw0xW6WXJ0MiK15J3HdwQ0lzuOJWF3KDce1C+W85hVLB8w9Qu5b8E2xIrbeMfJw78kxqOFe8VcEdy2VF9OLAE/Mgbqd5F4H3xRxo30Z34lcDdwblin4zexj6bBD/AXmxPxuHqiJuNFDGZ8j9v+FB6R6rqyxyLBf/Bu9EPMneaAm8P7DeqfJV2009v+ZB6Ri7hnNKMsMVQ/pHPk6wXpTyfXj4Lz+In/9kLIDGbz6eTHP76qUB2Ib2UyGw5wqJsTWxTsRdNxoAOPfWYp59z8K76GqmzKo30PuXfDbDXpYZEnkHiTcS5YAh0BvQidQj+MCu63e51/5pLmdXB8X62Fv4jx+SHuvODzDnSD/i4/SPiHF2zyucdpmN06uTvrF1sSGI1/FDsMpz8XqJhM3Ehy+dJFY54IbZwfFf0iHg4sHL5x+l36PNgd6uKDp1bwV/7P+TKzuKXmch5bDz/H03tSXuVAoFAqFbWADfmajUPD3pXYAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAXCAYAAABTYvy6AAAB80lEQVR4Xu2Xuy8EURTGj1cjoUFIhMIroRGRSBSsUiFRKDSUVKIiNCISj0Yj/gIdBS1qGo9SISFKohAViURwvj13du+cmctGcrfg/pIvO+c7Z+beszsz9y5RIBD4L1Rog+nVhqGbNazNIlKtDaZfxRkVg0ptdLE+UzRtFzGNxt9kDbCeWT2xiuKg5wntxCqSeegjVsF0sh5Y56wLVks8naWB5OQ65cMbVJ5vMOYJ64jVp3IRqDlg3bEWVC5HB8mFvuOS5GIaeDfa9EzaPDSF1FAb/dx4dLtoXL5PChmvkBpqJWl8iuQ5eCK5tW1cDbp8n2C8jPl8I3nZapArZV2b49V4WmgmSUbPKm59xCO5CneDLt8nGG/OHFeZeC2fzgLvxYrvSb6kGOUkb2kb/PJ2Q64GXb5PJlWMdwzmUGJ5M9YxaCKp2VJ+glOSwlkTuxp0+TZY/grVb8BtjDngLf4dibkmDMo3vmjitBrg8n2RNl7UOJY3sGziiVyFkDg3YTCPxqs38YaJNfAOtemRtLnuGW/cxGcm1huwxLkI8Jxr7zXFG0vxapXnE6w42EHa6IaGWMdWDJZIatptE7sxmNgFlZE0/E6yHNiskNRFu7dt1m4+XRQwP8xhlGQZvjVxjV3EXLH2Sf6DzJPUrMcqAoFAIPBH+AIquJvfn5tlvwAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAAAXCAYAAABpskPJAAACeklEQVR4Xu2Xz6tNURTHF0/M1MvPevQMpAwQEyMyIEyk8A8wNDQwViQRAz9KjJToTQwkGRhKyURmDPHqmYgiv1lfa59z1/3evc49BvfcaH9q1dmftfY+++x7ftwtUigUCoX/nSkWxCaNPSxbsktjHcsxsZMFsUJjLcuWbNXYxjLHdo0vGic5kcCP8UvjnNiA7zQ291XE3BLre0jjSDoeF2vEzh/NYaNY7q7Gz3Q801cRs0Os/pjG3nS8xBdULHfHKMot+kqx3DLycPixmpgn+QvMuVEyX2NROo4WfYvGe40J5w6L1X51Lsc+GRxzOrnF5PuIFv2pDA4I4F6yJPBkvGIp1ncVy46IFv2q5HM5x3yTfA3cNZaeaNGjk0beg8k8YinWD6+dcRDNG08y/AXyUb0nqol8zSgWHfl7LMX8c5Yd0WbeFXgnt6mPaiJfg+QplhJ3jLwH+Tssxfxnlh3RZt4Vc2K1+DA2EY0Z+RokT7OUuGPkPU2LPqzvqGh77vVidfguDSMaM/I1SJ5hKXHHyHuQf8BSzD9m6cC/Hlxs2/gb2swbfGLRQDRm5GuQPMtS4o6R98xqPGMp1u8Ky45oM2/O36Q2E40Z+Rokc3cNXjm5jnD3WRK7Nb6zFOu7kGVHDFsIfGuwN/E01QM8tbkauOMsPSg4zzKB3IGMW+ra2IDAYUPh4clgk8KuS5oWHU8m9h5PUuApfSP99bjr0b7h3HRyq50Ld9/7xU5U/blHfJTBDc2JlKt2pRc1bvfSf6h2nwfJ48554dp4V066dle81vggvev8IXadG1L+sstxvE014Hpyl5wDD5NfkNo4PtpLFwqFQqFQKPxr/AaBiuIQodAMHgAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAXCAYAAABTYvy6AAACC0lEQVR4Xu2Xz0tVQRTHT0EhLaMgFBFDF7mJWhX4axkYBQpuatFGIcmFVERghCC6iUBq038gQi2KULftAt1Ui6AIW1QuinBhEKj1PW/O3Hfm3Bl8m1Go+4Ev3POZ4z3zfL55V6KKior/kUHkqJWK08gFK/eBQ8hlpNUugD4rwBErPE+QP8g15BvyLlglaiG3/gDpQX4iZ4KOvWMEWUfGkTfIZrhc26fNTtAh8MKSqTmeE1IfV45h12tcbvgF/FC136veG9fPkE/IHeUDXpBrPKDcOeSKqlco/EV42H2wMiM3yc1sU64duaVqJrbXEvbdjZHqSflcNDqvkZ7iZheRL3L9OehID0z5XPh5HcgrZBv5FXQ4uOcg8l6up8NlomZZ4Cwoz3Xsc2RJ+Vz4eWvKbVD54OIefeB9RX6rms5TfPMPxZ2VOtbDpHwuYvMuiZtQ7oa6Zvgrj3vmtIzd7Lq4j1LHepiU1/DXX6PZjdi8UwlvKfWUBBgT50/sWA+T8rmIzesy/r5cXy06HKWf5QPC3mxS3G2pZ6W2sFu0MiNvqbyPbnEvpX4t9WjR4Si98GERh5X7Lk7D9VDEHTMuJyfJzeRT3fNcnN9/P7JcrDrukevpNJ5WkS2kCblLromHaKbE+yekR8h8fXnPeEz1N4X/r+DrgfpyDX7cfkrueZ7/arlnJuioqKioqPhH+AsJzK0cS9mfUwAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAAAXCAYAAABpskPJAAACcUlEQVR4Xu2XzatNURjGX18ZGSmK1DXyURgoRqSYUSR/gaJIRoQiAySRkTJwBxJlRmZicEv5LIbMiRkhhHy8T2utzrufs96z9yp3367Wr57uXs96zjl7PXefs/YWqVQqlcr/zmI2iNWq9Wy2MIcNZS0bPbOFDYcx1QR5HkvYUJazYdmo+q46zRORU6rfqquqz6o/qu02MAJkWXsbif4Yk8E5dAG5r2w68BqhF41EZIE5RihX+h3VTfJw9SJ/kfwc71RPVc9UR2iuL2aq5sbjrqWnXEnp91WvVFdozsUrPX34dcdv4wEbU0yX88Y/aaWUl16MV/ohCXMryO9y8mA6lv4l/p2y0j2Qf8lmBpS+R8KeUPoZk0Fb6QdUx+NxaelLVR/j8dbmdB4Ez7DpcExCHl/DNpDDRp14q9pmxn0zqvQZqh9mXFr6LRrfM+MsCJ1l0wHZZWw6bKAxbq28RffBqNI/SfMWt6R0/AxbxiW8fhH5DRA4xyaxRkJuHk8Ugvc4yKYBV9yFApXglf5Bhp8pSkpn8CyA17/nCQsC59k0zJeQQSGJtk3ypOQXCO8omz3hlZ58Tw8H0SHSs4vtJpWeNuUsCHhXzWwJGyGT8yxPxF/gQjZ7wis9B3JdrvT0nugpsS96l403BALeww7m8HT1WEKRzyX8d++aDDZV5HYbb5M0TwSckG4LmSxKS/9G3o3oXzPehGqzGQP8XGU/Z4eEu4mfMjgZfB1em8wvM8fab3L4asHbZTwAb51qlupwHHe56/nXvJGwUaZzx7qwzlU2FHkkzXWik9txLm2Ql+I4AQ+3m2BnHGMPrFQqlUqlUpmm/AVCjNFbH8dkFwAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAXCAYAAABTYvy6AAAB4klEQVR4Xu2WPyhHURTHD0VSBoqBJEpmJiZSNimShYFFkWySIgYZkDLJYLKgWCQszAZZlP+KwoIyUMq/c7r3/n7nnnufGH7vFe9T33rnc8/7/c59v/frPYCYmJj/SAsmT0qkUgqkQIoUU4SZk9JDrRRIthSGecwnphNzhzm0VtWazKPVkXr6wZ2BxyA95YOtJ6CFLVHzDzJuA3OBWcLk2suhcI2ZwnRhWkHdnZQdzALro1nXMJeYQeYt1kE1pjFXjWlnNSEvRBT4ZsjHvAjn63Pw/bo+ftKTapqkAP9cPudgNt6IudHHV1aHgnwOJHtO7OVIOAA1t4TmS8cc6+NxexmgUC9QVpin+oHVxp2ymq4+/eeigp4oQb8s+WdW32JeWQ01kNw4Z0a7KuYG2LGBepqlDAl6oixKqekTdTGoWWe59G28R7tz4SW+cyXTv8hvoO8tlfIbnFkdgfRqd6brXV2XJDoUvnPDIuh7R0GtdQjvzPouBTKsnbm96eFPdUWiQ0HuSLgwaAB3ZsMeqLVu4Z2Nt2mRydy9doYxzAirDfK8sFiG4I3XYbaFo9mpv1x42Me8YbIwQ6CayqwOgCfMJKgXnXpQPXTRomATgjdO0Ov2KiYD1F1LvRNWR0xMTEzMH+ELCKSUmTUr0w4AAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAWCAYAAAA1vze2AAABQUlEQVR4Xu2TL0tDYRSHj4pimTbFIJg3/ARiMSzsE4hMMNksru0rGLRpEASDRVgwaLIIY2EwTILBYhJlweCEgbhz7jnv3rPf3XVGwT3wg/s+55y97/0zojF/nRbnm9PhLEHtJ5Y5L6SzJ1AbQBqqdj1r6/VYzkRmpHfe1jVON5YjTdJGz+EQh8yR9lyDF3cMLpEP4BbM74P3PJP27IIXN3DAFRO3Xhri71E63kl7dsCnNimZwFsWxH+gdFyQ9uyBD5vI40zYNnEVhCN1IiBHWj8HH+ZWg8ibuAnCIf4VJTBJcX6D9ImkDjdlou4lM23+DnwW8tmHk6c2CfINXMH8JvjfIHMNlG0reCpD3CnnDByees3WM871+eQ82XWZtHExlhPwB4Uv0rud4BRJ6/IKMtki/fcfYWEEB5xHziUWxvxjeulCWI3zq6jdAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAXCAYAAACI2VaYAAABwklEQVR4Xu2VPShGYRTHj68FAykfSRYMbMrAoBSyiCLJYjcYTBYGg5LBYPGRQVntGAwkicGm7JSPgUHyFef/Pud53/Mcz82Iur/6957ze8597tt733svUUrK75LHGeQ02gVDO6fDSkMNZ4hTZBcMrZwqKy3XnGPOCOeI8xIuZ+jlfHImOf1SbwUTjmnOCaeNs895Dpcz1JM7fp4zI3VDMCE8klvsVg49orE9gMtX/bI4zZRxtdKXKVcsrkm5DKeyMKCc/XIVpvfg2FnV2+NAibhO6c+lt8Dhl/4RDN6pfk6cZZvzrnrMvKneA49L7evYXkk+YJjcEG4Qz6E4ywblfKHU97nlLPBPqo7tleQz+MXYwAXF/QrlPO461Li5LHrfpHMk+YA6ckP49PyZLwf8IC4xWJfeskmhR/2geg/8japje0U9Toxnk8YP4r8GJqS37FLuvwSiJyDndlSdNBP4lphUDpdNO8stZ0z1r/R9rlkcnm9gUXoL3FpMXkac3QB9ZcRpxiNuzzg8BdD3KYfXIdy3192qLHRJPyp9dXbCccD54BRIf0bul7JckXtHgx5ye9kn/4L4ck6p1EvBREpKyj/hC81vni9mwinoAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAXCAYAAAD3CERpAAABOklEQVR4Xu2UPUoFQRCEK/EnMNEDmIiZN1BMzAUzDyF4AY0NFcFMzAQzPUJH/oCRYCBGgoFgoggqomg30/PebE3Pw1R8HxSzW1VsL8PuAEP+A0uqRTYDptkYwCUbmV3Vt2pdtae67cY9ZlR3SN3fcI5G10wOXgNv1ldBnUWcqj4RdMfd5OAk8DKCdlZypnpD0J13k4N991bINwR1n1nzNRw66SYHx+5tkm8I6j7z4Ws41IiGPrt3RL4hqPslT6oRv24OPUQd5BexL5kR1P3MqmqruG8ONcaQfhMrXKkO/HqhLDmC+EHLqm3yBg5lrtEuC+LsBv0daqnHhuqhNJAKdghECOKhEdWwTA5GyZso7ksEjQcFNIfuIB1XU0iDHpH+X+ZC9YLudtkO2QHDzKne0e99qe47jSFD/hw/S9ptQP33/dMAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAXCAYAAABK6RIcAAACm0lEQVR4Xu2XS6hOURTHl1dEeQ08olxKGRIZGJBMSAlJiRkjYSJSBtczFAMzDBgaSEQxMWNC7hV5hwkpKSLyfqz/t/burP3/Hufcwfd91P7Vv7vXf639nXX32eclkslkMv8dX1X9qj+qKZTzvGKjGZPZCMxmQ5nERgdZphrCZmARG8ooil+qboXxILEFXFKkaywIfik44HdVLycC+BHW26SiM9xVvVc9F+vht2pkUlHfJ/QrqTBvmovvq9aK7TLkPqt2hHFTJrgxCntd7EHuiuqZ6qxqbJruCOhhdQMPGk3eBdUL1UXne3hRtlMMcGIqU7Z43SYu1AznXQ/eZedV6RU1w118yY3BB6m/1Fvyry/eI9VP8s6L9XbNeVV6Rc0GF/tdtll13MWVKFs8XBqvw/hhmu4acTeuJG+w6kkY73O5yAqx3BjVCdX+4GMe3x8rUbZ4j128Ruye0k3Gi/XFuxHeJxe/UX1xcWSc2M5d6jzUjXAxwNO4FBx0L5uBnWyI1eOVoVtg0dADs4Vi3CNRd4R8ZpfqkIvXi70L4kG52/kNwQHi9q1CvGRacXQAGsgNGsddzmYLqvTqN85cSetPqqa6uA4UH2QzgBxPrtJQO9immkXeqfB3j1hP64pUjbJe71F8WtL6xaqtLq4DxX7bRrAjkJtJPrw75LUbfAXgRdmzUIp7Nb4a0NfGIl2j1eLNV90k74ak9dg4uDqaguLDbAb4mo+fNEPJbyc9YsfsE/tnb4u9vuA1Y06owQ65GsaRA2LzesiPNFrUY5L6m8Se0AmrxF4/fkhxdvCkwref56PYwmLRcPZRh7mdJPbXSJ4HqnOqYap5YvlmD8Knqulsis3FvPik/eZyGeWMaiKbBL6h37GZyWQymUwl/gJLFrwZ/bRbTQAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAXCAYAAACI2VaYAAABkElEQVR4Xu2VvytGYRTHj1+L10CKZLDIYFQGBoOQRSlZLO9uMJgsDAYlg8EiMiirHYOBSQw2f4AQGZSk/IhzPOd9nnPPPYf1VfdT3zrn85z7vE/3vd0LUFBQHYxooRjADGqp6MBMYRr0gqIP066lxTDmHfOlF5gxCGtzmAmu9zITgQXMGaYfc4x5zS7/0AXh+hXMItfdmQlGnpyGvMNZnlyt6DfYSeaV6+S+WbhGdj3C5fAO1wq2P8csid66vsRuiPtL7jXk6E67WJsTy2D7fcyH6GmGHg0NefqrK7W1l+cj3sAp2H4Hkq/n+jEtR8i/iNray/MRb+AKbL8JydOzS/VtWo7Ifb3f8HzEG6jqw22D7Xch66l+En0F8veitvbyfMQbmAXbH0J6lgjvenIHovZmLB/5bcDyD5gZ0b9Bfq6XHb3fiDXuNeS2tJT8dbg2w0nKhjtSrob7ceHoc0gu97mbxtxB+nRRnjHXcgg5wXxi6ri/gHCnNDeYSa5HIeyn3/yr7FswTVyvZyYKCgr+Cd9DmZTFPi32BAAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAWCAYAAAA1vze2AAABAUlEQVR4XmNgGAVDAYgCcR+6IB5wG4j3A7EzEIsAcQgQP4PyUUAaEL8E4v9QTIolrxkQ+mB4DooKKAC5HgZItQTk6hVAfAeIdwAxI6o0dkCqJQ+BmB1dkBAg1ZIHDAhLdJHE8QJSLbkHxCuB+D4QpzBA9PeiqMACQIomoAviAdeAuA6Jb8wAMSMOSQwDgBRMQhckEcBSGU4AkpyCLogDgFLSWiAWRhMnypKp6II4AMgxIPWf0cSJsmQ6uiAUgDLZfCR+NAMkM0ojiYEANosZfBkgmeoXA8IV34D4MbIiJDlksASILwAxNxArMkDkd6KooBKQA+JtQHwYiOXR5EbBSAUAlDFCzsGEVWYAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAXCAYAAACS5bYWAAAA/0lEQVR4Xu2UO4oCQRRFK5l8AhkMJzFXcAFm5sazDRNF/KCZW1AzA8FE3IGJmpi4A8UVCMIMfu6ju9ry0ooGVolTBw7Ypx/Uo0SV8njegyQHy6ThJ0cmB39hibotWvAAe/AYmr+YAF/GZxlwsewY9qmtVbBPjXqEq2X1TXaNJreqeyyuli2q4OyU0TJhe7ll4+ioYJ8Zv9DIyzJHR9y8VUFeVjg6YKiCXb6pXyADVY5XSMD2A95LFo44xiHL1jlaRP5G+auf0HOEDDY4WuID7jmCHQeNLNvkaAk5ewGncA6XcAsH5lABbuCfOv8CZWhlDj0ZuVF9NvtjzHk8nn/PCfUURfcHTzo/AAAAAElFTkSuQmCC>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAYCAYAAACLM7HoAAACpElEQVR4Xu2XS6hOURiGP/dwRi45kjqMDFwGBgxcOiZMpISBCUMGMpIRRkbkTopERChSjBiYSBKhKIUBoSR3hXB8r29t+/vfffZ/1s75938G66m3s9b7rbX/tdZZV5FEIpFItJoxbAQms6GMYKNG5qmGsBmYxEYJY1Wz2CQ2qh5HqsA01TvVLg4Eepx+hb/fGkrUwyfVa9VDydvDnJE89tulPbdVi1QTxb5ZxlDVOMm/MV41WjVKrO4mF/tHl2pYSCPQbFBvqt6rrlKsLs6LddDzRIoDdlp1V/VGdVGKq68zyHOd8gx+YyubgW7VfTYz+hrUdlOYEcrs4C123kmXLmM55fdQ3jNV7DeyycfMVO1jM2OgD+oWsS3KgxmHtq103gmXLuOOaq6qQ2z1NeOUFPuP/TgD28h8l2+gr0HFwfQopNc0htvGdrH2DHfecdUE1YsQu+JiHhxoC9jsBXzjM3lPKV8KKu9mM4AYGpmBw+q5y7cLtAuHlueo6prL75TiTKsC6n5UPRM7JJGP/h4K7mUzsI3yK8TKrya/Tg5I752bw4ZYuS42I5guVnek2J6K0/9y8KJAwf1sNiHmP4aOx6oKb1U32GwC2vmdzQiwh3MfV6nWkVcKKh9kU+wKhdgU8mMGtRXcUx1xeczMJSGNGYU2DcrDf4GHLasq/91HVD7EpuSX/RnOwwsL3ivn1cEF1WbyzoodTACDi3b5gwvAw/21Clju/TKoh9kU208hzyWx8riS1AlO4VtiSx+PEcxa7vQPyuP1w2ViwBUO9fDoqMRS1Uux/Sb7r3yR4sn+QbVDbFktFCu31heogZ+St5HlWa/aENLLxOJ4ecWC28RXafw+ViQO534HJz1myTnVYIoNNPAmf6A6JvbqSiQSiUQikWgBfwAQi75mo/LmFQAAAABJRU5ErkJggg==>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAcCAYAAAAQovP+AAABIklEQVR4Xu3YMUtCYRQG4OPSmDQkOUijf6Ihf4WrP8AxWppcGoN+hhAUgYO7P8HFTQcRiXBpijS/w3dvnft2ze+7kMTlfeAdvvdcBQ9cripCRER/6TMnfTN/gtnEzOgX6cIaOEjo7MOligPaLV0qunYZY0lhdKEj6PQ270JHEXSpl+Z873JqzhSpI9lbfwlnKmAmfon6ELJP+aI2kn2ffTnzLyuX9MOdJOej5Hz3dQVFaYpfYAX696SnAh4kf3kX4vsWDgLUXc4jUjq6uLylKu3XWAboudxGpHT2LVXDX1EB2i4r+V6aZuFybK6ZwvzVzIiIiIiIDuFRst9JUy+muzE9BdLFDbF05lhQOP2F9QbdAM4U6Vl+/gdwBedDqmHxn20Bj6lc5CGLMSYAAAAASUVORK5CYII=>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAAAYCAYAAACY5PEcAAACIElEQVR4Xu2XzytFQRTHDyLyoxCl/EjZIBuxsOGVLJQlUrKwUcrCj/IPKGVhpWRpYcdCNlaUHSXZSlJWNkLJb3FOM/fdeee+e+/Mfb0rz3zq2z3znZk7956ZN3cegMWSY0yjxrhpyR438nqI+lYrTOjnhsWXGUhNNMWzSlmLFshgtv4hDagLpUy521TKWlAnm/RoFIPIXQWvCOIZtQ026VH54EYYA6gD1CTkRtILuMEo5EaGbClxpxIH4iS6W4n/MvQOldyU0IRscNMA2kZU5lFNSlnrQ0qzNC7jUhAPXOZWx845uN8WP3UkW/tD7eqYRyvcZFG9oV5Rx6hl1BVqBdx8JcD7bM2yzheadb4XUcce5vnBBwxTGPeoS9QEag61jxoF0ZeuI6jBZOtw1DGLZDlP8YLoBbFqd0H0c7YQivecRlGgl+RfW7rpFPPiYlGJT1H1MtaZMD+uwT1Z6CaceJBXvmAeUeVK2Yh88K5ER3SK+W3UF6UtJyo0eV+oVl6hCT3HGjejcscNCQ2iHviDqDGULjsgkuXgrDpTqlFLMqa9uU2p04XyUcXNKNCefcZNCf85BbFqKF1o/D5WNqUWvP1eUO3MC4PfIxIlEHwjk6RngwXwjs/LYaRLuMMTNwIYBrE1RSYBbkLTJXYdxABOHR2XjlJaxAON/Z7Goz9wunxyg3HLDR9OQBwVc54u8P5jHGLluGjkhsVisVgsFkvu8gMWT5IEJgmaDwAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAAYCAYAAAABHCipAAACgUlEQVR4Xu2YT4hOURjGX0T+LPyJpYXIxp+FLBSK2CgLTbFQUnYWmo2sKFnY2VmQpQVZSFESpaZmY8EshRozhYQwhZmY4X065zSv5zv33nM03/dddX719N37PLdz33vPveec+4kUCoXCf81+Ngq9Z73qN5t94rvqk+qlalT1RvVFtdke1AN+qN6Lq2PMbwe+qsZ9ht8PJgPYf+uFY5NBJ7SlIwKo555qHgc9ZFBcHROqZZQd9tkR8sFRcdkF1ULKKvmmuiXt6ogT0o56Vkv1Q7pCnB97U1+oFrFZxz7VY9VxiZ+sX7yW9tRT1RE/xfmHOFDus9FEOME2s90GUMsdNhPZLp1jtmVGtZzNGmIdcVB11vunKYu9IbVcVx3z20vENZpTYDdBLVvYzGCXajeb4tpdxWYDsY4I+/i9YgPvJbNA9Ys8NIALSCEUl6oc5mp+wARrl+RnxI3rufA1XFVtMtkjk+Ece81+I5+l8+lHoyfJ6wdYrs5FRwAsew+ozqmeUJYKd8RHsw0fS9vApNluZL50PrFBt81x/YIvnEH9qWDpi7b47c/B1sN11WWN4GMpBhp6xWYFazKVylZxdVRNtjfZqCE8cJj/1sm/d0a42WhjA2UY/pBdVO2krJYdqqdsepqeRMulTKVyV1wNpzhQVkp6fQDHLjb7a8V9aOUyKq4tDHMM7iUy/BuQDIqqu5CcjugWoQb+mt7o/QfkV3FD4l+0z2V2pZjKQ3HnfsaBuDcU2VIOYuyR2QuM3ezLqmmTTamG/jqi++A/GazvQw0YPt+Jm/xs3fw3QwxMzNfYNIyIGxlSwfKU71ngvGqYzUJ3GJDqtyhrXigUCoVCoVAoNPEHT8i+1qQ2FqEAAAAASUVORK5CYII=>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAAYCAYAAABUfcv3AAACVElEQVR4Xu2XvWsUURTFr6hRicZENIQ0phAFJebvEMQPsElSaKVWJtjY2Imo0TRaSAqboGIhYic2giD5BxLBNIpKBMEvEIkoftzjvQ/fnn27m4HNTpa8Hxxm3rlvZmfOe/N2RiSTyWRWH1vZaAM2s9FEvqn+uO5S7R97VV9UF7iwgkFgM2I3tZZqzeSk2G8MxeaAar3vo9guwfX69r4sf3A/xH6jJu0UXKAVweH8n9iMKRJcFxsl0Si4NWzUoJsNB8sBzn+GCzFLCe6R6qfqnOq52DQ+W9GjtdQL7qXqteqDtz+rbkvlDJpTvVDdcJ+5JObXHYBGwf1SvY/aT8WOORx5KdCniIpQK7gtqoeqcak+7zFvf1Rti3x4Y1EbYJI0vCZ0uMimMy1W74i86+6VSQgu/MEFHouFhxmF+oaodsI9HnB4eJLYe0deFeh0mU1lu1htgXweyTIIwW3kgoMaHkX2Utddy9vFJoNOV9hUTonVTpMPb4q8FDsKqgghuE1ccFAbTniz5OEesV4zqTCrQKerbCqjYjXMvBh4feSlmCyoIoTgOrngpG4c3lHyfqtGfH/Rtwfl//EPfJsEna6xqawTqw1G3jP3yiYEl/rswuxNXWM9D/f6xPfviJ0fVB1zRGztCm/H0FfVm7iTct5rt3x7T2yUyuKt2CdiuGYI17wv6jMh9kkW0y+JEMS8PWJvDoH9qleqm2I5NYV5Kf5YtRr8q6boYcM5wIZySLWbzaWCUdgZtfHOlBq1DIGQ4qmKxzosoJk6fJfKteR4ZTmTyWRWHH8BtO2xTyh4h/kAAAAASUVORK5CYII=>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAAAYCAYAAABp76qRAAADTElEQVR4Xu2XS6hOURTHl3fJK69kQJ6lkEeRJJFHDEzkkQEGyh3IzMTkCkVMpJDCxEBKFMlIBiiPGSGS5DnwKO/3Y/3tte5Ze337nPud794u5fzq39nnv/b5zj7r7LP2/ogqKioqKhrhjDcMA1jTvPkX2csa6U1htKhexrF+GbWJw5T+kT4U/KOsDdJeHPXoeMZSGMcMH2A+sHazNrF+ss7G4Vy6UTsl8hOlfyTPW+rNDgKzR8fqE5ka6zHWDW8mGELh+lU+UIZnrDtUO5AFCQ/grW/1ZoKu3mgHMJ4VckwlEjPLspnCzGyNg5R+1rpZwjpE6UQOE+8jq4vxfb880K+/N4XOFOKdfKCAa6wxVJxIP7b3rEXOS5G6trs7H+jOI/TiVCLBV8pusoP1nbUw6lEMrhvqPMxU+EhmGS7JMS+R58SHprOusk5GPTIust6yTlD27HdNHLP4vPg9WU9ZW+R8StYtgGBfaeclEjynbICnXKwecB1mN9CiXjaJWDyUvESCI5SN9Y2LKShNmCDKLQr9V8r5cQp56Sf+D/HBfvFawHTHSq3kJXIwBX+9HKEvUY/6wBseQeH6Mp8zQNJRXpSiROKL0XqnsmUJuw94vYyH0mafXdvN0rbX7xTvz0SYT3ESQSqRuAgDs2yjbIBl0Lc73gdaAUm3SQSpRKIW+zFNFk99HcPnlh6BvOdJ+ZF32xh5AjiulrZlF9XeoAj7kNi6lEnmcqodmxe4z3ogbQvqM/qgtGyUdnPUI3j7nAfgo4Z6r/DZUx1wvtZ5APXD981jENX2RY2a6LwyHKDwm3ZG3mM9NOcWvf92afcwsTXioYQBbAXBHPEnyDnAlwwPZS6XVCIvU7oenqbiv5NKKonKO9Ykb9aJ1sCZxtOH9ExlfZM2tk7oMzwLR8/dxJotbazq8O1fTZxjgU6CqY+3oD+IReGxiaNGoqZgEKhX2FK8MvEi7GqX4jWrtzcLwF+/l5SNFXpk4hgbPF1xdWGwiwXK2hPWKArbqbnSBwm3L8LeA9sdbJWumHhDzGNdYN1kzXKxfw1MjOsU9oDrXEzBy7MxfOr+ryESiG0QWEbldxoVzB6KZ2dFg+gnXdEGXlDYRmGdwFqAslZRUfH/8Bs3/wfwKPimNQAAAABJRU5ErkJggg==>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAABL0lEQVR4Xu2Ur0tEQRSFL5gsCxaRFYNiMRos/kg2g4Jg0WIRTCarWVjEJOz/IJisgpoMgqigxSAGi0GDNgU9Z+e84c7dVYNJ2A8Oy/nuvOHNe7w16/JXepAFZCQOAlPIRJSeJ+QYWUIukZdynHlF1pFF5BNplGOzI+QmOC58CO5cvoInYS9OQsFsdXAe9o0O7t2LSeTWC2vfbFmdaz338j/CBbOu78sNO0fO5NvoQ+aQD2S1HNm1pYvqwZ/IDwRvm8g28oyshNmjpYv6g+fLo58OviA+s0P1QefIqXwt+IJqszX1HfWxvCJxIZ+Jd+EdNyGj6vN5ReJNvsWQyneb+WOx77leubsoZryQ48P17MpXjKv3OteC3yIH/Eb52yzHmQNLb/bK0rrf/hS6/Eu+AAqWVc+x6/b7AAAAAElFTkSuQmCC>