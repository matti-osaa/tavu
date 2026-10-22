/* Pääsiäinen – automatically from 10 days before Easter Sunday to Easter Monday. UI colours: css/seasons/easter.css */
(()=>{
function easter(y){ const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1; return new Date(y,mo-1,da); }
const butterflies=Array.from({length:6},(_,i)=>({x:Math.random(),y:.1+Math.random()*.6,p:Math.random()*6,c:['#FF9AC8','#FFE15A','#9BD7FF'][i%3]}));
Tavu.addSeason({
  id:'paasiainen', name:'Pääsiäinen', cssClass:'season-paasiainen',
  active(d){ const e=easter(d.getFullYear()), day=864e5, t=new Date(d.getFullYear(),d.getMonth(),d.getDate()); return t>=new Date(e-10*day)&&t<=new Date(+e+day); },
  palette:{sky:['#BFE4FF','#FFF4DC'], path:'#E9DCC0', edge:'#CDBB98', grass:'#9ED36A', grass2:'#8BC75A', hill:'#7DBE5A', far:'#E3F2D8'},
  colors:['#FF8FC0','#FFD23F','#8FD3FF','#A88BFF','#7BD389'],
  rewards:{
    cyr:[['ЯЙЦО','muna'],['ВЕСНА','kevät'],['ЗАЯЦ','jänis'],['ЦВЕТОК','kukka']],
    gre:[['ΠΑΣΧΑ','pääsiäinen'],['ΑΥΓΟ','muna'],['ΑΝΟΙΞΗ','kevät'],['ΛΑΓΟΣ','jänis']],
    kat:[['イースター','pääsiäinen','iisutaa'],['チョコ','suklaa','choko'],['チューリップ','tulppaani','chuurippu'],['バスケット','kori','basuketto']],
    sv:[['PÅSK','pääsiäinen'],['ÄGG','muna'],['KYCKLING','tipu'],['HARE','jänis'],['VÅR','kevät']],
    en:[['EASTER','pääsiäinen'],['EGG','muna'],['BUNNY','pupu'],['CHICK','tipu'],['SPRING','kevät']],
    la:[['PASCHA','pääsiäinen'],['OVUM','muna'],['VER','kevät'],['LEPUS','jänis']]
  },
  // some tyypät are painted eggs
  bodyChance:.3, bodyLetterColor:'#3B2252',
  body(cx,by,TW,TH,u,seed){
    const w=Math.max(TW*1.1,TH*1.0), h=Math.max(TH*1.45,w*1.25), col=['#FFC7E0','#FFF1A8','#C8EBFF','#DCCBFF'][seed%4];
    ctx.fillStyle='#2B2333'; ctx.beginPath(); ctx.ellipse(cx,by-h*.48,w/2+2,h/2+2,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(cx,by-h*.48,w/2,h/2,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=shade(col,-35); ctx.fillRect(cx-w*.45,by-h*.8,w*.9,h*.06); ctx.fillRect(cx-w*.48,by-h*.2,w*.96,h*.06);
    for(let k=0;k<4;k++){ ctx.beginPath(); ctx.arc(cx-w*.3+k*w*.2,by-h*.88+((k%2)*h*.02),u*.4,0,Math.PI*2); ctx.fill(); }
  },
  sky(sx,sy,ss){ // warm sun, soft clouds, a few butterflies
    ctx.fillStyle='rgba(255,236,120,.35)'; ctx.fillRect(sx-ss*1.6,sy-ss*1.6,ss*3.2,ss*3.2); ctx.fillStyle='#FFE15A'; ctx.fillRect(sx-ss,sy-ss,ss*2,ss*2);
    for(const c of clouds){const x=Math.round(c.x*W), y=Math.round(c.y*H), u=Math.round(c.s*14+8); ctx.fillStyle='#FFFFFF'; ctx.fillRect(x,y,u*5,u); ctx.fillRect(x+u,y-u,u*2,u);}
    for(const b of butterflies){ const x=(b.x*W+G.t*14)%(W+40)-20, y=b.y*HY+Math.sin(G.t*2+b.p)*10, f=Math.sin(G.t*14+b.p)>0?4:2; ctx.fillStyle=b.c; ctx.fillRect(x-f-2,y-3,f,5); ctx.fillRect(x+2,y-3,f,5); ctx.fillStyle='#2B2333'; ctx.fillRect(x-1,y-3,2,6); }
  },
  scenery(x,y,u,seed,d){
    if(d.k<.5){ // pussy willows in a pot
      ctx.fillStyle='#B0613C'; ctx.fillRect(x-u*.5,y-u*.7,u,u*.7);
      for(let k=-1;k<=1;k++){ ctx.fillStyle='#6B4A2E'; ctx.fillRect(x+k*u*.3-u*.05,y-u*2.6,u*.1,u*1.9);
        for(let j=0;j<4;j++){ ctx.fillStyle='#EDE6F0'; ctx.fillRect(x+k*u*.3-u*.12,y-u*(1+j*.4),u*.24,u*.18); ctx.fillStyle=['#FF8FC0','#FFD23F','#8FD3FF'][(j+k+3)%3]; ctx.fillRect(x+k*u*.3+u*.05,y-u*(1.1+j*.4),u*.12,u*.1); } }
    } else { // tulips
      for(let k=-1;k<=1;k++){ ctx.fillStyle='#4E9A3A'; ctx.fillRect(x+k*u*.5-u*.05,y-u*1.4,u*.1,u*1.4); ctx.fillStyle=['#FF5A7A','#FFD23F','#B07BFF'][(seed+k+3)%3]; ctx.fillRect(x+k*u*.5-u*.25,y-u*1.8,u*.5,u*.45); }
    }
  },
  accessory(cx,eyY,u,near){ // bunny ears
    const hb=eyY-u*(1.6+near*.5);
    [-1,1].forEach(sd=>{ ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx+sd*u*1.2-u*.6,hb-u*3.6,u*1.2,u*3.6); ctx.fillStyle='#FFB3CF'; ctx.fillRect(cx+sd*u*1.2-u*.25,hb-u*3.2,u*.5,u*2.8); });
    return u*4;
  }
});
})();
