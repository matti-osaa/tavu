# Tavun arkkitehtuuri

Tavu on puhdas selainpeli ilman käännösvaihetta (ei npm:ää, ei bundleria). `index.html` lataa tavalliset `<script>`-tiedostot järjestyksessä. Koska ES-moduuleja ei käytetä, peli toimii myös suoraan avattuna (`file://`) ja GitHub Pagesissa sellaisenaan.

Tiedostot jakavat yhteisen globaalin nimiavaruuden (ylimmän tason `const`/`let`/`function`). Järjestyksellä on väliä vain sille koodille, joka ajetaan latauksen aikana. Funktioiden sisällä saa viitata myöhemmin ladattuihin asioihin.

## Kansiot

```
index.html              sivun rakenne + skriptien latausjärjestys
css/
  base.css              kartta, pelinäkymä, palikkamainen UI
  seasons/<id>.css      kausiteeman UI-värit (body.season-<id>)
js/
  core/
    registry.js         Tavu.addWorld / Tavu.addSeason, WORLDS, SEASONS, toLatin()
    storage.js          tallennus selaimen localStorageen (tähdet, nähdyt, asetukset)
    settings.js         vaikeustaso, kirjainkoko, kausiteema, kartan valitsimet
    audio.js            WebAudio-äänet (ei äänitiedostoja)
  worlds/               YKSI TIEDOSTO PER KIELI / KIRJOITUSJÄRJESTELMÄ
    cyrillic.js greek.js katakana.js swedish.js english.js
  seasons/              YKSI TIEDOSTO PER KAUSI
    halloween.js
  game/
    view.js             canvas, pseudo-3D-projektio (z-syvyys, kaistat), mittasuhteet
    game.js             säännöt: tason aloitus, ammus, tyyppien synty, osumat, update()
    input.js            kosketus, hiiri, näppäimistö
  render/
    draw-utils.js       värit, kuutiot, pehmeä kirjain, kyltit, merkit
    scene.js            taivas, mäet, palikkamaa, maali, tienvarsiesineet
    actors.js           tyypät, ammukset, tykki
    frame.js            yhden ruudun piirto + pääsilmukka
  ui/
    map.js              maailmakartta
  main.js               käynnistys
docs/ARKKITEHTUURI.md   tämä tiedosto
```

## Uuden kielen lisääminen

1. Kopioi esim. `js/worlds/greek.js` → `js/worlds/<kieli>.js`.
2. Täytä:
   - `map`: kirjain → latinalainen vastine (latinalaisille kielille `{}` ja `latin:true`)
   - `levels`: kirjaintasot merkkijonoina, jokainen taso tuo uudet kirjaimet
   - `words`: sanatasot `[[sana, suomennos], …]`
   - `toLatin(word)`: vain jos latinaistuksessa on sääntöjä, jotka riippuvat naapurikirjaimista (vrt. kyrillinen е → je)
   - `card`, `palette`: kartan kortin ja pelimaailman värit
   - `scenery(x, y, u, seed, deco)`: tienvarsiesine palikoista (`cube()`)
   - valinnainen `ambient(dt)`: lisäkerros, esim. putoavat terälehdet
3. Lisää `index.html`:ään yksi rivi `<script src="js/worlds/<kieli>.js"></script>` muiden maailmojen joukkoon. Rivien järjestys määrää järjestyksen kartalla.

## Uuden kausiteeman lisääminen

1. `js/seasons/<id>.js`: `Tavu.addSeason({ id, name, cssClass, active(date), palette, colors, sky(), scenery(), accessory() })`
   - `active(date)` päättää, milloin teema kytkeytyy päälle automaattisesti.
   - Kaikki piirtokoukut ovat valinnaisia. Jos koukku puuttuu, käytetään maailman omaa piirtoa.
2. `css/seasons/<id>.css`: kartan ja käyttöliittymän värit `body.<cssClass>`-valitsimella.
3. Lisää molemmat `index.html`:ään. Teema ilmestyy kartan *Teema*-valintaan automaattisesti.

## Pelin tila

- `G` on käynnissä olevan tason koko tila (tyypät, ammukset, partikkelit, elämät, pisteet). Kartalla `G` on `null`.
- `save` sisältää tallennetut tähdet, nähdyt kirjaimet ja asetukset. Avain `kotro-karkkijahti-v1` säilytettiin prototyypistä, jotta aiemmat tähdet säilyvät.
- Maailma on pseudo-3D: `lane` −1…1 on tie poikittain ja `z` etäisyys (1 = tykki, 4,2 = horisontti). `px(lane,z)`, `py(z)` ja `sc(z)` muuntavat ruutukoordinaateiksi.
- Ammus on yksi laatikko maan tasossa (`ammoBox()` actors.js:ssä); laukaus, kosketusalue ja piirto käyttävät samaa paikkaa.
- Kahdella ensimmäisellä tasolla (`G.plain`) tyypät ovat pelkkiä kirjaimia: ei silmiä, raajoja, hattuja, kurpitsoja, juoksijoita eikä ampujia.

## Seuraavia mahdollisia askelia

- Käyttöliittymän tekstit omaan tiedostoon (`js/ui/text-fi.js`), jotta valikot voi kääntää englanniksi ja ruotsiksi.
- Sanalistat JSON-tiedostoiksi, jos niitä halutaan muokata ilman koodia tai tuoda taulukosta. Tämä vaatii paikallisen palvelimen testaukseen.
- Äänitetyt ääntämykset `assets/audio/<kieli>/`.
