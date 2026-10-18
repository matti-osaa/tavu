/* Kreikka – Saaristo
   Huom. latinaistus on alustava (nykykreikan ääntämisen mukainen) ja odottaa tarkistusta. */
Tavu.addWorld({
  id:'gre', name:'Saaristo', script:'Kreikka', lang:'el-GR', cipher:true, cipherPrefer:{i:'Ι',o:'Ο'},
  map:{Α:'a',Β:'v',Γ:'g',Δ:'d',Ε:'e',Ζ:'z',Η:'i',Θ:'th',Ι:'i',Κ:'k',Λ:'l',Μ:'m',Ν:'n',Ξ:'ks',Ο:'o',Π:'p',Ρ:'r',Σ:'s',Τ:'t',Υ:'y',Φ:'f',Χ:'h',Ψ:'ps',Ω:'o'},
  levels:['ΑΚΜΟΤ','ΡΗΝΧΥ','ΓΔΛΠΣ','ΘΞΦΨΩ'],
  words:[
    [['ΓΑΤΑ','kissa'],['ΝΕΡΟ','vesi'],['ΜΗΛΟ','omena'],['ΤΡΕΝΟ','juna'],['ΣΠΙΤΙ','talo'],['ΚΑΦΕΣ','kahvi']],
    [['ΨΩΜΙ','leipä'],['ΗΛΙΟΣ','aurinko'],['ΘΑΛΑΣΣΑ','meri'],['ΒΙΒΛΙΟ','kirja'],['ΣΚΥΛΟΣ','koira']]
  ],
  bosses:['ΤΟΜΑΤΑ','ΚΥΚΛΩΨ','ΜΕΔΟΥΣΑ','ΤΥΦΩΝ','ΧΙΜΑΙΡΑ','ΚΕΡΒΕΡΟΣ'],
  rewards:[['ΒΑΡΚΑ','vene'],['ΨΑΡΙ','kala'],['ΚΥΜΑ','aalto'],['ΗΛΙΟΣ','aurinko']],
  card:{color:'#1FB5D1', bg:'linear-gradient(160deg,#D8FBFF,#9EE6F2)'},
  palette:{sky:['#6FD0F7','#E3FBFF'], path:'#ECE6D6', edge:'#CFC5AE', grass:'#F0D58C', grass2:'#E4C574', hill:'#3FA9D8', far:'#8ED8F6'},
  scenery(x,y,u,seed){ // white house with a blue dome
    cube(x-u,y-u*2,u*2,'#FFFFFF',true,seed); cube(x-u*.7,y-u*2.9,u*1.4,'#2F80D8',true,seed+3);
    ctx.fillStyle='#2F80D8'; ctx.fillRect(x-u*.25,y-u*.9,u*.5,u*.9);
  }
});
