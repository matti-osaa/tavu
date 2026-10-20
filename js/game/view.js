/* Canvas, pseudo-3D projection and shared game globals. */
const cv=$('cv'), ctx=cv.getContext('2d'), stage=$('stage'), ov=$('ov'), ammoEl=$('ammo');
/* iPhone Safari keeps a glyph cache for every font size it draws. Letters growing smoothly as they
   approach meant thousands of slightly different sizes and the cache grew until the page was killed.
   So every font size is snapped to one of a limited set of steps (about 4 % apart). */
(()=>{ const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');
  const snap=n=>{ n=+n; if(n<=14) return Math.max(6,Math.round(n)); return Math.round(Math.exp(Math.round(Math.log(n)*24)/24)); };
  Object.defineProperty(ctx,'font',{configurable:true, get(){ return d.get.call(this); },
    set(v){ d.set.call(this,String(v).replace(/(\d+(?:\.\d+)?)px/,(m,n)=>snap(n)+'px')); }});
})();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// World space: lane -1..1 across the road, z = distance (ZN at the cannon, ZF where candies appear)
const ZN=1, ZF=5.2, ZLOSE=1.06, ZCAN=1.0;
let W=0,H=0,DPR=1,HY=0,BY=0,HW=0,RB=50;
const sc=z=>ZN/z;
const py=z=>HY+(BY-HY)*sc(z);
// The field fans out with distance: far away it is much wider, so tyypät come at you from a broad front
// and converge on your position. lw(z) = screen pixels per lane unit at depth z.
const FAN=.85, fan=z=>1+FAN*Math.max(0,z-1);
const lw=z=>HW*sc(z)*fan(z);
const px=(lane,z)=>W/2+lane*lw(z);
function resize(){
  const r=stage.getBoundingClientRect(); W=r.width;H=r.height;DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
  HY=H*.27; BY=H-Math.max(130,H*.22); HW=Math.min(W*.48,340); RB=Math.max(40,Math.min(70,W*.15));   // below BY: the wooden board with the sling
}
addEventListener('resize',()=>{if(!$('game').hidden)resize()});

let G=null, raf=0, last=0;
const LIVES=4;
const clouds=Array.from({length:4},(_,i)=>({x:Math.random(),y:.04+i*.05,s:.5+Math.random()*.5,v:.006+Math.random()*.01}));
