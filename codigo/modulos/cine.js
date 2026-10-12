/* =====================================================================================
   FAWIWE · CINE
   - Intro: "La evolución de la F1" (7 autos de distintas épocas) entre "Presenta" y el auto de frente.
   - Compras: barras de cine + cámara.
   - Largada: el auto de tu época, con el color de tu equipo, cruza la pantalla.
   - Ingeniero en vivo: presentación de TV antes de la largada.
   - Ingeniero: tarjeta "Tu auto de esta época" + área clave según la época.
   ===================================================================================== */
// K = cámara lenta de toda la intro · EXTRA = escena nueva de circuitos entre la evolución y el auto de frente
const FW_INTRO = { T0: 1.6, SLOT: 0.95, EXTRA: 3.4, K: 1.25 };
FW_INTRO.EVO_OUT = +(FW_INTRO.T0 + FW_INTRO.SLOT * FW_ERAS.length).toFixed(2);
FW_INTRO.SHIFT = +(FW_INTRO.EVO_OUT + FW_INTRO.EXTRA - 1.45 - 0.05).toFixed(2); // la escena del auto entra cuando terminan los circuitos
const FW_CIRCUITS = [
  ["Mónaco", "Montecarlo · las calles más famosas", "M20,90 L60,95 Q80,96 85,80 L95,40 Q98,25 115,28 L160,35 Q178,38 175,55 L168,70 Q165,80 150,78 L120,74 Q105,73 100,85 L96,100 Q93,110 75,108 L30,104 Q15,102 20,90 Z"],
  ["Monza", "Italia · el templo de la velocidad", "M30,95 L150,95 Q185,95 185,70 Q185,45 160,40 L120,30 L60,20 Q30,15 25,40 L20,75 Q18,95 30,95 Z"],
  ["Spa-Francorchamps", "Bélgica · Eau Rouge y Raidillon", "M25,80 L45,40 Q55,22 75,30 L110,50 L150,20 Q170,10 178,30 L182,60 Q184,80 165,85 L120,92 L70,100 Q35,106 25,80 Z"],
  ["Interlagos", "Brasil · la S de Senna", "M40,30 Q20,35 25,60 Q30,85 60,95 L130,100 Q170,102 175,75 Q178,55 150,50 L110,58 Q90,60 95,40 Q100,22 80,20 Z"]
];
function fwBuildCircuits(host, t0, len) {
  const el = document.createElement("div");
  el.className = "ci-layer ci-circ";
  el.style.animationDelay = t0 + "s," + (t0 + len - 0.3).toFixed(2) + "s";
  const slot = len / FW_CIRCUITS.length;
  el.innerHTML = `<div class="evo-bg"></div><div class="circ-k"><span class="bc-badge">F1</span>LOS CIRCUITOS LEGENDARIOS</div>` +
    FW_CIRCUITS.map((c, i) => { const d = (t0 + i * slot).toFixed(2); return `<div class="circ-item" style="animation-delay:${d}s;animation-duration:${slot.toFixed(2)}s">
      <svg viewBox="0 0 200 120"><path class="circ-shadow" d="${c[2]}"/><path class="circ-path" pathLength="1" d="${c[2]}" style="animation-delay:${d}s;animation-duration:${(slot * 0.7).toFixed(2)}s"/><circle class="circ-dot" r="5"><animateMotion dur="${(slot * 0.7).toFixed(2)}s" begin="indefinite" fill="freeze" path="${c[2]}"/></circle></svg>
      <b>${c[0]}</b><span>${c[1]}</span><em>${i + 1}/${FW_CIRCUITS.length}</em></div>`; }).join("");
  host.appendChild(el);
  return el;
}

function fwEraIdx(year) {
  const y = parseInt(year, 10) || 2026;
  let k = 0;
  FW_ERAS.forEach((e, i) => { if (y >= e.y) k = i; });
  return k;
}
function fwEra(year) { return FW_ERAS[fwEraIdx(year)]; }

/* ---------- intro del juego ---------- */
(function fwIntroEvolution() {
  const intro = document.getElementById("introScreen");
  if (!intro || typeof fwBuildEvolution !== "function") return;
  const scene = intro.querySelector(".ci-scene");
  if (!scene) return;
  const sel = ".ci-scene,.ci-scene *,.ci-flash,.ci-lights,.ci-lights *,.ci-final,.ci-final *,.ci-skip";
  intro.querySelectorAll(sel).forEach(el => {
    const cs = getComputedStyle(el);
    if (!cs.animationName || cs.animationName === "none") return;
    el.style.animationDelay = cs.animationDelay.split(",").map(x => (parseFloat(x) + FW_INTRO.SHIFT).toFixed(2) + "s").join(",");
  });
  const evo = fwBuildEvolution(intro, FW_INTRO.T0, FW_INTRO.SLOT);
  intro.insertBefore(evo, scene);
  const circ = fwBuildCircuits(intro, FW_INTRO.EVO_OUT, FW_INTRO.EXTRA);
  intro.insertBefore(circ, scene);
  // cámara lenta: toda la intro dura K veces más
  const K = FW_INTRO.K, sc = v => v.split(",").map(x => (parseFloat(x) * K).toFixed(2) + "s").join(",");
  [intro, ...intro.querySelectorAll("*")].forEach(el => {
    if (el.closest && el.closest("#fwSoundChip")) return;
    const cs = getComputedStyle(el);
    if (!cs.animationName || cs.animationName === "none") return;
    el.style.animationDelay = sc(cs.animationDelay);
    el.style.animationDuration = sc(cs.animationDuration);
  });
  if (typeof FWAudio !== "undefined" && FWAudio.introTimes) FWAudio.introTimes({ build: 1.6 * K, h0: (4.1 + FW_INTRO.SHIFT) * K, h1: (6.0 + FW_INTRO.SHIFT) * K });
})();
// Reemplaza ciBegin: mismos efectos, corridos por la secuencia nueva, + un "whoosh" por cada auto.
window.ciBegin = function () {
  const el = document.getElementById("introScreen");
  if (!el || !el.classList.contains("ci-wait")) return;
  el.classList.remove("ci-wait");
  if (typeof FWAudio === "undefined") return;
  FWAudio.unlock();
  FWAudio.musicStart("intro");
  const sh = FW_INTRO.SHIFT * 1000;
  const at = (ms, fn) => ciSfxTimers.push(setTimeout(fn, ms));
  FW_ERAS.forEach((e, k) => at((FW_INTRO.T0 + k * FW_INTRO.SLOT) * 1000 + 60, () => FWAudio.whoosh()));
  at(3750 + sh, () => FWAudio.whoosh());
  [4300, 4550, 4800, 5050, 5300].forEach(ms => at(ms + sh, () => FWAudio.beep(false)));
  at(6000 + sh, () => FWAudio.beep(true));
};

/* ---------- compras: barras de cine ---------- */
(function () {
  const o = window.bfxScene;
  if (typeof o !== "function") return;
  window.bfxScene = function (def) {
    const h = o.apply(this, arguments);
    return h.replace('<div class="bfx-stage">', '<div class="bfx-stage cine-on"><div class="cine-bar top"></div><div class="cine-bar bot"></div><div class="cine-rec">EN VIVO</div>');
  };
})();

/* ---------- largada: auto de la época ---------- */
(function () {
  const o = window.beginCareer;
  if (typeof o !== "function") return;
  window.beginCareer = function () {
    const r = o.apply(this, arguments);
    try {
      const ov = document.getElementById("mcGo");
      if (ov) {
        const club = document.getElementById("club")?.value || "";
        const ctOn = document.getElementById("engCtOn")?.checked && (document.getElementById("engCtName")?.value || "").trim();
        const team = ctOn || club;
        const color = (ctOn && document.getElementById("engCtColor")?.value) || (typeof teamColors !== "undefined" && teamColors[team]) || "#e10600";
        const year = document.getElementById("startYear")?.value || 2026;
        let car = ov.querySelector(".go-car");
        if (!car) { car = document.createElement("div"); car.className = "go-car"; ov.appendChild(car); }
        car.innerHTML = fwCarSvg(fwEra(year).y, color);
      }
    } catch (e) {}
    return r;
  };
})();

/* ---------- ingeniero: presentación de TV antes de la carrera en vivo ---------- */
(function () {
  const o = window.engStartLive;
  if (typeof o !== "function") return;
  let busy = false;
  window.engStartLive = function () {
    const self = this, args = arguments;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (busy) return;
    if (reduce || window.FW_NO_PRESHOW) return o.apply(self, args);
    busy = true;
    const tr = (typeof trackData !== "undefined" && trackData[s.gp]) || {};
    const name = typeof engTrackName === "function" ? engTrackName() : (tr.name || "");
    const color = (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
    const lines = '<svg class="bc-lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${6 + k * 12}" width="${388 - k * 24}" height="${288 - k * 24}" rx="${60 - k * 10}" pathLength="1" style="animation-delay:${(0.1 + k * 0.1).toFixed(2)}s"/>`).join("") + "</svg>";
    const ov = document.createElement("div");
    ov.id = "engPreShow";
    ov.innerHTML = `<div class="ps-plate">${lines}<div class="ps-k"><span class="bc-badge">F1</span>GRAN PREMIO · RONDA ${(s.gp || 0) + 1}</div>
      <div class="ps-gp">${engEsc(name)}</div><div class="ps-year">${s.season}</div>
      <div class="ps-facts"><span>🏁 ${tr.laps || 58} vueltas</span>${s.weather && s.weather.label ? `<span>${engEsc(s.weather.label)}</span>` : ""}<span>🏎️ ${engEsc(s.team || "")}</span></div></div>
      <div class="ps-car">${fwCarSvg(fwEra(s.season).y, color)}</div>
      <div class="ps-gantry"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="ps-skip">Tocá para saltar ⏭️</div>`;
    document.body.appendChild(ov);
    const timers = [];
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      ov.classList.add("bye");
      setTimeout(() => ov.remove(), 320);
      busy = false;
      try { if (typeof FWAudio !== "undefined") FWAudio.beep(true); } catch (e) {}
      o.apply(self, args);
    };
    ov.addEventListener("click", go);
    const spans = [...ov.querySelectorAll(".ps-gantry span")];
    spans.forEach((sp, i) => timers.push(setTimeout(() => { sp.classList.add("on"); try { FWAudio.beep(false); } catch (e) {} }, 1300 + i * 280)));
    timers.push(setTimeout(go, 1300 + 5 * 280 + 450));
  };
})();

/* ---------- ingeniero: autos y reglas por época ---------- */
const FW_ERA_ENG = [
  { key: "reliab", txt: "Los autos se rompían todo el tiempo: terminar la carrera ya era medio triunfo." },
  { key: "chassis", txt: "Sin ayudas electrónicas y con los primeros alerones: la mecánica y el chasis marcan la diferencia." },
  { key: "aero", txt: "Efecto suelo: el que domina el aire por debajo del auto, gana." },
  { key: "engine", txt: "Turbos de más de 1000 caballos: el motor pesa en TODOS los circuitos." },
  { key: "tyres", txt: "Guerra de neumáticos y reabastecimiento: la goma decide las carreras." },
  { key: "aero", txt: "Difusores, KERS y después los híbridos: la aerodinámica vuelve a ser la reina." },
  { key: "engine", txt: "Mitad eléctrico y aerodinámica activa: la unidad de potencia es clave." }
];
const FW_KEY_LABEL = { reliab: "🔧 Confiabilidad", chassis: "⚙️ Chasis y suspensión", aero: "🌬️ Aerodinámica", tyres: "⚫ Neumáticos", engine: "🔧 Motor" };
function fwEraCardHtml(year, color) {
  const k = fwEraIdx(year), era = FW_ERAS[k], info = FW_ERA_ENG[k];
  return `<div class="era-card"><div class="era-svg">${fwCarSvg(era.y, color)}</div><div class="era-txt">
    <div class="era-y">${year}</div><b>Tu auto de esta época: ${engEsc(era.cap)}</b>
    <p class="small" style="margin:4px 0">${engEsc(info.txt)}</p>
    <span class="small">Área clave de la época:</span> <span class="era-tag">${FW_KEY_LABEL[info.key]} · cuenta más</span></div></div>`;
}
(function () {
  const ab = window.engAttrBonus;
  if (typeof ab === "function") {
    window.engAttrBonus = function () {
      let b = ab.apply(this, arguments);
      try {
        const info = FW_ERA_ENG[fwEraIdx(s.season)];
        const a = engEnsure().attr;
        if (info.key === "engine") { if (engTrackType() !== "power") b += (engMyEngine().power - 86) * 0.12; }
        else b += (a[info.key] || 0) * 0.08;
      } catch (e) {}
      return b;
    };
  }
  const color = () => (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
  ["engTabRace", "engTabDev"].forEach(n => {
    const f = window[n];
    if (typeof f !== "function") return;
    window[n] = function () { return fwEraCardHtml(s.season, color()) + f.apply(this, arguments); };
  });
})();

/* ---------- inicio: volante con START ENGINE ---------- */
function swSync() {
  const b = document.getElementById("swSoundBtn");
  if (b) { const on = s.soundOn !== false; b.classList.toggle("off", !on); b.innerHTML = (on ? "🔊" : "🔇") + "<b>SONIDO</b>"; }
}
function swSound() {
  const on = s.soundOn === false;
  s.soundOn = on;
  const sel = document.getElementById("soundToggle"); if (sel) sel.value = on ? "on" : "off";
  if (!on && typeof FWAudio !== "undefined") FWAudio.musicStop(0.3);
  if (on && typeof FWAudio !== "undefined") { FWAudio.unlock(); FWAudio.click(); }
  swSync();
}
function swTutorial() {
  dismissIntro();
  setTimeout(() => { if (typeof toggleTutorial === "function") { const box = document.getElementById("gameTutorialBox"); if (!box || box.classList.contains("hidden")) toggleTutorial(); } }, 600);
}
function swStart() {
  const w = document.getElementById("introWheel");
  if (!w) return dismissIntro();
  if (w.classList.contains("rev")) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return dismissIntro();
  w.classList.add("rev");
  try { FWAudio.unlock(); FWAudio.rev(); } catch (e) {}
  const leds = [...w.querySelectorAll(".sw-leds i")];
  leds.forEach((l, i) => setTimeout(() => l.classList.add("on"), i * 30));
  const txt = document.getElementById("swTxt"), gear = document.getElementById("swGear");
  if (txt) txt.textContent = "¡VAMOS!";
  setTimeout(() => { if (gear) gear.textContent = "1"; }, 380);
  setTimeout(() => {
    dismissIntro();
    setTimeout(() => { w.classList.remove("rev"); leds.forEach(l => l.classList.remove("on")); if (txt) txt.textContent = "LARGAR"; if (gear) gear.textContent = "N"; }, 700);
  }, 560);
}
swSync();

/* ---------- arranque directo + sonido desde el principio ----------
   La cinemática arranca sola. Si el navegador deja sonar audio, suena desde el segundo 0.
   Si no (la mayoría pide un toque antes), el PRIMER toque solo activa el sonido —sin saltear
   la cinemática— y la música y los efectos entran sincronizados con lo que se está viendo. */
function fwCircDots() {
  const intro = document.getElementById("introScreen"); if (!intro) return;
  const K = FW_INTRO.K, slot = FW_INTRO.EXTRA / FW_CIRCUITS.length;
  intro.querySelectorAll(".circ-item animateMotion").forEach((a, i) => {
    a.setAttribute("dur", (slot * 0.7 * K).toFixed(2) + "s");
    setTimeout(() => { try { a.beginElement(); } catch (e) {} }, (FW_INTRO.EVO_OUT + i * slot) * K * 1000);
  });
}
(function fwIntroAudioBoot() {
  const K = FW_INTRO.K;
  const BASE_IT = { build: 1.6 * K, h0: (4.1 + FW_INTRO.SHIFT) * K, h1: (6.0 + FW_INTRO.SHIFT) * K };
  const END = (FW_INTRO.SHIFT + 7.2) * K * 1000; // cuándo termina la cinemática
  let t0 = 0, audioOn = false, eat = false;
  const el = () => document.getElementById("introScreen");
  const elapsed = () => (t0 ? performance.now() - t0 : 0);
  const cineRunning = () => { const e = el(); return !!e && e.style.display !== "none" && !e.classList.contains("intro-hidden") && !e.classList.contains("ci-skipped") && elapsed() < END; };
  const chip = () => {
    const c = document.getElementById("fwSoundChip"); if (!c) return;
    const on = !(typeof s !== "undefined" && s && s.soundOn === false);
    c.classList.toggle("off", !on);
    c.innerHTML = on ? `🔊 <b>Sonido activado</b><small>${audioOn ? "tocá acá para silenciar" : "suena al tocar la pantalla · acá lo silenciás"}</small>` : `🔇 <b>Sonido apagado</b><small>tocá acá para activarlo</small>`;
  };
  function bindChip() {
    const c = document.getElementById("fwSoundChip"); if (!c) return;
    c.onpointerdown = ev => ev.stopPropagation();
    c.onclick = ev => {
      ev.stopPropagation(); ev.preventDefault();
      try { swSound(); } catch (e) {}
      if (!(typeof s !== "undefined" && s && s.soundOn === false)) { startAudio(); [60, 200, 450].forEach(ms => setTimeout(() => { if (!audioOn && s.soundOn !== false) { startAudio(); chip(); } }, ms)); }
      chip();
    };
    chip();
  }
  function startAudio() {
    if (audioOn || typeof FWAudio === "undefined") return audioOn;
    try { FWAudio.unlock(); } catch (e) { return false; }
    if (!FWAudio.ready()) return false;
    audioOn = true; chip();
    // si la cinemática ya venía corriendo muda, la arrancamos de nuevo desde el segundo 0 con sonido
    if (cineRunning() && elapsed() > 300) {
      const old = el(), fresh = old.cloneNode(true);
      old.replaceWith(fresh);
      t0 = performance.now();
      fwCircDots(); bindChip(); chipHideLater();
    }
    const e = elapsed() / 1000;
    if (cineRunning()) {
      // música de la intro corrida al momento exacto + los efectos que todavía no pasaron
      FWAudio.introTimes({ build: BASE_IT.build - e, h0: BASE_IT.h0 - e, h1: BASE_IT.h1 - e });
      FWAudio.musicStart("intro");
      const sh = FW_INTRO.SHIFT;
      const at = (sec, fn) => { const ms = (sec * K - e) * 1000; if (ms > -30) ciSfxTimers.push(setTimeout(fn, Math.max(0, ms))); };
      FW_ERAS.forEach((x, k) => at(FW_INTRO.T0 + k * FW_INTRO.SLOT + 0.06, () => FWAudio.whoosh()));
      FW_CIRCUITS.forEach((x, k) => at(FW_INTRO.EVO_OUT + k * FW_INTRO.EXTRA / FW_CIRCUITS.length + 0.05, () => { FWAudio.whoosh(); setTimeout(() => FWAudio.click(), 250); }));
      at(3.75 + sh, () => FWAudio.whoosh());
      [4.3, 4.55, 4.8, 5.05, 5.3].forEach(sec => at(sec + sh, () => FWAudio.beep(false)));
      at(6.0 + sh, () => FWAudio.beep(true));
    } else {
      FWAudio.musicStart("full");
    }
    return true;
  }
  let chipTimer = null;
  const chipHideLater = () => { clearTimeout(chipTimer); chipTimer = setTimeout(() => { const c = document.getElementById("fwSoundChip"); if (c) c.classList.add("gone"); }, END); };
  window.ciBegin = function () {
    const e = el();
    if (!e || !e.classList.contains("ci-wait")) return;
    e.classList.remove("ci-wait");
    t0 = performance.now(); chipHideLater();
    // ¿el navegador ya deja sonar? (por ejemplo si tocaste algo antes de abrir el juego)
    try { if (typeof FWAudio !== "undefined") FWAudio.unlock(); } catch (x) {}
    setTimeout(() => { startAudio(); chip(); }, 120);
    fwCircDots();
  };
  // primer toque / tecla: activa el sonido; si la cinemática está corriendo, NO la saltea
  // (en celulares el permiso llega recién al soltar el dedo: probamos en cada evento)
  const retry = () => { [0, 60, 200, 450].forEach(ms => setTimeout(() => { if (!audioOn) startAudio(); }, ms)); };
  const wake = ev => {
    if (audioOn) return;
    if (ev.target && ev.target.closest && ev.target.closest("#fwSoundChip")) return;
    if (typeof s !== "undefined" && s && s.soundOn === false) return;
    if (cineRunning()) { eat = true; if (ev.type !== "keydown") ev.stopPropagation(); }
    startAudio(); retry();
  };
  ["pointerdown", "pointerup", "touchend", "keydown"].forEach(tp => document.addEventListener(tp, wake, true));
  document.addEventListener("click", ev => {
    if (ev.target && ev.target.closest && ev.target.closest("#fwSoundChip")) return;
    if (!audioOn && !(typeof s !== "undefined" && s && s.soundOn === false)) startAudio();
    if (eat) { eat = false; ev.stopPropagation(); ev.preventDefault(); }
  }, true);
  // el chip de sonido
  const intro = el();
  if (intro && !document.getElementById("fwSoundChip")) intro.insertAdjacentHTML("beforeend", `<button type="button" id="fwSoundChip" class="show"></button>`);
  bindChip();
  const go = () => { try { window.ciBegin(); } catch (e) {} };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else setTimeout(go, 0);
})();
