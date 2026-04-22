// Option A — 雲朵奶蓋 (Cloudy Cream)
// 調性：貼近 logo 的「sticker + 天空藍 + 巧克力描邊 + 閃亮 sparkle」
// 色系：soft sky blue bg, cream cards with chocolate outlines, terracotta accent
// Covers ALL three screenshot sections: 份數卡、配方卡（含模具選擇）、備料彙總

const cloudCss = `
.cl-app {
  background: #E6EEF5;
  background-image:
    radial-gradient(circle at 15% 10%, rgba(255,255,255,0.7) 0, transparent 40%),
    radial-gradient(circle at 90% 85%, rgba(255,231,217,0.6) 0, transparent 42%);
  color: #4A3322;
  font-family: 'Baloo 2', 'Noto Sans TC','PingFang TC', system-ui, sans-serif;
  min-height:100%; padding-bottom: 120px;
  position: relative;
}
/* sparkle background dots */
.cl-app::before {
  content:''; position: absolute; inset:0; pointer-events:none;
  background-image:
    radial-gradient(circle, rgba(107,163,214,0.28) 1.2px, transparent 1.6px),
    radial-gradient(circle, rgba(255,179,140,0.25) 1px, transparent 1.4px);
  background-size: 110px 130px, 160px 90px;
  background-position: 10px 40px, 60px 110px;
}

.cl-head {
  position: sticky; top:0; z-index: 10;
  display:flex; align-items:center; justify-content:space-between;
  padding: 12px 18px; background: rgba(230,238,245,0.92); backdrop-filter: blur(10px);
  border-bottom: 2px solid #6B4A2F;
}
.cl-brand { display:flex; align-items:center; gap:10px; }
.cl-brand h1 { margin:0; font-size: 22px; font-weight: 800; color:#6B4A2F; letter-spacing:0.3px; }
.cl-brand .sub { font-size: 10.5px; letter-spacing:3px; color:#C8602A; font-weight:700; margin-top:-2px; }
.cl-nav {
  display:flex; align-items:center; gap:6px;
  font-size:13.5px; font-weight: 800; color:#6B4A2F;
  padding: 7px 14px; border-radius: 999px;
  background: #FFE1C7; border: 2px solid #6B4A2F; box-shadow: 0 3px 0 #6B4A2F;
}

.cl-main { max-width: 460px; margin: 0 auto; padding: 14px 16px; display:flex; flex-direction:column; gap:14px; position:relative; z-index:1;}

/* Sticker card base */
.cl-card {
  background:#FFFBF2; border-radius: 24px;
  border: 2.5px solid #6B4A2F;
  box-shadow: 0 4px 0 #6B4A2F;
  position: relative;
}
.cl-card.qty { padding: 16px 16px 14px; }

.cl-sparkle1 { position:absolute; top:-10px; right: 20px; }
.cl-sparkle2 { position:absolute; bottom:-8px; left:24px; }

.cl-card-head {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom: 4px;
}
.cl-title { font-size: 15.5px; font-weight:800; color:#4A3322; display:flex; align-items:center; gap:7px; }
.cl-count-pill {
  background: #C8602A; color:#fff; font-weight:800; font-size:14px;
  padding: 5px 14px; border-radius:999px;
  border: 2px solid #6B4A2F; box-shadow: 0 2px 0 #6B4A2F;
}
.cl-sub { font-size:11.5px; color:#9E8672; margin: 2px 0 12px; }

.cl-chips { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:12px; }
.cl-chip {
  min-width: 44px; padding: 8px 12px;
  border-radius: 14px; font-size:14px; font-weight:800;
  background:#FFFBF2; color:#6B4A2F;
  border: 2px solid #6B4A2F; box-shadow: 0 2px 0 #6B4A2F;
}
.cl-chip.active {
  background:#C8602A; color:#fff;
  transform: translateY(1px); box-shadow: 0 1px 0 #6B4A2F;
}

.cl-stepper {
  display:flex; align-items:center; justify-content:center; gap: 18px;
  background: #FFE1C7; border-radius: 18px; padding: 4px;
  border: 2px solid #6B4A2F;
}
.cl-step {
  width: 38px; height: 38px; border-radius: 14px;
  background: #fff; color:#C8602A; font-size:20px; font-weight:800;
  display:flex; align-items:center; justify-content:center;
  border: 2px solid #6B4A2F;
}
.cl-step-num { font-size: 22px; font-weight:800; color:#4A3322; min-width:32px; text-align:center; font-variant-numeric: tabular-nums; }

/* section head */
.cl-sec-head {
  display:flex; align-items:center; justify-content:space-between; padding: 2px 4px;
}
.cl-sec-title {
  font-size: 17px; font-weight:800; color:#4A3322;
  display:flex; align-items:center; gap:8px;
}
.cl-sec-title .star { background:#FFD089; border-radius:50%; padding:4px; border: 2px solid #6B4A2F; display:inline-flex; box-shadow: 0 2px 0 #6B4A2F; }
.cl-action-row { display:flex; gap:6px; }
.cl-act {
  display:flex; align-items:center; gap:4px;
  font-size:12.5px; font-weight:800; color:#6B4A2F;
  padding: 6px 11px; border-radius: 999px;
  background:#FFFBF2; border: 2px solid #6B4A2F; box-shadow: 0 2px 0 #6B4A2F;
}
.cl-act.primary { background:#C8602A; color:#fff; }
.cl-act.dark { background:#6B4A2F; color:#fff; }

.cl-adv {
  padding: 12px 14px; background:#fff; border-radius:16px;
  border: 2px solid #6B4A2F; box-shadow: 0 3px 0 #6B4A2F;
  display:flex; align-items:center; justify-content:space-between; font-size:13.5px;
}
.cl-adv .k {
  background:#6B4A2F; color:#fff; font-size:10.5px; font-weight:800;
  padding: 3px 8px; border-radius:6px; margin-right: 8px;
}

/* Recipe page */
.cl-recipe { background:#FFFBF2; border-radius:24px; border:2.5px solid #6B4A2F; box-shadow: 0 4px 0 #6B4A2F; overflow:hidden; }
.cl-rtab {
  height: 10px; background:
    linear-gradient(90deg, #E8955A 0 33.33%, #FFFBF2 33.33% 66.66%, #3D2918 66.66% 100%);
  border-bottom: 2.5px solid #6B4A2F;
}
.cl-rhead {
  display:flex; align-items:center; gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 2px dashed #D0A578;
}
.cl-rhead input {
  flex:1; font-size:15px; font-weight:800; color:#4A3322;
  background:#FFE1C7; padding: 9px 12px;
  border-radius:12px; border: 2px solid #6B4A2F;
  outline:none;
}
.cl-iconbtn {
  width: 32px; height: 32px; border-radius: 10px;
  display:flex; align-items:center; justify-content:center;
  background:#fff; border: 2px solid #6B4A2F;
  color:#6B4A2F; font-size:11.5px; font-weight:800;
}
.cl-iconbtn.copy { padding: 0 8px; width:auto; }
.cl-iconbtn.del { color:#B54728; }

.cl-rbody { padding: 12px 14px 14px; }

.cl-seg { display:flex; gap: 4px; padding: 4px; background:#FFE1C7;
  border-radius:14px; border: 2px solid #6B4A2F; }
.cl-seg button {
  flex:1; padding: 9px 0; font-size: 13px; font-weight:800;
  color:#9E8672; border-radius: 10px;
}
.cl-seg button.active { background:#fff; color:#C8602A; border: 2px solid #6B4A2F; }

.cl-lbl { font-size: 12px; font-weight:800; color:#6B4A2F; margin: 14px 0 8px;
  display:flex; align-items:center; gap:6px; letter-spacing:0.5px; }
.cl-lbl::before { content:''; display:inline-block; width: 8px; height:8px; border-radius:50%; background:#C8602A; border:1.5px solid #6B4A2F; }

.cl-mold-panel {
  background:#FFE1C7; border-radius:16px; border:2px solid #6B4A2F;
  padding: 12px; display:flex; flex-direction:column; gap: 12px;
}
.cl-mold-row { display:flex; flex-direction:column; gap:6px; }
.cl-mold-row .k { font-size:11.5px; font-weight:800; color:#6B4A2F; }
.cl-chips-inline { display:flex; flex-wrap:wrap; gap:6px; }
.cl-chip-sm {
  padding: 6px 11px; border-radius: 10px; font-size: 12.5px; font-weight:800;
  background:#FFFBF2; color:#6B4A2F;
  border: 2px solid #6B4A2F;
}
.cl-chip-sm.active { background:#6B4A2F; color:#fff; }
.cl-chip-sm.orange.active { background:#C8602A; }

.cl-info-box {
  background:#FFFBF2; border: 2px solid #6B4A2F; border-radius: 14px; padding: 12px;
}
.cl-info-box .badge-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom: 6px; }
.cl-badge-whip { background: #FFE1C7; color:#8B3B1C; font-size:12px; font-weight:800;
  padding: 4px 10px; border-radius: 999px; border: 2px solid #6B4A2F; }
.cl-info-box .need { font-size:13px; font-weight:800; color:#4A3322; }
.cl-info-box .desc { font-size:12.5px; color:#6B5A4A; line-height:1.55; margin: 4px 0 0; }
.cl-info-box .ex { font-size:11.5px; color:#9E8672; margin-top: 4px; }
.cl-info-box .stats { font-size:10.5px; color:#B0A090; margin-top:4px; font-family:'Roboto Mono', monospace; }

.cl-size-row {
  display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;
}
.cl-unit-toggle { display:flex; border: 2px solid #6B4A2F; border-radius: 10px; overflow:hidden; }
.cl-unit-toggle button {
  padding: 4px 10px; font-size:11.5px; font-weight:800;
  background:#fff; color:#6B4A2F;
}
.cl-unit-toggle button.active { background:#C8602A; color:#fff; }

.cl-inline {
  display:flex; align-items:center; gap:8px;
}
.cl-inline input {
  width:60px; padding:6px 10px; background:#FFFBF2; border: 2px solid #6B4A2F;
  border-radius:10px; font-weight:800; font-family:'Roboto Mono',monospace; text-align:center; font-size:13.5px;
  outline:none;
}

.cl-total-line { font-size:13px; color:#4A3322; }
.cl-total-line b { color:#C8602A; font-weight:800; font-family:'Roboto Mono',monospace; }

.cl-qty-inline {
  display:flex; align-items:center; flex-wrap:wrap; gap: 10px;
  padding: 10px 0; border-top: 2px dashed #D0A578; border-bottom: 2px dashed #D0A578;
  margin: 8px 0;
}
.cl-qty-inline .k { font-size:12px; font-weight:800; color:#6B4A2F; }
.cl-inherit { background:#FFE1C7; color:#C8602A; font-size:11px; font-weight:800;
  padding: 3px 10px; border-radius: 999px; border:2px solid #6B4A2F; }

.cl-step-sm {
  display:flex; align-items:center; gap: 10px; background:#FFE1C7;
  border-radius: 12px; padding: 3px; border: 2px solid #6B4A2F;
}
.cl-step-sm button { width: 28px; height: 28px; border-radius: 8px; background:#fff; border:2px solid #6B4A2F;
  color:#C8602A; font-weight:800; font-size: 16px; display:flex; align-items:center; justify-content:center; }
.cl-step-sm .n { font-weight:800; font-variant-numeric:tabular-nums; min-width:24px; text-align:center; color:#4A3322; font-size:15px; }

.cl-hint { font-size:11px; color:#9E8672; margin: 6px 0 10px; }

/* ingredient rows — matches screenshot 2 with labeled % and 複製/刪除 */
.cl-ing-list { display:flex; flex-direction:column; gap:8px; margin-top: 4px; }
.cl-ing-row {
  display:flex; align-items:center; gap: 12px;
  padding: 12px;
  background:#fff; border-radius: 16px;
  border: 2px solid #6B4A2F; box-shadow: 0 2px 0 #6B4A2F;
}
.cl-ing-row.base { background: #FFE1C7; }
.cl-ing-row .nm { flex:1; font-size: 14.5px; font-weight:800; color:#4A3322; line-height:1.3; }
.cl-ing-row .nm small { display:block; color:#9E8672; font-size:11px; font-weight:500; margin-top:2px; }
.cl-val-box { position: relative; }
.cl-val-box .u { position: absolute; top: -8px; right: 10px; background:#FFFBF2; padding: 0 4px; font-size: 10px; font-weight:800; color:#9E8672; }
.cl-val-box input {
  width: 84px; padding: 10px; text-align:center;
  font-family:'Roboto Mono',monospace; font-weight:800; font-size:17px; color:#4A3322;
  background:#FFFBF2; border: 2px solid #6B4A2F; border-radius:12px; outline:none;
}
.cl-row-actions { display:flex; flex-direction:column; gap:2px; }
.cl-row-actions button { font-size: 11px; font-weight:800; color: #9E8672; padding:2px 4px; }
.cl-row-actions button.del { color:#B54728; text-decoration: underline; }
.cl-row-actions button.copy { text-decoration: underline; }

.cl-add-ing {
  width:100%; padding: 12px; margin-top: 6px;
  background: #FFFBF2; border-radius: 16px;
  border: 2.5px dashed #6B4A2F;
  font-size:13.5px; font-weight:800; color:#6B4A2F;
  display:flex; align-items:center; justify-content:center; gap:6px;
}

.cl-totrow { display:flex; align-items:center; justify-content:flex-end; gap: 6px; margin: 10px 2px 0; }
.cl-totrow .v { font-size:12.5px; color:#6B4A2F; font-weight:800; }
.cl-totrow .q { width:18px; height:18px; border-radius:50%; border:1.5px solid #9E8672; color:#9E8672; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; }

/* Result table */
.cl-result {
  margin-top: 12px; background: #FFFBF2; border: 2px solid #6B4A2F;
  border-radius:16px; padding: 12px 14px;
}
.cl-r-row { display:flex; align-items:center; gap:10px; padding: 4px 0; }
.cl-r-row .l { width: 72px; font-size:13.5px; color:#4A3322; font-weight:700; }
.cl-r-row .g { width: 64px; font-family:'Roboto Mono',monospace; font-weight:800; font-size:14px; color:#4A3322; text-align:right; }
.cl-r-row .bar { flex:1; height:8px; background:#E6D3BF; border-radius:999px; overflow:hidden; border:1.5px solid #6B4A2F; }
.cl-r-row .bar span { display:block; height:100%; background:#C8602A; }
.cl-r-tot { display:flex; justify-content:space-between; align-items:center; border-top:2px solid #6B4A2F; margin-top:8px; padding-top:8px; font-weight:800; }
.cl-r-tot .g { color:#C8602A; font-family:'Roboto Mono',monospace; font-size:17px; }
.cl-r-formula { font-size:12px; color:#9E8672; margin-top: 6px; text-decoration: underline; }

/* 新增組合 divider */
.cl-add-group {
  padding: 12px; background: transparent;
  border: 2.5px dashed #6B4A2F; border-radius: 20px;
  font-size: 14px; font-weight:800; color:#6B4A2F;
  display:flex; align-items:center; justify-content:center; gap:6px;
}

/* Summary */
.cl-sum {
  background: #FFE9D1; border: 2.5px solid #6B4A2F; border-radius: 24px;
  box-shadow: 0 4px 0 #6B4A2F;
  overflow: hidden;
}
.cl-sum-head {
  display:flex; align-items:center; gap:10px; padding: 12px 14px;
  background:#C8602A; color:#fff; border-bottom: 2px solid #6B4A2F;
}
.cl-sum-head h3 { margin:0; font-size:16px; font-weight:800; flex:1; }
.cl-sum-head .meta { font-size:11.5px; font-weight:700; color:#FFE1C7; display:block; margin-top:2px; }
.cl-sum-head .collapse { font-size:11px; font-weight:800; background:#fff; color:#C8602A; padding: 3px 10px; border-radius:999px; border:2px solid #6B4A2F; }
.cl-sum-body { padding: 12px 14px; }
.cl-sum-kg {
  display:flex; align-items:center; justify-content:space-between;
  padding: 10px 12px; background:#fff; border: 2px solid #6B4A2F; border-radius: 14px;
  margin-top: 10px;
}
.cl-sum-kg .l { font-size:14px; font-weight:800; color:#4A3322; }
.cl-sum-kg .g { font-family:'Roboto Mono',monospace; font-weight:800; font-size:22px; color:#C8602A; }
.cl-sum-kg .g small { font-size:13px; color:#9E8672; font-weight:700; margin-left:3px; }

/* Save bar */
.cl-save {
  position: fixed; left:0; right:0; bottom:0;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  pointer-events: none;
}
.cl-save .bar {
  pointer-events:auto; max-width: 460px; margin: 0 auto;
  display:flex; align-items:center; justify-content:center; gap:10px;
  padding: 15px 22px;
  background: #C8602A; color:#fff;
  border: 2.5px solid #6B4A2F; border-radius: 20px;
  box-shadow: 0 5px 0 #6B4A2F, 0 10px 20px rgba(107,74,47,0.25);
  font-weight:800; font-size: 16px; letter-spacing: 2px;
}
`;

function CloudApp() {
  const s = window.FAKE_STATE;
  const g = s.groups[0];
  return (
    <div className="cl-app">
      <style>{cloudCss}</style>

      <header className="cl-head">
        <div className="cl-brand">
          <window.MaoLogo size={42} />
          <div>
            <h1>BakeMao</h1>
            <div className="sub">烘 焙 貓</div>
          </div>
        </div>
        <a className="cl-nav"><window.Sparkle size={12} color="#C8602A" /> 我的配方</a>
      </header>

      <main className="cl-main">
        {/* Qty */}
        <section className="cl-card qty">
          <window.Sparkle size={18} color="#6BA3D6" style={{position:'absolute', top:-12, left:16}} />
          <window.Sparkle size={14} color="#FFB38C" style={{position:'absolute', top:-8, right:30}} />
          <div className="cl-card-head">
            <div className="cl-title">共做幾個成品？</div>
            <span className="cl-count-pill">{s.qty} 個</span>
          </div>
          <p className="cl-sub">蛋糕幾個、塔幾個、杯子蛋糕幾個…</p>
          <div className="cl-chips">
            {window.QUICK_QTY.map((q) => (
              <button key={q} className={`cl-chip${q === s.qty ? ' active' : ''}`}>{q}</button>
            ))}
          </div>
          <div className="cl-stepper">
            <button className="cl-step">−</button>
            <div className="cl-step-num">{s.qty}</div>
            <button className="cl-step">+</button>
          </div>
        </section>

        {/* Section head */}
        <div className="cl-sec-head">
          <h2 className="cl-sec-title">
            <span className="star"><window.Sparkle size={12} color="#C8602A" /></span>
            多組配方計算
          </h2>
          <div className="cl-action-row">
            <button className="cl-act">{window.ICONS.camera('#6B4A2F')}截圖</button>
            <button className="cl-act dark">範本</button>
            <button className="cl-act primary">+ 新配方</button>
          </div>
        </div>

        {/* Advanced */}
        <div className="cl-adv">
          <div><span className="k">進階</span>備料損耗比例</div>
          <div style={{color:'#9E8672', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', gap:4}}>展開設定 {window.ICONS.chevron('#9E8672')}</div>
        </div>

        {/* Recipe card */}
        <section className="cl-recipe">
          <div className="cl-rtab" />
          <div className="cl-rhead">
            <input defaultValue={g.name} />
            <button className="cl-iconbtn copy">複製</button>
            <button className="cl-iconbtn del">{window.ICONS.close('#B54728')}</button>
          </div>

          <div className="cl-rbody">
            <div className="cl-seg">
              <button className="active">% 比例輸入</button>
              <button>g 克數輸入</button>
            </div>

            <div className="cl-lbl">目標量</div>
            <div className="cl-seg">
              <button>輸入克數</button>
              <button className="active">按模具算</button>
            </div>

            <div className="cl-lbl">模具設定</div>
            <div className="cl-mold-panel">
              <div className="cl-mold-row">
                <div className="k">模具類型</div>
                <div className="cl-chips-inline">
                  <button className="cl-chip-sm orange active">圓模（吋）</button>
                  <button className="cl-chip-sm">塔圈（cm）</button>
                  <button className="cl-chip-sm">杯型</button>
                </div>
              </div>
              <div className="cl-mold-row">
                <div className="k">蛋糕類型</div>
                <div className="cl-chips-inline">
                  {window.CAKE_TYPES.map(c => (
                    <button key={c.v} className={`cl-chip-sm${c.v === g.cakeType ? ' active' : ''}`}>{c.l}</button>
                  ))}
                </div>
              </div>

              <div className="cl-info-box">
                <div className="badge-row">
                  <span className="cl-badge-whip">{g.moldWhip}</span>
                  <span className="need">此設定約需 {g.moldBatter} g 麵糊</span>
                </div>
                <p className="desc">{g.moldDesc}</p>
                <p className="ex">例：{g.moldExamples}</p>
                <p className="stats">比重 0.85 · 填充率 50%</p>
              </div>

              <div className="cl-mold-row">
                <div className="cl-size-row">
                  <div className="k">尺寸（吋）</div>
                  <div className="cl-unit-toggle">
                    <button className="active">吋</button>
                    <button>cm</button>
                  </div>
                </div>
                <div className="cl-chips-inline">
                  {window.ROUND_SIZES.map(sz => (
                    <button key={sz} className={`cl-chip-sm orange${sz === g.moldSize ? ' active' : ''}`}>{sz}</button>
                  ))}
                </div>
              </div>

              <div className="cl-inline">
                <span style={{fontSize:11.5, fontWeight:800, color:'#6B4A2F'}}>模具高度</span>
                <input defaultValue={g.moldHeight} />
                <span style={{fontSize:12, color:'#9E8672', fontWeight:700}}>cm</span>
              </div>

              <div className="cl-total-line">共 <b>{g.moldTotal} g</b> <span style={{color:'#9E8672', fontSize:11}}>（1cc≈1g）</span></div>
            </div>

            {/* 份數 */}
            <div className="cl-qty-inline">
              <span className="k">份數</span>
              <div className="cl-step-sm">
                <button>−</button>
                <span className="n">{g.qty}</span>
                <button>+</button>
              </div>
              <span className="cl-inherit">沿用 {s.qty} 份</span>
            </div>

            <div className="cl-hint">主要材料（通常為麵粉）設 100，其他材料填相對比例</div>

            {/* Ingredients */}
            <div className="cl-ing-list">
              {g.ingredients.map((ing, i) => (
                <div key={i} className={`cl-ing-row${i === 0 ? ' base' : ''}`}>
                  <div className="nm">
                    {ing.name}
                    {ing.brand && <small>· {ing.brand}</small>}
                  </div>
                  <div className="cl-val-box">
                    <span className="u">%</span>
                    <input defaultValue={ing.pct} />
                  </div>
                  <div className="cl-row-actions">
                    <button className="copy">複製</button>
                    <button className="del">刪除</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="cl-add-ing">{window.ICONS.plus('#6B4A2F')} 新增材料</button>

            <div className="cl-totrow">
              <span className="v">合計 {g.totalPct}.0 %</span>
              <span className="q">?</span>
            </div>

            {/* Result */}
            <div className="cl-result">
              {g.ingredients.map((ing, i) => {
                const max = Math.max(...g.ingredients.map(x => x.g));
                return (
                  <div key={i} className="cl-r-row">
                    <span className="l">{ing.name}</span>
                    <span className="g">{ing.g.toFixed(1)} g</span>
                    <span className="bar"><span style={{width:`${(ing.g/max)*100}%`}} /></span>
                  </div>
                );
              })}
              <div className="cl-r-tot">
                <span>合計</span>
                <span className="g">{g.totalG.toFixed(1)} g</span>
              </div>
              <div className="cl-r-formula">顯示計算過程</div>
            </div>
          </div>
        </section>

        {/* Add group */}
        <div className="cl-add-group">{window.ICONS.plus('#6B4A2F', 16)} 新增組合</div>

        {/* Summary */}
        <section className="cl-sum">
          <div className="cl-sum-head">
            <window.Sparkle size={16} color="#fff" />
            <div style={{flex:1}}>
              <h3>備料彙總</h3>
              <span className="meta">共 {s.summaryCount} 種材料 · {s.summaryKg} kg</span>
            </div>
            <span className="collapse">▲ 收起</span>
          </div>
          <div className="cl-sum-body">
            {s.summary.map((r, i) => {
              const max = Math.max(...s.summary.map(x => x.g));
              return (
                <div key={i} className="cl-r-row" style={{padding:'6px 0'}}>
                  <span className="l">{r.name}{r.brand && <small style={{color:'#9E8672', fontSize:10.5, fontWeight:500, marginLeft:3}}>· {r.brand}</small>}</span>
                  <span className="g">{r.g.toFixed(1)} g</span>
                  <span className="bar"><span style={{width:`${(r.g/max)*100}%`}} /></span>
                </div>
              );
            })}
            <div className="cl-sum-kg">
              <span className="l">合計</span>
              <span className="g">{s.summaryKg} <small>kg</small></span>
            </div>
          </div>
        </section>
      </main>

      <div className="cl-save">
        <div className="bar"><window.Sparkle size={14} color="#fff"/> 儲存配方</div>
      </div>
    </div>
  );
}

window.CloudApp = CloudApp;
