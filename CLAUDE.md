# CLAUDE.md – pravidla pro práci na Klíčkovi

Tohle čte Claude při každé práci v repozitáři. Krátké, závazné. Stav projektu a další kroky jsou v `HANDOFF.md`.

## Co to je
Klíček (dříve Lenochod) – aplikace na návyky pro Honzu Pokorného a jeho rodinu. Maskot lenochod Klíček. Jeden zdrojový kód běží jako:
- **PWA** na GitHub Pages: https://honzapoko.github.io/cesta-lesem (repo `honzapoko/cesta-lesem`, větev `main`, nasazení = push),
- **Android appka** přes Capacitor 8 (`cz.honzapoko.klicek`), build dělá Honza na Macu: `git pull && npm run android`.

Každá změna webu je tedy automaticky i změnou appky – stačí commit + push a říct Honzovi, ať spustí `npm run android`.

## Jazyk a tón
- S Honzou česky, tykat, krátce, „bottom line“ první. Žádné anglické výrazy, když existuje české slovo.
- Texty v appce česky, laskavě, bez výčitek (viz koncept: večer bez splnění = odpočinek, ne selhání).
- Kód a komentáře: komentáře česky, identifikátory anglicky (`viewGarden`, `PLACE_ITEMS`).

## Technika (neměnit bez důvodu)
- Vanilla JS, žádný framework, žádný bundler. Soubory: `index.html` (CSS uvnitř), `app.js` (vše), `cloud.js` (Supabase), `circle.js` (Kruhy), `native.js` (Capacitor), `mascot.js`, `sw.js`.
- Stav = objekt `S`, uložený v `localStorage['cesta-lesem-v2']`; `save()` ukládá + zrcadlí do Preferences + posílá do cloudu + widgetu + stav do kruhu.
- Kliknutí: jeden delegovaný handler na `[data-*]` atributech (viz `app.addEventListener('click'…)`). Nový prvek = přidat selektor do `closest(...)` + větev `if (ds.xxx)`.
- Render: `render()` → `views[tab]()` vrací HTML string. Žádné průběžné DOM mutace kromě timeru.
- Fonty: Baloo 2 + Nunito (Fredoka NE – chybí č/ě/ů).
- Obrázky: `img/*.webp`; aktivity `img/acts/<id>.webp` (192×192 nebo 192×146), zahrada `img/garden/`, lokality `img/places/<lokalita>/<id>.webp`, avatary `img/avatars/`. Obrázky od Honzy přicházejí z ChatGPT na krémovém pozadí – řezat skriptem (viz HANDOFF „Řezání obrázků“).
- **Verzování**: po každé změně kódu zvýšit trojici `APP_VERSION` (`app.js`, formát `1.N`), `?v=N` u všech `<script>` v `index.html` a `lenochod-vN` v `sw.js` (stejné N) a zapsat řádek do `CHANGELOG.md`: co + **proč** (kdo to chtěl / jaký problém to řeší). GitHub Pages cachuje 10 min, bez verze uživatel vidí starý kód.
- Nový JS soubor = přidat i do `scripts/build-www.mjs` (seznam kopírovaných souborů).

## Ověření před pushem
- `node -e "new Function(require('fs').readFileSync('app.js','utf8'))"` (syntaxe) pro každý změněný JS.
- Playwright render (skripty `shot*.mjs` ve scratchpadu; vzor v HANDOFF). Vždy se podívat na screenshot, ne jen „errors: []“.
- Android kód tady nejde zkompilovat (bez SDK) – XML aspoň zvalidovat, Java zkontrolovat očima, Honza buildí.

## Git
- Před commitem: `CHANGELOG.md` doplněn, verze zvednutá; na konci vlákna `HANDOFF.md` aktualizovaný (datum, stav, další kroky, nové pasti).
- Commit jako `user.name="Honza Pokorný"`, `user.email=ing.honza.pokorny@gmail.com`, zpráva česky.
- Na konec commit message přidat řádky, které dává systémová připomínka (Co-Authored-By + Claude-Session).
- Push rovnou do `main` (je to Honzův osobní projekt, žádné PR).

## Supabase
- Projekt `jsyzrpdeyujqkgmuydlp` (eu-west-1), org „honzapoko's Org“, dashboard https://supabase.com/dashboard/project/jsyzrpdeyujqkgmuydlp
- Publishable key v `cloud.js`. Přihlášení Google OAuth (web: návrat na stránku; Android: `cz.honzapoko.klicek://auth`).
- SQL migrace držet v `supabase/*.sql` (idempotentní). MCP nástroj `apply_migration`/`execute_sql` u DDL často čeká na potvrzení, které k Honzovi nedojde → pošli mu `.sql` soubor a odkaz na SQL Editor: https://supabase.com/dashboard/project/jsyzrpdeyujqkgmuydlp/sql/new
- Funkce v SQL: `set search_path = public` → pgcrypto (`gen_random_bytes`) tam NENÍ, nepoužívat.
- Ladění: `query_logs` (zdroje `edge_logs`, `auth_logs`, `postgres_logs`, `postgrest_logs`) – 404 u RPC = koukni do `postgres_logs`, bývá tam skutečná chyba.
- Free plán se po týdnu bez provozu pozastaví → `restore_project`.

## Bezpečnost / soukromí
- Děti v kruhu: žádné soukromé zprávy, vše vidí celý kruh; sdílí se jen počty ze zaškrtnutých aktivit, nikdy poznámky/deník.
- Žádné tajné klíče do repa (jen publishable key). Client secret Googlu zůstává jen v Supabase.
