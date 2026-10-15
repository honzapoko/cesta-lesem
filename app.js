(() => {
'use strict';
// ---------- dates ----------
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
const weekKey = s => { const d = fromIso(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
let TODAY = iso(new Date());
const BACK = 7; // how many days back you can fill in
const WD = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTHS = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec'];
const DAYNAMES = ['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, a, b, c) => n === 1 ? a : (n >= 2 && n <= 4) ? b : c;

// ---------- state ----------
const KEY = 'cesta-lesem-v2';
let S = { v: 2, logs: {}, rewards: {}, celebrated: [], unlockSeen: 0, celDays: {}, theme: 'light', updatedAt: 0 };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch (e) {}
const save = () => { S.updatedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Nepodařilo se uložit. Zkontroluj místo v telefonu.'); } };
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const done = (id, day) => { const L = S.logs[day]; if (!L) return false; if (L[id] && L[id].d) return true; return id === 'zena' && !!(L.gesto && L.gesto.d); };
const doneDays = id => Object.keys(S.logs).filter(k => done(id, k)).sort();
const count = id => doneDays(id).length;
const entry = (id, day) => (S.logs[day] && S.logs[day][id]) || {};
const setEntry = (id, patch, day) => { S.logs[day] = S.logs[day] || {}; S.logs[day][id] = Object.assign({}, S.logs[day][id] || {}, patch); };
function bestWindow(id, win) { const ds = doneDays(id); let best = 0; for (let i = 0; i < ds.length; i++) { const end = addDays(ds[i], win - 1); let c = 0; for (let j = i; j < ds.length && ds[j] <= end; j++) c++; best = Math.max(best, c); } return best; }
function bestRun(id) { const ds = doneDays(id); let best = 0, run = 0, prev = null; for (const d of ds) { run = (prev && addDays(prev, 1) === d) ? run + 1 : 1; best = Math.max(best, run); prev = d; } return best; }
function curRun(id) { let d = done(id, TODAY) ? TODAY : addDays(TODAY, -1), n = 0; while (done(id, d)) { n++; d = addDays(d, -1); } return n; }
function bestWeekRun(id) { const wk = [...new Set(doneDays(id).map(weekKey))].sort(); let best = 0, run = 0, prev = null; for (const w of wk) { run = (prev && addDays(prev, 7) === w) ? run + 1 : 1; best = Math.max(best, run); prev = w; } return best; }

// ---------- content ----------
const STEPS = [
  { id: 'les', ic: '🌲', t: 'Ranní les s vděčností', sub: 'Bez telefonu, klidně 15 minut. Někdy s Arčim.', kind: 'day', note: 'grat',
    why: 'Tvoje volba. Začátek dne, který tě nabíjí.',
    ms: [{ id: 'les-1', l: '7 procházek za 10 dní', goal: 7, val: () => bestWindow('les', 10) }, { id: 'les-2', l: '30 procházek celkem', goal: 30, val: () => count('les') }] },
  { id: 'dluh', ic: '📞', t: 'Telefonát kvůli dluhům', sub: 'Jen domluvit schůzku v poradně. Nic víc.', kind: 'once', note: 'text', ph: 'Kde a kdy je schůzka?',
    why: 'Necháš si situaci přepočítat někým, kdo to dělá denně.',
    ms: [{ id: 'dluh-1', l: 'Schůzka v kalendáři', goal: 1, val: () => Math.min(1, count('dluh')) }] },
  { id: 'zena', ic: '💛', t: 'Hezká věc pro manželku', sub: 'Všimni si jí a klidně to řekni nahlas.', kind: 'day', note: 'text', ph: 'Čeho sis dnes na ní všiml?',
    why: 'Trénink vnímání toho dobrého: úsměv, laskavost, péče o zvířata.',
    ms: [{ id: 'zena-1', l: '14 dní v řadě', goal: 14, val: () => bestRun('zena') }] },
  { id: 'vecer', ic: '🌙', t: 'Co se dnes povedlo', sub: 'Jedna věta před spaním.', kind: 'day', note: 'text', ph: 'Dnes se povedlo…',
    why: 'Večerní povídání, které má Honza za rok. Zatím sám se sebou.',
    ms: [{ id: 'vecer-1', l: '14 večerů zapsáno', goal: 14, val: () => count('vecer') }] },
  { id: 'spanek', ic: '😴', t: 'Spánkový experiment', sub: 'Co bylo večer a kolikrát ses vzbudil.', kind: 'day', note: 'sleep',
    why: 'Data z Oury ti řeknou víc než rady.',
    ms: [{ id: 'spanek-1', l: '14 nocí zapsáno', goal: 14, val: () => count('spanek') }] },
  { id: 'medit', ic: '🪷', t: '5 minut meditace', sub: 'Hned po lese, než si dáš kafíčko.', kind: 'day', note: 'none',
    why: 'Cesta do těch stavů vlastní silou, po malých kouscích.',
    ms: [{ id: 'medit-1', l: '21 meditací', goal: 21, val: () => count('medit') }] },
  { id: 'pohyb', ic: '🏊', t: 'Pohyb jednou týdně', sub: 'Plavání, sauna, posilovna. Klidně s Pepou.', kind: 'week', note: 'text', ph: 'Co jsi dělal?',
    why: 'Tělo je palivo pro všechno ostatní.',
    ms: [{ id: 'pohyb-1', l: '4 týdny po sobě', goal: 4, val: () => bestWeekRun('pohyb') }] },
  { id: 'terapie', ic: '🤝', t: 'Někdo, kdo tě slyší', sub: 'Domluvit první sezení u terapeuta.', kind: 'once', note: 'text', ph: 'U koho a kdy?',
    why: 'Vzorce po tátovi a pocit neviditelnosti nemusíš nést sám.',
    ms: [{ id: 'terapie-1', l: 'První sezení domluvené', goal: 1, val: () => Math.min(1, count('terapie')) }] }
];
const msMet = m => m.val() >= m.goal;
const stepOpen = i => i === 0 || msMet(STEPS[i - 1].ms[0]);

const UNLOCKS = [
  { n: 1, id: 'week', t: 'Týdenní řádka', d: 'Na domovské obrazovce uvidíš celý týden.' },
  { n: 2, id: 'quote', t: 'Věta na den', d: 'Každé ráno jedna věta pro tebe.' },
  { n: 3, id: 'timer', t: 'Meditační časovač', d: '5, 10 nebo 20 minut s gongem na konci.' },
  { n: 4, id: 'calendar', t: 'Kalendář', d: 'Celý měsíc na jednom místě.' },
  { n: 5, id: 'night', t: 'Noční les', d: 'Tmavý motiv na večery.' },
  { n: 6, id: 'rewards', t: 'Obrazovka odměn', d: 'Všechny tvoje odměny pohromadě.' },
  { n: 7, id: 'stats', t: 'Statistiky', d: 'Grafy a úspěšnost za týden a měsíc.' },
  { n: 8, id: 'diary', t: 'Deník vděčnosti', d: 'Všechno, za co jsi byl vděčný, na jednom místě.' },
  { n: 9, id: 'levels', t: 'Úrovně a XP', d: 'Body za každý splněný úkol a úrovně od Semínka po Les.' },
  { n: 10, id: 'flower', t: 'Klíčkovi vykvete květ', d: 'Deset procházek. Klíček to oslaví.' }
];
const walks = () => count('les');
const has = id => { const u = UNLOCKS.find(x => x.id === id); return !!u && walks() >= u.n; };
const nextUnlock = () => UNLOCKS.find(u => walks() < u.n);

const QUOTES = [
  'Neodkládáš život. Jen jsi byl dlouho unavený.',
  'Malý krok, který uděláš, je víc než velký, který plánuješ.',
  'Les nic nechce. Proto v něm odpočineš.',
  'To, že si toho všímáš, je začátek změny.',
  'Nejsi neviditelný. Začni tím, že uvidíš sám sebe.',
  'Čísla křičí, tělo a vztahy mluví potichu. Poslouchej i je.',
  'Dnes stačí jedna věc. Zbytek počká.',
  'Uměl jsi to dřív. Ta schopnost nikam neodešla.',
  'Laskavost, kterou dáváš druhým, patří i tobě.',
  'Klid nepřijde zvenčí. Roste po ránech, krok za krokem.',
  'Všimni si dnes jedné hezké věci. Jen jedné.',
  'Nemusíš to zvládnout celé. Jen dnešek.',
  'Jasnost, kterou hledáš, už v tobě je.',
  'Vděčnost není popírání starostí. Je to světlo vedle nich.',
  'Dokončovatel potřebuje cílovou čáru. Dnes je to procházka.',
  'Tvoje děti si budou pamatovat, že jsi byl s nimi. Ne kolik jsi měl.',
  'Každá fajfka je důkaz, že to jde.',
  'Pomalá cesta je pořád cesta.',
  'Nikdo nevidí kořeny. A přesto drží celý strom.',
  'Odpočinek není útěk, když se z něj vracíš silnější.'
];
const GESTA = [
  ['Klid a bezpečí', 'Dnes ji o nic nežádej. Jen ji s úsměvem pozdrav a popřej jí hezký den.'],
  ['Klid a bezpečí', 'Udělej za ni jednu domácí věc, bez komentáře a bez čekání na poděkování.'],
  ['Klid a bezpečí', 'Napiš jí krátkou zprávu bez otázky: „Myslím na tebe, ať máš hezký den.“ Odpověď nečekej.'],
  ['Klid a bezpečí', 'Řekni jí jednu konkrétní věc, kterou na ní obdivuješ. Třeba jak se stará o zvířata.'],
  ['Klid a bezpečí', 'Když mluví, nech ji domluvit. Neoprav ji, jen zopakuj, co jsi slyšel.'],
  ['Klid a bezpečí', 'Připrav jí kafe nebo čaj přesně tak, jak ho má ráda.'],
  ['Klid a bezpečí', 'Respektuj její prostor. Když chce být sama, řekni: „Rozumím, jsem tu, až budeš chtít.“'],
  ['Důvěra', 'Omluv se za to tajení. Krátce, bez „ale“ a bez vysvětlování, proč jsi to udělal.'],
  ['Důvěra', 'Řekni jí sám od sebe jednu malou věc, kterou bys dřív zamlčel.'],
  ['Důvěra', 'Zeptej se: „Co bys ode mě teď potřebovala, aby ti bylo líp?“ Pak jen poslouchej.'],
  ['Důvěra', 'Dnes nekritizuj nic. Ani domácnost, ani její kluky.'],
  ['Důvěra', 'Pochval ji před někým dalším, před dětmi nebo kamarádem.'],
  ['Důvěra', 'Malá pozornost: květina, čokoláda nebo něco, co má ráda. Nemusí stát skoro nic.'],
  ['Důvěra', 'Napiš jí lísteček a nech ho tam, kde ho najde.'],
  ['Společný čas', 'Pozvi ji na krátkou procházku s Arčim. Vztah neřeš, jen buďte venku.'],
  ['Společný čas', 'Zeptej se na její den a na jednu věc, která ji teď těší.'],
  ['Společný čas', 'Připomeň jí nahlas jednu hezkou společnou vzpomínku.'],
  ['Společný čas', 'Zeptej se jejích kluků na hru, kterou hrají. Bez výchovných řečí, jen se zajímej.'],
  ['Společný čas', 'Navrhni malé rande doma, film nebo večeři. Když řekne ne, přijmi to v klidu.'],
  ['Společný čas', 'Zeptej se, jestli ji můžeš obejmout. Její odpověď je v pořádku, ať je jakákoli.'],
  ['Společný čas', 'Večer jí řekni, co se ti na dnešku s ní líbilo.'],
  ['Nový způsob mluvení', 'Když tě něco štve, řekni to jako „cítím… a potřebuju…“, ne jako výčitku.'],
  ['Nový způsob mluvení', 'Na jednu její výtku odpověz „Máš pravdu v tom, že…“ místo obhajoby.'],
  ['Nový způsob mluvení', 'Nabídni párovou poradnu jako společný krok. Bez tlaku, rozhodnutí nech na ní.'],
  ['Nový způsob mluvení', 'Udělej něco, o čem nedávno mluvila, že by chtěla.'],
  ['Nový způsob mluvení', 'Pošli jí fotku něčeho hezkého z ranního lesa.'],
  ['Nový způsob mluvení', 'Poděkuj jí za jednu konkrétní věc, kterou dělá pro rodinu.'],
  ['Nový způsob mluvení', 'Řekni jí, co ses za poslední týdny naučil sám o sobě.'],
  ['Nový způsob mluvení', 'Zeptej se, jak vnímá posledních pár týdnů. Poslouchej až do konce.'],
  ['Nový způsob mluvení', 'Napiš jí dopis: co v ní vidíš a jakým partnerem chceš být. Bez nároku na odpověď.']
];
const gestIndex = day => { const e = entry('gesto', day); if (typeof e.k === 'number') return e.k; return Math.min(GESTA.length, doneDays('gesto').filter(d => d < day).length); };
const LEVELS = [[0, 'Semínko'], [100, 'Klíček'], [250, 'Výhonek'], [500, 'Stromek'], [900, 'Strom'], [1500, 'Les']];
function xp() { let x = 0; for (const day in S.logs) for (const id in S.logs[day]) if (S.logs[day][id].d) x += 10; for (const s of STEPS) for (const m of s.ms) if (msMet(m)) x += 50; return x; }
function level() { const x = xp(); let i = 0; while (i + 1 < LEVELS.length && x >= LEVELS[i + 1][0]) i++; const next = LEVELS[i + 1]; return { i, name: LEVELS[i][1], x, from: LEVELS[i][0], to: next ? next[0] : null }; }

// ---------- icons ----------
const I = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  left: '<svg width="18" height="18" viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  right: '<svg width="18" height="18" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  lock: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-3 0-6 1-9z" fill="#F28A2E"/><path d="M12 13c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1.5 1.5-3 3-5z" fill="#FFD27A"/></svg>',
  tree: '<svg viewBox="0 0 24 24"><path d="M12 2 5 12h4l-5 7h16l-5-7h4z" fill="#3FA45B"/><rect x="10.5" y="19" width="3" height="3" fill="#9B6537"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z" fill="#F2B233"/></svg>',
  gift: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-4-6-1.5S12 7 12 7zm0 0c2-4 6-4 6-1.5S12 7 12 7z" fill="none" stroke="#C98A1E" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  play: '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#3A2A05"/></svg>',
  pause: '<svg width="30" height="30" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="#3A2A05"/><rect x="14" y="5" width="4" height="14" rx="1" fill="#3A2A05"/></svg>',
  tabs: {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    path: '<svg viewBox="0 0 24 24"><path d="M6 21c0-5 12-4 12-9S8 8 8 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/><circle cx="8" cy="3" r="2" fill="currentColor"/><path d="M15 17l3 1-1 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    stats: '<svg viewBox="0 0 24 24"><path d="M5 20V12M12 20V5M19 20v-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  }
};

function scene(h = 260) {
  const night = document.documentElement.dataset.theme === 'dark';
  const pines = (y, s, n, fill) => { let o = ''; for (let k = 0; k < n; k++) { const x = (k * 431 / n + (k % 3) * 9) % 430 - 10, sc = s * (0.8 + (k * 37 % 10) / 25); o += `<path d="M${x} ${y}l${10 * sc} -${30 * sc} ${10 * sc} ${30 * sc}z M${x + 3 * sc} ${y - 14 * sc}l${7 * sc} -${22 * sc} ${7 * sc} ${22 * sc}z" fill="${fill}"/>`; } return o; };
  return `<svg class="bg" viewBox="0 0 400 ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs>
    <rect width="400" height="${h}" fill="url(#sky)"/>
    ${night ? [[40,30],[120,60],[200,24],[300,50],[360,20],[250,90],[80,95]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#fff" opacity=".8"/>`).join('') : ''}
    <circle cx="${night ? 320 : 270}" cy="${night ? 60 : h - 120}" r="${night ? 22 : 34}" fill="var(--sun)" opacity="${night ? .9 : .95}"/>
    <path d="M0 ${h - 95} L60 ${h - 150} 120 ${h - 110} 190 ${h - 165} 260 ${h - 115} 330 ${h - 160} 400 ${h - 120} V${h} H0z" fill="var(--hill1)" opacity=".85"/>
    ${pines(h - 52, 1.1, 16, 'var(--hill2)')}
    <path d="M0 ${h - 60} Q100 ${h - 85} 200 ${h - 62} T400 ${h - 66} V${h} H0z" fill="var(--hill2)"/>
    ${pines(h - 24, 1.4, 11, 'var(--pine)')}
    <path d="M290 ${h} q10 -34 52 -36 q50 -2 70 36z" fill="#6B5B4B"/>
  </svg>`;
}

// ---------- ui state ----------
let tab = 'home', cur = TODAY, calMonth = TODAY.slice(0, 7);
const openSet = new Set(['les']);
const app = document.getElementById('app');

function applyTheme() {
  const dark = has('night') && S.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]').content = dark ? '#0B1A2E' : '#1D4A33';
}

function render() {
  const t = iso(new Date()); if (t !== TODAY) { TODAY = t; if (cur > TODAY) cur = TODAY; }
  applyTheme();
  const views = { home: viewHome, path: viewPath, calendar: viewCalendar, stats: viewStats, more: viewMore };
  app.innerHTML = views[tab]();
  renderTabs();
  if (tab === 'more') bindTimer();
}

function renderTabs() {
  const T = [['home', 'Domů'], ['path', 'Cesta'], ['calendar', 'Kalendář', 'calendar'], ['stats', 'Statistiky', 'stats'], ['more', 'Více']];
  document.getElementById('tabs').innerHTML = T.map(([id, l, req]) => {
    const locked = req && !has(req);
    return `<button data-tab="${id}" class="${tab === id ? 'on' : ''} ${locked ? 'lockd' : ''}" aria-current="${tab === id ? 'page' : 'false'}">${locked ? I.lock : I.tabs[id]}<span>${l}</span></button>`;
  }).join('');
}

// ---------- home ----------
function visibleTasks() {
  return STEPS.filter((s, i) => stepOpen(i)).filter(s => !(s.id === 'zena' && S.gestStart)).filter(s => { if (s.kind !== 'once') return true; const f = doneDays(s.id)[0]; return !f || f === cur; });
}
const isDoneFor = s => s.kind === 'week' ? doneDays(s.id).some(d => weekKey(d) === weekKey(cur)) : done(s.id, cur);

function viewHome() {
  const w = walks(), run = curRun('les'), nu = nextUnlock(), lesToday = done('les', TODAY);
  const hour = new Date().getHours();
  const lead = lesToday ? 'Les máš za sebou. Dnes už jsi vyhrál.' : hour < 11 ? 'Dobré ráno. Les na tebe čeká.' : hour < 18 ? 'Ještě není pozdě na kousek lesa.' : 'Klidný večer. Zapiš, co se povedlo.';
  const bubble = lesToday ? (nu ? `Zítra po lese odemkneš: ${nu.t}` : 'Všechno odemčeno. Jsi borec!') : (nu ? `Po procházce odemkneš: ${nu.t}` : 'Jdeme do lesa?');
  const tasks = visibleTasks(), nDone = tasks.filter(isDoneFor).length;
  const d = fromIso(cur);
  const lbl = cur === TODAY ? 'Dnes' : cur === addDays(TODAY, -1) ? 'Včera' : DAYNAMES[d.getDay()][0].toUpperCase() + DAYNAMES[d.getDay()].slice(1);
  let html = `<header class="scene gut">${scene()}<div class="scene-in"><h1>Ahoj Honzo!</h1><p class="lead">${esc(lead)}</p></div>
    <div class="bubble">${esc(bubble)}</div><div class="hero-m">${mascot(lesToday ? 'cheer' : 'happy', { flower: has('flower') })}</div></header>
    <div class="sheet gut"><div class="inner">
    <div class="pill-row">
      <div class="pill">${I.flame}<div><b>${run}</b><br><span>${plural(run, 'den', 'dny', 'dní')} v řadě</span></div></div>
      <div class="pill">${I.tree}<div><b>${w}</b><br><span>${plural(w, 'procházka', 'procházky', 'procházek')}</span></div></div>
      ${has('levels') ? `<div class="pill">${I.star}<div><b>${level().x}</b><br><span>XP</span></div></div>` : ''}
    </div>`;
  if (has('week')) html += weekStrip();
  if (has('quote')) html += `<div class="quote"><div style="font-size:22px">🌿</div><div><small>Věta na den</small>${esc(QUOTES[(Math.floor(fromIso(TODAY) / 864e5)) % QUOTES.length])}</div></div>`;
  html += `<div class="daynav"><button data-day="-1" ${cur <= addDays(TODAY, -BACK) ? 'disabled' : ''} aria-label="Předchozí den">${I.left}</button>
    <div class="lbl">${esc(lbl)}<small>${d.getDate()}. ${d.getMonth() + 1}.</small></div>
    <button data-day="1" ${cur >= TODAY ? 'disabled' : ''} aria-label="Další den">${I.right}</button></div>
    ${gestCard()}
    <section class="card tasks"><h2>Úkoly <span>${nDone} / ${tasks.length}</span></h2>${tasks.map(taskHtml).join('')}</section>`;
  if (nu) html += `<div class="next"><div class="lk">${I.lock}</div><div><b>${esc(nu.t)}</b><span>Odemkne se po procházce č. ${nu.n}. ${esc(nu.d)}</span></div></div>`;
  return html + '</div></div>';
}

function gestCard() {
  if (!S.gestStart) return `<section class="card gest"><div class="gtop"><span class="gic">💛</span><div><small>Pro manželku</small><h3>30 malých gest</h3></div></div>
    <p>Každý den jedno malé gesto bez tlaku. Nejde o to ji získat, ale být člověkem, se kterým se jí bude chtít být. Rozhodnutí je její.</p>
    <button class="btn" data-gstart="1">Začít 30 gest</button></section>`;
  const k = gestIndex(cur);
  if (k >= GESTA.length) return `<section class="card gest"><div class="gtop"><span class="gic">💛</span><div><small>Pro manželku</small><h3>30 gest máš za sebou</h3></div></div>
    <p>Pokračuj v tom, co fungovalo nejlíp. Zapiš si to klidně jako svoje vlastní gesto.</p></section>`;
  const [phase, text] = GESTA[k], e = entry('gesto', cur), on = !!e.d;
  return `<section class="card gest ${on ? 'done' : ''}"><div class="gtop"><span class="gic">💛</span><div style="flex:1;min-width:0"><small>Gesto ${k + 1} / ${GESTA.length} · ${esc(phase)}</small><h3>${esc(text)}</h3></div>
    <button class="check ${on ? 'on' : ''}" data-gest="${k}" aria-pressed="${on}" aria-label="Gesto splněno">${I.check}</button></div>
    <div class="bar"><i style="width:${(k + (on ? 1 : 0)) / GESTA.length * 100}%"></i></div>
    ${on ? `<label for="n-gesto" class="note">Jak to šlo? Jak ses u toho cítil?</label><textarea id="n-gesto" data-n="1" data-id="gesto" placeholder="Pár slov pro sebe…">${esc(e.n || '')}</textarea>` : '<p class="note" style="margin:0">Nic za to nečekej. Gesto je dárek, ne obchod.</p>'}</section>`;
}

function weekStrip() {
  const start = weekKey(TODAY);
  return `<div class="week">${WD.map((n, k) => { const day = addDays(start, k); return `<div class="wd ${done('les', day) ? 'on' : ''} ${day === TODAY ? 'today' : ''}">${n}<i>${done('les', day) ? I.check : ''}</i></div>`; }).join('')}</div>`;
}

function taskHtml(s) {
  const on = isDoneFor(s), e = entry(s.id, cur), open = openSet.has(s.id) && s.note !== 'none';
  let sub = s.sub;
  if (s.kind === 'week' && on && !done(s.id, cur)) sub = 'Tento týden splněno.';
  let body = '';
  if (open) {
    if (s.note === 'grat') { const g = e.g || ['', '', '']; body = '<label>Tři věci, za které jsem vděčný</label>' + [0, 1, 2].map(k => `<input id="g-${k}" data-g="${k}" data-id="${s.id}" value="${esc(g[k])}" placeholder="${k + 1}." autocomplete="off">`).join(''); }
    else if (s.note === 'sleep') { const tags = e.tags || []; body = '<label>Co bylo večer</label><div class="chips">' + ['obrazovka', 'tráva', 'hádka', 'klid', 'pozdní jídlo', 'alkohol'].map(t => `<button class="chip ${tags.includes(t) ? 'on' : ''}" data-tag="${t}" data-id="${s.id}">${t}</button>`).join('') + `</div><label for="w-sp">Kolikrát ses vzbudil (Oura)</label><input type="number" min="0" max="40" inputmode="numeric" id="w-sp" data-w="1" data-id="${s.id}" value="${e.w ?? ''}">`; }
    else body = `<textarea id="n-${s.id}" data-n="1" data-id="${s.id}" placeholder="${esc(s.ph || 'Poznámka')}">${esc(e.n || '')}</textarea>`;
  }
  const tag = s.kind === 'once' ? '<span class="tag">jednou</span>' : s.kind === 'week' ? '<span class="tag">týdně</span>' : '';
  return `<div class="task"><div class="trow">
    <div class="ticon" aria-hidden="true">${s.ic}</div>
    <div class="tmain"><h3>${esc(s.t)}${tag}</h3><p>${esc(sub)}</p>${s.note !== 'none' ? `<button class="more" data-open="${s.id}" aria-expanded="${open}">${open ? 'Skrýt poznámku' : 'Poznámka'}</button>` : ''}</div>
    <button class="check ${on ? 'on' : ''}" data-toggle="${s.id}" aria-pressed="${on}" aria-label="Splněno: ${esc(s.t)}">${I.check}</button>
  </div>${open ? `<div class="tbody">${body}</div>` : ''}</div>`;
}

// ---------- path ----------
function viewPath() {
  let active = -1; STEPS.forEach((s, i) => { if (stepOpen(i) && !msMet(s.ms[0])) active = i; });
  if (active < 0) STEPS.forEach((s, i) => { if (stepOpen(i) && !s.ms.every(msMet)) active = i; });
  return `<div class="gut" style="padding-top:calc(20px + env(safe-area-inset-top,0px))"><div class="inner">
    <div><h2 class="sec">Tvoje cesta</h2><p class="note" style="margin:4px 0 0">Další krok se odemkne po splnění první mety předchozího. Odměny si napiš sám.</p></div>
    <div class="path">${STEPS.map((s, i) => {
      const un = stepOpen(i), all = s.ms.every(msMet), cls = !un ? 'locked' : all ? 'done' : 'active';
      const ms = s.ms.map(m => { const v = Math.min(m.val(), m.goal), met = msMet(m);
        return `<div class="ms ${met ? 'met' : ''}"><div class="mtop"><span>${esc(m.l)}</span><span>${met ? 'Splněno' : v + ' / ' + m.goal}</span></div>
          <div class="bar"><i style="width:${v / m.goal * 100}%"></i></div>
          <div class="rw">${I.gift}<input id="r-${m.id}" data-reward="${m.id}" value="${esc(S.rewards[m.id] || '')}" placeholder="Odměna, třeba dobré jídlo" aria-label="Odměna: ${esc(m.l)}"></div></div>`; }).join('');
      return `<div class="node ${cls}">
        <div class="dot">${i === active ? `<div style="width:46px">${mascot('happy', { flower: has('flower') })}</div>` : all ? '✓' : i + 1}</div>
        <div class="nc"><h3>${s.ic} ${esc(s.t)}</h3><p class="why">${un ? esc(s.why) : 'Odemkne se po splnění kroku ' + i + '.'}</p>${ms}</div></div>`;
    }).join('')}</div></div></div>`;
}

// ---------- calendar ----------
function viewCalendar() {
  const [y, m] = calMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate(), off = (first.getDay() + 6) % 7;
  let cells = WD.map(w => `<div class="h">${w}</div>`).join('') + '<div></div>'.repeat(off);
  let walksM = 0;
  for (let k = 1; k <= days; k++) {
    const day = `${y}-${pad(m)}-${pad(k)}`, w = done('les', day), some = !w && S.logs[day] && Object.values(S.logs[day]).some(e => e.d);
    if (w) walksM++;
    const can = day <= TODAY && day >= addDays(TODAY, -BACK);
    cells += `<${can ? 'button' : 'div'} class="cd ${w ? 'walk' : ''} ${some ? 'some' : ''} ${day === TODAY ? 'today' : ''} ${day > TODAY ? 'fut' : ''}" ${can ? `data-goto="${day}"` : ''}>${k}</${can ? 'button' : 'div'}>`;
  }
  return `<div class="gut" style="padding-top:calc(20px + env(safe-area-inset-top,0px))"><div class="inner">
    <h2 class="sec">Kalendář</h2>
    <section class="card cal"><div class="calh"><button data-cal="-1" aria-label="Předchozí měsíc">${I.left}</button><h3 style="font-size:20px">${MONTHS[m - 1]} ${y}</h3><button data-cal="1" aria-label="Další měsíc">${I.right}</button></div>
    <div class="calg">${cells}</div>
    <div class="legend"><span><i style="background:var(--green)"></i>ranní les</span><span><i style="box-shadow:inset 0 0 0 2.5px var(--green)"></i>jiný úkol</span><span><i style="outline:2.5px solid var(--gold)"></i>dnes</span></div></section>
    <div class="tiles"><div class="tile"><b>${walksM}</b><span>lesů tento měsíc</span></div><div class="tile"><b>${bestRun('les')}</b><span>nejdelší šňůra</span></div><div class="tile"><b>${walks()}</b><span>celkem</span></div></div>
    <p class="note">Klepnutím na den z posledního týdne ho můžeš doplnit.</p></div></div>`;
}

// ---------- stats ----------
function viewStats() {
  const last7 = Array.from({ length: 7 }, (_, k) => addDays(TODAY, k - 6));
  const cnt = day => S.logs[day] ? Object.values(S.logs[day]).filter(e => e.d).length : 0;
  const max = Math.max(3, ...last7.map(cnt));
  const last30 = Array.from({ length: 30 }, (_, k) => addDays(TODAY, k - 29));
  const pct = id => Math.round(last30.filter(d => done(id, d)).length / 30 * 100);
  const lv = level();
  return `<div class="gut" style="padding-top:calc(20px + env(safe-area-inset-top,0px))"><div class="inner">
    <h2 class="sec">Statistiky</h2>
    ${has('levels') ? levelCard(lv) : ''}
    <section class="card" style="padding:14px"><h3 style="font-size:18px">Splněné úkoly za 7 dní</h3>
    <div class="bars">${last7.map(d => { const c = cnt(d); return `<div class="bcol"><b>${c}</b><i class="${c ? '' : 'zero'}" style="height:${Math.max(4, c / max * 100)}%"></i><span>${WD[(fromIso(d).getDay() + 6) % 7]}</span></div>`; }).join('')}</div></section>
    <div class="tiles"><div class="tile"><b>${pct('les')} %</b><span>dní s lesem (30 dní)</span></div><div class="tile"><b>${curRun('les')}</b><span>aktuální šňůra</span></div><div class="tile"><b>${bestRun('les')}</b><span>nejdelší šňůra</span></div></div>
    <section class="card" style="padding:6px 14px"><div style="padding-top:10px"><h3 style="font-size:18px">Za posledních 30 dní</h3></div>
    ${STEPS.filter((s, i) => stepOpen(i) && s.kind === 'day').map(s => `<div class="arow"><div><span>${s.ic} ${esc(s.t)}</span><span>${pct(s.id)} %</span></div><div class="bar"><i style="width:${pct(s.id)}%"></i></div></div>`).join('')}</section>
  </div></div>`;
}
function levelCard(lv) {
  const p = lv.to ? (lv.x - lv.from) / (lv.to - lv.from) * 100 : 100;
  return `<section class="card level"><div class="m">${mascot('happy', { flower: has('flower') })}</div><div style="flex:1;min-width:0"><h3>Úroveň ${lv.i + 1}: ${lv.name}</h3><p>${lv.x} XP${lv.to ? ' · do další úrovně ' + (lv.to - lv.x) + ' XP' : ' · nejvyšší úroveň'}</p><div class="bar"><i style="width:${p}%"></i></div></div></section>`;
}

// ---------- more ----------
let timerMin = 5, timerLeft = 300, timerRun = null, wake = null;
function viewMore() {
  let h = `<div class="gut" style="padding-top:calc(20px + env(safe-area-inset-top,0px))"><div class="inner"><h2 class="sec">Více</h2>`;
  if (has('levels')) h += levelCard(level());
  // unlock list
  h += `<section class="card" style="padding:6px 0"><div style="padding:10px 16px 2px"><h3 style="font-size:18px">Odemčená vylepšení</h3><p class="note" style="margin:2px 0 0">Každá ranní procházka odemkne jedno.</p></div>
    ${UNLOCKS.map(u => { const ok = walks() >= u.n; return `<div class="row"><div><b>${ok ? '✓ ' : ''}${esc(u.t)}</b><span>${ok ? esc(u.d) : 'Procházka č. ' + u.n}</span></div>${ok ? '' : `<span style="color:var(--lock)">${I.lock}</span>`}</div>`; }).join('')}</section>`;
  if (has('timer')) h += `<section class="card timer" id="timer"><h3 style="font-size:20px">Meditace</h3>
    <div class="seg">${[5, 10, 20].map(m => `<button data-tmin="${m}" class="${timerMin === m ? 'on' : ''}">${m} min</button>`).join('')}</div>
    <div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--sunk)" stroke-width="7"/><circle id="tarc" cx="50" cy="50" r="44" fill="none" stroke="var(--green)" stroke-width="7" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="t" id="tlbl"></div></div>
    <button class="play" id="tplay" aria-label="Spustit">${I.play}</button>
    <p class="note" style="margin:0;text-align:center">Na konci zazní gong a meditace se ti sama odškrtne.</p></section>`;
  if (has('rewards')) {
    const all = STEPS.flatMap((s, i) => s.ms.map(m => ({ s, i, m })));
    h += `<h3 style="font-size:20px">Odměny</h3><div class="rgrid">${all.map(({ s, i, m }) => { const met = msMet(m); return `<div class="rcard ${met ? 'met' : ''} ${stepOpen(i) ? '' : 'lockd'}"><b>${met ? '🎁 ' : ''}${esc(m.l)}</b><span>${esc(S.rewards[m.id] || 'Odměnu si napiš na Cestě')}</span><span>${s.ic} ${esc(s.t)}</span></div>`; }).join('')}</div>`;
  }
  if (has('diary')) {
    const days = Object.keys(S.logs).sort().reverse().filter(d => (entry('les', d).g || []).some(x => x && x.trim()) || (entry('zena', d).n || '').trim() || (entry('vecer', d).n || '').trim()).slice(0, 60);
    h += `<h3 style="font-size:20px">Deník vděčnosti</h3><div class="diary">${days.length ? days.map(d => { const g = (entry('les', d).g || []).filter(x => x && x.trim()); const z = entry('zena', d).n, v = entry('vecer', d).n; const dt = fromIso(d);
      return `<div class="card dentry"><small>${dt.getDate()}. ${dt.getMonth() + 1}. ${DAYNAMES[dt.getDay()]}</small><ul>${g.map(x => `<li>${esc(x)}</li>`).join('')}${z ? `<li>💛 ${esc(z)}</li>` : ''}${v ? `<li>🌙 ${esc(v)}</li>` : ''}</ul></div>`; }).join('') : '<p class="note">Zatím prázdný. Zapiš tři vděčnosti u ranního lesa.</p>'}</div>`;
  }
  h += `<section class="card">
    ${has('night') ? `<div class="row"><div><b>Noční les</b><span>Tmavý motiv</span></div><button class="sw ${S.theme === 'dark' ? 'on' : ''}" id="themeSw" role="switch" aria-checked="${S.theme === 'dark'}" aria-label="Noční les"></button></div>` : ''}
    <div class="row"><div><b>Záloha dat</b><span>Data jsou jen v tomhle telefonu. Občas si je zálohuj.</span></div></div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:0 16px 16px">
      <button class="btn" id="exp">Stáhnout zálohu</button>
      <label class="btn sec" style="text-align:center;cursor:pointer">Obnovit ze zálohy<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <div id="impConfirm"></div>
    </div></section>
    <p class="note" style="text-align:center">Cesta lesem · aplikace pro Honzu</p>
  </div></div>`;
  return h;
}

function bindTimer() {
  const lbl = document.getElementById('tlbl'); if (!lbl) return;
  const arc = document.getElementById('tarc'), btn = document.getElementById('tplay');
  const draw = () => { lbl.textContent = Math.floor(timerLeft / 60) + ':' + pad(timerLeft % 60); arc.style.strokeDashoffset = 276.5 * (1 - timerLeft / (timerMin * 60)); btn.innerHTML = timerRun ? I.pause : I.play; btn.setAttribute('aria-label', timerRun ? 'Pozastavit' : 'Spustit'); };
  draw();
  btn.onclick = async () => {
    if (timerRun) { clearInterval(timerRun); timerRun = null; releaseWake(); draw(); return; }
    gong(0.0001); // unlock audio on tap
    try { wake = await navigator.wakeLock.request('screen'); } catch (e) {}
    const end = Date.now() + timerLeft * 1000;
    timerRun = setInterval(() => {
      timerLeft = Math.max(0, Math.round((end - Date.now()) / 1000));
      if (!document.getElementById('tlbl')) { if (timerLeft === 0) finish(); return; }
      if (timerLeft === 0) finish(); else draw();
    }, 250);
    draw();
  };
  function finish() { clearInterval(timerRun); timerRun = null; releaseWake(); gong(0.6); if (stepOpen(5) && !done('medit', TODAY)) { setEntry('medit', { d: true }, TODAY); save(); toast('Meditace odškrtnutá. Krásně.'); } else toast('Hotovo. Krásně.'); timerLeft = timerMin * 60; render(); }
}
const releaseWake = () => { try { wake && wake.release(); } catch (e) {} wake = null; };
let actx = null;
function gong(vol) {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume();
    [196, 392, 588].forEach((f, k) => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(vol / (k + 1), actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 5); o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + 5); });
  } catch (e) {}
}

// ---------- celebrations ----------
function afterToggle(id) {
  const lines = [];
  // new unlocks
  const w = walks();
  const fresh = UNLOCKS.filter(u => u.n <= w && u.n > (S.unlockSeen || 0));
  if (fresh.length) S.unlockSeen = Math.max(...fresh.map(u => u.n));
  // milestones
  const msNew = [];
  STEPS.forEach((s, i) => s.ms.forEach(m => { if (msMet(m) && !S.celebrated.includes(m.id)) { S.celebrated.push(m.id); msNew.push({ s, i, m }); } }));
  save();
  const lesNow = id === 'les' && done('les', cur) && !S.celDays[cur];
  if (lesNow) S.celDays[cur] = 1;
  if (!lesNow && !fresh.length && !msNew.length) return;
  save();
  fresh.forEach(u => lines.push(['Odemkl jsi', u.t, u.d]));
  msNew.forEach(({ s, i, m }) => { lines.push(['Meta splněna', m.l, S.rewards[m.id] ? 'Tvoje odměna: ' + S.rewards[m.id] : 'Napiš si odměnu na Cestě a dopřej si ji.']); if (m === s.ms[0] && STEPS[i + 1]) lines.push(['Nový krok na cestě', STEPS[i + 1].t, STEPS[i + 1].sub]); });
  const nu = nextUnlock();
  const head = lesNow ? 'Ranní les splněn' : 'Úkol splněn';
  showCel(head, lines, lesNow && nu ? `Zítra po lese odemkneš: ${nu.t}` : '');
}
function showCel(head, lines, foot) {
  const run = curRun('les');
  const el = document.getElementById('cel');
  el.innerHTML = `<h1>Skvělé!</h1><div style="font-weight:800;font-size:18px">${esc(head)}</div><div class="cm">${mascot('cheer', { flower: has('flower') })}</div>
    ${run ? `<div style="font-weight:800">${I.flame.replace('<svg', '<svg width="22" height="22" style="vertical-align:-4px"')} ${run} ${plural(run, 'den', 'dny', 'dní')} v řadě</div>` : ''}
    ${lines.map(([s, b, p]) => `<div class="box"><small>${esc(s)}</small><b>${esc(b)}</b><span style="font-size:14px;font-weight:600">${esc(p)}</span></div>`).join('')}
    ${foot ? `<div style="font-weight:700;opacity:.9">${esc(foot)}</div>` : ''}
    <button class="btn" id="celOk">Pokračovat</button>`;
  el.hidden = false; document.getElementById('celOk').focus(); confetti();
  document.getElementById('celOk').onclick = () => { el.hidden = true; render(); };
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById('confetti'); c.hidden = false; const x = c.getContext('2d');
  const W = c.width = innerWidth, H = c.height = innerHeight;
  const cols = ['#F2B233', '#57BE73', '#F59A8B', '#FFD27A', '#8ED35F', '#ffffff'];
  const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * 80, y: H * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 7 + 4, c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 6 }));
  let t = 0; (function f() { x.clearRect(0, 0, W, H); for (const p of P) { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }
    if (++t < 130) requestAnimationFrame(f); else { x.clearRect(0, 0, W, H); c.hidden = true; } })();
}
let toastT;
function toast(msg) { let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }

// ---------- events ----------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-gstart],[data-gest],[data-tab],[data-toggle],[data-open],[data-tag],[data-day],[data-cal],[data-goto],[data-tmin],#themeSw,#exp,#impYes');
  if (!t) return;
  const ds = t.dataset;
  if (ds.tab) {
    const req = { calendar: 'calendar', stats: 'stats' }[ds.tab];
    if (req && !has(req)) { const u = UNLOCKS.find(x => x.id === req); toast(`${u.t} se odemkne po procházce č. ${u.n}.`); return; }
    tab = ds.tab; render(); window.scrollTo(0, 0); return;
  }
  if (ds.gstart) { S.gestStart = TODAY; save(); render(); return; }
  if (ds.gest !== undefined) { const on = !entry('gesto', cur).d; setEntry('gesto', { d: on, k: +ds.gest }, cur); if (on && navigator.vibrate) navigator.vibrate(30); save(); render(); if (on) { toast('Krásné gesto. Teď jí dej prostor.'); afterToggle('gesto'); } return; }
  if (ds.toggle) { const id = ds.toggle, on = !done(id, cur); setEntry(id, { d: on }, cur); if (on && navigator.vibrate) navigator.vibrate(30); save(); render(); if (on) afterToggle(id); return; }
  if (ds.open) { openSet.has(ds.open) ? openSet.delete(ds.open) : openSet.add(ds.open); render(); return; }
  if (ds.tag) { const id = ds.id, tags = [...(entry(id, cur).tags || [])], k = tags.indexOf(ds.tag); k < 0 ? tags.push(ds.tag) : tags.splice(k, 1); setEntry(id, { tags }, cur); save(); render(); return; }
  if (ds.day) { cur = addDays(cur, +ds.day); render(); return; }
  if (ds.cal) { const [y, m] = calMonth.split('-').map(Number); const d = new Date(y, m - 1 + (+ds.cal), 1); calMonth = d.getFullYear() + '-' + pad(d.getMonth() + 1); render(); return; }
  if (ds.goto) { cur = ds.goto; tab = 'home'; render(); window.scrollTo(0, 0); return; }
  if (ds.tmin) { if (timerRun) return; timerMin = +ds.tmin; timerLeft = timerMin * 60; render(); return; }
  if (t.id === 'themeSw') { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); render(); return; }
  if (t.id === 'exp') { const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cesta-lesem-zaloha-${TODAY}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Záloha stažená do telefonu.'); return; }
  if (t.id === 'impYes') { S = Object.assign(S, pendingImport); pendingImport = null; save(); toast('Data obnovena.'); render(); return; }
});
let pendingImport = null;
document.addEventListener('change', e => {
  if (e.target.id !== 'imp' || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => { try { const d = JSON.parse(r.result); if (!d.logs) throw 0; pendingImport = d; const n = Object.keys(d.logs).length;
    document.getElementById('impConfirm').innerHTML = `<p class="note" style="margin:0 0 8px">Záloha obsahuje ${n} ${plural(n, 'den', 'dny', 'dní')} záznamů. Nahradí tvoje současná data.</p><button class="btn" id="impYes">Ano, obnovit</button>`;
  } catch (x) { toast('Tohle není záloha z Cesty lesem.'); } };
  r.readAsText(e.target.files[0]);
});
let typeT;
document.addEventListener('input', e => {
  const el = e.target, id = el.dataset.id;
  if (el.dataset.reward !== undefined) S.rewards[el.dataset.reward] = el.value;
  else if (!id) return;
  else if (el.dataset.g !== undefined) { const g = [...(entry(id, cur).g || ['', '', ''])]; g[+el.dataset.g] = el.value; setEntry(id, { g }, cur); }
  else if (el.dataset.w) setEntry(id, { w: el.value === '' ? null : +el.value }, cur);
  else if (el.dataset.n) setEntry(id, { n: el.value }, cur);
  clearTimeout(typeT); typeT = setTimeout(save, 400);
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && iso(new Date()) !== TODAY) { cur = iso(new Date()); render(); } });

render();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
