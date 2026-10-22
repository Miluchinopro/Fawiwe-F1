# Arma i18n_en_dict.js (el diccionario español → inglés del juego) a partir de tr.json (textos extraídos y traducidos) y extra.json (agregados a mano).
import json, os
t = json.load(open('tr.json', encoding='utf-8')); x = json.load(open('extra.json', encoding='utf-8'))
t.update(x)
d = {k: v for k, v in t.items() if v and v != '=' and v != k}
dst = 'i18n_en_dict.js' if os.path.exists('i18n_en_dict.js') else '../i18n_en_dict.js'
open(dst, 'w', encoding='utf-8').write('/* FAWIWE · diccionario español → inglés (generado con gen_dict.py) */\nwindow.FW_EN_DICT = ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(d), '→', dst)
