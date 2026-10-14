/* =====================================================================================
   FAWIWE · PROTOTIPO 1.5 — ajustes de la revisión por temporadas
   1) Modo piloto: un piloto real arranca con su nivel real (apenas 2 puntos menos).
   2) Abandonos según la época: en los 50/60/70/80 se rompían muchos más autos.
   3) Épocas bien marcadas: turbo 1983-88, atmosféricos 1989-97, híbridos 2014, etc.
      (y el minijuego de época acompaña: sin recarga entre 1989 y 1993, ERS desde 2014).
   4) Novatos con nombres de su época.
   5) "Cuidar las gomas": ya no se gana tocando cualquier cosa.
   ===================================================================================== */
(function () {
  const yr = () => { try { return parseInt(s.season, 10) || 2026; } catch (e) { return 2026; } };

  /* ---------- 1) nivel real del piloto elegido ---------- */
  function v18Rate() {
    try {
      if (!s || s.playerMode !== "driver" || s.playedDriverType !== "actual" || s._v18Rate) return;
      if (s.playedDriverRating !== 68 || !s.playedDriverName) return;
      const d = (getDriversForYear(s.season) || []).find(x => x[0] === s.playedDriverName);
      if (!d) return;
      const r = Math.max(68, Math.min(97, Math.round(d[1] - 2)));
      s.playedDriverRating = r; s.playedDriverBaseRating = r; s._v18Rate = true; s._ovrPrev = undefined;
    } catch (e) {}
  }
  if (typeof start === "function") {
    const o = start;
    start = function () { const r = o.apply(this, arguments); try { if (s && !s._v18Salt) s._v18Salt = Math.random().toString(36).slice(2, 8); } catch (e) {} v18Rate(); try { if (typeof render === "function") render(); } catch (e) {} return r; };
    window.start = start;
  }

  /* ---------- 2) abandonos según la época ---------- */
  function v18EraDnf(y) {
    if (y < 1960) return 0.26; if (y < 1970) return 0.21; if (y < 1980) return 0.16; if (y < 1990) return 0.18;
    if (y < 1997) return 0.12; if (y < 2005) return 0.07; if (y < 2014) return 0.02; return 0;
  }
  window.v18EraDnf = v18EraDnf;
  if (typeof rollRaceStatus === "function") {
    const o = rollRaceStatus;
    rollRaceStatus = function (name, teamRating, seedKey, isMine) {
      // cada partida tiene su propia suerte: el mismo piloto no abandona siempre en las mismas carreras
      try { if (s && s._v18Salt) seedKey = seedKey + "_" + s._v18Salt; } catch (e) {}
      const r = o.call(this, name, teamRating, seedKey, isMine);
      try {
        if (r) return r;
        let x = v18EraDnf(yr());
        if (!x) return r;
        if (isMine) x *= 0.75 * Math.max(0.5, 1 - (facilityLevel("lab") || 0) * 0.08);
        x *= Math.max(0.6, 1.25 - (teamRating || 3) * 0.1); // los autos buenos se rompen un poco menos
        const h = Math.abs(deterministicHash("era_" + seedKey)) % 1000;
        if (h < x * 1000) return "DNF";
      } catch (e) {}
      return r;
    };
    window.rollRaceStatus = rollRaceStatus;
  }

  /* ---------- 3) épocas bien marcadas ---------- */
  const ERAS = [
    [1950, "Motor adelante y ruedas finitas", "Los autos se rompían todo el tiempo: terminar la carrera ya era medio triunfo."],
    [1959, "Motor atrás: autos chiquitos y livianos", "Con el motor atrás los autos son más ágiles, pero siguen rompiéndose seguido: la confiabilidad manda."],
    [1968, "Llegan los primeros alerones", "Sin ayudas electrónicas y con los primeros alerones: la mecánica y el chasis marcan la diferencia."],
    [1977, "Efecto suelo: el auto se pega al piso", "Efecto suelo: el que domina el aire por debajo del auto, gana."],
    [1983, "Era turbo: más de 1000 caballos", "Turbos de más de 1000 caballos: el motor pesa en TODOS los circuitos."],
    [1989, "Motores atmosféricos V10 y V12", "Se prohíben los turbo: motores atmosféricos que gritan y una pelea fuerte de neumáticos."],
    [1994, "Vuelve la recarga de nafta", "Guerra de neumáticos y reabastecimiento: la goma y la estrategia de paradas deciden las carreras."],
    [1998, "Neumáticos con ranuras", "Guerra de neumáticos y reabastecimiento: la goma decide las carreras."],
    [2009, "KERS y gomas lisas otra vez", "Difusores y KERS: la aerodinámica vuelve a ser la reina."],
    [2014, "Era híbrida: motores V6 turbo", "Motores híbridos V6 turbo, pero la aerodinámica sigue siendo la reina."],
    [2017, "Autos más anchos y rápidos", "Autos más anchos y con más carga: la aerodinámica es la reina (halo desde 2018)."],
    [2022, "Vuelve el efecto suelo", "Vuelve el efecto suelo: el piso del auto es la clave de la aerodinámica."],
    [2026, "Aerodinámica activa y mitad eléctrico", "Mitad eléctrico y aerodinámica activa: la unidad de potencia es clave."]
  ];
  function v18Era(y) { let e = ERAS[0]; ERAS.forEach(x => { if (y >= x[0]) e = x; }); return e; }
  const ART = { 1950: 1952, 1959: 1962, 1968: 1970, 1977: 1979, 1983: 1986, 1989: 1992, 1994: 1996, 1998: 2001, 2009: 2010, 2014: 2015, 2017: 2018, 2022: 2023, 2026: 2026 };
  function v18Art(y) { return ART[v18Era(y)[0]] || y; }
  window.v18Art = v18Art;
  window.v18Era = v18Era;
  if (typeof fwEraIdx === "function") {
    fwEraIdx = function (year) {
      const y = parseInt(year, 10) || 2026;
      return y < 1968 ? 0 : y < 1977 ? 1 : y < 1983 ? 2 : y < 1989 ? 3 : y < 2009 ? 4 : y < 2026 ? 5 : 6;
    };
    window.fwEraIdx = fwEraIdx;
  }
  if (typeof fwEra === "function") {
    fwEra = function (year) { const y = parseInt(year, 10) || 2026, k = fwEraIdx(y), b = FW_ERAS[k]; return { y: v18Art(y), cap: v18Era(y)[1], c: b && b.c, _base: b && b.y }; };
    window.fwEra = fwEra;
  }
  if (typeof fwEraCardHtml === "function") {
    const o = fwEraCardHtml;
    fwEraCardHtml = function (year) {
      let h = o.apply(this, arguments);
      try {
        const k = fwEraIdx(year), b = FW_ERAS[k], info = FW_ERA_ENG[k], e = v18Era(parseInt(year, 10) || 2026);
        h = h.replace(engEsc(b.cap), engEsc(e[1])).replace(engEsc(info.txt), engEsc(e[2]));
        const color = arguments[1];
        h = h.replace(/<div class="era-svg">[\s\S]*?<\/div><div class="era-txt">/, '<div class="era-svg">' + fwCarSvg(v18Art(parseInt(year, 10) || 2026), color) + '</div><div class="era-txt">');
      } catch (e) {}
      return h;
    };
    window.fwEraCardHtml = fwEraCardHtml;
  }
  try {
    if (typeof FW_ERAS !== "undefined") FW_ERAS.forEach((b, k) => {
      const y0 = b.y;
      Object.defineProperty(b, "y", { configurable: true, get() { try { const y = yr(); if (fwEraIdx(y) === k && document.getElementById("game") && !document.getElementById("game").classList.contains("hidden")) return v18Art(y); } catch (e) {} return y0; } });
    });
  } catch (e) {}
  // 1959-1967: motor atrás pero todavía sin alerones
  if (typeof fwCarSvg === "function") {
    const o = fwCarSvg;
    fwCarSvg = function (era) {
      let h = o.apply(this, arguments);
      try { const y = parseInt(era, 10); if (y >= 1959 && y < 1968) h = h.replace(/<line x1="44" y1="40" x2="40" y2="8"[^>]*\/>/, "").replace(/<line x1="64" y1="40" x2="60" y2="8"[^>]*\/>/, "").replace(/<rect x="22" y="2" width="56" height="8"[^>]*\/>/, ""); } catch (e) {}
      return h;
    };
    window.fwCarSvg = fwCarSvg;
  }
  // minijuego de época: entre 1989 y 1993 no se recargaba nafta (contravolante sin ayudas),
  // y desde 2014 el empujón eléctrico es el ERS
  try {
    if (typeof FW_ERA_MINI !== "undefined") {
      const fuel = FW_ERA_MINI[4], slide = FW_ERA_MINI[1], kers = FW_ERA_MINI[5];
      const noRefuel = () => { const y = yr(); return y >= 1989 && y < 1994; };
      FW_ERA_MINI[4] = {
        get id() { return noRefuel() ? slide.id : fuel.id; },
        get title() { return noRefuel() ? slide.title : fuel.title; },
        get how() { return noRefuel() ? slide.how.replace("Ruedas finitas y cero ayudas: el auto patina solo.", "Motores atmosféricos muy potentes y poca electrónica: el auto patina solo.") : fuel.how; }
      };
      FW_ERA_MINI[5] = {
        get id() { return kers.id; },
        get title() { return yr() >= 2014 ? "ERS" : kers.title; },
        get how() { return yr() >= 2014 ? kers.how.replace(/KERS/g, "ERS") : kers.how; }
      };
    }
  } catch (e) {}

  if (typeof eraKers === "function") {
    const o = eraKers;
    eraKers = function () {
      const r = o.apply(this, arguments);
      try { if (yr() >= 2014) document.querySelectorAll("#eraStage button").forEach(b => { b.innerHTML = b.innerHTML.replace(/\bKERS\b/g, "ERS"); }); } catch (e) {}
      return r;
    };
    window.eraKers = eraKers;
  }

  // el aviso de "nueva era" también usa las épocas bien marcadas
  if (typeof v4EraName === "function") {
    v4EraName = function (y) { try { const e = v18Era(parseInt(y, 10) || 2026); return { y: e[0], cap: e[1] }; } catch (e) { return null; } };
    window.v4EraName = v4EraName;
  }
  // credencial del paddock: antes de 1980 el ingeniero no usa auriculares de radio, usa cronómetro
  try {
    const watch = c => `<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="52" y="6" width="16" height="10" rx="3" fill="#e5e7eb"/><circle cx="60" cy="58" r="34" fill="#f5f1e6" stroke="${c}" stroke-width="8"/><line x1="60" y1="58" x2="60" y2="34" stroke="#111" stroke-width="5" stroke-linecap="round"/><line x1="60" y1="58" x2="76" y2="66" stroke="#e10600" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="58" r="5" fill="#111"/></svg>`;
    new MutationObserver(recs => {
      recs.forEach(r => r.addedNodes.forEach(n => {
        if (!n || n.id !== "v16Go") return;
        const y = parseInt(document.getElementById("startYear")?.value || "2026", 10) || 2026;
        const drv = document.getElementById("playerModeSel")?.value === "driver";
        if (drv || y >= 1980) return;
        const ph = n.querySelector(".g-photo"); if (ph) ph.innerHTML = watch(getComputedStyle(n).getPropertyValue("--tc") || "#e10600");
      }));
    }).observe(document.body, { childList: true });
  } catch (e) {}

  /* ---------- 4) novatos con nombres de su época ---------- */
  const OLD_F = ["Piero", "Jean", "Hans", "Bob", "Mario", "Henri", "Tony", "Wolfgang", "Ricardo", "Peter", "Gianni", "Jacques", "Kurt", "Roberto", "Brian", "Carlos", "Helmut", "Franco", "Lucien", "Derek", "Sergio", "Ernst", "Raúl", "Colin"];
  const OLD_L = ["Bellandi", "Lambert", "Hofmann", "Whitfield", "Duchamp", "Moreau", "Ferrante", "Kessel", "Ortega", "Castelli", "Brandt", "Lacroix", "Pemberton", "Vossberg", "Marchetti", "Delacour", "Rinaldi", "Aldridge", "Stenberg", "Valdés", "Montero", "Fairbanks", "Granville", "Ruffino"];
  if (typeof generateRookieName === "function") {
    const o = generateRookieName;
    generateRookieName = function (seedStr) {
      try {
        const m = String(seedStr || "").match(/(19[5-9]\d|20[0-4]\d)/);
        const y = m ? +m[1] : yr();
        if (y < 1990) {
          const h1 = Math.abs(deterministicHash("rookie1_" + seedStr)), h2 = Math.abs(deterministicHash("rookie2_" + seedStr));
          return OLD_F[h1 % OLD_F.length] + " " + OLD_L[h2 % OLD_L.length];
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
    window.generateRookieName = generateRookieName;
  }

  /* ---------- 5) cuidar las gomas: hay que mantenerlas en la ventana ---------- */
  if (typeof trkTemp === "function") {
    trkTemp = function () {
      const st = document.getElementById("eraStage");
      st.innerHTML = `<div class="era-stat"><span>Distancia</span><span>⏱️ <b id="eT"></b></span></div>
        <div class="era-gauge"><div class="gf" id="eD" style="width:0;background:linear-gradient(90deg,#22c55e,#16a34a)"></div></div>
        <div class="era-stat" style="margin-top:10px"><span>🌡️ Temperatura del neumático <b id="eW"></b></span><span>En rojo: <b id="eR">0.0</b>s / 1.2s</span></div>
        <div class="era-gauge"><div class="gz" style="left:45%;width:30%"></div><div class="gr" style="width:25%"></div><div class="gn" id="eN"></div></div>
        <p class="small" style="text-align:center;margin:6px 0 0">Gomas frías = no agarran (vas lento). En la zona verde vas a fondo. En rojo se ampollan.</p>
        ${trkBtns([["eGas", "🦶 ACELERAR (mantener)", "era-btn hot"]])}`;
      const E = ERA, sp = eraSpeed();
      E.t = 0; E.limit = 11; E.d = 0; E.temp = 40; E.red = 0; E.hold = false;
      eraHold(document.getElementById("eGas"), () => (E.hold = true), () => (E.hold = false));
      eraLoop(dt => {
        E.t += dt;
        E.temp = Math.max(20, Math.min(100, E.temp + (E.hold ? 30 * sp : -30) * dt));
        const zone = E.temp < 45 ? "cold" : E.temp > 75 ? "hot" : "ok";
        E.d += dt * (E.hold ? 18 : 6) * (zone === "cold" ? 0.35 : zone === "hot" ? 0.6 : 1);
        if (zone === "hot") E.red += dt;
        const n = document.getElementById("eN"); if (n) n.style.left = E.temp + "%";
        const d = document.getElementById("eD"); if (d) d.style.width = Math.min(100, E.d) + "%";
        const r = document.getElementById("eR"); if (r) r.textContent = E.red.toFixed(1);
        const w = document.getElementById("eW"); if (w) w.textContent = zone === "cold" ? "· ❄️ frías" : zone === "hot" ? "· 🔥 ¡muy calientes!" : "· ✅ en ventana";
        trkTimer(E);
        if (E.red >= 1.2) return eraEnd(false, "Neumático ampollado: sobrecalentaste las gomas.");
        if (E.d >= 100) return eraEnd(true, "¡Llegaste con las gomas enteras y buen ritmo!");
        if (E.t >= E.limit) eraEnd(false, E.d < 60 ? "Gomas frías todo el tiempo: no agarraban y perdiste la tanda." : "Muy lento: no las tuviste en la ventana el tiempo suficiente.");
      });
    };
    window.trkTemp = trkTemp;
  }

  /* ---------- 6) antes de 1980: la pizarra del box habla en código corto ---------- */
  function v18BoardCode(text) {
    const m = String(text || "").toLowerCase();
    if (/sanci|penaliz/.test(m)) return "PEN";
    if (/\bbox\b|boxes|parada|entrá|entra a/.test(m)) return "IN";
    if (/lluvia|llueve|mojad/.test(m)) return "RAIN";
    if (/amarilla|accidente|despacio|levant/.test(m)) return "SLOW";
    if (/ganaste|victoria|podio|cuadros|terminaste/.test(m)) return "OK!";
    if (/largada|largás|bandera abajo|luces/.test(m)) return "GO";
    if (/empuj|ataca|apretá|a fondo|pasalo|push/.test(m)) return "PUSH";
    if (/cuidá|cuidado|cuidar|tranqui|gomas|ahorr|aflojá|calma|easy/.test(m)) return "EASY";
    if (/rápido|vamos|podés/.test(m)) return "PUSH";
    return "OK";
  }
  function v18BoardLine(text) {
    const parts = [];
    try {
      if (typeof DL !== "undefined" && DL && DL.me && DL.data) {
        const l = Math.max(0, Math.min(DL.lap || 0, (DL.me.pos || []).length - 1));
        const p = DL.me.pos[l];
        if (p) parts.push("P" + p);
        if (p > 1 && l > 0) {
          const ahead = DL.data.rows.find(r => r.pos[l] === p - 1);
          if (ahead && ahead.cum && DL.me.cum && ahead.cum[l - 1] != null && DL.me.cum[l - 1] != null) parts.push("−" + Math.max(0, DL.me.cum[l - 1] - ahead.cum[l - 1]).toFixed(1));
        }
        if (DL.N) parts.push("L" + Math.max(0, DL.N - (DL.lap || 0)));
      }
    } catch (e) {}
    parts.push(v18BoardCode(text));
    return parts;
  }
  window.v18BoardLine = v18BoardLine;
  if (typeof fwRadioToast === "function") {
    const o = fwRadioToast;
    fwRadioToast = function (text, who) {
      const r = o.apply(this, arguments);
      try {
        const el = document.getElementById("fwRadioToast"); if (!el) return r;
        const g = document.getElementById("game");
        const old = yr() < 1980 && g && !g.classList.contains("hidden") && (!who || who === "eng" || who === "p2");
        el.classList.toggle("v18-pb", old);
        if (old) {
          const tag = el.querySelector(".fr-tag span");
          if (tag && typeof window.v17Rules === "function") tag.textContent = window.v17Rules(tag.textContent);
          const parts = v18BoardLine(text);
          const txt = el.querySelector(".fr-txt");
          if (txt) txt.innerHTML = `<div class="v18-board">${parts.map((x, i) => i === parts.length - 1 ? `<b>${x}</b>` : `<span>${x}</span>`).join("")}</div><div class="v18-board-k"></div>`;
          const k = el.querySelector(".v18-board-k"); if (k) k.textContent = String(text).replace(/<[^>]+>/g, "");
        }
      } catch (e) {}
      return r;
    };
    window.fwRadioToast = fwRadioToast;
  }

  /* ---------- 7) sprints: siempre puntos del 8 al 1 (antes el modo ingeniero daba 25-18-15…) ---------- */
  const SPR = [8, 7, 6, 5, 4, 3, 2, 1];
  if (typeof simulateGrid === "function") {
    const o = simulateGrid;
    const w = function (kind) {
      const r = o.apply(this, arguments);
      try {
        if (kind === "race" && Array.isArray(r) && (s._engSimSprint || s._dlSprint)) {
          r.forEach(x => { if (x.status || !x.pos) { x.pts = 0; return; } x.pts = x.pos <= 8 ? SPR[x.pos - 1] : 0; });
        }
      } catch (e) {}
      return r;
    };
    simulateGrid = w; window.simulateGrid = w;
  }
  // modo piloto sin transmisión (o salteando el finde): la sprint también se corre y suma
  if (typeof finishRace === "function") {
    const o = finishRace;
    const w = function () {
      try {
        if (s && s.playerMode === "driver" && s.session >= 3 && !s.raceDone && typeof dlSprintWeekend === "function" && dlSprintWeekend() && typeof dlState === "function") {
          const st = dlState();
          const live = typeof dlOn === "function" && dlOn() && !s._dlSkip && s.drvLive !== false;
          if (!st.sprintDone && !live) {
            st.sprintDone = true;
            let grid; s._dlSprint = true;
            try { grid = simulateGrid("race"); } finally { s._dlSprint = false; }
            if (!s.driverPoints) initDriverStandings();
            if (!s.teamStandings) initTeamStandings();
            let myPts = 0;
            grid.forEach(x => { const b = x.name.replace(" (reserva)", ""); s.driverPoints[b] = (s.driverPoints[b] || 0) + (x.pts || 0); if (x.mine) myPts += x.pts || 0; else s.teamStandings[x.team] = (s.teamStandings[x.team] || 0) + (x.pts || 0); });
            s.points += myPts;
            const me = grid.find(x => x.mine && x.seat === 1);
            st.sprintRes = me ? (me.status || "P" + me.pos) : "—";
            add("⚡ SPRINT en " + ((trackData[s.gp] || {}).name || "") + ": gana " + (grid[0] ? grid[0].name : "—") + ". Vos: " + st.sprintRes + (me && me.pts ? " (+" + me.pts + " pts)" : "") + ".");
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
    finishRace = w; window.finishRace = w;
  }

  /* ---------- 8) modo piloto: un solo número (OVR) — el que se ve es el que corre ---------- */
  function v18Ovr() {
    try {
      const nm = s.playedDriverName;
      const R = typeof effectiveRating === "function" ? effectiveRating(nm, s.playedDriverRating || 75) : (s.playedDriverRating || 75);
      const form = typeof ovrForm === "function" ? ovrForm() : 62;
      const mind = ((+s.focus || 55) + (+s.health || 92)) / 2;
      const fA = Math.max(-3, Math.min(3, (form - 62) / 38 * 3));
      const mA = Math.max(-2, Math.min(1, (mind - 70) / 30 * 1.5));
      return Math.max(40, Math.min(99, Math.round(R + fA + mA)));
    } catch (e) { return s.playedDriverRating || 75; }
  }
  window.v18Ovr = v18Ovr;
  const isDrv = () => { try { return s && s.playerMode === "driver" && !!s.playedDriverName; } catch (e) { return false; } };
  if (typeof window.computeOVR === "function") {
    const o = window.computeOVR;
    window.computeOVR = function () { if (isDrv()) return v18Ovr(); return o.apply(this, arguments); };
  }
  if (typeof myTeamLineup === "function") {
    const o = myTeamLineup;
    myTeamLineup = function () {
      const r = o.apply(this, arguments);
      try { if (isDrv() && !s._simulatingBackground && Array.isArray(r) && r[0] && r[0].name === s.playedDriverName) r[0].rating = v18Ovr(); } catch (e) {}
      return r;
    };
    window.myTeamLineup = myTeamLineup;
  }
  function v18FixRatingText() {
    try {
      if (!isDrv()) return;
      const nm = s.playedDriverName, ovr = v18Ovr();
      document.querySelectorAll("#originalDriversBody .driver-original").forEach(c => {
        const b = c.querySelector("b"); if (!b || !b.textContent.includes(nm)) return;
        c.querySelectorAll("span.small").forEach(sp => { if (/^Rating \d+/.test(sp.textContent)) sp.innerHTML = sp.innerHTML.replace(/^Rating \d+/, "OVR " + ovr); });
      });
      const tb = document.getElementById("telemetryBody");
      if (tb) tb.querySelectorAll("p, span, b, div").forEach(el => {
        if (el.children.length > 3) return;
        el.childNodes.forEach(n => { if (n.nodeType === 3 && n.nodeValue.includes(nm)) n.nodeValue = n.nodeValue.replace(new RegExp(nm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " \\((?:rating|Rating) \\d+\\)"), nm + " (OVR " + ovr + ")"); });
      });
    } catch (e) {}
  }
  ["renderOriginalDrivers", "render"].forEach(fn => {
    const o = window[fn]; if (typeof o !== "function") return;
    const w = function () { try { if (s && s._v18OvrV !== 1 && typeof window.computeOVR === "function") { s._v18OvrV = 1; s._ovrPrev = window.computeOVR(); } } catch (e) {} const r = o.apply(this, arguments); v18FixRatingText(); return r; };
    window[fn] = w;
    try { if (fn === "render") render = w; else renderOriginalDrivers = w; } catch (e) {}
  });

  /* ---------- 9) contratos de hasta 4 temporadas (4 o 3+1) ---------- */
  try {
    if (typeof NG_YEARS !== "undefined" && Array.isArray(NG_YEARS) && !NG_YEARS.some(y => y[0] === "4")) {
      const i3 = NG_YEARS.findIndex(y => y[0] === "3");
      NG_YEARS.splice(i3 + 1, 0, ["4", "4 temporadas", 4, ""]);
      NG_YEARS.push(["3+1", "3+1 (con opción)", 3, "opt"]);
    }
    if (typeof ngYearsHtml === "function") {
      const o = ngYearsHtml;
      ngYearsHtml = function () { return String(o.apply(this, arguments)).replace("Con 1+1 o 2+1,", "Con 1+1, 2+1 o 3+1,"); };
      window.ngYearsHtml = ngYearsHtml;
    }
  } catch (e) {}

  /* ---------- 10) si chocaste en el minijuego de la carrera, en la transmisión abandonás enseguida ---------- */
  const crashNow = () => { try { const k = s._crashDNF; return !!(k && k.key === s.season + "_" + s.gp); } catch (e) { return false; } };
  if (typeof engBuildLaps === "function") {
    const o = engBuildLaps;
    const w = function (entries, opt) {
      try {
        if (crashNow() && opt && opt.dnfLaps && typeof DL !== "undefined" && DL && DL.mode === "race") {
          const me = (entries || []).find(x => x.mine && x.seat === 1);
          if (me && me.status === "DNF") {
            const lap = 1 + (Math.abs(deterministicHash("crashlap" + s.season + s.gp)) % 2);
            opt.dnfLaps[me.name] = lap; if (DL.dnfLaps) DL.dnfLaps[me.name] = lap;
            me.dnfReason = "💥 Te fuiste contra el muro: no frenaste y el auto quedó destruido.";
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
    engBuildLaps = w; window.engBuildLaps = w;
  }
  if (typeof engStartLive === "function") {
    const o = engStartLive;
    const w = function () {
      const r = o.apply(this, arguments);
      try {
        const L = engLive;
        if (L && crashNow()) {
          const tgt = ((typeof myTeamLineup === "function" && myTeamLineup()[0]) || {}).name;
          const x = (L.target || []).find(e => e.name === tgt);
          if (x && x.status === "DNF") { L.dnfTick[x.name] = 1; x.dnfReason = "💥 Se fue contra el muro: no frenó y el auto quedó destruido."; }
        }
      } catch (e) {}
      return r;
    };
    engStartLive = w; window.engStartLive = w;
  }
  // texto final de la transmisión: "Terminaste DNF" → "Abandonaste"
  if (typeof dlFeed === "function") {
    const o = dlFeed;
    const w = function (lap, txt) {
      if (typeof txt === "string" && /^🏆 Terminaste (DNF|DNS)/.test(txt)) arguments[1] = txt.startsWith("🏆 Terminaste DNF") ? "💥 Abandonaste: no sumás puntos en esta carrera." : "🚫 No largaste (DNS): no sumás puntos en esta carrera.";
      return o.apply(this, arguments);
    };
    dlFeed = w; window.dlFeed = w;
  }

  /* ---------- 11) mánager: como en la F1 real, cobra comisión de tu sueldo (no hay que pagar por adelantado) ---------- */
  const MGR_PCT = 0.1, MGR_MIN = 0.03;
  if (typeof v4MgrHire === "function") {
    const w = function () {
      if (v4Mgr()) return;
      s.manager = { on: true, comm: true, name: v4Pick(V4_MGR, "mgr" + s.playedDriverName), since: s.season, paid: s.season, sponsorSeason: null };
      add("🤵 Contrataste a " + s.manager.name + " como mánager: se queda con el 10% de tu sueldo de cada GP (mínimo $30K). Negocia tus contratos y te busca sponsors.");
      render();
    };
    v4MgrHire = w; window.v4MgrHire = w;
  }
  if (typeof v4MgrCardHtml === "function") {
    const o = v4MgrCardHtml;
    const w = function () {
      return String(o.apply(this, arguments)).replace("Cuesta $0,5M por temporada.", "No se paga por adelantado: se queda con el <b>10% de tu sueldo de cada GP</b> (mínimo $30K), como los mánagers de verdad.")
        .replace("<p class=\"small\">✍️ Tus próximos contratos salen un 6% mejores.</p>", "<p class=\"small\">✍️ Tus próximos contratos salen un 6% mejores. 💸 Cobra el 10% de tu sueldo de cada GP.</p>");
    };
    v4MgrCardHtml = w; window.v4MgrCardHtml = w;
  }
  if (typeof nextGP === "function") {
    const o = nextGP;
    const w = function () {
      const M = typeof v4Mgr === "function" ? v4Mgr() : null;
      const before = s.season + "_" + s.gp;
      if (M) { M.comm = true; M.paid = s.season + 1; } // ya no se cobra el pago fijo por temporada
      const r = o.apply(this, arguments);
      try {
        const M2 = typeof v4Mgr === "function" ? v4Mgr() : null;
        if (M2 && M2.comm && s.season + "_" + s.gp !== before && !s.gameOver) {
          const sal = typeof salaryForGP === "function" ? salaryForGP() : 0;
          const fee = Math.max(MGR_MIN, Math.round(sal * MGR_PCT * 100) / 100);
          s.money = Math.round(((s.money || 0) - fee) * 100) / 100;
          add("🤵 " + M2.name + " se quedó con su comisión: −" + formatMoney(fee) + ".");
          if (typeof render === "function") render();
        }
      } catch (e) {}
      return r;
    };
    nextGP = w; window.nextGP = w;
  }
})();
