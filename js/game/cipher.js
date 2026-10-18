/* Salakirjoitus – a Finnish sentence written with the world's letters.
   Tap a foreign letter, pick the Latin letter you think it is: every tile with that letter turns into
   your guess. Nothing tells you if a guess is right; the sentence just reads the way it reads.
   When it reads like Finnish, type it into the boxes below (spaces are already there).
   Letters the world has no clear counterpart for (ä, ö, y…) and letters not learned yet stay Finnish. */
const PICK='abcdefghijklmnoprstuvyzäö'.split('');
let C=null;
// tiles always show one case (no random mixing between renders)
const cd=c=>caseMode()==='lower'?c.toLowerCase():c.toUpperCase();

function cipherRev(w){
  const rev={}, skip=new Set(['y']);            // Finnish y is not ы / υ: it stays Finnish
  for(const [F,lat] of Object.entries(w.map)){ if(lat.length===1&&/[a-z]/.test(lat)&&!skip.has(lat)&&!rev[lat]) rev[lat]=F; }
  Object.assign(rev,(w.cipherPrefer||{}));
  return rev;
}
function learnedUpTo(w,si){
  const st=stagesOf(w), set=new Set();
  st.slice(0,si).forEach(s=>{ if(s.kind==='letters') [...w.levels[s.li]].forEach(c=>set.add(c)); });
  return set;
}
function startCipher(wi,si){
  const w=WORLDS[wi], stage=stagesOf(w)[si], rev=cipherRev(w), learned=learnedUpTo(w,si);
  const enc=c=>rev[c]&&learned.has(rev[c])?rev[c]:null;
  // two Finnish letters can be one foreign letter (ja → Я): only once that letter has been learned
  const di=Object.entries(w.cipherDigraphs||{}).filter(([,F])=>learned.has(F));
  const tokens=txt=>{ const out=[]; for(let i=0;i<txt.length;){ const d=di.find(([fi])=>txt.startsWith(fi,i));
      if(d){ out.push({s:d[0],F:d[1]}); i+=d[0].length; } else { out.push({s:txt[i],F:txt[i]===' '?null:enc(txt[i])}); i++; } } return out; };
  // pick a sentence with many foreign letters (and a few different ones), not the last one played
  const scored=SENTENCES_FI.map(s=>{ const f=tokens(s).filter(t=>t.F).map(t=>t.F); return {s,n:f.length,d:new Set(f).size}; })
    .filter(o=>o.d>=3&&o.s!==(save.lastCipher||'')).sort((a,b)=>(b.n+b.d*2)-(a.n+a.d*2));
  const pool=scored.slice(0,Math.max(3,Math.ceil(scored.length/3))), pick=pool[Math.floor(Math.random()*pool.length)]||{s:SENTENCES_FI[0]};
  save.lastCipher=pick.s; persist();
  C={w,wi,si,key:stage.key,text:pick.s,words:pick.s.split(' ').map(tokens),pick:PICK.concat(di.length?Object.keys(w.cipherDigraphs):[]),guess:{},changes:0,tries:0,done:false};
  $('map').hidden=true; $('game').hidden=true; $('cipher').hidden=false;
  audio(); loadCries(w.id);
  renderCipher(true);
}
function cipherKeys(){ return [...new Set(C.words.flat().map(t=>t.F).filter(Boolean))]; }
function tileHTML(tk,i){
  const F=tk.F, c=tk.s;
  if(!F) return `<span class="ct fixed">${cd(c)}</span>`;
  const g=C.guess[F];
  const res=C.done?(!g?' rev':g===c?' ok':' bad'):'';   // letters you never turned are just revealed, not wrong
  return `<button class="ct${g?' guessed':''}${res}${(C.done?c:g||'').length>1?' two':''}" data-f="${F}" style="--d:${i*25}ms">${C.done&&g!==c?`<b>${cd(c)}</b>${g?`<s>${cd(g)}</s>`:''}`:g?`<b>${cd(g)}</b>`:`<b class="f">${cd(F)}</b>`}${g||C.done?`<i>${cd(F)}</i>`:''}</button>`;
}
function renderCipher(first){
  const words=C.text.split(' '); let i=0;
  const board=C.words.map(wd=>`<span class="cw">${wd.map(t=>tileHTML(t,i++)).join('')}</span>`).join('');
  const keys=cipherKeys().map(F=>{ const g=C.guess[F]; return `<button class="ck${g?' set':''}" data-f="${F}"><b>${cd(F)}</b><i>${g?cd(g):'?'}</i></button>`; }).join('');
  const el=$('cipher');
  if(first){
    el.innerHTML=`<div class="hud"><button class="chip" id="cBack" aria-label="Takaisin kartalle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="chip c-title">${C.w.script} ${C.si+1}</div></div>
      <div class="c-main"><div class="c-board" id="cBoard"></div><div class="c-keys" id="cKeys"></div>
      <form class="c-answer" id="cAns" autocomplete="off">${words.map((wd,k)=>`<input class="c-in" data-k="${k}" maxlength="${wd.length}" style="--n:${wd.length}" autocapitalize="none" spellcheck="false" aria-label="Sana ${k+1}">`).join('')}
      <button class="btn" id="cGo" type="submit">Valmis</button></form></div><div class="c-sheet" id="cSheet" hidden></div>`;
    $('cBack').onclick=()=>{ $('cipher').hidden=true; toMapFromCipher(); };
    el.querySelector('#cAns').onsubmit=e=>{ e.preventDefault(); checkCipher(); };
    el.querySelectorAll('.c-in').forEach((inp,k,all)=>{
      inp.addEventListener('input',()=>{ inp.value=inp.value.replace(/\s/g,''); if(inp.value.length>=+inp.maxLength&&all[k+1]) all[k+1].focus(); });
      inp.addEventListener('keydown',e=>{ if(e.key==='Backspace'&&!inp.value&&all[k-1]){ all[k-1].focus(); e.preventDefault(); } });
    });
  }
  $('cBoard').innerHTML=board; $('cKeys').innerHTML=keys;
  el.querySelectorAll('[data-f]').forEach(b=>{ if(!C.done) b.onclick=()=>openPicker(b.dataset.f); });
}
function openPicker(F){
  const sh=$('cSheet'), used=new Map(Object.entries(C.guess).map(([f,g])=>[g,f]));
  sh.innerHTML=`<div class="c-pick"><div class="c-pf">${cd(F)}<span>=</span></div>
    <div class="c-grid">${C.pick.map(l=>`<button data-l="${l}" class="${C.guess[F]===l?'on':''}${used.has(l)&&used.get(l)!==F?' used':''}">${cd(l)}</button>`).join('')}
    <button data-l="" class="clr" aria-label="Tyhjennä">?</button></div></div>`;
  sh.hidden=false;
  sh.onclick=e=>{ const b=e.target.closest('button'); if(!b){ if(e.target===sh) sh.hidden=true; return; }
    const l=b.dataset.l; if(l) { if(C.guess[F]!==l){ C.guess[F]=l; C.changes++; } } else delete C.guess[F];
    sh.hidden=true; renderCipher(false); flipSound(); };
}
function flipSound(){ tone(520,.05,'square',.04); noise(.06,2400,2,.08); tone(780,.06,'triangle',.05,1,.05); }
function checkCipher(){
  if(C.done) return;
  const ins=[...document.querySelectorAll('.c-in')], typed=ins.map(i=>i.value.trim().toLowerCase()).join(' ');
  if(typed===C.text){ solveCipher(); return; }
  C.tries++; sOuch(); const f=$('cAns'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
}
function solveCipher(){
  C.done=true; sWin();
  const keys=cipherKeys();
  let stars=1; if(C.tries<=1&&C.changes<=keys.length*1.5) stars=2; if(C.tries===0&&C.changes<=keys.length+1) stars=3;
  if(stars>(save.stars[C.key]||0)) save.stars[C.key]=stars; persist();
  renderCipher(false);
  const bn=document.createElement('div'); bn.className='c-banner'; bn.textContent='OIKEIN!'; $('cBoard').appendChild(bn); setTimeout(()=>bn.remove(),1250);   // then the board shows which guesses were right
  const hasNext=C.si+1<stagesOf(C.w).length;
  setTimeout(()=>{ const ov=document.createElement('div'); ov.className='overlay'; ov.innerHTML=`<div class="card c-win"><div class="c-ok">OIKEIN!</div><h3>${C.text.charAt(0).toUpperCase()+C.text.slice(1)}</h3>
      <div class="big-stars">${[0,1,2].map(i=>`<i class="${i<stars?'on':''}"></i>`).join('')}</div>
      <div class="row">${hasNext?'<button class="btn" id="cNx">Seuraava taso</button>':''}<button class="btn alt" id="cMp">Kartta</button></div></div>`;
    $('cipher').appendChild(ov);
    if(hasNext) $('cNx').onclick=()=>{ $('cipher').hidden=true; startLevel(C.wi,C.si+1); };
    $('cMp').onclick=()=>{ $('cipher').hidden=true; toMapFromCipher(); };
  },1300);
}
function toMapFromCipher(){ C=null; $('cipher').innerHTML=''; $('game').hidden=true; $('map').hidden=false; renderMap(); }
