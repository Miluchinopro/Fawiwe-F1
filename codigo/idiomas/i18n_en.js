/* =====================================================================================
   FAWIWE · ENGLISH / PORTUGUÊS
   El juego se programó en español. Este módulo traduce al inglés o al portugués lo que se ve en pantalla
   (textos, carteles, tooltips, dibujos en canvas y la voz de la radio) sin tocar la lógica:
   - Los diccionarios (i18n_en_dict.js, i18n_pt_dict.js) tienen cada texto en español y su traducción.
   - Un MutationObserver traduce cada texto nuevo apenas aparece (antes de que se dibuje).
   - Para que los parches que leen la pantalla sigan funcionando, textContent / innerHTML /
     outerHTML devuelven el texto original en español de los nodos traducidos.
   - Idioma: ?lang=es|en|pt en la dirección, o el botón 🌐 del menú (se guarda). La primera vez
     se elige solo según el idioma del navegador. Cambiarlo con el botón NO recarga el juego:
     se devuelve la pantalla al español original y se vuelve a traducir al idioma nuevo.
   ===================================================================================== */
(function () {
  const KEY = "fw_ui_lang";
  function pickLang() {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q === "en" || q === "es" || q === "pt") { try { localStorage.setItem(KEY, q); } catch (e) {} return q; }
    } catch (e) {}
    try { const v = localStorage.getItem(KEY); if (v === "en" || v === "es" || v === "pt") return v; } catch (e) {}
    try { if (navigator.webdriver) return "es"; } catch (e) {} // pruebas automáticas: el juego base, en español
    try { const nl = String((navigator.languages && navigator.languages[0]) || navigator.language || "es").toLowerCase(); return nl.startsWith("es") ? "es" : nl.startsWith("pt") ? "pt" : "en"; } catch (e) {}
    return "es";
  }
  let LANG = pickLang();
  window.FW_LANG = LANG;

  /* ---------- botón de idioma (se ve en el menú, no en plena partida) ---------- */
  function langPill() {
    try {
      if (document.getElementById("fwLangPill")) return;
      const b = document.createElement("div");
      b.id = "fwLangPill";
      b.setAttribute("data-noi18n", "1");
      b.innerHTML = `<span class="fl-ico" aria-hidden="true">🌐</span><button type="button" data-l="es" class="${LANG === "es" ? "on" : ""}" aria-label="Español">ES</button><button type="button" data-l="en" class="${LANG === "en" ? "on" : ""}" aria-label="English">EN</button><button type="button" data-l="pt" class="${LANG === "pt" ? "on" : ""}" aria-label="Português">PT</button>`;
      b.addEventListener("click", ev => { const l = ev.target && ev.target.getAttribute && ev.target.getAttribute("data-l"); if (l && l !== LANG) window.fwSetLang(l); });
      b.fwSync = () => b.querySelectorAll("button[data-l]").forEach(x => x.classList.toggle("on", x.getAttribute("data-l") === LANG));
      document.body.appendChild(b);
      const st = document.createElement("style");
      st.textContent = `#fwLangPill{position:fixed;top:10px;right:10px;z-index:99990;display:flex;align-items:center;gap:2px;padding:3px;border-radius:999px;background:rgba(10,12,18,.82);border:1px solid rgba(255,255,255,.18);box-shadow:0 6px 18px rgba(0,0,0,.35);font:700 12px/1 Inter,Arial,sans-serif;backdrop-filter:blur(6px)}
#fwLangPill .fl-ico{padding:0 4px 0 6px;font-size:14px}
#fwLangPill button{all:unset;cursor:pointer;color:#cbd5e1;padding:6px 9px;border-radius:999px;letter-spacing:.06em}
#fwLangPill button.on{background:#e10600;color:#fff}
#fwLangPill button:focus-visible{outline:2px solid #fff;outline-offset:1px}
body.fw-ingame #fwLangPill{display:none}
@media (max-width:700px){#fwLangPill{top:auto;bottom:46px;right:8px}}`;
      document.head.appendChild(st);
      const tick = () => { try { const g = document.getElementById("game"); document.body.classList.toggle("fw-ingame", !!(g && !g.classList.contains("hidden"))); } catch (e) {} };
      tick(); setInterval(tick, 700);
    } catch (e) {}
  }
  if (document.body) langPill(); else document.addEventListener("DOMContentLoaded", langPill);

  /* ============================ INGLÉS / PORTUGUÉS ============================ */
  // lo que cambia de un idioma a otro (además del diccionario)
  const LXS = { pt: {
    html: "pt-BR", and: "e", voice: /^pt/i, pref: ["pt-BR", "pt-PT"], deflang: "pt-BR", lap: "volta", plus: "mais $1 segundos",
    era: { slip: [[/\bABRIR DRS\b/g, "BUSCAR O VÁCUO"], [/\b(o )?DRS\b/g, "o vácuo"]], ovt: [[/\bABRIR DRS\b/g, "ATIVAR ULTRAPASSAGEM"], [/\bDRS\b/g, "modo de ultrapassagem"]],
      board: [[/\b(pelo|no) rádio\b/gi, "com a placa"], [/\bRÁDIO\b/g, "PLACA"], [/\bRádio\b/g, "Placa"], [/\brádio\b/g, "placa"], [/📻/g, "🪧"], [/🎧/g, "📋"]],
      flag: [[/LUZES APAGADAS/g, "BANDEIRA BAIXADA"], [/as (5 )?luzes se apagarem/g, "a bandeira baixar"], [/as (5 )?luzes se apagam/g, "a bandeira baixa"], [/as (5 )?luzes/g, "a bandeira"], [/\bLuzes\b/g, "Bandeira"], [/🚦/g, "🚩"]],
      yel: [[/Safety Car e clima/g, "bandeiras amarelas e clima"], [/\(chuva, Safety Car/g, "(chuva, bandeiras amarelas"]] }
  }, en: {
    html: "en", and: "and", voice: /^en/i, pref: ["en-GB", "en-US", "en-AU", "en-IE", "en-CA"], deflang: "en-US", lap: "lap", plus: "plus $1 seconds",
    era: { slip: [[/\bOPEN DRS\b/g, "LOOK FOR THE SLIPSTREAM"], [/\b(the )?DRS\b/g, "the slipstream"]], ovt: [[/\bOPEN DRS\b/g, "ACTIVATE OVERTAKE"], [/\bDRS\b/g, "overtake mode"]],
      board: [[/Radio check\. Loud and clear\./g, "Pit board ready. It reads clearly."], [/\b(on|over|by) (the )?radio\b/g, "with the pit board"], [/\bRADIO\b/g, "PIT BOARD"], [/\bRadio\b/g, "Pit board"], [/\bradio\b/g, "pit board"], [/📻/g, "🪧"], [/🎧/g, "📋"]],
      flag: [[/LIGHTS OUT/g, "FLAG DOWN"], [/the (5 )?lights go out/g, "the flag drops"], [/the (5 )?lights went out/g, "the flag dropped"], [/the (5 )?lights/g, "the flag"], [/\bLights\b/g, "Flag"], [/🚦/g, "🚩"]],
      yel: [[/Safety Car and weather/g, "yellow flags and weather"], [/\(rain, Safety Car/g, "(rain, yellow flags"]] }
  } };
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let LX = LXS.en, D = new Map(), PAT = [], B = new Map();
  function build() {
  LX = LXS[LANG] || LXS.en;
  try { document.documentElement.lang = LANG === "es" ? "es" : LX.html; } catch (e) {}
  D = new Map(); PAT = []; B = new Map();
  try { cache.clear(); } catch (e) {}
  eraK = "";
  if (LANG === "es") return;
  const RAW = (LANG === "pt" ? window.FW_PT_DICT : window.FW_EN_DICT) || {};
  for (const k in RAW) { const v = RAW[k]; if (v && v !== "=" && v !== k) D.set(k, v); }
  // variantes de mayúsculas: "PILOTO" (con text-transform o escrito así) y "Fue la…" (primera letra en mayúscula)
  {
    const add = [];
    const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
    for (const [k, v] of D) {
      if (/\{(gp|nextgp)\}/.test(k)) continue;
      const K = k.toUpperCase();
      if (k.length >= 4 && K !== k) add.push([K, v.toUpperCase()]);
      if (/^[a-záéíóúñ]/.test(k)) add.push([cap(k), cap(v)]);
    }
    for (const [k, v] of add) if (!D.has(k)) D.set(k, v);
    // sin el emoji del principio ("📋 Seguir el plan" → "Seguir el plan")
    const EM = /^(?:[\p{Extended_Pictographic}\u2190-\u21FF\u2B00-\u2BFF][\uFE0F\u200D\p{Extended_Pictographic}]*\s+)+/u;
    for (const [k, v] of [...D]) {
      const m = k.match(EM);
      if (!m || k.length - m[0].length < 4) continue;
      const k2 = k.slice(m[0].length), v2 = v.replace(EM, "");
      if (!D.has(k2)) D.set(k2, v2);
    }
  }

  // textos con {gp} / {nextgp}: se traducen como patrón
  for (const [k, v] of D) {
    if (!/\{(gp|nextgp)\}/.test(k)) continue;
    const names = [...k.matchAll(/\{(gp|nextgp)\}/g)].map(m => m[1]);
    const parts = k.split(/\{(?:gp|nextgp)\}/);
    PAT.push({ re: new RegExp("^([\\s\\S]*?)" + parts.map(esc).join("(.+?)") + "$"), v, names, pre: (parts[0].length >= 4 ? parts[0] : parts[1] || "").slice(0, 12) });
  }

  // fragmentos: claves agrupadas por sus dos primeras letras, de la más larga a la más corta
  for (const k of D.keys()) {
    if (k.length < 3 || /\{(gp|nextgp)\}/.test(k) || !/[A-Za-zÀ-ÿ]/.test(k)) continue;
    const h = k.slice(0, 2);
    if (!B.has(h)) B.set(h, []);
    B.get(h).push(k);
  }
  for (const a of B.values()) a.sort((x, y) => y.length - x.length);
  }
  const isL = c => !!c && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(c);

  function matchAt(s, i) {
    if (isL(s[i]) && i > 0 && isL(s[i - 1])) return null;
    const b = B.get(s.substr(i, 2));
    if (!b) return null;
    const n = s.length;
    for (const k of b) {
      if (!s.startsWith(k, i)) continue;
      const e = i + k.length;
      if (isL(k[k.length - 1]) && e < n && isL(s[e])) continue;
      return k;
    }
    return null;
  }
  function frag(s) {
    let out = "", i = 0, ch = false;
    const n = s.length;
    while (i < n) {
      let k = matchAt(s, i);
      if (!isL(s[i])) {
        // si un poco más adelante empieza un texto más largo, se prefiere ese ("🏎️ Piloto de Carrera")
        let best = i, bestEnd = k ? i + k.length : i, bk = k;
        for (let p = i + 1; p < n && p <= i + 4; p++) {
          const k2 = matchAt(s, p);
          if (k2 && p + k2.length > bestEnd) { best = p; bestEnd = p + k2.length; bk = k2; }
          if (isL(s[p])) break;
        }
        if (best > i) { out += s.slice(i, best); i = best; }
        k = bk;
      }
      if (k) { out += D.get(k); i += k.length; ch = true; }
      else { out += s[i]; i++; }
    }
    if (!ch) return s;
    // "Fulano y Mengano": la "y" entre nombres
    return out.replace(/([\p{Ll})]) y (?=\p{Lu})/gu, "$1 " + LX.and + " ");
  }

  const TRIG = /DRS|ERS solo|[Rr]adio|RADIO|📻|🎧|🎙️ VOS|Q1 elimina|Historia 2000|Safety Car|límites de pista|[Ll]uces|LUCES|[Ss]emáforo|🚦/;
  const HASW = /[A-Za-zÀ-ÿ¿¡]{2}/;
  const cache = new Map();
  function core(c) {
    let r = D.get(c);
    if (r !== undefined) return r;
    for (const p of PAT) {
      if (p.pre && c.indexOf(p.pre) < 0) continue;
      const m = c.match(p.re);
      if (m && m[1].length <= 8) { const val = {}; p.names.forEach((nm, j) => { val[nm] = frag(m[j + 2]); }); return frag(m[1]) + p.v.replace(/\{(gp|nextgp)\}/g, (x, nm) => val[nm] || x); }
    }
    return frag(c);
  }
  // reglas de época (v147) en inglés: se traduce el texto original y después se adapta
  let eraK = "", eraR = [];
  function enRules() {
    let k = "";
    try { const y = parseInt(s.season, 10) || 0; const g = document.getElementById("game"); k = y + "|" + !!(g && !g.classList.contains("hidden")) + "|" + s.playerMode; } catch (e) {}
    if (k === eraK) return eraR;
    eraK = k; const R = [];
    try {
      const v = x => window.v17Rules(x);
      if (v("DRS") === "rebufo") R.push(...LX.era.slip);
      if (v("DRS") === "modo adelantamiento") R.push(...LX.era.ovt);
      if (v("Radio") === "Pizarra") R.push(...LX.era.board);
      if (v("Semáforo") === "Bandera") R.push(...LX.era.flag);
      if (v("llamadas de boxes, Safety Car y clima") !== "llamadas de boxes, Safety Car y clima") R.push(...LX.era.yel);
    } catch (e) {}
    eraR = R; return R;
  }
  function tr(t, noRules) {
    if (LANG === "es" || !t || !HASW.test(t)) return t;
    const rules = !noRules && TRIG.test(t) && typeof window.v17Rules === "function";
    if (!rules) { const h = cache.get(t); if (h !== undefined) return h; }
    let src = t;
    if (rules) { try { src = window.v17Rules(t); } catch (e) {} }
    const lead = /^\s/.test(src) ? (/^\s*\n/.test(src) ? "\n" : " ") : "", trail = /\s$/.test(src) ? " " : "";
    const c = /\s\s|\n|\t/.test(src) ? src.replace(/\s+/g, " ").trim() : src.trim();
    let r;
    if (rules && src !== t && !D.has(c)) {
      // la regla de época cambió el texto: se traduce el original y se adapta en inglés
      const c0 = t.replace(/\s+/g, " ").trim();
      const r0 = core(c0);
      if (r0 !== c0) { r = r0; for (const [re, rep] of enRules()) r = r.replace(re, rep); }
    }
    if (r === undefined) r = core(c);
    const out = r === c && src === t ? t : lead + r + trail;
    if (!rules) { if (cache.size > 30000) cache.clear(); cache.set(t, out); }
    return out;
  }
  window.fwT = s => tr(String(s == null ? "" : s));
  build();

  /* ---------- lo que la lógica lee de la pantalla sigue en español ---------- */
  const ORIG = new WeakMap();   // texto → { es, en }
  const ORIGA = new WeakMap();  // elemento → { atributo: { es, en } }
  const NQUIZ = ".v6-quiz,.quiz-q,#v17NoMap";
  const SKIPTAG = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, TITLE: 0 };
  let busy = false;

  function noRulesFor(el) { try { return !!(el && el.closest && el.closest(NQUIZ)); } catch (e) { return false; } }
  function doText(n) {
    const v = n.nodeValue;
    if (!v || !HASW.test(v)) return;
    const rec = ORIG.get(n);
    if (rec && rec.en === v && rec.l === LANG) return;
    const p = n.parentNode;
    if (!p || p.nodeType !== 1 || SKIPTAG[p.tagName]) return;
    if (p.closest && p.closest("[data-noi18n]")) return;
    const r = tr(v, TRIG.test(v) && noRulesFor(p));
    if (r !== v) { ORIG.set(n, { es: v, en: r, l: LANG }); n.nodeValue = r; }
    else ORIG.set(n, { es: v, en: v, l: LANG });
  }
  const ATTRS = ["title", "placeholder", "aria-label", "alt", "data-tip"];
  function doAttrs(el) {
    if (!el.hasAttribute) return;
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const v = el.getAttribute(a);
      if (!v || !HASW.test(v)) continue;
      let m = ORIGA.get(el);
      if (m && m[a] && m[a].en === v && m[a].l === LANG) continue;
      const r = tr(v, true);
      if (r !== v) { if (!m) { m = {}; ORIGA.set(el, m); } m[a] = { es: v, en: r, l: LANG }; el.setAttribute(a, r); }
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || SKIPTAG[root.tagName]) return;
    if (root.closest && root.closest("[data-noi18n]")) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: x => (x.nodeType === 1 && (SKIPTAG[x.tagName] || (x.hasAttribute && x.hasAttribute("data-noi18n")))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let x;
    while ((x = w.nextNode())) { if (x.nodeType === 3) doText(x); else doAttrs(x); }
  }
  function onRecs(recs) {
    if (busy || LANG === "es") return;   // en español no hay nada que traducir
    busy = true;
    try {
      for (const m of recs) {
        if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") { if (m.target.nodeType === 1) doAttrs(m.target); }
        else m.addedNodes.forEach(walk);
      }
    } catch (e) {} finally { busy = false; }
  }
  const mo = new MutationObserver(onRecs);
  let started = false, titleEs = "", hooked = false;
  function start() {
    if (started || !document.body) return;
    started = true;
    try { walk(document.body); } catch (e) {}
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    try { const tt = document.querySelector("title"); if (tt) { titleEs = document.title; document.title = tr(document.title); new MutationObserver(() => { if (LANG === "es") return; const t = tr(document.title); if (t !== document.title) document.title = t; }).observe(tt, { childList: true, characterData: true, subtree: true }); } } catch (e) {}
  }
  function boot() { if (LANG !== "es") { installHooks(); start(); } }
  if (document.body) boot(); else document.addEventListener("DOMContentLoaded", boot);

  // vuelve toda la pantalla al español original (para cambiar de idioma sin recargar)
  function restoreAll() {
    const root = document.body; if (!root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let x;
    while ((x = w.nextNode())) {
      if (x.nodeType === 3) { const r = ORIG.get(x); if (r) { if (r.en === x.nodeValue && r.es !== r.en) x.nodeValue = r.es; ORIG.delete(x); } }
      else { const m = ORIGA.get(x); if (m) { for (const k in m) if (x.getAttribute(k) === m[k].en) x.setAttribute(k, m[k].es); ORIGA.delete(x); } }
    }
    try { if (titleEs) document.title = titleEs; } catch (e) {}
  }
  window.fwSetLang = function (l) {
    if ((l !== "en" && l !== "es" && l !== "pt") || l === LANG) return;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    busy = true;
    try { if (LANG !== "es") restoreAll(); } catch (e) {}
    try { if (started) mo.takeRecords(); } catch (e) {}
    busy = false;
    LANG = l; window.FW_LANG = l;
    build();
    if (l !== "es") {
      installHooks();
      if (!started) start();
      else { busy = true; try { walk(document.body); document.title = tr(titleEs || document.title); mo.takeRecords(); } catch (e) {} busy = false; }
    }
    try { const p = document.getElementById("fwLangPill"); if (p && p.fwSync) p.fwSync(); } catch (e) {}
    try { if (typeof FW_RADIO !== "undefined" && typeof fwRadioVoices === "function") fwRadioVoices(); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("fw-lang", { detail: l })); } catch (e) {}
  };

  // lecturas: textContent / innerHTML / outerHTML devuelven el español original
  function installHooks() {
  if (hooked) return;
  hooked = true;
  function hasTr(el) {
    if (ORIGA.has(el)) return true;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let x;
    while ((x = w.nextNode())) {
      if (x.nodeType === 3) { const r = ORIG.get(x); if (r && r.en === x.nodeValue && r.es !== r.en) return true; }
      else if (ORIGA.has(x)) return true;
    }
    return false;
  }
  function esClone(el) {
    const c = el.cloneNode(true);
    const wa = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const wb = document.createTreeWalker(c, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const fixA = (a, b) => { const m = ORIGA.get(a); if (m) for (const k in m) if (a.getAttribute(k) === m[k].en) b.setAttribute(k, m[k].es); };
    fixA(el, c);
    let a, b;
    while ((a = wa.nextNode()) && (b = wb.nextNode())) {
      if (a.nodeType === 3) { const r = ORIG.get(a); if (r && r.en === a.nodeValue) b.nodeValue = r.es; }
      else fixA(a, b);
    }
    return c;
  }
  try {
    const dTC = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
    Object.defineProperty(Node.prototype, "textContent", {
      configurable: true, enumerable: dTC.enumerable, set: dTC.set,
      get: function () {
        if (LANG === "es") return dTC.get.call(this);
        if (this.nodeType === 3) { const r = ORIG.get(this); const v = this.nodeValue; return r && r.en === v ? r.es : v; }
        if (this.nodeType !== 1 && this.nodeType !== 11) return dTC.get.call(this);
        let out = "", any = false;
        const w = document.createTreeWalker(this, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_CDATA_SECTION);
        let x;
        while ((x = w.nextNode())) { const r = ORIG.get(x); const v = x.nodeValue; if (r && r.en === v && r.es !== v) { out += r.es; any = true; } else out += v; }
        return any ? out : dTC.get.call(this);
      }
    });
    const dIH = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    Object.defineProperty(Element.prototype, "innerHTML", {
      configurable: true, enumerable: dIH.enumerable, set: dIH.set,
      get: function () { try { if (LANG !== "es" && hasTr(this)) return dIH.get.call(esClone(this)); } catch (e) {} return dIH.get.call(this); }
    });
    const dOH = Object.getOwnPropertyDescriptor(Element.prototype, "outerHTML");
    Object.defineProperty(Element.prototype, "outerHTML", {
      configurable: true, enumerable: dOH.enumerable, set: dOH.set,
      get: function () { try { if (LANG !== "es" && hasTr(this)) return dOH.get.call(esClone(this)); } catch (e) {} return dOH.get.call(this); }
    });
    const dIT = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "innerText");
    if (dIT) Object.defineProperty(HTMLElement.prototype, "innerText", {
      configurable: true, enumerable: dIT.enumerable, set: dIT.set,
      get: function () { const v = dIT.get.call(this); try { if (LANG !== "es" && hasTr(this)) { let t = v; const w = document.createTreeWalker(this, NodeFilter.SHOW_TEXT); let x; while ((x = w.nextNode())) { const r = ORIG.get(x); if (r && r.en === x.nodeValue && r.es !== r.en) t = t.split(r.en.trim()).join(r.es.trim()); } return t; } } catch (e) {} return v; }
    });
  } catch (e) {}

  /* ---------- canvas: tarjetas para compartir, carteles dibujados ---------- */
  try {
    const P = CanvasRenderingContext2D.prototype;
    ["fillText", "strokeText", "measureText"].forEach(fn => {
      const o = P[fn];
      P[fn] = function (txt) { if (typeof txt === "string" && HASW.test(txt)) { const a = Array.prototype.slice.call(arguments); a[0] = tr(txt); return o.apply(this, a); } return o.apply(this, arguments); };
    });
  } catch (e) {}

  // los textos largos se cortan en renglones: se traduce el texto entero antes de cortarlo
  try { if (typeof v6Wrap === "function") { const o = v6Wrap; window.v6Wrap = v6Wrap = function (ctx, text) { const a = Array.prototype.slice.call(arguments); a[1] = tr(String(text == null ? "" : text)); return o.apply(this, a); }; } } catch (e) {}

  /* ---------- carteles del navegador ---------- */
  try {
    ["alert", "confirm", "prompt"].forEach(fn => {
      const o = window[fn];
      if (typeof o !== "function") return;
      window[fn] = function (msg) { const a = Array.prototype.slice.call(arguments); if (typeof msg === "string") a[0] = tr(msg); return o.apply(window, a); };
    });
  } catch (e) {}

  /* ---------- radio: la voz habla en inglés ---------- */
  try {
    const enVoices = () => {
      try {
        const all = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
        const en = all.filter(v => LX.voice.test(v.lang));
        const pref = LX.pref;
        en.sort((a, b) => { const ia = pref.indexOf(a.lang), ib = pref.indexOf(b.lang); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib); });
        return en;
      } catch (e) { return []; }
    };
    if (typeof FW_RADIO !== "undefined") {
      const oVoices = typeof fwRadioVoices === "function" ? fwRadioVoices : null;
      window.fwRadioVoices = fwRadioVoices = function () { if (LANG === "es" && oVoices) return oVoices.apply(this, arguments); FW_RADIO.voices = enVoices(); return FW_RADIO.voices; };
      try { fwRadioVoices(); if (window.speechSynthesis) speechSynthesis.onvoiceschanged = fwRadioVoices; } catch (e) {}
    }
    if (typeof fwRadioClean === "function") {
      const oClean = fwRadioClean;
      window.fwRadioClean = fwRadioClean = function (t) {
        if (LANG === "es") return oClean.apply(this, arguments);
        let v = String(t || "").replace(/<[^>]+>/g, " ");
        v = tr(v);
        return v
          .replace(/^\s*(Driver|Stewards|Engineer|Box|Piloto|Comisarios|Comissários|Ingeniero|Engenheiro)\s*:\s*/i, "")
          .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
          .replace(/[«»"“”]/g, "")
          .replace(/\bP(\d+)\b/g, "P $1")
          .replace(/\bV(\d+)\b/g, LX.lap + " $1")
          .replace(/\+(\d+(?:\.\d+)?)s\b/g, LX.plus)
          .replace(/\s+/g, " ").trim();
      };
    }
    // el aviso de "tu navegador no tiene voz en español" no aplica en inglés: alcanza con una voz en inglés
    if (window.speechSynthesis) {
      const real = speechSynthesis.getVoices.bind(speechSynthesis);
      let inSay = 0;
      try { speechSynthesis.getVoices = function () { const a = real(); if (LANG !== "es" && inSay && a.length && !a.some(v => /^es/i.test(v.lang)) && a.some(v => LX.voice.test(v.lang))) return a.concat([{ lang: "es-XX", name: "-" }]); return a; }; } catch (e) {}
      if (typeof fwRadioSay === "function") {
        const o = fwRadioSay;
        let lastK = "", lastT = 0;
        window.fwRadioSay = fwRadioSay = function (text, who, opt) {
          if (LANG === "es") return o.apply(this, arguments);
          try {
            const k = fwRadioClean(text).toLowerCase();
            if (k && k === lastK && Date.now() - lastT < 4000) return;
            lastK = k; lastT = Date.now();
          } catch (e) {}
          inSay++;
          try { return o.apply(this, arguments); } finally { inSay--; }
        };
      }
      // sin voces cargadas, el idioma de la voz por defecto es inglés
      try {
        const U0 = window.SpeechSynthesisUtterance;
        if (U0) {
          const desc = Object.getOwnPropertyDescriptor(U0.prototype, "lang");
          class U extends U0 { constructor(t) { super(t); try { if (LANG !== "es") desc.set.call(this, LX.deflang); } catch (e) {} } }
          if (desc && desc.set) Object.defineProperty(U.prototype, "lang", { configurable: true, get() { return desc.get.call(this); }, set(v) { desc.set.call(this, LANG !== "es" && /^es/i.test(String(v)) ? LX.deflang : v); } });
          window.SpeechSynthesisUtterance = U;
        }
      } catch (e) {}
    }
  } catch (e) {}
  }
})();
