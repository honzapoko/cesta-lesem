# Klíček na Androidu – návod krok za krokem

Web (GitHub Pages) i nativní appka běží ze stejného kódu. Nativní obal je Capacitor 8.

## 1. Jednorázová příprava počítače (~1 hodina)

1. **Node.js 22** – https://nodejs.org (LTS). Ověř: `node -v`
2. **Android Studio** – https://developer.android.com/studio. Při prvním spuštění nech nainstalovat SDK (Android 15/16) a Android SDK Build-Tools.
3. **Telefon**: Nastavení → O telefonu → Informace o softwaru → 7× klepnout na „Číslo sestavení“ → zpět → Možnosti pro vývojáře → zapnout **Ladění USB**. Připoj kabelem, potvrď dialog „Povolit ladění“.
4. V terminálu ve složce repozitáře:
   ```
   npm install
   ```

## 2. První spuštění na telefonu

```
npm run android
```
Skript zkopíruje web do `www/`, synchronizuje nativní projekt a nabídne zařízení. Vyber S23. Za pár minut je Klíček na ploše jako normální appka.

Když chceš místo toho otevřít projekt v Android Studiu (např. kvůli widgetu):
```
npm run android:open
```

## 3. Po každé změně webu

```
npm run sync
```
a pak Run ▶ v Android Studiu, nebo rovnou `npm run android`.

## 4. Co už v nativní verzi funguje

- Připomínky (Více → Připomínky): ráno a večer, nastavitelné časy, přesné alarmy. Při prvním spuštění se appka zeptá na povolení oznámení.
- Data jsou zrcadlená do nativního úložiště (přežijí vyčištění WebView). Při prvním spuštění nativní appky si data z PWA **nepřenesou** automaticky (jiné úložiště) – použij Více → Stáhnout zálohu v PWA a Obnovit ze zálohy v appce, nebo cloud.
- Přihlášení přes Google: v appce se otevře systémový prohlížeč, po přihlášení se Google vrátí přes odkaz `cz.honzapoko.klicek://auth` zpět do appky (intent-filter v manifestu). V Supabase musí být tato adresa v Authentication → URL Configuration → Redirect URLs jako `cz.honzapoko.klicek://**`.
- Vše ostatní (zahrada, cloud, katalog) beze změny.

## 5. Samsung a připomínky

Samsung uspává aplikace. Pro spolehlivé připomínky: Nastavení → Aplikace → Klíček → Baterie → **Neomezeno**. Appka na to upozorní, když zjistí, že nemá povolené přesné budíky.

## 6. Podpis a vydání na Google Play (až bude účet ověřený)

1. Android Studio → Build → Generate Signed Bundle / APK → **Android App Bundle** → Create new keystore. Keystore ulož mimo repozitář a zálohuj (bez něj nejde appku nikdy aktualizovat).
2. Play Console → Create app → „Poquito“, čeština (výchozí), zdarma. Pozor: `applicationId` (dnes `cz.honzapoko.klicek`) je vidět v adrese na Play a po prvním nahrání **nejde změnit** – rozhodnout předem.
3. Testing → Closed testing → vytvořit track, nahrát `.aab`, přidat e-maily testerů (≥ 12), zveřejnit. Testeři musí být přihlášení 14 dní v kuse.
4. Vyplnit: App content (zásady ochrany dat – URL `<PUBLIC_URL>privacy.html` (soubor `privacy.html` v repu), Data safety, Health apps declaration, cílová skupina), Store listing (texty, ikona 512, grafika 1024×500, screenshoty).
5. Po 14 dnech: Apply for production access → po schválení Production → nahrát a vydat.

Verze: před každým nahráním zvýšit `versionCode` a `versionName` v `android/app/build.gradle`.

## 7. Widgety

Čtyři velikosti (podrž prázdné místo na ploše → Widgety → Poquito):
- **Malý (2×1)**: parťák, dnes splněno x/y, dny v řadě.
- **Střední (4×2)**: parťák + posouvatelné karty úkolů.
- **Velký (4×4)**: parťák, mince, nálada, karty úkolů, věta dne.
- **Úkoly (3×4)**: parťák, karty úkolů s „x z 7 tento týden“ a ukazatelem.

Karty (`widget_task_card.xml`, `KlicekWidgetTasksService`) mají ikonu aktivity, název, týdenní průběh a kulaté odškrtávátko – ťuknutí na kartu = fajfka (fronta `pending`, appka ji vyzvedne při otevření). Parťák v náladě = `res/drawable-nodpi/pal_<id>_<póza>.webp`, ikony `act_*`/`ch_*` (generuje `scripts/widget-pals.py`). Kód: `android/app/src/main/java/cz/honzapoko/klicek/KlicekWidget*.java`.
