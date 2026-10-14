// Klíček — original sprout mascot. mood: 'happy' | 'calm' | 'cheer' | 'sleep'
window.mascot = function (mood = 'happy', opts = {}) {
  const flower = opts.flower;
  const arms = mood === 'cheer'
    ? `<ellipse cx="18" cy="62" rx="9" ry="14" transform="rotate(-35 18 62)" fill="#6DBB45"/><ellipse cx="102" cy="62" rx="9" ry="14" transform="rotate(35 102 62)" fill="#6DBB45"/>`
    : mood === 'calm'
    ? `<ellipse cx="34" cy="104" rx="12" ry="7" fill="#6DBB45"/><ellipse cx="86" cy="104" rx="12" ry="7" fill="#6DBB45"/>`
    : `<ellipse cx="20" cy="90" rx="8" ry="13" transform="rotate(20 20 90)" fill="#6DBB45"/><ellipse cx="100" cy="90" rx="8" ry="13" transform="rotate(-20 100 90)" fill="#6DBB45"/>`;
  let eyes, mouth;
  if (mood === 'calm' || mood === 'sleep') {
    eyes = `<path d="M38 70q8 7 16 0M66 70q8 7 16 0" fill="none" stroke="#1F3A20" stroke-width="3.5" stroke-linecap="round"/>`;
    mouth = `<path d="M52 88q8 6 16 0" fill="none" stroke="#1F3A20" stroke-width="3" stroke-linecap="round"/>`;
  } else if (mood === 'cheer') {
    eyes = `<path d="M37 72l8-8 8 8M67 72l8-8 8 8" fill="none" stroke="#1F3A20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    mouth = `<path d="M48 84q12 0 24 0q-2 14-12 14t-12-14z" fill="#7A2E1F"/><path d="M54 93q6 5 12 0" fill="#F08A7E"/>`;
  } else {
    eyes = `<ellipse cx="45" cy="68" rx="10" ry="12" fill="#fff"/><ellipse cx="75" cy="68" rx="10" ry="12" fill="#fff"/>
      <circle cx="47" cy="70" r="6.5" fill="#1F3A20"/><circle cx="77" cy="70" r="6.5" fill="#1F3A20"/>
      <circle cx="49" cy="67" r="2.3" fill="#fff"/><circle cx="79" cy="67" r="2.3" fill="#fff"/>`;
    mouth = `<path d="M50 87q10 9 20 0" fill="none" stroke="#1F3A20" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const fl = flower ? `<g transform="translate(60 14)">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-7" rx="4.5" ry="7" fill="#F7B6C8" transform="rotate(${a})"/>`).join('')}<circle r="4" fill="#F5B83D"/></g>` : '';
  return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M60 34q-2-10 0-18" stroke="#3E8E3A" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="44" cy="20" rx="16" ry="8" transform="rotate(-30 44 20)" fill="#8ED35F"/>
    <ellipse cx="76" cy="20" rx="16" ry="8" transform="rotate(30 76 20)" fill="#6DBB45"/>
    ${fl}
    <ellipse cx="60" cy="124" rx="34" ry="5" fill="#000" opacity=".15"/>
    <rect x="14" y="62" width="10" height="34" rx="5" fill="#9B6537"/><rect x="96" y="62" width="10" height="34" rx="5" fill="#9B6537"/>
    <ellipse cx="60" cy="78" rx="42" ry="44" fill="#7DCB52"/>
    <ellipse cx="60" cy="92" rx="26" ry="24" fill="#B9E58C"/>
    ${arms}
    <ellipse cx="44" cy="120" rx="11" ry="6" fill="#F0A33A"/><ellipse cx="76" cy="120" rx="11" ry="6" fill="#F0A33A"/>
    ${eyes}
    <ellipse cx="33" cy="84" rx="6" ry="4" fill="#F59A8B" opacity=".7"/><ellipse cx="87" cy="84" rx="6" ry="4" fill="#F59A8B" opacity=".7"/>
    ${mouth}
  </svg>`;
};
