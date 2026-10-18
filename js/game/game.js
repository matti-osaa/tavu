/* Game rules: level setup, ammo, spawning, hits and misses, the update loop. */
function startLevel(wi,si){
  const w=WORLDS[wi], stage=stagesOf(w)[si], li=stage.li, isWord=stage.kind==='words';
  const fresh=isWord?w.words[li].map(p=>p[0]):[...w.levels[li]], older=isWord?[]:w.levels.slice(0,li).join('').split('');
  G={w,wi,si,li,key:stage.key,phase:'wave',boss:null,alarmT:0,bolts:[],hurt:0,playT:0,didMove:false,didFire:false,fresh,older,enemies:[],shots:[],parts:[],texts:[],ammo:[],sel:0,lane:0,tlane:0,lives:diff().lives,maxLives:diff().lives,pace:diff().pace,popped:0,
     goal:14+li*3,maxOn:4+li,speed:.5+li*.08,fired:0,correct:0,combo:0,spawnT:.4,t:0,running:false,hitstop:0,shake:0,cool:0,reload:1,recoil:0,
     season:activeSeason(),isWord,fiOf:isWord?Object.fromEntries(w.words[li].map(p=>[p[0],p[1]])):{},
     fi:isWord?Object.fromEntries(w.words[li].map(p=>w.latin?[p[1],'']:[toLatin(w,p[0]),p[1]])):{},
     keys:{},seen:seenSet(w.id),endT:-1,scroll:0,pairs:[],muzzle:[],
     deco:Array.from({length:10},(_,i)=>({z:ZN*.75+i*(ZF*1.6/10),side:i%2?1:-1,k:Math.random()}))};
  if(isWord){G.goal=10+li*2;G.maxOn=3+li;G.speed=.4+li*.05;}
  G.speed*=G.pace;
  $('map').hidden=true; $('game').hidden=false; resize();
  G.cur=null; G.curCol=CANDY[0];
  buildAmmo(); drawHearts(); prog();
  showIntro();
  cancelAnimationFrame(raf); last=performance.now(); raf=requestAnimationFrame(loop);
}
function buildAmmo(){
  const ARW=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  ammoEl.innerHTML=`<button class="arrow" id="bl" style="--c:#7E6A96;--d:#584670" aria-label="Siirrä vasemmalle">${ARW('M15 5l-7 7 7 7')}</button>
    <button class="fire" id="bf" aria-label="Ammu"><small>Ammu</small><span class="t">…</span></button>
    <button class="arrow" id="br" style="--c:#7E6A96;--d:#584670" aria-label="Siirrä oikealle">${ARW('M9 5l7 7-7 7')}</button>`;
  const hold=(id,key)=>{const b=$(id);
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(G)G.keys[key]=true;});
    ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{if(G)G.keys[key]=false;}));};
  hold('bl','ArrowLeft'); hold('br','ArrowRight');
  $('bf').addEventListener('pointerdown',e=>{e.preventDefault();fire();});
  paintFire();
}
const ansOf=ch=>G.isWord?(G.w.latin?G.fiOf[ch]:toLatin(G.w,ch)):G.w.map[ch];
function paintFire(){const b=$('bf'); if(!b)return; b.style.setProperty('--c',G.curCol); b.style.setProperty('--d',shade(G.curCol,-60));
  const t=b.querySelector('.t'); t.textContent=G.cur?dispAns(G.cur):'…';
  if(G.isWord&&G.cur){const i=document.createElement('i'); i.textContent=G.fi[G.cur]; t.appendChild(i);} b.classList.remove('swap'); void b.offsetWidth; b.classList.add('swap');}
// The cannon holds one fixed answer. It changes only after a hit, or if no candy on the road matches it any more.
// ↑/↓ or tapping the loaded cube cycles through the answers of the tyypät on the road, nearest first
// Everything the cannon could aim at: tyypät and the boss's remaining plates
function targets(){
  const t=G.enemies.map(e=>({ans:e.ans,z:e.z}));
  if(G.boss) G.boss.segs.forEach(g=>{ if(g.alive) t.push({ans:g.ans,z:G.boss.z}); });
  return t;
}
function switchAmmo(dir=1){
  if(!G||!G.running)return; audio();
  const list=[]; targets().filter(e=>e.z<ZF+.5).sort((a,b)=>a.z-b.z).forEach(e=>{if(!list.includes(e.ans))list.push(e.ans);});
  if(!list.length||(list.length===1&&list[0]===G.cur)){tone(150,.1,'sine',.08);return;}
  const i=list.indexOf(G.cur), next=i<0?list[0]:list[(i+dir+list.length)%list.length];
  G.cur=next; let col; do{col=CANDY[Math.floor(Math.random()*CANDY.length)]}while(col===G.curCol); G.curCol=col; G.reload=0; paintFire();
  tone(dir>0?262:330,.08,'sine',.1,1.3); tone(dir>0?392:247,.1,'sine',.08,1,.06);
}
function nextAmmo(){
  const all=targets(), vis=all.filter(e=>e.z<ZF-.25), from=vis.length?vis:all;
  if(!from.length){G.cur=null;paintFire();return;}
  const others=from.filter(e=>e.ans!==G.cur), pick=(others.length?others:from)[Math.floor(Math.random()*(others.length?others:from).length)];
  G.cur=pick.ans; let c; do{c=CANDY[Math.floor(Math.random()*CANDY.length)]}while(c===G.curCol); G.curCol=c; G.reload=0; paintFire();
}
const HEART='<svg viewBox="0 0 9 8" shape-rendering="crispEdges"><path fill="#2B2333" d="M1 0h3v1h1V0h3v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"/><path fill="#F23C5A" d="M1 1h2v1h1v1h1V2h1V1h2v3H7v1H6v1H5v1H4V6H3V5H2V4H1z"/><path fill="#FF9AAA" d="M1 1h1v1H1z"/></svg>';
function drawHearts(){ $('hearts').innerHTML=Array.from({length:G.maxLives},(_,i)=>HEART.replace('<svg',`<svg class="${i<G.lives?'':'lost'}"`)).join(''); }
function prog(){ const b=$('progbar');
  if(G.boss){ const a=G.boss.segs.filter(g=>g.alive).length; b.style.width=(a/G.boss.segs.length*100)+'%'; b.classList.add('boss'); }
  else { b.style.width=Math.min(100,G.popped/G.goal*100)+'%'; b.classList.remove('boss'); } }

function showIntro(){
  const w=G.w, unseen=G.fresh.filter(c=>!G.seen.has(c));
  const show=(unseen.length?unseen:G.fresh);
  ov.innerHTML=`<div class="overlay"><div class="card">
    <div><div style="font-weight:900;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft)">${w.script} · taso ${G.si+1}${G.isWord?' · sanat':''}</div>
    <h3>${G.isWord?'Sanatyypät hyökkäävät!':unseen.length?'Uudet tyypät hyökkäävät!':'Tyypät hyökkäävät!'}</h3></div>
    <div class="tiles">${show.map((c,i)=>`<div class="tile" style="--c:${CANDY[i%CANDY.length]}"><b>${introCh(c)}</b><span>${dispAns(ansOf(c))}</span>${G.isWord?`<em>${G.fi[ansOf(c)]}</em>`:''}</div>`).join('')}</div>
    <p>${G.w.latin?'Ammu suomenkielisiä sanoja. Ne tehoavat, kun ne tarkoittavat samaa kuin vieras tyyppä.':G.isWord?'Ammu tuttuja sanoja. Ne tehoavat, kun ne vastaavat vierasta tyyppää.':'Ammu tuttuja kirjaimia. Ne tehoavat, kun ne vastaavat vierasta tyyppää.'} Väistä punaiset ammukset.
    <span class="touch-hint">Vedä: liiku · Napauta kuutiota: ammu · Pyyhkäise kuutiota: vaihda</span>
    <span class="keys-hint">← →: liiku · välilyönti: ammu · ↑ ↓: vaihda</span></p>
    <div class="row"><button class="btn" id="go">Aloita</button></div></div></div>`;
  $('go').onclick=()=>{audio(); ov.innerHTML=''; G.running=true;};
}
function endCard(win){
  G.running=false;
  const lost=G.maxLives-G.lives, acc=G.fired?G.correct/G.fired:0;
  let stars=0; if(win){stars=1; if(lost<=1&&acc>=.6)stars=2; if(lost===0&&acc>=.85)stars=3;}
  const k=G.key; if(stars>(save.stars[k]||0)){save.stars[k]=stars;persist();}
  const hasNext=win&&G.si+1<stagesOf(G.w).length;
  if(win) sWin();
  ov.innerHTML=`<div class="overlay"><div class="card">
    <h3>${win?'Loppuvastustaja kaatui!':'Tyypät pääsivät läpi'}</h3>
    ${win?`<div class="big-stars">${[0,1,2].map(i=>`<i class="${i<stars?'on':''}"></i>`).join('')}</div>`:''}
    ${win&&G.loot&&G.loot.length?`<div class="loot">${G.loot.map(l=>`<div><b>${l.word}</b>${l.lat?` <span>${l.lat}</span>`:''} = ${l.fi}</div>`).join('')}</div>`:''}
    <p>${G.correct} osumaa · tarkkuus ${Math.round(acc*100)} %</p>
    <div class="row">${hasNext?'<button class="btn" id="nx">Seuraava taso</button>':''}
    <button class="btn ${hasNext?'alt':''}" id="rt">${win?'Pelaa uudelleen':'Yritä uudelleen'}</button>
    <button class="btn alt" id="mp">Kartta</button></div></div></div>`;
  if(hasNext) $('nx').onclick=()=>startLevel(G.wi,G.si+1);
  $('rt').onclick=()=>startLevel(G.wi,G.si);
  $('mp').onclick=toMap;
}
function toMap(){ cancelAnimationFrame(raf); G=null; ov.innerHTML=''; $('game').hidden=true; $('map').hidden=false; renderMap(); }
$('back').onclick=toMap;

/* spawn: random letters from this level's pool, new letters weighted up */
function pickLetter(){
  // now and then a random letter from the whole alphabet, even ones not taught yet
  if(!G.isWord&&Math.random()<.14){ const all=Object.keys(G.w.map); return all[Math.floor(Math.random()*all.length)]; }
  const pool=[]; G.fresh.forEach(c=>pool.push(c,c,c)); G.older.forEach(c=>pool.push(c));
  return pool[Math.floor(Math.random()*pool.length)];
}
function spawn(){
  const ch=pickLetter(); if(!ch)return;
  let lane=0; for(let k=0;k<10;k++){lane=G.isWord?-.55+Math.random()*1.1:-.72+Math.random()*1.44; if(G.enemies.every(e=>Math.abs(e.bl-lane)>(G.isWord?.75:.4)||e.z<ZF-1.4))break;}
  G.enemies.push({ch,disp:dispCh(ch),ans:ansOf(ch),wf:G.isWord?Math.min(2.2,1+(ch.length-1)*.3):1,bl:lane,lane,z:ZF,vz:G.speed*(.85+Math.random()*.3),ph:Math.random()*6,
    col:(c=>c[Math.floor(Math.random()*c.length)])(G.season?G.season.colors:CANDY),shake:0,born:G.t,hint:!G.seen.has(ch),
    shoots:G.si>0&&Math.random()<Math.min(.35,.1+G.si*.05), fireT:1.5+Math.random()*2,
    pumpkin:!!(G.season&&G.season.body&&Math.random()<(G.season.bodyChance||0)), seed:Math.floor(Math.random()*99)});
  const e=G.enemies[G.enemies.length-1]; if(e.pumpkin&&G.season.bodyLetterColor) e.col=G.season.bodyLetterColor;
}
function fire(i){
  if(!G||!G.running)return; audio();
  if(G.cool>0||!G.cur)return;
  const b=$('bf'); b.classList.add('press'); setTimeout(()=>b.classList.remove('press'),90);
  const z0=ZCAN+.05, u=Math.max(30,RB*.75), cubeY=BY+6-u*1.8-u*1.5*.5-4;
  G.shots.push({E0:(py(z0)-cubeY)/sc(z0),z0,lane:G.lane,z:z0,vz:1.15,ans:G.cur,lab:dispAns(G.cur),col:G.curCol,bounced:false,vx:0,sx:0,sy:0,vy:0,life:1});
  G.didFire=true; G.fired++; G.cool=.3; G.recoil=1; G.reload=0; sPew();
  G.muzzle.push({ans:dispAns(G.cur),col:G.curCol,life:.45,max:.45});
}
function burst(x,y,col,n=20,spd=260){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=spd*(.3+Math.random());
    G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,life:.7+Math.random()*.5,max:1.2,col:Math.random()<.3?'#fff':col,sz:3+Math.random()*5,rot:Math.random()*6,kind:Math.random()<.5?'c':'s'});}
}
function floatText(x,y,txt,col,big){ G.texts.push({x,y,txt,col,life:1.3,big}); }

function pop(e,s){
  const s0=sc(e.z), ex=px(e.lane,e.z), ey=py(e.z)-RB*s0;
  G.enemies.splice(G.enemies.indexOf(e),1); s.dead=true;
  G.correct++; G.combo++; G.popped++; prog();
  const k=Math.max(.6,s0);
  burst(ex,ey,e.col,34,420*k);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+Math.random()*.4, sp=(220+Math.random()*220)*k;
    G.parts.push({chunk:true,x:ex,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-160,life:.9,max:.9,col:e.col,sz:RB*s0*(.22+Math.random()*.18),rot:Math.random()*6});}
  G.parts.push({glyph:true,ch:e.disp,ans:dispAns(e.ans),fi:G.isWord?G.fi[e.ans]:'',col2:s.col,x:ex,y:ey,vx:0,vy:-300,life:.85,max:.85,col:e.col,sz:RB*s0,rot:0});
  G.parts.push({ring:true,x:ex,y:ey,r:RB*s0,life:.45,max:.45,col:e.col},{ring:true,x:ex,y:ey,r:RB*s0*.6,life:.6,max:.6,col:'#FFD23F'},{flashball:true,x:ex,y:ey,r:RB*s0*1.6,life:.18,max:.18});
  G.flash=.1; G.shake=Math.max(G.shake,reduce?0:.12);
  if(G.combo>=3) floatText(ex,ey-RB*s0-70,`putki ×${G.combo}`,'#FFB800',false);
  for(const o of G.enemies){const d=Math.abs(o.z-e.z)+Math.abs(o.lane-e.lane)*.8; if(d<1.6){o.vz=-1.6*(1-d/1.6)-.2;}}
  G.hitstop=.06; sHit(); flashBtn('hit'); nextAmmo();

  if(!G.seen.has(e.ch)){G.seen.add(e.ch); save.seen[G.w.id]=[...G.seen]; persist();}
  if(G.popped>=G.goal&&G.phase==='wave') startAlarm();
}
/* ---------- Loppuvastustaja (boss) ---------- */
/* Enemy fire */
function enemyFire(z,lane){ G.bolts.push({z:z-.1,lane,vz:G.speed*2.6+.5,ph:Math.random()*6}); tone(140,.18,'square',.05,.6); }
function updateBolts(dt){
  for(const b of G.bolts){ b.z-=b.vz*dt;
    if(b.z<=ZCAN+.12){ b.dead=true;
      if(Math.abs(b.lane-G.lane)<.2){ // hit the cannon
        G.lives--; G.combo=0; drawHearts(); G.hurt=.35; G.shake=reduce?0:.35; sOuch();
        burst(px(G.lane,ZCAN),BY-RB*.8,'#FF4A2E',22,300);
        if(G.lives<=0&&G.endT<0){G.endT=1.1;G.lose=true;}
      } else burst(px(b.lane,ZCAN+.12),py(ZCAN+.12)-10,'#FF8A1E',8,140);
    }
  }
  G.bolts=G.bolts.filter(b=>!b.dead);
}
function startAlarm(){ G.phase='alarm'; G.alarmT=2.6; sAlarm(); }
function spawnBoss(){
  // letters: 5 plates from this level's letters; words: 3 plates with words
  const pool=[...new Set(G.isWord?G.fresh:G.fresh.concat(G.older))].sort(()=>Math.random()-.5);
  const seen=new Set(), chosen=[];
  for(const ch of pool){ const a=ansOf(ch); if(seen.has(a))continue; seen.add(a); chosen.push(ch); if(chosen.length===(G.isWord?3:5))break; }
  const n=chosen.length, segW=Math.min(G.isWord?.7:.44, 1.95/n);
  G.boss={z:ZF+.4, vz:G.speed*.42, segW, n, shake:0, born:G.t, flash:0,
    col:G.season?'#4A2E6B':'#6B3FA0', segs:chosen.map((ch,i)=>({ch,disp:dispCh(ch),ans:ansOf(ch),alive:true,missT:0,missAns:'',flash:0,
      col:(c=>c[i%c.length])(G.season?G.season.colors:CANDY)}))};
  G.phase='boss'; sRoar(); prog(); nextAmmo();
}
const segLane=(i)=>(i-(G.boss.n-1)/2)*G.boss.segW;
function bossSegAt(lane){ const b=G.boss, i=Math.floor((lane+b.n*b.segW/2)/b.segW); return (i>=0&&i<b.n)?i:-1; }
function hitBossSeg(i,s){
  const b=G.boss, g=b.segs[i], s0=sc(b.z), x=px(segLane(i),b.z), y=py(b.z)-RB*s0*1.3;
  s.dead=true; g.alive=false; g.flash=.4; b.shake=.35; b.vz=-.8;
  G.correct++; G.combo++;
  burst(x,y,g.col,30,380*Math.max(.6,s0));
  G.parts.push({glyph:true,ch:g.disp,ans:dispAns(g.ans),fi:G.isWord?G.fi[g.ans]:'',x,y,vx:0,vy:-260,life:.9,max:.9,col:g.col,sz:RB*s0,rot:0});
  G.parts.push({ring:true,x,y,r:RB*s0,life:.45,max:.45,col:g.col},{flashball:true,x,y,r:RB*s0*1.4,life:.18,max:.18});
  G.flash=.1; G.shake=Math.max(G.shake,reduce?0:.2); G.hitstop=.08; sHit(); flashBtn('hit'); prog();
  if(!G.seen.has(g.ch)){G.seen.add(g.ch); save.seen[G.w.id]=[...G.seen]; persist();}
  if(b.segs.every(q=>!q.alive)) bossDown(); else nextAmmo();
}
function bossDown(){
  const b=G.boss, s0=sc(b.z);
  for(let i=0;i<b.n;i++){ const x=px(segLane(i),b.z), y=py(b.z)-RB*s0*(1+Math.random()*2);
    burst(x,y,b.col,40,520*Math.max(.6,s0));
    for(let k=0;k<6;k++) G.parts.push({chunk:true,x,y,vx:(Math.random()-.5)*700,vy:-300-Math.random()*400,life:1.2,max:1.2,col:k%2?b.col:'#2B2333',sz:RB*s0*(.3+Math.random()*.3),rot:0}); }
  G.parts.push({flashball:true,x:px(0,b.z),y:py(b.z)-RB*s0*2,r:RB*s0*4,life:.35,max:.35});
  G.boss=null; G.flash=.3; G.shake=reduce?0:.6; sBossDown(); G.phase='done'; G.cur=null; paintFire();
  // the boss releases themed words: they fly out and hover, and are listed on the end card
  const list=(G.season&&G.season.rewards&&G.season.rewards[G.w.id])||G.w.rewards||[];
  G.loot=[...list].sort(()=>Math.random()-.5).slice(0,3).map(([word,fi,lat],i)=>({word:dispCh(word),fi,lat:G.w.latin?'':(lat||toLatin(G.w,word)),
    x:px(0,b.z),y:py(b.z)-RB*s0*2,tx:W*(.25+i*.25),ty:H*(.22+(i%2)*.12),t:0}));
  if(G.endT<0) G.endT=3.4;
}
function bossReachedLine(){
  const b=G.boss; G.lives--; G.combo=0; drawHearts(); G.shake=reduce?0:.5; sRoar();
  b.z=ZLOSE+1.8; b.vz=-1; b.shake=.5;
  floatText(W/2,H*.35,'AUTS!','#E63E78',true);
  if(G.lives<=0&&G.endT<0){G.endT=1.1;G.lose=true;}
}
function hitLine(e){
  const ex=px(e.lane,e.z), ey=py(e.z)-RB*sc(e.z);
  G.enemies.splice(G.enemies.indexOf(e),1);
  G.lives--; G.combo=0; drawHearts(); G.shake=reduce?0:.35; sOuch();
  burst(ex,ey,e.col,16,200);
  floatText(Math.min(Math.max(ex,80),W-80),ey-30,`${e.ch} = ${e.ans}`,'#E63E78',true);
  if(G.lives<=0&&G.endT<0){G.endT=1.1;G.lose=true;}
}

function update(dt){
  G.t+=dt;
  clouds.forEach(c=>{c.x+=c.v*dt; if(c.x>1.2)c.x=-.25});
  G.recoil=Math.max(0,G.recoil-dt*6); G.reload=Math.min(1,G.reload+dt*7);
  if(G.keys.ArrowLeft) G.tlane-=2.2*dt; if(G.keys.ArrowRight) G.tlane+=2.2*dt;
  G.tlane=Math.max(-.85,Math.min(.85,G.tlane));
  G.lane+=(G.tlane-G.lane)*Math.min(1,dt*14);
  G.shake=Math.max(0,G.shake-dt); G.flash=Math.max(0,(G.flash||0)-dt);
  // road + roadside scenery drift toward the player
  const drift=.35*dt; G.scroll+=drift;
  for(const d of G.deco){d.z-=drift; if(d.z<ZN*.7){d.z+=ZF*1.6;d.k=Math.random();}}
  if(G.endT>=0){G.endT-=dt; if(G.endT<0){endCard(!G.lose);return;}}
  if(!G.running) return;
  G.playT+=dt;
  if(G.keys.ArrowLeft||G.keys.ArrowRight) G.didMove=true;
  if(G.hitstop>0){G.hitstop-=dt;return}
  G.cool=Math.max(0,G.cool-dt);
  const n=G.enemies.length;
  G.spawnT-=dt;
  if(G.phase==='alarm'){ G.alarmT-=dt; if(G.alarmT<=0) spawnBoss(); }
  if(G.phase==='wave' && G.spawnT<=0 && n<G.maxOn && G.popped+n<G.goal+2 && G.endT<0){
    spawn(); const fill=n/G.maxOn; G.spawnT=(fill<.25?.6:fill<.5?1.5:2.7)/(1+G.li*.1)/G.pace;
  }
  if(!G.cur&&targets().some(e=>e.z<ZF+.5)) nextAmmo();
  else if(G.cur&&!targets().some(e=>e.ans===G.cur)&&!G.shots.some(s=>!s.bounced&&s.ans===G.cur&&!s.dead)) nextAmmo();
  const boost=n<=1?1.5:1;
  for(const e of [...G.enemies]){
    if(e.block>0){e.block-=dt; e.vz=0;} else e.vz+=(G.speed*boost-e.vz)*Math.min(1,dt*1.5);
    e.z-=e.vz*dt; if(e.z>ZF+.6)e.z=ZF+.6;
    e.lane=e.bl+Math.sin(G.t*1.3+e.ph)*.05;
    e.shake=Math.max(0,e.shake-dt); e.shield=Math.max(0,(e.shield||0)-dt); e.missT=Math.max(0,(e.missT||0)-dt);
    if(e.shoots&&e.z<ZF-.6&&e.z>2){ e.fireT-=dt; if(e.fireT<=0){ enemyFire(e.z,e.lane); e.fireT=3+Math.random()*2; } }
    if(e.z<=ZLOSE) hitLine(e);
  }
  if(G.boss){ const b=G.boss;
    b.vz+=(G.speed*.42-b.vz)*Math.min(1,dt*.8); b.z-=b.vz*dt; if(b.z>ZF+.6)b.z=ZF+.6;
    b.shake=Math.max(0,b.shake-dt); b.segs.forEach(g=>{g.missT=Math.max(0,g.missT-dt); g.flash=Math.max(0,g.flash-dt);});
    b.fireT=(b.fireT??2)-dt;
    if(b.fireT<=0&&b.z<ZF){ const alive=b.segs.map((g,i)=>g.alive?i:-1).filter(i=>i>=0);
      enemyFire(b.z, Math.random()<.5?G.lane:segLane(alive[Math.floor(Math.random()*alive.length)]));
      b.fireT=(2.6+Math.random()*1.2)/G.pace; }
    if(b.z<=ZLOSE+.15) bossReachedLine(); }
  updateBolts(dt); G.hurt=Math.max(0,G.hurt-dt);
  const LT=RB*.9/HW;
  for(const s of G.shots){
    if(s.bounced){s.trail.push([s.sx,s.sy,s.r]); if(s.trail.length>7)s.trail.shift();
      s.sx+=s.vx*dt;s.sy+=s.vy*dt;s.vy+=1100*dt;s.spin+=s.vx*.02*dt;s.r=Math.min(RB*.75,s.r*(1+dt*1.6));s.life-=dt;continue;}
    const z0=s.z; s.z+=s.vz*dt;
    if(G.boss&&G.boss.z>z0-.2&&G.boss.z<s.z+.2){ const b=G.boss, i=bossSegAt(s.lane);
      if(i>=0&&b.segs[i].alive){ const g=b.segs[i];
        if(g.ans===s.ans){ hitBossSeg(i,s); continue; }
        const s0=sc(b.z); s.bounced=true; s.sx=px(s.lane,b.z); s.sy=py(b.z)-RB*s0*1.3; s.r=RB*.45*s0; s.trail=[]; s.spin=0; s.life=1.1;
        s.vx=(s.sx<W/2?-1:1)*(260+Math.random()*140); s.vy=-420-Math.random()*120;
        g.missAns=s.lab; g.missT=.8; g.flash=.25; b.shake=.3; G.hitstop=.05; G.combo=0;
        G.parts.push({clang:true,x:s.sx,y:s.sy,life:.3,max:.3,r:RB*s0}); sClank(); flashBtn('miss'); continue; }
    }
    for(const e of G.enemies){
      if(e.z>z0-.15&&e.z<s.z+.15&&Math.abs(s.lane-e.lane)<LT*e.wf){
        if(s.ans===e.ans){pop(e,s);}
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
  }
  G.shots=G.shots.filter(s=>!s.dead&&(s.bounced?s.life>0:s.z<ZF+1));
  for(const p of G.parts){p.life-=dt; if(!p.ring&&!p.clang&&!p.flashball){p.vy+=600*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*8;}}
  G.parts=G.parts.filter(p=>p.life>0);
  for(const t of G.texts){t.life-=dt;t.y-=40*dt;}
  G.texts=G.texts.filter(t=>t.life>0);
  for(const p of G.pairs){p.life-=dt;p.y-=(p.ok?34:20)*dt;}
  G.pairs=G.pairs.filter(p=>p.life>0);
  for(const m of G.muzzle)m.life-=dt; G.muzzle=G.muzzle.filter(m=>m.life>0);
}
