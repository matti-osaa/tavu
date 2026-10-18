/* Halloween – automatically on 10.10.–2.11. UI colours live in css/seasons/halloween.css. */
Tavu.addSeason({
  id:'halloween', name:'Halloween', cssClass:'season-halloween',
  active(d){ const m=d.getMonth(), day=d.getDate(); return (m===9&&day>=10)||(m===10&&day<=2); },
  palette:{sky:['#2A1846','#E0743A'], path:'#7E6A5A', edge:'#5E4C40', grass:'#3F6B3A', grass2:'#345C30', hill:'#2B1E40', far:'#7A4A7A'},
  colors:['#FF8A1E','#9B59D0','#5ED16A','#E8E2F0','#FF5A3C'],

  sky(sx,sy,ss){ // stars, big moon, flapping bats
    for(let i=0;i<24;i++){ctx.fillStyle=(G.t*2+i)%5<.3?'#FFFFFF':'#E9D8FF'; ctx.fillRect(Math.floor(hash(i,1)*W),Math.floor(hash(i,2)*HY*.6),2,2);}
    ctx.fillStyle='rgba(255,220,150,.2)'; ctx.fillRect(sx-ss*1.7,sy-ss*1.7,ss*3.4,ss*3.4);
    ctx.fillStyle='#FFE7A8'; ctx.fillRect(sx-ss*1.2,sy-ss*1.2,ss*2.4,ss*2.4);
    ctx.fillStyle='#EBCB86'; ctx.fillRect(sx-ss*.6,sy-ss*.5,ss*.5,ss*.5); ctx.fillRect(sx+ss*.3,sy+ss*.2,ss*.4,ss*.4); ctx.fillRect(sx-ss*.2,sy+ss*.6,ss*.3,ss*.3);
    for(const c of clouds){const x=Math.round(c.x*W), y=Math.round(c.y*H)+10, u=Math.max(3,Math.round(c.s*4+2)), f=Math.floor(G.t*8+c.v*900)%2;
      ctx.fillStyle='#1B1128'; ctx.fillRect(x,y,u*2,u*2);
      const wy=f?-u:u; ctx.fillRect(x-u*3,y+wy,u*3,u); ctx.fillRect(x+u*2,y+wy,u*3,u); ctx.fillRect(x-u*2,y,u*2,u); ctx.fillRect(x+u*2,y,u*2,u);
      ctx.fillStyle='#FF8A1E'; ctx.fillRect(x+u*.3,y+u*.5,u*.5,u*.5); ctx.fillRect(x+u*1.2,y+u*.5,u*.5,u*.5);}
  },

  scenery(x,y,u,seed,d){
    if(d.k<.55){ // jack-o'-lantern
      const p=u*1.6; cube(x-p/2,y-p,p,'#F28A1C',true,seed);
      ctx.fillStyle='#4E7A2A'; ctx.fillRect(x-u*.12,y-p-u*.45,u*.24,u*.45);
      ctx.fillStyle=(Math.sin(G.t*6+seed)>-.3)?'#FFE15A':'#FFB43A';
      ctx.fillRect(x-p*.32,y-p*.72,p*.18,p*.16); ctx.fillRect(x+p*.14,y-p*.72,p*.18,p*.16);
      ctx.fillRect(x-p*.3,y-p*.38,p*.6,p*.1); ctx.fillRect(x-p*.2,y-p*.28,p*.12,p*.08); ctx.fillRect(x+p*.08,y-p*.28,p*.12,p*.08);
    } else { // bare spooky tree
      cube(x-u/2,y-u,u,'#3B2C2A',false); cube(x-u/2,y-2*u,u,'#3B2C2A',false); cube(x-u/2,y-3*u,u,'#3B2C2A',false);
      ctx.fillStyle='#2A1F1E'; ctx.fillRect(x+u*.5,y-u*2.6,u*1.2,u*.35); ctx.fillRect(x+u*1.4,y-u*3.1,u*.35,u*.6); ctx.fillRect(x-u*1.6,y-u*3.2,u*1.1,u*.35); ctx.fillRect(x-u*1.6,y-u*3.7,u*.35,u*.6);
    }
  },

  accessory(cx,eyY,u,near){ // little witch hat above the eyes
    const hb=eyY-u*(2.2+near*.6), hw=Math.max(6,u*7);
    ctx.fillStyle='#1B1128'; ctx.fillRect(cx-hw/2,hb,hw,u*1.2);
    ctx.fillRect(cx-hw*.3,hb-u*1.6,hw*.6,u*1.7); ctx.fillRect(cx-hw*.18,hb-u*3,hw*.36,u*1.5); ctx.fillRect(cx-hw*.05+u,hb-u*4.2,hw*.18,u*1.3);
    ctx.fillStyle='#9B59D0'; ctx.fillRect(cx-hw*.3,hb-u*.5,hw*.6,u*.6);
    return u*4.5; // extra headroom used to lift the hint label
  }
});
