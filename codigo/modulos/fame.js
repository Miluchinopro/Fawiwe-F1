/* =====================================================================================
   FAWIWE · MEDIOS DEL MUNDO Y FAMA MUNDIAL
   Cada pregunta de la rueda de prensa la hace un medio de un país distinto (nombres
   inventados). Si contestás bien, ganás fama en ese país. En Modo Piloto pesa mucho más
   (y te sirve para conseguir sponsors); en Modo Ingeniero suma, pero menos.
   ===================================================================================== */
const FAME_MEDIA = [
  { c: "Argentina", n: "Pista Sur", i: "📻" }, { c: "Brasil", n: "Velocidade Total", i: "📺" }, { c: "México", n: "Canal Velocidad MX", i: "📺" },
  { c: "Estados Unidos", n: "Speedway Daily", i: "📰" }, { c: "Canadá", n: "Grand Prix Nord", i: "📰" }, { c: "Reino Unido", n: "Paddock Weekly", i: "📰" },
  { c: "Italia", n: "Rosso Corsa TV", i: "📺" }, { c: "España", n: "Diario del Paddock", i: "📰" }, { c: "Francia", n: "Le Virage", i: "📰" },
  { c: "Alemania", n: "Motorwelt", i: "📰" }, { c: "Países Bajos", n: "Oranje Racing", i: "🎙️" }, { c: "Mónaco", n: "Riviera Grand Prix", i: "🎙️" },
  { c: "Japón", n: "Suzuka Sports Net", i: "📺" }, { c: "Australia", n: "Down Under Motorsport", i: "📻" }, { c: "Singapur", n: "Marina Bay Live", i: "📺" },
  { c: "Emiratos Árabes", n: "Desert Speed", i: "📺" }, { c: "China", n: "Shanghai Racing Post", i: "📰" }, { c: "India", n: "Pit Lane India", i: "🎙️" }
];
const FAME_TRACK_COUNTRY = { "Australia": "Australia", "Japón": "Japón", "Italia": "Italia", "Mónaco": "Mónaco", "España": "España", "Canadá": "Canadá", "Gran Bretaña": "Reino Unido", "Bélgica": "Países Bajos", "Singapur": "Singapur", "Abu Dhabi": "Emiratos Árabes" };
function fameDrv() { return s.playerMode === "driver"; }
function fameMap() { if (!s.worldFame || typeof s.worldFame !== "object") s.worldFame = {}; return s.worldFame; }
function fameGet(c) { const m = fameMap(); if (typeof m[c] === "number") return m[c]; return c === s.country ? Math.max(5, Math.round(((s.countryPop || {})[c] ?? 30) * 0.6)) : 5; }
function fameWorld() { const vals = FAME_MEDIA.map(m => fameGet(m.c)); return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length); }
function fameLevel(v) { return v >= 80 ? "👑 Ícono global" : v >= 60 ? "🌍 Estrella mundial" : v >= 40 ? "✈️ Famoso internacional" : v >= 20 ? "🗺️ Conocido en varios países" : "🌱 Casi desconocido afuera"; }
function fameAdd(c, d) { const m = fameMap(); m[c] = Math.max(0, Math.min(100, fameGet(c) + d)); }
function famePickOutlets() {
  const gpName = (trackData[s.gp] || {}).name;
  const local = FAME_MEDIA.find(m => m.c === FAME_TRACK_COUNTRY[gpName]);
  const home = FAME_MEDIA.find(m => m.c === s.country);
  const pool = FAME_MEDIA.slice();
  const out = [];
  const h = deterministicHash("media_" + s.gp + "_" + s.season + "_" + (s.licensePoints || 0));
  if (local) out.push(local);
  if (home && home !== local && h % 3 === 0) out.push(home);
  for (let k = 0; out.length < 3 && k < pool.length * 2; k++) {
    const m = pool[(h + k * 7) % pool.length];
    if (out.indexOf(m) < 0) out.push(m);
  }
  return out.slice(0, 3);
}
(function () {
  const sp = window.showPress;
  if (typeof sp === "function") window.showPress = function () {
    const r = sp.apply(this, arguments);
    try {
      const outs = famePickOutlets();
      window.__pressOutlets = outs;
      document.querySelectorAll("#pressQuestions .press-question").forEach((q, i) => {
        const o = outs[i]; if (!o) return;
        const tag = document.createElement("div");
        tag.className = "press-media";
        tag.innerHTML = `${o.i} <b>${o.n}</b> <span>· ${o.c}</span> <em>pregunta:</em>`;
        q.insertBefore(tag, q.firstChild);
      });
      const score = document.getElementById("pressScore");
      if (score && !document.getElementById("pressFame")) {
        const f = document.createElement("div"); f.id = "pressFame"; f.className = "press-fame"; score.parentNode.insertBefore(f, score.nextSibling);
      }
      const f = document.getElementById("pressFame");
      if (f) f.innerHTML = `🌍 Fama mundial: <b>${fameWorld()}/100</b> · ${fameLevel(fameWorld())}${fameDrv() ? "" : ' <span class="small">(como ingeniero la fama suma menos)</span>'}`;
    } catch (e) { console.warn(e); }
    return r;
  };
  const ap = window.answerPress;
  if (typeof ap === "function") window.answerPress = function (i, chosen, correct) {
    const already = window.pressAnswers && window.pressAnswers[i];
    const r = ap.apply(this, arguments);
    try {
      if (!already) {
        const o = (window.__pressOutlets || [])[i];
        if (o) {
          const ok = chosen === correct;
          const d = fameDrv() ? (ok ? 4 : -2) : (ok ? 1.5 : -0.5);
          fameAdd(o.c, d);
          // los medios de afuera también se leen en el país vecino: un poquito de fama global
          if (ok) FAME_MEDIA.forEach(m => { if (m.c !== o.c) fameAdd(m.c, fameDrv() ? 0.3 : 0.1); });
          const fb = document.getElementById("pressFeedback" + i);
          if (fb) fb.textContent += ok ? ` 🌍 +${d} de fama en ${o.c}.` : ` 🌍 ${d} de fama en ${o.c}.`;
          const f = document.getElementById("pressFame");
          if (f) f.innerHTML = `🌍 Fama mundial: <b>${fameWorld()}/100</b> · ${fameLevel(fameWorld())}`;
        }
      }
    } catch (e) { console.warn(e); }
    return r;
  };
})();

/* ---------- beneficios: más sponsors (piloto) y la tarjeta de fama ---------- */
(function () {
  const cap = window.ngDrvSpCap;
  if (typeof cap === "function") window.ngDrvSpCap = function (spot) { return Math.round((cap.apply(this, arguments) * (1 + fameWorld() / 100)) * 10) / 10; };
  const tm = window.ngDrvTeamMax;
  if (typeof tm === "function") window.ngDrvTeamMax = function () { return Math.round(tm.apply(this, arguments) * (1 + fameWorld() / 250) * 10) / 10; };
  const o = window.nextGP;
  if (typeof o === "function") window.nextGP = function () {
    const ps = s.season, pg = s.gp;
    const r = o.apply(this, arguments);
    if ((s.season !== ps || s.gp !== pg) && fameDrv() && fameWorld() >= 60) { s.pop = clamp((s.pop || 50) + 1); }
    return r;
  };
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { const x = rd.apply(this, arguments); try { fameRender(); } catch (e) { console.warn(e); } return x; };
})();
function fameCardHtml() {
  const w = fameWorld();
  const list = FAME_MEDIA.map(m => ({ m, v: fameGet(m.c) })).sort((a, b) => b.v - a.v);
  const perks = fameDrv()
    ? ["💼 Más fama = tus sponsors personales ponen más plata en tu contrato (+" + w + "%).", "💰 Los equipos te valoran más al negociar tu sueldo.", w >= 60 ? "❤️ Sos estrella mundial: +1 de popularidad en cada GP." : "❤️ Con 60 de fama mundial: +1 de popularidad en cada GP."]
    : ["🎙️ Como ingeniero, la fama suma menos, pero te conocen en el paddock de todo el mundo."];
  return `<h2>🌍 Fama mundial</h2>
    <div class="grid"><div class="stat">🌍 Fama mundial<b>${w}/100</b></div><div class="stat">🏷️ Nivel<b>${fameLevel(w)}</b></div></div>
    <p class="small">Cada pregunta de la rueda de prensa la hace un medio de otro país. Contestá bien y ganás fama ahí${fameDrv() ? "" : " (menos que un piloto)"}.</p>
    <div class="fame-list">${list.map(x => `<div class="fame-row"><span>${x.m.i} ${x.m.c}</span><div class="fame-bar"><i style="width:${Math.round(x.v)}%"></i></div><b>${Math.round(x.v)}</b></div>`).join("")}</div>
    <ul class="small">${perks.map(p => `<li>${p}</li>`).join("")}</ul>`;
}
function fameRender() {
  let card = document.getElementById("worldFameCard");
  const g = document.getElementById("game");
  const on = !!g && !g.classList.contains("hidden") && !s.player2;
  if (!card) {
    if (!on) return;
    const anchor = document.getElementById("drvContractCard") || document.getElementById("engWalletCard") || document.getElementById("jobCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = "worldFameCard"; card.className = "card";
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = fameCardHtml();
}
