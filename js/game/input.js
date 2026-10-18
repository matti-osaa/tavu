/* Input
   Touch / mouse on the canvas:
     - drag anywhere (also by grabbing the cannon) → the cannon follows the finger sideways
     - tap the loaded cube → fire
     - flick the cube up / down → switch ammo
   Keyboard: ← → move, space / Enter fire, ↑ ↓ switch ammo. */
const isTouch = matchMedia('(pointer: coarse)').matches;
let drag = null;   // {id, x0, y0, onCube, moved}

function canvasPoint(e){ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
function aimAt(x){ if(G) G.didMove=true; if(G) G.tlane=Math.max(-.85,Math.min(.85,(x-W/2)/(HW*sc(ZCAN)))); }
// Hit area of the loaded ammo cube (generous, so it is easy to tap with a thumb)
function onCube(p){ if(!G) return false; const u=Math.max(30,RB*.75), cx=px(G.lane,ZCAN), cy=BY+6-u*2.5;
  return Math.abs(p.x-cx)<u*1.4 && p.y>cy-u*1.6 && p.y<BY+u; }

cv.addEventListener('pointerdown',e=>{
  if(!G) return; audio();
  const p=canvasPoint(e), cube=onCube(p);
  drag={id:e.pointerId, x0:p.x, y0:p.y, onCube:cube, moved:false};
  if(!cube) aimAt(p.x);              // tapping the road slides the cannon there
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const p=canvasPoint(e), dx=p.x-drag.x0, dy=p.y-drag.y0;
  if(drag.onCube && !drag.moved && Math.abs(dy)>Math.abs(dx)) return;   // maybe a flick, decide on release
  if(Math.abs(dx)>8){ drag.moved=true; aimAt(p.x); }
});
const endDrag=e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const p=canvasPoint(e), dx=p.x-drag.x0, dy=p.y-drag.y0;
  if(drag.onCube && !drag.moved){
    if(Math.abs(dy)>28 && Math.abs(dy)>Math.abs(dx)) switchAmmo(dy<0?1:-1);   // flick up = next, down = previous
    else if(Math.abs(dx)<14 && Math.abs(dy)<14) fire();
  }
  drag=null;
};
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',()=>drag=null);

addEventListener('keydown',e=>{
  if(!G)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){G.keys[e.key]=true;e.preventDefault();}
  if(e.repeat)return;
  if(e.key===' '){ if(!G.running&&$('go'))$('go').click(); else fire(); e.preventDefault(); return; }
  if(e.key==='Enter'){fire();e.preventDefault();}
  if(e.key==='ArrowUp'){switchAmmo(1);e.preventDefault();}
  if(e.key==='ArrowDown'){switchAmmo(-1);e.preventDefault();}
});
addEventListener('keyup',e=>{if(G)G.keys[e.key]=false;});
