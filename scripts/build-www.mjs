// Zkopíruje webovou aplikaci do www/ (odtud ji Capacitor balí do Androidu).
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
rmSync('www', { recursive: true, force: true }); mkdirSync('www');
for (const f of ['index.html', 'app.js', 'cloud.js', 'native.js', 'mascot.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) cpSync(f, `www/${f}`);
cpSync('img', 'www/img', { recursive: true });
// v nativní appce service worker nepotřebujeme (soubory jsou lokálně)
let html = readFileSync('www/index.html', 'utf8');
writeFileSync('www/index.html', html);
let js = readFileSync('www/app.js', 'utf8').replace("if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));", "// SW vynechán v nativní verzi");
writeFileSync('www/app.js', js);
console.log('www/ připraveno');
