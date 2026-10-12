/* =====================================================================================
   FAWIWE · TRANSMISIÓN DE CARRERA EN MODO PILOTO
   Después de la cinemática de carrera se ve la carrera vuelta por vuelta:
   - Tablero con posiciones, diferencias y paradas en boxes de todos.
   - Highlights: "Vuelta 5: Hamilton te intenta pasar… ¡lo aguantaste!", pases, abandonos, Safety Car.
   - Radio con voz: tu ingeniero te habla y vos podés QUEJARTE o CAMBIAR LA ESTRATEGIA.
   Lo que decidís por radio cambia el resultado final de verdad.
   ===================================================================================== */
let DL = null;
let dlTimer = null, dlDecTimer = null;
function dlOn() { return typeof s !== "undefined" && s && s.team && s.playerMode === "driver" && !s.player2; }
function dlKey() { return s.season + "_" + s.gp; }
function dlEsc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function dlShort(n) { try { return lapShort(n); } catch (e) { return String(n).toUpperCase(); } }
function dlH(str) { try { return Math.abs(deterministicHash(str)); } catch (e) { let h = 0; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); } }
function dlState() { if (!s._dl || s._dl.key !== dlKey()) s._dl = { key: dlKey(), bonus: 0, pens: [], save: false, done: false, final: null, order: null, sprintDone: false }; return s._dl; }
/* ---------- tu ingeniero de pista: nombre, personalidad y relación ---------- */
const DL_ENG_NAMES = ["Marco Vitale", "Sofía Álvarez", "Tom Hadley", "Kenji Arata", "Lena Berger", "Diego Saravia", "Nadia Okoro", "Pablo Ferrán"];
const DL_ENG_STYLE = { calmo: { lbl: "🧘 Calmo", pre: ["Tranqui. ", "Respirá. ", ""], ok: "Perfecto, copiado." }, directo: { lbl: "🎯 Directo", pre: ["", "", "Escuchá: "], ok: "Copiado." }, motivador: { lbl: "🔥 Motivador", pre: ["¡Vamos! ", "¡Dale que se puede! ", ""], ok: "¡Eso, vamos!" } };
function dlEng() {
  if (s.raceEng && !DL_ENG_STYLE[s.raceEng.style]) s.raceEng.style = "directo";
  if (!s.raceEng || !s.raceEng.name) {
    const h = dlH("raceeng_" + (s.playedDriverName || "") + (s.team || ""));
    const st = Object.keys(DL_ENG_STYLE);
    s.raceEng = { name: DL_ENG_NAMES[h % DL_ENG_NAMES.length], style: st[Math.floor(h / 8) % st.length], rel: 55, team: s.team };
  }
  if (s.raceEng.team !== s.team) { const h = dlH("raceeng_" + s.team + s.season); s.raceEng.name = DL_ENG_NAMES[h % DL_ENG_NAMES.length]; s.raceEng.style = Object.keys(DL_ENG_STYLE)[Math.floor(h / 8) % 3]; s.raceEng.rel = 50; s.raceEng.team = s.team; }
  return s.raceEng;
}
function dlEngFirst() { return dlEng().name.split(" ")[0]; }
function dlEngPre() { const E = dlEng(), P = DL_ENG_STYLE[E.style] || DL_ENG_STYLE.directo; return P.pre[dlH("pre" + (DL ? DL.lap : 0) + dlKey()) % P.pre.length]; }
function dlEngRel(d) { const E = dlEng(); E.rel = Math.max(0, Math.min(100, Math.round(E.rel + d))); return E.rel; }
function dlEngTag() { try { if (typeof FW_WHO !== "undefined") FW_WHO.eng.tag = "📻 " + dlEngFirst().toUpperCase() + " · INGENIERO"; } catch (e) {} }
function dlEngReset() { try { if (typeof FW_WHO !== "undefined") FW_WHO.eng.tag = "📻 INGENIERO"; } catch (e) {} }

/* ---------- la grilla de carrera con lo que decidiste por radio ---------- */
(function () {
  const o = window.simulateGrid;
  if (typeof o !== "function") return;
  window.simulateGrid = function (kind) {
    const r = o.apply(this, arguments);
    try {
      if (!dlOn() || !Array.isArray(r)) return r;
      if (kind === "quali") {
        // guardamos el orden de la clasificación para que la carrera arranque desde ahí
        s._dlQuali = { key: dlKey(), names: r.map(x => x.name) };
        return r;
      }
      if (kind === "race" && s._dlSprint) {
        // sprint del sábado: otra carrera, más corta, sin paradas y con puntos del 8 al 1
        const key = dlKey();
        r.forEach(x => { x.status = x.status === "DNS" ? "DNS" : (dlH("sprdnf" + x.name + key) % 1000 < 25 ? "DNF" : null); if (x.status === "DNF") x.dnfReason = "💥 Problema mecánico en la sprint"; else delete x.dnfReason; x.score += (dlH("spr" + x.name + key) % 9) - 4; });
        const me0 = r.find(x => x.mine && x.seat === 1);
        if (me0 && s._dl && s._dl.key === key) me0.score += s._dl.sprintBonus || 0;
        const SP = [8, 7, 6, 5, 4, 3, 2, 1];
        const o2 = [...r.filter(x => !x.status).sort((a, b) => b.score - a.score), ...r.filter(x => x.status === "DNF"), ...r.filter(x => x.status === "DNS")];
        o2.forEach((x, i) => { if (x.status === "DNS") { x.pos = null; x.pts = 0; return; } x.pos = i + 1; x.pts = !x.status && i < 8 ? SP[i] : 0; });
        return o2;
      }
      if (kind !== "race" || !s._dl || s._dl.key !== dlKey()) return r;
      const st = s._dl;
      if (st.final) { // resultado ya visto en la transmisión: el oficial es idéntico
        const by = {}; r.forEach(x => { by[x.name] = x; });
        const out = [];
        st.final.forEach(f => { const x = by[f.name]; if (!x) return; x.pos = f.pos; x.pts = f.pts; x.status = f.status; if (f.penalty) x.penalty = f.penalty; if (!f.status) delete x.dnfReason; out.push(x); delete by[x.name]; });
        Object.values(by).forEach(x => out.push(x));
        return out;
      }
      const me = r.find(x => x.mine && x.seat === 1);
      if (me) {
        me.score += st.bonus || 0;
        if (st.save && me.status === "DNF") { me.status = null; delete me.dnfReason; me.dlSaved = true; }
      }
      (st.pens || []).forEach(p => { const x = r.find(y => y.name === p.name); if (x && !x.status) { x.score -= 2.5; x.penalty = { sec: 5, reason: p.reason }; } });
      if (me && st.myPen && !me.status) { me.score -= 2.5 * (st.myPen / 5); me.penalty = { sec: st.myPen, reason: "Límites de pista (3 advertencias)" }; }
      const ps = s.pointsSystem || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      const fin = r.filter(x => !x.status).sort((a, b) => b.score - a.score);
      const dnf = r.filter(x => x.status === "DNF").sort((a, b) => b.score - a.score);
      const dns = r.filter(x => x.status === "DNS");
      const ord = [...fin, ...dnf, ...dns];
      if (st.duel && st.duel.other) { // duelo final
        const a = ord.find(x => x.mine && x.seat === 1), b = ord.find(x => x.name === st.duel.other);
        if (a && b && !a.status && !b.status) {
          const ia = ord.indexOf(a), ib = ord.indexOf(b);
          if ((st.duel.res === "gain" && ib < ia) || (st.duel.res === "lose" && ib > ia)) { ord[ia] = b; ord[ib] = a; }
        }
      }
      (st.moves || []).forEach(m => { // pases y defensas jugadas, largada y relanzamiento
        const a = ord.find(x => x.mine && x.seat === 1), b = ord.find(x => x.name === m.other);
        if (!a || !b || a.status || b.status) return;
        const ia = ord.indexOf(a), ib = ord.indexOf(b);
        if ((m.res === "gain" && ib < ia) || (m.res === "lose" && ib > ia)) { ord[ia] = b; ord[ib] = a; }
      });
      if (me && st.jumpPen && !me.status) { me.score -= 2.5; me.penalty = { sec: 5 + ((me.penalty && me.penalty.sec) || 0), reason: "Largada en falso" + (me.penalty ? " + " + me.penalty.reason : "") }; }
      if (st.order) { // órdenes de equipo
        const a = ord.find(x => x.mine && x.seat === 1), b = ord.find(x => x.mine && x.seat === 2);
        if (a && b && !a.status && !b.status) {
          const ia = ord.indexOf(a), ib = ord.indexOf(b);
          if ((st.order === "mate" && ia < ib) || (st.order === "me" && ib < ia)) { ord[ia] = b; ord[ib] = a; }
        }
      }
      ord.forEach((x, i) => { if (x.status === "DNS") { x.pos = null; x.pts = 0; return; } x.pos = i + 1; x.pts = (!x.status && i < ps.length) ? ps[i] : 0; });
      return ord;
    } catch (e) { console.warn("[FAWIWE] radio:", e); return r; }
  };
})();

/* ---------- arma el vuelta a vuelta ---------- */
function dlPlan(N) {
  const stops = +(document.getElementById("stops")?.value || 1);
  const f = stops === 3 ? [0.22, 0.48, 0.72] : stops === 2 ? [0.3, 0.64] : [0.44];
  return f.map(x => Math.round(N * x));
}
function dlBuild() {
  const grid = simulateGrid("race");
  DL.grid = grid;
  const e = engEnsure();
  const prevQ = e.lastQualiOrder;
  let names = s._dlQuali && s._dlQuali.key === dlKey() ? s._dlQuali.names.slice() : null;
  if (!names) names = grid.map(x => x.name).map((n, i) => ({ n, v: i + ((dlH("st" + n + dlKey()) % 9) - 4) })).sort((a, b) => a.v - b.v).map(x => x.n);
  e.lastQualiOrder = { key: engKey(), names };
  const dnfLaps = {};
  grid.forEach(x => { if (x.status === "DNF") dnfLaps[x.name] = DL.dnfLaps[x.name] || (DL.dnfLaps[x.name] = 2 + dlH("dl_dnf" + x.name + dlKey()) % Math.max(1, DL.N - 4)); });
  try {
    DL.data = engBuildLaps(grid, { sc: !!s._safetyCarThisRace, dnfLaps, myPits: { 1: DL.pits.slice() } });
  } finally { e.lastQualiOrder = prevQ; }
  DL.N = DL.data.N;
  DL.me = DL.data.rows.find(r => r.mine && r.seat === 1);
  try { dlApplyLocks(); } catch (e) { console.warn("[FAWIWE] locks:", e); }
}
// lo que pasó en la radio (duelo, órdenes de equipo) también se ve en el vuelta a vuelta
function dlLockPair(nameA, nameB, from) {
  const d = DL.data, A = d.rows.find(r => r.name === nameA), B = d.rows.find(r => r.name === nameB);
  if (!A || !B || !from) return false;
  const last = Math.min(A.t.length, B.t.length);
  if (last <= from) return false;
  const cum = B.cum.slice();
  let changed = false;
  for (let l = Math.max(1, from); l < last; l++) {
    const need = A.cum[l - 1] + 0.35;
    if (cum[l - 1] < need) { cum[l - 1] = need; changed = true; }
  }
  if (!changed) return false;
  for (let k = 1; k < cum.length; k++) if (cum[k] < cum[k - 1] + 1) cum[k] = Math.max(cum[k], cum[k - 1] + 1);
  const o = B.o || 0;
  B.t = cum.map((c, k) => c - (k === 0 ? o : cum[k - 1]));
  return true;
}
function dlApplyLocks() {
  const st = s._dl; if (!st || !DL || !DL.data || DL.mode !== "race") return;
  const me = DL.me; if (!me) return;
  let ch = false;
  if (st.duel && st.duel.other && st.duel.lap) ch = (st.duel.res === "lose" ? dlLockPair(st.duel.other, me.name, st.duel.lap + 1) : dlLockPair(me.name, st.duel.other, st.duel.lap + 1)) || ch;
  (st.moves || []).forEach(m => { ch = (m.res === "lose" ? dlLockPair(m.other, me.name, m.lap + 1) : dlLockPair(me.name, m.other, m.lap + 1)) || ch; });
  if (st.order && st.orderLap) {
    const mate = DL.data.rows.find(r => r.mine && r.seat === 2);
    if (mate) ch = (st.order === "mate" ? dlLockPair(mate.name, me.name, st.orderLap + 1) : dlLockPair(me.name, mate.name, st.orderLap + 1)) || ch;
  }
  if (ch) lapFinalize(DL.data);
}
function dlSprintWeekend() { try { return s.season >= 2021 && typeof engSprintGPs === "function" && engSprintGPs(s.season).includes(s.gp); } catch (e) { return false; } }
function dlStart() {
  const st = dlState();
  dlEngTag();
  if (dlSprintWeekend() && !st.sprintDone) return dlStartSprint();
  st.bonus = 0; st.pens = []; st.save = false; st.final = null; st.done = false; st.order = null; st.myPen = 0; st.duel = null; st.moves = []; st.jumpPen = 0;
  const E = dlEng();
  if (E.rel >= 75) st.bonus += 0.8; else if (E.rel < 30) st.bonus -= 0.8;
  const w0 = s.weather;
  applySafetyCarEvent();
  applyMidRaceWeatherTwist();
  const twist = s.weather !== w0 && !!s.weather;
  const N0 = Math.max(5, Math.round(((trackData[s.gp] || {}).laps || 58) * ((typeof rl === "function" && rl().len) || 1)));
  DL = { key: dlKey(), mode: "race", lap: 0, N: N0, speed: 1, phase: "run", feed: [], pits: dlPlan(N0), dnfLaps: {}, q: 2, t: 2, menu: null, dec: null, decAsked: false, last: {}, shownOut: {}, pitWin: false, fin5: false, lapped: {}, events: [], tickAt: Date.now() };
  dlBuild();
  // eventos de la carrera: lluvia, daño, órdenes de equipo
  const dmg = s._rlDamage && s._rlDamage.key === s.season + "_" + s.gp ? s._rlDamage : null;
  if (dmg) DL.events.push({ lap: 2, kind: "damage", heavy: dmg.pen <= -10 });
  if (twist) DL.events.push({ lap: Math.max(4, Math.round(DL.N * 0.45)), kind: "weather", wet: !!s.weather.wet });
  DL.events.push({ lap: Math.max(6, Math.round(DL.N * 0.72)), kind: "orders" });
  dlExtrasInit();
  DL.pits = DL.me ? DL.me.pits.slice() : DL.pits;
  dlEnsureOverlay();
  document.getElementById("dlOverlay").classList.add("show");
  if (DL.me && DL.me.status === "DNS") {
    dlFeed(0, "🚫 No pudiste largar: problema antes de la salida. Mirás la carrera desde el box.", true, "bad");
    dlSay("Lo siento, no podemos largar. Mirá la carrera desde acá.", "eng");
    dlDraw(); dlSchedule(); return;
  }
  const p0 = DL.me ? DL.me.pos[0] : "?";
  dlFeed(0, "🚦 Semáforos apagados en " + ((trackData[s.gp] || {}).name || "el circuito") + (twist ? "" : s.weather ? " · " + s.weather.label : "") + ". Largás P" + p0 + ". Tu ingeniero: " + E.name + ".", true);
  dlSay(dlEngPre() + "Luces apagadas. Largás P" + p0 + ". ¡Vamos, vamos!", "eng");
  dlDraw();
  dlSchedule();
}
function dlStartSprint() {
  const st = dlState();
  st.sprintBonus = 0;
  const full = Math.max(5, Math.round(((trackData[s.gp] || {}).laps || 58) * ((typeof rl === "function" && rl().len) || 1)));
  DL = { key: dlKey(), mode: "sprint", lap: 0, N: Math.max(4, Math.round(full * 0.33)), speed: 1, phase: "run", feed: [], pits: [], dnfLaps: {}, q: 0, t: 1, menu: null, dec: null, decAsked: true, last: {}, shownOut: {}, fin5: false, lapped: {}, events: [], tickAt: Date.now() };
  dlBuildSprint();
  dlEnsureOverlay();
  document.getElementById("dlOverlay").classList.add("show");
  const p0 = DL.me ? DL.me.pos[0] : "?";
  dlFeed(0, "⚡ SPRINT DEL SÁBADO en " + ((trackData[s.gp] || {}).name || "el circuito") + ": " + DL.N + " vueltas, sin paradas. Puntos del 8 al 1. Largás P" + p0 + ".", true);
  dlSay(dlEngPre() + "Sprint. Son " + DL.N + " vueltas a fondo, sin paradas. ¡Vamos!", "eng");
  dlDraw(); dlSchedule();
}
function dlBuildSprint() {
  s._dlSprint = true;
  let grid;
  try { grid = simulateGrid("race"); } finally { s._dlSprint = false; }
  DL.grid = grid;
  const e = engEnsure(), prevQ = e.lastQualiOrder;
  let names = s._dlQuali && s._dlQuali.key === dlKey() ? s._dlQuali.names.slice() : grid.map(x => x.name);
  e.lastQualiOrder = { key: engKey(), names };
  const dnfLaps = {};
  grid.forEach(x => { if (x.status === "DNF") dnfLaps[x.name] = 1 + dlH("sdnf" + x.name) % Math.max(1, DL.N - 2); });
  const t = trackData[s.gp], orig = t ? t.laps : 0;
  try {
    if (t) t.laps = Math.max(1, Math.round(DL.N / ((typeof rl === "function" && rl().len) || 1)));
    DL.data = engBuildLaps(grid, { noPits: true, dnfLaps });
  } finally { e.lastQualiOrder = prevQ; if (t) t.laps = orig; }
  DL.N = DL.data.N;
  DL.me = DL.data.rows.find(r => r.mine && r.seat === 1);
}
function dlSprintScore() {
  const st = dlState();
  if (st.sprintDone) return;
  st.sprintDone = true;
  if (!s.driverPoints) initDriverStandings();
  if (!s.teamStandings) initTeamStandings();
  let myPts = 0;
  DL.grid.forEach(x => {
    const base = x.name.replace(" (reserva)", "");
    s.driverPoints[base] = (s.driverPoints[base] || 0) + x.pts;
    if (x.mine) myPts += x.pts; else s.teamStandings[x.team] = (s.teamStandings[x.team] || 0) + x.pts;
  });
  s.points += myPts;
  const me = DL.grid.find(x => x.mine && x.seat === 1);
  st.sprintRes = me ? (me.status || "P" + me.pos) : "—";
  add("⚡ SPRINT en " + ((trackData[s.gp] || {}).name || "") + ": gana " + (DL.grid[0] ? DL.grid[0].name : "—") + ". Vos: " + st.sprintRes + (me && me.pts ? " (+" + me.pts + " pts)" : "") + ".");
}
function dlGoSunday() { if (!DL || DL.mode !== "sprint") return; clearInterval(dlTimer); DL = null; dlStart(); }
function dlSchedule() {
  clearInterval(dlTimer);
  if (!DL) return;
  dlTimer = setInterval(dlTick, DL.skip ? 40 : Math.round(900 / DL.speed));
}
function dlSay(a, b, c) { if (DL && !DL.skip) fwRadioSay(a, b, c); }
function dlFeed(lap, txt, mine, cls) { DL.feed.push({ lap, txt, mine: !!mine, cls: cls || "" }); }
function dlGapTxt(row, l, leader) {
  if (!row || !leader) return "";
  if (row.t.length < l) return "OUT";
  if (row === leader) return "Líder";
  const down = l - dlLapsAt(row, leader.cum[l - 1]) - 1;
  if (down >= 1) return "+" + down + " V";
  return "+" + Math.max(0, row.cum[l - 1] - leader.cum[l - 1]).toFixed(1) + "s";
}
function dlTyreName(i) { return ["Medios", "Duros", "Blandos", "Duros"][i % 4]; }

/* ---------- cada vuelta: highlights ---------- */
function dlLap(l) {
  const d = DL.data, me = DL.me, N = d.N;
  if (!me) return;
  const by = p => d.rows.find(r => r.pos[l] === p && r.status !== "DNS");
  const byPrev = p => d.rows.find(r => r.pos[l - 1] === p && r.status !== "DNS");
  const scOn = d.sc && l >= d.sc[0] && l < d.sc[0] + d.sc[1];
  if (d.sc && l === d.sc[0]) { dlFeed(l, "🚨 ¡SAFETY CAR! Incidente en pista, el pelotón se agrupa.", false, "sc"); dlSay("Safety car, safety car. Bajá el ritmo y mantené la temperatura.", "eng"); }
  if (d.sc && l === d.sc[0] + d.sc[1]) { dlFeed(l, "🟢 Relanzamiento: bandera verde otra vez.", false); if (DL.mode === "race" && me.t.length > l) DL.pendingRestart = l; }
  // abandonos
  d.rows.forEach(r => {
    if (r.status === "DNF" && r.t.length + 1 === l && !DL.shownOut[r.name]) {
      DL.shownOut[r.name] = true;
      if (r === me) { dlFeed(l, "💥 ¡Abandonaste! " + (r.dnfReason ? r.dnfReason.replace(/^\S+\s/, "") : "El auto dijo basta."), true, "bad"); dlSay("Box, box. Lo siento, tenemos que retirar el auto.", "eng"); }
      else dlFeed(l, "💥 Abandono: " + r.name + " (" + r.team + ")" + (r.dnfReason ? " — " + r.dnfReason.replace(/^\S+\s/, "") : ""), false);
    }
  });
  // paradas en boxes de todos
  const pitters = d.rows.filter(r => r !== me && r.pits.includes(l) && r.t.length >= l);
  if (pitters.length) dlFeed(l, "🔧 Boxes: " + pitters.map(r => dlShort(r.name) + " (P" + r.pos[l] + ", " + (2.1 + (dlH(r.name + l) % 14) / 10).toFixed(1) + "s)").join(" · "), false, "pit");
  dlBlue(l);
  if (me.t.length < l) return;
  const prev = me.pos[l - 1], cur = me.pos[l];
  if (l === 1) {
    const g = prev - cur;
    dlFeed(1, "🏁 Largada: " + (g > 0 ? "¡ganaste " + g + " puesto" + (g > 1 ? "s" : "") + "!" : g < 0 ? "perdiste " + (-g) + " puesto" + (g < -1 ? "s" : "") + "." : "mantuviste la posición.") + " Vas P" + cur + ".", true, g > 0 ? "ok" : g < 0 ? "bad" : "");
    dlSay(g > 0 ? "¡Qué largada! Ganaste " + g + ". Vas P" + cur + "." : g < 0 ? "Perdimos " + (-g) + " en la largada. Tranquilo, la carrera es larga." : "Buena largada, mantenemos P" + cur + ".", "eng");
    return;
  }
  if (me.pits.includes(l)) {
    const k = me.pits.indexOf(l);
    const t = (2.0 + (dlH("mp" + l + dlKey()) % 12) / 10).toFixed(1);
    dlFeed(l, "🔧 Tu parada en boxes: " + t + "s. Salís P" + cur + ".", true, "pit");
    dlSay("Box, box. Box, box. … Buena parada, " + t + " segundos. Salís P" + cur + ".", "eng");
    return;
  }
  if (cur < prev) {
    const passed = d.rows.filter(r => r !== me && r.pos[l - 1] < prev && r.pos[l - 1] >= cur && r.pos[l] > cur);
    const pit = passed.filter(r => r.pits.includes(l));
    const real = passed.filter(r => !r.pits.includes(l) && r.t.length >= l);
    if (real.length) { dlFeed(l, "⬆️ ¡Pasaste a " + real.map(r => r.name).join(" y ") + "! Subís a P" + cur + ".", true, "ok"); dlSay("¡Bien ahí! Lo pasaste. P" + cur + ".", "eng"); }
    else if (pit.length) dlFeed(l, "⬆️ " + pit.map(r => r.name).join(" y ") + " entra a boxes: subís a P" + cur + ".", true);
    else {
      const out = passed.filter(r => r.t.length < l), pitPrev = passed.filter(r => r.pits.includes(l - 1) || r.pits.includes(l + 1));
      if (out.length) dlFeed(l, "⬆️ " + out.map(r => r.name).join(" y ") + " abandonó: subís a P" + cur + ".", true);
      else if (pitPrev.length) dlFeed(l, "⬆️ " + pitPrev.map(r => r.name).join(" y ") + " perdió tiempo en boxes: subís a P" + cur + ".", true);
      else dlFeed(l, "⬆️ Con más ritmo, ganás terreno: subís a P" + cur + ".", true);
    }
    return;
  }
  if (cur > prev) {
    const by2 = d.rows.filter(r => r !== me && r.pos[l - 1] > prev && r.pos[l] <= cur && r.pos[l] < cur + 1 && r.t.length >= l);
    if (by2.length) { dlFeed(l, "⬇️ " + by2.map(r => r.name).join(" y ") + " te pasó. Caés a P" + cur + ".", true, "bad"); dlSay("Te pasó " + dlShort(by2[0].name) + ". Tranquilo, seguí empujando.", "eng"); }
    else dlFeed(l, me.pits.includes(l - 1) ? "⬇️ Por la parada en boxes caés a P" + cur + "." : "⬇️ Te falta ritmo: caés a P" + cur + ".", true, "bad");
    return;
  }
  if (scOn) return;
  // intentos de pase (sin cambio de posición)
  const behind = by(cur + 1), ahead = by(cur - 1);
  const gapB = behind && behind.t.length >= l ? behind.cum[l - 1] - me.cum[l - 1] : 99;
  const gapA = ahead && ahead.t.length >= l ? me.cum[l - 1] - ahead.cum[l - 1] : 99;
  // pases y defensas jugables (hasta 3 por carrera)
  if (DL.mode === "race" && !DL.skip && (DL.qteN || 0) < 3 && l >= 3 && l <= N - 7 && (DL.lastQte || -99) + 7 <= l) {
    const cand = gapA < 1.0 && ahead && !ahead.pits.includes(l) && ahead.t.length > l ? { atk: true, other: ahead } : gapB < 1.0 && behind && !behind.pits.includes(l) && behind.t.length > l ? { atk: false, other: behind } : null;
    if (cand && dlH("qte" + l + dlKey()) % 3 !== 0) { DL.lastQte = l; DL.qteN = (DL.qteN || 0) + 1; DL.pendingQte = { atk: cand.atk, other: cand.other.name, lap: l, gap: cand.atk ? gapA : gapB }; return; }
  }
  if (gapB < 0.65 && (DL.last.b || -9) + 6 <= l && dlH("ab" + l + dlKey()) % 3 !== 0 && !behind.pits.includes(l)) {
    DL.last.b = l;
    const where = (typeof EM_CORNERS !== "undefined" && EM_CORNERS[(trackData[s.gp] || {}).name] || ["la Curva 1"])[dlH("cw" + l) % 4] || "la Curva 1";
    const fr = ["te intenta pasar en " + where + "… ¡lo aguantaste!", "se tira por adentro en " + where + "… ¡cerraste la puerta!", "te pone la trompa al lado en " + where + "… ¡defendiste bien!"];
    dlFeed(l, "⚔️ " + behind.name + " " + fr[dlH("fr" + l) % 3], true, "ok");
    if (dlH("vb" + l) % 2 === 0) dlSay(dlShort(behind.name) + " está a menos de un segundo. Bien defendido, seguí así.", "eng");
    return;
  }
  if (gapA < 0.65 && (DL.last.a || -9) + 7 <= l && !ahead.pits.includes(l)) {
    DL.last.a = l;
    dlFeed(l, "🎯 Te tirás a pasar a " + ahead.name + " en la frenada… se defendió, todavía no.", true);
    return;
  }
  if (l === N - 5 && !DL.fin5) { DL.fin5 = true; dlFeed(l, "⏳ Últimas 5 vueltas. Vas P" + cur + ".", true); dlSay("Últimas cinco vueltas. P" + cur + ". Todo lo que tengas.", "eng"); }
}
function dlLapsAt(r, T) { let c = 0; while (c < r.cum.length && r.cum[c] <= T) c++; return c; }
function dlBlue(l) {
  const d = DL.data, me = DL.me;
  const lead = d.rows.find(r => r.pos[l] === 1 && r.t.length >= l);
  if (!lead) return;
  const T = lead.cum[l - 1], fresh = [];
  d.rows.forEach(r => {
    if (r === lead || r.status === "DNS" || r.t.length < l - 1 || DL.lapped[r.name]) return;
    if (dlLapsAt(r, T) <= l - 2) { DL.lapped[r.name] = true; fresh.push(r); }
  });
  if (!fresh.length) return;
  if (fresh.includes(me)) { dlFeed(l, "🔵 Bandera azul: " + lead.name + " te dobla. Dejalo pasar sin perder tiempo.", true, "blue"); dlSay("Bandera azul. Viene el líder, dejalo pasar en la recta.", "eng"); }
  const others = fresh.filter(r => r !== me);
  if (lead === me && others.length) { dlFeed(l, "🔵 ¡Doblás a " + others.map(r => r.name).join(", ") + "!", true, "ok"); dlSay("Estás doblando autos. Cuidado con el tráfico.", "eng"); }
  else if (others.length) dlFeed(l, "🔵 Banderas azules: " + dlShort(lead.name) + " dobla a " + others.map(r => dlShort(r.name)).join(", ") + ".", false, "blue");
  // vos doblando a alguien sin ser líder
  if (lead !== me && me.t.length >= l) d.rows.forEach(r => { if (r !== me && r !== lead && r.status !== "DNS" && r.t.length >= l - 1 && !DL.lapped["me_" + r.name] && dlLapsAt(r, me.cum[l - 1]) <= l - 2) { DL.lapped["me_" + r.name] = true; dlFeed(l, "🔵 Doblás a " + r.name + ".", true, "ok"); } });
}
function dlTick() {
  if (!DL || DL.phase !== "run") return;
  const step = Math.max(1, Math.round(DL.N / 42));
  const to = Math.min(DL.N, DL.lap + step);
  DL.tickAt = Date.now(); DL.tickFrom = DL.lap;
  for (let l = DL.lap + 1; l <= to; l++) {
    DL.lap = l;
    dlLap(l);
    if (dlRaceExtras(l)) break;
    const ev = DL.events.find(e => !e.done && e.lap <= l);
    if (ev) {
      if (dlOpenEvent(ev, l)) { ev.done = true; break; }
      if (ev.kind !== "orders" || l >= DL.N * 0.92) ev.done = true;
    }
    // ventana de boxes: el ingeniero te consulta
    const next = DL.me && DL.me.pits.find(p => p > l);
    if (DL.mode === "race" && !DL.decAsked && next && next - l <= 3 && next - l >= 1 && l > 2 && DL.me.t.length > l) { DL.decAsked = true; dlOpenPitCall(l); break; }
  }
  if (DL.lap >= DL.N && DL.phase === "run") dlEnd();
  dlDraw();
}
function dlEnd() {
  DL.phase = "end";
  clearInterval(dlTimer);
  if (DL.mode === "sprint") {
    const w0 = DL.grid[0], me0 = DL.grid.find(x => x.mine && x.seat === 1);
    dlFeed(DL.N, "🏁 ¡Fin de la sprint! Gana " + (w0 ? w0.name : "—") + ".", false, "fin");
    if (me0) dlFeed(DL.N, "⚡ Terminaste la sprint " + (me0.status || "P" + me0.pos) + (me0.pts ? " · +" + me0.pts + " puntos" : "") + ". Mañana, la carrera.", true, me0.pts ? "ok" : "");
    if (me0 && !DL.skip) fwRadioSay(me0.pts ? "Buena sprint, P" + me0.pos + ". Mañana vamos por más." : "Sprint terminada. Mañana es otra historia.", "eng", { priority: true });
    dlSprintScore();
    return;
  }
  const me = DL.me, d = DL.data;
  const w = d.rows.find(r => r.pos[d.N] === 1);
  dlFeed(d.N, "🏁 ¡BANDERA A CUADROS! Gana " + (w ? w.name + " (" + w.team + ")" : "—") + ".", false, "fin");
  const myG = DL.grid.find(x => x.mine && x.seat === 1);
  if (d.fastest && d.fastest.name) dlFeed(d.N, "⏱️ Vuelta más rápida: " + d.fastest.name + " · " + lapFmt(d.fastest.time) + " (vuelta " + d.fastest.lap + ").", d.fastest.name === (me && me.name));
  if (myG) {
    const pos = myG.status ? myG.status : "P" + myG.pos;
    dlFeed(d.N, "🏆 Terminaste " + pos + (myG.pts ? " · +" + myG.pts + " puntos" : myG.status ? "" : " · sin puntos (solo puntúa el top 10)") + ".", true, myG.pos <= 3 && !myG.status ? "ok" : "");
    if (!DL.skip) fwRadioSay(myG.status ? "Una pena. La próxima la vamos a buscar." : myG.pos === 1 ? "¡Ganaste! ¡Ganaste la carrera! ¡Increíble!" : myG.pos <= 3 ? "¡Podio! P" + myG.pos + ". ¡Enorme laburo!" : myG.pos <= 10 ? "Bandera a cuadros. P" + myG.pos + ", puntos para el equipo. Buen trabajo." : "Bandera a cuadros, P" + myG.pos + ". Hoy no alcanzó, vamos a analizar los datos.", "eng", { priority: true });
  }
}
function dlFinalize() {
  if (!DL) return;
  if (DL.mode === "sprint") { if (DL.phase !== "end") dlSkip(); dlGoSunday(); if (!DL) return; dlSkip(); }
  clearInterval(dlTimer); clearInterval(dlDecTimer);
  const st = dlState();
  st.final = DL.grid.map(x => ({ name: x.name, pos: x.pos, pts: x.pts, status: x.status || null, penalty: x.penalty || null }));
  st.done = true;
  st.highlights = DL.feed.filter(f => f.mine).map(f => ({ lap: f.lap, txt: f.txt, cls: f.cls }));
  window.dlLastData = DL.data;
  try { dlRivalTalk(st); } catch (e) {}
  DL = null;
  dlEngReset();
  document.getElementById("dlOverlay").classList.remove("show");
  const keepSC = window.applySafetyCarEvent, keepTw = window.applyMidRaceWeatherTwist;
  window.applySafetyCarEvent = function () {}; window.applyMidRaceWeatherTwist = function () {};
  try { finishRace(); } finally { window.applySafetyCarEvent = keepSC; window.applyMidRaceWeatherTwist = keepTw; }
}
function dlRivalTalk(st) {
  const me = DL.me; if (!me) return;
  const quotes = [];
  (st.pens || []).forEach(p => quotes.push([p.name, ["Se queja de todo por radio. Que maneje en vez de llorar.", "¿Sanción por eso? Es carrera, no ballet.", "Fue una maniobra normal. Los comisarios se equivocaron."]]));
  const wall = s._rlDamage && s._rlDamage.key === s.season + "_" + s.gp;
  if (wall) { const near = DL.data.rows.find(r => r !== me && !r.mine && Math.abs((r.pos[1] || 99) - (me.pos[1] || 0)) === 1); if (near) quotes.push([near.name, ["Me tocó en la primera vuelta, tiene que tener más cuidado.", "Hubo contacto. Para mí fue culpa de " + (s.playedDriverName || "él") + "."]]); }
  if (st.order === "me") { const mate = DL.data.rows.find(r => r.mine && r.seat === 2); if (mate) quotes.push([mate.name, ["No me gustó la orden de equipo. Lo vamos a hablar adentro.", "Lo dejé pasar porque me lo pidieron. No estoy contento."]]); }
  DL.feed.filter(f => /^⬆️ ¡Pasaste a /.test(f.txt)).slice(0, 2).forEach(f => {
    const nm = f.txt.replace(/^⬆️ ¡Pasaste a /, "").split(/ y |!/)[0];
    try { if (isRival(nm.replace(" (reserva)", ""))) quotes.push([nm, ["Me pasó, sí, pero en la próxima lo agarro.", "Tuvo suerte con el tráfico. Esto no termina acá."]]); } catch (e) {}
  });
  quotes.slice(0, 2).forEach(([nm, arr]) => {
    const q = arr[dlH("q" + nm + dlKey()) % arr.length];
    add("🗞️ " + nm.replace(" (reserva)", "") + " habló después de la carrera: «" + q + "»");
    try { const b = nm.replace(" (reserva)", ""); if (!s.rivalries) s.rivalries = {}; if (b !== (s.playedDriverName || "")) s.rivalries[b] = Math.min(100, (s.rivalries[b] || 0) + 12); } catch (e) {}
  });
}
function dlSpeed(v) { if (!DL) return; DL.speed = v; dlSchedule(); dlDraw(); }
function dlSkip() {
  if (!DL) return;
  DL.skip = true; fwRadioStop();
  if (DL.phase === "menu") DL.phase = "run";
  if (DL.phase === "dec") dlPitChoose(DL.dec.def, true);
  if (DL.phase === "duel") dlDuelEnd(true);
  DL.phase = "run";
  while (DL.lap < DL.N) {
    DL.lap++;
    const l = DL.lap;
    dlLap(l);
    // lo pendiente se resuelve con la opción por defecto
    try {
      if (DL.mode === "race") {
        dlRaceExtras(l);
        if (DL.phase === "dec" && DL.dec) dlPitChoose(DL.dec.def, true);
        const ev = DL.events.find(e => !e.done && e.lap <= l);
        if (ev) {
          if (dlOpenEvent(ev, l)) { ev.done = true; if (DL.phase === "dec" && DL.dec) dlPitChoose(DL.dec.def, true); }
          else if (ev.kind !== "orders" || l >= DL.N * 0.92) ev.done = true;
        }
        DL.phase = "run";
      }
    } catch (e) { console.warn("[FAWIWE] saltar:", e); DL.phase = "run"; }
  }
  dlEnd(); dlDraw();
}

/* ---------- radio: decisiones ---------- */
function dlRebuild(note) {
  const lap = DL.lap;
  const keep = DL.me ? DL.me.pits.filter(p => p <= lap) : [];
  DL.pits = [...new Set(keep.concat(DL.pits.filter(p => p > lap)))].sort((a, b) => a - b);
  if (DL.mode === "sprint") dlBuildSprint(); else dlBuild();
  if (note) dlFeed(lap, note, true);
}
function dlTraits() { try { return currentCircuitTraits(); } catch (e) { return { overtake: "medio", tireWear: 1 }; } }
function dlOpenPitCall(l) {
  const tw = dlTraits().tireWear || 1, ov = dlTraits().overtake || "medio";
  const health = Math.max(15, Math.min(90, Math.round(60 / tw + (dlH("hp" + dlKey()) % 15) - 7)));
  const under = health <= 50 || /difícil|imposible/.test(ov), over = health >= 60 && !/difícil|imposible/.test(ov);
  const next = DL.me.pits.find(p => p > l);
  DL.dec = {
    q: "📻 Ventana de boxes — vuelta " + l,
    hint: "",
    def: 2,
    opts: [
      { label: "📦 Box esta vuelta (undercut)", say: "Box esta vuelta, quiero gomas nuevas ya.", fx: () => { DL.pits = DL.pits.filter(p => p !== next).concat([l + 1]); return under ? 3.5 : 0.3; } },
      { label: "⏳ Estiro el stint (overcut)", say: "Las aguanto, dejame afuera unas vueltas más.", fx: () => { DL.pits = DL.pits.filter(p => p !== next).concat([Math.min(DL.N - 2, next + 6)]); return over ? 3.5 : health <= 45 ? -3 : 0.8; } },
      { label: "📋 Seguimos el plan", say: "Seguimos el plan, copiado.", fx: () => 1.2 }
    ]
  };
  let rec = under ? 0 : over ? 1 : 2;
  if (dlH("recw" + dlKey()) % 100 < 20) rec = (rec + 1) % 3;
  DL.dec.rec = rec;
  DL.dec.hint = dlEngFirst() + ": «" + dlEngPre() + "Las traseras están al " + health + "%. Acá adelantar es " + ov + ". Yo haría: " + DL.dec.opts[rec].label.replace(/^\S+\s/, "") + ".»";
  DL.phase = "dec"; DL.decLeft = 12;
  dlSay(dlEngPre() + "Ventana de boxes. Las traseras están al " + health + " por ciento. Yo haría: " + DL.dec.opts[rec].label.replace(/^\S+\s/, "").replace(/\(.*\)/, "") + ".", "eng", { toast: false });
  dlDecStartTimer();
}
function dlDecStartTimer() {
  clearInterval(dlDecTimer);
  dlDecTimer = setInterval(() => {
    if (!DL || DL.phase !== "dec") { clearInterval(dlDecTimer); return; }
    DL.decLeft--;
    const el = document.getElementById("dlDecLeft"); if (el) el.textContent = DL.decLeft + "s";
    if (DL.decLeft <= 0) { clearInterval(dlDecTimer); dlPitChoose(DL.dec.def, true); }
  }, 1000);
}
function dlOpenEvent(ev, l) {
  const me = DL.me, st = dlState();
  if (!me || me.t.length <= l) return false;
  const nm = dlEngFirst();
  if (ev.kind === "damage") {
    DL.dec = {
      q: "💥 Daño en el auto — vuelta " + l, def: 1, rec: ev.heavy ? 0 : 1,
      hint: nm + ": «" + (ev.heavy ? "El alerón delantero está destrozado, perdemos mucha carga. Yo entraría a cambiarlo." : "Tocaste algo, el alerón está un poco dañado. Yo seguiría, se puede manejar.") + "»",
      opts: [
        { label: "🔧 Box: alerón nuevo", say: "Entro a cambiar el alerón.", fx: () => { DL.pits = DL.pits.concat([l + 1]); return ev.heavy ? 7 : 2; } },
        { label: "🏎️ Sigo así", say: "Sigo, lo manejo como sea.", fx: () => ev.heavy ? 0 : 1.5 }
      ]
    };
    dlFeed(l, "💥 Daño visible: " + (ev.heavy ? "alerón delantero destrozado." : "alerón delantero tocado."), true, "bad");
    dlSay(dlEngPre() + (ev.heavy ? "Tenemos daño fuerte en el alerón. ¿Paramos a cambiarlo?" : "Hay un poco de daño en el alerón. ¿Seguimos o paramos?"), "eng", { toast: false });
  } else if (ev.kind === "weather") {
    const wet = ev.wet;
    DL.wxNow = wet ? "rain" : "dry";
    DL.dec = {
      q: (wet ? "🌧️ ¡Empieza a llover!" : "☀️ ¡La pista se seca!") + " — vuelta " + l, def: 1, rec: dlH("wxr" + dlKey()) % 100 < 20 ? 1 : 0,
      hint: "",
      opts: wet ? [
        { label: "🌧️ Box ya: intermedios", say: "¡Box, box! Quiero intermedios ya.", fx: () => { DL.pits = DL.pits.concat([l + 1]); return 5; } },
        { label: "⏱️ Espero dos vueltas", say: "Aguanto dos vueltas a ver si para.", fx: () => { DL.pits = DL.pits.concat([Math.min(DL.N - 1, l + 3)]); return 1.5; } },
        { label: "🏎️ Sigo con gomas de seco", say: "Me quedo afuera con lisas.", fx: () => -4 }
      ] : [
        { label: "☀️ Box ya: gomas de seco", say: "Ya está seca la línea, quiero lisas.", fx: () => { DL.pits = DL.pits.concat([l + 1]); return 4; } },
        { label: "⏱️ Espero dos vueltas", say: "Espero un poco más con intermedios.", fx: () => { DL.pits = DL.pits.concat([Math.min(DL.N - 1, l + 3)]); return 1.5; } },
        { label: "🌧️ Sigo con intermedios", say: "Sigo con intermedios hasta el final.", fx: () => -4 }
      ]
    };
    DL.dec.hint = nm + ": «" + dlEngPre() + (wet ? "Está empezando a llover en el sector 2. Yo haría: " : "Se está secando la línea ideal. Yo haría: ") + DL.dec.opts[DL.dec.rec].label.replace(/^\S+\s/, "") + ".»";
    dlFeed(l, wet ? "🌧️ ¡Empieza a llover en " + ((trackData[s.gp] || {}).name || "el circuito") + "!" : "☀️ Sale el sol: la pista se empieza a secar.", false, "sc");
    dlSay(wet ? "Está empezando a llover. ¿Entramos por intermedios?" : "La pista se seca. ¿Pasamos a lisas?", "eng", { toast: false });
  } else if (ev.kind === "orders") {
    const mate = DL.data.rows.find(r => r.mine && r.seat === 2);
    if (!mate || mate.t.length <= l) return false;
    const gap = mate.cum[l - 1] - me.cum[l - 1];
    if (Math.abs(gap) > 3 || Math.abs(mate.pos[l] - me.pos[l]) !== 1) return false;
    const mn = mate.name.replace(" (reserva)", "");
    if (gap > 0) {
      DL.dec = {
        q: "📻 Orden de equipo — vuelta " + l, def: 0, rec: 0,
        hint: nm + ": «" + mn + " viene más rápido y tiene otra estrategia. Dejalo pasar, después lo revisamos.»",
        opts: [
          { label: "🤝 Obedezco: lo dejo pasar", note: "🤝 Obedeciste la orden: el equipo te lo va a reconocer.", say: "Copiado. Lo dejo pasar en la recta.", fx: () => { st.order = "mate"; st.orderLap = DL.lap; try { const R = rlRel(); R.mate = Math.min(100, R.mate + 8); R.recog = Math.max(0, R.recog - 2); } catch (e) {} return 0; } },
          { label: "🙅 Ignoro la orden", note: "🙅 Ignoraste la orden: tu compañero y el box quedaron molestos.", say: "No. Si es más rápido, que me pase en la pista.", fx: () => { try { const R = rlRel(); R.mate = Math.max(0, R.mate - 12); R.recog = Math.min(100, R.recog + 3); } catch (e) {} dlEngRel(-3); s.trust = Math.max(0, (s.trust || 50) - 3); return 0.4; } }
        ]
      };
      dlSay(dlEngPre() + "Orden de equipo. Dejá pasar a " + dlShort(mn) + ".", "eng", { toast: false });
    } else {
      DL.dec = {
        q: "📻 ¿Pedimos orden de equipo? — vuelta " + l, def: 1, rec: 1,
        hint: nm + ": «Estás más rápido que " + mn + ". Podemos pedirle que te deje pasar, pero no le va a gustar.»",
        opts: [
          { label: "📻 Sí, que me deje pasar", note: "📻 Tu compañero se corre y te deja pasar.", say: "Pedile que se corra, estoy más rápido.", fx: () => { st.order = "me"; st.orderLap = DL.lap; try { const R = rlRel(); R.mate = Math.max(0, R.mate - 7); R.recog = Math.min(100, R.recog + 2); } catch (e) {} return 0; } },
          { label: "🏁 No, lo paso en la pista", note: "🏁 Elegiste pelearlo en la pista.", say: "No hace falta, lo paso yo.", fx: () => { try { const R = rlRel(); R.mate = Math.min(100, R.mate + 3); } catch (e) {} return 0.8; } }
        ]
      };
      dlSay(dlEngPre() + "Tenés a tu compañero adelante y vas más rápido. ¿Pedimos orden de equipo?", "eng", { toast: false });
    }
    dlFeed(l, "🤝 Tu compañero " + mn + " está " + (gap > 0 ? "atrás" : "adelante") + " a " + Math.abs(gap).toFixed(1) + "s.", true);
  } else return false;
  DL.phase = "dec"; DL.decLeft = 12;
  dlDecStartTimer();
  return true;
}
function dlPitChoose(i, timeout) {
  if (!DL || DL.phase !== "dec" || !DL.dec) return;
  clearInterval(dlDecTimer);
  const o = DL.dec.opts[i] || DL.dec.opts[DL.dec.def];
  const g = o.fx();
  const st = dlState(); st.bonus += g;
  if (DL.dec.rec != null && !timeout) { const rel = dlEngRel(i === DL.dec.rec ? 3 : -2); if (i !== DL.dec.rec && !DL.skip) dlFeed(DL.lap, "😤 " + dlEngFirst() + " no está de acuerdo (relación " + rel + "/100).", true, "radio"); }
  if (!DL.skip) { fwRadioSay(o.say, "you"); fwRadioSay(g >= 3 ? "Copiado. Buena lectura, eso nos sirve." : g >= 0.5 ? "Copiado." : "Copiado… no sé si era la mejor, pero vamos.", "eng", { toast: false }); }
  DL.dec = null; DL.phase = "run";
  dlRebuild("📻 " + (timeout ? "(Se acabó el tiempo) " : "") + "Vos: «" + o.say + "» — " + (o.note || (g >= 3 ? "✅ ¡gran llamada!" : g >= 0.5 ? "👍 bien." : g >= 0 ? "➖ sin ganancia." : "❌ te costó tiempo.")));
  dlDraw();
}
const DL_MENUS = {
  q: { title: "📻 Quejarte por radio", opts: [
    { id: "tyres", label: "🛞 «¡Las gomas no dan más!»" },
    { id: "blocked", label: "🚩 «¡Me cerró! Que lo investiguen»" },
    { id: "car", label: "🔧 «Siento algo raro en el auto»" }
  ] },
  t: { title: "🔁 Cambiar la estrategia", opts: [
    { id: "two", label: "⚡ Pasar a 2 paradas (gomas frescas al final)" },
    { id: "one", label: "🛡️ Ir a 1 parada y cuidar las gomas" },
    { id: "attack", label: "🔥 Modo ataque: empujar ya" }
  ] }
};
function dlMenu(kind) {
  if (!DL || DL.phase !== "run" || !DL.me || DL.me.t.length <= DL.lap) return;
  if ((kind === "q" ? DL.q : DL.t) <= 0) { fwRadioToast("Ya usaste todas las llamadas de radio de ese tipo.", "eng"); return; }
  DL.phase = "menu"; DL.menu = kind; dlDraw();
}
function dlMenuOpts(kind) { const o = DL_MENUS[kind].opts; return DL && DL.mode === "sprint" ? o.filter(x => x.id === "attack") : o; }
function dlMenuClose() { if (DL && DL.phase === "menu") { DL.phase = "run"; DL.menu = null; dlDraw(); } }
function dlRadio(id) {
  if (!DL || DL.phase !== "menu") return;
  const kind = DL.menu; DL.phase = "run"; DL.menu = null;
  if (kind === "q") DL.q--; else DL.t--;
  const st = dlState(), l = DL.lap, N = DL.N, me = DL.me, left = N - l, frac = l / N;
  const tw = dlTraits().tireWear || 1, ov = dlTraits().overtake || "medio";
  const lastPit = Math.max(0, ...me.pits.filter(p => p <= l));
  let you = "", eng = "", who = "eng", note = "", g = 0;
  if (id === "tyres") {
    you = "¡Las gomas no dan más, se me va la cola!";
    if (l - lastPit <= 6 && lastPit > 0) { eng = "Son gomas nuevas, es la pista. Aguantá y no las fuerces."; g = -0.4; note = "➖ Las gomas eran nuevas: era la pista."; }
    else if (left <= 6) { eng = "Faltan " + left + " vueltas. Aguantá, no paramos."; g = 0; note = "➖ Quedaban pocas vueltas: seguiste afuera."; }
    else { eng = "Copiado. Box esta vuelta, box, box."; DL.pits = DL.pits.filter(p => p <= l || p > l + 12).concat([l + 1]); g = frac > 0.25 ? 1.6 : -0.8; note = g > 0 ? "✅ Paraste justo cuando las gomas se caían." : "❌ Paraste demasiado temprano."; }
  } else if (id === "blocked") {
    you = "¡Me cerró la puerta! ¡Eso es peligroso, que lo investiguen!";
    const cand = DL.data.rows.filter(r => r !== me && r.t.length >= l && Math.abs(r.pos[l] - me.pos[l]) === 1).sort((a, b) => a.pos[l] - b.pos[l]);
    const target = cand[0];
    if (target && dlH("inv" + target.name + dlKey()) % 100 < 42) {
      st.pens.push({ name: target.name, reason: "Maniobra peligrosa (denuncia por radio)" });
      who = "fia"; eng = "Comisarios: 5 segundos de penalización para " + target.name + " por maniobra peligrosa.";
      note = "⚖️ ¡Sanción! +5s para " + target.name + ".";
    } else { eng = target ? "Lo vieron los comisarios: no hay más acciones. Concentrate en lo tuyo." : "No hay nadie cerca, concentrate en tu carrera."; g = -0.3; note = "➖ Los comisarios no sancionaron a nadie."; }
  } else if (id === "car") {
    you = "Siento algo raro en el auto, vibra en la recta.";
    const myG = DL.grid.find(x => x.mine && x.seat === 1);
    const wall = s._crashDNF && s._crashDNF.key === s.season + "_" + s.gp;
    if (myG && myG.status === "DNF" && me.t.length > l && !wall) {
      if (dlH("save" + dlKey()) % 100 < 55) { st.save = true; eng = "Lo vemos en los datos. Cambiá a modo motor tres y cuidá los pianos. Lo salvamos."; note = "🛡️ ¡Detectaron una falla a tiempo y salvaron el auto!"; g = -1; }
      else { eng = "Lo estamos viendo… cuidá el motor, no pinta bien."; note = "⚠️ La falla parece seria."; }
    } else { eng = "Los datos están perfectos. Es tu imaginación, empujá tranquilo."; g = 0.6; note = "👍 Todo en orden: más confianza."; }
  } else if (id === "two") {
    you = "Pasemos a dos paradas, quiero gomas frescas para el final.";
    if (left < N * 0.3) { eng = "Ya es tarde para cambiar, copiado igual."; g = -1.5; note = "❌ Era tarde para otra parada."; DL.pits.push(Math.min(N - 2, l + 2)); }
    else { const good = tw >= 1.1; DL.pits = DL.pits.filter(p => p <= l).concat([Math.round(l + left * 0.33), Math.round(l + left * 0.68)]); eng = good ? "Buena idea, acá las gomas se gastan mucho. Dos paradas." : "Copiado, dos paradas. Ojo que acá degradan poco."; g = good ? 3 : -1.2; note = good ? "✅ Dos paradas en una pista que come gomas: ¡bien!" : "❌ Una parada de más en una pista que no gasta gomas."; }
  } else if (id === "one") {
    you = "Vamos a una parada, yo cuido las gomas.";
    const future = DL.pits.filter(p => p > l);
    const good = tw <= 1.0 || /difícil|imposible/.test(ov);
    if (future.length > 1) DL.pits = DL.pits.filter(p => p <= l).concat([Math.round((future[0] + future[future.length - 1]) / 2)]);
    eng = good ? "Copiado, una parada. Acá la posición en pista vale oro." : "Copiado… vas a tener que cuidar mucho las gomas.";
    g = good ? 2.5 : -1; note = good ? "✅ Menos paradas en una pista donde cuesta pasar: ¡bien!" : "❌ Las gomas sufrieron al final.";
  } else if (id === "attack") {
    you = "Dame todo el motor, voy a atacar ya.";
    const slip = dlH("atk" + l + dlKey()) % 100 < 14;
    if (slip) { eng = "¡Cuidado! Te pasaste en la frenada. Tranquilo, respirá."; g = -2.5; note = "❌ Bloqueaste en la frenada atacando."; }
    else { g = left <= N * 0.3 ? 3 : 1.8; eng = "Modo ataque activado. Todo tuyo."; note = "🔥 Modo ataque: más ritmo."; }
  }
  if (DL.mode === "sprint") st.sprintBonus = (st.sprintBonus || 0) + g; else st.bonus += g;
  fwRadioSay(you, "you");
  fwRadioSay(eng, who, { toast: false });
  dlFeed(l, "🎙️ Vos: «" + you + "»", true, "radio");
  dlFeed(l, (who === "fia" ? "⚖️ " : "📻 ") + eng, true, "radio");
  dlRebuild(note);
  dlDraw();
}

/* ---------- pantalla ---------- */
function dlEnsureOverlay() {
  if (document.getElementById("dlOverlay")) return;
  const ov = document.createElement("div");
  ov.id = "dlOverlay";
  ov.innerHTML = `<div class="eng-live-card dl-card">
    <div class="eng-live-head"><div><div class="kicker">📺 EN VIVO · TRANSMISIÓN DE CARRERA</div><h2 id="dlTitle"></h2><div id="dlStatus" class="small"></div></div><div class="eng-live-lap" id="dlLap"></div></div>
    <div id="dlRadioBar" class="dl-radio"></div>
    <div id="dlDecision"></div>
    <div class="eng-live-body"><div><div class="dl-cols"><span>POS</span><span></span><span>PILOTO</span><span>🔧</span><span>DIF.</span></div><div class="eng-live-board" id="dlBoard"></div></div><div><div class="fw-map" id="dlMap"></div><div class="dl-cols"><span>HIGHLIGHTS</span></div><div class="eng-live-feed" id="dlFeed"></div></div></div>
    <div id="dlCtrl" style="text-align:center;margin-top:10px"></div>
  </div>`;
  document.body.appendChild(ov);
  document.addEventListener("keydown", ev => {
    if (!DL || !document.getElementById("dlOverlay").classList.contains("show")) return;
    const k = ev.key.toLowerCase();
    if (DL.phase === "duel" && (k === " " || k === "enter")) { ev.preventDefault(); dlDuelHit(); return; }
    if (DL.phase === "run" && k === "q") { ev.preventDefault(); dlMenu("q"); }
    else if (DL.phase === "run" && k === "t") { ev.preventDefault(); dlMenu("t"); }
    else if ((DL.phase === "menu" || DL.phase === "dec") && ["1", "2", "3"].includes(k)) { ev.preventDefault(); const i = +k - 1; if (DL.phase === "menu") { const o = dlMenuOpts(DL.menu)[i]; if (o) dlRadio(o.id); } else if (DL.dec && DL.dec.opts[i]) dlPitChoose(i); }
    else if (DL.phase === "menu" && k === "escape") dlMenuClose();
    else if (DL.phase === "end" && (k === "enter" || k === " ")) { ev.preventDefault(); if (DL.mode === "sprint") dlGoSunday(); else dlFinalize(); }
  });
}
function dlDraw() {
  if (!DL) return;
  const d = DL.data, l = Math.min(DL.lap, d.N);
  const scOn = d.sc && l >= d.sc[0] && l < d.sc[0] + d.sc[1];
  document.getElementById("dlTitle").textContent = (DL.mode === "sprint" ? "⚡ SPRINT · " : "GP de ") + ((trackData[s.gp] || {}).name || "") + " · " + (s.playedDriverName || "vos");
  const ovEl = document.getElementById("dlOverlay");
  const pend = DL.events.find(e => e.kind === "weather" && !e.done);
  ovEl.classList.toggle("rain", DL.wxNow ? DL.wxNow === "rain" : pend ? !pend.wet : !!(s.weather && s.weather.wet));
  ovEl.classList.toggle("sprint", DL.mode === "sprint");
  document.getElementById("dlStatus").innerHTML = `<span class="eng-flag ${scOn ? "sc" : DL.phase === "end" ? "fin" : ""}">${DL.phase === "end" ? "🏁 Bandera a cuadros" : scOn ? "🟡 SAFETY CAR" : "🟢 Bandera verde"}</span> ${s.weather ? dlEsc(s.weather.label) : ""} · ${d.N} vueltas`;
  document.getElementById("dlLap").innerHTML = `<b>Vuelta ${l}/${d.N}</b>${typeof engBar === "function" ? engBar(l, d.N) : ""}`;
  const order = lapOrderAt(d, Math.max(0, l));
  const leader = order[0];
  const rows = order.map((r, i) => {
    const out = l > 0 && r.t.length < l;
    const np = r.pits.filter(p => p <= l).length;
    const inPit = r.pits.includes(l) && !out;
    const pen = (dlState().pens || []).find(p => p.name === r.name);
    return { i, r, html: `<div class="eng-live-row dl-row ${r.mine ? "mine" : ""} ${out ? "out" : ""}"><span class="p">${out ? "—" : i + 1}</span><span class="c" style="background:${(typeof teamColors !== "undefined" && teamColors[r.team]) || "#888"}"></span><span class="n">${dlEsc(r.name.replace(" (reserva)", ""))}${pen ? ' <span class="eng-badge pen">+5s</span>' : ""}${inPit ? ' <span class="dl-pitnow">EN BOXES</span>' : ""}</span><span class="t">${np ? "🔧" + np : "—"}</span><span class="g">${l === 0 ? "" : out ? "OUT" : dlGapTxt(r, l, leader)}</span></div>` };
  });
  const myI = rows.findIndex(x => x.r.mine && x.r.seat === 1);
  const shown = rows.filter(x => x.i < 10 || Math.abs(x.i - myI) <= 1 || x.r.mine);
  document.getElementById("dlBoard").innerHTML = shown.map(x => x.html).join("");
  document.getElementById("dlFeed").innerHTML = DL.feed.slice().reverse().map(f => `<p class="${f.mine ? "mine" : ""} ${f.cls}"><b>V${f.lap}</b> ${dlEsc(f.txt)}</p>`).join("");
  const alive = DL.me && DL.me.t.length > l;
  document.getElementById("dlRadioBar").innerHTML = DL.phase === "end" ? "" : `<span class="dl-rlabel">📻 RADIO</span>
    <button type="button" class="lv-btn" ${!alive || DL.q <= 0 || DL.phase !== "run" ? "disabled" : ""} onclick="dlMenu('q')">🗣️ Quejarte <kbd>Q</kbd> <small>${DL.q}</small></button>
    <button type="button" class="lv-btn" ${!alive || DL.t <= 0 || DL.phase !== "run" ? "disabled" : ""} onclick="dlMenu('t')">🔁 Estrategia <kbd>T</kbd> <small>${DL.t}</small></button>
    ${typeof fwVoiceBtn === "function" ? fwVoiceBtn() : ""}${DL.mode === "race" && DL.stints ? dlTyreHtml(l) : ""}<span class="dl-eng" title="Tu ingeniero de pista">🎧 ${dlEsc(dlEng().name)} · ${(DL_ENG_STYLE[dlEng().style] || { lbl: "" }).lbl} · ❤️ ${dlEng().rel}</span>`;
  const dec = document.getElementById("dlDecision");
  if (DL.phase === "menu") {
    const M = DL_MENUS[DL.menu];
    dec.innerHTML = `<div class="eng-live-dec"><div class="q">${M.title} <span class="small">(la carrera está en pausa)</span></div><div class="choice-grid">${dlMenuOpts(DL.menu).map((o, i) => `<button class="choice-card" onclick="dlRadio('${o.id}')"><b>${dlEsc(o.label)}</b><span class="small"><kbd>${i + 1}</kbd></span></button>`).join("")}</div><button class="lv-btn" onclick="dlMenuClose()">✖ Cancelar <kbd>Esc</kbd></button></div>`;
  } else if (DL.phase === "duel" && DL.duel) {
    dec.innerHTML = dlDuelHtml();
  } else if (DL.phase === "dec" && DL.dec) {
    dec.innerHTML = `<div class="eng-live-dec"><div class="q">${dlEsc(DL.dec.q)} <span class="eng-dec-left" id="dlDecLeft">${DL.decLeft}s</span></div><p class="small">${dlEsc(DL.dec.hint)}</p><div class="choice-grid">${DL.dec.opts.map((o, i) => `<button class="choice-card" onclick="dlPitChoose(${i})"><b>${dlEsc(o.label)}</b><span class="small"><kbd>${i + 1}</kbd></span></button>`).join("")}</div></div>`;
  } else dec.innerHTML = "";
  document.getElementById("dlCtrl").innerHTML = DL.phase === "end" && DL.mode === "sprint"
    ? `<button class="lv-btn red" onclick="dlGoSunday()">▶ A la carrera del domingo <kbd>Enter</kbd></button>`
    : DL.phase === "end"
    ? `<button class="lv-btn red" onclick="dlFinalize()">🏆 Ver resultado oficial <kbd>Enter</kbd></button>`
    : `<button class="lv-btn ${DL.speed === 1 ? "on" : ""}" onclick="dlSpeed(1)">▶ x1</button><button class="lv-btn ${DL.speed === 3 ? "on" : ""}" onclick="dlSpeed(3)">⏩ x3</button><button class="lv-btn" onclick="dlSkip()">⏭ Saltar al final</button>`;
}

/* ---------- ganchos ---------- */
(function () {
  const fr = window.finishRace;
  if (typeof fr === "function") window.finishRace = function () {
    try {
      if (dlOn() && !s.raceDone && !s._dlSkip && s.drvLive !== false) {
        if (DL && DL.key === dlKey()) return;
        const st = s._dl && s._dl.key === dlKey() ? s._dl : null;
        if (!st || !st.done) { dlStart(); return; }
      }
    } catch (e) { console.warn("[FAWIWE] transmisión:", e); DL = null; const o = document.getElementById("dlOverlay"); if (o) o.classList.remove("show"); }
    return fr.apply(this, arguments);
  };
  const sw = window.skipWeekend;
  if (typeof sw === "function") window.skipWeekend = function () { s._dlSkip = true; try { return sw.apply(this, arguments); } finally { s._dlSkip = false; } };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () { const r = ng.apply(this, arguments); try { if (s._dl && s._dl.key !== dlKey()) s._dl = null; } catch (e) {} return r; };
  // en el resultado: tus highlights y el vuelta a vuelta
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind) {
    const r = sb.apply(this, arguments);
    try {
      if (!dlOn() || String(kind).indexOf("CARRERA") !== 0) return r;
      const st = s._dl && s._dl.key === dlKey() ? s._dl : null;
      const box = document.getElementById("resultGridTable");
      if (!st || !st.highlights || !box) return r;
      const hl = st.highlights.filter(h => !/^🎙️|^📻/.test(h.txt)).slice(0, 9);
      box.insertAdjacentHTML("afterbegin", `<div class="dl-sum"><b>🎬 Tu carrera</b>${hl.map(h => `<p class="${h.cls}"><em>V${h.lap}</em> ${dlEsc(h.txt)}</p>`).join("")}</div>` + (window.dlLastData ? `<button class="lv-btn red" style="margin:0 0 10px" onclick="lapOpenView(dlLastData)">📊 Ver vuelta por vuelta</button>` : ""));
    } catch (e) {}
    return r;
  };
})();

/* ---------- modo ingeniero: se ven las paradas en boxes de todos ---------- */
(function () {
  if (typeof engLiveTick === "function") {
    const o = engLiveTick;
    engLiveTick = function () {
      const L = engLive;
      const d = L && L.lapData;
      const before = d ? Math.min(d.N, Math.floor(L.tick / L.T * d.N)) : 0;
      const r = o.apply(this, arguments);
      try {
        if (L && L.lapData) {
          const D = L.lapData, now = Math.min(D.N, Math.floor(L.tick / L.T * D.N));
          for (let l = before + 1; l <= now; l++) {
            const ps = D.rows.filter(x => !x.mine && x.pits.includes(l) && x.t.length >= l);
            if (ps.length) L.feed.push({ lap: l, txt: "🔧 Boxes: " + ps.map(x => dlShort(x.name) + " (P" + x.pos[l] + ")").join(" · ") });
          }
        }
      } catch (e) {}
      return r;
    };
  }
})();


/* =====================================================================================
   V134 · GOMAS POR COMPUESTO, BANDERA ROJA, LÍMITES DE PISTA Y DUELO FINAL
   ===================================================================================== */
const DL_TY = {
  Soft: { n: "Blandos", c: "#e10600", rate: 3.4 }, Medium: { n: "Medios", c: "#facc15", rate: 2.3 }, Hard: { n: "Duros", c: "#e5e7eb", rate: 1.55 },
  Intermedio: { n: "Intermedios", c: "#22c55e", rate: 2.0 }, Lluvia: { n: "Lluvia", c: "#38bdf8", rate: 1.7 }
};
function dlStartTyre() { const v = document.getElementById("tyre")?.value || s.chosenTyre || "Medium"; return DL_TY[v] ? v : /lluv/i.test(v) ? "Lluvia" : /inter/i.test(v) ? "Intermedio" : "Medium"; }
function dlExtrasInit() {
  const key = dlKey(), N = DL.N;
  DL.stints = [{ from: 0, ty: dlStartTyre() }];
  DL.compAsked = {};
  DL.wornFlag = {};
  // bandera roja: poco común, más probable con lluvia o Safety Car
  const rf = dlH("redflag" + key) % 100;
  if (rf < 6 + (s.weather && s.weather.wet ? 6 : 0) + (s._safetyCarThisRace ? 5 : 0)) DL.redLap = Math.max(4, Math.round(N * (0.3 + (dlH("rfl" + key) % 20) / 100)));
  // límites de pista: advertencias para vos
  const nWarn = (dlH("tl" + key) % 4) + (s.drivingStyle === "aggressive" ? 1 : 0);
  DL.tl = { n: 0, laps: Array.from({ length: nWarn }, (_, i) => Math.round(N * (0.15 + 0.75 * ((dlH("tlap" + i + key) % 100) / 100)))).sort((a, b) => a - b) };
  // un rival sancionado por límites de pista
  DL.tlRival = dlH("tlr" + key) % 100 < 35 ? Math.round(N * (0.25 + (dlH("tlrl" + key) % 50) / 100)) : 0;
  DL.duelLap = Math.max(3, N - 5);
}
function dlTyreNow(l) { const st = DL.stints || []; return st.length ? st[st.length - 1] : { from: 0, ty: "Medium" }; }
function dlWear(l) {
  const S = dlTyreNow(l), T = DL_TY[S.ty] || DL_TY.Medium;
  const tw = (dlTraits().tireWear || 1);
  return Math.max(0, Math.round(100 - T.rate * (l - S.from) * (52 / Math.max(10, DL.N)) * tw));
}
function dlTyreHtml(l) {
  const S = dlTyreNow(l), T = DL_TY[S.ty] || DL_TY.Medium, w = dlWear(l);
  return `<span class="dl-tyre" title="Gomas y desgaste"><i style="border-color:${T.c}"></i>${T.n} <b class="${w < 25 ? "bad" : w < 50 ? "mid" : ""}">${w}%</b><em><u style="width:${w}%;background:${w < 25 ? "#ef4444" : w < 50 ? "#facc15" : "#22c55e"}"></u></em></span>`;
}
function dlCompOpts(l, free) {
  const wet = !!(s.weather && s.weather.wet) && DL.wxNow !== "dry";
  const left = (DL.N - l) / DL.N;
  const list = wet ? ["Intermedio", "Lluvia", "Medium"] : ["Soft", "Medium", "Hard"];
  const rec = wet ? (s.weather.label && /fuerte/i.test(s.weather.label) ? "Lluvia" : "Intermedio") : left < 0.35 ? "Soft" : left < 0.6 ? "Medium" : "Hard";
  return { list, rec, opts: list.map(ty => ({ label: (ty === "Soft" ? "🔴 " : ty === "Medium" ? "🟡 " : ty === "Hard" ? "⚪ " : ty === "Intermedio" ? "🟢 " : "🔵 ") + DL_TY[ty].n, say: "Poneme " + DL_TY[ty].n.toLowerCase() + ".", fx: () => { DL.stints.push({ from: l, ty }); return ty === rec ? 1.5 : (wet !== (ty === "Intermedio" || ty === "Lluvia")) ? -3 : -0.8; }, note: (ty === rec ? "✅ " : "➖ ") + "Pusiste " + DL_TY[ty].n.toLowerCase() + (free ? " para el relanzamiento." : ".") })) };
}
function dlOpenComp(l, free) {
  const C = dlCompOpts(l, free);
  const rec = C.list.indexOf(C.rec);
  if (DL.skip) { C.opts[rec].fx(); return false; }
  DL.dec = { q: (free ? "🔴 Bandera roja · cambio de gomas gratis" : "🛞 ¿Qué gomas ponemos?") + " — vuelta " + l, def: rec, rec, hint: dlEngFirst() + ": «" + dlEngPre() + "Quedan " + (DL.N - l) + " vueltas. Yo pondría " + DL_TY[C.rec].n.toLowerCase() + ".»", opts: C.opts };
  DL.phase = "dec"; DL.decLeft = 10;
  dlSay("¿Qué gomas ponemos? Yo pondría " + DL_TY[C.rec].n.toLowerCase() + ".", "eng", { toast: false });
  dlDecStartTimer();
  return true;
}
function dlRaceExtras(l) {
  if (DL.mode !== "race" || !DL.me || !DL.stints) return false;
  const me = DL.me, st = dlState();
  const alive = me.t.length >= l && me.status !== "DNS";
  // 1) parada: elegir compuesto
  if (alive && me.pits.includes(l) && !DL.compAsked[l] && l < DL.N) { DL.compAsked[l] = true; if (dlOpenComp(l, false)) return true; }
  // 2) desgaste extremo
  const S = dlTyreNow(l), w = dlWear(l);
  if (alive && w < 15 && !DL.wornFlag[S.from]) {
    DL.wornFlag[S.from] = true; st.bonus -= 2;
    dlFeed(l, "🛞 ¡Las " + DL_TY[S.ty].n.toLowerCase() + " están destruidas (" + w + "%)! Perdés mucho tiempo por vuelta.", true, "bad");
    dlSay("Las gomas están muertas. Cuidado en las frenadas.", "eng");
    dlRebuild(); return false;
  }
  // 3) bandera roja
  if (DL.redLap && l === DL.redLap) {
    DL.redLap = 0;
    dlFeed(l, "🔴 ¡BANDERA ROJA! Accidente fuerte: carrera suspendida, todos a la calle de boxes.", false, "red");
    dlSay("Bandera roja, bandera roja. Entrá despacio a boxes.", "eng");
    if (alive) {
      const g = ((dlH("restart" + dlKey()) % 100) + (s.focus || 55) / 2) > 75 ? 1 : -1;
      st.bonus += g * 1.2;
      dlFeed(l, "🚦 Relanzamiento con largada detenida: " + (g > 0 ? "¡saliste muy bien!" : "patinaste un poco en la salida."), true, g > 0 ? "ok" : "bad");
      if (dlOpenComp(l, true)) return true;
      dlRebuild();
    }
    return false;
  }
  // 4) límites de pista
  if (alive && DL.tl && DL.tl.laps.includes(l) && DL.tl.n < 3) {
    DL.tl.n++;
    const where = (typeof EM_CORNERS !== "undefined" && EM_CORNERS[(trackData[s.gp] || {}).name] || ["la última curva"])[dlH("tlc" + l) % 4] || "la última curva";
    if (DL.tl.n < 3) {
      dlFeed(l, "⚠️ Límites de pista en " + where + ": advertencia " + DL.tl.n + "/3.", true, "bad");
      if (DL.tl.n === 2) dlSay("Segunda advertencia por límites de pista. Una más y es sanción.", "eng");
    } else {
      st.myPen = 5;
      dlFeed(l, "⚖️ Tercera advertencia: +5 segundos por límites de pista.", true, "bad");
      dlSay("Comisarios: cinco segundos de penalización para el auto " + (s.driverNumber || "") + " por límites de pista.", "fia");
      dlRebuild();
    }
  }
  if (DL.tlRival && l === DL.tlRival) {
    DL.tlRival = 0;
    const cand = DL.data.rows.filter(r => !r.mine && r.t.length >= l && r.status !== "DNS");
    const r = cand[dlH("tlrw" + dlKey()) % Math.max(1, cand.length)];
    if (r) { st.pens.push({ name: r.name, reason: "Límites de pista" }); dlFeed(l, "⚖️ +5s para " + r.name + " por límites de pista.", false); dlRebuild(); }
  }
  // 5) duelo final
  if (alive && l === DL.duelLap && !st.duel) {
    const cur = me.pos[l];
    const ahead = DL.data.rows.find(r => r.pos[l] === cur - 1 && r.t.length >= l), behind = DL.data.rows.find(r => r.pos[l] === cur + 1 && r.t.length >= l);
    const gA = ahead ? me.cum[l - 1] - ahead.cum[l - 1] : 99, gB = behind ? behind.cum[l - 1] - me.cum[l - 1] : 99;
    if (Math.min(gA, gB) < 1.2) {
      const atk = gA <= gB;
      const other = atk ? ahead : behind;
      if (DL.skip) { st.duel = { lap: l, other: other.name, res: dlH("duel" + dlKey()) % 2 ? (atk ? "gain" : "keep") : (atk ? "keep" : "lose") }; dlRebuild(); return false; }
      DL.duel = { atk, other: other.name, tries: 0, hits: 0, x: 0, v: 1, zone: [40, 62], t0: performance.now(), log: [] };
      const sp = s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8;
      DL.duel.speed = sp;
      DL.phase = "duel";
      dlFeed(l, "⚔️ ¡DUELO FINAL! " + (atk ? "Atacás a " : "Te ataca ") + other.name + " a " + Math.min(gA, gB).toFixed(1) + "s.", true);
      dlSay(atk ? "Lo tenés a menos de un segundo. ¡Ahora o nunca!" : "Te viene atacando. ¡Defendé, defendé!", "eng");
      dlDuelLoop();
      return true;
    }
  }
  return false;
}
let dlDuelRaf = null;
function dlDuelLoop() {
  cancelAnimationFrame(dlDuelRaf);
  const step = () => {
    if (!DL || DL.phase !== "duel" || !DL.duel) return;
    const D = DL.duel;
    if (performance.now() - D.t0 > 15000) { dlDuelEnd(true); return; }
    D.x += D.v * D.speed * 1.6;
    if (D.x >= 100) { D.x = 100; D.v = -1; } if (D.x <= 0) { D.x = 0; D.v = 1; }
    const m = document.getElementById("dlDuelMark"); if (m) m.style.left = D.x + "%";
    dlDuelRaf = requestAnimationFrame(step);
  };
  dlDuelRaf = requestAnimationFrame(step);
}
function dlDuelHtml() {
  const D = DL.duel;
  return `<div class="eng-live-dec dl-duel"><div class="q">⚔️ DUELO FINAL · ${D.atk ? "atacás a" : "defendés de"} ${dlEsc(D.other)} <span class="small">(${3 - D.tries} intentos)</span></div>
    <p class="small">${D.atk ? "Frená justo en la zona verde para meterte por adentro." : "Cerrá la puerta justo en la zona verde."} Necesitás 2 de 3.</p>
    <div class="dl-duel-bar"><i class="z" style="left:${D.zone[0]}%;width:${D.zone[1] - D.zone[0]}%"></i><b id="dlDuelMark" style="left:${D.x}%"></b></div>
    <div class="dl-duel-log">${D.log.map(x => x ? "✅" : "❌").join(" ")}</div>
    <button type="button" class="lv-btn red" onclick="dlDuelHit()">${D.atk ? "⚔️ ¡FRENÁ AHORA!" : "🛡️ ¡CERRÁ AHORA!"} <kbd>Espacio</kbd></button></div>`;
}
function dlDuelHit() {
  if (!DL || DL.phase !== "duel" || !DL.duel) return;
  const D = DL.duel;
  const ok = D.x >= D.zone[0] && D.x <= D.zone[1];
  D.tries++; if (ok) D.hits++; D.log.push(ok);
  // la zona se achica y se mueve en cada intento
  const w = Math.max(12, (D.zone[1] - D.zone[0]) - 4), c = 25 + (dlH("dz" + D.tries + dlKey()) % 50);
  D.zone = [c, c + w];
  if (D.tries >= 3 || D.hits >= 2 || D.tries - D.hits >= 2) { dlDuelEnd(false); return; }
  dlDraw();
}
function dlDuelEnd(auto) {
  const D = DL.duel; if (!D) return;
  cancelAnimationFrame(dlDuelRaf);
  const st = dlState();
  const won = auto ? dlH("duel" + dlKey()) % 2 === 0 : D.hits >= 2;
  st.duel = { lap: DL.lap, other: D.other, res: D.atk ? (won ? "gain" : "keep") : (won ? "keep" : "lose") };
  DL.duel = null; DL.phase = "run";
  const txt = D.atk ? (won ? "⚔️ ¡GANASTE EL DUELO! Pasaste a " + D.other + " en las últimas vueltas." : "⚔️ Lo intentaste, pero " + D.other + " se defendió hasta el final.") : (won ? "🛡️ ¡Duelo ganado! " + D.other + " no pudo pasarte." : "🛡️ Perdiste el duelo: " + D.other + " te pasó al final.");
  dlFeed(DL.lap, txt, true, won ? "ok" : "bad");
  if (!DL.skip) dlSay(won ? (D.atk ? "¡Adentro! ¡Qué maniobra!" : "¡Bien defendido, lo aguantaste!") : (D.atk ? "No alcanzó. Buen intento." : "Te pasó. Una pena."), "eng");
  dlRebuild();
  dlDraw();
}
