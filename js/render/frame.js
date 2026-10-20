/* One frame: scene, actors far→near, particles, cannon, floating texts; plus the main loop. */
function drawMuzzle(m){
  const t=1-m.life/m.max, x=px(G.lane,ZCAN), y=BY+6-Math.max(30,RB*.75)*1.9, q=16+t*40;
  ctx.save(); ctx.globalAlpha=1-t; ctx.strokeStyle=m.col; ctx.lineWidth=Math.max(2,6*(1-t)); ctx.strokeRect(x-q/2,y-q/2,q,q);
  ctx.font=`800 ${Math.round(20+t*14)}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const lx=x+40+t*18, ly=y-10-t*36; ctx.fillStyle='#2B2333'; ctx.fillText(m.ans,lx+2,ly+2); ctx.fillStyle=m.col; ctx.fillText(m.ans,lx,ly);
  ctx.restore();
}
function draw(){
  ctx.save(); ctx.imageSmoothingEnabled=false;
  if(G.shake>0){ctx.translate(Math.round((Math.random()-.5)*14*G.shake/.35),Math.round((Math.random()-.5)*10*G.shake/.35));}
  drawBg();
  if(save.diff==='easy') drawZap();
  const items=[...(G.boss?[{z:G.boss.z+.05,f:()=>drawBoss(G.boss)}]:[]),...G.enemies.map(e=>({z:e.z,f:()=>drawCandy(e)})),...(G.rocks||[]).map(r=>({z:r.z+.001,f:()=>drawRock(r)})),...(G.bolts||[]).map(b=>({z:b.z,f:()=>drawBolt(b)})),...G.shots.filter(s=>!s.bounced).map(s=>({z:s.z-.01,f:()=>drawShot(s)}))];
  items.sort((a,b)=>b.z-a.z).forEach(i=>i.f());
  G.shots.filter(s=>s.bounced).forEach(drawShot);
  for(const p of G.parts){
    const a=Math.max(0,p.life/p.max);
    if(p.squash){ const k=1-a; ctx.save(); ctx.globalAlpha=a; ctx.translate(p.x,p.y); const q=Math.round(k*3)/3; ctx.scale(1+q*.6,1-q*.45); smoothText(p.ch,0,0,p.sz*1.9,p.col,true); ctx.restore(); continue; }
    if(p.conf){ ctx.save(); ctx.globalAlpha=Math.min(1,a*2); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.scale(1,Math.cos(p.rot*1.7)); ctx.fillStyle=p.col; ctx.fillRect(-p.sz/2,-p.sz*.3,p.sz,p.sz*.6); ctx.restore(); continue; }
    if(p.flashball){ctx.globalAlpha=a;ctx.fillStyle='#FFFDF0';const q=p.r*2*(1.2-a*.4);ctx.fillRect(p.x-q/2,p.y-q/2,q,q);ctx.globalAlpha=1;continue;}
    if(p.clang){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff';const d=p.r*(.5+(1-a)*.9), q=Math.max(3,p.r*.14);
      for(let i=0;i<8;i++){const an=i/8*Math.PI*2; for(let k=.55;k<=1;k+=.15)ctx.fillRect(p.x+Math.cos(an)*d*k-q/2,p.y+Math.sin(an)*d*k-q/2,q,q);}
      ctx.font=`700 24px ${PXF}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#2B2333';ctx.fillText('KLING!',p.x+2,p.y-d-10);ctx.fillStyle='#fff';ctx.fillText('KLING!',p.x,p.y-d-12);ctx.restore();continue;}
    if(p.chunk){ctx.globalAlpha=Math.min(1,a*1.6); cube(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.col,false); ctx.globalAlpha=1; continue;}
    if(p.glyph){ctx.save();ctx.globalAlpha=Math.min(1,a*1.8);
      let fs=p.sz*2; ctx.font=`900 ${fs}px ${LTF}`; {const mw=ctx.measureText(p.ch).width; if(mw>p.sz*3.4)fs*=p.sz*3.4/mw;} const bx=smoothText(p.ch,p.x,p.y+fs*.36,fs,p.col,false);
      const pop=Math.min(1,(1-a)*6); if(p.fi)sign(p.x,p.y+fs*.36+p.sz*.55,p.sz*.75*(.6+.4*pop),p.ans,p.fi,'#E9A800'); else badge(p.x+bx.w/2,p.y,p.sz*.48*(.6+.4*pop),p.ans,'#E9A800','#fff',false);
      ctx.restore();continue;}
    if(p.ring){ctx.strokeStyle=p.col;ctx.globalAlpha=a;ctx.lineWidth=Math.max(2,Math.round(6*a));const q=p.r*2*(1+(1-a)*2.2);ctx.strokeRect(p.x-q/2,p.y-q/2,q,q);ctx.globalAlpha=1;continue;}
    ctx.globalAlpha=Math.min(1,a*1.5); ctx.fillStyle=p.col; const q=Math.max(2,p.sz); ctx.fillRect(Math.round(p.x-q/2),Math.round(p.y-q/2),q,q); ctx.globalAlpha=1;
  }
  drawSling();
  if(G.slowT>0){ const a=Math.min(1,G.slowT)*.18; ctx.fillStyle=`rgba(80,180,255,${a})`; ctx.fillRect(-20,-20,W+40,BY+20);
    ctx.fillStyle=`rgba(80,180,255,${a*2})`; for(let i=0;i<4;i++) ctx.fillRect(0,0,W,6-i), ctx.fillRect(0,BY-6+i,W,1); }
  if(G.wind>0){ ctx.save(); ctx.globalAlpha=Math.min(1,G.wind*1.5)*.7; ctx.fillStyle='#FFFFFF';
    for(let i=0;i<26;i++){ const y=HY+((i*53)%Math.max(1,BY-HY)), x=((i*97+(1-G.wind)*W*2.2)%(W+200))-100, len=40+(i%5)*20; ctx.fillRect(W-x-len,y,len,3); } ctx.restore(); }
  if(G.hp<40){ // badly hurt: the screen edges glow red, pulsing like a heartbeat
    const k=(40-G.hp)/40, beat=Math.pow((Math.sin(G.t*7)+1)/2,3), a=k*(.35+.25*beat), g=ctx.createRadialGradient(W/2,H*.45,Math.min(W,H)*.2,W/2,H*.45,Math.max(W,H)*.75);
    g.addColorStop(0,'rgba(200,20,30,0)'); g.addColorStop(1,`rgba(200,20,30,${a})`); ctx.fillStyle=g; ctx.fillRect(-20,-20,W+40,H+40);
    ctx.fillStyle=`rgba(200,20,30,${k*.12})`; ctx.fillRect(-20,-20,W+40,H+40); }
  if(G.hurt>0){ctx.fillStyle=`rgba(232,40,50,${G.hurt*1.2})`;ctx.fillRect(-20,-20,W+40,H+40);}
  if(G.flash>0){ctx.fillStyle=`rgba(255,253,235,${G.flash*2.5})`;ctx.fillRect(-20,-20,W+40,H+40);}
  G.muzzle.forEach(drawMuzzle);
  if(G.phase==='alarm') drawAlarm();
  // help hand: only if after 15 s the player still hasn't both moved and fired
  if(G.tut&&G.running) drawTutorial();
  else if(G.running&&G.playT>15&&!(G.didMove&&G.didFire)&&G.endT<0&&G.phase!=='alarm') drawHelpHand();
  if(G.splat) drawSplat(G.splat);
  for(const t of G.texts){
    const a=Math.min(1,t.life*2), sz=t.big?30:22;
    ctx.save(); ctx.globalAlpha=a;
    ctx.font=`800 ${sz}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#2B2333'; ctx.fillText(t.txt,t.x+3,t.y+3); ctx.fillStyle='#FFFFFF'; ctx.fillText(t.txt,t.x+1,t.y+1); ctx.fillStyle=t.col; ctx.fillText(t.txt,t.x,t.y);
    ctx.restore();
  }
  ctx.restore();
}
function loop(now){
  if(!G)return; const dt=Math.min(.05,(now-last)/1000); last=now;
  try{ G.dt=dt; update(dt); if(G) draw(); }
  catch(err){ showBug(err); }                     // a bug must not freeze the game: report it and keep going
  if(G) raf=requestAnimationFrame(loop);
}
/* Small bug note in the corner (so a screenshot tells what broke) */
function showBug(err){
  const m=(err&&(err.stack||err.message))||String(err); if(window._lastBug===m) return; window._lastBug=m;
  console.error('[Tavu bugi]',err);
  try{ localStorage.setItem('tavu-lastbug',new Date().toLocaleString('fi-FI')+'\n'+m); }catch(_){}
  let el=document.getElementById('bugnote'); if(!el){ el=document.createElement('div'); el.id='bugnote';
    el.style.cssText='position:fixed;left:6px;bottom:6px;right:6px;z-index:99;background:#2B2333;color:#FFB4B4;font:11px/1.3 monospace;padding:6px 8px;border-radius:6px;white-space:pre-wrap;max-height:30vh;overflow:auto;opacity:.92';
    el.onclick=()=>{ if(navigator.clipboard) navigator.clipboard.writeText(el.textContent).catch(()=>{}); el.remove(); }; document.body.appendChild(el); }
  el.textContent='Bugi: '+m.split('\n').slice(0,12).join('\n');
}
addEventListener('error',e=>showBug(e.error||e.message));
addEventListener('unhandledrejection',e=>showBug(e.reason));

/* Boss warning: red pulse, scrolling hazard stripes and blinking text */
function drawAlarm(){
  const t=2.6-G.alarmT, pulse=(Math.sin(t*14)+1)/2;
  ctx.fillStyle=`rgba(230,30,40,${.12+pulse*.18})`; ctx.fillRect(0,0,W,H);
  const bh=Math.max(22,H*.045), off=(t*120)%40;
  [H*.18,H*.62].forEach(y=>{ ctx.fillStyle='#1B1424'; ctx.fillRect(0,y,W,bh);
    ctx.save(); ctx.beginPath(); ctx.rect(0,y,W,bh); ctx.clip(); ctx.fillStyle='#FFD21E';
    for(let x=-40+off;x<W+40;x+=40){ctx.beginPath(); ctx.moveTo(x,y+bh); ctx.lineTo(x+20,y); ctx.lineTo(x+34,y); ctx.lineTo(x+14,y+bh); ctx.fill();}
    ctx.restore(); });
  if(Math.floor(t*4)%2===0){
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const fs=Math.round(Math.min(W*.14,64)); ctx.font=`700 ${fs}px ${PXF}`;
    ctx.fillStyle='#1B1424'; ctx.fillText('VAROITUS!',W/2+4,H*.38+4); ctx.fillStyle='#FFD21E'; ctx.fillText('VAROITUS!',W/2,H*.38);
    ctx.font=`900 ${Math.round(fs*.4)}px ${LTF}`;   // smooth font: the name may be Cyrillic, Greek or kana
    const nm=(G.bossNext||'LOPPUVASTUSTAJA')+' LÄHESTYY'; ctx.fillStyle='#1B1424'; ctx.fillText(nm,W/2+2,H*.38+fs*.85+2); ctx.fillStyle='#FFFFFF'; ctx.fillText(nm,W/2,H*.38+fs*.85);
  }
}

/* Pixel pointing hand, fingertip at (hx,hy) */
function drawHand(hx,hy,press,label){
  const u=Math.max(30,RB*.75), p=Math.max(3,Math.round(u*.11));
  const HAND=['..XX......','.XWWX.....','.XWWX.....','.XWWXXX...','.XWWXWWXX.','XXWWXWWXWX','XWWWWWWWWX','XWWWWWWWWX','.XWWWWWWX.','..XWWWWX..','..XXXXXX..'];
  const ox=hx-p*3, oy=hy-p*.5;
  ctx.save(); ctx.globalAlpha=.95;
  HAND.forEach((row,ry)=>[...row].forEach((c,rx)=>{ if(c==='.')return; ctx.fillStyle=c==='X'?'#2B2333':(press?'#FFF1C9':'#FFFFFF'); ctx.fillRect(Math.round(ox+rx*p),Math.round(oy+ry*p),p,p); }));
  if(label){ ctx.font=`700 ${Math.round(Math.max(14,u*.4))}px ${PXF}`; ctx.textAlign='center'; ctx.textBaseline='top';
    const ly=oy+HAND.length*p+6; ctx.fillStyle='#2B2333'; ctx.fillText(label,hx+p*2+2,ly+2); ctx.fillStyle='#FFE15A'; ctx.fillText(label,hx+p*2,ly); }
  ctx.restore();
}
/* The sling move, acted out by the hand: press the right disc, pull it back away from the target, let go.
   t runs 0..3.4 s in a loop. */
function drawSlingDemo(t,target){
  const g=slingGeo(), i=G.stacks?G.stacks.findIndex(s=>s.ans===target.ans):-1; if(i<0) return;
  const ox=g.sx[i], oy=g.sy, tx=px(target.lane,target.z), ty=py(target.z)-RB*sc(target.z)*.9;
  const dx=tx-ox, dy=ty-oy, l=Math.hypot(dx,dy)||1, pull=g.maxPull*.75, Px=ox-dx/l*pull, Py=oy-dy/l*pull;
  const ease=k=>k*k*(3-2*k), t2=t%2.4; let hx,hy,press=0;
  if(t2<.3){ hx=ox; hy=oy; press=1; }
  else if(t2<1.3){ const k=ease((t2-.3)/1); hx=ox+(Px-ox)*k; hy=oy+(Py-oy)*k; press=1;
    ctx.save(); for(let d=g.r*2;d<l;d+=18){ ctx.fillStyle='#FFFFFF'; ctx.globalAlpha=.6*k*(1-d/l); ctx.fillRect(ox+dx/l*d-3,oy+dy/l*d-3,6,6); } ctx.restore(); }
  else { const k=Math.min(1,(t2-1.3)/.5); hx=Px; hy=Py+k*8;
    if(k<1){ ctx.save(); ctx.globalAlpha=1-k; ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=4; const q=g.r*(1+k*2); ctx.strokeRect(ox-q,oy-q,q*2,q*2); ctx.restore(); } }
  drawHand(hx,hy,press,'');
}
/* Help when the player hasn't loaded and fired within 15 s: the hand shows the move on the nearest tyyppä */
function drawHelpHand(){
  const tg=[...G.enemies].filter(e=>!e.air).sort((a,b)=>a.z-b.z)[0]; if(!tg) return;
  drawSlingDemo((G.playT-15)%3.4,tg);
}

/* Words released by a defeated boss: they burst out, then hover with a gentle bob */
function drawLoot(){
  G.loot.forEach((l,i)=>{
    l.t=Math.min(1,l.t+(G.dt||0)*1.4); const e=1-Math.pow(1-l.t,3);
    const x=l.x+(l.tx-l.x)*e, y=l.y+(l.ty-l.y)*e-Math.sin(e*Math.PI)*60+Math.sin(G.t*3+i)*4;
    const h=Math.max(30,Math.min(46,W*.1))*(.4+.6*e);
    sign(x,y,h,l.word,(l.lat?l.lat+' = ':'')+l.fi,G.season?'#E8781A':'#E9A800');
  });
}

/* Tutorial overlay: shows the pair (disc = foreign letter) and the hand doing the sling move */
function drawTutorial(){
  const T=G.tut; if(T.step>1||T.done) return;
  const tgt=T.target; if(!tgt||!G.enemies.includes(tgt)) return;
  const s=Math.min(W*.18,76), y=H*.13, cx=W/2;
  ctx.save();
  ctx.fillStyle='rgba(27,20,36,.55)'; ctx.fillRect(cx-s*2.2,y-s*.25,s*4.4,s*1.5);
  drawDisc(cx-s*1.3,y+s*.5,s*.5,dispAns(tgt.ans),AMMO_COL,{maxW:s*1.6});
  ctx.font=`900 ${Math.round(s*.72)}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#FFFFFF'; ctx.fillText('=',cx,y+s*.5);
  smoothText(tgt.disp,cx+s*1.3,y+s*.86,s*1.05,tgt.col,false);
  ctx.restore();
  drawSlingDemo(T.t%3.4,tgt);
}

/* Easy mode: an electric strip across the road near the line; tyypät crawl through it */
function drawZap(){
  const t=G.t, fl=(Math.sin(t*23)+Math.sin(t*37))*.5;
  ctx.save(); ctx.globalAlpha=.28+fl*.08;
  quad(-1,1,ZAP_Z0,ZAP_Z1,'#4FC8FF'); ctx.globalAlpha=1;
  // emitters on both kerbs
  [-1,1].forEach(sd=>{ const x=px(sd*1.05,ZAP_Z1), y=py(ZAP_Z1), u=Math.max(6,RB*sc(ZAP_Z1)*.3);
    cube(x-u/2,y-u*2.2,u,'#3A4A66',false); ctx.fillStyle='#BFF0FF'; ctx.fillRect(x-u*.25,y-u*2.6,u*.5,u*.5); });
  // two lightning bolts zigzagging across
  for(let k=0;k<2;k++){ const z=ZAP_Z0+(ZAP_Z1-ZAP_Z0)*(.3+.4*k), seg=12;
    ctx.strokeStyle=k?'#FFFFFF':'#8FE3FF'; ctx.lineWidth=k?2:4; ctx.globalAlpha=.6+.4*Math.random(); ctx.beginPath();
    for(let i=0;i<=seg;i++){ const l=-1.05+2.1*i/seg, x=px(l,z), y=py(z)-RB*sc(z)*(.15+Math.random()*.35); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
    ctx.stroke(); }
  ctx.restore();
}

// the last bug survives a reload: open the game with #bugi to see it again
if(location.hash==='#bugi'){ try{ const b=localStorage.getItem('tavu-lastbug'); if(b) setTimeout(()=>{ window._lastBug=''; showBug(b); },300); }catch(_){} }

/* A disc thrown back by a catcher: flies at the screen and splats there for a moment */
function drawSplat(sp){
  const tx=sp.x*W, ty=sp.y*H;
  ctx.save();
  if(sp.t<.35){ const k=sp.t/.35, x=sp.from[0]+(tx-sp.from[0])*k, y=sp.from[1]+(ty-sp.from[1])*k-Math.sin(k*Math.PI)*60, r=10+k*k*W*.18;
    ctx.translate(x,y); ctx.rotate(k*6); drawDisc(0,0,r,sp.lab,'#9C93A8',{maxW:r*4}); ctx.restore(); return; }
  const a=sp.t<1.6?1:Math.max(0,1-(sp.t-1.6)), R=W*.2;
  ctx.globalAlpha=a*.9; ctx.translate(tx,ty); ctx.rotate(sp.rot);
  ctx.fillStyle='#8E86A0';
  for(let i=0;i<9;i++){ const an=i/9*Math.PI*2, d=R*(.8+.35*Math.sin(i*2.3)); ctx.beginPath(); ctx.arc(Math.cos(an)*d,Math.sin(an)*d,R*.28,0,Math.PI*2); ctx.fill(); }
  for(let i=0;i<4;i++){ const dx=(i-1.5)*R*.45, len=R*(.5+.3*Math.sin(i))+ (sp.t-.35)*R*.4; ctx.fillRect(dx-R*.06,0,R*.12,R+len); ctx.beginPath(); ctx.arc(dx,R+len,R*.1,0,Math.PI*2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#FFFFFF'; ctx.font=`900 ${Math.round(R*.9)}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(sp.lab,0,R*.05);
  ctx.restore();
}

/* Crash log. A phone browser that runs out of memory kills the page without any error, so every
   2 s we note what the game is doing. If the page dies mid-level, the next load finds the note
   still saying "running" and keeps it as the crash report (open the game with #bugi to see it). */
const HB_KEY='tavu-hb';
try{ const prev=JSON.parse(localStorage.getItem(HB_KEY)||'null');
  if(prev&&prev.running){ localStorage.setItem('tavu-lastbug','Peli kaatui ilman virheilmoitusta (selain sulki sivun).\n'+JSON.stringify(prev)); }
  localStorage.removeItem(HB_KEY); }catch(_){}
let _hbFrames=0, _hbT=performance.now();
setInterval(()=>{
  const now=performance.now(), fps=Math.round(_hbFrames*1000/(now-_hbT)); _hbFrames=0; _hbT=now;
  try{
    if(!G||!G.running&&G.endT<0&&!G.limboOn){ localStorage.removeItem(HB_KEY); return; }
    const hb={running:true, aika:new Date().toLocaleTimeString('fi-FI'), maailma:G.w.id, taso:G.si, vaihe:G.phase, fps,
      tyypat:G.enemies.length, partikkelit:G.parts.length, kiekot:G.shots.length, bossi:!!G.boss, hp:Math.round(G.hp),
      huudot:window._cries||0, varahuudot:window._fallback||0, aani:ac?ac.state:'-', aaniladattu:Object.keys(CRY.buf).join(','),
      muisti:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6)+'MB':'?', ua:navigator.userAgent.slice(0,80)};
    localStorage.setItem(HB_KEY,JSON.stringify(hb));
  }catch(_){}
},2000);
(function countFrames(){ _hbFrames++; requestAnimationFrame(countFrames); })();
// leaving or reloading the page on purpose is not a crash
addEventListener('pagehide',()=>{ try{ localStorage.removeItem(HB_KEY); }catch(_){} });
