/* =====================================================================================
   FAWIWE · V143 — MULTIJUGADOR
   El Jugador 2 pasa a ser un auto real de la grilla (posiciones coherentes) y se suma lo del
   modo solitario: clasificación en vivo, transmisión con los dos autos (estrategia, pases,
   boxes y radio para cada uno), cara a cara antes de la carrera, bandera para los dos y
   carrera rápida para 2. + arreglos de pantalla (nombres, plata, celular, datos repetidos).
   ===================================================================================== */
function v13On() { return typeof s !== "undefined" && s && !!s.player2 && !!s.team; }
function v13Drv() { return s.playerMode === "driver"; }
function v13P2Name() {
  if (!v13On()) return null;
  if (v13Drv() && s.player2.playedDriverName) return s.player2.playedDriverName;
  try { const L = currentTeamLineup(s.player2.club); return L && L[0] ? L[0][0] : null; } catch (e) { return null; }
}
function v13P1Label() { return v13Drv() ? (s.playedDriverName || s.name) : s.name; }
function v13P2Label() { return v13Drv() ? (s.player2.playedDriverName || s.player2.name) : s.player2.name; }
function v13Short(n) { try { return lapShort(n); } catch (e) { return String(n || "").split(" ").slice(-1)[0].toUpperCase(); } }
function v13Esc(t) { return v9Esc(t); }
try { FW_WHO.p2 = { tag: "📻 BOX P2", color: "#38bdf8", pitch: 0.95, rate: 1.1, v: 1 }; } catch (e) {}
function v13Say(t, o) { if (typeof DL !== "undefined" && DL && DL.skip) return; try { fwRadioSay(t, "p2", o); } catch (e) {} }

/* ============================ el auto del Jugador 2 en la grilla ============================ */
// Modo piloto: el piloto que eligió P2 corre en su equipo (y deja su asiento original)
if (typeof currentTeamLineup === "function") {
  const o = currentTeamLineup;
  currentTeamLineup = function (team) {
    let L = o.apply(this, arguments);
    try {
      if (v13On() && v13Drv() && s.player2.playedDriverName) {
        const n2 = s.player2.playedDriverName, r2 = s.player2.playedDriverRating || 80;
        const orig = originalDriverLineup(team, s.season);
        if (team === s.player2.club) {
          const mate = orig.find(d => d[0] !== n2 && d[0] !== s.playedDriverName) || L.find(d => d && d[0] !== n2 && d[0] !== s.playedDriverName) || [generateRookieName("p2mate_" + team + "_" + s.season), 72, 2, team];
          L = [[n2, r2, 2, team], mate];
        } else {
          const i = L.findIndex(d => d && d[0] === n2);
          if (i >= 0) {
            L = L.slice();
            const used = new Set(L.filter(Boolean).map(d => d[0]).concat([n2, s.playedDriverName]));
            const pool = orig.concat(typeof lastKnownLineup === "function" ? [] : []);
            L[i] = pool.find(d => !used.has(d[0])) || [generateRookieName("p2rem_" + team + "_" + s.season), 74, 2, team];
          }
        }
      }
    } catch (e) {}
    return L;
  };
}
// rendimiento del auto de P2: su auto, sus minijuegos y lo que decida en la transmisión
let V13_ADJ = null;
if (typeof effectiveRating === "function") {
  const o = effectiveRating;
  effectiveRating = function (name, base) { let r = o.apply(this, arguments); try { if (V13_ADJ && name === V13_ADJ.n) r += V13_ADJ.adj; } catch (e) {} return r; };
}
function v13Adj(kind, timing) {
  const n = v13P2Name(); if (!n) return null;
  const t = getTeamsForYear(s.season).find(x => x[0] === s.player2.club);
  const tr = t ? t[1] : 3, base = 20 + tr * 14;
  let sc = (s.player2.car - base) * 1.0;
  if (kind === "race") {
    sc += ((s.player2.raceMiniScore != null ? s.player2.raceMiniScore : 50) - 50) * 0.5;
    try { const st = s._dl && s._dl.key === dlKey() ? s._dl : null; if (st) sc += st.bonus2 || 0; } catch (e) {}
  } else {
    const tm = timing || s.player2.qualiTiming;
    sc += tm === "optimal" ? 8 : tm === "late" ? 3 : tm === "early" ? -3 : 0;
  }
  return { n, adj: sc / (0.42 * (s.aiLevel || 1)) };
}
let V13_QT = null;
if (typeof simulateGrid === "function") {
  const o = simulateGrid;
  simulateGrid = function (kind) {
    if (!v13On()) return o.apply(this, arguments);
    const keep = V13_ADJ;
    V13_ADJ = v13Adj(kind, V13_QT);
    let r;
    try { r = o.apply(this, arguments); } finally { V13_ADJ = keep; }
    try {
      if (!Array.isArray(r)) return r;
      const n2 = v13P2Name();
      const st = s._dl && s._dl.key === dlKey() ? s._dl : null;
      if (kind === "race" && st && !st.final && (st.moves2 || []).length) {
        const ord = r.slice();
        (st.moves2 || []).forEach(m => {
          const a = ord.find(x => x.name === n2), b = ord.find(x => x.name === m.other);
          if (!a || !b || a.status || b.status) return;
          const ia = ord.indexOf(a), ib = ord.indexOf(b);
          if ((m.res === "gain" && ib < ia) || (m.res === "lose" && ib > ia)) { ord[ia] = b; ord[ib] = a; }
        });
        const ps = s.pointsSystem || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        ord.forEach((x, i) => { if (x.status === "DNS") { x.pos = null; x.pts = 0; return; } x.pos = i + 1; x.pts = (!x.status && i < ps.length) ? ps[i] : 0; });
        r = ord;
      }
      r.forEach(x => { if (x.name === n2) x.p2 = true; });
      const p1 = r.find(x => x.mine && x.seat === 1), p2 = r.find(x => x.name === n2);
      const pos = x => x ? (x.pos || r.length) : r.length;
      s["_v13" + (kind === "race" ? "Race" : "Quali")] = { key: dlKey(), p1: pos(p1), p2: pos(p2), s1: p1 && p1.status, s2: p2 && p2.status, n2 };
    } catch (e) { console.warn("[FAWIWE] multijugador grilla:", e); }
    return r;
  };
  window.simulateGrid = simulateGrid;
}
// las posiciones de los dos jugadores salen de la grilla (antes eran una cuenta aparte)
if (typeof calcRacePos === "function") {
  const o = calcRacePos;
  calcRacePos = function () {
    try {
      if (v13On()) {
        if (!s._v13Race || s._v13Race.key !== dlKey()) simulateGrid("race");
        const R = s._v13Race;
        if (R && R.key === dlKey()) return s.club === s.player2.club ? R.p2 : R.p1;
      }
    } catch (e) { console.warn("[FAWIWE] multijugador carrera:", e); }
    return o.apply(this, arguments);
  };
}
if (typeof calcQualiPos === "function") {
  const o = calcQualiPos;
  calcQualiPos = function (car, stars, timing) {
    try {
      if (v13On()) {
        const p2 = s.activePlayer === 2;
        if (p2) { s.player2.qualiTiming = timing; V13_QT = timing; }
        let R; try { simulateGrid("quali"); R = s._v13Quali; } finally { V13_QT = null; }
        if (R && R.key === dlKey()) return p2 ? R.p2 : R.p1;
      }
    } catch (e) { console.warn("[FAWIWE] multijugador qualy:", e); }
    return o.apply(this, arguments);
  };
}
if (typeof window.finishRace === "function") {
  const o = window.finishRace;
  window.finishRace = function () {
    try { if (v13On() && !s.raceDone) { s._v13Race = null; } } catch (e) {}
    const before = v13On() ? s.player2.points : 0;
    const r = o.apply(this, arguments);
    try {
      if (v13On() && v13Drv() && s.raceDone && s._v13Paid !== dlKey()) {
        s._v13Paid = dlKey();
        const got = s.player2.points - before;
        s.player2.money = Math.round(((s.player2.money || 0) + 0.3 + Math.max(0, got) * 0.05) * 10) / 10; // premio y sueldo del piloto P2
      }
    } catch (e) {}
    return r;
  };
}
// sin sprint en multijugador (los puntos de la sprint eran solo para P1)
if (typeof dlSprintWeekend === "function") { const o = dlSprintWeekend; dlSprintWeekend = function () { if (v13On()) return false; return o.apply(this, arguments); }; }
// la transmisión en vivo también en multijugador (piloto e ingeniero)
if (typeof dlOn === "function") {
  const o = dlOn;
  dlOn = function () { if (v13On()) return !!(s && s.team); return o.apply(this, arguments); };
}

/* ============================ ⏱️ clasificación en vivo para los dos ============================ */
let V13_NOQ = false;
if (typeof window.announceQuali === "function") {
  const o = window.announceQuali;
  window.announceQuali = function () { const on = v13On() && s.qlLive !== false && !s._dlSkip; V13_NOQ = on; try { return o.apply(this, arguments); } finally { V13_NOQ = false; } };
  try { announceQuali = window.announceQuali; } catch (e) {}
}
if (typeof showBigResult === "function") {
  const o = showBigResult;
  showBigResult = function (kind) {
    if (V13_NOQ && /CLASIFICACI/i.test(String(kind))) { v9Toast("✅ Vuelta de clasificación lista. Cuando terminen los dos, ¡clasificación en vivo!"); return; }
    return o.apply(this, arguments);
  };
  window.showBigResult = showBigResult;
}
if (typeof window.finalizeQuali === "function" || typeof finalizeQuali === "function") {
  const o = finalizeQuali;
  finalizeQuali = function () {
    const wasP2 = v13On() && s.activePlayer === 2;
    const r = o.apply(this, arguments);
    try {
      if (wasP2 && s.session === 3 && s.qlLive !== false && !s._dlSkip && typeof qlStart === "function" && !QL) {
        const g = simulateGrid("quali").map(x => Object.assign({}, x));
        const n2 = v13P2Name();
        g.forEach(x => { if (x.mine && x.seat !== 1) x.mine = false; if (x.name === n2) { x.mine = true; x.seat = 2; } });
        qlStart(g, "multi");
        QL.eng = true; QL.v13 = true;
        qlFeed("👥 " + v13P1Label() + " y " + v13P2Label() + " a la pista. ¡Que gane el mejor!");
      }
    } catch (e) { console.warn("[FAWIWE] qualy multijugador:", e); try { QL = null; document.getElementById("qlOverlay")?.classList.remove("show"); } catch (e2) {} }
    return r;
  };
  window.finalizeQuali = finalizeQuali;
}
if (typeof qlFinish === "function") {
  const o = qlFinish;
  qlFinish = function () {
    if (!(typeof QL !== "undefined" && QL && QL.v13)) return o.apply(this, arguments);
    clearInterval(qlTimer); clearInterval(qlDecTimer);
    const q = QL; QL = null;
    document.getElementById("qlOverlay").classList.remove("show");
    q.order.forEach((x, i) => { x.pos = i + 1; });
    const n2 = v13P2Name();
    const a = q.order.find(x => x.mine && x.seat === 1), b = q.order.find(x => x.name === n2);
    if (a) s.qualiPos = a.pos;
    if (b) s.player2.qualiPos = b.pos;
    s._qlKey = q.key;
    s._dlQuali = { key: q.key, names: q.order.map(x => x.name) };
    try { const e = engEnsure(); e.lastQualiOrder = { key: engKey(), names: q.order.map(x => x.name) }; } catch (e) {}
    add("⏱️ Clasificación final: 🟡 " + v13P1Label() + " P" + (a ? a.pos : "?") + " · 🔵 " + v13P2Label() + " P" + (b ? b.pos : "?") + ".");
    try { render(); } catch (e) {}
    try {
      const pa = a ? a.pos : 99, pb = b ? b.pos : 99;
      showBigResult("CLASIFICACIÓN · " + ((trackData[s.gp] || {}).name || ""), "🟡 P" + pa + "  ·  🔵 P" + pb, (pa < pb ? v13P1Label() : v13P2Label()) + " larga adelante en el duelo. " + v13P1Label() + " P" + pa + " · " + v13P2Label() + " P" + pb + ".", "points", q.order.slice(0, 22).map((x, i) => ({ name: x.name, team: x.team, pos: i + 1, pts: 0, mine: x.mine })));
    } catch (e) {}
  };
}

/* ============================ 📺 transmisión: la capa del Jugador 2 ============================ */
// sus paradas y su auto marcado en el vuelta a vuelta
if (typeof engBuildLaps === "function") {
  const o = engBuildLaps;
  engBuildLaps = function (entries, opt) {
    try {
      if (v13On() && typeof DL !== "undefined" && DL && DL.mode === "race" && Array.isArray(entries)) {
        const n2 = v13P2Name();
        if (n2 && entries.some(x => x.name === n2)) {
          const ent = entries.map(x => x.name === n2 ? Object.assign({}, x, { mine: true, seat: 3 }) : x);
          const op = Object.assign({}, opt || {});
          if (DL.pits2) op.myPits = Object.assign({}, op.myPits || {}, { 3: DL.pits2.slice() });
          const d = o.call(this, ent, op);
          d.rows.forEach(r => { if (r.name === n2) r.p2 = true; });
          return d;
        }
      }
    } catch (e) { console.warn("[FAWIWE] vuelta a vuelta P2:", e); }
    return o.apply(this, arguments);
  };
}
function v13Me2() { return DL && DL.data && DL.data.rows.find(r => r.p2); }
// pases jugados por P2 también quedan en el vuelta a vuelta
if (typeof dlApplyLocks === "function") {
  const o = dlApplyLocks;
  dlApplyLocks = function () {
    const r = o.apply(this, arguments);
    try {
      const st = s._dl, me2 = v13Me2();
      if (v13On() && st && me2 && (st.moves2 || []).length) {
        let ch = false;
        st.moves2.forEach(m => { ch = (m.res === "lose" ? dlLockPair(m.other, me2.name, m.lap + 1) : dlLockPair(me2.name, m.other, m.lap + 1)) || ch; });
        if (ch) lapFinalize(DL.data);
      }
    } catch (e) {}
    return r;
  };
}
// estrategia de P2 (después de la de P1, antes de la largada)
function v13StratOpen() {
  if (!DL || DL.mode !== "race" || DL.skip || !v13Me2()) return false;
  DL.strat = v9StratPlans(); DL.strat.p2 = true;
  DL.phase = "strat";
  clearInterval(dlTimer);
  v13Say(v13Short(v13P2Label()) + ", turno de tu estrategia. " + DL.strat.why + ".");
  clearTimeout(DL._stratTO); DL._stratTO = setTimeout(() => { if (DL && DL.phase === "strat" && DL.strat && DL.strat.p2) v9StratChoose(DL.strat.rec, true); }, 30000);
  dlDraw();
  return true;
}
if (typeof v9StratChoose === "function") {
  const o = v9StratChoose;
  v9StratChoose = function (i, auto) {
    if (!(DL && DL.phase === "strat" && DL.strat && DL.strat.p2)) return o.apply(this, arguments);
    clearTimeout(DL._stratTO);
    const R = DL.strat, p = R.P[i], st = dlState();
    const g = i === R.rec ? 1.2 : p.min < 15 ? -1.5 : -0.3;
    st.bonus2 = (st.bonus2 || 0) + g;
    DL.pits2 = p.pits.slice(); DL._p2Strat = true;
    DL.strat = null; DL.phase = "run";
    dlRebuild();
    dlFeed(0, "🔵 " + v13P2Label() + " · estrategia: " + p.name + (auto ? " (la eligió su box)" : "") + ".", true, g > 0 ? "ok" : g < -1 ? "bad" : "");
    v7StartOpen();
  };
}
if (typeof v9StratHtml === "function") {
  const o = v9StratHtml;
  v9StratHtml = function () { const h = o.apply(this, arguments); try { if (DL.strat && DL.strat.p2) return h.replace('<div class="q">🧠 ESTRATEGIA', '<div class="q v13-p2q">🔵 ' + v13Esc(v13P2Label()) + ' · 🧠 ESTRATEGIA'); if (v13On()) return h.replace('<div class="q">🧠 ESTRATEGIA', '<div class="q">🟡 ' + v13Esc(v13P1Label()) + ' · 🧠 ESTRATEGIA'); } catch (e) {} return h; };
}
if (typeof v7StartOpen === "function") {
  const o = v7StartOpen;
  v7StartOpen = function () {
    try {
      if (v13On() && DL && DL.mode === "race" && !DL.skip && DL._stratAsked && !DL._p2Strat) {
        DL._p2Strat = true;
        if (v13StratOpen()) return;
      }
    } catch (e) {}
    return o.apply(this, arguments);
  };
}
// pases y defensas de P2
function v13QteCheck(l) {
  const me2 = v13Me2(); if (!me2 || DL.mode !== "race" || DL.skip || DL.phase !== "run" || DL.pendingQte || DL.pendingQte2) return;
  if ((DL._q2n || 0) >= 3 || l < 3 || l > DL.N - 3 || me2.t.length <= l || me2.status === "DNS") return;
  if (DL._q2last && l - DL._q2last < 7) return;
  if (me2.pits.includes(l) || me2.pits.includes(l + 1)) return;
  const d = DL.data, p = me2.pos[l];
  const ahead = d.rows.find(r => r.pos[l] === p - 1 && r.t.length > l), behind = d.rows.find(r => r.pos[l] === p + 1 && r.t.length > l);
  const gA = ahead ? me2.cum[l - 1] - ahead.cum[l - 1] : 99, gB = behind ? behind.cum[l - 1] - me2.cum[l - 1] : 99;
  const okR = r => r && !r.pits.includes(l) && !(r.mine && r.seat === 1); // contra P1 es el duelo del paquete 3
  const cand = gA < 1.0 && okR(ahead) ? { atk: true, other: ahead, gap: gA } : gB < 1.0 && okR(behind) ? { atk: false, other: behind, gap: gB } : null;
  if (cand && dlH("q2" + l + dlKey()) % 3 !== 0) { DL._q2last = l; DL._q2n = (DL._q2n || 0) + 1; DL.pendingQte2 = { atk: cand.atk, other: cand.other.name, lap: l, gap: cand.gap }; }
}
function v13QteOpen() {
  const P = DL.pendingQte2; DL.pendingQte2 = null; if (!P) return false;
  const side = dlH("q2side" + P.lap + dlKey()) % 2 ? "in" : "out";
  DL.qte = Object.assign(P, { p2: true, step: "side", side, t0: performance.now(), x: 0, v: 1, speed: s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8 });
  DL.phase = "qte";
  const nm = dlShort(P.other), who = v13P2Label();
  dlFeed(P.lap, "🔵 " + who + (P.atk ? " tiene a tiro a " + P.other + " (" + P.gap.toFixed(1) + "s)." : ": " + P.other + " lo ataca a " + P.gap.toFixed(1) + "s."), true);
  v13Say(P.atk ? v13Short(who) + ", lo tenés a " + nm + ". Está cerrando " + (side === "in" ? "el interior" : "el exterior") + "." : v13Short(who) + ", te ataca " + nm + " por " + (side === "in" ? "adentro" : "afuera") + ".", { priority: true });
  clearTimeout(DL._qteTO); DL._qteTO = setTimeout(() => { if (DL && DL.phase === "qte" && DL.qte && DL.qte.p2) v7QteFinish(false, true); }, 14000);
  try { v12Vib([20, 30, 20]); } catch (e) {}
  dlDraw();
  return true;
}
if (typeof v7QteFinish === "function") {
  const o = v7QteFinish;
  v7QteFinish = function (ok, auto) {
    const Q = DL && DL.qte;
    if (!Q || !Q.p2) return o.apply(this, arguments);
    try { cancelAnimationFrame(v7Raf); } catch (e) {}
    clearTimeout(DL._qteTO);
    const st = dlState();
    if (auto && Q.step === "side") ok = dlH("q2a" + Q.lap) % 3 === 0;
    const res = Q.atk ? (ok ? "gain" : "keep") : (ok ? "keep" : "lose");
    st.moves2 = st.moves2 || [];
    if (res !== "keep") st.moves2.push({ other: Q.other, res, lap: Q.lap });
    const who = v13P2Label();
    dlFeed(Q.lap, Q.atk ? (ok ? "🔵 ⚔️ ¡" + who + " pasa a " + Q.other + "!" : "🔵 ⚔️ " + Q.other + " le cerró la puerta a " + who + ".") : (ok ? "🔵 🛡️ ¡" + who + " aguantó a " + Q.other + "!" : "🔵 🛡️ " + Q.other + " pasó a " + who + "."), true, ok ? "ok" : "bad");
    v13Say(Q.atk ? (ok ? "¡Adentro! ¡Qué maniobra!" : "No alcanzó, seguí atrás.") : (ok ? "¡Bien defendido!" : "Te pasó, pegate atrás."));
    DL.qte = null; DL.phase = "run";
    dlRebuild(); dlDraw();
    try { if (!auto && res === "gain") v9ReplayStart(Q.lap, v13Short(who) + " pasa a " + dlShort(Q.other)); } catch (e) {}
  };
}
if (typeof v7QteHtml === "function") {
  const o = v7QteHtml;
  v7QteHtml = function () {
    let h = o.apply(this, arguments);
    try {
      const Q = DL.qte;
      if (Q && Q.p2) h = h.replace('<div class="q">', '<div class="q v13-p2q">🔵 ' + v13Esc(v13P2Label()) + ' · ');
      else if (v13On()) h = h.replace('<div class="q">', '<div class="q">🟡 ' + v13Esc(v13P1Label()) + ' · ');
      if (!v13Drv()) h = h.replace("🎯 ¡ATACÁ A ", "🎯 ORDEN DE ATAQUE: ¡ATACÁ A ").replace("🛡️ ¡DEFENDÉ DE ", "🛡️ ORDEN: ¡DEFENDÉ DE ");
    } catch (e) {}
    return h;
  };
}
// entrada a boxes de P2
function v13PitOpen(l) {
  const old = s.season < 1994;
  DL.pe = { lap: l, t0: performance.now() + 1500, x: 0, old, p2: true, zone: old ? [58, 72] : [60, 74], speed: s.miniDiff === "easy" ? 0.032 : s.miniDiff === "hard" ? 0.05 : 0.04 };
  DL.phase = "pitentry";
  dlFeed(l, "🔵 " + v13P2Label() + " entra a boxes en la vuelta " + l + ".", true);
  v13Say(v13Short(v13P2Label()) + ", box, box. " + (old ? "Frená justo en tu box." : "Limitador en la línea."));
  cancelAnimationFrame(v9Raf);
  const step = () => {
    const P = DL && DL.pe; if (!P || DL.phase !== "pitentry") return;
    const now = performance.now(), cd = document.getElementById("v10PeCd");
    if (now < P.t0) { if (cd) cd.textContent = String(Math.ceil((P.t0 - now) / 500)); } else { if (cd && cd.textContent) cd.textContent = ""; P.x = Math.min(100, (now - P.t0) * P.speed); }
    const m = document.getElementById("v9PeCar"); if (m) m.style.left = P.x + "%";
    if (P.x >= 100) { v9PitEntryHit(true); return; }
    v9Raf = requestAnimationFrame(step);
  };
  v9Raf = requestAnimationFrame(step);
  dlDraw();
  return true;
}
if (typeof v9PitEntryHit === "function") {
  const o = v9PitEntryHit;
  v9PitEntryHit = function (timeout) {
    const P = DL && DL.pe;
    if (!P || !P.p2 || DL.phase !== "pitentry") return o.apply(this, arguments);
    if (!timeout && performance.now() < P.t0) return;
    cancelAnimationFrame(v9Raf);
    const st = dlState(), who = v13P2Label(), me2 = v13Me2();
    let txt, cls;
    if (!timeout && P.x < P.zone[0]) { st.bonus2 = (st.bonus2 || 0) - Math.min(1.5, 0.3 + (P.zone[0] - P.x) / 40); txt = "🔵 🐢 " + who + " frenó muy temprano para entrar a boxes."; cls = "bad"; }
    else if (!timeout && P.x <= P.zone[1]) { st.bonus2 = (st.bonus2 || 0) + 0.6; txt = "🔵 ✅ Entrada a boxes perfecta de " + who + "."; cls = "ok"; }
    else if (P.old) { st.bonus2 = (st.bonus2 || 0) - 1.2; txt = "🔵 😬 " + who + " se pasó de su box."; cls = "bad"; }
    else { if (me2) st.pens.push({ name: me2.name, reason: "Exceso de velocidad en boxes" }); txt = "🔵 🚨 Exceso de velocidad en boxes para " + who + ": +5 segundos."; cls = "bad"; }
    dlFeed(P.lap, txt, true, cls);
    v13Say(cls === "ok" ? "Perfecta la entrada." : "Uy, eso nos costó.");
    DL.pe = null; DL.phase = "run";
    DL._p2pit = DL._p2pit || {}; DL._p2pit[P.lap] = true;
    dlRebuild(); dlSchedule(); dlDraw();
  };
}
if (typeof v9PitEntryHtml === "function") {
  const o = v9PitEntryHtml;
  v9PitEntryHtml = function () {
    let h = o.apply(this, arguments);
    try {
      if (DL.pe && DL.pe.p2) h = h.replace('<div class="q">', '<div class="q v13-p2q">🔵 ' + v13Esc(v13P2Label()) + ' · ');
      else if (v13On()) h = h.replace('<div class="q">', '<div class="q">🟡 ' + v13Esc(v13P1Label()) + ' · ');
      if (!v13Drv()) h = h.replace("Activá el limitador en la zona blanca.", "📻 Avisale a tu piloto cuándo activar el limitador: en la zona blanca.");
    } catch (e) {}
    return h;
  };
}
if (typeof dlRaceExtras === "function") {
  const o = dlRaceExtras;
  dlRaceExtras = function (l) {
    const r = o.apply(this, arguments);
    if (r) return r;
    try {
      if (!v13On() || !DL || DL.mode !== "race" || DL.skip || DL.phase !== "run") return r;
      const me2 = v13Me2();
      if (me2 && me2.pits.includes(l) && me2.t.length >= l && l < DL.N && !(DL._p2pit || {})[l]) { DL._p2pit = DL._p2pit || {}; DL._p2pit[l] = true; return v13PitOpen(l); }
      if (DL.pendingQte2) return v13QteOpen();
    } catch (e) { console.warn("[FAWIWE] P2 en carrera:", e); }
    return r;
  };
}
if (typeof dlLap === "function") {
  const o = dlLap;
  dlLap = function (l) {
    const r = o.apply(this, arguments);
    try {
      if (v13On() && DL && DL.mode === "race") {
        v13QteCheck(l);
        const me2 = v13Me2();
        if (me2 && !DL.skip && l === DL.N - 5 && !DL._p2fin5) { DL._p2fin5 = true; dlFeed(l, "🔵 Últimas 5 vueltas: " + v13P2Label() + " va P" + me2.pos[l] + ".", true); }
      }
    } catch (e) {}
    return r;
  };
}
if (typeof dlSkip === "function") {
  const o = dlSkip;
  dlSkip = function () {
    try {
      if (DL && DL.phase === "strat" && DL.strat && DL.strat.p2) { const p = DL.strat.P[DL.strat.rec]; DL.pits2 = p.pits.slice(); DL.strat = null; DL.phase = "run"; DL._p2Strat = true; }
      if (DL && DL.phase === "qte" && DL.qte && DL.qte.p2) v7QteFinish(false, true);
      if (DL && DL.phase === "pitentry" && DL.pe && DL.pe.p2) { cancelAnimationFrame(v9Raf); DL.pe = null; DL.phase = "run"; }
      if (DL) DL.pendingQte2 = null;
    } catch (e) {}
    return o.apply(this, arguments);
  };
}
// tablero: el auto de P2 en celeste
if (typeof dlDraw === "function") {
  const o = dlDraw;
  dlDraw = function () {
    const r = o.apply(this, arguments);
    try {
      if (v13On() && DL && DL.data) {
        const n2 = v13P2Name();
        document.querySelectorAll("#dlBoard .dl-row").forEach(row => { const nm = row.querySelector(".n"); if (nm && n2 && nm.textContent.indexOf(n2.replace(" (reserva)", "")) === 0) { row.classList.add("v13-p2"); if (!nm.querySelector(".v13-tag")) nm.insertAdjacentHTML("beforeend", ' <span class="v13-tag">P2</span>'); } });
        const h = document.querySelector("#dlOverlay .eng-live-head h2, #dlOverlay h2");
        if (h && !h.dataset.v13) { h.dataset.v13 = 1; h.innerHTML = "👥 " + v13Esc(v13P1Label()) + " vs " + v13Esc(v13P2Label()); }
      }
    } catch (e) {}
    return r;
  };
}

/* ============================ 😤 cara a cara: el rival es el otro jugador ============================ */
function v13Face() {
  if (!v13On() || !DL || DL.skip) return;
  let ov = document.getElementById("v11Face");
  if (!ov) { ov = document.createElement("div"); ov.id = "v11Face"; ov.addEventListener("click", () => ov.classList.remove("show")); document.body.appendChild(ov); }
  const h = s.p2HeadToHead || { p1Wins: 0, p2Wins: 0 };
  const c1 = (typeof teamColors !== "undefined" && teamColors[s.team]) || "#facc15", c2 = (typeof teamColors !== "undefined" && teamColors[s.player2.club]) || "#38bdf8";
  const hs = (c) => typeof v4HelmetSvg === "function" ? v4HelmetSvg({ c1: c, c2: "#111111", pat: "franja", num: "", team: true }, 130) : "";
  const lead = h.p1Wins === h.p2Wins ? "Empatados. Hoy se define." : (h.p1Wins > h.p2Wins ? v13P1Label() : v13P2Label()) + " va adelante en el duelo.";
  ov.innerHTML = `<div class="v11-face"><div class="v11-k">⚔️ CARA A CARA · GP DE ${v13Esc(((trackData[s.gp] || {}).name || "").toUpperCase())}</div>
    <div class="v11-vs"><div class="v11-side me" style="--c:${c1}">${hs(c1)}<b>🟡 ${v13Esc(v13P1Label())}</b><span>${v13Esc(s.team)}</span></div>
    <div class="v11-mid"><i>VS</i><div class="v11-h2h"><b>${h.p1Wins}</b><span>–</span><b>${h.p2Wins}</b></div><small>duelos ganados</small></div>
    <div class="v11-side riv" style="--c:${c2}">${hs(c2)}<b>🔵 ${v13Esc(v13P2Label())}</b><span>${v13Esc(s.player2.club)}</span></div></div>
    <p class="v11-quote">${v13Esc(lead)}</p><div class="v7-flag-tap">Tocá para seguir</div></div>`;
  ov.classList.remove("show"); void ov.offsetWidth; ov.classList.add("show");
  clearTimeout(ov._t); ov._t = setTimeout(() => ov.classList.remove("show"), 5000);
}
if (typeof dlStart === "function") {
  const o = dlStart;
  dlStart = function () {
    const r = o.apply(this, arguments);
    try { if (v13On() && DL && DL.mode === "race" && !DL.skip) setTimeout(v13Face, 250); } catch (e) {}
    return r;
  };
}
// bandera a cuadros y enfriamiento: los dos
if (typeof dlEnd === "function") {
  const o = dlEnd;
  dlEnd = function () {
    const skip = DL && DL.skip, mode = DL && DL.mode;
    const r = o.apply(this, arguments);
    try {
      if (v13On() && DL && mode === "race") {
        const n2 = v13P2Name(), g2 = DL.grid.find(x => x.name === n2), g1 = DL.grid.find(x => x.mine && x.seat === 1);
        const lab = g => g ? (g.status ? (g.status === "DNF" ? "abandonó" : g.status) : "P" + g.pos) : "—";
        if (g2) dlFeed(DL.N, "🔵 " + v13P2Label() + " terminó " + lab(g2) + (g2.pts ? " · +" + g2.pts + " puntos" : "") + ".", true, g2.pos <= 3 && !g2.status ? "ok" : "");
        if (!skip) {
          const fl = document.querySelector("#v7Flag .v7-flag-wrap");
          if (fl) {
            const nm = fl.querySelector(".v7-flag-name"); if (nm) nm.textContent = "🟡 " + v13P1Label() + " · " + lab(g1);
            if (!fl.querySelector(".v13-flag2")) nm.insertAdjacentHTML("afterend", `<div class="v13-flag2">🔵 ${v13Esc(v13P2Label())} · ${v13Esc(lab(g2))}</div>`);
          }
          if (DL._cool && g2) DL._cool.lines.splice(Math.max(1, DL._cool.lines.length - 1), 0, ["eng", v13P2Label() + " terminó " + lab(g2) + ". " + (g1 && g2 && !g1.status && (g2.status || g1.pos < g2.pos) ? "Le ganaste el duelo." : "Hoy el duelo fue para él.")]);
        }
      }
    } catch (e) {}
    return r;
  };
}

/* ============================ arreglos de pantalla ============================ */
if (typeof duelNames === "function") {
  duelNames = function () { return { a: v13On() ? v13P1Label() : (s.name || "P1"), b: v13On() ? v13P2Label() : ((s.player2 && s.player2.name) || "P2") }; };
}
// tarjetas: el mismo formato para los dos y la plata correcta
if (typeof window.render === "function") {
  const rd = window.render;
  render = function () {
    const r = rd.apply(this, arguments);
    try {
      if (v13On()) {
        const p1 = document.querySelector("#multiSplit .split-panel.p1 h3"), p2 = document.querySelector("#multiSplit .split-panel.p2 h3");
        const sub1 = v13Drv() ? "Jugador 1" : s.team, sub2 = v13Drv() ? (s.player2.name && s.player2.name !== v13P2Label() ? s.player2.name : "Jugador 2") : s.player2.club;
        if (p1) p1.innerHTML = `🟡 ${v13Esc(v13P1Label())}<small>${v13Esc(sub1)}</small>`;
        if (p2) p2.innerHTML = `🔵 ${v13Esc(v13P2Label())}<small>${v13Esc(sub2)}</small>`;
        const tb = document.querySelector("#multiSplit .turn-banner b"); if (tb) tb.textContent = s.activePlayer === 1 ? v13P1Label() : v13P2Label();
      }
    } catch (e) {}
    return r;
  };
  window.render = render;
}
if (typeof window.start === "function") {
  const o = window.start;
  window.start = function () {
    try {
      {
        // P2 no puede ser el mismo piloto que P1
        const multi = typeof playMode !== "undefined" && playMode === "multi";
        const sel2 = document.getElementById("playedDriverSel2"), sel1 = document.getElementById("playedDriverSel");
        const isDrv = document.getElementById("driverTypeSel2") && !document.getElementById("p2driverPickBox")?.classList.contains("hidden");
        if (multi && isDrv && sel1 && sel2 && sel2.value && sel1.value === sel2.value) { v9Toast("👥 Los dos jugadores eligieron el mismo piloto. El Jugador 2 tiene que elegir otro."); sel2.focus(); return; }
      }
    } catch (e) {}
    const r = o.apply(this, arguments);
    try {
      if (v13On() && v13Drv()) {
        s.player2.money = 0; // como piloto, P2 arranca sin plata, igual que P1
        try { render(); } catch (e) {}
        const n2 = s.player2.playedDriverName;
        const mates = (typeof myTeamLineup === "function" ? myTeamLineup() : []).map(d => d.name);
        if (n2 && mates.includes(n2)) add("⚠️ " + n2 + " era compañero del Jugador 1: en su lugar corre otro piloto.");
      }
    } catch (e) {}
    return r;
  };
}
if (typeof myTeamLineup === "function") {
  const o = myTeamLineup;
  myTeamLineup = function () {
    const L = o.apply(this, arguments);
    try {
      if (v13On() && v13Drv() && s.player2.playedDriverName) {
        const n2 = s.player2.playedDriverName;
        L.forEach((d, i) => { if (i > 0 && d.name === n2) { d.name = generateRookieName("p1mate_" + s.club + "_" + s.season); d.rating = 72; } });
      }
    } catch (e) {}
    return L;
  };
}

/* ============================ 🏁 carrera rápida para 2 ============================ */
if (typeof v6QuickOpen === "function") {
  const o = v6QuickOpen;
  v6QuickOpen = function () {
    const r = o.apply(this, arguments);
    try {
      const Q = window._v6Q; const card = document.querySelector("#v6Quick .v6-quick-card, #v6Quick > div");
      if (Q && card && !card.querySelector(".v13-q2")) {
        const t1 = (getDriversForYear(Q.year).find(d => d[0] === Q.drv) || [])[3];
        const drivers = v6QuickDrivers(Q.year).filter(d => d !== Q.drv && (!t1 || (getDriversForYear(Q.year).find(x => x[0] === d) || [])[3] !== t1));
        if (!drivers.includes(Q.drv2)) Q.drv2 = drivers[0];
        const btns = card.querySelector(".v6-res-btns") || card.lastElementChild;
        const html = `<div class="v13-q2"><label class="ng-check"><input type="checkbox" ${Q.two ? "checked" : ""} onchange="window._v6Q.two=this.checked; v6QuickOpen()"> <span>👥 2 jugadores en la misma compu o celu</span></label>
          ${Q.two ? `<div class="v13-q2f"><label>🔵 Jugador 2<input type="text" maxlength="20" value="${v13Esc(Q.name2 || "")}" placeholder="Nombre" oninput="window._v6Q.name2=this.value"></label>
          <label>🧑‍✈️ Su piloto<select onchange="window._v6Q.drv2=this.value">${drivers.map(d => `<option ${d === Q.drv2 ? "selected" : ""}>${v13Esc(d)}</option>`).join("")}</select></label></div>` : ""}</div>`;
        if (btns) btns.insertAdjacentHTML("beforebegin", html); else card.insertAdjacentHTML("beforeend", html);
      }
    } catch (e) { console.warn("[FAWIWE] carrera rápida 2:", e); }
    return r;
  };
}
if (typeof v6QuickStart === "function") {
  const o = v6QuickStart;
  v6QuickStart = function () {
    const Q = window._v6Q;
    if (!Q || !Q.two) return o.apply(this, arguments);
    // armamos el multijugador antes de arrancar
    try {
      const keepSet = window.setPlayMode;
      setPlayMode = function () { return keepSet.call(this, "multi"); };
      try {
        const drvs = v6QuickDrivers(Q.year);
        const t1 = (getDriversForYear(Q.year).find(d => d[0] === Q.drv) || [])[3], tm = d => (getDriversForYear(Q.year).find(x => x[0] === d) || [])[3];
        if (!drvs.includes(Q.drv2) || Q.drv2 === Q.drv || (t1 && tm(Q.drv2) === t1)) Q.drv2 = drvs.find(d => d !== Q.drv && (!t1 || tm(d) !== t1));
        const n2 = document.getElementById("name2"); if (n2) n2.value = (Q.name2 || "").trim() || "Jugador 2";
        const t2 = document.getElementById("driverTypeSel2"); if (t2) t2.value = "actual";
        const origStart = window.start;
        window.start = function () {
          try {
            refreshDriverPickList2();
            const p2 = document.getElementById("playedDriverSel2"); if (p2) p2.value = Q.drv2;
            const info = getDriversForYear(Q.year).find(d => d[0] === Q.drv2);
            const c2 = document.getElementById("club2"), c1 = document.getElementById("club");
            if (c2 && info && [...c2.options].some(o2 => o2.value === info[3]) && (!c1 || c1.value !== info[3])) c2.value = info[3];
            else if (c2 && c1) { const alt = [...c2.options].find(o2 => o2.value !== c1.value); if (alt) c2.value = alt.value; }
          } catch (e) {}
          return origStart.apply(this, arguments);
        };
        try { o.apply(this, arguments); } finally { window.start = origStart; }
      } finally { setPlayMode = keepSet; window.setPlayMode = keepSet; }
      if (s.player2) { s.player2.money = 0; add("👥 Carrera rápida a dos: 🟡 " + v13P1Label() + " vs 🔵 " + v13P2Label() + "."); render(); }
    } catch (e) { console.warn("[FAWIWE] carrera rápida a dos:", e); }
  };
}
function v13QuickEnd() {
  let ov = document.getElementById("v9QuickEnd");
  if (!ov) { ov = document.createElement("div"); ov.id = "v9QuickEnd"; document.body.appendChild(ov); }
  const p1 = s.lastRace && s.lastRace.pos, p2 = s.player2.lastPos;
  const w = p1 && p2 ? (p1 < p2 ? 1 : 2) : 0;
  ov.innerHTML = `<div class="v9-qe-card"><div class="hof-k">🏁 CARRERA RÁPIDA A DOS</div><h2>${v13Esc((trackData[s.gp] || {}).name || "")} ${s.season}</h2>
    <div class="v13-qe"><div class="${w === 1 ? "win" : ""}"><span>🟡 ${v13Esc(v13P1Label())}</span><b>${p1 ? "P" + p1 : "—"}</b></div><div class="${w === 2 ? "win" : ""}"><span>🔵 ${v13Esc(v13P2Label())}</span><b>${p2 ? "P" + p2 : "—"}</b></div></div>
    <p class="small">${w ? "🏆 Ganó el duelo " + v13Esc(w === 1 ? v13P1Label() : v13P2Label()) + "." : ""}</p>
    <div class="v6-res-btns"><button type="button" class="lv-btn red" onclick="document.getElementById('v9QuickEnd').classList.remove('show');v6QuickOpen()">🔁 Revancha</button><button type="button" class="lv-btn" onclick="document.getElementById('v9QuickEnd').classList.remove('show');v7BackToMenu()">🏠 Menú</button></div></div>`;
  ov.classList.add("show");
}
if (typeof nextGP === "function") {
  const o = nextGP;
  nextGP = function () { if (v13On() && s.quickRace && s.raceDone) { v13QuickEnd(); return; } return o.apply(this, arguments); };
}

/* ============================ tutorial ============================ */
function v13Tut() {
  const pg = document.querySelector('#v10Tut .v10-page[data-t="menu"]');
  if (!pg || pg.querySelector(".v13-tut")) return;
  pg.insertAdjacentHTML("beforeend", `<h3 class="v13-tut">👥 Multijugador</h3><ul>
    <li>Los dos autos están en la misma grilla: <b>clasificación en vivo</b> y <b>transmisión de la carrera</b> con los dos marcados (🟡 P1, 🔵 P2).</li>
    <li>En la carrera cada uno juega lo suyo: <b>estrategia</b>, <b>pases y defensas</b> y <b>entrada a boxes</b>. Antes de largar, el <b>cara a cara</b>.</li>
    <li><b>Carrera rápida a dos</b>: en Carrera rápida tildá "2 jugadores".</li></ul>`);
}
(function () {
  if (document.readyState !== "loading") setTimeout(v13Tut, 0); else document.addEventListener("DOMContentLoaded", v13Tut);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { v13Tut(); } catch (e) {} return r; }; window.render = render; }
})();

/* ============================ el cartel de turno espera a que termine lo que está en vivo ============================ */
function v13LiveBusy() {
  try {
    if (typeof QL !== "undefined" && QL) return true;
    if (typeof DL !== "undefined" && DL && document.getElementById("dlOverlay")?.classList.contains("show")) return true;
    if (document.querySelector("#duelCine, #v7Flag.show, #resultOverlay.show, #v11Face.show, #podOverlay.show")) return true;
  } catch (e) {}
  return false;
}
if (typeof duelTurnPlate === "function") {
  const o = duelTurnPlate;
  let pend = null, timer = null;
  duelTurnPlate = function (p) {
    if (!v13LiveBusy()) return o.apply(this, arguments);
    pend = p;
    clearInterval(timer);
    timer = setInterval(() => { if (v13LiveBusy()) return; clearInterval(timer); const q = pend; pend = null; if (q && s.player2 && s.activePlayer === q) o.call(this, q); }, 500);
  };
}
