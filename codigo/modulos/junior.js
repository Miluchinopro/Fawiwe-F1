/* =====================================================================================
   FAWIWE · CAMINO A LA F1: elegí dónde arrancás (Karting, F4, F3, F2 o directo a F1)
   y una mini cinemática cada vez que subís de categoría mostrando el auto nuevo.
   Las categorías son las reales de la época elegida (GP2, F3000, F. Renault…).
   ===================================================================================== */
let jrStartIdx = 0; // índice de la categoría elegida para arrancar ("f1" = directo)
function jrClean(t) { return String(t || "").replace(/^[^\wÁÉÍÓÚáéíóúñÑ]+/, "").trim(); }
function jrKind(st, isLast) {
  const t = (st && (st.title || "")) || "";
  if (st && st.key === "karting" || /karting/i.test(t)) return "kart";
  if (/F[óo]rmula 4|Renault|BMW/i.test(t)) return "f4";
  if (st && st.key === "f3" && !isLast) return "f3";
  return "f2";
}
function jrRawStages() {
  const y = parseInt(document.getElementById("startYear")?.value || "2026", 10);
  try { return window.__jrOrigStages ? window.__jrOrigStages(y) : juniorStagesForYear(y); } catch (e) { return []; }
}
function jrPopulate() {
  const sel = document.getElementById("juniorStartSel");
  if (!sel) return;
  const prev = sel.value;
  const st = jrRawStages();
  sel.innerHTML = st.map((x, i) => `<option value="${i}">${i === 0 ? "🧒" : "🏁"} ${jrClean(x.title)}</option>`).join("") + `<option value="f1">🏎️ Directo a la Fórmula 1</option>`;
  if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
}
(function jrInjectUI() {
  const anchor = document.getElementById("driverPickBox");
  if (!anchor || document.getElementById("juniorStartBox")) return;
  const box = document.createElement("div");
  box.id = "juniorStartBox";
  box.className = "hidden";
  box.innerHTML = `<label>🏁 ¿Dónde arranca tu carrera?</label><select id="juniorStartSel"></select>
    <p class="small">Las categorías son las reales de la época que elegiste. Cada vez que subís, una mini cinemática te muestra el auto nuevo.</p>`;
  anchor.parentNode.insertBefore(box, anchor.nextSibling);
  jrPopulate();
  document.getElementById("startYear")?.addEventListener("change", jrPopulate);
  ["focus", "mousedown", "touchstart"].forEach(ev => document.getElementById("juniorStartSel")?.addEventListener(ev, jrPopulate, { passive: true }));
})();
(function () {
  const om = window.onPlayerModeChange;
  if (typeof om === "function") window.onPlayerModeChange = function () {
    const r = om.apply(this, arguments);
    const isDrv = document.getElementById("playerModeSel")?.value === "driver";
    document.getElementById("juniorStartBox")?.classList.toggle("hidden", !isDrv);
    if (isDrv) jrPopulate();
    return r;
  };
  // cortar el camino desde la categoría elegida
  const js = window.juniorStagesForYear;
  if (typeof js === "function") {
    window.__jrOrigStages = js;
    window.juniorStagesForYear = function (year) {
      const all = js.apply(this, arguments);
      const v = document.getElementById("juniorStartSel")?.value || "0";
      if (v === "f1") { jrStartIdx = "f1"; return []; }
      const i = Math.max(0, Math.min(all.length - 1, parseInt(v, 10) || 0));
      jrStartIdx = i;
      return all.slice(i);
    };
  }
  const rj = window.renderJuniorStep;
  if (typeof rj === "function") window.renderJuniorStep = function () {
    const r = rj.apply(this, arguments);
    try {
      if (!juniorStagesCache.length) {
        const box = document.getElementById("juniorCareerBody");
        box?.querySelectorAll("p").forEach(p => { if (/Recorriste/.test(p.textContent)) p.textContent = "Elegiste saltear las categorías juveniles: arrancás directo en la Fórmula 1."; });
      }
      if (juniorStep >= juniorStagesCache.length) {
        const n = jrSkipCount(juniorStagesCache.length);
        const box = document.getElementById("juniorCareerBody");
        if (box && !box.querySelector(".jr-time")) {
          const d = document.createElement("div"); d.className = "mini-explain jr-time";
          d.innerHTML = n > 0 ? `⏳ <b>Mientras subías de categoría pasó ${n >= 9 ? "casi toda la" : n >= 7 ? "tres cuartos de la" : n >= 5 ? "la mitad de la" : "un cuarto de la"} temporada ${juniorCareerYear} de F1</b> (un cuarto por categoría). Debutás en el <b>GP ${n + 1}: ${engEsc((trackData[n] || {}).name || "")}</b>${n === 9 ? " — ¡la última fecha, con doble puntos!" : "."}`
            : "🏁 Debutás en el <b>GP 1</b> de la temporada: no pasó nada del año todavía.";
          box.insertBefore(d, box.querySelector(".start-btn"));
        }
      }
    } catch (e) {}
    return r;
  };
  // mini cinemática al subir de categoría
  const adv = window.advanceJuniorStage;
  if (typeof adv === "function") window.advanceJuniorStage = function () {
    const self = this, args = arguments;
    const cur = juniorStagesCache[juniorStep], next = juniorStagesCache[juniorStep + 1];
    if (!cur || !next) return adv.apply(self, args);
    jrPromo(cur, next || null, juniorStep + 1 === juniorStagesCache.length - 1, () => adv.apply(self, args));
  };
  const fin = window.finishJuniorCareer;
  if (typeof fin === "function") window.finishJuniorCareer = function () {
    const self = this, args = arguments;
    const last = juniorStagesCache[juniorStagesCache.length - 1] || null;
    const q = juniorStagesCache.length;
    jrPromo(last, null, false, () => { fin.apply(self, args); try { jrSkipQuarters(q); } catch (e) { console.warn(e); } });
  };
})();

/* ---------- autos de cada categoría (vista de costado, diseños propios) ---------- */
function jrWheel(cx, cy, r) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#111"/><circle cx="${cx}" cy="${cy}" r="${Math.max(3, r * 0.42)}" fill="#55555f"/>`; }
function jrCarSvg(kind, year, color) {
  const y = year || 2026, c = color || "#e10600";
  const halo = y >= 2018;
  const helmet = (x, yy) => `<circle cx="${x}" cy="${yy}" r="8" fill="#f5f5f5"/><rect x="${x - 2}" y="${yy - 3}" width="10" height="4" rx="2" fill="#222"/>`;
  if (kind === "kart") {
    return `<svg class="evo-svg" viewBox="0 0 300 92" aria-hidden="true">
      <rect x="40" y="58" width="220" height="7" rx="3" fill="#2a2a33"/><path d="M30 60 Q34 50 52 50 L70 50 L70 62 L34 64 Z" fill="${c}"/>
      <rect x="236" y="48" width="40" height="14" rx="6" fill="${c}"/><rect x="120" y="44" width="56" height="16" rx="6" fill="${c}"/>
      <path d="M140 44 L150 22 L166 22 L172 44 Z" fill="#1f2937"/><rect x="150" y="24" width="14" height="20" rx="4" fill="${c}"/>${helmet(160, 18)}
      <line x1="150" y1="34" x2="128" y2="40" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/><circle cx="126" cy="40" r="5" fill="none" stroke="#333" stroke-width="3"/>
      ${jrWheel(62, 70, 13)}${jrWheel(232, 70, 14)}</svg>`;
  }
  if (y < 1985 && (kind === "f3" || kind === "f2")) return fwCarSvg(y, c);
  if (kind === "f4") {
    return `<svg class="evo-svg" viewBox="0 0 300 92" aria-hidden="true">
      <rect x="8" y="22" width="24" height="8" rx="2" fill="#111"/><rect x="18" y="28" width="5" height="22" fill="#111"/>
      <path d="M18 58 L40 44 L120 40 L146 32 L172 32 L186 42 L240 48 L288 56 L288 62 L18 64 Z" fill="${c}"/>
      ${halo ? `<path d="M150 33 Q164 20 180 34" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>` : ""}${helmet(166, 30)}
      <path d="M262 60 L294 58 L294 64 L262 64 Z" fill="#111"/><rect x="60" y="50" width="150" height="3" fill="#fff"/>
      <text x="96" y="49" font-family="Titillium Web,Arial" font-weight="900" font-style="italic" font-size="11" fill="#fff">F4</text>
      ${jrWheel(64, 64, 18)}${jrWheel(236, 66, 16)}</svg>`;
  }
  if (kind === "f3") {
    return `<svg class="evo-svg" viewBox="0 0 300 92" aria-hidden="true">
      <rect x="4" y="14" width="30" height="10" rx="2" fill="#111"/><rect x="2" y="10" width="34" height="5" rx="2" fill="${c}"/><rect x="16" y="22" width="6" height="26" fill="#111"/>
      <path d="M16 56 L48 44 L118 40 L146 30 L174 30 L188 41 L244 47 L292 56 L292 62 L16 65 Z" fill="${c}"/>
      ${halo ? `<path d="M148 31 Q164 16 182 32" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>` : ""}${helmet(166, 28)}
      <path d="M250 61 L298 59 L298 66 L250 66 Z" fill="#111"/><rect x="56" y="50" width="170" height="4" fill="#fff"/>
      <text x="100" y="48" font-family="Titillium Web,Arial" font-weight="900" font-style="italic" font-size="12" fill="#fff">F3</text>
      ${jrWheel(66, 65, 19)}${jrWheel(234, 67, 17)}</svg>`;
  }
  // f2 (o GP2 / F3000): casi un F1
  const base = fwCarSvg(y >= 2018 ? 2026 : Math.max(1988, y), c);
  return base.replace(">FW<", ">F2<");
}
function jrCatShort(st, isLast) {
  if (!st) return "F1";
  const k = jrKind(st, isLast);
  const t = jrClean(st.title);
  return k === "kart" ? "KARTING" : t.replace(/^FIA /, "").toUpperCase();
}
/* ---------- la mini cinemática ---------- */
function jrPromo(cur, next, nextIsLast, done) {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return done();
  const y = juniorCareerYear || 2026;
  const curLast = juniorStagesCache.indexOf(cur) === juniorStagesCache.length - 1;
  const fromK = cur ? jrKind(cur, curLast) : null;
  const toK = next ? jrKind(next, nextIsLast) : "f1";
  const colors = { kart: "#facc15", f4: "#38bdf8", f3: "#a855f7", f2: "#22c55e" };
  const teamColor = (typeof teamColors !== "undefined" && teamColors[document.getElementById("club")?.value]) || "#e10600";
  const toSvg = toK === "f1" ? fwCarSvg(fwEra(y).y, teamColor) : jrCarSvg(toK, y, colors[toK]);
  const fromSvg = cur ? jrCarSvg(fromK, y, colors[fromK]) : "";
  const fromName = cur ? jrCatShort(cur, curLast) : "";
  const toName = next ? jrCatShort(next, nextIsLast) : "FÓRMULA 1";
  const lines = '<svg class="bc-lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${6 + k * 12}" width="${388 - k * 24}" height="${288 - k * 24}" rx="${60 - k * 10}" pathLength="1" style="animation-delay:${(0.9 + k * 0.1).toFixed(2)}s"/>`).join("") + "</svg>";
  const ov = document.createElement("div");
  ov.id = "jrPromo";
  ov.innerHTML = `<div class="jp-streak"></div>
    <div class="jp-k"><span class="bc-badge">F1</span>${next ? "¡ASCENSO DE CATEGORÍA!" : "¡LLEGASTE A LA FÓRMULA 1!"}</div>
    <div class="jp-road"></div>
    ${fromSvg ? `<div class="jp-car old">${fromSvg}<span>${fromName}</span></div>` : ""}
    <div class="jp-car new">${toSvg}<span>${toName}</span></div>
    <div class="jp-plate">${lines}<div class="jp-from">${fromName ? fromName + " ➜" : "DEBUT"}</div><div class="jp-to">${toName}</div><div class="jp-year">${y}</div></div>
    <div class="jp-skip">Tocá para seguir ⏭️</div>`;
  document.body.appendChild(ov);
  try { if (typeof FWAudio !== "undefined") { FWAudio.unlock(); FWAudio.whoosh(); setTimeout(() => { try { FWAudio.rev ? FWAudio.rev() : FWAudio.whoosh(); } catch (e) {} }, 650); setTimeout(() => { try { FWAudio.fanfare(); } catch (e) {} }, 1200); } } catch (e) {}
  let gone = false;
  const end = () => { if (gone) return; gone = true; ov.classList.add("bye"); setTimeout(() => ov.remove(), 350); done(); };
  ov.addEventListener("click", end);
  setTimeout(end, 3300);
}

/* ---------- el tiempo pasa: un cuarto de temporada de F1 por cada categoría ---------- */
function jrSkipCount(q) { return Math.min(9, Math.round((q || 0) * 2.5)); }
function jrSkipQuarters(q) {
  const n = jrSkipCount(q);
  if (!n || s.playerMode !== "driver") return;
  const me = s.playedDriverName;
  const keepPts = me && s.driverPoints ? (s.driverPoints[me] || 0) : 0;
  const keepWins = me && s.driverWins ? (s.driverWins[me] || 0) : 0;
  const keepTeam = s.points || 0;
  for (let k = 0; k < n; k++) {
    try { s.weekendForecast = generateWeekendForecast(); s.weather = s.weekendForecast.race || s.weekendForecast.practice; } catch (e) {}
    s._safetyCarThisRace = false;
    simulateBackgroundRace();
    s.gp++;
  }
  // vos no corriste esas fechas: tus puntos de piloto arrancan en cero
  if (me && s.driverPoints) { s.driverPoints[me] = keepPts; if (s.driverWins) s.driverWins[me] = keepWins; }
  s.points = keepTeam;
  try { s.weekendForecast = generateWeekendForecast(); s.weather = s.weekendForecast.practice; } catch (e) {}
  s.pointsSystem = s.gp === 9 ? [50, 36, 30, 24, 20, 16, 12, 8, 4, 2] : [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  s.session = 0; s.raceDone = false; s.quizDone = false;
  add("⏳ Mientras corrías en las categorías juveniles pasaron " + n + " GP de la temporada " + s.season + " (un cuarto por categoría). Debutás en el GP " + (s.gp + 1) + ": " + ((trackData[s.gp] || {}).name || "") + ".");
  try { render(); } catch (e) {}
}
