// Poquito – překlady. Zdrojový jazyk je čeština: texty v kódu zůstávají česky a tahle vrstva je za běhu
// překládá podle slovníku i18n/<jazyk>.json (klíč = český text, vzory s {0} pro proměnné části).
// Překládá se hotové DOM (MutationObserver), dialogy confirm() a texty pro oznámení/widget přes window.tr().
// Nové texty: po změně textů spustit `node scripts/i18n-extract.mjs` a doplnit chybějící překlady (viz HANDOFF).
(() => {
  'use strict';
  const LANGS = [['cs', 'Čeština'], ['en', 'English'], ['es', 'Español'], ['de', 'Deutsch'], ['fr', 'Français'], ['it', 'Italiano'], ['ru', 'Русский'], ['uk', 'Українська'], ['pl', 'Polski']];
  const IDS = LANGS.map(l => l[0]);
  const DKEY = 'poquito-i18n';
  let lang = 'cs';
  try { const s = JSON.parse(localStorage.getItem('cesta-lesem-v2') || '{}'); if (IDS.includes(s.lang)) lang = s.lang; else if (s.v) lang = 'cs'; else { const nav = (navigator.languages || [navigator.language || 'cs']).map(x => String(x).slice(0, 2).toLowerCase()); lang = nav.find(x => IDS.includes(x)) || 'en'; } } catch (e) {}
  document.documentElement.lang = lang;

  let dict = null, exact = new Map(), pats = [], outs = new Set(), cache = new Map();
  function load(d) {
    dict = d; exact = new Map(); pats = []; outs = new Set(); cache = new Map();
    for (const k in d) { const v = d[k]; if (!v) continue; outs.add(v);
      if (/\{\d+\}/.test(k)) { const parts = k.split(/(\{\d+\})/); const idx = []; const re = parts.map(p => { const m = /^\{(\d+)\}$/.exec(p); if (m) { idx.push(+m[1]); return '(.+?)'; } return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join(''); pats.push({ re: new RegExp('^' + re + '$', 's'), idx, v, w: k.replace(/\{\d+\}/g, '').length }); }
      else exact.set(k, v); }
    pats.sort((a, b) => b.w - a.w);
  }
  // jeden kus textu (bez okrajových mezer)
  function one(t, depth) {
    if (exact.has(t)) return exact.get(t);
    if (outs.has(t)) return t;
    if (depth > 2) return null;
    for (const p of pats) { const m = p.re.exec(t); if (m) { return p.v.replace(/\{(\d+)\}/g, (_, i) => { const g = m[p.idx.indexOf(+i) + 1]; if (g == null) return ''; const r = one(g.trim(), depth + 1); return r == null ? g : g.replace(g.trim(), r); }); } }
    // Velké první písmeno (např. „Pondělí“ z „pondělí“)
    const lc = t.charAt(0).toLowerCase() + t.slice(1);
    if (lc !== t && exact.has(lc)) { const v = exact.get(lc); return v.charAt(0).toUpperCase() + v.slice(1); }
    // číslo + slovo („3 dny“), nebo emoji/symboly kolem textu („🎁 Odměna“)
    let m = /^([\d.,:+\-−×/ ]+\s)(.+)$/s.exec(t); if (m) { const r = one(m[2], depth + 1); if (r != null) return m[1] + r; }
    m = /^([^\p{L}\p{N}]+)([\p{L}\p{N}].*?)([^\p{L}\p{N}]*)$/su.exec(t); if (m && (m[1] || m[3])) { const r = one(m[2], depth + 1); if (r != null) return m[1] + r + m[3]; }
    m = /^(.*?\p{L}.*?)([^\p{L}]+)$/su.exec(t); if (m) { const r = one(m[1], depth + 1); if (r != null) return r + m[2]; }
    // „Lesní mýtina, zamčeno“: přeložit části oddělené čárkou, když se povede každá
    if (t.includes(', ')) { const ps = t.split(', ').map((x, i) => { const r = one(x, depth + 1); if (r != null || !i) return r; const c = exact.get(', ' + x); return c ? c.replace(/^,\s*/, '') : null; }); if (ps.every(x => x != null)) return ps.join(', '); }
    return null;
  }
  function tr(s) {
    if (!dict || s == null) return s;
    s = String(s); const t = s.replace(/\s+/g, ' ').trim(); if (!t || !/\p{L}/u.test(t)) return s;
    let r = cache.get(t); if (r === undefined) { r = one(t, 0); cache.set(t, r); }
    if (r == null) return s;
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    return lead + r + trail;
  }
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1 };
  function el(n) {
    if (n.nodeType === 3) { const p = n.parentNode; if (!p || SKIP[p.nodeName] || (p.closest && p.closest('[data-noi18n],[translate=no]'))) return; const v = tr(n.data); if (v !== n.data) n.data = v; return; }
    if (n.nodeType !== 1 || SKIP[n.nodeName] && n.nodeName !== 'INPUT' && n.nodeName !== 'TEXTAREA') return;
    if (n.closest && n.closest('[data-noi18n],[translate=no]')) return;
    for (const a of ATTRS) if (n.hasAttribute && n.hasAttribute(a)) { const o = n.getAttribute(a), v = tr(o); if (v !== o) n.setAttribute(a, v); }
    if (SKIP[n.nodeName]) return;
    const w = document.createTreeWalker(n, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let x; while ((x = w.nextNode())) { if (x.nodeType === 3) el(x); else for (const a of ATTRS) if (x.hasAttribute(a)) { const o = x.getAttribute(a), v = tr(o); if (v !== o) x.setAttribute(a, v); } }
  }
  const mo = new MutationObserver(recs => { mo.disconnect(); for (const r of recs) { if (r.type === 'childList') r.addedNodes.forEach(el); else el(r.target); } observe(); });
  const observe = () => mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  function start(d) { load(d); el(document.body || document.documentElement); observe(); }

  if (lang !== 'cs') {
    try { const c = JSON.parse(localStorage.getItem(DKEY) || 'null'); if (c && c.lang === lang && c.d) { load(c.d); observe(); document.addEventListener('DOMContentLoaded', () => el(document.body)); } } catch (e) {}
    fetch(`i18n/${lang}.json?v=26`).then(r => r.json()).then(d => { try { localStorage.setItem(DKEY, JSON.stringify({ lang, d })); } catch (e) {} mo.disconnect(); start(d); }).catch(() => {});
    const oc = window.confirm.bind(window); window.confirm = m => oc(tr(m));
    const oa = window.alert.bind(window); window.alert = m => oa(tr(m));
  }
  window.i18n = { lang, LANGS, tr: s => tr(s), set(l) { if (!IDS.includes(l) || l === lang) return; try { localStorage.removeItem(DKEY); } catch (e) {} location.reload(); } };
  window.tr = s => tr(s);
})();
