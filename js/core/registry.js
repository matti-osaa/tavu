/* Tavu – registry for content packs.
   Every world (language / writing system) and every season lives in its own file under
   js/worlds/ and js/seasons/ and registers itself here. The game never hard-codes them,
   so adding a language = adding one file + one <script> line in index.html. */
const WORLDS = [];   // in map order (order of the <script> tags)
const SEASONS = [];

const Tavu = {
  /* A world pack:
     id, name (map title), script (subtitle), lang (BCP-47)
     map        letter → Latin answer (empty for Latin-script languages)
     levels     letter levels, each a string of new letters (may be empty)
     words      word levels: [[word, Finnish meaning], …][]
     latin      true when the language already uses Latin letters: then the ammo is the Finnish word
     toLatin    optional (word) → Latin form; default is letter by letter through `map`
     card       {color, bg}       map card colours
     palette    {sky:[top,bottom], path, edge, grass, grass2, hill, far}
     scenery(x, y, u, seed, deco)  draws one roadside object (blocks via cube())
     ambient()  optional extra layer drawn over the ground (falling petals …) */
  addWorld(w){ WORLDS.push(w); },

  /* A season pack:
     id, name, active(date) → boolean   when it switches on automatically
     palette    same shape as a world palette, overrides it
     colors     tyyppä body colours
     sky(sx, sy, ss)            replaces sun and clouds
     scenery(x, y, u, seed, deco) replaces the world's roadside objects
     accessory(cx, eyeY, u, near) drawn on every tyyppä (hat …)
     cssClass   body class for map/UI styling (css/seasons/<id>.css) */
  addSeason(s){ SEASONS.push(s); }
};

const $ = id => document.getElementById(id);
const CANDY = ['#FF4F8B','#FF9F1C','#FFC400','#7CCB3F','#3D9BE9','#9B6BFF','#16C2A3'];

/* Latin form of a word: the pack's own rule if it has one, otherwise letter by letter */
function toLatin(w, word){ return w.toLatin ? w.toLatin(word) : [...word].map(c => w.map[c] || '').join(''); }

/* A world's levels as one path: letter levels with word levels mixed in after every second
   letter level (Latin-script worlds have only word levels). Star keys stay as before. */
function stagesOf(w){
  const out=[], words=(w.words||[]).map((_,li)=>({kind:'words',li,key:w.id+'-w'+li}));
  (w.levels||[]).forEach((_,li)=>{ out.push({kind:'letters',li,key:w.id+'-'+li}); if(li%2===1&&words.length) out.push(words.shift()); });
  return out.concat(words);
}

/* Long words are stacked syllable by syllable into 2–3 rows so the tyyppä stays narrow.
   Rough rules, good enough for reading: a single consonant between vowels starts the next syllable
   (TY-KVA → ТЫК-ВА by VC.CV), adjacent vowels stay together, Ь/Ъ stay with the syllable before.
   Katakana splits by kana, small kana and ー stay with the one before. */
const SYL_V={ru:'АЕЁИОУЫЭЮЯ',el:'ΑΕΗΙΟΥΩΆΈΉΊΌΎΏ',sv:'AEIOUYÅÄÖ',en:'AEIOUY'};
function syllables(word,lang){
  const l=(lang||'').slice(0,2);
  if(l==='ja'){ const out=[]; for(const c of word){ if(out.length&&'ャュョァィゥェォッー'.includes(c)) out[out.length-1]+=c; else out.push(c); } return out; }
  const up=word.toUpperCase(), V=SYL_V[l]||SYL_V.en, isV=i=>V.includes(up[i]);
  const nuc=[]; for(let i=0;i<up.length;i++) if(isV(i)&&!(i>0&&isV(i-1))) nuc.push(i);
  if(l==='en'&&nuc.length>1&&/[^AEIOUY]E$/.test(up)) nuc.pop();          // silent final E: HOUSE, CAKE
  if(nuc.length<2) return [word];
  const cuts=[];
  for(let k=1;k<nuc.length;k++){ let a=nuc[k-1]; while(isV(a+1)) a++;      // end of previous vowel group
    const n=nuc[k]-a-1; let c=n<=1?a+1:nuc[k]-1;                           // V.CV  or  VC.CV
    if('ЬЪ'.includes(up[c])) c++;
    cuts.push(c); }
  const out=[]; let p=0; cuts.forEach(c=>{out.push(word.slice(p,c)); p=c;}); out.push(word.slice(p)); return out.filter(Boolean);
}
// Rows to draw: words of up to 4 characters stay on one row; longer ones get 2 (up to 8) or 3 rows,
// cut at syllable borders so that the widest row is as narrow as possible.
function wordRows(ch,disp,lang){
  if(/\s/.test(disp)) return disp.split(/\s+/).filter(Boolean);
  if(disp.length<=4) return [disp];
  const syl=syllables(ch,lang), want=disp.length<=8?2:3, b=[]; let p=0;
  syl.forEach(x=>{p+=x.length; b.push(p);}); b.pop();                   // possible cut positions
  if(!b.length) return [disp];
  const n=Math.min(want-1,b.length); let best=null, bw=1e9;
  const pick=(start,left,cuts)=>{ if(!left){ const edges=[0,...cuts,disp.length]; let w=0; for(let i=1;i<edges.length;i++) w=Math.max(w,edges[i]-edges[i-1]);
      if(w<bw){bw=w; best=cuts;} return; }
    for(let i=start;i<b.length;i++) pick(i+1,left-1,[...cuts,b[i]]); };
  pick(0,n,[]);
  const edges=[0,...best,disp.length]; return edges.slice(1).map((e,i)=>disp.slice(edges[i],e));
}
