/* =====================================================================================
   FAWIWE · DEBUT EN F1 (titular o reserva) + CINEMÁTICA DE CAMBIO DE RANGO (los dos modos)
   ===================================================================================== */
/* ---------- F1 como titular o como reserva ---------- */
(function () {
  // en "¿Dónde arranca tu carrera?" la F1 se divide en dos opciones (titular / reserva)
  const fixF1 = () => {
    const sel = document.getElementById("juniorStartSel");
    if (!sel) return;
    const f1 = [...sel.options].find(o => o.value === "f1" && !o.dataset.tmp);
    if (!f1) return;
    f1.value = "f1t"; f1.textContent = "🏎️ Fórmula 1 como piloto titular";
    if (![...sel.options].some(o => o.value === "f1r")) { const r = document.createElement("option"); r.value = "f1r"; r.textContent = "💺 Fórmula 1 como piloto de reserva"; sel.appendChild(r); }
  };
  const selEl = document.getElementById("juniorStartSel");
  if (selEl) { fixF1(); new MutationObserver(fixF1).observe(selEl, { childList: true }); }
  const js = window.juniorStagesForYear;
  if (typeof js === "function") window.juniorStagesForYear = function () {
    const sel = document.getElementById("juniorStartSel");
    const v = sel ? sel.value : "";
    window.__jrSeatPick = v === "f1t" ? "titular" : v === "f1r" ? "reserva" : null;
    if (v === "f1t" || v === "f1r") {
      sel.value = "f1"; // la función original entiende "f1" = directo
      const tmp = document.createElement("option"); tmp.value = "f1"; tmp.dataset.tmp = "1"; sel.appendChild(tmp); sel.value = "f1";
      const r = js.apply(this, arguments);
      tmp.remove(); sel.value = v;
      return r;
    }
    return js.apply(this, arguments);
  };
  // pantalla de debut: elegís titular o reserva (o queda lo que elegiste al arrancar)
  const rj = window.renderJuniorStep;
  if (typeof rj === "function") window.renderJuniorStep = function () {
    const r = rj.apply(this, arguments);
    try {
      if (juniorStep < juniorStagesCache.length) return r;
      const box = document.getElementById("juniorCareerBody");
      const btn = box && box.querySelector(".start-btn");
      if (!btn || box.querySelector(".jr-seat")) return r;
      const m = (btn.getAttribute("onclick") || "").match(/finishJuniorCareer\(([^)]*)\)/);
      const args = m ? m[1] : "68, 0";
      const pick = window.__jrSeatPick;
      box.querySelectorAll(".mini-explain b").forEach(b => { if (/Debutás como/.test(b.textContent)) b.parentNode.innerHTML = b.parentNode.innerHTML.replace(/<b>Debutás como:[\s\S]*$/, pick ? "<b>¿Cómo debutás?</b> Ya elegiste tu asiento." : "<b>Tu asiento lo decide el contrato:</b> según tu nivel, el equipo te ofrece ser <b>titular</b> (Piloto de Carrera, corrés todas las carreras) o <b>reserva</b> (3er piloto: prensa, prácticas y correr si se lesiona un titular)."); });
      const wrap = document.createElement("div");
      wrap.className = "jr-seat";
      const bT = `<button class="start-btn" onclick="jrDebut('titular', ${args})">🏎️ DEBUTAR COMO TITULAR</button>`;
      const bR = `<button class="start-btn dark" onclick="jrDebut('reserva', ${args})">💺 DEBUTAR COMO RESERVA</button>`;
      // Si ascendiste desde las categorías inferiores, el asiento (titular o reserva) lo define el
      // equipo en tu primer contrato; si arrancaste directo en la F1, ya lo elegiste en el menú.
      const bC = `<button class="start-btn" onclick="jrDebut('contract', ${args})">✍️ IR A NEGOCIAR TU CONTRATO</button><p class="small" style="text-align:center">En el contrato el equipo te dice si vas como <b>titular</b> o <b>reserva</b> (y podés pedir el asiento titular).</p>`;
      wrap.innerHTML = pick === "titular" ? bT : pick === "reserva" ? bR : bC;
      btn.replaceWith(wrap);
    } catch (e) { console.warn(e); }
    return r;
  };
  const fin = window.finishJuniorCareer;
  window.jrDebut = function (seat) {
    window.__jrSeat = seat;
    const args = [].slice.call(arguments, 1);
    return window.finishJuniorCareer.apply(this, args);
  };
  // aplicar el asiento elegido apenas arranca la partida
  const st = window.start;
  if (typeof st === "function") window.start = function () {
    const r = st.apply(this, arguments);
    try {
      if (s.playerMode === "driver" && window.__jrSeat === "contract") {
        s._seatByContract = true; s._startTitular = false; s._forceReserve = true; s._reserveHasRaced = false;
        add("✍️ Llegaste a la F1: en tu primer contrato " + s.team + " te dice si vas de titular o de reserva.");
        window.__jrSeat = null;
      } else if (s.playerMode === "driver" && window.__jrSeat) {
        const titular = window.__jrSeat === "titular";
        s._startTitular = titular;
        s._forceReserve = !titular;
        s._reserveHasRaced = titular ? true : false;
        add(titular ? "🏎️ Debutás como piloto titular: rango Piloto de Carrera, corrés todas las carreras." : "💺 Debutás como piloto de reserva: prensa, prácticas y tu chance si se lesiona un titular.");
        window.__jrSeat = null;
        try { s.lastRankName = driverRankName(); render(); } catch (e) {}
      } else if (s.playerMode === "driver") { s._startTitular = false; s._forceReserve = false; }
    } catch (e) { console.warn(e); }
    return r;
  };
})();

/* ---------- cinemática de cambio de rango ---------- */
const RC_DRV_PERKS = [
  "Prensa, prácticas y simulador: tu chance llega si se lesiona un titular.",
  "Asiento fijo: corrés todas las carreras y cobrás según la escala de la F1.",
  "Sos titular consolidado: mejores ofertas y más peso en el equipo.",
  "Peleás podios: los equipos grandes te empiezan a llamar.",
  "Élite de la parrilla: sponsors y equipos top te buscan.",
  "Leyenda: tu nombre ya está en la historia de la F1."
];
function rcUnlocks(idx) {
  try {
    if (typeof ENG_TAB_RANK === "undefined") return [];
    return Object.keys(ENG_TAB_RANK).filter(k => ENG_TAB_RANK[k] === idx).map(k => (ENG_TABS.find(t => t[0] === k) || ["", k])[1]);
  } catch (e) { return []; }
}
window.showRankUp = function (name) {
  const drv = s.playerMode === "driver";
  const list = drv ? driverRankNames : rankTiers.map(r => r[0]);
  const prev = s.lastRankName || "";
  const ni = list.indexOf(name), pi = list.indexOf(prev);
  const up = pi < 0 || ni >= pi;
  const old = document.getElementById("rankCine"); if (old) old.remove();
  const ov = document.createElement("div");
  ov.id = "rankCine";
  ov.className = up ? "up" : "down";
  const unlock = drv ? [RC_DRV_PERKS[Math.max(0, ni)] || ""] : rcUnlocks(ni).map(u => "🔓 " + u);
  const lines = '<svg class="bc-lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${6 + k * 12}" width="${388 - k * 24}" height="${288 - k * 24}" rx="${60 - k * 10}" pathLength="1" style="animation-delay:${(0.7 + k * 0.1).toFixed(2)}s"/>`).join("") + "</svg>";
  ov.innerHTML = `<div class="rc-rays"></div>
    <div class="rc-k"><span class="bc-badge">F1</span>${up ? "¡SUBISTE DE RANGO!" : "BAJASTE DE RANGO"} · ${drv ? "MODO PILOTO" : "MODO INGENIERO"}</div>
    <div class="rc-medal">${up ? (ni >= list.length - 1 ? "👑" : drv ? "🏎️" : "🎖️") : "📉"}</div>
    <div class="rc-plate">${lines}
      ${prev ? `<div class="rc-old">${engEsc(prev)}</div>` : ""}
      <div class="rc-new">${engEsc(name)}</div>
      <div class="rc-ladder">${list.map((r, i) => `<span class="${i < ni ? "done" : i === ni ? "now" : ""}" title="${engEsc(r)}"></span>`).join("")}</div>
      <div class="rc-un">${unlock.filter(Boolean).map(u => `<div>${engEsc(u)}</div>`).join("") || (drv ? "" : "<div>Seguís sumando puntos de licencia para el próximo rango.</div>")}</div>
    </div>
    <button class="rc-go" onclick="rcClose()">Continuar</button>`;
  document.body.appendChild(ov);
  try { if (typeof FWAudio !== "undefined") { FWAudio.whoosh(); setTimeout(() => { try { up ? FWAudio.fanfare() : FWAudio.bad(); } catch (e) {} }, 650); } } catch (e) {}
  ov.addEventListener("click", ev => { if (ev.target === ov) rcClose(); });
};
function rcClose() { const ov = document.getElementById("rankCine"); if (!ov) return; ov.classList.add("bye"); setTimeout(() => ov.remove(), 320); }
window.closeRankUp = rcClose;
