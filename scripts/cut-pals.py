# Řezání archů parťáků (ChatGPT, PRŮHLEDNÉ PNG, mřížka 4×5 = 20 póz) do img/pals/<id>/<póza>.webp.
# Spuštění: python3 scripts/cut-pals.py img/pals [práh_alfy=40] [jen_id]; zajíc potřeboval práh 170 (poloprůhledný podklad).
# Pořadí archů = abecední pořadí souborů ve složce /home/claude/avatars_in, viz names.
import sys,glob,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
src=sorted(glob.glob('/home/claude/avatars_in/*.png'))
names=['sloth','fox','owl','bunny','bear','otter','panda','cat','dog','raccoon']
out=sys.argv[1]; TH=int(sys.argv[2]) if len(sys.argv)>2 else 40; ONLY=sys.argv[3] if len(sys.argv)>3 else None
POSES=['idle','calm','sad','thanks','laugh','joy','focus','wow','think','wave','thumbs','meditate','walk','stretch','dance','cheer','book','tea','sleep','key']
for f,n in zip(src,names):
  if ONLY and n!=ONLY: continue
  im=np.array(Image.open(f).convert('RGBA')).astype(np.uint8)
  a=im[:,:,3]; H,W=a.shape; cw=W/4; ch=H/5
  m=nd.binary_opening(a>TH,iterations=1)
  lab,k=nd.label(m); sizes=nd.sum(m,lab,range(1,k+1)); com=nd.center_of_mass(m,lab,range(1,k+1))
  os.makedirs(f'{out}/{n}',exist_ok=True)
  for idx,p in enumerate(POSES):
    r,c=divmod(idx,4)
    keep=np.zeros_like(m)
    ids=[i+1 for i,(cy,cx) in enumerate(com) if sizes[i]>60 and int(cy//ch)==r and int(cx//cw)==c]
    keep=np.isin(lab,ids)
    keep=nd.binary_dilation(keep,iterations=3)
    rgba=im.copy(); rgba[:,:,3]=np.where(keep,a,0)
    rgba[rgba[:,:,3]==0,:3]=0
    cx=(c+.5)*cw; cy=(r+.5)*ch; S=150
    x0=int(cx-S); y0=int(cy-S)
    canvas=np.zeros((2*S,2*S,4),np.uint8)
    xs0=max(0,x0); ys0=max(0,y0); xs1=min(W,x0+2*S); ys1=min(H,y0+2*S)
    canvas[ys0-y0:ys1-y0, xs0-x0:xs1-x0]=rgba[ys0:ys1,xs0:xs1]
    Image.fromarray(canvas,'RGBA').save(f'{out}/{n}/{p}.webp',quality=86,method=6)
  print(n,flush=True)
