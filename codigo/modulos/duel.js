/* =====================================================================================
   FAWIWE · MULTIJUGADOR: EL DUELO
   - Cinemática después de cada GP: quién le ganó a quién, por cuánto, racha y marcador.
   - El ganador le manda una "pica" al rival (se ve en el turno del otro).
   - Cartel de cambio de turno (P1 / P2) para pasarse el celu o la compu.
   - Tarjeta del duelo: marcador, puntos, rachas, últimos resultados y récords.
   - Cinemática de campeón del duelo al terminar la temporada.
   ===================================================================================== */
const DUEL_TAUNTS = ["😎 ¿Eso fue todo?", "🐢 Te vi por el espejito… muy de lejos", "🏆 Andá acostumbrándote", "📸 Sacale foto a mi alerón trasero", "🍿 Divertido verte pelear con el de atrás", "🧠 Estrategia > velocidad"];
function duelOn() { return !!s.player2; }
function duelNames() { return { a: s.name || "P1", b: (s.player2 && s.player2.name) || "P2" }; }
function duelLog() { if (!Array.isArray(s.duelLog)) s.duelLog = []; return s.duelLog; }
function duelStreak() {
  const L = duelLog(); if (!L.length) return { who: 0, n: 0 };
  const last = L[L.length - 1].w; if (!last) return { who: 0, n: 0 };
  let n = 0; for (let i = L.length - 1; i >= 0 && L[i].w === last; i--) n++;
  return { who: last, n };
}
function duelLines(delay) { return '<svg class="bc-lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${6 + k * 12}" width="${388 - k * 24}" height="${288 - k * 24}" rx="${60 - k * 10}" pathLength="1" style="animation-delay:${(delay + k * 0.1).toFixed(2)}s"/>`).join("") + "</svg>"; }
function duelClose(id) { const ov = document.getElementById(id); if (!ov) return; ov.classList.add("bye"); setTimeout(() => ov.remove(), 320); }

/* ---------- después de cada GP ---------- */
function duelShowGP(r) {
  const N = duelNames();
  const h = s.p2HeadToHead || { p1Wins: 0, p2Wins: 0, ties: 0 };
  const st = duelStreak();
  const w = r.pos < r.pos2 ? 1 : r.pos2 < r.pos ? 2 : 0;
  const wn = w === 1 ? N.a : w === 2 ? N.b : null, ln = w === 1 ? N.b : w === 2 ? N.a : null;
  const gap = Math.abs(r.pos - r.pos2);
  const how = gap >= 8 ? "¡PALIZA!" : gap >= 4 ? "VICTORIA CLARA" : gap >= 2 ? "LE GANÓ" : "¡POR UN PELO!";
  const streak = st.n >= 2 && st.who === w ? `🔥 ${st.n} GP seguidos ganándole` : "";
  const ov = document.createElement("div");
  ov.id = "duelCine";
  ov.className = "w" + w;
  ov.innerHTML = `<div class="dc-split"><div class="dc-a"></div><div class="dc-b"></div></div>
    <div class="dc-k"><span class="bc-badge">F1</span>DUELO · ${engEsc((trackData[s.gp] || trackData[s.gp - 1] || {}).name || "GP")} ${s.season}</div>
    <div class="dc-row">
      <div class="dc-p p1 ${w === 1 ? "win" : w === 2 ? "lose" : ""}"><span class="dc-tag">🟡 P1</span><b>${engEsc(N.a)}</b><div class="dc-pos">P${r.pos}</div><span class="dc-pts">+${r.pts} pts</span></div>
      <div class="dc-vs">VS</div>
      <div class="dc-p p2 ${w === 2 ? "win" : w === 1 ? "lose" : ""}"><span class="dc-tag">🔵 P2</span><b>${engEsc(N.b)}</b><div class="dc-pos">P${r.pos2}</div><span class="dc-pts">+${r.pts2} pts</span></div>
    </div>
    <div class="dc-plate">${duelLines(1.1)}
      <div class="dc-how">${w ? how : "EMPATE"}</div>
      <div class="dc-msg">${w ? `<b>${engEsc(wn)}</b> le ganó a <b>${engEsc(ln)}</b>${gap ? " por " + gap + (gap === 1 ? " puesto" : " puestos") : ""}` : "Terminaron pegados: nadie le ganó a nadie."}</div>
      ${streak ? `<div class="dc-streak">${streak}</div>` : ""}
      <div class="dc-score"><span>🟡 ${h.p1Wins}</span><em>MARCADOR DEL DUELO</em><span>${h.p2Wins} 🔵</span></div>
      <div class="dc-ptsrow">Campeonato: ${engEsc(N.a)} <b>${s.points}</b> · <b>${s.player2.points}</b> ${engEsc(N.b)}</div>
    </div>
    ${w ? `<div class="dc-taunt"><span>📢 ${engEsc(wn)}, mandale una pica a ${engEsc(ln)}:</span><div>${DUEL_TAUNTS.map((t, i) => `<button class="dark" onclick="duelTaunt(${w},${i})">${t}</button>`).join("")}</div></div>` : ""}
    <button class="dc-go era-btn" onclick="duelClose('duelCine')">Continuar</button>`;
  document.body.appendChild(ov);
  try { if (typeof FWAudio !== "undefined") { FWAudio.whoosh(); setTimeout(() => { try { w ? FWAudio.fanfare() : FWAudio.ok(); } catch (e) {} }, 900); } } catch (e) {}
}
function duelTaunt(w, i) {
  const N = duelNames();
  s.duelTaunt = { from: w, to: w === 1 ? 2 : 1, text: DUEL_TAUNTS[i], name: w === 1 ? N.a : N.b };
  add("📢 " + s.duelTaunt.name + " le mandó una pica a " + (w === 1 ? N.b : N.a) + ": \"" + DUEL_TAUNTS[i] + "\"");
  const box = document.querySelector("#duelCine .dc-taunt");
  if (box) box.innerHTML = `<span>📢 Pica enviada: <b>${DUEL_TAUNTS[i]}</b> — la va a ver en su turno.</span>`;
  try { FWAudio.click(); } catch (e) {}
}

/* ---------- cambio de turno ---------- */
function duelTurnPlate(p) {
  const N = duelNames();
  const old = document.getElementById("duelTurn"); if (old) old.remove();
  const t = s.duelTaunt && s.duelTaunt.to === p ? s.duelTaunt : null;
  const ov = document.createElement("div");
  ov.id = "duelTurn";
  ov.className = "p" + p;
  ov.innerHTML = `<div class="dt-plate">${duelLines(0.15)}<div class="dt-k">🎮 TURNO DE</div><div class="dt-who">${p === 1 ? "🟡 P1" : "🔵 P2"} · ${engEsc(p === 1 ? N.a : N.b)}</div>
    ${t ? `<div class="dt-taunt">📢 ${engEsc(t.name)} te dice: <b>${t.text}</b></div>` : `<div class="dt-sub">Pasale el control a ${engEsc(p === 1 ? N.a : N.b)}</div>`}
    <button class="era-btn dc-go" onclick="duelClose('duelTurn')">¡Vamos!</button></div>`;
  document.body.appendChild(ov);
  if (t) s.duelTaunt = null;
  try { FWAudio.whoosh(); } catch (e) {}
  ov.addEventListener("click", ev => { if (ev.target === ov) duelClose("duelTurn"); });
}

/* ---------- campeón del duelo ---------- */
function duelShowChampion(season, a, b) {
  const N = duelNames();
  const w = a > b ? 1 : b > a ? 2 : 0;
  if (!s.duelTitles) s.duelTitles = { p1: 0, p2: 0 };
  if (w === 1) s.duelTitles.p1++; else if (w === 2) s.duelTitles.p2++;
  const ov = document.createElement("div");
  ov.id = "duelChamp";
  ov.className = "w" + w;
  ov.innerHTML = `<div class="rc-rays"></div><div class="dc-k"><span class="bc-badge">F1</span>FIN DE TEMPORADA ${season} · DUELO</div>
    <div class="dch-trophy">🏆</div>
    <div class="dc-plate">${duelLines(0.8)}<div class="dc-how">${w ? "CAMPEÓN DEL DUELO" : "¡EMPATE EN PUNTOS!"}</div>
      <div class="dch-name">${w ? engEsc(w === 1 ? N.a : N.b) : engEsc(N.a) + " = " + engEsc(N.b)}</div>
      <div class="dc-ptsrow">🟡 ${engEsc(N.a)} <b>${a}</b> pts · <b>${b}</b> pts ${engEsc(N.b)} 🔵</div>
      <div class="dc-ptsrow">Títulos del duelo: 🟡 ${s.duelTitles.p1} · ${s.duelTitles.p2} 🔵</div></div>
    <button class="dc-go era-btn" onclick="duelClose('duelChamp')">Continuar</button>`;
  document.body.appendChild(ov);
  try { FWAudio.fanfare(); } catch (e) {}
}

/* ---------- tarjeta del duelo ---------- */
function duelCardHtml() {
  const N = duelNames(), h = s.p2HeadToHead || { p1Wins: 0, p2Wins: 0, ties: 0 }, L = duelLog(), st = duelStreak();
  const last = L.slice(-8).map(x => `<span class="dd ${x.w === 1 ? "a" : x.w === 2 ? "b" : "t"}" title="${engEsc((x.track || "") + " " + x.season)}: P${x.p1} vs P${x.p2}">${x.w === 1 ? "🟡" : x.w === 2 ? "🔵" : "="}</span>`).join("") || '<span class="small">Todavía no corrieron.</span>';
  const best = side => { let b = 99; L.forEach(x => { const v = side === 1 ? x.p1 : x.p2; if (v < b) b = v; }); return b === 99 ? "—" : "P" + b; };
  const big = L.reduce((m, x) => { const g = Math.abs(x.p1 - x.p2); return g > m.g ? { g, x } : m; }, { g: 0, x: null });
  const tot = h.p1Wins + h.p2Wins || 1;
  return `<h2>⚔️ El duelo: ${engEsc(N.a)} vs ${engEsc(N.b)}</h2>
    <div class="duel-score"><div class="a"><b>${h.p1Wins}</b><span>🟡 ${engEsc(N.a)}</span></div><div class="mid">${h.ties ? h.ties + " empates" : "VS"}</div><div class="b"><b>${h.p2Wins}</b><span>${engEsc(N.b)} 🔵</span></div></div>
    <div class="duel-bar"><i style="width:${Math.round(h.p1Wins / tot * 100)}%"></i></div>
    <div class="grid"><div class="stat">🏁 Puntos ${s.season}<b>🟡 ${s.points} · ${s.player2.points} 🔵</b></div><div class="stat">🔥 Racha<b>${st.n ? (st.who === 1 ? "🟡 " + engEsc(N.a) : "🔵 " + engEsc(N.b)) + " · " + st.n + " GP" : "—"}</b></div><div class="stat">🏆 Títulos del duelo<b>🟡 ${(s.duelTitles || {}).p1 || 0} · ${(s.duelTitles || {}).p2 || 0} 🔵</b></div></div>
    <p class="small">Últimos GP: ${last}</p>
    <p class="small">📈 Mejor resultado: 🟡 ${best(1)} · ${best(2)} 🔵${big.x ? ` · 💥 Mayor paliza: ${big.x.w === 1 ? engEsc(N.a) : engEsc(N.b)} por ${big.g} puestos en ${engEsc(big.x.track || "")}` : ""}</p>
    ${s.duelTaunt ? `<p class="notice">📢 Pica pendiente de ${engEsc(s.duelTaunt.name)}: "${s.duelTaunt.text}"</p>` : ""}`;
}
function duelRender() {
  let card = document.getElementById("duelCard");
  const g = document.getElementById("game");
  const on = duelOn() && !!g && !g.classList.contains("hidden");
  if (!card) {
    if (!on) return;
    const anchor = document.getElementById("offersCard") || document.getElementById("jobCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = "duelCard"; card.className = "card";
    anchor.parentNode.insertBefore(card, anchor);
  }
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = duelCardHtml();
}

/* ---------- ganchos ---------- */
(function () {
  const fr = window.finishRace;
  if (typeof fr === "function") window.finishRace = function () {
    const multi = duelOn() && !s.raceDone;
    const p1b = s.points, p2b = multi ? s.player2.points : 0;
    s._duelSuppress = true;
    let r;
    try { r = fr.apply(this, arguments); } finally { s._duelSuppress = false; s._duelLastTurn = s.activePlayer || 1; }
    try {
      if (multi && s.pendingPress && s.pendingPress.pos2 != null) {
        const pos = s.pendingPress.pos, pos2 = s.pendingPress.pos2;
        const rec = { season: s.season, gp: s.gp, track: (trackData[s.gp] || {}).name, p1: pos, p2: pos2, w: pos < pos2 ? 1 : pos2 < pos ? 2 : 0 };
        duelLog().push(rec);
        setTimeout(() => duelShowGP({ pos, pos2, pts: s.points - p1b, pts2: s.player2.points - p2b }), 350);
      }
    } catch (e) { console.warn(e); }
    return r;
  };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const multi = duelOn(), ps = s.season, a = s.points, b = multi ? s.player2.points : 0;
    const r = ng.apply(this, arguments);
    try { if (multi && s.season !== ps) setTimeout(() => duelShowChampion(ps, a, b), 600); } catch (e) {}
    return r;
  };
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try {
      duelRender();
      if (duelOn()) {
        const p = s.activePlayer || 1;
        if (!s._duelSuppress && s._duelLastTurn && s._duelLastTurn !== p && !document.getElementById("duelCine")) duelTurnPlate(p);
        s._duelLastTurn = p;
      } else s._duelLastTurn = null;
    } catch (e) { console.warn(e); }
    return x;
  };
})();
