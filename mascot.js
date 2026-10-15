// Lenochod – mascot images. mood: 'happy' | 'calm' | 'cheer' | 'face'
window.mascot = function (mood = 'happy', opts = {}) {
  const src = { happy: 'hero', calm: 'calm', cheer: 'cheer', face: 'face', sleep: 'calm' }[mood] || 'hero';
  const leaf = opts.flower ? '<span class="gold-leaf" title="Zlatý lístek"><svg viewBox="0 0 24 24"><path d="M20 3C10 3 4 8 4 15c0 2 .6 3.8 1.6 5.2C7 13 12 9 17 7c-4 3-8 7-10 14 1 .5 2.2.8 3.4.8C17 21.8 21 15 20 3z" fill="#E9A23B"/></svg></span>' : '';
  return `<span class="masc masc-${mood}"><img src="img/${src}.webp" alt="" draggable="false">${leaf}</span>`;
};
