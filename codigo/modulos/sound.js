/* ===== Sonido en todos los clics del juego =====
   Cada botón, tarjeta, pestaña, casilla o lista que tocás hace "clic". Se puede apagar desde
   Ajustes → "🔊 Sonido de clics", igual que antes. */
(function () {
  let ctx = null;
  function audio() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }
  // clic corto y seco (sintetizado, sin demora y se puede superponer)
  function tick(kind) {
    const a = audio();
    if (!a) return false;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = "square";
    const f = kind === "big" ? 520 : kind === "soft" ? 1400 : 1900;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.05);
    g.gain.setValueAtTime(kind === "soft" ? 0.05 : 0.09, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "big" ? 0.12 : 0.06));
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + 0.13);
    return true;
  }
  let last = 0;
  const origClick = playClickSound;
  playClickSound = function (kind) {
    if (!s.soundOn) return;
    const now = performance.now();
    if (now - last < 60) return;
    last = now;
    if (!tick(kind)) origClick();
  };
  const SEL = "button,a,[onclick],select,input[type=checkbox],input[type=radio],input[type=color],.mc-card,.choice-card,.shot,label";
  document.addEventListener("pointerdown", ev => {
    const el = ev.target.closest && ev.target.closest(SEL);
    if (!el || el.disabled) return;
    const big = el.matches(".start-btn,.mc-go-btn,#introStartBtn,.lv-btn.red,.bfx-mash");
    playClickSound(big ? "big" : "");
  }, true);
  document.addEventListener("input", ev => {
    if (ev.target && ev.target.type === "range") playClickSound("soft");
  }, true);
  document.addEventListener("keydown", ev => {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.matches && ev.target.matches("button,a,.mc-card")) playClickSound("");
  }, true);
})();
