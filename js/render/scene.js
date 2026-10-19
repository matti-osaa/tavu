/* Scene: sky, stepped hills, block ground, finish line and roadside scenery. */
function drawBg(){
  const w=G.w, S=G.season, T=S?S.palette:w.palette, SKY=T.sky;
  // stepped sky bands
  const bands=7; for(let i=0;i<bands;i++){const t=i/(bands-1); ctx.fillStyle=mix(SKY[0],SKY[1],t); ctx.fillRect(0,Math.floor(HY*i/bands),W,Math.ceil(HY/bands)+1);}
  const sx=Math.round(W*.78), sy=Math.round(HY*.38), ss=Math.round(Math.min(W,H)*.075);
  if(S&&S.sky) S.sky(sx,sy,ss); else {
  // square sun with stepped halo
  ctx.fillStyle='rgba(255,236,120,.35)'; ctx.fillRect(sx-ss*1.6,sy-ss*1.6,ss*3.2,ss*3.2);
  ctx.fillStyle='rgba(255,236,120,.5)'; ctx.fillRect(sx-ss*1.2,sy-ss*1.2,ss*2.4,ss*2.4);
  ctx.fillStyle='#FFE15A'; ctx.fillRect(sx-ss,sy-ss,ss*2,ss*2); ctx.fillStyle='#FFF4A8'; ctx.fillRect(sx-ss,sy-ss,ss*2,ss*.5);
  // blocky clouds
  for(const c of clouds){const x=Math.round(c.x*W), y=Math.round(c.y*H), u=Math.round(c.s*14+8);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(x,y,u*5,u); ctx.fillRect(x+u,y-u,u*2,u); ctx.fillStyle='#E7F3FB'; ctx.fillRect(x,y+u*.6,u*5,u*.4);}
  }
  // stepped hills
  ctx.fillStyle=T.hill; const st=12;
  for(let x=0;x<W;x+=st){const h=Math.round((10+Math.sin(x/W*Math.PI*2.4+1)*10+Math.sin(x/W*9)*4)/6)*6; ctx.fillRect(x,HY-h,st,h+2);}
  ctx.fillStyle=shade(T.hill,25); for(let x=0;x<W;x+=st){const h=Math.round((10+Math.sin(x/W*Math.PI*2.4+1)*10+Math.sin(x/W*9)*4)/6)*6; ctx.fillRect(x,HY-h,st,3);}
  ctx.fillStyle=T.grass2; ctx.fillRect(0,HY,W,H-HY);
  // ground made of blocks: rows move toward the player
  const seg=.42, off=G.scroll%seg, k0=Math.floor(G.scroll/seg);
  for(let i=Math.ceil(16/seg);i>=0;i--){
    const za=.5+i*seg-off, zb=za+seg; if(zb<=.5)continue; const id=i+k0, near=sc(za);
    // grass sides
    for(let side=-1;side<=1;side+=2) for(let c=0;c<7;c++){
      const l0=side*(1.1+c*.42), l1=side*(1.1+(c+1)*.42), h=hash(id,c*side+50);
      quad(l0,l1,za,zb,shade(h>.5?T.grass:T.grass2,(h-.5)*24));}
    // road tiles
    for(let c=0;c<6;c++){const l0=-1+c/3, h=hash(id,c); quad(l0,l0+1/3,za,zb,shade(T.path,(h-.5)*30));}
    // raised kerb blocks
    for(let side=-1;side<=1;side+=2){const h=hash(id,side*9); quad(side*1,side*1.1,za,zb,shade(T.edge,(h-.5)*20));}
    if(near>.35){ctx.strokeStyle='rgba(0,0,0,.07)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px(-1,za),py(za)); ctx.lineTo(px(1,za),py(za)); ctx.stroke();}
  }
  // little things lying on the field: grass tufts, flowers, pebbles, worn patches (seasons swap flowers for leaves)
  drawDecals(T);
  // a row of far-away trees along the horizon
  for(let x=-10;x<W+10;x+=14){ const h=6+hash(x,77)*10, w=8+hash(x,31)*6; ctx.fillStyle=shade(T.hill,-18-hash(x,5)*15);
    ctx.beginPath(); ctx.moveTo(x-w/2,HY+3); ctx.lineTo(x,HY+3-h); ctx.lineTo(x+w/2,HY+3); ctx.fill(); }
  // distance haze
  const hz=ctx.createLinearGradient(0,HY,0,HY+(BY-HY)*.22); hz.addColorStop(0,T.far); hz.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=hz; ctx.fillRect(0,HY,W,(BY-HY)*.22);
  [...G.deco].sort((a,b)=>b.z-a.z).forEach(drawDeco);
  if(!S&&w.ambient) w.ambient(G.dt||0);
}
/* Roadside objects drift toward the player; the season pack may replace the world's own scenery */
function drawDeco(d){
  if(d.z<.6)return; const s=sc(d.z), x=px(d.side*(1.6+d.k*.6),d.z), y=py(d.z), u=Math.max(3,RB*.62*s), seed=Math.floor(d.k*100);
  if(x<-u*4||x>W+u*4)return;
  const painter=(G.season&&G.season.scenery)||G.w.scenery;
  if(painter) painter(x,y,u,seed,d);
}

function drawDecals(T){
  if(!G.decals) return; const hw=G.season&&G.season.id==='halloween';
  for(const d of G.decals){
    const s0=sc(d.z), x=Math.round(px(d.lane,d.z)), y=Math.round(py(d.z)), u=Math.max(1.5,RB*s0*.09);
    if(x<-20||x>W+20) continue;
    const onRoad=Math.abs(d.lane)<1;
    if(d.type==='tuft'){ ctx.fillStyle=onRoad?shade(T.path,-28):shade(T.grass2,-25);
      ctx.fillRect(x-u*1.5,y-u*2,u,u*2); ctx.fillRect(x,y-u*3,u,u*3); ctx.fillRect(x+u*1.5,y-u*2,u,u*2); }
    else if(d.type==='flower'){ const c=hw?['#E8781A','#8A4A1E','#C9A23A'][d.seed%3]:['#FF6FA5','#FFE15A','#FFFFFF','#9B7BFF'][d.seed%4];
      if(hw){ ctx.fillStyle=c; ctx.fillRect(x-u*1.5,y-u,u*3,u*1.2); ctx.fillRect(x-u*.5,y-u*1.6,u,u*.6); }
      else { ctx.fillStyle=shade(T.grass,-30); ctx.fillRect(x,y-u*3,u*.8,u*3); ctx.fillStyle=c; ctx.fillRect(x-u,y-u*4.2,u*2.8,u*1.6); ctx.fillStyle='#FFE15A'; ctx.fillRect(x,y-u*3.8,u*.8,u*.8); } }
    else if(d.type==='pebble'){ ctx.fillStyle='rgba(30,20,40,.18)'; ctx.fillRect(x-u*2,y-u*.3,u*4,u); ctx.fillStyle=shade('#A8A2B0',(hash(d.seed,2)-.5)*30); ctx.fillRect(x-u*1.6,y-u*1.6,u*3.2,u*1.6); ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(x-u*1.2,y-u*1.6,u*1.4,u*.5); }
    else if(d.type==='wear'&&onRoad){ ctx.fillStyle='rgba(60,40,30,.08)'; ctx.beginPath(); ctx.ellipse(x,y,u*9,u*2.4,0,0,Math.PI*2); ctx.fill(); }
  }
}
