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

/* Full-frame fade for content-heavy templates (quiz/ranking) whose text spans
   top→bottom over a background photo. Darkens the whole image evenly, a touch
   heavier at the edges, so titles + rows + options all stay legible. */
function FullScrim({ strength=0.62 }){
  const a = strength, mid = Math.max(0, strength-0.18);
  return <div style={{ position:'absolute', inset:0, pointerEvents:'none',
    background:`linear-gradient(180deg, rgba(0,0,0,${a+0.16}) 0%, rgba(0,0,0,${mid}) 26%, rgba(0,0,0,${mid}) 60%, rgba(0,0,0,${a+0.22}) 100%)` }}/>;
}

/* blur % (0–100) → px radius. The slight scale hides the transparent halo the
   CSS blur leaves at the image edges (container clips the overflow). */
function blurPx(pct){ return Math.max(0, (+pct||0)) * 0.32; }

function PatternLayer({ kind, accent, base, opacity }){
  if(kind==='solid') return null;
  const st = patternStyle(kind, accent, base);
  if(opacity!=null){
    const baseOp = st.opacity!=null ? st.opacity : 1;
    st.opacity = baseOp * (Math.max(0, Math.min(100, opacity))/100);
  }
  return <div style={{ position:'absolute', inset:0, pointerEvents:'none', ...st }}/>;
}

function ImageOrSlot({ src, label='ARRASTE A IMAGEM DO JOGO', style={}, blur=0 }){
  if(src){
    const r = blurPx(blur);
    const fx = r>0 ? { filter:`blur(${r.toFixed(1)}px)`, transform:`scale(${(1 + r/300).toFixed(3)})` } : {};
    return <img src={src} alt="" draggable="false"
      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', ...fx, ...style }}/>;
  }
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
  const customBg = s.blockBg || null;             // overrides tag/dark bg entirely
  const base = customBg || (fill ? tag.color : GH.bg);
  const auto = readableOn(base);
  const ink = resolveInk(s.ink, auto);
  const txt = s.blockInk || ink.text;             // custom text color wins
  const patAccent = customBg ? readableOn(base) : (fill?readableOn(tag.color):tag.color);
  const accent = s.blockInk || (customBg ? readableOn(base)
    : (fill ? (ink.text==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color));
  const logoCol = (s.blockInk || (s.ink&&s.ink!=='auto')) ? (readableOn(base)==='#0B0B0A'?'black':'white')
    : (customBg ? (readableOn(base)==='#0B0B0A'?'black':'white')
      : (fill ? (readableOn(tag.color)==='#0B0B0A'?'black':'white') : 'orange'));
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      <PatternLayer kind={s.pattern} accent={patAccent} base={base} opacity={s.patternOpacity}/>
      <div style={{ position:'absolute', inset:0, padding:'76px 76px 150px',
        display:'flex', flexDirection:'column' }}>
        <div style={{ flex:'none', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
          <Mark color={logoCol} h={56}/>
        </div>
        <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column',
          justifyContent:'center', gap:30 }}>
          <Eyebrow text={s.eyebrow} color={accent}/>
          <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||128,
            lineHeight:.92, letterSpacing:'-.02em', textWrap:'balance' }}>{s.title}</h1>
          {s.subtitle && <p className="gh-mono" style={{ margin:0, color:txt, opacity:.82,
            fontSize:30, lineHeight:1.45, maxWidth:760, letterSpacing:'.01em' }}>{s.subtitle}</p>}
        </div>
        <LogoFooter colorOverride={logoCol} dark={readableOn(base)==='#0B0B0A'}/>
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
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image} blur={s.imageBlur}/></div>
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

/* ---------- C2 · VIDEO TRAILER SLIDE (carousel page type) ----------
   Full-bleed game art + centered title + a floating card that PLAYS the
   uploaded trailer in the live preview. On export (PNG) the card renders a
   clean poster frame — the perfect cover thumbnail for the video slide. */
function SpeakerIcon({ muted }){
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" stroke="none"/>
      {muted
        ? <path d="M17 9 L22 15 M22 9 L17 15"/>
        : <path d="M17 8.5 a5 5 0 0 1 0 7 M19.5 6 a8.5 8.5 0 0 1 0 12"/>}
    </svg>
  );
}

function VideoCard({ src, tag, exporting }){
  const vref = useRef(null);
  const [muted, setMuted] = useState(true);
  const toggle = ()=>{
    const v = vref.current; if(!v) return;
    v.muted = !v.muted; setMuted(v.muted);
    if(!v.muted){ const p=v.play(); if(p&&p.catch) p.catch(()=>{}); }
  };
  const shell = {
    position:'relative', width:'100%', height:'100%', borderRadius:30, overflow:'hidden',
    background:'#0C0C0B', boxShadow:`0 34px 90px rgba(0,0,0,.6)`,
    border:`2px solid ${hexA(tag.color,0.85)}`,
  };
  // poster state: exporting, or no video uploaded yet
  if(exporting || !src){
    return (
      <div style={shell}>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(circle at 50% 42%, ${hexA(tag.color,0.20)} 0%, #0C0C0B 68%)` }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:26 }}>
          <div style={{ width:108, height:108, borderRadius:'50%', background:tag.color,
            display:'grid', placeItems:'center', boxShadow:`0 0 0 10px ${hexA(tag.color,0.18)}` }}>
            <span style={{ width:0, height:0, marginLeft:8,
              borderTop:'22px solid transparent', borderBottom:'22px solid transparent',
              borderLeft:`34px solid ${tag.ink}` }}/>
          </div>
          <span className="gh-pixel" style={{ color:GH.white, fontSize:22, letterSpacing:'.04em' }}>
            {src ? 'TRAILER' : 'ARRASTE O TRAILER (MP4)'}</span>
        </div>
      </div>
    );
  }
  return (
    <div style={shell}>
      <video ref={vref} src={src} autoPlay muted loop playsInline
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      <button onClick={toggle} aria-label={muted?'Ativar som':'Silenciar'} style={{
        position:'absolute', right:22, bottom:22, width:58, height:58, borderRadius:'50%',
        cursor:'pointer', border:'none', color:GH.white, display:'grid', placeItems:'center',
        background:'rgba(11,11,10,.62)', backdropFilter:'blur(4px)',
        boxShadow:`inset 0 0 0 2px ${hexA('#F4F1EC',0.35)}` }}>
        <SpeakerIcon muted={muted}/>
      </button>
    </div>
  );
}

function VideoBody({ s, tag, pg, pageIndex, exporting }){
  const accent = tag.color;
  const title  = pg.title || 'ASSISTA AO';
  const eyebrow = pg.eyebrow || 'VEM VER EM AÇÃO';
  return (
    <div style={{ position:'absolute', inset:0, background:GH.bg, overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0 }}>
        <ImageOrSlot src={pg.image} blur={pg.imageBlur} label={`ARTE DO JOGO (FUNDO) · PÁG ${pageIndex+1}`}/></div>
      <div style={{ position:'absolute', inset:0,
        background:'linear-gradient(180deg, rgba(8,8,7,.66) 0%, rgba(8,8,7,.40) 34%, rgba(8,8,7,.42) 60%, rgba(8,8,7,.82) 100%)' }}/>
      <div style={{ position:'absolute', inset:0, padding:'66px 70px 58px', display:'flex', flexDirection:'column' }}>
        {/* top row */}
        <div style={{ flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
          <span className="gh-pixel" style={{ color:tag.color, fontSize:28,
            background:'rgba(11,11,10,.6)', padding:'12px 16px', borderRadius:4 }}>
            {String(pageIndex+1).padStart(2,'0')}/{String(s.pageCount).padStart(2,'0')}</span>
        </div>
        {/* title block */}
        <div style={{ flexShrink:0, marginTop:28, textAlign:'center' }}>
          <div className="gh-mono" style={{ color:accent, fontSize:24, fontWeight:700,
            letterSpacing:'.34em', textTransform:'uppercase' }}>{eyebrow}</div>
          <h2 className="gh-display" style={{ margin:'14px 0 0', width:'100%', color:GH.white, fontSize:80,
            lineHeight:.96, letterSpacing:'-.02em', textTransform:'uppercase' }}>
            {title}{pg.accent ? <><br/><span style={{ color:accent }}>{pg.accent}</span></> : null}
          </h2>
        </div>
        {/* horizontal 16:9 trailer card, centered in remaining space */}
        <div style={{ flex:'1 1 0', minHeight:0, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'28px 0' }}>
          <div style={{ width:'100%', aspectRatio:'16 / 9' }}>
            <VideoCard src={pg.video} tag={tag} exporting={exporting}/>
          </div>
        </div>
        {/* footer */}
        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:22 }}>
          {pg.footer && <p className="gh-mono" style={{ margin:0, color:GH.white, fontSize:30,
            fontWeight:700, letterSpacing:'.03em', textAlign:'center', textWrap:'balance' }}>{pg.footer}</p>}
          <Lockup color="white" h={44} style={{ opacity:.96 }}/>
        </div>
      </div>
    </div>
  );
}

/* ---------- C · CAROUSEL ---------- */
function CarouselBody({ s, tag, pageIndex, exporting }){
  if(pageIndex===0) return <CoverBody s={s} tag={tag} arrastar/>;
  const pg = s.pages[pageIndex-1] || {};
  if(pg.type==='video') return <VideoBody s={s} tag={tag} pg={pg} pageIndex={pageIndex} exporting={exporting}/>;
  return (
    <div style={{ position:'absolute', inset:0, background:GH.bg, overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={pg.image} blur={pg.imageBlur} label={`IMAGEM · PÁG ${pageIndex+1}`}/></div>
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
  const hasImg = !!s.image;                    // carousel cover + reels both support an uploaded image bg
  const base = hasImg ? GH.bg : (s.fill ? tag.color : GH.bg);
  const auto = hasImg ? '#F4F1EC' : (s.fill ? readableOn(tag.color) : GH.white);
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const logoCol = (s.ink && s.ink!=='auto') ? ink.logo : (hasImg ? 'white' : (s.fill?(readableOn(tag.color)==='#0B0B0A'?'black':'white'):'white'));
  const accent = hasImg ? tag.color : (s.fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color);
  const pad = safe ? '300px 76px' : '70px 76px';
  const chipBg = hasImg ? tag.color : (s.fill?GH.ink:tag.color);
  const chipTx = hasImg ? tag.ink   : (s.fill?tag.color:tag.ink);
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      {hasImg
        ? <><div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image} blur={s.imageBlur}/></div><Scrim from="rgba(0,0,0,.92)" h="70%"/></>
        : <PatternLayer kind={s.pattern==='solid'?'8bit':s.pattern} accent={s.fill?readableOn(tag.color):tag.color} base={base} opacity={s.patternOpacity}/>}
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
            lineHeight:.9, letterSpacing:'-.025em', textWrap:'balance', overflowWrap:'anywhere' }}>{s.title}</h1>
          {s.subtitle && <div style={{ maxWidth:'100%' }}>
            <span className="gh-display" style={{ background:chipBg, color:chipTx,
              padding:'4px 18px', borderRadius:8, fontSize:46, lineHeight:1.42,
              WebkitBoxDecorationBreak:'clone', boxDecorationBreak:'clone',
              overflowWrap:'anywhere' }}>{s.subtitle}</span>
          </div>}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, marginTop:64 }}>
          {arrastar
            ? <span className="gh-display" style={{ background:txt, color:base, padding:'20px 34px',
                fontSize:36, borderRadius:8, letterSpacing:'.01em', whiteSpace:'nowrap', flex:'none' }}>{s.cta||'ARRASTA PRO LADO'} →</span>
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

/* ---------- D2 · YOUTUBE THUMBNAIL (16:9 · 1280×720) ----------
   Punchy video cover: full-bleed game art, oversized headline anchored
   bottom-left over a side+bottom fade, category seal + badge up top, a
   tag-colored highlight word, price chip + logo bottom-right. Falls back
   to a solid/pattern bg when no art is uploaded. */
function ThumbBody({ s, tag, exporting }){
  const hasImg = !!s.image;
  const base = hasImg ? GH.bg : (s.fill ? tag.color : GH.bg);
  const auto = hasImg ? '#F4F1EC' : (s.fill ? readableOn(tag.color) : GH.white);
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const accentCol = hasImg ? tag.color : (s.fill ? (txt==='#0B0B0A'?GH.ink:readableOn(tag.color)) : tag.color);
  const logoCol = (s.ink && s.ink!=='auto') ? ink.logo
    : (hasImg ? 'white' : (s.fill?(readableOn(tag.color)==='#0B0B0A'?'black':'white'):'white'));
  const sh = hasImg ? '0 6px 26px rgba(0,0,0,.62), 0 2px 5px rgba(0,0,0,.55)' : 'none';
  const chipTx = readableOn(accentCol);
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      {hasImg
        ? <>
            <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image} blur={s.imageBlur}/></div>
            <div style={{ position:'absolute', inset:0, pointerEvents:'none',
              background:'linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.6) 40%, rgba(0,0,0,.12) 70%, rgba(0,0,0,0) 100%)' }}/>
            <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'78%', pointerEvents:'none',
              background:'linear-gradient(0deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.3) 48%, transparent 100%)' }}/>
          </>
        : <PatternLayer kind={s.pattern==='solid'?'8bit':s.pattern} accent={s.fill?readableOn(tag.color):tag.color} base={base} opacity={s.patternOpacity}/>}
      <div style={{ position:'absolute', inset:0, padding:'50px 58px', display:'flex', flexDirection:'column',
        justifyContent:'space-between' }}>
        {/* top row — seal + badge */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag} big/>
          {s.badge && <span className="gh-pixel" style={{ background:GH.ink, color:tag.color,
            padding:'15px 22px', fontSize:24, borderRadius:5, display:'inline-flex', gap:11, alignItems:'center',
            boxShadow:'0 0 0 4px rgba(0,0,0,.18)' }}>
            <span style={{ width:12, height:12, background:tag.color, borderRadius:'50%' }}/>{s.badge}</span>}
        </div>
        {/* bottom row — headline left, price + logo right */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:32 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:'80%' }}>
            <Eyebrow text={s.eyebrow} color={accentCol} size={24}/>
            <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||150,
              lineHeight:.86, letterSpacing:'-.03em', textTransform:'uppercase', textWrap:'balance',
              textShadow:sh }}>{s.title}</h1>
            {s.accentWord && <div>
              <span className="gh-display" style={{ background:accentCol, color:chipTx, padding:'6px 20px',
                borderRadius:8, fontSize:Math.round((s.titleSize||150)*0.42), lineHeight:1.18,
                letterSpacing:'-.01em', display:'inline-block', textTransform:'uppercase' }}>{s.accentWord}</span>
            </div>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:18, flex:'none' }}>
            {s.priceLabel && <span className="gh-pixel" style={{ background:'rgba(11,11,10,.82)', color:GH.white,
              padding:'15px 20px', fontSize:24, borderRadius:5, boxShadow:`inset 0 0 0 2px ${tag.color}` }}>{s.priceLabel}</span>}
            <Lockup color={logoCol} h={42} style={{ filter: hasImg?'drop-shadow(0 4px 14px rgba(0,0,0,.55))':'none' }}/>
          </div>
        </div>
      </div>
    </div>
  );
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

/* logo color helper for solid-bg templates */
function solidLogoCol(s, tag, fill, ink){
  if(s.ink && s.ink!=='auto') return ink.logo;
  return fill ? (readableOn(tag.color)==='#0B0B0A'?'black':'white') : 'orange';
}

/* ---------- E · QUIZ (4:5) ---------- */
function QuizBody({ s, tag }){
  const hasImg = !!s.image;
  const fill = s.fill;
  const base = hasImg ? GH.bg : (fill ? tag.color : GH.bg);
  const auto = hasImg ? '#F4F1EC' : (fill ? readableOn(tag.color) : GH.white);
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const accent = hasImg ? tag.color : (fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color);
  const logoCol = (s.ink&&s.ink!=='auto') ? ink.logo : (hasImg ? 'white' : solidLogoCol(s, tag, fill, ink));
  const esseou = s.quizMode==='esseou';
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      {hasImg
        ? <><div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image} blur={s.imageBlur}/></div><FullScrim/></>
        : <PatternLayer kind={s.pattern} accent={fill?readableOn(tag.color):tag.color} base={base} opacity={s.patternOpacity}/>}
      <div style={{ position:'absolute', inset:0, padding:'72px 70px 148px', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
        </div>
        {esseou
          ? <EsseOuAquele s={s} txt={txt} accent={accent}/>
          : <QuizPergunta s={s} txt={txt} accent={accent} stories={s.format==='stories'}/>}
      </div>
      <LogoFooter colorOverride={(s.ink&&s.ink!=='auto')?ink.logo:(hasImg?'white':null)} dark={!hasImg&&readableOn(base)==='#0B0B0A'}/>
    </div>
  );
}
function QuizPergunta({ s, txt, accent, stories }){
  const opts = (s.quizOptions||[]).slice(0,4);
  const letters = ['A','B','C','D'];
  const onAccent = readableOn(accent);
  const hide = !!s.hideOptions;
  return (
    <div style={{ marginTop: stories?40:30, flex:1, display:'flex', flexDirection:'column',
      justifyContent:'flex-start', gap: stories?52:0 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
        <Eyebrow text={s.eyebrow} color={accent}/>
        <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||84, lineHeight:.95,
          letterSpacing:'-.02em', textWrap:'balance' }}>{s.question}</h1>
      </div>
      {!hide && <div style={{ marginTop: stories?0:'auto', display:'flex', flexDirection:'column', gap:16 }}>
        {opts.map((o,i)=>{
          const ok = s.answer===i;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:22, padding:'20px 24px',
              borderRadius:16, border:`2px solid ${ok?accent:hexA(txt,.26)}`,
              background: ok?hexA(accent,.16):hexA(txt,.04) }}>
              <span className="gh-pixel" style={{ flex:'none', width:56, height:56, borderRadius:12,
                display:'grid', placeItems:'center', fontSize:20,
                background:ok?accent:'transparent', color:ok?onAccent:txt,
                border:`2px solid ${ok?accent:hexA(txt,.4)}` }}>{letters[i]}</span>
              <span className="gh-display" style={{ flex:1, color:txt, fontSize:42, lineHeight:1.05,
                letterSpacing:'-.01em' }}>{o}</span>
              {ok && <span className="gh-pixel" style={{ flex:'none', color:accent, fontSize:24 }}>✓</span>}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
function EsseOuAquele({ s, txt, accent }){
  return (
    <div style={{ marginTop:24, flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, flex:'none' }}>
        <Eyebrow text={s.eyebrow||'VOCÊ PREFERE?'} color={accent}/>
        {s.question && <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:Math.min(s.titleSize||72,78),
          lineHeight:.96, letterSpacing:'-.02em', textWrap:'balance' }}>{s.question}</h1>}
      </div>
      <div style={{ marginTop:24, flex:1, position:'relative', display:'flex', flexDirection:'column', gap:16, minHeight:0 }}>
        <OptionPanel label={s.aLabel} img={s.aImg} blur={s.aImgBlur} accent={accent}/>
        <OptionPanel label={s.bLabel} img={s.bImg} blur={s.bImgBlur} accent={accent}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3 }}>
          <span className="gh-pixel" style={{ width:84, height:84, borderRadius:'50%', display:'grid',
            placeItems:'center', background:accent, color:readableOn(accent), fontSize:26,
            boxShadow:'0 0 0 9px rgba(11,11,10,.55)' }}>{s.vsWord||'OU'}</span>
        </div>
      </div>
    </div>
  );
}
function OptionPanel({ label, img, blur, accent }){
  return (
    <div style={{ flex:1, minHeight:0, position:'relative', borderRadius:18, overflow:'hidden',
      border:`2px solid ${hexA(accent,.5)}` }}>
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={img} blur={blur} label="IMAGEM (OPCIONAL)"/></div>
      <Scrim from="rgba(0,0,0,.88)" h="78%"/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 34px 30px' }}>
        <span className="gh-display" style={{ color:'#F4F1EC', fontSize:54, lineHeight:1.02,
          letterSpacing:'-.01em', textWrap:'balance' }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------- F · TOP / RANKING (4:5) ---------- */
function RankingBody({ s, tag }){
  const hasImg = !!s.image;
  const fill = s.fill;
  const base = hasImg ? GH.bg : (fill ? tag.color : GH.bg);
  const auto = hasImg ? '#F4F1EC' : (fill ? readableOn(tag.color) : GH.white);
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const accent = hasImg ? tag.color : (fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color);
  const logoCol = (s.ink&&s.ink!=='auto') ? ink.logo : (hasImg ? 'white' : solidLogoCol(s, tag, fill, ink));
  const stories = s.format==='stories';
  const items = (s.rankItems||[]).slice(0, s.rankCount||5).filter(it=>it && (it.name||'').trim()!=='');
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      {hasImg
        ? <><div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={s.image} blur={s.imageBlur}/></div><FullScrim/></>
        : <PatternLayer kind={s.pattern} accent={fill?readableOn(tag.color):tag.color} base={base} opacity={s.patternOpacity}/>}
      <div style={{ position:'absolute', inset:0, padding:'72px 70px 148px', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
        </div>
        <div style={{ marginTop:30, flex:1, display:'flex', flexDirection:'column',
          justifyContent: stories?'center':'space-between', gap: stories?54:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Eyebrow text={s.eyebrow} color={accent}/>
            <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||92, lineHeight:.9,
              letterSpacing:'-.025em', textWrap:'balance' }}>{s.title}</h1>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {items.map((it,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'baseline', gap:24, padding:'17px 0',
                borderTop:`1.5px solid ${hexA(txt,.16)}` }}>
                <span className="gh-display" style={{ flex:'none', width:i===0?112:90, textAlign:'left',
                  color:i===0?accent:txt, fontSize:i===0?92:64, lineHeight:.85, letterSpacing:'-.04em' }}>
                  {String(i+1).padStart(2,'0')}</span>
                <span className="gh-display" style={{ flex:1, color:txt, fontSize:i===0?48:38, lineHeight:1.0,
                  letterSpacing:'-.01em' }}>{it.name}</span>
                {it.note && <span className="gh-mono" style={{ flex:'none', color:accent, fontSize:18, fontWeight:700,
                  letterSpacing:'.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{it.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <LogoFooter colorOverride={(s.ink&&s.ink!=='auto')?ink.logo:(hasImg?'white':null)} dark={!hasImg&&readableOn(base)==='#0B0B0A'}/>
    </div>
  );
}

/* ---------- G · NOVIDADES DA SEMANA (grade · 4:5) ---------- */
function ArrivalCard({ it, accent, txt, span }){
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden', minHeight:0,
      border:`2px solid ${hexA(txt,.18)}`, gridColumn: span?'1 / -1':'auto' }}>
      <div style={{ position:'absolute', inset:0 }}><ImageOrSlot src={it.image} blur={it.imageBlur} label="CAPA DO JOGO"/></div>
      <Scrim from="rgba(0,0,0,.92)" h="64%"/>
      {it.console && <span className="gh-pixel" style={{ position:'absolute', top:16, right:16,
        background:accent, color:readableOn(accent), padding:'9px 13px', fontSize:20, borderRadius:4,
        boxShadow:'0 0 0 3px rgba(0,0,0,.22)' }}>{it.console}</span>}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 22px 20px' }}>
        <span className="gh-display" style={{ color:'#F4F1EC', fontSize:span?40:32, lineHeight:1.0,
          letterSpacing:'-.01em', textWrap:'balance' }}>{it.name}</span>
      </div>
    </div>
  );
}
function ArrivalsBody({ s, tag }){
  const fill = s.fill;
  const base = fill ? tag.color : GH.bg;
  const auto = fill ? readableOn(tag.color) : GH.white;
  const ink = resolveInk(s.ink, auto);
  const txt = ink.text;
  const accent = fill ? (txt==='#0B0B0A'?'#0B0B0A':readableOn(tag.color)) : tag.color;
  const items = (s.arrivals||[]).slice(0, s.arrivalCount||4).filter(it=>it && ((it.name||'').trim()!=='' || it.image));
  const odd = items.length % 2 === 1;
  return (
    <div style={{ position:'absolute', inset:0, background:base, overflow:'hidden' }}>
      <PatternLayer kind={s.pattern} accent={fill?readableOn(tag.color):tag.color} base={base} opacity={s.patternOpacity}/>
      <div style={{ position:'absolute', inset:0, padding:'72px 70px 148px', display:'flex', flexDirection:'column' }}>
        <div style={{ flex:'none', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Seal tag={tag}/>
        </div>
        <div style={{ flex:'none', marginTop:28, display:'flex', flexDirection:'column', gap:14 }}>
          <Eyebrow text={s.eyebrow} color={accent}/>
          <h1 className="gh-display" style={{ margin:0, color:txt, fontSize:s.titleSize||84, lineHeight:.9,
            letterSpacing:'-.025em', textWrap:'balance' }}>{s.title}</h1>
        </div>
        <div style={{ flex:1, minHeight:0, marginTop:26, display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:22, gridAutoRows:'1fr' }}>
          {items.map((it,i)=>(
            <ArrivalCard key={i} it={it} accent={accent} txt={txt}
              span={odd && i===items.length-1}/>
          ))}
        </div>
      </div>
      <LogoFooter colorOverride={s.ink&&s.ink!=='auto'?ink.logo:null} dark={readableOn(base)==='#0B0B0A'}/>
    </div>
  );
}

/* artboard size = template size; Post Blocado / Quiz / Ranking / Novidades can
   switch to a 9:16 Stories format (1080×1920) */
function stageDims(s, pageIndex=0){
  const tpl = TEMPLATES.find(t=>t.id===s.template) || TEMPLATES[0];
  if((s.template==='block'||s.template==='quiz'||s.template==='ranking'||s.template==='arrivals') && s.format==='stories'){
    return { w:1080, h:1920, ratio:'9:16' };
  }
  return { w:tpl.w, h:tpl.h, ratio:tpl.ratio };
}

/* ---------- master stage ---------- */
function PostStage({ s, pageIndex=0, stageRef, exporting=false }){
  const tag = TAGS.find(t=>t.id===s.tagId) || TAGS[0];
  const dims = stageDims(s, pageIndex);
  let body;
  if(s.template==='block')    body = <BlockBody s={s} tag={tag}/>;
  else if(s.template==='image') body = <ImageBody s={s} tag={tag}/>;
  else if(s.template==='carousel') body = <CarouselBody s={s} tag={tag} pageIndex={pageIndex} exporting={exporting}/>;
  else if(s.template==='quiz') body = <QuizBody s={s} tag={tag}/>;
  else if(s.template==='ranking') body = <RankingBody s={s} tag={tag}/>;
  else if(s.template==='arrivals') body = <ArrivalsBody s={s} tag={tag}/>;
  else if(s.template==='thumb') body = <ThumbBody s={s} tag={tag} exporting={exporting}/>;
  else body = <ReelsBody s={s} tag={tag} exporting={exporting}/>;
  return (
    <div ref={stageRef} data-stage style={{ width:dims.w, height:dims.h, position:'relative',
      overflow:'hidden', flex:'none', background:GH.bg }}>
      {body}
    </div>
  );
}

/* ============================================================
   CANVAS COMPOSITOR — used by the "Exportar vídeo" flow to draw
   the branded frame + the playing trailer to a <canvas> per frame.
   ============================================================ */
function coverDraw(ctx, src, dx, dy, dw, dh, inflate=0){
  const iw = src.videoWidth || src.naturalWidth || src.width;
  const ih = src.videoHeight || src.naturalHeight || src.height;
  if(!iw || !ih) return;
  const sc = Math.max(dw/iw, dh/ih) * (1+inflate);
  const w = iw*sc, h = ih*sc;
  ctx.drawImage(src, dx+(dw-w)/2, dy+(dh-h)/2, w, h);
}
/* shrink font until the (uppercased) line fits maxW; returns the px size used */
function fitFont(ctx, text, maxW, weight, family, startPx, minPx=30){
  let px = startPx;
  for(; px>minPx; px-=2){
    ctx.font = `${weight} ${px}px ${family}`;
    if(ctx.measureText(text).width <= maxW) break;
  }
  ctx.font = `${weight} ${px}px ${family}`;
  return px;
}
function roundRectPath(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}
function drawPill(ctx, x, y, label, bg, ink, font='20px "Press Start 2P"', dot=true){
  ctx.font = font;
  const tw = ctx.measureText(label).width;
  const padX = 18, padY = 13, dotR = 5, gap = dot?16:0, dotW = dot?dotR*2:0;
  const h = 20 + padY*2, w = padX*2 + dotW + gap + tw;
  ctx.fillStyle = bg; roundRectPath(ctx, x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = ink;
  if(dot){ ctx.beginPath(); ctx.arc(x+padX+dotR, y+h/2, dotR, 0, Math.PI*2); ctx.fill(); }
  ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText(label, x+padX+dotW+gap, y+h/2+1);
  return { w, h };
}
function drawVideoComposite(ctx, W, H, o){
  const { s, pg, tag, pageIndex, vid, bgImg, logoImg } = o;
  const accent = tag.color, PAD = 70;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#0B0B0A'; ctx.fillRect(0,0,W,H);
  if(bgImg && bgImg.complete && bgImg.naturalWidth){
    const br = blurPx(pg.imageBlur);
    if(br>0){
      ctx.save(); ctx.filter = `blur(${br.toFixed(1)}px)`;
      coverDraw(ctx, bgImg, 0,0,W,H, br/200);   // inflate to hide the blur halo
      ctx.restore();
    } else {
      coverDraw(ctx, bgImg, 0,0,W,H);
    }
  }
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(8,8,7,.66)'); g.addColorStop(.34,'rgba(8,8,7,.40)');
  g.addColorStop(.62,'rgba(8,8,7,.46)'); g.addColorStop(1,'rgba(8,8,7,.86)');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  // top row — seal + counter
  drawPill(ctx, PAD, 66, tag.label, tag.color, tag.ink);
  const counter = String(pageIndex+1).padStart(2,'0')+'/'+String(s.pageCount).padStart(2,'0');
  ctx.font = '28px "Press Start 2P"';
  const cw = ctx.measureText(counter).width + 32, ch = 56;
  ctx.fillStyle = 'rgba(11,11,10,.6)'; roundRectPath(ctx, W-PAD-cw, 66, cw, ch, 4); ctx.fill();
  ctx.fillStyle = tag.color; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText(counter, W-PAD-cw+16, 66+ch/2+1);

  // eyebrow + title (centered, auto-fit to width)
  const maxTextW = W - 2*PAD;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if(pg.eyebrow){
    ctx.font = '700 24px "Space Mono"'; ctx.fillStyle = accent;
    if('letterSpacing' in ctx) ctx.letterSpacing = '8px';
    ctx.fillText(pg.eyebrow.toUpperCase(), W/2, 212);
    if('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  const t1 = (pg.title||'').toUpperCase(), t2 = (pg.accent||'').toUpperCase();
  ctx.fillStyle = '#F4F1EC';
  const s1 = t1 ? fitFont(ctx, t1, maxTextW, 900, '"Archivo"', 80) : 0;
  if(t1) ctx.fillText(t1, W/2, 300);
  let titleBottom = t1 ? 340 : 250;
  if(t2){
    ctx.fillStyle = accent;
    const s2 = fitFont(ctx, t2, maxTextW, 900, '"Archivo"', 80);
    const y2 = 300 + Math.max(s1, 60)*0.96;
    ctx.fillText(t2, W/2, y2);
    titleBottom = y2 + 34;
  }

  // horizontal 16:9 trailer card, centered between title and footer
  const cardW = W - 2*PAD, cardH = Math.round(cardW * 9/16), cardX = PAD;
  const footerTop = H - 210;
  const cardTop = Math.round(titleBottom + Math.max(0, (footerTop - titleBottom - cardH)) / 2);
  ctx.save(); roundRectPath(ctx, cardX, cardTop, cardW, cardH, 26); ctx.clip();
  ctx.fillStyle = '#0C0C0B'; ctx.fillRect(cardX, cardTop, cardW, cardH);
  if(vid && vid.readyState >= 2) coverDraw(ctx, vid, cardX, cardTop, cardW, cardH);
  ctx.restore();
  ctx.lineWidth = 2; ctx.strokeStyle = hexA(accent, .85);
  roundRectPath(ctx, cardX, cardTop, cardW, cardH, 26); ctx.stroke();

  // footer + logo
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if(pg.footer){
    ctx.font = '700 30px "Space Mono"'; ctx.fillStyle = '#F4F1EC';
    if('letterSpacing' in ctx) ctx.letterSpacing = '1px';
    ctx.fillText(pg.footer, W/2, H-152);
    if('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  if(logoImg && logoImg.complete && logoImg.naturalWidth){
    const lh = 46, lw = logoImg.naturalWidth*(lh/logoImg.naturalHeight);
    ctx.globalAlpha = .96; ctx.drawImage(logoImg, W/2-lw/2, H-112, lw, lh); ctx.globalAlpha = 1;
  }
}

Object.assign(window, { PostStage, stageDims, drawVideoComposite });
