/* ===== Menú cinematográfico: tarjetas con estado, pasos, entrada animada y largada ===== */
function mcSync() {
  const set = (id, on) => { const el = document.getElementById(id); if (el) el.classList.toggle("sel", !!on); };
  set("mcSolo", playModeChosen && playMode === "solo");
  set("mcMulti", playModeChosen && playMode === "multi");
  set("mcActual", raceModeChosen && selectedMode === "actual");
  set("mcLegend", raceModeChosen && selectedMode === "legend");
  const role = document.getElementById("playerModeSel")?.value || "engineer";
  set("mcEng", role === "engineer");
  set("mcDrv", role === "driver");
  const steps = document.getElementById("mcSteps");
  if (steps) {
    const nameOk = role === "driver" || !!(document.getElementById("name")?.value || "").trim();
    const list = [
      ["👤 Cómo jugar", playModeChosen],
      ["🏁 Modo de carrera", raceModeChosen],
      ["✍️ Tu carrera", raceModeChosen && nameOk]
    ];
    const firstOpen = list.findIndex(x => !x[1]);
    steps.innerHTML = list.map((x, i) => `<div class="mc-step ${x[1] ? "done" : i === firstOpen ? "now" : ""}"><b>${x[1] ? "✓" : i + 1}</b>${x[0]}</div>`).join("");
  }
}
function mcFlash(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  try { playClickSound(); } catch (e) {}
}
function mcPickRole(role) {
  const sel = document.getElementById("playerModeSel");
  if (!sel) return;
  sel.value = role;
  onPlayerModeChange();
  mcFlash(role === "driver" ? "mcDrv" : "mcEng");
}
(function mcHooks() {
  const wrap = (name, after) => {
    const orig = window[name];
    if (typeof orig !== "function") return;
    window[name] = function (...a) { const r = orig.apply(this, a); try { after(a); } catch (e) {} return r; };
  };
  wrap("setPlayMode", a => { mcSync(); mcFlash(a[0] === "multi" ? "mcMulti" : "mcSolo"); });
  wrap("setMode", a => {
    mcSync(); mcFlash(a[0] === "legend" ? "mcLegend" : "mcActual");
    setTimeout(() => document.getElementById("teamSetup")?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
  });
  wrap("onPlayerModeChange", () => mcSync());
  wrap("updateTutorialGateNotice", () => mcSync());
  wrap("completeTutorial", () => mcSync());
  wrap("dismissIntro", () => {
    const st = document.getElementById("setup");
    if (st) { st.classList.remove("mc-enter"); void st.offsetWidth; st.classList.add("mc-enter"); }
  });
  // Largada: 5 luces rojas → se apagan → arranca la carrera
  const origBegin = window.beginCareer;
  window.beginCareer = function () {
    let ov = document.getElementById("mcGo");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "mcGo";
      const lines = '<svg class="bc-lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${6 + k * 12}" width="${388 - k * 24}" height="${288 - k * 24}" rx="${60 - k * 10}" pathLength="1" style="animation-delay:${(0.2 + k * 0.12).toFixed(2)}s"/>`).join("") + '</svg>';
      ov.innerHTML = `<div class="go-streak"></div><div class="go-word">¡Largada!</div><div class="go-gantry"><span></span><span></span><span></span><span></span><span></span></div><div class="go-plate">${lines}<div class="go-sub"><span class="bc-badge">F1</span><span class="go-role"></span></div><div class="go-team"></div><div class="go-season"></div></div>`;
      document.body.appendChild(ov);
    }
    const club = document.getElementById("club")?.value || "";
    const ctOn = document.getElementById("engCtOn")?.checked && (document.getElementById("engCtName")?.value || "").trim();
    const team = ctOn || club;
    const role = document.getElementById("playerModeSel")?.value === "driver" ? "PILOTO" : "INGENIERO DE EQUIPO";
    const year = document.getElementById("startYear")?.value || "";
    const color = (ctOn && document.getElementById("engCtColor")?.value) || (typeof teamColors !== "undefined" && teamColors[team]) || "#ffffff";
    ov.querySelector(".go-team").textContent = team;
    ov.querySelector(".go-role").textContent = role;
    ov.querySelector(".go-season").textContent = "Temporada " + year;
    ov.querySelector(".go-plate").style.borderTop = "4px solid " + color;
    ov.classList.remove("out", "plate");
    const plateFresh = ov.querySelector(".bc-lines"); if (plateFresh) { const c = plateFresh.cloneNode(true); plateFresh.replaceWith(c); }
    setTimeout(() => ov.classList.add("plate"), 150);
    const lights = [...ov.querySelectorAll(".go-gantry span")];
    lights.forEach(l => l.classList.remove("on"));
    ov.classList.add("show");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? 60 : 420;
    try { FWAudio.musicStart("full"); } catch (e) {}
    lights.forEach((l, i) => setTimeout(() => { l.classList.add("on"); try { FWAudio.beep(false); } catch (e) {} }, 250 + i * step));
    const outAt = 250 + 5 * step + (reduce ? 50 : 500);
    setTimeout(() => { lights.forEach(l => l.classList.remove("on")); ov.classList.add("out"); try { FWAudio.beep(true); FWAudio.whoosh(); } catch (e) {} }, outAt);
    setTimeout(() => {
      try { origBegin.apply(this); } finally {
        setTimeout(() => { ov.classList.remove("show", "out", "plate"); }, 300);
        try { FWAudio.musicStop(1.4); } catch (e) {}
      }
    }, outAt + (reduce ? 100 : 1300));
  };
  mcSync();
})();

/* El cartel LED de "Club Actual" va mostrando las épocas: 2026, 2016, 2006… hasta 1956. */
(function mcLedYears() {
  const years = [2026, 2016, 2006, 1996, 1986, 1976, 1966, 1956];
  let k = 0;
  setInterval(() => {
    const el = document.querySelector("#mcActual .mc-led");
    const setup = document.getElementById("setup");
    if (!el || !setup || setup.classList.contains("hidden")) return;
    k = (k + 1) % years.length;
    el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
    setTimeout(() => { el.textContent = years[k]; }, 140);
  }, 1100);
})();
