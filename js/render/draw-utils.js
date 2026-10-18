/* Low-level drawing helpers shared by the scene, actors and content packs. */
const PXF='"Pixelify Sans","DotGothic16",monospace';
const LTF='"M PLUS Rounded 1c","Nunito",system-ui,sans-serif';
const GLF='"DotGothic16","Pixelify Sans","M PLUS Rounded 1c",sans-serif';
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function rr(x,y,w,h){ctx.beginPath();ctx.rect(x,y,w,h);}
function hash(a,b){let h=(a*374761393+b*668265263)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295;}
function quad(l0,l1,za,zb,col){
  ctx.fillStyle=col; ctx.beginPath();
  ctx.moveTo(px(l0,za),py(za)); ctx.lineTo(px(l1,za),py(za)); ctx.lineTo(px(l1,zb),py(zb)); ctx.lineTo(px(l0,zb),py(zb)); ctx.fill();
}
// A block seen from slightly above: front square + top + the side facing the vanishing point. Optional pixel texture.
function cube(x,y,s,col,tex,seed){
  const d=s*.32, dx=Math.max(-1,Math.min(1,(W/2-(x+s/2))/(W*.45)))*d, dy=-d*.75;
  ctx.fillStyle=shade(col,38); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx,y+dy); ctx.lineTo(x+s+dx,y+dy); ctx.lineTo(x+s,y); ctx.fill();
  ctx.fillStyle=shade(col,-42); ctx.beginPath();
  if(dx>0){ctx.moveTo(x+s,y); ctx.lineTo(x+s+dx,y+dy); ctx.lineTo(x+s+dx,y+s+dy); ctx.lineTo(x+s,y+s);}
  else {ctx.moveTo(x,y); ctx.lineTo(x+dx,y+dy); ctx.lineTo(x+dx,y+s+dy); ctx.lineTo(x,y+s);}
  ctx.fill();
  ctx.fillStyle=col; ctx.fillRect(x,y,s,s);
  if(tex&&s>10){const n=4, c=s/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){const h=hash(seed*7+i,j*13+seed); if(h>.55){ctx.fillStyle=shade(col,h>.8?-22:16); ctx.fillRect(x+i*c,y+j*c,Math.ceil(c),Math.ceil(c));}}}
}
function mix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);
  const r=Math.round((A>>16)*(1-t)+(B>>16)*t),g=Math.round((A>>8&255)*(1-t)+(B>>8&255)*t),bb=Math.round((A&255)*(1-t)+(B&255)*t);
  return '#'+((1<<24)|(r<<16)|(g<<8)|bb).toString(16).slice(1);}
// Letters stay smooth and crisp: bold rounded glyph, blocky extrusion behind it
function smoothText(txt,cx,by,fs,col,flash){
  ctx.font=`900 ${fs}px ${LTF}`; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  const tw=ctx.measureText(txt).width, th=fs*.72, dep=fs*.09, dx=Math.max(-1,Math.min(1,(W/2-cx)/(W*.45)))*dep, dy=-dep*.7;
  for(let i=4;i>=1;i--){ctx.fillStyle=shade(col,-85+i*6); ctx.fillText(txt,cx+dx*i/4,by+dy*i/4);}
  ctx.lineJoin='round'; ctx.lineWidth=Math.max(2,fs*.08); ctx.strokeStyle=shade(col,-90); ctx.strokeText(txt,cx,by);
  if(flash){ctx.fillStyle='#FFFFFF';} else {const g=ctx.createLinearGradient(0,by-th,0,by); g.addColorStop(0,shade(col,60)); g.addColorStop(1,col); ctx.fillStyle=g;}
  ctx.fillText(txt,cx,by);
  return {ox:cx-tw/2,oy:by-th,w:tw,h:th};
}
function sign(x,y,h,txt,sub,col){ // wooden sign with pixel text, optional smaller sign below
  ctx.font=`800 ${Math.round(h*.62)}px ${LTF}`; const w=Math.max(h*1.3,ctx.measureText(txt).width+h*.7), b=Math.max(2,Math.round(h*.09));
  const X=Math.round(x-w/2), Y=Math.round(y-h/2);
  ctx.fillStyle='#3A2A1E'; ctx.fillRect(X-b,Y-b,w+b*2,h+b*2);
  ctx.fillStyle=col||'#C89A5B'; ctx.fillRect(X,Y,w,h);
  ctx.fillStyle='rgba(255,255,255,.28)'; ctx.fillRect(X,Y,w,b); ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(X,Y+h-b,w,b);
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillText(txt,x+b*.6,y+b*.6+1); ctx.fillStyle='#FFFFFF'; ctx.fillText(txt,x,y+1);
  if(sub){const sh=Math.round(h*.55); ctx.font=`800 ${Math.round(sh*.7)}px ${LTF}`; const sw=ctx.measureText(sub).width+sh*.8, sy=Y+h+b*2+2;
    ctx.fillStyle='#3A2A1E'; ctx.fillRect(Math.round(x-sw/2)-b,sy-b,sw+b*2,sh+b*2); ctx.fillStyle='#FFF6DE'; ctx.fillRect(Math.round(x-sw/2),sy,sw,sh);
    ctx.fillStyle='#3A2A1E'; ctx.fillText(sub,x,sy+sh/2+1);}
}
function badge(x,y,r,txt,bg,fg,strike){
  ctx.font=`800 ${Math.round(r*1.1)}px ${LTF}`; const w=Math.max(r*2,ctx.measureText(txt).width+r*.9), h=r*1.8, X=x-w/2, Y=y-h/2, b=Math.max(2,r*.16);
  ctx.fillStyle='#2B2333'; ctx.fillRect(X-b,Y-b,w+2*b,h+2*b); ctx.fillStyle=bg; ctx.fillRect(X,Y,w,h);
  ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(X,Y,w,b);
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=fg; ctx.fillText(txt,x,y+1);
  if(strike){ctx.fillStyle='#E63E78'; const n=6; for(let i=0;i<n;i++)ctx.fillRect(X+i*w/n,Y+h-(i+1)*h/n,w/n+1,b*1.4);}
}
