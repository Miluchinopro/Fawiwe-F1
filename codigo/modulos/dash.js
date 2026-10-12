/* =====================================================================================
   FAWIWE · NUEVA DISPOSICIÓN "DASHBOARD" (solo cambia cómo se ve)
   - Barra lateral con secciones (EQUIPO / DESARROLLO / MUNDO / MÁS) y códigos de 3 letras.
   - Encabezado con la sesión actual + botones (Tutorial, Guardar, Menú) y el botón rojo principal.
   - Franja de datos (equipo, temporada, GP, plata, popularidad, posición).
   - Checklist del fin de semana con barra de progreso.
   Los textos, colores y tarjetas del juego son los mismos: solo se reacomodan.
   ===================================================================================== */
const DASH_NAV = [
  ["EQUIPO", [
    ["SES", "Tu sesión", "#jobCard"],
    ["ING", "Centro del ingeniero", "#engCenterCard"],
    ["CTR", "Contrato", "#drvContractCard"],
    ["NIV", "Nivel del equipo", "h2:title_team_level"],
    ["AUT", "Auto", "#carDevCard"],
    ["PIL", "Pilotos", "#driversCard"],
    ["ORI", "Pilotos originales", "#originalDriversCard"],
    ["GOM", "Neumáticos", "#strategyCard"],
    ["FIN", "Finanzas", "#engWalletCard"],
    ["SPO", "Sponsors", "#sponsorCard"]
  ]],
  ["DESARROLLO", [
    ["MER", "Mercado de pases", "#offersCard"],
    ["STF", "Ingenieros", "#engineerMarketCard"],
    ["ACA", "Academia", "#academyCard"],
    ["INS", "Instalaciones", "#facilitiesCard"],
    ["TEL", "Telemetría", "h2:title_telemetry"],
    ["DEC", "Decisiones", "#eventsCard"]
  ]],
  ["MUNDO", [
    ["CAL", "Calendario", "h2:title_season_circuits"],
    ["FDS", "Sesiones del finde", "h2:title_weekend_sessions"],
    ["CON", "Constructores", "h2:title_constructors"],
    ["CMP", "Campeonato de pilotos", "h2:title_drivers_champ"],
    ["EQP", "Equipos", "h2:title_teams"],
    ["NOT", "Noticias", "h2:title_paddock_news"],
    ["HIS", "Historial", "h2:title_history"]
  ]],
  ["MÁS", [
    ["CAS", "Tu casa", "#homeCard"],
    ["FAM", "Fama mundial", "#worldFameCard"],
    ["REL", "Relaciones", "#rlRelCard"],
    ["AJU", "Ajustes", "h2:title_settings"]
  ]]
];
function dashCard(sel) {
  if (sel.startsWith("#")) return document.querySelector("#game " + sel);
  const k = sel.slice(3), sp = document.querySelector(`#game h2 [data-i18n="${k}"]`);
  return sp ? sp.closest(".card") : null;
}
function dashGo(sel) {
  const c = dashCard(sel); if (!c) return;
  const y = c.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 112 : 18);
  window.scrollTo({ top: y, behavior: "smooth" });
  c.classList.remove("dash-flash"); void c.offsetWidth; c.classList.add("dash-flash");
  document.body.classList.remove("dash-nav-open");
}
function dashBuild() {
  if (document.getElementById("dashSide")) return;
  const side = document.createElement("nav");
  side.id = "dashSide";
  side.innerHTML = `<div class="ds-brand" onclick="window.scrollTo({top:0,behavior:'smooth'})"><span class="ds-f1">F1</span><b>FAWIWE<i>//</i></b></div>` +
    DASH_NAV.map(([g, items]) => `<div class="ds-group">${g}</div>` + items.map(([code, label, sel]) => `<a class="ds-item" data-sel="${sel}" onclick="dashGo('${sel}')"><em>${code}</em><span>${label}</span></a>`).join("")).join("") +
    `<div class="ds-group">PARTIDA</div>
     <a class="ds-item" onclick="openSaveMenu();window.scrollTo({top:0,behavior:'smooth'})"><em>SAV</em><span>Guardar partida</span></a>
     <a class="ds-item" onclick="toggleTutorial()"><em>GDE</em><span>Tutorial</span></a>
     <a class="ds-item" onclick="returnToMenu()"><em>MNU</em><span>Volver al menú</span></a>`;
  document.body.appendChild(side);
  const tog = document.createElement("button");
  tog.id = "dashToggle"; tog.type = "button"; tog.innerHTML = "☰";
  tog.onclick = () => document.body.classList.toggle("dash-nav-open");
  document.body.appendChild(tog);
  // encabezado + checklist arriba de todo
  const game = document.getElementById("game");
  const first = game && game.querySelector(".card");
  if (!first) return;
  first.classList.add("dash-headcard");
  const top = document.createElement("div");
  top.id = "dashTop";
  top.innerHTML = `<div class="dt-left"><h1 id="dashTitle">—</h1><div id="dashSub"></div></div><div class="dt-right" id="dashBtns"></div>`;
  first.insertBefore(top, first.firstChild);
  const btnRow = first.querySelector('div[style*="text-align:right"]');
  if (btnRow) { btnRow.classList.add("dash-oldbtns"); [...btnRow.children].forEach(b => document.getElementById("dashBtns").appendChild(b)); }
  const cta = document.createElement("button");
  cta.type = "button"; cta.id = "dashCta"; cta.innerHTML = "IR A LA SESIÓN ▶";
  cta.onclick = () => dashGo("#jobCard");
  document.getElementById("dashBtns").appendChild(cta);
  const chk = document.createElement("div");
  chk.id = "dashCheck"; chk.className = "card";
  first.parentNode.insertBefore(chk, first.nextSibling);
  // estado activo de la barra lateral al hacer scroll
  window.addEventListener("scroll", dashActive, { passive: true });
}
function dashActive() {
  if (!document.body.classList.contains("dash")) return;
  let best = null, bestTop = -1e9;
  document.querySelectorAll("#dashSide .ds-item[data-sel]").forEach(a => {
    const c = dashCard(a.dataset.sel); if (!c || c.classList.contains("hidden") || !c.offsetParent) return;
    const t = c.getBoundingClientRect().top;
    if (t < 160 && t > bestTop) { bestTop = t; best = a; }
  });
  document.querySelectorAll("#dashSide .ds-item.on").forEach(a => a.classList.remove("on"));
  if (best) best.classList.add("on");
}
function dashTeamPos() {
  try {
    const st = Object.assign({}, s.teamStandings || {});
    st[s.team] = Math.max(st[s.team] || 0, s.points || 0);
    const order = Object.entries(st).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const i = order.indexOf(s.team);
    return i >= 0 ? "P" + (i + 1) : "—";
  } catch (e) { return "—"; }
}
function dashUpdate() {
  const game = document.getElementById("game");
  const on = !!game && !game.classList.contains("hidden");
  document.body.classList.toggle("dash", on);
  if (!on) return;
  dashBuild();
  const sess = ["Práctica 1", "Práctica 2", "Clasificación", "Carrera"];
  const tr = (typeof trackData !== "undefined" && trackData[s.gp]) || {};
  const title = document.getElementById("dashTitle"), sub = document.getElementById("dashSub");
  if (title) title.textContent = s.gameOver ? "Fin de la partida" : s.raceDone ? "Fin de semana terminado" : (sess[s.session] || "Fin de semana");
  if (sub) sub.textContent = `${s.season} · GP ${(s.gp || 0) + 1} · ${tr.name || ""} · ${s.playerMode === "driver" ? "MODO PILOTO" : "MODO INGENIERO"}`;
  // datos extra en la franja (se suman a Equipo / Temporada / GP)
  const grid = document.getElementById("soloHeader");
  if (grid) {
    const extra = [
      ["dsMoney", s.playerMode === "driver" ? "PLATA" : "PRESUPUESTO", () => (typeof formatMoney === "function" ? formatMoney(s.playerMode === "driver" ? (s.money || 0) : (s.money || 0)) : s.money)],
      ["dsPop", "POPULARIDAD", () => Math.round(s.pop || 0)],
      ["dsPos", "POSICIÓN", dashTeamPos]
    ];
    extra.forEach(([id, label, fn]) => {
      let el = document.getElementById(id);
      if (!el) { const d = document.createElement("div"); d.className = "ds-extra"; d.innerHTML = `<span class="small">${label}</span><h2 id="${id}"></h2>`; grid.appendChild(d); el = document.getElementById(id); }
      try { el.textContent = fn(); } catch (e) {}
    });
  }
  // checklist del fin de semana
  const chk = document.getElementById("dashCheck");
  if (chk) {
    const done = s.raceDone ? 4 : Math.max(0, Math.min(4, s.session || 0));
    chk.innerHTML = `<div class="dc-head"><span class="dc-k">◆ FIN DE SEMANA · ${engEsc((tr.name || "").toUpperCase())}</span><span class="dc-n">${done} de 4 completas</span></div>
      <div class="dc-bar"><i style="width:${done / 4 * 100}%"></i></div>
      <div class="dc-pills">${sess.map((n, i) => { const st = i < done ? "ok" : i === done && !s.raceDone ? "now" : ""; return `<button type="button" class="dc-pill ${st}" onclick="dashGo('#jobCard')"><b>${i < done ? "✓" : i + 1}</b>${n}</button>`; }).join("")}</div>`;
  }
  // la barra lateral solo muestra las secciones que existen en esta partida
  document.querySelectorAll("#dashSide .ds-item[data-sel]").forEach(a => {
    const c = dashCard(a.dataset.sel);
    a.classList.toggle("off", !c || c.classList.contains("hidden"));
  });
  dashActive();
}
(function () {
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { const r = rd.apply(this, arguments); try { dashUpdate(); } catch (e) { console.warn(e); } return r; };
  const g = document.getElementById("game");
  if (g) new MutationObserver(() => { try { dashUpdate(); } catch (e) {} }).observe(g, { attributes: true, attributeFilter: ["class"] });
})();
