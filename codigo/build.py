# FAWIWE F1 · armado del juego
# Lee manifest.json (qué archivos van y en qué orden) y arma:
#   game_new.html   → el juego en una sola página
#   out/fawiwe.html → el juego envuelto para publicarlo
# Funciona igual con los archivos sueltos (carpeta de trabajo) o ordenados en carpetas (codigo/ en GitHub).
import html, json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(AQUI, 'manifest.json'), encoding='utf-8'))
VER = M['version']

def ruta(f):
    carpeta = M.get('carpetas', {}).get(f, 'base')
    for p in (os.path.join(AQUI, carpeta, f), os.path.join(AQUI, f)):
        if os.path.exists(p): return p
    raise FileNotFoundError(f)

def leer(f):
    return open(ruta(f), encoding='utf-8').read()

def ins_before(doc, marker, text, first=True):
    assert doc.count(marker) >= 1, marker
    i = doc.index(marker) if first else doc.rindex(marker)
    return doc[:i] + text + doc[i:]

g = leer('game.html')
# 1) estilos, en orden
g = ins_before(g, '</style>', '\n'.join(leer(f) for f in M['css']))
# 2) pedazos de HTML que se insertan en la página base
g = ins_before(g, '  <div id="carDevCard" class="card">', leer('eng_card.html'))
g = ins_before(g, '    <p id="modeInfo" class="small"></p>', '    <div id="engSetupExtras" class="hidden"></div>\n')
g = ins_before(g, '<div class="gold-glow"></div>', leer('eng_overlay.html') + leer('bfx_overlay.html'))
g = ins_before(g, '    <h3>🏎️ Minijuegos si elegís Modo Piloto</h3>', leer('eng_tutorial.html'))
# 3) scripts, en orden (cada parche envuelve funciones de los anteriores, así que el orden importa)
g = ins_before(g, '</body>', ''.join('<script>\n' + leer(f) + '\n</script>\n' for f in M['js']), first=False)
# 4) versión
g = g.replace('<title>FAWIWE V100</title>', f'<title>FAWIWE F1 · {VER}</title>', 1).replace('GRACIAS POR JUGAR A FAWIWE V100', f'GRACIAS POR JUGAR A FAWIWE F1 · {VER.upper()}')
open(os.path.join(AQUI, 'game_new.html'), 'w', encoding='utf-8').write(g)

pre = leer('outer_pre.html').replace('FAWIWE F1 V100 — el juego completo en una sola página.', f'FAWIWE F1 · {VER} — el juego completo en una sola página: ingeniero, jefe de equipo o piloto, de 1950 a 2026.').replace('title="FAWIWE F1 V100"', f'title="FAWIWE F1 · {VER}"')
post = leer('outer_post.html')
os.makedirs(os.path.join(AQUI, 'out'), exist_ok=True)
open(os.path.join(AQUI, 'out', 'fawiwe.html'), 'w', encoding='utf-8').write(pre + html.escape(g, quote=True) + post)
print(len(g))
