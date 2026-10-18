/* Actors: tyypät (letter creatures), shots and the cannon. */
function drawCandy(e){
  let headroom=0;
  const s0=sc(e.z), R=RB*s0, x=px(e.lane,e.z), gy=py(e.z);
  const near=Math.max(0,Math.min(1,(2.4-e.z)/1.1));
  const step=G.t*(5+near*5)+e.ph, stepI=Math.floor(step/Math.PI)%2;
  let fs=R*2.45*(e.disp.length>1?.8:1); ctx.font=`900 ${fs}px ${LTF}`; {const mw=ctx.measureText(e.disp).width, lim=R*4; if(mw>lim)fs*=lim/mw;}
  ctx.font=`900 ${fs}px ${LTF}`; const TW=ctx.measureText(e.disp).width, TH=fs*.72, u=Math.max(1.5,R*2.1/11);
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
  if(G.assist&&G.cur&&e.ans===G.cur){ // beginner help: the tyyppä your ammo works on glows gold
    const pulse=(Math.sin(G.t*6)+1)/2, m=u*(1.5+pulse);
    ctx.fillStyle=`rgba(255,210,40,${.25+pulse*.25})`; ctx.fillRect(cx-TW/2-m,by-TH-m,TW+m*2,TH+m*1.6);
    ctx.strokeStyle='#FFD21E'; ctx.lineWidth=Math.max(2,u*.5); ctx.strokeRect(cx-TW/2-m,by-TH-m,TW+m*2,TH+m*1.6);
  }
  if(e.pumpkin&&G.season&&G.season.body) G.season.body(cx,by,TW,TH,u,e.seed||1);
  smoothText(e.disp,cx,by,fs,e.col,e.shield>.2);
  if(e.shoots){ // shooter tyypät carry a small red marker
    ctx.fillStyle='#E8323C'; ctx.fillRect(cx-u*1.2,by+u*.4,u*2.4,u*1.1); ctx.fillStyle='#FFD21E'; ctx.fillRect(cx-u*.4,by+u*.6,u*.8,u*.7);
  }
  if(e.missT>0){const k=Math.min(1,e.missT/.2); badge(cx+half+u*2,box.oy+box.h*.3,R*.42*(.7+.3*k),e.missAns,'#9C93A8','#fff',true);}
  ctx.restore();
  const learnt=((save.kills||{})[G.w.id]||{})[e.ch]||0;
  if((e.hint||(G.assist&&learnt+(G.kills[e.ch]||0)<3))&&s0>.32){
    const hs=Math.round(Math.max(12,R*.5)), hl=dispAns(e.ans);
    badge(x,eyY-hs*1.6-headroom,hs*.7,hl,'#FFF6DE','#3A2A1E',false);
  }
}
function shotE(s,z){const t=Math.max(0,Math.min(1,(z-(s.z0||ZCAN))/.7)), e=1-Math.pow(1-t,2); return (s.E0||RB)*(1-e)+RB*.95*e;}
function drawShot(s){
  if(s.bounced){const r=s.r, a=Math.min(1,s.life*2);
    ctx.save(); ctx.globalAlpha=a*.35; ctx.fillStyle=s.col;
    s.trail.forEach((t,i)=>{const q=t[2]*(.5+.5*(i+1)/s.trail.length); ctx.fillRect(t[0]-q/2,t[1]-q/2,q,q);});
    ctx.globalAlpha=a; ctx.translate(s.sx,s.sy); ctx.rotate(Math.round(s.spin/(Math.PI/4))*(Math.PI/4));
    const L=s.lab||s.ans;
    if(wordMode()) sign(0,0,Math.max(18,r*1.2),L,'','#9C93A8'); else {ctx.fillStyle='#2B2333'; ctx.fillRect(-r-2,-r-2,2*r+4,2*r+4); ctx.fillStyle='#9C93A8'; ctx.fillRect(-r,-r,2*r,2*r);
      ctx.font=`800 ${Math.round(r*(L.length>2?.8:L.length>1?1:1.3))}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(L,0,1);}
    ctx.restore(); return;}
  const s0=sc(s.z), x=px(s.lane,s.z), r=Math.max(14,RB*.62*s0), y=py(s.z)-shotE(s,s.z)*s0;
  // pixel trail
  ctx.fillStyle=s.col; for(let i=1;i<=4;i++){const zt=Math.max(ZCAN,s.z-i*.12), q=r*.5*(1-i/5); ctx.globalAlpha=.5*(1-i/5); ctx.fillRect(px(s.lane,zt)-q/2,py(zt)-shotE(s,zt)*sc(zt)-q/2,q,q);}
  ctx.globalAlpha=1;
  const L=s.lab||s.ans;
  if(wordMode()){sign(x,y,Math.max(22,r*1.4),L,G.fi[s.ans],s.col);return;}
  cube(x-r,y-r,r*2,s.col,false);
  ctx.font=`800 ${Math.round(r*(L.length>2?.85:L.length>1?1.05:1.4))}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillText(L,x+2,y+3); ctx.fillStyle='#FFFFFF'; ctx.fillText(L,x,y+1);
}
// The ammo box: one block on the ground with the letter you shoot. Nothing else.
function ammoBox(){ const u=Math.max(30,RB*.75), s=u*1.6; return {x:Math.round(px(G.lane,ZCAN)), y:Math.round(BY+6)-s/2, s, u}; }
function drawCannon(){
  if(!G.cur)return;
  const B=ammoBox(), x=B.x, u=B.u, ground=B.y+B.s/2;
  const ready=G.cool<=0, charge=1-Math.max(0,G.cool)/COOL;
  const col=ready?G.curCol:'#8E8A96', ans=dispAns(G.cur), rl=1-Math.pow(1-G.reload,3), rec=Math.round(G.recoil*4);
  ctx.fillStyle='rgba(30,20,40,.25)'; ctx.fillRect(x-B.s*.6,ground-u*.12,B.s*1.2,u*.3);
  if(wordMode()){const sh=u*.95*(.6+.4*rl); sign(x,ground-sh*.6+rec,sh,ans,G.fi[G.cur],col);
    if(!ready){ const bw=u*1.6; ctx.fillStyle='#2B2333'; ctx.fillRect(x-bw/2-2,ground-sh*1.1-12,bw+4,8); ctx.fillStyle=AMMO_COL; ctx.fillRect(x-bw/2,ground-sh*1.1-10,bw*charge,4); } return;}
  const bs=B.s*(.55+.45*rl), bx=x-bs/2, byy=ground-bs+rec;
  cube(bx,byy,bs,col,false);
  if(!ready){ const fh=bs*charge; ctx.fillStyle=AMMO_COL; ctx.fillRect(bx,byy+bs-fh,bs,fh); }   // gold fills up while recharging
  ctx.font=`800 ${Math.round(bs*(ans.length>2?.42:ans.length>1?.55:.75))}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillText(ans,x+2,byy+bs/2+3); ctx.fillStyle='#FFFFFF'; ctx.fillText(ans,x,byy+bs/2+1);
}
function drawCubeHint(){}   // the cube needs no decoration: tap it to switch, drag it to scroll
function flashBtn(cls){const b=$('bf'); if(!b)return; b.classList.remove('hit','miss'); void b.offsetWidth; b.classList.add(cls); setTimeout(()=>b.classList.remove(cls),500);}
function pill(x,y,h,col,txt,sub){sign(x,y,h,txt,sub,col);}
function drawPair(){}

/* Loppuvastustaja: a huge block monster carrying one letter/word plate per hitbox.
   Each plate sits exactly over its hitbox lane (segLane), so aiming at a plate is aiming at the hitbox. */
function drawBoss(b){
  const s0=sc(b.z), cx=px(0,b.z), gy=py(b.z), U=RB*s0*1.6;
  const bodyW=b.n*b.segW*HW*s0+U*1.4, bodyH=U*3.6, legH=U*.9, d=bodyW*.1;
  const step=Math.sin(G.t*3.2), bob=Math.abs(step)*U*.14, jx=b.shake>0?Math.round(Math.sin(b.shake*70)*3):0;
  const X=cx-bodyW/2+jx, top=gy-legH-bodyH-bob, a=Math.min(1,(G.t-b.born)*1.5);
  const dark=shade(b.col,-70);
  ctx.save(); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(20,10,30,.3)'; ctx.fillRect(cx-bodyW*.55,gy-U*.25,bodyW*1.1,U*.5);
  // legs, stomping
  const lw=bodyW*.22; ctx.fillStyle=dark;
  ctx.fillRect(cx-bodyW*.3-lw/2+jx,gy-legH-(step>0?U*.25:0),lw,legH); ctx.fillRect(cx+bodyW*.3-lw/2+jx,gy-legH-(step<0?U*.25:0),lw,legH);
  ctx.fillStyle='#1B1424'; ctx.fillRect(cx-bodyW*.3-lw/2-U*.1+jx,gy-U*.2-(step>0?U*.25:0),lw+U*.2,U*.2); ctx.fillRect(cx+bodyW*.3-lw/2-U*.1+jx,gy-U*.2-(step<0?U*.25:0),lw+U*.2,U*.2);
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
  // name banner above the horns, in the monster's own script
  if(b.name){ const bh=Math.max(20,U*.75); sign(cx+jx,top-U*1.9-bh*.2,bh,b.name,b.nameLat,'#1B1424'); }
  // plates = hitboxes
  const py0=top+bodyH*.6, ps=Math.min(b.segW*HW*s0*.9, bodyH*.34);
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
