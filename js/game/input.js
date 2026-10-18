/* Input: pointer/touch on the road and the cannon cube, keyboard. */
/* ---------- INPUT ---------- */
let down=false;
const aim=e=>{const r=cv.getBoundingClientRect(); if(G) G.tlane=Math.max(-.85,Math.min(.85,(e.clientX-r.left-W/2)/(HW*sc(ZCAN))));};
cv.addEventListener('pointerdown',e=>{
  if(G){const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top, u=Math.max(30,RB*.75), cx=px(G.lane,ZCAN), cy=BY+6-u*2.5;
    if(Math.abs(mx-cx)<u*1.1&&Math.abs(my-cy)<u*1.2){switchAmmo();return;}}
  down=true;aim(e);cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(down)aim(e)});
cv.addEventListener('pointerup',()=>down=false); cv.addEventListener('pointercancel',()=>down=false);
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
