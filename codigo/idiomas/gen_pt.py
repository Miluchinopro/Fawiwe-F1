# Arma i18n_pt_dict.js (español → portugués de Brasil) a partir de pt/pt.json, respetando los espacios de los bordes de cada texto original.
import json, re, os
pt = json.load(open('pt/pt.json' if os.path.exists('pt/pt.json') else 'pt.json', encoding='utf-8'))
d = {}
for k, v in pt.items():
    if not v or v == k: continue
    core = v.strip()
    lead = re.match(r'^\s*', k).group(0); trail = re.search(r'\s*$', k).group(0)
    d[k] = lead + core + trail
dst = '../i18n_pt_dict.js' if os.path.exists('pt/pt.json') else 'i18n_pt_dict.js'
open(dst, 'w', encoding='utf-8').write('/* FAWIWE · diccionario español → portugués (generado con gen_pt.py) */\nwindow.FW_PT_DICT = ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(d))
