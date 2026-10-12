/* =====================================================================================
   FAWIWE · REALISMO
   - Arreglo: si elegís un piloto ACTUAL (ej. Russell) y arrancás de reserva, su asiento lo
     ocupa un piloto de prueba hasta que debutes (antes corría "Russell" dos veces).
   - 🎚️ Ajustes de realismo: IA adaptativa, duración de carrera, daños y desgaste.
   - ⚡ Simular práctica (programa rápido) y ⬇️ Empezar desde abajo.
   - 🤝 Relación con tu compañero y reconocimiento (moral y ofertas).
   - 🏁 Vuelta real con técnica: frenada en línea recta soltando progresivo hasta el vértice,
     y ERS solo en las rectas.
   ===================================================================================== */
function rl() { if (!s.realism || typeof s.realism !== "object") s.realism = { adaptive: true, len: 1, damage: true, v132: true }; if (!s.realism.v132) { s.realism.v132 = true; s.realism.len = 1; } return s.realism; }

/* ---------- 1) reserva con piloto actual: un piloto de prueba ocupa tu asiento ---------- */
function rlStandIn(team) {
  if (!s.rlStandIn) s.rlStandIn = {};
  const k = team + "_" + s.season;
  if (!s.rlStandIn[k]) {
    const nm = generateRookieName("standin_" + team + "_" + s.season);
    s.rlStandIn[k] = nm;
    if (!s.driverPoints) initDriverStandings();
    if (!(nm in s.driverPoints)) { s.driverPoints[nm] = 0; if (s.driverWins) s.driverWins[nm] = 0; }
  }
  return s.rlStandIn[k];
}
(function () {
  const o = window.raceWeekendLineup;
  if (typeof o === "function") window.raceWeekendLineup = function (team) {
    const r = o.apply(this, arguments);
    try {
      const reserveActual = s.playerMode === "driver" && s.playedDriverType === "actual" && s._forceReserve && team === s.club && tierIndex() === 0 && !s._reserveHasRaced;
      if (reserveActual && Array.isArray(r)) {
        const i = r.findIndex(d => d && d[0] === s.playedDriverName);
        if (i >= 0) { const d = r[i].slice(); d[0] = rlStandIn(team); d[1] = Math.min(d[1] || 75, 74); r[i] = d; }
      }
    } catch (e) {}
    return r;
  };
})();

/* ---------- 2) IA adaptativa: el auto pesa más que tus minijuegos ---------- */
(function () {
  const o = window.simulateGrid;
  if (typeof o !== "function") return;
  window.simulateGrid = function (kind) {
    if (!rl().adaptive) return o.apply(this, arguments);
    const keys = ["raceMiniScore", "qualiMiniScore", "sessionMiniScore"], save = {};
    keys.forEach(k => { save[k] = s[k]; if (typeof s[k] === "number") s[k] = 50 + (s[k] - 50) * 0.45; });
    try { return o.apply(this, arguments); } finally { keys.forEach(k => { s[k] = save[k]; }); }
  };
})();

/* ---------- 3) duración de carrera (vueltas de la transmisión y del vuelta a vuelta) ---------- */
function rlWithLaps(fn, self, args) {
  const t = trackData[s.gp];
  if (!t) return fn.apply(self, args);
  const orig = t.laps;
  t.laps = Math.max(5, Math.round(orig * (rl().len || 1)));
  try { return fn.apply(self, args); } finally { t.laps = orig; }
}
(function () {
  ["engBuildLaps", "engStartLive"].forEach(n => {
    const o = window[n];
    if (typeof o === "function") window[n] = function () { return rlWithLaps(o, this, arguments); };
  });
})();

/* ---------- 4) daños: un error en carrera tiene consecuencias ---------- */
function rlDamage(where) {
  if (!rl().damage || s.session < 2) return;
  if (Math.random() < 0.4) {
    const heavy = Math.random() < 0.35;
    s._rlDamage = { key: s.season + "_" + s.gp, pen: heavy ? -12 : -6, note: heavy ? "💥 Daño serio: perdiste el alerón delantero y hubo que parar de más." : "🔧 Tocaste un piano y dañaste el piso: el auto perdió carga." };
    add((heavy ? "💥 " : "🔧 ") + "Daño en el auto por el error en " + where + ": " + s._rlDamage.note.replace(/^\S+ /, "") + " Se va a notar en el resultado.");
  }
}
(function () {
  ["finishMini", "finishRaceJob"].forEach(n => {
    const o = window[n];
    if (typeof o === "function") window[n] = function (ok) { const sess = s.session; const r = o.apply(this, arguments); try { if (!ok && sess >= 2) rlDamage(sess === 2 ? "clasificación" : "carrera"); } catch (e) {} return r; };
  });
  const lp = window.lowAttributePenalty;
  if (typeof lp === "function") window.lowAttributePenalty = function () {
    const r = lp.apply(this, arguments);
    const d = s._rlDamage;
    if (d && d.key === s.season + "_" + s.gp) return { penalty: (r.penalty || 0) + d.pen, note: (r.note ? r.note + " " : "") + d.note };
    return r;
  };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () { const r = ng.apply(this, arguments); s._rlDamage = null; return r; };
})();

/* ---------- 5) ⚡ simular práctica (programa rápido) ---------- */
function rlSimPractice() {
  if (s.session >= 2 || s.raceDone) return;
  eraStop && eraStop();
  const eng = s.playerMode !== "driver";
  let txt;
  if (eng) {
    try { const e = engEnsure(); const tn = engTrackName(); e.setup[tn] = Math.min(100, (e.setup[tn] || 0) + 8); } catch (e) {}
    txt = "programa de tandas largas: +8 de conocimiento del circuito para el setup";
  } else {
    s.sessionMiniScore = Math.max(s.sessionMiniScore || 50, 58);
    txt = "programa de ritmo de carrera y gestión de gomas: llegás con mejor ritmo base";
  }
  addLicensePoints(0.5);
  add("⚡ Práctica simulada (" + (s.session === 0 ? "P1" : "P2") + "): " + txt + ". +0.5 pts de licencia (jugando el minijuego ganás más).");
  s.quizDone = true; s.miniStarted = false;
  advanceAfterMini();
  render();
}
(function () {
  const o = window.renderJobArea;
  if (typeof o === "function") window.renderJobArea = function () {
    const r = o.apply(this, arguments);
    try {
      if (s.session < 2 && !s.raceDone && !s.player2 && !s.gameOver) {
        const ja = document.getElementById("jobArea");
        const reserve = s.playerMode === "driver" && tierIndex() === 0 && !s._reserveHasRaced && (s.playedDriverType !== "actual" || s._forceReserve);
        if (ja && !reserve && !s.miniStarted && ja.querySelector("#startMiniBtn, .start-btn") && !ja.querySelector(".rl-sim")) ja.insertAdjacentHTML("afterbegin", `<div class="rl-sim"><span>¿Apurado? Usá un programa rápido de práctica.</span><button class="era-btn dark" onclick="rlSimPractice()">⚡ Simular práctica</button></div>`);
      }
    } catch (e) {}
    return r;
  };
})();

/* ---------- 6) ajustes de realismo (en la tarjeta de ajustes) + empezar desde abajo ---------- */
function rlSet(k, v) { rl()[k] = v; add("🎚️ Realismo: " + ({ adaptive: "IA adaptativa", len: "duración de carrera", damage: "daños y desgaste" })[k] + " → " + (k === "len" ? Math.round(v * 100) + "%" : v ? "activado" : "desactivado") + "."); rlRenderSettings(); }
function rlRenderSettings() {
  const info = document.getElementById("settingsInfo");
  if (!info) return;
  let box = document.getElementById("rlSettings");
  if (!box) { box = document.createElement("div"); box.id = "rlSettings"; box.className = "rl-settings"; info.parentNode.insertBefore(box, info); }
  const R = rl();
  box.innerHTML = `<h3>🎚️ Ajustes de realismo</h3>
    <label class="ng-check"><input type="checkbox" ${R.adaptive ? "checked" : ""} onchange="rlSet('adaptive', this.checked)"> <span><b>IA adaptativa:</b> el resultado depende sobre todo de lo que vale tu auto (con un auto lento vas a sufrir para pasar a Q2).</span></label>
    <label class="small">🏁 Duración de la carrera</label><select onchange="rlSet('len', +this.value)">${[[0.25, "25% (corta)"], [0.5, "50% (media)"], [1, "100% (vueltas reales del circuito)"]].map(o => `<option value="${o[0]}" ${R.len === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>
    <label class="ng-check"><input type="checkbox" ${R.damage ? "checked" : ""} onchange="rlSet('damage', this.checked)"> <span><b>Daños y desgaste realistas:</b> si fallás en clasificación o carrera podés dañar el auto y perder posiciones.</span></label>`;
}
function rlBackmarker() {
  const y = parseInt(document.getElementById("startYear")?.value || "2026", 10);
  const teams = (getTeamsForYear(y) || []).slice().sort((a, b) => a[1] - b[1]);
  const sel = document.getElementById("club");
  if (!teams.length || !sel) return;
  const pick = teams[0][0];
  if ([...sel.options].some(o => o.value === pick)) { sel.value = pick; sel.dispatchEvent(new Event("change")); }
  const n = document.getElementById("rlBackNote"); if (n) n.textContent = "⬇️ Elegiste " + pick + ", el equipo más lento de " + y + ": cada punto va a valer oro.";
}
(function rlInjectBack() {
  const sel = document.getElementById("club");
  if (!sel || document.getElementById("rlBackBtn")) return;
  sel.insertAdjacentHTML("afterend", `<button type="button" id="rlBackBtn" class="era-btn dark rl-back" onclick="rlBackmarker()">⬇️ Empezar desde abajo (equipo más lento)</button><p class="small" id="rlBackNote"></p>`);
})();

/* ---------- 7) 🤝 relación con tu compañero y reconocimiento ---------- */
function rlRel() { if (!s.rlRel || typeof s.rlRel !== "object") s.rlRel = { mate: 60, recog: 30 }; return s.rlRel; }
(function () {
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind, title, sub, cls, grid) {
    try {
      if (s.playerMode === "driver" && !s.player2 && /^CARRERA/.test(String(kind)) && Array.isArray(grid)) {
        const me = grid.find(e => e.mine && e.seat === 1), mate = grid.find(e => e.mine && e.seat === 2);
        if (me && mate && me.pos && mate.pos) {
          const R = rlRel();
          if (me.pos < mate.pos) { R.recog = Math.min(100, R.recog + 3); R.mate = Math.max(0, R.mate - 1); }
          else { R.mate = Math.min(100, R.mate + 1); R.recog = Math.max(0, R.recog - 1); }
          if (me.pos <= 3) R.recog = Math.min(100, R.recog + 3);
        }
      }
    } catch (e) {}
    return sb.apply(this, arguments);
  };
  const ap = window.answerPress;
  if (typeof ap === "function") window.answerPress = function (i, chosen, correct) {
    const already = window.pressAnswers && window.pressAnswers[i];
    const q = document.querySelectorAll("#pressQuestions .press-question h3")[i];
    const r = ap.apply(this, arguments);
    try { if (!already && s.playerMode === "driver" && q && /compañer/i.test(q.textContent)) { const R = rlRel(); R.mate = Math.max(0, Math.min(100, R.mate + (chosen === correct ? 3 : -4))); } } catch (e) {}
    return r;
  };
  const rg = window.rantGo;
  if (typeof rg === "function") window.rantGo = function () { const R = rlRel(); R.mate = Math.max(0, R.mate - 3); return rg.apply(this, arguments); };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const ps = s.season, pg = s.gp;
    const r = ng.apply(this, arguments);
    try {
      if ((s.season !== ps || s.gp !== pg) && s.playerMode === "driver" && !s.player2) {
        const R = rlRel(), L = typeof homeLife === "function" ? homeLife() : null;
        if (L && R.mate < 30) { L.animo = Math.max(0, L.animo - 2); }
        if (L && R.mate >= 70) { L.animo = Math.min(100, L.animo + 1); }
      }
    } catch (e) {}
    return r;
  };
  // ofertas de contrato: el reconocimiento y la relación pesan
  const go = window.generateOffers;
  if (typeof go === "function") window.generateOffers = function () {
    const r = go.apply(this, arguments);
    try {
      if (s.playerMode === "driver" && Array.isArray(s.pendingOffers)) {
        const R = rlRel();
        s.pendingOffers.forEach(o => {
          if (R.recog >= 60) { o.budget = Math.round((o.budget || 0) * 1.2); if (o.seatType === "reserva" && R.recog >= 75) o.seatType = "titular"; }
          if (R.mate < 25) o.demands = (o.demands || "") + " · (en el paddock se sabe que te llevás mal con tu compañero)";
        });
        if (R.recog >= 60) add("🌟 Tu reconocimiento en el paddock (" + R.recog + "/100) mejoró las ofertas que recibiste.");
      }
    } catch (e) {}
    return r;
  };
  const tm = window.ngDrvTeamMax;
  if (typeof tm === "function") window.ngDrvTeamMax = function () { const R = rlRel(); let v = tm.apply(this, arguments); if (R.mate < 30) v *= 0.9; if (R.recog >= 60) v *= 1.1; return Math.round(v * 10) / 10; };
})();
function rlRelCardHtml() {
  const R = rlRel();
  const bar = (v, c) => `<div class="home-bar"><i style="width:${Math.round(v)}%;background:${c}"></i></div>`;
  const moodTxt = R.mate >= 70 ? "😊 Se llevan muy bien: el box trabaja tranquilo" : R.mate >= 40 ? "🙂 Relación profesional" : R.mate >= 25 ? "😐 Hay tensión en el box" : "😠 Guerra interna: te baja el ánimo";
  let mateName = "tu compañero";
  try { const l = myTeamLineup(); const m = l.find(d => d.name !== s.playedDriverName); if (m) mateName = m.name; } catch (e) {}
  return `<h2>🤝 Relaciones en el paddock</h2>
    <div class="home-grid"><div>🤝 Relación con ${engEsc(mateName)} <b>${Math.round(R.mate)}</b>${bar(R.mate, "#22c55e")}<span class="small">${moodTxt}</span></div>
      <div>🌟 Reconocimiento <b>${Math.round(R.recog)}</b>${bar(R.recog, "#facc15")}<span class="small">${R.recog >= 60 ? "Los equipos grandes te miran: mejores ofertas" : "Ganale a tu compañero y hacé podios para que te reconozcan"}</span></div></div>
    <p class="small">Ganarle a tu compañero sube tu reconocimiento pero tensa la relación. Contestar bien las preguntas sobre él en la prensa la mejora; explotar contra los medios la empeora. La relación afecta tu ánimo, y el reconocimiento, las ofertas y tu sueldo.</p>`;
}
(function () {
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try {
      rlRenderSettings();
      let card = document.getElementById("rlRelCard");
      const g = document.getElementById("game");
      const on = s.playerMode === "driver" && !s.player2 && !!g && !g.classList.contains("hidden");
      if (!card && on) {
        const anchor = document.getElementById("homeCard") || document.getElementById("jobCard");
        if (anchor && anchor.parentNode) { card = document.createElement("div"); card.id = "rlRelCard"; card.className = "card"; anchor.parentNode.insertBefore(card, anchor.nextSibling); }
      }
      if (card) { card.classList.toggle("hidden", !on); if (on) card.innerHTML = rlRelCardHtml(); }
    } catch (e) { console.warn(e); }
    return x;
  };
})();

/* ---------- 8) 🏁 vuelta real con técnica: frenada recta + ERS en rectas ---------- */
/* potencia extra en la recta según la época: ERS (2014+), KERS (2009, 2011–2013) o rebufo */
function rlPower(y) {
  y = y || s.season || 2026;
  if (y >= 2026) return { k: "MGU-K", ic: "⚡", name: "ERS (modo adelantamiento)", drain: 40, gain: 0.13, corner: "¡Desplegaste la batería en curva! Patinaste", short: "ERS" };
  if (y >= 2014) return { k: "ERS", ic: "⚡", name: "ERS", drain: 45, gain: 0.12, corner: "¡ERS en curva! Patinaste", short: "ERS" };
  if (y === 2009 || (y >= 2011 && y <= 2013)) return { k: "KERS", ic: "🔋", name: "KERS (6,7 s por vuelta)", drain: 70, gain: 0.10, corner: "¡KERS en curva! Se te fue la cola", short: "KERS" };
  return { k: "REBUFO", ic: "🌀", name: "Rebufo", drain: 55, gain: 0.08, corner: "¡Te pegaste al de adelante en curva! Perdiste carga aerodinámica", short: "rebufo" };
}
/* frenos según la época: los de acero (antes de los 80) frenan antes y más largo */
function rlBrakes(y) { y = y || s.season || 2026; return y < 1980 ? { v: 0.82, w: 1.25, note: "Frenos de acero: frená antes y más largo." } : y < 1995 ? { v: 0.9, w: 1.1, note: "Frenos de carbono primitivos: cuidado con bloquear." } : { v: 1, w: 1, note: "" }; }
window.emLap = function () {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  const tr = trackData[s.gp] || { name: "Australia", record: "1:25.000" };
  const names = (typeof EM_CORNERS !== "undefined" && EM_CORNERS[tr.name]) || ["Curva 1", "Curva 2", "Curva 3", "Curva 4"];
  const PW = rlPower(), BK = rlBrakes();
  const NS = 3; // como en la F1 real: 3 sectores, una curva clave por sector
  E.c = 0; E.ph = 0; E.p = 0; E.loss = []; E.cur = 0; E.wait = 0; E.ers = 100; E.ersOn = false; E.brakeOn = false; E.ersGain = 0;
  E.base = emParseLap(tr.record) + 0.45;
  E.pole = E.base - 0.05 + emRand(60) * 0.25;
  E.corners = [names[0], names[Math.min(1, names.length - 1)], names[names.length - 1]].slice(0, NS).map((n, i) => { const b = 34 + emRand(i + 61) * 10; const slow = /Horquilla|Hairpin|Loews|Sainte|Chicane|Variante|Source|Bus/.test(n); return { n, b, a: b + (slow ? 22 : 26), e: b + (slow ? 42 : 46), v: (slow ? 50 : 62) * sp * BK.v }; });
  const w = 9 / sp * BK.w;
  st.innerHTML = `<div class="era-stat"><span>📍 <b id="eCn"></b></span><span>Sectores: <span id="eSec"></span></span></div>
    <div class="em-lapbar" id="eBar"><div class="z s" id="eZs">RECTA · ${PW.k}</div><div class="z b" id="eZb">FRENO</div><div class="z a" id="eZa">SOLTÁ</div><div class="z e" id="eZe">GAS</div><div class="gn" id="eN"></div></div>
    <div class="era-batt"><i id="eErs" style="width:100%;background:#38bdf8"></i></div>
    <div class="em-phase" id="ePh"></div>
    <div class="era-row"><button class="era-btn cool" id="eErsB">${PW.ic} ${PW.k} (mantener)</button><button class="era-btn hot" id="eGo">🛑 FRENO (mantener)</button></div>
    <div class="em-timing" id="eTime">⏱️ Vuelta en curso… <span class="small">Frená con el volante recto y soltá de a poco hasta el vértice. ${PW.name}: solo en la recta.${BK.note ? " " + BK.note : ""}</span></div>`;
  const zone = ph => { const C = E.corners[E.c]; return ph === 0 ? C.b : ph === 1 ? C.a : C.e; };
  const setLbl = t => { const b = document.getElementById("eGo"); if (b) b.textContent = t; };
  const setup = () => {
    const C = E.corners[E.c];
    document.getElementById("eCn").textContent = "Sector " + (E.c + 1) + "/3 · " + C.n;
    const zs = document.getElementById("eZs"); zs.style.left = "0%"; zs.style.width = (C.b - w / 2 - 2) + "%";
    [["eZb", C.b], ["eZa", C.a], ["eZe", C.e]].forEach(([id, x]) => { const z = document.getElementById(id); z.style.left = (x - w / 2) + "%"; z.style.width = w + "%"; z.classList.remove("hit", "miss"); });
    E.p = 0; E.ph = 0; E.cur = 0; E.brakeOn = false;
    setLbl("🛑 FRENO (mantener)");
    delete document.getElementById("ePh").dataset.pw;
    document.getElementById("ePh").textContent = "Recta: usá el " + PW.short + " y esperá el punto de frenada…";
  };
  const mark = (ok, id) => { const z = document.getElementById(id); if (z) z.classList.add(ok ? "hit" : "miss"); };
  const score = (ph, auto) => {
    const center = zone(ph), d = E.p - center, ad = Math.abs(d);
    let pen, txt;
    const T = [
      ["Frenada en línea recta, perfecta", "Frenaste temprano", "¡Bloqueaste! Frenaste tarde, ya girando", "¡No frenaste! Te pasaste de largo"],
      ["Soltaste el freno progresivo justo en el vértice", "Soltaste el freno muy temprano: te fuiste ancho", "Seguiste frenando en plena curva: subviraje", "Nunca soltaste el freno"],
      ["Tracción perfecta a la salida", "Aceleraste temprano: patinó la trasera", "Aceleraste tarde: perdiste velocidad", "No aceleraste a tiempo"]
    ][ph];
    if (auto) { pen = 0.45; txt = T[3]; }
    else if (ad <= w / 2) { pen = ad / (w / 2) * 0.05; txt = T[0]; }
    else if (d < 0) { pen = Math.min(0.35, 0.08 + (ad - w / 2) * 0.012); txt = T[1]; }
    else { pen = Math.min(0.5, 0.12 + (ad - w / 2) * 0.018); txt = T[2]; }
    E.cur += pen;
    mark(pen < 0.1, ["eZb", "eZa", "eZe"][ph]);
    document.getElementById("ePh").innerHTML = (pen < 0.1 ? "✅ " : "⚠️ ") + txt + (pen >= 0.01 ? ` <b>(+${pen.toFixed(2)}s)</b>` : "");
    try { if (pen < 0.1) FWAudio.click(); } catch (e) {}
    E.ph++;
    if (E.ph === 1) setLbl("↪️ SOLTÁ EN EL VÉRTICE");
    if (E.ph === 2) setLbl("🦶 ACELERAR");
    if (E.ph >= 3) finishCorner();
  };
  const finishCorner = () => {
    E.loss.push(E.cur);
    const col = E.cur < 0.08 ? "p" : E.cur < 0.25 ? "g" : "y";
    document.getElementById("eSec").innerHTML += `<span class="em-sec ${col}">S${E.c + 1}</span>`;
    E.c++; E.wait = 0.8; E.brakeOn = false;
    if (E.c >= NS) {
      const lap = E.base + E.loss.reduce((a, b) => a + b, 0) - E.ersGain;
      const gap = lap - E.pole;
      E.acc = Math.max(0, Math.min(1, 1 - gap / 1.2));
      window.__emLapAcc = E.acc;
      document.getElementById("eTime").innerHTML = `⏱️ <b>${emFmtLap(lap)}</b> · Pole: ${emFmtLap(E.pole)} · <b style="color:${gap <= 0 ? "#a855f7" : gap < 0.4 ? "#22c55e" : "#facc15"}">${gap <= 0 ? "−" + Math.abs(gap).toFixed(3) + " ¡VUELTA MÁS RÁPIDA!" : "+" + gap.toFixed(3)}</b> <span class="small">(${PW.k}: −${E.ersGain.toFixed(2)}s)</span>`;
      eraEnd(gap < 0.35, gap <= 0 ? "¡Pole provisoria! Frenadas, vértices y " + PW.short + " perfectos." : gap < 0.35 ? "Gran vuelta: a " + gap.toFixed(3) + " de la pole." : "Vuelta lenta: " + gap.toFixed(3) + " de la pole. Frená recto, soltá en el vértice y usá el " + PW.short + " en las rectas.");
    }
  };
  const go = document.getElementById("eGo"), eb = document.getElementById("eErsB");
  const down = ev => { ev && ev.preventDefault && ev.preventDefault(); if (!eraAlive(E.id) || E.wait > 0) return; if (E.ph === 0) { E.brakeOn = true; score(0, false); } else if (E.ph === 2) score(2, false); };
  const up = ev => { ev && ev.preventDefault && ev.preventDefault(); if (!eraAlive(E.id) || !E.brakeOn) return; E.brakeOn = false; if (E.ph === 1) score(1, false); };
  go.addEventListener("pointerdown", down);
  ["pointerup", "pointerleave", "pointercancel"].forEach(t => go.addEventListener(t, up));
  eraHold(eb, () => (E.ersOn = true), () => (E.ersOn = false));
  const key = ev => { if (!eraAlive(E.id)) { document.removeEventListener("keydown", key); document.removeEventListener("keyup", key); return; } if (ev.code === "Space") { ev.preventDefault(); if (ev.type === "keydown" && !ev.repeat) down(); if (ev.type === "keyup") up(); } if (ev.key === "e" || ev.key === "E") E.ersOn = ev.type === "keydown"; };
  document.addEventListener("keydown", key); document.addEventListener("keyup", key);
  E.tapDown = down; E.tapUp = up;
  setup();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < NS) setup(); return; }
    const C = E.corners[E.c];
    E.p += dt * C.v * (E.ph === 0 ? 1 : 0.8);
    // ERS: suma en la recta, castiga en la curva
    if (E.ersOn && E.ers > 0) {
      E.ers = Math.max(0, E.ers - dt * PW.drain);
      if (E.ph === 0 && E.p < C.b - w / 2) E.ersGain += dt * PW.gain;
      else { E.cur += dt * 0.25; const ph = document.getElementById("ePh"); if (ph && !ph.dataset.pw) { ph.dataset.pw = 1; ph.innerHTML = "⚠️ " + PW.corner + " <b>(+tiempo)</b>"; } }
    }
    const be = document.getElementById("eErs"); if (be) be.style.width = E.ers + "%";
    const n = document.getElementById("eN"); if (n) n.style.left = Math.min(100, E.p) + "%";
    if (E.ph === 0 && E.p > C.b + w / 2 + 6) score(0, true);
    else if (E.ph === 1 && E.p > C.a + w / 2 + 6) { E.brakeOn = false; score(1, true); }
    else if (E.ph === 2 && E.p > C.e + w / 2 + 6) score(2, true);
  });
};
