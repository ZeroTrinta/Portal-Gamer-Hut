/* Physical media campaign: three editable layouts, shared Feed/Stories composition. */
const CAMPAIGN_ORANGE='#FF5B0A';
const CAMPAIGN_NOTICE='PROMOÇÃO SUJEITA À ALTERAÇÃO DE PREÇO E ESTOQUE';
const campaignText={overflow:'hidden',overflowWrap:'anywhere',minWidth:0};
function CampaignBackground({offer}){
  const mode=offer.campaignBg||(offer.image?'image':'embers');
  return <>
    <div style={{position:'absolute',inset:0,background:offer.offerBgColor||'#080807'}}/>
    {mode==='embers' && <img src="assets/campaign-embers.svg" alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
    {mode==='image' && offer.image && <div style={{position:'absolute',inset:0}}><ImageOrSlot src={offer.image} zoom={offer.imageZoom} x={offer.imageX} y={offer.imageY} blur={offer.imageBlur}/></div>}
    <div style={{position:'absolute',inset:0,background:`rgba(0,0,0,${Math.max(0,Math.min(90,offer.offerShade??(mode==='image'?45:0)))/100})`}}/>
  </>;
}
function CampaignBrand({logo,name,height=65}){
  return logo?<img src={logo} alt={name||''} style={{display:'block',height,maxWidth:'100%',objectFit:'contain',margin:'0 auto'}}/>:name?<div data-campaign-fit className="gh-display" style={{...campaignText,height,lineHeight:1.15,fontSize:32,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}}>{name}</div>:null;
}
function CampaignBody({s,pageIndex=0}){
  const offer=pageIndex===0?s:(s.pages?.[pageIndex-1]||{});
  const accent=offer.offerAccent||CAMPAIGN_ORANGE;
  const props={offer,accent};
  return <div style={{position:'absolute',inset:0,color:'#fff',background:'#080807',overflow:'hidden'}}>
    <CampaignBackground offer={offer}/>
    <div data-offer-composition style={{position:'absolute',top:s.offerFormat==='stories'?285:0,left:0,width:1080,height:1350}}>
      {s.showPageCounter!==false && <div data-page-counter className="gh-mono" style={{position:'absolute',top:28,right:38,zIndex:2,fontSize:18,color:'#ddd',background:'#0009',padding:'5px 8px',borderRadius:4}}>{String(pageIndex+1).padStart(2,'0')} / {String(s.pageCount).padStart(2,'0')}</div>}
      {s.template==='physicalhighlights'?<CampaignHighlights {...props}/>:s.template==='physicallist'?<CampaignList {...props}/>:<CampaignIndividual {...props}/>}
    </div>
  </div>;
}
function CampaignHighlights({offer,accent}){
  const items=campaignItems(offer),n=items.length;
  const heading=offer.campaignHeading??'DESTAQUES';
  const hasBrand=!!(offer.campaignBrandLogo||offer.campaignBrandName);
  const top=hasBrand?320:235,bottom=offer.campaignNotice?1260:1290;
  const rowH=(bottom-top)/n;
  return <>
    <div style={{position:'absolute',top:47,left:0,right:0,display:'flex',justifyContent:'center'}}><Lockup h={46}/></div>
    <h1 data-campaign-fit className="gh-display" style={{...campaignText,position:'absolute',left:55,right:55,top:112,height:104,margin:0,fontSize:heading.length>20?55:88,lineHeight:1.15,textAlign:'center',color:accent,letterSpacing:'-.035em'}}>{heading}</h1>
    {hasBrand && <div style={{position:'absolute',left:140,right:140,top:229,height:72}}><CampaignBrand logo={offer.campaignBrandLogo} name={offer.campaignBrandName} height={68}/></div>}
    <div style={{position:'absolute',left:60,right:60,top,height:bottom-top}}>
      {items.map((item,i)=><div key={i} data-campaign-fit style={{display:'flex',gap:24,height:rowH,padding:'12px 0',boxSizing:'border-box',overflow:'hidden'}}>
        <div style={{width:n===4?165:210,flexShrink:0,height:'100%'}}>{item.image?<img src={item.image} alt="" style={{display:'block',width:'100%',height:'100%',objectFit:'contain'}}/>:<div className="gh-mono" style={{height:'100%',border:'1px dashed #ffffff44',display:'grid',placeItems:'center',fontSize:18,color:'#aaa'}}>CAPA {i+1}</div>}</div>
        <div style={{minWidth:0,flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:4,borderBottom:i<n-1?`2px solid ${accent}`:'none',paddingBottom:12}}>
          <div data-campaign-fit className="gh-display" style={{...campaignText,fontSize:n===4?29:34,lineHeight:1.12,maxHeight:n===4?66:77,flexShrink:0}}>{item.title||'NOME DO JOGO'}</div>
          {item.platform && <div data-campaign-fit className="gh-display" style={{...campaignText,color:accent,fontSize:n===4?24:29,lineHeight:1.15,maxHeight:36,flexShrink:0}}>{item.platform}</div>}
          {item.oldPrice && <div data-campaign-fit className="gh-body" style={{...campaignText,color:'#858585',fontSize:25,lineHeight:1.15,maxHeight:32,flexShrink:0}}><del>DE {item.oldPrice}</del></div>}
          {item.price && <div data-campaign-fit className="gh-display" style={{...campaignText,color:accent,fontSize:n===4?43:54,lineHeight:1.15,maxHeight:n===4?54:66,flexShrink:0}}><span style={{fontSize:26}}>POR </span>{item.price}</div>}
        </div>
      </div>)}
    </div>
    {offer.campaignNotice && <div data-campaign-fit className="gh-body" style={{...campaignText,position:'absolute',left:60,right:60,top:1280,height:42,textAlign:'center',fontSize:17,lineHeight:1.2,color:'#bbb'}}>{offer.campaignNotice}</div>}
  </>;
}
function CampaignList({offer,accent}){
  const groups=campaignGroups(offer),columns=[groups.filter((_,i)=>i%2===0),groups.filter((_,i)=>i%2===1)];
  const heading=offer.campaignHeading??'MAIS JOGOS EM OFERTA';
  return <>
    <h1 data-campaign-fit className="gh-display" style={{...campaignText,position:'absolute',top:55,left:115,right:115,height:148,margin:0,fontSize:64,lineHeight:1.08,textAlign:'center',color:accent}}>{heading}</h1>
    <div style={{position:'absolute',left:58,right:58,top:220,height:985,display:'grid',gridTemplateColumns:groups.length===1?'1fr':'1fr 1fr',gap:58}}>
      {columns.filter(col=>col.length).map((col,ci)=>{
        const headers=col.filter(g=>g.logo||g.name).length*78;
        const rowH=(985-headers-(col.length-1)*24)/col.reduce((sum,g)=>sum+g.items.length,0);
        const font=Math.max(14,Math.min(26,(rowH-8)/4.8));
        return <div key={ci} style={{minWidth:0,display:'flex',flexDirection:'column',gap:24}}>
          {col.map((group,gi)=><div key={gi} data-campaign-group style={{minWidth:0}}>
            {(group.logo||group.name) && <div style={{height:78,paddingBottom:16}}><CampaignBrand logo={group.logo} name={group.name} height={62}/></div>}
            {group.items.map((item,i)=><div key={i} data-campaign-fit style={{height:rowH,boxSizing:'border-box',padding:'4px 0',borderBottom:`1px solid ${accent}`,display:'flex',flexDirection:'column',justifyContent:'space-between',overflow:'hidden'}}>
              <div data-campaign-fit className="gh-display" style={{...campaignText,fontSize:font,lineHeight:1.1,maxHeight:font*2.25,flexShrink:0}}>{item.title||'NOME DO JOGO'}</div>
              {item.platform && <div data-campaign-fit className="gh-display" style={{...campaignText,fontSize:Math.max(13,font-2),lineHeight:1.1,color:accent,maxHeight:font+2,flexShrink:0}}>{item.platform}</div>}
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:8,flexShrink:0}}>
                <del data-campaign-fit className="gh-body" style={{...campaignText,color:'#777',fontSize:Math.max(13,font-2),lineHeight:1.1,maxHeight:font+2,maxWidth:'47%'}}>{item.oldPrice?'DE '+item.oldPrice:''}</del>
                <strong data-campaign-fit className="gh-body" style={{...campaignText,fontSize:font+5,lineHeight:1.1,color:accent,maxHeight:font+9,textAlign:'right'}}>{item.price||''}</strong>
              </div>
            </div>)}
          </div>)}
        </div>;
      })}
    </div>
    <div style={{position:'absolute',top:1240,left:0,right:0,display:'flex',justifyContent:'center'}}><Lockup h={48}/></div>
    {offer.campaignNotice && <div data-campaign-fit className="gh-body" style={{...campaignText,position:'absolute',top:1300,left:60,right:60,height:32,fontSize:15,lineHeight:1.1,textAlign:'center',color:'#bbb'}}>{offer.campaignNotice}</div>}
  </>;
}
function CampaignIndividual({offer,accent}){
  const notice=offer.campaignNotice??CAMPAIGN_NOTICE;
  return <>
    {notice && <div data-campaign-fit className="gh-display" style={{...campaignText,position:'absolute',left:225,right:225,top:115,height:120,fontSize:28,lineHeight:1.15,textAlign:'center'}}>{notice}</div>}
    {offer.campaignShowTitle && <div data-campaign-fit className="gh-display" style={{...campaignText,position:'absolute',left:80,right:80,top:235,height:106,fontSize:42,lineHeight:1.15,textAlign:'center'}}>{offer.title||''}</div>}
    {offer.mockup && <div style={{position:'absolute',left:130,right:130,top:offer.campaignShowTitle?345:265,height:offer.campaignShowTitle?550:630,display:'flex',justifyContent:'center',alignItems:'center',transform:`translate(${offer.mockupX||0}px,${offer.mockupY||0}px) rotate(${offer.mockupRotate??0}deg) scale(${(offer.mockupScale??100)/100})`}}><img src={offer.mockup} alt="" style={{display:'block',maxWidth:'100%',maxHeight:'100%',objectFit:'contain',filter:'drop-shadow(0 20px 25px #0009)'}}/></div>}
    {offer.offerPlatform && <div data-campaign-fit className="gh-display" style={{...campaignText,position:'absolute',top:895,left:150,right:150,height:40,fontSize:26,lineHeight:1.15,textAlign:'center'}}>{offer.offerPlatform}</div>}
    {offer.offerShowPrice!==false && <>
      {offer.oldPrice && <div data-campaign-fit className="gh-mono" style={{...campaignText,position:'absolute',left:125,right:125,top:960,height:65,fontSize:43,lineHeight:1.2,letterSpacing:5,textAlign:'center',fontWeight:700,textShadow:'0 2px 10px #000'}}><del>DE {offer.oldPrice}</del></div>}
      {offer.salePrice && <div data-campaign-fit className="gh-mono" style={{...campaignText,position:'absolute',left:165,right:165,top:1042,height:105,background:'#030303',border:`2px solid ${accent}`,borderRadius:14,display:'flex',justifyContent:'center',alignItems:'center',padding:'10px 25px',fontSize:45,lineHeight:1.15,letterSpacing:4,fontWeight:700}}>POR {offer.salePrice}</div>}
    </>}
    {offer.offerNote && <div data-campaign-fit className="gh-body" style={{...campaignText,position:'absolute',top:1166,left:100,right:100,height:50,fontSize:22,lineHeight:1.15,textAlign:'center'}}>{offer.offerNote}</div>}
    <div style={{position:'absolute',top:1240,left:0,right:0,display:'flex',justifyContent:'center'}}><Lockup h={65}/></div>
  </>;
}

function CampaignFields({offer,setOffer,template}){
  const highlights=template==='physicalhighlights',list=template==='physicallist',single=!highlights&&!list;
  const input=(label,key,placeholder='')=><Field label={label}><TextInput value={offer[key]??''} placeholder={placeholder} onChange={e=>setOffer({[key]:e.target.value})}/></Field>;
  const slider=(label,key,min,max,def)=><Field label={label}><input aria-label={label} type="range" min={min} max={max} value={offer[key]??def} onChange={e=>setOffer({[key]:+e.target.value})} style={{width:'100%',accentColor:GH.orange}}/></Field>;
  const itemFields=(item,change,cover)=> <>
    {cover && <Field label="Capa / mockup"><ImageDrop value={item.image} onChange={image=>change({image})} showAdjustments={false}/></Field>}
    <Field label="Nome do jogo"><TextInput value={item.title||''} onChange={e=>change({title:e.target.value})}/></Field>
    <Field label="Plataformas"><TextInput value={item.platform||''} placeholder="PS5 / SWITCH / SWITCH 2" onChange={e=>change({platform:e.target.value})}/></Field>
    <Field label="Preço anterior"><TextInput value={item.oldPrice||''} placeholder="R$ 319,97" onChange={e=>change({oldPrice:e.target.value})}/></Field>
    <Field label="Preço promocional"><TextInput value={item.price||''} placeholder="R$ 249,97" onChange={e=>change({price:e.target.value})}/></Field>
  </>;
  const section={border:`1px solid ${GH.lineSoft}`,borderRadius:8,padding:12,marginBottom:12,color:GH.white};
  return <>
    {!single && <Field label="Título da página"><TextInput value={offer.campaignHeading??(highlights?'DESTAQUES':'MAIS JOGOS EM OFERTA')} onChange={e=>setOffer({campaignHeading:e.target.value})}/></Field>}
    {highlights && <>
      <Field label="Logo da marca abaixo do título"><ImageDrop value={offer.campaignBrandLogo} onChange={v=>setOffer({campaignBrandLogo:v})} showAdjustments={false}/></Field>
      {input('Nome da marca (quando não houver logo)','campaignBrandName')}
      <Field label="Quantidade de destaques"><Stepper value={campaignCount(offer.campaignItemCount,4,4)} min={1} max={4} onChange={v=>setOffer({campaignItemCount:v})}/></Field>
      {campaignItems(offer).map((item,i)=><details key={i} open={i===0} style={section}><summary style={{cursor:'pointer',marginBottom:12}}>JOGO {i+1}{item.title?' · '+item.title:''}</summary>{itemFields(item,patch=>{const items=(offer.campaignItems||[]).slice();items[i]={...item,...patch};setOffer({campaignItems:items});},true)}</details>)}
    </>}
    {list && <>
      <Field label="Blocos / marcas"><Stepper value={campaignCount(offer.campaignGroupCount,2,4)} min={1} max={4} onChange={v=>setOffer({campaignGroupCount:v})}/></Field>
      <p style={{color:GH.mut,fontSize:11,lineHeight:1.5}}>Blocos 1 e 3 ficam à esquerda; 2 e 4, à direita. Listas maiores reduzem o tamanho dos textos. Distribua em mais páginas se necessário.</p>
      {campaignGroups(offer).map((group,gi)=>{
        const update=patch=>{const groups=(offer.campaignGroups||[]).slice();groups[gi]={...groups[gi],...patch};setOffer({campaignGroups:groups});};
        return <details key={gi} open={gi===0} style={section}><summary style={{cursor:'pointer',marginBottom:12}}>BLOCO {gi+1} · {gi%2===0?'ESQUERDA':'DIREITA'}</summary>
          <Field label="Logo da marca"><ImageDrop value={group.logo} onChange={logo=>update({logo})} showAdjustments={false}/></Field>
          <Field label="Nome da marca (sem logo)"><TextInput value={group.name||''} onChange={e=>update({name:e.target.value})}/></Field>
          <Field label="Jogos neste bloco"><Stepper value={group.items.length} min={1} max={12} onChange={count=>update({count})}/></Field>
          {group.items.map((item,i)=><details key={i} style={{borderTop:`1px solid ${GH.lineSoft}`,paddingTop:10,marginTop:10}}><summary style={{cursor:'pointer',marginBottom:12}}>JOGO {i+1}{item.title?' · '+item.title:''}</summary>{itemFields(item,patch=>{const stored=offer.campaignGroups?.[gi]?.items;const items=Array.isArray(stored)?stored.slice():[];items[i]={...item,...patch};update({items});},false)}</details>)}
        </details>;
      })}
    </>}
    {single && <>
      <Toggle label="Mostrar nome do jogo" checked={!!offer.campaignShowTitle} onChange={v=>setOffer({campaignShowTitle:v})}/>
      {offer.campaignShowTitle && input('Nome do jogo','title')}
      <Field label="Mockup do jogo (opcional)"><ImageDrop value={offer.mockup} onChange={v=>setOffer({mockup:v})} showAdjustments={false}/></Field>
      {offer.mockup && <>{slider('Tamanho do mockup (%)','mockupScale',40,120,100)}{slider('Rotação do mockup','mockupRotate',-18,18,0)}{slider('Posição horizontal','mockupX',-100,100,0)}{slider('Posição vertical','mockupY',-70,70,0)}</>}
      {input('Plataforma / observação curta','offerPlatform')}
      <Toggle label="Mostrar preços" checked={offer.offerShowPrice!==false} onChange={v=>setOffer({offerShowPrice:v})}/>
      {offer.offerShowPrice!==false && <>{input('Preço anterior riscado','oldPrice','R$ 430,24')}{input('Preço promocional','salePrice','R$ 299,89')}</>}
      {input('Condição complementar (opcional)','offerNote')}
    </>}
    <Field label="Aviso de preço / estoque"><TextArea value={offer.campaignNotice??(single?CAMPAIGN_NOTICE:'')} onChange={e=>setOffer({campaignNotice:e.target.value})}/></Field>
    <details open style={section}><summary style={{cursor:'pointer',marginBottom:16}}>FUNDO E COR</summary>
      <Field label="Tipo de fundo"><select aria-label="Tipo de fundo" style={inputBase} value={offer.campaignBg||(offer.image?'image':'embers')} onChange={e=>setOffer({campaignBg:e.target.value})}><option value="embers">Textura preta e laranja</option><option value="image">Imagem enviada</option><option value="solid">Cor sólida</option></select></Field>
      <Field label="Imagem de fundo"><ImageDrop value={offer.image} onChange={v=>setOffer({image:v,...(v?{campaignBg:'image'}:{})})} blur={offer.imageBlur} onBlur={v=>setOffer({imageBlur:v})} zoom={offer.imageZoom} onZoom={v=>setOffer({imageZoom:v})} imgX={offer.imageX} onImgX={v=>setOffer({imageX:v})} imgY={offer.imageY} onImgY={v=>setOffer({imageY:v})}/></Field>
      {slider('Escurecer fundo','offerShade',0,90,offer.image?45:0)}
      <Field label="Cor de destaque"><input aria-label="Cor de destaque" type="color" value={offer.offerAccent||CAMPAIGN_ORANGE} onChange={e=>setOffer({offerAccent:e.target.value})}/></Field>
      <Field label="Cor sólida"><input aria-label="Cor sólida" type="color" value={offer.offerBgColor||'#080807'} onChange={e=>setOffer({offerBgColor:e.target.value})}/></Field>
    </details>
  </>;
}
