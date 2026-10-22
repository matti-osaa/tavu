/* Sound effects, synthesised with WebAudio (no audio files). */
let soundOn=true, ac=null;
const sndBtn=document.getElementById('snd');
const SPK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z"/>';
const drawSnd=()=>sndBtn.innerHTML=SPK+(soundOn?'<path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>':'<path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>')+'</svg>';
drawSnd();
sndBtn.onclick=()=>{soundOn=!soundOn;drawSnd()};
function audio(){
  if(ac&&ac.state==='closed') ac=null;
  if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  if(ac&&ac.state!=='running'){ try{ ac.resume().catch(()=>{}); }catch(e){} }
  return ac;
}
// After the phone sleeps or the tab is hidden, wake the sound on return and on the very next touch
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&ac) audio(); });
['pointerdown','keydown','touchend'].forEach(t=>addEventListener(t,()=>{ if(ac&&ac.state!=='running') audio(); },{passive:true}));
function tone(f,dur,type='sine',vol=.18,slide=0,delay=0){
  if(!soundOn||!ac)return; const t=ac.currentTime+delay, o=ac.createOscillator(), g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02);
}
const PENTA=[0,2,4,7,9,12,14,16,19,21,24];
const LOW=[196,220,262,294]; // G3–D4, warm and steady
function noise(dur,freq,q,vol,delay=0){
  if(!soundOn||!ac)return; const t=ac.currentTime+delay, n=Math.floor(ac.sampleRate*dur), buf=ac.createBuffer(1,n,ac.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const src=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); src.buffer=buf; f.type='bandpass'; f.frequency.value=freq; f.Q.value=q;
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); src.connect(f).connect(g).connect(ac.destination); src.start(t);
}
// Hit: a soft thump + crunchy candy burst + one warm note
const sHit=()=>{const f=LOW[Math.floor(Math.random()*LOW.length)]; tone(150,.22,'sine',.38,.4); noise(.22,1100,.7,.45); tone(f,.4,'sine',.14,1,.05); tone(f*1.5,.3,'sine',.05,1,.08);};
/* Recorded cries: one audio sprite per world (audio/cries/<world>.mp3, made with espeak-ng and a
   "dying" slow-down), offsets in audio/cries/index.json. They play the same on every device, so they
   are used first; device speech is only the fallback (e.g. when the page runs from file://). */
const ASSET_V='20261020a';
// One small audio file per world chunk: "base" (letters, bosses, reward words) and one per word level (w0, w1 …).
// Only the chunks of the level being played are kept in memory (phones have little to spare).
const CRY={idx:{}, buf:{}, want:new Set()};
function loadCries(wid,li){
  const c=audio(); if(!c) return;
  const need=['base'].concat(li!=null?['w'+li]:[]).map(k=>wid+'/'+k);
  CRY.want=new Set(need);
  for(const k of Object.keys(CRY.buf)) if(!CRY.want.has(k)) delete CRY.buf[k];      // free other levels' audio
  const idxP=CRY.idx[wid]?Promise.resolve(CRY.idx[wid]):fetch(`audio/cries/${wid}/index.json?v=${ASSET_V}`).then(r=>r.json()).then(j=>CRY.idx[wid]=j);
  idxP.then(()=>need.forEach(key=>{ if(CRY.buf[key]) return; CRY.buf[key]='loading';
    fetch(`audio/cries/${key}.mp3?v=${ASSET_V}`).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(a=>new Promise((ok,no)=>c.decodeAudioData(a,ok,no))).then(buf=>{ if(CRY.want.has(key)) CRY.buf[key]=buf; else delete CRY.buf[key]; })
      .catch(()=>{ delete CRY.buf[key]; }); })).catch(()=>{});
}
function playCry(wid,ch){
  const e=CRY.idx[wid]&&CRY.idx[wid][ch], b=e&&CRY.buf[wid+'/'+e[0]]; if(!b||typeof b==='string'||!ac) return false;
  // every cry comes out a little different: random pitch, a random rise or sag, wobble and voice colour
  const R=(a,b)=>a+Math.random()*(b-a), t=ac.currentTime+.03;
  const src=ac.createBufferSource(), g=ac.createGain(), f=ac.createBiquadFilter(); src.buffer=b;
  const r0=R(.78,1.32), r1=r0*R(.72,1.12), len=(e[2]+.05)/((r0+r1)/2);
  src.playbackRate.setValueAtTime(r0,t); src.playbackRate.linearRampToValueAtTime(r1,t+len);
  const lfo=ac.createOscillator(), lg=ac.createGain(); lfo.frequency.value=R(4,9); lg.gain.value=r0*R(0,.06); lfo.connect(lg).connect(src.playbackRate);
  f.type='peaking'; f.frequency.value=R(500,2600); f.Q.value=R(.7,2.5); f.gain.value=R(-6,9);
  g.gain.value=R(.42,.6); src.connect(f).connect(g).connect(ac.destination);
  src.start(t,e[1],e[2]+.05); lfo.start(t); lfo.stop(t+len+.1); return true;
}

// Death wail: a synthesised voice crying "aaaa…". A sawtooth "voice" goes through three vowel
// formant filters (a → o as it dies away), pitch cracks up, then sags and sobs with growing vibrato.
let wails=0;
function sScream(c){ c=c||ac;
  if(!soundOn||!c||wails>=2)return; wails++;
  const t=c.currentTime+.02, dur=.6+Math.random()*.25, p0=330+Math.random()*220, end=t+dur;
  const out=c.createGain(); out.gain.setValueAtTime(0,t);
  out.gain.linearRampToValueAtTime(.12,t+.04); out.gain.setValueAtTime(.12,t+.18);
  // two sobbing dips, then fade
  out.gain.linearRampToValueAtTime(.05,t+dur*.42); out.gain.linearRampToValueAtTime(.09,t+dur*.5);
  out.gain.linearRampToValueAtTime(.04,t+dur*.72); out.gain.linearRampToValueAtTime(.06,t+dur*.78);
  out.gain.exponentialRampToValueAtTime(.001,end);
  out.connect(c.destination);
  // vowel "a" formants sliding toward "o"
  [[800,520,1],[1150,880,.55],[2800,2500,.18]].forEach(([fa,fo,lv])=>{
    const f=c.createBiquadFilter(), g=c.createGain(); f.type='bandpass'; f.Q.value=7;
    f.frequency.setValueAtTime(fa,t); f.frequency.setValueAtTime(fa,t+dur*.3); f.frequency.linearRampToValueAtTime(fo,end);
    g.gain.value=lv*4; f.connect(g).connect(out); (out._f=out._f||[]).push(f); });
  const toF=n=>out._f.forEach(f=>n.connect(f));
  // the voice: two slightly detuned saws; pitch cracks up, then sags down
  [0,1].forEach(k=>{ const o=c.createOscillator(); o.type='sawtooth'; const p=p0*(k?1.006:1);
    o.frequency.setValueAtTime(p*.8,t); o.frequency.exponentialRampToValueAtTime(p*1.18,t+.07);
    o.frequency.exponentialRampToValueAtTime(p,t+.2); o.frequency.exponentialRampToValueAtTime(p*.88,t+dur*.45);
    o.frequency.exponentialRampToValueAtTime(p*.93,t+dur*.5);                       // sob hiccup
    o.frequency.exponentialRampToValueAtTime(p*.5,end);
    // wobbling, ever wider vibrato = whimpering
    const l=c.createOscillator(), lg=c.createGain(); l.frequency.setValueAtTime(5,t); l.frequency.linearRampToValueAtTime(8,end);
    lg.gain.setValueAtTime(p*.01,t); lg.gain.linearRampToValueAtTime(p*.07,end); l.connect(lg).connect(o.frequency);
    toF(o); o.start(t); l.start(t); o.stop(end+.05); l.stop(end+.05); });
  // breath
  const n=Math.floor(c.sampleRate*dur), buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*.25;
  const b=c.createBufferSource(); b.buffer=buf; toF(b); b.start(t);
  setTimeout(()=>wails--,dur*1000);
}
// Death cry in the tyyppä's own language: the device voice says the letter's sound or the word,
// with the last vowel dragged out into a wail ("бааа!", "тыкваааа!", "カーーー！"). No voice → synth wail.
const VOWELS={'ru':'аеёиоуыэюя','el':'αεηιουωάέήίόύώ','sv':'aeiouyåäö','en':'aeiou'};
const OPEN={'ru':'а','el':'α'};
let voices=[]; const loadVoices=()=>{try{voices=speechSynthesis.getVoices()}catch(e){}};
if(window.speechSynthesis){ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }
// iOS only lets speech play after one utterance started inside a touch: unlock it on the first tap
let speechReady=false;
['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{ if(speechReady||!window.speechSynthesis)return; speechReady=true;
  try{ loadVoices(); const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u); }catch(e){} },{passive:true}));
function wailText(text,lang){
  const l=lang.slice(0,2), low=text.toLocaleLowerCase(lang);
  if(l==='ja') return text+'ー';
  const V=VOWELS[l]||'aeiou';
  let i=-1; for(let k=low.length-1;k>=0;k--) if(V.includes(low[k])){i=k;break;}
  if(i<0){                                                                  // a lone consonant hums its own sound: м → "мммм!", п → "ппппп!"
    if(/^[ьъ]$/.test(low)) return null;                                     // signs with no sound of their own: the synth wail
    return [...low].length===1? low.repeat(5)+'!' : low+(OPEN[l]||'').repeat(2)+'!'; }
  return low.slice(0,i+1)+low[i].repeat(2)+low.slice(i+1)+'!';
}
// Browser speech is fragile (Chrome jams if you cancel and speak right away, iOS needs a touch first),
// so: never interrupt a cry in progress, keep the utterance referenced, and if speech does not start
// within half a second, play the synth wail instead. After two failures speech is skipped for the session.
let curCry=null, ttsFails=0, ttsOffUntil=0;
function pickVoice(lang){
  const l=lang.slice(0,2).toLowerCase(), m=voices.filter(x=>x.lang.replace('_','-').toLowerCase().startsWith(l));
  return m.find(x=>x.localService&&x.lang.replace('_','-').toLowerCase()===lang.toLowerCase())||m.find(x=>x.localService)||m[0];
}
function speakCry(say,v){
  const u=new SpeechSynthesisUtterance(say); u.voice=v; u.lang=v.lang;
  u.pitch=1.2+Math.random()*.3; u.rate=.95+Math.random()*.15; u.volume=.35;   // a small, quiet cry under the POKS
  let started=false; u.onstart=()=>{started=true; ttsFails=0;};
  u.onend=u.onerror=()=>{ if(curCry===u) curCry=null; };
  curCry=u; speechSynthesis.speak(u);
  // speech that never starts: give it a moment (first use of a voice can be slow), then fall back
  setTimeout(()=>{ if(!started&&curCry===u){ curCry=null; try{speechSynthesis.cancel()}catch(e){}
    if(++ttsFails>=3){ ttsFails=0; ttsOffUntil=performance.now()+15000; } } },1500);
}
function sDie(text,lang){
  if(!soundOn) return;
  if(G&&playCry(G.w.id,text)){ window._cries=(window._cries||0)+1; return; }
  // device speech only when the recorded cries can't load (page opened from a file); phones get the synth wail
  window._fallback=(window._fallback||0)+1;
  if(location.protocol!=='file:'||!window.speechSynthesis||!lang||performance.now()<ttsOffUntil){ sScream(); return; }
  if(!voices.length) loadVoices();
  const v=pickVoice(lang), say=v&&wailText(text,lang);
  if(!say){ sScream(); return; }
  try{
    // a new cry cuts the previous one; Chrome drops a speak() right after cancel(), so wait a beat
    if(speechSynthesis.speaking||speechSynthesis.pending){ curCry=null; speechSynthesis.cancel(); setTimeout(()=>{ try{speakCry(say,v);}catch(e){} },120); }
    else speakCry(say,v);
  }catch(e){ sScream(); }
}
// Ricochet: a sharp woody "tok" + springy boing, clearly different from a hit
const sClank=()=>{noise(.05,2600,3,.35); tone(700,.07,'triangle',.16,.55); tone(170,.38,'sine',.17,2.1,.04); tone(255,.32,'sine',.06,2.1,.06);};
const sPop=()=>{const f=LOW[Math.floor(Math.random()*LOW.length)]; tone(f,.32,'sine',.22,1.25); tone(f*1.5,.28,'sine',.07,0,.03); tone(f/2,.2,'sine',.12,.8);};
const sPew=()=>tone(300,.09,'sine',.05,.75);
const sBoing=()=>tone(160,.22,'sine',.14,.65);
const sOuch=()=>{tone(196,.3,'sine',.16,.6);tone(131,.35,'sine',.12,.7,.12)};
const sWin=()=>[0,4,7,12].forEach((n,i)=>tone(262*Math.pow(2,n/12),.4,'sine',.16,0,i*.12));

// Boss warning: classic two-tone 8-bit alarm, repeated
const sAlarm=()=>{ for(let i=0;i<6;i++){ tone(880,.14,'square',.06,0,i*.34); tone(660,.14,'square',.06,0,i*.34+.17); } };
// Boss stomp / roar and defeat
const sRoar=()=>{ tone(90,.6,'sawtooth',.12,.5); noise(.5,300,.6,.25); };
const sBossDown=()=>{ noise(.9,500,.5,.5); [0,4,7,12,16,19].forEach((n,i)=>tone(196*Math.pow(2,n/12),.35,'square',.07,0,.3+i*.1)); };
