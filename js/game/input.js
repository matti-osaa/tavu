/* Linkokiekot – how the player shoots.
   Along the bottom board there is a row of discs, each sitting in its own little rubber band.
   (There are a few more discs than tyypät on the road; at least the nearest ones always have a match.)
     - pull a disc back and let go       → it slings itself the opposite way from where it sits
     - just tap a disc                   → it flies at the nearest tyyppä: pick the disc that fits it
     - a fired disc is replaced by a new one, probably a different letter
   The dotted line shows the path; discs bounce off the kerbs.
   Keyboard: 1–5 fire that disc at the nearest tyyppä, ↑ ↓ pick a disc, ← → aim, space fires the picked one. */
const isTouch = matchMedia('(pointer: coarse)').matches;
let drag = null;   // {id, i, x0, y0, t0, moved}
const REFILL=1.1;  // seconds for the next disc to be pushed up from the stack below

function canvasPoint(e){ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }

// Board geometry, all in screen pixels
function slingGeo(){
  const TB=H-BY, n=wordMode()?4:(W>520?6:5), r=Math.max(20,Math.min(32,W/n*.33));
  return {TB, r, n, cx:W/2, cy:BY+TB*.5, sy:BY+TB*.5, sx:Array.from({length:n},(_,i)=>W*(i+.5)/n), maxPull:TB*.8, slotW:W/n};
}

/* ---------- The row of discs ---------- */
function answerPool(){
  const out=new Set();
  if(G.lootMode||G.boss) targets().forEach(t=>out.add(t.ans));
  (G.fresh||[]).concat(G.older||[]).forEach(ch=>{ const a=ansOf(ch); if(a) out.add(a); });
  return [...out];
}
function needed(){ const near=targets().filter(t=>t.z<ZF+.5).sort((a,b)=>a.z-b.z); return [...new Set(near.map(t=>t.ans))]; }
function newDiscAns(prev){
  const pool=answerPool(), need=needed(), has=a=>G.stacks.some(s=>s.ans===a);
  const miss=need.filter(a=>!has(a));
  if(miss.length&&Math.random()<.3) return miss[Math.floor(Math.random()*Math.min(2,miss.length))];
  const alt=pool.filter(a=>!has(a)&&a!==prev&&!G.stacks.some(q=>q.next===a));
  return alt.length?alt[Math.floor(Math.random()*alt.length)]:(miss[0]||pool[0]||'');
}
function refreshStacks(){
  if(!G) return;
  const g=slingGeo();
  if(!G.stacks||G.stacks.length!==g.n){ const old=G.stacks||[]; G.stacks=Array.from({length:g.n},(_,i)=>old[i]||{ans:'',t:1,wait:0}); G.stacks.forEach(s=>{ if(!s.ans) s.ans=newDiscAns(''); }); }
  const dt=G.dt||0;
  G.stacks.forEach(s=>{ if(!s.ans){ s.wait-=dt; if(!s.next) s.next=newDiscAns(s.prev); if(s.wait<=0){ const taken=a=>G.stacks.some(q=>q!==s&&q.ans===a);
        if(taken(s.next)){ const free=answerPool().filter(a=>!taken(a)&&a!==s.prev); s.next=free.length?free[Math.floor(Math.random()*free.length)]:s.next; }
        s.ans=s.next; s.next=''; s.t=1; tone(380,.04,'sine',.04); noise(.03,2600,3,.05); } } });
  // the two nearest different answers on the road must always be in the row (a thrown letter, a boss plate…)
  const need=needed(), rank=a=>{ const i=need.indexOf(a); return i<0?1e9:i; }, has=a=>G.stacks.some(s=>s.ans===a);
  need.slice(0,2).forEach(a=>{ if(has(a)) return;
    const cand=G.stacks.map((s,i)=>i).filter(i=>G.stacks[i].ans&&(!drag||drag.i!==i)&&(rank(G.stacks[i].ans)>=2||rank(G.stacks[i].ans)>rank(a)));
    if(!cand.length) return; cand.sort((x,y)=>rank(G.stacks[y].ans)-rank(G.stacks[x].ans));
    G.stacks[cand[0]]={ans:a,t:0,wait:0}; });
}
function nextAmmo(){ refreshStacks(); }
function paintFire(){}

// a tapped disc flies at the nearest tyyppä (it bounces off if it is the wrong disc)
function nearestTarget(ans){
  const t=[...G.enemies.filter(e=>!e.air).map(e=>{ const tm=(e.z-ZCAN)/(1.9+Math.max(0,e.vz||0)), zp=Math.max(ZLOSE+.05,e.z-Math.max(0,e.vz||0)*tm);  // lead the target a little
      return {ans:e.ans,x:px(e.lane,zp),y:py(zp)-RB*sc(zp)*.9,z:e.z}; }),
    ...(G.boss?G.boss.segs.map((s,i)=>s.alive?{ans:s.ans,x:px(segLane(i),G.boss.z),y:py(G.boss.z)-RB*sc(G.boss.z)*1.3,z:G.boss.z}:null).filter(Boolean):[])]
    .filter(q=>q.z<ZF).sort((a,b)=>a.z-b.z);
  return t[0];   // always the nearest: you have to pick the disc that fits it
}
function fireSlot(i,dx,dy,len){
  const g=slingGeo(), s=G.stacks[i]; if(!s||!s.ans) return;
  const ox=g.sx[i], oy=g.sy, z0=ZCAN+.05, l=Math.hypot(dx,dy)||1;
  G.shots.push({cx:ox,cy:oy,slope:dx/dy,E0:(py(z0)-oy)/sc(z0),z0,z:z0,lane:0,vz:.3+2.3*Math.pow(Math.min(1,len/g.maxPull),1.3),   // a short pull lobs it slowly, a full pull snaps it
    ans:s.ans,lab:dispAns(s.ans),col:AMMO_COL,bounced:false,vx:0,sx:0,sy:0,vy:0,life:1});
  G.aimA=Math.atan2(dx,-dy); G.didFire=true; G.fired++; G.recoil=1;
  s.prev=s.ans; s.ans=''; s.wait=REFILL;
  const k=Math.min(1,len/g.maxPull); tone(140+k*120,.2,'triangle',.06+k*.12,2.2); noise(.08,500+k*700,1,.08+k*.2); sPew();
}
// tap / number key: the disc flies at the nearest tyyppä
function quickFire(i){
  if(!G||!G.running) return; audio();
  const g=slingGeo(), s=G.stacks&&G.stacks[i]; if(!s||!s.ans){ tone(110,.05,'square',.03); return; }
  const t=nearestTarget(s.ans), ox=g.sx[i], oy=g.sy;
  const dx=t?t.x-ox:0, dy=t?t.y-oy:-1; if(dy>-5) return;
  G.didMove=true; fireSlot(i,dx,dy,g.maxPull*.75);
}
// where a flying disc is on screen at depth z: it follows the aim line, rising to letter height
// The kerbs bounce discs back: the straight aim ray is folded at the road edges like a mirror.
const EDGE=.97;
function foldLane(l){ const P=4*EDGE; let t=((l+EDGE)%P+P)%P; return t<2*EDGE?t-EDGE:3*EDGE-t; }
function rawLane(s,z){ const y=py(z)-shotE(s,z)*sc(z); return [(s.cx+s.slope*(y-s.cy)-W/2)/lw(z), y]; }
function shotXY(s,z){ const [l,y]=rawLane(s,z); return [px(foldLane(l),z), y]; }
const bounceNo=l=>Math.floor((l+EDGE)/(2*EDGE));
// points along the path a disc would take with this aim (for the dotted line), and where it bounces
function aimPath(ux,uy,ox,oy){
  const z0=ZCAN+.05, s={cx:ox,cy:oy,slope:ux/uy,E0:(py(z0)-oy)/sc(z0),z0}, pts=[];
  let lastB=0, sy=1e9;
  for(let z=z0;z<ZF;z+=.02*z){ const [l,y]=rawLane(s,z), b=bounceNo(l), [x]=[px(foldLane(l),z)];
    if(Math.abs(sy-y)<13&&b===lastB) continue; sy=y; pts.push([x,y,b!==lastB]); lastB=b; }
  return pts;
}
/* Emergency: blow every tyyppä far back up the road. One use per minute. */
const EM_COOL=60;
function emGeo(){ const g=slingGeo(), r=Math.max(14,Math.min(20,g.TB*.1)); return {x:r+10, y:BY+r+10, r}; }
function emergency(){
  if(!G||!G.running||G.tut||(G.emT||0)>0) { tone(110,.05,'square',.03); return; }
  G.emT=EM_COOL; G.flash=.25; G.shake=reduce?0:.3; G.wind=.9;
  for(const e of G.enemies){ e.z=Math.max(e.z,ZF-.4+Math.random()*.7); e.air=0; e.lift=0; e.vz=0; e.dash=0; }
  if(G.boss){ G.boss.z=Math.max(G.boss.z,ZF+.2); G.boss.vz=0; }
  noise(.9,400,.4,.5); noise(.6,1600,.8,.25,.1); tone(300,.7,'sawtooth',.06,.3);
  floatText(W/2,H*.32,'HUIIIIS!','#5FD3FF',true);
}
function aimDir(){ // unit vector of the current aim (pulling, or the last/keyboard angle) and its origin
  const g=slingGeo();
  if(G.pull){ const ox=g.sx[G.pull.i], dx=ox-G.pull.x, dy=g.sy-G.pull.y, l=Math.hypot(dx,dy); if(l>4) return [dx/l,dy/l,l,ox,g.sy]; }
  const a=G.aimA||0, i=Math.min(G.sel||0,g.n-1); return [Math.sin(a),-Math.cos(a),0,g.sx[i],g.sy];
}
function fireKeyboard(){
  if(!G||!G.running) return;
  const g=slingGeo(), [ux,uy]=aimDir(), i=Math.min(G.sel||0,g.n-1);
  if(!G.stacks[i]||!G.stacks[i].ans){ tone(110,.05,'square',.03); return; }
  fireSlot(i,ux,uy,g.maxPull*.75);
}

/* ---------- Pointer ---------- */
function slowGeo(){ const m=emGeo(); return {x:W-m.x, y:m.y, r:m.r}; }
function onSlow(p){ const m=slowGeo(); return Math.hypot(p.x-m.x,p.y-m.y)<m.r*1.5; }
function onEm(p){ const m=emGeo(); return Math.hypot(p.x-m.x,p.y-m.y)<m.r*1.5; }
function stackAt(p){ const g=slingGeo(); if(p.y<BY) return -1; let best=-1,bd=1e9;
  g.sx.forEach((x,i)=>{ const d=Math.abs(p.x-x); if(d<g.slotW/2&&d<bd){bd=d;best=i;} }); return best; }
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running) return; audio();
  const p=canvasPoint(e);
  if(onEm(p)&&!G.tut){ emergency(); return; }
  if(onSlow(p)&&!G.tut){ useSlow(); return; }
  const i=stackAt(p); if(i<0) return;
  const g=slingGeo(), s=G.stacks[i]; if(!s||!s.ans){ tone(110,.05,'square',.03); return; }
  drag={id:e.pointerId,i,x0:p.x,y0:p.y,t0:performance.now(),moved:false};
  G.pull={i,x:g.sx[i],y:g.sy}; G.cur=s.ans; G.sel=i; noise(.04,2200,2,.08);
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id||!G||!G.pull) return;
  const p=canvasPoint(e), g=slingGeo(), dx=p.x-drag.x0, dy=p.y-drag.y0;
  if(Math.abs(dx)>8||Math.abs(dy)>8){ drag.moved=true; G.didMove=true; }
  const GAIN=1.7;                                   // the band stretches further than the finger moves
  const l=Math.hypot(dx,dy)*GAIN, k=(l>g.maxPull?g.maxPull/l:1)*GAIN;
  G.pull.x=g.sx[drag.i]+dx*k; G.pull.y=g.sy+dy*k;
  const st=Math.floor(Math.min(l,g.maxPull)/(g.maxPull/5)); if(st!==drag.st){ drag.st=st; tone(140+st*30,.04,'triangle',.05); } // creak while stretching
});
const endDrag=e=>{
  if(!drag||e.pointerId!==drag.id||!G){ drag=null; return; }
  const g=slingGeo(), i=drag.i;
  if(G.pull){
    const dx=g.sx[i]-G.pull.x, dy=g.sy-G.pull.y, l=Math.hypot(dx,dy);
    G.pull=null; G.cur=null;
    if(drag.moved&&l>g.r*.8&&dy<-l*.2) fireSlot(i,dx,dy,l);
    else if(!drag.moved) quickFire(i);
    else tone(120,.08,'sine',.06);                  // pulled sideways/upwards: band just snaps back
  }
  drag=null;
};
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',()=>{ drag=null; if(G){ G.pull=null; G.cur=null; } });

/* ---------- Keyboard ---------- */
addEventListener('keydown',e=>{
  if(!G)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){G.keys[e.key]=true;G.kbAim=true;e.preventDefault();}
  if(e.repeat)return;
  if(e.key===' '||e.key==='Enter'){ if(!G.running&&$('go'))$('go').click(); else fireKeyboard(); e.preventDefault(); return; }
  if(e.key==='x'||e.key==='X'){ emergency(); e.preventDefault(); }
  if(e.key==='z'||e.key==='Z'){ useSlow(); e.preventDefault(); }
  if(e.key>='1'&&e.key<='6'){ quickFire(+e.key-1); e.preventDefault(); }
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){ const n=slingGeo().n; G.sel=((G.sel||0)+(e.key==='ArrowUp'?1:n-1))%n; G.kbAim=true; e.preventDefault(); }
});
addEventListener('keyup',e=>{if(G)G.keys[e.key]=false;});
