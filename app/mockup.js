/* Preserve white printing inside the case; crop only the selected outer polygon. */
function detectMockupBounds(data,w,h,threshold=235){
  let l=w,t=h,r=-1,b=-1;const rows=new Uint32Array(h),cols=new Uint32Array(w);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(data[i+3]>40&&Math.min(data[i],data[i+1],data[i+2])<threshold){rows[y]++;cols[x]++;}}
  // Ignore isolated compression noise and tiny peripheral marks.
  const minRow=Math.max(2,w*.012),minCol=Math.max(2,h*.012);
  for(let x=0;x<w;x++)if(cols[x]>=minCol){l=Math.min(l,x);r=x;}
  for(let y=0;y<h;y++)if(rows[y]>=minRow){t=Math.min(t,y);b=y;}
  if(r<=l||b<=t)return null;
  return [{x:l,y:t},{x:r+1,y:t},{x:r+1,y:b+1},{x:l,y:b+1}];
}
function validMockupPolygon(p){let sign=0;for(let i=0;i<4;i++){const a=p[i],b=p[(i+1)%4],c=p[(i+2)%4];const cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);if(Math.abs(cross)<1)return false;if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);}return true;}
function mockupCropPath(ctx,points,radius=0,offsetX=0,offsetY=0){
  const corners=points.map((p,i)=>{
    const prev=points[(i+3)%4],next=points[(i+1)%4];
    const a=Math.hypot(prev.x-p.x,prev.y-p.y),b=Math.hypot(next.x-p.x,next.y-p.y);
    const d=Math.max(0,Math.min(radius,a/2,b/2));
    return {p,entry:{x:p.x+(prev.x-p.x)*d/(a||1),y:p.y+(prev.y-p.y)*d/(a||1)},exit:{x:p.x+(next.x-p.x)*d/(b||1),y:p.y+(next.y-p.y)*d/(b||1)}};
  });
  ctx.beginPath();
  corners.forEach(({p,entry,exit},i)=>{
    if(i===0)ctx.moveTo(entry.x-offsetX,entry.y-offsetY);else ctx.lineTo(entry.x-offsetX,entry.y-offsetY);
    ctx.quadraticCurveTo(p.x-offsetX,p.y-offsetY,exit.x-offsetX,exit.y-offsetY);
  });ctx.closePath();
}
if(typeof module!=='undefined')module.exports={detectMockupBounds,validMockupPolygon,mockupCropPath};
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id),source=$('source'),result=$('result'),ctx=source.getContext('2d');let original=null,points=[],drag=-1,filename='jogo',loadId=0;
const say=t=>$('status').textContent=t;
const clamp=(v,max)=>Math.max(0,Math.min(max,Number(v)||0));
function render(){if(!original)return;ctx.clearRect(0,0,source.width,source.height);ctx.drawImage(original,0,0);const radius=Math.min(...points.map((p,i)=>Math.hypot(p.x-points[(i+1)%4].x,p.y-points[(i+1)%4].y)))*(+$('rounding').value/100);mockupCropPath(ctx,points,radius);ctx.strokeStyle='#ff6a20';ctx.lineWidth=Math.max(2,source.width/300);ctx.stroke();for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,Math.max(7,source.width/85),0,7);ctx.fillStyle='#ff6a20';ctx.fill();}
const ok=validMockupPolygon(points);$('download').disabled=!ok;if(!ok){say('Os cantos não podem se cruzar. Ajuste a seleção.');result.width=1;result.height=1;return;}
const x=Math.floor(Math.min(...points.map(p=>p.x))),y=Math.floor(Math.min(...points.map(p=>p.y))),w=Math.ceil(Math.max(...points.map(p=>p.x)))-x,h=Math.ceil(Math.max(...points.map(p=>p.y)))-y;result.width=Math.max(1,w);result.height=Math.max(1,h);const c=result.getContext('2d');c.save();mockupCropPath(c,points,radius,x,y);c.clip();c.drawImage(original,-x,-y);c.restore();$('coords').querySelectorAll('input').forEach(el=>el.value=Math.round(points[el.dataset.i][el.dataset.axis]));say(`Recorte: ${w} × ${h} px. Confira os cantos antes de baixar.`);}
function detect(){if(!original)return;const c=original.getContext('2d');points=detectMockupBounds(c.getImageData(0,0,original.width,original.height).data,original.width,original.height,+$('threshold').value);const found=!!points;if(!points)points=[{x:0,y:0},{x:original.width,y:0},{x:original.width,y:original.height},{x:0,y:original.height}];if($('ratio').checked){const ratio=$('format').value==='ps5'?135/170:105/170;const height=points[2].y-points[0].y,center=(points[0].x+points[1].x)/2,width=Math.min(original.width,height*ratio),left=Math.max(0,Math.min(original.width-width,center-width/2));points[0].x=points[3].x=left;points[1].x=points[2].x=left+width;}render();if(!found)say('Não foi possível distinguir a caixa. Ajuste os quatro cantos manualmente.');}
async function load(file){if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){say('Envie PNG, JPG ou WebP de até 20 MB.');return;}const id=++loadId,url=URL.createObjectURL(file);say('Carregando e detectando bordas…');try{const im=new Image();im.src=url;await im.decode();if(id!==loadId)return;const scale=Math.min(1,2400/Math.max(im.width,im.height));original=document.createElement('canvas');original.width=Math.round(im.width*scale);original.height=Math.round(im.height*scale);original.getContext('2d').drawImage(im,0,0,original.width,original.height);source.width=original.width;source.height=original.height;filename=file.name.replace(/\.[^.]+$/,'');$('detect').disabled=false;detect();}catch(e){say('Não foi possível abrir a imagem. Tente outro arquivo.');}finally{URL.revokeObjectURL(url);}}
['Superior esquerdo','Superior direito','Inferior direito','Inferior esquerdo'].forEach((name,i)=>{const label=document.createElement('label');label.textContent=name;for(const axis of ['x','y']){const inp=document.createElement('input');inp.type='number';inp.min=0;inp.setAttribute('aria-label',name+' '+axis.toUpperCase());inp.dataset.i=i;inp.dataset.axis=axis;inp.addEventListener('input',()=>{if(!original)return;points[i][axis]=clamp(inp.value,axis==='x'?source.width:source.height);render();});label.append(inp);}$('coords').append(label);});
$('rounding').oninput=()=>{$('roundingValue').textContent=$('rounding').value+'%';render();};
$('file').onchange=e=>load(e.target.files[0]);$('detect').onclick=detect;$('format').onchange=()=>{if($('ratio').checked)detect();};$('ratio').onchange=detect;$('threshold').onchange=detect;
function position(e){const r=source.getBoundingClientRect();return {x:clamp((e.clientX-r.left)*source.width/r.width,source.width),y:clamp((e.clientY-r.top)*source.height/r.height,source.height)};}
source.onpointerdown=e=>{if(!original)return;const p=position(e);let best=Infinity;points.forEach((q,i)=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<best){best=d;drag=i;}});if(best>source.width*0.1){drag=-1;return;}source.setPointerCapture(e.pointerId);};source.onpointermove=e=>{if(drag<0)return;points[drag]=position(e);render();};source.onpointerup=source.onpointercancel=()=>drag=-1;
const zone=document.querySelector('section');zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();load(e.dataTransfer.files[0]);};
$('download').onclick=()=>{if(!original||!validMockupPolygon(points))return;result.toBlob(blob=>{if(!blob){say('Falha ao gerar PNG. Tente novamente.');return;}const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=filename+'-'+$('format').value+'-recortado.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');};
}
