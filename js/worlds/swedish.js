/* Ruotsi – Saaristokylä. Latinalaiset aakkoset: tyyppä on ruotsinkielinen sana, ammus suomenkielinen. */
Tavu.addWorld({
  id:'sv', name:'Saaristokylä', script:'Ruotsi', lang:'sv-SE', map:{}, latin:true, levels:[],
  words:[
    [['HUND','koira'],['KATT','kissa'],['HUS','talo'],['BIL','auto'],['BOK','kirja'],['SOL','aurinko'],['MÅNE','kuu'],['VATTEN','vesi'],['BRÖD','leipä'],['MJÖLK','maito'],['ÄPPLE','omena'],['FISK','kala'],['BÅT','vene'],['SKOLA','koulu'],['VÄN','ystävä']],
    [['SKOG','metsä'],['SJÖ','järvi'],['STAD','kaupunki'],['GATA','katu'],['HAND','käsi'],['FOT','jalka'],['ÖGA','silmä'],['ÖRA','korva'],['NÄSA','nenä'],['HJÄRTA','sydän'],['TÅRTA','kakku'],['KAFFE','kahvi'],['GLASS','jäätelö'],['REGN','sade'],['SNÖ','lumi'],['FÅGEL','lintu']]
  ],
  rewards:[['MIDSOMMAR','juhannus'],['STUGA','mökki'],['KANELBULLE','korvapuusti'],['EKORRE','orava']],
  card:{color:'#E2483D', bg:'linear-gradient(160deg,#E4F3FF,#B9DCF7)'},
  palette:{sky:['#79C3F5','#E6F5FF'], path:'#D9CBB0', edge:'#B8A684', grass:'#7CC85A', grass2:'#68B648', hill:'#3E8FC9', far:'#BFE3F8'},
  scenery(x,y,u,seed){ // red cottage with white corners
    cube(x-u,y-u*2,u*2,'#C8372D',true,seed); ctx.fillStyle='#FFFFFF'; ctx.fillRect(x-u,y-u*2,u*.18,u*2); ctx.fillRect(x+u*.82,y-u*2,u*.18,u*2);
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(x-u*.55,y-u*1.5,u*.5,u*.5); ctx.fillStyle='#7FC4F0'; ctx.fillRect(x-u*.48,y-u*1.43,u*.36,u*.36);
    cube(x-u*1.15,y-u*2.6,u*2.3*.6+u*.9,'#3A3A44',false);
  }
});
