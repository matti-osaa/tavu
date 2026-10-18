/* Player settings: difficulty (on the map), letter case (hamburger menu). The season follows the calendar. */

/* ---- Difficulty: overall pace and lives ---- */
const DIFF = {easy:{pace:.55,lives:5}, normal:{pace:.72,lives:4}, hard:{pace:1,lives:3}};
const diff = () => DIFF[save.diff] || DIFF.normal;

/* ---- Season: chosen by the calendar only (not a player setting).
   For testing, add #halloween or #perus to the page address. ---- */
function activeSeason(){
  const h = location.hash.slice(1).toLowerCase();
  if(h==='perus') return null;
  const forced = SEASONS.find(s=>s.id===h); if(forced) return forced;
  const now = new Date(); return SEASONS.find(s=>s.active(now)) || null;
}
function applySeasonClass(){
  SEASONS.forEach(s=>document.body.classList.remove(s.cssClass));
  const s = activeSeason(); if(s) document.body.classList.add(s.cssClass);
}

/* ---- Letter case: upper / lower / mixed (random per tyyppä) / pair (Тт side by side) ---- */
const caseMode = () => save.caseMode || 'upper';
const cap1 = a => a.charAt(0).toUpperCase() + a.slice(1);
function dispCh(ch){ const lo=ch.toLowerCase(), m=caseMode();
  if(lo===ch) return ch;                       // katakana has no case
  if(ch.length>1){ if(m==='lower')return lo; if(m==='pair')return ch[0]+lo.slice(1); if(m==='mixed')return Math.random()<.5?ch:lo; return ch; }
  if(m==='lower')return lo; if(m==='pair')return ch+lo; if(m==='mixed')return Math.random()<.5?ch:lo; return ch; }
function dispAns(a){ const m=caseMode(), up=cap1(a);
  if(G&&(G.isWord||G.lootMode)){ if(m==='upper')return a.toUpperCase(); if(m==='pair')return up; return a; }
  if(m==='upper')return up; if(m==='pair')return up===a?a:(a.length===1?up+a:up+' '+a); return a; }
function introCh(ch){ const lo=ch.toLowerCase(), m=caseMode(); if(lo===ch)return ch;
  if(ch.length>1)return m==='lower'?lo:m==='pair'?ch[0]+lo.slice(1):ch;
  if(m==='lower')return lo; if(m==='upper')return ch; return ch+lo; }

/* ---- Segmented controls on the map ---- */
function bindSeg(id, get, set){
  const seg = $(id);
  const paint = () => seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-checked', b.dataset.m===get()?'true':'false'));
  seg.querySelectorAll('button').forEach(b=>b.onclick=()=>{ set(b.dataset.m); persist(); paint(); });
  paint();
}
function initSettings(){
  addEventListener('hashchange',applySeasonClass);
  bindSeg('diffSeg', () => save.diff||'normal', v=>{ save.diff=v; });
  bindSeg('caseSeg', caseMode, v=>{ save.caseMode=v; });
  applySeasonClass();
  // hamburger menu with the less-used settings
  const btn=$('menuBtn'), panel=$('menuPanel');
  const setOpen=o=>{ panel.hidden=!o; btn.setAttribute('aria-expanded',o?'true':'false'); };
  btn.onclick=()=>setOpen(panel.hidden);
  $('menuClose').onclick=()=>setOpen(false);
  $('tutBtn').onclick=()=>{ setOpen(false); save.tutDone=false; persist(); startLevel(0,0); };
  addEventListener('keydown',e=>{ if(e.key==='Escape') setOpen(false); });
  document.addEventListener('pointerdown',e=>{ if(!panel.hidden&&!panel.contains(e.target)&&!btn.contains(e.target)) setOpen(false); });
}
