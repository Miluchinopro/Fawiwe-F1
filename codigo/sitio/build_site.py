import base64, os
def buscar(n):
    for d in ('..', '../estilos', '../modulos', '../base', '../parches'):
        p = os.path.join(d, n)
        if os.path.exists(p): return p
    raise FileNotFoundError(n)
p=open('page_art.html',encoding='utf-8').read()
for k in ['live','buy','result','setup','intro','cine','menu','go','drv_react','drv_brake','drv_buy','drv_game','laps','evo','era','trk','nego','contract']:
    p=p.replace('{{IMG_%s}}'%k,'data:image/jpeg;base64,'+base64.b64encode(open('s_%s.jpg'%k,'rb').read()).decode())
p=p.replace('{{GAME_B64}}', base64.b64encode(open(buscar('game_new.html'),'rb').read()).decode())
css=open(buscar('cine.css'),encoding='utf-8').read(); css=css[:css.index('/* ---- compras')]
p=p.replace('{{EVO_CSS}}', css).replace('{{CARS_JS}}', open(buscar('cars.js'),encoding='utf-8').read())
p=p.replace('{{AUDIO_JS}}', open(buscar('audio.js'),encoding='utf-8').read())
open('fawiwe-f1-web.html','w',encoding='utf-8').write(p)
print(len(p)/1e6,'MB')
