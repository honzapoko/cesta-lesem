# CHANGELOG – Klíček

Verze = `APP_VERSION` v `app.js` (zobrazuje se ve Více dole) = `?v=N` u skriptů v `index.html` = `lenochod-vN` v `sw.js`. Při každé změně kódu zvýšit všechny tři a přidat řádek sem (co + **proč**). Android `versionCode/versionName` v `android/app/build.gradle` se zvedá jen před nahráním na Google Play.

## 1.21 – 2026-11-05 (zpětná vazba od Toma)
- Prodej předmětu zpět za 80 % ceny – *aby nákup nebyl zadarmo vratný, jako v jiných hrách.*
- Oslovení v 5. pádu (Tome, Honzo, Tomáši) – *„Ahoj Tom“ znělo cize.*
- Velké cíle (Více): 1–3 dlouhodobé cíle s odměnou 50/75/100 mincí – *motivace na měsíce, ne jen dny.*
- Kruh: ťuknutím na člena se rozbalí jeho sdílené aktivity s fajfkami (`status.items`) – *„0/1“ nebylo srozumitelné.*
- Kruh: vlastní řádek a avatar se berou z telefonu, ne ze serverové kopie – *změna avataru se ukázala až po restartu.*
- SQL `supabase/circles_v3.sql` (posts + status.items).

## 1.20 – 2026-11-05
- Žádný pevný úkol: Ranní procházka je výzva jako ostatní; postup appky (odemykání, šňůra, kalendář, statistiky, mince, mýtina) jde podle **aktivních dní** – *nový uživatel nesmí dostat Honzův návyk v základu.*
- Karta „Začni jednou věcí“ pro uživatele bez úkolů.

## 1.19 – 2026-11-05
- Kruh od prvního dne: pozvánka na Domů, odkaz `?kruh=KOD` otevře Kruh s vyplněným kódem i po přihlášení – *rychlé pozvání dětí.*

## 1.18 – 2026-11-04
- Ikony výzev (10) od Honzy z ChatGPT; pryč vývojářská hláška o SQL v Kruhu – *uživatel ji neměl vidět.*

## 1.17 – 2026-11-04
- „Programy“ → „Výzvy“, jen 9 schválených; aktivitu lze odebrat na Domů i ve výběru, vlastní smazat – *Tom nemohl aktivitu odebrat.*

## 1.16 – 2026-11-04
- Univerzální appka: jméno uživatele (přezdívka/Google), osobní kroky jako volitelné programy, texty bez jmen – *Tom viděl „Ahoj, Honzo“ a procházku s Arčim.*

## 1.15 – 2026-11-03
- Kruh: vzkazy (160 znaků, všem/konkrétnímu, rychlé fráze, mazání autor/zakladatel) – *Honza chtěl slovní podporu, ne jen palce; žádné soukromé zprávy kvůli dětem.*

## 1.14 – 2026-11-03
- Kruhy v1: záložka Kruh, přezdívka + avatar, „Co sdílím“ (výchozí nic), kód, nástěnka, palce max 3/den, mince za podporu. SQL `circles_v1.sql` (oprava: kód bez `gen_random_bytes`).

## 1.13 – 2026-11-03
- Verze `?v=N` u skriptů – *GitHub Pages cachuje 10 min, Honza viděl starý kód.*
- Oprava přihlášení (stínění proměnné `native` v `cloud.signIn`).

## 1.12 – 2026-11-03
- Přihlášení přes Google v Android appce (systémový prohlížeč, návrat `cz.honzapoko.klicek://auth`).

## 1.11 – 2026-11-02
- Klíček v lokalitách: 5 vlastních póz.

## 1.10 – 2026-11-02
- Předměty pro 5 lokalit (116) s obchodem, cenami, řetězci; 50 zbývajících ikon aktivit; 5 lokalit v Zahradě s odemykáním; 8 avatarů.

## 1.9 – 2026-11-02
- Katalog 103 aktivit (vč. Čas bez telefonu); koncept Kruhů a lokalit (`KONCEPT-KRUHY.md`).

## 1.8 – 2026-11-01
- Android: Capacitor projekt, připomínky (per aktivita, kanály, obrázek), widgety 3 velikosti, nativní úložiště.

## 1.7 – 2026-10-27
- Zahrada: 33 předmětů ve 4 hladinách, přesouvání podržením, prodej zpět, Klíček v lotosu.

## 1.6 – 2026-10-21
- Záložka Cesta → Zahrada (5 scén, mince, obchod); Klíček mění výraz podle denní doby a splnění.

## 1.5 – 2026-10-18
- Cloud přes Google účet (Supabase) + webový přehled; výběr aktivit z katalogu 50 + vlastní; meditace se zvuky; Baloo 2 místo Fredoky (chyběly č/ě/ů); maskot Klíček, banner se zlatým klíčem.

## 1.0 – 2026-10-15
- První verze „Lenochod“ (PWA): ranní les, kroky cesty, odemykání za procházky, časovač, kalendář, statistiky.
