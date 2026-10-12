/* =====================================================================================
   FAWIWE · EXPLOTAR CONTRA LOS MEDIOS (opcional)
   Si en la carrera te sancionaron o chocaste/abandonaste, en la rueda de prensa aparece la
   opción de insultar a los medios (con los insultos censurados). Te descargás (+calma),
   pero la FIA te multa, perdés popularidad, confianza y fama… y a veces se hace viral.
   ===================================================================================== */
const RANT_LINES = {
  pen: ["¡Esto es un #@$%& robo! ¡Los comisarios no saben NADA de carreras!", "¿Cinco segundos? ¡¿CINCO?! ¡Que se los pongan en el #@!%&, a ver qué les parece!", "¡Con estos comisarios mejor corramos con los ojos cerrados, $%#&!"],
  dnf: ["¿Me preguntan por el choque? ¡Pregúntenle al #@!% que me tocó!", "¡No voy a contestar nada! ¡Váyanse todos a la &%$#!", "¡Un auto así no lo maneja ni mi abuela, #@$%&!"],
  eng: ["¡Esta sanción es un #@$%& escándalo y la vamos a pelear!", "¡Mi piloto hizo todo bien y nos robaron, $%#&!", "¡No tengo nada para decir a estos #@!% de los comisarios!"]
};
// guardar qué pasó con tus autos en la última carrera
(function () {
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind, title, sub, cls, grid) {
    try {
      if (/^CARRERA/.test(String(kind)) && Array.isArray(grid)) {
        const mine = grid.filter(e => e && e.mine);
        s._rantCtx = { key: s.season + "_" + s.gp, pen: mine.some(e => e.penalty), dnf: mine.some(e => e.status === "DNF"), done: false };
      }
    } catch (e) {}
    return sb.apply(this, arguments);
  };
  const sp = window.showPress;
  if (typeof sp === "function") window.showPress = function () {
    const r = sp.apply(this, arguments);
    try {
      const old = document.getElementById("pressRant"); if (old) old.remove();
      const c = s._rantCtx;
      if (c && c.key === s.season + "_" + s.gp && (c.pen || c.dnf) && !c.done && !s.player2) {
        const score = document.getElementById("pressScore");
        score && score.insertAdjacentHTML("beforebegin", `<div id="pressRant" class="rant-box">
          <span>${c.pen ? "⚖️ Te sancionaron" : "💥 Chocaste / abandonaste"} y tenés bronca…</span>
          <button class="era-btn rant-btn" onclick="rantGo()">🤬 Insultar a los medios</button>
          <span class="small">Opcional: te descargás, pero hay multa, perdés popularidad y fama.</span></div>`);
      }
    } catch (e) { console.warn(e); }
    return r;
  };
})();
function rantGo() {
  const c = s._rantCtx; if (!c || c.done) return;
  c.done = true;
  const drv = s.playerMode === "driver";
  const pool = drv ? (c.pen ? RANT_LINES.pen : RANT_LINES.dnf) : RANT_LINES.eng;
  const line = pool[Math.floor(Math.random() * pool.length)];
  // consecuencias
  const fineM = drv ? Math.round((0.05 + Math.random() * 0.15) * 100) / 100 : 2;
  s.money = Math.max(0, Math.round((s.money - fineM) * 100) / 100);
  s.pop = clamp((s.pop || 50) - 6); s.trust = clamp((s.trust || 50) - 6);
  try { const L = homeLife(); L.calma = Math.min(100, L.calma + 6); L.animo = Math.min(100, L.animo + 2); L.carisma = Math.max(0, L.carisma - 4); } catch (e) {}
  let viral = false;
  try {
    if (typeof FAME_MEDIA !== "undefined") {
      FAME_MEDIA.forEach(m => fameAdd(m.c, drv ? -3 : -1));
      if (Math.random() < 0.3) { viral = true; FAME_MEDIA.slice().sort(() => Math.random() - 0.5).slice(0, 3).forEach(m => fameAdd(m.c, drv ? 6 : 2)); }
    }
  } catch (e) {}
  // las preguntas que faltaban quedan sin responder (te fuiste de la conferencia)
  window.pressAnswers = [true, true, true];
  document.querySelectorAll("#pressQuestions .press-option").forEach(b => (b.disabled = true));
  const cont = document.getElementById("pressContinue"); if (cont) { cont.disabled = false; cont.textContent = "Irte de la conferencia"; }
  const box = document.getElementById("pressRant");
  if (box) box.innerHTML = `<b>🤬 Explotaste y te fuiste de la conferencia.</b>`;
  add("🤬 Explotaste contra los medios: \"" + line + "\" · Multa de la FIA: " + formatMoney(fineM) + " · −6 popularidad, −6 confianza" + (viral ? " · ¡pero el video se hizo viral!" : "") + ".");
  // la escena
  const ov = document.createElement("div");
  ov.id = "rantCine";
  ov.innerHTML = `<div class="rc-flashes">${Array.from({ length: 9 }, (_, i) => `<i style="left:${8 + i * 10}%;top:${15 + (i * 37) % 60}%;animation-delay:${(i * 0.17).toFixed(2)}s"></i>`).join("")}</div>
    <div class="rant-mics">🎤 📸 🎙️ 📸 🎤</div>
    <div class="rant-face">🤬</div>
    <div class="rant-quote">"${line}"</div>
    <div class="rant-plate"><b>${drv ? "EL PILOTO" : "EL JEFE DEL EQUIPO"} EXPLOTÓ EN LA CONFERENCIA</b>
      <div>⚖️ Multa de la FIA: <b>${formatMoney(fineM)}</b>${drv ? "" : " (al equipo)"}</div>
      <div>📉 −6 popularidad · −6 confianza · menos fama en el mundo</div>
      <div>😤 Te descargaste: +6 calma · pero −4 carisma</div>
      ${viral ? `<div class="rant-viral">📱 ¡El video se hizo VIRAL! Ganaste fama en algunos países.</div>` : ""}</div>
    <button class="era-btn rant-ok" onclick="this.parentNode.remove()">Uf… seguir</button>`;
  document.body.appendChild(ov);
  try { FWAudio.bad(); setTimeout(() => { try { FWAudio.whoosh(); } catch (e) {} }, 300); } catch (e) {}
}
