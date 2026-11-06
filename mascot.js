// Poquito – parťák (maskot). Uživatel si vybere jedno z 10 zvířátek (S.pal), každé má 20 póz v img/pals/<pal>/<pose>.webp.
// mood = nálada z appky (homeMood, oslavy…), převede se na pózu.
window.PALS = [
  { id: 'sloth', name: 'Lenochod', em: '🦥' },
  { id: 'fox', name: 'Liška', em: '🦊' },
  { id: 'owl', name: 'Sova', em: '🦉' },
  { id: 'bunny', name: 'Zajíc', em: '🐰' },
  { id: 'bear', name: 'Medvídek', em: '🐻' },
  { id: 'otter', name: 'Vydra', em: '🦦' },
  { id: 'panda', name: 'Panda červená', em: '🐼' },
  { id: 'cat', name: 'Kočka', em: '🐱' },
  { id: 'dog', name: 'Pejsek', em: '🐶' },
  { id: 'raccoon', name: 'Mýval', em: '🦝' }
];
window.mascotPal = 'sloth'; // nastavuje app.js podle S.pal
// nálada → póza (pózy: idle calm sad thanks laugh joy focus wow think wave thumbs meditate walk stretch dance cheer book tea sleep key)
const MOOD_POSE = { happy: 'joy', face: 'idle', calm: 'tea', rest: 'tea', heart: 'cheer', sad: 'sad', think: 'think', thumbs: 'thumbs', key: 'key', laugh: 'laugh', dance: 'dance', thanks: 'thanks' };
// póza pro náladu (Kruh: avatar člena podle jeho dnešní nálady)
window.palPose = mood => MOOD_POSE[mood] || mood || 'idle';
window.mascot = function (mood = 'happy', opts = {}) {
  const pose = palPose(mood);
  const pal = opts.pal || window.mascotPal || 'sloth';
  const leaf = opts.flower ? '<span class="gold-leaf" title="Zlatý lístek"><svg viewBox="0 0 24 24"><path d="M20 3C10 3 4 8 4 15c0 2 .6 3.8 1.6 5.2C7 13 12 9 17 7c-4 3-8 7-10 14 1 .5 2.2.8 3.4.8C17 21.8 21 15 20 3z" fill="#E9A23B"/></svg></span>' : '';
  return `<span class="masc masc-${mood}"><img src="img/pals/${pal}/${pose}.webp" alt="" draggable="false">${leaf}</span>`;
};
