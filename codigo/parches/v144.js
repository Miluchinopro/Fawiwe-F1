/* =====================================================================================
   FAWIWE · V144 — NOVEDADES DEL MULTIJUGADOR
   🚦 largada a dos en la misma pantalla · ⚔️ duelo en pista entre los dos ·
   🔄 pasá el celu (pantalla tapada) · 💰 apuestas del paddock · 🏆 Copa del duelo
   ===================================================================================== */
function v14Name(p) { return p === 1 ? v13P1Label() : v13P2Label(); }
function v14Me(p) { return p === 1 ? DL.me : v13Me2(); }
let v14Raf = null;

/* ============================ 💰 APUESTAS DEL PADDOCK ============================ */
const V14_BETS = [
  { id: "ahead", lbl: "⚔️ Termino adelante del otro", win: 1, lose: 0.5 },
  { id: "podium", lbl: "🍾 Hago podio", win: 3, lose: 1 },
  { id: "points", lbl: "🔟 Termino en los puntos", win: 1, lose: 0.5 },
  { id: "none", lbl: "🙅 No apuesto", win: 0, lose: 0 }
];
function v14Money(p) { return p === 1 ? (s.money || 0) : (s.player2.money || 0); }
function v14AddMoney(p, v) { if (p === 1) s.money = Math.round(((s.money || 0) + v) * 10) / 10; else s.player2.money = Math.round(((s.player2.money || 0) + v) * 10) / 10; }
function v14BetsOpen() {
  DL.bets = { turn: 1, p1: null, p2: null };
  DL.phase = "bets";
  clearInterval(dlTimer);
  try { fwRadioSay("Antes de largar, apuestas del paddock. Elige primero " + v14Name(1) + ".", "eng", { toast: false }); } catch (e) {}
  dlDraw();
  return true;
}
function v14BetsHtml() {
  const B = DL.bets, p = B.turn;
  return `<div class="eng-live-dec v14-bets ${p === 2 ? "p2" : ""}"><div class="q">💰 APUESTAS DEL PADDOCK · ${p === 1 ? "🟡" : "🔵"} ${v13Esc(v14Name(p))}</div>
    <p class="small">Tenés $${v14Money(p)}M. Si acertás, cobrás; si no, pagás. ${p === 2 ? "🟡 " + v13Esc(v14Name(1)) + " ya apostó (en secreto)." : ""}</p>
    <div class="choice-grid">${V14_BETS.map((b, i) => `<button type="button" class="choice-card" onclick="v14Bet(${i})"><b>${b.lbl}</b><span class="small">${b.win ? "+$" + b.win + "M si acertás · −$" + b.lose + "M si no" : "Sin riesgo"}</span><kbd>${i + 1}</kbd></button>`).join("")}</div></div>`;
}
function v14Bet(i) {
  const B = DL && DL.bets; if (!B || DL.phase !== "bets") return;
  const b = V14_BETS[i]; if (!b) return;
  if (B.turn === 1) { B.p1 = b.id; B.turn = 2; v14PassScreen(2, "Ahora apuesta " + v14Name(2) + ". " + v14Name(1) + ", no mires 😉", () => dlDraw()); dlDraw(); return; }
  B.p2 = b.id;
  dlState().bets = { p1: B.p1, p2: B.p2 };
  const t = id => (V14_BETS.find(x => x.id === id) || {}).lbl || "";
  dlFeed(0, "💰 Apuestas: 🟡 " + v14Name(1) + ": " + t(B.p1).replace(/^\S+\s/, "") + " · 🔵 " + v14Name(2) + ": " + t(B.p2).replace(/^\S+\s/, "") + ".", true);
  DL.bets = null; DL.phase = "run"; DL._betsDone = true;
  v7StartOpen();
}
function v14BetsSettle(g1, g2) {
  const st = dlState(); const B = st.bets; if (!B || st.betsPaid) return [];
  st.betsPaid = true;
  const out = [];
  [[1, B.p1, g1, g2], [2, B.p2, g2, g1]].forEach(([p, id, me, other]) => {
    const b = V14_BETS.find(x => x.id === id); if (!b || !b.win) return;
    const pm = me && !me.status ? me.pos : 99, po = other && !other.status ? other.pos : 99;
    const ok = id === "ahead" ? pm < po : id === "podium" ? pm <= 3 : pm <= 10;
    const v = ok ? b.win : -Math.min(b.lose, Math.max(0, v14Money(p)));
    v14AddMoney(p, v);
    out.push((p === 1 ? "🟡 " : "🔵 ") + v14Name(p) + (ok ? " ganó la apuesta (+$" + b.win + "M)" : " perdió la apuesta (−$" + Math.abs(v) + "M)"));
  });
  return out;
}

/* ============================ 🔄 PASÁ EL CELU ============================ */
function v14PassScreen(p, msg, done) {
  let ov = document.getElementById("v14Pass");
  if (!ov) { ov = document.createElement("div"); ov.id = "v14Pass"; document.body.appendChild(ov); }
  ov.className = "p" + p;
  ov.innerHTML = `<div class="v14-pass"><div class="v14-pass-ic">🔄</div><div class="v14-pass-k">PASALE EL ${v12Touch() ? "CELU" : "TECLADO"} A</div><div class="v14-pass-who">${p === 1 ? "🟡" : "🔵"} ${v13Esc(v14Name(p))}</div><p>${v13Esc(msg || "")}</p><button type="button" class="lv-btn red" id="v14PassGo">Soy ${v13Esc(v14Name(p).split(" ")[0])}, ¡listo!</button></div>`;
  ov.classList.add("show");
  document.getElementById("v14PassGo").onclick = () => { ov.classList.remove("show"); if (done) done(); };
}

/* ============================ 🚦 LARGADA A DOS ============================ */
function v14StartOpen() {
  const delay = 900 + (dlH("st2" + dlKey()) % 1700);
  DL.st2 = { t0: performance.now(), n: 0, outAt: performance.now() + 5 * 750 + 400 + delay, state: "lights", hit: {} };
  DL.phase = "start2";
  clearInterval(dlTimer);
  try { fwRadioSay("Largada a dos. " + v14Name(1) + " a la izquierda, " + v14Name(2) + " a la derecha. ¡Esperen las luces!", "eng"); } catch (e) {}
  const tick = () => {
    const S = DL && DL.st2; if (!S || DL.phase !== "start2") return;
    const now = performance.now(), n = Math.min(5, Math.floor((now - S.t0) / 750));
    if (n !== S.n && S.state === "lights") { S.n = n; try { FWAudio.beep(false); } catch (e) {} document.querySelectorAll("#v14Lights i").forEach((x, k) => x.classList.toggle("on", k < n)); }
    if (S.state === "lights" && now >= S.outAt) { S.state = "out"; try { FWAudio.beep(true); } catch (e) {} document.querySelectorAll("#v14Lights i").forEach(x => x.classList.remove("on")); const t = document.getElementById("v14StartTxt"); if (t) t.textContent = "¡LUCES AFUERA!"; }
    if (S.state === "out" && now - S.outAt > 2500) { v14StartEnd(); return; }
    v14Raf = requestAnimationFrame(tick);
  };
  v14Raf = requestAnimationFrame(tick);
  dlDraw();
}
function v14StartHit(p) {
  const S = DL && DL.st2; if (!S || DL.phase !== "start2" || S.hit[p]) return;
  const now = performance.now();
  S.hit[p] = S.state === "out" ? (now - S.outAt) / 1000 : -1; // -1 = salió antes
  const el = document.getElementById("v14Half" + p);
  if (el) { el.classList.add(S.hit[p] < 0 ? "bad" : "ok"); el.querySelector("em").textContent = S.hit[p] < 0 ? "¡EN FALSO!" : S.hit[p].toFixed(3) + "s"; }
  try { v12Vib(30); } catch (e) {}
  if (S.hit[1] != null && S.hit[2] != null) setTimeout(v14StartEnd, 450);
}
function v14StartEnd() {
  const S = DL && DL.st2; if (!S) return;
  cancelAnimationFrame(v14Raf);
  const st = dlState(); st.moves2 = st.moves2 || [];
  const P1 = DL.me, P2 = v13Me2();
  const at = (p0) => DL.data.rows.find(r => r.pos[0] === p0 && r.status !== "DNS");
  const res = {};
  [[1, P1], [2, P2]].forEach(([p, me]) => {
    if (!me || me.status === "DNS") return;
    const rt = S.hit[p] == null ? 9 : S.hit[p];
    const other = p === 1 ? P2 : P1;
    const near = d => { const r = at(me.pos[0] + d); return r && r !== other ? r : null; };
    const push = (o, rs) => { if (!o) return; (p === 1 ? st.moves : st.moves2).push({ other: o.name, res: rs, lap: 0 }); };
    let txt, cls;
    if (rt < 0) { if (p === 1) st.jumpPen = 5; else st.pens.push({ name: me.name, reason: "Largada en falso" }); txt = "🚨 ¡Largada en falso! +5 segundos."; cls = "bad"; }
    else if (rt < 0.2) { push(near(-1), "gain"); push(near(-2), "gain"); txt = "🚀 ¡Largadón! (" + rt.toFixed(3) + "s) Gana dos lugares."; cls = "ok"; }
    else if (rt < 0.32) { push(near(-1), "gain"); txt = "✅ Buena largada (" + rt.toFixed(3) + "s): gana un lugar."; cls = "ok"; }
    else if (rt < 0.5) { txt = "👍 Largada correcta (" + rt.toFixed(3) + "s)."; cls = ""; }
    else { push(near(1), "lose"); txt = "🐢 Largada lenta" + (rt < 9 ? " (" + rt.toFixed(3) + "s)" : "") + ": pierde un lugar."; cls = "bad"; }
    res[p] = rt;
    dlFeed(0, (p === 1 ? "🟡 " : "🔵 ") + v14Name(p) + " · " + txt, true, cls);
  });
  const ok = p => res[p] != null && res[p] >= 0 && res[p] < 9;
  if (ok(1) || ok(2)) {
    const w = !ok(2) || (ok(1) && res[1] < res[2]) ? 1 : 2;
    dlFeed(0, "🏁 Mejor reacción: " + (w === 1 ? "🟡 " : "🔵 ") + v14Name(w) + ".", true, "ok");
    try { fwRadioSay("¡La mejor largada fue de " + v14Name(w) + "!", "eng"); } catch (e) {}
  }
  DL.st2 = null; DL.phase = "run"; DL._v10St = true;
  dlRebuild(); dlDraw(); dlSchedule();
}
function v14StartHtml() {
  const S = DL.st2;
  const half = p => `<button type="button" class="dark v14-half p${p}" id="v14Half${p}" onpointerdown="event.preventDefault();v14StartHit(${p})"><b>${p === 1 ? "🟡" : "🔵"} ${v13Esc(v14Name(p))}</b><span>Tocá acá · <kbd>${p === 1 ? "A" : "L"}</kbd></span><em></em></button>`;
  return `<div class="eng-live-dec v14-start"><div class="q">🚦 LARGADA A DOS</div>
    <div class="v7-lights" id="v14Lights">${[0, 1, 2, 3, 4].map(k => `<i class="${k < S.n && S.state === "lights" ? "on" : ""}"></i>`).join("")}</div>
    <div class="v7-start-txt" id="v14StartTxt">${S.state === "out" ? "¡LUCES AFUERA!" : "Esperen que se apaguen las 5 luces…"}</div>
    <div class="v14-halves">${half(1)}${half(2)}</div></div>`;
}

/* ============================ ⚔️ DUELO EN PISTA ENTRE LOS DOS ============================ */
function v14PvpCheck(l) {
  if (!DL || DL.mode !== "race" || DL.skip || DL.phase !== "run" || DL.pendingQte || DL.pendingQte2 || DL.pendingPvp) return;
  const a = DL.me, b = v13Me2(); if (!a || !b) return;
  if ((DL._pvpN || 0) >= 2 || l < 3 || l > DL.N - 2) return;
  if (DL._pvpLast && l - DL._pvpLast < 8) return;
  if (a.t.length <= l || b.t.length <= l || a.pits.includes(l) || b.pits.includes(l)) return;
  if (Math.abs(a.pos[l] - b.pos[l]) !== 1) return;
  const front = a.pos[l] < b.pos[l] ? a : b, back = front === a ? b : a;
  const gap = back.cum[l - 1] - front.cum[l - 1];
  if (gap > 1.0 || gap < 0) return;
  DL._pvpN = (DL._pvpN || 0) + 1; DL._pvpLast = l;
  DL.pendingPvp = { lap: l, atk: back === a ? 1 : 2, gap };
}
function v14PvpOpen() {
  const P = DL.pendingPvp; DL.pendingPvp = null; if (!P) return false;
  const def = P.atk === 1 ? 2 : 1;
  DL.pvp = Object.assign(P, { def, step: "atk", sideA: null, sideD: null, x: 0, v: 1, hit: {}, speed: s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8 });
  DL.phase = "pvp";
  clearInterval(dlTimer);
  dlFeed(P.lap, "⚔️ ¡DUELO ENTRE LOS DOS! " + (P.atk === 1 ? "🟡 " : "🔵 ") + v14Name(P.atk) + " ataca a " + (def === 1 ? "🟡 " : "🔵 ") + v14Name(def) + " a " + P.gap.toFixed(1) + "s.", true);
  try { fwRadioSay("¡Duelo entre los dos! " + v14Name(P.atk) + " ataca a " + v14Name(def) + ".", "eng", { priority: true }); } catch (e) {}
  try { v12Vib([40, 40, 40]); } catch (e) {}
  v14PassScreen(P.atk, "Elegí por dónde atacar. " + v14Name(def) + ", no mires 😉", () => dlDraw());
  dlDraw();
  return true;
}
function v14PvpSide(side) {
  const D = DL && DL.pvp; if (!D || DL.phase !== "pvp") return;
  if (D.step === "atk") { D.sideA = side; D.step = "def"; v14PassScreen(D.def, "Elegí qué lado cubrir. " + v14Name(D.atk) + ", no mires 😉", () => dlDraw()); dlDraw(); return; }
  if (D.step === "def") {
    D.sideD = side; D.step = "brake";
    const guessed = D.sideA === D.sideD;
    D.zoneA = guessed ? [44, 56] : [30, 70];
    D.zoneD = guessed ? [32, 68] : [45, 55];
    D.t0 = performance.now(); D.x = 0; D.v = 1;
    dlFeed(D.lap, (D.sideA === "in" ? "↙️" : "↗️") + " " + v14Name(D.atk) + " se tira por " + (D.sideA === "in" ? "adentro" : "afuera") + " · " + v14Name(D.def) + " cubre " + (D.sideD === "in" ? "adentro" : "afuera") + (guessed ? ". ¡Lo leyó!" : ". ¡Lado libre!"), true);
    cancelAnimationFrame(v14Raf);
    const step = () => {
      const q = DL && DL.pvp; if (!q || DL.phase !== "pvp" || q.step !== "brake") return;
      q.x += q.v * q.speed * 1.7; if (q.x >= 100) { q.x = 100; q.v = -1; } if (q.x <= 0) { q.x = 0; q.v = 1; }
      const m = document.getElementById("v14PvpMark"); if (m) m.style.left = q.x + "%";
      if (performance.now() - q.t0 > 9000) { v14PvpEnd(); return; }
      v14Raf = requestAnimationFrame(step);
    };
    v14Raf = requestAnimationFrame(step);
    dlDraw();
  }
}
function v14PvpBrake(p) {
  const D = DL && DL.pvp; if (!D || DL.phase !== "pvp" || D.step !== "brake" || D.hit[p] != null) return;
  D.hit[p] = D.x;
  const el = document.getElementById("v14Pb" + p); if (el) { el.classList.add("done"); el.querySelector("em").textContent = "¡FRENÓ!"; }
  if (D.hit[1] != null && D.hit[2] != null) setTimeout(v14PvpEnd, 350);
}
function v14PvpEnd() {
  const D = DL && DL.pvp; if (!D) return;
  cancelAnimationFrame(v14Raf);
  const sc = (x, z) => { if (x == null || x < z[0] || x > z[1]) return 0; const c = (z[0] + z[1]) / 2, hw = (z[1] - z[0]) / 2; return 1 - Math.abs(x - c) / hw + 0.01; };
  const sa = sc(D.hit[D.atk], D.zoneA), sd = sc(D.hit[D.def], D.zoneD);
  const win = sa > sd;
  const st = dlState(); st.moves2 = st.moves2 || [];
  const loser = v14Me(D.def);
  if (win && loser) (D.atk === 1 ? st.moves : st.moves2).push({ other: loser.name, res: "gain", lap: D.lap });
  dlFeed(D.lap, win ? "⚔️ ¡" + (D.atk === 1 ? "🟡 " : "🔵 ") + v14Name(D.atk) + " le ganó el duelo a " + v14Name(D.def) + " y lo pasa!" : "🛡️ ¡" + (D.def === 1 ? "🟡 " : "🔵 ") + v14Name(D.def) + " aguantó el ataque de " + v14Name(D.atk) + "!", true, "ok");
  try { fwRadioSay(win ? "¡" + v14Name(D.atk) + " pasó a " + v14Name(D.def) + "! ¡Qué duelo!" : "¡" + v14Name(D.def) + " cerró la puerta! El duelo sigue.", "eng", { priority: true }); } catch (e) {}
  st.pvp = (st.pvp || 0) + 1;
  DL.pvp = null; DL.phase = "run";
  dlRebuild(); dlDraw(); dlSchedule();
  try { if (win) v9ReplayStart(D.lap, v13Short(v14Name(D.atk)) + " pasa a " + v13Short(v14Name(D.def))); } catch (e) {}
}
function v14PvpHtml() {
  const D = DL.pvp;
  const head = `<div class="q">⚔️ DUELO ENTRE LOS DOS · vuelta ${D.lap}</div>`;
  if (D.step === "atk" || D.step === "def") {
    const p = D.step === "atk" ? D.atk : D.def;
    return `<div class="eng-live-dec v14-pvp p${p}">${head}<p class="small">${p === 1 ? "🟡" : "🔵"} <b>${v13Esc(v14Name(p))}</b>: ${D.step === "atk" ? "¿por dónde atacás?" : "¿qué lado cubrís?"} (en secreto)</p>
      <div class="v7-sides"><button type="button" class="lv-btn" onclick="v14PvpSide('in')">↙️ ${D.step === "atk" ? "Por adentro" : "Cubro adentro"} <kbd>←</kbd></button><button type="button" class="lv-btn" onclick="v14PvpSide('out')">${D.step === "atk" ? "Por afuera" : "Cubro afuera"} ↗️ <kbd>→</kbd></button></div></div>`;
  }
  const z = (k, c) => `<i class="z ${c}" style="left:${k[0]}%;width:${k[1] - k[0]}%"></i>`;
  const pb = p => `<button type="button" class="dark v14-half p${p}" id="v14Pb${p}" onpointerdown="event.preventDefault();v14PvpBrake(${p})"><b>${p === 1 ? "🟡" : "🔵"} ${v13Esc(v14Name(p))} ${p === D.atk ? "(ataca)" : "(defiende)"}</b><span>¡FRENÁ! · <kbd>${p === 1 ? "A" : "L"}</kbd></span><em></em></button>`;
  return `<div class="eng-live-dec v14-pvp">${head}<p class="small">Frenen los dos en <b>su</b> zona: 🟡 amarilla para ${v13Esc(v14Name(1))}, 🔵 celeste para ${v13Esc(v14Name(2))}. Gana el que frene más cerca del centro.</p>
    <div class="dl-duel-bar v14-bar">${z(D.atk === 1 ? D.zoneA : D.zoneD, "y")}${z(D.atk === 2 ? D.zoneA : D.zoneD, "b")}<b id="v14PvpMark" style="left:${D.x}%"></b></div>
    <div class="v14-halves">${pb(1)}${pb(2)}</div></div>`;
}

/* ============================ ganchos de la transmisión ============================ */
(function () {
  if (typeof v7StartOpen === "function") {
    const o = v7StartOpen;
    v7StartOpen = function () {
      try {
        if (v13On() && DL && DL.mode === "race" && !DL.skip && DL.me && DL.me.status !== "DNS") {
          if (!DL._betsDone) { if (v14BetsOpen()) return; }
          if (DL._betsDone && DL._p2Strat && DL._stratAsked) { v14StartOpen(); return; }
        }
      } catch (e) { console.warn("[FAWIWE] v144:", e); }
      return o.apply(this, arguments);
    };
  }
  if (typeof dlLap === "function") {
    const o = dlLap;
    dlLap = function (l) { const r = o.apply(this, arguments); try { if (v13On()) v14PvpCheck(l); } catch (e) {} return r; };
  }
  if (typeof dlRaceExtras === "function") {
    const o = dlRaceExtras;
    dlRaceExtras = function (l) {
      const r = o.apply(this, arguments);
      if (r) return r;
      try { if (v13On() && DL && DL.pendingPvp && !DL.skip && DL.phase === "run") return v14PvpOpen(); } catch (e) {}
      return r;
    };
  }
  if (typeof dlDraw === "function") {
    const o = dlDraw;
    dlDraw = function () {
      const r = o.apply(this, arguments);
      try {
        const box = document.getElementById("dlDecision");
        if (box && DL) {
          if (DL.phase === "bets" && DL.bets) box.innerHTML = v14BetsHtml();
          else if (DL.phase === "start2" && DL.st2) box.innerHTML = v14StartHtml();
          else if (DL.phase === "pvp" && DL.pvp) box.innerHTML = v14PvpHtml();
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlSkip === "function") {
    const o = dlSkip;
    dlSkip = function () {
      try {
        if (DL && DL.phase === "bets") { if (DL.bets && !DL.bets.p1) DL.bets.p1 = "none"; if (DL.bets) { DL.bets.p2 = DL.bets.p2 || "none"; dlState().bets = { p1: DL.bets.p1, p2: DL.bets.p2 }; } DL.bets = null; DL._betsDone = true; DL.phase = "run"; }
        if (DL && DL.phase === "start2") { cancelAnimationFrame(v14Raf); DL.st2 = null; DL.phase = "run"; }
        if (DL && DL.phase === "pvp") { cancelAnimationFrame(v14Raf); DL.pvp = null; DL.phase = "run"; }
        if (DL) DL.pendingPvp = null;
        document.getElementById("v14Pass")?.classList.remove("show");
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  if (typeof dlFinalize === "function") {
    const o = dlFinalize;
    dlFinalize = function () {
      let lines = [];
      try { if (v13On() && DL && DL.mode === "race") { const g1 = DL.grid.find(x => x.mine && x.seat === 1), g2 = DL.grid.find(x => x.name === v13P2Name()); lines = v14BetsSettle(g1, g2); } } catch (e) {}
      const r = o.apply(this, arguments);
      try { if (lines.length) { lines.forEach(t => add("💰 " + t + ".")); setTimeout(() => v9Toast("💰 " + lines.join(" · ")), 900); render(); } } catch (e) {}
      return r;
    };
  }
  window.addEventListener("keydown", ev => {
    if (typeof DL === "undefined" || !DL || !document.getElementById("dlOverlay")?.classList.contains("show")) return;
    if (document.getElementById("v14Pass")?.classList.contains("show")) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopImmediatePropagation(); document.getElementById("v14PassGo")?.click(); } return; }
    const k = ev.key.toLowerCase();
    if (DL.phase === "bets" && ["1", "2", "3", "4"].includes(k)) { ev.preventDefault(); ev.stopImmediatePropagation(); v14Bet(+k - 1); }
    else if (DL.phase === "start2" && (k === "a" || k === "l")) { ev.preventDefault(); ev.stopImmediatePropagation(); v14StartHit(k === "a" ? 1 : 2); }
    else if (DL.phase === "pvp" && DL.pvp) {
      if ((DL.pvp.step === "atk" || DL.pvp.step === "def") && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) { ev.preventDefault(); ev.stopImmediatePropagation(); v14PvpSide(ev.key === "ArrowLeft" ? "in" : "out"); }
      else if (DL.pvp.step === "brake" && (k === "a" || k === "l")) { ev.preventDefault(); ev.stopImmediatePropagation(); v14PvpBrake(k === "a" ? 1 : 2); }
    }
  }, true);
})();

/* ============================ 🏆 COPA DEL DUELO ============================ */
function v14Chart(season) {
  const L = (s.duelLog || []).filter(x => x.season === season);
  if (L.length < 2) return "";
  const W = 320, H = 120, n = L.length, max = Math.max(10, ...L.map(x => Math.max(x.p1 || 0, x.p2 || 0)));
  const X = i => (12 + i * (W - 24) / (n - 1)).toFixed(1), Y = v => (10 + (v - 1) / (max - 1) * (H - 24)).toFixed(1);
  const line = (k, c) => `<polyline fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" points="${L.map((x, i) => X(i) + "," + Y(x[k] || max)).join(" ")}"/>` + L.map((x, i) => `<circle cx="${X(i)}" cy="${Y(x[k] || max)}" r="3.5" fill="${c}"><title>${v13Esc(x.track || "")}: P${x[k]}</title></circle>`).join("");
  return `<svg class="v14-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Posiciones de los dos jugadores carrera por carrera"><line x1="0" y1="${Y(1)}" x2="${W}" y2="${Y(1)}" stroke="#333" stroke-dasharray="3 4"/><text x="2" y="${+Y(1) - 2}" fill="#666" font-size="8">P1</text>${line("p1", "#facc15")}${line("p2", "#38bdf8")}</svg>`;
}
if (typeof duelCardHtml === "function") {
  const o = duelCardHtml;
  duelCardHtml = function () {
    let h = o.apply(this, arguments);
    try {
      const ch = v14Chart(s.season);
      const cups = s.v14Cups || [];
      h += `<div class="v14-cup"><h3>🏆 Copa del duelo</h3>${ch ? `<p class="small">📈 Carrera por carrera ${s.season} (🟡 ${v13Esc(v13P1Label())} · 🔵 ${v13Esc(v13P2Label())})</p>${ch}` : `<p class="small">El gráfico aparece después de dos carreras.</p>`}
        ${cups.length ? `<div class="v14-cups">${cups.map(c => `<span class="${c.w === 1 ? "a" : c.w === 2 ? "b" : ""}">🏆 ${c.season}: ${c.w ? (c.w === 1 ? "🟡 " : "🔵 ") + v13Esc(c.name) : "empate"}</span>`).join("")}</div>` : ""}
        <button type="button" class="lv-btn" onclick="v14ShareDuel()">📸 Tarjeta del duelo</button></div>`;
    } catch (e) {}
    return h;
  };
}
if (typeof duelShowChampion === "function") {
  const o = duelShowChampion;
  duelShowChampion = function (season, a, b) {
    const r = o.apply(this, arguments);
    try {
      const w = a > b ? 1 : b > a ? 2 : 0;
      s.v14Cups = s.v14Cups || [];
      if (!s.v14Cups.some(c => c.season === season)) s.v14Cups.push({ season, w, name: w ? v14NameFor(w) : "", a, b });
      const ov = document.getElementById("duelChamp");
      if (ov) {
        const plate = ov.querySelector(".dc-plate");
        if (plate && !plate.querySelector(".v14-chart")) plate.insertAdjacentHTML("beforeend", `<div class="v14-cupk">🏆 COPA DEL DUELO ${season}</div>` + v14Chart(season) + `<button type="button" class="lv-btn" onclick="v14ShareDuel(${season})">📸 Tarjeta del duelo</button>`);
        if (!ov.querySelector(".v7-fw")) ov.insertAdjacentHTML("afterbegin", Array.from({ length: 6 }, (_, i) => `<div class="v7-fw" style="left:${10 + i * 15}%;animation-delay:${(i % 3) * 0.5}s;--c:${["#facc15", "#38bdf8", "#e10600", "#22c55e", "#fff", "#f472b6"][i]}"></div>`).join(""));
      }
      setTimeout(() => { try { fwRadioSay(w ? "¡" + v14NameFor(w) + " gana la Copa del duelo " + season + "!" : "¡Empate en la Copa del duelo!", "eng", { priority: true }); } catch (e) {} }, 900);
    } catch (e) {}
    return r;
  };
}
function v14NameFor(w) { return w === 1 ? v13P1Label() : v13P2Label(); }
function v14ShareDuel(season) {
  season = season || s.season;
  const L = (s.duelLog || []).filter(x => x.season === season);
  const w1 = L.filter(x => x.w === 1).length, w2 = L.filter(x => x.w === 2).length;
  const cup = (s.v14Cups || []).find(c => c.season === season);
  const pts = cup ? [cup.a, cup.b] : [s.points, s.player2 ? s.player2.points : 0];
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#2a2205"); g.addColorStop(0.5, "#0b0b10"); g.addColorStop(1, "#06202e"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = "#e10600"; x.fillRect(0, 0, W, 14);
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#fff" : "#111"; x.fillRect(i * (W / 14), H - 44, W / 14, 30); }
  x.textAlign = "center";
  x.fillStyle = "#e10600"; x.font = "900 52px Arial Black, Arial"; x.fillText("FAWIWE F1", W / 2, 110);
  x.fillStyle = "#facc15"; x.font = "800 34px Arial"; x.fillText("⚔️ EL DUELO · TEMPORADA " + season, W / 2, 170);
  x.font = "900 60px Arial"; x.fillStyle = "#facc15"; x.fillText(v13P1Label(), W / 2, 300);
  x.fillStyle = "#fff"; x.font = "900 54px Arial Black, Arial"; x.fillText("VS", W / 2, 380);
  x.fillStyle = "#38bdf8"; x.font = "900 60px Arial"; x.fillText(v13P2Label(), W / 2, 460);
  x.fillStyle = "#fff"; x.font = "900 200px Arial Black, Arial"; x.fillText(w1 + " – " + w2, W / 2, 690);
  x.fillStyle = "#aaa"; x.font = "700 32px Arial"; x.fillText("CARRERAS GANADAS EN EL CARA A CARA", W / 2, 745);
  x.fillStyle = "#fff"; x.font = "800 44px Arial"; x.fillText("Puntos: " + pts[0] + " · " + pts[1], W / 2, 830);
  // gráfico
  if (L.length >= 2) {
    const gx = 120, gy = 880, gw = W - 240, gh = 260, max = Math.max(10, ...L.map(r => Math.max(r.p1 || 0, r.p2 || 0)));
    x.strokeStyle = "#333"; x.lineWidth = 2; x.strokeRect(gx, gy, gw, gh);
    const P = (i, v) => [gx + 20 + i * (gw - 40) / (L.length - 1), gy + 20 + (v - 1) / (max - 1) * (gh - 40)];
    [["p1", "#facc15"], ["p2", "#38bdf8"]].forEach(([k, col]) => { x.strokeStyle = col; x.lineWidth = 6; x.beginPath(); L.forEach((r, i) => { const [px, py] = P(i, r[k] || max); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); });
  }
  x.fillStyle = cup && cup.w ? (cup.w === 1 ? "#facc15" : "#38bdf8") : "#fff"; x.font = "900 46px Arial";
  x.fillText(cup ? (cup.w ? "🏆 Copa para " + cup.name : "🏆 Empate en la Copa") : "🏁 Temporada en juego", W / 2, 1220);
  x.fillStyle = "#777"; x.font = "600 24px Arial"; x.fillText("Jugado en FAWIWE F1 · #FAWIWE", W / 2, H - 70);
  const url = c.toDataURL("image/png");
  let ov = document.getElementById("v6Share");
  if (!ov) { ov = document.createElement("div"); ov.id = "v6Share"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="v6-share-card"><div class="hof-k">📸 TARJETA DEL DUELO ${season}</div><img src="${url}" alt="Tarjeta del duelo ${season}"><div class="v6-res-btns"><a class="lv-btn red" href="${url}" download="fawiwe-duelo-${season}.png">⬇️ Descargar</a><button type="button" class="lv-btn" onclick="document.getElementById('v6Share').classList.remove('show')">Cerrar</button></div></div>`;
  ov.classList.add("show");
}

/* ============================ 🔄 el cartel de turno tapa la pantalla ============================ */
// (el de duel.js dejaba ver lo del otro jugador detrás)
try { V5_KEYS.push("v14Cups"); } catch (e) {}

/* ============================ tutorial ============================ */
function v14Tut() {
  const pg = document.querySelector('#v10Tut .v10-page[data-t="menu"]');
  if (!pg || pg.querySelector(".v14-tut")) return;
  const ul = pg.querySelector(".v13-tut + ul");
  const html = `<li class="v14-tut"><b>💰 Apuestas del paddock</b> antes de largar, <b>🚦 largada a dos</b> (P1 toca la izquierda o la A, P2 la derecha o la L) y <b>⚔️ duelo en pista</b> cuando los dos autos quedan pegados: uno elige por dónde atacar y el otro qué cubrir, en secreto.</li>
    <li><b>🔄 Pasá el celu</b>: entre turnos la pantalla se tapa para que no veas lo del otro. <b>🏆 Copa del duelo</b> con gráfico carrera por carrera y tarjeta para compartir.</li>`;
  if (ul) ul.insertAdjacentHTML("beforeend", html); else pg.insertAdjacentHTML("beforeend", `<ul>${html}</ul>`);
}
(function () {
  if (document.readyState !== "loading") setTimeout(v14Tut, 50); else document.addEventListener("DOMContentLoaded", v14Tut);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { v14Tut(); } catch (e) {} return r; }; window.render = render; }
})();
