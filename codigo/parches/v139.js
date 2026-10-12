/* =====================================================================================
   FAWIWE · V139
   🧠 pantalla de estrategia antes de la largada · 🛣️ entrada a boxes jugable (piloto)
   ⚔️ órdenes de ataque jugables (ingeniero) · 🎬 repetición del pase en el mapa
   📸 tarjeta de temporada · 🎤 voz del periodista en la conferencia de prensa
   + arreglos: una sola largada, carrera rápida que termina, autoguardado, voz a x3,
     tutorial, rendimiento de tarjetas, opción para saltar la presentación de TV.
   ===================================================================================== */
function v9Esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function v9Toast(t) {
  let el = document.getElementById("v3Saved");
  if (!el) { el = document.createElement("div"); el.id = "v3Saved"; document.body.appendChild(el); }
  el.textContent = t; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
}
function v9Key() { return s.season + "_" + s.gp; }
let v9Raf = null;

/* ============================ 🎤 voz del periodista ============================ */
try { FW_WHO.press = { tag: "🎤 PERIODISTA", color: "#a78bfa", pitch: 1.0, rate: 1.05, v: 1 }; } catch (e) {}
function v9PressSayNext() {
  try {
    const ov = document.getElementById("pressOverlay");
    if (!ov || !ov.classList.contains("show")) return;
    const ans = window.pressAnswers || [];
    const qs = [...document.querySelectorAll("#pressQuestions .press-question h3")];
    const i = ans.findIndex(a => !a);
    if (i < 0 || !qs[i]) return;
    const q = qs[i].textContent.replace(/^\d+\.\s*/, "");
    fwRadioSay((i === 0 ? "Pregunta para " + (s.playerMode === "driver" ? (s.playedDriverName || "vos").split(" ").slice(-1)[0] : "el equipo") + ". " : "") + q, "press", { toast: false, priority: true });
  } catch (e) {}
}
if (typeof showPress === "function") {
  const o = showPress;
  showPress = function () { const r = o.apply(this, arguments); setTimeout(v9PressSayNext, 700); return r; };
}
if (typeof answerPress === "function") {
  const o = answerPress;
  answerPress = function () { const r = o.apply(this, arguments); setTimeout(v9PressSayNext, 1300); return r; };
}
if (typeof closePress === "function") {
  const o = closePress;
  closePress = function () { try { fwRadioStop(); } catch (e) {} return o.apply(this, arguments); };
}

/* ============================ 🔇 voz a x3: solo cartel ============================ */
if (typeof fwRadioSay === "function") {
  const o = fwRadioSay;
  fwRadioSay = function (text, who, opt) {
    opt = opt || {};
    try {
      const fastDL = typeof DL !== "undefined" && DL && DL.speed > 1 && DL.phase === "run";
      const fastEng = typeof engLive !== "undefined" && engLive && engLive.speed > 1 && engLive.phase === "running";
      if ((fastDL || fastEng) && !opt.priority) { if (opt.toast !== false && text) fwRadioToast(text, who); return; }
    } catch (e) {}
    return o.call(this, text, who, opt);
  };
}

/* ============================ ⚡ rendimiento: tarjetas sin redibujar ============================ */
if (typeof v3Card === "function") {
  v3Card = function (id, html, on, anchorSel, before) {
    let card = document.getElementById(id);
    if (!card && on) {
      const anchor = document.querySelector(anchorSel) || document.getElementById("jobCard");
      if (!anchor || !anchor.parentNode) return;
      card = document.createElement("div"); card.id = id; card.className = "card";
      anchor.parentNode.insertBefore(card, before ? anchor : anchor.nextSibling);
    }
    if (!card) return;
    card.classList.toggle("hidden", !on);
    if (on) { const h = html(); if (card._v9h !== h) { card.innerHTML = h; card._v9h = h; } }
  };
}

/* ============================ 💾 autoguardado sin errores silenciosos ============================ */
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
        catch (e2) { v9Toast("⚠️ El navegador no tiene lugar para autoguardar. Borrá partidas viejas en «Cargar partida»."); return; }
      }
      v9Toast("💾 Autoguardado");
    } catch (e) { console.warn("[FAWIWE] autoguardado:", e); }
  };
}

/* ============================ 📺 opción: saltar la presentación de TV ============================ */
if (typeof v4A11yHtml === "function") {
  const o = v4A11yHtml;
  v4A11yHtml = function () {
    const h = o.apply(this, arguments), A = v4A11y();
    return h.replace(/<\/div>\s*$/, `<label class="ng-check"><input type="checkbox" ${A.noTv ? "checked" : ""} onchange="v4A11ySet('noTv', this.checked)"> <span>Saltar la presentación de TV antes de cada carrera</span></label></div>`);
  };
}
if (typeof v4A11yApply === "function") {
  const o = v4A11yApply;
  v4A11yApply = function () { const r = o.apply(this, arguments); try { window.FW_NO_PRESHOW = !!v4A11y().noTv; } catch (e) {} return r; };
  try { window.FW_NO_PRESHOW = !!v4A11y().noTv; } catch (e) {}
}

/* ============================ 🏁 carrera rápida: termina ahí ============================ */
function v9QuickEnd() {
  let ov = document.getElementById("v9QuickEnd");
  if (!ov) { ov = document.createElement("div"); ov.id = "v9QuickEnd"; document.body.appendChild(ov); }
  const me = (s._v4Grid || []).find(e => (myTeamLineup() || []).some(d => d.name === e.name && d.seat === 1)) || {};
  ov.innerHTML = `<div class="v9-qe-card"><div class="hof-k">🏁 CARRERA RÁPIDA TERMINADA</div>
    <h2>${v9Esc((trackData[s.gp] || {}).name || "")} ${s.season}</h2>
    <p class="v9-qe-pos">${me.status ? v9Esc(me.status) : me.pos ? "P" + me.pos : ""}</p>
    <p class="small">La carrera rápida es una sola carrera. ¿Qué hacemos?</p>
    <div class="v6-res-btns"><button type="button" class="lv-btn red" onclick="document.getElementById('v9QuickEnd').classList.remove('show');v6QuickOpen()">🔁 Otra carrera rápida</button><button type="button" class="lv-btn" onclick="v6Share()">📸 Tarjeta</button><button type="button" class="lv-btn" onclick="document.getElementById('v9QuickEnd').classList.remove('show');v7BackToMenu()">🏠 Menú</button></div></div>`;
  ov.classList.add("show");
}
if (typeof nextGP === "function") {
  const o = nextGP;
  nextGP = function () {
    if (s.quickRace && s.raceDone && !s.player2) { v9QuickEnd(); return; }
    return o.apply(this, arguments);
  };
}

/* ============================ 🚦 una sola largada por carrera ============================ */
if (typeof window.emRace === "function") {
  const o = window.emRace;
  window.emRace = function () { try { s._rdStart = v9Key(); } catch (e) {} return o.apply(this, arguments); };
}

/* ============================ 🧠 PANTALLA DE ESTRATEGIA ============================ */
function v9WearDrop(ty) { const tw = dlTraits().tireWear || 1; return DL_TY[ty].rate * tw * 60 / Math.max(10, DL.N); }
function v9StratPlans() {
  const N = DL.N, tw = dlTraits().tireWear || 1;
  const P = [
    { name: "1 parada · Medios → Duros", seq: ["Medium", "Hard"], f: [0.42] },
    { name: "1 parada agresiva · Blandos → Duros", seq: ["Soft", "Hard"], f: [0.3] },
    { name: "2 paradas · Blandos → Medios → Medios", seq: ["Soft", "Medium", "Medium"], f: [0.24, 0.6] }
  ];
  P.forEach(p => {
    p.pits = p.f.map(x => Math.max(2, Math.min(N - 2, Math.round(N * x))));
    const b = [0].concat(p.pits, [N]); p.curve = []; p.min = 100;
    for (let i = 0; i < p.seq.length; i++) { const d = v9WearDrop(p.seq[i]); for (let l = b[i]; l <= b[i + 1]; l++) { const w = Math.max(0, 100 - d * (l - b[i])); p.curve.push([l, w, p.seq[i]]); } p.min = Math.min(p.min, Math.max(0, 100 - d * (b[i + 1] - b[i]))); }
  });
  let rec = tw >= 1.15 ? 2 : tw <= 0.85 ? 1 : 0;
  if (P[rec].min < 15) rec = P.reduce((b, p, i) => p.min > P[b].min ? i : b, 0);
  return { P, rec, tw };
}
function v9StratSvg(p) {
  const W = 220, H = 64, N = DL.N;
  let segs = "", prev = null;
  p.curve.forEach(([l, w, ty]) => { const x = (l / N * W).toFixed(1), y = (H - w / 100 * H).toFixed(1); if (prev && prev[2] === ty) segs += `<line x1="${prev[0]}" y1="${prev[1]}" x2="${x}" y2="${y}" stroke="${DL_TY[ty].c}" stroke-width="2.5" stroke-linecap="round"/>`; prev = [x, y, ty]; });
  const cliff = (H - 0.15 * H).toFixed(1);
  return `<svg viewBox="0 0 ${W} ${H}" class="v9-wear" role="img" aria-label="Desgaste de gomas de ${v9Esc(p.name)}"><line x1="0" y1="${cliff}" x2="${W}" y2="${cliff}" stroke="#ef4444" stroke-dasharray="4 4" stroke-width="1"/>${p.pits.map(l => `<line x1="${(l / N * W).toFixed(1)}" y1="0" x2="${(l / N * W).toFixed(1)}" y2="${H}" stroke="#555" stroke-width="1"/>`).join("")}${segs}</svg>`;
}
function v9StratOpen() {
  if (!DL || DL.mode !== "race" || DL.skip || !DL.me || DL.me.status === "DNS") return false;
  if (s.weather && s.weather.wet) return false;
  if (typeof DL_TY === "undefined") return false;
  DL.strat = v9StratPlans();
  DL.phase = "strat";
  clearInterval(dlTimer);
  const R = DL.strat;
  const why = R.tw >= 1.15 ? "acá las gomas se gastan mucho" : R.tw <= 0.85 ? "esta pista casi no gasta gomas" : "el desgaste es normal";
  v7Say(dlEngPre() + "Antes de largar: " + why + ". Yo haría " + R.P[R.rec].name.split(" · ")[0] + ". Vos decidís.", "eng");
  clearTimeout(DL._stratTO); DL._stratTO = setTimeout(() => { if (DL && DL.phase === "strat") v9StratChoose(DL.strat.rec, true); }, 30000);
  dlDraw();
  return true;
}
function v9StratHtml() {
  const R = DL.strat;
  return `<div class="eng-live-dec v9-strat"><div class="q">🧠 ESTRATEGIA · ${DL.N} vueltas <span class="small">desgaste ×${(R.tw || 1).toFixed(2)}</span></div>
    <p class="small">La línea muestra cuánta goma te queda vuelta a vuelta. Debajo de la línea roja punteada, las gomas se caen.</p>
    <div class="v9-plans">${R.P.map((p, i) => `<button type="button" class="dark v9-plan ${i === R.rec ? "rec" : ""}" onclick="v9StratChoose(${i})"><b>${i + 1}. ${v9Esc(p.name)}</b>${v9StratSvg(p)}<span class="small">Boxes: vuelta ${p.pits.join(" y ")} · goma mínima ${Math.round(p.min)}%${p.min < 15 ? " ⚠️" : ""}</span>${i === R.rec ? `<i>📻 ${v9Esc(dlEngFirst())} recomienda</i>` : ""}</button>`).join("")}</div></div>`;
}
function v9StratChoose(i, auto) {
  if (!DL || DL.phase !== "strat" || !DL.strat) return;
  clearTimeout(DL._stratTO);
  const R = DL.strat, p = R.P[i], st = dlState();
  const g = i === R.rec ? 1.2 : p.min < 15 ? -1.5 : -0.3;
  st.bonus += g;
  DL.pits = p.pits.slice();
  if (DL.stints && DL.stints[0]) DL.stints[0].ty = p.seq[0];
  DL._plan = p.seq.slice();
  DL.strat = null; DL.phase = "run";
  dlRebuild();
  dlFeed(0, "🧠 Estrategia: " + p.name + (auto ? " (la eligió tu ingeniero)" : "") + ". " + (i === R.rec ? "✅ La que recomendaba el ingeniero." : p.min < 15 ? "⚠️ Las gomas van a sufrir." : "➖ Distinta a la recomendada."), true, g > 0 ? "ok" : g < -1 ? "bad" : "");
  if (!auto) v7Say(i === R.rec ? "Vamos con tu plan." : "Prefiero " + p.name.split(" · ")[0] + ".", "you", { toast: false });
  v7StartOpen();
}

/* ============================ 🛣️ ENTRADA A BOXES JUGABLE (piloto) ============================ */
function v9PitEntryOpen(l) {
  DL.pe = { lap: l, t0: performance.now() + 1100, x: 0, zone: [60, 74], speed: s.miniDiff === "easy" ? 0.032 : s.miniDiff === "hard" ? 0.05 : 0.04 };
  DL.phase = "pitentry";
  dlFeed(l, "🛣️ Entrás a boxes en la vuelta " + l + ". Activá el limitador justo antes de la línea.", true);
  v7Say("Box, box. Limitador en la línea blanca, ni antes ni después.", "eng");
  cancelAnimationFrame(v9Raf);
  const step = () => {
    const P = DL && DL.pe; if (!P || DL.phase !== "pitentry") return;
    const now = performance.now();
    if (now >= P.t0) P.x = Math.min(100, (now - P.t0) * P.speed);
    const m = document.getElementById("v9PeCar"); if (m) m.style.left = P.x + "%";
    if (P.x >= 100) { v9PitEntryHit(true); return; }
    v9Raf = requestAnimationFrame(step);
  };
  v9Raf = requestAnimationFrame(step);
  dlDraw();
  return true;
}
function v9PitEntryHit(timeout) {
  const P = DL && DL.pe; if (!P || DL.phase !== "pitentry") return;
  cancelAnimationFrame(v9Raf);
  const st = dlState(), l = P.lap;
  let txt, cls, say;
  if (!timeout && P.x < P.zone[0]) { const lost = ((P.zone[0] - P.x) / 25).toFixed(1); st.bonus -= Math.min(1.5, 0.3 + (P.zone[0] - P.x) / 40); txt = "🐢 Frenaste muy temprano para entrar a boxes: perdiste " + lost + "s."; cls = "bad"; say = "Muy temprano el limitador, perdimos tiempo."; }
  else if (!timeout && P.x <= P.zone[1]) { st.bonus += 0.6; txt = "✅ Entrada a boxes perfecta: limitador justo en la línea."; cls = "ok"; say = "Perfecto el limitador. Buena entrada."; }
  else { st.pens = st.pens || []; if (DL.me) st.pens.push({ name: DL.me.name, reason: "Exceso de velocidad en boxes" }); txt = "🚨 ¡Exceso de velocidad en la calle de boxes! +5 segundos."; cls = "bad"; say = "Te pasaste de velocidad en boxes. Cinco segundos de penalización."; }
  dlFeed(l, txt, true, cls);
  v7Say(say, "eng");
  DL.pe = null; DL.phase = "run";
  DL.compAsked[l] = true;
  if (cls === "bad" || cls === "ok") dlRebuild();
  if (!dlOpenComp(l, false)) { DL.phase = "run"; dlSchedule(); }
  dlDraw();
}
function v9PitEntryHtml() {
  const P = DL.pe;
  return `<div class="eng-live-dec v9-pe"><div class="q">🛣️ ENTRADA A BOXES · vuelta ${P.lap}</div>
    <p class="small">Activá el limitador en la zona blanca. Muy temprano perdés tiempo; tarde, te multan.</p>
    <div class="v9-lane"><i class="z" style="left:${P.zone[0]}%;width:${P.zone[1] - P.zone[0]}%"></i><span class="v9-line" style="left:${P.zone[1]}%"></span><b id="v9PeCar" style="left:${P.x}%">🏎️</b></div>
    <button type="button" class="lv-btn red" onclick="v9PitEntryHit(false)">🅿️ ¡LIMITADOR! <kbd>Espacio</kbd></button></div>`;
}

/* ============================ 🎬 REPETICIÓN DEL PASE EN EL MAPA ============================ */
function v9ReplayStart(lap, label) {
  if (!DL || DL.skip || !DL.data) return;
  const now = performance.now();
  DL._replay = { from: Math.max(0, lap - 0.9), to: Math.min(DL.data.N, lap + 0.15), t0: now, until: now + 3300, label };
  DL.phase = "replay";
  clearTimeout(DL._replayTO);
  DL._replayTO = setTimeout(v9ReplayEnd, 3300);
  dlDraw();
}
function v9ReplayEnd() {
  clearTimeout(DL && DL._replayTO);
  if (!DL) return;
  DL._replay = null;
  document.querySelectorAll("#dlMap .v9-replay").forEach(x => x.remove());
  if (DL.phase === "replay") { DL.phase = "run"; dlSchedule(); dlDraw(); }
}
if (typeof fwMapDraw === "function") {
  const o = fwMapDraw;
  fwMapDraw = function (host, data, tLap) {
    try {
      const R = typeof DL !== "undefined" && DL && DL._replay;
      if (R && host && host.id === "dlMap") {
        const now = performance.now();
        if (now < R.until) {
          const k = ((now - R.t0) % 1650) / 1650;
          tLap = R.from + (R.to - R.from) * k;
          if (!host.querySelector(".v9-replay")) host.insertAdjacentHTML("beforeend", `<div class="v9-replay">🎬 REPETICIÓN · ${v9Esc(R.label || "")}</div>`);
        }
      }
    } catch (e) {}
    return o.call(this, host, data, tLap);
  };
}
if (typeof v7QteFinish === "function") {
  const o = v7QteFinish;
  v7QteFinish = function (ok, auto) {
    const Q = DL && DL.qte, lap = Q && Q.lap, other = Q && Q.other, atk = Q && Q.atk;
    const r = o.apply(this, arguments);
    try {
      const st = dlState(), last = (st.moves || [])[st.moves.length - 1];
      if (!auto && Q && DL && DL.phase === "run" && last && last.lap === lap && last.other === other && last.res === "gain") v9ReplayStart(lap, (atk ? "pasás a " : "") + dlShort(other));
    } catch (e) {}
    return r;
  };
}

function v9Coach() {
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
}
/* ============================ ganchos de la transmisión (piloto) ============================ */
(function () {
  if (typeof v7StartOpen === "function") {
    const o = v7StartOpen;
    v7StartOpen = function () {
      if (!DL || DL.mode !== "race" || DL.skip || !DL.me || DL.me.status === "DNS") return o.apply(this, arguments);
      if (!DL._stratAsked) { DL._stratAsked = true; if (v9StratOpen()) return; }
      if (s._rdStart === v9Key()) {
        dlFeed(0, "🚦 La largada ya la jugaste en la cinemática: arrancás desde ahí.", true);
        DL.phase = "run"; dlDraw(); dlSchedule();
        setTimeout(v9Coach, 700);
        return;
      }
      return o.apply(this, arguments);
    };
  }
  if (typeof dlRaceExtras === "function") {
    const o = dlRaceExtras;
    dlRaceExtras = function (l) {
      try {
        const me = DL && DL.me;
        if (DL && DL.mode === "race" && !DL.skip && me && DL.stints && DL.compAsked && me.pits.includes(l) && !DL.compAsked[l] && l < DL.N && me.t.length >= l && me.status !== "DNS") {
          DL._pe = DL._pe || {};
          if (!DL._pe[l]) { DL._pe[l] = true; return v9PitEntryOpen(l); }
        }
      } catch (e) { console.warn("[FAWIWE] entrada a boxes:", e); }
      return o.apply(this, arguments);
    };
  }
  if (typeof dlDraw === "function") {
    const o = dlDraw;
    dlDraw = function () {
      const r = o.apply(this, arguments);
      try {
        const box = document.getElementById("dlDecision");
        if (box && DL) {
          if (DL.phase === "strat" && DL.strat) box.innerHTML = v9StratHtml();
          else if (DL.phase === "pitentry" && DL.pe) box.innerHTML = v9PitEntryHtml();
          else if (DL.phase === "replay") box.innerHTML = `<div class="eng-live-dec v9-rp"><div class="q">🎬 Repetición en el mapa…</div><button type="button" class="lv-btn" onclick="v9ReplayEnd()">⏭ Seguir</button></div>`;
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlSkip === "function") {
    const o = dlSkip;
    dlSkip = function () {
      try {
        if (DL && DL.phase === "strat") { DL.skip = true; clearTimeout(DL._stratTO); DL.strat = null; DL.phase = "run"; }
        if (DL && DL.phase === "pitentry") { cancelAnimationFrame(v9Raf); DL.pe = null; DL.phase = "run"; }
        if (DL && DL.phase === "replay") { clearTimeout(DL._replayTO); DL._replay = null; DL.phase = "run"; }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  document.addEventListener("keydown", ev => {
    if (typeof DL === "undefined" || !DL || !document.getElementById("dlOverlay")?.classList.contains("show")) return;
    const k = ev.key;
    if (DL.phase === "strat" && ["1", "2", "3"].includes(k)) { ev.preventDefault(); v9StratChoose(+k - 1); }
    else if (DL.phase === "pitentry" && (k === " " || k === "Enter" || k === "ArrowDown")) { ev.preventDefault(); v9PitEntryHit(false); }
  }, true);
})();

/* ============================ ⚔️ ÓRDENES DE ATAQUE (ingeniero) ============================ */
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
  const mine = d.rows.filter(r => r.mine && r.t.length > cur && r.status !== "DNS").sort((a, b) => a.pos[cur] - b.pos[cur]);
  for (const me of mine) {
    const p = me.pos[cur];
    const ahead = d.rows.find(r => r.pos[cur] === p - 1 && !r.mine && r.t.length >= cur);
    if (!ahead) continue;
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
function v9AtkSide(side) {
  const L = engLive, A = L && L.atk; if (!A || A.step !== "side") return;
  A.choice = side; A.zone = side !== A.side ? [34, 66] : [45, 55];
  A.step = "brake"; A.t0 = performance.now(); A.x = 0; A.v = 1;
  try { fwRadioSay(side === "in" ? "Tirate por adentro." : "Pasalo por afuera.", "eng", { toast: false }); } catch (e) {}
  cancelAnimationFrame(v9Raf);
  const step = () => {
    const L2 = engLive; if (!L2 || L2.phase !== "atkgame" || !L2.atk || L2.atk.step !== "brake") return;
    const a = L2.atk; a.x += a.v * a.speed * 1.8; if (a.x >= 100) { a.x = 100; a.v = -1; } if (a.x <= 0) { a.x = 0; a.v = 1; }
    const m = document.getElementById("v9AtkMark"); if (m) m.style.left = a.x + "%";
    v9Raf = requestAnimationFrame(step);
  };
  v9Raf = requestAnimationFrame(step);
  engLiveDraw();
}
function v9AtkHit() { const A = engLive && engLive.atk; if (!A || A.step !== "brake") return; v9AtkFinish(A.x >= A.zone[0] && A.x <= A.zone[1], false); }
function v9AtkFinish(ok, auto) {
  const L = engLive, A = L && L.atk; if (!A) return;
  cancelAnimationFrame(v9Raf); clearTimeout(L._atkTO);
  if (auto) ok = engH("v9aa" + L.key + A.lap) % 3 === 0;
  exAddBonus(L, A.seat, ok ? 2.2 : -0.4);
  L.feed.push({ lap: A.lap, txt: ok ? "⚔️ ¡Orden perfecta! " + A.name + " pasa a " + A.other + (A.choice ? (A.choice === "in" ? " por adentro" : " por afuera") : "") + "." : "⚔️ " + A.other + " le cerró la puerta a " + A.name + ".", mine: true });
  try { if (!L.skip) fwRadioSay(ok ? "¡Adentro! ¡Buena esa!" : "No pude, me cerró.", "drv"); } catch (e) {}
  L.atk = null; L.phase = "running";
  engLiveRetarget(); engLiveDraw();
}
function v9AtkHtml() {
  const A = engLive.atk;
  const head = `<div class="q">🎯 ORDEN DE ATAQUE · ${v9Esc(A.name)} → ${v9Esc(A.other)} <span class="small">vuelta ${A.lap}</span></div>`;
  if (A.step === "side") return `<div class="eng-live-dec v7-qte">${head}<p class="small">📻 Tu piloto dice que ${v9Esc(A.other)} cierra <b>${A.side === "in" ? "el interior" : "el exterior"}</b>. Mandalo por el lado libre.</p>
    <div class="v7-sides"><button type="button" class="lv-btn" onclick="v9AtkSide('in')">↙️ Por adentro <kbd>←</kbd></button><button type="button" class="lv-btn" onclick="v9AtkSide('out')">Por afuera ↗️ <kbd>→</kbd></button></div></div>`;
  return `<div class="eng-live-dec v7-qte">${head}<p class="small">Decile cuándo frenar: ¡en la zona verde!</p>
    <div class="dl-duel-bar"><i class="z" style="left:${A.zone[0]}%;width:${A.zone[1] - A.zone[0]}%"></i><b id="v9AtkMark" style="left:${A.x}%"></b></div>
    <button type="button" class="lv-btn red" onclick="v9AtkHit()">🛑 ¡FRENÁ AHORA! <kbd>Espacio</kbd></button></div>`;
}
(function () {
  if (typeof engLiveTick !== "function") return;
  const tk = engLiveTick;
  engLiveTick = function () { const r = tk.apply(this, arguments); try { v9AtkCheck(engLive); } catch (e) { console.warn("[FAWIWE] ataque:", e); } return r; };
  const dr = engLiveDraw;
  engLiveDraw = function () {
    const r = dr.apply(this, arguments);
    try { const L = engLive, box = document.getElementById("engLiveDecision"); if (L && box && L.phase === "atkgame" && L.atk) box.innerHTML = v9AtkHtml(); } catch (e) {}
    return r;
  };
  const sk = engLiveSkip;
  engLiveSkip = function () { const L = engLive; if (L && L.phase === "atkgame") { L.skip = true; v9AtkFinish(false, true); } return sk.apply(this, arguments); };
  document.addEventListener("keydown", ev => {
    const L = typeof engLive !== "undefined" && engLive, ov = document.getElementById("engLiveOverlay");
    if (!L || L.phase !== "atkgame" || !L.atk || !ov || !ov.classList.contains("show")) return;
    const k = ev.key;
    if (L.atk.step === "side" && (k === "ArrowLeft" || k === "1")) { ev.preventDefault(); v9AtkSide("in"); }
    else if (L.atk.step === "side" && (k === "ArrowRight" || k === "2")) { ev.preventDefault(); v9AtkSide("out"); }
    else if (L.atk.step === "brake" && (k === " " || k === "Enter")) { ev.preventDefault(); v9AtkHit(); }
  });
})();

/* ============================ 📸 TARJETA DE TEMPORADA ============================ */
function v9SeasonTrack() {
  try {
    const grid = s._v4Grid || [];
    const lineup = myTeamLineup() || [];
    const mine = grid.filter(e => lineup.some(d => d.name === e.name));
    const me = s.playerMode === "driver" ? mine.find(e => lineup.some(d => d.name === e.name && d.seat === 1)) : mine.filter(e => !e.status).sort((a, b) => a.pos - b.pos)[0] || mine[0];
    if (!me) return;
    const S = s._v9Season && s._v9Season.season === s.season ? s._v9Season : (s._v9Season = { season: s.season, wins: 0, pods: 0, races: 0, best: null, seen: {} });
    const k = s.gp; if (S.seen[k]) return; S.seen[k] = 1;
    S.races++;
    if (!me.status && me.pos === 1) S.wins++;
    if (!me.status && me.pos <= 3) S.pods++;
    if (!me.status && (!S.best || me.pos < S.best.pos)) S.best = { pos: me.pos, trk: (trackData[s.gp] || {}).name || "" };
  } catch (e) {}
}
function v9SeasonData() {
  const S = s._v9Season || { wins: 0, pods: 0, races: 0 };
  const drv = s.playerMode === "driver";
  let champ = "—";
  try {
    if (drv) { const base = (s.playedDriverName || "").replace(" (reserva)", ""); const arr = Object.entries(s.driverPoints || {}).sort((a, b) => b[1] - a[1]); const i = arr.findIndex(x => x[0] === base); if (i >= 0) champ = "P" + (i + 1); }
    else if (typeof dashTeamPos === "function") { const v = String(dashTeamPos()); champ = /^P?\d+$/.test(v) ? (v[0] === "P" ? v : "P" + v) : v; }
  } catch (e) {}
  return { season: S.season || s.season, name: drv ? (s.playedDriverName || "") : (s.team || ""), team: s.team, drv, pts: s.points || 0, champ, wins: S.wins, pods: S.pods, races: S.races, best: S.best ? "P" + S.best.pos + " en " + S.best.trk : "—", col: (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600" };
}
function v9SeasonMake(D) {
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b0b10"); g.addColorStop(1, "#050507"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W * 0.75, H * 0.3, 40, W * 0.75, H * 0.3, 760); rg.addColorStop(0, D.col + "88"); rg.addColorStop(1, "transparent"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.fillStyle = D.col; x.fillRect(0, 0, W, 16); x.fillRect(0, H - 16, W, 16);
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#111111"; x.fillRect(i * (W / 14), H - 46, W / 14, 30); }
  x.fillStyle = "#e10600"; x.font = "900 54px Arial Black, Arial"; x.fillText("FAWIWE", 70, 120); x.fillStyle = "#fff"; x.font = "italic 900 54px Arial Black, Arial"; x.fillText("F1", 330, 120);
  x.fillStyle = "#facc15"; x.font = "700 34px Arial"; x.fillText("MI TEMPORADA " + D.season, 70, 190);
  x.fillStyle = "#fff"; x.font = "900 260px Arial Black, Arial"; x.fillText(D.champ, 60, 450);
  x.fillStyle = D.col; x.font = "900 54px Arial Black, Arial"; x.fillText(D.drv ? "EN EL CAMPEONATO" : "DE CONSTRUCTORES", 70, 530);
  x.fillStyle = "#fff"; x.font = "900 62px Arial"; v6Wrap(x, D.name, 70, 650, 940, 68, 2);
  x.fillStyle = "#bbb"; x.font = "600 36px Arial"; x.fillText(D.drv ? D.team : "Escudería", 70, 790);
  const box = (bx, by, label, val) => { x.fillStyle = "#15151c"; x.fillRect(bx, by, 450, 130); x.fillStyle = D.col; x.fillRect(bx, by, 8, 130); x.fillStyle = "#999"; x.font = "700 26px Arial"; x.fillText(label, bx + 30, by + 46); x.fillStyle = "#fff"; x.font = "900 44px Arial"; x.fillText(val, bx + 30, by + 104); };
  box(70, 850, "PUNTOS", String(D.pts)); box(560, 850, "VICTORIAS", String(D.wins));
  box(70, 1000, "PODIOS", String(D.pods)); box(560, 1000, "CARRERAS", String(D.races || "—"));
  x.fillStyle = "#facc15"; x.font = "800 28px Arial"; x.fillText("MEJOR MOMENTO", 70, 1185);
  x.fillStyle = "#ddd"; x.font = "600 34px Arial"; x.fillText(D.best, 70, 1230);
  x.fillStyle = "#777"; x.font = "600 24px Arial"; x.fillText("Jugado en FAWIWE F1 · #FAWIWE", 70, H - 70);
  return c.toDataURL("image/png");
}
function v9SeasonShare() {
  const D = s._v9SeasonSnap || v9SeasonData();
  let ov = document.getElementById("v6Share");
  if (!ov) { ov = document.createElement("div"); ov.id = "v6Share"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  let url = "";
  try { url = v9SeasonMake(D); } catch (e) {}
  const fn = "fawiwe-temporada-" + D.season + ".png";
  ov.innerHTML = `<div class="v6-share-card"><div class="hof-k">📸 TARJETA DE TEMPORADA ${D.season}</div>${url ? `<img src="${url}" alt="Tarjeta de la temporada ${D.season}">` : "<p>No se pudo armar la imagen.</p>"}
    <div class="v6-res-btns">${url ? `<a class="lv-btn red" href="${url}" download="${fn}">⬇️ Descargar</a>` : ""}<button type="button" class="lv-btn" onclick="document.getElementById('v6Share').classList.remove('show')">Cerrar</button></div></div>`;
  ov.classList.add("show");
}
if (typeof showBigResult === "function") {
  const o = showBigResult;
  showBigResult = function (kind) {
    let snap = null;
    try {
      if (/^CARRERA/.test(String(kind)) && !s.player2) setTimeout(v9SeasonTrack, 0);
      if (/^FIN DE TEMPORADA/.test(String(kind)) && !s.player2) { snap = v9SeasonData(); s._v9SeasonSnap = snap; s.hof = s.hof || {}; s.hof.seasons = s.hof.seasons || []; if (!s.hof.seasons.some(x => x.season === snap.season)) s.hof.seasons.push(snap); }
    } catch (e) {}
    const r = o.apply(this, arguments);
    try {
      if (snap) { const box = document.getElementById("resultGridTable"); if (box && !box.querySelector(".v9-season-btn")) box.insertAdjacentHTML("afterbegin", `<div class="v6-res-btns"><button type="button" class="lv-btn red v9-season-btn" onclick="v9SeasonShare()">📸 Tarjeta de temporada</button></div>`); }
    } catch (e) {}
    return r;
  };
  window.showBigResult = showBigResult;
}
try { V5_KEYS.push("_v9Season", "_v9SeasonSnap", "_rdStart"); } catch (e) {}

/* ============================ 📖 TUTORIAL ============================ */
const V9_TUT = `<div id="v9Tut"><h3>🚦 Lo nuevo de la transmisión</h3><ul>
  <li><b>🧠 Estrategia</b>: antes de largar elegís entre 3 planes de gomas (<kbd>1</kbd>-<kbd>3</kbd>). El gráfico muestra cuánta goma te queda; debajo de la línea roja, se caen. Tu ingeniero marca el que recomienda.</li>
  <li><b>🚦 Largada</b>: esperá que se apaguen las 5 luces y apretá <kbd>Espacio</kbd>. Si salís antes, +5s. Si ya largaste en la cinemática de carrera, no se repite.</li>
  <li><b>⚔️ Pases y defensas</b>: cuando alguien está cerca, la carrera se pausa. Elegí el lado (<kbd>←</kbd> <kbd>→</kbd>) y frená en la zona verde (<kbd>Espacio</kbd>). Si pasás, lo ves en la <b>🎬 repetición</b> del mapa.</li>
  <li><b>🟢 Relanzamiento</b> después del Safety Car: acelerá apenas se pone verde.</li>
  <li><b>🛣️ Entrada a boxes</b>: activá el limitador en la zona blanca. Temprano perdés tiempo; tarde, +5s por exceso de velocidad. Después elegís las gomas.</li>
  <li><b>🌧️ Lluvia en la clasificación</b>: si empieza a llover, los que salen tarde a la pista pierden tiempo. ¡Salí temprano!</li>
  <li><b>🔧 Ingeniero</b>: también le das <b>órdenes de ataque</b> a tus pilotos (lado + momento de frenar), hasta 2 por carrera.</li>
  <li><b>📸 Tarjeta de temporada</b> al terminar el año, y la <b>🎤 voz del periodista</b> en la conferencia de prensa.</li></ul></div>`;
(function () {
  const put = () => { const t = document.getElementById("tutorial"); if (!t || document.getElementById("v9Tut")) return; const a = document.getElementById("v5Tut"); if (a) a.insertAdjacentHTML("afterend", V9_TUT); else t.insertAdjacentHTML("afterbegin", V9_TUT); };
  if (document.readyState !== "loading") put(); else document.addEventListener("DOMContentLoaded", put);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { put(); } catch (e) {} return r; }; window.render = render; }
})();
