/* ============================================================
   GAMER HUT — Creative Studio · App Shell
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

const DEFAULT_STATE = {
  template:'carousel', tagId:'lancamento', pattern:'8bit', fill:true, ink:'auto', format:'feed',
  eyebrow:'DIRETO DA SONY',
  title:'A PRIMEIRA EXCLUSIVIDADE DA GAMER HUT',
  subtitle:'neste post', badge:'STATE OF PLAY', cta:'ARRASTA PRO LADO',
  accentWord:'',
  footer:'MÍDIA FÍSICA\nNEVER DIES', priceLabel:'R$ 349 · LACRADO',
  titleSize:108, image:null, pageCount:4, current:0, patternOpacity:100, videoAudio:true,
  pages:[
    { title:'DRAGON QUEST XII', body:'Depois de 5 anos sem novidades, a Square Enix revelou oficialmente Beyond Dreams.', image:null },
    { title:'40 ANOS DE FRANQUIA', body:'O anúncio veio durante a celebração dos 40 anos da série.', image:null },
    { title:'JÁ NA PRÉ-VENDA', body:'Garanta sua mídia física lacrada aqui na Gamer Hut.', image:null },
    { title:'', body:'', image:null },
  ],
  showSafe:true,
  // QUIZ
  quizMode:'pergunta',
  question:'QUAL É O MELHOR JOGO DE 2024?',
  quizOptions:['ELDEN RING: SOTE','ASTRO BOT','FINAL FANTASY VII REBIRTH','BLACK MYTH: WUKONG'],
  answer:-1, hideOptions:false,
  aLabel:'PLAYSTATION', bLabel:'XBOX', aImg:null, bImg:null, vsWord:'OU',
  // RANKING
  rankCount:5,
  rankItems:[
    { name:'ELDEN RING: SHADOW OF THE ERDTREE', note:'RPG' },
    { name:'ASTRO BOT', note:'PLATAFORMA' },
    { name:'FINAL FANTASY VII REBIRTH', note:'RPG' },
    { name:'SILENT HILL 2', note:'TERROR' },
    { name:'METAL GEAR SOLID Δ', note:'AÇÃO' },
    { name:'', note:'' },
  ],
  // NOVIDADES DA SEMANA (grid de chegadas)
  arrivalCount:4,
  arrivals:[
    { name:'SILENT HILL 2', console:'PS5', image:null },
    { name:'ASTRO BOT', console:'PS5', image:null },
    { name:'FINAL FANTASY VII REBIRTH', console:'PS5', image:null },
    { name:'METAL GEAR SOLID Δ', console:'PS5 · XBOX', image:null },
    { name:'', console:'', image:null },
    { name:'', console:'', image:null },
  ],
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
  quiz:     { template:'quiz', tagId:'quiz', pattern:'8bit', fill:false, ink:'auto', eyebrow:'RESPONDE AÍ',
              quizMode:'pergunta', titleSize:80 },
  ranking:  { template:'ranking', tagId:'review', pattern:'grid', fill:false, ink:'auto', eyebrow:'TOP DA SEMANA',
              title:'OS 5 MAIS VENDIDOS', titleSize:96 },
  arrivals: { template:'arrivals', tagId:'restoque', pattern:'8bit', fill:false, ink:'auto', eyebrow:'CHEGOU NA LOJA',
              title:'NOVIDADES DA SEMANA', titleSize:84 },
  thumb:    { template:'thumb', tagId:'review', pattern:'8bit', fill:false, ink:'auto', eyebrow:'ANÁLISE COMPLETA',
              title:'VALE A PENA?', accentWord:'EM 2025', subtitle:'', badge:'EXCLUSIVO GAMER HUT', priceLabel:'',
              titleSize:150 },
};

function loadState(){
  try{ const r = localStorage.getItem('gh-studio'); if(r) return { ...DEFAULT_STATE, ...JSON.parse(r) }; }catch(e){}
  return DEFAULT_STATE;
}

function App(){
  const [s, setS] = useState(loadState);
  const [scale, setScale] = useState(0.4);
  const [busy, setBusy] = useState(false);
  const [vidProg, setVidProg] = useState({ p:0, r:0 });
  const [toast, setToast] = useState(null);
  const stageRef = useRef(null);
  const viewRef  = useRef(null);
  const recStopRef = useRef(null);

  const set = useCallback((patch)=> setS(p=>({ ...p, ...patch })), []);
  useEffect(()=>{ try{
    const safe = { ...s, pages: (s.pages||[]).map(p=>{ const { video, ...rest } = p; return rest; }) };
    localStorage.setItem('gh-studio', JSON.stringify(safe));
  }catch(e){} }, [s]);

  const tpl = TEMPLATES.find(t=>t.id===s.template);
  const tag = TAGS.find(t=>t.id===s.tagId) || TAGS[0];
  const isCarousel = s.template==='carousel';
  const onCover = !isCarousel || s.current===0;
  const pageIdx = isCarousel ? s.current : 0;
  const dims = stageDims(s, pageIdx);
  const curPageObj = isCarousel && s.current>0 ? (s.pages[s.current-1]||null) : null;
  const isVideoPage = !!(curPageObj && curPageObj.type==='video');

  // fit-to-view scaling
  useEffect(()=>{
    const fit = ()=>{
      const el = viewRef.current; if(!el) return;
      const availW = el.clientWidth - 96, availH = el.clientHeight - 120;
      setScale(Math.min(availW/dims.w, availH/dims.h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit); if(viewRef.current) ro.observe(viewRef.current);
    return ()=>ro.disconnect();
  }, [dims.w, dims.h]);

  // switching template applies a tasteful preset (keeps tag/content where possible)
  const pickTemplate = (id)=>{
    if(id===s.template) return;
    const p = PRESETS[id];
    if(p) set({ ...p, current:0 }); else set({ template:id, current:0 });
  };

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
      flashToast('PNG exportado · '+dims.w+'×'+dims.h);
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

  // ---- VIDEO export (canvas compositor + MediaRecorder) --------------------
  function exportVideo(){
    const pageIndex = s.current;
    const pg = (s.pages||[])[pageIndex-1];
    if(!isVideoPage || !pg){ flashToast('Abra uma página de vídeo'); return; }
    if(!pg.video){ flashToast('Envie o trailer no card primeiro'); return; }
    if(typeof MediaRecorder==='undefined'){ flashToast('Navegador não suporta gravar vídeo'); return; }
    const W=1080, H=1350;
    const vtag = TAGS.find(t=>t.id===s.tagId) || TAGS[0];
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H;
    const ctx = canvas.getContext('2d');
    const bgImg  = pg.image ? Object.assign(new Image(), { src:pg.image }) : null;
    const logoImg = Object.assign(new Image(), { src:'assets/logo-white.png' });
    const vid = document.createElement('video');
    vid.src = pg.video; vid.playsInline = true; vid.muted = true; vid.loop = false; vid.preload = 'auto';

    // audio routed through WebAudio so it's captured but NOT sent to speakers
    const wantAudio = s.videoAudio !== false;
    let ac=null, dest=null;
    if(wantAudio){
      try{
        const AC = window.AudioContext || window.webkitAudioContext;
        if(AC){ ac = new AC(); const node = ac.createMediaElementSource(vid);
          dest = ac.createMediaStreamDestination(); node.connect(dest);
          if(ac.state==='suspended') ac.resume(); }
      }catch(e){ console.warn('sem áudio na exportação', e); }
    }

    const stream = canvas.captureStream(30);
    if(dest) dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const hasAudio = !!dest;
    // Prefer MP4/H.264 (+AAC) so the file plays on Windows & uploads to Instagram.
    // Only fall back to WebM (Opus audio) when the browser can't record MP4.
    const mp4  = hasAudio
      ? ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=h264,aac','video/mp4']
      : ['video/mp4;codecs=avc1.42E01E','video/mp4;codecs=h264','video/mp4'];
    const webm = hasAudio
      ? ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
      : ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    const mime = [...mp4, ...webm]
      .find(m=>{ try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } }) || '';
    let rec;
    try{ rec = new MediaRecorder(stream, mime?{ mimeType:mime, videoBitsPerSecond:9000000 }:undefined); }
    catch(e){ rec = new MediaRecorder(stream); }
    const chunks = []; rec.ondataavailable = e=>{ if(e.data && e.data.size) chunks.push(e.data); };
    let stopped=false, capTimer=0, ticker=null, raf=0;
    const stopTicker = ()=>{ if(ticker){ try{ ticker.postMessage('stop'); ticker.terminate(); }catch(e){} ticker=null; } cancelAnimationFrame(raf); };
    const onVis = ()=>{ try{ if(ac && ac.state==='suspended') ac.resume(); }catch(e){}
      try{ if(!stopped && vid.paused) vid.play().catch(()=>{}); }catch(e){} };
    const finish = ()=>{ if(stopped) return; stopped=true; clearTimeout(capTimer);
      stopTicker(); document.removeEventListener('visibilitychange', onVis);
      try{ vid.pause(); }catch(e){} try{ rec.stop(); }catch(e){} };
    recStopRef.current = finish;
    document.addEventListener('visibilitychange', onVis);
    rec.onstop = ()=>{
      const ext = (mime||'').includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mime || 'video/webm' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `gamerhut-trailer-p${pageIndex+1}.${ext}`);
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
      try{ stream.getTracks().forEach(t=>t.stop()); }catch(e){}
      try{ ac && ac.close(); }catch(e){}
      recStopRef.current = null; setBusy(false);
      if(ext==='mp4') flashToast('Vídeo MP4 exportado · compatível');
      else if(hasAudio) flashToast('WEBM exportado · áudio Opus — desligue o som p/ tocar no Windows/Insta');
      else flashToast('WEBM (sem áudio) exportado');
    };
    const drawFrame = ()=>{
      if(stopped) return;
      drawVideoComposite(ctx, W, H, { s, pg, tag:vtag, pageIndex, vid, bgImg, logoImg });
      if(vid.duration && isFinite(vid.duration)){
        const p = Math.min(100, Math.round((vid.currentTime/vid.duration)*100));
        const r = Math.max(0, Math.ceil(vid.duration - vid.currentTime));
        setVidProg(prev => prev.p===p ? prev : { p, r });
      }
    };
    // Background-proof clock: a Web Worker ticks ~30fps even when the tab is
    // hidden (rAF + page timers throttle in background; Workers don't). Falls back to rAF.
    const startTicker = ()=>{
      try{
        const code = 'let id;onmessage=function(e){if(e.data==="stop"){clearInterval(id);}else{clearInterval(id);id=setInterval(function(){postMessage(0);},e.data);}};';
        ticker = new Worker(URL.createObjectURL(new Blob([code], { type:'application/javascript' })));
        ticker.onmessage = drawFrame;
        ticker.postMessage(1000/30);
      }catch(e){
        const loop = ()=>{ if(stopped) return; drawFrame(); raf = requestAnimationFrame(loop); };
        loop();
      }
    };
    vid.onloadedmetadata = ()=>{
      const duration = vid.duration && isFinite(vid.duration) ? vid.duration : 120;
      capTimer = setTimeout(finish, (duration + 3) * 1000);
    };
    setVidProg({ p:0, r:0 });
    setBusy('vídeo');
    vid.onended = finish;
    vid.play().then(()=>{
      if(wantAudio && ac && ac.state==='suspended') ac.resume();
      try{ rec.start(250); }catch(e){ console.error(e); }
      drawFrame();
      startTicker();
    }).catch(err=>{
      console.error('play falhou', err);
      recStopRef.current = null; setBusy(false);
      flashToast('Não foi possível reproduzir o trailer');
    });
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:GH.bg2, overflow:'hidden' }}>
      <TopBar s={s} dims={dims} tag={tag} busy={busy} isVideoPage={isVideoPage}
        onExport={exportCurrent} onExportAll={exportAll} onExportVideo={exportVideo}/>
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
            <div style={{ width:dims.w*scale, height:dims.h*scale, position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, transform:`scale(${scale})`,
                transformOrigin:'top left', boxShadow:'0 40px 120px rgba(0,0,0,.6)' }}>
                <PostStage s={s} pageIndex={pageIdx} stageRef={stageRef}/>
              </div>
            </div>
            <PreviewBar s={s} dims={dims} setS={setS} isCarousel={isCarousel}/>
          </div>
        </main>
      </div>
      {toast && <div className="gh-mono" style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
        background:GH.orange, color:GH.ink, padding:'13px 22px', borderRadius:10, fontSize:13, fontWeight:700,
        letterSpacing:'.04em', zIndex:50, boxShadow:'0 12px 40px rgba(0,0,0,.5)' }}>{toast}</div>}
      {busy && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.62)', zIndex:60,
        display:'grid', placeItems:'center' }}>
        {busy==='vídeo'
          ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, textAlign:'center', padding:24 }}>
              <span style={{ width:16, height:16, borderRadius:'50%', background:'#E23B2E',
                boxShadow:'0 0 0 0 rgba(226,59,46,.6)', animation:'ghpulse 1.1s ease-out infinite' }}/>
              <span className="gh-pixel" style={{ color:GH.orange, fontSize:16 }}>GRAVANDO VÍDEO…</span>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:12, maxWidth:340, lineHeight:1.6 }}>
                Gravado em tempo real com o trailer no quadro da marca. Pode trocar de aba ou minimizar — a gravação continua em segundo plano.</span>
              <div style={{ width:320, maxWidth:'78vw' }}>
                <div style={{ height:9, borderRadius:99, background:'#2a2622', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:vidProg.p+'%', minWidth:vidProg.p>0?6:0, background:GH.orange,
                    borderRadius:99, transition:'width .25s linear' }}/>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:9 }}>
                  <span className="gh-pixel" style={{ color:GH.orange, fontSize:12 }}>{vidProg.p}%</span>
                  <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.04em' }}>
                    {vidProg.p>=100 ? 'FINALIZANDO…' : (vidProg.r>0 ? '~'+vidProg.r+'s RESTANTES' : 'PREPARANDO…')}</span>
                </div>
              </div>
              <button onClick={()=>recStopRef.current && recStopRef.current()} className="gh-mono" style={{ cursor:'pointer',
                background:GH.orange, color:GH.ink, border:'none', padding:'11px 20px', borderRadius:8,
                fontSize:12, fontWeight:700, letterSpacing:'.04em' }}>■ PARAR E SALVAR</button>
              <style>{`@keyframes ghpulse{0%{box-shadow:0 0 0 0 rgba(226,59,46,.55)}70%{box-shadow:0 0 0 16px rgba(226,59,46,0)}100%{box-shadow:0 0 0 0 rgba(226,59,46,0)}}`}</style>
            </div>
          : <span className="gh-pixel" style={{ color:GH.orange, fontSize:16 }}>GERANDO…</span>}
      </div>}
    </div>
  );
}

function GridDots(){
  return <div style={{ position:'absolute', inset:0, opacity:.5,
    backgroundImage:`radial-gradient(${GH.lineSoft} 1px, transparent 1.5px)`, backgroundSize:'30px 30px' }}/>;
}

/* ---- top bar ---- */
function TopBar({ s, dims, tag, busy, isVideoPage, onExport, onExportAll, onExportVideo }){
  return (
    <header style={{ height:64, flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 22px', background:GH.panel, borderBottom:`1px solid ${GH.lineSoft}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <a href="index.html" title="Voltar ao Portal Gamer Hut" style={{ display:'inline-flex', alignItems:'center' }}>
          <img src="assets/mark-orange.png" alt="Portal" style={{ height:30, cursor:'pointer' }}/>
        </a>
        <div style={{ borderLeft:`1px solid ${GH.lineSoft}`, paddingLeft:14 }}>
          <div className="gh-pixel" style={{ color:GH.white, fontSize:12, letterSpacing:'.02em' }}>CREATIVE STUDIO</div>
          <div className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.18em', marginTop:3 }}>AUTOMAÇÃO DE CRIATIVOS</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.08em' }}>
          {dims.w}×{dims.h} · {dims.ratio}</span>
        <span className="gh-mono" style={{ display:'inline-flex', alignItems:'center', gap:7, color:tag.color,
          fontSize:11, fontWeight:700, border:`1px solid ${tag.color}`, padding:'6px 11px', borderRadius:7 }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:tag.color }}/>{tag.label}</span>
        {isVideoPage
          ? <>
              <button onClick={onExport} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
                background:'transparent', color:GH.white, border:`1px solid ${GH.lineSoft}`, padding:'9px 14px',
                borderRadius:8, fontSize:12, fontWeight:700 }}>↓ CAPA PNG</button>
              <button onClick={onExportVideo} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
                background:GH.orange, color:GH.ink, border:'none', padding:'10px 18px', borderRadius:8,
                fontSize:12, fontWeight:700, letterSpacing:'.04em' }}>● EXPORTAR VÍDEO</button>
            </>
          : <>
              {s.template==='carousel' &&
                <button onClick={onExportAll} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
                  background:'transparent', color:GH.white, border:`1px solid ${GH.lineSoft}`, padding:'9px 14px',
                  borderRadius:8, fontSize:12, fontWeight:700 }}>↓ TODAS</button>}
              <button onClick={onExport} disabled={busy} className="gh-mono" style={{ cursor:'pointer',
                background:GH.orange, color:GH.ink, border:'none', padding:'10px 18px', borderRadius:8,
                fontSize:12, fontWeight:700, letterSpacing:'.04em' }}>↓ EXPORTAR PNG</button>
            </>}
      </div>
    </header>
  );
}

/* ---- preview footer: page nav + caption ---- */
function PreviewBar({ s, dims, setS, isCarousel }){
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
        {isCarousel ? (s.current===0?'CAPA':'PÁGINA '+(s.current+1)) : 'PREVIEW'} · {dims.ratio}
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
