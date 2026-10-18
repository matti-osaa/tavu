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
  const items=[...(G.boss?[{z:G.boss.z+.05,f:()=>drawBoss(G.boss)}]:[]),...G.enemies.map(e=>({z:e.z,f:()=>drawCandy(e)})),...(G.bolts||[]).map(b=>({z:b.z,f:()=>drawBolt(b)})),...G.shots.filter(s=>!s.bounced).map(s=>({z:s.z-.01,f:()=>drawShot(s)}))];
  items.sort((a,b)=>b.z-a.z).forEach(i=>i.f());
  G.shots.filter(s=>s.bounced).forEach(drawShot);
  for(const p of G.parts){
    const a=Math.max(0,p.life/p.max);
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
  if(G.hurt>0){ctx.fillStyle=`rgba(232,40,50,${G.hurt*1.2})`;ctx.fillRect(-20,-20,W+40,H+40);}
  if(G.flash>0){ctx.fillStyle=`rgba(255,253,235,${G.flash*2.5})`;ctx.fillRect(-20,-20,W+40,H+40);}
  G.muzzle.forEach(drawMuzzle);
  if(G.phase==='alarm') drawAlarm();
  // help hand: only if after 15 s the player still hasn't both moved and fired
  if(G.tut&&G.running) drawTutorial();
  else if(G.running&&G.playT>15&&!(G.didMove&&G.didFire)&&G.endT<0&&G.phase!=='alarm') drawHelpHand();
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
  G.dt=dt; update(dt); if(G){draw(); raf=requestAnimationFrame(loop);}
}

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
    ctx.font=`700 ${Math.round(fs*.36)}px ${PXF}`;
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
/* The sling move, acted out by the hand: take the right disc from its stack, drop it in the band,
   pull back away from the target and let go. t runs 0..3.4 s in a loop. */
function drawSlingDemo(t,target){
  const g=slingGeo(), i=G.stacks?G.stacks.findIndex(s=>s.ans===target.ans):-1;
  const tx=px(target.lane,target.z), ty=py(target.z)-RB*sc(target.z)*.9;
  const dx=tx-g.cx, dy=ty-g.cy, l=Math.hypot(dx,dy)||1, pull=g.maxPull*.8, Px=g.cx-dx/l*pull, Py=g.cy-dy/l*pull;
  const ease=k=>k*k*(3-2*k);
  let hx,hy,press=0,ghost=null;
  const loaded=G.cur===target.ans;
  if(!loaded&&i>=0&&t<1.3){ // carry from the stack to the band
    const sx=g.sx[i], sy=g.sy;
    if(t<.3){ hx=sx; hy=sy; press=1; }
    else { const k=ease(Math.min(1,(t-.3)/.8)); hx=sx+(g.cx-sx)*k; hy=sy+(g.cy-sy)*k; press=1; ghost=[hx,hy-g.r*.4]; }
  } else { const t2=loaded?t%2.1:(t-1.3);
    if(t2<.25){ hx=g.cx; hy=g.cy; press=1; }
    else if(t2<1.2){ const k=ease((t2-.25)/.95); hx=g.cx+(Px-g.cx)*k; hy=g.cy+(Py-g.cy)*k; press=1;
      // show the stretch and the aim line it makes
      ctx.save(); ctx.globalAlpha=.6; ctx.strokeStyle='#D23A3A'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(g.cx-g.post,g.cy); ctx.lineTo(hx,hy); ctx.lineTo(g.cx+g.post,g.cy); ctx.stroke();
      for(let d=g.r*2;d<l;d+=18){ ctx.fillStyle='#FFFFFF'; ctx.globalAlpha=.6*k*(1-d/l); ctx.fillRect(g.cx+dx/l*d-3,g.cy+dy/l*d-3,6,6); } ctx.restore(); }
    else { const k=Math.min(1,(t2-1.2)/.5); hx=Px; hy=Py+k*8; press=0;
      if(k<1){ ctx.save(); ctx.globalAlpha=1-k; ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=4; const q=g.r*(1+k*2); ctx.strokeRect(g.cx-q,g.cy-q,q*2,q*2); ctx.restore(); } }
  }
  if(ghost){ ctx.save(); ctx.globalAlpha=.75; drawDisc(ghost[0],ghost[1],g.r,dispAns(target.ans),AMMO_COL,{maxW:W*.3}); ctx.restore(); }
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
