/* Input
   Touch / mouse on the canvas:
     - drag on the road        → the cannon follows sideways
     - tap the road            → the cannon slides there and fires
     - tap the ammo cube       → next letter / word
     - drag the cube up / down → scroll through letters / words
   Keyboard: ← → move, space / Enter fire, ↑ ↓ switch ammo. */
const isTouch = matchMedia('(pointer: coarse)').matches;
let drag = null;   // {id, x0, y0, t0, onCube, moved, steps}

function canvasPoint(e){ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
function aimAt(x){ if(G) G.didMove=true; if(G) G.tlane=Math.max(-.85,Math.min(.85,(x-W/2)/(HW*sc(ZCAN)))); }
// Hit area of the loaded ammo cube (generous, so it is easy to tap with a thumb)
function onCube(p){ if(!G) return false; const u=Math.max(30,RB*.75), cx=px(G.lane,ZCAN), cy=BY+6-u*2.6;
  return Math.abs(p.x-cx)<u*1.2 && p.y>cy-u*1.3 && p.y<cy+u*1.2; }

cv.addEventListener('pointerdown',e=>{
  if(!G) return; audio();
  const p=canvasPoint(e), cube=onCube(p);
  drag={id:e.pointerId, x0:p.x, y0:p.y, t0:performance.now(), onCube:cube, moved:false, steps:0};
  if(!cube) aimAt(p.x);              // the cannon starts sliding toward the finger
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const p=canvasPoint(e), dx=p.x-drag.x0, dy=p.y-drag.y0;
  if(drag.onCube){                   // scroll ammo: one step per 34 px of vertical drag
    const st=Math.trunc(-dy/34);
    while(drag.steps<st){ drag.steps++; switchAmmo(1); drag.moved=true; }
    while(drag.steps>st){ drag.steps--; switchAmmo(-1); drag.moved=true; }
    return;
  }
  if(Math.abs(dx)>10||Math.abs(dy)>10) drag.moved=true;
  aimAt(p.x);
});
const endDrag=e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const quick=performance.now()-drag.t0<400;
  if(drag.onCube){ if(!drag.moved) switchAmmo(-1); }           // tap the cube: next one down
  else if(!drag.moved&&quick&&G){ G.pendingFire=true; }        // tap the road: fire once the cannon is there
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
