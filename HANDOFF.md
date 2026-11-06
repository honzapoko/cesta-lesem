# HANDOFF.md – stav projektu Slothkin, dříve Klíček (6. 11. 2026, verze 1.24)

Pro nové vlákno s Claudem: přečti `CLAUDE.md` (pravidla), tenhle soubor (stav) a `CHANGELOG.md` (co se měnilo a proč). Pak není potřeba nic dalšího.

## 1. Kde co je
| Co | Kde |
|---|---|
| Repo | github.com/honzapoko/cesta-lesem, větev `main`, 35+ commitů |
| Web (PWA) | https://honzapoko.github.io/cesta-lesem |
| Android | Capacitor 8, `cz.honzapoko.klicek` (appId nechat!), název Slothkin; `npm run android` na Honzově Macu; návod `ANDROID.md` |
| Cloud | Supabase `jsyzrpdeyujqkgmuydlp`; tabulky `days`, `profiles`, `circles`, `members`, `status`, `nudges`, `posts` (posts jen pokud Honza spustil `supabase/circles_v2_posts.sql`) |
| Google OAuth | nastaveno (Google Cloud projekt, test users = rodina). Web i Android přihlášení ověřeno 3. 11. |
| Parťáci | `img/pals/<id>/<póza>.webp` (10 zvířat × 20 póz, 300×300 průhledné), seznam `PALS` a mapování nálada→póza `MOOD_POSE` v `mascot.js`; řezání `scripts/cut-pals.py` |
| Překlady | `i18n.js` + `i18n/<jazyk>.json` (cs zdroj; en es de fr it ru uk pl), seznam klíčů `i18n/_keys.json` z `node scripts/i18n-extract.mjs` |
| Koncept Kruhů, lokalit, grafiky | `KONCEPT-KRUHY.md` (zásady, ekonomika, zadání pro ChatGPT A–I, pořadí prací) |
| Výzkum konkurence + MVP + roadmapa | Claude Doc „Lenochod: konkurence, MVP a roadmapa“ https://claude.ai/code/artifact/21de4f16-1486-4b80-bd5b-bea80b91e9b0 |
| SQL | `supabase/circles_v1.sql` (kruhy, spuštěno), `supabase/circles_v3.sql` (vzkazy + `status.items`; nahrazuje v2) – ověřit `list_tables`, že `posts` existuje a `status` má sloupec `items` |

## 2. Co appka umí (hotovo a ověřeno)
- **Slothkin (6. 11.)**: nový název. **Parťák** = vybrané zvířátko (`S.pal`, karta „Vyber si parťáka“ na Domů, dokud nevybráno; Více → Tvůj parťák). `mascot(mood)` kreslí pózu zvoleného parťáka; `homeMood` vrací cheer/joy (vše hotovo), thumbs (≥ půlka), walk (něco), wave (ráno nic), think (odpoledne nic), sad (večer/minulý den nic), sleep (po 22 h nic), book/tea (večer něco). Zahrada a lokality zatím používají původního lenochoda (`img/garden/sloth-*`, `img/places/sloth-*`) – Honza: „zenovou zahradu vyřešíme později“.
- **Jazyky (6. 11.)**: `i18n.js` překládá za běhu hotové DOM (MutationObserver) podle slovníku; klíč = přesný český text (bez okrajových mezer), vzory s `{0}` pro proměnné části; záložní pravidla: velké první písmeno, „číslo + slovo“, emoji kolem textu. `window.tr()` pro texty mimo DOM (oznámení, widget, confirm/alert). Volba Více → Jazyk (`S.lang`, přepnutí = reload). Čeština se nepřekládá vůbec (žádná režie).
- **Univerzální pro každého uživatele (4. 11.)**: jméno se bere z `S.me.nick` (karta „Jak ti má Klíček říkat?“ na Domů, dokud není vyplněno) nebo z Google účtu; **žádný pevný úkol** – i Ranní procházka je výzva (`les`, s mincemi navíc); postup appky (odemykání `UNLOCKS`, šňůra, lokalita mýtina) jde podle **aktivních dní** = den s aspoň jedním splněným úkolem (`anyDone`, `walks()` = počet aktivních dní, `dayRun`, `bestDayRun`). Nový uživatel bez úkolů vidí kartu „Začni jednou věcí“. Výzvy (`STEPS[i].prog`, zapnuté v `S.programs`, výběr v Moje aktivity → Výzvy, vypnutí i přímo na Domů): Pro partnerku (+30 gest), Večerní věta, Spánek, Meditace, Pohyb týdně, Škola a učení, Čtenář, Digitální večer, Peníze pod kontrolou. Aktivity jdou odebrat na Domů („Odebrat“) i v Moje aktivity (ťuknutí; vlastní mají ×). Ikony výzev ✔ `img/challenges/<id>.webp` (taskHtml, výběr, Co sdílím). Migrace: existující uživatel dostane zapnuté ty programy, které už měl v logu. Žádná jména (Honza, Arči, Pepa) v textech appky.
- **Domů**: úkoly dne (pevné kroky `STEPS` + volitelné aktivity z katalogu `CATALOG`, 103 položek v 5 skupinách, všechny s ikonou; vlastní aktivity `S.custom`), nálada Klíčka podle denní doby a splnění (`homeMood`), týdenní pás, věta dne, 30 gest pro manželku, odemykání vylepšení za procházky (`UNLOCKS`), úrovně XP.
- **Zahrada** (tab `path`): 5 zenových scén + 5 lokalit (mýtina, chata, pláž, observatoř, kuchyně) s odemykáním (`PLACES`: 30 lesů / úroveň Stromek / 30× Spát včas / Kruh – brzy). Mince `coinsEarned()` (1/úkol, 3 les, +3 celý den, +10 za 7 dní lesa, + podpora v kruhu). 33 předmětů zahrady (`GARDEN_ITEMS`) + 116 v lokalitách (`PLACE_ITEMS`), 4 cenové hladiny, řetězce `replaces/needs`, prodej zpět ťuknutím, přesun podržením 250 ms, pozice per scéna `S.garden.pos`. Klíček má v každé lokalitě vlastní pózu `img/places/sloth-<loc>.webp`.
- **Kalendář, Statistiky** (odemykají se).
- **Kruh** (tab `circle`, dostupný od prvního dne, bez odemykání; pozvánka na Domů `circleTeaser()`, odkaz `?kruh=KOD` otevře Kruh s předvyplněným kódem i po přihlášení přes Google): přezdívka + avatar (8), „Co sdílím“ (`S.share`, výchozí nic), založit/připojit kódem (6 znaků), nástěnka členů (splněno x/y ze sdílených, 🔥 řetěz, nálada), palce 💪 max 3/den/osoba, „Dnes ti drží palce“, vzkazy (160 znaků, všem/konkrétnímu, rychlé fráze, mazání autor/zakladatel). Stav se posílá v `scheduleStatus()` po každém `save()`.
- **Velké cíle** (Více): `S.goals` [{id,t,coins 50/75/100,done}], max 3 otevřené, splnění přičte mince do `coinsEarned`. Prodej předmětu zpět = 80 % ceny (`sellPrice`, rozdíl v `S.garden.fee`). Oslovení v 5. pádu `vocative()`.
- **Kruh – detail člena**: `status.items` = sdílené aktivity s fajfkami, ťuknutím na řádek se rozbalí; vlastní řádek se bere z lokálního `myStatus()` (ne ze serveru), po odeslání stavu se kruh obnoví.
- **Více**: meditační časovač (5/10/20, zvuky Ticho/Les/Voda/Déšť přes Web Audio), odměny, deník, připomínky (per aktivita: denně/interval, 3 kanály jemné/výrazné/tiché, obrázek), cloud (Propojit s Google, Synchronizovat, Odhlásit, Smazat v cloudu), záloha/obnova JSON, téma.
- **Dashboard** pro ≥ 960 px (`viewDashboard/renderSide`).
- **Android**: oznámení (přesné alarmy, kanály, zvuky `res/raw`), widgety malý/střední/velký (`KlicekWidget*.java`, `WidgetBridgePlugin`), Preferences zrcadlení, deep link pro OAuth.
- **Cloud sync**: `days` (per den) + `profiles` (klíče `PROFILE_KEYS`), merge novější vyhrává (`pullMerge`).

## 3. Co je rozpracované / další kroky (v tomhle pořadí)
- **Nové (6. 11.)**: a) Honza projde překlady v appce (Více → Jazyk) – texty, které zůstaly česky, doplnit: `node scripts/i18n-extract.mjs` ukáže chybějící klíče, přeložit, uložit do `i18n/*.json`, zvednout `?v=` u fetch v `i18n.js`. b) Zahrada/lokality s vybraným parťákem (dnes lenochod) – potřeba pózy do scén. c) ✔ 1.23: avatar v Kruhu = parťák v náladě (`avatarImg(avatar, mood)`, `status.avatar` = id parťáka; staré id čepic se dál kreslí z `img/avatars`). d) ✔ 1.24: widget Úkoly 3×4 + odškrtávání ťuknutím na ploše (fronta `pending` → `applyWidgetPending`), parťák ve widgetech. **Neověřeno na telefonu** – Honza má vyzkoušet: přidat widget „Slothkin – úkoly“, odškrtnout, otevřít appku, fajfka musí zůstat. Zbylé české texty v Javě jen jako výchozí (než appka pošle stav). e) Obsah je místy česko-specifický (výzva „Pro partnerku“, vocativ) – pro mezinárodní verzi projít. f) Ikona appky a Play listing pod novým názvem.
0. **Tom (syn) testuje a posílá zpětnou vazbu** – vše z 4.–5. 11. vyřešeno (CHANGELOG 1.16–1.21). Nevyjasněno: Tom tvrdí, že na Androidu se zapnutí/vypnutí aktivity projeví až po restartu – na webu nereprodukováno; při další zprávě chtít přesný postup.
1. **Ověřit SQL v3** – Honza má spustit `supabase/circles_v3.sql` (vzkazy + `status.items`); k 6. 11. 00:30 tabulka `posts` v DB NEBYLA. Ověřit `list_tables`. Kruh „Rodina“: kód **PUTF45**, členové Jan (Honza) a Tom.
2. **Děti do kruhu** – přihlášení přes Google na webu (jsou v test users), zadat kód. Případně jim nahrát Android appku (stejný postup jako Honzovi, jiný telefon = `adb devices`).
3. **Oslavy v kruhu** – když člen splní celý sdílený den / metu, ostatním se ukáže s konfetami + tlačítko Pogratulovat (`kind: 'gratulace'` už v `nudges` existuje).
4. **Notifikace z kruhu** – Supabase Realtime na `nudges`/`posts` → v appce toast, na Androidu lokální oznámení.
5. **Sázky „Věřím ti“** (`bets` tabulka, koncept kap. 3), společné výzvy, titul „Opora kruhu“.
6. **Odemykání pláže a kuchyně** podle kruhu (dnes `ok: () => false`): pláž = společná výzva, kuchyně = kruh ≥ 3 lidé (jde udělat hned z `S.social.data`).
7. **Google Play**: Honza čeká na ověření vývojářského účtu; postup v `ANDROID.md` kap. 6 (keystore, closed testing 12 testerů 14 dní, zásady ochrany soukromí – bude potřeba URL, lze dát do repa jako `privacy.html`).
8. Drobnosti: lock ikona u zamčených lokalit je malá; v kuchyni Klíček sedí na stole (přijatelné); ikony houpačky a psa pod stolem od ChatGPT jsou zvláštní (Honza může přegenerovat).

## 4. Jak testuju (Playwright v sandboxu)
```js
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
// statický server nad /home/claude/cesta-lesem, viewport 390×844, deviceScaleFactor 2, timezone Europe/Prague
// addInitScript: localStorage.setItem('cesta-lesem-v2', JSON.stringify({ v:2, logs:{}, rewards:{}, celebrated:[], unlockSeen:2, celDays:{}, theme:'light', active:[...], garden:{owned:[],scene:'path',unlocked:[...]}, share:[...], me:{nick,avatar} }))
// executablePath '/opt/pw-browsers/chromium', args ['--no-sandbox']
// Kruh bez cloudu: po načtení přepsat cloud.user, circle.ready/uid/load/coins/pushStatus mockem, pak kliknout na tab.
```
Pozor: `addInitScript` se spouští při každém `goto` – pro různé stavy založit nový context. Screenshoty slepit PIL do jednoho obrázku a podívat se.

## 5. Řezání obrázků od Honzy (ChatGPT, krémové pozadí #FBF3E6)
Skript ve stylu `cutitems.py`: PIL + numpy + scipy.ndimage.
1. `bg` = medián okrajových pixelů; `diff = |a−bg|.sum`; stín = `diff<90 & sat<0.25 & max>150` (vyhodit); maska `diff>28 & ~stín`, `binary_opening(2)`.
2. Komponenty: nechat největší + ty > 2 % největší, které se nedotýkají okraje (tolerance 40 px) a leží blízko hlavní (≤ 12 % šířky). Tím zmizí útržky sousedních objektů na archu.
3. `binary_closing(4)` + `fill_holes`, alfa = `gaussian(1.0–1.2)`, ořez + 6–10 px, zmenšit na max 480–520 px, `webp quality 85`.
4. Archy 2×5 ikon: pevná mřížka buněk, v buňce bbox masky; archy mohou mít prohozené pořadí – vždy zkontrolovat kontaktní list.
Trvá ~2,5 s/obrázek → spouštět na pozadí (`run_in_background`) a čekat `until`-smyčkou.

## 6. Známé pasti
- **Překlady**: každý nový/změněný český text v kódu = nový klíč → bez překladu zůstane česky. Po změně textů vždy `node scripts/i18n-extract.mjs` a doplnit. Text skládaný z kousků (`'a' + x + 'b'`, šablony) se překládá jako vzor jen tehdy, když je v DOM v jednom textovém uzlu; věty rozdělené tagy `<b>` se překládají po kouscích. Uživatelský obsah (vlastní aktivity, vzkazy) se nepřekládá, jen když se náhodou shoduje s klíčem.
- Slovník je cachovaný v `localStorage['slothkin-i18n']`; po úpravě `i18n/*.json` zvednout `?v=N` ve `fetch` v `i18n.js`.
- `const native = window.native && native.isNative` → TDZ chyba (stínění). Pojmenovat jinak.
- GitHub Pages cache 10 min → verze `?v=N` u skriptů, jinak Honza vidí starý kód a „nic nefunguje“.
- Supabase MCP `apply_migration`/`execute_sql` s DDL: dotaz na potvrzení se k Honzovi nedostane, timeout 230 s → poslat `.sql` soubor. Krátké `execute_sql` (create or replace function, revoke) prošly bez dotazu.
- `search_path = public` ve funkcích: `gen_random_bytes` není (pgcrypto je ve schématu `extensions`).
- Po `create function` přes SQL Editor PostgREST někdy nevidí funkci → `notify pgrst, 'reload schema'`; 404 u RPC ale častěji = chyba uvnitř funkce (koukni `postgres_logs`).
- Mac/Android: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`, `ANDROID_HOME=~/Library/Android/sdk`; Samsung zabezpečená složka → `adb install -r --user 0 …`; „No devices found“ → `adb kill-server`, kabel, dialog v telefonu.
- `rm -rf *` ve scratchpadu blokuje sandbox → použít novou složku.
- Honza píše stručně a pozdě večer; když něco „nefunguje“, nejdřív koukni do Supabase logů, než se ptáš.

## 7. Co Honza chce (preference)
- Pozitivní motivace, ne výčitky. Žádné žebříčky. Děti rovnocenné.
- Rád dodává grafiku z ChatGPT; chce zadání ve formě promptů (anglicky, stylová věta v konceptu kap. 5).
- Chce vždy aktualizovat obě verze (web + Android) = commit + push + připomenout `npm run android`.
- Krok za krokem s odkazy přímo na nastavení, když má něco udělat sám.
