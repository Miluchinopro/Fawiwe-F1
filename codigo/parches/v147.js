/* =====================================================================================
   FAWIWE · PROTOTIPO 1.5 — segunda revisión a fondo
   1) Modo piloto: el compañero que ves es el mismo que corre la carrera.
   2) Escuderías leyenda: si tus pilotos leyenda también corren en otro equipo ese año,
      ese otro equipo pone a un piloto real libre (o un debutante) — nunca hay dos iguales.
   3) Quiz por época: no te pregunta cosas del futuro ni de reglas que todavía no existían.
   4) Textos por época (DRS, ERS, Q1/Q2/Q3, radio) que llegan desde otras pantallas.
   5) Minijuegos siempre enteros en pantalla (PC chica, celular vertical y acostado).
   6) Multijugador con el celular acostado: largada, frenadas y paneles a la vista.
   ===================================================================================== */
(function () {
  const yr = () => { try { return parseInt(s.season, 10) || 2026; } catch (e) { return 2026; } };

  /* ---------- 1) compañero alineado en modo piloto ---------- */
  if (typeof myTeamLineup === "function") {
    const o = myTeamLineup;
    myTeamLineup = function () {
      const r = o.apply(this, arguments);
      try {
        if (s._v17Mate || !Array.isArray(r) || s.playerMode !== "driver" || !s.playedDriverName || s._simulatingBackground) return r;
        if (!r[0] || r[0].name !== s.playedDriverName || !r[1] || (s.drivers || [])[1]) return r;
        s._v17Mate = true;
        let mate = null;
        try { mate = currentTeamLineup(s.club).find(d => d && d[0] !== s.playedDriverName); } finally { s._v17Mate = false; }
        if (mate && mate[0] !== r[1].name && !(typeof v15UsedElsewhere === "function" && v15UsedElsewhere(mate[0], s.club))) {
          r[1].name = mate[0]; r[1].rating = effectiveRating(mate[0], mate[1]);
        }
      } catch (e) { s._v17Mate = false; }
      return r;
    };
    window.myTeamLineup = myTeamLineup;
  }

  /* ---------- 2) sin pilotos duplicados con escuderías leyenda ---------- */
  let myCache = null;
  function v17MyNames() {
    if (myCache) return myCache;
    if (s._v17My) return [];
    s._v17My = true;
    try { myCache = myTeamLineup().map(d => d.name); } catch (e) { myCache = []; } finally { s._v17My = false; }
    const c = myCache; Promise.resolve().then(() => { if (myCache === c) myCache = null; });
    return myCache;
  }
  function v17Free(team, idx, lineup, mine) {
    const y = yr();
    s._v17Free = s._v17Free || {};
    const bag = s._v17Free[y] = s._v17Free[y] || {};
    const key = team + "_" + idx;
    if (bag[key] && !mine.has(bag[key][0])) return [bag[key][0], bag[key][1], 2, team];
    const racing = new Set();
    try { getDriversForYear(y).forEach(d => racing.add(d[0])); } catch (e) {}
    mine.forEach(n => racing.add(n));
    Object.keys(bag).forEach(k => { if (k !== key) racing.add(bag[k][0]); });
    (lineup || []).forEach(d => d && racing.add(d[0]));
    let pick = null;
    for (const dy of [-1, 1, -2, 2, -3, 3]) {
      if (pick) break;
      try {
        for (const d of originalDriverLineup(team, y + dy)) { if (d && !racing.has(d[0])) { pick = [d[0], d[1]]; break; } }
      } catch (e) {}
    }
    if (!pick) pick = [generateRookieName("v17_" + team + "_" + y + "_" + idx), 72];
    bag[key] = pick;
    return [pick[0], pick[1], 2, team];
  }
  if (typeof currentTeamLineup === "function") {
    const o = currentTeamLineup;
    currentTeamLineup = function (team) {
      const r = o.apply(this, arguments);
      try {
        if (!Array.isArray(r) || !s || team === s.club || s._v17My || s._v17Mate) return r;
        const mine = new Set(v17MyNames());
        if (!mine.size || !r.some(d => d && mine.has(d[0]))) return r;
        return r.map((d, i) => (d && mine.has(d[0])) ? v17Free(team, i, r, mine) : d);
      } catch (e) { return r; }
    };
    window.currentTeamLineup = currentTeamLineup;
  }

  /* ---------- 3) quiz de la época ---------- */
  const KW = [
    [/\bKERS\b/, 2009], [/\bERS\b|MGU|h[ií]brid/i, 2014], [/\bDRS\b/, 2011, 2025], [/\bhalo\b/i, 2018],
    [/sprint/i, 2021], [/tope de presupuesto|cost cap|l[ií]mite de presupuesto/i, 2021],
    [/\bVSC\b|virtual/i, 2015], [/Audi|Cadillac/, 2026], [/Constructores/, 1958],
    [/color.{0,30}neum|neum.{0,30}color/i, 2019], [/\b(Soft|Medium|Hard)\b/, 2019],
    [/Red Bull/, 2005], [/Toro Rosso/, 2006], [/Haas/, 2016], [/Alpine/, 2021], [/Racing Bulls/, 2024],
    [/Max Verstappen/, 2015], [/\b(Leclerc|Norris|Russell)\b/, 2018], [/\bPiastri\b/, 2023], [/\bHamilton\b/, 2007], [/\bAlonso\b/, 2001], [/\bVettel\b/, 2007]
  ];
  function v17EraOk(qz) {
    const y = yr();
    const txt = [qz.q].concat(qz.a || []).join(" · ");
    const years = txt.match(/\b(19[5-9]\d|20[0-4]\d)\b/g) || [];
    if (years.some(v => +v > y)) return false;
    for (const [re, from, to] of KW) { if (re.test(txt) && (y < from || (to && y > to))) return false; }
    return true;
  }
  window.v17EraOk = v17EraOk;
  try {
    // preguntas clásicas para que las primeras épocas también tengan quiz variado
    const add = [
      { d: 0, q: "¿Qué bandera muestra el final de la carrera?", a: ["La de cuadros", "La roja", "La azul", "La blanca"], c: 0 },
      { d: 0, q: "¿Qué bandera avisa que hay aceite o pista resbaladiza?", a: ["Amarilla con franjas rojas", "Verde", "Negra", "Azul"], c: 0 },
      { d: 0, q: "¿Quién ganó el primer Mundial de F1 en 1950?", a: ["Giuseppe Farina", "Juan Manuel Fangio", "Alberto Ascari", "Luigi Fagioli"], c: 0 },
      { d: 1, q: "¿En qué circuito se corrió la primera carrera del Mundial, en 1950?", a: ["Silverstone", "Monza", "Mónaco", "Spa"], c: 0 },
      { d: 1, q: "En 1950, ¿cuántos puntos daba ganar una carrera?", a: ["8", "10", "9", "25"], c: 0 },
      { d: 1, q: "Juan Manuel Fangio ganó su primer título en 1951. ¿Con qué marca?", a: ["Alfa Romeo", "Ferrari", "Maserati", "Mercedes"], c: 0 },
      { d: 2, q: "Alberto Ascari fue campeón en 1952 y 1953. ¿Con qué equipo?", a: ["Ferrari", "Maserati", "Alfa Romeo", "Lancia"], c: 0 },
      { d: 2, q: "Las 500 Millas de Indianápolis contaron para el Mundial desde 1950 hasta…", a: ["1960", "1955", "1970", "1952"], c: 0 },
      { d: 3, q: "¿Quién fue el primer campeón británico, en 1958?", a: ["Mike Hawthorn", "Stirling Moss", "Peter Collins", "Tony Brooks"], c: 0 },
      { d: 3, q: "¿Qué equipo hizo campeón al motor trasero en 1959?", a: ["Cooper", "Ferrari", "Vanwall", "BRM"], c: 0 },
      { d: 3, q: "Juan Manuel Fangio ganó cinco títulos. ¿En qué año ganó el último?", a: ["1957", "1955", "1958", "1954"], c: 0 },
      { d: 4, q: "Jack Brabham fue campeón en 1966 manejando…", a: ["Un auto de su propio equipo", "Un Ferrari", "Un Lotus", "Un Cooper"], c: 0 },
      { d: 4, q: "Jim Clark ganó sus títulos de 1963 y 1965 con…", a: ["Lotus", "BRM", "Brabham", "Ferrari"], c: 0 },
      { d: 5, q: "En 1950, además de los puntos por puesto, ¿qué más sumaba un punto?", a: ["La vuelta más rápida", "La pole", "Liderar una vuelta", "Terminar sin parar"], c: 0 }
    ];
    if (typeof f1QuizBank !== "undefined" && Array.isArray(f1QuizBank)) add.forEach(x => { if (!f1QuizBank.some(b => b.q === x.q)) f1QuizBank.push(x); });
  } catch (e) {}
  if (typeof pickF1Quiz === "function") {
    const o = pickF1Quiz;
    pickF1Quiz = function () {
      try {
        const era = f1QuizBank.filter(v17EraOk);
        if (era.length < 4) return o.apply(this, arguments);
        const tier = tierIndex();
        const used = new Set(s.quizUsed || []);
        let pool = era.filter(x => x.d <= tier && !used.has(x.q));
        if (!pool.length) pool = era.filter(x => !used.has(x.q));
        if (!pool.length) pool = era;
        const prefer = pool.filter(x => x.d >= Math.max(0, tier - 1));
        const src = prefer.length ? prefer : pool;
        const chosen = src[Math.floor(Math.random() * src.length)];
        s.quizUsed = (s.quizUsed || []).concat([chosen.q]).slice(-24);
        const opts = chosen.a.map((label, i) => ({ label, correct: i === chosen.c }));
        return { text: chosen.q, options: shuffleArr(opts), diff: chosen.d };
      } catch (e) { return o.apply(this, arguments); }
    };
    window.pickF1Quiz = pickF1Quiz;
  }

  /* ---------- 4) textos según la época ---------- */
  window.v17OneQ = function () {
    try { if (typeof qlSessions === "function") { let n = 22; try { n = Math.max(2, getEraTeamNames().length * 2); } catch (e) {} return qlSessions(n).length === 1; } } catch (e) {}
    return yr() < 2006;
  };
  function v17InGame() { try { const g = document.getElementById("game"); return !!(g && !g.classList.contains("hidden")); } catch (e) { return false; } }
  window.v17Rules = function (txt) { try { let v = String(txt); for (const [re, rep] of rules()) v = v.replace(re, rep); return v; } catch (e) { return txt; } };
  function rules() {
    const y = yr(), R = [];
    if (y < 2011) { R.push([/\bABRIR DRS\b/g, "BUSCAR EL REBUFO"], [/\b(el|del) DRS\b/g, (m, a) => (a === "del" ? "del" : "el") + " rebufo"], [/\bDRS\b/g, "rebufo"]); }
    if (y >= 2026) { R.push([/\bABRIR DRS\b/g, "ACTIVAR ADELANTAMIENTO"], [/\b(el|del) DRS\b/g, (m, a) => a + " modo adelantamiento"], [/\bDRS\b/g, "modo adelantamiento"]); }
    if (y < 2009) R.push([/usá el ERS solo en las rectas/g, "aprovechá el rebufo en las rectas"]);
    if (y < 1980 && v17InGame()) {
      // antes de 1980 no había radio: el box habla con la pizarra y el piloto con señas
      const drv = s.playerMode === "driver";
      R.push(
        [/Radio con el box/g, "Pizarra del box"], [/Radio check\. Fuerte y claro\./g, "Pizarra lista. Se lee clarito."],
        [/(🎙️|🔇) Voz radio/g, "$1 Voz del box"], [/Quejarte por radio/g, "Hacer señas al box"],
        [/\bpor (la )?radio\b/g, "con la pizarra"], [/📻 Tu radio/g, "🪧 Tu pizarra"], [/📻 RADIO\b/g, drv ? "✋ SEÑAS" : "🪧 PIZARRA"],
        [/📻 ([A-ZÁÉÍÓÚÑ]+) · INGENIERO/g, "🪧 PIZARRA · $1"], [/📻 INGENIERO/g, "🪧 PIZARRA DEL BOX"],
        [/🎧 PILOTO/g, "✋ SEÑAS DEL PILOTO"], [/🎧 Piloto:/g, "✋ Piloto (señas):"],
        [/🎙️ VOS\b/g, drv ? "✋ VOS (SEÑAS)" : "🪧 VOS (PIZARRA)"], [/📻 Vos: «/g, drv ? "✋ Vos (señas): «" : "🪧 Vos: «"],
        [/\bla radio\b/g, "la pizarra"], [/\bRADIO\b/g, "PIZARRA"], [/\bRadio\b/g, "Pizarra"], [/\bradio\b/g, "pizarra"],
        [/📻/g, "🪧"], [/🎧/g, "📋"]
      );
    }
    if (y < 1971 && v17InGame()) {
      // antes de 1971 no había semáforo: largaba el comisario bajando la bandera
      R.push(
        [/¡LUCES AFUERA!/g, "¡BANDERA ABAJO!"], [/Semáforos apagados/g, "Bajó la bandera"], [/Luces apagadas/g, "Bandera abajo"],
        [/¡Esperen las luces!/g, "¡Atentos a la bandera!"], [/Luces en un momento/g, "Bandera en un momento"],
        [/(que |cuando )?se apaguen las (5 )?luces(?! del auto)/g, (m, a) => (a || "") + "baje la bandera"],
        [/se apagan las (5 )?luces/g, "baja la bandera"], [/con el semáforo/g, "con la bandera"], [/\bSemáforo\b/g, "Bandera"], [/🚦/g, "🚩"]
      );
    }
    if (y < 2014) R.push([/cuidado con los límites de pista/g, "cuidado con no salirte de la pista"]);
    if (y < 1993) R.push([/llamadas de boxes, Safety Car y clima/g, "llamadas de boxes, banderas amarillas y clima"], [/\(lluvia, Safety Car/g, "(lluvia, banderas amarillas"]);
    if (window.v17OneQ()) R.push([/Q1 elimina atrás · Q2 corta el medio · Q3 decide el top 10\./g, "Una sola tanda: la mejor vuelta decide la grilla."]);
    R.push([/Historia 2000-2026/g, "Historia de la F1 hasta " + y]);
    return R;
  }
  const TRIG = /DRS|ERS solo|[Rr]adio|RADIO|📻|🎧|🎙️ VOS|Q1 elimina|Historia 2000|Safety Car|límites de pista|[Ll]uces|LUCES|[Ss]emáforo|🚦/;
  const SKIP = "script,style,textarea,input,#v17NoMap,.v6-quiz,.quiz-q";
  function fixText(root, R) {
    if (!root || !document.body.contains(root)) return;
    if (root.nodeType === 3) root = root.parentNode;
    if (!root || root.nodeType !== 1 || root.closest(SKIP)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue;
      if (!t || !TRIG.test(t)) continue;
      if (n.parentNode && n.parentNode.closest && n.parentNode.closest(SKIP)) continue;
      let v = t;
      for (const [re, rep] of R) v = v.replace(re, rep);
      if (v !== t) { if (/^\s*[a-záéíóú]/.test(v) && /^\s*DRS/.test(t)) v = v.replace(/^(\s*)(.)/, (m, a, b) => a + b.toUpperCase()); n.nodeValue = v; }
    }
  }
  let pend = new Set(), raf = 0;
  function flush() {
    raf = 0;
    try {
      if (typeof s === "undefined" || !s) { pend.clear(); return; }
      const R = rules();
      const list = [...pend]; pend.clear();
      list.forEach(r => fixText(r, R));
    } catch (e) { pend.clear(); }
  }
  try {
    const mo = new MutationObserver(recs => {
      for (const m of recs) {
        if (m.type === "characterData") { if (TRIG.test(m.target.nodeValue || "")) pend.add(m.target); }
        else m.addedNodes.forEach(a => { if ((a.nodeType === 3 ? a.nodeValue : a.textContent || "").match(TRIG)) pend.add(a); });
      }
      if (pend.size && !raf) raf = requestAnimationFrame(flush);
    });
    const go = () => mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
  } catch (e) {}


  /* 4b) antes de 1980: sin ruido de radio, y la voz lee la pizarra (una sola vez) */
  const pre80 = () => yr() < 1980 && v17InGame();
  if (typeof fwSquelch === "function") { const o = fwSquelch; fwSquelch = function () { if (pre80()) return; return o.apply(this, arguments); }; window.fwSquelch = fwSquelch; }
  if (typeof playRadioSound === "function") { const o = playRadioSound; playRadioSound = function () { if (pre80()) return; return o.apply(this, arguments); }; window.playRadioSound = playRadioSound; }
  if (typeof fwRadioSay === "function") {
    const o = fwRadioSay; let lastK = "", lastT = 0;
    fwRadioSay = function (text, who, opt) {
      try {
        if (pre80() && text) {
          text = window.v17Rules(text);
          const k = (typeof fwRadioClean === "function" ? fwRadioClean(text) : String(text)).toLowerCase();
          if (k === lastK && Date.now() - lastT < 5000) return;
          if (who === "drv" || who === "you" || who === "p2") { opt = Object.assign({}, opt || {}); if (opt.toast !== false && typeof fwRadioToast === "function") fwRadioToast(text, who); return; }
          lastK = k; lastT = Date.now();
        }
      } catch (e) {}
      return o.call(this, text, who, opt);
    };
    window.fwRadioSay = fwRadioSay;
  }


  /* 4c) clase de época en el body (largada con bandera antes de 1971) */
  setInterval(() => { try { document.body.classList.toggle("v17-flag", yr() < 1971 && v17InGame()); } catch (e) {} }, 500);

  /* ---------- 5) minijuegos enteros en pantalla ---------- */
  function fitStage() {
    const st = document.getElementById("eraStage");
    if (!st) return;
    document.body.classList.add("v17-play");
    const r = st.getBoundingClientRect();
    const vh = window.innerHeight;
    const pad = vh < 520 ? 4 : 10;
    let top;
    if (r.height + pad * 2 > vh) top = window.scrollY + r.top - pad;
    else top = window.scrollY + r.top - Math.max(pad, (vh - r.height) / 2);
    // si el mensaje del resultado entra abajo, mejor
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }
  window.v17FitStage = fitStage;
  let playTimer = 0;
  function watchPlay() {
    clearInterval(playTimer);
    playTimer = setInterval(() => {
      let alive = false;
      try { alive = !!(typeof ERA !== "undefined" && ERA && document.getElementById("eraStage")); } catch (e) {}
      if (!alive) { document.body.classList.remove("v17-play"); clearInterval(playTimer); }
    }, 400);
  }
  function hookStart(name) {
    const o = window[name];
    if (typeof o !== "function") return;
    const w = function () {
      const r = o.apply(this, arguments);
      try {
        document.body.classList.add("v17-play");
        setTimeout(fitStage, 60); setTimeout(fitStage, 420);
        watchPlay();
      } catch (e) {}
      return r;
    };
    window[name] = w;
    try { if (name === "emStart") emStart = w; else if (name === "trkStart") trkStart = w; else if (name === "eraStart") eraStart = w; } catch (e) {}
  }
  ["emStart", "trkStart", "eraStart"].forEach(hookStart);
  window.addEventListener("orientationchange", () => setTimeout(() => { if (document.body.classList.contains("v17-play")) fitStage(); }, 350));

  /* ---------- 6) multijugador con el celular acostado ---------- */
  let lastPhase = null, lastStep = null;
  setInterval(() => {
    try {
      if (typeof DL === "undefined" || !DL) { lastPhase = null; return; }
      const ph = DL.phase, step = DL.pvp ? DL.pvp.step : null;
      if (ph === lastPhase && step === lastStep) return;
      lastPhase = ph; lastStep = step;
      if (window.innerHeight > 560) return;
      setTimeout(() => {
        const ov = document.getElementById("dlOverlay");
        if (!ov || !ov.classList.contains("show")) return;
        const h1 = document.getElementById("v14Half1");
        const dec = document.getElementById("dlDecision");
        const tgt = (h1 && h1.getClientRects().length) ? h1.parentElement || h1 : (dec && dec.getClientRects().length && dec.innerHTML.trim() ? dec : null);
        if (!tgt) return;
        const r = tgt.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 2 || r.top < 0) tgt.scrollIntoView({ block: r.height > window.innerHeight ? "start" : "end", behavior: "instant" });
      }, 80);
    } catch (e) {}
  }, 250);
})();
