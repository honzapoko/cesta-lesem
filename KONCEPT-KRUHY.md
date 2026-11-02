# Klíček: Kruhy, lokality a podpora mezi lidmi

Stav: návrh k otestování v rodině (Honza + děti). Listopad 2026.

## 1. Proč a jak (zásady)

Kruh je malá skupina 2–8 lidí, kteří si navzájem drží palce. Není to žebříček. Výzkum (Duolingo Friend Streak +22 % dokončených lekcí, Habitica zrušila guildy pro nízké využití, Agapé: denní podněty v páru) říká, že funguje **spolupráce v malé skupině**, ne soutěž s cizími. Zásady:

1. **Nikdo nevidí cizí selhání jako číslo.** Vidíš, co kdo dnes splnil a jaký má řetěz. Nevidíš „0 / 5“, vidíš „ještě nezačal“.
2. **Podpora stojí energii, proto se odměňuje.** Kdo povzbuzuje, dostává mince. Kdo jen sbírá, dostává méně.
3. **Sázky jsou dar, ne hazard.** Vsadíš mince na kamaráda; když to splní, mince dostane on, ty dostaneš bonus. Když to nesplní, mince se ti vrátí. Nikdo nikdy neprodělá.
4. **Děti jsou v kruhu rovnocenné.** Žádné věkové omezení funkcí, jen rodičovský souhlas s účtem (GDPR: do 15 let v ČR).
5. **Vše je volitelné.** Kruhy jsou další záložka, appka bez nich funguje stejně.

## 2. Co kruh umí (MVP)

| Funkce | Popis |
|---|---|
| Založit / připojit se | Kód kruhu (6 znaků) nebo odkaz. Max 8 lidí. Názvy: „Rodina Pokorných“, „Plavci“. |
| Nástěnka dne | Řádek na člověka: avatar (Klíček s doplňky), dnes splněno x/y, řetěz, nálada. Aktualizace při synchronizaci. |
| Palec / Šťouch | Ťuknutím pošleš „💪 Držím palce“ nebo „🦥 Klíček na tebe myslí“. Příjemce dostane notifikaci. Max 3 denně na osobu (aby to mělo cenu). |
| Sázka (Věřím ti) | Vsadíš 5–50 mincí, že kamarád dnes splní konkrétní aktivitu / celý den. Výsledek večer po půlnoci. |
| Společná výzva | „Všichni 5 dní za sebou procházka“ → po splnění každý dostane společnou odměnu (vzácný předmět do lokality). |
| Oslava | Když někdo dokončí sezónu nebo metu, kruh dostane oznámení s konfetami a tlačítkem Pogratulovat. |

Co kruh **neumí** (záměrně): hodnotit, komentovat volným textem (děti), zobrazovat žebříček, vidět poznámky/deník/spánek (soukromé).

## 3. Ekonomika podpory

Mince za vlastní aktivity zůstávají (1 / 3 za les / +3 den / +10 týden). K tomu:

| Akce | Kdo dostane | Kolik |
|---|---|---|
| Pošleš palec | ty | +1 (max 3 denně) |
| Dostaneš palec | ty | +1 |
| Sázka vyjde | kamarád dostane vsazené mince + ty dostaneš 50 % navrch | např. vsadíš 10 → on +10, ty +5 |
| Sázka nevyjde | mince se ti vrátí | 0 |
| Kamarád se vrátí po výpadku a ty jsi mu ten den poslal palec | ty | +5 („Návrat“, z Milkman 2021: odměna za návrat je nejúčinnější) |
| Společná výzva splněna | všichni | vzácný předmět (není koupitelný) |
| Jsi 7 dní v řadě nejaktivnější podporovatel kruhu | ty | titul „Opora kruhu“ + 20 mincí |

Pojistky: podpora nese max 30 % denního příjmu mincí (aby se nedalo „farmit“ palce), sázky max 3 otevřené najednou, dítě nemůže vsadit víc než 20.

## 4. Lokality (místo více zahrad)

Jedna zahrada zůstává, ale přibývají **další místa**, každé s vlastními předměty a vlastní atmosférou. Odemykají se za úrovně nebo za společné výzvy, předměty se kupují za mince. Tím mají mince smysl i po zaplnění zahrady.

| # | Lokalita | Nálada | Odemčení | Vlastní měna navíc |
|---|---|---|---|---|
| 1 | Zenová zahrada | klid, ráno | od začátku | – |
| 2 | Lesní mýtina | příroda, procházky | 30 procházek (meta Cesty) | – |
| 3 | Horská chata | večer, teplo, čaj | úroveň Stromek (500 XP) | – |
| 4 | Pláž a moře | léto, pohyb, voda | společná výzva kruhu | – |
| 5 | Noční observatoř | spánek, ticho | 30 nocí „Spát včas“ | – |
| 6 | Rodinná kuchyně | jídlo, společný čas | kruh s ≥ 3 lidmi | – |

Každá lokalita: 1 pozadí (4:3) + 20–30 předmětů ve 4 cenových hladinách, stejný systém slotů a řetězců jako zahrada. Lenochod je všude, v lokalitě má vlastní pózu (na mýtině sedí na pařezu, v chatě s čajem, na pláži v lehátku, v observatoři s dalekohledem, v kuchyni s vařečkou).

## 5. Zadání grafiky pro ChatGPT (kopíruj po jednom)

Styl drž stejný u všech: **„cute 3D render, soft Pixar-like lighting, warm pastel palette, solid cream background #FBF3E6, no text, no shadows on the ground, object fully visible and centered, square 1024×1024“**. Každý předmět **samostatně**, ne na archu (archy se špatně řežou).

**A. Pozadí lokalit** (každé: „4:3 landscape, painterly 3D, golden hour, empty flat foreground area in the lower third where small objects will be placed, no characters, no text“):
1. Forest clearing with soft moss, birch and spruce trees, light fog, a path leading in.
2. Cozy mountain cabin terrace in the evening, wooden deck, snowy peaks in the distance, warm window light.
3. Calm beach at sunset, pale sand foreground, gentle waves, a few palm leaves at the edge.
4. Night hilltop observatory meadow, starry sky, soft blue grass, distant small dome.
5. Warm family kitchen interior, big wooden table in the foreground, window with garden light.

**B. Předměty – Lesní mýtina** (24): pařez, houbová rodinka, ohniště, lavice z kmene, krmítko pro ptáky, ptačí budka, mravenčí domeček, kapradinový trs, malý potůček, kamenný můstek, liščí nora, srnka, zajíc, sova na větvi, lucerna na kůlu, houpačka z lana, stan, dřevěný rozcestník, borůvčí, malá bříza, velký dub (3 stádia: semenáček, stromek, strom), jezírko s lekníny, dřevník, skalka s vřesem.

**C. Předměty – Horská chata** (22): křeslo s dekou, kamna, hrnek s čajem na stolku, kniha, kytara, krb, dřevěný stůl, kožešinový koberec, okno s výhledem (dekorace), lyže u zdi, sáně, sněhulák, ptačí krmítko na zábradlí, lampa, svíčky, horský kříž, zvonek, koza, pes u kamen, hromada dřeva, hvězdná lucerna, terasa s lehátkem.

**D. Předměty – Pláž** (22): lehátko, slunečník, hrad z písku, mušle, kokosový nápoj, surf, kajak, houpací síť, oheň na pláži, krab, mořská hvězdice, maják (3 stádia), molo, racek, plachetnice v dálce (dekorace), dřevěný bar, kokosová palma, želva, šnorchl a ploutve, deka a koš, bójka, plážový volejbal.

**E. Předměty – Observatoř** (20): dalekohled, deka a termoska, lucerna, kámen na sezení, hvězdná mapa, kyvadlové hodiny, sova, netopýr (roztomilý), měsíc v křesle (dekorace), kompas, stan, ohýnek, meteorit, mlhovina v rámu, hvězdářský deník, teplý kabát na věšáku, padající hvězda (efekt), astronaut hračka, planetárium kopule (3 stádia), polštáře.

**F. Předměty – Kuchyně** (20): konvice, mísa s ovocem, chléb, bylinky v květináči, kočka na židli, rodinný stůl prostřený (3 stádia: 2, 4, 6 míst), kuchařka, hrnec na kamnech, vafle, kakao, polička s kořením, radio, kalendář na zdi, nástěnka s obrázky dětí, květina ve váze, pes pod stolem, dort se svíčkami, zavařeniny, závěs, lampa nad stolem.

**G. Lenochod v lokalitách** (každý: „same sloth character as before: navy hoodie with golden leaf pin, full body visible, sitting, transparent or solid cream background“): on a tree stump holding a mushroom; in an armchair with a mug of tea under a blanket; in a beach chair with sunglasses; looking through a telescope wrapped in a blanket; at a kitchen table with a wooden spoon and apron.

**H. Avatary pro Kruh** (hlava lenochoda, kruhový výřez, 8 variant doplňků): čelenka s lístkem, brýle, čepice, květina za uchem, šála, sluchátka, korunka, kšiltovka. Děti si vyberou.

**I. Ikony aktivit** – 50 chybějících, ve stejném stylu jako stávající (kruh s lístky, bez textu): čas bez telefonu, den bez sociálních sítí, chvíle ticha, večerní zamyšlení, smích, koníček, plavání, schody, tanec, sauna, kliky, venčení psa, zahrada, týmový sport, přestávka od sezení, odpočinek očí, snídaně, zelenina, káva dopoledne, vitamíny, vařím doma, nejíst pozdě, vstávám včas, bez obrazovky večer, péče o pleť, cizí jazyk, psaní, hudební nástroj, online kurz, podcast, e-maily, nejtěžší věc první, přestávky, konec práce včas, domácí úkoly, čtení dětem, zavolat rodině, čas s dětmi, čas s partnerem, poděkování, nádobí, prádlo, nákup podle seznamu, den bez útraty, zapsat výdaje, zalít květiny, péče o zvíře, společná večeře, dobrovolnictví, třídění odpadu.

## 6. Technika a pořadí

Kruhy vyžadují cloud (Supabase, tabulky `circles`, `members`, `events`, `bets`) a přihlášení přes Google – to je první podmínka. Pořadí:

1. **Teď (bez cloudu):** 100 aktivit ✔ (všech 103 má vlastní ikonu ✔), pozadí všech 5 lokalit ✔ (v Zahradě pod „Další místa“, odemykání podle tabulky výše; pláž a kuchyně čekají na Kruhy), avatary pro Kruh ✔ (`img/avatars/`), **chybí**: předměty do lokalit (zadání B–F) a lenochod v lokalitách (zadání G).
2. **Po obnovení Supabase + Google OAuth:** účty, Kruh (kód, nástěnka, palce, oslavy), notifikace z kruhu přes Supabase Realtime.
3. **Pak:** sázky, společné výzvy, tituly, lokality 4–6.

Bezpečnost pro děti: účet dítěte zakládá rodič ze svého (rodinný kruh = rodič je správce), žádný volný text, žádné cizí lidi bez kódu, data o dětech jen jméno/přezdívka a splněné aktivity.
