/* World map: one card per registered world, letter levels and word levels. */
const LOCK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V8a3 3 0 00-6 0z"/></svg>';
function renderMap(){
  const box=document.getElementById('worlds'); box.innerHTML='';
  WORLDS.forEach((w,wi)=>{
    const el=document.createElement('div'); el.className='world'; el.style.background=w.card.bg;
    el.innerHTML=`<div class="glyphs" aria-hidden="true">${w.levels.length?w.levels[0].slice(0,3):w.words[0][0][0].slice(0,3)}</div><div class="script">${w.script}</div><h2>${w.name}</h2><div class="path"></div>`;
    const path=el.querySelector('.path');
    w.levels.forEach((lv,li)=>{
      const st=save.stars[w.id+'-'+li]||0, open=li===0||(save.stars[w.id+'-'+(li-1)]||0)>0;
      const n=document.createElement('div'); n.className='node';
      n.innerHTML=`<button style="--c:${w.card.color}" class="${open?'':'locked'}" aria-label="Taso ${li+1}${open?'':' (lukittu)'}">${open?li+1:LOCK}</button>
        <div class="stars">${[0,1,2].map(i=>`<i class="${i<st?'on':''}"></i>`).join('')}</div>
        <div class="new">${open?[...lv].slice(0,3).join(' '):'&nbsp;'}</div>`;
      if(open) n.querySelector('button').onclick=()=>startLevel(wi,li);
      path.appendChild(n);
    });
    const wp=document.createElement('div'); wp.className='path words';
    wp.innerHTML='<div class="wlabel">Sanat</div>';
    (w.words||[]).forEach((list,li)=>{
      const st=save.stars[w.id+'-w'+li]||0, n=document.createElement('div'); n.className='node';
      n.innerHTML=`<button class="wordnode" style="--c:${w.card.color}" aria-label="Sanataso ${li+1}">${list[0][0]}</button>
        <div class="stars">${[0,1,2].map(i=>`<i class="${i<st?'on':''}"></i>`).join('')}</div>`;
      n.querySelector('button').onclick=()=>startLevel(wi,li,'words');
      wp.appendChild(n);
    });
    el.appendChild(wp);
    box.appendChild(el);
  });
}
