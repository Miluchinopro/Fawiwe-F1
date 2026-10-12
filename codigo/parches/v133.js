/* =====================================================================================
   FAWIWE · V133
   1) Mapa del circuito en las transmisiones (piloto e ingeniero) con los autos moviéndose.
   2) Récords por circuito + Salón de la fama.
   3) Pretemporada (tests) al empezar cada temporada.
   4) Rumores del mercado de pilotos durante la temporada.
   5) Podio con cinemática (y una fanfarria original).
   6) Autoguardado después de cada GP.
   ===================================================================================== */
function v3Esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function v3H(str) { try { return Math.abs(deterministicHash(str)); } catch (e) { let h = 0; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); } }
function v3Game() { const g = document.getElementById("game"); return !!(g && !g.classList.contains("hidden") && s && s.team); }

/* ---------------------------------- 1) MAPA ---------------------------------- */
const FW_MAP_GENERIC = [
  "M30,92 L120,96 Q160,98 172,78 Q182,58 160,50 L130,46 Q112,44 116,30 Q120,16 98,16 L60,18 Q28,20 24,46 L22,74 Q22,90 30,92 Z",
  "M24,60 Q24,24 60,22 L140,20 Q178,20 178,48 Q178,64 158,66 L120,66 Q104,66 104,80 Q104,98 128,98 L150,98 Q170,98 170,104 L60,104 Q24,104 24,60 Z",
  "M40,100 L100,100 Q118,100 122,86 L132,52 Q138,30 160,30 Q182,30 180,54 Q178,80 150,84 L146,84 Q136,86 140,96 Q146,104 160,104 L172,104 Q182,24 120,18 L60,18 Q24,18 22,50 Q20,100 40,100 Z",
  "M28,40 Q30,18 54,20 L96,26 Q112,28 118,40 L130,64 Q136,74 150,72 L168,68 Q184,66 182,84 Q180,102 158,102 L48,102 Q22,102 24,80 Z",
  "M100,16 Q150,16 170,40 Q186,62 168,84 Q150,104 112,100 L96,98 Q80,96 74,84 Q68,72 54,76 Q30,82 24,62 Q18,40 40,30 Q62,18 100,16 Z",
  "M22,90 L22,40 Q22,22 40,22 L70,22 Q84,22 84,36 L84,52 Q84,62 96,62 L150,62 Q168,62 170,44 Q172,24 154,24 L120,24 L176,24 Q186,24 186,40 L186,92 Q186,104 172,104 L36,104 Q22,104 22,90 Z"
];
const FW_MAP_ALIAS = { "Mónaco": "Mónaco", "Italia": "Monza", "Bélgica": "Spa-Francorchamps", "Brasil": "Interlagos" };
function fwMapPath(name) {
  try {
    const a = FW_MAP_ALIAS[name];
    if (a && typeof FW_CIRCUITS !== "undefined") { const c = FW_CIRCUITS.find(x => x[0] === a); if (c) return c[2]; }
  } catch (e) {}
  return FW_MAP_GENERIC[v3H("map_" + name) % FW_MAP_GENERIC.length];
}
function fwMapMount(host, name) {
  if (!host) return null;
  if (host._fm && host._fm.name === name) return host._fm;
  const d = fwMapPath(name);
  host.innerHTML = `<svg viewBox="-6 -6 212 132" preserveAspectRatio="xMidYMid meet"><path class="fm-out" d="${d}"/><path class="fm-trk" d="${d}"/><path class="fm-start" d="${d}" pathLength="1000" stroke-dasharray="4 996"/><g class="fm-dots"></g></svg><div class="fm-name">🗺️ ${v3Esc(name)}</div>`;
  const path = host.querySelector(".fm-trk");
  host._fm = { name, path, len: path.getTotalLength(), dots: {}, g: host.querySelector(".fm-dots") };
  return host._fm;
}
function fwCumAt(r, x) {
  const k = Math.floor(x), f = x - k;
  if (k <= 0 && x < 0) return (r.o || 0);
  if (k >= r.t.length) return r.cum.length ? r.cum[r.cum.length - 1] : 0;
  const base = k === 0 ? (r.o || 0) : r.cum[k - 1];
  return base + f * r.t[k];
}
function fwMapDraw(host, data, tLap) {
  if (!host || !data) return;
  const fm = fwMapMount(host, data.track || ((trackData[s.gp] || {}).name || ""));
  if (!fm) return;
  const live = data.rows.filter(r => r.status !== "DNS" && r.t.length);
  let RT = Infinity;
  live.forEach(r => { if (r.t.length >= Math.ceil(tLap)) RT = Math.min(RT, fwCumAt(r, tLap)); });
  if (!isFinite(RT)) RT = Math.max(...live.map(r => r.cum[r.cum.length - 1] || 0));
  live.forEach(r => {
    let dot = fm.dots[r.name];
    if (!dot) {
      const NS = "http://www.w3.org/2000/svg";
      dot = document.createElementNS(NS, "g");
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", r.mine ? (r.seat === 1 ? 4.8 : 4) : 3.2);
      c.setAttribute("fill", (typeof teamColors !== "undefined" && teamColors[r.team]) || "#999");
      c.setAttribute("class", r.mine ? "fm-mine" : "fm-car");
      dot.appendChild(c);
      if (r.mine) { const tx = document.createElementNS(NS, "text"); tx.setAttribute("y", -7); tx.setAttribute("class", "fm-lbl"); tx.textContent = (typeof lapShort === "function" ? lapShort(r.name) : r.name).slice(0, 3); dot.appendChild(tx); }
      fm.g.appendChild(dot);
      fm.dots[r.name] = dot;
    }
    let c = 0; while (c < r.cum.length && r.cum[c] <= RT) c++;
    let frac;
    if (c >= r.t.length) { if (r.status === "DNF") { dot.style.display = "none"; return; } frac = 0; }
    else { const prev = c === 0 ? (r.o || 0) : r.cum[c - 1]; frac = c + (RT - prev) / r.t[c]; }
    const inPit = r.pits && r.pits.includes(c + 1) && (frac % 1) > 0.85;
    const p = fm.path.getPointAtLength((((frac % 1) + 1) % 1) * fm.len);
    dot.style.display = "";
    dot.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    dot.classList.toggle("pit", !!inPit);
  });
  // tu auto siempre arriba de todo
  data.rows.filter(r => r.mine).forEach(r => { const d0 = fm.dots[r.name]; if (d0) fm.g.appendChild(d0); });
}
let fwMapRaf = null;
function fwMapLoop() {
  fwMapRaf = requestAnimationFrame(fwMapLoop);
  try {
    const ov = document.getElementById("dlOverlay");
    if (typeof DL !== "undefined" && DL && DL.data && ov && ov.classList.contains("show")) {
      const ms = DL.skip ? 40 : Math.round(900 / (DL.speed || 1));
      const k = DL.phase === "run" ? Math.min(1, (Date.now() - (DL.tickAt || 0)) / ms) : 1;
      const from = DL.tickFrom != null ? DL.tickFrom : DL.lap;
      fwMapDraw(document.getElementById("dlMap"), DL.data, Math.min(DL.data.N, from + (DL.lap - from) * k));
    }
    const eo = document.getElementById("engLiveOverlay");
    if (typeof engLive !== "undefined" && engLive && engLive.lapData && eo && eo.classList.contains("show")) {
      const L = engLive, N = L.lapData.N;
      let host = document.getElementById("engMap");
      if (!host) { const fb = document.getElementById("engLiveFeed"); if (fb) { host = document.createElement("div"); host.id = "engMap"; host.className = "fw-map"; fb.parentNode.insertBefore(host, fb); } }
      const ms = L.skip ? 60 : Math.round(850 / (L.speed || 1));
      const k = L.phase === "running" ? Math.min(1, (Date.now() - (L._tickAt || 0)) / ms) : 1;
      const tPrev = Math.max(0, L.tick - 1) / L.T * N, tNow = L.tick / L.T * N;
      if (host) fwMapDraw(host, L.lapData, Math.min(N, tPrev + (tNow - tPrev) * k));
    }
  } catch (e) {}
}
(function () {
  if (typeof engLiveTick === "function") { const o = engLiveTick; engLiveTick = function () { if (engLive) engLive._tickAt = Date.now(); return o.apply(this, arguments); }; }
  if (typeof engStartLive === "function") { const o = engStartLive; engStartLive = function () { const h = document.getElementById("engMap"); if (h) { h._fm = null; h.innerHTML = ""; } return o.apply(this, arguments); }; }
  if (typeof dlEnsureOverlay === "function") { const o = dlEnsureOverlay; dlEnsureOverlay = function () { const r = o.apply(this, arguments); const h = document.getElementById("dlMap"); if (h) { h._fm = null; h.innerHTML = ""; } return r; }; }
  if (!fwMapRaf) fwMapLoop();
})();

/* ------------------------- 2) RÉCORDS POR CIRCUITO + SALÓN DE LA FAMA ------------------------- */
function v3Hof() { if (!s.hof || typeof s.hof !== "object") s.hof = { moments: [], teams: [] }; return s.hof; }
function v3Moment(txt, y) { const H = v3Hof(); H.moments.push({ y: y || s.season, txt }); if (H.moments.length > 40) H.moments.shift(); }
function v3MyRace(grid) {
  const mine = (grid || []).filter(e => e.mine);
  if (!mine.length) return null;
  if (s.playerMode === "driver") return mine.find(e => e.seat === 1) || mine[0];
  return mine.filter(e => !e.status && e.pos).sort((a, b) => a.pos - b.pos)[0] || mine[0];
}
function v3BestLap() {
  try {
    const d = s.playerMode === "driver" ? window.dlLastData : (typeof engLastLaps !== "undefined" ? engLastLaps : null);
    if (!d || d.key !== s.season + "_" + s.gp) return null;
    const rows = d.rows.filter(r => r.mine && isFinite(r.best));
    if (s.playerMode === "driver") { const me = rows.find(r => r.seat === 1); return me ? me.best : null; }
    return rows.length ? Math.min(...rows.map(r => r.best)) : null;
  } catch (e) { return null; }
}
function v3Records(grid) {
  const key = s.season + "_" + s.gp;
  if (s._trkRecKey === key) return;
  s._trkRecKey = key;
  const me = v3MyRace(grid);
  const name = (trackData[s.gp] || {}).name;
  if (!me || !name) return;
  if (!s.trkRec) s.trkRec = {};
  const R = s.trkRec[name] || (s.trkRec[name] = { races: 0, wins: 0, pods: 0, best: null, bestLap: null, bestYear: null });
  R.races++;
  const pos = me.status ? null : me.pos;
  const who = s.playerMode === "driver" ? "" : " (" + me.name.replace(" (reserva)", "") + ")";
  if (pos) {
    if (pos === 1) { R.wins++; if (R.wins === 1) add("🥇 ¡Primera victoria en " + name + "!" + who); v3Moment("🏆 Victoria en " + name + who); }
    else if (pos <= 3) v3Moment("🍾 Podio (P" + pos + ") en " + name + who);
    if (pos <= 3) R.pods++;
    if (R.best == null || pos < R.best) { if (R.best != null) add("🏅 ¡Nuevo récord personal en " + name + ": P" + pos + " (antes P" + R.best + ")!"); R.best = pos; R.bestYear = s.season; }
  }
  const bl = v3BestLap();
  if (bl && (R.bestLap == null || bl < R.bestLap - 0.0005)) {
    const had = R.bestLap != null;
    R.bestLap = bl;
    if (had && typeof lapFmt === "function") add("⏱️ ¡Nuevo récord de vuelta tuyo en " + name + ": " + lapFmt(bl) + "!");
  }
}
function v3RecCardHtml() {
  const rec = s.trkRec || {};
  const names = Object.keys(rec).sort((a, b) => (rec[b].wins - rec[a].wins) || ((rec[a].best || 99) - (rec[b].best || 99)));
  const fmt = v => (v == null ? "—" : typeof lapFmt === "function" ? lapFmt(v) : v.toFixed(3));
  return `<h2>🏁 Récords por circuito</h2>
    ${names.length ? `<div class="v3-table"><table><tr><th>Circuito</th><th>Carreras</th><th>Mejor</th><th>🏆</th><th>🍾</th><th>⏱️ Mejor vuelta</th></tr>${names.map(n => { const r = rec[n]; return `<tr${n === (trackData[s.gp] || {}).name ? ' class="mine-row"' : ""}><td>${v3Esc(n)}</td><td>${r.races}</td><td>${r.best ? "P" + r.best + (r.bestYear ? ` <span class="small">${r.bestYear}</span>` : "") : "—"}</td><td>${r.wins}</td><td>${r.pods}</td><td>${fmt(r.bestLap)}</td></tr>`; }).join("")}</table></div>` : `<p class="small">Todavía no corriste ninguna carrera. Acá se van a guardar tu mejor resultado, victorias, podios y mejor vuelta en cada circuito.</p>`}`;
}
function v3HofStats() {
  const H = v3Hof();
  const nm = s.playerMode === "driver" ? (s.playedDriverName || s.name) : (s.name || "Vos");
  return { nm, wins: s.wins || 0, pods: s.podiums || 0, poles: s.poles || 0, titles: s.titles || 0, seasons: s.seasonsCompleted || 0, teams: H.teams.map(t => t.team), moments: H.moments.slice(-8).reverse(), tracks: Object.keys(s.trkRec || {}).filter(n => s.trkRec[n].wins > 0) };
}
function v3HofCardHtml() {
  const S = v3HofStats();
  const tier = S.titles >= 3 ? "👑 Leyenda absoluta" : S.titles >= 1 ? "🏆 Campeón del mundo" : S.wins >= 5 ? "⭐ Ganador de carreras" : S.pods >= 3 ? "🍾 Piloto de podio" : "🌱 En construcción";
  return `<h2>🏛️ Salón de la fama</h2>
    <div class="v3-hof-top"><div><b>${v3Esc(S.nm)}</b><span class="small">${tier}</span></div><button type="button" onclick="v3HofOpen()">🏛️ Ver ceremonia</button></div>
    <div class="v3-hof-stats">${[["🏆", "Victorias", S.wins], ["🍾", "Podios", S.pods], ["⏱️", "Poles", S.poles], ["🥇", "Títulos", S.titles], ["📅", "Temporadas", S.seasons]].map(x => `<div><i>${x[0]}</i><b>${x[2]}</b><span>${x[1]}</span></div>`).join("")}</div>
    <p class="small">🏎️ Equipos: ${S.teams.length ? S.teams.map(v3Esc).join(" → ") : v3Esc(s.team)}</p>
    ${S.moments.length ? `<div class="v3-moments">${S.moments.map(m => `<p><em>${m.y}</em> ${v3Esc(m.txt)}</p>`).join("")}</div>` : `<p class="small">Tus mejores momentos (victorias, podios, títulos) se van a guardar acá.</p>`}`;
}
function v3HofOpen() {
  const S = v3HofStats();
  let ov = document.getElementById("hofOverlay");
  if (!ov) { ov = document.createElement("div"); ov.id = "hofOverlay"; ov.addEventListener("click", e => { if (e.target === ov) v3HofClose(); }); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="hof-card"><div class="hof-k">SALÓN DE LA FAMA · FAWIWE</div><div class="hof-plate">🏛️</div><h2>${v3Esc(S.nm)}</h2>
    <div class="hof-sub">${S.teams.length ? S.teams.map(v3Esc).join(" · ") : v3Esc(s.team)} · ${S.seasons} temporada${S.seasons === 1 ? "" : "s"}</div>
    <div class="v3-hof-stats big">${[["🏆", "Victorias", S.wins], ["🍾", "Podios", S.pods], ["⏱️", "Poles", S.poles], ["🥇", "Títulos", S.titles]].map(x => `<div><i>${x[0]}</i><b>${x[2]}</b><span>${x[1]}</span></div>`).join("")}</div>
    ${S.tracks.length ? `<p class="hof-tr">🏁 Ganó en: ${S.tracks.map(v3Esc).join(", ")}</p>` : ""}
    ${S.moments.length ? `<div class="v3-moments">${S.moments.map(m => `<p><em>${m.y}</em> ${v3Esc(m.txt)}</p>`).join("")}</div>` : ""}
    <button type="button" class="lv-btn red" onclick="v3HofClose()">Cerrar</button></div>`;
  ov.classList.add("show");
  try { v3Fanfare(true); } catch (e) {}
}
function v3HofClose() { const ov = document.getElementById("hofOverlay"); if (ov) ov.classList.remove("show"); }

/* ---------------------------------- 3) PRETEMPORADA ---------------------------------- */
const V3_PRE = [
  { id: "rel", ic: "🔧", t: "Fiabilidad", d: "Muchas vueltas tranquilas para encontrar fallas antes de que aparezcan en carrera." },
  { id: "q", ic: "⏱️", t: "Vuelta rápida", d: "Poco combustible y gomas blandas: buscás el límite del auto nuevo." },
  { id: "race", ic: "🛞", t: "Simulación de carrera", d: "Tandas largas con mucho combustible para entender el desgaste." }
];
function v3PreOn() { return v3Game() && !s.player2 && s.gp === 0 && (s.session || 0) === 0 && !s.raceDone && s.preseason !== s.season; }
function v3PreWhere() { return s.season >= 2021 ? "Bahréin" : s.season >= 1995 ? "Montmeló" : "Paul Ricard"; }
function v3PreCardHtml() {
  if (s.preseasonRes && s.preseasonRes.y === s.season) return `<h2>🧪 Pretemporada ${s.season} · ${v3PreWhere()}</h2><p>${v3Esc(s.preseasonRes.txt)}</p>`;
  return `<h2>🧪 Pretemporada ${s.season} · tests en ${v3PreWhere()}</h2>
    <p class="small">Tres días de pruebas antes de la primera fecha. Elegí un programa de trabajo (uno solo por temporada):</p>
    <div class="choice-grid">${V3_PRE.map(p => `<button type="button" class="choice-card" onclick="v3PreRun('${p.id}')"><b>${p.ic} ${p.t}</b><span class="small">${p.d}</span></button>`).join("")}</div>`;
}
function v3PreRun(id) {
  if (s.preseason === s.season) return;
  s.preseason = s.season;
  const P = V3_PRE.find(p => p.id === id) || V3_PRE[0];
  const laps = 300 + v3H("prelaps" + s.season + id) % 160;
  const teams = (typeof getTeamsForYear === "function" ? getTeamsForYear(s.season) : []).length || 10;
  const carRank = Math.max(1, Math.min(teams, Math.round(teams - ((s.car || 50) / 100) * teams + (v3H("prerk" + s.season) % 5) - 2)));
  const drv = s.playerMode === "driver";
  let fx = "";
  const cl = v => Math.max(0, Math.min(100, v));
  if (id === "rel") { s.car = cl((s.car || 50) + 1); if (drv) s.health = cl((s.health || 90) + 3); else s.trust = cl((s.trust || 50) + 3); fx = "+1 auto · " + (drv ? "+3 salud" : "+3 confianza") + ""; }
  else if (id === "q") { s.car = cl((s.car || 50) + 1); if (drv) s.focus = cl((s.focus || 55) + 4); else s.pop = cl((s.pop || 50) + 3); fx = "+1 auto · " + (drv ? "+4 enfoque" : "+3 popularidad") + " · la prensa habla de tus tiempos"; }
  else { s.car = cl((s.car || 50) + 0.5); s.experience = (s.experience || 0) + 1; if (drv) s.focus = cl((s.focus || 55) + 2); else s.trust = cl((s.trust || 50) + 2); fx = "+0,5 auto · +1 experiencia · " + (drv ? "+2 enfoque" : "+2 confianza"); }
  const txt = P.ic + " Programa de " + P.t.toLowerCase() + ": " + laps + " vueltas en " + v3PreWhere() + ". En la tabla de tiempos de los tests el equipo quedó P" + carRank + " de " + teams + ". (" + fx + ")";
  s.preseasonRes = { y: s.season, txt };
  add("🧪 Pretemporada: " + txt);
  try { if (typeof fwRadioSay === "function") fwRadioSay(carRank <= 3 ? "Los tests salieron muy bien. Este auto tiene algo." : carRank <= teams / 2 ? "Tests correctos. Hay trabajo, pero vamos bien." : "Tests difíciles. Nos falta ritmo, a trabajar.", "eng"); } catch (e) {}
  render();
}

/* ---------------------------------- 4) RUMORES DE MERCADO ---------------------------------- */
function v3Rumors() {
  if (s.player2 || ![3, 6, 8].includes(s.gp)) return;
  const tag = s.season + "_" + s.gp;
  if (s._rumorTag === tag) return;
  s._rumorTag = tag;
  const ny = s.season + 1;
  let teams = [];
  try { teams = getTeamsForYear(ny).map(t => t[0]); } catch (e) { return; }
  const cands = [];
  teams.forEach(tm => { try { currentTeamLineup(tm).forEach(d => { if (d && d[0] && d[0] !== s.playedDriverName) cands.push({ n: d[0], tm }); }); } catch (e) {} });
  const real = cands.filter(c => v3H("transfer_" + c.n + "_" + ny) % 100 < 12);
  const fake = cands.filter(c => { const h = v3H("transfer_" + c.n + "_" + ny) % 100; return h >= 12 && h < 22; });
  s._rumorSaid = s._rumorSaid || {};
  const say = [];
  const pick = (arr, salt) => arr.filter(c => !s._rumorSaid[c.n + ny]).sort((a, b) => v3H(salt + a.n) - v3H(salt + b.n))[0];
  if (s.gp === 3 || s.gp === 6) {
    const r = pick(real, "r" + s.gp), f = pick(fake, "f" + s.gp);
    [r, f].forEach(c => {
      if (!c) return;
      s._rumorSaid[c.n + ny] = true;
      const others = teams.filter(t => t !== c.tm);
      const to = others[v3H("transfertarget_" + c.n + "_" + ny) % Math.max(1, others.length)] || "otro equipo";
      say.push("📰 Rumor de mercado: " + c.n + " (" + c.tm + ") estaría negociando con " + to + " para " + ny + ".");
    });
  } else {
    Object.keys(s._rumorSaid).filter(k => k.endsWith(String(ny))).forEach(k => {
      const n = k.slice(0, -String(ny).length);
      const c = cands.find(x => x.n === n); if (!c) return;
      const isReal = v3H("transfer_" + n + "_" + ny) % 100 < 12;
      say.push(isReal ? "📰 Se calienta el mercado: el entorno de " + n + " no desmiente su salida de " + c.tm + "." : "📰 Desmentido: " + n + " aseguró que sigue en " + c.tm + " el año que viene.");
    });
  }
  say.slice(0, 2).forEach(t => add(t));
}

/* ---------------------------------- 5) PODIO ---------------------------------- */
function v3Fanfare(soft) {
  if (typeof s !== "undefined" && s && s.soundOn === false) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  if (!window._v3ac) window._v3ac = new AC();
  const c = window._v3ac; if (c.state === "suspended") c.resume();
  // fanfarria original (no es ningún himno real): arpegio mayor y acorde final
  const notes = soft ? [[523, 0, .25], [659, .22, .25], [784, .44, .5]] : [[392, 0, .18], [523, .18, .18], [659, .36, .18], [784, .54, .36], [659, .9, .16], [784, 1.06, .7], [1047, 1.06, .9]];
  const t0 = c.currentTime + 0.05;
  notes.forEach(([f, at, d]) => {
    ["triangle", "square"].forEach((type, k) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = f * (k ? 0.5 : 1);
      g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(k ? 0.02 : 0.07, t0 + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + d);
      o.connect(g); g.connect(c.destination); o.start(t0 + at); o.stop(t0 + at + d + 0.05);
    });
  });
}
function v3Podium(grid) {
  const top = (grid || []).filter(e => !e.status && e.pos).sort((a, b) => a.pos - b.pos).slice(0, 3);
  if (top.length < 3) return;
  const me = v3MyRace(grid);
  const iMine = s.playerMode === "driver" ? (me && !me.status && me.pos <= 3) : top.some(e => e.mine);
  if (!iMine) return;
  let ov = document.getElementById("podOverlay");
  if (!ov) { ov = document.createElement("div"); ov.id = "podOverlay"; ov.addEventListener("click", v3PodClose); document.body.appendChild(ov); }
  const col = e => (typeof teamColors !== "undefined" && teamColors[e.team]) || "#888";
  const step = (e, n) => `<div class="pod-step p${n} ${e.mine ? "mine" : ""}"><div class="pod-drv"><span class="pod-cap" style="background:${col(e)}"></span><b>${v3Esc(e.name.replace(" (reserva)", ""))}</b><span>${v3Esc(e.team)}</span>${n === 1 ? '<i class="pod-trophy">🏆</i>' : ""}${e.mine ? `<i class="pod-spray">${Array.from({ length: 16 }, (_, k) => `<b style="--x:${((k * 53) % 120) - 60}px;--y:${-60 - (k * 29) % 90}px;animation-delay:${1.5 + (k % 8) * 0.12}s"></b>`).join("")}</i>` : ""}</div><div class="pod-block" style="--tc:${col(e)}"><em>${n}</em></div></div>`;
  const conf = Array.from({ length: 46 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 12) * 0.13}s;background:${["#e10600", "#facc15", "#fff", "#22c55e", "#38bdf8"][i % 5]}"></i>`).join("");
  ov.innerHTML = `<div class="pod-conf">${conf}</div><div class="pod-wrap"><div class="pod-k">🍾 PODIO · GP DE ${v3Esc(((trackData[s.gp] || {}).name || "").toUpperCase())}</div>
    <div class="pod-stage">${step(top[1], 2)}${step(top[0], 1)}${step(top[2], 3)}</div><div class="pod-tap">Tocá para continuar</div></div>`;
  ov.classList.add("show");
  try { v3Fanfare(); } catch (e) {}
  try { if (typeof fwRadioSay === "function" && s.playerMode !== "driver") fwRadioSay("¡Podio para el equipo! ¡Qué carrera!", "drv"); } catch (e) {}
  clearTimeout(ov._t); ov._t = setTimeout(v3PodClose, 9000);
}
function v3PodClose() { const ov = document.getElementById("podOverlay"); if (ov) ov.classList.remove("show"); }

/* ---------------------------------- 6) AUTOGUARDADO ---------------------------------- */
function v3AutoSave() {
  try {
    if (!v3Game() || s.gameOver || typeof saveSlotKey !== "function") return;
    const mode = s.playerMode || "engineer";
    localStorage.setItem(saveSlotKey(mode, "auto"), JSON.stringify({ state: s, meta: { name: s.playerMode === "driver" ? (s.playedDriverName || s.name) : s.name, team: s.team, season: s.season, gp: s.gp, points: s.points, savedAt: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) } }));
    let el = document.getElementById("v3Saved");
    if (!el) { el = document.createElement("div"); el.id = "v3Saved"; document.body.appendChild(el); }
    el.textContent = "💾 Autoguardado"; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  } catch (e) {}
}
function v3LoadAuto(mode) {
  const data = typeof readSaveSlot === "function" ? readSaveSlot(mode, "auto") : null;
  if (!data) return;
  try { V5_KEYS.forEach(k => { if (!(k in data.state)) delete s[k]; }); } catch (e) {}
  Object.assign(s, data.state);
  document.getElementById("setup")?.classList.add("hidden");
  document.getElementById("juniorCareer")?.classList.add("hidden");
  document.getElementById("loadScreenBox")?.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  try { applyTeamColor(); } catch (e) {}
  add("📂 Cargaste el autoguardado.");
  render();
}

/* ---------------------------------- tarjetas + ganchos ---------------------------------- */
function v3Card(id, html, on, anchorSel, before) {
  let card = document.getElementById(id);
  if (!card && on) {
    const anchor = document.querySelector(anchorSel) || document.getElementById("jobCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = id; card.className = "card";
    anchor.parentNode.insertBefore(card, before ? anchor : anchor.nextSibling);
  }
  if (!card) return;
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = html();
}
(function () {
  try {
    if (typeof DASH_NAV !== "undefined") {
      const g = DASH_NAV.find(x => x[0] === "MUNDO");
      if (g && !g[1].find(i => i[0] === "REC")) g[1].push(["REC", "Récords por circuito", "#trkRecCard"], ["HOF", "Salón de la fama", "#hofCard"]);
      const e = DASH_NAV.find(x => x[0] === "EQUIPO");
      if (e && !e[1].find(i => i[0] === "PRE")) e[1].splice(1, 0, ["PRE", "Pretemporada", "#preCard"]);
    }
  } catch (e) {}
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try {
      const on = v3Game();
      if (on) { const H = v3Hof(); const last = H.teams[H.teams.length - 1]; if (!last || last.team !== s.team) H.teams.push({ team: s.team, from: s.season }); }
      v3Card("preCard", v3PreCardHtml, on && !s.player2 && (v3PreOn() || (s.preseasonRes && s.preseasonRes.y === s.season && s.gp === 0 && !s.raceDone)), "#jobCard", true);
      v3Card("trkRecCard", v3RecCardHtml, on, "#rlRelCard, #homeCard, #jobCard");
      v3Card("hofCard", v3HofCardHtml, on, "#trkRecCard");
      if (on && s.gameOver && s._hofShown !== s.season + "_" + s.gp) { s._hofShown = s.season + "_" + s.gp; setTimeout(v3HofOpen, 1400); }
    } catch (e) { console.warn("[FAWIWE] v133:", e); }
    return x;
  };
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind, title, sub, cls, grid) {
    const r = sb.apply(this, arguments);
    try {
      if (/^CARRERA/.test(String(kind)) && Array.isArray(grid) && !s.player2) {
        v3Records(grid);
        const me = v3MyRace(grid);
        setTimeout(() => v3Podium(grid), 650);
      }
    } catch (e) { console.warn("[FAWIWE] podio:", e); }
    return r;
  };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const ps = s.season, pg = s.gp, tt = s.titles || 0;
    const r = ng.apply(this, arguments);
    try {
      if ((s.titles || 0) > tt) v3Moment("👑 ¡Campeón del mundo " + ps + "!", ps);
      if (s.season !== ps || s.gp !== pg) { v3Rumors(); v3AutoSave(); }
    } catch (e) {}
    return r;
  };
  const rc = window.retireCareer;
  if (typeof rc === "function") window.retireCareer = function () { const r = rc.apply(this, arguments); setTimeout(v3HofOpen, 1500); return r; };
  const ls = window.renderLoadScreen;
  if (typeof ls === "function") window.renderLoadScreen = function () {
    const r = ls.apply(this, arguments);
    try {
      [["driver", "loadSlotsDriver"], ["engineer", "loadSlotsEngineer"]].forEach(([mode, id]) => {
        const box = document.getElementById(id); const d = readSaveSlot(mode, "auto");
        if (box && d) box.insertAdjacentHTML("afterbegin", `<div class="driver v3-auto"><div><b>🔄 Autoguardado · ${v3Esc(d.meta.name)}</b><br><span class="small">${v3Esc(d.meta.team)} · Temporada ${d.meta.season} · GP ${d.meta.gp + 1} · ${d.meta.points} pts · ${v3Esc(d.meta.savedAt)}</span></div><button onclick="v3LoadAuto('${mode}')">Cargar</button></div>`);
      });
    } catch (e) {}
    return r;
  };
  document.addEventListener("keydown", ev => {
    const pod = document.getElementById("podOverlay");
    if (pod && pod.classList.contains("show") && (ev.key === "Enter" || ev.key === "Escape" || ev.key === " ")) { ev.preventDefault(); v3PodClose(); }
    const hof = document.getElementById("hofOverlay");
    if (hof && hof.classList.contains("show") && ev.key === "Escape") v3HofClose();
  });
})();

/* ---------------------------------- ingeniero de pista en Relaciones ---------------------------------- */
(function () {
  if (typeof rlRelCardHtml !== "function" || typeof dlEng !== "function") return;
  const o = rlRelCardHtml;
  rlRelCardHtml = function () {
    let h = o.apply(this, arguments);
    try {
      const E = dlEng(), st = DL_ENG_STYLE[E.style] || { lbl: "" };
      const mood = E.rel >= 75 ? "Se entienden de memoria: +ritmo en cada carrera" : E.rel >= 45 ? "Buena comunicación por radio" : E.rel >= 30 ? "Le cuesta confiar en vos" : "Casi no se hablan: te cuesta ritmo";
      h += `<div class="v3-eng"><div>🎧 Tu ingeniero de pista: <b>${v3Esc(E.name)}</b> · ${st.lbl} <b style="float:right">${E.rel}</b><div class="home-bar"><i style="width:${E.rel}%;background:#38bdf8"></i></div><span class="small">${mood}. Sube cuando seguís sus consejos por radio y baja cuando lo ignorás.</span></div></div>`;
    } catch (e) {}
    return h;
  };
})();

/* ---------------------------------- V135: trazados aproximados de cada circuito ---------------------------------- */
const FW_MAP_PTS = {
  "Bahréin": [[40,95],[150,95],[165,88],[160,75],[130,72],[120,62],[135,50],[170,48],[178,35],[165,25],[120,28],[95,40],[80,30],[60,22],[40,30],[35,50],[55,60],[45,75],[30,82]],
  "Arabia Saudita": [[20,100],[25,40],[35,20],[55,15],[60,30],[70,25],[80,35],[90,28],[100,40],[110,32],[125,45],[150,40],[175,50],[180,70],[165,85],[120,92],[60,105],[30,110]],
  "Australia": [[40,90],[30,70],[35,45],[55,30],[85,22],[120,20],[150,28],[170,45],[175,65],[160,80],[140,85],[130,95],[100,100],[70,98]],
  "Japón": [[30,80],[60,85],[90,80],[110,65],[120,50],[105,40],[90,48],[95,62],[115,72],[150,75],[175,65],[180,45],[160,30],[130,32],[110,45],[100,60],[80,72],[55,65],[35,60],[25,70]],
  "China": [[30,95],[160,95],[175,85],[170,70],[150,65],[100,62],[70,58],[55,45],[65,32],[85,38],[90,52],[110,40],[135,25],[165,22],[172,36],[150,46],[60,50],[30,55],[22,75]],
  "Miami": [[20,70],[30,90],[80,100],[130,98],[180,90],[185,75],[160,70],[150,55],[170,45],[175,30],[140,25],[100,30],[70,35],[55,50],[40,40],[25,45]],
  "San Marino": [[30,70],[60,80],[90,85],[130,90],[160,85],[175,70],[170,50],[150,40],[120,35],[90,25],[60,20],[40,30],[50,45],[35,55]],
  "Emilia-Romaña": [[30,70],[60,80],[90,85],[130,90],[160,85],[175,70],[170,50],[150,40],[120,35],[90,25],[60,20],[40,30],[50,45],[35,55]],
  "Canadá": [[15,70],[30,60],[60,55],[100,50],[150,40],[185,35],[190,45],[170,50],[120,62],[80,72],[40,80],[20,82]],
  "España": [[30,95],[140,95],[170,85],[175,65],[150,55],[120,60],[100,50],[120,35],[150,30],[170,20],[140,15],[90,20],[60,25],[40,40],[55,55],[40,70],[25,80]],
  "Austria": [[30,90],[120,95],[175,85],[180,70],[140,60],[100,50],[150,30],[160,18],[130,15],[60,40],[30,60],[25,80]],
  "Gran Bretaña": [[40,90],[80,100],[120,95],[150,80],[175,60],[165,40],[140,35],[130,20],[100,15],[70,25],[80,40],[60,50],[35,45],[25,65]],
  "Hungría": [[30,40],[140,35],[170,45],[165,60],[140,65],[120,55],[100,65],[115,80],[150,85],[160,100],[120,105],[60,100],[40,85],[55,70],[35,60]],
  "Países Bajos": [[30,80],[40,40],[70,25],[110,20],[150,30],[175,55],[165,80],[140,90],[120,75],[100,85],[80,100],[50,100]],
  "Azerbaiyán": [[20,95],[180,95],[185,80],[170,75],[150,60],[120,58],[110,40],[90,42],[80,25],[60,28],[55,45],[40,50],[30,70]],
  "Singapur": [[25,90],[25,40],[50,40],[55,25],[100,25],[105,45],[140,45],[140,25],[175,25],[175,70],[150,70],[150,95],[100,95],[95,80],[60,80],[55,95]],
  "Estados Unidos": [[25,80],[40,30],[55,45],[70,35],[85,50],[100,40],[115,55],[130,50],[150,60],[180,75],[170,90],[120,85],[90,95],[60,100],[40,95]],
  "México": [[20,40],[170,40],[185,55],[175,65],[150,60],[140,75],[160,85],[150,100],[100,100],[70,90],[60,75],[30,70]],
  "Las Vegas": [[20,95],[20,60],[50,55],[60,30],[100,25],[185,25],[185,45],[120,50],[115,70],[185,75],[185,95]],
  "Qatar": [[30,90],[150,92],[175,80],[178,60],[160,45],[170,30],[150,20],[110,25],[90,40],[60,30],[35,40],[40,60],[25,75]],
  "Abu Dhabi": [[25,60],[40,40],[80,35],[120,30],[170,25],[180,40],[150,50],[140,65],[160,75],[150,95],[110,95],[90,80],[70,95],[40,90]],
  "Argentina": [[30,80],[40,40],[80,30],[120,35],[160,30],[175,50],[150,65],[170,85],[130,95],[90,85],[60,95]],
  "Malasia": [[30,90],[30,40],[55,30],[70,45],[90,30],[120,40],[150,30],[175,45],[160,65],[130,70],[100,65],[110,85],[60,95]],
  "Turquía": [[30,70],[45,40],[70,30],[80,50],[95,40],[130,30],[165,40],[180,65],[160,85],[120,80],[100,95],[60,100],[40,90]],
  "Portugal": [[30,85],[40,40],[80,25],[110,40],[140,30],[170,40],[175,65],[150,80],[120,70],[100,90],[60,95]],
  "Alemania": [[30,60],[60,35],[110,20],[170,25],[180,40],[150,50],[110,50],[140,70],[120,85],[90,80],[70,95],[40,90]],
  "Francia": [[25,70],[60,60],[110,50],[170,40],[185,55],[150,70],[130,90],[90,95],[60,85],[40,95],[20,85]]
};
function fwMapSmooth(P) {
  const n = P.length, f = v => v.toFixed(1);
  let d = "M" + f(P[0][0]) + "," + f(P[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += " C" + f(c1[0]) + "," + f(c1[1]) + " " + f(c2[0]) + "," + f(c2[1]) + " " + f(p2[0]) + "," + f(p2[1]);
  }
  return d + " Z";
}
(function () {
  const o = fwMapPath;
  fwMapPath = function (name) {
    if (FW_MAP_ALIAS[name]) return o(name);
    const P = FW_MAP_PTS[name];
    return P ? fwMapSmooth(P) : o(name);
  };
})();
