import ctypes, espeakng_loader as E, numpy as np
lib=ctypes.CDLL(E.get_library_path())
SR=lib.espeak_Initialize(2,0,E.get_data_path().encode(),0)
buf=[]
CB=ctypes.CFUNCTYPE(ctypes.c_int,ctypes.POINTER(ctypes.c_short),ctypes.c_int,ctypes.c_void_p)
@CB
def cb(wav,n,ev):
    if n>0: buf.append(np.ctypeslib.as_array(wav,shape=(n,)).copy())
    return 0
lib.espeak_SetSynthCallback(cb)
lib.espeak_TextToPhonemes.restype=ctypes.c_char_p
def say(text,voice,rate=150,pitch=60,rng=60):
    buf.clear(); lib.espeak_SetVoiceByName(voice.encode())
    lib.espeak_SetParameter(1,rate,0); lib.espeak_SetParameter(3,pitch,0); lib.espeak_SetParameter(4,rng,0)
    b=text.encode('utf8'); lib.espeak_Synth(b,len(b)+1,0,1,0,1,None,None); lib.espeak_Synchronize()
    return (np.concatenate(buf) if buf else np.zeros(0,np.int16)).astype(np.float32)/32768
def phon(text,voice):
    lib.espeak_SetVoiceByName(voice.encode()); p=ctypes.c_char_p(text.encode('utf8')); pp=ctypes.pointer(p)
    return lib.espeak_TextToPhonemes(pp,1,0x02).decode()
