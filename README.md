# Tavu – Tyypät hyökkäävät!

Tyypät ovat kirjaimia ja sanoja tutuista ja vieraista kirjoitusjärjestelmistä. Ammu, erehdy ja opi, kunnes jokainen tyyppä on tuhottu!

Selainpeli, jossa opitaan kyrillisiä, kreikkalaisia ja katakanakirjaimia sekä ruotsin ja englannin sanoja. Tyypät kävelevät tietä pitkin kohti pelaajaa, ja ne tuhotaan ampumalla oikealla vastineella.

## Pelaaminen

- Alareunassa on kuminauha ja kolme kiekkopinoa. Napauta pinoa tai vedä kiekko nauhaan, vedä nauhaa taaksepäin ja päästä irti: kiekko lentää pisteviivan suuntaan.
- Näppäimistö: 1 2 3 tai ↑ ↓ valitsee pinon, ← → kääntää tähtäystä, välilyönti/Enter ampuu.
- Kiekot kimpoavat tien reunoista; pisteviiva näyttää kimpoamiset.
- Punainen tuulinappi puhaltaa kaikki tyypät kauas (lataus 1 min, näppäin X). Viiden osuman putki hidastaa kaikkea hetken. Helpolla tasolla tien poikki on sähköaita, joka hidastaa tyyppejä.
- Kartalta valitaan teema (kauden mukaan / Halloween / perus), vaikeustaso ja kirjainkoko.

## Salakirjoitus

Kyrillisen ja kreikan polulla on sanatason jälkeen salakirjoitustaso (raidallinen solmu, ei pakollinen): suomenkielinen lause opituilla kirjaimilla. Napauta kirjainta ja valitse vastine – kaikki samat kirjaimet vaihtuvat arvaukseksi, oikeellisuutta ei kerrota. Kun lause näyttää suomelta, kirjoita se ruutuihin. Lauseet: `js/content/sentences-fi.js`.

## Kehitys
Ei riippuvuuksia eikä käännösvaihetta: avaa `index.html` selaimessa. Rakenne ja ohjeet uuden kielen tai kausiteeman lisäämiseen: [docs/ARKKITEHTUURI.md](docs/ARKKITEHTUURI.md).

## Julkaisu GitHub Pagesiin
Settings → Pages → *Deploy from a branch*, haara `main`, kansio `/ (root)`. Peli aukeaa osoitteessa `https://<käyttäjä>.github.io/tavu/`.

## Lähteet
Kyrillisen latinaistus: SFS 4900 (Kotimaisten kielten keskuksen suositus). Kreikan ja katakanan (Hepburn) vastineet ovat alustavia.
