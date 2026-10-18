/* Kuminauha (slingshot) – how the player shoots.
   At the bottom there is a wooden board with three stacks of discs and a rubber band.
     - tap a stack, or drag a disc from it into the band  → the disc is loaded
     - pull back anywhere (drag away from the target) and let go → the disc flies the opposite way
     - the dotted line shows where it will go; the disc follows that line exactly
   Keyboard: 1 2 3 (or ↑ ↓) pick a stack, ← → turn the aim, space / Enter shoots. */
const isTouch = matchMedia('(pointer: coarse)').matches;
let drag = null;   // {id, kind:'carry'|'pull', x0, y0, t0, moved}

function canvasPoint(e){ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }

// Board geometry, all in screen pixels
function slingGeo(){
  const TB=H-BY, r=Math.max(22,Math.min(34,W*.07));
  return {TB, r, cx:W/2, cy:BY+TB*.2, post:Math.min(W*.3,150), sy:H-TB*.3, sx:[W*.2,W*.5,W*.8], maxPull:TB*.72};
}

/* ---------- Stacks: three answers to choose from, at least one always useful ---------- */
function answerPool(){
  const out=new Set();
  if(G.lootMode||G.boss) targets().forEach(t=>out.add(t.ans));
  (G.fresh||[]).concat(G.older||[]).forEach(ch=>{ const a=ansOf(ch); if(a) out.add(a); });
  return [...out];
}
function refreshStacks(){
  if(!G) return;
  const pool=answerPool();
  if(!G.stacks){ const p=[...pool].sort(()=>Math.random()-.5); G.stacks=[0,1,2].map(i=>({ans:p[i%Math.max(1,p.length)]||'',t:1})); }
  const near=targets().filter(t=>t.z<ZF+.5).sort((a,b)=>a.z-b.z), need=[...new Set(near.map(t=>t.ans))];
  const has=a=>G.stacks.some(s=>s.ans===a);
  // a needed answer that no stack offers goes onto a stack that is not needed right now
  const missing=need.filter(a=>!has(a));
  if(missing.length&&!(G.cur&&need.includes(G.cur)&&need.length===1)){
    const free=G.stacks.map((s,i)=>i).filter(i=>!need.includes(G.stacks[i].ans));
    if(free.length&&(!need.some(has)||Math.random()<.02)){ const i=free[Math.floor(Math.random()*free.length)]; G.stacks[i]={ans:missing[0],t:0}; }
  }
  // no duplicates: refill with a plausible wrong answer
  G.stacks.forEach((s,i)=>{ if(G.stacks.findIndex(q=>q.ans===s.ans)!==i||!s.ans){ const alt=pool.filter(a=>!has(a)); if(alt.length) G.stacks[i]={ans:alt[Math.floor(Math.random()*alt.length)],t:0}; } });
}
// kept for older call sites: "pick new ammo" now means "check the stacks"
function nextAmmo(){ refreshStacks(); }
function paintFire(){}

function loadDisc(i){
  if(!G||!G.running) return; audio();
  if(G.cool>0){ tone(110,.05,'square',.03); return; }
  const s=G.stacks&&G.stacks[i]; if(!s||!s.ans) return;
  G.cur=s.ans; G.sel=i; G.didMove=true; G.reload=0;
  tone(330,.07,'sine',.1,1.3); noise(.05,1800,2,.12);
}
function launchDisc(dx,dy,len){
  const g=slingGeo(), z0=ZCAN+.05;
  G.shots.push({cx:g.cx,cy:g.cy,slope:dx/dy,E0:(py(z0)-g.cy)/sc(z0),z0,z:z0,lane:0,vz:.3+2.3*Math.pow(Math.min(1,len/g.maxPull),1.3),   // a short pull lobs it slowly, a full pull snaps it
    ans:G.cur,lab:dispAns(G.cur),col:AMMO_COL,bounced:false,vx:0,sx:0,sy:0,vy:0,life:1});
  G.aimA=Math.atan2(dx,-dy); G.cur=null; G.didFire=true; G.fired++; G.cool=COOL; G.recoil=1;
  const k=Math.min(1,len/g.maxPull); tone(140+k*120,.2,'triangle',.06+k*.12,2.2); noise(.08,500+k*700,1,.08+k*.2); sPew();
}
// where a flying disc is on screen at depth z: it follows the aim line, rising to letter height
function shotXY(s,z){ const y=py(z)-shotE(s,z)*sc(z); return [s.cx+s.slope*(y-s.cy), y]; }
function aimDir(){ // unit vector of the current aim (pulling, or the last/keyboard angle)
  const g=slingGeo();
  if(G.pull){ const dx=g.cx-G.pull.x, dy=g.cy-G.pull.y, l=Math.hypot(dx,dy); if(l>4) return [dx/l,dy/l,l]; }
  const a=G.aimA||0; return [Math.sin(a),-Math.cos(a),0];
}
function fireKeyboard(){
  if(!G||!G.running) return;
  if(!G.cur) loadDisc(G.sel||0);
  if(!G.cur) return;
  const g=slingGeo(), [ux,uy]=aimDir(); launchDisc(ux,uy,g.maxPull*.7);
}

/* ---------- Pointer ---------- */
function stackAt(p){ const g=slingGeo(); for(let i=0;i<3;i++) if(Math.hypot(p.x-g.sx[i],p.y-g.sy)<g.r*1.5) return i; return -1; }
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running) return; audio();
  const p=canvasPoint(e), g=slingGeo(), i=stackAt(p);
  if(i>=0){
    if(G.cool>0){ tone(110,.05,'square',.03); return; }
    drag={id:e.pointerId,kind:'carry',x0:p.x,y0:p.y,t0:performance.now(),moved:false,i};
    G.carry={ans:G.stacks[i].ans,x:p.x,y:p.y}; noise(.04,2200,2,.08);
  } else if(G.cur){
    drag={id:e.pointerId,kind:'pull',x0:p.x,y0:p.y,t0:performance.now(),moved:false};
    G.pull={x:g.cx,y:g.cy};
  } else return;
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id||!G) return;
  const p=canvasPoint(e), g=slingGeo(), dx=p.x-drag.x0, dy=p.y-drag.y0;
  if(Math.abs(dx)>8||Math.abs(dy)>8) drag.moved=true;
  if(drag.kind==='carry'&&G.carry){ G.carry.x=p.x; G.carry.y=p.y; }
  if(drag.kind==='pull'&&G.pull){
    const GAIN=1.7;                                   // the band stretches further than the finger moves: a short drag is enough
    const l=Math.hypot(dx,dy)*GAIN, k=(l>g.maxPull?g.maxPull/l:1)*GAIN;
    G.pull.x=g.cx+dx*k; G.pull.y=g.cy+dy*k;
    const st=Math.floor(Math.min(l,g.maxPull)/(g.maxPull/5)); if(st!==drag.st){ drag.st=st; tone(140+st*30,.04,'triangle',.05); } // creak while stretching
  }
});
const endDrag=e=>{
  if(!drag||e.pointerId!==drag.id||!G){ drag=null; return; }
  const g=slingGeo();
  if(drag.kind==='carry'&&G.carry){
    const nearBand=G.carry.y<g.sy-g.r*.6||Math.hypot(G.carry.x-g.cx,G.carry.y-g.cy)<g.post;
    if(!drag.moved||nearBand) loadDisc(drag.i);
    G.carry=null;
  }
  if(drag.kind==='pull'&&G.pull){
    const dx=g.cx-G.pull.x, dy=g.cy-G.pull.y, l=Math.hypot(dx,dy);
    if(l>g.r*.8&&dy<-l*.2) launchDisc(dx,dy,l);
    else if(l>g.r*.8) tone(120,.08,'sine',.06);         // pulled sideways/upwards: band just snaps back
    G.pull=null;
  }
  drag=null;
};
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',()=>{ drag=null; if(G){ G.pull=null; G.carry=null; } });

/* ---------- Keyboard ---------- */
addEventListener('keydown',e=>{
  if(!G)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){G.keys[e.key]=true;G.kbAim=true;e.preventDefault();}
  if(e.repeat)return;
  if(e.key===' '||e.key==='Enter'){ if(!G.running&&$('go'))$('go').click(); else fireKeyboard(); e.preventDefault(); return; }
  if(e.key>='1'&&e.key<='3'){ loadDisc(+e.key-1); e.preventDefault(); }
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){ const n=((G.sel||0)+(e.key==='ArrowUp'?1:2))%3; loadDisc(n); if(G.cool>0) G.sel=n; e.preventDefault(); }
});
addEventListener('keyup',e=>{if(G)G.keys[e.key]=false;});
