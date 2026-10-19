/* Game rules: level setup, ammo, spawning, hits and misses, the update loop. */
function startLevel(wi,si){
  if(stagesOf(WORLDS[wi])[si].kind==='cipher'){ cancelAnimationFrame(raf); G=null; ov.innerHTML=''; return startCipher(wi,si); }
  const w=WORLDS[wi], stage=stagesOf(w)[si], li=stage.li, isWord=stage.kind==='words';
  const fresh=isWord?w.words[li].map(p=>p[0]):[...w.levels[li]], older=isWord?[]:w.levels.slice(0,li).join('').split('');
  G={w,wi,si,li,key:stage.key,phase:'wave',boss:null,alarmT:0,bolts:[],hurt:0,surge:1,playT:0,kills:{},lootMode:false,didMove:false,didFire:false,fresh,older,enemies:[],shots:[],parts:[],texts:[],ammo:[],sel:0,lane:0,tlane:0,hp:100,hpShown:-1,quietT:9,dmgTaken:0,pace:diff().pace,popped:0,
     goal:14+li*3,maxOn:4+li,speed:.5+li*.08,fired:0,correct:0,combo:0,spawnT:.4,t:0,running:false,hitstop:0,shake:0,cool:0,reload:1,recoil:0,
     season:activeSeason(),isWord,fiOf:isWord?Object.fromEntries(w.words[li].map(p=>[p[0],p[1]])):{},
     fi:isWord?Object.fromEntries(w.words[li].map(p=>w.latin?[p[1],'']:[toLatin(w,p[0]),p[1]])):{},
     keys:{},seen:seenSet(w.id),endT:-1,scroll:0,pairs:[],muzzle:[],
     deco:Array.from({length:10},(_,i)=>({z:ZN*.75+i*(ZF*1.6/10),side:i%2?1:-1,k:Math.random()}))};
  if(isWord){G.goal=10+li*2;G.maxOn=3+li;G.speed=.4+li*.05;}
  G.speed*=G.pace;
  if(si===0){ G.speed*=.75; G.goal=Math.min(G.goal,10); }   // first level: slower and shorter
  G.plain=si<2;
  G.rocks=makeRocks(si);
  G.decals=Array.from({length:90},(_,i)=>({lane:(Math.random()*2-1)*2.4, z:1.05+Math.pow(Math.random(),.8)*(ZF-.6), type:['tuft','tuft','flower','pebble','wear','tuft'][i%6], seed:i})).sort((a,b)=>b.z-a.z);   // sorted once, far to near                                                // first levels: tyypät are just letters, nothing else
  G.assist=si<2||save.diff==='easy';                          // beginner help: matching tyypät glow, vastine labels
  if(!save.tutDone&&!isWord&&w.levels.length){ G.tut={step:0,t:0}; }
  $('map').hidden=true; $('game').hidden=false; resize(); loadCries(w.id);
  G.cur=null; G.curCol=AMMO_COL;
  buildAmmo(); drawHearts(); prog();
  showIntro();
  cancelAnimationFrame(raf); last=performance.now(); raf=requestAnimationFrame(loop);
}
function buildAmmo(){ ammoEl.innerHTML=''; ammoEl.style.display='none'; G.stacks=null; G.pull=null; G.aimA=0; G.sel=0; refreshStacks(); }
const wordMode=()=>G&&(G.isWord||G.lootMode);
const ansOf=ch=>G.isWord?(G.w.latin?G.fiOf[ch]:toLatin(G.w,ch)):G.w.map[ch];
/* The ammo always has the same colour, so colour never hints at the answer – the player has to read the letter */
const AMMO_COL='#E9A800';
// Reload time (s) after a shot before the next disc can be taken
const COOL=.5;
// Everything a disc could be aimed at: tyypät and the boss's remaining plates
function targets(){
  const t=G.enemies.map(e=>({ans:e.ans,z:e.z}));
  if(G.boss) G.boss.segs.forEach(g=>{ if(g.alive) t.push({ans:g.ans,z:G.boss.z}); });
  return t;
}
const HEART_UNUSED='<svg viewBox="0 0 9 8" shape-rendering="crispEdges"><path fill="#2B2333" d="M1 0h3v1h1V0h3v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"/><path fill="#F23C5A" d="M1 1h2v1h1v1h1V2h1V1h2v3H7v1H6v1H5v1H4V6H3V5H2V4H1z"/><path fill="#FF9AAA" d="M1 1h1v1H1z"/></svg>';
/* Health: one bar that heals back up when nothing gets through for a while.
   A tyyppä reaching you hurts; at zero you fall into limbo. */
const HP_REGEN=5, HP_QUIET=3;                       // hp per second, after this many quiet seconds
const hpDamage=()=>Math.round(90/diff().lives);     // easy 18, normal 23, hard 30
function drawHearts(){ const h=Math.max(0,Math.round(G.hp)); if(h===G.hpShown) return; G.hpShown=h;
  const el=$('hearts'); if(!el.querySelector('.hpbar')) el.innerHTML='<div class="hpbar"><b></b></div>';
  const b=el.querySelector('.hpbar b'); b.style.width=h+'%'; b.style.background=h<30?'#F23C5A':h<60?'#FFB020':'#45C46B'; }
function hurt(n){
  G.hp=Math.max(0,G.hp-n); G.dmgTaken+=n; G.quietT=0; G.combo=0; drawHearts(); G.hurt=.35;
  if(G.hp<=0&&G.endT<0&&!G.limboOn){
    if(G.limboUsed){ G.endT=1.1; G.lose=true; }               // second fall in the same level: out
    else { G.limboOn=true; G.running=false; setTimeout(enterLimbo,700); } }
}
/* ---------- Limbo ----------
   Out of health: you drop into limbo. Name the last 3 letters/words that got you (or that you saw)
   within 10 seconds and you come back with half health and the field pushed back. Otherwise: back to the map.
   One limbo per level. */
const LIMBO_TIME=10;
function limboItems(){
  const out=[]; const add=ch=>{ if(ch&&!out.includes(ch)&&ansOf(ch)) out.push(ch); };
  [...(G.leaks||[])].reverse().forEach(add);
  [...G.enemies].sort((a,b)=>a.z-b.z).forEach(e=>add(e.ch));
  [...(G.recent||[])].reverse().forEach(add);
  (G.fresh||[]).forEach(add);
  return out.slice(0,3);
}
function enterLimbo(){
  if(!G) return; G.limboUsed=true;
  const items=limboItems(), pool=answerPool(); let k=0, t0=performance.now(), done=false;
  sRoar(); tone(110,1.2,'sine',.12,.5);
  const render=()=>{
    const ch=items[k], ans=ansOf(ch), opts=[ans,...pool.filter(a=>a!==ans).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
    ov.innerHTML=`<div class="overlay limbo"><div class="card">
      <h3>LIMBO</h3><div class="limbo-bar"><b id="lbBar"></b></div>
      <div class="limbo-dots">${items.map((_,i)=>`<i class="${i<k?'on':''}"></i>`).join('')}</div>
      <div class="limbo-q">${dispCh(ch)}</div>
      <div class="limbo-opts">${opts.map(o=>`<button class="btn alt" data-a="${o}">${dispAns(o)}${G.isWord&&G.fi[o]?`<small>${G.fi[o]}</small>`:''}</button>`).join('')}</div></div></div>`;
    ov.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ if(done) return;
      if(b.dataset.a===ans){ tone(520,.1,'triangle',.1); k++; if(k>=items.length) win(); else render(); }
      else { b.classList.add('wrong'); sClank(); t0-=1500; } });          // a wrong guess costs 1.5 s
  };
  const timer=setInterval(()=>{ if(done||!G){ clearInterval(timer); return; }
    const left=1-(performance.now()-t0)/1000/LIMBO_TIME, bar=$('lbBar'); if(bar) bar.style.width=Math.max(0,left*100)+'%';
    if(left<=0){ done=true; clearInterval(timer); sOuch(); ov.innerHTML='<div class="overlay limbo"><div class="card"><h3>LIMBO</h3><p>Aika loppui.</p></div></div>'; setTimeout(()=>{ if(G) toMap(); },1300); } },80);
  const win=()=>{ done=true; clearInterval(timer); ov.innerHTML=''; sWin();
    G.hp=50; G.hpShown=-1; drawHearts(); G.limboOn=false; G.running=true; G.quietT=0; G.flash=.3;
    for(const e of G.enemies){ e.z=Math.max(e.z,ZF-.4+Math.random()*.7); e.air=0; e.vz=0; }
    if(G.boss){ G.boss.z=Math.max(G.boss.z,ZF); G.boss.vz=0; }
    floatText(W/2,H*.35,'TAKAISIN!','#C9A8FF',true); };
  render();
}
function prog(){ const b=$('progbar');
  if(G.boss){ const a=G.boss.segs.filter(g=>g.alive).length; b.style.width=(a/G.boss.segs.length*100)+'%'; b.classList.add('boss'); }
  else { b.style.width=Math.min(100,G.popped/G.goal*100)+'%'; b.classList.remove('boss'); } }

function showIntro(){
  const w=G.w;
  const pv=pickProverb(w.id);
  ov.innerHTML=`<div class="overlay"><div class="card">
    ${pv?`<div class="proverb"><div class="pv-o" lang="${w.lang}">${pv[0]}</div>${pv[1]?`<div class="pv-t">${pv[1]}</div>`:''}<div class="pv-fi">${pv[2]}</div>${pv[3]?`<div class="pv-en">${pv[3]}</div>`:''}</div>`:''}
    <div style="font-weight:900;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft)">${w.script} ${G.si+1}</div>
    <div class="row"><button class="btn" id="go">Aloita</button></div></div></div>`;
  $('go').onclick=()=>{audio(); ov.innerHTML=''; G.running=true; if(G.tut) tutStep(0);};
}
function endCard(win){
  G.running=false;
  const acc=G.fired?G.correct/G.fired:0;
  let stars=0; if(win){stars=1; if(G.dmgTaken<=50&&acc>=.6)stars=2; if(G.dmgTaken===0&&acc>=.85)stars=3;}
  const k=G.key; if(stars>(save.stars[k]||0)){save.stars[k]=stars;}
  save.kills=save.kills||{}; const sk=save.kills[G.w.id]=save.kills[G.w.id]||{};
  for(const [c,n] of Object.entries(G.kills)) sk[c]=(sk[c]||0)+n; persist();
  const hasNext=win&&G.si+1<stagesOf(G.w).length;
  if(win) sWin();
  ov.innerHTML=`<div class="overlay"><div class="card">
    <h3>${win?`${G.bossName||'Loppuvastustaja'} kaatui!`:'Tyypät voittivat tällä kertaa'}</h3>
    ${win?`<div class="big-stars">${[0,1,2].map(i=>`<i class="${i<stars?'on':''}"></i>`).join('')}</div>`:''}
    ${killsHTML()}
    <p>${G.correct} osumaa, tarkkuus ${Math.round(acc*100)} %</p>
    <div class="row">${hasNext?'<button class="btn" id="nx">Seuraava taso</button>':''}
    <button class="btn ${hasNext?'alt':''}" id="rt">${win?'Pelaa uudelleen':'Yritä uudelleen'}</button>
    <button class="btn alt" id="mp">Kartta</button></div></div></div>`;
  if(hasNext) $('nx').onclick=()=>startLevel(G.wi,G.si+1);
  $('rt').onclick=()=>startLevel(G.wi,G.si);
  $('mp').onclick=toMap;
}
/* End-of-level summary: the world's alphabet with how many of each letter were destroyed,
   plus the words (level words and the boss's words) that were destroyed */
function killsHTML(){
  const w=G.w, letters=Object.keys(w.map), words=Object.entries(G.kills).filter(([c])=>c.length>1);
  const lat=c=>w.latin?'':toLatin(w,c), fiOf=c=>{ const p=(w.words||[]).flat().find(q=>q[0]===c)||(G.loot||[]).map(l=>[l.word,l.fi]).find(q=>q[0]===c); return p?p[1]:''; };
  let h='';
  if(letters.length) h+=alphabetHTML(w,G.kills,true);
  if(words.length) h+=`<div class="killwords">${words.map(([c,n])=>`<div><b>${dispCh(c)}</b>${lat(c)?` <span>${lat(c)}</span>`:''}${fiOf(c)?` = ${fiOf(c)}`:''}${n>1?` <i>×${n}</i>`:''}</div>`).join('')}</div>`;
  return h;
}
function toMap(){ cancelAnimationFrame(raf); G=null; ov.innerHTML=''; $('game').hidden=true; $('map').hidden=false; renderMap(); }
$('back').onclick=toMap;

/* spawn: random letters from this level's pool, new letters weighted up */
function pickLetter(){
  // now and then a random letter from the whole alphabet, even ones not taught yet
  if(!G.isWord&&G.si>0&&Math.random()<.14){ const all=Object.keys(G.w.map); return all[Math.floor(Math.random()*all.length)]; }
  const pool=[]; G.fresh.forEach(c=>pool.push(c,c,c)); G.older.forEach(c=>pool.push(c));
  return pool[Math.floor(Math.random()*pool.length)];
}
function spawn(){
  const ch=pickLetter(); if(!ch)return;
  let lane=0; for(let k=0;k<10;k++){lane=G.isWord?-.55+Math.random()*1.1:-.72+Math.random()*1.44; if(G.enemies.every(e=>Math.abs(e.bl-lane)>(G.isWord?.75:.4)||e.z<ZF-1.4))break;}
  G.enemies.push(makeEnemy(ch,lane,ZF));
    const e=G.enemies[G.enemies.length-1]; if(e.pumpkin&&G.season.bodyLetterColor) e.col=G.season.bodyLetterColor;
}
function makeEnemy(ch,lane,z){
  return {ch,disp:dispCh(ch),ans:ansOf(ch),wf:G.isWord?Math.min(2.2,1+(ch.length-1)*.3):1,bl:lane,lane,z,vz:G.speed*(.85+Math.random()*.3),ph:Math.random()*6,
    col:(c=>c[Math.floor(Math.random()*c.length)])(G.season?G.season.colors:CANDY),shake:0,born:G.t,hint:!G.seen.has(ch),
    shoots:false,   // tyypät no longer fire: the sling can't dodge
    fireT:1.5+Math.random()*2,
    pumpkin:!G.plain&&!!(G.season&&G.season.body&&Math.random()<(G.season.bodyChance||0)), seed:Math.floor(Math.random()*99),
    runner:!G.plain&&G.si>0&&Math.random()<Math.min(.3,.08+G.si*.04), dashT:1+Math.random()*2, dash:0, ...personality()};
}
/* Personalities (not on the first, plain levels):
   hider   – walks to a rock, hides behind it and peeks out now and then
   hoarder – grabs a wrong disc, grows and holds it as a shield that takes 3 right hits
   catcher – catches a wrong disc and throws it back in your face */
function personality(){
  if(G.plain||G.isWord&&G.si<3) return {};
  const r=Math.random();
  if(r<.2&&G.rocks.length) return {kind:'hider'};
  if(r<.33) return {kind:'hoarder'};
  if(r<.43) return {kind:'catcher'};
  return {};
}
/* Rocks / walls on the field: discs can't go through them, tyypät walk around or hide behind */
function makeRocks(si){
  if(si<2) return [];
  const n=2+(si>4?1:0), out=[], lanes=[-.7,-.25,.25,.7].sort(()=>Math.random()-.5);
  for(let i=0;i<n;i++) out.push({lane:lanes[i]+(Math.random()-.5)*.1, z:2.3+i*.55+Math.random()*.4, hw:.17+Math.random()*.06, seed:Math.floor(Math.random()*99)});
  return out;
}
function burst(x,y,col,n=20,spd=260){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=spd*(.3+Math.random());
    G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,life:.7+Math.random()*.5,max:1.2,col:Math.random()<.3?'#fff':col,sz:3+Math.random()*5,rot:Math.random()*6,kind:Math.random()<.5?'c':'s'});}
}
function floatText(x,y,txt,col,big){ G.texts.push({x,y,txt,col,life:1.3,big}); }

/* Streak reward: every 5 hits in a row everything slows down for a while */
const ZAP_Z0=1.75, ZAP_Z1=2.25;   // the electric strip (easy only)
function useSlow(){
  if(!G||!G.running||G.tut||!(G.slowCharges>0)||G.slowT>0){ tone(110,.05,'square',.03); return; }
  G.slowCharges--; G.slowT=6; floatText(W/2,H*.4,'HIDASTUS!','#5FD3FF',true);
  [660,520,400,300].forEach((f,i)=>tone(f,.18,'triangle',.08,1,i*.09));
}
function comboReward(x,y){
  // every 5 hits in a row you earn a slow-down charge; use it with the clock button when things get close
  if(G.combo>0&&G.combo%5===0&&(G.slowCharges||0)<2){ G.slowCharges=(G.slowCharges||0)+1; floatText(W/2,H*.4,'HIDASTIN +1','#5FD3FF',true);
    [300,400,520,660].forEach((f,i)=>tone(f,.12,'triangle',.07,1,i*.07)); }
}
/* Personality reactions to a wrong disc */
function grabDisc(e,s){   // hoarder: keeps the disc, grows, and holds it up as a 3-hit shield
  s.dead=true; e.grab=s.lab; e.shieldHp=3; e.grow=0; e.vz=0; e.shake=.3;
  tone(220,.12,'square',.06,1.6); tone(330,.15,'square',.05,1.4,.1); floatText(px(e.lane,e.z),py(e.z)-RB*sc(e.z)*2,'NAM!','#FFB020',false);
}
function shieldHit(e,s){
  s.dead=true; e.shieldHp--; e.shake=.35; e.vz=0; const x=px(e.lane,e.z), y=py(e.z)-RB*sc(e.z);
  burst(x,y,'#C9C3D6',14,260); noise(.1,1800,2,.25); tone(300-e.shieldHp*40,.1,'square',.06,.7);
  if(e.shieldHp<=0){ floatText(x,y-40,'KILPI RIKKI!','#FFFFFF',false); noise(.25,700,1,.35); }
}
function catchDisc(e,s){  // catcher: holds the disc a moment, then throws it back
  s.dead=true; e.held=s.lab; e.throwT=.7; e.vz=0; e.shake=.2; tone(500,.06,'triangle',.06); tone(380,.08,'triangle',.05,1,.06);
}
function throwBack(e){
  if(!G||G.endT>=0) return; const lab=e.held; e.held='';
  G.splat={lab, t:0, x:.3+Math.random()*.4, y:.3+Math.random()*.25, rot:(Math.random()-.5)*.6, from:[px(e.lane,e.z),py(e.z)-RB*sc(e.z)]};
  noise(.2,500,1,.3); tone(140,.25,'sine',.2,.5,.35);
  setTimeout(()=>{ if(G&&G.running){ hurt(Math.round(hpDamage()*.4)); G.shake=reduce?0:.3; sOuch(); } },350);
}
function pop(e,s){
  const s0=sc(e.z), ex=px(e.lane,e.z), ey=py(e.z)-RB*s0;
  G.enemies.splice(G.enemies.indexOf(e),1); s.dead=true;
  G.correct++; G.combo++; G.popped++; prog(); comboReward(ex,ey); G.kills[e.ch]=(G.kills[e.ch]||0)+1; (G.recent=G.recent||[]).push(e.ch);
  const k=Math.max(.6,s0);
  burst(ex,ey,e.col,34,420*k);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+Math.random()*.4, sp=(220+Math.random()*220)*k;
    G.parts.push({chunk:true,x:ex,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-160,life:.9,max:.9,col:e.col,sz:RB*s0*(.22+Math.random()*.18),rot:Math.random()*6});}
  G.parts.push({glyph:true,ch:e.disp,ans:dispAns(e.ans),fi:wordMode()?(G.fi[e.ans]||''):'',col2:s.col,x:ex,y:ey,vx:0,vy:-300,life:.85,max:.85,col:e.col,sz:RB*s0,rot:0});
  // squash, then pop into confetti in the letter's own colour
  G.parts.push({squash:true,ch:e.disp,x:ex,y:ey+RB*s0*.4,sz:RB*s0,col:e.col,life:.16,max:.16,vx:0,vy:0});
  for(let i=0;i<22;i++){ const a=Math.random()*Math.PI*2, sp=(160+Math.random()*320)*k;
    G.parts.push({conf:true,x:ex,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-260,life:1.3+Math.random()*.6,max:1.9,col:i%4?e.col:'#FFFFFF',sz:4+Math.random()*5,rot:Math.random()*6,spin:(Math.random()-.5)*14}); }
  G.parts.push({ring:true,x:ex,y:ey,r:RB*s0,life:.45,max:.45,col:e.col},{ring:true,x:ex,y:ey,r:RB*s0*.6,life:.6,max:.6,col:'#FFD23F'},{flashball:true,x:ex,y:ey,r:RB*s0*1.6,life:.18,max:.18});
  G.flash=.1; G.shake=Math.max(G.shake,reduce?0:.12);
  if(G.combo>=3) floatText(ex,ey-RB*s0-70,`putki ×${G.combo}`,'#FFB800',false);
  for(const o of G.enemies){const d=Math.abs(o.z-e.z)+Math.abs(o.lane-e.lane)*.8; if(d<1.6){o.vz=-1.6*(1-d/1.6)-.2;}}
  G.hitstop=.06; sHit(); sDie(e.ch,G.w.lang); flashBtn('hit'); refreshStacks();
  if(G.assist&&!G.tut&&G.combo>=2&&Math.random()<.6) floatText(ex,ey-RB*s0-40,['JEE!','HIENOA!','SUPER!','JES!','MAHTAVAA!'][Math.floor(Math.random()*5)],'#FFB800',true);

  if(!G.seen.has(e.ch)){G.seen.add(e.ch); save.seen[G.w.id]=[...G.seen]; persist();}
  if(G.popped>=G.goal&&G.phase==='wave') startAlarm();
}
/* ---------- Loppuvastustaja (boss) ---------- */
/* Enemy fire */
function enemyFire(z,lane){ G.bolts.push({z:z-.1,lane,vz:G.speed*2.6+.5,ph:Math.random()*6}); tone(140,.18,'square',.05,.6); }
function updateBolts(dt){
  for(const b of G.bolts){ if(b.dead) continue; b.z-=b.vz*dt;
    if(b.z<=ZCAN+.12){ b.dead=true;
      if(Math.abs(b.lane)<.28){ // hit the sling
        hurt(hpDamage()); G.shake=reduce?0:.35; sOuch();
        burst(W/2,BY+10,'#FF4A2E',22,300);
      } else burst(px(b.lane,ZCAN+.12),py(ZCAN+.12)-10,'#FF8A1E',8,140);
    }
  }
  G.bolts=G.bolts.filter(b=>!b.dead);
}
/* ---------- Guided first game ----------
   Step 0: one tyyppä straight ahead, the cannon already holds its counterpart → tap/space to hit it.
   Step 1: two tyypät, only one matches the cannon → move to it and hit it.
   Then the real wave starts. Shown once per player (save.tutDone); can be replayed from the menu. */
function tutStep(n){
  const T=G.tut; T.step=n; T.t=0; T.done=false; G.enemies=[]; G.phase='tut';
  const L=G.fresh.length?G.fresh:Object.keys(G.w.map);
  const add=(ch,lane,z)=>{ const e=makeEnemy(ch,lane,z); e.frozen=true; e.shoots=false; e.runner=false; e.hint=true; e.pumpkin=false; e.col=CANDY[(G.enemies.length*3+1)%CANDY.length]; G.enemies.push(e); return e; };
  if(n===0){ T.target=add(L[0],0,2.6); }
  else if(n===1){ add(L[2]||L[1],-.5,3.1); T.target=add(L[1],.5,2.6); }
  G.cur=null; refreshStacks();
}
function tutUpdate(dt){
  const T=G.tut; T.t+=dt;
  if(T.step<=1){
    if(!T.done&&!G.enemies.includes(T.target)){ T.done=true; T.t=0; floatText(W/2,H*.3,'JEE!','#FFB800',true); sWin(); G.flash=.12; }
    if(T.done&&T.t>1.4){ if(T.step===0) tutStep(1); else { T.step=2; T.t=0; floatText(W/2,H*.3,'NYT SINÄ!','#FFFFFF',true); } }
  } else if(T.step===2&&T.t>1.2){ G.tut=null; G.enemies=[]; G.phase='wave'; G.spawnT=.3; save.tutDone=true; persist(); }
}
function startAlarm(){ G.phase='alarm'; G.alarmT=2.6; G.plan=planBoss(); G.bossNext=G.plan.name; sAlarm(); }
/* The boss hurls one of its letters (or a level word): it flies in an arc, lands on the road and attacks */
function throwLetter(b){
  const alive=b.segs.filter(g=>g.alive), src=G.isWord?G.fresh:alive.map(g=>g.ch), ch=src[Math.floor(Math.random()*src.length)]; if(!ch) return;
  const fromLane=segLane(b.segs.indexOf(alive[0])||0), toLane=-.7+Math.random()*1.4, e=makeEnemy(ch,toLane,Math.max(ZLOSE+1.2,b.z-1.1));
  e.air=.9; e.airMax=.9; e.fromZ=b.z; e.fromLane=fromLane; e.toZ=e.z; e.lx=fromLane; e.hint=!G.seen.has(ch);
  G.enemies.push(e); noise(.25,900,.6,.18); tone(300,.25,'triangle',.06,.5);
}
/* Decide the boss before the alarm so the warning can show its name */
function planBoss(){
  const w=G.w, names=w.bosses||[], known=new Set(G.fresh.concat(G.older));
  let name='', nameFi='', chosen=[];
  if(G.isWord){
    // word levels: plates are 3 words, the name is just the monster's title
    const pick=names[Math.floor(Math.random()*names.length)]||''; name=Array.isArray(pick)?pick[0]:pick; nameFi=Array.isArray(pick)?pick[1]:'';
    const pool=[...new Set(G.fresh)].sort(()=>Math.random()-.5), seen=new Set();
    for(const ch of pool){ const a=ansOf(ch); if(seen.has(a))continue; seen.add(a); chosen.push(ch); if(chosen.length===3)break; }
  } else {
    // letter levels: the plates spell the monster's name, built only from letters already in play
    const fits=names.filter(n=>typeof n==='string'&&[...n.replace(/ /g,'')].every(c=>known.has(c)));
    if(fits.length){ name=fits[Math.floor(Math.random()*fits.length)]; chosen=[...name.replace(/ /g,'')]; }
    else { const pool=[...known].sort(()=>Math.random()-.5); chosen=pool.slice(0,5); name=chosen.join(''); }
  }
  return {name,nameFi,chosen,nameLat:w.latin?nameFi:toLatin(w,name)};
}
function spawnBoss(){
  const {name,chosen,nameLat}=G.plan||planBoss(), w=G.w;
  const n=chosen.length, segW=Math.min(G.isWord?.7:.44, 1.95/n);
  G.boss={name, nameLat, z:ZF+.4, vz:G.speed*.42, segW, n, shake:0, born:G.t, flash:0,
    col:G.season?'#4A2E6B':'#6B3FA0', segs:chosen.map((ch,i)=>({ch,disp:dispCh(ch),ans:ansOf(ch),alive:true,missT:0,missAns:'',flash:0,
      col:(c=>c[i%c.length])(G.season?G.season.colors:CANDY)}))};
  G.phase='boss'; sRoar(); prog(); nextAmmo();
}
const segLane=(i)=>(i-(G.boss.n-1)/2)*G.boss.segW;
function bossSegAt(lane){ const b=G.boss, i=Math.floor((lane+b.n*b.segW/2)/b.segW); return (i>=0&&i<b.n)?i:-1; }
function hitBossSeg(i,s){
  const b=G.boss, g=b.segs[i], s0=sc(b.z), x=px(segLane(i),b.z), y=py(b.z)-RB*s0*1.3;
  s.dead=true; g.alive=false; g.flash=.4; b.shake=.35; b.vz=-.8;
  G.correct++; G.combo++; G.kills[g.ch]=(G.kills[g.ch]||0)+1;
  burst(x,y,g.col,30,380*Math.max(.6,s0));
  G.parts.push({glyph:true,ch:g.disp,ans:dispAns(g.ans),fi:G.isWord?G.fi[g.ans]:'',x,y,vx:0,vy:-260,life:.9,max:.9,col:g.col,sz:RB*s0,rot:0});
  G.parts.push({ring:true,x,y,r:RB*s0,life:.45,max:.45,col:g.col},{flashball:true,x,y,r:RB*s0*1.4,life:.18,max:.18});
  G.flash=.1; G.shake=Math.max(G.shake,reduce?0:.2); G.hitstop=.08; sHit(); sDie(g.ch,G.w.lang); flashBtn('hit'); prog();
  if(!G.seen.has(g.ch)){G.seen.add(g.ch); save.seen[G.w.id]=[...G.seen]; persist();}
  if(b.segs.every(q=>!q.alive)) bossDown(); else nextAmmo();
}
function bossDown(){
  const b=G.boss, s0=sc(b.z);
  for(let i=0;i<b.n;i++){ const x=px(segLane(i),b.z), y=py(b.z)-RB*s0*(1+Math.random()*2);
    burst(x,y,b.col,40,520*Math.max(.6,s0));
    for(let k=0;k<6;k++) G.parts.push({chunk:true,x,y,vx:(Math.random()-.5)*700,vy:-300-Math.random()*400,life:1.2,max:1.2,col:k%2?b.col:'#2B2333',sz:RB*s0*(.3+Math.random()*.3),rot:0}); }
  G.parts.push({flashball:true,x:px(0,b.z),y:py(b.z)-RB*s0*2,r:RB*s0*4,life:.35,max:.35});
  G.bossName=b.name; G.boss=null; G.flash=.3; G.shake=reduce?0:.6; sBossDown();
  // the boss releases themed words: they burst out and attack as a last wave that must be destroyed too
  const list=(G.season&&G.season.rewards&&G.season.rewards[G.w.id])||G.w.rewards||[];
  G.loot=[...list].sort(()=>Math.random()-.5).slice(0,3).map(([word,fi,lat])=>({word,disp:dispCh(word),fi,lat:G.w.latin?'':(lat||toLatin(G.w,word))}));
  if(!G.loot.length){ G.phase='done'; if(G.endT<0) G.endT=1.8; return; }
  G.phase='loot'; G.lootMode=true;
  G.loot.forEach((l,i)=>{
    const ans=G.w.latin?l.fi:l.lat; G.fi[ans]=G.w.latin?'':l.fi;
    G.enemies.push({ch:l.word,disp:l.disp,ans,loot:true,wf:Math.min(2.2,1+(l.word.length-1)*.3),bl:(i-1)*.7,lane:(i-1)*.7,z:b.z+.3+i*.6,
      vz:-1.5,ph:Math.random()*6,col:(c=>c[i%c.length])(G.season?G.season.colors:CANDY),shake:0,born:G.t,hint:true,fireT:9,seed:i});
  });
  nextAmmo();
}
function bossReachedLine(){
  const b=G.boss; (G.leaks=G.leaks||[]).push(...b.segs.filter(g=>g.alive).map(g=>g.ch).slice(0,1)); hurt(hpDamage()*1.5); G.shake=reduce?0:.5; sRoar();
  b.z=ZLOSE+1.8; b.vz=-1; b.shake=.5;
  floatText(W/2,H*.35,'AUTS!','#E63E78',true);
}
function hitLine(e){
  const ex=px(e.lane,e.z), ey=py(e.z)-RB*sc(e.z);
  G.enemies.splice(G.enemies.indexOf(e),1); (G.leaks=G.leaks||[]).push(e.ch);
  hurt(hpDamage()); G.shake=reduce?0:.35; sOuch();
  burst(ex,ey,e.col,16,200);
  floatText(Math.min(Math.max(ex,80),W-80),ey-30,`${e.ch} = ${e.ans}`,'#E63E78',true);
}

function update(dt){
  G.t+=dt;
  clouds.forEach(c=>{c.x+=c.v*dt; if(c.x>1.2)c.x=-.25});
  G.recoil=Math.max(0,G.recoil-dt*6); G.emT=Math.max(0,(G.emT||0)-dt); G.wind=Math.max(0,(G.wind||0)-dt); G.reload=Math.min(1,G.reload+dt*7);
  if(G.keys.ArrowLeft) G.aimA=(G.aimA||0)-1.1*dt; if(G.keys.ArrowRight) G.aimA=(G.aimA||0)+1.1*dt;
  G.aimA=Math.max(-1.1,Math.min(1.1,G.aimA||0));
  G.shake=Math.max(0,G.shake-dt); G.flash=Math.max(0,(G.flash||0)-dt);
  // road + roadside scenery drift toward the player
  const drift=0; G.scroll+=drift;   // you stand still and defend: the ground does not move
  for(const d of G.deco){d.z-=drift; if(d.z<ZN*.7){d.z+=ZF*1.6;d.k=Math.random();}}
  if(G.endT>=0){G.endT-=dt; if(G.endT<0){endCard(!G.lose);return;}}
  if(!G.running) return;
  G.playT+=dt;
  G.quietT+=dt; if(G.quietT>HP_QUIET&&G.hp<100&&G.endT<0){ G.hp=Math.min(100,G.hp+HP_REGEN*dt); }
  drawHearts();
  if(G.hp<30&&G.endT<0){ G.beatT=(G.beatT||0)-dt; if(G.beatT<=0){ G.beatT=.9; tone(55,.12,'sine',.25); tone(50,.1,'sine',.18,1,.18); } }
  // tempo: ~7 s calm, ~3 s surge where tyypät come faster and closer together
  G.tempoT=(G.tempoT||0)+dt; const cyc=G.tempoT%10; G.surge=(G.phase==='wave'&&cyc>7)?1.6:1;
  if(G.hitstop>0){G.hitstop-=dt;return}
  if(G.cool>0){ G.cool-=dt; if(G.cool<=0){ G.cool=0; G.reload=.4; tone(523,.06,'sine',.05); } }
  const n=G.enemies.length;
  G.spawnT-=dt;
  if(G.tut) tutUpdate(dt);
  if(G.phase==='alarm'){ G.alarmT-=dt; if(G.alarmT<=0) spawnBoss(); }
  if(G.phase==='loot'&&!G.enemies.some(e=>e.loot)&&G.endT<0){ G.phase='done'; G.endT=1.2; }
  if(G.phase==='wave' && G.spawnT<=0 && n<G.maxOn && G.popped+n<G.goal+2 && G.endT<0){
    spawn(); const fill=n/G.maxOn; G.spawnT=(fill<.25?.6:fill<.5?1.5:2.7)/(1+G.li*.1)/G.pace/G.surge;
  }
  refreshStacks();
  const boost=(n<=1?1.5:1)*((G.slowT=Math.max(0,(G.slowT||0)-dt))>0?.4:1);
  const zap=save.diff==='easy';   // easy: an electric strip near the line slows tyypät to a crawl
  for(const e of [...G.enemies]){
    if(e.frozen){ e.lane=e.bl; e.shake=Math.max(0,e.shake-dt); e.shield=Math.max(0,(e.shield||0)-dt); e.missT=Math.max(0,(e.missT||0)-dt); if(e.block>0)e.block-=dt; continue; }
    if(e.air>0){ e.air-=dt; const k=1-Math.max(0,e.air)/e.airMax; e.z=e.fromZ+(e.toZ-e.fromZ)*k; e.lane=e.lx=e.fromLane+(e.bl-e.fromLane)*k; e.lift=Math.sin(k*Math.PI); continue; }
    e.lift=0;
    let want=G.speed*boost*G.surge;
    if(e.runner){ // sprint in bursts and hop to another lane before it
      e.dashT-=dt; if(e.dashT<=0){ e.dash=.55; e.dashT=1.6+Math.random()*1.8; e.bl=Math.max(-.75,Math.min(.75,e.bl+(Math.random()<.5?-1:1)*(.3+Math.random()*.3))); }
      if(e.dash>0){ e.dash-=dt; want=G.speed*4.5; }
    }
    // hiders: go to a rock, crouch behind it, peek out, then come round it
    if(e.kind==='hider'&&!e.hidDone){
      const rk=e.rock||(e.rock=[...G.rocks].filter(r=>r.z<e.z-.3).sort((a,b)=>Math.abs(a.lane-e.bl)-Math.abs(b.lane-e.bl))[0]);
      if(!rk) e.hidDone=true;
      else if(e.z<rk.z+1.4){ e.bl=rk.lane;
        if(e.z<=rk.z+.16){ e.z=rk.z+.16; want=0; e.vz=0; e.hideT=(e.hideT??(3+Math.random()*3))-dt;
          e.peekT=(e.peekT??1.2)-dt; if(e.peekT<=0){ e.peekT=1.6+Math.random()*1.4; e.peek=.8; e.peekSide=Math.random()<.5?-1:1; }
          if(e.peek>0){ e.peek-=dt; e.bl=rk.lane+e.peekSide*(rk.hw+.13); }
          if(e.hideT<=0){ e.hidDone=true; e.bl=rk.lane+(Math.random()<.5?-1:1)*(rk.hw+.2); } } }
    } else if(G.rocks.length){ // everyone else walks round the rocks
      for(const rk of G.rocks) if(e.z>rk.z&&e.z-rk.z<.9&&Math.abs(e.bl-rk.lane)<rk.hw+.12) e.bl=rk.lane+(e.bl<rk.lane?-1:1)*(rk.hw+.16);
    }
    if(e.block>0){e.block-=dt; e.vz=0;} else e.vz+=(want-e.vz)*Math.min(1,dt*(e.runner?4:1.5));
    if(zap&&e.z<ZAP_Z1&&e.z>ZAP_Z0){ e.vz=Math.min(e.vz,G.speed*.3); e.dash=0; if(!e.zapped){ e.zapped=true; noise(.12,3000,2,.08); tone(900,.05,'square',.03,.5); } }
    e.z-=e.vz*dt; if(e.z>ZF+.6)e.z=ZF+.6;
    // no overtaking: a tyyppä stays behind one that overlaps it in the same lane, so the front one is always the one you hit
    if(!e.air) for(const o of G.enemies){ if(o===e||o.air||o.z>=e.z+.001) continue;
      const wid=((o.hw||RB*.6*sc(o.z))/lw(o.z)+(e.hw||RB*.6*sc(e.z))/lw(e.z))*.85, gap=G.isWord||G.lootMode?.5:.38;
      if(Math.abs((o.lx??o.lane)-(e.lx??e.lane))<wid&&e.z-o.z<gap){ e.z=o.z+gap; e.vz=Math.min(e.vz,o.vz); } }
    e.lx=e.lx??e.bl; e.lx+=(e.bl-e.lx)*Math.min(1,dt*(e.runner||e.kind==='hider'?6:2));
    if(e.grow<1) e.grow=Math.min(1,e.grow+dt*2);
    if(e.throwT>0){ e.throwT-=dt; if(e.throwT<=0) throwBack(e); }
    e.lane=e.lx+Math.sin(G.t*1.3+e.ph)*.05;
    e.shake=Math.max(0,e.shake-dt); e.shield=Math.max(0,(e.shield||0)-dt); e.missT=Math.max(0,(e.missT||0)-dt);
    if(e.shoots&&e.z<ZF-.6&&e.z>2){ e.fireT-=dt; if(e.fireT<=0){ enemyFire(e.z,e.lane); e.fireT=3+Math.random()*2; } }
    if(e.z<=ZLOSE) hitLine(e);
  }
  if(G.boss){ const b=G.boss;
    b.vz+=(G.speed*.42*(G.slowT>0?.4:1)-b.vz)*Math.min(1,dt*.8); b.z-=b.vz*dt; if(b.z>ZF+.6)b.z=ZF+.6;
    b.shake=Math.max(0,b.shake-dt); b.segs.forEach(g=>{g.missT=Math.max(0,g.missT-dt); g.flash=Math.max(0,g.flash-dt);});
    b.fireT=(b.fireT??2)-dt;
    if(b.fireT<=0&&b.z<ZF){ const alive=b.segs.map((g,i)=>g.alive?i:-1).filter(i=>i>=0);
      throwLetter(b);   // the boss only hurls its letters at you
      b.fireT=(2.4+Math.random()*1.2)/G.pace; }
    if(b.z<=ZLOSE+.15) bossReachedLine(); }
  updateBolts(dt); G.hurt=Math.max(0,G.hurt-dt);
  const LT=RB*.9/HW;
  // a hit counts as soon as the shot's edge touches the tyyppä's edge (sizes measured on screen)
  const hitW=e=>{ if(!e.hw) return LT*e.wf; const s0=sc(e.z), r=wordMode()?Math.max(22,RB*.62*s0*1.4)*1.1:Math.max(14,RB*.62*s0);
    return (e.hw*(s0/(e.hs||s0))+r)/lw(e.z); };
  for(const s of G.shots){
    if(s.bounced){s.trail.push([s.sx,s.sy,s.r]); if(s.trail.length>7)s.trail.shift();
      s.sx+=s.vx*dt;s.sy+=s.vy*dt;s.vy+=1100*dt;s.spin+=s.vx*.02*dt;s.r=Math.min(RB*.75,s.r*(1+dt*1.6));s.life-=dt;continue;}
    const z0=s.z; s.z+=s.vz*dt;
    { const [l]=rawLane(s,s.z), b=bounceNo(l); s.lane=foldLane(l);
      if(b!==(s.bn||0)){ s.bn=b; const [bx,by]=shotXY(s,s.z); burst(bx,by,'#FFFFFF',8,160); tone(420+Math.random()*80,.06,'square',.05,.7); noise(.04,2500,3,.12); } }
    // any disc knocks an incoming red bolt out of the air
    { const bo=G.bolts.find(b=>!b.dead&&Math.abs(b.z-s.z)<.18&&Math.abs(b.lane-s.lane)<.2);
      if(bo){ bo.dead=true; s.dead=true; const [bx,by]=shotXY(s,s.z); burst(bx,by,'#FF8A1E',16,240); G.parts.push({ring:true,x:bx,y:by,r:RB*sc(s.z)*.6,life:.35,max:.35,col:'#FFD21E'}); tone(500,.1,'square',.05,.5); continue; } }
    if(G.boss&&G.boss.z>z0-.2&&G.boss.z<s.z+.2){ const b=G.boss, i=bossSegAt(s.lane);
      if(i>=0&&b.segs[i].alive){ const g=b.segs[i];
        if(g.ans===s.ans){ hitBossSeg(i,s); continue; }
        const s0=sc(b.z); s.bounced=true; s.sx=px(s.lane,b.z); s.sy=py(b.z)-RB*s0*1.3; s.r=RB*.45*s0; s.trail=[]; s.spin=0; s.life=1.1;
        s.vx=(s.sx<W/2?-1:1)*(260+Math.random()*140); s.vy=-420-Math.random()*120;
        g.missAns=s.lab; g.missT=.8; g.flash=.25; b.shake=.3; G.hitstop=.05; G.combo=0;
        G.parts.push({clang:true,x:s.sx,y:s.sy,life:.3,max:.3,r:RB*s0}); sClank(); flashBtn('miss'); continue; }
    }
    const rock=G.rocks.filter(r=>r.z>z0-.05&&r.z<s.z+.05&&Math.abs(s.lane-r.lane)<r.hw).sort((a,b)=>a.z-b.z)[0];
    let hitE=false;
    for(const e of [...G.enemies].sort((a,b)=>a.z-b.z)){   // nearest first: the shot meets the front one
      if(rock&&e.z>rock.z) break;
      if(e.z>z0-.15&&e.z<s.z+.15&&Math.abs(s.lane-e.lane)<hitW(e)){ hitE=true;
        if(e.shieldHp>0&&s.ans===e.ans){ shieldHit(e,s); }
        else if(s.ans===e.ans){pop(e,s);}
        else if(e.kind==='hoarder'&&!e.grab){ grabDisc(e,s); }
        else if(e.kind==='catcher'&&!(e.throwT>0)){ catchDisc(e,s); }
        else{ // bounce off in screen space
          const s0=sc(e.z); s.bounced=true; s.sx=px(e.lane,e.z); s.sy=py(e.z)-RB*s0*1.2; s.r=RB*.45*s0; s.trail=[]; s.spin=0; s.life=1.1;
          const dir=s.sx<W/2?-1:1; s.vx=dir*(260+Math.random()*140); s.vy=-420-Math.random()*120;
          e.shield=.35; e.block=.75; e.vz=0; G.hitstop=.05;
          G.parts.push({clang:true,x:s.sx,y:s.sy,life:.3,max:.3,r:RB*s0}); e.shake=.4; G.combo=0; sClank(); flashBtn('miss');
          e.missAns=s.lab; e.missT=.7;
        }
        break;
      }
    }
    if(rock&&!hitE&&!s.dead){ s.dead=true; const [x,y]=shotXY(s,rock.z); burst(x,y,'#9A9AA4',12,200); noise(.08,900,1.5,.2); tone(160,.08,'square',.05,.6); }
  }
  G.shots=G.shots.filter(s=>!s.dead&&(s.bounced?s.life>0:s.z<ZF+1));
  if(G.splat){ G.splat.t+=dt; if(G.splat.t>2.6) G.splat=null; }
  for(const p of G.parts){p.life-=dt; if(p.conf){ p.vy+=380*dt; p.vx*=1-dt*1.8; p.vy=Math.min(p.vy,160); p.x+=p.vx*dt+Math.sin(p.life*7+p.rot)*30*dt; p.y+=p.vy*dt; p.rot+=p.spin*dt; continue; }
    if(!p.ring&&!p.clang&&!p.flashball&&!p.squash){p.vy+=600*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*8;}}
  G.parts=G.parts.filter(p=>p.life>0);
  for(const t of G.texts){t.life-=dt;t.y-=40*dt;}
  G.texts=G.texts.filter(t=>t.life>0);
  for(const p of G.pairs){p.life-=dt;p.y-=(p.ok?34:20)*dt;}
  G.pairs=G.pairs.filter(p=>p.life>0);
  for(const m of G.muzzle)m.life-=dt; G.muzzle=G.muzzle.filter(m=>m.life>0);
}
