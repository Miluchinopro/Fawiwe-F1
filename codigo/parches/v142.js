/* =====================================================================================
   FAWIWE · V142 — paquete de CELULAR (16)
   Horizontal · encabezado compacto · radio sin tapar · "Tu carrera" desplegable · vibración ·
   pantalla completa · app instalable · botones grandes · aviso para girar · cómo doblar
   (botones / deslizar / inclinar) · ahorro de batería · barra de abajo · doble toque · una mano
   ===================================================================================== */
function v12Opt() { try { return v4A11y(); } catch (e) { return {}; } }
function v12Touch() { return window.matchMedia && matchMedia("(pointer:coarse)").matches; }
function v12Small() { return Math.min(innerWidth, innerHeight) < 600; }

/* ---------------- 6) vibración ---------------- */
function v12Vib(p) { try { if (v12Opt().noVib || !navigator.vibrate) return; navigator.vibrate(p); } catch (e) {} }
if (typeof dlFeed === "function") {
  const o = dlFeed;
  dlFeed = function (lap, txt, mine, cls) {
    try { if (DL && !DL.skip && mine) { if (cls === "ok") v12Vib(40); else if (cls === "bad") v12Vib([70, 40, 70]); } } catch (e) {}
    return o.apply(this, arguments);
  };
}
if (typeof v7StartHit === "function") { const o = v7StartHit; v7StartHit = function () { v12Vib(30); return o.apply(this, arguments); }; }
if (typeof v7QteOpen === "function") { const o = v7QteOpen; v7QteOpen = function () { const r = o.apply(this, arguments); if (r) v12Vib([20, 30, 20]); return r; }; }
if (typeof v7Flag === "function") { const o = v7Flag; v7Flag = function () { v12Vib([90, 50, 90, 50, 220]); return o.apply(this, arguments); }; }
if (typeof eraEnd === "function") { const o = eraEnd; eraEnd = function (ok) { v12Vib(ok ? 40 : 140); return o.apply(this, arguments); }; }

/* ---------------- 7) pantalla completa · 8) instalar como app ---------------- */
function v12Full() {
  try {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) { const p = req.call(el); if (p && p.catch) p.catch(() => v12FullParent()); } else v12FullParent();
  } catch (e) { v12FullParent(); }
}
function v12FullParent() { try { if (window.parent !== window) window.parent.postMessage({ fw: "fullscreen" }, "*"); else v9Toast("Tu navegador no deja usar pantalla completa acá."); } catch (e) {} }
function v12Install() {
  try { if (window.parent !== window) { window.parent.postMessage({ fw: "install" }, "*"); return; } } catch (e) {}
  if (window._v12Prompt) { window._v12Prompt.prompt(); window._v12Prompt = null; return; }
  v12InstallHelp();
}
function v12InstallHelp() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  v9Toast(ios ? "📲 En iPhone: tocá Compartir (□↑) y después «Agregar a inicio»." : "📲 En el menú del navegador (⋮) tocá «Instalar app» o «Agregar a la pantalla de inicio».");
}
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); window._v12Prompt = e; });

/* ---------------- 12) inclinar · 11) deslizar: cómo doblar ---------------- */
function v12Steer() { return v12Opt().steer || "btn"; }
function v12Mini() { const st = document.getElementById("eraStage"); return st && st.getClientRects().length > 0 && typeof ERA !== "undefined" && ERA && !ERA.dead ? st : null; }
const V12K = { L: false, R: false };
function v12Key(dir, down) {
  const k = dir < 0 ? "L" : "R";
  if (V12K[k] === down) return;
  V12K[k] = down;
  const key = dir < 0 ? "ArrowLeft" : "ArrowRight";
  try { document.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key, code: key, bubbles: true })); } catch (e) {}
}
function v12ReleaseAll() { v12Key(-1, false); v12Key(1, false); }
// deslizar el dedo
(function () {
  let x0 = null, dir = 0;
  document.addEventListener("touchstart", e => {
    if (v12Steer() !== "swipe" || !v12Mini()) return;
    if (e.target.closest("button")) return;
    x0 = e.touches[0].clientX; dir = 0;
  }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (x0 == null || !v12Mini()) return;
    const dx = e.touches[0].clientX - x0;
    const nd = dx < -22 ? -1 : dx > 22 ? 1 : 0;
    if (nd !== dir) { if (dir) v12Key(dir, false); if (nd) v12Key(nd, true); dir = nd; }
  }, { passive: true });
  const end = () => { if (x0 == null) return; if (dir) v12Key(dir, false); x0 = null; dir = 0; };
  document.addEventListener("touchend", end, { passive: true });
  document.addEventListener("touchcancel", end, { passive: true });
})();
// inclinar el celu
let v12TiltOn = false;
function v12TiltStart() {
  if (v12TiltOn) return;
  const go = () => {
    v12TiltOn = true;
    window.addEventListener("deviceorientation", ev => {
      if (v12Steer() !== "tilt" || !v12Mini()) { v12ReleaseAll(); return; }
      const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      let t = Math.abs(ang) === 90 ? (ang > 0 ? ev.beta : -ev.beta) : ev.gamma;
      if (t == null) return;
      const lim = 12;
      if (t < -lim) { v12Key(1, false); v12Key(-1, true); }
      else if (t > lim) { v12Key(-1, false); v12Key(1, true); }
      else v12ReleaseAll();
    });
  };
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then(r => { if (r === "granted") go(); else v9Toast("Sin permiso para el sensor: seguís con botones."); }).catch(() => {});
    } else go();
  } catch (e) {}
}
function v12SetSteer(v) {
  v4A11ySet("steer", v);
  if (v === "tilt") v12TiltStart();
  v9Toast(v === "tilt" ? "📱 Inclinás el celu para doblar." : v === "swipe" ? "👆 Deslizás el dedo para doblar." : "🔘 Doblás con los botones.");
}
// cartel en los minijuegos: cómo estás doblando
setInterval(() => {
  try {
    const st = v12Mini();
    if (!st) { if (V12K.L || V12K.R) v12ReleaseAll(); return; }
    const m = v12Steer();
    let chip = st.querySelector(".v12-steer");
    if (m === "btn" || !v12Touch()) { if (chip) chip.remove(); return; }
    if (!/◀|IZQ|doblar|←/.test(st.textContent)) { if (chip) chip.remove(); return; }
    if (!chip) { chip = document.createElement("div"); chip.className = "v12-steer"; st.insertBefore(chip, st.firstChild); }
    const t = m === "tilt" ? "📱 Inclinás el celu para doblar" : "👆 Deslizá el dedo para doblar";
    if (chip.textContent !== t) chip.textContent = t;
  } catch (e) {}
}, 400);
try { if (v12Steer() === "tilt" && !(typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission)) v12TiltStart(); } catch (e) {}

/* ---------------- ajustes: todo junto en Accesibilidad ---------------- */
if (typeof v4A11yHtml === "function") {
  const o = v4A11yHtml;
  v4A11yHtml = function () {
    const h = o.apply(this, arguments), A = v12Opt();
    const st = A.steer || "btn";
    const add = `<h3 class="v12-h">📱 Celular</h3>
      <label>🕹️ Cómo doblar en los minijuegos <select onchange="v12SetSteer(this.value)"><option value="btn" ${st === "btn" ? "selected" : ""}>Botones</option><option value="swipe" ${st === "swipe" ? "selected" : ""}>Deslizar el dedo</option><option value="tilt" ${st === "tilt" ? "selected" : ""}>Inclinar el celu</option></select></label>
      <label class="ng-check"><input type="checkbox" ${A.noVib ? "" : "checked"} onchange="v4A11ySet('noVib', !this.checked)"> <span>📳 Vibrar en los momentos importantes</span></label>
      <label class="ng-check"><input type="checkbox" ${A.eco ? "checked" : ""} onchange="v4A11ySet('eco', this.checked)"> <span>🔋 Ahorro de batería (menos animaciones y efectos)</span></label>
      <label class="ng-check"><input type="checkbox" ${A.onehand ? "checked" : ""} onchange="v4A11ySet('onehand', this.checked)"> <span>🤚 Modo una mano (las decisiones aparecen abajo)</span></label>
      <label class="ng-check"><input type="checkbox" ${A.noDbl ? "" : "checked"} onchange="v4A11ySet('noDbl', !this.checked)"> <span>👆👆 Tocar dos veces para saltar cinemáticas</span></label>
      <div class="v6-res-btns"><button type="button" class="lv-btn" onclick="v12Full()">⛶ Pantalla completa</button><button type="button" class="lv-btn" onclick="v12Install()">📲 Instalar como app</button></div>`;
    return h.replace(/<\/div>\s*$/, add + "</div>");
  };
}
if (typeof v4A11yApply === "function") {
  const o = v4A11yApply;
  v4A11yApply = function () {
    const r = o.apply(this, arguments);
    try { const A = v12Opt(); document.body.classList.toggle("fw-eco", !!A.eco); if (A.eco) document.body.classList.add("fw-reduce"); document.body.classList.toggle("fw-onehand", !!A.onehand); } catch (e) {}
    return r;
  };
  try { v4A11yApply(); } catch (e) {}
}

/* ---------------- 13) ahorro de batería: mapa más liviano ---------------- */
if (typeof fwMapDraw === "function") {
  const o = fwMapDraw;
  let last = 0;
  fwMapDraw = function () {
    if (document.body.classList.contains("fw-eco")) { const n = performance.now(); if (n - last < 110) return; last = n; }
    return o.apply(this, arguments);
  };
}

/* ---------------- 3) encabezado compacto · 14) barra de abajo ---------------- */
function v12Header() {
  try {
    const box = document.getElementById("dashBtns"); if (!box) return;
    const narrow = innerWidth < 700;
    box.querySelectorAll("button:not(#dashCta)").forEach(b => {
      if (!b.dataset.full) { b.dataset.full = b.innerHTML; b.title = b.textContent.trim(); }
      const ic = (b.textContent.trim().match(/^\S+/) || [""])[0];
      if (narrow && b.dataset.mode !== "ic") { b.textContent = ic; b.dataset.mode = "ic"; b.setAttribute("aria-label", b.title); }
      else if (!narrow && b.dataset.mode === "ic") { b.innerHTML = b.dataset.full; b.dataset.mode = ""; }
    });
    const cta = document.getElementById("dashCta");
    if (cta) { if (!cta.dataset.full) cta.dataset.full = cta.innerHTML; const want = narrow ? "SESIÓN ▶" : cta.dataset.full; if (cta.innerHTML !== want) cta.innerHTML = want; }
    if (!document.getElementById("v12Full") && v12Touch()) box.insertAdjacentHTML("afterbegin", `<button type="button" id="v12Full" class="btn-tutorial" title="Pantalla completa" aria-label="Pantalla completa" onclick="v12Full()">⛶</button>`);
  } catch (e) {}
}
function v12Nav() {
  try {
    const on = document.body.classList.contains("dash") && innerWidth < 900;
    let nav = document.getElementById("v12Nav");
    if (!on) { if (nav) nav.remove(); document.body.classList.remove("v12-hasnav"); return; }
    if (!nav) {
      nav = document.createElement("nav"); nav.id = "v12Nav"; nav.setAttribute("aria-label", "Navegación");
      const drv = typeof s !== "undefined" && s && s.playerMode === "driver";
      nav.innerHTML = `<button type="button" onclick="dashGo('#jobCard')"><i>🏁</i><span>Sesión</span></button>
        <button type="button" onclick="dashGo('${drv ? "#drvContractCard" : "#driversCard"}')"><i>${drv ? "📝" : "👥"}</i><span>${drv ? "Contrato" : "Equipo"}</span></button>
        <button type="button" onclick="dashGo('h2:title_season_circuits')"><i>📅</i><span>Calendario</span></button>
        <button type="button" onclick="document.body.classList.toggle('dash-nav-open')"><i>☰</i><span>Más</span></button>`;
      document.body.appendChild(nav);
    }
    document.body.classList.add("v12-hasnav");
  } catch (e) {}
}
setInterval(() => { v12Header(); v12Nav(); }, 700);
window.addEventListener("resize", () => { v12Header(); v12Nav(); });

/* ---------------- 4) la radio no queda encima de pantallas nuevas ---------------- */
if (typeof fwRadioToast === "function") {
  const o = fwRadioToast;
  fwRadioToast = function () { const r = o.apply(this, arguments); try { const el = document.getElementById("fwRadioToast"); if (el) el._v12 = performance.now(); } catch (e) {} return r; };
}
(function () {
  const IDS = ["hofOverlay", "v5Launch", "v6Quick", "v4Chal", "v4ChalOv", "podOverlay", "v7Champ", "v6Share", "seasonChangesOverlay", "v9QuickEnd", "v10Space", "gameTutorialBox", "saveMenuBox"];
  const seen = {};
  setInterval(() => {
    try {
      const now = performance.now(), t = document.getElementById("fwRadioToast");
      IDS.forEach(id => {
        const el = document.getElementById(id);
        const vis = el && (el.classList.contains("show") || (id === "gameTutorialBox" && !el.classList.contains("hidden")));
        if (vis && !seen[id]) seen[id] = now; else if (!vis) seen[id] = 0;
        if (vis && t && t.classList.contains("show") && (t._v12 || 0) < seen[id] - 50) t.classList.remove("show");
      });
    } catch (e) {}
  }, 250);
})();

/* ---------------- 5) "Tu carrera" desplegable ---------------- */
setInterval(() => {
  try {
    const sum = document.querySelector("#resultOverlay.show .dl-sum");
    if (!sum || sum.dataset.v12) return;
    sum.dataset.v12 = 1;
    const ps = [...sum.querySelectorAll("p")];
    if (ps.length <= 5) return;
    sum.classList.add("v12-fold");
    const b = document.createElement("button"); b.type = "button"; b.className = "lv-btn v12-more";
    b.textContent = "▼ Ver toda la carrera (" + ps.length + " momentos)";
    b.onclick = () => { const open = sum.classList.toggle("v12-open"); b.textContent = open ? "▲ Ver menos" : "▼ Ver toda la carrera (" + ps.length + " momentos)"; };
    sum.appendChild(b);
  } catch (e) {}
}, 400);

/* ---------------- 10) aviso para girar el celu ---------------- */
setInterval(() => {
  try {
    const ov = document.getElementById("dlOverlay");
    const on = ov && ov.classList.contains("show") && v12Touch() && innerWidth < 520 && innerHeight > innerWidth;
    let chip = document.getElementById("v12Rot");
    let done = false; try { done = sessionStorage.getItem("fw_rot") === "1"; } catch (e) {}
    if (!on || done || (DL && DL.phase !== "run")) { if (chip) chip.remove(); return; }
    if (!chip) {
      chip = document.createElement("div"); chip.id = "v12Rot";
      chip.innerHTML = `🔄 Girá el celu para ver la carrera más grande <button type="button" aria-label="Cerrar" onclick="try{sessionStorage.setItem('fw_rot','1')}catch(e){};this.parentNode.remove()">✕</button>`;
      ov.appendChild(chip);
    }
  } catch (e) {}
}, 800);

/* ---------------- 15) tocar dos veces para saltar ---------------- */
(function () {
  const SEL = "#engPreShow, #homeCine, #v7Flag, #v11Face, #podOverlay";
  let armed = null, at = 0;
  window.addEventListener("click", e => {
    try {
      if (!v12Touch() || v12Opt().noDbl) return;
      const t = e.target.closest && e.target.closest(SEL);
      if (!t || e.target.closest("button, a, input, select")) return;
      const now = performance.now();
      if (armed === t && now - at < 700) { armed = null; return; } // segundo toque: pasa
      armed = t; at = now;
      e.stopImmediatePropagation(); e.preventDefault();
      const lab = t.querySelector(".ps-skip, .hc-skip, .v7-flag-tap");
      if (lab) { lab.dataset.o = lab.dataset.o || lab.textContent; lab.textContent = "Tocá otra vez para saltar ⏭️"; lab.classList.add("v12-armed"); setTimeout(() => { if (lab.isConnected) { lab.textContent = lab.dataset.o; lab.classList.remove("v12-armed"); } }, 900); }
    } catch (err) {}
  }, true);
})();

/* ---------------- tutorial ---------------- */
function v12Tut() {
  const pg = document.querySelector('#v10Tut .v10-page[data-t="menu"]');
  if (!pg || pg.querySelector(".v12-tut")) return;
  pg.insertAdjacentHTML("beforeend", `<h3 class="v12-tut">📱 En el celular</h3><ul>
    <li><b>🕹️ Cómo doblar</b>: en Accesibilidad elegís botones, deslizar el dedo o inclinar el celu.</li>
    <li><b>📳 Vibración</b>, <b>🔋 ahorro de batería</b>, <b>🤚 modo una mano</b> y <b>⛶ pantalla completa</b>, también en Accesibilidad.</li>
    <li><b>📲 Instalalo como app</b>: queda con su ícono en la pantalla de inicio y se abre de un toque.</li>
    <li>Abajo tenés la <b>barra rápida</b>: Sesión, Equipo, Calendario y Más.</li></ul>`);
}
(function () {
  if (document.readyState !== "loading") setTimeout(v12Tut, 0); else document.addEventListener("DOMContentLoaded", v12Tut);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { v12Tut(); } catch (e) {} return r; }; window.render = render; }
})();
