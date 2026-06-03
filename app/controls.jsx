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

function ImageDrop({ value, onChange, label='Imagem do jogo' }){
  const id = useMemo(()=>'img-'+Math.random().toString(36).slice(2),[]);
  const onFile = f => { if(!f) return; const r=new FileReader(); r.onload=()=>onChange(r.result); r.readAsDataURL(f); };
  return (
    <div>
      <label htmlFor={id} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault(); onFile(e.dataTransfer.files[0]);}}
        style={{ display:'block', cursor:'pointer', borderRadius:10, border:`1.5px dashed ${GH.line}`,
          overflow:'hidden', background:GH.bg }}>
        {value
          ? <div style={{ position:'relative' }}>
              <img src={value} alt="" style={{ width:'100%', height:120, objectFit:'cover', display:'block' }}/>
              <span className="gh-mono" style={{ position:'absolute', bottom:6, right:8, fontSize:10,
                background:'rgba(0,0,0,.7)', color:GH.white, padding:'3px 7px', borderRadius:4 }}>TROCAR</span>
            </div>
          : <div style={{ height:84, display:'grid', placeItems:'center' }}>
              <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.1em' }}>↑ {label.toUpperCase()}</span>
            </div>}
      </label>
      <input id={id} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e=>onFile(e.target.files[0])}/>
      {value && <button onClick={()=>onChange(null)} className="gh-mono" style={{ marginTop:6, cursor:'pointer',
        background:'transparent', border:'none', color:GH.mut, fontSize:10, letterSpacing:'.1em' }}>✕ REMOVER</button>}
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
  PatternPicker, Toggle, ImageDrop, Stepper, inputBase });
