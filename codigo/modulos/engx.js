/* =====================================================================================
   FAWIWE · MODO INGENIERO AL DÍA
   - 🔧 Pit stop jugable: elegís las gomas y manejás al equipo de boxes (4 ruedas + salida).
   - ⚔️ Duelo final: ordenás el modo ataque o la defensa en el momento justo.
   (La clasificación en vivo para el ingeniero está en qlive.js.)
   ===================================================================================== */
function exSeatRow(L, seat) { return L.lapData && L.lapData.rows.find(r => r.mine && r.seat === seat); }
function exEsc(t) { return engEsc(t); }
function exAddBonus(L, seat, v) { if (seat === 1) L.b1 += v; else L.b2 += v; }
const EX_WHEELS = [["FL", "Delantera izq."], ["FR", "Delantera der."], ["RL", "Trasera izq."], ["RR", "Trasera der."]];

/* ---------------------------------- pit stop ---------------------------------- */
function exCompRec(L, lap) {
  const wet = !!(s.weather && s.weather.wet);
  const left = (L.lapData.N - lap) / L.lapData.N;
  const list = wet ? ["Intermedio", "Lluvia", "Medium"] : ["Soft", "Medium", "Hard"];
  const rec = wet ? (/fuerte/i.test(s.weather.label || "") ? "Lluvia" : "Intermedio") : left < 0.35 ? "Soft" : left < 0.6 ? "Medium" : "Hard";
  return { list, rec, wet };
}
function exPitOpen(L, row, lap) {
  const C = exCompRec(L, lap);
  L.phase = "pitgame";
  L.pit = { seat: row.seat, name: row.name, lap, stage: "tyre", C, t0: performance.now(), wrong: 0, order: EX_WHEELS.map((w, i) => i).sort((a, b) => engH("pw" + a + lap + L.key) % 7 - engH("pw" + b + lap + L.key) % 7), idx: 0 };
  L.feed.push({ lap, txt: "🔧 " + row.name + " entra a boxes. ¡Todo el equipo listo!", mine: true });
  try { fwRadioSay("Box, box. Equipo listo para la parada.", "you"); } catch (e) {}
  if (L.skip) { exPitAuto(); return; }
  clearTimeout(L._pitTO); L._pitTO = setTimeout(() => { if (engLive && engLive.phase === "pitgame") exPitAuto(true); }, 20000);
  engLiveDraw();
}
function exPitTyre(ty) {
  const L = engLive; if (!L || !L.pit || L.pit.stage !== "tyre") return;
  const P = L.pit, C = P.C;
  P.ty = ty;
  const g = ty === C.rec ? 1.2 : (C.wet !== (ty === "Intermedio" || ty === "Lluvia")) ? -3 : -0.5;
  exAddBonus(L, P.seat, g);
  P.tyreNote = (g > 0 ? "✅ " : g < -1 ? "❌ " : "➖ ") + (DL_TY[ty] ? DL_TY[ty].n : ty);
  P.stage = "wheels"; P.t0 = performance.now();
  engLiveDraw();
}
function exPitWheel(i) {
  const L = engLive; if (!L || !L.pit || L.pit.stage !== "wheels") return;
  const P = L.pit;
  if (i === P.order[P.idx]) { P.idx++; if (P.idx >= 4) { P.wheelT = (performance.now() - P.t0) / 1000; P.stage = "go"; P.goAt = performance.now() + 600 + (engH("pg" + P.lap + L.key) % 900); P.early = false; setTimeout(() => { if (engLive && engLive.pit === P && P.stage === "go") engLiveDraw(); }, P.goAt - performance.now() + 5); } }
  else P.wrong++;
  engLiveDraw();
}
function exPitGo() {
  const L = engLive; if (!L || !L.pit || L.pit.stage !== "go") return;
  const P = L.pit, now = performance.now();
  if (now < P.goAt) { P.early = true; P.react = 0.9; } else P.react = (now - P.goAt) / 1000;
  exPitFinish();
}
function exPitAuto(timeout) {
  const L = engLive; if (!L || !L.pit) return;
  const P = L.pit;
  if (P.stage === "tyre") exPitTyre(P.C.rec);
  P.wheelT = P.wheelT || (timeout ? 4.5 : 2.4); P.react = P.react != null ? P.react : (timeout ? 1.2 : 0.35); P.wrong = P.wrong || 0;
  exPitFinish(true);
}
function exPitFinish(auto) {
  const L = engLive, P = L.pit;
  clearTimeout(L._pitTO);
  const diff = s.miniDiff === "easy" ? 0.8 : s.miniDiff === "hard" ? 1.15 : 1;
  let t = 1.75 + Math.max(0, (P.wheelT || 2.4) - 1.2) * 0.32 * diff + P.wrong * 0.45 + Math.min(1.5, P.react || 0.3) * 0.8 + (P.early ? 1.0 : 0);
  t = Math.round(t * 10) / 10;
  const g = t < 2.4 ? 2.5 : t < 3 ? 1 : t < 4 ? -0.5 : -2.5;
  exAddBonus(L, P.seat, g);
  const verdict = t < 2.4 ? "🔥 ¡PARADA PERFECTA!" : t < 3 ? "👍 Buena parada." : t < 4 ? "➖ Parada lenta." : "❌ Parada desastrosa.";
  L.feed.push({ lap: P.lap, txt: "⏱️ " + P.name + ": " + t.toFixed(1) + "s en boxes — " + verdict + (P.tyreNote ? " · Gomas: " + P.tyreNote : "") + (P.early ? " (soltaste el auto antes de tiempo)" : ""), mine: true });
  try { if (!L.skip) fwRadioSay(t < 2.4 ? "¡Qué parada! " + t.toFixed(1) + " segundos." : t < 3 ? "Buena parada, " + t.toFixed(1) + "." : "Perdimos tiempo en boxes.", "drv"); } catch (e) {}
  L.pit = null; L.phase = "running";
  engLiveRetarget();
  engLiveDraw();
}
function exPitHtml() {
  const L = engLive, P = L.pit; if (!P) return "";
  const head = `<div class="q">🔧 PIT STOP · ${exEsc(P.name)} · vuelta ${P.lap}</div>`;
  if (P.stage === "tyre") {
    return `<div class="eng-live-dec ex-pit">${head}<p class="small">Elegí las gomas. Quedan ${L.lapData.N - P.lap} vueltas${P.C.wet ? " y está mojado" : ""}: el ingeniero de neumáticos recomienda <b>${DL_TY[P.C.rec].n.toLowerCase()}</b>.</p>
      <div class="choice-grid">${P.C.list.map((ty, i) => `<button class="choice-card" onclick="exPitTyre('${ty}')"><b><i class="ex-tyre" style="border-color:${DL_TY[ty].c}"></i> ${DL_TY[ty].n}</b><span class="small"><kbd>${i + 1}</kbd></span></button>`).join("")}</div></div>`;
  }
  if (P.stage === "wheels") {
    const cur = P.order[P.idx];
    return `<div class="eng-live-dec ex-pit">${head}<p class="small">¡Rápido! Tocá la rueda que se ilumina (o su tecla). Errores: ${P.wrong}</p>
      <div class="ex-car" style="--tc:${(typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600"}"><div class="ex-body"></div>${EX_WHEELS.map((w, i) => `<button type="button" class="ex-w ${w[0]} ${i === cur ? "on" : P.order.indexOf(i) < P.idx ? "done" : ""}" onclick="exPitWheel(${i})"><b>${P.order.indexOf(i) < P.idx ? "✓" : i + 1}</b><span>${w[1]}</span></button>`).join("")}</div></div>`;
  }
  const green = performance.now() >= P.goAt;
  return `<div class="eng-live-dec ex-pit">${head}<p class="small">Esperá la luz verde y soltá el auto. Si soltás antes, es salida insegura.</p>
    <div class="ex-light ${green ? "go" : ""}"><i></i><span>${green ? "¡VERDE!" : "ESPERÁ…"}</span></div>
    <button type="button" class="lv-btn red" onclick="exPitGo()">🟢 ¡SOLTALO! <kbd>Espacio</kbd></button></div>`;
}

/* ---------------------------------- duelo final ---------------------------------- */
let exDuelRaf = null;
function exDuelCheck(L) {
  if (L.exDuelDone || !L.lapData) return;
  const N = L.lapData.N, cur = Math.min(N, Math.floor(L.tick / L.T * N));
  if (cur < N - 6 || cur >= N - 1) return;
  L.exDuelDone = true;
  const d = L.lapData;
  const mine = d.rows.filter(r => r.mine && r.t.length > cur && r.status !== "DNS").sort((a, b) => a.pos[cur] - b.pos[cur]);
  for (const me of mine) {
    const p = me.pos[cur];
    const ahead = d.rows.find(r => r.pos[cur] === p - 1 && !r.mine && r.t.length >= cur), behind = d.rows.find(r => r.pos[cur] === p + 1 && !r.mine && r.t.length >= cur);
    const gA = ahead ? me.cum[cur - 1] - ahead.cum[cur - 1] : 99, gB = behind ? behind.cum[cur - 1] - me.cum[cur - 1] : 99;
    if (Math.min(gA, gB) < 1.2) {
      const atk = gA <= gB, other = atk ? ahead : behind;
      if (L.skip) { exAddBonus(L, me.seat, engH("exd" + L.key) % 2 ? 1.5 : -0.5); engLiveRetarget(); return; }
      L.phase = "duelgame";
      L.duel = { seat: me.seat, name: me.name, atk, other: other.name, tries: 0, hits: 0, x: 0, v: 1, zone: [40, 62], log: [], t0: performance.now(), speed: s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8 };
      L.feed.push({ lap: cur, txt: "⚔️ ¡DUELO FINAL! " + me.name + (atk ? " ataca a " : " defiende de ") + other.name + " a " + Math.min(gA, gB).toFixed(1) + "s.", mine: true });
      try { fwRadioSay(atk ? "Lo tengo cerca, ¿me das el modo ataque?" : "Me está atacando, decime cuándo cerrar.", "drv"); } catch (e) {}
      exDuelLoop();
      engLiveDraw();
      return;
    }
  }
}
function exDuelLoop() {
  cancelAnimationFrame(exDuelRaf);
  const step = () => {
    const L = engLive; if (!L || L.phase !== "duelgame" || !L.duel) return;
    const D = L.duel;
    if (performance.now() - D.t0 > 15000) { exDuelEnd(true); return; }
    D.x += D.v * D.speed * 1.6; if (D.x >= 100) { D.x = 100; D.v = -1; } if (D.x <= 0) { D.x = 0; D.v = 1; }
    const m = document.getElementById("exDuelMark"); if (m) m.style.left = D.x + "%";
    exDuelRaf = requestAnimationFrame(step);
  };
  exDuelRaf = requestAnimationFrame(step);
}
function exDuelHit() {
  const L = engLive; if (!L || L.phase !== "duelgame" || !L.duel) return;
  const D = L.duel, ok = D.x >= D.zone[0] && D.x <= D.zone[1];
  D.tries++; if (ok) D.hits++; D.log.push(ok);
  const w = Math.max(12, (D.zone[1] - D.zone[0]) - 4), c = 25 + (engH("exz" + D.tries + L.key) % 50); D.zone = [c, c + w];
  if (D.tries >= 3 || D.hits >= 2 || D.tries - D.hits >= 2) { exDuelEnd(false); return; }
  engLiveDraw();
}
function exDuelEnd(auto) {
  const L = engLive, D = L.duel; if (!D) return;
  cancelAnimationFrame(exDuelRaf);
  const won = auto ? engH("exd" + L.key) % 2 === 0 : D.hits >= 2;
  exAddBonus(L, D.seat, D.atk ? (won ? 3 : 0) : (won ? 1 : -2.5));
  L.feed.push({ lap: Math.min(L.lapData.N, Math.floor(L.tick / L.T * L.lapData.N)), txt: D.atk ? (won ? "⚔️ ¡Orden perfecta! " + D.name + " pasa a " + D.other + "." : "⚔️ " + D.other + " aguantó el ataque de " + D.name + ".") : (won ? "🛡️ ¡" + D.name + " defendió y " + D.other + " no pudo!" : "🛡️ " + D.other + " pasó a " + D.name + " al final."), mine: true });
  try { if (!L.skip) fwRadioSay(won ? (D.atk ? "¡Adentro! ¡Gracias!" : "¡Lo aguanté!") : (D.atk ? "No alcanzó." : "Me pasó, perdón."), "drv"); } catch (e) {}
  L.duel = null; L.phase = "running";
  engLiveRetarget(); engLiveDraw();
}
function exDuelHtml() {
  const D = engLive.duel;
  return `<div class="eng-live-dec dl-duel"><div class="q">⚔️ DUELO FINAL · ${exEsc(D.name)} ${D.atk ? "ataca a" : "defiende de"} ${exEsc(D.other)} <span class="small">(${3 - D.tries} intentos)</span></div>
    <p class="small">${D.atk ? "Dale el modo ataque justo en la zona verde." : "Avisale que cierre la puerta justo en la zona verde."} Necesitás 2 de 3.</p>
    <div class="dl-duel-bar"><i class="z" style="left:${D.zone[0]}%;width:${D.zone[1] - D.zone[0]}%"></i><b id="exDuelMark" style="left:${D.x}%"></b></div>
    <div class="dl-duel-log">${D.log.map(x => x ? "✅" : "❌").join(" ")}</div>
    <button type="button" class="lv-btn red" onclick="exDuelHit()">${D.atk ? "⚔️ ¡MODO ATAQUE YA!" : "🛡️ ¡CERRÁ AHORA!"} <kbd>Espacio</kbd></button></div>`;
}

/* ---------------------------------- ganchos ---------------------------------- */
(function () {
  if (typeof engLiveTick !== "function") return;
  const tk = engLiveTick;
  engLiveTick = function () {
    const L = engLive;
    const before = L && L.lapData ? Math.min(L.lapData.N, Math.floor(L.tick / L.T * L.lapData.N)) : 0;
    const r = tk.apply(this, arguments);
    try {
      if (!L || L.phase !== "running" || !L.lapData) return r;
      const N = L.lapData.N, now = Math.min(N, Math.floor(L.tick / L.T * N));
      L._pitDone = L._pitDone || {};
      for (let l = before + 1; l <= now; l++) {
        const rows = L.lapData.rows.filter(x => x.mine && x.pits.includes(l) && x.t.length >= l && !L._pitDone[x.name + "_" + l]);
        for (const row of rows) {
          L._pitDone[row.name + "_" + l] = true;
          if (row.seat === 1) { exPitOpen(L, row, l); return r; }
          // el segundo auto: el equipo de boxes hace la parada solo
          const t = Math.round((2.1 + (engH("p2" + row.name + l) % 14) / 10) * 10) / 10;
          exAddBonus(L, row.seat, t < 2.6 ? 0.8 : t < 3.1 ? 0 : -0.8);
          L.feed.push({ lap: l, txt: "🔧 " + row.name + ": parada de " + t.toFixed(1) + "s (la hizo tu equipo de boxes).", mine: true });
        }
      }
      exDuelCheck(L);
    } catch (e) { console.warn("[FAWIWE] ingeniero:", e); }
    return r;
  };
  const dr = engLiveDraw;
  engLiveDraw = function () {
    const r = dr.apply(this, arguments);
    try {
      const L = engLive, box = document.getElementById("engLiveDecision");
      // las decisiones van arriba del tablero, siempre a la vista
      const body = document.querySelector("#engLiveOverlay .eng-live-body");
      if (box && body && box.nextElementSibling !== body) body.parentNode.insertBefore(box, body);
      if (L && box) { if (L.phase === "pitgame" && L.pit) box.innerHTML = exPitHtml(); else if (L.phase === "duelgame" && L.duel) box.innerHTML = exDuelHtml(); }
    } catch (e) {}
    return r;
  };
  const sk = engLiveSkip;
  engLiveSkip = function () {
    const L = engLive;
    if (L) { L.skip = true; if (L.phase === "pitgame") exPitAuto(); if (L.phase === "duelgame") exDuelEnd(true); }
    return sk.apply(this, arguments);
  };
  document.addEventListener("keydown", ev => {
    const L = engLive, ov = document.getElementById("engLiveOverlay");
    if (!L || !ov || !ov.classList.contains("show")) return;
    const k = ev.key;
    if (L.phase === "pitgame" && L.pit) {
      if (L.pit.stage === "tyre" && ["1", "2", "3"].includes(k)) { ev.preventDefault(); exPitTyre(L.pit.C.list[+k - 1]); }
      else if (L.pit.stage === "wheels" && ["1", "2", "3", "4"].includes(k)) { ev.preventDefault(); exPitWheel(+k - 1); }
      else if (L.pit.stage === "go" && (k === " " || k === "Enter")) { ev.preventDefault(); exPitGo(); }
    } else if (L.phase === "duelgame" && (k === " " || k === "Enter")) { ev.preventDefault(); exDuelHit(); }
  });
})();
