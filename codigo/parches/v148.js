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
          const P = s.season === 2021 ? [3, 2, 1] : SPR; // 2021: la "clasificación sprint" daba solo 3-2-1
          r.forEach(x => { if (x.status || !x.pos) { x.pts = 0; return; } x.pts = x.pos <= P.length ? P[x.pos - 1] : 0; });
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
  if (typeof engLiveRetarget === "function") {
    const o = engLiveRetarget;
    const w = function () {
      const r = o.apply(this, arguments);
      try {
        const L = engLive;
        if (L && L.target && crashNow()) {
          const tgt = ((typeof myTeamLineup === "function" && myTeamLineup()[0]) || {}).name;
          const x = L.target.find(e => e.name === tgt);
          if (x && x.status === "DNF") {
            if (!L._v18crash) { L._v18crash = true; L.dnfTick[x.name] = Math.max(1, L.tick + 1); }
            x.dnfReason = "💥 Se fue contra el muro: no frenó y el auto quedó destruido.";
          }
        }
      } catch (e) {}
      return r;
    };
    engLiveRetarget = w; window.engLiveRetarget = w;
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

  /* ---------- 12) tu casa: más actividades en cada ambiente (algunas según la época) ---------- */
  if (typeof HOME_ROOMS !== "undefined" && typeof HOME_SCENES !== "undefined" && !HOME_ROOMS._v18) {
    HOME_ROOMS._v18 = true;
    const A = (id, icon, name, cine, fx, txt, from) => ({ id, icon, name, cine, fx, txt, from });
    const MORE = {
      cuarto: [
        A("ordenar", "🧹", "Ordenar el cuarto", "tidy", { calma: 3, animo: 1 }, "Cuarto ordenado, cabeza ordenada."),
        A("estirar", "🤸", "Estirar antes de dormir", "stretch", { salud: 3, calma: 1 }, "Diez minutos de estiramiento y la espalda te lo agradece."),
        A("musicacama", "🎧", "Escuchar música tirado en la cama", "chill", { calma: 3, animo: 2 }, "Tus discos favoritos, uno atrás del otro.")],
      cocina: [
        A("desayuno", "🥞", "Desayuno completo", "breakfast", { salud: 3, animo: 2 }, "Frutas, tostadas y algo caliente: arrancás el día con todo."),
        A("postre", "🍰", "Hacer un postre", "dessert", { animo: 4, salud: -1 }, "Te salió una torta que ni en la pastelería."),
        A("mate", "🧉", "Mate con amigos", "mate", { animo: 3, carisma: 3 }, "Una ronda de mate y charla con amigos.")],
      living: [
        A("mesa", "🎲", "Juego de mesa en familia", "boardgame", { animo: 3, calma: 2, carisma: 1 }, "Hubo trampas, risas y revancha pendiente."),
        A("rompe", "🧩", "Armar un rompecabezas", "puzzle", { calma: 4 }, "Mil piezas, una por una. Paciencia de campeón."),
        A("futbol", "⚽", "Ver un partido de fútbol", "football", { animo: 4, carisma: 1 }, "Gritaste el gol como si fuera tuyo.")],
      bano: [
        A("ducha", "🚿", "Ducha fría", "shower", { salud: 2, animo: 2 }, "Agua fría de golpe: te despertaste del todo."),
        A("cantar", "🎶", "Cantar en la ducha", "singshower", { animo: 4, carisma: 1 }, "El mejor concierto de tu vida, con el champú de micrófono."),
        A("espejo", "🪞", "Lavarte la cara frente al espejo", "mirror", { calma: 3, carisma: 1 }, "Te mirás al espejo y te decís: «este fin de semana es tuyo»."),
        A("pelo", "💇", "Cortarte el pelo", "haircut", { carisma: 4 }, "Corte nuevo para las fotos del fin de semana.")],
      balcon: [
        A("estrellas", "🔭", "Mirar las estrellas", "stars", { calma: 4, animo: 1 }, "Encontraste la Cruz del Sur y te quedaste un rato largo."),
        A("cafe", "☕", "Café mirando la ciudad", "coffee", { calma: 3, animo: 2 }, "Un café tranquilo mientras la ciudad se despierta."),
        A("dibujar", "🎨", "Dibujar el paisaje", "draw", { calma: 4, carisma: 1 }, "No sos Picasso, pero te quedó lindo.")],
      musica: [
        A("bateria", "🥁", "Tocar la batería", "drums", { animo: 5, calma: -1 }, "Los vecinos no opinan lo mismo, pero vos te sacaste la bronca de encima."),
        A("componer", "🎹", "Componer una canción", "compose", { calma: 2, carisma: 3, animo: 1 }, "Escribiste una canción sobre la última carrera."),
        A("grabar", "📹", "Grabar un video para tus fans", "record", { carisma: 5 }, "Tus fans enloquecieron con el video.", 2006)],
      pile: [
        A("nadar", "🏊", "Nadar unos largos", "swim", { salud: 4, calma: 2 }, "Treinta largos sin apuro."),
        A("perro", "🐕", "Jugar con tu perro", "dog", { animo: 5, calma: 2 }, "Tu perro no sabe nada de F1 y te quiere igual."),
        A("cena", "🍽️", "Cena bajo las estrellas", "dinner", { carisma: 3, animo: 3 }, "Una cena larga en el jardín con la gente que querés.")],
      cine: [
        A("clasico", "🎞️", "Ver un clásico del cine", "classic", { calma: 4, animo: 2 }, "Una película vieja que nunca falla."),
        A("terror", "👻", "Noche de terror con amigos", "horror", { animo: 4, carisma: 2 }, "Gritaron todos. Vos más que nadie.")],
      spa: [
        A("jacuzzi", "🫧", "Jacuzzi", "jacuzzi", { calma: 4, salud: 2 }, "Burbujas calentitas y cero apuro."),
        A("crio", "🧊", "Crioterapia", "cryo", { salud: 5, calma: -1 }, "Tres minutos a −110 °C: los músculos como nuevos.", 2008)],
      terraza: [
        A("velero", "⛵", "Paseo en yate", "boat", { animo: 5, calma: 2, carisma: 1 }, "Una vuelta por la costa con amigos."),
        A("fuegos", "🎆", "Ver los fuegos artificiales", "fireworks", { animo: 4, carisma: 1 }, "Fuegos sobre el puerto, desde el mejor lugar.")]
    };
    const SC = {
      tidy: { cls: "room", big: "🧹", floats: ["👕", "📦", "✨", "🧦"], title: "A ordenar", sub: "Cada cosa en su lugar", dur: 2800 },
      stretch: { cls: "night", big: "🤸", floats: ["✨", "🌙", "✨"], title: "Estirando", sub: "Respirá y aflojá", dur: 3000 },
      chill: { cls: "dusk", big: "🎧", floats: ["🎵", "🎶", "🎵"], title: "Música tranqui", sub: "Tu lista favorita", dur: 3000 },
      breakfast: { cls: "kitchen", big: "🥞", floats: ["🍓", "☕", "🍌", "🥛"], title: "Buen día", sub: "Desayuno de campeón", dur: 2800 },
      dessert: { cls: "kitchen", big: "🍰", floats: ["🍫", "🍓", "🥚", "✨"], title: "Al horno", sub: "40 minutos a fuego medio", dur: 3000 },
      mate: { cls: "kitchen", big: "🧉", floats: ["♨️", "😂", "🧉", "💬"], title: "Mate y charla", sub: "¿Quién ceba?", dur: 3000 },
      boardgame: { cls: "room", big: "🎲", floats: ["♟️", "🃏", "😂", "🏆"], title: "Noche de juegos", sub: "En familia", dur: 3000 },
      puzzle: { cls: "dusk", big: "🧩", floats: ["🧩", "🧩", "✨"], title: "Pieza por pieza", sub: "Mil piezas", dur: 3200 },
      football: { cls: "cinema", big: "📺", floats: ["⚽", "🥅", "🎉", "⚽"], title: "¡GOOOL!", sub: "Partido por la tele", dur: 3000 },
      shower: { cls: "bath", big: "🚿", floats: ["💧", "🥶", "💧", "💧"], title: "¡Fría!", sub: "Despertador natural", dur: 2600 },
      singshower: { cls: "bath", big: "🚿", floats: ["🎶", "🫧", "🎵", "🫧"], title: "Concierto en la ducha", sub: "Champú de micrófono", dur: 3000 },
      mirror: { cls: "bath", big: "🪞", floats: ["💧", "😌", "✨"], title: "Frente al espejo", sub: "Cara lavada y cabeza fría", dur: 2800 },
      haircut: { cls: "bath", big: "💇", floats: ["✂️", "✨", "💈"], title: "Corte nuevo", sub: "Listo para las fotos", dur: 2800 },
      stars: { cls: "night", big: "🔭", floats: ["⭐", "✨", "🌠", "⭐"], title: "Mirando el cielo", sub: "Noche despejada", dur: 3400 },
      coffee: { cls: "sunset", big: "☕", floats: ["♨️", "🏙️", "🕊️"], title: "Café en el balcón", sub: "La ciudad se despierta", dur: 2800 },
      draw: { cls: "sunset", big: "🎨", floats: ["🖌️", "🌇", "✏️"], title: "Dibujando", sub: "El atardecer desde el balcón", dur: 3000 },
      drums: { cls: "studio", big: "🥁", floats: ["💥", "🎵", "💥", "🎶"], title: "¡Batería!", sub: "Perdón, vecinos", dur: 3000 },
      compose: { cls: "studio", big: "🎹", floats: ["🎼", "✍️", "🎵"], title: "Componiendo", sub: "Una canción nueva", dur: 3200 },
      record: { cls: "studio", big: "📹", floats: ["❤️", "👍", "💬", "❤️"], title: "Grabando", sub: "Para tus fans", dur: 3000 },
      swim: { cls: "garden", big: "🏊", floats: ["💦", "💦", "☀️"], title: "Al agua", sub: "Treinta largos", dur: 3000 },
      dog: { cls: "garden", big: "🐕", floats: ["🎾", "🦴", "❤️", "🎾"], title: "¡Buscá la pelota!", sub: "Tu mejor amigo", dur: 3000 },
      classic: { cls: "cinema", big: "🎞️", floats: ["🍿", "⭐", "🎬"], title: "Un clásico", sub: "Blanco y negro", dur: 3000 },
      horror: { cls: "cinema", big: "👻", floats: ["😱", "🕷️", "🍿", "😱"], title: "Noche de terror", sub: "Con las luces apagadas", dur: 3000 },
      jacuzzi: { cls: "bath", big: "🫧", floats: ["🫧", "♨️", "🫧", "😌"], title: "Jacuzzi", sub: "Burbujas", dur: 3000 },
      cryo: { cls: "bath", big: "🧊", floats: ["❄️", "🥶", "❄️"], title: "Crioterapia", sub: "−110 °C · 3 minutos", dur: 2800 },
      boat: { cls: "garden", big: "⛵", floats: ["🌊", "☀️", "🐬", "🌊"], title: "A navegar", sub: "Por la costa", dur: 3200 },
      fireworks: { cls: "night", big: "🎆", floats: ["🎇", "✨", "🎆", "✨"], title: "¡Fuegos artificiales!", sub: "Sobre el puerto", dur: 3200 },
      dinner: { cls: "night", big: "🍽️", floats: ["🕯️", "🍷", "⭐", "😊"], title: "Cena en el jardín", sub: "Con la gente que querés", dur: 3200 }
    };
    Object.assign(HOME_SCENES, SC);
    // los videojuegos online no existían antes de fines de los 90: en esa época se juega a las cartas
    const era = a => !a.from || (s.season || 2026) >= a.from;
    HOME_ROOMS.forEach(r => {
      (MORE[r.id] || []).forEach(a => { if (!r.acts.find(x => x.id === a.id)) r.acts.push(a); });
      const vg = r.acts.find(x => x.id === "juegos"); if (vg) vg.from = 1999;
      if (r.id === "living" && !r.acts.find(x => x.id === "cartas")) r.acts.push(A("cartas", "🃏", "Jugar a las cartas con amigos", "boardgame", { animo: 4, carisma: 2 }, "Truco con amigos: cantaste falta envido y ganaste.", null));
      const cartas = r.acts.find(x => x.id === "cartas"); if (cartas) cartas.until = 1998;
      const all = r.acts;
      Object.defineProperty(r, "acts", { configurable: true, get() { return all.filter(a => era(a) && !(a.until && (s.season || 2026) > a.until)); } });
    });
  }

  /* ---------- 13) clasificación: tu vuelta manda (una vuelta trágica ya no te da la pole) ---------- */
  // antes: la decisión de cuándo salir pesaba 55% y la vuelta 45% → con buen auto, una vuelta mala igual era pole.
  // ahora: la vuelta pesa 80% y, si fue muy mala (más de ~0,6s de la pole), perdés lugares de verdad.
  const lapKey = () => s.season + "_" + s.gp;
  if (typeof finalizeQuali === "function") {
    const o = finalizeQuali;
    const w = function (timing, risky, acc) {
      if (s.playerMode !== "driver" || s.player2 || typeof acc !== "number" || typeof timingScore !== "function") return o.apply(this, arguments);
      const k = s._crashQuali; const a = (k && k.key === lapKey()) ? 0 : Math.max(0, Math.min(1, acc));
      s._v18Lap = { key: lapKey(), acc: a };
      const ts = timingScore;
      timingScore = function () { const T = ts.apply(this, arguments); return (0.2 * T + 0.35 * a * 100) / 0.55; };
      try { return o.apply(this, arguments); } finally { timingScore = ts; }
    };
    finalizeQuali = w; window.finalizeQuali = w;
  }
  if (typeof simulateGrid === "function") {
    const o = simulateGrid;
    const w = function (kind) {
      const r = o.apply(this, arguments);
      try {
        const L = s._v18Lap;
        if (kind === "quali" && Array.isArray(r) && L && L.key === lapKey() && s.playerMode === "driver" && !s.player2 && L.acc < 0.5) {
          const me = r.find(x => x.mine && x.seat === 1);
          if (me && !me.noTime && !me._v18q) {
            me._v18q = true; me.score -= (0.5 - L.acc) * 30;
            const q = [...r.filter(x => !x.noTime).sort((a, b) => b.score - a.score), ...r.filter(x => x.noTime)];
            q.forEach((x, i) => { x.pos = i + 1; });
            return q;
          }
        }
      } catch (e) {}
      return r;
    };
    simulateGrid = w; window.simulateGrid = w;
  }
  if (typeof nextGP === "function") { const o = nextGP; const w = function () { s._v18Lap = null; return o.apply(this, arguments); }; nextGP = w; window.nextGP = w; }

  /* ---------- 14) modo leyenda: arreglos ---------- */
  // a) la escudería leyenda siempre tiene 2 pilotos distintos (antes, Jordan en 1985 quedaba con Gachot dos veces)
  if (typeof getDriversForYear === "function") {
    const o = getDriversForYear;
    const w = function (year) {
      let D = o.apply(this, arguments);
      try {
        if (typeof s === "undefined" || !s || s.season !== year || (typeof v15Tpl === "function" && v15Tpl())) return D;
        const clubs = [s.team].concat(s.player2 && s.player2.club ? [s.player2.club] : []).filter(Boolean);
        clubs.forEach(team => {
          const have = D.filter(d => d[3] === team).length;
          if (have >= 2 || !(getTeamsForYear(year) || []).some(t => t[0] === team)) return;
          const used = new Set(D.map(d => d[0]));
          const add = [];
          const yrs = Object.keys(driversByYear).map(Number).filter(y => (driversByYear[y] || []).some(d => d[3] === team)).sort((a, b) => Math.abs(a - year) - Math.abs(b - year) || b - a);
          for (const y of yrs) {
            for (const d of driversByYear[y].filter(d => d[3] === team)) { if (have + add.length >= 2) break; if (!used.has(d[0])) { add.push([d[0], d[1], d[2], team]); used.add(d[0]); } }
            if (have + add.length >= 2) break;
          }
          let k = 0;
          while (have + add.length < 2 && k < 30) { const nm = generateRookieName("leg_" + team + "_" + year + "_" + k++); if (!used.has(nm)) { add.push([nm, 74, 4, team]); used.add(nm); } }
          if (add.length) D = D.concat(add);
        });
      } catch (e) {}
      return D;
    };
    getDriversForYear = w; window.getDriversForYear = w;
  }
  // b) en la lista de escuderías leyenda se ve el nivel REAL del auto para el año que elegiste
  window.v18LegendRating = function (team, year) {
    try {
      const yrs = Object.keys(teamsByYear).map(Number).filter(y => (teamsByYear[y] || []).some(t => t[0] === team)).sort((a, b) => Math.abs(a - year) - Math.abs(b - year) || b - a);
      if (yrs.length) { const r = teamsByYear[yrs[0]].find(t => t[0] === team); return { r: r[1], y: yrs[0] }; }
    } catch (e) {}
    const L = (typeof legendTeams !== "undefined" ? legendTeams : []).find(t => t[0] === team);
    return { r: L ? L[1] : 2.5, y: null };
  };
  if (typeof refreshTeamLists === "function") {
    const o = refreshTeamLists;
    const w = function () {
      const r = o.apply(this, arguments);
      try {
        if (typeof selectedMode !== "undefined" && selectedMode === "legend") {
          const year = parseInt(document.getElementById("startYear")?.value || "2026");
          ["club", "club2"].forEach(id => {
            const sel = document.getElementById(id); if (!sel) return;
            [...sel.options].forEach(op => {
              const L = v18LegendRating(op.value, year);
              const real = (getTeamsForYear(year) || []).some(t => t[0] === op.value);
              op.textContent = op.value + " — ⭐ " + L.r.toFixed(1) + "/5" + (real ? " · corre en " + year : L.y ? " · auto de " + L.y : "");
            });
          });
          const info = document.getElementById("modeInfo");
          if (info) info.textContent = "Modo Leyenda: elegí una escudería histórica. Si ese año no corría, vuelve con el auto y los pilotos de su temporada más cercana y compite contra la parrilla real de " + year + " como un equipo más. Las estrellas muestran cómo arranca el auto: tu trabajo es devolverla a la cima.";
        }
      } catch (e) {}
      return r;
    };
    refreshTeamLists = w; window.refreshTeamLists = w;
  }
  // c) modo piloto + leyenda: elegir un piloto ya no te cambia la escudería que elegiste
  if (typeof autoSelectDriverTeam === "function") {
    const o = autoSelectDriverTeam;
    const w = function () {
      const legend = typeof selectedMode !== "undefined" && selectedMode === "legend";
      const club = document.getElementById("club"), keep = club ? club.value : null;
      const r = o.apply(this, arguments);
      if (legend && club && keep) club.value = keep;
      return r;
    };
    autoSelectDriverTeam = w; window.autoSelectDriverTeam = w;
  }

  /* ---------- 15) números reales de los pilotos según la época ---------- */
  // 2014 en adelante: número permanente de cada piloto (el campeón puede usar el 1).
  // 1996-2013: cada equipo tenía un par según el campeonato anterior (el campeón llevaba el 1; el 13 no se usaba).
  // 1974-1995: cada equipo tenía su par casi fijo (Tyrrell 3/4, Ferrari 27/28, Williams 5/6…).
  // Antes de 1974: el organizador asignaba el número en cada carrera, así que no había uno fijo.
  const PERM = [["Hamilton", 44], ["Nico Rosberg", 6], ["Vettel", 5], ["Räikkönen", 7], ["Alonso", 14], ["Button", 22], ["Massa", 19], ["Bottas", 77], ["Ricciardo", 3], ["Kvyat", 26],
    ["Max Verstappen", 33], ["Pérez", 11], ["Perez", 11], ["Hülkenberg", 27], ["Hulkenberg", 27], ["Grosjean", 8], ["Maldonado", 13], ["Kevin Magnussen", 20], ["Ocon", 31], ["Sainz", 55],
    ["Stroll", 18], ["Vandoorne", 2], ["Gasly", 10], ["Leclerc", 16], ["Norris", 4], ["Russell", 63], ["Albon", 23], ["Latifi", 6], ["Giovinazzi", 99], ["Tsunoda", 22],
    ["Mick Schumacher", 47], ["Mazepin", 9], ["Guanyu", 24], ["Zhou", 24], ["Piastri", 81], ["Sargeant", 2], ["de Vries", 21], ["Lawson", 30], ["Bearman", 87], ["Colapinto", 43],
    ["Doohan", 7], ["Antonelli", 12], ["Bortoleto", 5], ["Hadjar", 6], ["Chilton", 4], ["Bianchi", 17], ["Sutil", 99], ["Kobayashi", 10], ["Ericsson", 9], ["Gutiérrez", 21],
    ["Vergne", 25], ["Nasr", 12], ["Merhi", 98], ["Stevens", 28], ["Haryanto", 88], ["Wehrlein", 94], ["Jolyon Palmer", 30], ["Kubica", 88], ["Hartley", 28], ["Sirotkin", 35]];
  const permOf = (name, y) => {
    if (y === 2014 && /Vettel/.test(name)) return 1;
    if (y >= 2022 && y <= 2025 && /Max Verstappen/.test(name)) return 1;
    if (y >= 2026 && /Norris/.test(name)) return 1;
    if (y >= 2026 && /Max Verstappen/.test(name)) return 3;
    const hit = PERM.find(([k]) => name.includes(k));
    return hit ? hit[1] : null;
  };
  const T96 = {
    1996: { "Scuderia Ferrari": [1, 2], "Benetton": [3, 4], "Williams": [5, 6], "McLaren": [7, 8], "Ligier": [9, 10], "Jordan Grand Prix": [11, 12], "Sauber Clásico": [14, 15], "Footwork": [16, 17], "Tyrrell": [18, 19], "Minardi": [20, 21], "Forti": [22, 23] },
    1997: { "Arrows": [1, 2], "Williams": [3, 4], "Scuderia Ferrari": [5, 6], "Benetton": [7, 8], "McLaren": [9, 10], "Jordan Grand Prix": [11, 12], "Prost Grand Prix": [14, 15], "Sauber Clásico": [16, 17], "Tyrrell": [18, 19], "Minardi": [20, 21], "Stewart Grand Prix": [22, 23] },
    1998: { "Williams": [1, 2], "Scuderia Ferrari": [3, 4], "Benetton": [5, 6], "McLaren": [7, 8, "Coulthard"], "Jordan Grand Prix": [9, 10], "Prost Grand Prix": [11, 12], "Sauber Clásico": [14, 15], "Arrows": [16, 17], "Stewart Grand Prix": [18, 19], "Tyrrell": [20, 21], "Minardi": [22, 23] },
    1999: { "McLaren": [1, 2], "Scuderia Ferrari": [3, 4], "Williams": [5, 6], "Jordan Grand Prix": [7, 8], "Benetton": [9, 10], "Sauber Clásico": [11, 12], "Arrows": [14, 15], "Stewart Grand Prix": [16, 17], "Prost Grand Prix": [18, 19], "Minardi": [20, 21], "BAR Honda": [22, 23] },
    2000: { "McLaren": [1, 2], "Scuderia Ferrari": [3, 4], "Jordan": [5, 6], "Jaguar Racing": [7, 8], "Williams": [9, 10], "Benetton": [11, 12], "Prost": [14, 15], "Sauber": [16, 17], "Arrows": [18, 19], "Minardi": [20, 21], "BAR Honda": [22, 23] },
    2001: { "Scuderia Ferrari": [1, 2], "McLaren": [3, 4], "Williams": [5, 6], "Benetton": [7, 8], "BAR Honda": [9, 10], "Jordan": [11, 12], "Arrows": [14, 15], "Sauber": [16, 17], "Jaguar Racing": [18, 19], "Minardi": [20, 21], "Prost": [22, 23] },
    2002: { "Scuderia Ferrari": [1, 2], "McLaren": [3, 4], "Williams": [5, 6], "Sauber": [7, 8], "Jordan": [9, 10], "BAR Honda": [11, 12], "Renault F1": [14, 15], "Jaguar Racing": [16, 17], "Arrows": [20, 21], "Minardi": [22, 23], "Toyota F1": [24, 25] },
    2003: { "Scuderia Ferrari": [1, 2], "Williams": [3, 4], "McLaren": [5, 6], "Renault F1": [7, 8], "Sauber": [9, 10], "Jordan": [11, 12], "Jaguar Racing": [14, 15], "BAR Honda": [16, 17], "Minardi": [18, 19], "Toyota F1": [20, 21] },
    2004: { "Scuderia Ferrari": [1, 2], "Williams": [3, 4], "McLaren": [5, 6], "Renault F1": [7, 8], "BAR Honda": [9, 10], "Sauber": [11, 12], "Jaguar Racing": [14, 15], "Toyota F1": [16, 17], "Jordan": [18, 19], "Minardi": [20, 21] },
    2005: { "Scuderia Ferrari": [1, 2], "BAR Honda": [3, 4], "Renault F1": [5, 6], "Williams": [7, 8], "McLaren": [9, 10], "Sauber": [11, 12], "RBR": [14, 15], "Toyota F1": [16, 17], "Jordan": [18, 19], "Minardi": [20, 21] },
    2006: { "Renault F1": [1, 2], "McLaren": [3, 4], "Scuderia Ferrari": [5, 6], "Toyota F1": [7, 8], "Williams": [9, 10], "Honda F1": [11, 12], "Red Bull Racing": [14, 15], "BMW Sauber": [16, 17], "MF1 Racing": [18, 19], "Toro Rosso": [20, 21], "Super Aguri": [22, 23] },
    2007: { "McLaren": [1, 2], "Renault F1": [3, 4], "Scuderia Ferrari": [5, 6, "Massa"], "Honda F1": [7, 8], "BMW Sauber": [9, 10], "Toyota F1": [11, 12], "Red Bull Racing": [14, 15], "Williams": [16, 17], "Toro Rosso": [18, 19], "Spyker": [20, 21], "Super Aguri": [22, 23] },
    2008: { "Scuderia Ferrari": [1, 2], "BMW Sauber": [3, 4, "Heidfeld"], "Renault F1": [5, 6], "Williams": [7, 8], "Red Bull Racing": [9, 10, "Coulthard"], "Toyota F1": [11, 12], "Toro Rosso": [14, 15], "Honda F1": [16, 17], "Super Aguri": [18, 19], "Force India": [20, 21], "McLaren": [22, 23] },
    2009: { "McLaren": [1, 2], "Scuderia Ferrari": [3, 4, "Massa"], "BMW Sauber": [5, 6], "Renault F1": [7, 8], "Toyota F1": [9, 10], "Toro Rosso": [11, 12], "Red Bull Racing": [14, 15], "Williams": [16, 17], "Force India": [20, 21], "Brawn GP": [22, 23] },
    2010: { "McLaren": [1, 2], "Mercedes AMG": [3, 4], "Red Bull Racing": [5, 6], "Scuderia Ferrari": [7, 8, "Massa"], "Williams": [9, 10], "Renault F1": [11, 12], "Force India": [14, 15], "Toro Rosso": [16, 17], "Lotus Racing": [18, 19], "HRT": [20, 21], "Sauber": [22, 23], "Virgin Racing": [24, 25] },
    2011: { "Red Bull Racing": [1, 2], "McLaren": [3, 4], "Scuderia Ferrari": [5, 6], "Mercedes AMG": [7, 8], "Renault F1": [9, 10], "Williams": [11, 12], "Force India": [14, 15], "Sauber": [16, 17], "Toro Rosso": [18, 19], "Lotus": [20, 21], "HRT": [22, 23], "Virgin Racing": [24, 25] },
    2012: { "Red Bull Racing": [1, 2], "McLaren": [3, 4], "Scuderia Ferrari": [5, 6], "Mercedes AMG": [7, 8], "Lotus F1": [9, 10], "Force India": [11, 12], "Sauber": [14, 15], "Toro Rosso": [16, 17], "Williams": [18, 19], "Caterham": [20, 21], "HRT": [22, 23], "Marussia": [24, 25] },
    2013: { "Red Bull Racing": [1, 2], "Scuderia Ferrari": [3, 4], "McLaren": [5, 6], "Lotus F1": [7, 8], "Mercedes AMG": [9, 10], "Sauber": [11, 12], "Force India": [14, 15], "Williams": [16, 17], "Toro Rosso": [18, 19], "Caterham": [20, 21], "Marussia": [22, 23] }
  };
  const T74 = {
    "Tyrrell": [[1974, 1995, 3, 4]],
    "Scuderia Ferrari": [[1974, 1975, 11, 12], [1976, 1976, 1, 2], [1977, 1979, 11, 12], [1980, 1980, 1, 2], [1981, 1989, 27, 28], [1990, 1990, 1, 2], [1991, 1995, 27, 28]],
    "McLaren": [[1974, 1974, 5, 6], [1975, 1975, 1, 2], [1976, 1976, 11, 12], [1977, 1977, 1, 2], [1978, 1984, 7, 8], [1985, 1987, 1, 2], [1988, 1988, 11, 12, "Prost"], [1989, 1989, 1, 2], [1990, 1990, 27, 28], [1991, 1992, 1, 2], [1993, 1995, 7, 8]],
    "Team Lotus": [[1974, 1974, 1, 2], [1975, 1978, 5, 6], [1979, 1979, 1, 2], [1980, 1987, 11, 12], [1988, 1988, 1, 2], [1989, 1994, 11, 12]],
    "Brabham": [[1974, 1977, 7, 8], [1978, 1978, 1, 2], [1979, 1981, 5, 6], [1982, 1982, 1, 2], [1983, 1983, 5, 6], [1984, 1984, 1, 2], [1985, 1992, 7, 8]],
    "Williams": [[1977, 1980, 27, 28], [1981, 1981, 1, 2], [1982, 1982, 5, 6, "Reutemann"], [1983, 1983, 1, 2], [1984, 1992, 5, 6], [1993, 1994, 0, 2, "Hill"], [1995, 1995, 5, 6]],
    "Benetton": [[1986, 1992, 19, 20], [1993, 1994, 5, 6], [1995, 1995, 1, 2]],
    "Ligier": [[1976, 1995, 25, 26]],
    "Renault F1": [[1977, 1985, 15, 16]],
    "Arrows": [[1978, 1978, 35, 36], [1979, 1983, 29, 30], [1984, 1989, 17, 18], [1990, 1990, 9, 10]],
    "Footwork": [[1991, 1995, 9, 10]],
    "Alfa Romeo": [[1979, 1985, 22, 23]],
    "Toleman": [[1981, 1983, 35, 36], [1984, 1985, 19, 20]],
    "ATS": [[1977, 1984, 9, 10]],
    "March": [[1975, 1977, 9, 10], [1981, 1982, 17, 18], [1987, 1989, 15, 16, "Gugelmin"], [1992, 1992, 16, 17]],
    "Leyton House": [[1990, 1991, 15, 16]],
    "Shadow Racing Cars": [[1974, 1980, 16, 17]],
    "Surtees": [[1974, 1978, 18, 19]],
    "Minardi": [[1986, 1995, 23, 24]],
    "Larrousse": [[1987, 1992, 29, 30], [1993, 1994, 19, 20]],
    "Scuderia Italia (Dallara)": [[1988, 1993, 21, 22]],
    "Jordan Grand Prix": [[1991, 1992, 32, 33], [1993, 1995, 14, 15]],
    "Sauber Clásico": [[1993, 1995, 29, 30]],
    "Simtek": [[1994, 1994, 31, 32], [1995, 1995, 11, 12]],
    "Pacific": [[1994, 1994, 33, 34]],
    "Forti": [[1995, 1995, 21, 22]]
  };
  const CHAMP = { 1975: "Emerson Fittipaldi", 1976: "Niki Lauda", 1977: "James Hunt", 1978: "Niki Lauda", 1979: "Mario Andretti", 1980: "Jody Scheckter", 1981: "Alan Jones", 1982: "Nelson Piquet", 1983: "Keke Rosberg", 1984: "Nelson Piquet", 1985: "Niki Lauda", 1986: "Alain Prost", 1987: "Alain Prost", 1988: "Nelson Piquet", 1989: "Ayrton Senna", 1990: "Alain Prost", 1991: "Ayrton Senna", 1992: "Ayrton Senna", 1995: "Michael Schumacher",
    1996: "Michael Schumacher", 1997: "Damon Hill", 1998: "Jacques Villeneuve", 1999: "Mika Häkkinen", 2000: "Mika Häkkinen", 2001: "Michael Schumacher", 2002: "Michael Schumacher", 2003: "Michael Schumacher", 2004: "Michael Schumacher", 2005: "Michael Schumacher", 2006: "Fernando Alonso", 2007: "Fernando Alonso", 2008: "Kimi Räikkönen", 2009: "Lewis Hamilton", 2010: "Jenson Button", 2011: "Sebastian Vettel", 2012: "Sebastian Vettel", 2013: "Sebastian Vettel" };
  window.v18RealNumber = function (name, year, team) {
    try {
      if (!name) return null;
      if (year >= 2014) return permOf(name, year);
      if (year < 1974) return null;
      if (!team) { const d = getDriversForYear(year).find(x => x[0] === name); team = d && d[3]; }
      if (!team) return null;
      let pair = null;
      if (year >= 1996) pair = (T96[year] || {})[team] || null;
      else { const r = (T74[team] || []).find(x => year >= x[0] && year <= x[1]); if (r) pair = [r[2], r[3], r[4]]; }
      if (!pair) return null;
      const mates = getDriversForYear(year).filter(d => d[3] === team).map(d => d[0]);
      let first = mates[0];
      if (pair[2]) first = mates.find(n => n.includes(pair[2])) || first;
      if ((pair[0] === 1 || pair[1] === 1) && CHAMP[year] && mates.includes(CHAMP[year])) first = CHAMP[year];
      if (name === first) return pair[0];
      return mates.includes(name) ? pair[1] : null;
    } catch (e) { return null; }
  };
  if (typeof takenNumbersForSeason === "function") {
    const w = function () {
      const year = parseInt(document.getElementById("startYear")?.value || "2026");
      const used = new Set();
      getDriversForYear(year).forEach(d => {
        const n = v18RealNumber(d[0], year, d[3]);
        used.add(n != null ? n : 2 + (Math.abs(deterministicHash("num_" + d[0] + "_" + year)) % 98));
      });
      return used;
    };
    takenNumbersForSeason = w; window.takenNumbersForSeason = w;
  }
  if (typeof refreshDriverNumberOptions === "function") {
    const w = function () {
      const sel = document.getElementById("driverNumberSel"); if (!sel) return;
      const year = parseInt(document.getElementById("startYear")?.value || "2026");
      const used = takenNumbersForSeason();
      const type = document.getElementById("driverTypeSel")?.value || "actual";
      const chosen = document.getElementById("playedDriverSel")?.value || "";
      const racing = getDriversForYear(year).some(d => d[0] === chosen);
      let own = null, note = "";
      if (chosen && racing) {
        own = v18RealNumber(chosen, year);
        if (own != null) { used.delete(own); note = " (el tuyo real en " + year + ")"; }
        else if (year < 1974) { own = 2 + (Math.abs(deterministicHash("num_" + chosen + "_" + year)) % 98); used.delete(own); note = " (en " + year + " el número cambiaba en cada carrera)"; }
      }
      let opts = "";
      const from = own === 0 ? 0 : 1;
      for (let n = from; n <= 99; n++) if (!used.has(n) || n === own) opts += `<option value="${n}" ${n === own ? "selected" : ""}>#${n}${n === own ? note : ""}</option>`;
      sel.innerHTML = opts;
    };
    refreshDriverNumberOptions = w; window.refreshDriverNumberOptions = w;
  }

  /* ---------- 16) modo leyenda: la historia de cada escudería ---------- */
  const LEG_INFO = {
    "Team Lotus": "7 títulos de constructores (1963-1978) con Clark, Hill, Rindt, Fittipaldi y Andretti. Cerró en 1994.",
    "Brabham": "Jack Brabham fue campeón en 1966 con su propio auto; después Hulme (1967) y Piquet (1981 y 1983). Cerró en 1992.",
    "Benetton": "Campeón con Michael Schumacher en 1994 y 1995 (constructores en 1995). En 2002 pasó a ser Renault.",
    "Brawn GP": "Una sola temporada, 2009, y la ganó toda: títulos de pilotos (Button) y de constructores. Después fue Mercedes.",
    "Tyrrell": "Ken Tyrrell ganó tres títulos con Jackie Stewart (1969, 1971 y 1973) y el de constructores en 1971. Cerró en 1998.",
    "Renault F1": "Trajo el turbo a la F1 en 1977 y fue campeón con Fernando Alonso en 2005 y 2006.",
    "BRM": "Campeón con Graham Hill en 1962. Corrió de 1951 a 1977.",
    "Cooper Car Company": "Puso el motor atrás y cambió la F1: campeón con Jack Brabham en 1959 y 1960.",
    "Matra": "Campeón en 1969 con Jackie Stewart, en el equipo de Ken Tyrrell.",
    "Vanwall": "El primer campeón de constructores de la historia, en 1958, con Moss y Brooks.",
    "BAR Honda": "Subcampeón de constructores en 2004 con Jenson Button. En 2006 pasó a ser Honda.",
    "Jordan Grand Prix": "Ganó 4 carreras (la primera en Spa 1998) y fue 3.° en 1999. Ahí debutó Michael Schumacher en 1991.",
    "Toyota F1": "Corrió de 2002 a 2009 con un presupuesto gigante y nunca ganó una carrera.",
    "Honda F1": "Ganó en los 60 con Ginther y Surtees, y en 2006 con Button en Hungría. En 2009 pasó a ser Brawn GP.",
    "Stewart Grand Prix": "El equipo de Jackie Stewart (1997-1999): ganó una carrera, Nürburgring 1999 con Herbert. Después fue Jaguar.",
    "Ligier": "El equipo francés de Guy Ligier: 9 victorias entre 1977 y 1996, con Laffite como gran figura.",
    "Jaguar Racing": "De 2000 a 2004, con 2 podios y ninguna victoria. En 2005 se convirtió en Red Bull Racing.",
    "Toleman": "Ahí debutó Ayrton Senna en 1984 (2.° en Mónaco bajo la lluvia). En 1986 pasó a ser Benetton.",
    "Wolf Racing": "Ganó en su primera carrera (Argentina 1977, con Scheckter) y 3 veces ese año.",
    "Sauber Clásico": "El equipo suizo de Peter Sauber, que debutó en 1993 y siempre fue de mitad de tabla.",
    "Prost Grand Prix": "El equipo de Alain Prost (1997-2001): algunos podios, ninguna victoria.",
    "March": "Ganó con Stewart (1970), Brambilla (1975) y Peterson (1976).",
    "Surtees": "El equipo del único campeón en motos y en autos, John Surtees (1970-1978).",
    "Lola": "Fabricante de autos de carrera que entró a la F1 varias veces; nunca ganó con su propio equipo.",
    "Arrows": "Corrió 382 carreras entre 1978 y 2002 y nunca ganó.",
    "Shadow Racing Cars": "Ganó una sola carrera: Austria 1977, con Alan Jones.",
    "Eagle Racing": "El equipo de Dan Gurney: ganó en Bélgica 1967 con Gurney al volante.",
    "Footwork": "Arrows con otro nombre (1991-1996), con apoyo de Porsche y Mugen.",
    "Hesketh": "El equipo de Lord Hesketh: ganó en Holanda 1975 con James Hunt.",
    "Minardi": "El chico simpático de Faenza: 21 temporadas (1985-2005) sin ganar. Ahí debutó Alonso.",
    "Connaught": "Equipo británico de los 50: ganó en Siracusa 1955 con Tony Brooks, una carrera fuera del campeonato.",
    "Caterham": "Corrió de 2012 a 2014 y nunca sumó puntos.",
    "Spyker": "Una sola temporada, 2007: sumó 1 punto con Sutil en Japón.",
    "Marussia": "Sumó sus primeros puntos en Mónaco 2014 con Jules Bianchi.",
    "Super Aguri": "El equipo de Aguri Suzuki (2006-2008): 4 puntos con Takuma Sato.",
    "HRT": "Corrió de 2010 a 2012, siempre al fondo, y nunca sumó puntos."
  };
  window.v18LegendInfo = team => LEG_INFO[team] || "";
  const legInfoShow = () => {
    try {
      if (typeof selectedMode === "undefined" || selectedMode !== "legend") return;
      const club = document.getElementById("club"), info = document.getElementById("modeInfo");
      if (!club || !info) return;
      const year = parseInt(document.getElementById("startYear")?.value || "2026");
      const L = v18LegendRating(club.value, year), real = (getTeamsForYear(year) || []).some(t => t[0] === club.value);
      info.innerHTML = "🏆 <b>" + club.value + "</b>: " + (LEG_INFO[club.value] || "escudería histórica de la F1.") + "<br>" + (real ? "En " + year + " corría de verdad: vas con su auto real (⭐" + L.r.toFixed(1) + ")." : "En " + year + " ya no corría: vuelve con el auto de " + (L.y || "su época") + " (⭐" + L.r.toFixed(1) + ") como un equipo más de la grilla. Tu misión: devolverla a la cima.");
    } catch (e) {}
  };
  if (typeof refreshTeamLists === "function") {
    const o = refreshTeamLists;
    const w = function () { const r = o.apply(this, arguments); legInfoShow(); return r; };
    refreshTeamLists = w; window.refreshTeamLists = w;
  }
  try { document.addEventListener("change", e => { if (e.target && (e.target.id === "club" || e.target.id === "startYear")) legInfoShow(); }); } catch (e) {}
  if (typeof start === "function") {
    const o = start;
    const w = function () {
      const legend = typeof selectedMode !== "undefined" && selectedMode === "legend";
      const r = o.apply(this, arguments);
      try { if (legend && s && s.team && LEG_INFO[s.team]) { add("🏆 Volvió " + s.team + ": " + LEG_INFO[s.team]); render(); } } catch (e) {}
      return r;
    };
    start = w; window.start = w;
  }

  /* ---------- 17) antes de 2006 la clasificación era una sola tanda: el registro no habla de Q1/Q2/Q3 ---------- */
  if (typeof add === "function") {
    const o = add;
    const w = function (txt) {
      try { if (typeof txt === "string" && /^⏱️ .*Q[123] · P\d/.test(txt) && typeof v17OneQ === "function" && v17OneQ()) arguments[0] = txt.replace(/Q[123] · P/, "Clasificación · P"); } catch (e) {}
      return o.apply(this, arguments);
    };
    add = w; window.add = w;
  }

  /* ---------- 18) clasificación en vivo: los tiempos provisorios ya no te muestran mucho más adelante de lo que vas a terminar ---------- */
  if (typeof qlSessionStart === "function") {
    const o = qlSessionStart;
    const w = function () { const r = o.apply(this, arguments); try { Object.keys(QL.prov || {}).forEach(k => { QL.prov[k] = 0.2 + (QL.prov[k] - 0.25) * 0.4; }); } catch (e) {} return r; };
    qlSessionStart = w; window.qlSessionStart = w;
  }

  /* ---------- 19) NUEVO: "¿Sabías que…?" de cada circuito, en el pronóstico del fin de semana ---------- */
  const TRIVIA = {
    "Bahréin": "fue la primera carrera de F1 en Medio Oriente, en 2004.",
    "Arabia Saudita": "Jeddah es el callejero más rápido del calendario: se promedian más de 250 km/h.",
    "Australia": "Albert Park rodea un lago; de 1985 a 1995 el GP de Australia se corría en Adelaida.",
    "Japón": "Suzuka es el único circuito en forma de 8: una parte de la pista pasa por arriba de la otra.",
    "China": "el trazado de Shanghái tiene la forma del carácter chino «shang» (上).",
    "Miami": "el circuito da vueltas alrededor del estadio de los Miami Dolphins.",
    "San Marino": "Imola se llama «Enzo e Dino Ferrari», por el fundador de Ferrari y su hijo.",
    "Emilia-Romaña": "Imola volvió en 2020, 14 años después del último GP de San Marino.",
    "Mónaco": "es el circuito más corto y más lento del calendario, y casi no se puede adelantar.",
    "Canadá": "a la salida de la última chicana está el «Muro de los Campeones»: en 1999 chocaron ahí Hill, Schumacher y Villeneuve.",
    "España": "Montmeló se usó durante años para las pruebas de pretemporada: los equipos se lo saben de memoria.",
    "Austria": "en el Red Bull Ring la vuelta dura poco más de 1 minuto: es de las más cortas del año.",
    "Gran Bretaña": "en Silverstone se corrió la primera carrera del Mundial de F1, el 13 de mayo de 1950.",
    "Hungría": "en 1986 fue la primera carrera de F1 detrás de la Cortina de Hierro.",
    "Bélgica": "Spa es el circuito más largo del calendario, y Eau Rouge-Raidillon se sube a fondo.",
    "Países Bajos": "Zandvoort tiene curvas peraltadas: la última está inclinada 18 grados.",
    "Italia": "Monza es el «Templo de la Velocidad»: ahí se marcó la vuelta con el promedio más alto de la historia.",
    "Azerbaiyán": "Bakú tiene una recta de más de 2 km y una curva angostísima junto a la muralla de la ciudad vieja.",
    "Singapur": "fue la primera carrera nocturna de la F1, en 2008.",
    "Estados Unidos": "la curva 1 del COTA está arriba de una subida muy empinada: se frena casi a ciegas.",
    "México": "el autódromo está a más de 2.200 metros de altura: con el aire fino los autos tienen menos carga.",
    "Brasil": "Interlagos se corre al revés de las agujas del reloj y lleva el nombre de José Carlos Pace.",
    "Las Vegas": "se corre de noche por el Strip, con una recta de casi 2 km frente a los casinos.",
    "Qatar": "Losail se construyó para las motos; la F1 llegó recién en 2021.",
    "Abu Dhabi": "en Yas Marina la salida de boxes pasa por un túnel debajo de la pista.",
    "Argentina": "en el Autódromo de Buenos Aires Fangio ganó 4 veces el GP de su país (1954-1957).",
    "Malasia": "en Sepang la lluvia tropical podía caer de golpe en cualquier momento de la carrera.",
    "Turquía": "la curva 8 de Istanbul Park es una izquierda larguísima con cuatro vértices.",
    "Portugal": "en Estoril Ayrton Senna ganó su primera carrera de F1, bajo la lluvia, en 1985.",
    "Alemania": "el viejo Nürburgring medía más de 22 km: Jackie Stewart lo bautizó «el Infierno Verde».",
    "Francia": "Paul Ricard tiene escapatorias con rayas azules y rojas que frenan a los autos que se salen."
  };
  window.v18Trivia = name => TRIVIA[name] || "";
  if (typeof renderWeekendForecast === "function") {
    const o = renderWeekendForecast;
    const w = function () {
      const h = o.apply(this, arguments);
      try {
        const nm = trackData[s.gp] && trackData[s.gp].name, tv = TRIVIA[nm];
        if (h && tv) return h.replace(/<\/div>\s*$/, `<br><span class="small">💡 <b>¿Sabías que…?</b> ${tv.charAt(0).toUpperCase() + tv.slice(1)}</span></div>`);
      } catch (e) {}
      return h;
    };
    renderWeekendForecast = w; window.renderWeekendForecast = w;
  }

  /* ---------- 20) NUEVO: "La historia real" — qué pasó de verdad esa temporada ---------- */
  const REAL = {
    1950: ["Giuseppe Farina", "Alfa Romeo", null], 1951: ["Juan Manuel Fangio", "Alfa Romeo", null], 1952: ["Alberto Ascari", "Ferrari", null], 1953: ["Alberto Ascari", "Ferrari", null],
    1954: ["Juan Manuel Fangio", "Maserati y Mercedes", null], 1955: ["Juan Manuel Fangio", "Mercedes", null], 1956: ["Juan Manuel Fangio", "Ferrari", null], 1957: ["Juan Manuel Fangio", "Maserati", null],
    1958: ["Mike Hawthorn", "Ferrari", "Vanwall"], 1959: ["Jack Brabham", "Cooper", "Cooper"], 1960: ["Jack Brabham", "Cooper", "Cooper"], 1961: ["Phil Hill", "Ferrari", "Ferrari"],
    1962: ["Graham Hill", "BRM", "BRM"], 1963: ["Jim Clark", "Lotus", "Lotus"], 1964: ["John Surtees", "Ferrari", "Ferrari"], 1965: ["Jim Clark", "Lotus", "Lotus"],
    1966: ["Jack Brabham", "Brabham", "Brabham"], 1967: ["Denny Hulme", "Brabham", "Brabham"], 1968: ["Graham Hill", "Lotus", "Lotus"], 1969: ["Jackie Stewart", "Matra", "Matra"],
    1970: ["Jochen Rindt", "Lotus", "Lotus"], 1971: ["Jackie Stewart", "Tyrrell", "Tyrrell"], 1972: ["Emerson Fittipaldi", "Lotus", "Lotus"], 1973: ["Jackie Stewart", "Tyrrell", "Lotus"],
    1974: ["Emerson Fittipaldi", "McLaren", "McLaren"], 1975: ["Niki Lauda", "Ferrari", "Ferrari"], 1976: ["James Hunt", "McLaren", "Ferrari"], 1977: ["Niki Lauda", "Ferrari", "Ferrari"],
    1978: ["Mario Andretti", "Lotus", "Lotus"], 1979: ["Jody Scheckter", "Ferrari", "Ferrari"], 1980: ["Alan Jones", "Williams", "Williams"], 1981: ["Nelson Piquet", "Brabham", "Williams"],
    1982: ["Keke Rosberg", "Williams", "Ferrari"], 1983: ["Nelson Piquet", "Brabham", "Ferrari"], 1984: ["Niki Lauda", "McLaren", "McLaren"], 1985: ["Alain Prost", "McLaren", "McLaren"],
    1986: ["Alain Prost", "McLaren", "Williams"], 1987: ["Nelson Piquet", "Williams", "Williams"], 1988: ["Ayrton Senna", "McLaren", "McLaren"], 1989: ["Alain Prost", "McLaren", "McLaren"],
    1990: ["Ayrton Senna", "McLaren", "McLaren"], 1991: ["Ayrton Senna", "McLaren", "McLaren"], 1992: ["Nigel Mansell", "Williams", "Williams"], 1993: ["Alain Prost", "Williams", "Williams"],
    1994: ["Michael Schumacher", "Benetton", "Williams"], 1995: ["Michael Schumacher", "Benetton", "Benetton"], 1996: ["Damon Hill", "Williams", "Williams"], 1997: ["Jacques Villeneuve", "Williams", "Williams"],
    1998: ["Mika Häkkinen", "McLaren", "McLaren"], 1999: ["Mika Häkkinen", "McLaren", "Ferrari"], 2000: ["Michael Schumacher", "Ferrari", "Ferrari"], 2001: ["Michael Schumacher", "Ferrari", "Ferrari"],
    2002: ["Michael Schumacher", "Ferrari", "Ferrari"], 2003: ["Michael Schumacher", "Ferrari", "Ferrari"], 2004: ["Michael Schumacher", "Ferrari", "Ferrari"], 2005: ["Fernando Alonso", "Renault", "Renault"],
    2006: ["Fernando Alonso", "Renault", "Renault"], 2007: ["Kimi Räikkönen", "Ferrari", "Ferrari"], 2008: ["Lewis Hamilton", "McLaren", "Ferrari"], 2009: ["Jenson Button", "Brawn", "Brawn"],
    2010: ["Sebastian Vettel", "Red Bull", "Red Bull"], 2011: ["Sebastian Vettel", "Red Bull", "Red Bull"], 2012: ["Sebastian Vettel", "Red Bull", "Red Bull"], 2013: ["Sebastian Vettel", "Red Bull", "Red Bull"],
    2014: ["Lewis Hamilton", "Mercedes", "Mercedes"], 2015: ["Lewis Hamilton", "Mercedes", "Mercedes"], 2016: ["Nico Rosberg", "Mercedes", "Mercedes"], 2017: ["Lewis Hamilton", "Mercedes", "Mercedes"],
    2018: ["Lewis Hamilton", "Mercedes", "Mercedes"], 2019: ["Lewis Hamilton", "Mercedes", "Mercedes"], 2020: ["Lewis Hamilton", "Mercedes", "Mercedes"], 2021: ["Max Verstappen", "Red Bull", "Mercedes"],
    2022: ["Max Verstappen", "Red Bull", "Red Bull"], 2023: ["Max Verstappen", "Red Bull", "Red Bull"], 2024: ["Max Verstappen", "Red Bull", "McLaren"], 2025: ["Lando Norris", "McLaren", "McLaren"]
  };
  window.v18RealSeason = function (y) {
    const R = REAL[y]; if (!R) return "";
    return "En la vida real, el campeón de " + y + " fue " + R[0] + " (" + R[1] + ")" + (R[2] ? " y " + R[2] + " ganó el de constructores." : ". Todavía no existía el campeonato de constructores (llegó en 1958).");
  };
  if (typeof v15SeasonEnd === "function") {
    const o = v15SeasonEnd;
    const w = function () {
      const r = o.apply(this, arguments);
      try {
        const real = v18RealSeason(s.season);
        if (real && Array.isArray(r)) {
          const R = REAL[s.season], me = s.playerMode === "driver" ? s.playedDriverName : null;
          const dp = s.driverPoints || {}, champ = Object.keys(dp).sort((a, b) => dp[b] - dp[a])[0];
          let cmp = "";
          if (me && champ === me && me !== R[0]) cmp = " ¡Le cambiaste la historia!";
          else if (me && me === R[0] && champ !== me) cmp = " Esta vez la historia fue distinta.";
          else if (champ && champ === R[0]) cmp = " Esta vez también.";
          r[1] = (r[1] ? r[1] + " · " : "") + "📜 " + real + cmp;
          if (s._v18RealLog !== s.season) { s._v18RealLog = s.season; add("📜 La historia real: " + real + cmp); }
        }
      } catch (e) {}
      return r;
    };
    v15SeasonEnd = w; window.v15SeasonEnd = w;
  }
  // al empezar: qué pasó de verdad ese año (para que sepas contra qué historia jugás)
  if (typeof start === "function") {
    const o = start;
    const w = function () {
      const r = o.apply(this, arguments);
      try { if (s && REAL[s.season] && !s.player2) { add("📜 " + v18RealSeason(s.season) + " ¿Lo podés cambiar?"); render(); } } catch (e) {}
      return r;
    };
    start = w; window.start = w;
  }

  /* ---------- 21) NUEVO: práctica libre (modo piloto) — vueltas sin consecuencias para mejorar en cada circuito ---------- */
  const pracOk = () => {
    try {
      if (s.playerMode !== "driver" || s.player2 || s.gameOver) return false;
      if ((typeof ERA !== "undefined" && ERA) || s.miniStarted || s.advancing) return false;
      if ((typeof DL !== "undefined" && DL) || (typeof QL !== "undefined" && QL)) return false;
      return (s.session || 0) < 2 || !!s.raceDone;
    } catch (e) { return false; }
  };
  window.v18PracCardHtml = function () {
    const tr = (trackData[s.gp] || {}).name || "", B = s.pracBest || {}, best = B[tr];
    const list = Object.keys(B).sort().map(k => `<span class="pill">${k}: ${emFmtLap(B[k])}</span>`).join(" ");
    const ok = pracOk();
    return `<h2>🎮 Práctica libre</h2>
      <p class="small">Girá todas las vueltas que quieras en <b>${tr}</b> antes de la clasificación. No cuenta para nada: es para aprender dónde frenar y cuándo usar ${s.season >= 2014 ? "el ERS" : s.season >= 2009 ? "el KERS" : "el rebufo"}.</p>
      ${best ? `<p>⏱️ Tu mejor vuelta de práctica en ${tr}: <b>${emFmtLap(best)}</b></p>` : ""}
      ${TRIVIA[tr] ? `<p class="small">💡 <b>¿Sabías que…?</b> ${TRIVIA[tr].charAt(0).toUpperCase() + TRIVIA[tr].slice(1)}</p>` : ""}
      <button type="button" class="era-btn hot" ${ok ? "" : "disabled"} onclick="v18Practice()">⏱️ Salir a pista${ok ? "" : " (ahora no: estás en plena sesión)"}</button>
      ${list ? `<p class="small" style="margin-top:8px">🏁 Tus mejores vueltas: ${list}</p>` : ""}`;
  };
  window.v18Practice = function () {
    if (!pracOk() || typeof emFrame !== "function") return;
    const tr = trackData[s.gp] || {};
    const keep = { q: s._crashQuali, d: s._crashDNF, acc: window.__emLapAcc };
    window.__v18Prac = true;
    const done = () => {
      try {
        const txt = (document.getElementById("eTime") || {}).innerText || "";
        const m = txt.match(/(\d+):(\d+\.\d+)/), name = tr.name || "";
        s._crashQuali = keep.q; s._crashDNF = keep.d; window.__emLapAcc = keep.acc; s.miniStarted = false; window.__v18Prac = false;
        let msg = "🎮 Práctica terminada.";
        if (m && !/SIN TIEMPO/i.test(txt)) {
          const lap = +m[1] * 60 + +m[2];
          s.pracBest = s.pracBest || {};
          const prev = s.pracBest[name];
          if (!prev || lap < prev) { s.pracBest[name] = lap; msg = "🎮 Práctica en " + name + ": " + emFmtLap(lap) + (prev ? " · ¡nuevo récord personal! (−" + (prev - lap).toFixed(3) + ")" : " · primera vuelta registrada."); }
          else msg = "🎮 Práctica en " + name + ": " + emFmtLap(lap) + " (tu mejor sigue siendo " + emFmtLap(prev) + ").";
        } else msg = "🎮 Práctica en " + name + ": vuelta sin tiempo. Probá de nuevo.";
        add(msg);
      } catch (e) {}
      setTimeout(() => { try { render(); document.getElementById("v18PracCard")?.scrollIntoView({ block: "center" }); } catch (e) {} }, 1800);
    };
    emFrame(`<div class="mini-explain"><b>🎮 PRÁCTICA LIBRE</b> · No cuenta para el campeonato. <button type="button" class="dark" onclick="eraStop&&eraStop();s.miniStarted=false;window.__v18Prac=false;render()">✕ Volver a boxes</button></div>`,
      "⏱️", "Práctica libre en " + (tr.name || ""), "Una vuelta lanzada para practicar: frená en los carteles, doblá con ◀ ▶ y " + (s.season >= 2009 ? "usá el " + (s.season >= 2014 ? "ERS" : "KERS") + " solo en las rectas." : "aprovechá el rebufo en las rectas."), "emLap", done, "practice_" + Date.now());
    try { document.getElementById("jobArea")?.scrollIntoView({ block: "start" }); } catch (e) {}
  };
  if (typeof render === "function") {
    const o = render;
    const w = function () {
      const r = o.apply(this, arguments);
      try { if (typeof v3Card === "function") v3Card("v18PracCard", v18PracCardHtml, typeof v3Game === "function" && v3Game() && s.playerMode === "driver" && !s.player2, "#jobCard"); } catch (e) {}
      return r;
    };
    render = w; window.render = w;
  }

  /* ---------- 22) vuelta rápida: una sola verdad, y el punto extra también lo pueden ganar los rivales ---------- */
  // Antes: la transmisión podía decir "vuelta más rápida: Hamilton" y el resultado dártela a vos,
  // y cuando la hacía otro piloto nunca sumaba el punto (1950-59 y 2019-24 lo daban).
  if (typeof dlFeed === "function") {
    const o = dlFeed;
    const w = function (lap, txt) {
      try { const m = typeof txt === "string" && txt.match(/^⏱️ Vuelta más rápida: (.+?) · /); if (m) s._v18FL = { key: s.season + "_" + s.gp, name: m[1] }; } catch (e) {}
      return o.apply(this, arguments);
    };
    dlFeed = w; window.dlFeed = w;
  }
  if (typeof finishRace === "function") {
    const o = finishRace;
    const w = function () {
      const key = s.season + "_" + s.gp;
      let H = null;
      try {
        if (s._v18FL && s._v18FL.key === key) H = s._v18FL.name;
        else if (typeof engLastLaps !== "undefined" && engLastLaps && typeof engKey === "function" && engLastLaps.key === engKey() && engLastLaps.fastest) H = engLastLaps.fastest.name;
      } catch (e) {}
      let me = null;
      try { me = s.playerMode === "driver" ? s.playedDriverName : ((myTeamLineup()[0] || {}).name); } catch (e) {}
      const logLen = (s.log || []).length, before = s.raceDone;
      const dh = deterministicHash;
      if (H) deterministicHash = function (txt) { if (String(txt).startsWith("fastestlap_")) return H === me ? 0 : 99; return dh.apply(this, arguments); };
      let r;
      try { r = o.apply(this, arguments); } finally { deterministicHash = dh; }
      try {
        if (s.raceDone && !before && !s.player2 && typeof v15FLPoint === "function" && v15FLPoint()) {
          const mine = (s.log || []).slice(logLen).some(l => String(l).includes("Vuelta rápida de la carrera"));
          const g = (s._v4Grid || []).filter(x => !x.status && x.pos);
          const okPos = x => x.pos <= 10 || (typeof v15FLAnyPos === "function" && v15FLAnyPos());
          if (!mine && g.length) {
            let hold = H ? g.find(x => x.name === H) : null;
            if (!H) { const front = g.filter(x => x.name !== me && okPos(x)).sort((a, b) => a.pos - b.pos).slice(0, 6); hold = front[Math.abs(dh("v18fl" + key)) % Math.max(1, front.length)] || null; }
            if (hold && hold.name !== me && okPos(hold) && s.driverPoints) {
              s.driverPoints[hold.name] = (s.driverPoints[hold.name] || 0) + 1;
              if (hold.mine || hold.team === s.team) { s.points = (s.points || 0) + 1; if (s.teamStandings) s.teamStandings[s.team] = s.points; } // tu compañero: suma para tu equipo
              else if (s.teamStandings && hold.team) s.teamStandings[hold.team] = (s.teamStandings[hold.team] || 0) + 1;
              hold.pts = (hold.pts || 0) + 1;
              add("⏱️ Vuelta rápida: " + hold.name + " se lleva el punto extra.");
            }
          }
        }
      } catch (e) {}
      return r;
    };
    finishRace = w; window.finishRace = w;
  }

  // en 2021 la sprint daba 3-2-1: el aviso de la transmisión lo dice bien
  if (typeof dlFeed === "function") {
    const o = dlFeed;
    const w = function (lap, txt) { if (typeof txt === "string" && s.season === 2021) arguments[1] = txt.replace("Puntos del 8 al 1.", "Puntos 3-2-1 (así era la «clasificación sprint» de 2021)."); return o.apply(this, arguments); };
    dlFeed = w; window.dlFeed = w;
  }

  // en la práctica libre, los mensajes de choque no hablan de la clasificación
  if (typeof add === "function") {
    const o = add;
    const w = function (txt) {
      if (window.__v18Prac && typeof txt === "string") arguments[0] = txt.replace(": sin tiempo en la clasificación.", " en la práctica libre (no cuenta para nada).");
      return o.apply(this, arguments);
    };
    add = w; window.add = w;
  }
  // y el cartel del final tampoco dice "largás desde el fondo"
  try {
    new MutationObserver(() => {
      if (!window.__v18Prac) return;
      const el = document.getElementById("eTime");
      if (el && /largás desde el fondo|SIN TIEMPO/.test(el.innerHTML) && !el.dataset.v18) { el.dataset.v18 = 1; el.innerHTML = el.innerHTML.replace(/vuelta terminada contra las barreras/, "te fuiste contra las barreras en la práctica (no cuenta)"); }
      document.querySelectorAll("#eraMsg").forEach(m => { if (/largás desde el fondo/.test(m.textContent)) m.textContent = "💥 Al muro en la práctica: no pasa nada, probá otra vez."; });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  /* ---------- 23) Versión 1.0: aviso una sola vez ---------- */
  setTimeout(() => {
    try {
      if (localStorage.getItem("fw_v1_seen")) return;
      localStorage.setItem("fw_v1_seen", "1");
      if (typeof v9Toast === "function") v9Toast("🏁 FAWIWE F1 · VERSIÓN 1.0 — la versión final: grillas reales, números reales, práctica libre y la historia real de cada año. ¡Gracias por jugar!");
    } catch (e) {}
  }, 4500);
})();
