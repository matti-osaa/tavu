# Kuolinhuudot

Tyyppien kuolinhuudot ovat valmiiksi tehtyjä äänitiedostoja (`audio/cries/<maailma>.mp3` + `index.json`), jotta ne kuulostavat samalta kaikilla laitteilla.

Uudelleen tekeminen (esim. kun maailmaan lisätään sanoja), tässä kansiossa:

    pip install espeakng-loader numpy
    node list.js        # kerää kaikki kirjaimet ja sanat → list.json
    python3 gen.py      # tekee äänet espeak-ng:llä ja "kuolevalla" hidastuksella → ../../audio/cries/

Vaihda lopuksi `ASSET_V` (js/core/audio.js) ja `?v=` (index.html), jotta puhelimet hakevat uudet tiedostot.
