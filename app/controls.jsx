/* ============================================================
   GAMER HUT — Control Panel (left rail)
   ============================================================ */

function CtrlSection({ title, children, right }){
  return (
    <section style={{ borderTop:`1px solid ${GH.lineSoft}`, padding:'22px 24px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h3 className="gh-pixel" style={{ margin:0, color:GH.orange, fontSize:13, letterSpacing:'.04em' }}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }){
  return (
    <label style={{ display:'block', marginBottom:14 }}>
      <span className="gh-mono" style={{ display:'block', color:GH.mut, fontSize:11,
        letterSpacing:'.16em', textTransform:'uppercase', marginBottom:7 }}>{label}</span>
      {children}
    </label>
  );
}

const inputBase = {
  width:'100%', background:GH.bg, color:GH.white, border:`1px solid ${GH.lineSoft}`,
  borderRadius:8, padding:'12px 14px', fontSize:14, outline:'none', fontFamily:"'Space Grotesk',sans-serif",
};
function TextInput(props){
  return <input {...props} style={{ ...inputBase, ...(props.style||{}) }}
    onFocus={e=>e.target.style.borderColor=GH.orange}
    onBlur={e=>e.target.style.borderColor=GH.lineSoft}/>;
}
function TextArea(props){
  return <textarea {...props} style={{ ...inputBase, resize:'vertical', minHeight:80, lineHeight:1.5, ...(props.style||{}) }}
    onFocus={e=>e.target.style.borderColor=GH.orange}
    onBlur={e=>e.target.style.borderColor=GH.lineSoft}/>;
}

/* template chooser */
function TemplatePicker({ value, onChange }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {TEMPLATES.map(t=>{
        const on = value===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{
            textAlign:'left', cursor:'pointer', padding:'12px 13px', borderRadius:9,
            background: on?GH.orange:GH.bg, color: on?GH.ink:GH.white,
            border:`1px solid ${on?GH.orange:GH.lineSoft}`, transition:'all .12s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="gh-mono" style={{ fontSize:12, fontWeight:700, letterSpacing:'.02em' }}>{t.label}</span>
              <span className="gh-mono" style={{ fontSize:10, opacity:.7 }}>{t.ratio}</span>
            </div>
            <div className="gh-mono" style={{ fontSize:10, marginTop:4, opacity:.7, lineHeight:1.3 }}>{t.note}</div>
          </button>
        );
      })}
    </div>
  );
}

/* tag chooser — drives the whole identity */
function TagPicker({ value, onChange }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {TAGS.map(t=>{
        const on = value===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} className="gh-mono" style={{
            cursor:'pointer', padding:'10px 12px', borderRadius:8, fontSize:12, fontWeight:700,
            letterSpacing:'.02em', display:'flex', alignItems:'center', gap:9, transition:'all .12s',
            background: on?t.color:GH.bg, color: on?t.ink:GH.white,
            border:`1px solid ${on?t.color:GH.lineSoft}` }}>
            <span style={{ width:11, height:11, borderRadius:'50%', flex:'none',
              background:on?t.ink:t.color }}/>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* pattern chooser */
function PatternPicker({ value, accent, onChange }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
      {PATTERNS.map(p=>{
        const on = value===p;
        const sw = p==='solid'
          ? { background:GH.bg }
          : { background:GH.bg, position:'relative', overflow:'hidden' };
        return (
          <button key={p} onClick={()=>onChange(p)} title={PATTERN_LABELS[p]} style={{
            cursor:'pointer', borderRadius:8, padding:0, overflow:'hidden', height:54,
            border:`1px solid ${on?accent:GH.lineSoft}`, position:'relative',
            boxShadow: on?`0 0 0 2px ${accent}`:'none' }}>
            <div style={{ position:'absolute', inset:0, ...sw }}>
              {p!=='solid' && <div style={{ position:'absolute', inset:0, ...patternStyle(p, accent, GH.bg) }}/>}
            </div>
            <span className="gh-mono" style={{ position:'absolute', left:0, right:0, bottom:0,
              fontSize:8, padding:'2px 0', background:'rgba(0,0,0,.6)', color:GH.white,
              letterSpacing:'.06em' }}>{PATTERN_LABELS[p]}</span>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, checked, onChange }){
  return (
    <button onClick={()=>onChange(!checked)} style={{ cursor:'pointer', display:'flex', width:'100%',
      alignItems:'center', justifyContent:'space-between', background:'transparent', border:'none', padding:'2px 0' }}>
      <span className="gh-mono" style={{ color:GH.white, fontSize:12, letterSpacing:'.02em' }}>{label}</span>
      <span style={{ width:42, height:24, borderRadius:99, background:checked?GH.orange:'#2a2622',
        position:'relative', transition:'background .15s', flex:'none' }}>
        <span style={{ position:'absolute', top:3, left:checked?21:3, width:18, height:18, borderRadius:'50%',
          background:GH.white, transition:'left .15s' }}/>
      </span>
    </button>
  );
}

function ImageDrop({ value, onChange, label='Imagem do jogo', blur, onBlur, zoom, onZoom, imgX, onImgX, imgY, onImgY }){
  const id = useMemo(()=>'img-'+Math.random().toString(36).slice(2),[]);
  const onFile = f => { if(!f) return; const r=new FileReader(); r.onload=()=>onChange(r.result); r.readAsDataURL(f); };
  return (
    <div>
      <label htmlFor={id} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault(); onFile(e.dataTransfer.files[0]);}}
        style={{ display:'block', cursor:'pointer', borderRadius:10, border:`1.5px dashed ${GH.line}`,
          overflow:'hidden', background:GH.bg }}>
        {value
          ? <div style={{ position:'relative' }}>
              <img src={value} alt="" style={{ width:'100%', height:120, objectFit:'cover', display:'block',
                objectPosition:`${imgX||50}% ${imgY||50}%`,
                transform:`scale(${Math.max(1,(zoom||100)/100).toFixed(3)})`,
                transformOrigin:`${imgX||50}% ${imgY||50}%`,
                filter: blur?`blur(${((blur)*0.18).toFixed(1)}px)`:'none' }}/>
              <span className="gh-mono" style={{ position:'absolute', bottom:6, right:8, fontSize:10,
                background:'rgba(0,0,0,.7)', color:GH.white, padding:'3px 7px', borderRadius:4 }}>TROCAR</span>
            </div>
          : <div style={{ height:84, display:'grid', placeItems:'center' }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.1em' }}>↑ {label.toUpperCase()}</span>
            </div>}
      </label>
      <input id={id} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e=>onFile(e.target.files[0])}/>
      {value && <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:6 }}>
        <button onClick={()=>onChange(null)} className="gh-mono" style={{ cursor:'pointer',
          background:'transparent', border:'none', color:GH.mut, fontSize:10, letterSpacing:'.1em' }}>✕ REMOVER</button>
      </div>}
      {value && (
        <div style={{ marginTop:10, background:GH.bg, border:`1px solid ${GH.lineSoft}`, borderRadius:9, padding:'13px 13px 11px' }}>

          {/* ZOOM */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.14em' }}>ZOOM</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={()=>onZoom&&onZoom(100)} className="gh-mono" style={{ cursor:'pointer',
                  padding:'3px 8px', borderRadius:5, fontSize:9, background:'transparent',
                  color:GH.mut, border:`1px solid ${GH.lineSoft}`, letterSpacing:'.06em' }}>RESET</button>
                <span className="gh-pixel" style={{ color:GH.orange, fontSize:11, minWidth:38, textAlign:'right' }}>{Math.round(zoom||100)}%</span>
              </div>
            </div>
            <input type="range" min={100} max={300} step={1} value={zoom||100}
              onChange={e=>onZoom&&onZoom(+e.target.value)} style={{ width:'100%', accentColor:GH.orange }}/>
          </div>

          {/* POSIÇÃO X */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.14em' }}>POSIÇÃO HORIZONTAL</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={()=>onImgX&&onImgX(50)} className="gh-mono" style={{ cursor:'pointer',
                  padding:'3px 8px', borderRadius:5, fontSize:9, background:'transparent',
                  color:GH.mut, border:`1px solid ${GH.lineSoft}`, letterSpacing:'.06em' }}>CENTRO</button>
                <span className="gh-pixel" style={{ color:GH.orange, fontSize:11, minWidth:38, textAlign:'right' }}>{Math.round(imgX||50)}%</span>
              </div>
            </div>
            <input type="range" min={0} max={100} step={1} value={imgX||50}
              onChange={e=>onImgX&&onImgX(+e.target.value)} style={{ width:'100%', accentColor:GH.orange }}/>
          </div>

          {/* POSIÇÃO Y */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.14em' }}>POSIÇÃO VERTICAL</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={()=>onImgY&&onImgY(50)} className="gh-mono" style={{ cursor:'pointer',
                  padding:'3px 8px', borderRadius:5, fontSize:9, background:'transparent',
                  color:GH.mut, border:`1px solid ${GH.lineSoft}`, letterSpacing:'.06em' }}>CENTRO</button>
                <span className="gh-pixel" style={{ color:GH.orange, fontSize:11, minWidth:38, textAlign:'right' }}>{Math.round(imgY||50)}%</span>
              </div>
            </div>
            <input type="range" min={0} max={100} step={1} value={imgY||50}
              onChange={e=>onImgY&&onImgY(+e.target.value)} style={{ width:'100%', accentColor:GH.orange }}/>
          </div>

          {/* DESFOQUE */}
          {onBlur && (
            <div style={{ paddingTop:10, borderTop:`1px solid ${GH.lineSoft}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:(+blur||0)>0?8:0 }}>
                <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.14em' }}>DESFOQUE DO FUNDO</span>
                <button onClick={()=>onBlur((+blur||0)>0?0:35)} className="gh-mono" style={{ cursor:'pointer',
                  padding:'5px 11px', borderRadius:6, fontSize:10, fontWeight:700, letterSpacing:'.06em',
                  background:(+blur||0)>0?GH.orange:'transparent', color:(+blur||0)>0?GH.ink:GH.mut,
                  border:`1px solid ${(+blur||0)>0?GH.orange:GH.lineSoft}` }}>{(+blur||0)>0?'DESFOCADO':'DESFOCAR'}</button>
              </div>
              {(+blur||0)>0 && <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="range" min={0} max={100} value={+blur||0}
                  onChange={e=>onBlur(+e.target.value)} style={{ flex:1, accentColor:GH.orange }}/>
                <span className="gh-pixel" style={{ color:GH.orange, fontSize:11, minWidth:42, textAlign:'right' }}>{Math.round(+blur||0)}%</span>
              </div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* desfoque do fundo — botão rápido (35%) + barra de intensidade */
function BlurSlider({ value=0, onChange }){
  const on = (+value||0) > 0;
  return (
    <div style={{ marginTop:10, background:GH.bg, border:`1px solid ${GH.lineSoft}`, borderRadius:9, padding:'11px 13px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:on?10:0 }}>
        <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.14em' }}>DESFOQUE DO FUNDO</span>
        <button onClick={()=>onChange(on?0:35)} className="gh-mono" style={{ cursor:'pointer',
          padding:'5px 11px', borderRadius:6, fontSize:10, fontWeight:700, letterSpacing:'.06em',
          background:on?GH.orange:'transparent', color:on?GH.ink:GH.mut,
          border:`1px solid ${on?GH.orange:GH.lineSoft}` }}>{on?'DESFOCADO':'DESFOCAR'}</button>
      </div>
      {on && <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <input type="range" min={0} max={100} value={+value||0}
          onChange={e=>onChange(+e.target.value)} style={{ flex:1, accentColor:GH.orange }}/>
        <span className="gh-pixel" style={{ color:GH.orange, fontSize:11, minWidth:42, textAlign:'right' }}>{Math.round(+value||0)}%</span>
      </div>}
    </div>
  );
}

/* color picker — curated swatches + native picker + reset to a fallback */
function ColorField({ value, onChange, fallbackLabel='PADRÃO' }){
  const swatches = useMemo(()=>{
    const base = ['#0B0B0A','#1F1B18','#F4F1EC', ...TAGS.map(t=>t.color)];
    return [...new Set(base)];
  },[]);
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7, alignItems:'center' }}>
      <button onClick={()=>onChange(null)} title={fallbackLabel} className="gh-mono" style={{ cursor:'pointer',
        height:28, padding:'0 11px', borderRadius:7, fontSize:9, fontWeight:700, letterSpacing:'.08em',
        background: value?GH.bg:GH.orange, color: value?GH.mut:GH.ink,
        border:`1px solid ${value?GH.lineSoft:GH.orange}` }}>{fallbackLabel}</button>
      {swatches.map(c=>(
        <button key={c} onClick={()=>onChange(c)} title={c} style={{ cursor:'pointer', width:28, height:28,
          borderRadius:7, background:c, border: value&&value.toLowerCase()===c.toLowerCase()
            ? `2px solid ${GH.white}` : `1px solid ${GH.lineSoft}`,
          boxShadow: value&&value.toLowerCase()===c.toLowerCase()?`0 0 0 2px ${GH.orange}`:'none' }}/>
      ))}
      <label title="Cor personalizada" style={{ position:'relative', width:28, height:28, borderRadius:7,
        cursor:'pointer', overflow:'hidden', border:`1px solid ${GH.lineSoft}`,
        background:'conic-gradient(from 0deg,#e23b2e,#e3b53e,#2e9d5b,#2bb1c4,#3e78cc,#7b3fe4,#d6286e,#e23b2e)' }}>
        <input type="color" value={value||'#E8643C'} onChange={e=>onChange(e.target.value)}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}/>
      </label>
    </div>
  );
}

function VideoDrop({ value, name, onChange, label='Vídeo (trailer · MP4)' }){
  const id = useMemo(()=>'vid-'+Math.random().toString(36).slice(2),[]);
  const onFile = f => { if(!f) return; const url = URL.createObjectURL(f); onChange(url, f.name); };
  return (
    <div>
      <label htmlFor={id} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault(); onFile(e.dataTransfer.files[0]);}}
        style={{ display:'block', cursor:'pointer', borderRadius:10, border:`1.5px dashed ${GH.line}`,
          overflow:'hidden', background:GH.bg }}>
        {value
          ? <div style={{ position:'relative' }}>
              <video src={value} muted loop autoPlay playsInline
                style={{ width:'100%', height:120, objectFit:'cover', display:'block' }}/>
              <span className="gh-mono" style={{ position:'absolute', bottom:6, right:8, fontSize:10,
                background:'rgba(0,0,0,.7)', color:GH.white, padding:'3px 7px', borderRadius:4 }}>TROCAR</span>
            </div>
          : <div style={{ height:84, display:'grid', placeItems:'center' }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.1em' }}>↑ {label.toUpperCase()}</span>
            </div>}
      </label>
      <input id={id} type="file" accept="video/*" style={{ display:'none' }}
        onChange={e=>onFile(e.target.files[0])}/>
      {value
        ? <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
            <span className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.06em',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>{name||'vídeo carregado'}</span>
            <button onClick={()=>onChange(null,null)} className="gh-mono" style={{ cursor:'pointer',
              background:'transparent', border:'none', color:GH.mut, fontSize:10, letterSpacing:'.1em' }}>✕ REMOVER</button>
          </div>
        : <p className="gh-mono" style={{ color:GH.mut2, fontSize:9, lineHeight:1.5, margin:'7px 0 0',
            letterSpacing:'.04em' }}>O vídeo toca no preview. Não fica salvo ao recarregar — reenvie se precisar.</p>}
    </div>
  );
}

function Stepper({ value, min, max, onChange, label }){
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span className="gh-mono" style={{ color:GH.white, fontSize:12 }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <StepBtn dis={value<=min} onClick={()=>onChange(Math.max(min,value-1))}>−</StepBtn>
        <span className="gh-pixel" style={{ color:GH.orange, fontSize:14, minWidth:18, textAlign:'center' }}>{value}</span>
        <StepBtn dis={value>=max} onClick={()=>onChange(Math.min(max,value+1))}>+</StepBtn>
      </div>
    </div>
  );
}
function StepBtn({ children, onClick, dis }){
  return <button onClick={dis?undefined:onClick} style={{ cursor:dis?'default':'pointer', width:28, height:28,
    borderRadius:7, border:`1px solid ${GH.lineSoft}`, background:GH.bg, color:dis?GH.mut2:GH.white,
    fontSize:16, lineHeight:1, opacity:dis?.5:1 }}>{children}</button>;
}

Object.assign(window, { CtrlSection, Field, TextInput, TextArea, TemplatePicker, TagPicker,
  PatternPicker, Toggle, ImageDrop, BlurSlider, ColorField, VideoDrop, Stepper, inputBase });
