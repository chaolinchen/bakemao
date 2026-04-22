// Option B — 毛球泡泡 (Mao Bubble) — 圓滾滾 bubbly style, pink-cream palette
// More playful than Option A: bubble-heavy, soft pastel pink + cream, extra whimsy.
const bbCss = `
.bb-app {
  background: #FFF1E6;
  background-image:
    radial-gradient(circle at 20% 15%, #FFE1CF 0, transparent 42%),
    radial-gradient(circle at 85% 70%, #E6EEF5 0, transparent 45%);
  color:#4A3322; font-family:'Baloo 2','Noto Sans TC', system-ui, sans-serif;
  min-height:100%; padding-bottom: 120px; position:relative;
}
.bb-app::before { content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(circle at 12% 40%, rgba(255,255,255,0.7) 12px, transparent 14px),
    radial-gradient(circle at 92% 30%, rgba(255,255,255,0.6) 18px, transparent 20px),
    radial-gradient(circle at 8% 88%, rgba(255,225,207,0.7) 22px, transparent 24px);
}
.bb-head { position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between;
  padding: 14px 18px; background:rgba(255,241,230,0.94); backdrop-filter:blur(10px); border-bottom: 2.5px solid #6B4A2F; }
.bb-brand { display:flex; align-items:center; gap:10px; }
.bb-brand h1 { margin:0; font-size:22px; font-weight:800; color:#6B4A2F; }
.bb-brand .sub { font-size:10.5px; letter-spacing:3px; color:#C8602A; font-weight:700; margin-top:-2px; }
.bb-nav { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:800; color:#fff;
  padding:8px 14px; background:#C8602A; border-radius:999px; border:2.5px solid #6B4A2F; box-shadow:0 3px 0 #6B4A2F; }

.bb-main { max-width:460px; margin:0 auto; padding:16px; display:flex; flex-direction:column; gap:16px; position:relative; z-index:1; }

.bb-bubble {
  background:#FFFBF2; border-radius:32px; border:2.5px solid #6B4A2F;
  box-shadow: 0 5px 0 #6B4A2F; padding: 18px; position:relative;
}
.bb-bubble::after {
  content:''; position:absolute; top:14px; left:22px; width:30px; height:12px;
  border-radius: 50%; background: rgba(255,255,255,0.7); transform: rotate(-10deg);
  pointer-events:none;
}

.bb-title { font-size:15.5px; font-weight:800; display:flex; align-items:center; gap:7px; color:#4A3322; }
.bb-count { display:inline-flex; align-items:center; gap:4px; background:#FFD089;
  padding:5px 13px; border-radius:999px; border:2.5px solid #6B4A2F; box-shadow:0 2px 0 #6B4A2F;
  font-size:14px; font-weight:800; color:#6B4A2F; }
.bb-sub { font-size:11.5px; color:#9E8672; margin:4px 0 14px; }
.bb-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.bb-chip { min-width:46px; padding:10px 14px; border-radius:18px; font-size:14px; font-weight:800;
  background:#FFE1C7; color:#6B4A2F; border:2.5px solid #6B4A2F; box-shadow:0 3px 0 #6B4A2F; }
.bb-chip.active { background:#C8602A; color:#fff; transform:translateY(1px); box-shadow:0 2px 0 #6B4A2F; }

.bb-step-wrap { display:flex; align-items:center; justify-content:center; gap:22px;
  background:#E6EEF5; border:2.5px solid #6B4A2F; border-radius:24px; padding:6px; }
.bb-step-btn { width:44px; height:44px; border-radius:50%; background:#fff; border:2.5px solid #6B4A2F;
  color:#C8602A; font-size:22px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 0 #6B4A2F; }
.bb-step-n { font-family:'Baloo 2', serif; font-size:28px; font-weight:800; color:#4A3322; min-width:34px; text-align:center; }

.bb-sec { display:flex; align-items:center; justify-content:space-between; padding: 2px 6px; }
.bb-sec h2 { margin:0; font-size:17px; font-weight:800; color:#4A3322; display:flex; align-items:center; gap:8px; }
.bb-sec h2 .bub {
  background:#FFD089; width:28px; height:28px; border-radius:50%; border:2.5px solid #6B4A2F;
  display:flex; align-items:center; justify-content:center; box-shadow:0 2px 0 #6B4A2F;
}
.bb-actions { display:flex; gap:6px; }
.bb-act { font-size:12.5px; font-weight:800; color:#6B4A2F; padding:7px 12px; border-radius:999px;
  background:#fff; border:2.5px solid #6B4A2F; box-shadow:0 2px 0 #6B4A2F; display:flex; align-items:center; gap:4px; }
.bb-act.p { background:#C8602A; color:#fff; }
.bb-act.d { background:#6B4A2F; color:#fff; }

.bb-adv { padding:12px 14px; background:#fff; border:2.5px solid #6B4A2F; border-radius:18px;
  box-shadow:0 3px 0 #6B4A2F; display:flex; align-items:center; justify-content:space-between; font-size:13.5px; font-weight:700; }
.bb-adv .k { background:#6B4A2F; color:#fff; font-size:10.5px; font-weight:800; padding:3px 9px; border-radius:8px; margin-right:8px; }

.bb-recipe { background:#fff; border-radius:28px; border:2.5px solid #6B4A2F; box-shadow:0 5px 0 #6B4A2F; overflow:hidden; }
.bb-rh { display:flex; align-items:center; gap:10px; padding:14px; background:#FFE1C7; border-bottom:2.5px solid #6B4A2F; }
.bb-rh .stamp { width:38px; height:38px; border-radius:50%; background:#C8602A; color:#fff;
  font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; border:2.5px solid #6B4A2F; box-shadow:0 2px 0 #6B4A2F; }
.bb-rh input { flex:1; padding:10px 12px; background:#fff; border:2.5px solid #6B4A2F; border-radius:12px; font-weight:800; font-size:14.5px; color:#4A3322; outline:none; }
.bb-ib { width:32px; height:32px; border-radius:10px; background:#fff; border:2.5px solid #6B4A2F;
  color:#6B4A2F; font-size:11.5px; font-weight:800; display:flex; align-items:center; justify-content:center; }
.bb-ib.w { padding:0 10px; width:auto; }
.bb-rb { padding:14px; }

.bb-seg { display:flex; gap:4px; padding:4px; background:#E6EEF5; border-radius:16px; border:2.5px solid #6B4A2F; }
.bb-seg button { flex:1; padding:10px 0; font-size:13px; font-weight:800; color:#6B4A2F; border-radius:12px; }
.bb-seg button.active { background:#fff; color:#C8602A; border:2px solid #6B4A2F; }

.bb-lbl { font-size:12px; font-weight:800; color:#6B4A2F; margin:16px 0 8px; display:flex; align-items:center; gap:6px; }
.bb-lbl::before { content:''; width:10px; height:10px; border-radius:50%; background:#C8602A; border:2px solid #6B4A2F; display:inline-block; }

.bb-mold { background:#FFF3E6; border:2.5px solid #6B4A2F; border-radius:20px; padding:14px; display:flex; flex-direction:column; gap:12px; }
.bb-mr { display:flex; flex-direction:column; gap:7px; }
.bb-mr .k { font-size:11.5px; font-weight:800; color:#6B4A2F; }
.bb-csm { display:flex; flex-wrap:wrap; gap:6px; }
.bb-cs { padding:6px 12px; border-radius:12px; font-size:12.5px; font-weight:800; background:#fff; color:#6B4A2F; border:2.5px solid #6B4A2F; }
.bb-cs.a { background:#6B4A2F; color:#fff; }
.bb-cs.ao { background:#C8602A; color:#fff; }
.bb-info { background:#fff; border:2.5px solid #6B4A2F; border-radius:16px; padding:12px; }
.bb-info .br { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:6px; }
.bb-info .whip { background:#FFD089; color:#8B3B1C; font-size:12px; font-weight:800; padding:4px 11px; border-radius:999px; border:2.5px solid #6B4A2F; }
.bb-info .need { font-size:13px; font-weight:800; color:#4A3322; }
.bb-info .desc { font-size:12.5px; color:#6B5A4A; line-height:1.55; margin:4px 0 0; }
.bb-info .ex { font-size:11.5px; color:#9E8672; margin-top:3px; }
.bb-info .stats { font-size:10.5px; color:#B0A090; margin-top:3px; font-family:'Roboto Mono',monospace; }
.bb-hdr-row { display:flex; justify-content:space-between; align-items:center; }
.bb-ut { display:flex; border:2.5px solid #6B4A2F; border-radius:12px; overflow:hidden; }
.bb-ut button { padding:4px 12px; font-size:11.5px; font-weight:800; background:#fff; color:#6B4A2F; }
.bb-ut button.a { background:#C8602A; color:#fff; }
.bb-inline { display:flex; align-items:center; gap:8px; }
.bb-inline input { width:60px; padding:8px 10px; background:#fff; border:2.5px solid #6B4A2F; border-radius:12px; font-weight:800; text-align:center; font-family:'Roboto Mono',monospace; outline:none; }
.bb-tot { font-size:13px; color:#4A3322; font-weight:700; }
.bb-tot b { color:#C8602A; font-weight:800; font-family:'Roboto Mono',monospace; }

.bb-qrow { display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:12px 0; border-top:2px dashed #D0A578; border-bottom:2px dashed #D0A578; margin: 10px 0; }
.bb-qrow .k { font-size:12px; font-weight:800; color:#6B4A2F; }
.bb-qst { display:flex; align-items:center; gap:10px; background:#FFE1C7; border:2.5px solid #6B4A2F; border-radius:14px; padding:3px; }
.bb-qst button { width:30px; height:30px; border-radius:10px; background:#fff; border:2px solid #6B4A2F; color:#C8602A; font-weight:800; font-size:16px; display:flex; align-items:center; justify-content:center; }
.bb-qst .n { font-weight:800; min-width:22px; text-align:center; color:#4A3322; font-size:14.5px; }
.bb-inherit { background:#fff; color:#C8602A; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; border:2.5px solid #6B4A2F; }

.bb-hint { font-size:11px; color:#9E8672; margin: 6px 0 12px; }

.bb-ing { display:flex; flex-direction:column; gap:10px; }
.bb-irow { display:flex; align-items:center; gap:12px; padding:12px 14px; background:#FFFBF2;
  border:2.5px solid #6B4A2F; border-radius:20px; box-shadow: 0 2px 0 #6B4A2F; position: relative; }
.bb-irow.base { background: #FFD089; }
.bb-irow .dot { width:12px; height:12px; border-radius:50%; background:#6B4A2F; flex-shrink:0; }
.bb-irow.base .dot { background:#C8602A; box-shadow: 0 0 0 3px #fff, 0 0 0 5px #6B4A2F; }
.bb-irow .nm { flex:1; font-size:14.5px; font-weight:800; color:#4A3322; }
.bb-irow .nm small { color:#9E8672; font-weight:500; font-size:11.5px; margin-left:4px; }
.bb-vb { position: relative; }
.bb-vb .u { position:absolute; top:-8px; right:10px; background:#FFFBF2; padding:0 4px; font-size:10px; font-weight:800; color:#9E8672; }
.bb-irow.base .u { background:#FFD089; }
.bb-vb input { width:80px; padding:9px 10px; font-family:'Roboto Mono',monospace; font-weight:800; font-size:17px; color:#4A3322;
  background:#fff; border:2.5px solid #6B4A2F; border-radius:12px; outline:none; text-align:center; }
.bb-ra { display:flex; flex-direction:column; gap:2px; }
.bb-ra button { font-size:11px; font-weight:800; padding:2px 4px; color:#9E8672; }
.bb-ra .del { color:#B54728; text-decoration:underline; }
.bb-ra .cp { text-decoration:underline; }

.bb-add { width:100%; padding:14px; margin-top:10px; background:#FFF3E6; border:2.5px dashed #6B4A2F; border-radius:20px;
  font-size:13.5px; font-weight:800; color:#6B4A2F; display:flex; align-items:center; justify-content:center; gap:6px; }

.bb-totrow { display:flex; justify-content:flex-end; align-items:center; gap:8px; margin:10px 2px; font-size:12.5px; font-weight:800; color:#6B4A2F; }

.bb-result { margin-top:12px; padding:14px; background:#E6EEF5; border:2.5px solid #6B4A2F; border-radius:20px; }
.bb-rr { display:flex; align-items:center; gap:10px; padding:4px 0; }
.bb-rr .l { width:72px; font-size:13.5px; font-weight:800; color:#4A3322; }
.bb-rr .g { width:64px; text-align:right; font-family:'Roboto Mono',monospace; font-weight:800; font-size:14px; color:#4A3322; }
.bb-rr .bar { flex:1; height:10px; background:#fff; border-radius:999px; border:2px solid #6B4A2F; overflow:hidden; }
.bb-rr .bar span { display:block; height:100%; background: #C8602A; }
.bb-rtot { display:flex; justify-content:space-between; align-items:center; border-top:2px solid #6B4A2F; margin-top:8px; padding-top:8px; font-weight:800; }
.bb-rtot .g { color:#C8602A; font-family:'Roboto Mono',monospace; font-size:18px; }
.bb-rform { font-size:12px; color:#6B4A2F; margin-top:6px; text-decoration:underline; font-weight:700; }

.bb-addg { padding:14px; background:transparent; border:2.5px dashed #6B4A2F; border-radius:24px;
  font-size:14px; font-weight:800; color:#6B4A2F; display:flex; align-items:center; justify-content:center; gap:6px; }

/* Summary bubble */
.bb-sum { background:#C8602A; color:#fff; border-radius:28px; border:2.5px solid #6B4A2F; box-shadow:0 5px 0 #6B4A2F; overflow:hidden; position:relative; }
.bb-sum::before { content:''; position:absolute; top:14px; right:22px; width:36px; height:14px; border-radius:50%;
  background: rgba(255,255,255,0.45); transform: rotate(-12deg); pointer-events:none; }
.bb-sh { padding:16px 18px 12px; display:flex; align-items:center; gap:10px; }
.bb-sh h3 { margin:0; font-size:18px; font-weight:800; flex:1; }
.bb-sh .meta { font-size:11.5px; color:#FFE1C7; font-weight:700; display:block; margin-top:2px; }
.bb-sh .c { background:#FFFBF2; color:#C8602A; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; border:2.5px solid #6B4A2F; }
.bb-sb { padding: 0 16px 16px; }
.bb-srow { display:flex; align-items:center; gap:10px; padding:8px 12px; background: rgba(255,255,255,0.12);
  border-radius:14px; margin-bottom:6px; }
.bb-srow .n { flex:1; font-size:13.5px; font-weight:800; }
.bb-srow .n small { color:#FFE1C7; font-weight:500; font-size:11px; margin-left:4px; }
.bb-srow .g { font-family:'Roboto Mono',monospace; font-weight:800; font-size:14px; color:#FFD089; }
.bb-sum-kg { display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px; background:#FFFBF2; border:2.5px solid #6B4A2F; border-radius:18px;
  margin-top:8px; }
.bb-sum-kg .l { font-size:14.5px; font-weight:800; color:#4A3322; }
.bb-sum-kg .g { font-family:'Roboto Mono',monospace; font-weight:800; font-size:24px; color:#C8602A; }
.bb-sum-kg .g small { font-size:13px; color:#9E8672; margin-left:3px; }

.bb-save { position:fixed; left:0; right:0; bottom:0; padding:14px 16px calc(14px + env(safe-area-inset-bottom)); pointer-events:none; }
.bb-save .b { pointer-events:auto; max-width:460px; margin:0 auto;
  display:flex; align-items:center; justify-content:center; gap:10px;
  padding:16px 22px; background:#6B4A2F; color:#fff; border:2.5px solid #6B4A2F;
  border-radius:24px; box-shadow:0 5px 0 #4A3322, 0 10px 22px rgba(107,74,47,0.3); font-weight:800; font-size:16px; letter-spacing:2px; }
`;

function BubbleApp() {
  const s = window.FAKE_STATE; const g = s.groups[0];
  return (
    <div className="bb-app">
      <style>{bbCss}</style>
      <header className="bb-head">
        <div className="bb-brand">
          <window.MaoLogo size={42} />
          <div><h1>BakeMao</h1><div className="sub">烘 焙 貓</div></div>
        </div>
        <a className="bb-nav"><window.Sparkle size={12} color="#fff"/> 我的配方</a>
      </header>
      <main className="bb-main">
        <section className="bb-bubble">
          <window.Sparkle size={18} color="#6BA3D6" style={{position:'absolute', top:-12, right:30}}/>
          <window.Sparkle size={12} color="#FFB38C" style={{position:'absolute', bottom:-6, left:24}}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
            <div className="bb-title">共做幾個成品？</div>
            <span className="bb-count">{s.qty} 個</span>
          </div>
          <p className="bb-sub">蛋糕幾個、塔幾個、杯子蛋糕幾個…</p>
          <div className="bb-chips">
            {window.QUICK_QTY.map(q => <button key={q} className={`bb-chip${q === s.qty ? ' active' : ''}`}>{q}</button>)}
          </div>
          <div className="bb-step-wrap">
            <button className="bb-step-btn">−</button>
            <span className="bb-step-n">{s.qty}</span>
            <button className="bb-step-btn">+</button>
          </div>
        </section>

        <div className="bb-sec">
          <h2><span className="bub"><window.Sparkle size={12} color="#6B4A2F"/></span>多組配方計算</h2>
          <div className="bb-actions">
            <button className="bb-act">{window.ICONS.camera('#6B4A2F')}</button>
            <button className="bb-act d">範本</button>
            <button className="bb-act p">+ 新配方</button>
          </div>
        </div>

        <div className="bb-adv">
          <div><span className="k">進階</span>備料損耗比例</div>
          <div style={{display:'flex', alignItems:'center', gap:4, color:'#9E8672', fontSize:12}}>展開設定 ▾</div>
        </div>

        <section className="bb-recipe">
          <div className="bb-rh">
            <div className="stamp">1</div>
            <input defaultValue={g.name}/>
            <button className="bb-ib w">複製</button>
            <button className="bb-ib" style={{color:'#B54728'}}>×</button>
          </div>
          <div className="bb-rb">
            <div className="bb-seg">
              <button className="active">% 比例輸入</button>
              <button>g 克數輸入</button>
            </div>
            <div className="bb-lbl">目標量</div>
            <div className="bb-seg">
              <button>輸入克數</button>
              <button className="active">按模具算</button>
            </div>

            <div className="bb-lbl">模具設定</div>
            <div className="bb-mold">
              <div className="bb-mr">
                <div className="k">模具類型</div>
                <div className="bb-csm">
                  <button className="bb-cs ao">圓模（吋）</button>
                  <button className="bb-cs">塔圈（cm）</button>
                  <button className="bb-cs">杯型</button>
                </div>
              </div>
              <div className="bb-mr">
                <div className="k">蛋糕類型</div>
                <div className="bb-csm">
                  {window.CAKE_TYPES.map(c => <button key={c.v} className={`bb-cs${c.v === g.cakeType ? ' a' : ''}`}>{c.l}</button>)}
                </div>
              </div>
              <div className="bb-info">
                <div className="br"><span className="whip">{g.moldWhip}</span><span className="need">此設定約需 {g.moldBatter} g 麵糊</span></div>
                <p className="desc">{g.moldDesc}</p>
                <p className="ex">例：{g.moldExamples}</p>
                <p className="stats">比重 0.85 · 填充率 50%</p>
              </div>
              <div className="bb-mr">
                <div className="bb-hdr-row">
                  <div className="k">尺寸（吋）</div>
                  <div className="bb-ut"><button className="a">吋</button><button>cm</button></div>
                </div>
                <div className="bb-csm">
                  {window.ROUND_SIZES.map(sz => <button key={sz} className={`bb-cs ao${sz === g.moldSize ? ' a ao' : ''}`} style={sz === g.moldSize ? {background:'#C8602A', color:'#fff'} : {}}>{sz}</button>)}
                </div>
              </div>
              <div className="bb-inline">
                <span style={{fontSize:11.5, fontWeight:800, color:'#6B4A2F'}}>模具高度</span>
                <input defaultValue={g.moldHeight}/><span style={{fontSize:12, fontWeight:700, color:'#9E8672'}}>cm</span>
              </div>
              <div className="bb-tot">共 <b>{g.moldTotal} g</b> <span style={{color:'#9E8672', fontSize:11, fontWeight:500}}>（1cc≈1g）</span></div>
            </div>

            <div className="bb-qrow">
              <span className="k">份數</span>
              <div className="bb-qst"><button>−</button><span className="n">{g.qty}</span><button>+</button></div>
              <span className="bb-inherit">沿用 {s.qty} 份</span>
            </div>

            <div className="bb-hint">主要材料（通常為麵粉）設 100，其他材料填相對比例</div>

            <div className="bb-ing">
              {g.ingredients.map((ing, i) => (
                <div key={i} className={`bb-irow${i === 0 ? ' base' : ''}`}>
                  <span className="dot"/>
                  <div className="nm">{ing.name}{ing.brand && <small>· {ing.brand}</small>}</div>
                  <div className="bb-vb"><span className="u">%</span><input defaultValue={ing.pct}/></div>
                  <div className="bb-ra"><button className="cp">複製</button><button className="del">刪除</button></div>
                </div>
              ))}
            </div>

            <button className="bb-add">{window.ICONS.plus('#6B4A2F')} 新增材料</button>
            <div className="bb-totrow">合計 {g.totalPct}.0 % <span style={{width:18, height:18, border:'2px solid #9E8672', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10}}>?</span></div>

            <div className="bb-result">
              {g.ingredients.map((ing, i) => {
                const max = Math.max(...g.ingredients.map(x => x.g));
                return (
                  <div key={i} className="bb-rr"><span className="l">{ing.name}</span><span className="g">{ing.g.toFixed(1)} g</span><span className="bar"><span style={{width:`${(ing.g/max)*100}%`}}/></span></div>
                );
              })}
              <div className="bb-rtot"><span>合計</span><span className="g">{g.totalG.toFixed(1)} g</span></div>
              <div className="bb-rform">顯示計算過程</div>
            </div>
          </div>
        </section>

        <div className="bb-addg">{window.ICONS.plus('#6B4A2F', 16)} 新增組合</div>

        <section className="bb-sum">
          <div className="bb-sh">
            <div style={{flex:1}}>
              <h3>備料彙總</h3>
              <span className="meta">共 {s.summaryCount} 種材料 · {s.summaryKg} kg</span>
            </div>
            <span className="c">▲ 收起</span>
          </div>
          <div className="bb-sb">
            {s.summary.map((r, i) => (
              <div key={i} className="bb-srow">
                <span className="n">{r.name}{r.brand && <small>· {r.brand}</small>}</span>
                <span className="g">{r.g.toFixed(1)} g</span>
              </div>
            ))}
            <div className="bb-sum-kg"><span className="l">合計</span><span className="g">{s.summaryKg}<small>kg</small></span></div>
          </div>
        </section>
      </main>
      <div className="bb-save"><div className="b"><window.PawPrint size={14} color="#fff"/> 儲存配方</div></div>
    </div>
  );
}
window.BubbleApp = BubbleApp;
