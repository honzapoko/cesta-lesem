// Klíček – Kruhy: datová vrstva nad Supabase (viz KONCEPT-KRUHY.md a supabase/circles_v1.sql).
// Všechno jde přes cloud.sb() a RPC; appka bez přihlášení funguje beze změny.
(() => {
  'use strict';
  const sb = () => (window.cloud && cloud.sb()) || null;
  const uid = () => (window.cloud && cloud.user() && cloud.user().id) || null;
  const throwIf = e => { if (e) throw e; };

  window.circle = {
    AVATARS: ['leaf', 'glasses', 'beanie', 'flower', 'scarf', 'headphones', 'crown', 'cap'],
    KINDS: { palec: '💪 Držím palce', mysli: '🦥 Klíček na tebe myslí', gratulace: '🎉 Gratuluju' },
    ready: () => !!(sb() && uid()),
    uid,
    // moje kruhy + členové + jejich stav + dnešní palce
    async load() {
      const s = sb(); if (!s || !uid()) return null;
      const c = await s.from('circles').select('id,code,name,owner,created_at').order('created_at'); throwIf(c.error);
      const ids = (c.data || []).map(x => x.id);
      if (!ids.length) return { circles: [], members: [], status: {}, nudges: [] };
      const [m, st, nd] = await Promise.all([
        s.from('members').select('circle_id,user_id,joined_at').in('circle_id', ids),
        s.from('status').select('user_id,nick,avatar,day,done,total,streak,mood,updated_at'),
        s.from('nudges').select('id,circle_id,from_user,to_user,kind,day,created_at').gte('day', new Date(Date.now() - 864e5).toISOString().slice(0, 10)).order('created_at', { ascending: false }).limit(200)
      ]);
      throwIf(m.error); throwIf(st.error); throwIf(nd.error);
      const status = {}; (st.data || []).forEach(r => { status[r.user_id] = r; });
      return { circles: c.data || [], members: m.data || [], status, nudges: nd.data || [] };
    },
    async create(name) { const s = sb(); const { data, error } = await s.rpc('create_circle', { p_name: name }); throwIf(error); return Array.isArray(data) ? data[0] : data; },
    async join(code) { const s = sb(); const { data, error } = await s.rpc('join_circle', { p_code: code }); throwIf(error); return Array.isArray(data) ? data[0] : data; },
    async leave(circleId) { const s = sb(); const { error } = await s.from('members').delete().eq('circle_id', circleId).eq('user_id', uid()); throwIf(error); },
    async rename(circleId, name) { const s = sb(); const { error } = await s.from('circles').update({ name }).eq('id', circleId); throwIf(error); },
    async nudge(circleId, toUser, kind) { const s = sb(); const { data, error } = await s.rpc('send_nudge', { p_circle: circleId, p_to: toUser, p_kind: kind || 'palec' }); throwIf(error); return data; },
    // můj stav dne (jen sdílené aktivity, počty, nálada) – voláno po každém uložení
    async pushStatus(st) {
      const s = sb(); if (!s || !uid()) return;
      const row = Object.assign({ user_id: uid(), updated_at: new Date().toISOString() }, st);
      const { error } = await s.from('status').upsert(row, { onConflict: 'user_id' }); throwIf(error);
    },
    async coins() { const s = sb(); if (!s || !uid()) return null; const { data, error } = await s.rpc('nudge_coins'); if (error) return null; const r = Array.isArray(data) ? data[0] : data; return r ? { sent: r.sent || 0, received: r.received || 0 } : null; },
    // chyby RPC → česky
    msg(e) {
      const t = String(e && (e.message || e)) || '';
      if (t.includes('relation') && t.includes('does not exist') || t.includes('42P01') || t.includes('PGRST202') || t.includes('schema cache')) return 'Databáze kruhů ještě není připravená (spusť supabase/circles_v1.sql).';
      if (t.includes('no such circle')) return 'Kruh s tímhle kódem neexistuje. Zkontroluj překlepy.';
      if (t.includes('circle full')) return 'Kruh je plný (max 8 lidí).';
      if (t.includes('too many')) return 'Můžeš být nejvíc v 5 kruzích.';
      if (t.includes('limit')) return 'Dnes už jsi mu poslal 3 palce. Zítra zas.';
      if (t.includes('not signed')) return 'Nejdřív se přihlas (Více → Propojit s Google účtem).';
      if (t.includes('Failed to fetch') || t.includes('network')) return 'Jsi offline. Zkus to, až budeš mít připojení.';
      return 'Nepovedlo se. Zkus to znovu.';
    }
  };
})();
