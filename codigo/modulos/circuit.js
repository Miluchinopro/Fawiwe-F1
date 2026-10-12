/* =====================================================================================
   FAWIWE · DESAFÍOS DE CIRCUITO (Modo Piloto)
   Cada uno de los 10 circuitos tiene su propio minijuego, inspirado en lo que hace famosa
   a esa pista. Salen en las prácticas y, a veces, como la decisión de la carrera.
   Usa el mismo motor que "Manejo de época" (era.js): ERA, eraLoop, eraEnd, eraMsg, eraHold.
   ===================================================================================== */
/* Cada circuito tiene un PATRÓN DE 5 desafíos. Cada sesión del fin de semana usa uno distinto
   (Práctica 1, Práctica 2, Carrera) y cada temporada el patrón avanza un lugar, así que en
   5 temporadas ves los 5. El 5º siempre es el manejo de la época en la que estás. */
const TRK_HOW = {
  trkGap: "Se abre un hueco (verde) en uno de los 3 carriles: tocá ese carril antes de que se cierre. 5 huecos, acertá 4.",
  trkEsses: "Las flechas llegan a la línea blanca: tocá <b>◀</b> o <b>▶</b> justo cuando pasan. Acertá 6 de 8.",
  trkSlip: "Pegate atrás del rival para chuparte el rebufo: mantené <b>◀</b> o <b>▶</b> para quedar alineado. Llená la barra antes de que termine la recta.",
  trkDodge: "Esquivá los obstáculos cambiando de carril con <b>◀</b> y <b>▶</b>. Aguantá hasta el final tocando como mucho 1.",
  trkTemp: "Mantené <b>ACELERAR</b> para avanzar rápido, pero la temperatura del neumático sube. Soltá para enfriar. Llegá a la meta sin pasarte mucho rato en rojo.",
  trkWall: "Llegás a fondo. Tocá <b>FRENAR</b> para que el auto se detenga en la zona verde, antes del muro. Sin ayudas. 2 de 3.",
  trkWet: "La pista se moja y se seca: <b>SECO</b> con pista seca, <b>INTER</b> con pista húmeda y <b>LLUVIA</b> con charcos. Precisión mínima: 70%.",
  trkBand: "Mantené apretado para subir la velocidad y soltá para bajarla. Seguí la zona verde, que se mueve. Precisión mínima: 70%.",
  trkSimon: "Mirá en qué orden se iluminan las curvas y repetilo. 3 rondas (3, 4 y 5 curvas). Podés equivocarte una vez.",
  trkDrs: "En cada zona de detección abrí el <b>DRS</b> SOLO si estás a menos de 1.0s del rival. Si estás más lejos, no lo toques. 2 de 3.",
  trkPit: "Tocá la rueda que se ilumina tantas veces como pide, las 4, lo más rápido posible. Si tocás la equivocada perdés tiempo. Tenés que bajar del tiempo objetivo.",
  trkLaunch: "Mantené <b>ACELERAR</b> para dejar las vueltas del motor en la zona verde y tocá <b>¡LARGAR!</b> apenas se dé la señal. Si salís antes, es salida en falso. 2 de 3.",
  trkSide: "El rival se cierra para un lado: atacalo por el OTRO con <b>◀</b> o <b>▶</b> antes de que reaccione. 5 curvas, acertá 4."
};
const FW_TRACK_MINI = {
  "Australia": { icon: "🐨", v: [["trkGap", "Curva 1: buscá el hueco"], ["trkLaunch", "Largada en Albert Park"], ["trkWall", "Frenada de la Curva 3"], ["trkSide", "Ataque en la Curva 11"], ["era", "en el parque de Melbourne"]] },
  "Japón": { icon: "🗻", v: [["trkEsses", "Las eses de Suzuka"], ["trkBand", "La 130R a fondo"], ["trkWet", "Tifón en Suzuka"], ["trkSide", "Pelea en la chicana Casio"], ["era", "en Suzuka"]] },
  "Italia": { icon: "🍝", v: [["trkSlip", "Rebufo en Monza"], ["trkDrs", "DRS en la recta principal"], ["trkWall", "Frenada de la Variante"], ["trkBand", "La Parabólica"], ["era", "en el Templo de la Velocidad"]] },
  "Mónaco": { icon: "🎰", v: [["trkDodge", "Entre los guardarraíles"], ["trkSimon", "De memoria por las calles"], ["trkPit", "Boxes en la calle más angosta"], ["trkSide", "Defensa en Mirabeau"], ["era", "por el puerto de Mónaco"]] },
  "España": { icon: "🌞", v: [["trkTemp", "Cuidá las gomas en Montmeló"], ["trkPit", "Estrategia a 3 paradas"], ["trkLaunch", "La recta de largada más larga"], ["trkSide", "Ataque en la Curva 1"], ["era", "en Montmeló"]] },
  "Canadá": { icon: "🍁", v: [["trkWall", "El Muro de los Campeones"], ["trkDodge", "¡Marmotas en la pista!"], ["trkWet", "La carrera de 4 horas bajo la lluvia"], ["trkDrs", "DRS en la recta del casino"], ["era", "en la isla Notre-Dame"]] },
  "Gran Bretaña": { icon: "☔", v: [["trkWet", "Lluvia inglesa en Silverstone"], ["trkEsses", "Maggotts y Becketts"], ["trkBand", "Copse a fondo"], ["trkPit", "Parada en el Wing"], ["era", "en el aeródromo de Silverstone"]] },
  "Bélgica": { icon: "🌲", v: [["trkBand", "Eau Rouge a fondo"], ["trkWet", "Llueve en un sector y en otro no"], ["trkSlip", "Rebufo en la Kemmel"], ["trkLaunch", "Largada hacia La Source"], ["era", "en las Ardenas"]] },
  "Singapur": { icon: "🌃", v: [["trkSimon", "Memoria nocturna"], ["trkDodge", "Las paredes de Marina Bay"], ["trkTemp", "Calor y humedad: cuidá las gomas"], ["trkPit", "Safety Car: ¡a boxes!"], ["era", "bajo las luces de Singapur"]] },
  "Abu Dhabi": { icon: "🌙", v: [["trkDrs", "DRS por el título"], ["trkLaunch", "Largada de la final"], ["trkSide", "Ataque en la Curva 9"], ["trkTemp", "Gomas en el calor del desierto"], ["era", "en la final de Yas Marina"]] }
};
const TRK_ERA_FN = { clutch: "eraClutch", slide: "eraSlide", ground: "eraGround", turbo: "eraTurbo", fuel: "eraFuel", kers: "eraKers", aero: "eraAero" };
function trkSlot() { return s.session === 0 ? 0 : s.session === 1 ? 1 : s.session >= 3 ? 2 : 3; }
function trkPatternIdx() { return ((parseInt(s.season, 10) || 2026) + trkSlot()) % 5; }
function trkDefFor(idx) {
  const T = FW_TRACK_MINI[trkName()] || FW_TRACK_MINI["Australia"];
  const y = parseInt(s.season, 10) || 2026;
  let [fn, title] = T.v[idx];
  let note = "";
  if (fn === "era") {
    const g = FW_ERA_MINI[fwEraIdx(y)];
    return { icon: T.icon, fn: TRK_ERA_FN[g.id], title: "Época " + y + ": " + g.title + " " + title, how: g.how, idx, era: true };
  }
  if (fn === "trkDrs" && y < 2011) { fn = "trkSlip"; title = title.replace("DRS", "Rebufo"); note = "En " + y + " todavía no existía el DRS: se pasaba con el rebufo."; }
  if (fn === "trkDrs" && y >= 2026) { title = title.replace("DRS", "Modo adelantamiento"); note = "Desde " + 2026 + " ya no hay DRS: a menos de 1s del rival se activa el modo adelantamiento (más energía eléctrica)."; }
  if (fn === "trkWet" && y < 1990) note = "En " + y + " la goma intermedia casi no se usaba: cambiar a tiempo era todo un arte.";
  if (fn === "trkPit") note = trkPitNote(y);
  if (fn === "trkLaunch" && y < 1971) note = "En " + y + " no había semáforo: se largaba cuando el comisario bajaba la bandera.";
  return { icon: T.icon, fn, title, how: (fn === "trkDrs" && y >= 2026 ? TRK_HOW[fn].replace(/DRS/g, "modo adelantamiento").replace("abrí el", "activá el") : TRK_HOW[fn]) + (note ? `<br><span class="small">🕰️ ${note}</span>` : ""), idx };
}
function trkDef() { return trkDefFor(trkPatternIdx()); }
function trkPatternHtml() {
  const T = FW_TRACK_MINI[trkName()] || FW_TRACK_MINI["Australia"];
  const cur = trkPatternIdx();
  return `<div class="trk-pattern"><span class="small">Patrón de ${engEsc(trkName())} (cambia cada temporada):</span>${T.v.map((v, i) => { const d = trkDefFor(i); return `<span class="${i === cur ? "on" : ""}" title="${engEsc(d.title)}">${i + 1}. ${engEsc(d.title.length > 28 ? d.title.slice(0, 26) + "…" : d.title)}</span>`; }).join("")}</div>`;
}
function trkPitNote(y) {
  return y < 1960 ? "Años 50: ruedas con tuerca central a martillazos, cada rueda necesita varios golpes."
    : y < 1994 ? "Sin pistolas modernas: cada rueda lleva más trabajo."
    : y < 2010 ? "Con reabastecimiento: la parada es más larga."
    : "Pistolas neumáticas: paradas de 2 segundos.";
}
function trkName() { return (typeof trackData !== "undefined" && trackData[s.gp]) ? trackData[s.gp].name : "Australia"; }
function trkRand(k) { return (fwHash("trk" + s.gp + "_" + s.session + "_" + s.season + "_" + k) % 1000) / 1000; }

function renderTrackTask(stepHead, turnLabel, onDone) {
  eraStop();
  const d = trkDef();
  const jobArea = document.getElementById("jobArea");
  if (!jobArea) return;
  window.__trkDone = onDone || null;
  jobArea.innerHTML = (stepHead || "") + `
    <div class="era-mini">
      <div class="mini-explain"><div class="era-head"><div class="era-svg">${fwCarSvg(fwEra(s.season).y, eraColor())}</div><div><b>${d.icon} Desafío del circuito · ${engEsc(trkName())} ${s.season}${turnLabel || ""}</b><br><span style="font-size:18px;font-weight:900">${engEsc(d.title)}</span></div></div>
      <p style="margin:8px 0 0">${d.how}</p>${trkPatternHtml()}</div>
      <div class="era-stage" id="eraStage"><p class="small" style="text-align:center;margin:30px 0">Desafío ${d.idx + 1} de 5 de este circuito. Tocá ARRANCAR cuando estés listo.</p></div>
      <div class="era-msg" id="eraMsg"></div>
      <button class="start-btn" id="startMiniBtn" onclick="trkStart()">▶ ARRANCAR</button>
    </div>`;
}
function trkStart() {
  if (ERA) return;
  if (typeof eraShowControls === "function") eraShowControls();
  const d = trkDef();
  const btn = document.getElementById("startMiniBtn");
  if (btn) btn.style.display = "none";
  s.miniStarted = true;
  ERA = { id: d.fn + "_" + Date.now(), kind: d.fn, timers: [], key: "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer, done: window.__trkDone || null };
  eraMsg("");
  window[d.fn]();
}
const trkBtns = (arr) => `<div class="era-row">${arr.map(([id, label, cls]) => `<button class="${cls || "dark"}" id="${id}">${label}</button>`).join("")}</div>`;
const trkTimer = (E) => { const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.limit - E.t).toFixed(1) + "s"; };

/* Australia · el hueco */
function trkGap() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Hueco <b id="eC">1</b>/5</span><span>Aciertos: <b id="eW">0</b></span></div>
    <div class="trk-lanes">${[0, 1, 2].map(i => `<div class="trk-lane" id="eL${i}"></div>`).join("")}</div>
    <div class="era-dots" id="eDots">${"<span></span>".repeat(5)}</div>
    ${trkBtns([["eB0", "◀ IZQ"], ["eB1", "▲ CENTRO"], ["eB2", "DER ▶"]])}`;
  const E = ERA, sp = eraSpeed();
  E.r = 0; E.wins = 0; E.open = -1; E.t = 0; E.next = 0.8; E.win = 0.95 / sp;
  const res = ok => {
    const d = document.querySelectorAll("#eDots span")[E.r]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    document.getElementById("eW").textContent = E.wins;
    [0, 1, 2].forEach(i => document.getElementById("eL" + i).className = "trk-lane");
    E.open = -1; E.r++; E.next = E.t + 0.55 + trkRand(E.r) * 0.6;
    if (E.r >= 5) eraEnd(E.wins >= 4, E.wins + " de 5 huecos: " + (E.wins >= 4 ? "¡ganaste lugares en " + trkName() + "!" : "te encerraron en la largada."));
    else document.getElementById("eC").textContent = E.r + 1;
  };
  [0, 1, 2].forEach(i => document.getElementById("eB" + i).onclick = () => {
    if (!eraAlive(E.id) || E.open < 0) return;
    eraMsg(i === E.open ? "👌 ¡Adentro!" : "⚠️ Ese carril estaba cerrado.");
    res(i === E.open);
  });
  eraLoop(dt => {
    E.t += dt;
    if (E.open < 0 && E.t >= E.next && E.r < 5) {
      E.open = Math.floor(trkRand(E.r + 10) * 3); E.closeAt = E.t + E.win;
      [0, 1, 2].forEach(i => document.getElementById("eL" + i).className = "trk-lane " + (i === E.open ? "open" : "shut"));
    } else if (E.open >= 0 && E.t >= E.closeAt) { eraMsg("⚠️ Se cerró el hueco."); res(false); }
  });
}

/* Japón · las eses (ritmo) */
function trkEsses() {
  const st = document.getElementById("eraStage");
  const N = 8, sp = eraSpeed(), gapT = 0.62 / sp, pxs = 260;
  const notes = Array.from({ length: N }, (_, i) => ({ t: 1.2 + i * gapT, d: (i + Math.floor(trkRand(i) * 2)) % 2 ? "R" : "L", hit: null }));
  st.innerHTML = `<div class="era-stat"><span>Aciertos: <b id="eW">0</b>/${N}</span><span>Errores: <b id="eX">0</b></span></div>
    <div class="trk-rhythm" id="eRh"><div class="hitline"></div>${notes.map((n, i) => `<div class="note ${n.d}" id="eN${i}">${n.d === "L" ? "◀" : "▶"}</div>`).join("")}</div>
    ${trkBtns([["eBL", "◀ IZQUIERDA", "era-btn cool"], ["eBR", "DERECHA ▶", "era-btn hot"]])}`;
  const E = ERA;
  E.t = 0; E.w = 0; E.x = 0; E.notes = notes;
  const WIN = 0.2;
  const press = d => {
    if (!eraAlive(E.id)) return;
    const n = notes.find(n => n.hit === null && Math.abs(n.t - E.t) <= WIN);
    if (n && n.d === d) { n.hit = true; E.w++; eraMsg("👌 ¡Justo!"); const el = document.getElementById("eN" + notes.indexOf(n)); if (el) el.classList.add("ok"); }
    else { E.x++; if (n) { n.hit = false; const el = document.getElementById("eN" + notes.indexOf(n)); if (el) el.classList.add("bad"); } eraMsg("⚠️ " + (n ? "¡Para el otro lado!" : "Muy temprano o muy tarde.")); }
    document.getElementById("eW").textContent = E.w; document.getElementById("eX").textContent = E.x;
  };
  document.getElementById("eBL").onclick = () => press("L");
  document.getElementById("eBR").onclick = () => press("R");
  const key = ev => { if (!eraAlive(E.id)) return document.removeEventListener("keydown", key); if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") ev.preventDefault(); if (ev.key === "ArrowLeft") press("L"); if (ev.key === "ArrowRight") press("R"); };
  document.addEventListener("keydown", key);
  eraLoop(dt => {
    E.t += dt;
    const rh = document.getElementById("eRh"); const W = rh ? rh.clientWidth : 300;
    notes.forEach((n, i) => {
      const el = document.getElementById("eN" + i); if (!el) return;
      el.style.left = (W * 0.18 + (n.t - E.t) * pxs) + "px";
      if (n.hit === null && E.t - n.t > WIN) { n.hit = false; el.classList.add("bad"); }
    });
    if (E.t > notes[N - 1].t + 0.5) eraEnd(E.w >= 6, E.w + " de " + N + " eses " + (E.w >= 6 ? "— ¡fluiste curva tras curva!" : "— perdiste el ritmo."));
  });
}

/* Italia · rebufo */
function trkSlip() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Rebufo</span><span>⏱️ <b id="eT"></b></span></div>
    <div class="era-batt" style="height:14px"><i id="eF" style="width:0%;background:#38bdf8"></i></div>
    <div class="trk-road" id="eRd"><div class="trk-car rival" id="eRv"></div><div class="trk-cone" id="eCone"></div><div class="trk-car me" id="eMe"></div></div>
    ${trkBtns([["eL", "◀ IZQUIERDA"], ["eR", "DERECHA ▶"]])}`;
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 9; E.me = 0.5; E.rv = 0.5; E.f = 0; E.dir = 0;
  document.getElementById("eMe").style.background = eraColor();
  eraHold(document.getElementById("eL"), () => (E.dir = -1), () => { if (E.dir < 0) E.dir = 0; });
  eraHold(document.getElementById("eR"), () => (E.dir = 1), () => { if (E.dir > 0) E.dir = 0; });
  eraLoop(dt => {
    E.t += dt;
    E.rv = 0.5 + Math.sin(E.t * 1.3 * sp) * 0.28 + Math.sin(E.t * 2.9 * sp + 1) * 0.1;
    E.me = Math.max(0.06, Math.min(0.94, E.me + E.dir * dt * 0.75));
    const close = Math.abs(E.me - E.rv) < 0.09;
    E.f = Math.max(0, Math.min(100, E.f + (close ? 24 : -7) * dt));
    const set = (id, x) => { const el = document.getElementById(id); if (el) el.style.left = (x * 100) + "%"; };
    set("eMe", E.me); set("eRv", E.rv); set("eCone", E.rv);
    const c = document.getElementById("eCone"); if (c) c.style.opacity = close ? 1 : 0.35;
    const f = document.getElementById("eF"); if (f) f.style.width = E.f + "%";
    trkTimer(E);
    if (E.f >= 100) return eraEnd(true, "¡Rebufo completo! Lo pasaste en la frenada.");
    if (E.t >= E.limit) eraEnd(false, "Te quedaste sin recta: rebufo al " + Math.round(E.f) + "%.");
  });
}

/* Mónaco · guardarraíles */
function trkDodge() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Toques: <b id="eX">0</b>/1</span><span>⏱️ <b id="eT"></b></span></div>
    <div class="trk-road tall" id="eRd"><div class="trk-car me" id="eMe"></div></div>
    ${trkBtns([["eL", "◀ IZQUIERDA"], ["eR", "DERECHA ▶"]])}`;
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 9; E.lane = 1; E.obs = []; E.next = 0.6; E.hits = 0; E.n = 0;
  const me = document.getElementById("eMe"); me.style.background = eraColor();
  const lx = l => (l * 33.33 + 16.66) + "%";
  const move = d => { E.lane = Math.max(0, Math.min(2, E.lane + d)); me.style.left = lx(E.lane); };
  move(0);
  document.getElementById("eL").onclick = () => move(-1);
  document.getElementById("eR").onclick = () => move(1);
  const key = ev => { if (!eraAlive(E.id)) return document.removeEventListener("keydown", key); if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") ev.preventDefault(); if (ev.key === "ArrowLeft") move(-1); if (ev.key === "ArrowRight") move(1); };
  document.addEventListener("keydown", key);
  const rd = document.getElementById("eRd");
  eraLoop(dt => {
    E.t += dt;
    if (E.t >= E.next && E.t < E.limit - 1.2) {
      const free = Math.floor(trkRand(E.n) * 3);
      const lanes = [0, 1, 2].filter(l => l !== free && (trkRand(E.n + 50) < 0.55 || l === (free + 1) % 3));
      lanes.forEach(l => { const el = document.createElement("div"); el.className = "trk-obs"; el.textContent = trkRand(E.n + l) < 0.5 ? "🚧" : "⚠️"; el.style.left = lx(l); rd.appendChild(el); E.obs.push({ l, y: -10, el, done: false }); });
      E.n++; E.next = E.t + 0.85 / sp;
    }
    E.obs.forEach(o => {
      o.y += dt * 95 * sp; o.el.style.top = o.y + "%";
      if (!o.done && o.y > 72 && o.y < 92) { if (o.l === E.lane) { o.done = true; E.hits++; o.el.classList.add("hit"); document.getElementById("eX").textContent = E.hits; eraMsg("💥 ¡Tocaste el guardarraíl!"); } }
      if (o.y > 92) o.done = true;
    });
    trkTimer(E);
    if (E.hits > 1) return eraEnd(false, "Demasiados toques: auto al box con la suspensión rota.");
    if (E.t >= E.limit) eraEnd(true, E.hits ? "Un rasguño nomás… ¡pero llegaste entero!" : "¡Vuelta perfecta en " + trkName() + "!");
  });
}

/* España · temperatura de gomas */
function trkTemp() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Distancia</span><span>⏱️ <b id="eT"></b></span></div>
    <div class="era-gauge"><div class="gf" id="eD" style="width:0;background:linear-gradient(90deg,#22c55e,#16a34a)"></div></div>
    <div class="era-stat" style="margin-top:10px"><span>🌡️ Temperatura del neumático</span><span>En rojo: <b id="eR">0.0</b>s / 1.5s</span></div>
    <div class="era-gauge"><div class="gz" style="left:45%;width:30%"></div><div class="gr" style="width:25%"></div><div class="gn" id="eN"></div></div>
    ${trkBtns([["eGas", "🦶 ACELERAR (mantener)", "era-btn hot"]])}`;
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 10; E.d = 0; E.temp = 40; E.red = 0; E.hold = false;
  eraHold(document.getElementById("eGas"), () => (E.hold = true), () => (E.hold = false));
  eraLoop(dt => {
    E.t += dt;
    E.temp = Math.max(20, Math.min(100, E.temp + (E.hold ? 30 * sp : -30) * dt));
    E.d += dt * (E.hold ? 18 : 6) * (E.temp > 75 ? 0.7 : 1);
    if (E.temp > 75) E.red += dt;
    const n = document.getElementById("eN"); if (n) n.style.left = E.temp + "%";
    const d = document.getElementById("eD"); if (d) d.style.width = Math.min(100, E.d) + "%";
    const r = document.getElementById("eR"); if (r) r.textContent = E.red.toFixed(1);
    trkTimer(E);
    if (E.red >= 1.5) return eraEnd(false, "Neumático ampollado: sobrecalentaste las gomas.");
    if (E.d >= 100) return eraEnd(true, "¡Llegaste con las gomas enteras y buen ritmo!");
    if (E.t >= E.limit) eraEnd(false, "Muy lento: cuidaste tanto las gomas que perdiste la tanda.");
  });
}

/* Canadá · muro de los campeones */
function trkWall() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Intento <b id="eC">1</b>/3</span><span id="eRes"></span></div>
    <div class="era-gauge trk-wall"><div class="gz" id="eZ"></div><div class="wall">MURO</div><div class="gn" id="eN"></div></div>
    <div class="era-dots" id="eDots"><span></span><span></span><span></span></div>
    ${trkBtns([["eB", "🛑 FRENAR", "era-btn hot"]])}`;
  const E = ERA, sp = eraSpeed();
  E.c = 0; E.wins = 0; E.wait = 0;
  const v0 = 62 * sp;
  function reset() {
    E.p = 0; E.v = v0; E.braking = false;
    E.zone = 74 + trkRand(E.c) * 10; E.zw = 7;
    const z = document.getElementById("eZ"); z.style.left = E.zone + "%"; z.style.width = E.zw + "%";
    document.getElementById("eC").textContent = E.c + 1;
  }
  function result(ok, txt) {
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    eraMsg((ok ? "👌 " : "💥 ") + txt);
    E.c++; E.wait = 1;
    if (E.c >= 3) eraEnd(E.wins >= 2, E.wins + " de 3 frenadas perfectas.");
  }
  document.getElementById("eB").onclick = () => { if (eraAlive(E.id) && !E.braking && E.wait <= 0) E.braking = true; };
  reset();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < 3) reset(); return; }
    if (E.braking) E.v = Math.max(0, E.v - 150 * sp * dt);
    E.p += E.v * dt;
    const n = document.getElementById("eN"); if (n) n.style.left = Math.min(100, E.p) + "%";
    if (E.p >= 94) { E.v = 0; return result(false, "¡Te pasaste y terminaste en el muro!"); }
    if (E.braking && E.v <= 0) {
      const ok = E.p >= E.zone && E.p <= E.zone + E.zw;
      result(ok, ok ? "Clavado antes del muro." : "Frenaste muy temprano: perdiste tiempo.");
    }
  });
}

/* Gran Bretaña · lluvia */
function trkWet() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>💧 Pista: <b id="eS">seca</b></span><span>Precisión: <b id="eAcc">—</b> · ⏱️ <b id="eT"></b></span></div>
    <div class="era-gauge trk-wetbar"><div class="gn" id="eN"></div></div>
    ${trkBtns([["eS0", "☀️ SECO"], ["eS1", "🌦️ INTER"], ["eS2", "🌧️ LLUVIA"]])}`;
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 9; E.tyre = 0; E.good = 0; E.tot = 0; E.changedAt = 0; E.band = 0;
  const ph = trkRand(1) * 6;
  const pick = i => { E.tyre = i; [0, 1, 2].forEach(k => { const b = document.getElementById("eS" + k); if (b) b.classList.toggle("sel", k === i); }); };
  [0, 1, 2].forEach(i => document.getElementById("eS" + i).onclick = () => pick(i));
  pick(0);
  eraLoop(dt => {
    E.t += dt;
    const w = Math.max(2, Math.min(98, 50 - Math.cos(E.t * 0.75 * sp + ph) * 42 + Math.sin(E.t * 2.3) * 6));
    const band = w < 33 ? 0 : w < 66 ? 1 : 2;
    if (band !== E.band) { E.band = band; E.changedAt = E.t; }
    if (E.t - E.changedAt > 0.45) { E.tot += dt; if (E.tyre === band) E.good += dt; }
    const n = document.getElementById("eN"); if (n) n.style.left = w + "%";
    document.getElementById("eS").textContent = ["seca", "húmeda", "con charcos"][band];
    const a = document.getElementById("eAcc"); if (a && E.tot > 0) a.textContent = Math.round(E.good / E.tot * 100) + "%";
    trkTimer(E);
    if (E.t >= E.limit) { const p = E.tot ? E.good / E.tot : 0; eraEnd(p >= 0.7, Math.round(p * 100) + "% con la goma correcta" + (p >= 0.7 ? " — ¡leíste el cielo!" : ".")); }
  });
}

/* Bélgica · Eau Rouge (seguir la zona) */
function trkBand() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Velocidad</span><span>Precisión: <b id="eAcc">—</b> · ⏱️ <b id="eT"></b></span></div>
    <div class="era-gauge"><div class="gz" id="eZ"></div><div class="gn" id="eN"></div></div>
    ${trkBtns([["eGas", "🦶 A FONDO (mantener)", "era-btn hot"]])}`;
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 8; E.v = 30; E.hold = false; E.good = 0; E.tot = 0;
  eraHold(document.getElementById("eGas"), () => (E.hold = true), () => (E.hold = false));
  const ph = trkRand(2) * 5;
  eraLoop(dt => {
    E.t += dt;
    E.v = Math.max(0, Math.min(100, E.v + (E.hold ? 55 : -45) * dt));
    const c = 50 + Math.sin(E.t * 0.9 * sp + ph) * 30, w = 16 / sp; E.c = c;
    const z = document.getElementById("eZ"); if (z) { z.style.left = (c - w / 2) + "%"; z.style.width = w + "%"; }
    const n = document.getElementById("eN"); if (n) n.style.left = E.v + "%";
    if (E.t > 0.8) { E.tot += dt; if (Math.abs(E.v - c) <= w / 2) E.good += dt; }
    const a = document.getElementById("eAcc"); if (a && E.tot > 0) a.textContent = Math.round(E.good / E.tot * 100) + "%";
    trkTimer(E);
    if (E.t >= E.limit) { const p = E.tot ? E.good / E.tot : 0; eraEnd(p >= 0.7, Math.round(p * 100) + "% en la zona" + (p >= 0.7 ? " — ¡a fondo!" : " — levantaste el pie.")); }
  });
}

/* Singapur · memoria */
function trkSimon() {
  const st = document.getElementById("eraStage");
  const cols = ["#e10600", "#2563eb", "#eab308", "#22c55e"];
  const E_SIMON = [1, 2, 3, 4].map(k => 1 + Math.floor(trkRand(k + 300) * 5) + (k - 1) * 5);
  st.innerHTML = `<div class="era-stat"><span>Ronda <b id="eC">1</b>/3</span><span>Errores: <b id="eX">0</b>/1</span></div>
    <div class="trk-simon">${cols.map((c, i) => `<button class="era-btn trk-sb" id="eS${i}" style="--c:${c}">CURVA ${E_SIMON[i]}</button>`).join("")}</div>`;
  const E = ERA;
  E.round = 0; E.err = 0; E.seq = []; E.inp = 0; E.showing = false;
  const flash = (i, ms) => { const b = document.getElementById("eS" + i); if (!b) return; b.classList.add("lit"); E.timers.push(setTimeout(() => b.classList.remove("lit"), ms)); };
  const show = () => {
    E.showing = true; E.inp = 0;
    const len = 3 + E.round;
    E.seq = Array.from({ length: len }, (_, k) => Math.floor(trkRand(E.round * 10 + k + E.err * 100) * 4));
    eraMsg("👀 Mirá el orden…");
    const step = 560 / eraSpeed();
    E.seq.forEach((v, k) => E.timers.push(setTimeout(() => { if (eraAlive(E.id)) flash(v, step * 0.7); }, 400 + k * step)));
    E.timers.push(setTimeout(() => { if (eraAlive(E.id)) { E.showing = false; E.turnAt = Date.now(); E.lastIn = Date.now(); eraMsg("👉 ¡Tu turno!"); } }, 400 + E.seq.length * step));
  };
  // si no tocás nada, la ronda se pierde (no se queda esperando para siempre)
  E.timers.push(setInterval(() => {
    if (!eraAlive(E.id) || E.showing || !E.lastIn) return;
    if (Date.now() - E.lastIn > 8000 / eraSpeed()) eraEnd(false, "Te quedaste quieto: el circuito siguió sin vos.");
  }, 500));
  [0, 1, 2, 3].forEach(i => document.getElementById("eS" + i).onclick = () => {
    if (!eraAlive(E.id) || E.showing) return;
    E.lastIn = Date.now();
    flash(i, 180);
    if (E.seq[E.inp] !== i) {
      E.err++; document.getElementById("eX").textContent = E.err;
      if (E.err > 1) return eraEnd(false, "Te perdiste en el circuito.");
      eraMsg("⚠️ Esa no era. Te la muestro de nuevo…");
      E.showing = true; E.timers.push(setTimeout(() => eraAlive(E.id) && show(), 700));
      return;
    }
    E.inp++;
    if (E.inp >= E.seq.length) {
      E.round++;
      if (E.round >= 3) return eraEnd(true, "¡Te sabés " + trkName() + " de memoria!");
      document.getElementById("eC").textContent = E.round + 1;
      eraMsg("👌 ¡Bien! Ahora una curva más…");
      E.showing = true; E.timers.push(setTimeout(() => eraAlive(E.id) && show(), 800));
    }
  });
  show();
}

/* Abu Dhabi · DRS */
function trkDrs() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Zona <b id="eC">1</b>/3</span><span>Distancia al rival</span></div>
    <div class="trk-gap"><b id="eG">1.40</b><span>s</span></div>
    <div class="trk-det" id="eDet">ZONA DE DETECCIÓN</div>
    <div class="era-dots" id="eDots"><span></span><span></span><span></span></div>
    ${trkBtns([["eB", (parseInt(s.season, 10) || 2026) >= 2026 ? "🟢 ACTIVAR ADELANTAMIENTO" : "🟢 ABRIR DRS", "era-btn cool"]])}`;
  const E = ERA, sp = eraSpeed(), MO = (parseInt(s.season, 10) || 2026) >= 2026;
  E.c = 0; E.wins = 0; E.t = 0; E.phase = "drive"; E.next = 1.6 / sp;
  const farIdx = Math.floor(trkRand(7) * 3); // en una de las 3 zonas estás lejos
  const res = (ok, txt) => {
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    eraMsg((ok ? "👌 " : "⚠️ ") + txt);
    document.getElementById("eDet").classList.remove("on");
    E.c++; E.phase = "drive"; E.next = E.t + 1.4 / sp;
    if (E.c >= 3) eraEnd(E.wins >= 2, E.wins + " de 3 zonas bien leídas" + (E.wins >= 2 ? " — ¡así se pasa!" : "."));
    else document.getElementById("eC").textContent = E.c + 1;
  };
  document.getElementById("eB").onclick = () => {
    if (!eraAlive(E.id) || E.c >= 3) return;
    if (E.phase !== "det") return res(false, (MO ? "Fuera de la zona: el modo adelantamiento no se activa ahí." : "Fuera de la zona: el DRS no se abre ahí."));
    res(E.gap < 1, E.gap < 1 ? (MO ? "¡Modo adelantamiento y pasada!" : "¡DRS abierto y adelantamiento!") : "Estabas a más de 1 segundo: no te correspondía.");
  };
  eraLoop(dt => {
    E.t += dt;
    const far = E.c === farIdx;
    const target = far ? 1.35 : 0.65;
    E.gap = target + Math.sin(E.t * 3.1) * 0.18;
    document.getElementById("eG").textContent = E.gap.toFixed(2);
    document.getElementById("eG").style.color = E.gap < 1 ? "#22c55e" : "#f5f5f5";
    if (E.phase === "drive" && E.t >= E.next && E.c < 3) { E.phase = "det"; E.until = E.t + 1.1 / sp; document.getElementById("eDet").classList.add("on"); }
    else if (E.phase === "det" && E.t >= E.until) res(E.gap >= 1, E.gap >= 1 ? (MO ? "Bien: estabas lejos, no te tocaba el modo adelantamiento." : "Bien: estabas lejos, no había DRS.") : (MO ? "¡Se te pasó la zona sin activar el modo adelantamiento!" : "¡Se te pasó la zona sin abrir el DRS!"));
  });
}

/* Parada en boxes (depende de la época: cuántos toques lleva cada rueda) */
function trkPit() {
  const y = parseInt(s.season, 10) || 2026, sp = eraSpeed();
  const n = y < 1960 ? 4 : y < 1994 ? 3 : y < 2010 ? 2 : 1;
  const target = +((1.4 + 4 * n * 0.33) / sp + (y >= 1994 && y < 2010 ? 0.6 : 0)).toFixed(1);
  const names = ["DEL. IZQ", "DEL. DER", "TRAS. IZQ", "TRAS. DER"];
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>⏱️ <b id="eT">0.0</b>s</span><span>Objetivo: <b>${target}s</b></span></div>
    <div class="trk-pit">${names.map((nm, i) => `<button class="era-btn trk-wheel" id="eW${i}">${nm}<i id="eWn${i}"></i></button>`).join("")}<div class="trk-pitcar">${fwCarSvg(fwEra(y).y, eraColor())}</div></div>`;
  const E = ERA;
  E.t = 0; E.order = [0, 1, 2, 3].sort((a, b) => trkRand(a + 70) - trkRand(b + 70)); E.k = 0; E.left = n; E.pen = 0;
  const light = () => [0, 1, 2, 3].forEach(i => {
    const b = document.getElementById("eW" + i); const done = E.order.indexOf(i) < E.k;
    b.className = "era-btn trk-wheel" + (i === E.order[E.k] ? " lit" : done ? " done" : "");
    document.getElementById("eWn" + i).textContent = i === E.order[E.k] ? "×" + E.left : done ? "✓" : "";
  });
  [0, 1, 2, 3].forEach(i => document.getElementById("eW" + i).onclick = () => {
    if (!eraAlive(E.id)) return;
    if (i !== E.order[E.k]) { E.pen += 0.5; eraMsg("⚠️ ¡Esa no! +0.5s"); return; }
    E.left--;
    if (E.left <= 0) { E.k++; E.left = n; if (E.k >= 4) { const tt = E.t + E.pen; return eraEnd(tt <= target, "Parada de " + tt.toFixed(1) + "s " + (tt <= target ? "— ¡el equipo te aplaude!" : "— muy lenta, perdiste posiciones.")); } }
    light();
  });
  light();
  eraLoop(dt => {
    E.t += dt;
    const tt = document.getElementById("eT"); if (tt) tt.textContent = (E.t + E.pen).toFixed(1);
    if (E.t + E.pen > target * 2.2) eraEnd(false, "La parada fue eterna: el mecánico perdió la tuerca.");
  });
}

/* Largada (antes de 1971: con bandera; después: semáforo) */
function trkLaunch() {
  const y = parseInt(s.season, 10) || 2026, sp = eraSpeed();
  const flag = y < 1971;
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Largada <b id="eC">1</b>/3</span><span id="eSig"></span></div>
    <div class="trk-start" id="eStart">${flag ? `<div class="trk-flag" id="eFlag">🏁</div>` : `<div class="trk-lights">${"<span></span>".repeat(5)}</div>`}</div>
    <div class="era-stat" style="margin-top:8px"><span>Vueltas del motor</span><span></span></div>
    <div class="era-gauge"><div class="gz" style="left:55%;width:22%"></div><div class="gr"></div><div class="gn" id="eN"></div></div>
    <div class="era-dots" id="eDots"><span></span><span></span><span></span></div>
    ${trkBtns([["eGas", "🦶 ACELERAR (mantener)", "era-btn cool"], ["eGo", "🚀 ¡LARGAR!", "era-btn hot"]])}`;
  const E = ERA;
  E.c = 0; E.wins = 0; E.rpm = 20; E.hold = false;
  eraHold(document.getElementById("eGas"), () => (E.hold = true), () => (E.hold = false));
  const setSig = (k, out) => {
    if (flag) { const f = document.getElementById("eFlag"); if (f) f.className = "trk-flag" + (out ? " down" : k > 0 ? " up" : ""); }
    else document.querySelectorAll("#eStart .trk-lights span").forEach((l, i) => l.className = !out && i < k ? "on" : "");
  };
  function round() {
    E.t = 0; E.lit = 0; E.out = false; E.outAt = 5 * 0.55 + 0.4 + trkRand(E.c + 40) * 1.2; E.wait = 0;
    setSig(0, false);
    document.getElementById("eC").textContent = E.c + 1;
    document.getElementById("eSig").textContent = flag ? "Esperá que baje la bandera" : "Esperá que se apaguen las luces";
  }
  function result(ok, txt) {
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    eraMsg((ok ? "👌 " : "⚠️ ") + txt);
    E.c++; E.wait = 1.2;
    if (E.c >= 3) eraEnd(E.wins >= 2, E.wins + " de 3 largadas buenas" + (E.wins >= 2 ? " — ¡como un cohete!" : "."));
  }
  document.getElementById("eGo").onclick = () => {
    if (!eraAlive(E.id) || E.wait > 0 || E.c >= 3) return;
    if (!E.out) return result(false, "¡Salida en falso! Te penalizan.");
    const react = E.t - E.outAt, inBand = E.rpm >= 55 && E.rpm <= 77;
    const ok = react <= 0.6 / sp && inBand;
    result(ok, ok ? "Reacción de " + react.toFixed(2) + "s, ¡perfecta!" : !inBand ? (E.rpm < 55 ? "Pocas vueltas: el motor se ahogó." : "Demasiadas vueltas: patinaste.") : "Reaccionaste tarde (" + react.toFixed(2) + "s).");
  };
  round();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < 3) round(); return; }
    E.t += dt;
    E.rpm = Math.max(10, Math.min(100, E.rpm + (E.hold ? 60 : -50) * dt));
    const n = document.getElementById("eN"); if (n) n.style.left = E.rpm + "%";
    const k = Math.min(5, Math.floor(E.t / 0.55));
    if (!E.out && k !== E.lit) { E.lit = k; setSig(k, false); try { FWAudio.beep(false); } catch (e) {} }
    if (!E.out && E.t >= E.outAt) { E.out = true; setSig(5, true); document.getElementById("eSig").textContent = "¡YA!"; }
    if (E.out && E.t - E.outAt > 1.5) result(false, "Te quedaste parado en la grilla.");
  });
}

/* Ataque: el rival se cierra para un lado y vos vas por el otro */
function trkSide() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Curva <b id="eC">1</b>/5</span><span>Pasadas: <b id="eW">0</b></span></div>
    <div class="trk-road" id="eRd"><div class="trk-car rival" id="eRv" style="left:50%"></div><div class="trk-car me" id="eMe" style="left:50%"></div></div>
    <div class="era-dots" id="eDots">${"<span></span>".repeat(5)}</div>
    ${trkBtns([["eL", "◀ POR IZQUIERDA"], ["eR", "POR DERECHA ▶"]])}`;
  const E = ERA, sp = eraSpeed();
  E.c = 0; E.wins = 0; E.t = 0; E.phase = "wait"; E.next = 0.9;
  document.getElementById("eMe").style.background = eraColor();
  const rv = document.getElementById("eRv"), me = document.getElementById("eMe");
  const res = (ok, txt) => {
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    document.getElementById("eW").textContent = E.wins;
    eraMsg((ok ? "👌 " : "⚠️ ") + txt);
    E.c++; E.phase = "wait"; E.next = E.t + 1.0;
    if (E.c >= 5) eraEnd(E.wins >= 4, E.wins + " de 5 ataques" + (E.wins >= 4 ? " — ¡lo pasaste!" : " — te cerró siempre la puerta."));
    else document.getElementById("eC").textContent = E.c + 1;
  };
  const go = d => {
    if (!eraAlive(E.id) || E.phase !== "cover") return;
    me.style.left = d < 0 ? "22%" : "78%";
    res(d !== E.side, d !== E.side ? "¡Por el hueco libre!" : "Te cerró la puerta.");
  };
  document.getElementById("eL").onclick = () => go(-1);
  document.getElementById("eR").onclick = () => go(1);
  eraLoop(dt => {
    E.t += dt;
    if (E.phase === "wait" && E.t >= E.next && E.c < 5) {
      me.style.left = "50%"; rv.style.left = "50%";
      E.side = trkRand(E.c + 90) < 0.5 ? -1 : 1; E.phase = "cover"; E.until = E.t + 1.0 / sp;
      setTimeout(() => { if (eraAlive(E.id)) rv.style.left = E.side < 0 ? "26%" : "74%"; }, 30);
    } else if (E.phase === "cover" && E.t >= E.until) res(false, "Dudaste y se te escapó.");
  });
}

/* ---------- carrera del Modo Piloto: a veces la decisión es el desafío del circuito ---------- */
(function () {
  const o = window.renderDriverRace;
  if (typeof o !== "function") return;
  window.renderDriverRace = function (idx, rName) {
    const key = "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer;
    if (ERA && !ERA.dead && ERA.key === key && document.getElementById("eraStage")) return;
    const r = o.apply(this, arguments);
    try {
      if (fwHash("race|" + s.gp + "_" + s.season + "_" + s.activePlayer) % 10 < 7) {
        const turnLabel = s.player2 ? (s.activePlayer === 1 ? " · Turno P1" : " · Turno P2") : "";
        const injuryBanner = (idx === 0 && s._reserveGPType === "injury" && typeof renderReserveInjuryBanner === "function") ? renderReserveInjuryBanner() : "";
        renderTrackTask(injuryBanner, " · " + rName + turnLabel, ok => finishRaceJob(ok));
      }
    } catch (e) {}
    return r;
  };
})();

/* =====================================================================================
   VOLANTE EN LOS MINIJUEGOS: los botones del minijuego pasan a un volante de F1 con luces
   de cambio (muestran el progreso) y una pantallita con el dato en vivo.
   ===================================================================================== */
function mwWheelize() {
  const st = document.getElementById("eraStage");
  const row = st && st.querySelector(".era-row");
  if (!row || st.querySelector(".mw")) return;
  const btns = [...row.querySelectorAll("button")];
  if (!btns.length || btns.length > 3) return;
  const leds = Array.from({ length: 15 }, (_, k) => `<i class="${k < 5 ? "g" : k < 10 ? "r" : "b"}"></i>`).join("");
  const w = document.createElement("div");
  w.className = "mw";
  w.innerHTML = `<div class="mw-leds">${leds}</div><div class="mw-body"><div class="mw-l"></div><div class="mw-screen"><span class="mw-k" id="mwK">${engEsc((typeof trkDef === "function" && ERA && ERA.kind && ERA.kind.indexOf("trk") === 0 ? trkName() : "FAWIWE") + " " + (s.season || ""))}</span><b id="mwV">LISTO</b></div><div class="mw-r"></div></div><div class="mw-c"></div>`;
  row.replaceWith(w);
  const L = w.querySelector(".mw-l"), R = w.querySelector(".mw-r"), C = w.querySelector(".mw-c");
  const hotIdx = btns.findIndex(b => b.classList.contains("hot"));
  if (btns.length === 1) C.appendChild(btns[0]);
  else if (btns.length === 2) {
    if (hotIdx >= 0 && btns[1 - hotIdx].textContent.indexOf("◀") < 0 && btns[hotIdx].textContent.indexOf("▶") < 0 && btns[hotIdx].textContent.indexOf("CURVA") < 0) { L.appendChild(btns[1 - hotIdx]); C.appendChild(btns[hotIdx]); }
    else { L.appendChild(btns[0]); R.appendChild(btns[1]); }
  } else { L.appendChild(btns[0]); C.appendChild(btns[1]); R.appendChild(btns[2]); }
  btns.forEach(b => b.classList.add("mw-btn"));
  [...C.children].forEach(b => b.classList.add("mw-big"));
  const id = ERA && ERA.id;
  const tick = () => {
    if (!ERA || ERA.id !== id || !document.body.contains(w)) return;
    const E = ERA;
    let p = 0;
    if (E.limit) p = E.t / E.limit;
    else if (typeof E.c === "number") p = E.c / (E.kind === "trkGap" || E.kind === "trkSide" ? 5 : 3);
    else if (typeof E.r === "number") p = E.r / 5;
    else if (typeof E.pos === "number") p = E.pos / 1600;
    else if (typeof E.gear === "number") p = (E.gear - 1) / 4;
    else if (typeof E.round === "number") p = E.round / 3;
    if (typeof E.rpm === "number") p = E.rpm / 100;
    const n = Math.round(Math.max(0, Math.min(1, p)) * 15);
    w.querySelectorAll(".mw-leds i").forEach((l, i) => l.classList.toggle("on", i < n));
    const first = st.querySelector(".era-stat span");
    const v = document.getElementById("mwV");
    if (v && first) v.textContent = first.textContent.replace(/\s+/g, " ").trim().slice(0, 30);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
(function () {
  ["eraStart", "trkStart"].forEach(n => {
    const o = window[n];
    if (typeof o !== "function") return;
    window[n] = function () { const r = o.apply(this, arguments); try { mwWheelize(); } catch (e) { console.warn(e); } return r; };
  });
})();
