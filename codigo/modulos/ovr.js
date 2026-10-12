/* =====================================================================================
   FAWIWE · OVR QUE SE MUEVE
   Antes era un promedio plano (con popularidad y experiencia que casi no cambian), así que
   quedaba quieto. Ahora pesa lo que importa y reacciona a cada GP:
   - Piloto: tu rating (55%) + forma en las últimas 5 carreras (20%) + estado físico y mental
     (10%) + experiencia (10%) + popularidad (5%).
   - Ingeniero: auto (35%) + forma del equipo (20%) + confianza de la directiva (20%) +
     estrellas del equipo (15%) + popularidad (10%).
   Al lado del OVR se ve cuánto subió o bajó desde el GP anterior.
   ===================================================================================== */
function ovrForm() {
  const rp = (s.recentPositions || []).filter(x => typeof x === "number" && x > 0);
  if (!rp.length) return 62;
  const avg = rp.reduce((a, b) => a + b, 0) / rp.length;
  return Math.max(15, Math.min(100, 104 - avg * 4.3)); // P1 ≈ 100 · P10 ≈ 61 · P20 ≈ 18
}
window.computeOVR = function () {
  const c = v => Math.max(0, Math.min(100, +v || 0));
  let v;
  if (s.playerMode === "driver" && s.playedDriverName) {
    const mind = (c(s.focus ?? 55) + c(s.health ?? 92)) / 2;
    const exp = Math.min(100, 60 + (s.experience || 0) * 2);
    v = c(s.playedDriverRating || 75) * 0.55 + ovrForm() * 0.20 + mind * 0.10 + exp * 0.10 + c(s.pop ?? 30) * 0.05;
  } else {
    v = c(s.car ?? 50) * 0.35 + ovrForm() * 0.20 + c(s.trust ?? 50) * 0.20 + c((s.stars || 1) * 20) * 0.15 + c(s.pop ?? 50) * 0.10;
  }
  return Math.max(1, Math.min(99, Math.round(v)));
};
(function () {
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () { try { s._ovrPrev = computeOVR(); } catch (e) {} return ng.apply(this, arguments); };
  const ra = window.renderAgeAndRetirement;
  if (typeof ra === "function") window.renderAgeAndRetirement = function () {
    const r = ra.apply(this, arguments);
    try {
      const el = document.getElementById("ovrStat"); if (!el) return r;
      const now = computeOVR();
      if (typeof s._ovrPrev !== "number") s._ovrPrev = now;
      const d = now - s._ovrPrev;
      el.innerHTML = now + (d ? ` <small class="ovr-d ${d > 0 ? "up" : "down"}">${d > 0 ? "▲" : "▼"}${Math.abs(d)}</small>` : "");
    } catch (e) {}
    return r;
  };
})();
