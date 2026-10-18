# Tavu – Tyypät hyökkäävät!

Tyypät ovat kirjaimia ja sanoja tutuista ja vieraista kirjoitusjärjestelmistä. Ammu, erehdy ja opi, kunnes jokainen tyyppä on tuhottu!

Selainpeli, jossa opitaan kyrillisiä, kreikkalaisia ja katakanakirjaimia sekä ruotsin ja englannin sanoja. Tyypät kävelevät tietä pitkin kohti pelaajaa, ja ne tuhotaan ampumalla oikealla vastineella. Jokaisen tason lopussa hälytys ilmoittaa loppuvastustajan: jättimäisen hirviön, jolla on useita osumakohtia, ja jokainen niistä tuhotaan omalla vastineellaan.

## Pelaaminen
- ← → liikuttaa tykkiä, välilyönti/Enter ampuu, ↑ ↓ vaihtaa ammusta.
- Kosketusnäytöllä: vedä sormella sivulle, niin tykki seuraa; napauta kuutiota ampuaksesi; pyyhkäise kuutiota ylös/alas vaihtaaksesi ammusta.
- Kartalta valitaan vaikeustaso ja kirjainkoko. Kausiteema (esim. Halloween) vaihtuu itsestään päivämäärän mukaan.

## Kehitys
Ei riippuvuuksia eikä käännösvaihetta: avaa `index.html` selaimessa. Rakenne ja ohjeet uuden kielen tai kausiteeman lisäämiseen: [docs/ARKKITEHTUURI.md](docs/ARKKITEHTUURI.md).

## Julkaisu GitHub Pagesiin
Settings → Pages → *Deploy from a branch*, haara `main`, kansio `/ (root)`. Peli aukeaa osoitteessa `https://<käyttäjä>.github.io/tavu/`.

## Lähteet
Kyrillisen latinaistus: SFS 4900 (Kotimaisten kielten keskuksen suositus). Kreikan ja katakanan (Hepburn) vastineet ovat alustavia.

## Versiot
- 0.1 (18.10.2026): ensimmäinen julkinen versio – kyrillinen, kreikka, katakana, ruotsi, englanti; Halloween-teema.
- 0.5 (18.10.2026): satunnaisia vieraita kirjaimia jo ensimmäisistä tasoista, loppuvastustaja vapauttaa teemasanoja, Halloween-kurpitsatyypät ja -tykki, kartan koristeet.
- 0.4 (18.10.2026): loppuvastustaja ja osa tyypistä ampuvat takaisin (väistä), selkeämmät kirjaimet, lyhyemmät ohjeet.
- 0.3 (18.10.2026): loppuvastustajat ja hälytys, yksi tasopolku per maailma (kirjain- ja sanatasot samassa), kirjainasetus valikkoon, kausiteema vain päivämäärän mukaan.
- 0.2 (18.10.2026): mobiiliohjaus ilman nappipalkkia – tykin kuutio on ampumanappi.
