// Klíček – nativní vrstva (Capacitor). Na webu se nic z toho nespustí, appka funguje jako dřív.
(() => {
  'use strict';
  const Cap = window.Capacitor;
  const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const P = () => Cap && Cap.Plugins || {};
  const KEY = 'cesta-lesem-v2';

  // ---- úložiště: v nativní appce zrcadlíme localStorage do Preferences (přežije vyčištění WebView) ----
  async function restoreFromPrefs() {
    if (!isNative || !P().Preferences) return;
    try {
      const { value } = await P().Preferences.get({ key: KEY });
      const local = localStorage.getItem(KEY);
      if (value && (!local || JSON.parse(value).updatedAt > (JSON.parse(local).updatedAt || 0))) { localStorage.setItem(KEY, value); return true; }
    } catch (e) {}
    return false;
  }
  let mirrorT = null;
  function mirror() {
    if (!isNative || !P().Preferences) return;
    clearTimeout(mirrorT);
    mirrorT = setTimeout(() => { try { P().Preferences.set({ key: KEY, value: localStorage.getItem(KEY) || '' }); } catch (e) {} }, 800);
  }

  // ---- připomínky ----
  const IDS = { morning: 1, evening: 2 };
  async function ensurePermission() {
    const LN = P().LocalNotifications; if (!LN) return false;
    let s = await LN.checkPermissions();
    if (s.display !== 'granted') s = await LN.requestPermissions();
    return s.display === 'granted';
  }
  async function schedule(cfg) {
    const LN = P().LocalNotifications; if (!isNative || !LN) return 'web';
    const ok = await ensurePermission(); if (!ok) return 'denied';
    try { await LN.cancel({ notifications: [{ id: IDS.morning }, { id: IDS.evening }] }); } catch (e) {}
    const list = [];
    const at = (hm) => { const [h, m] = hm.split(':').map(Number); return { hour: h, minute: m }; };
    if (cfg.morning) list.push({ id: IDS.morning, title: 'Les na tebe čeká 🌲', body: 'Malý krok ráno je víc než velký plán. Klíček jde s tebou.', schedule: { on: at(cfg.morningAt || '07:00'), allowWhileIdle: true }, smallIcon: 'ic_stat_klicek' });
    if (cfg.evening) list.push({ id: IDS.evening, title: 'Zapiš si den 🌙', body: 'Co se dnes povedlo? Stačí jedna fajfka.', schedule: { on: at(cfg.eveningAt || '20:30'), allowWhileIdle: true }, smallIcon: 'ic_stat_klicek' });
    if (list.length) await LN.schedule({ notifications: list });
    // přesné alarmy (Android 12+): bez nich chodí připomínky se zpožděním
    try { const ex = await LN.checkExactNotificationSetting(); if (ex.exact_alarm !== 'granted') return 'inexact'; } catch (e) {}
    return 'ok';
  }
  async function openExactSetting() { try { await P().LocalNotifications.changeExactNotificationSetting(); } catch (e) {} }

  window.native = { isNative, restoreFromPrefs, mirror, schedule, openExactSetting };
})();
