# Obrázky parťáků pro Android widget: res/drawable-nodpi/pal_<id>_<póza>.webp (192 px, 8 póz podle nálady).
# Spuštění z kořene repa: python3 scripts/widget-pals.py   (zdroj img/pals/<id>/<póza>.webp)
import os
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
