import json, subprocess, numpy as np, os, sys
sys.path.insert(0,'.')
from es import say, SR
L=json.load(open('list.json'))
maps={}
import re
VOICE={'cyr':'ru','gre':'el','kat':'ja','sv':'sv','en':'en','la':'la'}
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
    # resample with playback rate gliding r0->r1 (lower rate = lower pitch + slower), vectorised
    n=len(x)
    if n<4: return x
    # position advances by r(t); r depends on relative position, approximate with cumulative sum over output steps
    est=int(n/((r0+r1)/2))+2
    t=np.linspace(0,1,est); r=r0+(r1-r0)*t; pos=np.concatenate([[0],np.cumsum(r)[:-1]])
    pos=pos[pos<n-1]
    return np.interp(pos,np.arange(n),x).astype(np.float32)
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
def make_clip(w,v,wmap,ch):
    if ch in wmap and w!='kat':
        p=letter_ph(w,ch,wmap[ch])
        if p in STOP:
            one=trim(say(f'[[{p}]]',v,rate=180,pitch=70),.02)[:int(SR*.14)]
            gap=np.zeros(int(SR*.06),np.float32); seq=[]
            for i in range(5): seq+=[one*(1-.13*i),gap]
            x=varispeed(np.concatenate(seq),1.05,.8)
        else:
            x=trim(say(f'[[{p}:::::]]',v,rate=140,pitch=72,rng=80)); x=die(x,start=.25,r1=.7,trem=.3)
    else:
        text=ch.lower() if w!='kat' else ch
        x=trim(say(text,v,rate=135,pitch=70,rng=90)); x=die(x,start=.5,r1=.58,trem=.3)
    x=fade(x); return x/(np.max(np.abs(x))+1e-6)*.9
BASEONLY='--base' in sys.argv   # rebuild only the base chunk (e.g. after adding a season), keep word chunks
only=[a for a in sys.argv[1:] if not a.startswith('--')]   # optional: world ids to rebuild
for w,d in L.items():
    if only and w not in only: continue
    v=VOICE[w]; wmap={}
    src=open('../../js/worlds/'+{'cyr':'cyrillic','gre':'greek','kat':'katakana','sv':'swedish','en':'english','la':'latin'}[w]+'.js').read()
    m=re.search(r'map\s*[:=]\s*\{([^}]*)\}',src)
    if m:
        for a_,b_ in re.findall(r"(\S)\s*:\s*'([^']*)'",m.group(1)): wmap[a_]=b_
    outdir=f'../../audio/cries/{w}'; os.makedirs(outdir,exist_ok=True); index={}
    if BASEONLY and os.path.exists(f'{outdir}/index.json'):
        index={k:v for k,v in json.load(open(f'{outdir}/index.json')).items() if v[0]!='base'}
    for cname,items in d['chunks'].items():
        if BASEONLY and cname!='base': continue
        clips=[]
        for ch in items:
            if ch in ('Ь','Ъ'): continue
            try: x=make_clip(w,v,wmap,ch)
            except Exception as e: print('skip',w,ch,e); continue
            if len(x)<200: continue
            clips.append((ch,x))
        if not clips: continue
        gap=np.zeros(int(SR*.12),np.float32); parts=[gap]; pos=len(gap)
        for ch,x in clips:
            index[ch]=[cname,round(pos/SR,4),round(len(x)/SR,4)]; parts+=[x,gap]; pos+=len(x)+len(gap)
        y=np.concatenate(parts); pcm=(np.clip(y,-1,1)*32767).astype(np.int16).tobytes()
        subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-ar','16000','-c:a','libmp3lame','-b:a','24k',f'{outdir}/{cname}.mp3'],input=pcm,check=True)
    json.dump(index,open(f'{outdir}/index.json','w'),ensure_ascii=False,separators=(',',':'))
    print(w,len(index),'clips',len(d['chunks']),'chunks')
