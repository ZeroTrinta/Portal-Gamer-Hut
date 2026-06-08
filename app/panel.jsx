/* ============================================================
   GAMER HUT — Controls assembly (template-aware fields)
   ============================================================ */

function Controls({ s, set, tag, onCover, pageIdx, pickTemplate, setS }){
  const isCarousel = s.template==='carousel';
  const isImage    = s.template==='image';
  const isReels    = s.template==='reels';
  const isBlock    = s.template==='block';
  const isQuiz     = s.template==='quiz';
  const isRanking  = s.template==='ranking';
  const isThumb    = s.template==='thumb';
  const isArrivals = s.template==='arrivals';
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

      {(isBlock||isQuiz||isRanking||isArrivals) &&
        <CtrlSection title="FORMATO" right={
          <span className="gh-mono" style={{ color:GH.mut, fontSize:9, letterSpacing:'.1em' }}>
            {s.format==='stories'?'9:16 · 1080×1920':'4:5 · 1080×1350'}</span>}>
          <Segmented value={s.format||'feed'} onChange={v=>set({ format:v })}
            options={[ {id:'feed', label:'FEED 4:5'}, {id:'stories', label:'STORIES 9:16'} ]}/>
        </CtrlSection>}

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
          <div style={{ marginBottom:18 }}>
            <Segmented value={curPage.type==='video'?'video':'standard'} onChange={v=>{
              if(v==='video') setPage({ type:'video',
                eyebrow: curPage.eyebrow ?? 'VEM VER EM AÇÃO',
                title:   curPage.title   || 'ASSISTA AO',
                accent:  curPage.accent  ?? 'TRAILER',
                footer:  curPage.footer  ?? 'PRÉ-VENDA aberta agora na Gamer Hut' });
              else setPage({ type:'standard' });
            }} options={[ {id:'standard', label:'PADRÃO'}, {id:'video', label:'VÍDEO'} ]}/>
          </div>
          {curPage.type==='video' ? <>
            <Field label="Sobre-título (eyebrow)">
              <TextInput value={curPage.eyebrow||''} placeholder="VEM VER EM AÇÃO"
                onChange={e=>setPage({eyebrow:e.target.value})}/>
            </Field>
            <Field label="Título">
              <TextInput value={curPage.title||''} placeholder="ASSISTA AO"
                onChange={e=>setPage({title:e.target.value})}/>
            </Field>
            <Field label="Palavra em destaque (cor da tag)">
              <TextInput value={curPage.accent||''} placeholder="TRAILER"
                onChange={e=>setPage({accent:e.target.value})}/>
            </Field>
            <Field label="Trailer (vídeo)">
              <VideoDrop value={curPage.video} name={curPage.videoName}
                onChange={(url,name)=>setPage({video:url, videoName:name})}/>
            </Field>
            <Field label="Arte do jogo (fundo)">
              <ImageDrop value={curPage.image} onChange={v=>setPage({image:v})} label="Arte de fundo"
                blur={curPage.imageBlur} onBlur={v=>setPage({imageBlur:v})}/>
            </Field>
            <Field label="Rodapé (chamada)">
              <TextInput value={curPage.footer||''} placeholder="PRÉ-VENDA aberta agora na Gamer Hut"
                onChange={e=>setPage({footer:e.target.value})}/>
            </Field>
            <div style={{ background:GH.bg, border:`1px solid ${GH.lineSoft}`, borderRadius:9, padding:'14px 13px', marginBottom:14 }}>
              <Toggle label="Som do trailer no vídeo" checked={s.videoAudio!==false}
                onChange={v=>set({ videoAudio:v })}/>
              <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.6, margin:'9px 0 0', letterSpacing:'.02em' }}>
                Mantenha <span style={{ color:GH.white }}>ligado</span> para o vídeo sair em MP4 com áudio (quando o
                navegador permite). Se o player do Windows acusar <span style={{ color:GH.white }}>áudio Opus</span> ou
                o Instagram recusar o arquivo, <span style={{ color:GH.white }}>desligue o som</span> — o vídeo sai
                limpo e toca em qualquer lugar.</p>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:GH.bg,
              border:`1px solid ${GH.lineSoft}`, borderRadius:9, padding:'12px 13px' }}>
              <span style={{ color:GH.orange, fontSize:13, lineHeight:1.3 }}>●</span>
              <p className="gh-mono" style={{ margin:0, color:GH.mut, fontSize:10, lineHeight:1.6, letterSpacing:'.03em' }}>
                Página <span style={{ color:GH.white }}>4:5 · 1080×1350</span> com o trailer
                <span style={{ color:GH.white }}> horizontal 16:9</span> dentro. Use <span style={{ color:GH.white }}>EXPORTAR
                VÍDEO</span> (topo) para gerar o arquivo com o trailer tocando, ou <span style={{ color:GH.white }}>CAPA
                PNG</span> para a thumbnail.</p>
            </div>
          </> : <>
            <Field label="Título da página">
              <TextInput value={curPage.title||''} onChange={e=>setPage({title:e.target.value})}/>
            </Field>
            <Field label="Texto / informação">
              <TextArea value={curPage.body||''} onChange={e=>setPage({body:e.target.value})}/>
            </Field>
            <Field label="Imagem do jogo (fundo)">
              <ImageDrop value={curPage.image} onChange={v=>setPage({image:v})}
                blur={curPage.imageBlur} onBlur={v=>setPage({imageBlur:v})}/>
            </Field>
          </>}
        </> : isQuiz ? <QuizFields s={s} set={set}/>
          : isRanking ? <RankingFields s={s} set={set} setS={setS}/>
          : isThumb ? <ThumbFields s={s} set={set}/>
          : isArrivals ? <ArrivalsFields s={s} set={set} setS={setS}/>
          : <>
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
              <ImageDrop value={s.image} onChange={v=>set({image:v})}
                blur={s.imageBlur} onBlur={v=>set({imageBlur:v})}/>
            </Field>
            <Field label="Etiqueta de preço / status">
              <TextInput value={s.priceLabel||''} placeholder="R$ 349 · LACRADO" onChange={e=>set({priceLabel:e.target.value})}/>
            </Field>
          </>}
          {isReels && <Field label="Imagem de fundo (opcional)">
            <ImageDrop value={s.image} onChange={v=>set({image:v})} label="Imagem de fundo"
              blur={s.imageBlur} onBlur={v=>set({imageBlur:v})}/>
          </Field>}
          {isCarousel && onCover && <Field label="Imagem de fundo da capa (opcional)">
            <ImageDrop value={s.image} onChange={v=>set({image:v})} label="Imagem da capa"
              blur={s.imageBlur} onBlur={v=>set({imageBlur:v})}/>
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
          {(isReels||isCarousel||isQuiz||isRanking||isThumb) && s.image
            ? <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.5, margin:0 }}>
                Imagem de fundo ativa — remova-a acima para usar padrões ou cor sólida.</p>
            : <>
              <div style={{ marginBottom:14 }}>
                <PatternPicker value={s.pattern} accent={accent} onChange={p=>set({pattern:p})}/>
              </div>
              {s.pattern!=='solid' &&
                <div style={{ marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <span className="gh-mono" style={{ color:GH.mut, fontSize:11, letterSpacing:'.14em' }}>OPACIDADE DO ESTILO</span>
                    <span className="gh-pixel" style={{ color:GH.orange, fontSize:11 }}>{Math.round(s.patternOpacity??100)}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={s.patternOpacity??100}
                    onChange={e=>set({ patternOpacity:+e.target.value })} style={{ width:'100%', accentColor:GH.orange }}/>
                </div>}
              {(isBlock||isCarousel||isReels||isQuiz||isRanking||isThumb||isArrivals) &&
                <div style={{ marginTop:6 }}>
                  <Toggle label="Preencher com a cor da tag" checked={s.fill} onChange={v=>set({fill:v})}/>
                </div>}
            </>}
        </CtrlSection>}

      {/* BLOCK — custom background + text color, independent of the tag */}
      {isBlock &&
        <CtrlSection title="CORES DO POST"
          right={<span className="gh-mono" style={{ color:GH.mut, fontSize:9, letterSpacing:'.1em' }}>INDEPENDE DA TAG</span>}>
          <Field label="Cor de fundo">
            <ColorField value={s.blockBg||null} onChange={v=>set({ blockBg:v })} fallbackLabel="COR DA TAG"/>
          </Field>
          <Field label="Cor do texto">
            <ColorField value={s.blockInk||null} onChange={v=>set({ blockInk:v })} fallbackLabel="AUTO"/>
          </Field>
          <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.5, margin:'2px 0 0' }}>
            “COR DA TAG” e “AUTO” seguem a categoria. Escolha um tom para fixar o fundo e o texto
            independente da tag — o selo da categoria continua com a cor original.</p>
        </CtrlSection>}

      {/* INK — text + logo color */}
      {((onCover && !isBlock) || isImage) &&
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

/* ---- QUIZ fields ---- */
function MiniBtn({ children, onClick, danger }){
  return <button onClick={onClick} className="gh-mono" style={{ flex:'none', cursor:'pointer',
    width:34, height:42, borderRadius:8, border:`1px solid ${GH.lineSoft}`, background:GH.bg,
    color:danger?'#E23B2E':GH.mut, fontSize:13 }}>{children}</button>;
}
function ChoiceBtn({ on, onClick, children }){
  return <button onClick={onClick} className="gh-mono" style={{ flex:1, cursor:'pointer', padding:'9px 0',
    borderRadius:7, fontSize:11, fontWeight:700, letterSpacing:'.04em',
    background:on?GH.orange:GH.bg, color:on?GH.ink:GH.white,
    border:`1px solid ${on?GH.orange:GH.lineSoft}` }}>{children}</button>;
}
function QuizFields({ s, set }){
  const esseou = s.quizMode==='esseou';
  const opts = s.quizOptions||[];
  const letters = ['A','B','C','D'];
  const setOpt = (i,v)=>{ const a=opts.slice(); a[i]=v; set({ quizOptions:a }); };
  const addOpt = ()=>{ if(opts.length<4) set({ quizOptions:[...opts,'NOVA OPÇÃO'] }); };
  const delOpt = (i)=>{ const a=opts.slice(); a.splice(i,1);
    let ans=s.answer; if(ans===i) ans=-1; else if(ans>i) ans=ans-1; set({ quizOptions:a, answer:ans }); };
  return (
    <>
      <div style={{ marginBottom:18 }}>
        <Segmented value={s.quizMode||'pergunta'} onChange={v=>set({ quizMode:v })}
          options={[ {id:'pergunta', label:'PERGUNTA'}, {id:'esseou', label:'ESSE OU AQUELE'} ]}/>
      </div>
      <Field label="Sobre-título (eyebrow)">
        <TextInput value={s.eyebrow||''} onChange={e=>set({ eyebrow:e.target.value })}/>
      </Field>
      <Field label="Imagem de fundo (opcional)">
        <ImageDrop value={s.image} onChange={v=>set({ image:v })} label="Imagem de fundo"
          blur={s.imageBlur} onBlur={v=>set({ imageBlur:v })}/>
      </Field>
      {!esseou ? <>
        <Field label="Pergunta">
          <TextArea value={s.question||''} onChange={e=>set({ question:e.target.value })} style={{ minHeight:64 }}/>
        </Field>
        <Field label="Opções (até 4)">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {opts.map((o,i)=>(
              <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span className="gh-pixel" style={{ flex:'none', width:24, textAlign:'center',
                  color:GH.orange, fontSize:12 }}>{letters[i]}</span>
                <TextInput value={o} onChange={e=>setOpt(i,e.target.value)} style={{ flex:1 }}/>
                {opts.length>2 && <MiniBtn danger onClick={()=>delOpt(i)}>✕</MiniBtn>}
              </div>
            ))}
            {opts.length<4 && <button onClick={addOpt} className="gh-mono" style={{ cursor:'pointer',
              background:'transparent', border:`1px dashed ${GH.line}`, color:GH.mut, fontSize:11,
              letterSpacing:'.06em', padding:'10px 0', borderRadius:8 }}>+ ADICIONAR OPÇÃO</button>}
          </div>
        </Field>
        <Field label="Resposta certa (destaque opcional)">
          <div style={{ display:'flex', gap:6 }}>
            <ChoiceBtn on={s.answer==null||s.answer===-1} onClick={()=>set({ answer:-1 })}>—</ChoiceBtn>
            {opts.map((o,i)=><ChoiceBtn key={i} on={s.answer===i} onClick={()=>set({ answer:i })}>{letters[i]}</ChoiceBtn>)}
          </div>
        </Field>
        <div style={{ marginTop:2 }}>
          <Toggle label="Esconder opções (usar enquete do Instagram)" checked={!!s.hideOptions}
            onChange={v=>set({ hideOptions:v })}/>
          <p className="gh-mono" style={{ color:GH.mut, fontSize:10, lineHeight:1.5, margin:'8px 0 0' }}>
            Deixa só a pergunta no topo — espaço livre embaixo pra colar o sticker de
            quiz/enquete do próprio Instagram.</p>
        </div>
      </> : <>
        <Field label="Pergunta (opcional)">
          <TextInput value={s.question||''} placeholder="VOCÊ PREFERE?" onChange={e=>set({ question:e.target.value })}/>
        </Field>
        <Field label="Opção A — texto">
          <TextInput value={s.aLabel||''} onChange={e=>set({ aLabel:e.target.value })}/>
        </Field>
        <Field label="Opção A — imagem">
          <ImageDrop value={s.aImg} onChange={v=>set({ aImg:v })} label="Imagem A"
            blur={s.aImgBlur} onBlur={v=>set({ aImgBlur:v })}/>
        </Field>
        <Field label="Opção B — texto">
          <TextInput value={s.bLabel||''} onChange={e=>set({ bLabel:e.target.value })}/>
        </Field>
        <Field label="Opção B — imagem">
          <ImageDrop value={s.bImg} onChange={v=>set({ bImg:v })} label="Imagem B"
            blur={s.bImgBlur} onBlur={v=>set({ bImgBlur:v })}/>
        </Field>
        <Field label="Divisor (centro)">
          <TextInput value={s.vsWord||''} placeholder="OU" onChange={e=>set({ vsWord:e.target.value })}/>
        </Field>
      </>}
    </>
  );
}

/* ---- RANKING fields ---- */
function RankingFields({ s, set, setS }){
  const n = s.rankCount||5;
  const items = s.rankItems||[];
  const setItem = (i,patch)=> setS(p=>{ const a=(p.rankItems||[]).slice();
    while(a.length<=i) a.push({ name:'', note:'' }); a[i]={ ...a[i], ...patch }; return { ...p, rankItems:a }; });
  return (
    <>
      <Field label="Sobre-título (eyebrow)">
        <TextInput value={s.eyebrow||''} onChange={e=>set({ eyebrow:e.target.value })}/>
      </Field>
      <Field label="Título">
        <TextArea value={s.title||''} onChange={e=>set({ title:e.target.value })} style={{ minHeight:56 }}/>
      </Field>
      <Field label="Quantidade de itens">
        <Stepper label="" value={n} min={3} max={6} onChange={v=>setS(p=>{
          const a=(p.rankItems||[]).slice(); while(a.length<v) a.push({ name:'', note:'' });
          return { ...p, rankCount:v, rankItems:a };
        })}/>
      </Field>
      <Field label="Itens (nome + tag curta)">
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {Array.from({length:n}).map((_,i)=>{
            const it = items[i]||{};
            return (
              <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span className="gh-display" style={{ flex:'none', width:28, textAlign:'center',
                  color:i===0?GH.orange:GH.mut, fontSize:16 }}>{String(i+1).padStart(2,'0')}</span>
                <TextInput value={it.name||''} placeholder="Nome do jogo"
                  onChange={e=>setItem(i,{ name:e.target.value })} style={{ flex:1 }}/>
                <TextInput value={it.note||''} placeholder="tag"
                  onChange={e=>setItem(i,{ note:e.target.value })} style={{ width:78, flex:'none' }}/>
              </div>
            );
          })}
        </div>
      </Field>
      <Field label="Imagem de fundo (opcional)">
        <ImageDrop value={s.image} onChange={v=>set({ image:v })} label="Imagem de fundo"
          blur={s.imageBlur} onBlur={v=>set({ imageBlur:v })}/>
      </Field>
    </>
  );
}

/* ---- YOUTUBE THUMBNAIL fields ---- */
function ThumbFields({ s, set }){
  return (
    <>
      <Field label="Badge (canto superior)">
        <TextInput value={s.badge||''} placeholder="ex: REVIEW" onChange={e=>set({ badge:e.target.value })}/>
      </Field>
      <Field label="Sobre-título (eyebrow)">
        <TextInput value={s.eyebrow||''} placeholder="ANÁLISE COMPLETA" onChange={e=>set({ eyebrow:e.target.value })}/>
      </Field>
      <Field label="Título principal (curto e forte)">
        <TextArea value={s.title||''} onChange={e=>set({ title:e.target.value })} style={{ minHeight:60 }}/>
      </Field>
      <Field label="Palavra em destaque (cor da tag)">
        <TextInput value={s.accentWord||''} placeholder="ex: EM 2025" onChange={e=>set({ accentWord:e.target.value })}/>
      </Field>
      <Field label="Arte do jogo (fundo)">
        <ImageDrop value={s.image} onChange={v=>set({ image:v })} label="Arte do jogo"
          blur={s.imageBlur} onBlur={v=>set({ imageBlur:v })}/>
      </Field>
      <Field label="Etiqueta (canto inferior · opcional)">
        <TextInput value={s.priceLabel||''} placeholder="ex: 12 MIN · 4K" onChange={e=>set({ priceLabel:e.target.value })}/>
      </Field>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:GH.bg,
        border:`1px solid ${GH.lineSoft}`, borderRadius:9, padding:'12px 13px' }}>
        <span style={{ color:GH.orange, fontSize:13, lineHeight:1.3 }}>●</span>
        <p className="gh-mono" style={{ margin:0, color:GH.mut, fontSize:10, lineHeight:1.6, letterSpacing:'.03em' }}>
          Tamanho <span style={{ color:GH.white }}>1280×720 · 16:9</span>, a capa de vídeo do YouTube.
          Ajuste a fonte gigante em <span style={{ color:GH.white }}>TIPOGRAFIA</span> e a cor do texto em
          <span style={{ color:GH.white }}> COR DO TEXTO / LOGO</span>.</p>
      </div>
    </>
  );
}

/* ---- NOVIDADES DA SEMANA fields ---- */
function ArrivalsFields({ s, set, setS }){
  const n = s.arrivalCount||4;
  const items = s.arrivals||[];
  const setItem = (i,patch)=> setS(p=>{ const a=(p.arrivals||[]).slice();
    while(a.length<=i) a.push({ name:'', price:'', image:null }); a[i]={ ...a[i], ...patch }; return { ...p, arrivals:a }; });
  return (
    <>
      <Field label="Sobre-título (eyebrow)">
        <TextInput value={s.eyebrow||''} placeholder="CHEGOU NA LOJA" onChange={e=>set({ eyebrow:e.target.value })}/>
      </Field>
      <Field label="Título">
        <TextArea value={s.title||''} onChange={e=>set({ title:e.target.value })} style={{ minHeight:56 }}/>
      </Field>
      <Field label="Quantidade de itens">
        <Stepper label="" value={n} min={2} max={6} onChange={v=>setS(p=>{
          const a=(p.arrivals||[]).slice(); while(a.length<v) a.push({ name:'', console:'', image:null });
          return { ...p, arrivalCount:v, arrivals:a };
        })}/>
      </Field>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {Array.from({length:n}).map((_,i)=>{
          const it = items[i]||{};
          return (
            <div key={i} style={{ background:GH.bg, border:`1px solid ${GH.lineSoft}`, borderRadius:10, padding:'13px 13px' }}>
              <div className="gh-pixel" style={{ color:GH.orange, fontSize:11, letterSpacing:'.04em', marginBottom:11 }}>
                ITEM {String(i+1).padStart(2,'0')}</div>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <TextInput value={it.name||''} placeholder="Nome do jogo"
                  onChange={e=>setItem(i,{ name:e.target.value })} style={{ flex:1 }}/>
                <TextInput value={it.console||''} placeholder="PS5"
                  onChange={e=>setItem(i,{ console:e.target.value })} style={{ width:104, flex:'none' }}/>
              </div>
              <ImageDrop value={it.image} onChange={v=>setItem(i,{ image:v })} label="Capa do jogo"
                blur={it.imageBlur} onBlur={v=>setItem(i,{ imageBlur:v })}/>
            </div>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, { Controls });
