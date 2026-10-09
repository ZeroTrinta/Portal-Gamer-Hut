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
