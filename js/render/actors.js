/* Actors: tyypät (letter creatures), shots and the cannon. */
const RADAR_Z=1.8;   // how close (z) a tyyppä must come before the help radar picks it up
function drawCandy(e){
  let headroom=0;
  const s0=sc(e.z), R=RB*s0*(e.grab?1+.35*(e.grow??1):1), x=px(e.lane,e.z), gy=py(e.z);
  const near=Math.max(0,Math.min(1,(2.4-e.z)/1.1));
  const step=G.t*(5+near*5)+e.ph, stepI=Math.floor(step/Math.PI)%2;
  if(!e.rows) e.rows=wordRows(e.ch,e.disp,G.w.lang);                   // long words stack syllable rows
  const rows=e.rows, longest=rows.reduce((a,r)=>r.length>a.length?r:a,'');
  let fs=R*2.45*(longest.length>1?.8:1); ctx.font=`900 ${fs}px ${LTF}`; {const mw=ctx.measureText(longest).width, lim=R*3.2; if(mw>lim)fs*=lim/mw;}
  ctx.font=`900 ${fs}px ${LTF}`; const LH=fs*.86, TW=Math.max(...rows.map(r=>ctx.measureText(r).width)), TH=fs*.72+(rows.length-1)*LH, u=Math.max(1.5,R*2.1/11);
  e.hw=TW/2; e.hs=s0;                                                       // half width on screen, used for hits
  const hop=(Math.sin(step)>0?1:0)*u*(1+near)+(e.lift||0)*RB*s0*2.2;
  const jx=e.shake>0?Math.round(Math.sin(e.shake*60)*2)*u:0, a=Math.min(1,(G.t-e.born)*3);
  ctx.save(); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(30,20,40,.22)'; ctx.fillRect(x-TW*.45,gy-u*.4,TW*.9,u*.8);
  const by=gy-hop-u*1.2, cx=x+jx;
  const dark=shade(e.col,-80), PART=.45;   // feet, arms, eyes and hats stay see-through so the letter reads first
  const plain=G.plain, blk=e.block>0?1-e.block/.75:-1, midY=by-TH*.55, half=TW/2;
  ctx.globalAlpha=a*PART;
  if(!plain){
  // feet (pixel blocks), alternate stepping
  const fw=Math.max(2,u*2), fh=Math.max(2,u*1.2), fx=TW*.25;
  ctx.fillStyle=dark; ctx.fillRect(cx-fx-fw/2,by+(stepI?-u:0),fw,fh); ctx.fillRect(cx+fx-fw/2,by+(stepI?0:-u),fw,fh);
  // arms
  if(blk<0){const up=Math.round(near*2+(Math.sin(G.t*(6+near*8)+e.ph)>0?1:0));
    ctx.fillStyle=dark; [-1,1].forEach(sd=>{ctx.fillRect(sd<0?cx-half-u*2:cx+half,midY-up*u,u*2,u); ctx.fillRect(sd<0?cx-half-u*3:cx+half+u*2,midY-up*u-u*(up>0?1:0),u,u*(up>0?2:1));});}
  }
  const box={ox:cx-TW/2,oy:by-TH,w:TW,h:TH};
  // small eyes sitting just above the letter
  const eyY=box.oy-u*2.6, es=Math.max(3,u*1.7), blink=((G.t+e.ph)%4)<.12;
  if(!plain) [-1,1].forEach(sd=>{const ex=cx+sd*u*2.2-es/2;
    ctx.fillStyle=dark; ctx.fillRect(ex-u*.5,eyY-u*.5,es+u,es+u);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(ex,eyY+(blink?es*.4:0),es,blink?es*.2:es);
    if(!blink){ctx.fillStyle='#1B1424'; ctx.fillRect(ex+(sd<0?es*.45:es*.1),eyY+es*.4,es*.45,es*.5);}
    // brow: two pixel steps, angrier when near
    ctx.fillStyle=dark; const by2=eyY-u*(1.2+near*.6);
    ctx.fillRect(ex+(sd<0?0:es*.5),by2+(sd<0?0:u*near),es*.5,u); ctx.fillRect(ex+(sd<0?es*.5:0),by2+(sd<0?u*near:0),es*.5,u);});
  headroom=(!plain&&G.season&&G.season.accessory)?G.season.accessory(cx,eyY,u,near)||0:0;
  if(blk>=0){ // parry: block bar across the body, then knock aside
    const inT=Math.min(1,blk/.3), outT=Math.max(0,(blk-.55)/.45), wv=TW+u*4;
    ctx.fillStyle=dark; ctx.fillRect(cx-wv/2*inT+outT*u*6,midY-u,wv*inT,u*2);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx-wv/2*inT+outT*u*6-u,midY-u*1.5,u*3,u*3); ctx.fillRect(cx+wv/2*inT+outT*u*6-u*2,midY-u*1.5,u*3,u*3);
  }
  if(e.runner){ // speed streaks while dashing, a small lightning tag otherwise
    ctx.globalAlpha=a*(e.dash>0?.8:.35); ctx.fillStyle=e.col;
    for(let k=0;k<3;k++) ctx.fillRect(cx-TW*.6-u*(3+k*2),by-TH*(.25+k*.25),u*(2+k),Math.max(2,u*.5));
  }
  ctx.globalAlpha=a;
  const radar=e.frozen?1:Math.max(0,Math.min(1,(RADAR_Z-e.z)/.15));   // tutorial targets always lit
  if(G.assist&&G.cur&&e.ans===G.cur&&radar>0){ // beginner help "radar": the match lights up gold once it comes close
    if(!e.pinged){ e.pinged=true; G.parts.push({ring:true,x:cx,y:by-TH/2,r:Math.max(TW,TH),life:.5,max:.5,col:'#FFD21E'}); }
    const pulse=(Math.sin(G.t*6)+1)/2, m=u*(1.5+pulse);
    ctx.globalAlpha=a*radar;
    ctx.fillStyle=`rgba(255,210,40,${.25+pulse*.25})`; ctx.fillRect(cx-TW/2-m,by-TH-m,TW+m*2,TH+m*1.6);
    ctx.strokeStyle='#FFD21E'; ctx.lineWidth=Math.max(2,u*.5); ctx.strokeRect(cx-TW/2-m,by-TH-m,TW+m*2,TH+m*1.6);
    ctx.globalAlpha=a;
  } else if(e.ans!==G.cur) e.pinged=false;
  if(e.pumpkin&&G.season&&G.season.body) G.season.body(cx,by,TW,TH,u,e.seed||1);
  // a soft squash-and-stretch with every step, so even plain letters walk with a bounce
  { const sq=Math.sin(step*2)*.06*(e.vz>.05?1:.3); ctx.save(); ctx.translate(cx,by); ctx.scale(1+sq,1-sq); ctx.translate(-cx,-by);
    rows.forEach((r,i)=>smoothText(r,cx,by-(rows.length-1-i)*LH,fs,e.col,e.shield>.2)); ctx.restore(); }
  if(e.shieldHp>0&&e.grab){ // hoarder's shield: the grabbed disc, held up in front, cracking with every right hit
    const sw=Math.max(TW*.8,R*1.6), sh=TH*.75, sx=cx-sw/2+Math.sin(G.t*3+e.ph)*u, sy=by-TH*.55-sh/2;
    ctx.save(); ctx.globalAlpha=a*.92;
    ctx.fillStyle='#2B2333'; ctx.fillRect(sx-3,sy-3,sw+6,sh+6); ctx.fillStyle='#B9B3C6'; ctx.fillRect(sx,sy,sw,sh);
    ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(sx,sy,sw,Math.max(2,sh*.12));
    ctx.font=`900 ${Math.round(sh*.7)}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#4A4356'; ctx.fillText(e.grab,cx+Math.sin(G.t*3+e.ph)*u,sy+sh/2+1);
    ctx.strokeStyle='#2B2333'; ctx.lineWidth=Math.max(1.5,u*.5); const cr=3-e.shieldHp;
    for(let k=0;k<cr;k++){ const ox=sx+sw*(.25+.25*k); ctx.beginPath(); ctx.moveTo(ox,sy); ctx.lineTo(ox+sw*.08,sy+sh*.4); ctx.lineTo(ox-sw*.05,sy+sh*.7); ctx.lineTo(ox+sw*.04,sy+sh); ctx.stroke(); }
    ctx.restore(); }
  if(e.held){ // catcher holds the wrong disc up, ready to throw
    const wob=Math.sin(G.t*20)*u*.6; ctx.save(); drawDisc(cx+wob,by-TH-R*.7,R*.45,e.held,'#9C93A8',{maxW:R*3}); ctx.restore(); }
  if(e.shoots){ // shooter tyypät carry a small red marker
    ctx.fillStyle='#E8323C'; ctx.fillRect(cx-u*1.2,by+u*.4,u*2.4,u*1.1); ctx.fillStyle='#FFD21E'; ctx.fillRect(cx-u*.4,by+u*.6,u*.8,u*.7);
  }
  if(e.missT>0){const k=Math.min(1,e.missT/.2); badge(cx+half+u*2,box.oy+box.h*.3,R*.42*(.7+.3*k),e.missAns,'#9C93A8','#fff',true);}
  ctx.restore();
  const learnt=((save.kills||{})[G.w.id]||{})[e.ch]||0;
  if((e.hint||(G.assist&&learnt+(G.kills[e.ch]||0)<3))&&s0>.32){
    // small label, and it fades away as the tyyppä comes close so it never covers the road near the sling
    const hs=Math.round(Math.max(12,Math.min(17,R*.4))), hl=dispAns(e.ans), fade=Math.max(0,Math.min(1,(e.z-1.5)/.35));
    if(fade>0){ ctx.save(); ctx.globalAlpha=fade*.92; badge(x,eyY-hs*1.6-headroom,hs*.7,hl,'#FFF6DE','#3A2A1E',false); ctx.restore(); }
  }
}
function shotE(s,z){const t=Math.max(0,Math.min(1,(z-(s.z0||ZCAN))/.7)), e=1-Math.pow(1-t,2); return (s.E0||RB)*(1-e)+RB*.95*e;}
/* A disc (kiekko): round wooden-rimmed puck with the letter on top. Long words make it a pill. */
function drawDisc(x,y,r,label,col,o={}){
  ctx.save(); let fs=Math.round(r*(label.length>2?.78:label.length>1?.95:1.15)); ctx.font=`900 ${fs}px ${LTF}`;
  let tw=ctx.measureText(label).width;
  const maxW=o.maxW||r*5; let w=Math.max(r*2,tw+r*.9); if(w>maxW){ fs*=(maxW-r*.9)/tw; w=maxW; ctx.font=`900 ${fs}px ${LTF}`; tw=ctx.measureText(label).width; }
  const hw=w/2, rr=r, dk=shade(col,-70), th=Math.max(3,r*.22);
  const shape=(dy,inset)=>{ ctx.beginPath(); const L=x-hw+inset, R=x+hw-inset, rad=rr-inset;
    ctx.moveTo(L+rad,y-rad+dy); ctx.lineTo(R-rad,y-rad+dy); ctx.arc(R-rad,y+dy,rad,-Math.PI/2,Math.PI/2); ctx.lineTo(L+rad,y+rad+dy); ctx.arc(L+rad,y+dy,rad,Math.PI/2,Math.PI*1.5); ctx.closePath(); };
  if(o.shadow!==false){ ctx.fillStyle='rgba(20,12,30,.28)'; shape(th+3,0); ctx.fill(); }
  ctx.fillStyle=dk; shape(th,0); ctx.fill();                       // the edge (thickness)
  ctx.fillStyle=col; shape(0,0); ctx.fill();
  ctx.strokeStyle=shade(col,-35); ctx.lineWidth=Math.max(2,r*.1); shape(0,r*.2); ctx.stroke(); // inner groove
  ctx.fillStyle='rgba(255,255,255,.28)'; ctx.beginPath(); ctx.ellipse(x-hw*.25,y-r*.45,Math.max(4,hw*.35),r*.16,0,0,Math.PI*2); ctx.fill();
  if(o.charge!=null&&o.charge<1){ ctx.fillStyle=AMMO_COL; ctx.beginPath(); ctx.moveTo(x,y); ctx.arc(x,y,r*.92,-Math.PI/2,-Math.PI/2+Math.PI*2*o.charge); ctx.closePath(); ctx.fill(); }
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillText(label,x+1.5,y+2.5); ctx.fillStyle='#FFFFFF'; ctx.fillText(label,x,y+1);
  ctx.restore(); return w;
}
function drawShot(s){
  if(s.bounced){const r=s.r, a=Math.min(1,s.life*2);
    ctx.save(); ctx.globalAlpha=a*.35; ctx.fillStyle='#9C93A8';
    s.trail.forEach((t,i)=>{const q=t[2]*(.5+.5*(i+1)/s.trail.length); ctx.beginPath(); ctx.arc(t[0],t[1],q/2,0,Math.PI*2); ctx.fill();});
    ctx.globalAlpha=a; drawDisc(s.sx,s.sy,r,s.lab||s.ans,'#9C93A8',{maxW:r*6}); ctx.restore(); return;}
  const s0=sc(s.z), r=Math.max(12,RB*.55*s0), [x,y0]=shotXY(s,s.z), L=s.lab||s.ans;
  // a little hop in flight (back down by the time it reaches the tyypät) and a shadow on the ground
  const k=Math.min(1,(s.z-s.z0)/1.4), arc=Math.sin(k*Math.PI)*RB*s0*.9, y=y0-arc, gyS=py(s.z);
  { ctx.save(); ctx.globalAlpha=.25*(1-Math.min(1,arc/(RB*s0*2))); ctx.fillStyle='#1B1424'; ctx.beginPath(); ctx.ellipse(x,gyS,r*.9,r*.28,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  ctx.save(); for(let i=1;i<=4;i++){const zt=Math.max(s.z0,s.z-i*.1), [tx,ty]=shotXY(s,zt), q=r*(1-i/5); ctx.globalAlpha=.35*(1-i/5); ctx.fillStyle=s.col; ctx.beginPath(); ctx.arc(tx,ty,q,0,Math.PI*2); ctx.fill();}
  ctx.restore();
  drawDisc(x,y,r,L,s.col,{maxW:r*6});
  // spin: a bright notch running round the rim
  { const an=(G.t-(s.t0||0))*14+s.z*3; ctx.save(); ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=Math.max(2,r*.16); ctx.lineCap='round'; ctx.beginPath(); ctx.arc(x,y,r*.88,an,an+.7); ctx.stroke(); ctx.restore(); }
  if(wordMode()&&G.fi[s.ans]){ ctx.save(); ctx.font=`800 ${Math.round(Math.max(10,r*.6))}px ${LTF}`; ctx.textAlign='center'; ctx.fillStyle='#2B2333'; ctx.fillText(G.fi[s.ans],x+1,y+r*1.9+1); ctx.fillStyle='#FFF'; ctx.fillText(G.fi[s.ans],x,y+r*1.9); ctx.restore(); }
}
/* The board at the bottom: a row of discs, each in its own little rubber band; emergency button top-left */
function drawSling(){
  const g=slingGeo(), r=g.r;
  const top=BY+g.TB*.02;
  ctx.fillStyle='#7A4E2C'; ctx.fillRect(0,top,W,H-top);
  for(let k=0;k<5;k++){ const y=top+6+k*(H-top)/5; ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(0,Math.round(y),W,2); ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(0,Math.round(y)+2,W,2); }
  ctx.fillStyle='#4E3019'; ctx.fillRect(0,top,W,5); ctx.fillStyle='#A06A3E'; ctx.fillRect(0,top+5,W,3);
  // aim line while pulling (or keyboard aiming)
  if(G.pull||G.kbAim){
    const [ux,uy,,ox,oy]=aimDir(), strong=!!G.pull;
    if(uy<-.15){ const pts=aimPath(ux,uy,ox,oy), N=Math.max(1,pts.length);
      ctx.save();
      pts.forEach(([x,y,bounce],i)=>{ if(i<2) return; const k=1-i/N, a=(strong?.9:.45)*(.25+.75*k), q=Math.max(3,7*(.4+.6*k));
        ctx.globalAlpha=a; ctx.fillStyle='#2B2333'; ctx.fillRect(x-q/2-1,y-q/2-1,q+2,q+2); ctx.fillStyle=bounce?'#FFE15A':'#FFFFFF'; ctx.fillRect(x-q/2,y-q/2,q,q);
        if(bounce){ ctx.fillStyle='#FFE15A'; ctx.fillRect(x-q*1.2,y-1,q*2.4,2); ctx.fillRect(x-1,y-q*1.2,2,q*2.4); } });
      ctx.restore(); }
  }
  // thin elastic between two small pegs; a short stack of discs under each, the next one pushed up from below
  const bw=Math.max(1.5,r*.08), peg=Math.max(3,r*.14), mw=g.slotW*.92, ease=k=>1-Math.pow(1-k,3);
  const band=(x1,y1,x2,y2,sag)=>{ ctx.strokeStyle='rgba(120,30,30,.35)'; ctx.lineWidth=bw+1.5; ctx.beginPath(); ctx.moveTo(x1,y1+1); ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag+1,x2,y2+1); ctx.stroke();
    ctx.strokeStyle='#E0574A'; ctx.lineWidth=bw; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag,x2,y2); ctx.stroke(); };
  if(G.stacks) G.stacks.forEach((s,i)=>{
    const x=g.sx[i], y=g.sy, pulled=G.pull&&G.pull.i===i, P=pulled?G.pull:{x,y};
    const half=Math.min(g.slotW*.44,r*1.35), by=y+r*.25, lab=s.ans||s.next||'';
    const p=s.ans?1:ease(Math.max(0,1-(s.wait||0)/REFILL));   // how far the next disc has come up
    // the stack below (disc edges), sinking a little while it pushes
    const step=Math.max(3,r*.2);
    for(let k=3;k>=1;k--){ ctx.save(); ctx.globalAlpha=.9; drawDisc(x,y+k*step+(1-p)*step,r*.96,'',shade(AMMO_COL,-18*k),{shadow:k===3,maxW:mw}); ctx.restore(); }
    // pegs
    ctx.save(); ctx.lineCap='round';
    [-1,1].forEach(sd=>{ ctx.fillStyle='#3E2614'; ctx.beginPath(); ctx.arc(x+sd*half,by,peg,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#B07A4A'; ctx.beginPath(); ctx.arc(x+sd*half-peg*.3,by-peg*.3,peg*.45,0,Math.PI*2); ctx.fill(); });
    if(pulled){ band(x-half,by,P.x,P.y+r*.35,0); band(x+half,by,P.x,P.y+r*.35,0); }
    else band(x-half,by,x+half,by,r*.12);
    ctx.restore();
    if(!lab) return;
    // the top disc: rises out of the stack while a new one is being pushed up
    const rise=(1-p)*(r*.9+3*step);
    if(G.tut&&G.tut.target&&s.ans===G.tut.target.ans&&!G.pull){ const pl=(Math.sin(G.t*6)+1)/2; ctx.save(); ctx.strokeStyle=`rgba(255,225,90,${.5+pl*.5})`; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,r*(1.3+pl*.15),0,Math.PI*2); ctx.stroke(); ctx.restore(); }
    if(!isTouch&&G.kbAim&&(G.sel||0)===i){ ctx.save(); ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.arc(x,y,r*1.35,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
    const sq=pulled?1+Math.min(.12,Math.hypot(P.x-x,P.y-y)/g.maxPull*.12):1;
    ctx.save(); if(!s.ans) ctx.globalAlpha=.55+.45*p;
    drawDisc(P.x,P.y+rise,r*sq,dispAns(lab),s.ans?AMMO_COL:shade(AMMO_COL,-25),{maxW:mw}); ctx.restore();
    if(pulled&&s.ans){ band(x-half,by,P.x,P.y+r*.35,0); }   // the near strand goes over the disc
    if(wordMode()&&G.fi[lab]&&!pulled&&s.ans){ ctx.save(); ctx.font=`800 ${Math.round(Math.max(10,r*.42))}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle='#FFE9C8'; ctx.fillText(G.fi[lab],x,y+r*1.2+3*step); ctx.restore(); }
  });
  // emergency button: blows everything back up the road, then recharges for a minute
  if(!G.tut){ const m=emGeo(), ready=(G.emT||0)<=0, k=1-(G.emT||0)/EM_COOL;
    ctx.save();
    ctx.fillStyle='#2B2333'; ctx.beginPath(); ctx.arc(m.x,m.y+4,m.r+3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ready?'#C8202E':'#5A5560'; ctx.beginPath(); ctx.arc(m.x,m.y+3,m.r,0,Math.PI*2); ctx.fill();
    const pulse=ready?(Math.sin(G.t*4)+1)/2:0;
    ctx.fillStyle=ready?`rgb(${235+pulse*20},${60+pulse*40},${60+pulse*30})`:'#7A7480'; ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2); ctx.fill();
    if(!ready){ ctx.fillStyle='rgba(95,211,255,.8)'; ctx.beginPath(); ctx.moveTo(m.x,m.y); ctx.arc(m.x,m.y,m.r*.9,-Math.PI/2,-Math.PI/2+Math.PI*2*k); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=Math.max(2,m.r*.14); ctx.lineCap='round';
    [[-.45,-.3,.5],[-.55,.05,.75],[-.35,.4,.45]].forEach(([ox,oy,w])=>{ ctx.beginPath(); ctx.moveTo(m.x+ox*m.r,m.y+oy*m.r); ctx.lineTo(m.x+(ox+w)*m.r,m.y+oy*m.r); ctx.stroke(); });
    ctx.beginPath(); ctx.arc(m.x+.22*m.r,m.y-.45*m.r,m.r*.17,Math.PI*.9,Math.PI*2.4); ctx.stroke();
    ctx.restore(); }
}
function drawCannon(){ drawSling(); }
function flashBtn(cls){const b=$('bf'); if(!b)return; b.classList.remove('hit','miss'); void b.offsetWidth; b.classList.add(cls); setTimeout(()=>b.classList.remove(cls),500);}
function pill(x,y,h,col,txt,sub){sign(x,y,h,txt,sub,col);}
function drawPair(){}

/* Loppuvastustaja: a huge block monster carrying one letter/word plate per hitbox.
   Each plate sits exactly over its hitbox lane (segLane), so aiming at a plate is aiming at the hitbox. */
function drawBoss(b){
  const s0=sc(b.z), cx=px(0,b.z), gy=py(b.z), U=RB*s0*1.6;
  const bodyW=b.n*b.segW*lw(b.z)+U*1.4, bodyH=U*3.6, legH=U*.9, d=bodyW*.1;
  const step=Math.sin(G.t*3.2), bob=Math.abs(step)*U*.14, jx=b.shake>0?Math.round(Math.sin(b.shake*70)*3):0;
  const X=cx-bodyW/2+jx, top=gy-legH-bodyH-bob, a=Math.min(1,(G.t-b.born)*1.5);
  const dark=shade(b.col,-70);
  ctx.save(); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(20,10,30,.3)'; ctx.fillRect(cx-bodyW*.55,gy-U*.25,bodyW*1.1,U*.5);
  const skin=BOSS_SKINS[G.w.id];
  if(skin){ skin({cx:cx+jx,gy,U,W:bodyW,H:bodyH,legH,top,X,step,t:G.t,col:b.col}); }
  else {
  // legs, stomping
  const legW=bodyW*.22; ctx.fillStyle=dark;
  ctx.fillRect(cx-bodyW*.3-legW/2+jx,gy-legH-(step>0?U*.25:0),legW,legH); ctx.fillRect(cx+bodyW*.3-legW/2+jx,gy-legH-(step<0?U*.25:0),legW,legH);
  ctx.fillStyle='#1B1424'; ctx.fillRect(cx-bodyW*.3-legW/2-U*.1+jx,gy-U*.2-(step>0?U*.25:0),legW+U*.2,U*.2); ctx.fillRect(cx+bodyW*.3-legW/2-U*.1+jx,gy-U*.2-(step<0?U*.25:0),legW+U*.2,U*.2);
  // arms swinging at the sides
  const sw=Math.sin(G.t*4)*U*.4;
  ctx.fillStyle=shade(b.col,-25); ctx.fillRect(X-U*.9,top+bodyH*.25+sw,U*.9,bodyH*.5); ctx.fillRect(X+bodyW,top+bodyH*.25-sw,U*.9,bodyH*.5);
  ctx.fillStyle='#EDE6D6'; for(let k=0;k<3;k++){ctx.fillRect(X-U*.9+k*U*.3,top+bodyH*.75+sw,U*.2,U*.3); ctx.fillRect(X+bodyW+k*U*.3,top+bodyH*.75-sw,U*.2,U*.3);}
  // body block: top + side + front with pixel texture
  ctx.fillStyle=shade(b.col,35); ctx.beginPath(); ctx.moveTo(X,top); ctx.lineTo(X+d,top-d*.7); ctx.lineTo(X+bodyW+d,top-d*.7); ctx.lineTo(X+bodyW,top); ctx.fill();
  ctx.fillStyle=shade(b.col,-40); ctx.beginPath(); ctx.moveTo(X+bodyW,top); ctx.lineTo(X+bodyW+d,top-d*.7); ctx.lineTo(X+bodyW+d,top+bodyH-d*.7); ctx.lineTo(X+bodyW,top+bodyH); ctx.fill();
  ctx.fillStyle=b.col; ctx.fillRect(X,top,bodyW,bodyH);
  const cs=Math.max(4,U*.35);
  for(let yy=0;yy<bodyH;yy+=cs)for(let xx=0;xx<bodyW;xx+=cs){const h=hash(Math.floor(xx/cs)+7,Math.floor(yy/cs)+3); if(h>.7){ctx.fillStyle=shade(b.col,h>.88?-20:14); ctx.fillRect(X+xx,top+yy,Math.min(cs,bodyW-xx),Math.min(cs,bodyH-yy));}}
  // horns
  ctx.fillStyle='#EDE6D6';
  [[X+bodyW*.12,1],[X+bodyW*.88,-1]].forEach(([hx,sd])=>{ctx.fillRect(hx-U*.25,top-U*.5,U*.5,U*.5); ctx.fillRect(hx-U*.15-sd*U*.15,top-U*1,U*.3,U*.5); ctx.fillRect(hx-U*.08-sd*U*.3,top-U*1.35,U*.16,U*.35);});
  // eyes with glowing red pupils and angry brows
  const ey=top+bodyH*.16, es=U*.75, glow=(Math.sin(G.t*8)+1)/2;
  [-1,1].forEach(sd=>{const ex=cx+jx+sd*bodyW*.2-es/2;
    ctx.fillStyle='#1B1424'; ctx.fillRect(ex-U*.08,ey-U*.08,es+U*.16,es+U*.16);
    ctx.fillStyle='#FFF6DE'; ctx.fillRect(ex,ey,es,es);
    ctx.fillStyle=glow>.5?'#FF2E2E':'#C81E1E'; ctx.fillRect(ex+es*.3,ey+es*.35,es*.4,es*.45);
    ctx.fillStyle='#1B1424'; ctx.fillRect(ex+(sd<0?0:es*.5),ey-U*.35,es*.5,U*.18); ctx.fillRect(ex+(sd<0?es*.5:0),ey-U*.22,es*.5,U*.18);});
  // jagged mouth
  const my=top+bodyH*.42, mw=bodyW*.6;
  ctx.fillStyle='#1B1424'; ctx.fillRect(cx+jx-mw/2,my,mw,U*.45);
  ctx.fillStyle='#FFFFFF'; const tw=mw/8; for(let k=0;k<8;k++){ctx.fillRect(cx+jx-mw/2+k*tw+tw*.15,my,tw*.7,U*.16); if(k%2)ctx.fillRect(cx+jx-mw/2+k*tw+tw*.15,my+U*.29,tw*.7,U*.16);}
  }
  // name banner above the horns, in the monster's own script
  if(b.name){ const bh=Math.max(20,U*.75); sign(cx+jx,top-U*1.9-bh*.2,bh,b.name,b.nameLat,'#1B1424'); }
  // plates = hitboxes
  const py0=top+bodyH*.6, ps=Math.min(b.segW*lw(b.z)*.9, bodyH*.34);
  b.segs.forEach((g,i)=>{
    const x=px(segLane(i),b.z)+jx, X0=x-ps/2*(G.isWord?1.35:1), w=ps*(G.isWord?1.35:1);
    ctx.fillStyle='#1B1424'; ctx.fillRect(X0-3,py0-3,w+6,ps+6);
    if(g.alive){
      const pulse=(Math.sin(G.t*5+i)+1)/2;
      ctx.fillStyle=g.flash>0?'#FFFFFF':shade(g.col,Math.round(pulse*18)); ctx.fillRect(X0,py0,w,ps);
      ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(X0,py0,w,ps*.12);
      let fs=ps*.8; ctx.font=`900 ${fs}px ${LTF}`; const mw=ctx.measureText(g.disp).width; if(mw>w*.88)fs*=w*.88/mw;
      smoothText(g.disp,x,py0+ps*.5+fs*.36,fs,g.col,g.flash>0);
      if(g.missT>0) badge(x+w*.35,py0-ps*.1,Math.max(10,ps*.22),g.missAns,'#9C93A8','#fff',true);
    } else {
      ctx.fillStyle='#2B2333'; ctx.fillRect(X0,py0,w,ps);
      ctx.fillStyle='#4A4058'; for(let k=0;k<4;k++){ctx.fillRect(X0+w*(.15+k*.2),py0+ps*(.2+(k%2)*.3),w*.12,ps*.12);}
    }
  });
  ctx.restore();
}

/* Enemy fire: glowing blocks that roll down the road toward the cannon. Move sideways to dodge. */
function drawBolt(b){
  const s0=sc(b.z), x=px(b.lane,b.z), gy=py(b.z), r=Math.max(6,RB*.42*s0), y=gy-r*1.1, pulse=(Math.sin(G.t*20+b.ph)+1)/2;
  ctx.fillStyle='rgba(40,0,0,.3)'; ctx.fillRect(x-r,gy-r*.2,r*2,r*.4);              // shadow on the road
  ctx.fillStyle=`rgba(255,80,40,${.25+pulse*.25})`; ctx.fillRect(x-r*1.6,y-r*1.6,r*3.2,r*3.2);
  cube(x-r,y-r,r*2,pulse>.5?'#FF4A2E':'#E02A1C',false);
  ctx.fillStyle='#FFE15A'; ctx.fillRect(x-r*.4,y-r*.4,r*.8,r*.8);
}

/* A rock / low wall on the field (Halloween: a gravestone). Discs stop at it; tyypät hide behind it. */
function drawRock(r){
  const s0=sc(r.z), x=px(r.lane,r.z), y=py(r.z), w=r.hw*2*lw(r.z), h=RB*s0*1.35;
  ctx.fillStyle='rgba(30,20,40,.25)'; ctx.fillRect(x-w*.55,y-2,w*1.1,Math.max(3,h*.12));
  if(G.season&&G.season.id==='halloween'){
    const gw=w*.8, gh=h*1.15; ctx.fillStyle='#2B2333'; ctx.beginPath(); ctx.moveTo(x-gw/2-3,y); ctx.lineTo(x-gw/2-3,y-gh+gw/2); ctx.arc(x,y-gh+gw/2,gw/2+3,Math.PI,0); ctx.lineTo(x+gw/2+3,y); ctx.fill();
    ctx.fillStyle='#8A8596'; ctx.beginPath(); ctx.moveTo(x-gw/2,y); ctx.lineTo(x-gw/2,y-gh+gw/2); ctx.arc(x,y-gh+gw/2,gw/2,Math.PI,0); ctx.lineTo(x+gw/2,y); ctx.fill();
    ctx.fillStyle='#6E6A7A'; ctx.font=`900 ${Math.round(gw*.28)}px ${PXF}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('RIP',x,y-gh*.55);
    return; }
  const b=Math.max(4,h/2.2), cols=Math.max(2,Math.round(w/b)), bw=w/cols;
  for(let row=0;row<2;row++) for(let c=0;c<cols-(row?1:0);c++){
    const bx=x-w/2+c*bw+(row?bw/2:0), by=y-(row+1)*b*.95; cube(bx,by,Math.min(bw,b)*.98,shade('#8E8E96',(hash(r.seed+c,row)-.5)*30),true,r.seed+c+row*7); }
}
