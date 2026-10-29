const CASE_MODELS={
 ps5:{src:'ps5.png',area:[38,183,957,1091],outerRadius:32},
 ps4:{src:'ps4.png',area:[4,183,1073,1187]},
 switch2:{src:'switch2.png',area:[10,302,1192,1693]},
 switch:{src:'switch.png',area:[5,26,583,948],logo:'switch-logo.png',logoArea:[5,26,129,126]}
};
function caseArtPlacement(iw,ih,area,zoom=100,px=50,py=50,trim=0){
 const [x,y,w,h]=area,sy=ih*trim/100,sh=ih-sy,scale=Math.max(w/iw,h/sh)*zoom/100;
 return {sx:0,sy,sw:iw,sh,dx:x-(iw*scale-w)*px/100,dy:y-(sh*scale-h)*py/100,dw:iw*scale,dh:sh*scale};
}
if(typeof module!=='undefined')module.exports={CASE_MODELS,caseArtPlacement};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id),canvas=$('result'),ctx=canvas.getContext('2d');let frame=null,logo=null,art=null,model=null,request=0,artRequest=0,name='jogo';
 const status=t=>$('status').textContent=t;
 async function image(src){const i=new Image();i.src=src;await i.decode();return i;}
 function render(){if(!frame)return;canvas.width=frame.width;canvas.height=frame.height;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();if(model.outerRadius){ctx.beginPath();ctx.roundRect(0,0,canvas.width,canvas.height,model.outerRadius);ctx.clip();}ctx.drawImage(frame,0,0);ctx.restore();const [x,y,w,h]=model.area;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='#242424';ctx.fillRect(x,y,w,h);if(art){const p=caseArtPlacement(art.width,art.height,model.area,+$('zoom').value,+$('panX').value,+$('panY').value,+$('trim').value);ctx.drawImage(art,p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);}else{ctx.fillStyle='#ddd';ctx.font=Math.round(w/22)+'px Arial';ctx.textAlign='center';ctx.fillText('Envie a arte do jogo',x+w/2,y+h/2);}ctx.restore();if(logo)ctx.drawImage(logo,...model.logoArea);$('download').disabled=!art;status(art?`Pronto para baixar: ${canvas.width} × ${canvas.height} px.`:'Escolha a arte do jogo para preencher a caixa.');}
 async function choose(){const id=++request;frame=null;$('download').disabled=true;status('Carregando caixa…');try{const m=CASE_MODELS[$('platform').value];const [f,l]=await Promise.all([image('assets/cases/'+m.src),m.logo?image('assets/cases/'+m.logo):null]);if(id!==request)return;model=m;frame=f;logo=l;render();}catch(e){if(id===request)status('Não foi possível carregar a caixa. Atualize a página e tente novamente.');}}
 async function load(file){if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){status('Envie PNG, JPG ou WebP de até 20 MB.');return;}const id=++artRequest,url=URL.createObjectURL(file);status('Abrindo arte…');try{const im=await image(url);if(id!==artRequest)return;art=im;name=file.name.replace(/\.[^.]+$/,'');reset();}catch(e){status('Não foi possível abrir esta imagem.');}finally{URL.revokeObjectURL(url);}}
 function reset(){$('zoom').value=100;$('panX').value=$('panY').value=50;$('trim').value=0;labels();render();}
 function labels(){$('zoomValue').textContent=$('zoom').value+'%';$('trimValue').textContent=$('trim').value+'%';}
 for(const id of ['zoom','panX','panY','trim'])$(id).oninput=()=>{labels();render();};$('reset').onclick=reset;$('platform').onchange=choose;$('art').onchange=e=>load(e.target.files[0]);const zone=document.querySelector('section');zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();load(e.dataTransfer.files[0]);};
 $('download').onclick=()=>{if(!frame||!art)return;canvas.toBlob(blob=>{if(!blob){status('Falha ao exportar. Tente novamente.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name+'-'+$('platform').value+'-mockup.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');};choose();
}
