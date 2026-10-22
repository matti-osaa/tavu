/* Katakana – Kirsikkapuisto
   Latinaistus: Hepburn (alustava, odottaa tarkistusta). Katakanalla ei ole isoja ja pieniä kirjaimia. */
(() => {
  const petals = Array.from({length:14}, () => ({x:Math.random(), y:Math.random(), v:.03+Math.random()*.04, p:Math.random()*6}));
  Tavu.addWorld({
    sample:'カナ', id:'kat', name:'Kirsikkapuisto', script:'Katakana', lang:'ja-JP',
    map:{ア:'a',イ:'i',ウ:'u',エ:'e',オ:'o',カ:'ka',キ:'ki',ク:'ku',ケ:'ke',コ:'ko',サ:'sa',シ:'shi',ス:'su',セ:'se',ソ:'so',タ:'ta',チ:'chi',ツ:'tsu',テ:'te',ト:'to',ナ:'na',ニ:'ni',ヌ:'nu',ネ:'ne',ノ:'no'},
    levels:['アイウエオ','カキクケコ','サシスセソ','タチツテト','ナニヌネノ'],
    words:[
      [['アイス','jäätelö'],['カカオ','kaakao'],['テニス','tennis'],['タコス','tacot'],['イカ','kalmari']],
      [['ネクタイ','solmio'],['テキスト','teksti'],['トナカイ','poro'],['ナス','munakoiso'],['ココア','kaakaojuoma']]
    ],
    bosses:['アオイ','オニ','ヌエ','ツチノコ'],
    rewards:[['サクラ','kirsikankukka','sakura'],['キツネ','kettu'],['タヌキ','supikoira'],['サカナ','kala']],
    card:{color:'#FF6FA5', bg:'linear-gradient(160deg,#FFE6F1,#FFC3DA)'},
    palette:{sky:['#FFC4DC','#FFF4E6'], path:'#E6C3C9', edge:'#C99AA4', grass:'#7CC85A', grass2:'#68B648', hill:'#5DA843', far:'#F7C9DA'},
    scenery(x,y,u,seed){ // cherry tree
      cube(x-u/2,y-u,u,'#8A5A3C',true,seed); cube(x-u/2,y-2*u,u,'#8A5A3C',true,seed+1);
      cube(x-u*1.5,y-u*5,u*3,'#FFAFCB',true,seed);
    },
    ambient(dt){ // falling petals
      ctx.fillStyle='#FF9DC2';
      for(const p of petals){
        p.y+=p.v*dt; p.x+=Math.sin(G.t+p.p)*.0008; if(p.y>1.05){p.y=-.05;p.x=Math.random();}
        ctx.fillRect(Math.round(p.x*W),Math.round(p.y*H),5,5);
      }
    }
  });
})();
