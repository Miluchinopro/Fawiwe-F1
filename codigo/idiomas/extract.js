// Extrae los textos en español del juego: cadenas de JS, partes fijas de las plantillas y texto del HTML.
const fs = require('fs'), path = require('path');
const acorn = require('/opt/node-tools/node_modules/acorn');
const W = '/home/claude/work';
const M = JSON.parse(fs.readFileSync(W + '/manifest.json', 'utf8'));
const HTMLS = ['game.html', 'eng_card.html', 'eng_overlay.html', 'bfx_overlay.html', 'eng_tutorial.html'];
const out = new Map();
const SPW = /\b(el|la|los|las|de|del|que|con|tu|tus|vos|en|un|una|por|para|es|no|se|al|y|o|sin|más|tenés|sos|hay|lo|le|te|mi|su|sus|como|cuando|este|esta|ese|esa)\b/i;
function isSpanish(t) {
  if (!/[A-Za-zÁÉÍÓÚÑáéíóúñü]{2,}/.test(t)) return false;
  if (/^[\w$.\-]+$/.test(t) && !/^[A-ZÁÉÍÓÚÑ]/.test(t)) return false;           // identificadores y claves
  if (/^[#.\[]?[\w\-]+([ >#.\[:][\w\-="'\]]*)*$/.test(t) && !/\s\w+\s/.test(t) && !/[áéíóúñ]/i.test(t) && !/^[A-ZÁÉÍÓÚÑ]/.test(t)) return false; // selectores
  if (/^(https?:|data:|\.\/|\/)/.test(t)) return false;
  if (/[{};]/.test(t) && /:\s*[\w#-]+;/.test(t)) return false;                  // CSS
  if (/^\s*(var|let|const|function|return|if)\b/.test(t)) return false;
  if (/[áéíóúñÁÉÍÓÚÑ¿¡]/.test(t)) return true;
  if (SPW.test(t) && /\s/.test(t)) return true;
  if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(t)) return true;                         // una palabra con mayúscula
  if (/^[A-ZÁÉÍÓÚÑ ]{4,}$/.test(t) && /\s|[ÁÉÍÓÚÑ]/.test(t)) return true;        // TITULOS EN MAYÚSCULA
  if (/\s/.test(t) && /[a-záéíóúñ]{3,}/.test(t) && !/[=<>{}()]/.test(t)) return true;
  return false;
}
function pieces(val) {
  // separa por etiquetas HTML y entidades
  return val.replace(/<style[\s\S]*?<\/style>/g, ' ').split(/<[^>]*>/).map(x => { if (/["'\)]\s*>/.test(x)) x = x.slice(x.lastIndexOf('>') + 1); if (x.includes('<')) x = x.slice(0, x.indexOf('<')); return x.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
}
function add(t, file) {
  if (!isSpanish(t)) return;
  const e = out.get(t) || { n: 0, f: new Set() }; e.n++; e.f.add(file); out.set(t, e);
}
function attrTexts(val, file) {
  const re = /\b(placeholder|title|aria-label|data-tip|alt)="([^"$]{2,})"/g; let m;
  while ((m = re.exec(val))) add(m[2].trim(), file);
}
function fromJS(code, file) {
  let toks;
  try { toks = [...acorn.tokenizer(code, { ecmaVersion: 'latest', allowHashBang: true })]; }
  catch (e) { console.error('PARSE', file, e.message); return; }
  for (const k of toks) {
    if (k.type.label === 'string' || k.type.label === 'template') {
      const v = String(k.value == null ? '' : k.value);
      pieces(v).forEach(p => add(p, file));
      attrTexts(v, file);
    }
  }
}
for (const f of M.js) fromJS(fs.readFileSync(W + '/' + f, 'utf8'), f);
for (const f of HTMLS) {
  let h = fs.readFileSync(W + '/' + f, 'utf8');
  const scripts = [...h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  scripts.forEach(c => fromJS(c, f));
  h = h.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ' ').replace(/<style[^>]*>[\s\S]*?<\/style>/g, ' ');
  attrTexts(h, f);
  pieces(h).forEach(p => add(p, f));
}
const arr = [...out.entries()].map(([t, e]) => ({ t, n: e.n, f: [...e.f].slice(0, 3).join(',') }));
arr.sort((a, b) => a.t.localeCompare(b.t));
fs.writeFileSync('segments.json', JSON.stringify(arr, null, 0));
console.log('segments', arr.length, 'chars', arr.reduce((a, x) => a + x.t.length, 0));
