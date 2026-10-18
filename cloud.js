// Klíček – cloud: přihlášení přes Google a synchronizace záznamů do Supabase.
// Appka funguje i bez přihlášení; tohle je jen volitelná vrstva nad localStorage.
(() => {
  'use strict';
  const URL_ = 'https://jsyzrpdeyujqkgmuydlp.supabase.co';
  const KEY_ = 'sb_publishable_Jja1kAQctJEF6kS6FaHMcQ_vKOKrZwi';
  let sb = null, user = null, listeners = [];

  function ready() {
    if (sb) return true;
    if (!window.supabase || !window.supabase.createClient) return false;
    sb = window.supabase.createClient(URL_, KEY_, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    sb.auth.onAuthStateChange((_ev, session) => { user = session ? session.user : null; listeners.forEach(f => { try { f(user); } catch (e) {} }); });
    return true;
  }
  const emit = () => listeners.forEach(f => { try { f(user); } catch (e) {} });

  window.cloud = {
    available: () => ready(),
    user: () => user,
    onAuth(f) { listeners.push(f); },
    async init() {
      if (!ready()) return null;
      const { data } = await sb.auth.getSession();
      user = data.session ? data.session.user : null;
      // uklidit ?code= z adresy po návratu z Googlu
      if (location.search.includes('code=')) history.replaceState(null, '', location.pathname);
      emit();
      return user;
    },
    async signIn() {
      if (!ready()) throw new Error('offline');
      const redirectTo = location.origin + location.pathname;
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) throw error;
    },
    async signOut() { if (ready()) await sb.auth.signOut(); user = null; emit(); },
    // rows: [{day:'YYYY-MM-DD', data:{}, ts:ms}]
    async pushDays(rows) {
      if (!ready() || !user || !rows.length) return;
      const payload = rows.map(r => ({ user_id: user.id, day: r.day, data: r.data, updated_at: new Date(r.ts).toISOString() }));
      const { error } = await sb.from('days').upsert(payload, { onConflict: 'user_id,day' });
      if (error) throw error;
    },
    async pushProfile(state, ts) {
      if (!ready() || !user) return;
      const { error } = await sb.from('profiles').upsert({ user_id: user.id, state, updated_at: new Date(ts).toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    async pull() {
      if (!ready() || !user) return null;
      const [d, p] = await Promise.all([
        sb.from('days').select('day,data,updated_at').eq('user_id', user.id),
        sb.from('profiles').select('state,updated_at').eq('user_id', user.id).maybeSingle()
      ]);
      if (d.error) throw d.error;
      if (p.error) throw p.error;
      return {
        days: (d.data || []).map(r => ({ day: r.day, data: r.data || {}, ts: Date.parse(r.updated_at) })),
        profile: p.data ? { state: p.data.state || {}, ts: Date.parse(p.data.updated_at) } : null
      };
    },
    async wipe() {
      if (!ready() || !user) return;
      await sb.from('days').delete().eq('user_id', user.id);
      await sb.from('profiles').delete().eq('user_id', user.id);
    }
  };
})();
