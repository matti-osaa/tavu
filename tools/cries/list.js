// prints every letter/word that can die in the game, per world, with its cry text
const fs=require('fs'), vm=require('vm'), base='../../js/';
const ctx={window:{},document:{getElementById:()=>({}),addEventListener(){} ,body:{classList:{contains:()=>false}}},addEventListener(){},matchMedia:()=>({matches:false}),Math,JSON,console,performance:{now:()=>0}};
vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(base+f,'utf8'),ctx,{filename:f});
run('core/registry.js'); ['cyrillic','greek','katakana','swedish','english'].forEach(w=>run('worlds/'+w+'.js')); run('seasons/halloween.js');
const audio=fs.readFileSync(base+'core/audio.js','utf8');
const m=audio.match(/const VOWELS=[\s\S]*?\nfunction wailText[\s\S]*?\n}\n/); vm.runInContext(m[0].replace(/let voices[\s\S]*?\n(?=function wailText)/,''),ctx);
vm.runInContext('this.W=WORLDS;this.S=SEASONS;this.wt=wailText',ctx);
const out={};
for(const w of ctx.W){ const set=new Set(Object.keys(w.map||{}));
  (w.words||[]).flat().forEach(p=>set.add(p[0])); (w.rewards||[]).forEach(p=>set.add(p[0]));
  (w.bosses||[]).forEach(b=>{ if(Array.isArray(b)) set.add(b[0]); });
  ctx.S.forEach(s=>((s.rewards||{})[w.id]||[]).forEach(p=>set.add(p[0])));
  out[w.id]={lang:w.lang,items:[...set].map(ch=>[ch,ctx.wt(ch,w.lang)])};
}
fs.writeFileSync('list.json',JSON.stringify(out,null,0));
for(const k in out) console.log(k,out[k].items.length, JSON.stringify(out[k].items.slice(0,6)));
