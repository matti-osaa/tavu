/* Talvi – automatically 27.12.–end of February. UI colours: css/seasons/winter.css */
(()=>{
const flakes=Array.from({length:45},()=>({x:Math.random(),y:Math.random(),v:.015+Math.random()*.04,s:1.5+Math.random()*2.5,p:Math.random()*6}));
Tavu.addSeason({
  id:'talvi', name:'Talvi', cssClass:'season-talvi', snow:true,
  active(d){ const m=d.getMonth(), day=d.getDate(); return (m===11&&day>=27)||m===0||m===1; },
  palette:{sky:['#8FBFE6','#EAF4FB'], path:'#E7EEF6', edge:'#C3D2E2', grass:'#F7FAFD', grass2:'#E6EEF6', hill:'#B8CCE0', far:'#DCE8F3'},
  colors:['#2E86C1','#E8323C','#1E9E5A','#7B4FD0','#F28A1C'],
  rewards:{
    cyr:[['ЗИМА','talvi'],['ЛЕД','jää'],['МОРОЗ','pakkanen'],['ЛЫЖИ','sukset'],['СНЕЖОК','lumipallo']],
    gre:[['ΧΕΙΜΩΝΑΣ','talvi'],['ΠΑΓΟΣ','jää'],['ΚΡΥΟ','kylmä'],['ΧΙΟΝΙ','lumi']],
    kat:[['スキー','sukset','sukii'],['スケート','luistelu','sukeeto'],['マフラー','kaulaliina','mafuraa'],['セーター','villapaita','seetaa']],
    sv:[['VINTER','talvi'],['IS','jää'],['SKIDOR','sukset'],['SNÖBOLL','lumipallo'],['VANTE','lapanen']],
    en:[['WINTER','talvi'],['ICE','jää'],['SKI','suksi'],['SNOWBALL','lumipallo'],['MITTEN','lapanen']],
    la:[['HIEMS','talvi'],['GLACIES','jää'],['FRIGUS','kylmyys'],['NIX','lumi']]
  },
  sky(sx,sy,ss){ // pale low sun and drifting snow
    ctx.fillStyle='rgba(255,250,220,.4)'; ctx.fillRect(sx-ss*1.4,sy-ss*1.4,ss*2.8,ss*2.8); ctx.fillStyle='#FFF7D6'; ctx.fillRect(sx-ss,sy-ss,ss*2,ss*2);
    for(const c of clouds){const x=Math.round(c.x*W), y=Math.round(c.y*H), u=Math.round(c.s*14+8); ctx.fillStyle='#F4F8FC'; ctx.fillRect(x,y,u*5,u); ctx.fillRect(x+u,y-u,u*2,u);}
    ctx.fillStyle='#FFFFFF';
    for(const f of flakes){ f.y+=f.v*(G.dt||0); f.x+=Math.sin(G.t*.7+f.p)*.0006; if(f.y>1){f.y=0;f.x=Math.random();} ctx.globalAlpha=.9; ctx.fillRect(Math.round(f.x*W),Math.round(f.y*H),f.s,f.s); }
    ctx.globalAlpha=1;
  },
  scenery(x,y,u,seed,d){ // snowy spruce
    ctx.fillStyle='#5A3A22'; ctx.fillRect(x-u*.18,y-u*.6,u*.36,u*.6);
    [[1.5,.6],[1.15,1.35],[.8,2.05]].forEach(([w,h],i)=>{ ctx.fillStyle='#2D6B4A'; ctx.beginPath(); ctx.moveTo(x-w*u,y-h*u); ctx.lineTo(x,y-(h+1.1)*u); ctx.lineTo(x+w*u,y-h*u); ctx.fill();
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.moveTo(x-w*u*.55,y-(h+.5)*u); ctx.lineTo(x,y-(h+1.1)*u); ctx.lineTo(x+w*u*.55,y-(h+.5)*u); ctx.fill(); });
  },
  accessory(cx,eyY,u,near){ // knitted beanie with a pompom
    const hb=eyY-u*(1.8+near*.6), hw=Math.max(6,u*5.5), col=['#2E86C1','#E8323C','#1E9E5A'][Math.floor(cx)%3];
    ctx.fillStyle=col; ctx.fillRect(cx-hw/2,hb-u*1.6,hw,u*1.6); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(cx-hw/2,hb-u*.5,hw,u*.5);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx-u*.6,hb-u*2.6,u*1.2,u*1.1);
    return u*3.5;
  }
});
})();
