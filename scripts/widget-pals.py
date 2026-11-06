# Obrázky parťáků pro Android widget: res/drawable-nodpi/pal_<id>_<póza>.webp (192 px, 8 póz podle nálady).
# Spuštění z kořene repa: python3 scripts/widget-pals.py   (zdroj img/pals/<id>/<póza>.webp)
import os, unicodedata
# název drawable musí být [a-z0-9_]: bez diakritiky, pomlčky → podtržítka (stejně jako resName() v app.js)
res = lambda x: unicodedata.normalize('NFD', x).encode('ascii', 'ignore').decode().lower().replace('-', '_')
from PIL import Image
POSES = ['cheer', 'thumbs', 'walk', 'wave', 'think', 'sad', 'sleep', 'idle']
out = 'android/app/src/main/res/drawable-nodpi'
os.makedirs(out, exist_ok=True)
for pal in sorted(os.listdir('img/pals')):
    for p in POSES:
        im = Image.open(f'img/pals/{pal}/{p}.webp').convert('RGBA')
        bb = im.getbbox(); im = im.crop(bb)
        s = max(im.size); c = Image.new('RGBA', (s, s)); c.paste(im, ((s - im.width) // 2, s - im.height))
        c.resize((192, 192), Image.LANCZOS).save(f'{out}/pal_{pal}_{p}.webp', quality=82, method=6)
print('hotovo')

# Ikony aktivit a výzev pro widget Úkoly: act_<id>.webp a ch_<id>.webp (pomlčky → podtržítka), 96 px
for folder, pre in (('img/acts', 'act_'), ('img/challenges', 'ch_')):
    for f in sorted(os.listdir(folder)):
        if not f.endswith('.webp'): continue
        im = Image.open(f'{folder}/{f}').convert('RGBA'); im = im.crop(im.getbbox())
        s = max(im.size); c = Image.new('RGBA', (s, s)); c.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
        c.resize((96, 96), Image.LANCZOS).save(f'{out}/{pre}{res(f[:-5])}.webp', quality=82, method=6)
print('ikony hotovo')
