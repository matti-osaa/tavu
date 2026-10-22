// Lists every letter/word that can die in the game, per world and per audio chunk:
//   base = letters + bosses + boss reward words (+ season rewards), w<N> = word level N.
// Usage: node list.js  → list.json
const fs=require('fs'), vm=require('vm'), base='../../js/';
const ctx={window:{},document:{getElementById:()=>({}),addEventListener(){},body:{classList:{contains:()=>false}}},addEventListener(){},matchMedia:()=>({matches:false}),Math,JSON,console,performance:{now:()=>0}};
vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(base+f,'utf8'),ctx,{filename:f});
run('core/registry.js');
['cyrillic','greek','katakana','swedish','english','latin'].forEach(w=>run('worlds/'+w+'.js'));
fs.readdirSync(base+'content').filter(f=>f.startsWith('words-')).forEach(f=>run('content/'+f));
fs.readdirSync(base+'seasons').filter(f=>f.endsWith('.js')&&!f.includes('-map')).forEach(f=>run('seasons/'+f));
const audio=fs.readFileSync(base+'core/audio.js','utf8');
const m=audio.match(/const VOWELS=[\s\S]*?\nfunction wailText[\s\S]*?\n}\n/); vm.runInContext(m[0].replace(/let voices[\s\S]*?\n(?=function wailText)/,''),ctx);
vm.runInContext('this.W=WORLDS;this.S=SEASONS;this.wt=wailText',ctx);
const out={};
for(const w of ctx.W){
  const chunks={base:new Set(Object.keys(w.map||{}))};
  (w.rewards||[]).forEach(p=>chunks.base.add(p[0]));
  (w.bosses||[]).forEach(b=>{ if(Array.isArray(b)) chunks.base.add(b[0]); });
  ctx.S.forEach(s=>((s.rewards||{})[w.id]||[]).forEach(p=>chunks.base.add(p[0])));
  (w.words||[]).forEach((lv,li)=>{ chunks['w'+li]=new Set(lv.map(p=>p[0])); });
  out[w.id]={lang:w.lang,chunks:Object.fromEntries(Object.entries(chunks).map(([k,v])=>[k,[...v]]))};
  console.log(w.id, Object.entries(out[w.id].chunks).map(([k,v])=>k+':'+v.length).slice(0,6).join(' '), '… chunks', Object.keys(out[w.id].chunks).length);
}
fs.writeFileSync('list.json',JSON.stringify(out));
