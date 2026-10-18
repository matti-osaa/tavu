/* Kyrillinen – Koivumetsä
   Latinaistus: SFS 4900 (Kotuksen suosittama suomalainen latinaistus). */
(() => {
  const map = {А:'a',Б:'b',В:'v',Г:'g',Д:'d',Е:'e',Ж:'ž',З:'z',И:'i',Й:'j',К:'k',Л:'l',М:'m',Н:'n',О:'o',П:'p',Р:'r',С:'s',Т:'t',У:'u',Ф:'f',Х:'h',Ц:'ts',Ч:'tš',Ш:'š',Щ:'štš',Ы:'y',Э:'e',Ю:'ju',Я:'ja'};
  const VOW = 'АЕЁИОУЫЭЮЯ';
  Tavu.addWorld({
    id:'cyr', name:'Koivumetsä', script:'Kyrillinen', lang:'ru-RU', map, cipher:true, cipherDigraphs:{ja:'Я',ju:'Ю'},
    // familiar shapes → false friends → new shapes → hard ones
    levels:['АОКМТ','ЕРСНВ','УХЛПД','БГЗИФ','ЖШЧЦЯЮ'],
    words:[
      [['КОТ','kissa'],['ТОРТ','kakku'],['ДОМ','talo'],['НОС','nenä'],['РОТ','suu'],['СОК','mehu'],['МАМА','äiti'],['ПАПА','isä'],['МОРЕ','meri'],['МЕТРО','metro']],
      [['СУП','keitto'],['МОСТ','silta'],['РЫБА','kala'],['ЗУБ','hammas'],['ВОДА','vesi'],['НОГА','jalka'],['РУКА','käsi'],['КНИГА','kirja'],['ШКОЛА','koulu'],['ЖУК','kuoriainen'],['СЫР','juusto'],['ХЛЕБ','leipä'],['МОЛОКО','maito'],['ЛЕС','metsä'],['ГОРОД','kaupunki'],['ДРУГ','ystävä'],['ЧАС','tunti'],['ЛАМПА','lamppu']]
    ],
    // е = je at the start and after a vowel; ё = o after ж ч ш щ; й = i after и ы; ъ ь are dropped
    toLatin(word){
      let out='', prev='';
      for(const c of word){
        if(c==='Ъ'||c==='Ь'){prev=c;continue;}
        if(c==='Е') out+=(!prev||VOW.includes(prev))?'je':'e';
        else if(c==='Ё') out+='ЖЧШЩ'.includes(prev)?'o':'jo';
        else if(c==='Й') out+='ИЫ'.includes(prev)?'i':'j';
        else out+=map[c]||'';
        prev=c;
      }
      return out;
    },
    bosses:['ТОМАТ','КОТОМАТ','АТОМ','ТАРАКАН','БАБА ЯГА','КОЩЕЙ','ЛЕШИЙ','ЗМЕЙ','ВОДЯНОЙ','КИКИМОРА'],
    rewards:[['БЕРЁЗА','koivu'],['ГРИБ','sieni'],['ЁЖ','siili'],['СОЛНЦЕ','aurinko'],['ЛИСА','kettu']],
    card:{color:'#5CBF6E', bg:'linear-gradient(160deg,#E8FFB8,#B6EFA0)'},
    palette:{sky:['#8ED6FF','#E9F8FF'], path:'#D8B57A', edge:'#B98F52', grass:'#6CC04A', grass2:'#5AAE3C', hill:'#4E9A34', far:'#7BC4F2'},
    scenery(x,y,u,seed){ // birch
      cube(x-u/2,y-u,u,'#F2F0E8',false); cube(x-u/2,y-2*u,u,'#F2F0E8',false);
      ctx.fillStyle='#2B2333'; ctx.fillRect(x-u/2+u*.15,y-u*.6,u*.35,u*.15); ctx.fillRect(x-u/2+u*.5,y-u*1.55,u*.35,u*.15);
      cube(x-u*1.5,y-u*5,u*3,'#5DBB3A',true,seed);
    }
  });
})();
