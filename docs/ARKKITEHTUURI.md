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
    registry.js         Tavu.addWorld / Tavu.addSeason, WORLDS, SEASONS, toLatin(), stagesOf()
    storage.js          tallennus selaimen localStorageen (tähdet, nähdyt, asetukset)
    settings.js         vaikeustaso, kirjainkoko, kausiteeman valinta päivämäärän mukaan
    audio.js            WebAudio-äänet (ei äänitiedostoja)
  worlds/               YKSI TIEDOSTO PER KIELI / KIRJOITUSJÄRJESTELMÄ
    cyrillic.js greek.js katakana.js swedish.js english.js
  seasons/              YKSI TIEDOSTO PER KAUSI
    halloween.js
    halloween-map.js    kartan interaktiiviset hämähäkit ja pyyhittävät seitit
  game/
    view.js             canvas, pseudo-3D-projektio (z-syvyys, kaistat), mittasuhteet
    game.js             säännöt: tason aloitus, ammus, tyyppien synty, osumat, loppuvastustaja, update()
    input.js            kosketus, hiiri, näppäimistö
  render/
    draw-utils.js       värit, kuutiot, pehmeä kirjain, kyltit, merkit
    scene.js            taivas, mäet, palikkamaa, maali, tienvarsiesineet
    actors.js           tyypät, ammukset, tykki, loppuvastustaja
    frame.js            yhden ruudun piirto, hälytys + pääsilmukka
  ui/
    map.js              maailmakartta
    alphabet.js         aakkostaulu (kartalta avattava ja tason lopussa) tuhottujen määrineen
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
   - `rewards`: sanat, jotka loppuvastustaja vapauttaa kaatuessaan `[[sana, suomennos, latinaistus?], …]`
3. Lisää `index.html`:ään yksi rivi `<script src="js/worlds/<kieli>.js"></script>` muiden maailmojen joukkoon. Rivien järjestys määrää järjestyksen kartalla.

## Uuden kausiteeman lisääminen

1. `js/seasons/<id>.js`: `Tavu.addSeason({ id, name, cssClass, active(date), palette, colors, sky(), scenery(), accessory(), body(), cannon(), rewards })`
   - `body()` + `bodyChance`: osa tyypistä saa kausiasun (esim. kurpitsa). `cannon()`: tykin ulkoasu. `rewards[worldId]`: kauden saalissanat.
   - `active(date)` päättää, milloin teema kytkeytyy päälle automaattisesti.
   - Kaikki piirtokoukut ovat valinnaisia. Jos koukku puuttuu, käytetään maailman omaa piirtoa.
2. `css/seasons/<id>.css`: kartan ja käyttöliittymän värit `body.<cssClass>`-valitsimella.
3. Lisää molemmat `index.html`:ään. Teema kytkeytyy päälle vain `active(date)`-ehdon mukaan; pelaaja ei valitse sitä. Testaukseen: lisää osoitteen perään `#<id>` (esim. `#halloween`) tai `#perus`.

## Tason kulku

- Maailman tasot muodostavat yhden polun (`stagesOf`): kirjaintasojen väliin tulee sanataso joka toisen kirjaintason jälkeen. Latinalaisilla kielillä on pelkkiä sanatasoja.
- Tason vaiheet (`G.phase`): `wave` (tyyppiaalto) → `alarm` (hälytys noin 2,6 s) → `boss` (loppuvastustaja) → `loot` (hirviön vapauttamat teemasanat hyökkäävät) → `done`.
- Loppuvastustajalla on 5 kirjainta tai 3 sanaa levyinä. Jokainen levy on oma osumakohtansa (`segLane`, `bossSegAt`) ja tuhoutuu vain omalla vastineellaan. Jos hirviö pääsee rajalle, menetetään elämä ja se työntyy taaksepäin.

## Pelin tila

- `G` on käynnissä olevan tason koko tila (tyypät, ammukset, partikkelit, elämät, pisteet). Kartalla `G` on `null`.
- `save` sisältää tallennetut tähdet, nähdyt kirjaimet ja asetukset. Avain `kotro-karkkijahti-v1` säilytettiin prototyypistä, jotta aiemmat tähdet säilyvät.
- Maailma on pseudo-3D: `lane` −1…1 on tie poikittain ja `z` etäisyys (1 = tykki, 4,2 = horisontti). `px(lane,z)`, `py(z)` ja `sc(z)` muuntavat ruutukoordinaateiksi.

## Seuraavia mahdollisia askelia

- Käyttöliittymän tekstit omaan tiedostoon (`js/ui/text-fi.js`), jotta valikot voi kääntää englanniksi ja ruotsiksi.
- Sanalistat JSON-tiedostoiksi, jos niitä halutaan muokata ilman koodia tai tuoda taulukosta. Tämä vaatii paikallisen palvelimen testaukseen.
- Äänitetyt ääntämykset `assets/audio/<kieli>/`.
