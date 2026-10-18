import json, subprocess, numpy as np, os, sys
sys.path.insert(0,'.')
from es import say, SR
L=json.load(open('list.json'))
maps={}
import re
VOICE={'cyr':'ru','gre':'el','kat':'ja','sv':'sv','en':'en'}
CONT=set('m n l r s z f v j Z S x T D Q S;'.split())
STOP=set('p b t d k g ts tS ks ps'.split())
VOW=set('a e i o u y'.split())
LAT2PH={'ž':'Z','š':'S','h':'x','tš':'tS','štš':'S;','th':'T'}
GREEK={'Γ':'Q','Δ':'D','Θ':'T','Χ':'x','Υ':'i','Η':'i'}
def letter_ph(w,ch,lat):
    if w=='gre' and ch in GREEK: p=GREEK[ch]
    else: p=LAT2PH.get(lat,lat)
    if w=='gre' and p=='y': p='i'
    return p
def varispeed(x,r0,r1):
    # resample with playback rate gliding r0->r1 (lower rate = lower pitch + slower)
    out=[]; pos=0.0; n=len(x)
    while pos<n-1:
        t=pos/n; r=r0+(r1-r0)*t; i=int(pos); f=pos-i; out.append(x[i]*(1-f)+x[i+1]*f); pos+=r
    return np.array(out,np.float32)
def die(x,start=0.55,r1=.6,trem=.25):
    if len(x)<10: return x
    k=int(len(x)*start); a=x[:k]; b=varispeed(x[k:],1.0,r1)
    t=np.arange(len(b))/SR; b=b*(1-trem*(.5+.5*np.sin(2*np.pi*7*t)))*np.linspace(1,.25,len(b))
    y=np.concatenate([a,b]); return y
def trim(x,th=.01):
    idx=np.where(np.abs(x)>th)[0]
    return x[max(0,idx[0]-200):idx[-1]+400] if len(idx) else x
def fade(x,ms=15):
    n=int(SR*ms/1000); x=x.copy(); x[:n]*=np.linspace(0,1,n); x[-n:]*=np.linspace(1,0,n); return x
out={}
for w,d in L.items():
    v=VOICE[w]; wmap={}
    src=open('../../js/worlds/'+{'cyr':'cyrillic','gre':'greek','kat':'katakana','sv':'swedish','en':'english'}[w]+'.js').read()
    m=re.search(r'map\s*[:=]\s*\{([^}]*)\}',src)
    if m:
        for a,b in re.findall(r"(\S)\s*:\s*'([^']*)'",m.group(1)): wmap[a]=b
    clips=[]
    for ch,_ in d['items']:
        if ch in ('Ь','Ъ'): continue
        if ch in wmap and w!='kat':
            p=letter_ph(w,ch,wmap[ch])
            if p in STOP:
                one=trim(say(f'[[{p}]]',v,rate=180,pitch=70),.02)[:int(SR*.14)]
                gap=np.zeros(int(SR*.06),np.float32); seq=[]
                for i in range(5): seq+= [one*(1-.13*i),gap]
                x=np.concatenate(seq)
                x=varispeed(x,1.05,.8)
            else:
                ph=p+':::::' if p not in ('S;',) else 'S;:::::'
                x=trim(say(f'[[{ph}]]',v,rate=140,pitch=72,rng=80))
                x=die(x,start=.25,r1=.7,trem=.3)
        else:
            text=ch.lower() if w!='kat' else ch
            x=trim(say(text,v,rate=135,pitch=70,rng=90))
            x=die(x,start=.5,r1=.58,trem=.3)
        x=fade(x); x=x/(np.max(np.abs(x))+1e-6)*.9
        clips.append((ch,x))
    # sprite: clips separated by 150 ms silence
    gap=np.zeros(int(SR*.15),np.float32); parts=[gap]; idx={}; pos=len(gap)
    for ch,x in clips:
        idx[ch]=[round(pos/SR,4),round(len(x)/SR,4)]; parts+= [x,gap]; pos+=len(x)+len(gap)
    y=np.concatenate(parts)
    pcm=(np.clip(y,-1,1)*32767).astype(np.int16).tobytes()
    os.makedirs('../../audio/cries',exist_ok=True)
    fn=f'../../audio/cries/{w}.mp3'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','40k',fn],input=pcm,check=True)
    out[w]=idx
    print(w,len(clips),round(len(y)/SR,1),'s',os.path.getsize(fn)//1024,'KB', 'max clip',max(v[1] for v in idx.values()))
json.dump(out,open('../../audio/cries/index.json','w'),ensure_ascii=False,separators=(',',':'))
