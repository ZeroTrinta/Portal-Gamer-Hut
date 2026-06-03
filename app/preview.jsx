/* ============================================================
   GAMER HUT — Post Preview Renderers
   Every stage renders at NATIVE resolution (1080 × H).
   The editor scales it down with CSS transform for preview,
   and exports the unscaled node for pixel-perfect PNGs.
   ============================================================ */
const { useMemo } = React;

/* ---------- shared atoms ---------- */

function Mark({ color='orange', h=64, style={} }){
  return <img src={`assets/mark-${color}.png`} alt="" draggable="false"
    style={{ height:h, width:'auto', display:'block', ...style }} />;
}
function Lockup({ color='white', h=58, style={} }){
  return <img src={`assets/logo-${color}.png`} alt="Gamer Hut" draggable="false"
    style={{ height:h, width:'auto', display:'block', ...style }} />;
}

function Seal({ tag, big=false }){
  return (
    <span className="gh-pixel" style={{
      display:'inline-flex', alignItems:'center', gap:big?14:10,
      background:tag.color, color:tag.ink,
      padding: big?'16px 26px':'12px 18px',
      fontSize: big?28:20, lineHeight:1, letterSpacing:'.02em',
      borderRadius:4, boxShadow:`0 0 0 4px rgba(0,0,0,.18)`,
    }}>
      <span style={{ width:big?14:10, height:big?14:10, background:tag.ink, borderRadius:'50%' }}/>
      {tag.label}
    </span>
  );
}

function Eyebrow({ text, color, size=26, light=false }){
  if(!text) return null;
  const c = color;
  return (
    <div className="gh-mono" style={{
      display:'flex', alignItems:'center', gap:18, color:c,
      fontSize:size, fontWeight:700, letterSpacing:'.34em', textTransform:'uppercase'
    }}>
      <span style={{ width:54, height:3, background:c, display:'block' }}/>
      <span>{text}</span>
    </div>
  );
}

function Scrim({ from='rgba(0,0,0,.92)', h='62%' }){
  return <div style={{ position:'absolute', left:0, right:0, bottom:0, height:h,
    background:`linear-gradient(0deg, ${from} 0%, rgba(0,0,0,.55) 38%, transparent 100%)` }}/>;
}

function PatternLayer({ kind, accent, base }){
  if(kind==='solid') return null;
  return <div style={{ position:'absolute', inset:0, pointerEvents:'none', ...patternStyle(kind, accent, base) }}/>;
}

function ImageOrSlot({ src, label='ARRASTE A IMAGEM DO JOGO', style={} }){
  if(src) return <img src={src} alt="" draggable="false"
    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', ...style }}/>;
  return (
    <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center',
      background:`repeating-linear-gradient(135deg,#171513 0 22px,#1c1916 22px 44px)`, ...style }}>
      <div className="gh-mono" style={{ color:'#6c655f', fontSize:24, letterSpacing:'.12em',
        textAlign:'center', padding:'0 40px' }}>↑<br/>{label}</div>
    </div>
  );
}

/* ---------- A · BLOCK POST (4:5) ---------- */
function BlockBody({ s, tag }){
  const fill = s.fill;
  const base = fill ? tag.color : GH.bg;
  const auto = fill ? readableOn(tag.color) : GH.white;
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const accent = fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color;
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      <PatternLayer kind={s.pattern} accent={fill?readableOn(tag.color):tag.color} base={base}/>
      <div style={{ position:'absolute', inset:0, padding:'76px 76px 200px',
        display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
          <Mark color={s.ink&&s.ink!=='auto' ? ink.logo : (fill?(readableOn(tag.color)==='#0B0B0A'?'black':'white'):'orange')} h={56}/>
        </div>
        <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:30 }}>
          <Eyebrow text={s.eyebrow} color={accent}/>
          <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||128,
            lineHeight:.92, letterSpacing:'-.02em', textWrap:'balance' }}>{s.title}</h1>
          {s.subtitle && <p className="gh-mono" style={{ margin:0, color:txt, opacity:.82,
            fontSize:30, lineHeight:1.45, maxWidth:760, letterSpacing:'.01em' }}>{s.subtitle}</p>}
        </div>
        <LogoFooter colorOverride={s.ink&&s.ink!=='auto'?ink.logo:null} dark={readableOn(base)==='#0B0B0A'}/>
      </div>
    </div>
  );
}

/* ---------- B · IMAGE POST (4:5) ---------- */
function ImageBody({ s, tag }){
  const ink = resolveInk(s.ink, '#F4F1EC');
  const txt = ink.text;
  const logoCol = (s.ink && s.ink!=='auto') ? ink.logo : 'white';
  return (
    <div style={{ position:'absolute', inset:0, background:GH.bg, overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image}/></div>
      <Scrim from="rgba(0,0,0,.94)" h="66%"/>
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'64px 64px 0',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Seal tag={tag}/>
        {s.priceLabel && <span className="gh-pixel" style={{ background:'rgba(11,11,10,.82)',
          color:GH.white, padding:'14px 18px', fontSize:22, borderRadius:4,
          boxShadow:`inset 0 0 0 2px ${tag.color}` }}>{s.priceLabel}</span>}
      </div>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 64px 150px',
        display:'flex', flexDirection:'column', gap:26 }}>
        <Eyebrow text={s.eyebrow} color={tag.color}/>
        <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||104,
          lineHeight:.94, letterSpacing:'-.02em', textWrap:'balance' }}>{s.title}</h1>
        {s.subtitle && <div style={{ borderLeft:`6px solid ${tag.color}`, paddingLeft:24 }}>
          <p className="gh-body" style={{ margin:0, color:txt, fontSize:30, lineHeight:1.45,
            maxWidth:840 }}>{s.subtitle}</p>
        </div>}
      </div>
      <LogoFooter onImage colorOverride={(s.ink&&s.ink!=='auto')?logoCol:null}/>
    </div>
  );
}

/* ---------- C · CAROUSEL ---------- */
function CarouselBody({ s, tag, pageIndex }){
  if(pageIndex===0) return <CoverBody s={s} tag={tag} arrastar/>;
  const pg = s.pages[pageIndex-1] || {};
  return (
    <div style={{ position:'absolute', inset:0, background:GH.bg, overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={pg.image} label={`IMAGEM · PÁG ${pageIndex+1}`}/></div>
      <Scrim from="rgba(0,0,0,.95)" h="70%"/>
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'60px 64px 0',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Seal tag={tag}/>
        <span className="gh-pixel" style={{ color:tag.color, fontSize:28,
          background:'rgba(11,11,10,.6)', padding:'12px 16px', borderRadius:4 }}>
          {String(pageIndex+1).padStart(2,'0')}/{String(s.pageCount).padStart(2,'0')}</span>
      </div>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 64px 150px',
        display:'flex', flexDirection:'column', gap:24 }}>
        <h2 className="gh-display" style={{ margin:0, color:GH.white, fontSize:78, lineHeight:.96,
          letterSpacing:'-.02em', textWrap:'balance' }}>{pg.title}</h2>
        {pg.body && <div style={{ background:'rgba(11,11,10,.72)', borderLeft:`8px solid ${tag.color}`,
          padding:'28px 30px' }}>
          <p className="gh-body" style={{ margin:0, color:GH.white, fontSize:31, lineHeight:1.5 }}>{pg.body}</p>
        </div>}
      </div>
      <LogoFooter onImage/>
    </div>
  );
}

/* Cover (carousel pg1 + reels share this) */
function CoverBody({ s, tag, arrastar=false, safe=false, exporting=false }){
  const hasImg = safe && !!s.image;            // reels supports an uploaded image bg
  const base = hasImg ? GH.bg : (s.fill ? tag.color : GH.bg);
  const auto = hasImg ? '#F4F1EC' : (s.fill ? readableOn(tag.color) : GH.white);
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const logoCol = (s.ink && s.ink!=='auto') ? ink.logo : (hasImg ? 'white' : (s.fill?(readableOn(tag.color)==='#0B0B0A'?'black':'white'):'white'));
  const accent = hasImg ? tag.color : (s.fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color);
  const pad = safe ? '300px 76px' : '70px 76px';
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      {hasImg
        ? <><div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image}/></div><Scrim from="rgba(0,0,0,.92)" h="70%"/></>
        : <PatternLayer kind={s.pattern==='solid'?'8bit':s.pattern} accent={s.fill?readableOn(tag.color):tag.color} base={base}/>}
      {safe && s.showSafe && !exporting && <SafeGuide/>}
      <div style={{ position:'absolute', inset:0, padding:pad, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Lockup color={logoCol} h={62}/>
          {s.badge && <span className="gh-pixel" style={{ background:GH.ink, color:tag.color,
            padding:'14px 20px', fontSize:22, borderRadius:4, display:'inline-flex', gap:10, alignItems:'center' }}>
            <span style={{ width:10, height:10, background:tag.color, borderRadius:'50%' }}/>{s.badge}</span>}
        </div>
        <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:34 }}>
          <Eyebrow text={s.eyebrow} color={accent}/>
          <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||136,
            lineHeight:.9, letterSpacing:'-.025em', textWrap:'balance' }}>{s.title}</h1>
          {s.subtitle && <div style={{ display:'flex' }}>
            <span className="gh-display" style={{ background: s.fill?GH.ink:tag.color, color: s.fill?tag.color:tag.ink,
              padding:'10px 22px', borderRadius:8, fontSize:46, lineHeight:1.05, whiteSpace:'nowrap' }}>{s.subtitle}</span>
          </div>}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:64 }}>
          {arrastar
            ? <span className="gh-display" style={{ background:txt, color:base, padding:'20px 34px',
                fontSize:36, borderRadius:8, letterSpacing:'.01em', whiteSpace:'nowrap' }}>{s.cta||'ARRASTA PRO LADO'} →</span>
            : <span/>}
          {s.footer && <span className="gh-mono" style={{ color:txt, opacity:.78, fontSize:26,
            fontWeight:700, letterSpacing:'.1em', textAlign:'right', lineHeight:1.4, textTransform:'uppercase' }}>{s.footer}</span>}
        </div>
        {/* covers/reels carry the lockup top-left, so no redundant bottom logo */}
      </div>
    </div>
  );
}

/* ---------- D · REELS (9:16) ---------- */
function ReelsBody({ s, tag, exporting }){
  return <CoverBody s={s} tag={tag} safe exporting={exporting}/>;
}

/* ---------- shared footer logo (brand rule: bottom-center) ---------- */
function LogoFooter({ dark=false, onImage=false, colorOverride=null }){
  const col = colorOverride || (onImage ? 'white' : (dark ? 'black' : 'white'));
  return (
    <div style={{ position:'absolute', left:0, right:0, bottom:54, display:'flex', justifyContent:'center' }}>
      <Lockup color={col} h={46} style={{ opacity:onImage?.96:.92 }}/>
    </div>
  );
}

function SafeGuide(){
  return (
    <div style={{ position:'absolute', left:0, right:0, top:285, height:1350, pointerEvents:'none',
      boxShadow:'inset 0 0 0 3px rgba(244,241,236,.55)' }}>
      <span className="gh-mono" style={{ position:'absolute', top:-38, left:0, color:'rgba(244,241,236,.7)',
        fontSize:22, letterSpacing:'.1em' }}>— SAFE ZONE · 4:5 —</span>
    </div>
  );
}

/* ---------- master stage ---------- */
function PostStage({ s, pageIndex=0, stageRef, exporting=false }){
  const tpl = TEMPLATES.find(t=>t.id===s.template);
  const tag = TAGS.find(t=>t.id===s.tagId) || TAGS[0];
  let body;
  if(s.template==='block')    body = <BlockBody s={s} tag={tag}/>;
  else if(s.template==='image') body = <ImageBody s={s} tag={tag}/>;
  else if(s.template==='carousel') body = <CarouselBody s={s} tag={tag} pageIndex={pageIndex}/>;
  else body = <ReelsBody s={s} tag={tag} exporting={exporting}/>;
  return (
    <div ref={stageRef} data-stage style={{ width:tpl.w, height:tpl.h, position:'relative',
      overflow:'hidden', flex:'none', background:GH.bg }}>
      {body}
    </div>
  );
}

Object.assign(window, { PostStage });
