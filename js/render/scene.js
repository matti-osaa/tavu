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
