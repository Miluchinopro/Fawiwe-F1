/* Sonido en todo el juego: cada clic suena, y las cinemáticas tienen música. */
window.FW_SOUND_ON = () => !(typeof s !== "undefined" && s && s.soundOn === false);
// Los clics los maneja sound.js (sonido en cada botón, tarjeta, lista y barra).
(function soundHooks() {
  const wrap = (name, fn) => { const o = window[name]; if (typeof o !== "function") return; window[name] = function (...a) { return fn(o, this, a); }; };
  wrap("dismissIntro", (o, t, a) => { const r = o.apply(t, a); FWAudio.musicStop(1.6); return r; });
  wrap("bfxStart", (o, t, a) => { const before = typeof BFX !== "undefined" && BFX; const r = o.apply(t, a); if (!before && typeof BFX !== "undefined" && BFX) FWAudio.fanfare(); return r; });
  wrap("bfxFinishGame", (o, t, a) => { const was = typeof BFX !== "undefined" && BFX && !BFX.done; const r = o.apply(t, a); if (was) (a[0] ? FWAudio.ok() : FWAudio.bad()); return r; });
  wrap("engStartLive", (o, t, a) => { FWAudio.whoosh(); return o.apply(t, a); });
  wrap("showRankUp", (o, t, a) => { FWAudio.fanfare(); return o.apply(t, a); });
})();
// Si la página que abrió el juego ya recibió un toque (por ejemplo, "Jugar ahora" en la web),
// la cinemática arranca sola con música.
try {
  const ua = window.parent && window.parent !== window && window.parent.navigator.userActivation;
  if (ua && ua.hasBeenActive) {
    FWAudio.unlock();
    // Solo arranca sola si el navegador dejó sonar el audio; si no, queda el botón "Tocá para empezar".
    setTimeout(() => { if (FWAudio.ready() && typeof ciBegin === "function") ciBegin(); }, 200);
  }
} catch (e) {}
