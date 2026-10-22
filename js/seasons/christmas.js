/* Joulu – automatically 20.11.–26.12. UI colours: css/seasons/christmas.css */
(()=>{
const flakes=Array.from({length:60},()=>({x:Math.random(),y:Math.random(),v:.02+Math.random()*.05,s:1+Math.random()*2.5,p:Math.random()*6}));
Tavu.addSeason({
  id:'joulu', name:'Joulu', cssClass:'season-joulu', snow:true,
  active(d){ const m=d.getMonth(), day=d.getDate(); return (m===10&&day>=20)||(m===11&&day<=26); },
  palette:{sky:['#16214A','#5D6FA8'], path:'#DCE5EF', edge:'#B9C6D6', grass:'#F2F6FB', grass2:'#E1E9F2', hill:'#24335F', far:'#9AA9CC'},
  colors:['#D7263D','#1E9E5A','#F2B705','#FFFFFF','#3A7BD5'],
  rewards:{
    cyr:[['ЕЛКА','kuusi','jolka'],['СНЕГ','lumi'],['ПОДАРОК','lahja'],['ЗВЕЗДА','tähti'],['СНЕГОВИК','lumiukko']],
    gre:[['ΧΙΟΝΙ','lumi'],['ΔΩΡΟ','lahja'],['ΑΣΤΕΡΙ','tähti'],['ΚΑΜΠΑΝΑ','kello'],['ΕΛΑΤΟ','kuusi']],
    kat:[['クリスマス','joulu','kurisumasu'],['ツリー','joulukuusi','tsurii'],['プレゼント','lahja','purezento'],['サンタ','joulupukki','santa'],['ケーキ','kakku','keeki']],
    sv:[['JUL','joulu'],['TOMTE','tonttu'],['GRAN','kuusi'],['PEPPARKAKA','piparkakku'],['JULKLAPP','joululahja'],['SNÖGUBBE','lumiukko']],
    en:[['CHRISTMAS','joulu'],['GIFT','lahja'],['SNOWMAN','lumiukko'],['REINDEER','poro'],['CANDLE','kynttilä'],['STAR','tähti']],
    la:[['NATALIS','joulu'],['DONUM','lahja'],['NIX','lumi'],['STELLA','tähti'],['ANGELUS','enkeli']]
  },
  // some tyypät are wrapped presents
  bodyChance:.3, bodyLetterColor:'#FFFFFF',
  body(cx,by,TW,TH,u,seed){
    const S=Math.max(TW*1.15,TH*1.25), col=['#D7263D','#1E9E5A','#3A7BD5'][seed%3];
    cube(cx-S/2,by-S*.98,S,col,true,seed);
    ctx.fillStyle='#F2B705'; ctx.fillRect(cx-S*.07,by-S*.98,S*.14,S); ctx.fillRect(cx-S/2,by-S*.55,S,S*.12);
    ctx.fillRect(cx-S*.25,by-S*1.12,S*.2,S*.14); ctx.fillRect(cx+S*.05,by-S*1.12,S*.2,S*.14);
  },
  sky(sx,sy,ss){ // stars, northern lights and falling snow
    for(let i=0;i<30;i++){ctx.fillStyle=(G.t*2+i)%6<.3?'#FFFFFF':'#DCE6FF'; ctx.fillRect(Math.floor(hash(i,3)*W),Math.floor(hash(i,4)*HY*.7),2,2);}
    for(let b=0;b<3;b++){ ctx.fillStyle=['rgba(80,255,170,.16)','rgba(120,200,255,.13)','rgba(190,120,255,.10)'][b];
      for(let x=0;x<W;x+=8){ const y=HY*(.18+b*.1)+Math.sin(x/W*6+G.t*.4+b)*HY*.08; ctx.fillRect(x,y,8,HY*(.18+.08*Math.sin(x/40+G.t+b))); } }
    ctx.fillStyle='#FFFFFF';
    for(const f of flakes){ f.y+=f.v*(G.dt||0); f.x+=Math.sin(G.t+f.p)*.0005; if(f.y>1){f.y=0;f.x=Math.random();} ctx.globalAlpha=.85; ctx.fillRect(Math.round(f.x*W),Math.round(f.y*H),f.s,f.s); }
    ctx.globalAlpha=1;
  },
  scenery(x,y,u,seed,d){
    if(d.k<.6){ // decorated spruce with lights and a star
      ctx.fillStyle='#5A3A22'; ctx.fillRect(x-u*.18,y-u*.6,u*.36,u*.6);
      [[1.5,.6],[1.15,1.35],[.8,2.05]].forEach(([w,h],i)=>{ ctx.fillStyle=i%2?'#1E7A45':'#24894F'; ctx.beginPath(); ctx.moveTo(x-w*u,y-h*u); ctx.lineTo(x,y-(h+1.1)*u); ctx.lineTo(x+w*u,y-h*u); ctx.fill();
        ctx.fillStyle='#FFFFFF'; ctx.fillRect(x-w*u,y-h*u-u*.12,w*2*u,u*.12); });
      for(let k=0;k<6;k++){ ctx.fillStyle=['#FF4D4D','#FFD23F','#4DA3FF'][(k+Math.floor(G.t*2))%3]; ctx.fillRect(x+(hash(seed,k)-.5)*u*1.8,y-u*(.9+hash(k,seed)*1.9),u*.18,u*.18); }
      ctx.fillStyle='#FFD23F'; ctx.fillRect(x-u*.18,y-u*3.3,u*.36,u*.36);
    } else { // snowman
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(x,y-u*.6,u*.65,0,Math.PI*2); ctx.arc(x,y-u*1.6,u*.45,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2B2333'; ctx.fillRect(x-u*.2,y-u*1.75,u*.1,u*.1); ctx.fillRect(x+u*.1,y-u*1.75,u*.1,u*.1); ctx.fillStyle='#F28A1C'; ctx.fillRect(x,y-u*1.6,u*.35,u*.1);
      ctx.fillStyle='#D7263D'; ctx.fillRect(x-u*.45,y-u*1.2,u*.9,u*.15);
    }
  },
  accessory(cx,eyY,u,near){ // tonttulakki
    const hb=eyY-u*(2+near*.6), hw=Math.max(6,u*6.5);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx-hw/2,hb,hw,u*1.1);
    ctx.fillStyle='#D7263D'; ctx.beginPath(); ctx.moveTo(cx-hw*.42,hb); ctx.lineTo(cx+hw*.55,hb-u*3.4); ctx.lineTo(cx+hw*.42,hb); ctx.fill();
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx+hw*.5-u*.6,hb-u*3.9,u*1.2,u*1.2);
    return u*4.5;
  }
});
})();
