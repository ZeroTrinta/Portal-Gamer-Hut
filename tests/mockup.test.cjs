const test=require('node:test'),assert=require('node:assert/strict');
const {detectMockupBounds,validMockupPolygon}=require('../app/mockup.js');
test('detects case around white printing without selecting white background',()=>{const w=100,h=100,d=new Uint8ClampedArray(w*h*4).fill(255);for(let y=10;y<90;y++)for(let x=20;x<80;x++){if(y>30||x<24||x>75){const i=(y*w+x)*4;d[i]=20;d[i+1]=80;d[i+2]=180;}}assert.deepEqual(detectMockupBounds(d,w,h),[{x:20,y:10},{x:80,y:10},{x:80,y:90},{x:20,y:90}]);});
test('blank background requires manual selection',()=>assert.equal(detectMockupBounds(new Uint8ClampedArray(40000).fill(255),100,100),null));
test('rejects crossed corners and accepts perspective crop',()=>{assert.equal(validMockupPolygon([{x:0,y:0},{x:20,y:2},{x:22,y:40},{x:2,y:35}]),true);assert.equal(validMockupPolygon([{x:0,y:0},{x:20,y:40},{x:20,y:0},{x:0,y:40}]),false);});
