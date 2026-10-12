/* =====================================================================================
   FAWIWE · MANEJO DE ÉPOCA (Modo Piloto)
   Cada época se maneja distinto, así que tiene su propio minijuego de manejo:
   1950 doble embrague · 1968 contravolante · 1978 efecto suelo · 1988 turbo lag ·
   1998 reabastecimiento · 2009 KERS · 2026 aerodinámica activa.
   Aparece en las prácticas del Modo Piloto, rotando con los ejercicios de siempre.
   ===================================================================================== */
const FW_ERA_MINI = [
  { id: "clutch", title: "Doble embrague", how: "Caja manual sin sincronizar. Para cada cambio tocá <b>EMBRAGUE</b> y enseguida <b>CAMBIO</b> mientras la aguja está en la zona verde. Llegá a 5ª sin romper la caja (máximo 2 errores)." },
  { id: "slide", title: "Contravolante", how: "Ruedas finitas y cero ayudas: el auto patina solo. Corregí con <b>◀</b> y <b>▶</b> para que no se te vaya de cola. Aguantá hasta el final sin hacer trompo." },
  { id: "ground", title: "Efecto suelo", how: "Mantené apretado <b>ACELERAR</b> en rectas y curvas (el auto va pegado al piso)… pero <b>soltá</b> en los pianos: si los pisás a fondo, perdés el efecto suelo. Precisión mínima: 70%." },
  { id: "turbo", title: "Turbo lag", how: "El turbo tarda en llegar. Tocá <b>ACELERAR</b> ANTES del vértice: la potencia aparece un rato después (la línea celeste te dice dónde llega si tocás ahora). Que llegue dentro de la zona verde. 2 de 3 curvas." },
  { id: "fuel", title: "Reabastecimiento", how: "Parada en boxes con nafta: mantené apretado <b>CARGAR</b> y soltá cuando el tanque esté dentro de la zona verde. Ni de más (pesa) ni de menos (no llegás). 2 de 3 paradas." },
  { id: "kers", title: "KERS", how: "Tenés batería para unos segundos de empujón por vuelta. Mantené <b>KERS</b> en las <b>rectas</b>; en las curvas patina y la desperdiciás. Usá al menos 75% en rectas." },
  { id: "aero", title: "Aerodinámica activa", how: "Alerones que se mueven: en las <b>rectas</b> usá <b>MODO RECTA</b> (menos resistencia) y en las <b>curvas</b> <b>MODO CURVA</b> (más carga). Precisión mínima: 70%." }
];
function fwHash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
let ERA = null; // estado del minijuego en curso
function eraSpeed() {
  const d = (typeof s !== "undefined" && s.miniDiff) || "normal";
  // más lento en general, y según el nivel: dificultad elegida + tu rango (arrancás más tranquilo)
  const base = d === "easy" ? 0.6 : d === "hard" ? 1.0 : 0.78;
  let tier = 0; try { tier = (typeof s !== "undefined" && s.playerMode === "driver" && typeof driverTierIndex === "function") ? driverTierIndex() : tierIndex(); } catch (e) {}
  return +(base * (0.92 + Math.min(6, Math.max(0, tier)) * 0.025)).toFixed(3);
}
function eraColor() { return (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600"; }
function eraStop() { if (ERA) { ERA.dead = true; cancelAnimationFrame(ERA.raf); (ERA.timers || []).forEach(clearTimeout); } ERA = null; }
function eraAlive(id) { return ERA && !ERA.dead && ERA.id === id && document.getElementById("eraStage"); }
function eraMsg(t) { const m = document.getElementById("eraMsg"); if (m) m.innerHTML = t; }
function eraEnd(ok, txt) {
  if (!ERA || ERA.dead) return;
  const st = ERA;
  eraStop();
  eraMsg((ok ? "✅ " : "❌ ") + txt);
  try { if (typeof FWAudio !== "undefined") ok ? FWAudio.ok() : FWAudio.bad(); } catch (e) {}
  document.querySelectorAll("#eraStage button").forEach(b => (b.disabled = true));
  const cb = st.done || (typeof finishMini === "function" ? finishMini : null);
  setTimeout(() => { if (cb) cb(ok); }, 1100);
  return st;
}
function eraLoop(fn) {
  const id = ERA.id;
  let last = performance.now();
  const step = now => {
    if (!eraAlive(id)) { if (ERA && ERA.id === id && !document.getElementById("eraStage")) eraStop(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    fn(dt);
    if (ERA && !ERA.dead) ERA.raf = requestAnimationFrame(step);
  };
  ERA.raf = requestAnimationFrame(step);
}
function eraHold(btn, on, off) {
  if (!btn) return;
  // mantener apretado: el dedo se puede mover un poco sin que se corte (no hace scroll)
  btn.style.touchAction = "none";
  let down = false;
  const dn = e => { e.preventDefault(); down = true; try { btn.setPointerCapture(e.pointerId); } catch (x) {} on(); };
  const up = e => { if (!down) return; down = false; e.preventDefault(); off(); };
  btn.addEventListener("pointerdown", dn);
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => btn.addEventListener(ev, up));
  btn.addEventListener("contextmenu", e => e.preventDefault());
}

/* ---------- pantalla ---------- */
function renderEraTask(stepHead, turnLabel) {
  eraStop();
  const k = fwEraIdx(s.season), era = FW_ERAS[k], g = FW_ERA_MINI[k];
  const jobArea = document.getElementById("jobArea");
  if (!jobArea) return;
  jobArea.innerHTML = stepHead + `
    <div class="era-mini">
      <div class="mini-explain"><div class="era-head"><div class="era-svg">${fwCarSvg(era.y, eraColor())}</div><div><b>🏎️ Manejo de época · ${s.season} · ${g.title}${turnLabel || ""}</b><br><span class="small">${engEsc(era.cap)}</span></div></div>
      <p style="margin:8px 0 0">${g.how}</p></div>
      <div class="era-stage" id="eraStage"><p class="small" style="text-align:center;margin:30px 0">Así se manejaba en ${era.y}. Tocá ARRANCAR cuando estés listo.</p></div>
      <div class="era-msg" id="eraMsg"></div>
      <button class="start-btn" id="startMiniBtn" onclick="eraStart()">▶ ARRANCAR</button>
    </div>`;
}
function eraStart() {
  if (ERA) return;
  const k = fwEraIdx(s.season), g = FW_ERA_MINI[k];
  const btn = document.getElementById("startMiniBtn");
  if (btn) btn.style.display = "none";
  s.miniStarted = true;
  ERA = { id: g.id + "_" + Date.now(), kind: g.id, timers: [], key: "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer };
  eraMsg("");
  ({ clutch: eraClutch, slide: eraSlide, ground: eraGround, turbo: eraTurbo, fuel: eraFuel, kers: eraKers, aero: eraAero })[g.id]();
  eraShowControls();
}

/* 1950 · doble embrague */
function eraClutch() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Marcha: <b id="eGear">1ª</b></span><span>Errores: <b id="eErr">0</b>/3</span><span>⏱️ <b id="eT"></b></span></div>
    <div class="era-gauge"><div class="gz" style="left:68%;width:18%"></div><div class="gr"></div><div class="gn" id="eN"></div></div>
    <div class="era-row"><button class="dark" id="eClutch">🦶 EMBRAGUE</button><button class="era-btn hot" id="eShift">⬆️ CAMBIO</button></div>`;
  const E = ERA, sp = eraSpeed();
  E.rpm = 25; E.gear = 1; E.err = 0; E.clutchAt = -9; E.t = 0; E.limit = 16 / sp;
  const now = () => E.t;
  document.getElementById("eClutch").onclick = () => { E.clutchAt = now(); eraMsg("Embrague adentro… ¡CAMBIO!"); };
  document.getElementById("eShift").onclick = () => {
    if (!eraAlive(E.id)) return;
    if (now() - E.clutchAt > 0.9) return eraMiss("💥 ¡Crujió la caja! Primero el embrague.");
    if (E.rpm < 68 || E.rpm > 86) return eraMiss(E.rpm < 68 ? "Muy temprano: el motor se ahoga." : "Muy tarde: se pasó de vueltas.");
    E.gear++; E.rpm = 30; E.clutchAt = -9;
    document.getElementById("eGear").textContent = E.gear + "ª";
    eraMsg("👌 Cambio limpio");
    if (E.gear >= 5) eraEnd(true, "¡Llegaste a 5ª como un piloto de los 50!");
  };
  function eraMiss(t) {
    E.err++; E.rpm = 30; E.clutchAt = -9;
    document.getElementById("eErr").textContent = E.err;
    eraMsg("⚠️ " + t);
    if (E.err > 2) eraEnd(false, "La caja no aguantó más.");
  }
  eraLoop(dt => {
    E.t += dt;
    E.rpm += dt * (34 - E.gear * 3) * sp;
    if (E.rpm >= 100) eraMiss("Se pasó de vueltas el motor.");
    if (!ERA) return;
    const n = document.getElementById("eN"); if (n) n.style.left = Math.min(100, E.rpm) + "%";
    const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.limit - E.t).toFixed(1) + "s";
    if (E.t >= E.limit) eraEnd(false, "Se acabó el tiempo en " + E.gear + "ª.");
  });
}

/* 1968 · contravolante */
function eraSlide() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Mantené el auto en la zona verde</span><span>⏱️ <b id="eT"></b></span></div>
    <div class="era-bal"><div class="bz"></div><div class="bc" id="eCar">${fwCarSvg(1968, eraColor())}</div></div>
    <div class="era-row"><button class="dark" id="eL">◀ IZQUIERDA</button><button class="dark" id="eR">DERECHA ▶</button></div>`;
  const E = ERA, sp = eraSpeed();
  E.x = 0; E.v = 0; E.f = 0; E.t = 0; E.limit = 8; E.inZone = 0; E.nextF = 0;
  const nudge = d => { E.v += d * 0.75; };
  document.getElementById("eL").onclick = () => nudge(-1);
  document.getElementById("eR").onclick = () => nudge(1);
  const key = ev => { if (!eraAlive(E.id)) return document.removeEventListener("keydown", key); if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") ev.preventDefault(); if (ev.key === "ArrowLeft") nudge(-1); if (ev.key === "ArrowRight") nudge(1); };
  document.addEventListener("keydown", key);
  eraLoop(dt => {
    E.t += dt;
    if (E.t >= E.nextF) { E.f = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.9) * sp; E.nextF = E.t + 0.5 + Math.random() * 0.6; }
    E.v += (E.f + E.x * 0.8) * dt; // el auto tiende a irse más cuanto más cruzado está
    E.v *= 1 - 0.6 * dt;
    E.x += E.v * dt;
    if (Math.abs(E.x) < 0.36) E.inZone += dt;
    const c = document.getElementById("eCar");
    if (c) { c.style.left = (50 + E.x * 44) + "%"; c.style.transform = "rotate(" + (E.x * 25) + "deg)"; }
    const tt = document.getElementById("eT"); if (tt) tt.textContent = Math.max(0, E.limit - E.t).toFixed(1) + "s";
    if (Math.abs(E.x) >= 1) return eraEnd(false, "¡Trompo! Se te fue de cola.");
    if (E.t >= E.limit) eraEnd(true, "¡Lo domaste! " + Math.round(E.inZone / E.limit * 100) + "% del tiempo derechito.");
  });
}

/* tira de pista para 1978 / 2009 / 2026 */
function eraStripHtml(segs, label) {
  let x = 0;
  const html = segs.map(g => { const h = `<div class="seg ${g.t}" style="left:${x}px;width:${g.w}px">${label(g.t)}</div>`; x += g.w; return h; }).join("");
  return { html: `<div class="era-strip"><div class="lane" id="eLane" style="width:${x}px">${html}</div><div class="mark"></div><div class="me" id="eMe"></div></div>`, total: x };
}
function eraSegs(kinds, seed) {
  const out = [{ t: "S", w: 260 }];
  for (let i = 0; i < 9; i++) {
    const t = kinds[(seed + i * 7 + (i * i) % 5) % kinds.length];
    out.push({ t, w: t === "P" ? 70 + ((seed + i) % 3) * 15 : 120 + ((seed * 3 + i * 11) % 5) * 30 });
  }
  out.push({ t: "S", w: 600 });
  return out;
}
function eraStripRun(cfg) {
  const st = document.getElementById("eraStage");
  const seed = fwHash("era" + s.gp + "_" + s.session + "_" + s.season) % 97;
  const segs = eraSegs(cfg.kinds, seed);
  const strip = eraStripHtml(segs, cfg.label);
  st.innerHTML = `<div class="era-stat"><span id="eInfo">${cfg.info0 || ""}</span><span>Precisión: <b id="eAcc">—</b></span></div>${strip.html}${cfg.extra || ""}<div class="era-row">${cfg.buttons}</div>`;
  document.getElementById("eMe").innerHTML = fwCarSvg(FW_ERAS[fwEraIdx(s.season)].y, eraColor());
  const E = ERA, sp = eraSpeed();
  E.pos = 0; E.good = 0; E.tot = 0;
  const lane = document.getElementById("eLane");
  const carX = () => (document.querySelector("#eraStage .era-strip")?.clientWidth || 300) * 0.22;
  const endAt = strip.total - 600 + 40;
  const segAt = p => { let x = 0; for (const g of segs) { if (p < x + g.w) return { g, into: p - x }; x += g.w; } return { g: segs[segs.length - 1], into: 0 }; };
  E.straightSec = segs.reduce((acc, g, i) => { let x0 = segs.slice(0, i).reduce((q, h) => q + h.w, 0); const a0 = Math.max(x0, 260), a1 = Math.min(x0 + g.w, endAt); return acc + (g.t === "S" && a1 > a0 ? (a1 - a0) : 0); }, 0) / (230 * sp);
  cfg.init && cfg.init(E);
  eraLoop(dt => {
    E.pos += dt * 230 * sp;
    const here = segAt(E.pos);
    if (lane) lane.style.transform = "translateX(" + (carX() - E.pos) + "px)";
    if (E.pos > 260) {
      const r = cfg.judge(E, here.g.t, dt, here.into);
      if (r !== null) { E.tot += dt; if (r) E.good += dt; }
      const a = document.getElementById("eAcc"); if (a && E.tot > 0) a.textContent = Math.round(E.good / E.tot * 100) + "%";
    }
    cfg.tick && cfg.tick(E, dt);
    if (E.pos >= endAt) cfg.finish(E);
  });
}
/* 1978 · efecto suelo */
function eraGround() {
  ERA.hold = false;
  eraStripRun({
    kinds: ["S", "C", "P", "S", "C", "P"],
    label: t => t === "P" ? "PIANO" : t === "C" ? "CURVA" : "RECTA",
    info0: "Apretado = a fondo · Soltá en los pianos",
    buttons: `<button class="era-btn hot" id="eGas">🦶 ACELERAR (mantener)</button>`,
    init: E => { eraHold(document.getElementById("eGas"), () => (E.hold = true), () => (E.hold = false)); const kd = ev => { if (!eraAlive(E.id)) return; if (ev.code === "Space") { ev.preventDefault(); E.hold = ev.type === "keydown"; } }; document.addEventListener("keydown", kd); document.addEventListener("keyup", kd); },
    judge: (E, t, dt, into) => { if (into < 12) return null; if (t === "P") { E.pTot = (E.pTot || 0) + 1; if (!E.hold) E.pGood = (E.pGood || 0) + 1; return !E.hold; } return E.hold; },
    tick: E => { const b = document.getElementById("eGas"); if (b) b.style.filter = E.hold ? "brightness(1.35)" : ""; },
    finish: E => { const p = E.tot ? E.good / E.tot : 0, kp = E.pTot ? (E.pGood || 0) / E.pTot : 1; const ok = p >= 0.7 && kp >= 0.6; eraEnd(ok, Math.round(p * 100) + "% de precisión " + (ok ? "— pegado al piso." : kp < 0.6 ? "— no soltaste en los pianos y el auto rebotó." : "— perdiste el efecto suelo.")); }
  });
}
/* 2009 · KERS */
function eraKers() {
  ERA.hold = false; ERA.batt = 1; ERA.onS = 0; ERA.onC = 0;
  let CAP = 2; // segundos de batería (se ajusta a las rectas de esta vuelta)
  eraStripRun({
    kinds: ["S", "C", "S", "C", "C", "S"],
    label: t => t === "C" ? "CURVA" : "RECTA",
    info0: "🔋 Batería",
    extra: `<div class="era-batt"><i id="eBatt" style="width:100%"></i></div>`,
    buttons: `<button class="era-btn cool" id="eK">⚡ KERS (mantener)</button>`,
    init: E => { CAP = Math.max(1.2, E.straightSec * 0.6); eraHold(document.getElementById("eK"), () => (E.hold = true), () => (E.hold = false)); },
    judge: (E, t, dt) => {
      if (!E.hold || E.batt <= 0) return null;
      E.batt = Math.max(0, E.batt - dt / CAP);
      if (t === "S") E.onS += dt; else E.onC += dt;
      return t === "S";
    },
    tick: E => { const b = document.getElementById("eBatt"); if (b) b.style.width = Math.round(E.batt * 100) + "%"; const k = document.getElementById("eK"); if (k) k.style.filter = E.hold && E.batt > 0 ? "brightness(1.4)" : ""; },
    finish: E => {
      const used = E.onS / CAP;
      const ok = used >= 0.75 && E.onC < 0.6;
      eraEnd(ok, "Usaste " + Math.round(used * 100) + "% de la batería en rectas" + (E.onC >= 0.6 ? " y desperdiciaste en curvas." : ok ? ". ¡Pasaste a dos rivales!" : ". Te sobró batería."));
    }
  });
}
/* 2026 · aero activa */
function eraAero() {
  ERA.mode = "Z";
  eraStripRun({
    kinds: ["S", "C", "S", "C", "S", "C", "C"],
    label: t => t === "C" ? "CURVA" : "RECTA",
    info0: "Modo actual: <b id='eMode'>CURVA</b>",
    buttons: `<button class="era-btn cool" id="eX">➡️ MODO RECTA</button><button class="era-btn hot" id="eZ">↪️ MODO CURVA</button>`,
    init: E => {
      const set = m => { E.mode = m; const el = document.getElementById("eMode"); if (el) el.textContent = m === "X" ? "RECTA" : "CURVA"; };
      document.getElementById("eX").onclick = () => set("X");
      document.getElementById("eZ").onclick = () => set("Z");
    },
    judge: (E, t, dt, into) => (into < 25 ? null : (t === "S") === (E.mode === "X")),
    finish: E => { const p = E.tot ? E.good / E.tot : 0; eraEnd(p >= 0.7, Math.round(p * 100) + "% de precisión con los alerones" + (p >= 0.7 ? ". ¡Vuelta perfecta!" : ".")); }
  });
}
/* 1988 · turbo lag */
function eraTurbo() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Curva <b id="eC">1</b>/3 · lag <b id="eLag"></b></span><span id="eRes"></span></div>
    <div class="era-gauge"><div class="gz" id="eZone"></div><div class="gl" id="eLine"></div><div class="ga" id="eArr" style="display:none"></div><div class="gn" id="eN"></div></div>
    <div class="era-dots" id="eDots"><span></span><span></span><span></span></div>
    <div class="era-row"><button class="era-btn hot" id="eGas">🔥 ACELERAR</button></div>`;
  const E = ERA, sp = eraSpeed();
  E.c = 0; E.wins = 0;
  const speed = 48 * sp; // % por segundo
  const zoneW = 12 / sp;
  function corner() {
    E.p = 0; E.pressed = false; E.lag = 0.35 + ((E.c * 37 + s.gp * 13) % 25) / 100;
    E.apex = 62 + (E.c * 9) % 18;
    const z = document.getElementById("eZone"); if (z) { z.style.left = (E.apex - zoneW / 2) + "%"; z.style.width = zoneW + "%"; }
    document.getElementById("eC").textContent = E.c + 1;
    document.getElementById("eLag").textContent = E.lag.toFixed(2) + "s";
    document.getElementById("eArr").style.display = "none";
  }
  function result(ok, txt) {
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    eraMsg((ok ? "👌 " : "⚠️ ") + txt);
    E.c++;
    E.wait = 0.9;
    if (E.c >= 3) eraEnd(E.wins >= 2, E.wins + " de 3 curvas con el turbo justo.");
  }
  document.getElementById("eGas").onclick = () => {
    if (!eraAlive(E.id) || E.pressed || E.wait > 0) return;
    E.pressed = true;
    const arrive = E.p + E.lag * speed;
    const a = document.getElementById("eArr"); if (a) { a.style.left = Math.min(100, arrive) + "%"; a.style.display = "block"; }
    const ok = Math.abs(arrive - E.apex) <= zoneW / 2;
    result(ok, ok ? "¡La potencia llegó justo en el vértice!" : arrive < E.apex ? "Muy temprano: patinó en la entrada." : "Tarde: el turbo llegó en la recta.");
  };
  corner();
  E.wait = 0;
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < 3) corner(); return; }
    E.p += dt * speed;
    const n = document.getElementById("eN"); if (n) n.style.left = Math.min(100, E.p) + "%";
    const l = document.getElementById("eLine"); if (l) l.style.left = Math.min(100, E.p + E.lag * speed) + "%";
    if (E.p >= 100 && !E.pressed) { E.pressed = true; result(false, "No aceleraste: perdiste la curva."); }
  });
}
/* 1998 · reabastecimiento */
function eraFuel() {
  const st = document.getElementById("eraStage");
  st.innerHTML = `<div class="era-stat"><span>Parada <b id="eC">1</b>/3</span><span id="eLaps"></span></div>
    <div class="era-fuel"><div class="fz" id="eZone"></div><div class="ff" id="eF" style="height:0"></div></div>
    <div class="era-dots" id="eDots"><span></span><span></span><span></span></div>
    <div class="era-row"><button class="era-btn hot" id="eFill">⛽ CARGAR (mantener)</button></div>`;
  const E = ERA, sp = eraSpeed();
  E.c = 0; E.wins = 0; E.f = 0; E.hold = false; E.wait = 0; E.idle = 0; E.idleMax = 5 / sp;
  const rate = 42 * sp, zw = 12 / sp;
  function stop() {
    E.f = 0; E.target = 35 + ((E.c * 23 + s.gp * 7) % 40);
    const z = document.getElementById("eZone"); if (z) { z.style.bottom = (E.target - zw / 2) + "%"; z.style.height = zw + "%"; }
    document.getElementById("eC").textContent = E.c + 1;
    document.getElementById("eLaps").textContent = "Nafta para " + Math.round(E.target * 0.4) + " vueltas";
  }
  function release() {
    if (!E.hold) return;
    E.hold = false;
    if (E.f <= 0.5 || E.wait > 0) return;
    const ok = Math.abs(E.f - E.target) <= zw / 2;
    const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = ok ? "ok" : "bad";
    if (ok) E.wins++;
    eraMsg(ok ? "👌 ¡Justo! El lollipop se levanta… ¡andá!" : E.f > E.target ? "⚠️ Cargaste de más: el auto pesa." : "⚠️ Te quedaste corto: vas a tener que ahorrar.");
    E.c++; E.wait = 1;
    if (E.c >= 3) eraEnd(E.wins >= 2, E.wins + " de 3 paradas perfectas.");
  }
  eraHold(document.getElementById("eFill"), () => { if (E.wait <= 0) E.hold = true; }, release);
  stop();
  eraLoop(dt => {
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < 3) stop(); return; }
    if (E.hold) { E.f = Math.min(100, E.f + dt * rate); if (E.f >= 100) release(); }
    else {
      // si no cargás, la parada se pierde (no se queda esperando para siempre)
      E.idle += dt;
      if (E.idle >= E.idleMax) {
        E.idle = 0;
        const d = document.querySelectorAll("#eDots span")[E.c]; if (d) d.className = "bad";
        eraMsg("⏱️ ¡Tardaste demasiado en cargar! El auto salió sin nafta extra.");
        E.c++; E.wait = 1;
        if (E.c >= 3) { eraEnd(E.wins >= 2, E.wins + " de 3 paradas perfectas."); return; }
      }
    }
    if (E.hold) E.idle = 0;
    const f = document.getElementById("eF"); if (f) f.style.height = E.f + "%";
  });
}

/* ---------- se suma a la rotación de prácticas del Modo Piloto ---------- */
(function () {
  const o = window.renderDriverPracticeTask;
  if (typeof o !== "function") return;
  window.renderDriverPracticeTask = function (idx, rName, injuryBanner) {
    const key = "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer;
    if (ERA && !ERA.dead && ERA.key === key && document.getElementById("eraStage")) return; // no cortar una vuelta en curso
    const r = o.apply(this, arguments);
    try {
      // 60% desafío del circuito (patrón de 5) · 10% manejo de época · 30% los ejercicios de siempre
      const h = fwHash(key + "|" + s.season + "|era") % 10;
      const pick = (h < 6 && typeof renderTrackTask === "function") ? "track" : h < 7 ? "era" : null;
      const turnLabel = s.player2 ? (s.activePlayer === 1 ? " · Turno P1" : " · Turno P2") : "";
      if (pick) {
        const stepHead = `<div class="session-steps"><span class="step done">1. Quiz F1</span><span class="step on">2. ${pick === "era" ? "Manejo de época" : "Desafío del circuito"}</span></div>` + (injuryBanner || "");
        pick === "era" ? renderEraTask(stepHead, turnLabel) : renderTrackTask(stepHead, turnLabel);
      } else eraStop();
    } catch (e) {}
    return r;
  };
})();

function eraShowControls() {
  setTimeout(() => {
    try {
      const st = document.getElementById("eraStage"); if (!st) return;
      const row = st.querySelector(".era-row, .mw-wrap, .era-btn") || st;
      const r = st.getBoundingClientRect(), rr = row.getBoundingClientRect();
      if (rr.bottom > innerHeight - 30 || r.top < 0) {
        if (r.height + 40 < innerHeight) st.scrollIntoView({ block: "center", behavior: "smooth" });
        else row.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    } catch (e) {}
  }, 60);
}
