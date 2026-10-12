/* =====================================================================================
   FAWIWE · EL VOLANTE CAMBIA SEGÚN EL AÑO
   El volante de los minijuegos se arma según la temporada: madera (50s–60s), cuero chico
   (60s–80s), con botones (85–98), mariposa de carbono (99–08), con pantalla LCD (09–21)
   y el moderno con pantalla a color (22+).
   ===================================================================================== */
const MW_ERAS = [
  { to: 1965, k: "e1", round: true, name: "volante de madera y aluminio" },
  { to: 1984, k: "e2", round: true, name: "volante chico de cuero" },
  { to: 1998, k: "e3", round: false, name: "volante de gamuza con botones" },
  { to: 2008, k: "e4", round: false, name: "volante mariposa de carbono" },
  { to: 2021, k: "e5", round: false, name: "volante con pantalla y luces de cambio" },
  { to: 9999, k: "e6", round: false, name: "volante moderno con pantalla a color" }
];
function mwEraFor(y) { y = y || (typeof s !== "undefined" && s.season) || 2026; return MW_ERAS.find(e => y <= e.to); }
function mwApplyEra(w) {
  if (!w || w.dataset.era) return;
  const y = (typeof s !== "undefined" && s.season) || 2026;
  const E = mwEraFor(y);
  w.dataset.era = E.k;
  w.classList.add("mw-" + E.k);
  if (E.round) w.classList.add("mw-round");
  const wrap = document.createElement("div");
  wrap.className = "mw-wrap mw-" + E.k + (E.round ? " round" : "");
  w.before(wrap);
  wrap.insertAdjacentHTML("afterbegin", `<div class="mw-tag">🕰️ ${y} · ${E.name}</div>`);
  if (E.round) {
    const body = w.querySelector(".mw-body"), c = w.querySelector(".mw-c");
    if (body && c) body.appendChild(c);
    wrap.insertAdjacentHTML("beforeend", `<div class="mw-gauge"><span>RPM</span><em>${[2, 4, 6, 8, 10].map((n, i) => `<u style="--a:${-120 + i * 60}deg">${n}</u>`).join("")}</em><i></i></div>`);
  }
  wrap.appendChild(w);
  mwKeyLegend(wrap, w);
  // aguja / luces: siguen al mismo valor que las LEDs
  const loop = () => {
    if (!document.body.contains(w)) return;
    const on = w.querySelectorAll(".mw-leds i.on").length;
    w.style.setProperty("--p", (on / 15).toFixed(3)); wrap.style.setProperty("--p", (on / 15).toFixed(3));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
(function () {
  const o = window.mwWheelize;
  if (typeof o !== "function") return;
  window.mwWheelize = function () {
    const r = o.apply(this, arguments);
    try { const st = document.getElementById("eraStage"); mwApplyEra(st && st.querySelector(".mw")); } catch (e) { console.warn(e); }
    return r;
  };
})();

/* ---------- teclado para los botones del volante (todos los minijuegos con volante) ----------
   ← = botón izquierdo · → = botón derecho · ESPACIO / ↑ / Enter = botón del centro.
   Mantener la tecla = mantener el botón. Las cinemáticas de pista tienen sus propias teclas. */
(function () {
  const OWN = /^(emLap|emRace|emEngQ|emEngR)$/;
  const held = {};
  const btnFor = k => {
    const st = document.getElementById("eraStage"); const w = st && st.querySelector(".mw"); if (!w) return null;
    if (k === "L") return w.querySelector(".mw-l button");
    if (k === "R") return w.querySelector(".mw-r button");
    return w.querySelector(".mw-c button") || w.querySelector(".mw-l button");
  };
  const keyOf = ev => ev.key === "ArrowLeft" ? "L" : ev.key === "ArrowRight" ? "R" : (ev.code === "Space" || ev.key === "ArrowUp" || ev.key === "Enter") ? "C" : null;
  const fire = (b, type) => { try { b.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 77, pointerType: "mouse" })); } catch (e) { b.dispatchEvent(new Event(type, { bubbles: true })); } };
  window.addEventListener("keydown", ev => {
    if (ev.defaultPrevented || typeof ERA === "undefined" || !ERA || ERA.dead || OWN.test(ERA.kind || "")) return;
    if (/INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName || "")) return;
    const k = keyOf(ev); if (!k) return;
    const b = btnFor(k); if (!b) return;
    ev.preventDefault();
    if (ev.repeat || held[k]) return;
    held[k] = b; b.classList.add("kbd-on"); fire(b, "pointerdown");
  });
  window.addEventListener("keyup", ev => {
    const k = keyOf(ev); if (!k || !held[k]) return;
    const b = held[k]; held[k] = null; b.classList.remove("kbd-on");
    ev.preventDefault(); fire(b, "pointerup");
    if (document.body.contains(b)) b.click();
  });
})();

/* ---------- en cada botón, su tecla + una guía de teclas abajo del volante ---------- */
function mwKeyLegend(wrap, w) {
  try {
    const kind = (typeof ERA !== "undefined" && ERA && ERA.kind) || "";
    const slots = [["L", ".mw-l button", "←"], ["C", ".mw-c button", "ESPACIO"], ["R", ".mw-r button", "→"]];
    const parts = [];
    slots.forEach(([k, sel, key]) => {
      const b = w.querySelector(sel); if (!b) return;
      if (!b.querySelector("kbd")) b.insertAdjacentHTML("beforeend", `<kbd class="mw-kbd">${key}</kbd>`);
      const label = (b.cloneNode(true)); label.querySelectorAll("kbd").forEach(x => x.remove()); label.querySelectorAll("br,small").forEach(x => x.before(" "));
      const txt = label.textContent.replace(/\s+/g, " ").replace(/[·\s]+$/, "").trim().slice(0, 26);
      parts.push(`<span><kbd>${key}</kbd> ${engEsc(txt)}</span>`);
    });
    if (/^(emLap|emRace)$/.test(kind)) {
      const as = (ERA && ERA.assist) || {};
      if (!as.brake) parts.push(`<span><kbd>↓</kbd> frenar</span>`);
      if (!as.gas) parts.push(`<span><kbd>↑</kbd> acelerar</span>`);
      parts.push(`<span class="mw-assist">${as.brake ? "🟢 Fácil: frena y acelera solo" : as.gas ? "🟡 Normal: acelera solo" : "🔴 Difícil: todo manual"}</span>`);
    }
    if (!parts.length) return;
    const old = wrap.querySelector(".mw-keys"); if (old) old.remove();
    wrap.insertAdjacentHTML("beforeend", `<div class="mw-keys"><b>⌨️ Teclas</b>${parts.join("")}</div>`);
  } catch (e) { console.warn(e); }
}
