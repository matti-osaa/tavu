/* Canvas, pseudo-3D projection and shared game globals. */
const cv=$('cv'), ctx=cv.getContext('2d'), stage=$('stage'), ov=$('ov'), ammoEl=$('ammo');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// World space: lane -1..1 across the road, z = distance (ZN at the cannon, ZF where candies appear)
const ZN=1, ZF=4.2, ZLOSE=1.32, ZCAN=1.0;
let W=0,H=0,DPR=1,HY=0,BY=0,HW=0,RB=50;
const sc=z=>ZN/z;
const py=z=>HY+(BY-HY)*sc(z);
const px=(lane,z)=>W/2+lane*HW*sc(z);
function resize(){
  const r=stage.getBoundingClientRect(); W=r.width;H=r.height;DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
  HY=H*.27; BY=H-Math.max(78,H*.15); HW=Math.min(W*.48,340); RB=Math.max(40,Math.min(70,W*.15));
}
addEventListener('resize',()=>{if(!$('game').hidden)resize()});

let G=null, raf=0, last=0;
const LIVES=4;
const clouds=Array.from({length:4},(_,i)=>({x:Math.random(),y:.04+i*.05,s:.5+Math.random()*.5,v:.006+Math.random()*.01}));
