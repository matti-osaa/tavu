# Tavu – Tyypät hyökkäävät!

Tyypät ovat kirjaimia ja sanoja tutuista ja vieraista kirjoitusjärjestelmistä. Ammu, erehdy ja opi, kunnes jokainen tyyppä on tuhottu!

Selainpeli, jossa opitaan kyrillisiä, kreikkalaisia ja katakanakirjaimia sekä ruotsin ja englannin sanoja. Tyypät kävelevät tietä pitkin kohti pelaajaa, ja ne tuhotaan ampumalla oikealla vastineella.

## Pelaaminen

- Alareunassa on rivi kiekkoja, jokainen omassa kuminauhassaan. Napauta kiekkoa: se lentää lähimpään tyyppään, jonka vastine se on (tai lähimpään, jos ei kenenkään). Tai vedä kiekkoa taaksepäin ja päästä irti: se linkoaa itsensä pisteviivan suuntaan. Ammutun tilalle tulee uusi, yleensä eri kirjain.
- Näppäimistö: 1–5 ampuu kiekon, ↑ ↓ valitsee kiekon, ← → kääntää tähtäystä, välilyönti/Enter ampuu valitun.
- Kiekot kimpoavat tien reunoista; pisteviiva näyttää kimpoamiset.
- Punainen tuulinappi puhaltaa kaikki tyypät kauas (lataus 1 min, näppäin X). Viiden osuman putki hidastaa kaikkea hetken. Helpolla tasolla tien poikki on sähköaita, joka hidastaa tyyppejä.
- Kartalta valitaan teema (kauden mukaan / Halloween / perus), vaikeustaso ja kirjainkoko.

## Tyyppien luonteet

Tasolta 3 alkaen kentällä on kiviä (Halloweenina hautakiviä), joiden läpi kiekot eivät mene. Piileskelijät menevät kiven taakse ja kurkkivat välillä. Rohmu nappaa väärän kiekon, kasvaa ja pitää sitä kilpenä, joka kestää kolme oikeaa osumaa. Sieppari ottaa väärän kiekon kiinni ja viskaa sen päin näköä.

## Salakirjoitus

Kyrillisen ja kreikan polulla on sanatason jälkeen salakirjoitustaso (raidallinen solmu, ei pakollinen): suomenkielinen lause opituilla kirjaimilla. Napauta kirjainta ja valitse vastine – kaikki samat kirjaimet vaihtuvat arvaukseksi, oikeellisuutta ei kerrota. Kun lause näyttää suomelta, kirjoita se ruutuihin. Lauseet: `js/content/sentences-fi.js`.

## Kehitys
Ei riippuvuuksia eikä käännösvaihetta: avaa `index.html` selaimessa. Rakenne ja ohjeet uuden kielen tai kausiteeman lisäämiseen: [docs/ARKKITEHTUURI.md](docs/ARKKITEHTUURI.md).

## Julkaisu GitHub Pagesiin
Settings → Pages → *Deploy from a branch*, haara `main`, kansio `/ (root)`. Peli aukeaa osoitteessa `https://<käyttäjä>.github.io/tavu/`.

## Lähteet
Kyrillisen latinaistus: SFS 4900 (Kotimaisten kielten keskuksen suositus). Kreikan ja katakanan (Hepburn) vastineet ovat alustavia.
