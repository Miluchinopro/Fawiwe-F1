/* =====================================================================================
   FAWIWE · V145 · Prototipo 1.4 — 43 arreglos
   ===================================================================================== */

/* ---------- 1-2) Multijugador: campeonatos que suman como la carrera ---------- */
if (typeof window.finishRace === "function") {
  const o = window.finishRace;
  window.finishRace = function () {
    const multi = !!(s && s.player2);
    const doneBefore = !!s.raceDone;
    const p1Before = s.points || 0, p2Before = multi ? (s.player2.points || 0) : 0;
    const tsBefore = multi ? Object.assign({}, s.teamStandings || {}) : null;
    const r = o.apply(this, arguments);
    try {
      if (multi && !doneBefore && s.raceDone) {
        const key = s.season + "_" + s.gp;
        if (s._v15Pts !== key) {
          s._v15Pts = key;
          const g = simulateGrid("race") || [];
          if (!s.driverPoints) initDriverStandings();
          if (!s.driverWins) s.driverWins = {};
          g.forEach(e => {
            const b = String(e.name).replace(" (reserva)", "");
            s.driverPoints[b] = (s.driverPoints[b] || 0) + (e.pts || 0);
            if (e.pos === 1 && !e.status) s.driverWins[b] = (s.driverWins[b] || 0) + 1;
          });
          const tot = t => g.filter(e => e.team === t).reduce((a, e) => a + (e.pts || 0), 0);
          s.points = p1Before + tot(s.team);
          if (s.player2.club !== s.team) s.player2.points = p2Before + tot(s.player2.club);
          const ts = s.teamStandings || (s.teamStandings = {});
          const mine = new Set([s.team, s.player2.club]);
          Object.keys(Object.assign({}, tsBefore, ts)).forEach(t => { if (!mine.has(t)) ts[t] = (tsBefore[t] || 0); });
          g.forEach(e => { if (!mine.has(e.team)) ts[e.team] = (ts[e.team] || 0) + (e.pts || 0); });
          ts[s.team] = s.points; ts[s.player2.club] = s.player2.points;
          try { render(); } catch (e) {}
        }
      }
    } catch (e) { console.warn("[FAWIWE] v145 puntos multijugador:", e); }
    return r;
  };
}

/* ---------- 3) Un piloto nunca puede estar en dos equipos a la vez ---------- */
function v15UsedElsewhere(name, exceptTeam) {
  const ro = s && s.rosterOverrides; if (!ro) return false;
  return Object.keys(ro).some(t => t !== exceptTeam && (ro[t] || []).some(d => d && d[0] === name));
}
function v15FreeDriver(seed) {
  try {
    const used = new Set();
    getEraTeamNames().forEach(t => { if (t === s.club) return; try { currentTeamLineup(t).forEach(d => used.add(d[0])); } catch (e) {} });
    (s.drivers || []).forEach(n => used.add(n));
    if (s.playedDriverName) used.add(s.playedDriverName);
    const pool = getDriversForYear(s.season).concat(getDriversForYear(s.season - 1)).filter(d => !used.has(d[0]));
    if (pool.length) { const d = pool[Math.abs(deterministicHash(seed)) % pool.length]; return { name: d[0], rating: d[1] }; }
  } catch (e) {}
  return { name: generateRookieName(seed), rating: 72 };
}
if (typeof myTeamLineup === "function") {
  const o = myTeamLineup;
  myTeamLineup = function () {
    const r = o.apply(this, arguments);
    if (!Array.isArray(r) || !s || s._v15Lineup) return r;
    s._v15Lineup = true;
    try {
      r.forEach(seat => {
        if (!seat || !seat.name) return;
        if (s.playerMode === "driver" && seat.name === s.playedDriverName) return;
        if ((s.drivers || []).includes(seat.name)) return;
        if (v15UsedElsewhere(seat.name, s.club)) {
          s._v15Swap = s._v15Swap || {};
          const k = s.season + "_" + s.club + "_" + seat.name;
          if (!s._v15Swap[k]) s._v15Swap[k] = v15FreeDriver("mate_" + k);
          const f = s._v15Swap[k];
          seat.name = f.name; seat.rating = effectiveRating(f.name, f.rating);
        }
      });
    } catch (e) {} finally { s._v15Lineup = false; }
    return r;
  };
  window.myTeamLineup = myTeamLineup;
}
if (typeof currentTeamLineup === "function") {
  const o = currentTeamLineup;
  currentTeamLineup = function (team) {
    const r = o.apply(this, arguments);
    try {
      if (!Array.isArray(r) || !s || team === s.club) return r;
      const mine = new Set((s.drivers || []).concat(s.playerMode === "driver" && s.playedDriverName ? [s.playedDriverName] : []));
      if (!mine.size) return r;
      return r.map((d, i) => (d && mine.has(d[0])) ? [generateRookieName("v15_" + team + "_" + s.season + "_" + i), 72, 2, team] : d);
    } catch (e) { return r; }
  };
  window.currentTeamLineup = currentTeamLineup;
}

/* ---------- 4) Volver al menú cierra todo lo que estaba abierto ---------- */
if (typeof returnToMenu === "function") {
  const o = returnToMenu;
  returnToMenu = function () {
    const oneOff = !!(s && (s.challenge || s.quickRace));
    let r;
    if (oneOff) { const c = window.confirm; window.confirm = () => true; try { r = o.apply(this, arguments); } finally { window.confirm = c; } }
    else r = o.apply(this, arguments);
    try {
      if (document.getElementById("game").classList.contains("hidden")) {
        ["resultOverlay", "podOverlay", "v7Flag", "pressOverlay", "aiEventOverlay", "dlOverlay", "qlOverlay", "engLiveOverlay", "v11Face", "engPreShow", "v9QuickEnd", "v7Champ", "seasonChangesOverlay", "v6Share", "v14Pass", "duelTurn"].forEach(id => {
          const e = document.getElementById(id); if (!e) return;
          e.classList.remove("show"); if (id === "pressOverlay") e.style.display = "none";
        });
        try { if (DL) { clearInterval(dlTimer); clearInterval(dlDecTimer); DL = null; } } catch (e) {}
        try { if (QL) { clearInterval(qlTimer); clearInterval(qlDecTimer); QL = null; } } catch (e) {}
        try { s.pendingPress = null; s.aiEventActive = false; } catch (e) {}
        document.body.classList.remove("v10-dec");
        window.scrollTo(0, 0);
      }
    } catch (e) {}
    return r;
  };
  window.returnToMenu = returnToMenu;
}

/* ---------- 5) Tarjeta de temporada: tus puntos y las carreras justas ---------- */
function v9SeasonTrack() {
  try {
    const m = String(s._v4ResKey || "").match(/^(\d+)_(\d+)$/); if (!m) return;
    const season = +m[1], gp = +m[2];
    const grid = s._v4Grid || [];
    const lineup = myTeamLineup() || [];
    const mine = grid.filter(e => lineup.some(d => d.name === e.name));
    const me = s.playerMode === "driver" ? (mine.find(e => e.name === s.playedDriverName) || mine[0]) : (mine.filter(e => !e.status).sort((a, b) => a.pos - b.pos)[0] || mine[0]);
    if (!me) return;
    const S = s._v9Season && s._v9Season.season === season ? s._v9Season : (s._v9Season = { season, wins: 0, pods: 0, races: 0, best: null, seen: {} });
    if (S.seen[gp]) return; S.seen[gp] = 1;
    S.races++;
    if (!me.status && me.pos === 1) S.wins++;
    if (!me.status && me.pos <= 3) S.pods++;
    if (!me.status && (!S.best || me.pos < S.best.pos)) S.best = { pos: me.pos, trk: (trackData[gp] || {}).name || "" };
  } catch (e) {}
}
if (typeof v9SeasonData === "function") {
  const o = v9SeasonData;
  v9SeasonData = function () {
    const D = o.apply(this, arguments);
    try {
      if (D.drv) { const b = (s.playedDriverName || "").replace(" (reserva)", ""); D.pts = (s.driverPoints && s.driverPoints[b]) || 0; }
      const total = (typeof trackData !== "undefined" && trackData.length) || 10;
      if (D.races > total) D.races = total;
    } catch (e) {}
    return D;
  };
}

/* ---------- 6) "Potencia de la IA" ya no aparece vacía ---------- */
(function () {
  const sel = document.getElementById("inGameAiLevel");
  if (sel) [...sel.options].forEach(op => { op.value = String(parseFloat(op.value)); });
  if (typeof render === "function") {
    const o = render;
    render = function () {
      const r = o.apply(this, arguments);
      try { const a = document.getElementById("inGameAiLevel"); if (a && s) a.value = String(parseFloat(s.aiLevel || 1)); } catch (e) {}
      return r;
    };
    window.render = render;
  }
})();

/* ---------- 7) Cartel de clasificación: dice dónde largás ---------- */
if (typeof showBigResult === "function") {
  const o = showBigResult;
  showBigResult = function (kind, title, sub, cls, grid) {
    try {
      if (/^CLASIFICACI/.test(String(kind)) && s.lastQuali) {
        const pos = s.lastQuali.pos;
        let single = false;
        try { single = qlSessions((Array.isArray(grid) && grid.length) || 20).length === 1; } catch (e) {}
        sub = String(sub || ""); title = String(title || "");
        const eng = /Tu piloto/.test(sub);
        if (/CLASIFICADO A Q3/.test(title)) {
          title = "P" + pos + " EN LA GRILLA";
          sub = sub.replace(/(Tu piloto está|Estás) en la pelea de la última tanda\./,
            single ? (eng ? "Larga P" : "Largás P") + pos + " el domingo." : (eng ? "Llegó a la Q3: larga P" : "Llegaste a la Q3: largás P") + pos + " el domingo.");
        } else if (single && /ELIMINADO EN Q[12]/.test(title)) {
          title = "P" + pos + " EN LA GRILLA";
          sub = sub.replace(/No pasaste a Q2\. Hay que encontrar ritmo el sábado que viene\.|Cerca de la Q3, pero el corte te dejó afuera\./, (eng ? "Larga P" : "Largás P") + pos + " el domingo.");
        } else if (/ELIMINADO EN Q1/.test(title)) {
          sub = sub.replace("No pasaste a Q2.", "No pasaste a Q2: " + (eng ? "larga P" : "largás P") + pos + ".");
        } else if (/ELIMINADO EN Q2/.test(title)) {
          sub = sub.replace("el corte te dejó afuera.", "el corte te dejó afuera: " + (eng ? "larga P" : "largás P") + pos + ".");
        }
        if (single) sub = sub.replace("La Q3 fue perfecta.", "Nadie fue más rápido el sábado.");
      }
    } catch (e) {}
    const r = o.call(this, kind, title, sub, cls, grid);
    try { const ov = document.getElementById("resultOverlay"); if (ov) ov.classList.toggle("v15-quali", /^CLASIFICACI/.test(String(kind))); } catch (e) {}
    return r;
  };
  window.showBigResult = showBigResult;
}

/* =====================================================================================
   8-13) ÉPOCAS REALES: grillas, calendarios, puntos, vuelta rápida y sprints
   ===================================================================================== */
// 8) grillas 1950-1999 con los pilotos reales de cada año
(function () {
  if (typeof V15_HIST === "undefined" || typeof teamsByYear === "undefined") return;
  const known = {};
  try { Object.keys(driversByYear).forEach(k => driversByYear[k].forEach(d => { if (!known[d[0]] || +k >= known[d[0]].y) known[d[0]] = { r: d[1], y: +k }; })); } catch (e) {}
  Object.keys(V15_HIST).forEach(y => {
    const H = V15_HIST[y];
    H.D.forEach(d => {
      const r = V15_RATING[d[0]] || (known[d[0]] && known[d[0]].r) || 74;
      d[1] = r; d[2] = Math.max(1, Math.round((r - 62) * 0.8));
    });
    teamsByYear[y] = H.T.map(t => t.slice());
    driversByYear[y] = H.D.map(d => d.slice());
  });
  // 9) 2009: Fisichella en un solo equipo · 2026: Racing Bulls con Lawson y Lindblad
  try {
    const d9 = driversByYear[2009];
    if (d9) { const fer = d9.filter(d => d[3] === "Scuderia Ferrari"); const fi = fer.find(d => /Fisichella/.test(d[0])); if (fi && d9.filter(d => /Fisichella/.test(d[0])).length > 1) { fi[0] = "Felipe Massa"; fi[1] = 86; fi[2] = 18; } }
    const d26 = driversByYear[2026];
    if (d26) { const t = d26.find(d => d[0] === "Yuki Tsunoda" && /Racing Bulls/.test(d[3])); if (t) { t[0] = "Arvid Lindblad"; t[1] = 77; t[2] = 3; } }
  } catch (e) {}
  try { Object.assign(teamColors, { "Talbot-Lago": "#2b5fad", "Gordini": "#1f5fbf", "Mercedes-Benz": "#c9ced6", "Lancia": "#b5121b", "HWM": "#2e7d32", "Porsche": "#d0d0d0" }); } catch (e) {}
  const clampY = year => Math.max(1950, Math.min(2026, year | 0));
  // 8 bis) si armaste tu propia parrilla en el editor, manda la tuya
  window.v15Tpl = function () { try { return typeof engActiveTemplate === "function" && !!engActiveTemplate(); } catch (e) { return false; } };
  function withMine(T, y) {
    try {
      if (typeof s === "undefined" || !s || !s.team || s.season !== y) return T;
      const need = [s.team].concat(s.player2 && s.player2.club ? [s.player2.club] : []);
      need.forEach(team => {
        if (T.some(t => t[0] === team)) return;
        const yy = Object.keys(teamsByYear).map(Number).filter(k => teamsByYear[k].some(t => t[0] === team)).sort((a, b) => Math.abs(a - y) - Math.abs(b - y))[0];
        let tm = yy != null ? teamsByYear[yy].find(t => t[0] === team) : (legendTeams.find(t => t[0] === team) || [team, 2.5]);
        try { if (s.customTeam && s.customTeam.name === team) tm = [team, s.customTeam.rating]; } catch (e) {}
        T = T.concat([tm]);
      });
    } catch (e) {}
    return T;
  }
  if (typeof getTeamsForYear === "function") {
    const o = getTeamsForYear;
    getTeamsForYear = function (year) {
      const y = clampY(year);
      if (v15Tpl()) return o.apply(this, arguments);
      if (V15_HIST[y]) return withMine(V15_HIST[y].T.map(t => t.slice()), y);
      return o.apply(this, arguments);
    };
    window.getTeamsForYear = getTeamsForYear;
  }
  if (typeof getDriversForYear === "function") {
    const o = getDriversForYear;
    getDriversForYear = function (year) {
      const y = clampY(year);
      if (!V15_HIST[y] || v15Tpl()) return o.apply(this, arguments);
      let D = driversByYear[y].slice();
      try {
        if (typeof s !== "undefined" && s && s.team && s.season === y && typeof lastKnownLineup === "function") {
          [s.team].concat(s.player2 && s.player2.club ? [s.player2.club] : []).forEach(team => {
            if (D.some(d => d[3] === team)) return;
            const add = lastKnownLineup(team, y).filter(d => !D.some(x => x[0] === d[0])).map(d => [d[0], d[1], d[2], team]);
            D = D.concat(add);
          });
        }
      } catch (e) {}
      return D;
    };
    window.getDriversForYear = getDriversForYear;
  }
})();

// 10) calendarios con las carreras que existían cada año
(function () {
  if (typeof CAL_POOL === "undefined") return;
  const R = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const set = (n, p) => { const c = CAL_POOL.find(x => x.n === n); if (c) Object.assign(c, p); };
  set("Mónaco", { skip: [1951, 1952, 1953, 1954, 2020] });
  set("Bélgica", { from: 1950, skip: [1957, 1959, 1969, 1971, 2003, 2006] });
  set("Alemania", { from: 1951, to: 2019, skip: [1955, 1960, 2007, 2015, 2017] });
  set("Francia", { from: 1950, to: 2008, skip: [1955], more: [2018, 2019, 2021, 2022] });
  set("España", { from: 1986, more: [1951, 1954].concat(R(1968, 1981)), skip: [] });
  set("Países Bajos", { from: 1952, to: 1985, skip: [1954, 1956, 1957, 1972], more: R(2021, 2026) });
  set("Canadá", { from: 1967, skip: [1975, 1987, 2020] });
  set("Brasil", { from: 1973, skip: [2020] });
  set("Japón", { from: 1987, more: [1976, 1977], skip: [2020, 2021] });
  set("Australia", { skip: [2020, 2021] });
  set("Austria", { from: 2014, more: [1964].concat(R(1970, 1987), R(1997, 2003)) });
  set("México", { from: 2015, more: R(1963, 1970).concat(R(1986, 1992)), skip: [2020] });
  set("Estados Unidos", { from: 2012, more: R(1959, 1980).concat([1989, 1990, 1991], R(2000, 2007)), skip: [2020] });
  set("Argentina", { more: R(1953, 1958).concat([1960], R(1972, 1975), R(1977, 1981)) });
  set("Portugal", { more: [1958, 1959, 1960].concat(R(1984, 1996)) });
  set("Las Vegas", { more: [1981, 1982] });
  set("Singapur", { skip: [2020, 2021] });
  set("China", { skip: [2020, 2021, 2022, 2023] });
  set("Azerbaiyán", { skip: [2020] });
  set("Bahréin", { skip: [2011] });
  set("Emilia-Romaña", { skip: [2023] });
  const add = c => { if (!CAL_POOL.find(x => x.n === c.n)) CAL_POOL.push(c); };
  add({ n: "Sudáfrica", laps: 72, rec: "1:08.149", from: 1962, to: 1993, skip: [1964, 1966].concat(R(1986, 1991)), icon: "🦁", type: "power", ov: "medio", wear: 1.1, wv: 0.8, note: "Kyalami: altura, calor y la recta larguísima que termina en Crowthorne.", c: ["Crowthorne", "Barbecue", "Jukskei", "Clubhouse"], m: [["trkSlip", "Rebufo en la recta principal"], ["trkTemp", "Calor del Highveld"], ["trkWall", "Frenada de Crowthorne"], ["trkSide", "Ataque en Clubhouse"]], era: "en Kyalami", country: "Sudáfrica" });
  add({ n: "Suiza", laps: 42, rec: "2:39.700", from: 1950, to: 1954, icon: "🏔️", type: "power", ov: "difícil", wear: 1.0, wv: 1.3, note: "Bremgarten: árboles, adoquines y curvas rapidísimas en el bosque de Berna.", c: ["Forsthaus", "Eymatt", "Bethlehem", "Glasbrunnen"], m: [["trkBand", "Curvas rápidas en el bosque"], ["trkWet", "Lluvia en Berna"], ["trkWall", "Frenada de Forsthaus"], ["trkSide", "Ataque en Eymatt"]], era: "en Bremgarten", country: "Suiza" });
  add({ n: "Suecia", laps: 70, rec: "1:24.836", from: 1973, to: 1978, icon: "🛫", type: "mech", ov: "medio", wear: 1.0, wv: 1.0, note: "Anderstorp: una pista sobre un aeródromo, con una recta que también era pista de aterrizaje.", c: ["Startkurvan", "Södra", "Norra", "Läktarkurvan"], m: [["trkSlip", "Rebufo en la pista de aterrizaje"], ["trkSimon", "Curvas largas de memoria"], ["trkWall", "Frenada de Norra"], ["trkSide", "Ataque en la Startkurvan"]], era: "en Anderstorp", country: "Suecia" });
  // registra los datos de los circuitos nuevos en los otros módulos
  CAL_POOL.filter(c => ["Sudáfrica", "Suiza", "Suecia"].includes(c.n)).forEach(c => {
    try { if (typeof circuitTraits !== "undefined" && !circuitTraits[c.n]) circuitTraits[c.n] = { overtake: c.ov, tireWear: c.wear, weatherVar: c.wv, note: c.note }; } catch (e) {}
    try { if (typeof ENG_TRACK_TYPE !== "undefined" && !ENG_TRACK_TYPE[c.n]) ENG_TRACK_TYPE[c.n] = c.type; } catch (e) {}
    try { if (typeof EM_CORNERS !== "undefined" && !EM_CORNERS[c.n]) EM_CORNERS[c.n] = c.c; } catch (e) {}
    try { if (typeof FAME_TRACK_COUNTRY !== "undefined" && !FAME_TRACK_COUNTRY[c.n]) FAME_TRACK_COUNTRY[c.n] = c.country; } catch (e) {}
    try { if (typeof FW_TRACK_MINI !== "undefined" && !FW_TRACK_MINI[c.n]) FW_TRACK_MINI[c.n] = { icon: c.icon, v: c.m.concat([["era", c.era]]) }; } catch (e) {}
  });
  // orden de las fechas según la época
  const ORD = {
    old: ["Argentina", "Sudáfrica", "Brasil", "España", "Mónaco", "Suiza", "Bélgica", "Suecia", "Países Bajos", "Francia", "Gran Bretaña", "Alemania", "Austria", "Italia", "Portugal", "Canadá", "Estados Unidos", "México", "Las Vegas", "Japón", "Australia"],
    e85: ["Sudáfrica", "Brasil", "Argentina", "Estados Unidos", "San Marino", "España", "Mónaco", "Canadá", "México", "Francia", "Gran Bretaña", "Alemania", "Austria", "Países Bajos", "Hungría", "Bélgica", "Italia", "Portugal", "Japón", "Australia"],
    e96: ["Australia", "Brasil", "Argentina", "San Marino", "España", "Mónaco", "Canadá", "Francia", "Gran Bretaña", "Alemania", "Austria", "Hungría", "Bélgica", "Italia", "Estados Unidos", "Malasia", "Japón", "Portugal"],
    e04: ["Australia", "Bahréin", "Malasia", "Arabia Saudita", "China", "Japón", "Miami", "Turquía", "San Marino", "Emilia-Romaña", "España", "Mónaco", "Canadá", "Austria", "Francia", "Gran Bretaña", "Alemania", "Hungría", "Bélgica", "Países Bajos", "Italia", "Portugal", "Azerbaiyán", "Singapur", "Estados Unidos", "México", "Brasil", "Las Vegas", "Qatar", "Argentina", "Abu Dhabi"],
    e26: ["Australia", "China", "Japón", "Bahréin", "Arabia Saudita", "Miami", "Canadá", "Mónaco", "España", "Austria", "Gran Bretaña", "Bélgica", "Hungría", "Países Bajos", "Italia", "Azerbaiyán", "Singapur", "Estados Unidos", "México", "Brasil", "Las Vegas", "Qatar", "Abu Dhabi"]
  };
  function v15Order(y) { return y < 1985 ? ORD.old : y < 1996 ? ORD.e85 : y < 2004 ? ORD.e96 : y < 2026 ? ORD.e04 : ORD.e26; }
  window.v15Order = v15Order;
  if (typeof calForSeason === "function") {
    const o = calForSeason;
    calForSeason = function (y) {
      y = parseInt(y, 10) || 2026;
      const mine = typeof s !== "undefined" && s && s.team && s.season === y;
      try {
        if (mine && s._v15Cal && s._v15Cal.season === y && s._v15Cal.seed === s.calSeed) {
          const L = s._v15Cal.names.map(n => CAL_POOL.find(c => c.n === n)).filter(Boolean);
          if (L.length === s._v15Cal.names.length) return L;
        }
      } catch (e) {}
      let list;
      // una partida vieja cargada a mitad de temporada conserva el calendario que ya tenía
      if (mine && !s._v15Cal && (s.gp || 0) > 0) list = o.apply(this, arguments);
      else {
        list = o.apply(this, arguments);
        const ord = v15Order(y);
        const k = c => { const i = ord.indexOf(c.n); return c.finale ? 999 : i >= 0 ? i : 500 + CAL_POOL.indexOf(c); };
        // la fecha que abría la temporada ese año siempre está
        const opener = (y >= 1996 && y <= 2026 && ![2006, 2010, 2020, 2021, 2022, 2023, 2024, 2025].includes(y)) ? "Australia" : ([2006, 2010, 2022, 2023, 2024, 2025].includes(y) ? "Bahréin" : null);
        const oc = opener && CAL_POOL.find(c => c.n === opener);
        if (oc && calRunsIn(oc, y) && !list.includes(oc)) {
          const rm = list.slice().reverse().find(c => !c.fixed && !c.finale);
          if (rm) list = list.filter(c => c !== rm).concat([oc]);
        }
        list = list.slice().sort((a, b) => k(a) - k(b));
      }
      if (mine) s._v15Cal = { season: y, seed: s.calSeed, names: list.map(c => c.n) };
      return list;
    };
    window.calForSeason = calForSeason;
  }
})();

// 11-12) puntos y vuelta rápida según el año
function v15PointsFor(y, gp) {
  y = y | 0;
  let p;
  if (y < 1960) p = [8, 6, 4, 3, 2];
  else if (y === 1960) p = [8, 6, 4, 3, 2, 1];
  else if (y <= 1990) p = [9, 6, 4, 3, 2, 1];
  else if (y <= 2002) p = [10, 6, 4, 3, 2, 1];
  else if (y <= 2009) p = [10, 8, 6, 5, 4, 3, 2, 1];
  else p = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  if (y === 2014 && gp === 9) p = p.map(x => x * 2);
  return p;
}
function v15FLAnyPos() { return s && s.season < 1960; }
function v15FLPoint() { return s && (s.season < 1960 || (s.season >= 2019 && s.season <= 2024)); }
function v15CustomPoints() { try { return !!(s.rosterTemplate && s.rosterTemplate.points && s.rosterTemplate.points.length && typeof engOn === "function" && engOn()); } catch (e) { return false; } }
function v15ApplyPoints() {
  try { if (s && s.season && !v15CustomPoints() && !s._juniorMode) s.pointsSystem = v15PointsFor(s.season, s.gp || 0); } catch (e) {}
}
["finishRace", "simulateGrid"].forEach(fn => {
  const o = window[fn]; if (typeof o !== "function") return;
  window[fn] = function () { v15ApplyPoints(); return o.apply(this, arguments); };
});
try { simulateGrid = window.simulateGrid; } catch (e) {}

// 13) sprints en los circuitos reales de cada año
const V15_SPRINTS = {
  2021: ["Gran Bretaña", "Italia", "Brasil"],
  2022: ["Emilia-Romaña", "Austria", "Brasil"],
  2023: ["Azerbaiyán", "Austria", "Bélgica", "Qatar", "Estados Unidos", "Brasil"],
  2024: ["China", "Miami", "Austria", "Estados Unidos", "Brasil", "Qatar"],
  2025: ["China", "Miami", "Bélgica", "Estados Unidos", "Brasil", "Qatar"],
  2026: ["China", "Miami", "Canadá", "Gran Bretaña", "Países Bajos", "Singapur"]
};
if (typeof engSprintGPs === "function") {
  const o = engSprintGPs;
  engSprintGPs = function (season) {
    try {
      const list = V15_SPRINTS[season];
      if (list && typeof trackData !== "undefined" && trackData.length) {
        let idx = trackData.map((t, i) => list.includes(t.name) ? i : -1).filter(i => i > 0);
        if (idx.length < 3) o.call(this, season).forEach(i => { if (idx.length < 3 && !idx.includes(i)) idx.push(i); });
        return idx.slice(0, 6).sort((a, b) => a - b);
      }
    } catch (e) {}
    return o.apply(this, arguments);
  };
  window.engSprintGPs = engSprintGPs;
}

["start", "nextGP"].forEach(fn => {
  const o = window[fn]; if (typeof o !== "function") return;
  window[fn] = function () { const r = o.apply(this, arguments); v15ApplyPoints(); return r; };
});

/* =====================================================================================
   44) Campeón de verdad: el título se gana terminando primero (antes alcanzaba con 200 pts)
   ===================================================================================== */
function v15IsChampion(p) {
  try {
    const drv = s.playerMode === "driver";
    if (drv) {
      const name = p === 2 ? (typeof v13P2Name === "function" ? v13P2Name() : null) : s.playedDriverName;
      if (!name) return false;
      const dp = s.driverPoints || {}, dw = s.driverWins || {};
      const base = String(name).replace(" (reserva)", "");
      const rows = Object.keys(dp).sort((a, b) => (dp[b] - dp[a]) || ((dw[b] || 0) - (dw[a] || 0)));
      return rows[0] === base && (dp[base] || 0) > 0;
    }
    const team = p === 2 ? s.player2 && s.player2.club : s.team;
    if (!team) return false;
    const st = Object.assign({}, s.teamStandings || {});
    st[s.team] = s.points || 0; if (s.player2) st[s.player2.club] = s.player2.points || 0;
    let names = Object.keys(st); try { const era = getEraTeamNames(); names = names.filter(n => era.includes(n) || n === s.team || (s.player2 && n === s.player2.club)); } catch (e) {}
    const best = names.sort((a, b) => st[b] - st[a])[0];
    return best === team && (st[team] || 0) > 0;
  } catch (e) { return false; }
}
// 24) cartel de fin de temporada con tu resumen
function v15SeasonEnd() {
  let title = "🏁 TEMPORADA " + s.season + " TERMINADA", sub = "";
  try {
    const drv = s.playerMode === "driver" && s.playedDriverName;
    if (drv) {
      const dp = s.driverPoints || {}, dw = s.driverWins || {};
      const rows = Object.keys(dp).sort((a, b) => (dp[b] - dp[a]) || ((dw[b] || 0) - (dw[a] || 0)));
      const i = rows.indexOf(s.playedDriverName);
      if (i === 0) title = "👑 ¡CAMPEÓN DEL MUNDO " + s.season + "!";
      sub = "Terminaste P" + (i + 1) + " en el campeonato de pilotos con " + (dp[s.playedDriverName] || 0) + " puntos.";
    } else {
      const st = Object.assign({}, s.teamStandings || {}); st[s.team] = s.points || 0;
      let names = Object.keys(st); try { const era = getEraTeamNames(); names = names.filter(n => era.includes(n) || n === s.team); } catch (e) {}
      names.sort((a, b) => st[b] - st[a]);
      const i = names.indexOf(s.team);
      if (i === 0) title = "👑 ¡CAMPEONES DE CONSTRUCTORES " + s.season + "!";
      sub = s.team + " terminó P" + (i + 1) + " en Constructores con " + (s.points || 0) + " puntos.";
    }
    if (s.player2) sub += " · " + (s.player2.name || "Jugador 2") + ": " + (s.player2.points || 0) + " puntos.";
    const orig = (s.originalDriverResults || []).map(r => r.name + " P" + (r.position || "—")).join(" · ");
    if (orig) sub += " · Pilotos originales: " + orig;
  } catch (e) {}
  return [title, sub];
}

/* =====================================================================================
   14-43) Celular, textos y detalles
   ===================================================================================== */
function v15SeasonStarted() {
  try { return !!(s.raceDone || (s.gp || 0) > 0 || (s.points || 0) > 0 || Object.values(s.driverPoints || {}).some(v => v > 0)); } catch (e) { return true; }
}
// 23) antes de la primera carrera no hay posiciones
if (typeof dashTeamPos === "function") {
  const o = dashTeamPos;
  dashTeamPos = function () {
    if (!v15SeasonStarted()) return "—";
    try {
      if (s.playerMode === "driver" && s.playedDriverName && !s.player2) {
        const dp = s.driverPoints || {}, dw = s.driverWins || {};
        const rows = Object.keys(dp).sort((a, b) => (dp[b] - dp[a]) || ((dw[b] || 0) - (dw[a] || 0)));
        const i = rows.indexOf(s.playedDriverName); if (i >= 0) return "P" + (i + 1);
      }
    } catch (e) {}
    return o.apply(this, arguments);
  };
  window.dashTeamPos = dashTeamPos;
}
if (typeof renderOriginalDrivers === "function") {
  const o = renderOriginalDrivers;
  renderOriginalDrivers = function () {
    const r = o.apply(this, arguments);
    try { if (!v15SeasonStarted()) document.querySelectorAll("#originalDriversCard .pos").forEach(e => { e.textContent = "—"; }); } catch (e) {}
    return r;
  };
  window.renderOriginalDrivers = renderOriginalDrivers;
}
// 21) telemetría con los pilotos que corren · 22) "(P1)" solo en multijugador · 33) récords sin plata en modo piloto
if (typeof render === "function") {
  const o = render;
  render = function () {
    const r = o.apply(this, arguments);
    try {
      const tb = document.getElementById("telemetryBody");
      if (tb && /Sin pilotos contratados/.test(tb.innerHTML)) {
        const L = (myTeamLineup() || []).map(d => d.name + " (rating " + Math.round(d.rating || 0) + ")").join(" • ");
        if (L) tb.innerHTML = tb.innerHTML.replace("Sin pilotos contratados (se usa rendimiento base)", L);
      }
      if (!s.player2) { const st = document.getElementById("standings"); if (st && st.innerHTML.includes(" (P1)</td>")) st.innerHTML = st.innerHTML.replace(" (P1)</td>", " ⭐</td>"); }
      if (s.playerMode === "driver") document.querySelectorAll("#game td").forEach(td => { if (/Mayor presupuesto alcanzado/.test(td.textContent)) td.parentElement.style.display = "none"; });
    } catch (e) {}
    return r;
  };
  window.render = render;
}
// 29) plata: "$0" en vez de "$0K"
if (typeof formatMoney === "function") {
  const o = formatMoney;
  formatMoney = function (m) { if (!m || Math.abs(m) < 0.0005) return "$0"; return o.apply(this, arguments); };
  window.formatMoney = formatMoney;
}
// 28) el juego queda en castellano
try { if (localStorage.getItem("fawiwe_lang") === "en") { localStorage.setItem("fawiwe_lang", "es"); if (typeof setLanguage === "function") setLanguage("es"); } } catch (e) {}
// 26) carrera rápida y desafíos: sin eventos del paddock ni mensajes del jefe
function v15OneOff() { return !!(window._v15OneOff || (s && (s.challenge || s.quickRace))); }
if (typeof triggerAIEventIfNeeded === "function") {
  const o = triggerAIEventIfNeeded;
  triggerAIEventIfNeeded = function () { if (v15OneOff()) return; return o.apply(this, arguments); };
  window.triggerAIEventIfNeeded = triggerAIEventIfNeeded;
}
if (typeof v4BossReact === "function") {
  const o = v4BossReact;
  v4BossReact = function () { if (v15OneOff()) return null; return o.apply(this, arguments); };
  window.v4BossReact = v4BossReact;
}
// 25) subida de rango: en el rango máximo no hay "próximo rango"
if (typeof window.showRankUp === "function") {
  const o = window.showRankUp;
  window.showRankUp = function (name) {
    const r = o.apply(this, arguments);
    try {
      const drv = s.playerMode === "driver";
      const list = drv ? driverRankNames : rankTiers.map(x => x[0]);
      if (list.indexOf(name) >= list.length - 1) {
        const un = document.querySelector("#rankCine .rc-un");
        if (un && /próximo rango/.test(un.textContent)) un.innerHTML = "<div>👑 Llegaste a lo más alto. No hay rango más alto que este.</div>";
      }
    } catch (e) {}
    return r;
  };
}
// 32) cambiar el modo no te borra el año elegido
if (typeof setMode === "function") {
  const o = setMode;
  setMode = function () {
    const d = document.getElementById("decade"), y = document.getElementById("startYear");
    const dv = d && d.value, yv = y && y.value;
    const r = o.apply(this, arguments);
    try {
      if (d && dv && [...d.options].some(op => op.value === dv) && d.value !== dv) { d.value = dv; try { updateYearOptions(); } catch (e) {} }
      if (y && yv && [...y.options].some(op => op.value === yv) && y.value !== yv) { y.value = yv; try { refreshTeamLists(); } catch (e) {} }
    } catch (e) {}
    return r;
  };
  window.setMode = setMode;
}
// 36) decisiones: cada opción muestra qué cambia
if (typeof newEvent === "function") {
  const o = newEvent;
  newEvent = function () {
    const r = o.apply(this, arguments);
    try {
      const btns = document.querySelectorAll("#eventsBody .choice-card");
      btns.forEach((b, i) => {
        const c = currentChoices && currentChoices[i]; if (!c || b.querySelector(".v15-fx")) return;
        const f = (v, ic) => v ? `<i class="${v > 0 ? "up" : "dn"}">${ic} ${v > 0 ? "+" : ""}${v}</i>` : "";
        const money = c[3] ? `<i class="${c[3] > 0 ? "up" : "dn"}">💰 ${c[3] > 0 ? "+" : "−"}$${Math.abs(c[3])}M</i>` : "";
        b.insertAdjacentHTML("beforeend", `<span class="v15-fx">${f(c[1], "❤️")}${f(c[2], "🤝")}${money}${f(c[4], "🏎️")}</span>`);
      });
    } catch (e) {}
    return r;
  };
  window.newEvent = newEvent;
}
// 37) en modo ingeniero, lo que dice tu piloto en la presentación tiene sentido
if (typeof fwRadioSay === "function") {
  const o = fwRadioSay;
  fwRadioSay = function (txt, who) {
    try { if (/^Presentamos el auto/.test(String(txt)) && who === "drv") txt = "Ya vi el auto " + s.season + ". ¡Vamos a sacarle todo, ingeniero!"; } catch (e) {}
    return o.call(this, txt, who, arguments[2]);
  };
  window.fwRadioSay = fwRadioSay;
}
// 38) "Toda una vida": arrancás en el box
if (typeof v4Lifetime === "function") {
  const o = v4Lifetime;
  v4Lifetime = function () {
    const r = o.apply(this, arguments);
    try { const n = document.getElementById("v4MenuNote"); if (n) n.textContent = n.textContent.replace("como jefe de equipo", "como ingeniero de un equipo (y vas subiendo hasta jefe)"); } catch (e) {}
    return r;
  };
  window.v4Lifetime = v4Lifetime;
}
// 40) menú: "Tu jefe" sirve para los dos modos
try {
  if (typeof DASH_NAV !== "undefined") DASH_NAV.forEach(g => g[1].forEach(it => { if (it[0] === "JEF") it[1] = "Tu jefe"; }));
  document.querySelectorAll('.ds-item[data-sel="#v4BossCard"] span').forEach(sp => { sp.textContent = "Tu jefe"; });
} catch (e) {}
// 41) el piloto de reserva tiene nombre propio
if (typeof engReserveInfo === "function") {
  const o = engReserveInfo;
  engReserveInfo = function () {
    const r = o.apply(this, arguments);
    try { if (r && r.name === "Piloto de reserva") r.name = generateRookieName("reserva_" + (s.team || "") + "_" + s.season); } catch (e) {}
    return r;
  };
  window.engReserveInfo = engReserveInfo;
}
if (typeof myTeamLineup === "function") {
  const o = myTeamLineup;
  myTeamLineup = function () {
    const r = o.apply(this, arguments);
    try { (r || []).forEach(seat => { if (seat && /^Piloto de reserva( \d)?$/.test(seat.name)) seat.name = generateRookieName("reserva_" + (s.team || "") + "_" + s.season + "_" + (seat.seat || 0)); }); } catch (e) {}
    return r;
  };
  window.myTeamLineup = myTeamLineup;
}
// 34) partidas largas: menos vueltas guardadas (las últimas 8 carreras alcanzan)
if (typeof window.nextGP === "function") {
  const o = window.nextGP;
  window.nextGP = function () {
    const r = o.apply(this, arguments);
    try { const e = s.eng; if (e && Array.isArray(e.lapHist) && e.lapHist.length > 8) e.lapHist = e.lapHist.slice(-8); } catch (e) {}
    return r;
  };
}

/* 8b) cada temporada nueva (hasta 2026) usa los pilotos reales de ese año:
   los cambios de equipo, retiros y debuts son los que pasaron de verdad */
function v15RealSeason() { try { return s && s.season <= 2026 && !s.rosterTemplate && !s.quickRace && !s.challenge; } catch (e) { return false; } }
if (typeof processGridRetirements === "function") {
  const o = processGridRetirements;
  processGridRetirements = function () {
    if (!v15RealSeason()) return o.apply(this, arguments);
    try {
      if (!s.driverCareerLength) s.driverCareerLength = {};
      const before = {};
      try { getTeamsForYear(s.season - 1).forEach(t => { (originalDriverLineup(t[0], s.season - 1) || []).forEach(d => { before[d[0]] = t[0]; }); }); } catch (e) {}
      Object.keys(s.rosterOverrides || {}).forEach(t => (s.rosterOverrides[t] || []).forEach(d => { if (d) before[d[0]] = t; }));
      // se borran los cambios simulados: manda la grilla real del año
      const keep = {};
      if (s.playerMode === "driver" && s.rosterOverrides && s.rosterOverrides[s.club]) keep[s.club] = s.rosterOverrides[s.club];
      s.rosterOverrides = keep;
      const after = {};
      getTeamsForYear(s.season).forEach(t => { if (t[0] === s.club) return; currentTeamLineup(t[0]).forEach(d => { if (d) after[d[0]] = t[0]; }); });
      try { (myTeamLineup() || []).forEach(d => { if (d && d.name) after[d.name] = s.club; }); } catch (e) {}
      Object.keys(after).forEach(n => { s.driverCareerLength[n] = (s.driverCareerLength[n] || 0) + 1; });
      const moves = Object.keys(after).filter(n => before[n] && before[n] !== after[n]).map(n => n + ": " + before[n] + " → " + after[n]);
      const gone = Object.keys(before).filter(n => !after[n] && n !== s.playedDriverName && !(s.drivers || []).includes(n));
      const fresh = Object.keys(after).filter(n => !before[n]);
      if (moves.length) add("🔁 Cambios de equipo para " + s.season + ": " + moves.slice(0, 10).join(", ") + (moves.length > 10 ? " y " + (moves.length - 10) + " más" : "") + ".");
      if (gone.length) add("👋 Dejan la F1: " + gone.slice(0, 8).join(", ") + (gone.length > 8 ? " y " + (gone.length - 8) + " más" : "") + ".");
      if (fresh.length) add("🆕 Llegan a la F1: " + fresh.slice(0, 8).join(", ") + (fresh.length > 8 ? " y " + (fresh.length - 8) + " más" : "") + ".");
    } catch (e) { console.warn("[FAWIWE] temporada real:", e); return o.apply(this, arguments); }
  };
  window.processGridRetirements = processGridRetirements;
}
if (typeof processGridTransfers === "function") {
  const o = processGridTransfers;
  processGridTransfers = function () { if (v15RealSeason()) return; return o.apply(this, arguments); };
  window.processGridTransfers = processGridTransfers;
}

/* 8c) el auto de cada equipo según el año elegido (antes tomaba el primer año en que aparecía) */
if (typeof findRating === "function") {
  const o = findRating;
  findRating = function (name) {
    try {
      if ((s && s.customTeam && s.customTeam.name === name) || (typeof v15Tpl === "function" && v15Tpl())) return o.apply(this, arguments);
      let y = (s && s.season) || 2026;
      const setup = document.getElementById("setup"), sy = document.getElementById("startYear");
      if (setup && !setup.classList.contains("hidden") && sy && +sy.value) y = +sy.value;
      const t = getTeamsForYear(y).find(x => x[0] === name);
      if (t) return t[1];
      const ys = Object.keys(teamsByYear).map(Number).filter(k => teamsByYear[k].some(x => x[0] === name)).sort((a, b) => Math.abs(a - y) - Math.abs(b - y));
      if (ys.length) return teamsByYear[ys[0]].find(x => x[0] === name)[1];
    } catch (e) {}
    return o.apply(this, arguments);
  };
  window.findRating = findRating;
}
// 26b) la carrera rápida y los desafíos arrancan sin eventos del paddock
["v6QuickStart", "v4ChalStart"].forEach(fn => {
  const o = window[fn]; if (typeof o !== "function") return;
  window[fn] = function () {
    window._v15OneOff = true;
    let r;
    try { r = o.apply(this, arguments); } finally { window._v15OneOff = false; }
    try {
      if (s.aiEventActive) { s.aiEventActive = false; s.aiCurrentEvent = null; document.getElementById("aiEventOverlay")?.classList.remove("show"); }
      s.aiEventSchedule = [];
    } catch (e) {}
    return r;
  };
});
