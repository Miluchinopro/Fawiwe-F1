/* =====================================================================================
   FAWIWE · V140 — 30 arreglos
   Estrategia (plan, lluvia, épocas, carreras cortas, gráfico real) · boxes por época ·
   Safety Car / límites de pista / clasificación según el año · textos · prensa · guardado ·
   2 jugadores · celular · tutorial en pestañas · repeticiones (defensa e ingeniero).
   ===================================================================================== */
function v10Y() { return (typeof s !== "undefined" && s && s.season) || 2026; }
function v10HideToast() { const el = document.getElementById("fwRadioToast"); if (el) { el.classList.remove("show"); clearTimeout(el._t); } }

/* ---------------- 20) tiempos de parada según la época ---------------- */
function v10PitT(t) {
  const y = v10Y(), k = Math.max(0, Math.min(1, (t - 2) / 1.2));
  const R = y < 1982 ? [16, 30] : y < 1994 ? [5, 9] : y <= 2009 ? [6.5, 10.5] : y < 2014 ? [2.6, 4.2] : null;
  return R ? R[0] + k * (R[1] - R[0]) : t;
}
function v10PitText(txt) {
  if (v10Y() >= 2014 || typeof txt !== "string") return txt;
  const f = m => v10PitT(parseFloat(m)).toFixed(1);
  return txt
    .replace(/(Tu parada en boxes: )(\d+\.\d)s/, (a, p, n) => p + f(n) + "s")
    .replace(/(\(P\d+, )(\d+\.\d)s\)/g, (a, p, n) => p + f(n) + "s)")
    .replace(/(: )(\d+\.\d)(s en boxes)/, (a, p, n, q) => p + f(n) + q)
    .replace(/(parada de )(\d+\.\d)s/, (a, p, n) => p + f(n) + "s")
    .replace(/(Buena parada, )(\d+\.\d)( segundos)?/, (a, p, n, q) => p + f(n) + " segundos")
    .replace(/(¡Qué parada! )(\d+\.\d)( segundos)/, (a, p, n, q) => p + f(n) + q);
}

/* ---------------- 24) plurales · 25) largada repetida · 20) boxes ---------------- */
if (typeof dlFeed === "function") {
  const o = dlFeed;
  dlFeed = function (lap, txt, mine, cls) {
    try {
      if (typeof txt === "string") {
        if (lap === 1 && /^🏁 Largada:/.test(txt) && DL && DL._v10St) return;
        // la parada se cuenta después de la entrada a boxes jugable
        if (/^🔧 Tu parada en boxes/.test(txt) && DL && !DL.skip && DL.mode === "race" && !(DL._pe || {})[lap] && !(DL._v10Flush)) { DL._v10Defer = { lap, txt, mine, cls }; return; }
        if (/^⬆️ .+ y .+ entra a boxes/.test(txt)) txt = txt.replace(" entra a boxes", " entran a boxes");
        if (/^⬆️ .+ y .+ abandonó:/.test(txt)) txt = txt.replace(" abandonó:", " abandonaron:");
        if (/^⬆️ .+ y .+ perdió tiempo en boxes/.test(txt)) txt = txt.replace(" perdió tiempo en boxes", " perdieron tiempo en boxes");
        if (/^⬇️ .+ y .+ te pasó\./.test(txt)) txt = txt.replace(" te pasó.", " te pasaron.");
        txt = v10PitText(txt);
      }
    } catch (e) {}
    return o.call(this, lap, txt, mine, cls);
  };
}
if (typeof dlSay === "function") {
  const o = dlSay;
  dlSay = function (a, b, c) {
    try {
      if (DL && DL._v10St && DL.lap === 1 && /largada/i.test(String(a))) return;
      if (DL && DL._v10Defer && !DL._v10Flush && /^Box, box\. Box, box/.test(String(a))) { DL._v10Defer.say = [a, b, c]; return; }
      a = v10PitText(a);
    } catch (e) {}
    return o.call(this, a, b, c);
  };
}
if (typeof v7StartHit === "function") {
  const o = v7StartHit;
  v7StartHit = function () { try { if (DL) DL._v10St = true; } catch (e) {} return o.apply(this, arguments); };
}
if (typeof fwRadioSay === "function") {
  const o = fwRadioSay;
  fwRadioSay = function (text, who, opt) { try { if (/parada/i.test(String(text))) text = v10PitText(text); } catch (e) {} return o.call(this, text, who, opt); };
}

/* ---------------- 19) Safety Car solo desde 1993 ---------------- */
if (typeof applySafetyCarEvent === "function") {
  applySafetyCarEvent = function () {
    const h = Math.abs(deterministicHash("safetycar_" + s.gp + "_" + s.season)) % 100;
    const on = h < 20;
    if (s.season < 1993) {
      s._safetyCarThisRace = false; s._yellowThisRace = on;
      if (on) add("🟡 Accidente fuerte: doble bandera amarilla en un sector. En " + s.season + " todavía no existe el Safety Car.");
      return;
    }
    s._yellowThisRace = false;
    s._safetyCarThisRace = on;
    if (on) add("🚨 ¡Safety Car en pista! El pelotón se agrupa — cualquier cosa puede pasar en el restart.");
  };
  window.applySafetyCarEvent = applySafetyCarEvent;
}

/* ---------------- 18) límites de pista solo en la era moderna ---------------- */
if (typeof dlExtrasInit === "function") {
  const o = dlExtrasInit;
  dlExtrasInit = function () {
    const r = o.apply(this, arguments);
    try {
      if (s.season < 2017) { DL.tl = { n: 0, laps: [] }; DL.tlRival = 0; }
      if (s._yellowThisRace && s.season < 1993) DL._v10Yellow = Math.max(3, Math.round(DL.N * (0.3 + (dlH("yl" + dlKey()) % 30) / 100)));
    } catch (e) {}
    return r;
  };
}
if (typeof dlLap === "function") {
  const o = dlLap;
  dlLap = function (l) {
    const r = o.apply(this, arguments);
    try { if (DL && DL._v10Defer && DL._v10Defer.lap < l) v10FlushPit(); } catch (e) {}
    try { if (DL && DL._v10Yellow === l) { DL._v10Yellow = 0; dlFeed(l, "🟡 ¡Doble bandera amarilla! Un auto quedó en la pista: prohibido adelantar en ese sector.", false, "blue"); dlSay("Doble amarilla en el sector dos. Levantá y no pases a nadie.", "eng"); } } catch (e) {}
    return r;
  };
}
if (typeof qlFeed === "function") {
  const o = qlFeed;
  qlFeed = function (txt, cls) {
    try { if (v10Y() < 2014 && /por límites de pista/.test(txt)) txt = txt.replace("⚠️ Tiempo borrado a ", "⚠️ Tiempo anulado a ").replace(" por límites de pista.", ": no levantó con bandera amarilla."); } catch (e) {}
    return o.call(this, txt, cls);
  };
}
if (typeof engApplyPenalties === "function" && typeof ENG_PEN_REASONS !== "undefined") {
  const o = engApplyPenalties;
  engApplyPenalties = function () {
    const keep = ENG_PEN_REASONS[0];
    if (v10Y() < 2017) ENG_PEN_REASONS[0] = "Maniobra peligrosa en la frenada";
    try { return o.apply(this, arguments); } finally { ENG_PEN_REASONS[0] = keep; }
  };
}

/* ---------------- 23) clasificación según la época ---------------- */
if (typeof qlSessions === "function") {
  const o = qlSessions;
  qlSessions = function (n) { if (v10Y() < 2006) return [{ id: "Q", k: n, cut: n }]; return o.apply(this, arguments); };
}

/* ---------------- 1) gomas en boxes según tu plan ---------------- */
function dlCompOpts(l, free) {
  const wet = !!(s.weather && s.weather.wet) && DL.wxNow !== "dry";
  const left = (DL.N - l) / DL.N;
  const list = wet ? ["Intermedio", "Lluvia", "Medium"] : ["Soft", "Medium", "Hard"];
  let rec = wet ? (s.weather.label && /fuerte/i.test(s.weather.label) ? "Lluvia" : "Intermedio") : left < 0.35 ? "Soft" : left < 0.6 ? "Medium" : "Hard";
  let fromPlan = false;
  try { const nx = DL._plan && DL._plan[(DL.stints || []).length]; if (!free && nx && list.includes(nx)) { rec = nx; fromPlan = true; } } catch (e) {}
  DL._v10RecPlan = fromPlan;
  return { list, rec, opts: list.map(ty => ({ label: (ty === "Soft" ? "🔴 " : ty === "Medium" ? "🟡 " : ty === "Hard" ? "⚪ " : ty === "Intermedio" ? "🟢 " : "🔵 ") + DL_TY[ty].n, say: "Poneme " + DL_TY[ty].n.toLowerCase() + ".", fx: () => { DL.stints.push({ from: l, ty }); return ty === rec ? 1.5 : (wet !== (ty === "Intermedio" || ty === "Lluvia")) ? -3 : -0.8; }, note: (ty === rec ? "✅ " : "➖ ") + "Pusiste " + DL_TY[ty].n.toLowerCase() + (free ? " para el relanzamiento." : ".") + (ty === rec && fromPlan ? " Como en tu plan." : "") })) };
}

/* ---------------- 4) celular: la radio no tapa las decisiones ---------------- */
function v10DecClass() {
  try {
    const dl = typeof DL !== "undefined" && DL && document.getElementById("dlOverlay")?.classList.contains("show") && !["run", "end", "replay"].includes(DL.phase);
    const en = typeof engLive !== "undefined" && engLive && document.getElementById("engLiveOverlay")?.classList.contains("show") && !["running", "finished", "replay"].includes(engLive.phase);
    const ql = typeof QL !== "undefined" && QL && QL.phase === "dec";
    document.body.classList.toggle("v10-dec", !!(dl || en || ql));
  } catch (e) {}
}
setInterval(v10DecClass, 300);

/* ---------------- 27) el cartel de radio no queda colgado ---------------- */
["dlSkip", "engLiveSkip", "qlSkip"].forEach(n => {
  try {
    const o = window[n]; if (typeof o !== "function") return;
    const w = function () { const r = o.apply(this, arguments); v10HideToast(); return r; };
    if (n === "dlSkip") dlSkip = w; else if (n === "engLiveSkip") engLiveSkip = w; else qlSkip = w;
  } catch (e) {}
});
if (typeof showBigResult === "function") {
  const o = showBigResult;
  showBigResult = function () { v10HideToast(); try { fwRadioStop(); } catch (e) {} return o.apply(this, arguments); };
  window.showBigResult = showBigResult;
}

/* ---------------- 26) prensa: "primer podio" solo si es el primero ---------------- */
if (typeof window.pickPressQuestions === "function") {
  const o = window.pickPressQuestions;
  window.pickPressQuestions = function () {
    const qs = o.apply(this, arguments);
    try {
      const wins = s.wins || 0, pods = s.podiums || 0, ptsRaces = (s._seasonPointFinishes || 0) + (s.season > (s.startSeason || s.season) ? 99 : 0) + pods;
      (qs || []).forEach(q => {
        if (wins > 1) q.q = q.q.replace(/¡Primera gran victoria en ([^!]+)!/, "¡Otra victoria en $1!");
        if (pods > 1) q.q = q.q.replace(/^Primer podio en/, "Otro podio en");
        if (ptsRaces > 1) q.q = q.q.replace(/^Tus primeros puntos en/, "Más puntos en");
      });
    } catch (e) {}
    return qs;
  };
  try { pickPressQuestions = window.pickPressQuestions; } catch (e) {}
}

/* ---------------- 28) no se puede guardar en plena carrera ---------------- */
function v10Busy() {
  try {
    if (typeof DL !== "undefined" && DL && document.getElementById("dlOverlay")?.classList.contains("show")) return true;
    if (typeof engLive !== "undefined" && engLive && engLive.phase !== "finished" && document.getElementById("engLiveOverlay")?.classList.contains("show")) return true;
    if (typeof QL !== "undefined" && QL) return true;
  } catch (e) {}
  return false;
}
if (typeof saveGameToSlot === "function") {
  const o = saveGameToSlot;
  saveGameToSlot = function () {
    if (v10Busy()) { v9Toast("⏸️ Terminá la carrera (o la clasificación) antes de guardar."); return; }
    return o.apply(this, arguments);
  };
  window.saveGameToSlot = saveGameToSlot;
}

/* ---------------- 29) 2 jugadores: equipos distintos ---------------- */
function v10P2Fix() {
  try {
    if (typeof playMode === "undefined" || playMode !== "multi") return;
    const a = document.getElementById("club"), b = document.getElementById("club2");
    if (!a || !b || !b.options.length || a.value !== b.value) return;
    const alt = [...b.options].find(o => o.value !== a.value);
    if (alt) b.value = alt.value;
  } catch (e) {}
}
if (typeof setPlayMode === "function") { const o = setPlayMode; setPlayMode = function () { const r = o.apply(this, arguments); v10P2Fix(); return r; }; window.setPlayMode = setPlayMode; }
if (typeof refreshTeamLists === "function") { const o = refreshTeamLists; refreshTeamLists = function () { const r = o.apply(this, arguments); v10P2Fix(); return r; }; window.refreshTeamLists = refreshTeamLists; }
document.addEventListener("change", e => { if (e.target && (e.target.id === "club" || e.target.id === "club2")) { const a = document.getElementById("club"), b = document.getElementById("club2"); if (a && b && a.value === b.value && typeof playMode !== "undefined" && playMode === "multi") { if (e.target.id === "club") v10P2Fix(); else { const alt = [...a.options].find(o => o.value !== b.value); if (alt) a.value = alt.value; } v9Toast("👥 Cada jugador tiene que tener su propio equipo."); } } });
if (typeof window.start === "function") {
  const o = window.start;
  window.start = function () {
    try {
      const box = document.getElementById("p2teambox");
      if (typeof playMode !== "undefined" && playMode === "multi" && box && !box.classList.contains("hidden")) {
        const a = document.getElementById("club"), b = document.getElementById("club2");
        if (a && b && a.value === b.value) { v10P2Fix(); v9Toast("👥 Los dos jugadores tenían el mismo equipo: al Jugador 2 le pusimos " + b.value + ". Revisalo y tocá Empezar."); b.focus(); return; }
      }
    } catch (e) {}
    return o.apply(this, arguments);
  };
}

/* =============== estrategia: 2) gráfico real · 3) lluvia · 15) carreras cortas · 21) épocas =============== */
function v9WearDrop(ty) { const tw = dlTraits().tireWear || 1; return (DL_TY[ty] || DL_TY.Medium).rate * tw * 52 / Math.max(10, DL.N); }
function v9StratPlans() {
  const N = DL.N, tw = dlTraits().tireWear || 1, y = s.season;
  const wet = !!(s.weather && s.weather.wet), heavy = wet && /fuerte/i.test(s.weather.label || "");
  let P, rec, why, kind = "modern";
  if (wet) {
    kind = "wet";
    P = [{ name: "Intermedios · parar una vez", seq: ["Intermedio", "Intermedio"], f: [0.5] },
      { name: "Lluvia → Intermedios", seq: ["Lluvia", "Intermedio"], f: [0.4] },
      { name: "Intermedios sin parar", seq: ["Intermedio"], f: [] }];
    rec = heavy ? 1 : 0; why = heavy ? "llueve fuerte: arrancá con gomas de lluvia" : "está mojado pero no tanto: intermedios";
  } else if (y < 1982) {
    kind = "old";
    P = [{ name: "Sin paradas · Duros", seq: ["Hard"], f: [] },
      { name: "Sin paradas · Blandos (cuidándolos)", seq: ["Soft"], f: [] },
      { name: "1 parada · Blandos → Blandos", seq: ["Soft", "Soft"], f: [0.5] }];
    rec = 0; why = "en esta época casi nadie para: una parada cuesta muchísimo";
  } else if (y >= 1994 && y <= 2009) {
    kind = "fuel";
    P = [{ name: "1 parada · tanque lleno", seq: ["Medium", "Medium"], f: [0.5] },
      { name: "2 paradas · menos nafta, más rápido", seq: ["Soft", "Medium", "Soft"], f: [0.33, 0.66] },
      { name: "3 paradas · al ataque", seq: ["Soft", "Soft", "Soft", "Soft"], f: [0.25, 0.5, 0.75] }];
    rec = tw >= 1.15 ? 2 : 1; why = "con la carga de nafta, cada parada es para combustible y gomas";
  } else if (N < 25) {
    kind = "short";
    P = [{ name: "1 parada · Medios → Duros", seq: ["Medium", "Hard"], f: [0.45] },
      { name: "1 parada · Blandos → Medios", seq: ["Soft", "Medium"], f: [0.4] },
      { name: "1 parada · Blandos → Duros", seq: ["Soft", "Hard"], f: [0.35] }];
    rec = tw >= 1.15 ? 0 : 1; why = "la carrera es corta: una sola parada";
  } else {
    P = [{ name: "1 parada · Medios → Duros", seq: ["Medium", "Hard"], f: [0.42] },
      { name: "1 parada agresiva · Blandos → Duros", seq: ["Soft", "Hard"], f: [0.3] },
      { name: "2 paradas · Blandos → Medios → Medios", seq: ["Soft", "Medium", "Medium"], f: [0.24, 0.6] }];
    rec = tw >= 1.15 ? 2 : tw <= 0.85 ? 1 : 0;
    why = tw >= 1.15 ? "acá las gomas se gastan mucho" : tw <= 0.85 ? "esta pista casi no gasta gomas" : "el desgaste es normal";
  }
  P.forEach(p => {
    p.pits = p.f.map(x => Math.max(2, Math.min(N - 2, Math.round(N * x))));
    const b = [0].concat(p.pits, [N]); p.curve = []; p.min = 100;
    for (let i = 0; i < p.seq.length; i++) { const d = v9WearDrop(p.seq[i]); for (let l = b[i]; l <= b[i + 1]; l++) p.curve.push([l, Math.max(0, 100 - d * (l - b[i])), p.seq[i]]); p.min = Math.min(p.min, Math.max(0, 100 - d * (b[i + 1] - b[i]))); }
  });
  if (kind !== "old" && P[rec].min < 15) rec = P.reduce((bb, p, i) => p.min > P[bb].min ? i : bb, 0);
  return { P, rec, tw, why, kind };
}
function v9StratOpen() {
  if (!DL || DL.mode !== "race" || DL.skip || !DL.me || DL.me.status === "DNS" || typeof DL_TY === "undefined") return false;
  DL.strat = v9StratPlans();
  DL.phase = "strat";
  clearInterval(dlTimer);
  const R = DL.strat;
  v7Say(dlEngPre() + "Antes de largar: " + R.why + ". Yo haría " + R.P[R.rec].name.split(" · ")[0] + ". Vos decidís.", "eng");
  clearTimeout(DL._stratTO); DL._stratTO = setTimeout(() => { if (DL && DL.phase === "strat") v9StratChoose(DL.strat.rec, true); }, 30000);
  dlDraw();
  return true;
}
function v9StratHtml() {
  const R = DL.strat;
  const lbl = R.kind === "fuel" ? "Goma que te queda en cada tanda (con la nafta, paradas más largas)." : "La línea muestra cuánta goma te queda vuelta a vuelta. Debajo de la línea roja punteada, las gomas se caen.";
  return `<div class="eng-live-dec v9-strat"><div class="q">🧠 ESTRATEGIA · ${DL.N} vueltas <span class="small">desgaste ×${(R.tw || 1).toFixed(2)}</span></div>
    <p class="small">${lbl} Tocá un plan (o las teclas 1, 2 y 3).</p>
    <div class="v9-plans">${R.P.map((p, i) => `<button type="button" class="dark v9-plan ${i === R.rec ? "rec" : ""}" onclick="v9StratChoose(${i})"><b>${i + 1}. ${v9Esc(p.name)}</b>${v9StratSvg(p)}<span class="small">${p.pits.length ? "Boxes: vuelta " + p.pits.join(", ") : "Sin paradas"} · goma mínima ${Math.round(p.min)}%${p.min < 15 ? " ⚠️" : ""}</span>${i === R.rec ? `<i>📻 ${v9Esc(dlEngFirst())} recomienda</i>` : ""}</button>`).join("")}</div></div>`;
}

/* =============== 5) cuenta regresiva · 22) boxes sin límite antes de 1994 =============== */
function v9PitEntryOpen(l) {
  const old = v10Y() < 1994;
  DL.pe = { lap: l, t0: performance.now() + 1500, x: 0, old, zone: old ? [58, 72] : [60, 74], speed: s.miniDiff === "easy" ? 0.032 : s.miniDiff === "hard" ? 0.05 : 0.04 };
  DL.phase = "pitentry";
  dlFeed(l, old ? "🛣️ Entrás a boxes en la vuelta " + l + ". Frená justo para clavar el auto en tu box." : "🛣️ Entrás a boxes en la vuelta " + l + ". Activá el limitador justo antes de la línea.", true);
  v7Say(old ? "Box, box. Frená justo en tu box, los mecánicos te esperan." : "Box, box. Limitador en la línea blanca, ni antes ni después.", "eng");
  cancelAnimationFrame(v9Raf);
  const step = () => {
    const P = DL && DL.pe; if (!P || DL.phase !== "pitentry") return;
    const now = performance.now();
    const cd = document.getElementById("v10PeCd");
    if (now < P.t0) { if (cd) cd.textContent = String(Math.ceil((P.t0 - now) / 500)); }
    else { if (cd && cd.textContent) cd.textContent = ""; P.x = Math.min(100, (now - P.t0) * P.speed); }
    const m = document.getElementById("v9PeCar"); if (m) m.style.left = P.x + "%";
    if (P.x >= 100) { v9PitEntryHit(true); return; }
    v9Raf = requestAnimationFrame(step);
  };
  v9Raf = requestAnimationFrame(step);
  dlDraw();
  return true;
}
function v10FlushPit() {
  const D = DL && DL._v10Defer; if (!D) return;
  DL._v10Defer = null; DL._v10Flush = true;
  try { dlFeed(D.lap, D.txt, D.mine, D.cls); if (D.say) dlSay(D.say[0].replace(/^Box, box\. Box, box\. … /, ""), D.say[1], D.say[2]); } finally { DL._v10Flush = false; }
}
function v9PitEntryHit(timeout) {
  const P = DL && DL.pe; if (!P || DL.phase !== "pitentry") return;
  if (!timeout && performance.now() < P.t0) return; // todavía no arrancó
  cancelAnimationFrame(v9Raf);
  const st = dlState(), l = P.lap;
  let txt, cls, say;
  if (!timeout && P.x < P.zone[0]) { const lost = ((P.zone[0] - P.x) / 25).toFixed(1); st.bonus -= Math.min(1.5, 0.3 + (P.zone[0] - P.x) / 40); txt = "🐢 Frenaste muy temprano para entrar a boxes: perdiste " + lost + "s."; cls = "bad"; say = P.old ? "Frenaste muy lejos del box, perdimos tiempo." : "Muy temprano el limitador, perdimos tiempo."; }
  else if (!timeout && P.x <= P.zone[1]) { st.bonus += 0.6; txt = P.old ? "✅ ¡Clavaste el auto justo en tu box!" : "✅ Entrada a boxes perfecta: limitador justo en la línea."; cls = "ok"; say = P.old ? "Perfecto, justo en el box." : "Perfecto el limitador. Buena entrada."; }
  else if (P.old) { st.bonus -= 1.2; txt = "😬 Te pasaste de tu box: los mecánicos tuvieron que empujar el auto para atrás."; cls = "bad"; say = "¡Te pasaste del box! Perdimos un montón."; }
  else { if (DL.me) st.pens.push({ name: DL.me.name, reason: "Exceso de velocidad en boxes" }); txt = "🚨 ¡Exceso de velocidad en la calle de boxes! +5 segundos."; cls = "bad"; say = "Te pasaste de velocidad en boxes. Cinco segundos de penalización."; }
  dlFeed(l, txt, true, cls);
  v7Say(say, "eng");
  v10FlushPit();
  DL.pe = null; DL.phase = "run";
  DL.compAsked[l] = true;
  dlRebuild();
  if (!dlOpenComp(l, false)) { DL.phase = "run"; dlSchedule(); }
  dlDraw();
}
function v9PitEntryHtml() {
  const P = DL.pe;
  return `<div class="eng-live-dec v9-pe"><div class="q">🛣️ ENTRADA A BOXES · vuelta ${P.lap}</div>
    <p class="small">${P.old ? "Frená en la zona blanca para parar justo en tu box. Temprano perdés tiempo; tarde, te pasás." : "Activá el limitador en la zona blanca. Muy temprano perdés tiempo; tarde, te multan."}</p>
    <div class="v9-lane"><i class="z" style="left:${P.zone[0]}%;width:${P.zone[1] - P.zone[0]}%"></i>${P.old ? "" : `<span class="v9-line" style="left:${P.zone[1]}%"></span>`}<b id="v9PeCar" style="left:${P.x}%">🏎️</b><em id="v10PeCd" class="v10-cd"></em></div>
    <button type="button" class="lv-btn red" onclick="v9PitEntryHit(false)">${P.old ? "🛑 ¡FRENÁ!" : "🅿️ ¡LIMITADOR!"} <kbd>Espacio</kbd></button></div>`;
}

/* =============== 6) repetición también de las defensas =============== */
if (typeof v7QteFinish === "function") {
  const o = v7QteFinish;
  v7QteFinish = function (ok, auto) {
    const Q = DL && DL.qte, info = Q ? { lap: Q.lap, other: Q.other, atk: Q.atk } : null;
    const r = o.apply(this, arguments);
    try { if (info && !auto && ok && !info.atk && DL && DL.phase === "run") v9ReplayStart(info.lap, "defendés de " + dlShort(info.other)); } catch (e) {}
    return r;
  };
}

/* =============== 7) repetición en el mapa del ingeniero · 16) sin ataques en la vuelta de boxes =============== */
function v9AtkCheck(L) {
  if (!L || L.phase !== "running" || L.skip || !L.lapData) return;
  L._atkN = L._atkN || 0;
  if (L._atkN >= 2) return;
  const marks = [Math.round(L.T * 0.33), Math.round(L.T * 0.6)];
  const m = marks[L._atkN];
  if (L.tick < m) return;
  if (L.tick > m + 6) { L._atkN++; return; }
  const d = L.lapData, N = d.N, cur = Math.min(N, Math.floor(L.tick / L.T * N));
  if (cur < 2 || cur >= N - 6) { L._atkN++; return; }
  const near = (r) => r.pits.some(p => p >= cur - 1 && p <= cur + 2);
  const mine = d.rows.filter(r => r.mine && r.t.length > cur && r.status !== "DNS" && !near(r)).sort((a, b) => a.pos[cur] - b.pos[cur]);
  for (const me of mine) {
    const p = me.pos[cur];
    const ahead = d.rows.find(r => r.pos[cur] === p - 1 && !r.mine && r.t.length >= cur);
    if (!ahead || near(ahead)) continue;
    const gap = me.cum[cur - 1] - ahead.cum[cur - 1];
    if (gap > 0 && gap < 1.8) {
      L._atkN++;
      const side = engH("v9atk" + L.key + L._atkN) % 2 ? "in" : "out";
      L.atk = { seat: me.seat, name: me.name, other: ahead.name, side, lap: cur, step: "side", x: 0, v: 1, t0: performance.now(), speed: s.miniDiff === "easy" ? 0.55 : s.miniDiff === "hard" ? 1.05 : 0.8 };
      L.phase = "atkgame";
      L.feed.push({ lap: cur, txt: "🎯 " + me.name + " está a " + gap.toFixed(1) + "s de " + ahead.name + ". ¡Dale la orden de ataque!", mine: true });
      try { fwRadioSay("Lo tengo a tiro. Está cerrando " + (side === "in" ? "el interior" : "el exterior") + ". ¿Por dónde voy?", "drv", { priority: true }); } catch (e) {}
      clearTimeout(L._atkTO); L._atkTO = setTimeout(() => { if (engLive === L && L.phase === "atkgame") v9AtkFinish(false, true); }, 15000);
      engLiveDraw();
      return;
    }
  }
}
function v10EngReplay(L, lap, label) {
  if (!L || L.skip || !L.lapData) return;
  const now = performance.now();
  L._replay = { from: Math.max(0, lap - 0.9), to: Math.min(L.lapData.N, lap + 0.15), t0: now, until: now + 3300, label };
  L.phase = "replay";
  clearTimeout(L._replayTO);
  L._replayTO = setTimeout(() => v10EngReplayEnd(L), 3300);
  engLiveDraw();
}
function v10EngReplayEnd(L) {
  L = L || engLive; if (!L) return;
  clearTimeout(L._replayTO); L._replay = null;
  document.querySelectorAll("#engMap .v9-replay").forEach(x => x.remove());
  if (L.phase === "replay") { L.phase = "running"; engLiveDraw(); }
}
if (typeof v9AtkFinish === "function") {
  const o = v9AtkFinish;
  v9AtkFinish = function (ok, auto) {
    const L = engLive, A = L && L.atk, info = A ? { lap: A.lap, other: A.other, name: A.name } : null;
    const r = o.apply(this, arguments);
    try { if (info && ok && !auto && L.phase === "running") v10EngReplay(L, info.lap, typeof lapShort === "function" ? lapShort(info.name) + " pasa a " + lapShort(info.other) : info.name); } catch (e) {}
    return r;
  };
}
if (typeof fwMapDraw === "function") {
  const o = fwMapDraw;
  fwMapDraw = function (host, data, tLap) {
    try {
      const R = typeof engLive !== "undefined" && engLive && engLive._replay;
      if (R && host && host.id === "engMap" && performance.now() < R.until) {
        tLap = R.from + (R.to - R.from) * (((performance.now() - R.t0) % 1650) / 1650);
        if (!host.querySelector(".v9-replay")) host.insertAdjacentHTML("beforeend", `<div class="v9-replay">🎬 REPETICIÓN · ${v9Esc(R.label || "")}</div>`);
      }
    } catch (e) {}
    return o.call(this, host, data, tLap);
  };
}
(function () {
  if (typeof engLiveDraw === "function") {
    const o = engLiveDraw;
    engLiveDraw = function () {
      const r = o.apply(this, arguments);
      try { const L = engLive, box = document.getElementById("engLiveDecision"); if (L && box && L.phase === "replay") box.innerHTML = `<div class="eng-live-dec v9-rp"><div class="q">🎬 Repetición en el mapa…</div><button type="button" class="lv-btn" onclick="v10EngReplayEnd()">⏭ Seguir</button></div>`;
        // 20) tiempos de parada del ingeniero según la época
        if (L && v10Y() < 2014) L.feed.forEach(f => { if (!f._v10 && typeof f.txt === "string") { f._v10 = 1; f.txt = v10PitText(f.txt); } });
      } catch (e) {}
      return r;
    };
  }
  if (typeof engLiveSkip === "function") {
    const o = engLiveSkip;
    engLiveSkip = function () { const L = engLive; if (L && L.phase === "replay") { clearTimeout(L._replayTO); L._replay = null; L.phase = "running"; } return o.apply(this, arguments); };
  }
})();

/* =============== 8) saltar durante la estrategia queda anotado =============== */
if (typeof dlSkip === "function") {
  const o = dlSkip;
  dlSkip = function () {
    try { if (DL && DL.phase === "strat" && DL.strat) { const p = DL.strat.P[DL.strat.rec]; DL.pits = p.pits.slice(); if (DL.stints && DL.stints[0]) DL.stints[0].ty = p.seq[0]; DL._plan = p.seq.slice(); dlFeed(0, "🧠 Saltaste la estrategia: tu ingeniero eligió " + p.name + ".", true); try { dlRebuild(); } catch (e) {} } } catch (e) {}
    return o.apply(this, arguments);
  };
}

/* =============== 14) teclas de la estrategia sin choques =============== */
window.addEventListener("keydown", ev => {
  try {
    if (typeof DL === "undefined" || !DL || DL.phase !== "strat" || !document.getElementById("dlOverlay")?.classList.contains("show")) return;
    if (["1", "2", "3"].includes(ev.key)) { ev.preventDefault(); ev.stopImmediatePropagation(); v9StratChoose(+ev.key - 1); }
    else if (!["Tab", "Shift", "Alt", "Control", "Meta"].includes(ev.key)) ev.stopImmediatePropagation();
  } catch (e) {}
}, true);

/* =============== 9) tarjeta de temporada con el historial · 10) constructores =============== */
function v9SeasonData() {
  const S = s._v9Season && s._v9Season.season === s.season ? s._v9Season : { wins: 0, pods: 0, races: 0 };
  const drv = s.playerMode === "driver";
  const lineup = (typeof myTeamLineup === "function" ? myTeamLineup() : []) || [];
  const base = (s.playedDriverName || "").replace(" (reserva)", "");
  let wins = 0;
  try { wins = drv ? (s.driverWins || {})[base] || 0 : lineup.reduce((a, d) => a + ((s.driverWins || {})[d.name.replace(" (reserva)", "")] || 0), 0); } catch (e) {}
  wins = Math.max(wins, S.wins || 0);
  const pods = Math.max(s._seasonPodiums || 0, S.pods || 0, wins);
  const races = Math.max(S.races || 0, s.shortSeason && typeof V4_SHORT !== "undefined" ? V4_SHORT.filter(g => g <= s.gp).length : s.gp + 1);
  let champ = "—";
  try {
    if (drv) { const arr = Object.entries(s.driverPoints || {}).sort((a, b) => b[1] - a[1]); const i = arr.findIndex(x => x[0] === base); if (i >= 0) champ = "P" + (i + 1); }
    else {
      const st = Object.assign({}, s.teamStandings || {}); st[s.team] = Math.max(st[s.team] || 0, s.points || 0);
      const i = Object.entries(st).sort((a, b) => b[1] - a[1]).findIndex(x => x[0] === s.team); if (i >= 0) champ = "P" + (i + 1);
    }
  } catch (e) {}
  const best = S.best ? "P" + S.best.pos + " en " + S.best.trk : wins ? wins + " victoria" + (wins > 1 ? "s" : "") + " en el año" : pods ? pods + " podio" + (pods > 1 ? "s" : "") + " en el año" : (s._seasonPointFinishes ? s._seasonPointFinishes + " carreras en los puntos" : "—");
  return { season: S.season || s.season, name: drv ? (s.playedDriverName || "") : (s.team || ""), team: s.team, drv, pts: s.points || 0, champ, wins, pods, races, best, col: (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600" };
}

/* =============== 11) la voz no se pisa · 12) aviso si la voz está apagada =============== */
function v9PressSayNext() {
  try {
    const ov = document.getElementById("pressOverlay");
    if (!ov || !ov.classList.contains("show")) return;
    if (!fwRadioOn()) {
      const card = ov.querySelector(".press-card");
      if (card && !card.querySelector(".v10-mute")) { const n = document.createElement("p"); n.className = "small v10-mute"; n.innerHTML = "🔇 La voz está apagada: activá <b>🎙️ Voz radio</b> (o el sonido) para escuchar al periodista."; const q = card.querySelector("#pressQuestions"); card.insertBefore(n, q); }
      return;
    }
    const ans = window.pressAnswers || [];
    const qs = [...document.querySelectorAll("#pressQuestions .press-question h3")];
    const i = ans.findIndex(a => !a);
    if (i < 0 || !qs[i]) return;
    const q = qs[i].textContent.replace(/^\d+\.\s*/, "");
    fwRadioSay((i === 0 ? "Pregunta para " + (s.playerMode === "driver" ? (s.playedDriverName || "vos").split(" ").slice(-1)[0] : "el equipo") + ". " : "") + q, "press", { toast: false, priority: true });
  } catch (e) {}
}
if (typeof answerPress === "function") {
  const o = answerPress;
  answerPress = function () { try { fwRadioStop(); } catch (e) {} return o.apply(this, arguments); };
}
if (typeof showPress === "function") {
  const o = showPress;
  showPress = function () { v10HideToast(); return o.apply(this, arguments); };
}

/* =============== 13) sin lugar para guardar: elegir qué borrar =============== */
function v10SaveList() {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(SAVE_PREFIX) === 0) { const v = localStorage.getItem(k) || ""; let m = {}; try { m = JSON.parse(v).meta || {}; } catch (e) {} out.push({ k, kb: Math.round(v.length / 1024), m }); } } } catch (e) {}
  return out.sort((a, b) => b.kb - a.kb);
}
function v10SpaceOpen() {
  let ov = document.getElementById("v10Space");
  if (!ov) { ov = document.createElement("div"); ov.id = "v10Space"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  const L = v10SaveList();
  ov.innerHTML = `<div class="v9-qe-card"><div class="hof-k">💾 SIN LUGAR PARA GUARDAR</div><p class="small">El navegador se quedó sin espacio. Borrá alguna partida vieja y el juego vuelve a guardar solo.</p>
    <div class="v10-saves">${L.length ? L.map(x => `<div><span><b>${v9Esc(x.m.name || "Partida")}</b> · ${v9Esc(x.m.team || "")} · ${x.m.season || ""}<br><i class="small">${/_auto$/.test(x.k) ? "Autoguardado" : "Ranura " + (parseInt(x.k.split("_").pop(), 10) + 1)} · ${x.kb} KB</i></span><button type="button" class="lv-btn" onclick="v10SpaceDel('${x.k}')">🗑️ Borrar</button></div>`).join("") : `<p class="small">No hay partidas guardadas: el espacio lo ocupa otra cosa del navegador.</p>`}</div>
    <div class="v6-res-btns"><button type="button" class="lv-btn red" onclick="document.getElementById('v10Space').classList.remove('show');v3AutoSave()">💾 Reintentar</button><button type="button" class="lv-btn" onclick="document.getElementById('v10Space').classList.remove('show')">Cerrar</button></div></div>`;
  ov.classList.add("show");
}
function v10SpaceDel(k) { if (!confirm("¿Borrar esta partida guardada? No se puede deshacer.")) return; try { localStorage.removeItem(k); } catch (e) {} v10SpaceOpen(); }
if (typeof v3AutoSave === "function") {
  v3AutoSave = function () {
    try {
      if (!v3Game() || s.gameOver || typeof saveSlotKey !== "function") return;
      if (Array.isArray(s.log) && s.log.length > 80) s.log = s.log.slice(-80);
      const mode = s.playerMode || "engineer", k = saveSlotKey(mode, "auto");
      const txt = JSON.stringify({ state: s, meta: { name: s.playerMode === "driver" ? (s.playedDriverName || s.name) : s.name, team: s.team, season: s.season, gp: s.gp, points: s.points, savedAt: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) } });
      try { localStorage.setItem(k, txt); }
      catch (e) {
        try { localStorage.removeItem(k); localStorage.setItem(k, txt); }
        catch (e2) { v9Toast("⚠️ No hay lugar para autoguardar."); v10SpaceOpen(); return; }
      }
      v9Toast("💾 Autoguardado");
    } catch (e) { console.warn("[FAWIWE] autoguardado:", e); }
  };
}

/* =============== 17) tutorial en pestañas =============== */
function v10TutTab(t) {
  document.querySelectorAll("#v10Tut .v10-tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  document.querySelectorAll("#v10Tut .v10-page").forEach(p => p.classList.toggle("hidden", p.dataset.t !== t));
}
function v10TutBuild() {
  try {
    const t = document.getElementById("tutorial"), a = document.getElementById("v5Tut"), b = document.getElementById("v9Tut");
    if (!t || !a || !b || document.getElementById("v10Tut")) return;
    const pages = { drv: [], eng: [], menu: [] };
    const kids = [...a.children];
    for (let i = 0; i < kids.length; i++) {
      const el = kids[i]; if (el.tagName !== "H3") continue;
      const ul = kids[i + 1] && kids[i + 1].tagName === "UL" ? kids[i + 1] : null;
      const h = el.textContent;
      const where = /ingeniero/i.test(h) ? "eng" : /Transmisión|Clasificación/i.test(h) ? "drv" : "menu";
      pages[where].push(el.outerHTML + (ul ? ul.outerHTML : ""));
    }
    const lis = [...b.querySelectorAll("li")];
    const engLis = lis.filter(li => /Ingeniero/.test(li.textContent)).map(li => li.outerHTML).join("");
    const menuLis = lis.filter(li => /Tarjeta de temporada/.test(li.textContent)).map(li => li.outerHTML).join("");
    const drvLis = lis.filter(li => !/Ingeniero|Tarjeta de temporada/.test(li.textContent)).map(li => li.outerHTML).join("");
    pages.drv.unshift(`<h3>🚦 En la carrera</h3><ul>${drvLis}</ul>`);
    if (engLis) pages.eng.push(`<h3>⚔️ Órdenes de ataque</h3><ul>${engLis}</ul>`);
    if (menuLis) pages.menu.push(`<h3>📸 Para compartir</h3><ul>${menuLis}</ul>`);
    const tabs = [["drv", "🏎️ Piloto"], ["eng", "🔧 Ingeniero"], ["menu", "🗂️ Menú y carrera"]];
    const html = `<div id="v10Tut"><h3>🆕 Lo nuevo de la carrera</h3><div class="v10-tabs" role="tablist">${tabs.map(([k, l], i) => `<button type="button" class="dark ${i ? "" : "on"}" data-t="${k}" onclick="v10TutTab('${k}')">${l}</button>`).join("")}</div>${tabs.map(([k], i) => `<div class="v10-page ${i ? "hidden" : ""}" data-t="${k}">${pages[k].join("")}</div>`).join("")}</div>`;
    const intro = t.querySelector(":scope > p.small") || t.querySelector(":scope > h2");
    if (intro) intro.insertAdjacentHTML("afterend", html); else a.insertAdjacentHTML("beforebegin", html);
    a.style.display = "none"; b.style.display = "none";
  } catch (e) { console.warn("[FAWIWE] tutorial:", e); }
}
(function () {
  if (document.readyState !== "loading") v10TutBuild(); else document.addEventListener("DOMContentLoaded", v10TutBuild);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { v10TutBuild(); } catch (e) {} return r; }; window.render = render; }
})();

/* =============== 🏁 grillas completas en las temporadas viejas =============== */
// años en los que aparece cada piloto en los datos: para no poner a nadie fuera de su época
let V10_SPAN = null;
function v10Eligible(name, y) {
  if (!V10_SPAN) { V10_SPAN = {}; try { Object.keys(driversByYear).forEach(k => driversByYear[k].forEach(d => { const yy = +k, sp = V10_SPAN[d[0]] || (V10_SPAN[d[0]] = [yy, yy]); sp[0] = Math.min(sp[0], yy); sp[1] = Math.max(sp[1], yy); })); } catch (e) {} }
  const sp = V10_SPAN[name]; if (!sp) return true;
  return y >= sp[0] - 2 && y <= sp[1] + 3;
}
// Algunos años solo tenían cargados "equipos de leyenda" (1 o 2) y el juego armaba una grilla de 2 a 4 autos.
// Ahora esos equipos se suman a la grilla completa más cercana.
(function () {
  if (typeof teamsByYear === "undefined" || typeof driversByYear === "undefined") return;
  const big = Object.keys(teamsByYear).map(Number).filter(y => teamsByYear[y].length >= 6 && driversByYear[y] && driversByYear[y].length >= 12);
  const thin = Object.keys(teamsByYear).map(Number).filter(y => !big.includes(y));
  const cache = {};
  function build(y) {
    if (cache[y]) return cache[y];
    const B = big.slice().sort((a, b) => Math.abs(a - y) - Math.abs(b - y) || a - b)[0];
    const T = teamsByYear[B].slice(), D = (driversByYear[B] || []).slice();
    const names = new Set(D.map(d => d[0]));
    const allYears = Object.keys(driversByYear).map(Number);
    const ok = n => v10Eligible(n, y);
    const legends = thin.filter(L => Math.abs(L - y) <= 3).sort((a, b) => Math.abs(a - y) - Math.abs(b - y));
    const SUCC = { "Prost Grand Prix": "Prost", "Stewart Grand Prix": "Jaguar Racing", "Footwork": "Arrows", "Sauber Clásico": "Sauber", "Toleman": "Benetton" };
    legends.forEach(L => {
      teamsByYear[L].forEach(tm => {
        const sc = SUCC[tm[0]];
        if (T.length >= 13 || T.some(x => x[0] === tm[0])) return;
        const dl = (driversByYear[L] || []).filter(d => d[3] === tm[0]);
        if (dl.length < 2 || !dl.every(d => ok(d[0]))) return;
        // un piloto no puede estar en dos equipos: se va al de leyenda y su equipo anterior busca reemplazo DE LA MISMA ÉPOCA
        const nk = n => String(n).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const plan = [], used = new Set([...names].map(nk));
        dl.forEach(d => used.add(nk(d[0])));
        let okAll = true;
        dl.forEach(d => {
          const i = D.findIndex(x => x[0] === d[0]);
          if (i < 0) return;
          const team = D[i][3];
          const near = r => allYears.filter(yy => Math.abs(yy - y) <= r).sort((a, b) => Math.abs(a - y) - Math.abs(b - y));
          let rep = near(4).map(yy => (driversByYear[yy] || []).find(x => x[3] === team && !used.has(nk(x[0])) && ok(x[0]))).find(Boolean);
          if (!rep) rep = near(6).filter(yy => yy <= y + 2).map(yy => (driversByYear[yy] || []).find(x => !used.has(nk(x[0])) && ok(x[0]))).find(Boolean);
          if (!rep && typeof generateRookieName === "function") { let nm = generateRookieName(team + "_" + y + "_" + d[0]), k = 0; while (used.has(nk(nm)) && k < 20) nm = generateRookieName(team + "_" + y + "_" + d[0] + "_" + (++k)); rep = [nm, 74, 4, team]; }
          if (!rep) { okAll = false; return; }
          used.add(nk(rep[0]));
          plan.push([D[i], [rep[0], rep[1], rep[2], team]]);
        });
        if (!okAll) return;
        if (sc && Math.abs(L - y) <= Math.abs(B - y)) { const k = T.findIndex(x => x[0] === sc); if (k >= 0) { T.splice(k, 1); for (let j = D.length - 1; j >= 0; j--) if (D[j][3] === sc) { names.delete(D[j][0]); D.splice(j, 1); } } }
        plan.forEach(([old, rep]) => { const j = D.indexOf(old); if (j >= 0) { names.delete(old[0]); D[j] = rep; names.add(rep[0]); } });
        T.push(tm); dl.forEach(d => { if (!D.some(x => x[0] === d[0])) { D.push(d); names.add(d[0]); } });
      });
    });
    // un equipo sin dos pilotos no puede correr
    for (let k = T.length - 1; k >= 0; k--) if (D.filter(d => d[3] === T[k][0]).length < 2) { const nm = T[k][0]; T.splice(k, 1); for (let j = D.length - 1; j >= 0; j--) if (D[j][3] === nm) D.splice(j, 1); }
    return (cache[y] = { T, D });
  }
  const clampY = year => Math.max(typeof MIN_SEASON_YEAR !== "undefined" ? MIN_SEASON_YEAR : 1950, Math.min(2026, year | 0));
  if (typeof getTeamsForYear === "function") {
    const o = getTeamsForYear;
    getTeamsForYear = function (year) {
      const y = clampY(year); const n = nearestAvailableYear(teamsByYear, y);
      const T = big.includes(n) ? o.apply(this, arguments) : build(y).T;
      // tu equipo siempre está en la grilla de tu temporada, aunque ese año no figure
      try { if (typeof s !== "undefined" && s && s.team && s.season === y && !s.player2 && !T.some(t => t[0] === s.team)) { const yy = Object.keys(teamsByYear).map(Number).filter(k => teamsByYear[k].some(t => t[0] === s.team)).sort((a, b) => Math.abs(a - y) - Math.abs(b - y))[0]; const tm = yy != null ? teamsByYear[yy].find(t => t[0] === s.team) : [s.team, 2.5]; return T.concat([tm]); } } catch (e) {}
      return T;
    };
    window.getTeamsForYear = getTeamsForYear;
  }
  if (typeof getDriversForYear === "function") {
    const o = getDriversForYear;
    getDriversForYear = function (year) {
      const y = clampY(year); const n = nearestAvailableYear(teamsByYear, y);
      const D = big.includes(n) ? o.apply(this, arguments) : build(y).D;
      try {
        if (typeof s !== "undefined" && s && s.team && s.season === y && !s.player2 && !D.some(d => d[3] === s.team) && typeof lastKnownLineup === "function") {
          const add = lastKnownLineup(s.team, y).filter(d => !D.some(x => x[0] === d[0]));
          if (add.length) return D.concat(add);
        }
      } catch (e) {}
      return D;
    };
    window.getDriversForYear = getDriversForYear;
  }
})();

/* =============== un piloto, un solo equipo (mercado entre temporadas) =============== */
function v10Dedupe() {
  try {
    const O = s && s.rosterOverrides; if (!O) return 0;
    const nk = n => String(n).replace(" (reserva)", "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const seen = new Map(); let fixed = 0;
    const mine = s.team;
    const order = Object.keys(O).sort((a, b) => (a === mine ? -1 : b === mine ? 1 : 0));
    order.forEach(team => (O[team] || []).forEach(d => { if (Array.isArray(d) && !seen.has(nk(d[0]))) seen.set(nk(d[0]), team); }));
    const used = new Set(seen.keys());
    try { getDriversForYear(s.season).forEach(d => { if (!Object.values(O).some(L => (L || []).some(x => x[3] === d[3]))) used.add(nk(d[0])); }); } catch (e) {}
    order.forEach(team => {
      (O[team] || []).forEach((d, i, L) => {
        if (!Array.isArray(d) || /reserva/i.test(d[0])) return;
        if (seen.get(nk(d[0])) === team) return;
        const yrs = Object.keys(driversByYear).map(Number).filter(yy => Math.abs(yy - s.season) <= 6 && yy <= s.season + 2).sort((a, b) => Math.abs(a - s.season) - Math.abs(b - s.season));
        let rep = yrs.map(yy => driversByYear[yy].find(x => x[3] === team && !used.has(nk(x[0])) && v10Eligible(x[0], s.season))).find(Boolean)
          || yrs.map(yy => driversByYear[yy].find(x => !used.has(nk(x[0])) && v10Eligible(x[0], s.season))).find(Boolean);
        if (!rep && typeof generateRookieName === "function") { let nm = generateRookieName(team + "_" + s.season + "_" + i), k = 0; while (used.has(nk(nm)) && k < 20) nm = generateRookieName(team + "_" + s.season + "_" + i + "_" + (++k)); rep = [nm, 74, 4, team]; }
        if (!rep) return;
        L[i] = [rep[0], rep[1], rep[2], team];
        used.add(nk(rep[0])); seen.set(nk(rep[0]), team); fixed++;
      });
    });
    return fixed;
  } catch (e) { return 0; }
}
if (typeof simulateGrid === "function") {
  const o = simulateGrid;
  simulateGrid = function () { v10Dedupe(); return o.apply(this, arguments); };
  window.simulateGrid = simulateGrid;
}

/* =============== carrera rápida: el piloto elegido siempre existe en ese año =============== */
if (typeof v6QuickStart === "function") {
  const o = v6QuickStart;
  v6QuickStart = function () {
    try { const Q = window._v6Q; if (Q && typeof v6QuickDrivers === "function") { const L = v6QuickDrivers(Q.year); if (!L.includes(Q.drv)) Q.drv = L[0]; } } catch (e) {}
    return o.apply(this, arguments);
  };
}
