/* Latina – Forum. Latinalaiset aakkoset: tyyppä on latinankielinen sana, ammus suomenkielinen. */
Tavu.addWorld({
  sample:'SPQR', id:'la', name:'Forum', script:'Latina', lang:'la', map:{}, latin:true, levels:[],
  words:[
    [['AQUA','vesi'],['TERRA','maa'],['IGNIS','tuli'],['LUX','valo'],['REX','kuningas'],['PUELLA','tyttö'],['PUER','poika'],['AMICUS','ystävä'],['CANIS','koira'],['FELES','kissa'],['EQUUS','hevonen'],['DOMUS','talo'],['VIA','tie'],['BELLUM','sota'],['PAX','rauha'],['MARE','meri']],
    [['MILES','sotilas'],['GLADIUS','miekka'],['SCUTUM','kilpi'],['CASTRA','leiri'],['VICTORIA','voitto'],['LUPUS','susi'],['URSUS','karhu'],['AVIS','lintu'],['ARBOR','puu'],['FLUMEN','joki'],['MONS','vuori'],['SOL','aurinko'],['LUNA','kuu'],['STELLA','tähti'],['LIBER','kirja'],['SCHOLA','koulu']]
  ],
  bosses:[['CENTURIO','sadanpäämies'],['GLADIATOR','gladiaattori'],['MINOTAURUS','minotauros']],
  rewards:[['SENATUS','senaatti'],['LEGIO','legioona'],['AQUILA','kotka'],['FORUM','tori']],
  card:{color:'#B0413E', bg:'linear-gradient(160deg,#FBF1DC,#E9D3A8)'},
  palette:{sky:['#8EC9F0','#FFF1D2'], path:'#D9C7A3', edge:'#B9A27A', grass:'#8DB255', grass2:'#7AA046', hill:'#6E8F3E', far:'#E8DCC0'},
  scenery(x,y,u,seed){ // white column with a capital
    cube(x-u*.6,y-u*.5,u*1.2,'#E9E3D3',true,seed);
    ctx.fillStyle='#F4EFE2'; ctx.fillRect(x-u*.4,y-u*3.6,u*.8,u*3.1); ctx.fillStyle='rgba(0,0,0,.08)'; for(let k=0;k<3;k++) ctx.fillRect(x-u*.3+k*u*.25,y-u*3.6,u*.06,u*3.1);
    cube(x-u*.65,y-u*4.2,u*1.3,'#E9E3D3',true,seed+1);
  }
});
