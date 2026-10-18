/* Englanti – Puistokatu. Latinalaiset aakkoset: tyyppä on englanninkielinen sana, ammus suomenkielinen. */
Tavu.addWorld({
  id:'en', name:'Puistokatu', script:'Englanti', lang:'en-GB', map:{}, latin:true, levels:[],
  words:[
    [['DOG','koira'],['CAT','kissa'],['HOUSE','talo'],['CAR','auto'],['BOOK','kirja'],['SUN','aurinko'],['MOON','kuu'],['WATER','vesi'],['BREAD','leipä'],['MILK','maito'],['APPLE','omena'],['FISH','kala'],['BOAT','vene'],['SCHOOL','koulu'],['FRIEND','ystävä']],
    [['FOREST','metsä'],['LAKE','järvi'],['CITY','kaupunki'],['STREET','katu'],['HAND','käsi'],['FOOT','jalka'],['EYE','silmä'],['EAR','korva'],['NOSE','nenä'],['HEART','sydän'],['CAKE','kakku'],['COFFEE','kahvi'],['RAIN','sade'],['SNOW','lumi'],['BIRD','lintu'],['TREE','puu']]
  ],
  rewards:[['PARK','puisto'],['SQUIRREL','orava'],['BENCH','penkki'],['LEAF','lehti']],
  card:{color:'#3B6FD8', bg:'linear-gradient(160deg,#F1F7E8,#CFE6B8)'},
  palette:{sky:['#9CCBEA','#F0F7FB'], path:'#BDB7AD', edge:'#9A948A', grass:'#6DB54C', grass2:'#5CA23E', hill:'#4F9637', far:'#D4E8F2'},
  scenery(x,y,u,seed){ // oak
    cube(x-u/2,y-u,u,'#6B4A2E',true,seed); cube(x-u/2,y-2*u,u,'#6B4A2E',true,seed+1);
    cube(x-u*1.7,y-u*5.2,u*3.4,'#3F8F2F',true,seed);
  }
});
