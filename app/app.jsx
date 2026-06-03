/* ============================================================
   GAMER HUT — Creative Studio · App Shell
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

const DEFAULT_STATE = {
  template:'carousel', tagId:'lancamento', pattern:'8bit', fill:true, ink:'auto',
  eyebrow:'DIRETO DA SONY',
  title:'A PRIMEIRA EXCLUSIVIDADE DA GAMER HUT',
  subtitle:'neste post', badge:'STATE OF PLAY', cta:'ARRASTA PRO LADO',
  footer:'MÍDIA FÍSICA\nNEVER DIES', priceLabel:'R$ 349 · LACRADO',
  titleSize:108, image:null, pageCount:4, current:0,
  pages:[
    { title:'DRAGON QUEST XII', body:'Depois de 5 anos sem novidades, a Square Enix revelou oficialmente Beyond Dreams.', image:null },
    { title:'40 ANOS DE FRANQUIA', body:'O anúncio veio durante a celebração dos 40 anos da série.', image:null },
    { title:'JÁ NA PRÉ-VENDA', body:'Garanta sua mídia física lacrada aqui na Gamer Hut.', image:null },
    { title:'', body:'', image:null },
  ],
  showSafe:true,
};

const PRESETS = {
  block:    { template:'block', tagId:'pre-venda', pattern:'solid', fill:true, eyebrow:'CHEGOU NA LOJA',
              title:'MÍDIA FÍSICA NEVER DIES', subtitle:'Drop toda sexta · estoque limitado', titleSize:120 },
  image:    { template:'image', tagId:'lancamento', pattern:'solid', fill:false, eyebrow:'JÁ DISPONÍVEL',
              title:'METAL GEAR SOLID Δ: SNAKE EATER', subtitle:'Tactical espionage action de volta em mídia física, lacrado e em português.',
              priceLabel:'R$ 349 · LACRADO', titleSize:88 },
  reels:    { template:'reels', tagId:'trailer', pattern:'8bit', fill:true, eyebrow:'NOVO TRAILER',
              title:'DRAGON QUEST XII', subtitle:'assiste já', badge:'BEYOND DREAMS', titleSize:128,
              footer:'GAMER HUT\nNEVER STOPS' },
};

function loadState(){
  try{ const r = localStorage.getItem('gh-studio'); if(r) return { ...DEFAULT_STATE, ...JSON.parse(r) }; }catch(e){}
  return DEFAULT_STATE;
}

function App(){
  const [s, setS] = useState(loadState);
  const [scale, setScale] = useState(0.4);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const stageRef = useRef(null);
  const viewRef  = useRef(null);

  const set = useCallback((patch)=> setS(p=>({ ...p, ...patch })), []);
  useEffect(()=>{ try{ localStorage.setItem('gh-studio', JSON.stringify(s)); }catch(e){} }, [s]);

  const tpl = TEMPLATES.find(t=>t.id===s.template);
  const tag = TAGS.find(t=>t.id===s.tagId) || TAGS[0];

  // fit-to-view scaling
  useEffect(()=>{
    const fit = ()=>{
      const el = viewRef.current; if(!el) return;
      const availW = el.clientWidth - 96, availH = el.clientHeight - 120;
      setScale(Math.min(availW/tpl.w, availH/tpl.h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit); if(viewRef.current) ro.observe(viewRef.current);
    return ()=>ro.disconnect();
  }, [tpl.w, tpl.h]);

  // switching template applies a tasteful preset (keeps tag/content where possible)
  const pickTemplate = (id)=>{
    if(id===s.template) return;
    const p = PRESETS[id];
    if(p) set({ ...p, current:0 }); else set({ template:id, current:0 });
  };

  const isCarousel = s.template==='carousel';
  const onCover = !isCarousel || s.current===0;
  const pageIdx = isCarousel ? s.current : 0;

  const flashToast = (msg)=>{ setToast(msg); setTimeout(()=>setToast(null), 2600); };

  // ---- PNG export ----------------------------------------------------------
  // Build a font-embed CSS once (Google stylesheet is cross-origin, so we fetch
  // it + inline every woff2 as a data-URI). Cached in a ref. Then render the post
  // OFF-SCREEN at native size (no transform) and rasterize with html-to-image —
  // SVG-based, so the exact CSS layout is preserved (no html2canvas text reflow).
  const fontCSSRef = useRef(null);
  const GFONTS = "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,800;0,900;1,900&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&family=Press+Start+2P&display=swap";

  async function getFontCSS(){
    if(fontCSSRef.current!=null) return fontCSSRef.current;
    try{
      let css = await (await fetch(GFONTS)).text();
      const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map(m=>m[1]))];
      const pairs = await Promise.all(urls.map(async u=>{
        const blob = await (await fetch(u)).blob();
        const data = await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(blob); });
        return [u, data];
      }));
      for(const [u,data] of pairs) css = css.split(u).join(data);
      fontCSSRef.current = css;
    }catch(e){ console.warn('font embed failed, exporting with fallback fonts', e); fontCSSRef.current = ''; }
    return fontCSSRef.current;
  }

  async function captureToDataUrl(state, pageIndex){
    const fontEmbedCSS = await getFontCSS();
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed; left:0; top:0; opacity:0; z-index:-1; pointer-events:none;';
    document.body.appendChild(host);
    const root = ReactDOM.createRoot(host);
    root.render(<PostStage s={state} pageIndex={pageIndex} exporting={true}/>);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const node = host.querySelector('[data-stage]');
    await Promise.all([...host.querySelectorAll('img')].map(im=>
      im.complete && im.naturalWidth ? Promise.resolve()
        : new Promise(res=>{ im.onload=res; im.onerror=res; })));
    await document.fonts.ready;
    await new Promise(r=>setTimeout(r,60));
    let dataUrl;
    try{
      dataUrl = await htmlToImage.toPng(node, {
        width:node.offsetWidth, height:node.offsetHeight, pixelRatio:1,
        backgroundColor:'#0B0B0A', fontEmbedCSS,   // NOTE: no cacheBust — it breaks logo PNG fetch
      });
    } finally {
      root.unmount(); host.remove();
    }
    return dataUrl;
  }
  function triggerDownload(dataUrl, name){
    const a = document.createElement('a'); a.download = name; a.href = dataUrl; a.click();
  }
  async function exportCurrent(){
    setBusy(true);
    try{
      const url = await captureToDataUrl(s, pageIdx);
      const tagName = tag.label.toLowerCase().replace(/[^a-z]/g,'');
      const suffix = isCarousel ? `-p${s.current+1}` : '';
      triggerDownload(url, `gamerhut-${s.template}-${tagName}${suffix}.png`);
      flashToast('PNG exportado · '+tpl.w+'×'+tpl.h);
    }catch(e){ flashToast('Falha ao exportar'); console.error(e); }
    setBusy(false);
  }
  async function exportAll(){
    if(!isCarousel) return exportCurrent();
    setBusy(true);
    try{
      for(let i=0;i<s.pageCount;i++){
        const url = await captureToDataUrl(s, i);
        triggerDownload(url, `gamerhut-carrossel-p${i+1}.png`);
        await new Promise(r=>setTimeout(r,180));
      }
      flashToast(s.pageCount+' páginas exportadas');
    }catch(e){ flashToast('Falha ao exportar'); console.error(e); }
    setBusy(false);
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:GH.bg2, overflow:'hidden' }}>
      <TopBar s={s} tpl={tpl} tag={tag} busy={busy} onExport={exportCurrent} onExportAll={exportAll}/>
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* LEFT RAIL */}
        <aside style={{ width:392, flex:'none', background:GH.panel, borderRight:`1px solid ${GH.lineSoft}`,
          overflowY:'auto', overflowX:'hidden' }}>
          <Controls s={s} set={set} tag={tag} onCover={onCover} pageIdx={pageIdx}
            pickTemplate={pickTemplate} setS={setS}/>
        </aside>
        {/* PREVIEW */}
        <main ref={viewRef} style={{ flex:1, minWidth:0, position:'relative', display:'grid',
          placeItems:'center', background:
          `radial-gradient(circle at 50% 30%, #1b1916 0%, ${GH.bg} 70%)` }}>
          <GridDots/>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ width:tpl.w*scale, height:tpl.h*scale, position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, transform:`scale(${scale})`,
                transformOrigin:'top left', boxShadow:'0 40px 120px rgba(0,0,0,.6)' }}>
                <PostStage s={s} pageIndex={pageIdx} stageRef={stageRef}/>
              </div>
            </div>
            <PreviewBar s={s} tpl={tpl} setS={setS} isCarousel={isCarousel}/>
          </div>
        </main>
      </div>
      {toast && <div className="gh-mono" style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
        background:GH.orange, color:GH.ink, padding:'13px 22px', borderRadius:10, fontSize:13, fontWeight:700,
        letterSpacing:'.04em', zIndex:50, boxShadow:'0 12px 40px rgba(0,0,0,.5)' }}>{toast}</div>}
      {busy && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:60,
        display:'grid', placeItems:'center' }}>
        <span className="gh-pixel" style={{ color:GH.orange, fontSize:16 }}>GERANDO…</span></div>}
    </div>
  );
}

function GridDots(){
  return <div style={{ position:'absolute', inset:0, opacity:.5,
    backgroundImage:`radial-gradient(${GH.lineSoft} 1px, transparent 1.5px)`, backgroundSize:'30px 30px' }}/>;
}

/* ---- top bar ---- */
function TopBar({ s, tpl, tag, busy, onExport, onExportAll }){
  return (
    <header style={{ height:64, flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 22px', background:GH.panel, borderBottom:`1px solid ${GH.lineSoft}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <img src="assets/mark-orange.png" alt="" style={{ height:30 }}/>
        <div style={{ borderLeft:`1px solid ${GH.lineSoft}`, paddingLeft:14 }}>
          <div className="gh-pixel" style={{ color:GH.white, fontSize:12, letterSpacing:'.02em' }}>CREATIVE STUDIO</div>
          <div className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.18em', marginTop:3 }}>AUTOMAÇÃO DE CRIATIVOS</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.08em' }}>
          {tpl.w}×{tpl.h} · {tpl.ratio}</span>
        <span className="gh-mono" style={{ display:'inline-flex', alignItems:'center', gap:7, color:tag.color,
          fontSize:11, fontWeight:700, border:`1px solid ${tag.color}`, padding:'6px 11px', borderRadius:7 }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:tag.color }}/>{tag.label}</span>
        {s.template==='carousel' &&
          <button onClick={onExportAll} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
            background:'transparent', color:GH.white, border:`1px solid ${GH.lineSoft}`, padding:'9px 14px',
            borderRadius:8, fontSize:12, fontWeight:700 }}>↓ TODAS</button>}
        <button onClick={onExport} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
          background:GH.orange, color:GH.ink, border:'none', padding:'10px 18px', borderRadius:8,
          fontSize:12, fontWeight:700, letterSpacing:'.04em' }}>↓ EXPORTAR PNG</button>
      </div>
    </header>
  );
}

/* ---- preview footer: page nav + caption ---- */
function PreviewBar({ s, tpl, setS, isCarousel }){
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, marginTop:18 }}>
      {isCarousel && <>
        <NavArr dir="‹" dis={s.current<=0} onClick={()=>setS(p=>({...p,current:Math.max(0,p.current-1)}))}/>
        <div style={{ display:'flex', gap:7 }}>
          {Array.from({length:s.pageCount}).map((_,i)=>(
            <button key={i} onClick={()=>setS(p=>({...p,current:i}))} title={i===0?'Capa':'Página '+(i+1)}
              style={{ width:i===s.current?26:10, height:10, borderRadius:99, cursor:'pointer', border:'none',
                background:i===s.current?GH.orange:'#3a3531', transition:'all .15s' }}/>
          ))}
        </div>
        <NavArr dir="›" dis={s.current>=s.pageCount-1} onClick={()=>setS(p=>({...p,current:Math.min(p.pageCount-1,p.current+1)}))}/>
      </>}
      <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.1em',
        marginLeft:isCarousel?8:0 }}>
        {isCarousel ? (s.current===0?'CAPA':'PÁGINA '+(s.current+1)) : 'PREVIEW'} · {tpl.ratio}
      </span>
    </div>
  );
}
function NavArr({ dir, onClick, dis }){
  return <button onClick={dis?undefined:onClick} style={{ cursor:dis?'default':'pointer', width:34, height:34,
    borderRadius:'50%', border:`1px solid ${GH.lineSoft}`, background:GH.panel, color:dis?GH.mut2:GH.white,
    fontSize:20, lineHeight:1, opacity:dis?.4:1 }}>{dir}</button>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
