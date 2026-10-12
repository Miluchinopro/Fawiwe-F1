/* =====================================================================================
   FAWIWE · TU SUELDO Y TU PLATA (Modo Ingeniero)
   Además del presupuesto del equipo, cobrás un sueldo propio según tu rango (escala real
   de la F1 en euros) y lo gastás en tus cosas: casas, autos, yates… y cursos que te ayudan.
   También: un mal setup ahora castiga de verdad el resultado.
   ===================================================================================== */
const ENG_PAY = [
  // [desde, hasta] en dólares por año, por rango del juego
  { lo: 27000, hi: 130000 }, { lo: 175000, hi: 300000 }, { lo: 460000, hi: 4000000 }, { lo: 1000000, hi: 8000000 },
  { lo: 3000000, hi: 12000000 }, { lo: 6000000, hi: 15000000 }, { lo: 10000000, hi: 17000000 }
];
const ENG_PAY_SCALE = [
  ["Ingeniero Graduado / Junior", "$27.000 – $65.000"],
  ["Ingeniero Senior (de carrera, datos o diseño)", "$70.000 – $130.000"],
  ["Ingeniero Jefe / Jefe de Departamento", "$175.000 – $300.000"],
  ["Director Técnico", "$460.000 – $12M"],
  ["Jefe de Equipo / Director General", "$1M – $17M"]
];
function walEur(n) {
  n = Math.round(n || 0);
  if (Math.abs(n) >= 1000000) return "$" + (Math.round(n / 100000) / 10).toLocaleString("es-AR") + "M";
  return "$" + n.toLocaleString("es-AR");
}
function walOn() { return typeof engOn === "function" && engOn(); }
function walTierProgress() {
  const t = tierIndex();
  const lo = rankTiers[t][1], hi = rankTiers[t + 1] ? rankTiers[t + 1][1] : lo + 200;
  return Math.max(0, Math.min(1, ((s.licensePoints || 0) - lo) / Math.max(1, hi - lo)));
}
function walScaleRow() {
  const t = tierIndex();
  if (t === 0) return walTierProgress() < 0.5 ? 0 : 1;
  return t === 1 ? 2 : t === 2 ? 3 : 4;
}
function walAnnual() {
  const t = tierIndex(), r = ENG_PAY[t] || ENG_PAY[0];
  const stars = Math.max(0, Math.min(1, ((s.stars || 1) - 1) / 4));
  const f = Math.min(1, walTierProgress() * 0.7 + stars * 0.3);
  return Math.round((r.lo + (r.hi - r.lo) * f) * (s.ownSalaryMult || 1));
}
function walPerGP() { return Math.round(walAnnual() / 10); }
function walEnsure() { if (typeof s.engWallet !== "number") s.engWallet = 5000; if (!s.engOwned) s.engOwned = {}; }

const WAL_ITEMS = [
  { id: "bici", icon: "🚲", name: "Bicicleta para ir a la fábrica", price: 1500, txt: "+1 confianza", fx: { trust: 1 }, bfx: "life_bike" },
  { id: "curso", icon: "📊", name: "Curso de análisis de datos", price: 4000, txt: "+10 de conocimiento de setup en TODOS los circuitos", fx: { setup: 10 } },
  { id: "reloj", icon: "⌚", name: "Reloj de lujo", price: 25000, txt: "+2 popularidad", fx: { pop: 2 } },
  { id: "auto", icon: "🚗", name: "Auto familiar", price: 28000, txt: "+1 confianza, +1 popularidad", fx: { trust: 1, pop: 1 }, bfx: "life_sportscar" },
  { id: "master", icon: "🌬️", name: "Máster en aerodinámica", price: 60000, txt: "+1 en Aerodinámica y +10 de conocimiento de setup", fx: { aero: 1, setup: 10 } },
  { id: "deportivo", icon: "🏎️", name: "Auto deportivo", price: 140000, txt: "+3 popularidad", fx: { pop: 3 }, bfx: "life_supercars" },
  { id: "depto", icon: "🏢", name: "Departamento cerca de la fábrica", price: 220000, txt: "+3 confianza", fx: { trust: 3 }, bfx: "life_apartment" },
  { id: "velero", icon: "⛵", name: "Velero", price: 300000, txt: "+3 popularidad", fx: { pop: 3 } },
  { id: "casa", icon: "🏡", name: "Casa con jardín", price: 750000, txt: "+4 confianza", fx: { trust: 4 }, bfx: "life_house" },
  { id: "mansion", icon: "🏰", name: "Mansión", price: 4500000, txt: "+5 popularidad, +3 confianza", fx: { pop: 5, trust: 3 }, bfx: "life_house" },
  { id: "yate", icon: "🛥️", name: "Yate en Mónaco", price: 8000000, txt: "+6 popularidad", fx: { pop: 6 }, bfx: "life_yacht" },
  { id: "villa", icon: "🌴", name: "Villa en Mónaco", price: 15000000, txt: "+6 confianza, +4 popularidad", fx: { trust: 6, pop: 4 }, bfx: "life_villa" },
  { id: "jet", icon: "✈️", name: "Jet privado", price: 25000000, txt: "+8 popularidad", fx: { pop: 8 } }
];
function walBuy(id) {
  if (!walOn()) return;
  walEnsure();
  const it = WAL_ITEMS.find(x => x.id === id);
  if (!it || s.engOwned[id]) return;
  if (s.engWallet < it.price) return add("❌ No te alcanza: " + it.name + " cuesta " + walEur(it.price) + " y tenés " + walEur(s.engWallet) + ".");
  s.engWallet -= it.price;
  s.engOwned[id] = s.season;
  const fx = it.fx || {};
  if (fx.trust) s.trust = clamp((s.trust || 50) + fx.trust);
  if (fx.pop) s.pop = clamp((s.pop || 50) + fx.pop);
  try {
    const e = engEnsure();
    if (fx.setup) (trackData || []).forEach(t => { e.setup[t.name] = Math.min(100, (e.setup[t.name] || 0) + fx.setup); });
    if (fx.aero) e.attr.aero = Math.min(20, (e.attr.aero || 0) + fx.aero);
  } catch (err) {}
  add("🛍️ Te compraste: " + it.icon + " " + it.name + " (" + walEur(it.price) + ", de tu bolsillo). " + it.txt + ".");
  // cinemática + minijuegos de la compra (el descuento vuelve a TU bolsillo, no al equipo)
  if (typeof bfxStart === "function" && !BFX) {
    window.__walBuy = true;
    bfxStart(it.bfx || ("wal_" + id), it.price / 1e6, [id]);
    const k = document.getElementById("bfxKicker"); if (k) k.textContent = "🛍️ COMPRA PERSONAL · " + walEur(it.price);
  }
  render();
}
(function () {
  const o = window.bfxReward;
  if (typeof o !== "function") return;
  window.bfxReward = function (key, wins, price, arg) {
    if (!window.__walBuy) return o.apply(this, arguments);
    window.__walBuy = false;
    const m0 = s.money;
    const r = o.apply(this, arguments);
    const diff = Math.round((s.money - m0) * 1e6);
    if (diff > 0) { s.money = m0; walEnsure(); s.engWallet += diff; }
    return (r || "").replace(/te devuelven \$[\d.,]+[MK]?/, "te devuelven " + walEur(diff) + " a tu bolsillo");
  };
})();

/* ---------- tarjeta ---------- */
function walCardHtml() {
  walEnsure();
  const row = walScaleRow();
  const scale = ENG_PAY_SCALE.map((r, i) => `<div class="wal-row ${i === row ? "on" : ""}"><span>${i === row ? "▶ " : ""}${r[0]}</span><b>${r[1]}</b></div>`).join("");
  const items = WAL_ITEMS.map(it => {
    const own = s.engOwned[it.id];
    const can = s.engWallet >= it.price;
    return `<div class="wal-item ${own ? "own" : ""}"><div class="wal-ic">${it.icon}</div><div class="wal-tx"><b>${it.name}</b><span class="small">${it.txt}</span></div>
      ${own ? `<span class="pill">✅ Tuyo</span>` : `<button class="${can ? "" : "dark"}" onclick="walBuy('${it.id}')">${walEur(it.price)}</button>`}</div>`;
  }).join("");
  return `<h2>💶 Tu sueldo y tu plata</h2>
    <p class="small">El presupuesto del equipo es de la escudería. Esta es <b>tu</b> plata: la cobrás en cada GP según tu rango y la gastás en lo que quieras.</p>
    <div class="grid"><div class="stat">👛 Tu bolsillo<b>${walEur(s.engWallet)}</b></div><div class="stat">💼 Sueldo anual<b>${walEur(walAnnual())}</b></div><div class="stat">🗓️ Por GP<b>+${walEur(walPerGP())}</b></div></div>
    <h3 class="small">📈 Escala salarial de la F1 (tu puesto marcado)</h3><div class="wal-scale">${scale}</div>
    <p class="small">Subís dentro de la escala con los puntos de licencia, el nivel de tu equipo${(s.ownSalaryMult || 1) !== 1 ? " y los aumentos del dueño (×" + (s.ownSalaryMult || 1).toFixed(2) + ")" : " y los aumentos que te da el dueño si el equipo mejora"}.</p>
    <h3 class="small">🛍️ Tus compras</h3><div class="wal-shop">${items}</div>`;
}
function walRender() {
  let card = document.getElementById("engWalletCard");
  const on = walOn() && !!document.getElementById("game") && !document.getElementById("game").classList.contains("hidden");
  if (!card) {
    if (!on) return;
    const anchor = document.getElementById("engCenterCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = "engWalletCard"; card.className = "card";
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = walCardHtml();
}

/* ---------- cobro por GP + mensaje del ingreso del equipo ---------- */
(function () {
  const o = window.nextGP;
  if (typeof o === "function") window.nextGP = function () {
    const ps = s.season, pg = s.gp;
    const r = o.apply(this, arguments);
    if ((s.season !== ps || s.gp !== pg) && walOn()) {
      walEnsure();
      const pay = walPerGP();
      s.engWallet += pay;
      add("👛 Cobraste TU sueldo del GP: +" + walEur(pay) + " (" + ENG_PAY_SCALE[walScaleRow()][0] + "). Tenés " + walEur(s.engWallet) + ".");
      try { render(); } catch (e) {}
    }
    return r;
  };
  const a = window.add;
  if (typeof a === "function") window.add = function (msg) {
    if (typeof msg === "string" && msg.indexOf("💰 Cobraste tu salario del GP") === 0 && s.playerMode !== "driver") msg = msg.replace("💰 Cobraste tu salario del GP", "🏦 Ingreso del equipo por el GP");
    return a.apply(this, arguments.length > 1 ? [msg, ...[].slice.call(arguments, 1)] : [msg]);
  };
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { const x = rd.apply(this, arguments); try { walRender(); } catch (e) { console.warn(e); } return x; };
})();

/* ---------- mal setup = peores resultados ---------- */
(function () {
  const o = window.engSetupBonus;
  if (typeof o !== "function") return;
  window.engSetupBonus = function (kind) {
    let b = o.apply(this, arguments);
    try { const q = engSetupQuality(); if (q < 75) b -= Math.pow((75 - q) / 10, 1.4) * (kind === "quali" ? 1.2 : 1); } catch (e) {}
    return b;
  };
  const f = window.finishRace;
  if (typeof f === "function") window.finishRace = function () {
    let q = null;
    try { if (walOn() && !s.raceDone) q = engSetupQuality(); } catch (e) {}
    const r = f.apply(this, arguments);
    if (q !== null && q < 60) add("🧰 El setup estaba al " + q + "% en " + engTrackName() + ": el auto no tenía equilibrio y eso te costó posiciones. Probá en pista antes de la carrera (pestaña 🧰 Setup).");
    return r;
  };
  const tr = window.engTabRace;
  if (typeof tr === "function") window.engTabRace = function () {
    let h = tr.apply(this, arguments);
    try { const q = engSetupQuality(); if (q < 60) h = `<p class="notice">⚠️ Tu setup para ${engEsc(engTrackName())} está al <b>${q}%</b>: con un mal reglaje el auto pierde mucho ritmo y vas a terminar más atrás. Andá a 🧰 Setup y probá en pista.</p>` + h; } catch (e) {}
    return h;
  };
})();

/* ---------- 🤖 Auto setup: el equipo hace el reglaje solo, pero queda 10% por debajo del tuyo ---------- */
let walAutoBusy = false;
function walAutoCfg() {
  // casi ideal: una perilla queda corrida 1 punto (no te regala el setup perfecto)
  const ideal = Object.assign({}, engSetupIdeal());
  const k = ENG_SETUP_PARAMS[engH("auto_" + engTrackName()) % ENG_SETUP_PARAMS.length].id;
  ideal[k] = ideal[k] >= 10 ? 9 : ideal[k] <= 1 ? 2 : ideal[k] + ((engH("autod_" + engTrackName()) % 2) ? 1 : -1);
  return ideal;
}
function engAutoSetup(silent) {
  if (!walOn() || engParcFerme()) return;
  const ideal = walAutoCfg();
  walAutoBusy = true;
  try { ENG_SETUP_PARAMS.forEach(p => engSetupSet(p.id, ideal[p.id])); } finally { walAutoBusy = false; }
  const c = engSetupCfg(); c.auto = true;
  if (!silent) { add("🤖 Auto setup en " + engTrackName() + ": los ingenieros armaron el reglaje solos. Queda al 90% (10% menos que un setup perfecto hecho por vos)."); render(); }
}
function engAutoAlways(on) { engEnsure().autoAlways = !!on; if (on) engAutoSetup(true); render(); }
(function () {
  const ss = window.engSetupSet;
  if (typeof ss === "function") window.engSetupSet = function () {
    const r = ss.apply(this, arguments);
    if (!walAutoBusy) { try { const c = engSetupCfg(); if (c.auto) { c.auto = false; } } catch (e) {} }
    return r;
  };
  const q = window.engSetupQuality;
  if (typeof q === "function") window.engSetupQuality = function (cfg) {
    let v = q.apply(this, arguments);
    try { const c = cfg || engSetupCfg(); if (c && c.auto) v = Math.min(v, 90); } catch (e) {}
    return v;
  };
  const sc = window.engSetupCfg;
  if (typeof sc === "function") window.engSetupCfg = function () {
    const e = engEnsure();
    const fresh = !e.setupCfg || e.setupCfg.key !== engKey();
    const c = sc.apply(this, arguments);
    if (fresh && e.autoAlways && !walAutoBusy && !(typeof engParcFerme === "function" && engParcFerme())) {
      const ideal = walAutoCfg();
      ENG_SETUP_PARAMS.forEach(p => { c[p.id] = ideal[p.id]; });
      c.auto = true;
    }
    return c;
  };
  const ts = window.engTabSetup;
  if (typeof ts === "function") window.engTabSetup = function () {
    const h = ts.apply(this, arguments);
    const c = engSetupCfg(), e = engEnsure(), pf = engParcFerme() || s.raceDone;
    const box = `<div class="mini-explain"><b>🤖 Auto setup</b> — ¿no tenés tiempo de probar? Los ingenieros arman el reglaje solos, pero queda al <b>90%</b>: un <b>10% menos</b> que si lo clavás vos probando en pista.<div style="margin-top:10px">
      ${c.auto ? `<span class="pill">✅ Auto setup activo en ${engEsc(engTrackName())}</span> <span class="small">Si movés una perilla, pasás a manejarlo vos.</span>` : pf ? `<span class="small">🔒 Parc fermé: ya no se puede cambiar.</span>` : `<button onclick="engAutoSetup()">🤖 Hacer auto setup</button>`}</div>
      <label class="ng-check" style="margin-top:8px"><input type="checkbox" ${e.autoAlways ? "checked" : ""} onchange="engAutoAlways(this.checked)"> Usar auto setup en todas las carreras</label></div>`;
    return box + h;
  };
  const tr = window.engTabRace;
  if (typeof tr === "function") window.engTabRace = function () {
    let h = tr.apply(this, arguments);
    if (h.indexOf("Andá a 🧰 Setup y probá en pista.") >= 0 && !engParcFerme() && !s.raceDone) h = h.replace("Andá a 🧰 Setup y probá en pista.</p>", `Andá a 🧰 Setup y probá en pista, o <button onclick="engAutoSetup()">🤖 Hacer auto setup (90%)</button></p>`);
    return h;
  };
})();
