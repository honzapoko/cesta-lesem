# HANDOFF.md – stav projektu Klíček (3. 11. 2026)

Pro nové vlákno s Claudem: přečti `CLAUDE.md` (pravidla) a tenhle soubor (stav). Pak není potřeba nic dalšího.

## 1. Kde co je
| Co | Kde |
|---|---|
| Repo | github.com/honzapoko/cesta-lesem, větev `main`, 35+ commitů |
| Web (PWA) | https://honzapoko.github.io/cesta-lesem |
| Android | Capacitor 8, `cz.honzapoko.klicek`, název Klíček; `npm run android` na Honzově Macu; návod `ANDROID.md` |
| Cloud | Supabase `jsyzrpdeyujqkgmuydlp`; tabulky `days`, `profiles`, `circles`, `members`, `status`, `nudges`, `posts` (posts jen pokud Honza spustil `supabase/circles_v2_posts.sql`) |
| Google OAuth | nastaveno (Google Cloud projekt, test users = rodina). Web i Android přihlášení ověřeno 3. 11. |
| Koncept Kruhů, lokalit, grafiky | `KONCEPT-KRUHY.md` (zásady, ekonomika, zadání pro ChatGPT A–I, pořadí prací) |
| Výzkum konkurence + MVP + roadmapa | Claude Doc „Lenochod: konkurence, MVP a roadmapa“ https://claude.ai/code/artifact/21de4f16-1486-4b80-bd5b-bea80b91e9b0 |
| SQL | `supabase/circles_v1.sql` (kruhy), `supabase/circles_v2_posts.sql` (vzkazy) |

## 2. Co appka umí (hotovo a ověřeno)
- **Domů**: úkoly dne (pevné kroky `STEPS` + volitelné aktivity z katalogu `CATALOG`, 103 položek v 5 skupinách, všechny s ikonou; vlastní aktivity `S.custom`), nálada Klíčka podle denní doby a splnění (`homeMood`), týdenní pás, věta dne, 30 gest pro manželku, odemykání vylepšení za procházky (`UNLOCKS`), úrovně XP.
- **Zahrada** (tab `path`): 5 zenových scén + 5 lokalit (mýtina, chata, pláž, observatoř, kuchyně) s odemykáním (`PLACES`: 30 lesů / úroveň Stromek / 30× Spát včas / Kruh – brzy). Mince `coinsEarned()` (1/úkol, 3 les, +3 celý den, +10 za 7 dní lesa, + podpora v kruhu). 33 předmětů zahrady (`GARDEN_ITEMS`) + 116 v lokalitách (`PLACE_ITEMS`), 4 cenové hladiny, řetězce `replaces/needs`, prodej zpět ťuknutím, přesun podržením 250 ms, pozice per scéna `S.garden.pos`. Klíček má v každé lokalitě vlastní pózu `img/places/sloth-<loc>.webp`.
- **Kalendář, Statistiky** (odemykají se).
- **Kruh** (tab `circle`): přezdívka + avatar (8), „Co sdílím“ (`S.share`, výchozí nic), založit/připojit kódem (6 znaků), nástěnka členů (splněno x/y ze sdílených, 🔥 řetěz, nálada), palce 💪 max 3/den/osoba, „Dnes ti drží palce“, vzkazy (160 znaků, všem/konkrétnímu, rychlé fráze, mazání autor/zakladatel). Stav se posílá v `scheduleStatus()` po každém `save()`.
- **Více**: meditační časovač (5/10/20, zvuky Ticho/Les/Voda/Déšť přes Web Audio), odměny, deník, připomínky (per aktivita: denně/interval, 3 kanály jemné/výrazné/tiché, obrázek), cloud (Propojit s Google, Synchronizovat, Odhlásit, Smazat v cloudu), záloha/obnova JSON, téma.
- **Dashboard** pro ≥ 960 px (`viewDashboard/renderSide`).
- **Android**: oznámení (přesné alarmy, kanály, zvuky `res/raw`), widgety malý/střední/velký (`KlicekWidget*.java`, `WidgetBridgePlugin`), Preferences zrcadlení, deep link pro OAuth.
- **Cloud sync**: `days` (per den) + `profiles` (klíče `PROFILE_KEYS`), merge novější vyhrává (`pullMerge`).

## 3. Co je rozpracované / další kroky (v tomhle pořadí)
1. **Ověřit vzkazy** – Honza musel spustit `circles_v2_posts.sql`; zkontrolovat v `list_tables`, že `posts` existuje. Honzův kruh: kód **PUTF45**.
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
