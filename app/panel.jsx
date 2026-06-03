/* ============================================================
   GAMER HUT — Controls assembly (template-aware fields)
   ============================================================ */

function Controls({ s, set, tag, onCover, pageIdx, pickTemplate, setS }){
  const isCarousel = s.template==='carousel';
  const isImage    = s.template==='image';
  const isReels    = s.template==='reels';
  const isBlock    = s.template==='block';
  const accent = s.fill ? readableOn(tag.color) : tag.color;

  const setPage = (patch)=> setS(p=>{
    const pages = p.pages.slice(); pages[pageIdx-1] = { ...pages[pageIdx-1], ...patch };
    return { ...p, pages };
  });
  const curPage = isCarousel ? (s.pages[pageIdx-1]||{}) : null;

  return (
    <div>
      <CtrlSection title="MODELO">
        <TemplatePicker value={s.template} onChange={pickTemplate}/>
      </CtrlSection>

      <CtrlSection title="TAG DE CATEGORIA"
        right={<span className="gh-mono" style={{ color:GH.mut, fontSize:9, letterSpacing:'.1em' }}>DEFINE A COR</span>}>
        <TagPicker value={s.tagId} onChange={id=>set({ tagId:id })}/>
      </CtrlSection>

      {/* CAROUSEL page manager */}
      {isCarousel &&
        <CtrlSection title="PÁGINAS" right={
          <Stepper label="" value={s.pageCount} min={3} max={5}
            onChange={n=>setS(p=>{
              const pages = p.pages.slice();
              while(pages.length < n-1) pages.push({ title:'', body:'', image:null });
              return { ...p, pageCount:n, current:Math.min(p.current,n-1), pages };
            })}/>
        }>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {Array.from({length:s.pageCount}).map((_,i)=>(
              <button key={i} onClick={()=>setS(p=>({...p,current:i}))} className="gh-mono" style={{
                cursor:'pointer', flex:'1 0 28%', padding:'9px 0', borderRadius:7, fontSize:11, fontWeight:700,
                background:i===s.current?GH.orange:GH.bg, color:i===s.current?GH.ink:GH.white,
                border:`1px solid ${i===s.current?GH.orange:GH.lineSoft}` }}>
                {i===0?'CAPA':'P'+(i+1)}
              </button>
            ))}
          </div>
        </CtrlSection>}

      {/* CONTENT */}
      <CtrlSection title={isCarousel ? (onCover?'CONTEÚDO · CAPA':'CONTEÚDO · PÁGINA '+(pageIdx+1)) : 'CONTEÚDO'}>
        {/* carousel content page */}
        {isCarousel && !onCover ? <>
          <Field label="Título da página">
            <TextInput value={curPage.title||''} onChange={e=>setPage({title:e.target.value})}/>
          </Field>
          <Field label="Texto / informação">
            <TextArea value={curPage.body||''} onChange={e=>setPage({body:e.target.value})}/>
          </Field>
          <Field label="Imagem do jogo (fundo)">
            <ImageDrop value={curPage.image} onChange={v=>setPage({image:v})}/>
          </Field>
        </> : <>
          {!isImage && <Field label={isReels||isCarousel?'Badge (canto superior)':'Selo'}>
            <TextInput value={s.badge||''} placeholder="ex: STATE OF PLAY" onChange={e=>set({badge:e.target.value})}/>
          </Field>}
          <Field label="Sobre-título (eyebrow)">
            <TextInput value={s.eyebrow||''} onChange={e=>set({eyebrow:e.target.value})}/>
          </Field>
          <Field label="Título principal">
            <TextArea value={s.title||''} onChange={e=>set({title:e.target.value})} style={{minHeight:64}}/>
          </Field>
          <Field label={isImage?'Texto de apoio':(isBlock?'Subtítulo':'Destaque (chip)')}>
            <TextInput value={s.subtitle||''} onChange={e=>set({subtitle:e.target.value})}/>
          </Field>
          {isImage && <>
            <Field label="Imagem do jogo">
              <ImageDrop value={s.image} onChange={v=>set({image:v})}/>
            </Field>
            <Field label="Etiqueta de preço / status">
              <TextInput value={s.priceLabel||''} placeholder="R$ 349 · LACRADO" onChange={e=>set({priceLabel:e.target.value})}/>
            </Field>
          </>}
          {isReels && <Field label="Imagem de fundo (opcional)">
            <ImageDrop value={s.image} onChange={v=>set({image:v})} label="Imagem de fundo"/>
          </Field>}
          {isCarousel && onCover && <Field label="Imagem de fundo da capa (opcional)">
            <ImageDrop value={s.image} onChange={v=>set({image:v})} label="Imagem da capa"/>
          </Field>}
          {(isCarousel||isReels) && <Field label="Rodapé (canto inferior)">
            <TextInput value={s.footer||''} onChange={e=>set({footer:e.target.value})}/>
          </Field>}
          {isCarousel && <Field label="Botão (CTA)">
            <TextInput value={s.cta||''} placeholder="ARRASTA PRO LADO" onChange={e=>set({cta:e.target.value})}/>
          </Field>}
        </>}
      </CtrlSection>

      {/* STYLE */}
      {onCover && !isImage &&
        <CtrlSection title="ESTILO DE FUNDO" right={
          <span className="gh-mono" style={{ color:GH.mut, fontSize:9, letterSpacing:'.1em' }}>{PATTERNS.length} PADRÕES</span>}>
          {(isReels||isCarousel) && s.image
            ? <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.5, margin:0 }}>
                Imagem de fundo ativa — remova-a acima para usar padrões ou cor sólida.</p>
            : <>
              <div style={{ marginBottom:14 }}>
                <PatternPicker value={s.pattern} accent={accent} onChange={p=>set({pattern:p})}/>
              </div>
              {(isBlock||isCarousel||isReels) &&
                <div style={{ marginTop:6 }}>
                  <Toggle label="Preencher com a cor da tag" checked={s.fill} onChange={v=>set({fill:v})}/>
                </div>}
            </>}
        </CtrlSection>}

      {/* INK — text + logo color */}
      {(onCover || isImage) &&
        <CtrlSection title="COR DO TEXTO / LOGO">
          <Segmented value={s.ink||'auto'} onChange={v=>set({ink:v})} options={[
            {id:'auto', label:'AUTO'}, {id:'white', label:'BRANCO'}, {id:'black', label:'PRETO'} ]}/>
          <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.5, margin:'12px 0 0' }}>
            Define a cor do título, textos e do logotipo. “Auto” escolhe o melhor contraste com o fundo.
          </p>
        </CtrlSection>}

      {/* TYPE */}
      {onCover &&
        <CtrlSection title="TIPOGRAFIA" right={
          <span className="gh-pixel" style={{ color:GH.orange, fontSize:11 }}>{s.titleSize}px</span>}>
          <input type="range" min={64} max={172} value={s.titleSize}
            onChange={e=>set({titleSize:+e.target.value})} style={{ width:'100%', accentColor:GH.orange }}/>
          <div className="gh-mono" style={{ color:GH.mut, fontSize:10, letterSpacing:'.1em', marginTop:6 }}>
            TAMANHO DO TÍTULO PRINCIPAL</div>
        </CtrlSection>}

      {/* RULES */}
      <CtrlSection title="REGRAS DA MARCA">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="gh-mono" style={{ display:'flex', alignItems:'center', gap:10, color:GH.mut, fontSize:11 }}>
            <span style={{ color:'#2E9D5B', fontSize:14 }}>✓</span> Logo aplicado automaticamente (inferior central)
          </div>
          {isReels && <Toggle label="Mostrar guia de Safe Zone (4:5)" checked={s.showSafe}
            onChange={v=>set({showSafe:v})}/>}
          <button onClick={()=>{ localStorage.removeItem('gh-studio'); location.reload(); }}
            className="gh-mono" style={{ cursor:'pointer', alignSelf:'flex-start', marginTop:4,
            background:'transparent', border:`1px solid ${GH.lineSoft}`, color:GH.mut, fontSize:10,
            letterSpacing:'.1em', padding:'7px 12px', borderRadius:7 }}>↺ RESETAR TUDO</button>
        </div>
      </CtrlSection>
    </div>
  );
}

function Segmented({ value, onChange, options }){
  return (
    <div style={{ display:'flex', gap:6, background:GH.bg, padding:4, borderRadius:9,
      border:`1px solid ${GH.lineSoft}` }}>
      {options.map(o=>{
        const on = value===o.id;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} className="gh-mono" style={{
            flex:1, cursor:'pointer', padding:'9px 0', borderRadius:6, fontSize:11, fontWeight:700,
            letterSpacing:'.06em', border:'none', transition:'all .12s',
            background: on?GH.orange:'transparent', color: on?GH.ink:GH.mut }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Controls });
