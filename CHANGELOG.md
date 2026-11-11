# CHANGELOG – Poquito (dříve Slothkin / Klíček / Lenochod)

Verze = `APP_VERSION` v `app.js` (zobrazuje se ve Více dole) = `?v=N` u skriptů v `index.html` = `lenochod-vN` v `sw.js`. Při každé změně kódu zvýšit všechny tři a přidat řádek sem (co + **proč**). Android `versionCode/versionName` v `android/app/build.gradle` se zvedá jen před nahráním na Google Play.

## 1.32 – 2026-11-11
- Doplněn překlad počítadla „Vědomá vděčnost · N“ (po třech zapsaných se ukazuje jen počet). – *chyběl klíč v i18n.*

## 1.31 – 2026-11-11 (Honza: bez volby počtu)
- Vědomá vděčnost: pryč volba „Kolik denně“; vždy 3 políčka, splněno po vyplnění tří, pak se po jednom přidává další (max 20). Enter na posledním vyplněném políčku skočí rovnou do nového. – *Honza: dej tam 3 pole a po vyplnění přidávej po jednom.*

## 1.30 – 2026-11-11 (Honza: zmizela hezká věc pro manželku, chce víc vnímat dobré věci)
- **Oprava: „Hezká věc pro partnerku“ zase denně na Domů.** Po spuštění 30 gest se denní úkol schovával (gesto ho nahrazovalo). Teď jsou to dva samostatné úkoly; staré dny do 10. 11. se gestem dál počítají jako splněné (`ZENA_SPLIT`). – *Honza: zmizely mi denní hezké věci pro manželku.*
- **Nová výzva „Vědomá vděčnost“** (`vedoma`, Moje aktivity → Výzvy): vlastní karta na Domů „Co hezkého se ti dnes stalo?“ s políčky rovnou k psaní, počet denně 1/3/5 (`S.posN`, výchozí 3), po vyplnění se nabídne další políčko (max 10), Enter skáče dál. Splní se sama, jakmile je zapsáno tolik věcí, kolik je nastaveno. Mety 21 dní a 100 hezkých věcí. Zápisy (`logs[den].vedoma.p`) jsou v Deníku vděčnosti s ✨. – *Honza: potřebuju si víc zvědomovat hezké věci, jinak vidím jen ty negativní.*
- Oprava: meditační časovač odškrtával meditaci jen při zapnuté výzvě Pohyb (`stepOpen(5)` místo `medit`).

## 1.29 – 2026-11-07 (Honza: vyhledávání aktivit)
- **Hledání ve výběru aktivit** (Moje aktivity): pole nahoře (při posunu zůstává viditelné), filtruje výzvy, vlastní i všechny aktivity katalogu podle zobrazeného textu (funguje i v překladech), bez diakritiky; shoda s názvem skupiny ukáže celou skupinu. Když nic, nabídne „Přidat vlastní“ s předvyplněným názvem. – *Honza: v dlouhém seznamu se špatně hledá.*
- „Meta: …“ u výzev se teď překládá (rozdělené na kousky).

## 1.28 – 2026-11-07 (Honza: identifikátor pro Google Play)
- `applicationId` / `appId` **`app.poquito`** (dřív `cz.honzapoko.klicek`), návrat z přihlášení `app.poquito://auth`. Java balíček (namespace) beze změny; widgety hledají obrázky v obou balíčcích zdrojů. – *Honza: v adrese na Google Play nemá být honzapoko; po prvním nahrání by to už nešlo změnit.* Na telefonu se appka nainstaluje jako nová (vedle staré).

## 1.27 – 2026-11-07 (Honza: nová adresa)
- Web běží na **https://poquito-roan.vercel.app** (Vercel, nasazení po každém pushi do `main`; `vercel.json` → výstup `www/`). `PUBLIC_URL` přepnut → na staré github.io se ukáže pruh s přesunem dat. – *Honza nechce v adrese honzapoko/github/cesta-lesem.*

## 1.26 – 2026-11-06 (Honza: Poquito, doporučení, jednotné widgety, nová adresa)
- Nový název **Poquito** (web, manifest, Android, widgety, překlady). – *Honza.*
- **Doporučení** (Více → Doporuč Poquito, `refCard`, `supabase/referrals_v1.sql`): odkaz `?ref=KOD`; nový uživatel po přihlášení dostane 🪙 20, doporučující 🪙 50 za každého pozvaného s ≥ 3 aktivními dny. Ochrana: ne sám sebe, každý jen jednou, jen účty mladší 14 dní. Mince se přičítají v `coinsEarned` ze `S.social.ref`. – *Honza: odměna za doporučení.*
- **Widgety jednotně**: střední 4×2 a velký 4×4 mají stejné karty úkolů (ListView) jako widget Úkoly. – *Honza: 3×4 měl jiný design než ostatní.*
- `PUBLIC_URL` (odkazy z kruhu a doporučení) + **přesun na novou adresu**: na staré `honzapoko.github.io` pruh „Poquito se přestěhovalo“, data se přenesou v `#move=` (fragment, nejde na server). – *Honza nechce v adrese honzapoko/github/cesta-lesem.*

## 1.25 – 2026-11-06 (Honza: vzhled podle HabitBox a „habit ticker“ widgetu)
- **Přehled úkolů na Domů** (přepínač Seznam / Přehled, `S.homeView`): barevné karty s ikonou, „x z 7 tento týden“, mřížkou splněných dní za 22 týdnů (sloupec = týden) a velkým kulatým odškrtávátkem (`habitCard`). – *Honzova předloha HabitBox.*
- **Widget Úkoly 3×4** předělán na posouvatelný seznam karet (`KlicekWidgetTasksService`, `widget_task_card.xml`): ikona aktivity (`res/drawable-nodpi/act_*`, `ch_*`), název, „x z 7 tento týden“ + ukazatel průběhu (na Androidu 12+ v barvě karty), kulaté odškrtávátko; ťuknutí na kartu = fajfka. – *Honzova předloha widgetu s kartami.*

## 1.24 – 2026-11-06 (Honza: víc widgetů, odškrtávání na ploše)
- Nový widget **Úkoly 3×4** (`KlicekWidgetTasks`, `widget_tasks.xml`): parťák v náladě, splněno x / y, dny v řadě, až 8 dnešních úkolů. – *Honza chtěl widget 3×4, kde vidí úkoly a co je splněno.*
- **Fajfka přímo na ploše** (střední, velký i Úkoly): ťuknutí na úkol ho ve widgetu hned přepne a zařadí do fronty `pending` (SharedPreferences); appka si frontu vyzvedne při otevření/návratu (`WidgetBridge.takePending` → `applyWidgetPending`) a zapíše do záznamů, pak teprve posílá nový stav widgetu (`widgetSynced`), aby fajfky nepřepsala. Po půlnoci widget sám ukáže denní úkoly jako nesplněné. – *aby nemusel kvůli fajfce otevírat appku.*
- Všechny widgety ukazují **vybraného parťáka v náladě** (`res/drawable-nodpi/pal_<id>_<póza>.webp`, generuje `scripts/widget-pals.py`) místo lenochoda; „dny v řadě“ a nápověda chodí přeložené z appky.

## 1.23 – 2026-11-06 (Honza: parťák jako avatar v Kruhu)
- Avatar v Kruhu = vybraný parťák v **dnešní náladě** člena (raduje se / smutní podle sdílených aktivit); výběr parťáka i přímo v Kruhu místo 8 lenochodů s čepicí. Nálada do Kruhu se počítá jen ze sdílených aktivit (soukromí); kdo nic nesdílí, má neutrální pózu. Členové se starší verzí dál ukazují lenochoda s čepicí. – *Honza chtěl parťáka i v Kruhu.*

## 1.22 – 2026-11-06 (Honza: nový název, jazyky, parťáci)
- Nový název **Slothkin** (web, manifest, Android `app_name`, widgety). `appId` zůstává `cz.honzapoko.klicek` – *změna by rozbila přihlášení Googlem a instalaci; na Play se zobrazuje jen název.*
- **Parťák**: výběr z 10 zvířátek (lenochod, liška, sova, zajíc, medvídek, vydra, panda červená, kočka, pejsek, mýval), 20 póz každé v `img/pals/<id>/<póza>.webp`; volba `S.pal` (karta na Domů, dokud nevybráno; Více → Tvůj parťák), synchronizuje se do cloudu. – *Honza chce, aby si uživatel vybral avatara.*
- Nálada parťáka (`homeMood`): vše hotovo = nadšený (skáče), aspoň půlka = palec nahoru, něco = jde, nic = ráno mává, odpoledne přemýšlí, večer/minulý den **smutný**, pozdě spí. – *„posmutnělejší, když uživatel neplní, nadšený, když ano“.* Texty dál laskavé.
- **Jazyky**: čeština + angličtina, španělština, němčina, francouzština, italština, ruština, ukrajinština, polština. Vrstva `i18n.js` překládá hotové DOM podle `i18n/<jazyk>.json` (klíč = český text, vzory `{0}`), dialogy, oznámení a widget přes `window.tr`. Volba ve Více → Jazyk (`S.lang`); nový uživatel dostane jazyk prohlížeče, stávající zůstává v češtině. Extrakce textů `node scripts/i18n-extract.mjs`. – *příprava na mezinárodní vydání.*
- Texty, kde „Klíček“ vystupoval jako postava, přepsány neutrálně (parťák může být jakékoli zvíře); úroveň „Klíček“ (= klíček rostliny) zůstává.

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
