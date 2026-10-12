/* =====================================================================================
   FAWIWE V110 · INICIO Y MENÚ ACTUALIZADOS
   - Inicio (volante): cinta de novedades.
   - Menú: novedades en la portada + "Ajustes de realismo" antes de COMENZAR, que se aplican al arrancar.
   - La época elegida se ve en el menú: qué potencia extra y qué frenos tiene ese año en la vuelta.
   ===================================================================================== */
const V110_NEWS = [
  ["🎚️", "Ayudas por dificultad", "piloto e ingeniero: Fácil, Normal o Difícil cambian qué es automático"],
  ["🧭", "Nuevo panel", "barra lateral, datos arriba y checklist del finde"],
  ["✍️", "Titular o reserva en el contrato", "lo negociás al llegar a la F1"],
  ["⌨️", "Teclas a la vista", "cada botón con su tecla y guía abajo del volante"],
  ["🐢", "Minijuegos más lentos", "según la dificultad y tu rango"],
  ["💥", "Colisiones", "contactos, sanciones y al muro = DNF"],
  ["🏁", "Carrera ≠ clasificación", "largada con semáforo, ataque y defensa"],
  ["💻", "Objeto del ingeniero", "laptop, muro, tablet o teléfono según tu rango"],
  ["🎬", "Doblás vos", "◀ ▶ del volante en cada curva · más lenta"],
  ["🎡", "Volante según el año", "madera, cuero, carbono o pantalla · gira en las curvas"],
  ["⏱️", "3 sectores reales", "delta en vivo, marchas y km/h"],
  ["🕰️", "Cada época se maneja distinto", "rebufo, KERS o ERS · frenos de acero"],
  ["🎚️", "Ajustes de realismo", "IA adaptativa, duración de carrera y daños"],
  ["🤝", "Relaciones en el paddock", "compañero, reconocimiento y ofertas"],
  ["⬇️", "Empezar desde abajo", "el equipo más lento del año"],
  ["⚡", "Simular práctica", "programas rápidos en P1 y P2"]
];
(function v110Intro() {
  return; // las novedades viejas ya no se muestran
  const team = document.querySelector("#introOverlay .intro-team, .intro-team");
  if (!team || document.getElementById("swNews")) return;
  const items = V110_NEWS.map(n => `<span><i>${n[0]}</i><b>${n[1]}</b> ${n[2]}</span>`).join("");
  team.insertAdjacentHTML("afterend", `<div class="sw-news" id="swNews"><em>NUEVO V131</em><div class="sw-news-track"><div>${items}${items}</div></div></div>`);
})();
(function v110Menu() {
  const hero = document.querySelector("#setup .mc-hero");
  if (false && hero && !document.getElementById("mcNews")) {
    hero.insertAdjacentHTML("afterend", `<div class="mc-news" id="mcNews"><div class="mc-news-h"><span class="bc-badge">V131</span> LO NUEVO</div>
      <div class="mc-news-grid">${V110_NEWS.map(n => `<div><i>${n[0]}</i><b>${n[1]}</b><span>${n[2]}</span></div>`).join("")}</div></div>`);
  }
  const info = document.getElementById("modeInfo");
  if (info && !document.getElementById("rlMenuBox")) {
    const box = document.createElement("div");
    box.id = "rlMenuBox"; box.className = "rl-settings";
    info.parentNode.insertBefore(box, info);
    v110RenderMenuRealism();
  }
  const yr = document.getElementById("startYear");
  if (yr && !yr.dataset.v110) { yr.dataset.v110 = 1; yr.addEventListener("change", v110RenderMenuRealism); }
  const dec = document.getElementById("decade");
  if (dec) dec.addEventListener("change", () => setTimeout(v110RenderMenuRealism, 0));
})();
function v110MenuR() { if (!window.__rlMenu) window.__rlMenu = { adaptive: true, len: 1, damage: true, v132: true }; return window.__rlMenu; }
function v110SetMenu(k, v) { v110MenuR()[k] = v; v110RenderMenuRealism(); }
function v110RenderMenuRealism() {
  const box = document.getElementById("rlMenuBox"); if (!box) return;
  const R = v110MenuR();
  const y = parseInt(document.getElementById("startYear")?.value || "2026", 10);
  const P = typeof rlPower === "function" ? rlPower(y) : null, B = typeof rlBrakes === "function" ? rlBrakes(y) : { note: "" };
  box.innerHTML = `<h3>🎚️ Ajustes de realismo</h3>
    <label class="ng-check"><input type="checkbox" ${R.adaptive ? "checked" : ""} onchange="v110SetMenu('adaptive', this.checked)"> <span><b>IA adaptativa:</b> manda lo que vale tu auto (con un equipo lento vas a sufrir para pasar a Q2).</span></label>
    <label class="small">🏁 Duración de la carrera</label><select onchange="v110SetMenu('len', +this.value)">${[[0.25, "25% (corta)"], [0.5, "50% (media)"], [1, "100% (vueltas reales del circuito)"]].map(o => `<option value="${o[0]}" ${R.len === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>
    <label class="ng-check"><input type="checkbox" ${R.damage ? "checked" : ""} onchange="v110SetMenu('damage', this.checked)"> <span><b>Daños y desgaste realistas:</b> cada error en clasificación o carrera puede romper el auto.</span></label>
    ${P ? `<div class="rl-era">🕰️ <b>Manejo en ${y}:</b> ${P.ic} ${P.name} en las rectas${B.note ? " · 🛑 " + B.note : ""}</div>` : ""}
    <p class="small">Lo podés cambiar después en ⚙️ Ajustes de partida.</p>`;
}
(function () {
  const st = window.start;
  if (typeof st === "function") window.start = function () {
    const r = st.apply(this, arguments);
    try { if (window.__rlMenu && typeof s !== "undefined") { s.realism = Object.assign({}, window.__rlMenu, { v132: true }); if (typeof rlRenderSettings === "function") rlRenderSettings(); } } catch (e) {}
    return r;
  };
})();
