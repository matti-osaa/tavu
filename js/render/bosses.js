/* Boss looks, one per world. Each skin draws the body only; the name banner and the letter plates
   (the hitboxes, in a band across the lower body) are drawn on top by drawBoss.
   P = {cx, gy, U, W:bodyW, H:bodyH, legH, top, X, step, t, col} – all screen pixels. */
const rrect=(x,y,w,h,r)=>{ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); };
const ink='#1B1424';
function bossEyes(cx,y,gap,s,col){ [-1,1].forEach(sd=>{ const x=cx+sd*gap; ctx.fillStyle=ink; ctx.beginPath(); ctx.arc(x,y,s*1.25,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#FFF6DE'; ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill(); ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x+sd*s*.15,y+s*.15,s*.5,0,Math.PI*2); ctx.fill(); }); }
const BOSS_SKINS={
  // Baba Yaga's hut on chicken legs
  cyr(P){ const {cx,gy,U,W,H,legH,top,X,step,t}=P;
    [-1,1].forEach(sd=>{ const lx=cx+sd*W*.26, lift=(sd*step>0?U*.35:0), ky=gy-legH*.55-lift;
      ctx.strokeStyle='#E8A23A'; ctx.lineWidth=U*.22; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(lx,gy-legH-U*.1); ctx.lineTo(lx-sd*U*.35,ky); ctx.lineTo(lx,gy-lift); ctx.stroke();
      ctx.lineWidth=U*.14; [-1,0,1].forEach(k=>{ ctx.beginPath(); ctx.moveTo(lx,gy-lift); ctx.lineTo(lx+k*U*.45+sd*U*.1,gy-lift+U*.12); ctx.stroke(); });
      ctx.fillStyle='#E9DCC0'; ctx.beginPath(); ctx.ellipse(lx,gy-legH-U*.15,U*.45,U*.3,0,0,Math.PI*2); ctx.fill(); });
    const logH=H/6; for(let i=0;i<6;i++){ ctx.fillStyle=i%2?'#7A4E2C':'#8B5A33'; rrect(X,top+i*logH,W,logH+1,logH*.45); ctx.fill();
      ctx.fillStyle='#A8794A'; [X-logH*.15,X+W-logH*.85].forEach(x=>{ ctx.beginPath(); ctx.arc(x+logH*.5,top+i*logH+logH*.5,logH*.42,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#6A4426'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x+logH*.5,top+i*logH+logH*.5,logH*.2,0,Math.PI*2); ctx.stroke(); }); }
    ctx.fillStyle='#4A3A44'; ctx.beginPath(); ctx.moveTo(X-W*.12,top+U*.1); ctx.lineTo(cx,top-H*.42); ctx.lineTo(X+W*1.12,top+U*.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#5E4C58'; ctx.lineWidth=2; for(let k=1;k<6;k++){ ctx.beginPath(); ctx.moveTo(X-W*.12+k*W*.224,top+U*.1); ctx.lineTo(cx,top-H*.42); ctx.stroke(); }
    ctx.fillStyle='#5A4A40'; ctx.fillRect(cx+W*.22,top-H*.38,U*.45,H*.3);
    for(let k=0;k<3;k++){ const p=(t*.6+k/3)%1; ctx.fillStyle=`rgba(220,220,230,${.5*(1-p)})`; ctx.beginPath(); ctx.arc(cx+W*.22+U*.22+Math.sin(p*6)*U*.3,top-H*.4-p*U*2.2,U*(.25+p*.4),0,Math.PI*2); ctx.fill(); }
    const wy=top+H*.22, ww=W*.36, wh=H*.24; ctx.fillStyle=ink; ctx.fillRect(cx-ww/2-3,wy-3,ww+6,wh+6); ctx.fillStyle='#2A1B12'; ctx.fillRect(cx-ww/2,wy,ww,wh);
    const blink=(t%3.5)<.15; if(!blink){ ctx.fillStyle=(Math.sin(t*6)>0)?'#FFE15A':'#FFB43A'; [-1,1].forEach(sd=>ctx.fillRect(cx+sd*ww*.2-U*.18,wy+wh*.35,U*.36,U*.3)); }
    ctx.fillStyle='#6A4426'; ctx.fillRect(cx-ww/2-U*.2,wy+wh,ww+U*.4,U*.18);
  },
  // Cyclops: one big eye, toga, sandals, swinging club
  gre(P){ const {cx,gy,U,W,H,legH,top,X,step,t}=P, skin='#E2B48A';
    [-1,1].forEach(sd=>{ const lx=cx+sd*W*.24, lift=(sd*step>0?U*.3:0); ctx.fillStyle=shade(skin,-15); ctx.fillRect(lx-U*.35,gy-legH-lift,U*.7,legH);
      ctx.fillStyle='#7A4E2C'; for(let k=0;k<3;k++) ctx.fillRect(lx-U*.38,gy-lift-U*(.15+k*.28),U*.76,U*.08); ctx.fillRect(lx-U*.45,gy-lift-U*.1,U*.9,U*.12); });
    ctx.fillStyle=skin; rrect(X,top,W,H,W*.32); ctx.fill();
    ctx.fillStyle='#F4EFE4'; ctx.beginPath(); ctx.moveTo(X+W*.05,top+H*.35); ctx.lineTo(X+W*.7,top+H*.18); ctx.lineTo(X+W*.98,top+H*.55); ctx.lineTo(X+W*.98,top+H*.95); ctx.lineTo(X+W*.04,top+H*.95); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#D9D0BE'; ctx.lineWidth=2; for(let k=1;k<4;k++){ ctx.beginPath(); ctx.moveTo(X+W*(.1+k*.2),top+H*.33); ctx.lineTo(X+W*(.05+k*.22),top+H*.95); ctx.stroke(); }
    const sw=Math.sin(t*3)*.5; ctx.save(); ctx.translate(X+W*1.02,top+H*.45); ctx.rotate(-.6+sw); ctx.fillStyle='#7A4E2C'; rrect(-U*.2,-U*2.4,U*.55,U*2.6,U*.25); ctx.fill(); ctx.fillStyle='#5E3A1E'; ctx.beginPath(); ctx.arc(U*.07,-U*2.3,U*.5,0,Math.PI*2); ctx.fill(); ctx.restore();
    const ey=top+H*.17, er=Math.min(W*.18,H*.16), blink=(t%4)<.14;
    ctx.fillStyle=ink; ctx.beginPath(); ctx.arc(cx,ey,er*1.18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FFF6DE'; ctx.beginPath(); ctx.arc(cx,ey,er,0,Math.PI*2); ctx.fill();
    if(!blink){ ctx.fillStyle='#2E86C1'; ctx.beginPath(); ctx.arc(cx+Math.sin(t*.9)*er*.3,ey+er*.15,er*.5,0,Math.PI*2); ctx.fill(); ctx.fillStyle=ink; ctx.beginPath(); ctx.arc(cx+Math.sin(t*.9)*er*.3,ey+er*.15,er*.24,0,Math.PI*2); ctx.fill(); }
    else { ctx.fillStyle=skin; ctx.fillRect(cx-er,ey-er,er*2,er*2); ctx.fillStyle=ink; ctx.fillRect(cx-er,ey,er*2,3); }
    ctx.fillStyle=ink; ctx.fillRect(cx-er*1.2,ey-er*1.45,er*2.4,U*.22);
    ctx.fillStyle='#4E8A3A'; for(let k=-3;k<=3;k++){ ctx.beginPath(); ctx.ellipse(cx+k*er*.42,top+U*.05,U*.28,U*.14,k*.3,0,Math.PI*2); ctx.fill(); }
  },
  // Oni: red ogre with horns, wild hair, tusks, tiger-stripe cloth
  kat(P){ const {cx,gy,U,W,H,legH,top,X,step,t}=P, red='#D9443A';
    [-1,1].forEach(sd=>{ const lx=cx+sd*W*.25, lift=(sd*step>0?U*.3:0); ctx.fillStyle=shade(red,-25); ctx.fillRect(lx-U*.4,gy-legH-lift,U*.8,legH); ctx.fillStyle=ink; ctx.fillRect(lx-U*.5,gy-lift-U*.18,U*1,U*.18); });
    ctx.fillStyle=red; rrect(X,top,W,H,U*.6); ctx.fill();
    ctx.fillStyle='#F2C230'; ctx.fillRect(X,top+H*.78,W,H*.22); ctx.fillStyle=ink; for(let k=0;k<7;k++){ ctx.beginPath(); const x=X+W*(k+.3)/7; ctx.moveTo(x,top+H*.78); ctx.lineTo(x+W*.05,top+H*.88); ctx.lineTo(x,top+H); ctx.lineTo(x-W*.02,top+H*.88); ctx.fill(); }
    ctx.fillStyle='#1B1424'; for(let k=0;k<9;k++){ const x=X+W*k/8; ctx.beginPath(); ctx.moveTo(x-U*.3,top+U*.3); ctx.lineTo(x+Math.sin(t*4+k)*U*.15,top-U*.6-(k%2)*U*.3); ctx.lineTo(x+U*.3,top+U*.3); ctx.fill(); }
    ctx.fillStyle='#F4EBD6'; [-1,1].forEach(sd=>{ ctx.beginPath(); ctx.moveTo(cx+sd*W*.28,top+U*.1); ctx.quadraticCurveTo(cx+sd*W*.42,top-U*.9,cx+sd*W*.3,top-U*1.6); ctx.lineTo(cx+sd*W*.2,top+U*.1); ctx.fill(); });
    bossEyes(cx,top+H*.2,W*.17,Math.min(U*.42,W*.09),'#F2C230');
    ctx.fillStyle=ink; [-1,1].forEach(sd=>{ ctx.beginPath(); ctx.moveTo(cx+sd*W*.05,top+H*.08); ctx.lineTo(cx+sd*W*.32,top+H*.04); ctx.lineTo(cx+sd*W*.3,top+H*.12); ctx.fill(); });
    const my=top+H*.38; ctx.fillStyle=ink; rrect(cx-W*.26,my,W*.52,U*.55,U*.2); ctx.fill();
    ctx.fillStyle='#F4EBD6'; [-1,1].forEach(sd=>{ ctx.beginPath(); ctx.moveTo(cx+sd*W*.18,my+U*.5); ctx.lineTo(cx+sd*W*.22,my-U*.3); ctx.lineTo(cx+sd*W*.13,my+U*.5); ctx.fill(); });
  },
  // Troll: mossy boulder body, long droopy nose, tiny eyes, stubby legs
  sv(P){ const {cx,gy,U,W,H,legH,top,X,step,t}=P, rock='#7D8A66';
    [-1,1].forEach(sd=>{ const lx=cx+sd*W*.22, lift=(sd*step>0?U*.25:0); ctx.fillStyle=shade(rock,-30); rrect(lx-U*.45,gy-legH-lift,U*.9,legH+U*.1,U*.3); ctx.fill(); });
    ctx.fillStyle=rock; ctx.beginPath(); ctx.ellipse(cx,top+H*.55,W*.56,H*.6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5E7A3A'; for(let k=0;k<7;k++){ ctx.beginPath(); ctx.ellipse(X+W*hash(k,3),top+H*(.1+.8*hash(k,5)),U*.5,U*.25,hash(k,9)*3,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='#A3B07E'; ctx.beginPath(); ctx.moveTo(cx-U*.2,top-H*.05); ctx.lineTo(cx+Math.sin(t*2)*U*.3,top-H*.35); ctx.lineTo(cx+U*.3,top-H*.05); ctx.fill();
    [-1,1].forEach(sd=>{ ctx.fillStyle=shade(rock,-10); ctx.beginPath(); ctx.ellipse(cx+sd*W*.52,top+H*.22,U*.35,U*.6,sd*.4,0,Math.PI*2); ctx.fill(); });
    const blink=(t%3)<.12; [-1,1].forEach(sd=>{ ctx.fillStyle=ink; ctx.beginPath(); ctx.arc(cx+sd*W*.13,top+H*.18,U*.2,0,Math.PI*2); ctx.fill(); if(!blink){ ctx.fillStyle='#FFE15A'; ctx.beginPath(); ctx.arc(cx+sd*W*.13,top+H*.18,U*.1,0,Math.PI*2); ctx.fill(); } });
    ctx.fillStyle=shade(rock,15); ctx.beginPath(); ctx.moveTo(cx-U*.35,top+H*.22); ctx.quadraticCurveTo(cx+U*.1,top+H*.3,cx+U*.25,top+H*.5+Math.sin(t*2)*U*.1); ctx.quadraticCurveTo(cx-U*.1,top+H*.55,cx-U*.25,top+H*.45); ctx.closePath(); ctx.fill();
  },
  // Dragon: green body, flapping wings, spiky back, smoking nostrils
  en(P){ const {cx,gy,U,W,H,legH,top,X,step,t}=P, green='#3E9B4F', flap=Math.sin(t*5);
    [-1,1].forEach(sd=>{ ctx.fillStyle=shade(green,-35); ctx.beginPath(); ctx.moveTo(cx+sd*W*.3,top+H*.3); ctx.lineTo(cx+sd*(W*.95),top-H*(.3+flap*.2)); ctx.lineTo(cx+sd*W*.85,top+H*.15); ctx.lineTo(cx+sd*W*1.0,top+H*(.25-flap*.1)); ctx.lineTo(cx+sd*W*.45,top+H*.7); ctx.closePath(); ctx.fill(); });
    ctx.strokeStyle=shade(green,-20); ctx.lineWidth=U*.35; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(X+W*.9,top+H*.85); ctx.quadraticCurveTo(X+W*1.3,gy-U*.2,X+W*1.15+Math.sin(t*2)*U*.4,gy-U*.9); ctx.stroke();
    [-1,1].forEach(sd=>{ const lx=cx+sd*W*.25, lift=(sd*step>0?U*.3:0); ctx.fillStyle=shade(green,-25); rrect(lx-U*.4,gy-legH-lift,U*.8,legH,U*.2); ctx.fill(); ctx.fillStyle='#F4EBD6'; for(let k=-1;k<=1;k++) ctx.fillRect(lx+k*U*.28-U*.06,gy-lift-U*.08,U*.12,U*.16); });
    ctx.fillStyle=green; rrect(X,top,W,H,W*.25); ctx.fill();
    ctx.fillStyle='#BFE3A0'; rrect(X+W*.18,top+H*.3,W*.64,H*.66,W*.2); ctx.fill();
    ctx.fillStyle='#F2C230'; for(let k=0;k<6;k++){ const x=X+W*(.12+k*.15); ctx.beginPath(); ctx.moveTo(x-U*.25,top+U*.15); ctx.lineTo(x,top-U*.5); ctx.lineTo(x+U*.25,top+U*.15); ctx.fill(); }
    bossEyes(cx,top+H*.16,W*.16,Math.min(U*.4,W*.09),'#E8323C');
    ctx.fillStyle=ink; [-1,1].forEach(sd=>{ ctx.beginPath(); ctx.arc(cx+sd*U*.3,top+H*.3,U*.1,0,Math.PI*2); ctx.fill(); });
    for(let k=0;k<2;k++){ const p=(t*.8+k*.5)%1; ctx.fillStyle=`rgba(200,200,200,${.5*(1-p)})`; [-1,1].forEach(sd=>{ ctx.beginPath(); ctx.arc(cx+sd*(U*.3+p*U*.6),top+H*.28-p*U*1.2,U*(.12+p*.25),0,Math.PI*2); ctx.fill(); }); }
  }
};
