/* World map: one compact card per registered world with a single numbered level path.
   Each level brings letters or words (see stagesOf in registry.js). */
const LOCK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V8a3 3 0 00-6 0z"/></svg>';
function renderMap(){
  const box=$('worlds'); box.innerHTML='';
  WORLDS.forEach((w,wi)=>{
    const el=document.createElement('div'); el.className='world'; el.style.background=w.card.bg;
    el.innerHTML=`<h2>${w.script}</h2><div class="script">${w.name}</div>${Object.keys(w.map).length?`<button class="abc-btn" aria-label="Aakkoset">${Object.keys(w.map).slice(0,2).join('')}</button>`:''}<div class="path"></div>`;
    const ab=el.querySelector('.abc-btn'); if(ab) ab.onclick=()=>openAlphabet(wi);
    const path=el.querySelector('.path'), st=stagesOf(w);
    st.forEach((s,si)=>{
      const stars=save.stars[s.key]||0, open=si===0||(save.stars[st[si-1].key]||0)>0||stars>0
        ||(si>1&&st[si-1].kind==='cipher'&&(save.stars[st[si-2].key]||0)>0);   // salakirjoitus is a bonus: it never blocks the path
      const n=document.createElement('div'); n.className='node';
      n.innerHTML=`<button style="--c:${w.card.color}" class="${open?'':'locked'}${s.kind==='cipher'?' ciphernode':''}" aria-label="Taso ${si+1}${open?'':' (lukittu)'}">${open?si+1:LOCK}</button>
        <div class="stars">${[0,1,2].map(i=>`<i class="${i<stars?'on':''}"></i>`).join('')}</div>`;
      if(open) n.querySelector('button').onclick=()=>startLevel(wi,si);
      path.appendChild(n);
    });
    box.appendChild(el);
  });
}
