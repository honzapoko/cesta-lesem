// Poquito (dříve Klíček) – nativní vrstva (Capacitor). Na webu se nic z toho nespustí, appka funguje jako dřív.
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
  // Android: zvuk a vzhled se nastavují na KANÁL, ne na jednotlivé oznámení. Uživatel si vybere kanál
  // u každé aktivity; konkrétní zvuk kanálu může změnit v nastavení telefonu (Oznámení → Klíček).
  const CHANNELS = [
    { id: 'gentle', name: 'Jemné', description: 'Tiché cinknutí, bez vibrace', importance: 3, vibration: false, sound: 'gentle.wav' },
    { id: 'strong', name: 'Výrazné', description: 'Zvuk i vibrace, vyskočí nahoře', importance: 4, vibration: true, sound: 'chime.wav' },
    { id: 'silent', name: 'Tiché', description: 'Jen v liště, bez zvuku', importance: 2, vibration: false, sound: null }
  ];
  let channelsReady = false;
  async function ensureChannels() {
    const LN = P().LocalNotifications; if (!LN || channelsReady) return;
    for (const c of CHANNELS) { try { await LN.createChannel({ id: c.id, name: (window.tr || (x => x))(c.name), description: (window.tr || (x => x))(c.description), importance: c.importance, vibration: c.vibration, sound: c.sound || undefined, visibility: 1, lights: true, lightColor: '#EFA23A' }); } catch (e) {} }
    channelsReady = true;
  }
  async function ensurePermission() {
    const LN = P().LocalNotifications; if (!LN) return false;
    let s = await LN.checkPermissions();
    if (s.display !== 'granted') s = await LN.requestPermissions();
    return s.display === 'granted';
  }
  const hm = s => { const [h, m] = String(s || '07:00').split(':').map(Number); return { hour: h, minute: m }; };
  const idFor = (key, k) => 1000 + Math.abs([...(key + ':' + k)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7)) % 800000;
  /**
   * rules: [{ key, title, body, image?, channel: 'gentle'|'strong'|'silent', mode: 'daily'|'interval'|'off',
   *           at: 'HH:MM', every: minutes, from: 'HH:MM', to: 'HH:MM' }]
   */
  async function scheduleRules(rules) {
    const LN = P().LocalNotifications; if (!isNative || !LN) return 'web';
    const ok = await ensurePermission(); if (!ok) return 'denied';
    await ensureChannels();
    try { const pend = await LN.getPending(); if (pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map(x => ({ id: x.id })) }); } catch (e) {}
    const list = [];
    for (const r of rules) {
      if (!r || r.mode === 'off') continue;
      const base = { title: (window.tr || (x => x))(r.title), body: (window.tr || (x => x))(r.body), channelId: r.channel || 'gentle', smallIcon: 'ic_stat_klicek', largeIcon: 'widget_sloth', extra: { key: r.key } };
      if (r.image) base.attachments = [{ id: 'img', url: r.image }];
      if (r.mode === 'daily') list.push(Object.assign({ id: idFor(r.key, 'd'), schedule: { on: hm(r.at), allowWhileIdle: true } }, base));
      else if (r.mode === 'interval') {
        // opakování v okně od–do: jedno oznámení pro každý čas v okně (max 48 za den)
        const f = hm(r.from || '08:00'), t = hm(r.to || '20:00'); const ev = Math.max(15, +r.every || 60);
        let m = f.hour * 60 + f.minute; const end = t.hour * 60 + t.minute; let k = 0;
        while (m <= end && k < 48) { list.push(Object.assign({ id: idFor(r.key, 'i' + k), schedule: { on: { hour: Math.floor(m / 60), minute: m % 60 }, allowWhileIdle: true } }, base)); m += ev; k++; }
      }
    }
    for (let i = 0; i < list.length; i += 50) await LN.schedule({ notifications: list.slice(i, i + 50) });
    try { const ex = await LN.checkExactNotificationSetting(); if (ex.exact_alarm !== 'granted') return 'inexact'; } catch (e) {}
    return 'ok';
  }
  async function openChannelSettings(channel) {
    try { const App = P().App; const info = await App.getInfo();
      // otevře systémové nastavení kanálu (zvuk, vibrace, styl)
      const i = 'intent:#Intent;action=android.settings.CHANNEL_NOTIFICATION_SETTINGS;S.android.provider.extra.APP_PACKAGE=' + info.id + ';S.android.provider.extra.CHANNEL_ID=' + channel + ';end';
      window.open(i, '_system');
    } catch (e) {}
  }
  async function testNotify(rule) {
    const LN = P().LocalNotifications; if (!LN) return; await ensurePermission(); await ensureChannels();
    const base = { id: 999999, title: (window.tr || (x => x))(rule.title), body: (window.tr || (x => x))(rule.body), channelId: rule.channel || 'gentle', smallIcon: 'ic_stat_klicek', largeIcon: 'widget_sloth', schedule: { at: new Date(Date.now() + 1500) } };
    if (rule.image) base.attachments = [{ id: 'img', url: rule.image }];
    await LN.schedule({ notifications: [base] });
  }
  // legacy API (ranní/večerní) → převedeno na pravidla
  async function schedule(cfg) { return scheduleRules([
    cfg.morning ? { key: 'morning', title: 'Les na tebe čeká 🌲', body: 'Malý krok ráno je víc než velký plán.', channel: 'gentle', mode: 'daily', at: cfg.morningAt || '07:00' } : null,
    cfg.evening ? { key: 'evening', title: 'Zapiš si den 🌙', body: 'Co se dnes povedlo? Stačí jedna fajfka.', channel: 'gentle', mode: 'daily', at: cfg.eveningAt || '20:30' } : null
  ]); }
  async function openExactSetting() { try { await P().LocalNotifications.changeExactNotificationSetting(); } catch (e) {} }

  // fajfky odškrtnuté přímo ve widgetu (fronta v SharedPreferences), vyzvedne je app.js
  async function takeWidgetPending() { try { const W = P().WidgetBridge; if (!W || !W.takePending) return []; const r = await W.takePending(); return JSON.parse((r && r.json) || '[]'); } catch (e) { return []; } }
  async function updateWidget(state) { try { const W = P().WidgetBridge; if (W) await W.update({ json: JSON.stringify(state) }); } catch (e) {} }

  // návrat z Google přihlášení (cz.honzapoko.klicek://auth?code=...)
  if (isNative && P().App && P().App.addListener) {
    try { P().App.addListener('appUrlOpen', ({ url }) => { if (url && url.startsWith('cz.honzapoko.klicek://') && window.cloud) cloud.handleDeepLink(url); }); } catch (e) {}
  }
  window.native = { isNative, restoreFromPrefs, mirror, schedule, scheduleRules, openExactSetting, openChannelSettings, testNotify, updateWidget, takeWidgetPending, CHANNELS };
})();
