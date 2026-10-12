/* =====================================================================================
   FAWIWE · MINIJUEGOS NUEVOS
   MODO INGENIERO (más jugables, trabajo real de un equipo):
     🧊 Temperaturas de neumáticos · 📈 Telemetría · ⏱️ Ventana de parada · 📻 Radio en vivo
   MODO PILOTO (más realistas):
     🏁 Vuelta real: en cada curva FRENÁS, GIRÁS y ACELERÁS en el momento justo, con tiempo
     de vuelta, sectores (violeta/verde/amarillo) y diferencia con la pole.
   Usan el motor de era.js (ERA, eraLoop, eraEnd…).
   ===================================================================================== */
function emRand(k) { return (fwHash("em" + s.gp + "_" + s.session + "_" + s.season + "_" + (s.activePlayer || 1) + "_" + k) % 1000) / 1000; }
function emFrame(stepHead, icon, title, how, startFn, done, key) {
  eraStop();
  window.__emKey = key || null;
  const jobArea = document.getElementById("jobArea");
  if (!jobArea) return;
  window.__emDone = done || null;
  jobArea.innerHTML = (stepHead || "") + `
    <div class="era-mini">
      <div class="mini-explain"><b>${icon} ${title}</b><p style="margin:8px 0 0">${how}</p></div>
      <div class="era-stage" id="eraStage"><p class="small" style="text-align:center;margin:30px 0">Tocá ARRANCAR cuando estés listo.</p></div>
      <div class="era-msg" id="eraMsg"></div>
      <button class="start-btn" id="startMiniBtn" onclick="emStart('${startFn}')">▶ ARRANCAR</button>
    </div>`;
}
function emStart(fn) {
  if (ERA) return;
  const btn = document.getElementById("startMiniBtn"); if (btn) btn.style.display = "none";
  s.miniStarted = true;
  ERA = { id: fn + "_" + Date.now(), kind: fn, timers: [], key: window.__emKey || ("emtask_" + s.gp + "_" + s.session + "_" + s.activePlayer), done: window.__emDone || null };
  eraMsg("");
  window[fn]();
  if (fn === "emLap" && typeof mwWheelize === "function") { try { mwWheelize(); } catch (e) {} }
}

/* ================= INGENIERO ================= */
/* ayudas del ingeniero según la dificultad: Fácil = 2 cosas automáticas · Normal = 1 · Difícil = todo a mano */
function emLvl() { return (typeof s !== "undefined" && s.miniDiff) || "normal"; }
function emAssistTag(txt) { return `<div class="em-assist ${emLvl()}">${txt}</div>`; }
/* 🧊 Temperaturas de neumáticos: dejá las 4 gomas en la ventana ideal (90–105 °C) */
function emTyres() {
  const st = document.getElementById("eraStage");
  const names = ["DEL. IZQ", "DEL. DER", "TRAS. IZQ", "TRAS. DER"];
  const E = ERA, sp = eraSpeed(), lv = emLvl();
  E.couple = lv !== "easy"; E.cool = lv === "hard";
  E.t = 0; E.limit = 22 / sp; E.moves = Math.round(12 / sp);
  E.temp = [0, 1, 2, 3].map(i => Math.round(68 + emRand(i) * 62));
  if (E.temp.every(v => v >= 90 && v <= 105)) E.temp[0] = 72;
  st.innerHTML = `<div class="era-stat"><span>Ajustes que te quedan: <b id="eMv"></b></span><span>⏱️ <b id="eT"></b></span></div>
    <div class="em-car">${[0, 1, 2, 3].map(i => `<div class="em-tyre" id="eTy${i}"><b id="eTv${i}"></b><span>${names[i]}</span>
      <div class="em-tbtn"><button class="era-btn dark" onclick="emTyreAdj(${i},1)">＋ presión</button><button class="era-btn dark" onclick="emTyreAdj(${i},-1)">－ presión</button></div></div>`).join("")}
      <div class="em-body">${fwCarSvg(fwEra(s.season).y, eraColor()).replace("evo-svg", "evo-svg em-top")}</div></div>
    <p class="small" style="text-align:center">Más presión = la goma trabaja más y <b>calienta</b> (+6 °C${E.couple ? ", y +2 °C a la del mismo eje" : ""}). Menos presión = <b>enfría</b>.</p>
    ${emAssistTag(lv === "easy" ? "🟢 FÁCIL · cada goma se ajusta sola (no mueve la del mismo eje) y la pista no las enfría" : lv === "normal" ? "🟡 NORMAL · la pista no las enfría, pero tocar una goma mueve la del mismo eje" : "🔴 DIFÍCIL · el eje se mueve junto y la pista las va enfriando")}`;
  const paint = () => {
    E.temp.forEach((v, i) => {
      const el = document.getElementById("eTy" + i); if (!el) return;
      el.className = "em-tyre " + (v < 90 ? "cold" : v > 105 ? "hot" : "ok");
      document.getElementById("eTv" + i).textContent = Math.round(v) + "°C";
    });
    document.getElementById("eMv").textContent = E.moves;
  };
  window.emTyreAdj = (i, d) => {
    if (!eraAlive(E.id) || E.moves <= 0) return;
    E.moves--;
    E.temp[i] += d * 6; if (E.couple) E.temp[i ^ 1] += d * 2;
    paint();
    if (E.temp.every(v => v >= 90 && v <= 105)) return eraEnd(true, "¡Las 4 gomas en la ventana ideal! El piloto siente el auto pegado al piso.");
    if (E.moves <= 0) eraEnd(false, "Te quedaste sin ajustes: " + E.temp.filter(v => v < 90 || v > 105).length + " goma(s) fuera de temperatura.");
  };
  paint();
  eraLoop(dt => {
    E.t += dt;
    // la pista también cambia: las gomas se enfrían de a poco
    if (E.cool) E.temp = E.temp.map((v, i) => v - dt * (0.35 + (i > 1 ? 0.15 : 0)));
    if (Math.floor(E.t * 4) % 2 === 0) paint();
    const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.limit - E.t).toFixed(1) + "s";
    if (E.temp.every(v => v >= 90 && v <= 105)) return eraEnd(true, "¡Las 4 gomas en la ventana ideal!");
    if (E.t >= E.limit) eraEnd(false, "Se terminó la tanda con gomas fuera de temperatura.");
  });
}

/* 📈 Telemetría: encontrá la curva donde perdés más tiempo y elegí el arreglo correcto */
const EM_FIX = {
  brake: { label: "frena demasiado temprano", fix: "🛑 Pasar el balance de frenos hacia adelante" },
  apex: { label: "pasa muy lento por el vértice", fix: "✈️ Más ala delantera (más carga en la entrada)" },
  exit: { label: "sale muy despacio (patina al acelerar)", fix: "⚙️ Diferencial más abierto y suspensión trasera más blanda" }
};
function emTelemetry() {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  E.t = 0; E.limit = 20 / sp; E.step = 0;
  const lv = emLvl();
  const N = 6, W = 600, H = 170;
  const types = [0, 1, 2, 3, 4, 5].map(i => ["fast", "medium", "slow"][Math.floor(emRand(i + 10) * 3)]);
  const minSp = { fast: 215, medium: 150, slow: 85 };
  E.bad = Math.floor(emRand(20) * N);
  E.kind = ["brake", "apex", "exit"][Math.floor(emRand(21) * 3)];
  E.small = (E.bad + 2 + Math.floor(emRand(22) * 3)) % N;
  const ref = [], mine = [];
  for (let x = 0; x <= W; x += 4) {
    let vr = 320, vm = 320;
    for (let c = 0; c < N; c++) {
      const cx = 60 + c * 96, m = minSp[types[c]];
      const shape = (dx, inW, outW) => dx < 0 ? Math.max(0, 1 - (-dx) / inW) : Math.max(0, 1 - dx / outW);
      const dr = shape(x - cx, 30, 34);
      vr = Math.min(vr, 320 - (320 - m) * dr);
      let inW = 30, outW = 34, mm = m;
      if (c === E.bad) { if (E.kind === "brake") inW = 48; if (E.kind === "apex") mm = m - 30; if (E.kind === "exit") outW = 60; }
      if (c === E.small) mm = m - 9;
      vm = Math.min(vm, 320 - (320 - mm) * shape(x - cx, inW, outW));
    }
    ref.push([x, H - 10 - (vr - 60) / 270 * (H - 30)]);
    mine.push([x, H - 10 - (vm - 60) / 270 * (H - 30)]);
  }
  const pl = pts => pts.map(p => p[0] + "," + p[1].toFixed(1)).join(" ");
  st.innerHTML = `<div class="era-stat"><span id="eInfo">Paso 1: tocá la curva donde perdés MÁS tiempo</span><span>⏱️ <b id="eT"></b></span></div>
    <svg class="em-tele" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      ${[0, 1, 2, 3].map(k => `<line x1="0" x2="${W}" y1="${20 + k * 40}" y2="${20 + k * 40}" stroke="#2a2a33"/>`).join("")}
      <polyline points="${pl(ref)}" fill="none" stroke="#e5e7eb" stroke-width="2"/>
      <polyline points="${pl(mine)}" fill="none" stroke="#e10600" stroke-width="2.5"/>
      ${[0, 1, 2, 3, 4, 5].map(c => `<g class="em-cz" onclick="emTeleCorner(${c})"><rect x="${60 + c * 96 - 44}" y="0" width="88" height="${H}" fill="transparent"/><text x="${60 + c * 96}" y="14" text-anchor="middle" fill="#949498" font-size="12" font-weight="700">C${c + 1}</text></g>`).join("")}
    </svg>
    <div class="em-legend"><span><i style="background:#e5e7eb"></i>Mejor vuelta del día</span><span><i style="background:#e10600"></i>Tu piloto</span><span>Velocidad (km/h) a lo largo de la vuelta</span></div>
    <div id="eFix"></div>${emAssistTag(lv === "easy" ? "🟢 FÁCIL · la curva problemática se marca sola: vos elegís el arreglo" : lv === "normal" ? "🟡 NORMAL · te marcamos 2 curvas sospechosas: encontrá la peor y elegí el arreglo" : "🔴 DIFÍCIL · sin ayudas: encontrá la curva y el arreglo")}`;
  if (lv === "normal") setTimeout(() => { document.querySelectorAll(".em-cz rect").forEach((r, i) => { if (i === E.bad || i === E.small) { r.setAttribute("fill", "#facc1522"); r.setAttribute("stroke", "#facc15"); r.setAttribute("stroke-dasharray", "4 4"); } }); }, 0);
  if (lv === "easy") setTimeout(() => { const r = document.querySelectorAll(".em-cz rect")[E.bad]; if (r) { r.setAttribute("fill", "#22c55e22"); r.setAttribute("stroke", "#22c55e"); } window.emTeleCorner && emTeleCorner(E.bad); }, 400);
  window.emTeleCorner = c => {
    if (!eraAlive(E.id) || E.step !== 0) return;
    if (c !== E.bad) { E.wrong = (E.wrong || 0) + 1; eraMsg(c === E.small ? "🤏 Ahí pierde un poco, pero hay una curva peor…" : "❌ Ahí las líneas casi coinciden."); if (E.wrong >= 2) eraEnd(false, "Mirá dónde se separa más la línea roja de la blanca: era la C" + (E.bad + 1) + "."); return; }
    E.step = 1;
    eraMsg("👌 ¡Esa es! En la C" + (c + 1) + " tu piloto " + EM_FIX[E.kind].label + ".");
    document.getElementById("eInfo").textContent = "Paso 2: elegí el arreglo del setup";
    const opts = Object.keys(EM_FIX).sort((a, b) => emRand(a.length + 30) - emRand(b.length + 31));
    document.getElementById("eFix").innerHTML = `<div class="era-row">${opts.map(k => `<button class="era-btn dark" onclick="emTeleFix('${k}')">${EM_FIX[k].fix}</button>`).join("")}</div>`;
  };
  window.emTeleFix = k => {
    if (!eraAlive(E.id) || E.step !== 1) return;
    eraEnd(k === E.kind, k === E.kind ? "Arreglo correcto: el piloto gana 3 décimas en esa curva." : "Ese cambio no ataca el problema (" + EM_FIX[E.kind].label + ").");
  };
  eraLoop(dt => {
    E.t += dt;
    const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.limit - E.t).toFixed(1) + "s";
    if (E.t >= E.limit) eraEnd(false, "Se te pasó el tiempo de análisis antes de la próxima salida.");
  });
}

/* ⏱️ Ventana de parada: llamá a boxes en la vuelta justa (2 paradas) */
function emPitWindow() {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  E.lap = 1; E.total = 50; E.life = 100; E.stops = 0; E.good = 0; E.acc = 0; E.traffic = false; E.tick = 0; E.wait = 0;
  E.deg = 6 + emRand(40) * 1.2;
  const lv = emLvl();
  st.innerHTML = `<div class="era-stat"><span>Vuelta <b id="eLap">1</b>/${50} · Paradas <b id="eSt">0</b>/2</span><span id="eTr"></span></div>
    <div class="era-stat"><span>Goma: <b id="eLife"></b></span><span>Ritmo: <b id="ePace"></b></span></div>
    <div class="era-gauge em-life"><div class="gz" style="left:22%;width:18%"></div><div class="gf" id="eLf"></div></div>
    <p class="small" style="text-align:center">Pará cuando la goma esté en la <b>zona verde</b> (22–40%) y <b>sin tráfico</b> a la salida de boxes. Muy temprano perdés tiempo; muy tarde la goma se cae del precipicio.</p>
    <div class="era-row"><button class="era-btn hot" id="eBox">📻 ¡BOX, BOX!</button></div>
    ${emAssistTag(lv === "easy" ? "🟢 FÁCIL · nunca hay tráfico a la salida: solo elegí el momento de la goma" : lv === "normal" ? "🟡 NORMAL · ojo con el tráfico a la salida de boxes" : "🔴 DIFÍCIL · tráfico y la goma se gasta más rápido")}`;
  const upd = () => {
    const l = Math.max(0, E.life);
    document.getElementById("eLap").textContent = Math.min(50, Math.round(E.lap));
    document.getElementById("eSt").textContent = E.stops;
    document.getElementById("eLife").textContent = Math.round(l) + "%";
    const pace = l > 40 ? 0 : l > 22 ? (40 - l) * 0.02 : 0.4 + (22 - l) * 0.12;
    document.getElementById("ePace").textContent = "+" + pace.toFixed(1) + "s";
    const f = document.getElementById("eLf"); if (f) { f.style.width = l + "%"; f.style.background = l > 40 ? "#22c55e" : l > 22 ? "#f59e0b" : "#e10600"; }
    const tr = document.getElementById("eTr"); if (tr) { tr.textContent = E.traffic ? "🚗🚗 Tráfico a la salida" : "✅ Pista libre"; tr.style.color = E.traffic ? "#f87171" : "#86efac"; }
  };
  document.getElementById("eBox").onclick = () => {
    if (!eraAlive(E.id) || E.wait > 0) return;
    const l = E.life, inWin = l >= 22 && l <= 40;
    let txt;
    if (inWin && !E.traffic) { E.good++; txt = "👌 Parada perfecta: undercut y salís con pista libre."; }
    else if (inWin) txt = "⚠️ Buen momento, pero saliste atrás de un tráfico y perdiste el undercut.";
    else if (l > 40) txt = "⚠️ Muy temprano: tiraste goma buena y vas a tener que parar de más.";
    else txt = "⚠️ Tarde: la goma ya se había caído y perdiste mucho tiempo.";
    eraMsg(txt);
    E.stops++; E.life = 100; E.wait = 0.8;
    try { FWAudio.whoosh(); } catch (e) {}
    if (E.stops >= 2) return eraEnd(E.good >= 2, E.good + " de 2 paradas perfectas" + (E.good >= 2 ? " — ¡estrategia de campeón!" : "."));
    upd();
  };
  upd();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; return; }
    E.lap += dt * 2 * sp;
    E.life -= dt * E.deg * sp * (lv === "hard" ? 1.15 : 1);
    E.tick += dt;
    if (E.tick > 0.75) { E.tick = 0; E.traffic = lv !== "easy" && emRand(Math.round(E.lap) + 100 + E.stops * 7) < 0.35; }
    upd();
    if (E.life <= -8) { E.life = 100; E.stops++; eraMsg("💥 ¡Pinchadura! Esperaste demasiado."); if (E.stops >= 2) return eraEnd(false, "La goma explotó: así no se gana una carrera."); }
    if (E.lap >= E.total) eraEnd(false, "Terminó la carrera y te faltaron paradas.");
  });
}

/* 📻 Radio en vivo: contestá rápido y bien 5 mensajes del piloto */
const EM_RADIO = [
  ["Las traseras se fueron, patino en cada salida de curva.", ["Box esta vuelta: ponemos duras", "Seguí igual 15 vueltas más", "Más potencia al motor"]],
  ["Empieza a llover en el sector 3, el resto está seco.", ["Quedate afuera una vuelta más y te avisamos", "Box ya mismo para gomas de lluvia extrema", "Andá más rápido en el sector 3"]],
  ["El de atrás tiene DRS y me está alcanzando.", ["Usá el modo de defensa y cuidá la salida de la última curva", "Dejalo pasar sin pelear", "Frená antes en todas las curvas"]],
  ["Siento una vibración fuerte en el delantero izquierdo.", ["Box: cambiamos esa goma, puede ser un plano", "Ignorala, es normal", "Subí el ritmo para terminar antes"]],
  ["¿Puedo atacar al de adelante?", ["Sí: tenés goma más nueva, vas 0.5s más rápido", "No, quedate atrás todo el día", "Atacalo por afuera en la chicana sin mirar"]],
  ["Safety Car en pista, ¿qué hago?", ["Box ahora: parada barata con el pelotón lento", "Seguí a fondo, no pasa nada", "Apagá el motor"]],
  ["El motor pierde potencia en las rectas.", ["Cambiá al modo de motor 6 y levantá antes de frenar", "Acelerá más fuerte", "Abandoná ya"]],
  ["Me quedan 3 vueltas y tengo poco combustible.", ["Levantá y dejá correr antes de cada frenada (lift and coast)", "Andá a fondo, alcanza seguro", "Entrá a cargar nafta"]],
  ["Mi compañero me está frenando.", ["Le pedimos que te deje pasar en la próxima recta", "Chocalo", "Quedate atrás hasta el final"]],
  ["Hay bandera amarilla en la curva 7.", ["Levantá en esa zona: no se puede pasar", "Aprovechá para pasar a dos", "Ignorala"]]
];
function emRadio() {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  const order = EM_RADIO.map((_, i) => i).sort((a, b) => emRand(a + 50) - emRand(b + 50)).slice(0, 5);
  const lv = emLvl();
  E.i = 0; E.good = 0; E.t = 0; E.per = (lv === "easy" ? 7.5 : lv === "normal" ? 6 : 5) / sp;
  st.innerHTML = `<div class="era-stat"><span>Mensaje <b id="eC">1</b>/5 · Bien: <b id="eW">0</b></span><span>⏱️ <b id="eT"></b></span></div>
    <div class="em-radio"><div class="em-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="em-msg" id="eQ"></div></div>
    <div class="em-ans" id="eA"></div>
    ${emAssistTag(lv === "easy" ? "🟢 FÁCIL · solo 2 respuestas posibles y más tiempo" : lv === "normal" ? "🟡 NORMAL · 3 respuestas y tiempo justo" : "🔴 DIFÍCIL · 3 respuestas y poco tiempo")}`;
  const show = () => {
    const m = EM_RADIO[order[E.i]];
    E.t = 0;
    document.getElementById("eC").textContent = E.i + 1;
    document.getElementById("eQ").innerHTML = `🎧 <b>Piloto:</b> "${m[0]}"`;
    const sh = shuffleKeepCorrect(m[1], 0, "emr" + order[E.i] + s.gp + s.season);
    E.correct = sh.correct;
    const drop = lv === "easy" ? sh.opts.findIndex((o, k) => k !== sh.correct) : -1;
    document.getElementById("eA").innerHTML = sh.opts.map((o, k) => k === drop ? "" : `<button class="era-btn dark" onclick="emRadioAns(${k})">${o}</button>`).join("");
    try { playRadioSound(); } catch (e) {}
  };
  const next = ok => {
    if (ok) E.good++;
    document.getElementById("eW").textContent = E.good;
    E.i++;
    if (E.i >= 5) return eraEnd(E.good >= 4, E.good + " de 5 respuestas buenas por radio" + (E.good >= 4 ? " — el piloto confía en vos." : "."));
    show();
  };
  window.emRadioAns = k => { if (!eraAlive(E.id)) return; const ok = k === E.correct; eraMsg(ok ? "👌 Copiado." : "⚠️ Esa no era la llamada correcta."); next(ok); };
  show();
  eraLoop(dt => {
    E.t += dt;
    const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.per - E.t).toFixed(1) + "s";
    if (E.t >= E.per) { eraMsg("⏱️ No contestaste a tiempo: el piloto se quedó sin respuesta."); next(false); }
  });
}
const EM_GAMES = [
  { fn: "emTyres", icon: "🧊", title: "Temperaturas de neumáticos", how: "Antes de la tanda, dejá las <b>4 gomas entre 90 y 105 °C</b> subiendo o bajando la presión de cada una. Ojo: tocar una goma también mueve un poco la del mismo eje, y la pista las enfría.", tiers: [0, 1, 2, 3, 4, 5, 6] },
  { fn: "emTelemetry", icon: "📈", title: "Análisis de telemetría", how: "Compará la velocidad de tu piloto (rojo) con la mejor vuelta (blanco). <b>Tocá la curva donde más se separan</b> y después elegí el <b>arreglo del setup</b> que corrige el problema.", tiers: [0, 1, 2, 3, 4, 5, 6] },
  { fn: "emPitWindow", icon: "⏱️", title: "Ventana de parada", how: "Simulación de carrera a 2 paradas. Tocá <b>¡BOX, BOX!</b> cuando la goma esté en la zona verde y <b>sin tráfico</b> a la salida de boxes.", tiers: [1, 2, 3, 4, 5, 6] },
  { fn: "emRadio", icon: "📻", title: "Radio en vivo", how: "Tu piloto te habla en plena carrera. Tenés pocos segundos para dar la <b>llamada correcta</b>. Acertá 4 de 5.", tiers: [1, 2, 3, 4, 5, 6] }
];
(function () {
  const o = window.renderJobArea;
  if (typeof o !== "function") return;
  window.renderJobArea = function () {
    if (s.playerMode !== "driver" && s.session < 2 && ERA && !ERA.dead && ERA.key === "emtask_" + s.gp + "_" + s.session + "_" + s.activePlayer && document.getElementById("eraStage")) return;
    const r = o.apply(this, arguments);
    try {
      if (s.playerMode === "driver" || s.session >= 2 || !s.quizDone || s.gameOver) return r;
      const key = "em_" + s.gp + "_" + s.session + "_" + s.season + "_" + s.activePlayer;
      if (fwHash(key) % 10 >= 6) { eraStop(); return r; } // 60% minijuego nuevo, 40% los de siempre
      const t = tierIndex();
      const pool = EM_GAMES.filter(g => g.tiers.indexOf(t) >= 0);
      const g = pool[fwHash(key + "g") % pool.length];
      const turnLabel = s.player2 ? (s.activePlayer === 1 ? " · Turno P1" : " · Turno P2") : "";
      const stepHead = `<div class="session-steps"><span class="step done">1. Quiz F1</span><span class="step on">2. ${g.title}</span></div>`;
      emFrame(stepHead, g.icon, rank()[0] + " — " + g.title + turnLabel, g.how, g.fn, null);
    } catch (e) { console.warn(e); }
    return r;
  };
})();

/* ================= PILOTO: VUELTA REAL ================= */
const EM_CORNERS = {
  "Australia": ["Curva 1", "Curva 3", "Curva 9-10", "Curva 11"], "Japón": ["Curva 1", "Degner", "Horquilla", "Chicane Casio"],
  "Italia": ["Variante del Rettifilo", "Curva Grande", "Lesmo 1", "Parabólica"], "Mónaco": ["Sainte Dévote", "Casino", "Horquilla Loews", "Piscina"],
  "España": ["Curva 1", "Curva 3", "La Caixa", "Chicane final"], "Canadá": ["Curva 1", "Horquilla", "Chicane", "Muro de los Campeones"],
  "Gran Bretaña": ["Abbey", "Copse", "Maggotts", "Stowe"], "Bélgica": ["La Source", "Eau Rouge", "Les Combes", "Bus Stop"],
  "Singapur": ["Curva 1", "Curva 7", "Puente Anderson", "Curva 23"], "Abu Dhabi": ["Curva 1", "Horquilla 5", "Curva 9", "Curva 16"]
};
function emParseLap(rec) { const m = String(rec || "1:25.000").match(/(\d+):(\d+\.\d+)/); return m ? +m[1] * 60 + +m[2] : 85; }
function emFmtLap(t) { const m = Math.floor(t / 60); const s2 = (t - m * 60).toFixed(3).padStart(6, "0"); return m + ":" + s2; }
function emLap() {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  const tr = trackData[s.gp] || { name: "Australia", record: "1:25.000" };
  const names = EM_CORNERS[tr.name] || ["Curva 1", "Curva 2", "Curva 3", "Curva 4"];
  E.c = 0; E.ph = 0; E.p = 0; E.loss = []; E.cur = 0; E.wait = 0.6;
  E.base = emParseLap(tr.record) + 0.25;
  E.pole = E.base + 0.05 + emRand(60) * 0.25;
  E.corners = names.map((n, i) => { const b = 22 + emRand(i + 61) * 14; const slow = /Horquilla|Hairpin|Loews|Sainte|Chicane|Variante|Source|Bus/.test(n); return { n, b, a: b + (slow ? 20 : 26), e: b + (slow ? 40 : 46), v: (slow ? 52 : 66) * sp }; });
  const w = 9 / sp;
  st.innerHTML = `<div class="era-stat"><span>📍 <b id="eCn"></b></span><span>Sectores: <span id="eSec"></span></span></div>
    <div class="em-lapbar" id="eBar"><div class="z b" id="eZb">FRENO</div><div class="z a" id="eZa">VÉRTICE</div><div class="z e" id="eZe">GAS</div><div class="gn" id="eN"></div></div>
    <div class="em-phase" id="ePh"></div>
    <div class="era-row"><button class="era-btn hot" id="eGo">🛑 FRENAR</button></div>
    <div class="em-timing" id="eTime">⏱️ Vuelta en curso…</div>`;
  const lbl = ["🛑 FRENAR", "↪️ GIRAR", "🦶 ACELERAR"];
  const zoneOf = ph => { const C = E.corners[E.c]; return ph === 0 ? C.b : ph === 1 ? C.a : C.e; };
  const setup = () => {
    const C = E.corners[E.c];
    document.getElementById("eCn").textContent = "Sector " + (E.c + 1) + "/3 · " + C.n;
    [["eZb", C.b], ["eZa", C.a], ["eZe", C.e]].forEach(([id, x]) => { const z = document.getElementById(id); z.style.left = (x - w / 2) + "%"; z.style.width = w + "%"; z.classList.remove("hit", "miss"); });
    E.p = 0; E.ph = 0; E.cur = 0;
    const b = document.getElementById("eGo"); if (b) b.textContent = lbl[0];
    document.getElementById("ePh").textContent = "Esperá el punto de frenada…";
  };
  const mark = (ok, id) => { const z = document.getElementById(id); if (z) z.classList.add(ok ? "hit" : "miss"); };
  const tap = auto => {
    if (!eraAlive(E.id) || E.wait > 0) return;
    const center = zoneOf(E.ph), d = E.p - center, ad = Math.abs(d);
    let pen, txt;
    if (auto) { pen = 0.45; txt = ["¡No frenaste! Te pasaste de largo", "No giraste a tiempo: abriste la trazada", "Tardaste en acelerar"][E.ph]; }
    else if (ad <= w / 2) { pen = ad / (w / 2) * 0.05; txt = ["Frenada perfecta", "Vértice clavado", "Tracción perfecta"][E.ph]; }
    else if (d < 0) { pen = Math.min(0.35, 0.08 + (ad - w / 2) * 0.012); txt = ["Frenaste temprano", "Giraste antes de tiempo: te comiste el piano", "Aceleraste temprano: patinó la trasera"][E.ph]; }
    else { pen = Math.min(0.5, 0.12 + (ad - w / 2) * 0.018); txt = ["¡Bloqueaste las ruedas! Frenaste tarde", "Giraste tarde: te fuiste ancho", "Aceleraste tarde: perdiste velocidad en la recta"][E.ph]; }
    E.cur += pen;
    mark(pen < 0.1, ["eZb", "eZa", "eZe"][E.ph]);
    document.getElementById("ePh").innerHTML = (pen < 0.1 ? "✅ " : "⚠️ ") + txt + (pen >= 0.01 ? ` <b>(+${pen.toFixed(2)}s)</b>` : "");
    try { if (pen < 0.1) FWAudio.click(); } catch (e) {}
    E.ph++;
    if (E.ph < 3) { const b = document.getElementById("eGo"); if (b) b.textContent = lbl[E.ph]; return; }
    E.loss.push(E.cur);
    const col = E.cur < 0.08 ? "p" : E.cur < 0.25 ? "g" : "y";
    document.getElementById("eSec").innerHTML += `<span class="em-sec ${col}">S${E.c + 1}</span>`;
    E.c++; E.wait = 0.9;
    if (E.c >= E.corners.length) {
      const lap = E.base + E.loss.reduce((a, b) => a + b, 0);
      const gap = lap - E.pole;
      E.acc = Math.max(0, Math.min(1, 1 - gap / 1.2));
      document.getElementById("eTime").innerHTML = `⏱️ <b>${emFmtLap(lap)}</b> · Pole: ${emFmtLap(E.pole)} · <b style="color:${gap <= 0 ? "#a855f7" : gap < 0.4 ? "#22c55e" : "#facc15"}">${gap <= 0 ? "−" + Math.abs(gap).toFixed(3) + " ¡VUELTA MÁS RÁPIDA!" : "+" + gap.toFixed(3)}</b>`;
      window.__emLapAcc = E.acc;
      return eraEnd(gap < 0.35, gap <= 0 ? "¡Pole provisoria! Vuelta perfecta." : gap < 0.35 ? "Gran vuelta: a " + gap.toFixed(3) + " de la pole." : "Vuelta lenta: " + gap.toFixed(3) + " de la pole. Mirá dónde perdiste tiempo.");
    }
  };
  document.getElementById("eGo").onclick = () => tap(false);
  const key = ev => { if (!eraAlive(E.id)) return document.removeEventListener("keydown", key); if (ev.code === "Space") { ev.preventDefault(); tap(false); } };
  document.addEventListener("keydown", key);
  setup();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < E.corners.length) setup(); return; }
    const C = E.corners[E.c];
    E.p += dt * C.v * (E.ph === 0 ? 1 : 0.85);
    const n = document.getElementById("eN"); if (n) n.style.left = Math.min(100, E.p) + "%";
    if (E.p > zoneOf(E.ph) + w / 2 + 6) tap(true);
  });
}
(function () {
  // prácticas: "trazada" y "vuelta rápida" pasan a ser la vuelta real
  const o = window.renderDriverPracticeTask;
  if (typeof o === "function") window.renderDriverPracticeTask = function (idx, rName, injuryBanner) {
    const key = "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer;
    if (ERA && !ERA.dead && ERA.key === key && document.getElementById("eraStage")) return;
    const r = o.apply(this, arguments);
    try {
      if (!document.getElementById("eraStage") && (s._drvTask === "line" || s._drvTask === "fastlap")) {
        const tr = trackData[s.gp] || {};
        const turnLabel = s.player2 ? (s.activePlayer === 1 ? " · Turno P1" : " · Turno P2") : "";
        const stepHead = `<div class="session-steps"><span class="step done">1. Quiz F1</span><span class="step on">2. Vuelta real</span></div>` + (injuryBanner || "");
        emFrame(stepHead, "🏁", "Vuelta real en " + (tr.name || "") + turnLabel, "La vuelta tiene <b>3 sectores</b> y la ves en una <b>cinemática</b>. <b>Tocá la cinemática</b> en el cartel de FRENÁ (o la barra espaciadora). En la curva <b>doblás vos</b> con <b>◀ ▶</b> del volante (o las flechas / A-D) hasta pasar por el <b>cono naranja del vértice</b>: si no doblás, el auto se va para afuera y puede terminar en el muro. A la salida, <b>tocá</b> en el punto verde para acelerar. En el centro del volante, el <b>⚡ ERS</b> (tecla E) solo en la recta. Quedá a menos de 0.35s de la pole.", "emLap", null, key);
      }
    } catch (e) { console.warn(e); }
    return r;
  };
  // clasificación (desde rango 2): "Ejecutá la vuelta" pasa a ser una vuelta real
  const q = window.renderQualiSkillTest;
  if (typeof q === "function") window.renderQualiSkillTest = function () {
    if (s.playerMode !== "driver") return q.apply(this, arguments);
    const tr = trackData[s.gp] || {};
    emFrame("", "⏱️", "Vuelta de clasificación en " + (tr.name || ""), "La decisión ya está tomada: ahora <b>clavá la vuelta</b>. Frená y acelerá tocando la cinemática, doblá con ◀ ▶ del volante y " + (s.season >= 2009 ? "usá el " + (s.season >= 2014 ? "ERS" : "KERS") + " solo en las rectas" : "aprovechá el rebufo en las rectas") + ". Cuanto más cerca de la pole, mejor largás.", "emLap", ok => { const a = typeof window.__emLapAcc === "number" ? window.__emLapAcc : (ok ? 0.8 : 0.3); resolveQualiSkill(a); });
  };
})();
