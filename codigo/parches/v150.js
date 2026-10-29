/* =====================================================================================
   FAWIWE · V150 · Una sola cinemática al entrar al juego
   Mezcla las dos de antes: la de la página (la evolución de los autos de cada época y el
   semáforo) y la del juego (boxes de noche, tacómetro al rojo y logo).
   - Es una sucesión de escenas ("beats"). Cuando aparece un texto, la escena se frena
     el tiempo justo para leerlo; tocar la pantalla pasa a la siguiente, "Saltar" va al final.
   - Reemplaza v16IntroBuild / v16IntroPlay / v16IntroFinal (v146.js). El resto (botón
     JUGAR, sonido, tutorial, la cinemática del viaje en el tiempo) sigue igual.
   ===================================================================================== */
const V50 = { t: [], raf: 0, i: -1, beats: [], musicT0: 0 };
const V50_FACTS = {
  1950: "El primer Gran Premio del Mundial se corrió en Silverstone, el 13 de mayo de 1950.",
  1968: "Aparecen los alerones y los primeros autos pintados con los colores de un patrocinador.",
  1978: "Con el Lotus 79 y su efecto suelo, Mario Andretti es campeón del mundo.",
  1988: "McLaren gana 15 de las 16 carreras con Ayrton Senna y Alain Prost.",
  1998: "Autos más angostos y gomas con ranuras para bajar la velocidad en las curvas.",
  2009: "Brawn GP, un equipo recién creado, gana los dos títulos con Jenson Button.",
  2026: "Casi la mitad de la potencia es eléctrica y el combustible es 100% sostenible."
};

function v16IntroBuild() {
  if (document.getElementById("v16Intro")) return;
  const eras = (typeof FW_ERAS !== "undefined" && FW_ERAS.length) ? FW_ERAS : [{ y: 1950, cap: "", c: "#c0392b" }, { y: 2026, cap: "", c: "#e10600" }];
  const car = (y, c) => { try { return fwCarSvg(y, c, "v50-svg"); } catch (e) { return ""; } };
  const ov = document.createElement("div");
  ov.id = "v16Intro"; ov.className = "gate v50";
  ov.innerHTML = `
    <div class="v16-gate">
      <div class="v16-gate-logo"><span class="v16-f1">F1</span><b>FAWIWE</b></div>
      <button type="button" class="v16-gate-btn" onclick="event.stopPropagation();v16IntroPlay(true)">▶ Tocá para empezar</button>
      <span class="v16-gate-k">🔊 Con música y sonido</span>
    </div>
    <div class="v50-stage">
      <div class="v50-speed"></div>
      <section class="v50-b v50-pit" data-b="pit">
        <div class="v16-garages">${[0, 1, 2, 3, 4, 5].map(i => `<i style="--i:${i}"><em></em></i>`).join("")}</div>
        <div class="v50-present"><span>FAWIWE</span> presenta</div>
        <div class="v50-sub">76 años de Fórmula 1 en un solo juego</div>
      </section>
      ${eras.map((e, k) => `
      <section class="v50-b v50-era" data-b="era" data-k="${k}" style="--c:${e.c}">
        <div class="v50-ghost">${e.y}</div>
        <div class="v50-track"><div class="v50-car">${car(e.y, e.c)}</div><div class="v50-road"></div></div>
        <div class="v50-cap">
          <div class="v50-yr" data-from="${k ? eras[k - 1].y : 1950}" data-to="${e.y}">${k ? eras[k - 1].y : 1950}</div>
          <b>${e.cap}</b>
          <p>${V50_FACTS[e.y] || ""}</p>
        </div>
      </section>`).join("")}
      <section class="v50-b v50-roles" data-b="roles">
        <div class="v50-kick"><span class="v16-f1">F1</span>ELEGÍ TU CAMINO</div>
        <div class="v50-cards">
          <div class="v50-card" style="--i:0"><i>🔧</i><b>Ingeniero</b><span>Setup, estrategia y carrera en vivo</span></div>
          <div class="v50-card" style="--i:1"><i>🏛️</i><b>Jefe de equipo</b><span>Fichajes, motores y presupuesto</span></div>
          <div class="v50-card" style="--i:2"><i>🏎️</i><b>Piloto</b><span>Del karting al título mundial</span></div>
        </div>
        <div class="v50-facts">Grillas reales de cada año · 76 temporadas · Multijugador local</div>
      </section>
      <section class="v50-b v50-start" data-b="start">
        <div class="v50-lights">${[0, 1, 2, 3, 4].map(i => `<span style="--i:${i}"></span>`).join("")}</div>
        <div class="v16-tacho">
          <svg viewBox="0 0 200 120" aria-hidden="true">
            <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#2a2a33" stroke-width="14" stroke-linecap="round"/>
            <path class="v50-arc" d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#v50g)" stroke-width="14" stroke-linecap="round" pathLength="1"/>
            <defs><linearGradient id="v50g" x1="0" x2="1"><stop offset="0" stop-color="#22c55e"/><stop offset=".6" stop-color="#facc15"/><stop offset="1" stop-color="#e10600"/></linearGradient></defs>
            <line class="v50-needle" x1="100" y1="110" x2="100" y2="40" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <circle cx="100" cy="110" r="8" fill="#e10600"/>
          </svg>
          <div class="v16-rpm"><b>15.000</b> RPM</div>
        </div>
        <div class="v50-go">¡LARGADA!</div>
      </section>
      <div class="v50-top"><span class="v16-f1">F1</span>LA EVOLUCIÓN DE LA FÓRMULA 1</div>
      <div class="v50-bar"><span>1950</span><div><i></i></div><span>2026</span></div>
      <div class="v50-flash"></div>
      <div class="v50-hint">Tocá para avanzar ⏩</div>
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
  // tocar la pantalla: pasa a la escena siguiente
  ov.addEventListener("click", ev => { if (ov.classList.contains("play") && !ev.target.closest("button")) v50Next(); });
  document.body.appendChild(ov);
  // escenas: [elemento, duración natural en ms]
  V50.beats = [...ov.querySelectorAll(".v50-b")].map(el => ({ el, b: el.dataset.b, k: +el.dataset.k || 0 }));
  V50.eras = eras.length;
  V16.introOn = true;
  v16SndSync();
}
// duración de cada escena: lo justo para leer el texto
const V50_DUR = { pit: 1250, era: 1200, roles: 1500, start: 2200 };   // en total, unos 13 segundos

function v16IntroPlay(withSound) {
  const ov = document.getElementById("v16Intro"); if (!ov || !ov.classList.contains("gate")) return;
  if (withSound) { try { FWAudio.unlock(); } catch (e) {} }
  if (v16Reduce()) return v16IntroFinal();
  ov.classList.remove("gate"); ov.classList.add("play");
  try { if (s.soundOn !== false) { FWAudio.introTimes({ build: 2.0, h0: 99, h1: 99 }); if (FWAudio.isPlaying()) FWAudio.musicMode("intro"); else FWAudio.musicStart("intro"); V50.musicT0 = performance.now(); } } catch (e) {}
  V50.i = -1;
  v50Next();
}
function v50Clear() { V50.t.forEach(clearTimeout); V50.t = []; cancelAnimationFrame(V50.raf); }
function v50At(ms, fn) { V50.t.push(setTimeout(fn, ms)); }
function v50Next() {
  const ov = document.getElementById("v16Intro"); if (!ov || !ov.classList.contains("play")) return;
  v50Clear();
  const prev = V50.beats[V50.i];
  V50.i++;
  const cur = V50.beats[V50.i];
  if (!cur) return v16IntroFinal(true);
  if (prev) { prev.el.classList.remove("on", "leave"); prev.el.classList.add("off"); }
  cur.el.classList.remove("off", "leave");
  void cur.el.offsetWidth;   // reinicia las animaciones de la escena
  cur.el.classList.add("on");
  ov.dataset.b = cur.b;
  if (V50.i === 3) ov.classList.add("hinted");   // después de un par de escenas, el aviso se va
  const dur = V50_DUR[cur.b] || 2000;
  v50At(dur, v50Next);
  if (cur.b === "pit") {
    [0, 1, 2, 3, 4, 5].forEach(i => v50At(100 + i * 100, () => v16Snd("click")));
  } else if (cur.b === "era") {
    v16Snd("whoosh");
    // el año corre desde la época anterior mientras el auto llega
    const yr = cur.el.querySelector(".v50-yr"), a = +yr.dataset.from, z = +yr.dataset.to, t0 = performance.now();
    const step = () => { const p = Math.min(1, (performance.now() - t0) / 250); yr.textContent = Math.round(a + (z - a) * (1 - Math.pow(1 - p, 3))); if (p < 1) V50.raf = requestAnimationFrame(step); };
    step();
    const bar = ov.querySelector(".v50-bar i"); if (bar) bar.style.width = ((cur.k + 1) / V50.eras * 100) + "%";
    v50At(dur - 200, () => { cur.el.classList.add("leave"); });
  } else if (cur.b === "roles") {
    [0, 1, 2].forEach(i => v50At(100 + i * 140, () => v16Snd("click")));
  } else if (cur.b === "start") {
    // la música entra en "tensión" con el semáforo y explota cuando se apagan las luces
    try { const e = (performance.now() - V50.musicT0) / 1000; if (V50.musicT0) FWAudio.introTimes({ h0: e + 0.15, h1: e + 1.8 }); } catch (e) {}
    v50At(100, () => v16Snd("rev"));
    [0, 1, 2, 3, 4].forEach(i => v50At(200 + i * 300, () => v16Snd("beep", false)));
    v50At(1800, () => { v16Snd("beep", true); v16Snd("rev"); ov.classList.add("flash"); });
  }
}
function v16IntroFinal(natural) {
  const ov = document.getElementById("v16Intro"); if (!ov || ov.classList.contains("final")) return;
  v50Clear();
  V16.introT.forEach(clearTimeout); V16.introT = [];
  if (ov.classList.contains("gate")) { try { FWAudio.unlock(); } catch (e) {} }
  ov.classList.remove("gate", "play"); ov.classList.add("final");
  try { if (s.soundOn !== false) { FWAudio.musicMode("full"); if (!FWAudio.isPlaying()) FWAudio.musicStart("full"); } } catch (e) {}
  [0, 1, 2, 3, 4, 5].forEach(i => V16.introT.push(setTimeout(() => v16Snd("click"), 120 + i * 90)));
  V16.introT.push(setTimeout(() => v16Snd("fanfare"), natural ? 700 : 650));
}
