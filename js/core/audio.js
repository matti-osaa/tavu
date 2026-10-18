/* Sound effects, synthesised with WebAudio (no audio files). */
let soundOn=true, ac=null;
const sndBtn=document.getElementById('snd');
const SPK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z"/>';
const drawSnd=()=>sndBtn.innerHTML=SPK+(soundOn?'<path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>':'<path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>')+'</svg>';
drawSnd();
sndBtn.onclick=()=>{soundOn=!soundOn;drawSnd()};
function audio(){ if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}} if(ac&&ac.state==='suspended')ac.resume(); return ac;}
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
// Ricochet: a sharp woody "tok" + springy boing, clearly different from a hit
const sClank=()=>{noise(.05,2600,3,.35); tone(700,.07,'triangle',.16,.55); tone(170,.38,'sine',.17,2.1,.04); tone(255,.32,'sine',.06,2.1,.06);};
const sPop=()=>{const f=LOW[Math.floor(Math.random()*LOW.length)]; tone(f,.32,'sine',.22,1.25); tone(f*1.5,.28,'sine',.07,0,.03); tone(f/2,.2,'sine',.12,.8);};
const sPew=()=>tone(300,.09,'sine',.05,.75);
const sBoing=()=>tone(160,.22,'sine',.14,.65);
const sOuch=()=>{tone(196,.3,'sine',.16,.6);tone(131,.35,'sine',.12,.7,.12)};
const sWin=()=>[0,4,7,12].forEach((n,i)=>tone(262*Math.pow(2,n/12),.4,'sine',.16,0,i*.12));
