/* =====================================================================================
   FAWIWE · V138
   Paquete 2: ⚔️ pases y defensas jugables · 👑 campeón del mundo · 🟢 relanzamiento del Safety Car
   Paquete 1: 🚦 largada jugable · 🏁 bandera a cuadros · 🌧️ lluvia en la clasificación
   + arreglos (pantallas en orden, celular, voz, menú, tarjeta, música).
   ===================================================================================== */
function v7Esc(t) { return v3Esc(t); }
function v7Say(a, who, o) { if (typeof DL !== "undefined" && DL && DL.skip) return; try { fwRadioSay(a, who, o); } catch (e) {} }
let v7Raf = null;

/* ============================ ⚔️ PASES Y DEFENSAS JUGABLES ============================ */
function v7QteOpen() {
  const P = DL.pendingQte; DL.pendingQte = null;
  if (!P) return false;
  const coverSide = dlH("qside" + P.lap + dlKey()) % 2 ? "in" : "out"; // atacando: dónde se defiende el rival · defendiendo: por dónde te ataca
  DL.qte = Object.assign(P, { step: "side", side: coverSide, t0: performance.now(), x: 0, v: 1, speed: s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8 });
  DL.phase = "qte";
  const nm = dlShort(P.other);
  if (P.atk) { dlFeed(P.lap, "🎯 ¡Lo tenés! " + P.other + " a " + P.gap.toFixed(1) + "s. Elegí por dónde atacar.", true); v7Say("Lo tenés a tiro. " + nm + " está cerrando " + (coverSide === "in" ? "el interior" : "el exterior") + ". ¿Por dónde vas?", "eng"); }
  else { dlFeed(P.lap, "⚔️ " + P.other + " te ataca a " + P.gap.toFixed(1) + "s.", true); v7Say("Cuidado, " + nm + " te ataca por " + (coverSide === "in" ? "adentro" : "afuera") + ". ¡Cerrá!", "eng"); }
  clearTimeout(DL._qteTO); DL._qteTO = setTimeout(() => { if (DL && DL.phase === "qte") v7QteFinish(false, true); }, 14000);
  dlDraw();
  return true;
}
function v7QteSide(side) {
  const Q = DL && DL.qte; if (!Q || Q.step !== "side") return;
  Q.choice = side;
  const good = Q.atk ? side !== Q.side : side === Q.side;
  Q.zone = good ? [34, 66] : [44, 56];
  Q.step = "brake"; Q.t0 = performance.now(); Q.x = 0; Q.v = 1;
  v7Say(Q.atk ? (side === "in" ? "Me tiro por adentro." : "Lo paso por afuera.") : (side === "in" ? "Cierro el interior." : "Cubro el exterior."), "you");
  cancelAnimationFrame(v7Raf);
  const step = () => {
    if (!DL || DL.phase !== "qte" || !DL.qte || DL.qte.step !== "brake") return;
    const q = DL.qte; q.x += q.v * q.speed * 1.8; if (q.x >= 100) { q.x = 100; q.v = -1; } if (q.x <= 0) { q.x = 0; q.v = 1; }
    const m = document.getElementById("v7Mark"); if (m) m.style.left = q.x + "%";
    v7Raf = requestAnimationFrame(step);
  };
  v7Raf = requestAnimationFrame(step);
  dlDraw();
}
function v7QteBrake() {
  const Q = DL && DL.qte; if (!Q || Q.step !== "brake") return;
  v7QteFinish(Q.x >= Q.zone[0] && Q.x <= Q.zone[1], false);
}
function v7QteFinish(ok, auto) {
  const Q = DL.qte; if (!Q) return;
  cancelAnimationFrame(v7Raf); clearTimeout(DL._qteTO);
  const st = dlState();
  if (auto && Q.step === "side") ok = dlH("qa" + Q.lap) % 3 === 0;
  const res = Q.atk ? (ok ? "gain" : "keep") : (ok ? "keep" : "lose");
  if (res !== "keep") st.moves.push({ other: Q.other, res, lap: Q.lap });
  const side = Q.choice === "in" ? "por adentro" : Q.choice === "out" ? "por afuera" : "";
  const txt = Q.atk ? (ok ? "⚔️ ¡ADENTRO! Pasaste a " + Q.other + " " + side + "." : "⚔️ " + Q.other + " cerró la puerta " + side + ". Seguís atrás.")
    : (ok ? "🛡️ ¡Defensa perfecta! " + Q.other + " no pudo pasarte." : "🛡️ " + Q.other + " te pasó " + (Q.side === "in" ? "por adentro" : "por afuera") + ".");
  dlFeed(Q.lap, txt, true, ok ? "ok" : "bad");
  v7Say(Q.atk ? (ok ? "¡Bien ahí, qué maniobra! Lo pasaste." : "No alcanzó. Volvé a intentarlo más adelante.") : (ok ? "¡Bien defendido! No lo dejes respirar." : "Te pasó. Tranquilo, pegate atrás y buscá el rebufo."), "eng");
  if (!auto) setTimeout(() => v7Say(Q.atk ? (ok ? "¡Adentro! ¡Vamos!" : "Uff, casi.") : (ok ? "¡No pasa nadie!" : "Me cerró, perdón."), "you", { toast: false }), 300);
  DL.qte = null; DL.phase = "run";
  dlRebuild();
  dlDraw();
}
function v7QteHtml() {
  const Q = DL.qte;
  const head = `<div class="q">${Q.atk ? "🎯 ¡ATACÁ A " : "🛡️ ¡DEFENDÉ DE "}${v7Esc(Q.other.toUpperCase())}! <span class="small">vuelta ${Q.lap}</span></div>`;
  if (Q.step === "side") {
    const cue = Q.atk ? `👀 ${v7Esc(dlShort(Q.other))} está cerrando <b>${Q.side === "in" ? "el interior" : "el exterior"}</b>.` : `🪞 Lo ves en el espejo por <b>${Q.side === "in" ? "adentro (izquierda)" : "afuera (derecha)"}</b>.`;
    return `<div class="eng-live-dec v7-qte">${head}<p class="small">${cue} ${Q.atk ? "Atacá por el lado libre." : "Cubrí ese lado."}</p>
      <div class="v7-sides"><button type="button" class="lv-btn" onclick="v7QteSide('in')">↙️ ${Q.atk ? "Por adentro" : "Cerrar adentro"} <kbd>←</kbd></button><button type="button" class="lv-btn" onclick="v7QteSide('out')">${Q.atk ? "Por afuera" : "Cubrir afuera"} ↗️ <kbd>→</kbd></button></div></div>`;
  }
  return `<div class="eng-live-dec v7-qte">${head}<p class="small">${Q.atk ? "¡Frená justo en la zona verde para meterte!" : "¡Frená justo en la zona verde para aguantar!"}</p>
    <div class="dl-duel-bar"><i class="z" style="left:${Q.zone[0]}%;width:${Q.zone[1] - Q.zone[0]}%"></i><b id="v7Mark" style="left:${Q.x}%"></b></div>
    <button type="button" class="lv-btn red" onclick="v7QteBrake()">🛑 ¡FRENÁ! <kbd>Espacio</kbd></button></div>`;
}

/* ============================ 🟢 RELANZAMIENTO DEL SAFETY CAR ============================ */
function v7RestartOpen() {
  const l = DL.pendingRestart; DL.pendingRestart = null;
  if (!l || !DL.me || DL.me.t.length <= l) return false;
  DL.rs = { lap: l, t0: performance.now(), goAt: performance.now() + 1400 + (dlH("rs" + dlKey()) % 1600), state: "wait" };
  DL.phase = "restart";
  dlFeed(l, "🟡 El Safety Car entra a boxes en esta vuelta. Preparate para el relanzamiento.", true);
  v7Say("Safety car en esta vuelta. Prepará el relanzamiento: acelerá cuando se apaguen las luces del auto de seguridad.", "eng");
  const tick = () => { if (!DL || DL.phase !== "restart" || !DL.rs) return; if (DL.rs.state === "wait" && performance.now() >= DL.rs.goAt) { DL.rs.state = "go"; dlDraw(); } if (DL.rs.state === "go" && performance.now() - DL.rs.goAt > 2500) { v7RestartHit(true); return; } v7Raf = requestAnimationFrame(tick); };
  v7Raf = requestAnimationFrame(tick);
  dlDraw();
  return true;
}
function v7RestartHit(timeout) {
  const R = DL && DL.rs; if (!R) return;
  cancelAnimationFrame(v7Raf);
  const now = performance.now(), st = dlState(), me = DL.me, l = R.lap;
  const cur = me.pos[l];
  const ahead = DL.data.rows.find(r => r.pos[l] === cur - 1 && r.t.length > l), behind = DL.data.rows.find(r => r.pos[l] === cur + 1 && r.t.length > l);
  let txt, cls, say;
  if (R.state === "wait") { txt = "⚠️ Aceleraste antes de tiempo y tuviste que levantar: " + (behind ? behind.name + " te pasó." : "perdiste el impulso."); cls = "bad"; if (behind) st.moves.push({ other: behind.name, res: "lose", lap: l }); say = "¡Muy temprano! Casi le pegás al de adelante."; }
  else {
    const rt = timeout ? 9 : (now - R.goAt) / 1000;
    if (rt < 0.3 && ahead) { st.moves.push({ other: ahead.name, res: "gain", lap: l }); txt = "🚀 ¡Relanzamiento perfecto (" + rt.toFixed(2) + "s)! Pasaste a " + ahead.name + "."; cls = "ok"; say = "¡Qué relanzamiento! Lo pasaste."; }
    else if (rt < 0.6) { txt = "👍 Buen relanzamiento (" + rt.toFixed(2) + "s): mantuviste la posición."; cls = ""; say = "Buen relanzamiento. Mantenemos."; }
    else { if (behind) st.moves.push({ other: behind.name, res: "lose", lap: l }); txt = "🐢 Relanzamiento lento" + (timeout ? "" : " (" + rt.toFixed(2) + "s)") + (behind ? ": " + behind.name + " te pasó." : "."); cls = "bad"; say = "Te dormiste en el relanzamiento."; }
  }
  dlFeed(l, txt, true, cls);
  v7Say(say, "eng");
  DL.rs = null; DL.phase = "run";
  dlRebuild(); dlDraw();
}
function v7RestartHtml() {
  const R = DL.rs, go = R.state === "go";
  return `<div class="eng-live-dec v7-rs"><div class="q">🟡 RELANZAMIENTO · vuelta ${R.lap}</div><p class="small">Mantené la distancia y acelerá apenas se pone verde. Si acelerás antes, perdés el impulso.</p>
    <div class="v7-sc ${go ? "go" : ""}"><div class="v7-sccar">🚓</div><i></i><i></i><span>${go ? "¡VERDE! ¡ACELERÁ!" : "Safety Car en pista…"}</span></div>
    <button type="button" class="lv-btn red" onclick="v7RestartHit(false)">🟢 ¡ACELERÁ! <kbd>Espacio</kbd></button></div>`;
}

/* ============================ 🚦 LARGADA JUGABLE ============================ */
function v7StartOpen() {
  if (!DL || DL.mode !== "race" || DL.skip || !DL.me || DL.me.status === "DNS") return;
  const delay = 900 + (dlH("st" + dlKey()) % 1700);
  DL.st = { t0: performance.now(), n: 0, outAt: performance.now() + 5 * 750 + 400 + delay, state: "lights" };
  DL.phase = "start";
  clearInterval(dlTimer);
  v7Say("Vuelta de formación terminada. Concentrado: cuando se apaguen las luces, ¡a fondo!", "eng");
  const tick = () => {
    if (!DL || DL.phase !== "start" || !DL.st) return;
    const S = DL.st, now = performance.now();
    const n = Math.min(5, Math.floor((now - S.t0) / 750));
    if (n !== S.n) { S.n = n; try { FWAudio.beep(false); } catch (e) {} const ls = document.querySelectorAll("#v7Lights i"); ls.forEach((x, k) => x.classList.toggle("on", k < n && S.state === "lights")); }
    if (S.state === "lights" && now >= S.outAt) { S.state = "out"; try { FWAudio.beep(true); } catch (e) {} document.querySelectorAll("#v7Lights i").forEach(x => x.classList.remove("on")); const t = document.getElementById("v7StartTxt"); if (t) t.textContent = "¡LUCES AFUERA!"; }
    if (S.state === "out" && now - S.outAt > 2500) { v7StartHit(true); return; }
    v7Raf = requestAnimationFrame(tick);
  };
  v7Raf = requestAnimationFrame(tick);
  dlDraw();
}
function v7StartHit(timeout) {
  const S = DL && DL.st; if (!S) return;
  cancelAnimationFrame(v7Raf);
  const st = dlState(), me = DL.me, now = performance.now();
  const p0 = me.pos[0];
  const at = p => DL.data.rows.find(r => r.pos[0] === p && r.status !== "DNS");
  let txt, cls, say;
  if (S.state !== "out") {
    st.jumpPen = 5; txt = "🚨 ¡LARGADA EN FALSO! Saliste antes de que se apaguen las luces: +5 segundos."; cls = "bad"; say = "Largada en falso. Nos van a sancionar con cinco segundos.";
  } else {
    const rt = timeout ? 9 : (now - S.outAt) / 1000;
    if (rt < 0.2) { [at(p0 - 1), at(p0 - 2)].filter(Boolean).forEach(r => st.moves.push({ other: r.name, res: "gain", lap: 0 })); txt = "🚀 ¡LARGADÓN! Reacción de " + rt.toFixed(3) + "s: ganás dos lugares en la primera curva."; cls = "ok"; say = "¡Qué largada! Ganaste dos lugares."; }
    else if (rt < 0.32) { const r = at(p0 - 1); if (r) st.moves.push({ other: r.name, res: "gain", lap: 0 }); txt = "✅ Buena largada (" + rt.toFixed(3) + "s): ganás un lugar."; cls = "ok"; say = "Buena largada, ganaste uno."; }
    else if (rt < 0.5) { txt = "👍 Largada correcta (" + rt.toFixed(3) + "s): mantenés el lugar."; cls = ""; say = "Largada limpia. Mantenemos."; }
    else { const r = at(p0 + 1); if (r) st.moves.push({ other: r.name, res: "lose", lap: 0 }); txt = "🐢 Largada lenta" + (timeout ? "" : " (" + rt.toFixed(3) + "s)") + ": perdés un lugar."; cls = "bad"; say = "Nos dormimos en la largada. Perdimos uno, a recuperarlo."; }
  }
  dlFeed(0, txt, true, cls);
  v7Say(say, "eng");
  DL.st = null; DL.phase = "run";
  dlRebuild(); dlDraw(); dlSchedule();
  // primera transmisión: después de la largada se explica la pantalla
  setTimeout(() => {
    try {
      if (!DL || DL.phase !== "run" || typeof v4Coach !== "function") return;
      DL.phase = "coach";
      const ok = v4Coach("dl", [
        { sel: "#dlBoard", t: "📺 La transmisión", d: "Acá ves la carrera vuelta por vuelta: posiciones, diferencias y paradas en boxes (🔧)." },
        { sel: "#dlMap", t: "🗺️ El mapa", d: "Los puntitos son los autos. El tuyo es el más grande, con borde blanco." },
        { sel: "#dlRadioBar", t: "📻 Tu radio", d: "Quejate con Q o cambiá la estrategia con T. También ves tus gomas y a tu ingeniero." },
        { sel: "#dlFeed", t: "🎬 Highlights", d: "Todo lo importante. Cuando aparezca un pase o una defensa, la carrera se pausa y lo jugás vos." }
      ], () => { if (DL) { DL.phase = "run"; dlSchedule(); } });
      if (!ok && DL) DL.phase = "run";
    } catch (e) { if (DL) DL.phase = "run"; }
  }, 900);
}
function v7StartHtml() {
  const S = DL.st;
  return `<div class="eng-live-dec v7-start"><div class="q">🚦 LARGADA · P${DL.me.pos[0]}</div>
    <div class="v7-lights" id="v7Lights">${[0, 1, 2, 3, 4].map(k => `<i class="${k < S.n && S.state === "lights" ? "on" : ""}"></i>`).join("")}</div>
    <div class="v7-start-txt" id="v7StartTxt">${S.state === "out" ? "¡LUCES AFUERA!" : "Esperá que se apaguen las 5 luces…"}</div>
    <button type="button" class="lv-btn red" onclick="v7StartHit(false)">🏁 ¡LARGAR! <kbd>Espacio</kbd></button></div>`;
}

/* ============================ 🏁 BANDERA A CUADROS ============================ */
function v7Flag(pos, status, name, color) {
  let ov = document.getElementById("v7Flag");
  if (!ov) { ov = document.createElement("div"); ov.id = "v7Flag"; ov.addEventListener("click", () => ov.classList.remove("show")); document.body.appendChild(ov); }
  const big = status ? (status === "DNF" ? "ABANDONO" : status) : pos === 1 ? "¡VICTORIA!" : pos <= 3 ? "¡PODIO!" : pos <= 10 ? "P" + pos + " · EN LOS PUNTOS" : "P" + pos;
  const era = typeof fwEra === "function" ? fwEra(s.season).y : 2026;
  ov.innerHTML = `<div class="v7-flag-wrap"><div class="v7-checker"></div><div class="v7-flag-k">🏁 BANDERA A CUADROS · ${v7Esc(((trackData[s.gp] || {}).name || "").toUpperCase())}</div>
    <div class="v7-line"></div><div class="v7-car">${status ? "" : fwCarSvg(era, color)}</div>
    <div class="v7-flag-big ${pos === 1 && !status ? "win" : ""}">${v7Esc(big)}</div><div class="v7-flag-name">${v7Esc(name)}</div><div class="v7-flag-tap">Tocá para seguir</div></div>`;
  ov.classList.remove("show"); void ov.offsetWidth; ov.classList.add("show");
  clearTimeout(ov._t); ov._t = setTimeout(() => ov.classList.remove("show"), 5200);
}

/* ============================ 👑 CAMPEÓN DEL MUNDO ============================ */
function v7ChampShow(info) {
  const busy = () => document.querySelector("#resultOverlay.show, #seasonChangesOverlay.show, #podOverlay.show, #v7Flag.show, #dlOverlay.show, #engLiveOverlay.show, #qlOverlay.show");
  if (busy()) { setTimeout(() => v7ChampShow(info), 700); return; }
  let ov = document.getElementById("v7Champ");
  if (!ov) { ov = document.createElement("div"); ov.id = "v7Champ"; document.body.appendChild(ov); }
  const fw = Array.from({ length: 7 }, (_, i) => `<div class="v7-fw" style="left:${8 + i * 14}%;animation-delay:${(i % 4) * 0.55}s;--c:${["#facc15", "#e10600", "#38bdf8", "#22c55e", "#fff", "#f472b6", "#fb923c"][i]}">${Array.from({ length: 12 }, (_, k) => `<i style="--a:${k * 30}deg"></i>`).join("")}</div>`).join("");
  const era = typeof fwEra === "function" ? fwEra(info.season).y : 2026;
  ov.innerHTML = `${fw}<div class="v7-champ-card"><div class="hof-k">CAMPEONATO MUNDIAL DE F1 · ${info.season}</div><div class="v7-trophy">🏆</div>
    <h1>¡CAMPEÓN DEL MUNDO!</h1><div class="v7-champ-name">${v7Esc(info.name)}</div><div class="v7-champ-team">${v7Esc(info.team)}</div>
    <div class="v7-champ-car"><span class="v7-one">1</span>${fwCarSvg(era, info.color)}</div>
    <div class="v3-hof-stats big">${[["🏆", "Victorias", info.wins], ["🍾", "Podios", info.pods], ["⭐", "Puntos", info.pts], ["🥇", "Títulos", info.titles]].map(x => `<div><i>${x[0]}</i><b>${x[2]}</b><span>${x[1]}</span></div>`).join("")}</div>
    <button type="button" class="lv-btn red" onclick="document.getElementById('v7Champ').classList.remove('show')">👑 ¡Vamos!</button></div>`;
  ov.classList.add("show");
  try { v3Fanfare(); setTimeout(() => v3Fanfare(), 1800); } catch (e) {}
  const drv = s.playerMode === "driver";
  setTimeout(() => { try { fwRadioSay(drv ? "¡Sos campeón del mundo! ¡Campeón del mundo! ¡Increíble temporada!" : "¡Campeones del mundo! ¡Lo hicimos, equipo!", drv ? "eng" : "drv", { priority: true }); } catch (e) {} }, 900);
  setTimeout(() => { try { fwRadioSay(drv ? "¡Gracias, equipo! ¡Esto es de todos!" : "¡Gracias a todos en la fábrica!", drv ? "you" : "you", { toast: true }); } catch (e) {} }, 4200);
}

/* ============================ 🌧️ LLUVIA EN LA CLASIFICACIÓN ============================ */
function v7QlRainInit() {
  if (!QL) return;
  const n = QL.S.length, h = Math.abs(deterministicHash("qlrain" + QL.key));
  const p = s.weather && s.weather.wet ? 55 : 22;
  if (h % 100 < p) QL.rain = { si: h % n, tick: 3 + (h >> 3) % 3, done: false, stops: (h >> 5) % 100 < 35 };
}
function v7QlRainCheck() {
  const R = QL && QL.rain; if (!R || R.done || QL.si !== R.si || QL.tick !== R.tick || QL.phase !== "run") return false;
  R.done = true; QL.wet = true;
  const S = QL.S[QL.si];
  qlFeed("🌧️ ¡Empieza a llover en la " + S.id + "! Los tiempos se van a caer.", "bad");
  qlSay(QL.eng ? "Lluvia en la " + S.id + ". ¿Mandamos los autos ya?" : "¡Lluvia! Empieza a llover en el sector dos. ¿Salimos ya?", QL.eng ? "drv" : "eng");
  const car = QL.order.slice(0, S.k).filter(x => x.mine && !x.noTime).sort((a, b) => a.seat - b.seat)[0];
  if (!car) return true;
  const roll = Math.abs(deterministicHash("qlr2" + QL.key)) % 100;
  QL.dec = {
    car: car.name,
    q: "🌧️ " + S.id + " · Llueve" + (QL.eng ? ": ¿qué hace " + car.name.replace(" (reserva)", "") + "?" : ": ¿qué hacés?"),
    hint: "El radar dice que " + (R.stops ? "puede ser un chaparrón corto." : "va a llover un buen rato.") + " Salir ya es marcar tiempo antes de que empeore; esperar es apostar a que pare.",
    def: 0,
    opts: [
      { label: "🏃 Salir YA a marcar tiempo", say: QL.eng ? "Salí ya, antes de que empeore." : "Salgo ya, antes de que empeore.", fx: () => roll < 70 ? { d: -2, txt: "✅ Marcaste antes de que la pista se mojara del todo: ¡ganaste lugares!", cls: "ok" } : { d: 1, txt: "⚠️ Te agarró el agua en la última curva.", cls: "bad" } },
      { label: "⏳ Esperar a que pare", say: QL.eng ? "Esperá en boxes, puede parar." : "Espero, puede parar.", fx: () => R.stops ? { d: -1, txt: "☀️ ¡Paró y la pista se secó! Buena lectura.", cls: "ok" } : { d: 2, txt: "🌧️ No paró: la pista quedó peor y perdiste lugares.", cls: "bad" } }
    ]
  };
  QL.phase = "dec"; QL.decLeft = 10;
  clearInterval(qlDecTimer);
  qlDecTimer = setInterval(() => { if (!QL || QL.phase !== "dec") { clearInterval(qlDecTimer); return; } QL.decLeft--; const el = document.getElementById("qlDecLeft"); if (el) el.textContent = QL.decLeft + "s"; if (QL.decLeft <= 0) qlChoose(QL.dec.def); }, 1000);
  qlDraw();
  return true;
}

/* ============================ ganchos ============================ */
(function () {
  // transmisión de piloto: abrir lo pendiente después de cada vuelta
  if (typeof dlRaceExtras === "function") {
    const o = dlRaceExtras;
    dlRaceExtras = function (l) {
      if (o.apply(this, arguments)) return true;
      if (!DL || DL.mode !== "race") return false;
      if (DL.skip) {
        if (DL.pendingQte) { const P = DL.pendingQte; DL.pendingQte = null; if (!P.atk && dlH("qs" + P.lap) % 3 === 0) dlState().moves.push({ other: P.other, res: "lose", lap: P.lap }); }
        DL.pendingRestart = null;
        return false;
      }
      if (DL.pendingRestart) return v7RestartOpen();
      if (DL.pendingQte) return v7QteOpen();
      return false;
    };
  }
  if (typeof dlDraw === "function") {
    const o = dlDraw;
    dlDraw = function () {
      const r = o.apply(this, arguments);
      try {
        const box = document.getElementById("dlDecision");
        if (box && DL) { if (DL.phase === "qte" && DL.qte) box.innerHTML = v7QteHtml(); else if (DL.phase === "restart" && DL.rs) box.innerHTML = v7RestartHtml(); else if (DL.phase === "start" && DL.st) box.innerHTML = v7StartHtml(); }
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlSkip === "function") {
    const o = dlSkip;
    dlSkip = function () {
      try {
        if (DL && DL.phase === "qte") v7QteFinish(false, true);
        if (DL && DL.phase === "restart") { DL.rs.state = "go"; DL.rs.goAt = performance.now(); v7RestartHit(false); }
        if (DL && DL.phase === "start") { DL.st.state = "out"; DL.st.outAt = performance.now() - 400; v7StartHit(false); }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  if (typeof dlStart === "function") {
    const o = dlStart;
    dlStart = function () {
      const r = o.apply(this, arguments);
      try { if (DL && DL.mode === "race" && !DL.skip && DL.phase === "run" && DL.lap === 0) setTimeout(() => { if (DL && DL.phase === "run" && DL.lap === 0) v7StartOpen(); }, 400); } catch (e) {}
      return r;
    };
  }
  if (typeof dlEnd === "function") {
    const o = dlEnd;
    dlEnd = function () {
      const skip = DL && DL.skip, mode = DL && DL.mode;
      const r = o.apply(this, arguments);
      try {
        if (!skip && mode === "race") {
          const me = DL.grid.find(x => x.mine && x.seat === 1);
          if (me) v7Flag(me.pos, me.status, s.playedDriverName || "", (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600");
          if (me && !me.status) setTimeout(() => v7Say(me.pos === 1 ? "¡GANAMOS! ¡Sí! ¡Gracias, equipo!" : me.pos <= 3 ? "¡Podio! ¡Vamos!" : me.pos <= 10 ? "Puntos. Buen trabajo, chicos." : "Hoy no se pudo. Vamos a mejorar.", "you", { toast: false }), 2600);
        }
      } catch (e) {}
      return r;
    };
  }
  document.addEventListener("keydown", ev => {
    if (!DL || !document.getElementById("dlOverlay")?.classList.contains("show")) return;
    const k = ev.key;
    if (DL.phase === "qte" && DL.qte) {
      if (DL.qte.step === "side" && (k === "ArrowLeft" || k === "1")) { ev.preventDefault(); v7QteSide("in"); }
      else if (DL.qte.step === "side" && (k === "ArrowRight" || k === "2")) { ev.preventDefault(); v7QteSide("out"); }
      else if (DL.qte.step === "brake" && (k === " " || k === "Enter" || k === "ArrowDown")) { ev.preventDefault(); v7QteBrake(); }
    } else if (DL.phase === "restart" && (k === " " || k === "Enter" || k === "ArrowUp")) { ev.preventDefault(); v7RestartHit(false); }
    else if (DL.phase === "start" && (k === " " || k === "Enter" || k === "ArrowUp")) { ev.preventDefault(); v7StartHit(false); }
  }, true);
  // ingeniero: bandera a cuadros al terminar la transmisión
  if (typeof engLiveTick === "function") {
    const o = engLiveTick;
    engLiveTick = function () {
      const L = engLive, before = L && L.phase;
      const r = o.apply(this, arguments);
      try {
        if (L && before !== "finished" && L.phase === "finished" && !L.skip) {
          const mine = (L.target || []).filter(x => x.mine && !x.status).sort((a, b) => (a.pos || 99) - (b.pos || 99));
          const order = L.target ? L.target.filter(x => !x.status) : [];
          const best = mine[0];
          if (best) { const pos = order.indexOf(best) + 1; v7Flag(pos, null, best.name.replace(" (reserva)", "") + " · " + s.team, (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600"); setTimeout(() => { try { fwRadioSay(pos === 1 ? "¡Ganamos! ¡Gracias, equipo!" : pos <= 3 ? "¡Podio para el equipo!" : "Bandera a cuadros. Buen trabajo.", "drv"); } catch (e) {} }, 1800); }
        }
      } catch (e) {}
      return r;
    };
  }
  // campeón del mundo
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const titles = s.titles || 0, season = s.season;
    let pts = 0;
    try { pts = s.playerMode === "driver" ? Math.round((s.driverPoints || {})[(s.playedDriverName || "").replace(" (reserva)", "")] || 0) : Math.round(s.points || 0); } catch (e) {}
    const info = { season, name: s.playerMode === "driver" ? (s.playedDriverName || "") : (s.name || s.team), team: s.team, color: (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600", wins: s.wins || 0, pods: s.podiums || 0, pts };
    const r = ng.apply(this, arguments);
    try { if ((s.titles || 0) > titles) { info.titles = s.titles; setTimeout(() => v7ChampShow(info), 600); } } catch (e) {}
    return r;
  };
  // clasificación: lluvia en cualquier tanda
  if (typeof qlStart === "function") { const o = qlStart; qlStart = function () { const r = o.apply(this, arguments); try { v7QlRainInit(); } catch (e) {} return r; }; }
  if (typeof qlTick === "function") {
    const o = qlTick;
    qlTick = function () {
      if (QL && QL.phase === "run" && QL.rain && !QL.rain.done && QL.si === QL.rain.si && QL.tick + 1 === QL.rain.tick) { QL.tick++; if (v7QlRainCheck()) return; QL.tick--; }
      return o.apply(this, arguments);
    };
  }
  if (typeof qlFinalTime === "function") { const o = qlFinalTime; qlFinalTime = function () { return o.apply(this, arguments) + (QL && QL.wet ? 2.4 : 0); }; }
})();

/* ============================ 🛠️ ARREGLOS ============================ */
(function () {
  // 5) voz: si el navegador no tiene voz en español, la radio queda en texto (y avisa una vez)
  if (typeof fwRadioSay === "function") {
    const o = fwRadioSay;
    fwRadioSay = function (text, who, opt) {
      try {
        const all = window.speechSynthesis ? speechSynthesis.getVoices() : [];
        if (all.length && !all.some(v => /^es/i.test(v.lang))) {
          if (!window._v7NoEs) { window._v7NoEs = true; setTimeout(() => { try { fwRadioToast("Tu navegador no tiene voz en español: la radio se muestra en texto.", "eng"); } catch (e) {} }, 3000); }
          if (!opt || opt.toast !== false) fwRadioToast(text, who);
          return;
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  // 6) presentación de TV del ingeniero: se salta también con el teclado
  document.addEventListener("keydown", ev => { const ps = document.getElementById("engPreShow"); if (ps && ["Enter", " ", "Escape"].includes(ev.key)) { ev.preventDefault(); ps.click(); } });
  // 3) celular: el mapa de la transmisión va arriba del tablero
  if (typeof dlEnsureOverlay === "function") {
    const o = dlEnsureOverlay;
    dlEnsureOverlay = function () {
      const r = o.apply(this, arguments);
      try {
        const map = document.getElementById("dlMap"), board = document.getElementById("dlBoard");
        if (map && board && window.matchMedia("(max-width:760px)").matches && map.nextElementSibling !== board.previousElementSibling) board.parentNode.insertBefore(map, board.parentNode.firstChild);
      } catch (e) {}
      return r;
    };
  }
  // 7) carrera rápida: volver al menú sin preguntar
  window.v7BackToMenu = function () {
    try { closeResultOverlay(); } catch (e) {}
    document.getElementById("game")?.classList.add("hidden");
    document.getElementById("setup")?.classList.remove("hidden");
    document.getElementById("saveMenuBox")?.classList.add("hidden");
    try { window.scrollTo(0, 0); v4MenuBox(); } catch (e) {}
  };
  // 10) música del menú: arranca un rato después de que termina la intro
  const di = window.dismissIntro;
  if (typeof di === "function") window.dismissIntro = function () { window._v7IntroAt = Date.now(); return di.apply(this, arguments); };
  if (typeof v4MusWanted === "function") { const o = v4MusWanted; v4MusWanted = function () { return o.apply(this, arguments) && Date.now() - (window._v7IntroAt || 0) > 2500; }; }
})();
