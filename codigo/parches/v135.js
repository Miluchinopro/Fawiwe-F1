/* =====================================================================================
   FAWIWE · V135
   - 🎯 Desafíos por época (70s, 80s, 90s y 2000s).
   - 🚗 Presentación del auto nuevo al empezar cada temporada.
   - 📖 Tutorial con todo lo nuevo.
   ===================================================================================== */
(function () {
  if (typeof V4_CHAL === "undefined") return;
  const add = c => { if (!V4_CHAL.find(x => x.id === c.id)) V4_CHAL.push(c); };
  V4_CHAL.forEach(c => { if (!c.era) c.era = "🏁 Hoy (2026)"; });
  const E70 = "🕺 Años 70", E80 = "🚀 Años 80 · turbos", E90 = "📼 Años 90", E00 = "💿 Años 2000";
  add({ era: E70, id: "e70a", ic: "🍝", t: "Monza a fondo (1975)", d: "Largás P10 en el templo de la velocidad. Terminá en el top 5.", year: 1975, trk: "Italia", start: 10, car: 70, goal: me => !me.status && me.pos <= 5 });
  add({ era: E70, id: "e70b", ic: "🌧️", t: "Diluvio en Silverstone (1977)", d: "Lluvia fuerte y largás P15. Terminá en el top 6.", year: 1977, trk: "Gran Bretaña", start: 15, car: 62, wet: true, goal: me => !me.status && me.pos <= 6 });
  add({ era: E70, id: "e70c", ic: "🎰", t: "Mónaco de memoria (1978)", d: "Largás P3 en las calles. Ganá la carrera.", year: 1978, trk: "Mónaco", start: 3, car: 76, goal: me => !me.status && me.pos === 1 });
  add({ era: E80, id: "e80a", ic: "💨", t: "Turbo en Monza (1985)", d: "Más de 1000 caballos y largás P8. Subite al podio.", year: 1985, trk: "Italia", start: 8, car: 78, goal: me => !me.status && me.pos <= 3 });
  add({ era: E80, id: "e80b", ic: "👑", t: "Final en Australia (1986)", d: "Última fecha: estás 4 puntos atrás del líder. Salí campeón.", year: 1986, trk: "Australia", start: 3, car: 84, title: true, gap: 4, goal: me => !me.status && v4ChalTitleOk(me) });
  add({ era: E80, id: "e80c", ic: "🌧️", t: "Lluvia en Mónaco (1984)", d: "Largás P13 bajo la lluvia. Terminá en el podio.", year: 1984, trk: "Mónaco", start: 13, car: 74, wet: true, goal: me => !me.status && me.pos <= 3 });
  add({ era: E90, id: "e90a", ic: "⛈️", t: "Primera vuelta mágica (1993)", d: "Lluvia en Gran Bretaña, largás P5. Ganá la carrera.", year: 1993, trk: "Gran Bretaña", start: 5, car: 80, wet: true, goal: me => !me.status && me.pos === 1 });
  add({ era: E90, id: "e90b", ic: "🗻", t: "Suzuka por el título (1998)", d: "Última fecha en Japón: estás 4 puntos adelante. Que no te alcancen.", year: 1998, trk: "Japón", start: 2, car: 86, title: true, gap: -4, goal: me => !me.status && v4ChalTitleOk(me) });
  add({ era: E90, id: "e90c", ic: "🇧🇷", t: "Interlagos a full (1991)", d: "Largás P8 en San Pablo. Ganá la carrera.", year: 1991, trk: "Brasil", start: 8, car: 82, goal: me => !me.status && me.pos === 1 });
  add({ era: E00, id: "e00a", ic: "🚀", t: "Desde el fondo en Japón (2005)", d: "Largás P17. Ganá la carrera.", year: 2005, trk: "Japón", start: 17, car: 88, goal: me => !me.status && me.pos === 1 });
  add({ era: E00, id: "e00b", ic: "👑", t: "Final en Brasil (2008)", d: "Última fecha en Interlagos: estás 7 puntos atrás. Salí campeón.", year: 2008, trk: "Brasil", start: 4, car: 84, title: true, gap: 7, goal: me => !me.status && v4ChalTitleOk(me) });
  add({ era: E00, id: "e00c", ic: "🌙", t: "Noche en Bahréin (2004)", d: "Largás P6 en el desierto. Subite al podio.", year: 2004, trk: "Bahréin", start: 6, car: 79, goal: me => !me.status && me.pos <= 3 });
})();

/* ---------------------------------- 🚗 PRESENTACIÓN DEL AUTO ---------------------------------- */
function v5LaunchBusy() {
  return ["resultOverlay", "ngOverlay", "rankUpOverlay", "aiEventOverlay", "podOverlay", "hofOverlay", "dlOverlay", "qlOverlay", "engLiveOverlay", "mcGo"].some(id => { const el = document.getElementById(id); return el && (el.classList.contains("show") || (id === "mcGo" && el.style.display !== "none" && el.offsetParent)); })
    || (document.getElementById("pressOverlay") && document.getElementById("pressOverlay").style.display === "flex");
}
function v5LaunchWanted() { return v3Game() && !s.player2 && !s.challenge && s.gp === 0 && (s.session || 0) === 0 && !s.raceDone && s._launchSeen !== s.season && !s.gameOver; }
function v5Launch() {
  if (!v5LaunchWanted()) return;
  if (v5LaunchBusy()) { setTimeout(v5Launch, 1200); return; }
  s._launchSeen = s.season;
  s._carHist = s._carHist || {};
  const prev = s._carHist[s.season - 1];
  s._carHist[s.season] = Math.round(s.car || 50);
  const col = (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
  const era = typeof fwEra === "function" ? fwEra(s.season) : { y: 2026, cap: "" };
  const car = typeof fwCarSvg === "function" ? fwCarSvg(era.y, col) : "";
  let lineup = []; try { lineup = myTeamLineup().map(d => d.name.replace(" (reserva)", "")); } catch (e) {}
  let sprints = []; try { if (s.season >= 2021) sprints = engSprintGPs(s.season); } catch (e) {}
  const delta = prev != null ? Math.round(s.car) - prev : null;
  const code = (s.team || "FW").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() + String(s.season).slice(-2);
  let ov = document.getElementById("v5Launch");
  if (!ov) { ov = document.createElement("div"); ov.id = "v5Launch"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="v5-stage" style="--tc:${col}">
    <div class="v5-beams"><i></i><i></i><i></i></div><div class="v5-flash"></div>
    <div class="v5-k">PRESENTACIÓN OFICIAL · TEMPORADA ${s.season}</div>
    <h1>${v3Esc(s.team)}</h1><div class="v5-code">${code}</div>
    <div class="v5-car">${car}<div class="v5-cover"></div></div>
    <div class="v5-specs">
      <div><span>RENDIMIENTO</span><b>${Math.round(s.car || 50)}/100</b>${delta != null ? `<em class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲ +" : "▼ "}${delta} vs ${s.season - 1}</em>` : `<em>auto nuevo</em>`}</div>
      <div><span>ÉPOCA</span><b>${v3Esc(era.cap || "")}</b></div>
      <div><span>PILOTOS</span><b>${lineup.map(v3Esc).join(" · ") || "—"}</b></div>
      ${s.seasonObjective && s.seasonObjective.season === s.season ? `<div><span>OBJETIVO</span><b>${v3Esc(s.seasonObjective.label)}</b></div>` : ""}
    </div>
    <div class="v5-cal"><span>CALENDARIO ${s.season}${s.shortSeason ? " · temporada rápida" : ""}</span><div>${trackData.map((t, i) => `<i class="${s.shortSeason && typeof V4_SHORT !== "undefined" && !V4_SHORT.includes(i) ? "sim" : ""}">${i + 1}. ${v3Esc(t.name)}${sprints.includes(i) ? " ⚡" : ""}</i>`).join("")}</div></div>
    <button type="button" class="lv-btn red v5-go" onclick="v5LaunchClose()">🏁 ¡A la pista!</button></div>`;
  ov.classList.add("show");
  try { v3Fanfare(); } catch (e) {}
  setTimeout(() => { try { if (ov.classList.contains("show")) fwRadioSay(s.playerMode === "driver" ? "Este es el auto " + s.season + ". Que lo disfrutes." : "Presentamos el auto " + s.season + ". A trabajar.", s.playerMode === "driver" ? "eng" : "drv"); } catch (e) {} }, 2600);
}
function v5LaunchClose() { const ov = document.getElementById("v5Launch"); if (ov) ov.classList.remove("show"); }

/* ---------------------------------- 📖 TUTORIAL ---------------------------------- */
const V5_TUT = `<div id="v5Tut"><h3>📺 Transmisión de carrera (modo piloto)</h3><ul>
  <li>Después de la cinemática de carrera ves la carrera <b>vuelta por vuelta</b>: tablero, mapa del circuito con los autos, paradas en boxes (🔧) y highlights.</li>
  <li><b>📻 Radio</b>: <kbd>Q</kbd> para quejarte (gomas, maniobras peligrosas, problemas del auto) y <kbd>T</kbd> para cambiar la estrategia. Lo que decidís cambia el resultado.</li>
  <li>Tu <b>ingeniero de pista</b> tiene nombre y personalidad: si seguís sus consejos, la relación mejora y ganás ritmo.</li>
  <li>Durante la carrera pueden aparecer: <b>ventana de boxes</b>, elección de <b>gomas</b> (blandos, medios, duros, intermedios, lluvia), <b>lluvia</b>, <b>daño</b>, <b>bandera roja</b>, <b>límites de pista</b> (3 advertencias = +5s), <b>órdenes de equipo</b> y el <b>⚔️ duelo final</b> (apretá Espacio en la zona verde).</li>
  <li>En fines de semana con <b>⚡ sprint</b> primero corrés la sprint del sábado (puntos del 8 al 1).</li>
  <li>"Saltar al final" resuelve todo lo pendiente con la opción por defecto.</li></ul>
  <h3>⏱️ Clasificación en vivo (piloto e ingeniero)</h3><ul>
  <li>Q1, Q2 y Q3 con la tabla de tiempos y la <b>zona de eliminación</b>. Si estás cerca del corte, elegís salir a una última vuelta (con riesgo de que te la borren).</li></ul>
  <h3>🔧 Modo ingeniero en vivo</h3><ul>
  <li><b>Pit stop jugable</b>: elegís las gomas (<kbd>1</kbd>-<kbd>3</kbd>), cambiás las 4 ruedas tocando la que se ilumina (<kbd>1</kbd>-<kbd>4</kbd>) y soltás el auto con la luz verde (<kbd>Espacio</kbd>).</li>
  <li><b>Duelo final</b>: le das el modo ataque (o la orden de defender) en el momento justo.</li></ul>
  <h3>🎮 Más formas de jugar (menú)</h3><ul>
  <li><b>🎯 Desafíos</b>: situaciones de una carrera, de los 70 hasta hoy. <b>🕰️ Toda una vida</b>: arrancás en 1975. <b>⚡ Temporada rápida</b>: 5 GP por año. <b>🎵 Música de época</b>.</li></ul>
  <h3>🗂️ Tu carrera</h3><ul>
  <li>Calendario distinto cada temporada, con las <b>vueltas reales</b> de cada circuito. Al empezar cada año, la <b>presentación del auto nuevo</b> y la <b>🧪 pretemporada</b>.</li>
  <li>Tarjetas: 👔 jefe de equipo, 📱 redes, 🤵 mánager, 🪖 casco (diseño propio en pilotos personalizados), 🏁 récords por circuito, 🏛️ salón de la fama, 🏅 medallas y ♿ accesibilidad.</li>
  <li>💾 El juego se <b>guarda solo</b> después de cada GP (aparece primero en "Cargar partida").</li></ul></div>`;
(function () {
  const put = () => { const t = document.getElementById("tutorial"); if (t && !document.getElementById("v5Tut")) t.insertAdjacentHTML("afterbegin", V5_TUT); };
  if (document.readyState !== "loading") put(); else document.addEventListener("DOMContentLoaded", put);
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try { if (v5LaunchWanted() && !window._v5Pending) { window._v5Pending = true; setTimeout(() => { window._v5Pending = false; v5Launch(); }, 900); } } catch (e) {}
    return x;
  };
  document.addEventListener("keydown", ev => { const ov = document.getElementById("v5Launch"); if (ov && ov.classList.contains("show") && (ev.key === "Enter" || ev.key === "Escape")) { ev.preventDefault(); v5LaunchClose(); } });
})();
