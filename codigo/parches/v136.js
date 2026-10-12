/* =====================================================================================
   FAWIWE · V136
   Nuevo: 🏁 Carrera rápida (y Carrera de ensueño con leyendas), 📸 Tarjeta para compartir,
          🎨 Personalizá tu auto.
   Arreglos: carga de partidas limpia, presentación que no se pisa con otras pantallas,
             "PILOTO" en vez de "PRESIDENTE" en modo piloto, incidentes que esperan.
   ===================================================================================== */
function v6Esc(t) { return v3Esc(t); }

/* ============================ arreglos ============================ */
(function () {
  // cargar una partida guardada: no arrastra cosas de la partida anterior
  const lg = window.loadGameFromSlot;
  if (typeof lg === "function") window.loadGameFromSlot = function (mode, i) {
    try { const d = readSaveSlot(mode, i); if (d && d.state) V5_KEYS.forEach(k => { if (!(k in d.state)) delete s[k]; }); } catch (e) {}
    const r = lg.apply(this, arguments);
    try { v6LiveryApply(); } catch (e) {}
    return r;
  };
  // presentación del auto: espera a que no haya otra pantalla abierta y no aparece si ya empezaste a jugar
  if (typeof v5LaunchBusy === "function") {
    const ob = v5LaunchBusy;
    v5LaunchBusy = function () {
      if (ob.apply(this, arguments)) return true;
      if (document.querySelector("#seasonChangesOverlay.show, #v4Chal.show, #v6Quick.show, #v6Share.show, #hofOverlay.show")) return true;
      return [...document.querySelectorAll('[id$="Overlay"]')].some(el => el.classList.contains("show") && el.id !== "v5Launch");
    };
  }
  if (typeof v5LaunchWanted === "function") {
    const ow = v5LaunchWanted;
    v5LaunchWanted = function () { return ow.apply(this, arguments) && !s.miniStarted && !s.quickRace; };
  }
  // los incidentes del paddock esperan a que cierres el resultado o la presentación
  const tai = window.triggerAIEventIfNeeded;
  if (typeof tai === "function") window.triggerAIEventIfNeeded = function () {
    if (document.querySelector("#resultOverlay.show, #seasonChangesOverlay.show, #ngOverlay.show, #v5Launch.show, #v6Share.show")) return false;
    return tai.apply(this, arguments);
  };
  // modo piloto: el encabezado dice PILOTO, no PRESIDENTE
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try {
      const lbl = document.querySelector('[data-i18n="hdr_president"]');
      if (lbl) lbl.textContent = s.playerMode === "driver" ? "PILOTO" : "PRESIDENTE";
      v6LiveryApply();
      v3Card("v6LiveryCard", v6LiveryCardHtml, v3Game() && !s.player2, "#v4HelmetCard, #v4SocialCard, #jobCard");
    } catch (e) { console.warn("[FAWIWE] v136 render:", e); }
    return x;
  };
})();

/* ============================ 🎨 PERSONALIZÁ TU AUTO ============================ */
let V6_ORIG_COLORS = {};
function v6Livery() {
  if (!s.livery || s.livery.team !== s.team) {
    const base = V6_ORIG_COLORS[s.team] || (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
    s.livery = { team: s.team, c1: base, c2: "#ffffff", on: false };
  }
  return s.livery;
}
function v6LiveryApply() {
  if (typeof teamColors === "undefined" || !s || !s.team) return;
  Object.keys(V6_ORIG_COLORS).forEach(t => { if (!s.livery || !s.livery.on || s.livery.team !== t) { teamColors[t] = V6_ORIG_COLORS[t]; delete V6_ORIG_COLORS[t]; } });
  const L = s.livery;
  if (L && L.on && L.team === s.team) {
    if (!(s.team in V6_ORIG_COLORS)) V6_ORIG_COLORS[s.team] = teamColors[s.team] || "#e10600";
    teamColors[s.team] = L.c1;
  }
}
function v6LiverySet(k, v) {
  const L = v6Livery(); L[k] = v; L.on = true;
  v6LiveryApply();
  try { applyTeamColor(); } catch (e) {}
  render();
}
function v6LiveryReset() { if (s.livery) s.livery.on = false; v6LiveryApply(); try { applyTeamColor(); } catch (e) {} render(); }
(function () {
  if (typeof fwCarSvg !== "function") return;
  const o = fwCarSvg;
  fwCarSvg = function (era, color, cls) {
    let svg = o.apply(this, arguments);
    try {
      const L = s && s.livery;
      if (L && L.on && L.team === s.team && color && String(color).toLowerCase() === String(L.c1).toLowerCase() && L.c2) svg = svg.replace(/fill="#fff(fff)?"/gi, `fill="${L.c2}"`);
    } catch (e) {}
    return svg;
  };
})();
function v6LiveryCardHtml() {
  const L = v6Livery();
  const era = typeof fwEra === "function" ? fwEra(s.season).y : 2026;
  const col = L.on ? L.c1 : ((typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600");
  const presets = ["#e10600", "#00d2be", "#ff8000", "#1e41ff", "#006f62", "#ffd700", "#9b0000", "#ffffff", "#111111", "#ff3ec8"];
  return `<h2>🎨 Tu auto</h2><div class="v6-liv"><div class="v6-liv-car">${fwCarSvg(era, col)}</div><div class="v6-liv-ed">
    <label>Color principal <input type="color" value="${col}" onchange="v6LiverySet('c1', this.value)"></label>
    <div class="v6-sw">${presets.map(c => `<button type="button" style="background:${c} !important" title="${c}" onclick="v6LiverySet('c1','${c}')"></button>`).join("")}</div>
    <label>Color de detalles <input type="color" value="${L.c2 || "#ffffff"}" onchange="v6LiverySet('c2', this.value)"></label>
    <span class="small">Se ve en la presentación, en el tablero, en el mapa, en el podio y en la tarjeta para compartir.</span>
    ${L.on ? `<button type="button" class="dark" onclick="v6LiveryReset()">↩️ Volver a los colores del equipo</button>` : ""}</div></div>`;
}

/* ============================ 📸 TARJETA PARA COMPARTIR ============================ */
function v6ShareData(kind, grid) {
  const me = v3MyRace(grid) || {};
  const drv = s.playerMode === "driver";
  const name = drv ? (s.playedDriverName || "") : (s.team || "");
  const trk = (trackData[s.gp] || {}).name || "";
  const pos = me.status ? me.status : me.pos ? "P" + me.pos : "—";
  const big = me.status ? (me.status === "DNF" ? "ABANDONO" : "NO LARGÓ") : me.pos === 1 ? "¡VICTORIA!" : me.pos <= 3 ? "¡PODIO!" : me.pos <= 10 ? "EN LOS PUNTOS" : "A SEGUIR";
  let champ = "—";
  try { if (drv) { const base = (s.playedDriverName || "").replace(" (reserva)", ""); const arr = Object.entries(s.driverPoints || {}).sort((a, b) => b[1] - a[1]); const i = arr.findIndex(x => x[0] === base); if (i >= 0) champ = "P" + (i + 1) + " · " + arr[i][1] + " pts"; } else champ = (typeof dashTeamPos === "function" ? dashTeamPos() : "—") + " · " + Math.round(s.points || 0) + " pts"; } catch (e) {}
  const hl = (s._dl && s._dl.key === s.season + "_" + s.gp && s._dl.highlights ? s._dl.highlights.filter(h => /⬆️|⚔️|🛡️|🏁 Largada|⏱️/.test(h.txt)).slice(0, 3).map(h => "V" + h.lap + "  " + h.txt.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "").replace(/\s+/g, " ").trim()) : []);
  return { name, team: s.team, trk, season: s.season, pos, big, pts: me.pts || 0, champ, hl, col: (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600", drv, sub: drv ? s.team : "Escudería" };
}
function v6Wrap(ctx, text, x, y, maxW, lh, maxLines) {
  const words = String(text).split(" "); let line = "", n = 0;
  for (const w of words) { const test = line ? line + " " + w : w; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= maxLines - 1) break; } else line = test; }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}
async function v6ShareMake(D) {
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b0b10"); g.addColorStop(1, "#050507"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W * 0.8, H * 0.25, 40, W * 0.8, H * 0.25, 700); rg.addColorStop(0, D.col + "88"); rg.addColorStop(1, "transparent"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.fillStyle = D.col; x.fillRect(0, 0, W, 16); x.fillRect(0, H - 16, W, 16);
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#111111"; x.fillRect(i * (W / 14), H - 46, W / 14, 30); }
  x.textBaseline = "alphabetic";
  x.fillStyle = "#e10600"; x.font = "900 54px Arial Black, Arial"; x.fillText("FAWIWE", 70, 120); x.fillStyle = "#fff"; x.font = "italic 900 54px Arial Black, Arial"; x.fillText("F1", 330, 120);
  x.fillStyle = "#facc15"; x.font = "700 30px Arial"; x.fillText(("GP DE " + D.trk + " · " + D.season).toUpperCase(), 70, 185);
  x.fillStyle = "#fff"; x.font = "900 230px Arial Black, Arial"; x.fillText(D.pos, 60, 430);
  x.fillStyle = D.col; x.font = "900 70px Arial Black, Arial"; x.fillText(D.big, 70, 520);
  x.fillStyle = "#fff"; x.font = "900 64px Arial"; v6Wrap(x, D.name, 70, 640, 640, 70, 2);
  x.fillStyle = "#bbb"; x.font = "600 36px Arial"; x.fillText(D.sub === "Escudería" ? "Escudería · " + D.team : D.team, 70, 790);
  // casco o auto
  try {
    const svg = D.drv && typeof v4HelmetSvg === "function" ? v4HelmetSvg(null, 360) : (typeof fwCarSvg === "function" ? fwCarSvg(fwEra(s.season).y, D.col) : "");
    if (svg) {
      const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.includes("xmlns") ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'));
      const img = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
      if (D.drv) x.drawImage(img, 690, 250, 340, 312); else x.drawImage(img, 560, 560, 480, 160);
    }
  } catch (e) {}
  // datos
  const box = (bx, by, label, val) => { x.fillStyle = "#15151c"; x.fillRect(bx, by, 450, 130); x.fillStyle = D.col; x.fillRect(bx, by, 8, 130); x.fillStyle = "#999"; x.font = "700 26px Arial"; x.fillText(label, bx + 30, by + 46); x.fillStyle = "#fff"; x.font = "900 44px Arial"; x.fillText(val, bx + 30, by + 104); };
  box(70, 850, "PUNTOS HOY", "+" + D.pts); box(560, 850, "CAMPEONATO", D.champ);
  let y = 1060;
  if (D.hl.length) { x.fillStyle = "#facc15"; x.font = "800 28px Arial"; x.fillText("MOMENTOS", 70, y); y += 46; x.fillStyle = "#ddd"; x.font = "500 30px Arial"; D.hl.forEach(h => { y = v6Wrap(x, h, 70, y, 940, 38, 2); }); }
  x.fillStyle = "#777"; x.font = "600 24px Arial"; x.fillText("Jugado en FAWIWE F1 · #FAWIWE", 70, H - 70);
  return c.toDataURL("image/png");
}
async function v6Share() {
  const grid = s._v4Grid || [];
  const D = v6ShareData("race", grid.map(e => Object.assign({ mine: false }, e, { mine: (myTeamLineup() || []).some(d => d.name === e.name), seat: ((myTeamLineup() || []).find(d => d.name === e.name) || {}).seat })));
  let ov = document.getElementById("v6Share");
  if (!ov) { ov = document.createElement("div"); ov.id = "v6Share"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="v6-share-card"><div class="hof-k">📸 TARJETA PARA COMPARTIR</div><p class="small">Armando la imagen…</p></div>`;
  ov.classList.add("show");
  let url = "";
  try { url = await v6ShareMake(D); } catch (e) { console.warn("[FAWIWE] tarjeta:", e); }
  const file = "fawiwe-" + (D.trk || "gp").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + D.season + ".png";
  ov.innerHTML = `<div class="v6-share-card"><div class="hof-k">📸 TARJETA PARA COMPARTIR</div>${url ? `<img src="${url}" alt="Tarjeta de tu resultado">` : `<p>No se pudo armar la imagen.</p>`}
    <div class="v6-share-btns">${url ? `<a class="lv-btn red" href="${url}" download="${file}">⬇️ Descargar imagen</a>` : ""}${url && navigator.share ? `<button type="button" class="lv-btn" onclick="v6ShareNative()">📤 Compartir</button>` : ""}<button type="button" class="lv-btn" onclick="document.getElementById('v6Share').classList.remove('show')">Cerrar</button></div>
    <p class="small">Si el botón no descarga, mantené apretada la imagen (o clic derecho) para guardarla.</p></div>`;
  window._v6Url = url; window._v6File = file;
}
async function v6ShareNative() {
  try { const blob = await (await fetch(window._v6Url)).blob(); const f = new File([blob], window._v6File, { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: "FAWIWE F1", text: "Mi carrera en FAWIWE F1 🏁" }); else await navigator.share({ title: "FAWIWE F1", text: "Mi carrera en FAWIWE F1 🏁" }); } catch (e) {}
}

/* ============================ 🏁 CARRERA RÁPIDA / DE ENSUEÑO ============================ */
function v6QuickYears() { const out = []; for (let y = 2026; y >= 1950; y--) out.push(y); return out; }
function v6QuickTracks(y) { try { const r = CAL_POOL.filter(c => calRunsIn(c, y)); return (r.length ? r : CAL_POOL).map(c => c.n); } catch (e) { return ["Mónaco"]; } }
function v6QuickDrivers(y) { try { return getDriversForYear(y).map(d => d[0]); } catch (e) { return []; } }
function v6QuickOpen() {
  let ov = document.getElementById("v6Quick");
  if (!ov) { ov = document.createElement("div"); ov.id = "v6Quick"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  const Q = window._v6Q = window._v6Q || { year: 2026, trk: "Mónaco", wet: false, dream: false, len: 0.5 };
  const tracks = v6QuickTracks(Q.year); if (!tracks.includes(Q.trk)) Q.trk = tracks[0];
  const drivers = v6QuickDrivers(Q.year); if (!drivers.includes(Q.drv)) Q.drv = drivers[0];
  ov.innerHTML = `<div class="v4-chal-card v6-quick"><div class="hof-k">🏁 CARRERA RÁPIDA</div><h2>Un fin de semana, ya</h2><p class="small">Clasificación en vivo y carrera, sin temporada. Elegí todo y a la pista.</p>
    <div class="v6-q-grid">
      <label>📅 Año<select onchange="window._v6Q.year=+this.value; v6QuickOpen()">${v6QuickYears().map(y => `<option ${y === Q.year ? "selected" : ""}>${y}</option>`).join("")}</select></label>
      <label>🧑‍✈️ Piloto<select onchange="window._v6Q.drv=this.value">${drivers.map(d => `<option ${d === Q.drv ? "selected" : ""}>${v6Esc(d)}</option>`).join("")}</select></label>
      <label>🗺️ Circuito<select onchange="window._v6Q.trk=this.value">${tracks.map(t => `<option ${t === Q.trk ? "selected" : ""}>${v6Esc(t)}</option>`).join("")}</select></label>
      <label>🌦️ Clima<select onchange="window._v6Q.wet=this.value==='1'"><option value="0" ${!Q.wet ? "selected" : ""}>☀️ Seco</option><option value="1" ${Q.wet ? "selected" : ""}>🌧️ Lluvia</option></select></label>
      <label>⏱️ Duración<select onchange="window._v6Q.len=+this.value">${[[0.25, "25% (rapidísima)"], [0.5, "50%"], [1, "100% (vueltas reales)"]].map(o => `<option value="${o[0]}" ${o[0] === Q.len ? "selected" : ""}>${o[1]}</option>`).join("")}</select></label>
      <label>🏎️ Grilla<select onchange="window._v6Q.dream=this.value==='1'"><option value="0" ${!Q.dream ? "selected" : ""}>La real de ese año</option><option value="1" ${Q.dream ? "selected" : ""}>✨ De ensueño: leyendas de todas las épocas</option></select></label>
    </div>
    <div class="v6-row"><button type="button" class="lv-btn red" onclick="v6QuickStart()">🏁 ¡A la pista!</button><button type="button" class="lv-btn" onclick="document.getElementById('v6Quick').classList.remove('show')">Cancelar</button></div></div>`;
  ov.classList.add("show");
}
function v6DreamGrid() {
  // las leyendas de todas las épocas + las figuras de hoy, repartidas en los equipos (los mejores, en los mejores autos)
  let pool = [];
  try { pool = legendDrivers.map(d => [d[0], d[1]]); } catch (e) {}
  try { getDriversForYear(2026).forEach(d => { if (!pool.find(p => p[0] === d[0])) pool.push([d[0], d[1]]); }); } catch (e) {}
  pool = pool.filter(p => p[0] !== s.playedDriverName).sort((a, b) => b[1] - a[1]);
  const teams = getTeamsForYear(s.season).slice().sort((a, b) => b[1] - a[1]);
  if (!s.rosterOverrides) s.rosterOverrides = {};
  let k = 0;
  teams.forEach(t => {
    if (t[0] === s.club) return;
    const a = pool[k++], b = pool[k++];
    s.rosterOverrides[t[0]] = [a, b].filter(Boolean).map(p => [p[0], Math.min(99, p[1]), 5, t[0]]);
  });
  // tu compañero también es una leyenda
  const mate = pool[k++];
  if (mate) s.rosterOverrides[s.club] = [[s.playedDriverName, s.playedDriverRating || 85, 5, s.club], [mate[0], mate[1], 5, s.club]];
}
function v6QuickStart() {
  const Q = window._v6Q; if (!Q) return;
  document.getElementById("v6Quick")?.classList.remove("show");
  const decEl = document.getElementById("decade"), ysEl = document.getElementById("startYear");
  const keepDec = decEl ? decEl.value : null, keepYear = ysEl ? ysEl.value : null;
  try {
    setPlayMode("solo"); setMode("actual"); mcPickRole("driver");
    if (decEl) { const dv = String(Math.floor(Q.year / 10) * 10); if ([...decEl.options].some(o => o.value === dv)) { decEl.value = dv; updateYearOptions(); } }
    if (ysEl) { ysEl.value = String(Q.year); try { refreshTeamLists(); } catch (e) {} }
    const dt = document.getElementById("driverTypeSel"); if (dt) dt.value = "actual";
    refreshDriverPickList();
    const ps = document.getElementById("playedDriverSel"); if (ps && Q.drv) { ps.value = Q.drv; try { autoSelectDriverTeam(); } catch (e) {} }
    start();
  } catch (e) { console.warn("[FAWIWE] carrera rápida:", e); return; }
  try { if (decEl && keepDec) { decEl.value = keepDec; updateYearOptions(); } if (ysEl && keepYear) ysEl.value = keepYear; } catch (e) {}
  s.quickRace = { dream: !!Q.dream, trk: Q.trk };
  s.drvC = { team: s.team, salary: 5, years: 1, start: s.season, opt: null, sponsor: 0, spot: "casco", clause: null, clauseLabel: "Sin cláusula", events: 3, brands: false, terminated: false, expired: false, checked: {} };
  s._launchSeen = s.season; s.preseason = s.season;
  s.realism = Object.assign({}, s.realism || {}, { len: Q.len, v132: true });
  try { calApply(true); } catch (e) {}
  let gi = trackData.findIndex(t => t.name === Q.trk);
  if (gi > 0) { const tmp = trackData[0]; trackData[0] = trackData[gi]; trackData[gi] = tmp; }
  else if (gi < 0) { const P = CAL_POOL.find(c => c.n === Q.trk) || {}; trackData[0] = { name: Q.trk, laps: P.laps || 58, record: P.rec || "1:30.000" }; }
  s.gp = 0;
  const wo = typeof weatherOptions !== "undefined" ? weatherOptions : [];
  const w = Q.wet ? (wo.find(x => x.wet && /fuerte/i.test(x.label)) || wo.find(x => x.wet)) : wo.find(x => !x.wet);
  if (w) { s.weather = w; s.weekendForecast = null; }
  if (Q.dream) v6DreamGrid();
  s.session = 2; s.raceDone = false; s.quizDone = true; s.miniStarted = false; s.advancing = false;
  add("🏁 CARRERA RÁPIDA: " + (s.playedDriverName || "") + " en " + Q.trk + " " + s.season + (Q.dream ? " · ✨ grilla de ensueño" : "") + (Q.wet ? " · 🌧️ lluvia" : "") + ". ¡Arrancá con la clasificación!");
  render();
  setTimeout(() => { document.getElementById("jobCard")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
}

/* ============================ ganchos de resultado + menú ============================ */
(function () {
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind) {
    const r = sb.apply(this, arguments);
    try {
      if (/^CARRERA/.test(String(kind)) && !s.player2) {
        const box = document.getElementById("resultGridTable");
        if (box && !box.querySelector(".v6-res-btns")) {
          box.insertAdjacentHTML("afterbegin", `<div class="v6-res-btns"><button type="button" class="lv-btn red" onclick="v6Share()">📸 Tarjeta para compartir</button>${s.quickRace ? `<button type="button" class="lv-btn" onclick="v6QuickOpen()">🔁 Otra carrera rápida</button><button type="button" class="lv-btn" onclick="v7BackToMenu()">🏠 Menú</button>` : ""}</div>`);
        }
      }
    } catch (e) {}
    return r;
  };
  // menú: botón de carrera rápida
  if (typeof v4MenuBox === "function") {
    const o = v4MenuBox;
    v4MenuBox = function () {
      const r = o.apply(this, arguments);
      try { const g = document.querySelector("#v4MenuBox .v4-menu-g"); if (g && !g.querySelector(".v6-quick-btn")) g.insertAdjacentHTML("afterbegin", `<button type="button" class="v6-quick-btn on" onclick="v6QuickOpen()"><b>🏁 Carrera rápida</b><span>Elegí año, piloto y circuito… o una grilla de leyendas</span></button>`); } catch (e) {}
      return r;
    };
    try { v4MenuBox(); } catch (e) {}
  }
  try { if (typeof DASH_NAV !== "undefined") { const g = DASH_NAV.find(x => x[0] === "MÁS"); if (g && !g[1].find(i => i[0] === "LIV")) g[1].splice(4, 0, ["LIV", "Tu auto", "#v6LiveryCard"]); } } catch (e) {}
})();
