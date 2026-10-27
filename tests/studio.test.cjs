const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const babel=require(process.env.BABEL_PATH||'@babel/standalone');
const ctx={console,window:{},React:{createElement:(type,props,...children)=>({type,props:props||{},children})},ReactDOM:{createRoot:()=>({render(){}})},document:{getElementById(){}},localStorage:{getItem:()=>null}};
vm.createContext(ctx);
for(const f of ['data','preview','controls','panel','app']) vm.runInContext(babel.transform(fs.readFileSync(`app/${f}.jsx`,'utf8'),{presets:['react']}).code,ctx);
const run=code=>vm.runInContext(code,ctx);
function nodes(n,pred){if(!n||typeof n!=='object')return [];return [...(pred(n)?[n]:[]),...(n.children||[]).flat(Infinity).flatMap(c=>nodes(c,pred))];}
test('large carousel counts survive reload without allocating pages',()=>{
  ctx.localStorage.getItem=()=>JSON.stringify({template:'blackfriday',pageCount:1000000,current:999999,pages:{999998:{title:'ÚLTIMO JOGO',salePrice:'R$ 99'}}});
  const s=run('loadState()');assert.equal(s.pageCount,1000000);assert.equal(s.current,999999);assert.equal(Object.keys(s.pages).length,1);assert.equal(s.pages[999998].title,'ÚLTIMO JOGO');
});
test('legacy saved arrays migrate and invalid counts are rejected',()=>{
 ctx.localStorage.getItem=()=>JSON.stringify({template:'blackfriday',pageCount:50,pages:[{title:'PÁGINA DOIS'},null]});
 assert.equal(run('loadState().pages[0].title'),'PÁGINA DOIS');assert.equal(run('loadState().pageCount'),50);
 for(const x of ['0','-1','1.5','Infinity','NaN']) assert.equal(run(`validPageCount(${x})`),null);
 assert.equal(run('validPageCount(1500)'),1500);
});
test('navigation stays small at the first, middle and last page',()=>{
 for(const cur of [0,500000,999999]){const w=run(`pageWindow(${cur},1000000)`);assert.equal(w.length,7);assert.ok(w.includes(cur));assert.ok(w.every(i=>i>=0&&i<1000000));}
});
test('banner stage and export dimensions are exactly 1500 x 435',()=>{
 const d=run("stageDims({template:'bfbanner'})");assert.equal(d.w,1500);assert.equal(d.h,435);
 const n=run("PostStage({s:{template:'bfbanner'}})");assert.equal(n.props.style.width,1500);assert.equal(n.props.style.height,435);assert.equal(n.children[0].type.name,'BlackFridayBanner');
});
test('banner accepts one or five mockups, preserving image proportions',()=>{
 for(const mode of ['hero','games']){
 const tree=run(`BlackFridayBanner({s:{bannerMode:'${mode}',bannerCount:5,bannerGames:Array.from({length:5},(_,i)=>({image:'game'+i,name:'JOGO '+i}))},tag:TAGS[0]})`);
 const imgs=nodes(tree,n=>n.type==='img');assert.equal(imgs.length,mode==='hero'?1:5);assert.ok(imgs.every(n=>n.props.style.objectFit==='contain'));
 }
});
test('prices and discounts remain optional, old price uses del',()=>{
 const empty=run('BlackFridayBanner({s:{},tag:TAGS[0]})');assert.equal(nodes(empty,n=>n.type==='del').length,0);
 const priced=run("BlackFridayBanner({s:{bannerOldPrice:'R$ 299',bannerPrice:'R$ 199'},tag:TAGS[0]})");assert.equal(nodes(priced,n=>n.type==='del')[0].children[0],'R$ 299');
});
test('carousel renders offer above the former eight-page cap',()=>{
 const tree=run("BlackFridayBody({s:{pageCount:100,pages:{98:{title:'OFERTA 100',oldPrice:'R$ 200',salePrice:'R$ 100'}}},tag:TAGS[0],pageIndex:99})");
 assert.ok(JSON.stringify(tree).includes('OFERTA 100'));assert.equal(nodes(tree,n=>n.type==='del')[0].children[0],'R$ 200');
});
test('mobile banner uses native 600 x 1269 and does not change other templates',()=>{
 const d=run("stageDims({template:'bfbanner',bannerFormat:'mobile'})");assert.equal(d.w,600);assert.equal(d.h,1269);
 const stage=run("PostStage({s:{template:'bfbanner',bannerFormat:'mobile'}})");assert.equal(stage.props.style.width,600);assert.equal(stage.props.style.height,1269);
 assert.equal(run("stageDims({template:'blackfriday',bannerFormat:'mobile'}).w"),1080);
});
test('campaign presets contain editable signature and reference dates only for preblack',()=>{
 assert.equal(run('BANNER_CAMPAIGNS.preblack.bannerPeriod'),'DE 10 A 12 DE OUTUBRO');
 assert.equal(run('BANNER_CAMPAIGNS.black.bannerPeriod'),'');
 assert.equal(run('BANNER_CAMPAIGNS.month.bannerSignature'),'Em novembro, o jogo é seu');
 for(const preset of ['preblack','black','month']){
  const tree=run(`BlackFridayBanner({s:{...BANNER_CAMPAIGNS.${preset},bannerFormat:'mobile'},tag:TAGS[0]})`);
  assert.ok(JSON.stringify(tree).includes(run(`BANNER_CAMPAIGNS.${preset}.bannerSubtitle`)));
 }
});
test('physical media is an offer carousel and preserves many saved pages',()=>{
 ctx.localStorage.getItem=()=>JSON.stringify({template:'physicalmonth',pageCount:120,current:119,pages:{118:{title:'JOGO FINAL',mockup:'case.png',offerBg:'grid',salePrice:'R$ 99'}}});
 assert.equal(run('loadState().template'),'physicalmonth');assert.equal(run('loadState().pageCount'),120);
 assert.equal(run("isOfferTemplate('physicalmonth')"),true);
 assert.equal(run("PostStage({s:{template:'physicalmonth',pageCount:1,pages:{}}}).children[0].type.name"),'BlackFridayBody');
});
test('duplicate offer copies creative fields only and appends without removing hidden offers',()=>{
 const s=run("duplicateOfferPage({template:'physicalmonth',current:0,pageCount:1,title:'A',mockup:'a.png',offerLayout:'split',offerAccent:'#aabbcc',salePrice:'R$ 99',pages:{4:{title:'hidden'}}})");
 assert.equal(s.pageCount,2);assert.equal(s.current,1);assert.equal(s.pages[0].mockup,'a.png');assert.equal(s.pages[0].offerLayout,'split');assert.equal(s.pages[0].template,undefined);assert.equal(s.pages[5].title,'hidden');
 const other=run("duplicateOfferPage({current:1,pageCount:2,title:'cover',pages:{0:{title:'SECOND',mockup:'b.png'}}})");assert.equal(other.pages[1].title,'SECOND');
});
test('all offer compositions render independent images, mockups and optional prices',()=>{
 for(const layout of ['showcase','split','poster']){
  const tree=run(`BlackFridayBody({s:{template:'physicalmonth',pageCount:2,pages:{0:{title:'TEST GAME',mockup:'mockup.png',image:'background.png',offerLayout:'${layout}',salePrice:'R$ 99',oldPrice:'R$ 199',offerPlatform:'PS5',offerBadge:'DESTAQUE'}}},tag:TAGS[0],pageIndex:1})`);
  assert.equal(nodes(tree,n=>n.type==='img'&&n.props.src==='mockup.png').length,1);assert.equal(nodes(tree,n=>n.type==='del')[0].children[0],'R$ 199');assert.ok(JSON.stringify(tree).includes('background.png'));
 }
 const hidden=run("BlackFridayBody({s:{template:'physicalmonth',pages:{},pageCount:1,offerShowPrice:false,salePrice:'R$ 99',oldPrice:'R$ 199'},tag:TAGS[0],pageIndex:0})");assert.equal(nodes(hidden,n=>n.type==='del').length,0);assert.ok(!JSON.stringify(hidden).includes('R$ 99'));
});
test('retired Black Friday carousel migrates without losing offers or layouts',()=>{
 ctx.localStorage.getItem=()=>JSON.stringify({template:'blackfriday',pageCount:3,current:2,title:'CAPA',image:'cover.png',salePrice:'R$ 99',pages:{0:{title:'A',mockup:'case.png'},1:{title:'B',image:'art.png',offerLayout:'split'}}});
 const s=run('loadState()');assert.equal(s.template,'physicalmonth');assert.equal(s.current,2);assert.equal(s.offerLayout,'poster');assert.equal(s.image,'cover.png');assert.equal(s.salePrice,'R$ 99');assert.equal(s.pages[0].offerLayout,'showcase');assert.equal(s.pages[0].mockup,'case.png');assert.equal(s.pages[1].offerLayout,'split');assert.equal(s.pages[1].image,'art.png');
 assert.equal(run("TEMPLATES.some(t=>t.id==='blackfriday')"),false);assert.equal(run("TEMPLATES.some(t=>t.id==='bfbanner')"),true);
});
test('offer Stories center the unchanged composition on every page',()=>{
 for(const layout of ['showcase','split','poster'])for(const format of ['feed','stories'])for(const current of [0,1]){
  ctx.offerState={template:'physicalmonth',offerFormat:format,pageCount:2,title:'COVER',offerLayout:layout,salePrice:'R$ 99',pages:{0:{title:'SECOND',mockup:'case.png',offerLayout:layout,salePrice:'R$ 199'}}};
  const dims=run(`stageDims(offerState,${current})`);assert.equal(dims.w,1080);assert.equal(dims.h,format==='stories'?1920:1350);
  const stage=run(`PostStage({s:offerState,pageIndex:${current}})`);assert.equal(stage.props.style.height,dims.h);
  const tree=run(`BlackFridayBody({s:offerState,tag:TAGS[0],pageIndex:${current}})`);
  const box=nodes(tree,n=>Object.hasOwn(n.props,'data-offer-composition'))[0];assert.equal(box.props.style.height,1350);assert.equal(box.props.style.top,(dims.h-1350)/2);
  assert.ok(JSON.stringify(box).includes(current===0?'COVER':'SECOND'));
 }
});
test('saved story format preserves offers and does not affect unrelated models',()=>{
 ctx.localStorage.getItem=()=>JSON.stringify({template:'physicalmonth',offerFormat:'stories',pageCount:50,current:49,pages:{48:{title:'LAST',mockup:'last.png',salePrice:'R$ 10'}}});
 assert.equal(run('loadState().offerFormat'),'stories');assert.equal(run('loadState().current'),49);assert.equal(run('loadState().pages[48].mockup'),'last.png');
 assert.equal(run("stageDims({template:'carousel',offerFormat:'stories'}).h"),1350);
 assert.equal(run("stageDims({template:'bfbanner',offerFormat:'stories'}).h"),435);
});
test('page counters can be hidden across carousels and video previews',()=>{
 for(const show of [undefined,true,false]){
 ctx.counterState={template:'physicalmonth',showPageCounter:show,pageCount:12,pages:{0:{title:'TEST'}},title:'COVER'};
 for(const call of ['BlackFridayBody({s:counterState,tag:TAGS[0],pageIndex:0})','BlackFridayBody({s:counterState,tag:TAGS[0],pageIndex:1})','CarouselBody({s:counterState,tag:TAGS[0],pageIndex:1})','VideoBody({s:counterState,tag:TAGS[0],pg:{},pageIndex:1})']){
  const n=nodes(run(call),n=>Object.hasOwn(n.props,'data-page-counter'));assert.equal(n.length,show===false?0:1);
 }
 }
});
test('video compositor respects hidden counter and keeps other text',()=>{
 for(const show of [true,false]){
  const texts=[];ctx.canvas=new Proxy({measureText:t=>({width:String(t).length*10}),fillText:t=>texts.push(t),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{}});
  ctx.counterState={showPageCounter:show,pageCount:12};
  run("drawVideoComposite(canvas,1080,1350,{s:counterState,pg:{title:'TRAILER'},tag:TAGS[0],pageIndex:1})");
  assert.equal(texts.includes('02/12'),show);assert.ok(texts.includes('TRAILER'));
 }
});
