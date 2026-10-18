/* Halloween map critters: cobwebs you can wipe away with a finger, a spider that peeks down on a thread
   every 1–3 minutes (tap to squish), and weaver spiders that come back to rebuild a wiped web (you can swat them too).
   Runs only while the Halloween season is active and the map is on screen. */
(() => {
  const WEB = (() => {   // cobweb drawn into a corner, 120×120
    let l='';
    for(let a=0;a<=90;a+=15){const r=a*Math.PI/180; l+=`<line x1="0" y1="0" x2="${(120*Math.cos(r)).toFixed(1)}" y2="${(120*Math.sin(r)).toFixed(1)}"/>`;}
    for(const R of [25,48,72,98]){
      let d=''; for(let a=0;a<=90;a+=15){const r=a*Math.PI/180, x=R*Math.cos(r), y=R*Math.sin(r);
        d+= a===0?`M${x.toFixed(1)},${y.toFixed(1)}`:` Q${(x*.86).toFixed(1)},${(y*.86).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;}
      l+=`<path d="${d}" fill="none"/>`;
    }
    return `<svg viewBox="0 0 120 120" stroke="rgba(255,240,230,.6)" stroke-width="1.4">${l}</svg>`;
  })();
  // pixel spider, two leg frames
  const px=(rows,c)=>rows.map((r,y)=>[...r].map((ch,x)=>ch==='#'?`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`:ch==='o'?`<rect x="${x}" y="${y}" width="1" height="1" fill="#FF3B3B"/>`:'').join('')).join('');
  const F1=['#....##....#','.#..####..#.','..########..','#..#o##o#..#','.#.######.#.','#..######..#','..#.####.#..','.#........#.'];
  const F2=['.#...##...#.','#...####...#','.#########..','..##o##o##..','#..######..#','.#.######.#.','#..#.##.#..#','...#....#...'];
  const SPIDER=`<svg viewBox="0 0 12 8" shape-rendering="crispEdges"><g class="f1">${px(F1,'#1B1128')}</g><g class="f2">${px(F2,'#1B1128')}</g></svg>`;

  let layer=null, webs=[], spiders=[], peekT=30+Math.random()*30, last=0;   // first peek after 30–60 s
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const active=()=>document.body.classList.contains('season-halloween')&&!$('map').hidden;
  const squishSound=()=>{ try{ audio(); noise(.12,700,.8,.25); tone(120,.15,'sine',.12,.5); }catch(e){} };

  function build(){
    layer=document.createElement('div'); layer.className='hw-layer'; $('map').appendChild(layer);
    webs=['left','right'].map(side=>{
      const el=document.createElement('div'); el.className='hw-web '+side; el.innerHTML=WEB; layer.appendChild(el);
      const w={el,side,op:1,gone:false,regrowT:0,weaver:null}; let lastP=null;
      el.addEventListener('pointerdown',e=>{ lastP={x:e.clientX,y:e.clientY}; try{el.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault(); });
      el.addEventListener('pointermove',e=>{ if(!lastP||w.gone) return;
        const d=Math.hypot(e.clientX-lastP.x,e.clientY-lastP.y); lastP={x:e.clientX,y:e.clientY};
        w.op=Math.max(0,w.op-d/320); if(w.op<.12) wipe(w); paintWeb(w); });
      ['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,()=>lastP=null));
      return w;
    });
  }
  function paintWeb(w){ w.el.style.opacity=w.op; w.el.style.pointerEvents=w.gone?'none':'auto'; }
  function wipe(w){ w.gone=true; w.op=0; w.regrowT=rnd(14,28); try{ audio(); noise(.15,2400,1.5,.12); }catch(e){} }

  function addSpider(x,len,kind,web){
    const el=document.createElement('div'); el.className='hw-spider';
    el.innerHTML=`<div class="thread"></div><div class="body">${SPIDER}</div>`;
    el.style.left=x+'px'; layer.appendChild(el);
    const s={el,x,len,kind,web,y:0,state:'down',t:0,hang:rnd(5,9)};
    el.querySelector('.body').addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); squish(s); });
    spiders.push(s); return s;
  }
  function squish(s){
    if(s.state==='dead') return; s.state='dead'; squishSound();
    const sp=document.createElement('div'); sp.className='hw-splat'; sp.style.left=s.x+'px'; sp.style.top=(s.y+13)+'px'; layer.appendChild(sp);
    setTimeout(()=>sp.remove(),800); s.el.remove();
    if(s.web){ s.web.weaver=null; if(s.web.op<1){ s.web.gone=s.web.op<.12; s.web.regrowT=rnd(14,28); } }
  }

  function tick(now){
    requestAnimationFrame(tick);
    const dt=Math.min(.05,(now-last)/1000||0); last=now;
    if(!layer){ if(!document.body.classList.contains('season-halloween')) return; build(); }
    layer.style.display=active()?'':'none'; if(!active()) return;
    // peeking spiders
    peekT-=dt; if(peekT<=0&&!spiders.some(s=>s.kind==='peek')){   // one spider at a time, every 1–3 minutes
      addSpider(rnd(.12,.88)*innerWidth, rnd(70,Math.min(300,innerHeight*.45)),'peek'); peekT=rnd(60,180); }
    // webs regrow: a weaver comes down to the corner and spins it back
    webs.forEach(w=>{
      if(w.gone&&!w.weaver){ w.regrowT-=dt; if(w.regrowT<=0) w.weaver=addSpider(w.side==='left'?60:innerWidth-60,55,'weave',w); }
      paintWeb(w);
    });
    for(const s of spiders){
      if(s.state==='dead') continue;
      s.t+=dt; if(Math.floor(s.t*6)%2) s.el.classList.add('alt'); else s.el.classList.remove('alt');
      if(s.state==='down'){ s.y=Math.min(s.len,s.y+dt*140); if(s.y>=s.len){ s.state=s.kind==='weave'?'weave':'hang'; s.t=0; } }
      else if(s.state==='hang'){ s.y=s.len+Math.sin(s.t*3)*4; if(s.t>s.hang) s.state='up'; }
      else if(s.state==='weave'){ const w=s.web; w.gone=false; w.op=Math.min(1,w.op+dt/5); s.y=s.len+Math.sin(s.t*8)*3;
        s.el.style.left=(s.x+Math.sin(s.t*2.5)*30)+'px'; if(w.op>=1){ s.state='up'; w.weaver=null; } }
      else if(s.state==='up'){ s.y-=dt*170; if(s.y<-30){ s.state='dead'; s.el.remove(); if(s.web) s.web.weaver=null; } }
      s.el.querySelector('.thread').style.height=Math.max(0,s.y)+'px';
      s.el.querySelector('.body').style.top=s.y+'px';
    }
    spiders=spiders.filter(s=>s.state!=='dead');
  }
  requestAnimationFrame(tick);
})();
