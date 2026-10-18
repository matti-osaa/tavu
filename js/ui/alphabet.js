/* Alphabet sheet: every letter of a world with its Latin counterpart.
   counts = {letter: n} adds a badge; highlight=true dims letters with no count (used after a level). */
function alphabetHTML(w, counts, highlight){
  const seen=seenSet(w.id), letters=Object.keys(w.map);
  if(!letters.length) return '';
  return `<div class="abc">${letters.map(c=>{ const n=(counts&&counts[c])||0, lo=c.toLowerCase();
    const cls=highlight?(n?'hit':'dim'):(seen.has(c)?'':'dim');
    return `<div class="abc-cell ${cls}"><b>${c}${lo!==c?`<small>${lo}</small>`:''}</b><span>${w.map[c]}</span>${n?`<i>${n}</i>`:''}</div>`; }).join('')}</div>`;
}
/* Opened from a world card on the map: the whole alphabet with lifetime counts */
function openAlphabet(wi){
  const w=WORLDS[wi], counts=(save.kills||{})[w.id]||{};
  const m=document.createElement('div'); m.className='abc-modal';
  m.innerHTML=`<div class="card"><div class="menu-head"><span>${w.script}</span><button class="menu-close" aria-label="Sulje">✕</button></div>${alphabetHTML(w,counts,false)}</div>`;
  m.onclick=e=>{ if(e.target===m||e.target.closest('.menu-close')) m.remove(); };
  document.body.appendChild(m);
}
