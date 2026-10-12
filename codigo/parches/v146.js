/* =====================================================================================
   FAWIWE · V146 · Dos cinemáticas nuevas
   1) Al entrar al juego: boxes de noche → 76 años de F1 → tacómetro al rojo → logo.
   2) Al tocar "Jugar": viaje en el tiempo hasta tu año + credencial del paddock acreditada.
   ===================================================================================== */
const V16 = { introT: [], goT: [], introOn: false, goOn: false };
function v16Reduce() { try { return (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || document.body.classList.contains("fw-reduce"); } catch (e) { return false; } }
function v16Snd(fn, a) { try { if (typeof FWAudio !== "undefined" && (typeof s === "undefined" || !s || s.soundOn !== false) && FWAudio[fn]) FWAudio[fn](a); } catch (e) {} }
function v16Esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/* ============================ 1) INTRO ============================ */
function v16IntroBuild() {
  if (document.getElementById("v16Intro")) return;
  const cars = [[1955, "#c0392b", "1950"], [1978, "#1f2937", "1978"], [1998, "#c0c0c0", "1998"], [2026, "#e10600", "2026"]];
  const carSvg = (era, c) => { try { return fwCarSvg(era, c); } catch (e) { return ""; } };
  const ov = document.createElement("div");
  ov.id = "v16Intro"; ov.className = "gate";
  ov.innerHTML = `
    <div class="v16-gate">
      <div class="v16-gate-logo"><span class="v16-f1">F1</span><b>FAWIWE</b></div>
      <button type="button" class="v16-gate-btn" onclick="event.stopPropagation();v16IntroPlay(true)">▶ Tocá para empezar</button>
      <span class="v16-gate-k">🔊 Con música y sonido</span>
    </div>
    <div class="v16-stage">
      <div class="v16-s1">
        <div class="v16-garages">${[0, 1, 2, 3, 4, 5].map(i => `<i style="--i:${i}"><em></em></i>`).join("")}</div>
        <div class="v16-present"><span>FAWIWE</span> presenta</div>
      </div>
      <div class="v16-s2">
        <div class="v16-speed"></div>
        <div class="v16-big">76 AÑOS DE FÓRMULA 1</div>
        ${cars.map((c, i) => `<div class="v16-car" style="--i:${i}"><div class="v16-year">${c[2]}</div>${carSvg(c[0], c[1])}</div>`).join("")}
      </div>
      <div class="v16-s3">
        <div class="v16-tacho">
          <svg viewBox="0 0 200 120" aria-hidden="true">
            <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#2a2a33" stroke-width="14" stroke-linecap="round"/>
            <path class="v16-arc" d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#v16g)" stroke-width="14" stroke-linecap="round" pathLength="1"/>
            <defs><linearGradient id="v16g" x1="0" x2="1"><stop offset="0" stop-color="#22c55e"/><stop offset=".6" stop-color="#facc15"/><stop offset="1" stop-color="#e10600"/></linearGradient></defs>
            <line class="v16-needle" x1="100" y1="110" x2="100" y2="40" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <circle cx="100" cy="110" r="8" fill="#e10600"/>
          </svg>
          <div class="v16-rpm"><b>15.000</b> RPM</div>
          <div class="v16-leds">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<i class="${i < 4 ? "g" : i < 7 ? "y" : "r"}" style="--i:${i}"></i>`).join("")}</div>
        </div>
      </div>
      <div class="v16-flash"></div>
    </div>
    <div class="v16-final">
      <div class="v16-logo">
        <div class="v16-k"><span class="v16-f1">F1</span>EL JUEGO DE FÓRMULA 1 · 1950–2026</div>
        <h1>${"FAWIWE".split("").map((ch, i) => `<span style="--i:${i}" class="${i < 2 || i > 3 ? "r" : ""}">${ch}</span>`).join("")}</h1>
        <div class="v16-check"></div>
        <div class="v16-roles">Ingeniero · Jefe de equipo · Piloto</div>
      </div>
      <div class="v16-btns">
        <button type="button" class="v16-play" onclick="event.stopPropagation();v16IntroGo()">▶ JUGAR</button>
        <div class="v16-row">
          <button type="button" class="v16-small" id="v16Snd" onclick="event.stopPropagation();v16IntroSound()">🔊 Sonido</button>
          <button type="button" class="v16-small" onclick="event.stopPropagation();v16IntroTut()">📖 Cómo se juega</button>
        </div>
      </div>
      <div class="v16-by">Creado por Miluchino · Hecho con la ayuda de Claude 🤖</div>
    </div>
    <button type="button" class="v16-skip" onclick="event.stopPropagation();v16IntroFinal()">Saltar ⏭</button>`;
  ov.addEventListener("click", ev => { if (ov.classList.contains("play") && !ev.target.closest("button")) v16IntroFinal(); });
  document.body.appendChild(ov);
  V16.introOn = true;
  v16SndSync();
}
function v16SndSync() { const b = document.getElementById("v16Snd"); if (b) b.textContent = (typeof s !== "undefined" && s && s.soundOn === false) ? "🔇 Sin sonido" : "🔊 Sonido"; }
function v16IntroPlay(withSound) {
  const ov = document.getElementById("v16Intro"); if (!ov || !ov.classList.contains("gate")) return;
  if (withSound) { try { FWAudio.unlock(); } catch (e) {} }
  if (v16Reduce()) return v16IntroFinal();
  ov.classList.remove("gate"); ov.classList.add("play");
  const at = (ms, fn) => V16.introT.push(setTimeout(fn, ms));
  try { if (s.soundOn !== false) { FWAudio.introTimes({ build: 0.3, h0: 4.6, h1: 6.3 }); if (FWAudio.isPlaying()) FWAudio.musicMode("intro"); else FWAudio.musicStart("intro"); } } catch (e) {}
  [0, 1, 2, 3, 4, 5].forEach(i => at(250 + i * 170, () => v16Snd("click")));
  [0, 1, 2, 3].forEach(i => at(1750 + i * 640, () => v16Snd("whoosh")));
  at(4550, () => v16Snd("rev"));
  at(5350, () => v16Snd("rev"));
  at(6150, () => v16Snd("beep", true));
  at(6300, () => v16IntroFinal(true));
}
function v16IntroFinal(natural) {
  const ov = document.getElementById("v16Intro"); if (!ov || ov.classList.contains("final")) return;
  V16.introT.forEach(clearTimeout); V16.introT = [];
  if (ov.classList.contains("gate")) { try { FWAudio.unlock(); } catch (e) {} }
  ov.classList.remove("gate", "play"); ov.classList.add("final");
  try { if (s.soundOn !== false) { FWAudio.musicMode("full"); if (!FWAudio.isPlaying()) FWAudio.musicStart("full"); } } catch (e) {}
  [0, 1, 2, 3, 4, 5].forEach(i => V16.introT.push(setTimeout(() => v16Snd("click"), 120 + i * 90)));
  V16.introT.push(setTimeout(() => v16Snd("fanfare"), natural ? 700 : 650));
}
function v16IntroClose() {
  const ov = document.getElementById("v16Intro"); if (!ov) return;
  V16.introT.forEach(clearTimeout); V16.introT = [];
  V16.introOn = false;
  ov.classList.add("bye");
  setTimeout(() => ov.remove(), 450);
}
function v16IntroGo() {
  v16Snd("unlock"); v16Snd("rev");
  try { if (s.soundOn !== false && !FWAudio.isPlaying()) FWAudio.musicStart("full"); } catch (e) {}
  v16IntroClose();
  try { dismissIntro(); } catch (e) {}
}
function v16IntroSound() { try { swSound(); } catch (e) {} v16SndSync(); }
function v16IntroTut() { v16IntroClose(); try { swTutorial(); } catch (e) {} }
// la intro vieja queda escondida debajo: la nueva la reemplaza
(function () {
  const boot = () => {
    try {
      const old = document.getElementById("introScreen");
      if (!old || old.style.display === "none" || old.classList.contains("intro-hidden")) return;
      try { skipIntroCinematic(); } catch (e) {}
      old.classList.add("v16-under");
      v16IntroBuild();
      // si la página ya recibió un toque (por ejemplo "Jugar ahora" en la web), arranca sola
      let active = false;
      try { const ua = (window.parent && window.parent !== window && window.parent.navigator.userActivation) || navigator.userActivation; active = !!(ua && ua.hasBeenActive); } catch (e) {}
      if (active) setTimeout(() => { try { FWAudio.unlock(); } catch (e) {} v16IntroPlay(false); }, 150);
    } catch (e) { console.warn("[FAWIWE] intro nueva:", e); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else setTimeout(boot, 0);
  if (typeof dismissIntro === "function") {
    const o = dismissIntro;
    dismissIntro = function () { const ov = document.getElementById("v16Intro"); if (ov) { V16.introT.forEach(clearTimeout); V16.introOn = false; ov.remove(); } return o.apply(this, arguments); };
    window.dismissIntro = dismissIntro;
  }
  document.addEventListener("keydown", ev => {
    const ov = document.getElementById("v16Intro"); if (!ov || !V16.introOn) return;
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); if (ov.classList.contains("gate")) v16IntroPlay(true); else if (ov.classList.contains("play")) v16IntroFinal(); else v16IntroGo(); }
    else if (ev.key === "Escape") { ev.preventDefault(); v16IntroFinal(); }
  });
})();

/* ============================ 2) AL TOCAR "JUGAR" ============================ */
function v16RealBegin() {
  // lo mismo que hacía beginCareer: el modo piloto pasa por las categorías juveniles
  const mode = document.getElementById("playerModeSel")?.value || "engineer";
  if (mode === "driver") {
    juniorBonus = 0;
    s._juniorStageStartBonus = 0;
    s._juniorStageKey = null;
    juniorStep = 0;
    juniorCareerYear = parseInt(document.getElementById("startYear")?.value || "2026");
    juniorStagesCache = juniorStagesForYear(juniorCareerYear);
    document.getElementById("teamSetup")?.parentElement?.classList.add("hidden");
    document.getElementById("juniorCareer").classList.remove("hidden");
    renderJuniorStep();
    return;
  }
  start();
}
function v16GoData() {
  const $ = id => document.getElementById(id);
  const club = $("club")?.value || "";
  const ctOn = $("engCtOn")?.checked && ($("engCtName")?.value || "").trim();
  const team = ctOn || club || "Tu equipo";
  const color = (ctOn && $("engCtColor")?.value) || (typeof teamColors !== "undefined" && teamColors[team]) || "#e10600";
  const year = parseInt($("startYear")?.value || "2026", 10) || 2026;
  const drv = $("playerModeSel")?.value === "driver";
  const multi = typeof playMode !== "undefined" && playMode === "multi";
  let name = ($("name")?.value || "").trim();
  if (drv) { const t = $("driverTypeSel")?.value; name = t === "custom" ? (($("customDriverName")?.value || "").trim() || "Piloto FAWIWE") : ($("playedDriverSel")?.value || name); }
  if (!name) name = drv ? "Piloto FAWIWE" : "Presidente FAWIWE";
  let name2 = multi ? (($("name2")?.value || "").trim() || "Jugador 2") : "";
  if (multi && drv) name2 = $("playedDriverSel2")?.value || name2;
  let era = ""; try { era = fwEra(year).cap; } catch (e) {}
  let carEra = year; try { carEra = fwEra(year).y; } catch (e) {}
  return { team, color, year, drv, multi, name, name2, era, carEra };
}
function v16Go() {
  const D = v16GoData();
  if (v16Reduce()) return v16RealBegin();
  document.getElementById("v16Go")?.remove();
  const ov = document.createElement("div");
  ov.id = "v16Go";
  ov.style.setProperty("--tc", D.color);
  const role = D.multi ? "2 JUGADORES" : D.drv ? "PILOTO" : "INGENIERO DE EQUIPO";
  const who = D.multi ? `${v16Esc(D.name)} <i>vs</i> ${v16Esc(D.name2)}` : v16Esc(D.name);
  const helmet = `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M14 64 Q14 18 62 16 Q106 16 108 58 L108 70 Q108 80 98 80 L30 80 Q14 80 14 64 Z" fill="${D.color}"/><path d="M50 40 L104 40 Q108 52 106 60 L56 60 Q48 52 50 40 Z" fill="#111"/><path d="M14 66 L108 66" stroke="#fff" stroke-width="5"/><circle cx="34" cy="50" r="5" fill="#fff8"/></svg>`;
  const headset = `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M24 60 Q24 18 60 18 Q96 18 96 60" fill="none" stroke="${D.color}" stroke-width="9" stroke-linecap="round"/><rect x="12" y="52" width="24" height="34" rx="9" fill="#e5e7eb"/><rect x="84" y="52" width="24" height="34" rx="9" fill="#e5e7eb"/><path d="M28 84 Q40 96 58 92" fill="none" stroke="#e5e7eb" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="92" r="5" fill="${D.color}"/></svg>`;
  let car = ""; try { car = fwCarSvg(D.carEra, D.color); } catch (e) {}
  ov.innerHTML = `
    <div class="g-time"><div class="g-k">VIAJANDO A</div><div class="g-year" id="v16Year">2026</div><div class="g-era">${v16Esc(D.era)}</div></div>
    <div class="g-lanyard"></div>
    <div class="g-pass">
      <div class="g-head"><span class="v16-f1">F1</span><b>PADDOCK PASS</b><em>${D.year}</em></div>
      <div class="g-team">${v16Esc(D.team)}</div>
      <div class="g-body">
        <div class="g-photo">${D.drv ? helmet : headset}</div>
        <div class="g-info"><small>${role}</small><b>${who}</b><small>Temporada ${D.year} · Acceso a todo el paddock</small></div>
      </div>
      <div class="g-car">${car}</div>
      <div class="g-bar">${Array.from({ length: 34 }, (_, i) => `<i style="width:${1 + ((i * 7) % 4)}px"></i>`).join("")}</div>
      <div class="g-stamp">ACREDITADO ✓</div>
    </div>
    <div class="g-welcome">¡BIENVENIDO AL PADDOCK!</div>
    <div class="g-flash"></div>
    <div class="g-skip">Tocá para saltar ⏭</div>`;
  document.body.appendChild(ov);
  V16.goOn = true;
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    V16.goT.forEach(clearTimeout); V16.goT = [];
    try { v16RealBegin(); } catch (e) { console.warn("[FAWIWE] empezar:", e); }
    ov.classList.add("bye");
    setTimeout(() => { ov.remove(); V16.goOn = false; }, 500);
  };
  ov.addEventListener("click", finish);
  const at = (ms, fn) => V16.goT.push(setTimeout(fn, ms));
  try { if (s.soundOn !== false) FWAudio.musicStart("full"); } catch (e) {}
  requestAnimationFrame(() => ov.classList.add("t1"));
  v16Snd("whoosh");
  // el año corre hacia atrás (o se queda en 2026)
  const yEl = () => document.getElementById("v16Year");
  const from = 2026, to = D.year, steps = Math.min(18, Math.max(1, Math.abs(from - to)));
  for (let k = 1; k <= steps; k++) at(80 + k * 55, () => { const y = Math.round(from + (to - from) * (k / steps)); const e = yEl(); if (e) e.textContent = y; if (k % 3 === 0) v16Snd("click"); });
  at(1350, () => { ov.classList.add("t2"); v16Snd("whoosh"); });
  at(2500, () => { ov.classList.add("t3"); v16Snd("beep", true); });
  at(3300, () => { ov.classList.add("t4"); v16Snd("rev"); });
  at(4200, finish);
}
(function () {
  const o = window.beginCareer;
  if (typeof o !== "function") return;
  window.beginCareer = function () {
    if (V16.goOn) return;
    try { v16Go(); } catch (e) { console.warn("[FAWIWE] cinemática de largada:", e); return o.apply(this, arguments); }
  };
})();
