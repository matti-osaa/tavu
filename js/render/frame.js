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
  // aim guide: dotted blocks down the lane
  ctx.fillStyle='rgba(43,35,51,.25)';
  for(let z=ZCAN+.35;z<ZF;z+=.28){const q=Math.max(2,6*sc(z)); ctx.fillRect(px(G.lane,z)-q/2,py(z)-q/2,q,q);}
  const items=[...(G.boss?[{z:G.boss.z+.05,f:()=>drawBoss(G.boss)}]:[]),...G.enemies.map(e=>({z:e.z,f:()=>drawCandy(e)})),...G.shots.filter(s=>!s.bounced).map(s=>({z:s.z-.01,f:()=>drawShot(s)}))];
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
  drawCannon();
  if(G.flash>0){ctx.fillStyle=`rgba(255,253,235,${G.flash*2.5})`;ctx.fillRect(-20,-20,W+40,H+40);}
  G.muzzle.forEach(drawMuzzle);
  if(G.phase==='alarm') drawAlarm();
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
    ctx.fillStyle='#1B1424'; ctx.fillText('LOPPUVASTUSTAJA LÄHESTYY',W/2+2,H*.38+fs*.85+2); ctx.fillStyle='#FFFFFF'; ctx.fillText('LOPPUVASTUSTAJA LÄHESTYY',W/2,H*.38+fs*.85);
  }
}
