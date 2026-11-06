// Vytáhne české texty z JS/HTML do i18n/_keys.json (klíče pro překlad; vzory s {0} = proměnná část)
// a vypíše, kolik klíčů chybí v jednotlivých i18n/<jazyk>.json. Spuštění: node scripts/i18n-extract.mjs
// (acorn je v sandboxu Clauda v /opt/npm-tools; jinde `npm i -D acorn acorn-walk` a upravit importy)
import * as acorn from '/opt/npm-tools/node_modules/acorn/dist/acorn.mjs';
import * as walk from '/opt/npm-tools/node_modules/acorn-walk/dist/walk.mjs';
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const keys = new Map(); // key -> source info
const DIA = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/;
const add = (k, src) => { k = k.replace(/\s+/g, ' ').trim(); if (!k) return; if (!/\p{L}{2,}/u.test(k.replace(/\{\d+\}/g, ''))) return; if (/^(https?:|\.\/|img\/|#|\/)/.test(k)) return; if (/[{}=]|;\S/.test(k.replace(/\{\d+\}/g, ''))) return; if (/^[a-z0-9_\-]+$/.test(k) && !DIA.test(k) && src !== 'force') return; if (/^[\w\-]+(:[\w\-#%., ()]+;?)+$/.test(k) && !DIA.test(k)) return; if (k === 'use strict' || /^[a-z0-9]+(-[a-z0-9]+)+$/.test(k)) return; if (!keys.has(k)) keys.set(k, src); };
const M = i => `\u0001${i}\u0002`;
function segments(str, src) {
  // str obsahuje markery \u0001i\u0002 za výrazy; rozdělit podle HTML tagů
  const attrs = /\s(?:placeholder|title|aria-label|alt|label)="([^"]*)"/g;
  for (const tag of str.match(/<[^>]*>/g) || []) { let m; while ((m = attrs.exec(tag))) seg(m[1], src); }
  for (const part of str.split(/<[^>]*>/)) seg(part, src);
}
function seg(t, src) {
  t = t.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return;
  let n = 0; const map = {};
  t = t.replace(/\u0001(\d+)\u0002/g, (_, i) => { if (!(i in map)) map[i] = n++; return `{${map[i]}}`; });
  // vzor jen z placeholderů a interpunkce je k ničemu
  if (!/\p{L}{2,}/u.test(t.replace(/\{\d+\}/g, ''))) return;
  add(t, src);
}
function human(s) {
  if (!/\p{L}/u.test(s)) return false;
  if (DIA.test(s)) return true;
  if (/^[A-Z][a-z]/.test(s) && !/[\/\\{}=;<>#$_]/.test(s) && !/^[A-Z][a-zA-Z]+[A-Z]/.test(s)) return true; // Velké písmeno, ne camelCase
  if (/ /.test(s) && /[a-z]{2,} [a-z]{2,}/.test(s) && !/[{}=;#$\\:()]/.test(s)) return true;
  return false;
}
const SKIPPROP = new Set(['id', 'ic', 'kind', 'note', 'tab', 'img', 'src', 'key', 'type', 'cls', 'scene', 'loc', 'needs', 'replaces', 'cat', 'icon', 'ch', 'channel', 'sound', 'res', 'avatar', 'em', 'prog_id', 'unlock', 'req']);
for (const f of ['app.js', 'circle.js', 'cloud.js', 'native.js', 'mascot.js']) {
  const code = fs.readFileSync(`${root}/${f}`, 'utf8');
  const ast = acorn.parse(code, { ecmaVersion: 2023, sourceType: 'script' });
  walk.fullAncestor(ast, (node, st, anc) => {
    const parent = anc[anc.length - 2];
    if (anc.some(a => a.type === 'FunctionDeclaration' && a.id && a.id.name === 'vocative')) return; // 5. pád jen pro češtinu
    if (node.type === 'TemplateLiteral') {
      if (parent && parent.type === 'TaggedTemplateExpression') return;
      let s = ''; node.quasis.forEach((q, i) => { s += q.value.cooked; if (i < node.expressions.length) s += M(i); });
      if (/[<>]/.test(s)) segments(s, f); else seg(s, f);
    } else if (node.type === 'Literal' && typeof node.value === 'string') {
      const v = node.value;
      if (parent && parent.type === 'Property' && parent.key === node) return;
      if (parent && parent.type === 'Property' && SKIPPROP.has(parent.key.name || parent.key.value)) return;
      if (/<[a-z\/][^>]*>/i.test(v)) { segments(v, f); return; }
      if (parent && parent.type === 'CallExpression' && parent.callee.name === 'plural') { add(v, 'force'); return; }
      if (parent && parent.type === 'ArrayExpression' && parent.elements.some(e => e && e.type === 'Literal' && typeof e.value === 'string' && DIA.test(e.value))) { if (/\p{L}/u.test(v) && !/[_\/.]/.test(v)) add(v, 'force'); return; }
      if (human(v)) add(v, f);
    } else if (node.type === 'BinaryExpression' && node.operator === '+' && !(parent && parent.type === 'BinaryExpression' && parent.operator === '+')) {
      const parts = []; const flat = n => { if (n.type === 'BinaryExpression' && n.operator === '+') { flat(n.left); flat(n.right); } else parts.push(n); }; flat(node);
      if (!parts.some(p => p.type === 'Literal' && typeof p.value === 'string' && /\p{L}{2,}/u.test(p.value))) return;
      let s = '', i = 0; for (const p of parts) { if (p.type === 'Literal' && typeof p.value === 'string') s += p.value; else s += M(i++); }
      if (/[<>]/.test(s)) segments(s, f); else seg(s, f);
    }
  });
}
// statické texty v index.html (mimo <style>/<script>)
let html = fs.readFileSync(`${root}/index.html`, 'utf8').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
segments(html, 'index.html');
// ručně: texty, které v DOM vzniknou rozdělením (např. „Ahoj,<br>Jméno!“)
for (const k of ['Ahoj', 'DNES', 'DEN']) add(k, 'force');
const out = [...keys.keys()].filter(k => !/^(places\/|wd |cesta-lesem-zaloha|Slothkin\{|Meta: |act_|ch_)/.test(k));
fs.writeFileSync(`${root}/i18n/_keys.json`, JSON.stringify(out, null, 1));
console.log(out.length, 'klíčů;', out.filter(k => /\{\d\}/.test(k)).length, 'vzorů');
for (const f of fs.readdirSync(`${root}/i18n`).filter(f => /^[a-z]{2}\.json$/.test(f))) { const d = JSON.parse(fs.readFileSync(`${root}/i18n/${f}`, 'utf8')); const miss = out.filter(k => !(k in d)); console.log(f, 'chybí', miss.length, miss.slice(0, 5).join(' | ')); }
