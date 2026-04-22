// Option C — 手作筆記 (Recipe Notebook) — editorial, paper + ruled lines, taped stamps
// Contrast to A (sky/sticker) and B (bubble/pink): cream paper, hand-drawn cards, washi tape, clean type.
const nbCss = `
.nb-app {
  background: #F7EFE0;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 30px, rgba(107,74,47,0.05) 30px 31px);
  color:#4A3322; font-family:'Baloo 2','Noto Sans TC', system-ui, sans-serif;
  min-height:100%; padding-bottom: 120px;
}
.nb-head { position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between;
  padding:12px 18px; background:#F7EFE0; border-bottom: 2px solid #6B4A2F; }
.nb-brand { display:flex; align-items:center; gap:10px; }
.nb-brand h1 { margin:0; font-size:22px; font-weight:800; color:#6B4A2F; letter-spacing:1px; }
.nb-brand .sub { font-size:10px; letter-spacing:3px; color:#9E8672; font-weight:700; margin-top:-2px; }
.nb-nav { font-size:13px; font-weight:800; color:#C8602A; display:flex; align-items:center; gap:5px; text-decoration:underline; text-underline-offset:3px; }

.nb-main { max-width:460px; margin:0 auto; padding:16px; display:flex; flex-direction:column; gap:18px; }

.nb-card {
  background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:6px;
  box-shadow: 3px 3px 0 #6B4A2F;
  padding: 18px 16px 14px;
  position: relative;
}
.nb-tape {
  position:absolute; top:-8px; left:50%; transform: translateX(-50%) rotate(-2deg);
  width:70px; height:18px; background: rgba(200,96,42,0.35);
  border: 1px dashed rgba(107,74,47,0.3);
}

.nb-lbl-h {
  font-size:11px; letter-spacing:4px; color:#9E8672; font-weight:800; text-transform:uppercase;
}
.nb-q-title { font-size:17px; font-weight:800; color:#4A3322; margin: 4px 0 2px;
  border-bottom: 2px dashed #D0A578; padding-bottom: 8px; display:flex; justify-content:space-between; align-items:baseline;
}
.nb-q-title b { color:#C8602A; font-family:'Baloo 2'; font-size:24px; font-weight:800; }
.nb-sub { font-size:11.5px; color:#9E8672; margin: 6px 0 12px; }
.nb-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
.nb-chip { min-width:40px; padding:7px 11px; border-radius:4px; font-size:13.5px; font-weight:800;
  background:#FFFBF2; color:#6B4A2F; border:1.5px solid #6B4A2F; font-family:'Baloo 2', serif; }
.nb-chip.active { background:#6B4A2F; color:#FFFBF2; }

.nb-step { display:flex; align-items:center; justify-content:center; gap:20px; border-top:1.5px dashed #D0A578; padding-top:10px; }
.nb-step button { width:36px; height:36px; border-radius:50%; background:#FFE1C7; border:1.5px solid #6B4A2F; font-size:18px; font-weight:800; color:#6B4A2F; display:flex; align-items:center; justify-content:center; }
.nb-step .n { font-size:24px; font-weight:800; color:#4A3322; min-width:30px; text-align:center; font-family:'Baloo 2', serif; }

.nb-sec { display:flex; align-items:baseline; justify-content:space-between; padding-bottom: 4px; border-bottom: 2px solid #6B4A2F; }
.nb-sec h2 { margin:0; font-size:18px; font-weight:800; color:#4A3322; }
.nb-sec h2 .num { color:#C8602A; font-family:'Baloo 2'; font-size:22px; margin-right:6px; }
.nb-acts { display:flex; gap:4px; }
.nb-act { font-size:12px; font-weight:800; padding:6px 10px; border:1.5px solid #6B4A2F; background:#FFFBF2; color:#6B4A2F; display:flex; align-items:center; gap:4px; border-radius:4px; }
.nb-act.p { background:#C8602A; color:#fff; border-color:#6B4A2F; }
.nb-act.d { background:#6B4A2F; color:#fff; }

.nb-adv { padding:10px 12px; background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:4px;
  display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.nb-adv .k { background:#FFE1C7; color:#6B4A2F; border:1.5px solid #6B4A2F; font-size:10px; font-weight:800; padding:2px 7px; border-radius:3px; margin-right:8px; }

/* Recipe */
.nb-recipe { background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:6px; box-shadow: 3px 3px 0 #6B4A2F; position:relative; }
.nb-rstamp { position:absolute; top:-14px; right:20px; padding:4px 14px;
  background:#C8602A; color:#fff; font-size:11px; font-weight:800; letter-spacing:2px;
  border:1.5px solid #6B4A2F; box-shadow: 2px 2px 0 #6B4A2F; transform: rotate(2deg); text-transform:uppercase; }
.nb-rh { padding:16px 14px 10px; border-bottom:2px dashed #D0A578; }
.nb-rh-inp { display:flex; gap:8px; align-items:center; }
.nb-rh-inp input { flex:1; padding:8px 10px; background:transparent; border:none; border-bottom:2px solid #6B4A2F;
  font-size:17px; font-weight:800; color:#4A3322; outline:none; font-family:'Baloo 2', serif; }
.nb-ib { padding:6px 10px; border:1.5px solid #6B4A2F; background:#FFE1C7; color:#6B4A2F; font-size:11.5px; font-weight:800; border-radius:3px; }
.nb-ib.x { background:#FFFBF2; color:#B54728; padding:6px 8px; }

.nb-rb { padding: 14px; }
.nb-seg { display:flex; border:1.5px solid #6B4A2F; border-radius:4px; overflow:hidden; }
.nb-seg button { flex:1; padding:9px 0; font-size:13px; font-weight:800; color:#6B4A2F; background:#FFFBF2; }
.nb-seg button.active { background:#6B4A2F; color:#fff; }
.nb-seg button + button { border-left:1.5px solid #6B4A2F; }

.nb-lbl { font-size:10.5px; letter-spacing:3px; color:#9E8672; font-weight:800; margin:14px 0 6px; text-transform:uppercase; }

.nb-mold { background:#FFF3E6; border:1.5px solid #6B4A2F; border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:10px; }
.nb-mr { display:flex; flex-direction:column; gap:6px; }
.nb-mr .k { font-size:10px; letter-spacing:2px; font-weight:800; color:#9E8672; text-transform:uppercase; }
.nb-csm { display:flex; flex-wrap:wrap; gap:4px; }
.nb-cs { padding:5px 10px; border:1.5px solid #6B4A2F; background:#FFFBF2; font-size:12.5px; font-weight:800; color:#6B4A2F; border-radius:3px; font-family:'Baloo 2', serif; }
.nb-cs.a { background:#6B4A2F; color:#fff; }
.nb-cs.ao { background:#C8602A; color:#fff; }
.nb-info { background:#FFFBF2; border:1.5px dashed #6B4A2F; border-radius:4px; padding:10px 12px; position: relative; }
.nb-info .br { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:4px; }
.nb-info .whip { background:#FFE1C7; border:1.5px solid #6B4A2F; color:#8B3B1C; font-size:11px; font-weight:800; padding:2px 10px; border-radius:3px; letter-spacing:1px; }
.nb-info .need { font-size:13px; font-weight:800; color:#4A3322; }
.nb-info .desc { font-size:12.5px; color:#6B5A4A; line-height:1.55; margin:3px 0 0; }
.nb-info .ex { font-size:11.5px; color:#9E8672; margin-top:3px; font-style:italic; }
.nb-info .stats { font-size:10px; color:#B0A090; margin-top:3px; font-family:'Roboto Mono', monospace; letter-spacing:1px; }

.nb-hdr-row { display:flex; align-items:center; justify-content:space-between; }
.nb-ut { display:flex; border:1.5px solid #6B4A2F; border-radius:3px; overflow:hidden; }
.nb-ut button { padding:3px 10px; font-size:11px; font-weight:800; background:#FFFBF2; color:#6B4A2F; }
.nb-ut button.a { background:#C8602A; color:#fff; }

.nb-inline { display:flex; align-items:center; gap:6px; font-size:12px; color:#6B4A2F; font-weight:800; }
.nb-inline input { width:48px; padding:5px 8px; background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:3px; font-weight:800; text-align:center; font-family:'Roboto Mono', monospace; outline:none; }

.nb-tot { font-size:13px; color:#4A3322; font-weight:700; margin-top:4px; }
.nb-tot b { color:#C8602A; font-family:'Roboto Mono', monospace; font-weight:800; font-size:14px; }

.nb-qrow { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding: 10px 0; border-top:2px dashed #D0A578; border-bottom:2px dashed #D0A578; margin:10px 0; }
.nb-qrow .k { font-size:10px; letter-spacing:2px; font-weight:800; color:#9E8672; text-transform:uppercase; }
.nb-qst { display:flex; align-items:center; gap:8px; background:#FFE1C7; border:1.5px solid #6B4A2F; border-radius:4px; padding:2px; }
.nb-qst button { width:26px; height:26px; border-radius:3px; background:#FFFBF2; border:1.5px solid #6B4A2F; color:#C8602A; font-weight:800; font-size:14px; display:flex; align-items:center; justify-content:center; }
.nb-qst .n { font-weight:800; min-width:22px; text-align:center; color:#4A3322; font-size:14px; font-family:'Baloo 2'; }
.nb-inherit { font-size:11px; font-weight:800; color:#C8602A; text-decoration:underline; }

.nb-hint { font-size:11px; color:#9E8672; font-style:italic; margin: 6px 0 10px; }

/* Ingredient list — notebook table with left border accent */
.nb-ing {
  border:1.5px solid #6B4A2F; border-radius:4px; overflow:hidden;
  background: repeating-linear-gradient(0deg, #FFFBF2 0 34px, #FFF3E6 34px 35px);
}
.nb-irow { display:grid; grid-template-columns: 18px 1fr 96px 66px; gap:8px; align-items:center;
  padding: 8px 10px; border-bottom: 1.5px solid #F0DDC4; }
.nb-irow:last-child { border-bottom:none; }
.nb-irow .idx { font-size:11px; font-weight:800; color:#9E8672; font-family:'Roboto Mono', monospace; }
.nb-irow .nm { font-size:14px; font-weight:800; color:#4A3322; }
.nb-irow .nm small { color:#9E8672; font-weight:500; font-size:11px; margin-left:3px; }
.nb-irow .vb { position: relative; }
.nb-irow .vb .u { position:absolute; top:-7px; right:6px; padding:0 3px; font-size:9.5px; font-weight:800; color:#9E8672; background:#FFFBF2; }
.nb-irow .vb input { width:96px; padding:6px 8px; background:#fff; border:1.5px solid #6B4A2F; border-radius:3px;
  font-family:'Roboto Mono', monospace; font-weight:800; font-size:14px; color:#4A3322; outline:none; text-align:center; }
.nb-irow .ra { display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
.nb-irow .ra button { font-size:10.5px; font-weight:800; color:#9E8672; padding:1px 3px; }
.nb-irow .ra .del { color:#B54728; text-decoration:underline; }
.nb-irow .ra .cp { text-decoration:underline; }
.nb-irow.base { background: #FFE1C7; }

.nb-add { width:100%; padding:10px; margin-top:8px; background:transparent; border:1.5px dashed #6B4A2F; border-radius:4px;
  font-size:13px; font-weight:800; color:#6B4A2F; display:flex; align-items:center; justify-content:center; gap:6px; }
.nb-totp { text-align:right; font-size:12px; font-weight:800; color:#6B4A2F; margin: 8px 4px; }

/* Result */
.nb-result { margin-top:14px; padding: 14px; background: #FFE1C7; border:1.5px solid #6B4A2F; border-radius:4px; position: relative; }
.nb-result::before { content:'RESULT'; position:absolute; top:-9px; left:14px; background:#6B4A2F; color:#fff; font-size:9.5px; font-weight:800; letter-spacing:3px; padding:2px 10px; border-radius:3px; }
.nb-rr { display:flex; align-items:center; gap:10px; padding: 3px 0; }
.nb-rr .l { width:72px; font-size:13px; font-weight:800; color:#4A3322; }
.nb-rr .g { width:64px; font-family:'Roboto Mono', monospace; font-weight:800; font-size:13.5px; color:#4A3322; text-align:right; }
.nb-rr .bar { flex:1; height:7px; background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:2px; overflow:hidden; }
.nb-rr .bar span { display:block; height:100%; background:#C8602A; }
.nb-rtot { display:flex; justify-content:space-between; padding-top:8px; margin-top:6px; border-top:1.5px dashed #6B4A2F; font-weight:800; }
.nb-rtot .g { color:#C8602A; font-family:'Roboto Mono',monospace; font-size:16px; }
.nb-rform { font-size:12px; color:#6B4A2F; margin-top:4px; font-style:italic; text-decoration:underline; }

.nb-addg { padding:12px; border:1.5px dashed #6B4A2F; border-radius:4px;
  font-size:13.5px; font-weight:800; color:#6B4A2F; display:flex; align-items:center; justify-content:center; gap:6px;
  background:#FFFBF2; }

/* Summary envelope */
.nb-sum { background:#FFFBF2; border:1.5px solid #6B4A2F; border-radius:6px; box-shadow: 3px 3px 0 #6B4A2F; position:relative; overflow:hidden; }
.nb-sum::before { content:''; position:absolute; top:0; left:0; right:0; height:26px;
  background: repeating-linear-gradient(45deg, #C8602A 0 8px, #6B4A2F 8px 16px, #FFFBF2 16px 24px); opacity:0.8; }
.nb-sh { padding:40px 14px 10px; display:flex; align-items:center; gap:10px; border-bottom:2px dashed #D0A578; }
.nb-sh h3 { margin:0; font-size:16px; font-weight:800; color:#4A3322; flex:1; }
.nb-sh .meta { font-size:11px; color:#9E8672; font-weight:700; display:block; margin-top:2px; }
.nb-sh .c { font-size:11px; font-weight:800; color:#C8602A; text-decoration:underline; }
.nb-sb { padding: 10px 14px 14px; }
.nb-srow { display:grid; grid-template-columns: 1fr 70px 1fr; gap:10px; align-items:center; padding:5px 0; border-bottom: 1px dotted #D0A578; }
.nb-srow:last-child { border-bottom:none; }
.nb-srow .n { font-size:13.5px; font-weight:800; color:#4A3322; }
.nb-srow .n small { color:#9E8672; font-weight:500; font-size:10.5px; margin-left:3px; }
.nb-srow .g { font-family:'Roboto Mono', monospace; font-weight:800; font-size:13.5px; color:#4A3322; text-align:right; }
.nb-srow .bar { height:6px; background:#FFE1C7; border:1.5px solid #6B4A2F; border-radius:2px; overflow:hidden; }
.nb-srow .bar span { display:block; height:100%; background:#C8602A; }
.nb-sum-kg { display:flex; justify-content:space-between; align-items:center; padding:10px 12px;
  background:#6B4A2F; color:#fff; margin-top:10px; border-radius:4px; }
.nb-sum-kg .l { font-size:14px; font-weight:800; }
.nb-sum-kg .g { font-family:'Roboto Mono', monospace; font-weight:800; font-size:22px; color:#FFD089; }
.nb-sum-kg .g small { font-size:13px; color:#FFE1C7; margin-left:3px; }

.nb-save { position:fixed; left:0; right:0; bottom:0; padding:14px 16px calc(14px + env(safe-area-inset-bottom)); pointer-events:none; }
.nb-save .b { pointer-events:auto; max-width:460px; margin:0 auto;
  display:flex; align-items:center; justify-content:center; gap:10px;
  padding:15px 22px; background:#C8602A; color:#fff; border:1.5px solid #6B4A2F; border-radius:4px;
  box-shadow: 3px 3px 0 #6B4A2F, 0 10px 22px rgba(107,74,47,0.25); font-weight:800; font-size:15px; letter-spacing:4px; }
`;

function NotebookApp() {
  const s = window.FAKE_STATE; const g = s.groups[0];
  return (
    <div className="nb-app">
      <style>{nbCss}</style>
      <header className="nb-head">
        <div className="nb-brand">
          <window.MaoLogo size={40}/>
          <div><h1>BakeMao</h1><div className="sub">RECIPE NOTE</div></div>
        </div>
        <a className="nb-nav"><window.PawPrint size={12}/> 我的配方</a>
      </header>
      <main className="nb-main">
        <section className="nb-card">
          <span className="nb-tape"/>
          <div className="nb-lbl-h">01 · YIELD</div>
          <div className="nb-q-title">共做幾個成品？<b>{s.qty} 個</b></div>
          <p className="nb-sub">蛋糕幾個、塔幾個、杯子蛋糕幾個…</p>
          <div className="nb-chips">
            {window.QUICK_QTY.map(q => <button key={q} className={`nb-chip${q === s.qty ? ' active' : ''}`}>{q}</button>)}
          </div>
          <div className="nb-step">
            <button>−</button><span className="n">{s.qty}</span><button>+</button>
          </div>
        </section>

        <div className="nb-sec">
          <h2><span className="num">02</span>多組配方計算</h2>
          <div className="nb-acts">
            <button className="nb-act">{window.ICONS.camera('#6B4A2F')}</button>
            <button className="nb-act d">範本</button>
            <button className="nb-act p">+ 新配方</button>
          </div>
        </div>

        <div className="nb-adv">
          <div><span className="k">進階</span>備料損耗比例</div>
          <div style={{fontSize:12, color:'#9E8672', fontWeight:800}}>展開設定 ▾</div>
        </div>

        <section className="nb-recipe">
          <span className="nb-rstamp">Recipe · 01</span>
          <div className="nb-rh">
            <div className="nb-rh-inp">
              <input defaultValue={g.name}/>
              <button className="nb-ib">複製</button>
              <button className="nb-ib x">✕</button>
            </div>
          </div>
          <div className="nb-rb">
            <div className="nb-seg"><button className="active">% 比例輸入</button><button>g 克數輸入</button></div>
            <div className="nb-lbl">目標量 · TARGET</div>
            <div className="nb-seg"><button>輸入克數</button><button className="active">按模具算</button></div>

            <div className="nb-lbl">模具設定 · MOLD</div>
            <div className="nb-mold">
              <div className="nb-mr">
                <div className="k">模具類型</div>
                <div className="nb-csm">
                  <button className="nb-cs ao">圓模（吋）</button>
                  <button className="nb-cs">塔圈（cm）</button>
                  <button className="nb-cs">杯型</button>
                </div>
              </div>
              <div className="nb-mr">
                <div className="k">蛋糕類型</div>
                <div className="nb-csm">
                  {window.CAKE_TYPES.map(c => <button key={c.v} className={`nb-cs${c.v === g.cakeType ? ' a' : ''}`}>{c.l}</button>)}
                </div>
              </div>
              <div className="nb-info">
                <div className="br"><span className="whip">{g.moldWhip}</span><span className="need">此設定約需 {g.moldBatter} g 麵糊</span></div>
                <p className="desc">{g.moldDesc}</p>
                <p className="ex">例：{g.moldExamples}</p>
                <p className="stats">比重 0.85 · 填充率 50%</p>
              </div>
              <div className="nb-mr">
                <div className="nb-hdr-row">
                  <div className="k">尺寸（吋）</div>
                  <div className="nb-ut"><button className="a">吋</button><button>cm</button></div>
                </div>
                <div className="nb-csm">
                  {window.ROUND_SIZES.map(sz => {
                    const a = sz === g.moldSize;
                    return <button key={sz} className="nb-cs" style={a ? {background:'#C8602A', color:'#fff'} : {}}>{sz}</button>;
                  })}
                </div>
              </div>
              <div className="nb-inline">
                模具高度 <input defaultValue={g.moldHeight}/> cm
              </div>
              <div className="nb-tot">共 <b>{g.moldTotal} g</b> <span style={{color:'#9E8672', fontSize:11, fontWeight:500}}>（1cc≈1g）</span></div>
            </div>

            <div className="nb-qrow">
              <span className="k">份數 · QTY</span>
              <div className="nb-qst"><button>−</button><span className="n">{g.qty}</span><button>+</button></div>
              <span className="nb-inherit">沿用 {s.qty} 份</span>
            </div>

            <div className="nb-lbl">材料 · INGREDIENTS</div>
            <p className="nb-hint">主要材料（通常為麵粉）設 100，其他材料填相對比例</p>

            <div className="nb-ing">
              {g.ingredients.map((ing, i) => (
                <div key={i} className={`nb-irow${i === 0 ? ' base' : ''}`}>
                  <span className="idx">{String(i+1).padStart(2,'0')}</span>
                  <div className="nm">{ing.name}{ing.brand && <small>· {ing.brand}</small>}</div>
                  <div className="vb"><span className="u">%</span><input defaultValue={ing.pct}/></div>
                  <div className="ra"><button className="cp">複製</button><button className="del">刪除</button></div>
                </div>
              ))}
            </div>
            <button className="nb-add">{window.ICONS.plus('#6B4A2F')} 新增材料</button>
            <div className="nb-totp">合計 {g.totalPct}.0 %  &nbsp;·&nbsp; ?</div>

            <div className="nb-result">
              {g.ingredients.map((ing, i) => {
                const max = Math.max(...g.ingredients.map(x => x.g));
                return (
                  <div key={i} className="nb-rr">
                    <span className="l">{ing.name}</span>
                    <span className="g">{ing.g.toFixed(1)} g</span>
                    <span className="bar"><span style={{width:`${(ing.g/max)*100}%`}}/></span>
                  </div>
                );
              })}
              <div className="nb-rtot"><span>合計</span><span className="g">{g.totalG.toFixed(1)} g</span></div>
              <div className="nb-rform">顯示計算過程</div>
            </div>
          </div>
        </section>

        <div className="nb-addg">{window.ICONS.plus('#6B4A2F', 16)} 新增組合</div>

        <section className="nb-sum">
          <div className="nb-sh">
            <div style={{flex:1}}>
              <h3>備料彙總 · SHOPPING LIST</h3>
              <span className="meta">共 {s.summaryCount} 種材料 · {s.summaryKg} kg</span>
            </div>
            <span className="c">▲ 收起</span>
          </div>
          <div className="nb-sb">
            {s.summary.map((r, i) => {
              const max = Math.max(...s.summary.map(x => x.g));
              return (
                <div key={i} className="nb-srow">
                  <span className="n">{r.name}{r.brand && <small>· {r.brand}</small>}</span>
                  <span className="g">{r.g.toFixed(1)} g</span>
                  <span className="bar"><span style={{width:`${(r.g/max)*100}%`}}/></span>
                </div>
              );
            })}
            <div className="nb-sum-kg"><span className="l">合計 TOTAL</span><span className="g">{s.summaryKg}<small>kg</small></span></div>
          </div>
        </section>
      </main>
      <div className="nb-save"><div className="b"><window.PawPrint size={14} color="#fff"/> 儲存配方</div></div>
    </div>
  );
}
window.NotebookApp = NotebookApp;
