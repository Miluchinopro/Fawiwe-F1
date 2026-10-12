/* =====================================================================================
   FAWIWE · EXPANSIÓN DEL MODO INGENIERO — "Centro del Ingeniero"
   ---------------------------------------------------------------------------------
   Todo lo nuevo vive en este bloque y se engancha a las funciones originales
   "envolviéndolas". Por eso el Modo Piloto y el Multijugador siguen exactamente igual:
   cada función nueva se fija primero en engOn() (Modo Ingeniero + Solitario).

   Incluye:
   • Crear tu propio equipo (nombre, país, color, motor y nivel inicial)
   • Desarrollo del auto por áreas + ventanas de mejoras de mitad de temporada
   • Contratos de motor (proveedores, contratos multi-año, desarrollo de la unidad de potencia)
   • Gestión de pilotos: forma, lesiones, piloto de reserva, fichar pilotos con contrato,
     pre-fichar prospectos de F2
   • Carrera: sprints, sanciones de 5s/10s, confiabilidad del motor, modo "Ver en vivo"
     vuelta a vuelta con decisiones de boxes, Safety Car y clima
   • Academia mejorada: chicos desde los 14 años, préstamos y reservas que aportan al simulador
   • Patrocinadores con objetivos claros ("Top 5 en Constructores") y satisfacción
   • Directiva con objetivos de temporada, confianza y consecuencias
   • Conocimiento de setup por circuito (se reinicia con cada reglamento)
   • Economía de carrera larga: costos operativos, sueldos, motor y sobrecosto por dominio
   • Editor de parrilla con 3 plantillas guardadas, fabricantes de motor y sistema de puntos
   • Historial: cada carrera (parrilla completa) y cada temporada de tu dinastía
   ===================================================================================== */

/* ---------- utilidades ---------- */
function engEsc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function engArg(v) { return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/</g, "\\x3c") + "'"; }
function engH(str) { return Math.abs(deterministicHash(String(str))); }
function engClone(o) { return JSON.parse(JSON.stringify(o)); }
function engR1(x) { return Math.round(x * 10) / 10; }
function engClampN(x, a, b) { return Math.max(a, Math.min(b, x)); }
function engKey() { return s.season + "_" + s.gp; }
function engOn() { return !!(s && s.team && s.playerMode !== "driver" && !s.player2); }
function engInGame() { const g = document.getElementById("game"); return !!(g && !g.classList.contains("hidden")); }
function engBar(val, max, color) {
  const pct = engClampN(Math.round((val / max) * 100), 0, 100);
  return `<div class="eng-bar"><i style="width:${pct}%;${color ? "background:" + color : ""}"></i></div>`;
}
function engTier() { try { return tierIndex(); } catch (e) { return 0; } }
function engLock(idx) { return `<p class="notice">🔒 Se desbloquea al ascender a <b>${rankTiers[idx][0]}</b>.</p>`; }
function engTrackName(i) { const t = trackData[i == null ? s.gp : i]; return t ? t.name : "—"; }
function engMoney(x) { return formatMoney(engR1(x)); }
function engRoundMoney() { s.money = engR1(s.money); }

/* ---------- datos base ---------- */
const ENG_BASE_ENGINES = [
  { id: "mercedes", name: "Mercedes", power: 90, rel: 90, eff: 87, cost: 2.2, from: 1950 },
  { id: "ferrari", name: "Ferrari", power: 91, rel: 85, eff: 84, cost: 2.1, from: 1950 },
  { id: "honda", name: "Honda", power: 92, rel: 86, eff: 86, cost: 2.3, from: 1950 },
  { id: "renault", name: "Renault", power: 85, rel: 81, eff: 88, cost: 1.4, from: 1950, to: 2025 },
  { id: "cosworth", name: "Cosworth", power: 77, rel: 85, eff: 81, cost: 0.8, from: 1950, to: 2025 },
  { id: "ford", name: "Red Bull Ford", power: 88, rel: 82, eff: 86, cost: 2.0, from: 2026 },
  { id: "audi", name: "Audi", power: 84, rel: 79, eff: 84, cost: 1.6, from: 2026 }
];
const ENG_TRACK_TYPE = {
  "Australia": "balanced", "Japón": "aero", "Italia": "power", "Mónaco": "mech", "España": "aero",
  "Canadá": "power", "Gran Bretaña": "aero", "Bélgica": "power", "Singapur": "mech", "Abu Dhabi": "balanced"
};
const ENG_TYPE_LABEL = {
  aero: "🌬️ Aerodinámico (curvas rápidas)", mech: "⚙️ Mecánico (curvas lentas / callejero)",
  power: "🔋 De motor (rectas largas)", balanced: "⚖️ Equilibrado"
};
const ENG_AREAS = [
  { id: "aero", name: "🌬️ Aerodinámica", desc: "Carga y eficiencia. Brilla en circuitos rápidos (Japón, España, Gran Bretaña)." },
  { id: "chassis", name: "⚙️ Chasis y suspensión", desc: "Tracción y agilidad. Brilla en circuitos lentos y callejeros (Mónaco, Singapur)." },
  { id: "tyres", name: "⚫ Gestión de neumáticos", desc: "Menos degradación. Suma más en circuitos que gastan mucha goma." },
  { id: "reliab", name: "🔧 Confiabilidad", desc: "Menos abandonos por fallas mecánicas o de motor." }
];
const ENG_SPRINT_PTS = [8, 7, 6, 5, 4, 3, 2, 1];
const ENG_POINT_PRESETS = {
  classic: { label: "Clásico · 25-18-15-12-10-8-6-4-2-1 (top 10)", pts: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  big: { label: "Parrilla grande · puntúan los 15 primeros", pts: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  retro: { label: "Retro 2003-2009 · 10-8-6-5-4-3-2-1 (top 8)", pts: [10, 8, 6, 5, 4, 3, 2, 1] },
  custom: { label: "Personalizado (escribilo vos)", pts: null }
};

/* ---------- estado ---------- */
function engEnsure() {
  if (!s.eng || typeof s.eng !== "object") s.eng = {};
  const e = s.eng;
  e.setup = e.setup || {};
  e.form = e.form || {};
  e.injuries = e.injuries || {};
  e.attr = e.attr || { aero: 0, chassis: 0, tyres: 0, reliab: 0 };
  e.supState = e.supState || {};
  e.aiEngines = e.aiEngines || {};
  e.puDev = e.puDev || { power: 0, rel: 0 };
  e.sponsorHappy = e.sponsorHappy || {};
  e.raceView = e.raceView || "live";
  e.sprintMode = e.sprintMode || "auto";
  e.history = e.history || { races: [], seasons: [] };
  e.history.races = e.history.races || [];
  e.history.seasons = e.history.seasons || [];
  if (!e.seasonStats || e.seasonStats.season !== s.season) e.seasonStats = { season: s.season, wins: 0, podiums: 0, pointsRaces: 0, dnfs: 0, penalties: 0, sprintPts: 0 };
  e.presigned = e.presigned || [];
  e.reservePool = e.reservePool || [];
  if (e.reserve === undefined) e.reserve = null;
  e.shake = e.shake || {};
  e.windowUsed = e.windowUsed || {};
  e.approached = e.approached || {};
  e.boardLog = e.boardLog || [];
  e.tab = e.tab || "race";
  if (!e.engine || !e.engine.id) e.engine = { id: engDefaultEngineFor(s.team || s.club || "", s.season), years: 2, signedSeason: s.season, costMult: 1 };
  if (typeof e.confidence !== "number") e.confidence = 60;
  return e;
}

/* =====================================================================================
   MOTORES
   ===================================================================================== */
function engEngineList() {
  const tpl = engActiveTemplate();
  if (tpl && tpl.engines && tpl.engines.length) return tpl.engines;
  const yr = (s && s.season) || 2026;
  return ENG_BASE_ENGINES.filter(x => yr >= x.from && yr <= (x.to || 3000));
}
function engDefaultEngineFor(team, season) {
  const list = engEngineList();
  const tpl = engActiveTemplate();
  if (tpl) {
    const tt = (tpl.teams || []).find(x => x.name === team);
    if (tt && list.find(x => x.id === tt.engine)) return tt.engine;
  }
  if (s && s.customTeam && s.customTeam.name === team && list.find(x => x.id === s.customTeam.engine)) return s.customTeam.engine;
  const n = String(team).toLowerCase();
  const y = season || 2026;
  let pick = null;
  if (/ferrari|haas|alfa|cadillac|maserati/.test(n) || (/sauber/.test(n) && !/bmw/.test(n) && y < 2026)) pick = "ferrari";
  else if (/aston/.test(n) && y >= 2026) pick = "honda";
  else if (/mercedes|mclaren|williams|aston|racing point|force india|brawn|alpine/.test(n) && !(/alpine/.test(n) && y < 2026)) pick = "mercedes";
  else if (/red bull|\brb\b|alphatauri|toro rosso|racing bulls/.test(n)) pick = y >= 2026 ? "ford" : "honda";
  else if (/renault|alpine|lotus|benetton|caterham|ligier/.test(n)) pick = "renault";
  else if (/audi/.test(n) || (/sauber/.test(n) && y >= 2026)) pick = y >= 2026 ? "audi" : "ferrari";
  else if (/honda|bar|jordan|super aguri|toyota|brabham/.test(n)) pick = "honda";
  if (pick && list.find(x => x.id === pick)) return pick;
  const cheap = list.slice().sort((a, b) => a.cost - b.cost);
  return cheap[engH("eng_" + team) % Math.min(3, cheap.length)].id;
}
function engEngineStats(id) {
  const list = engEngineList();
  const b = list.find(x => x.id === id) || list[0];
  const d = (s.eng && s.eng.supState && s.eng.supState[b.id]) || { power: 0, rel: 0, eff: 0 };
  return {
    id: b.id, name: b.name, cost: b.cost,
    power: engClampN(Math.round(b.power + d.power), 55, 99),
    rel: engClampN(Math.round(b.rel + d.rel), 55, 99),
    eff: engClampN(Math.round(b.eff + d.eff), 55, 99)
  };
}
function engMyEngine() {
  const e = engEnsure();
  const st = engEngineStats(e.engine.id);
  return Object.assign({}, st, {
    power: Math.min(100, st.power + (e.puDev.power || 0)),
    rel: Math.min(100, st.rel + (e.puDev.rel || 0)),
    cost: engR1(st.cost * (e.engine.costMult || 1))
  });
}
function engEngineScore(st) { return (st.power - 86) * 0.35 + (st.eff - 85) * 0.15; }
function engAiEngine(team) {
  const e = engEnsure();
  const list = engEngineList();
  if (!e.aiEngines[team] || !list.find(x => x.id === e.aiEngines[team])) e.aiEngines[team] = engDefaultEngineFor(team, s.season);
  return e.aiEngines[team];
}
function engEngineClients(id) {
  let n = 0;
  getTeamsForYear(s.season).forEach(t => { if (t[0] !== s.team && engAiEngine(t[0]) === id) n++; });
  return n;
}
function engSignEngine(id, years) {
  if (!engOn()) return;
  if (engTier() < 2) return add("🔒 Los contratos de motor se negocian desde el rango " + rankTiers[2][0] + ".");
  const e = engEnsure();
  const list = engEngineList();
  const sup = list.find(x => x.id === id);
  if (!sup) return;
  const cur = e.engine;
  if (id === cur.id) {
    const endSeason = s.season + years - 1;
    cur.years = endSeason - cur.signedSeason + 1;
    add("✍️ Extendiste el contrato con " + sup.name + " hasta " + endSeason + ".");
    render();
    return;
  }
  const curCost = engMyEngine().cost;
  const remaining = Math.max(0, cur.signedSeason + cur.years - 1 - s.season);
  const breakFee = engR1(remaining * curCost * 10 * 0.35);
  const signFee = engR1(engEngineStats(id).cost * 4);
  const total = engR1(breakFee + signFee);
  if (s.money < total) return add("❌ Necesitás " + engMoney(total) + " para cambiar de motor (firma " + engMoney(signFee) + (breakFee ? " + rescisión " + engMoney(breakFee) : "") + ").");
  s.money -= total; engRoundMoney();
  const oldName = engEngineStats(cur.id).name;
  e.engine = { id, years, signedSeason: s.season, costMult: 1 };
  e.puDev = { power: Math.floor((e.puDev.power || 0) / 2), rel: Math.floor((e.puDev.rel || 0) / 2) };
  add("🔧 Nuevo proveedor de motor: " + sup.name + " por " + years + " temporada(s) · firma " + engMoney(signFee) + (breakFee ? " · rescisión con " + oldName + " " + engMoney(breakFee) : "") + ". La mitad del desarrollo propio de la unidad de potencia se pierde en el cambio.");
  render();
}
function engInvestPU(kind) {
  if (!engOn()) return;
  if (engTier() < 2) return add("🔒 El desarrollo de la unidad de potencia se desbloquea en " + rankTiers[2][0] + ".");
  const e = engEnsure();
  const cur = e.puDev[kind] || 0;
  if (cur >= 10) return add("❌ Ese aspecto de la unidad de potencia ya está al máximo de desarrollo (+10).");
  const cost = 12;
  if (s.money < cost) return add("❌ Presupuesto insuficiente para desarrollar la unidad de potencia.");
  s.money -= cost; engRoundMoney();
  const r = Math.random();
  const gain = r < 0.2 ? 0 : r < 0.75 ? 2 : 3;
  e.puDev[kind] = Math.min(10, cur + gain);
  const label = kind === "power" ? "potencia" : "confiabilidad";
  add(gain ? "🔋 Desarrollo de la unidad de potencia: +" + gain + " de " + label + " (−" + engMoney(cost) + ")." : "🔋 El banco de pruebas no confirmó la mejora de " + label + " esta vez (−" + engMoney(cost) + "). Pasa: el desarrollo tiene varianza.");
  render();
}
function engSeasonEngines(newSeason, regChange) {
  const e = engEnsure();
  const list = engEngineList();
  // 1) los proveedores evolucionan (o se reinician con un reglamento nuevo)
  list.forEach(sup => {
    const d = e.supState[sup.id] || { power: 0, rel: 0, eff: 0 };
    ["power", "rel", "eff"].forEach(k => {
      if (regChange) d[k] = (engH("regeng_" + sup.id + k + newSeason) % 9) - 4;
      else d[k] = engClampN(d[k] + (engH("drift_" + sup.id + k + newSeason) % 5) - 3, -20, 8);
    });
    e.supState[sup.id] = d;
  });
  if (regChange) add("📜 Reglamento nuevo de motores: todos los proveedores arrancan de nuevo y el orden de potencia se mezcla.");
  // 2) tu contrato vence → renovación automática por 1 año (más caro) o proveedor que dejó la F1
  if (!list.find(x => x.id === e.engine.id)) {
    const oldName = (ENG_BASE_ENGINES.find(x => x.id === e.engine.id) || { name: e.engine.id }).name;
    e.engine = { id: engDefaultEngineFor(s.team, newSeason), years: 1, signedSeason: newSeason, costMult: 1 };
    e.puDev = { power: 0, rel: 0 };
    add("🔧 " + oldName + " ya no provee motores en " + newSeason + ". Pasás a " + engEngineStats(e.engine.id).name + " con un contrato puente de 1 año.");
  } else if (newSeason > e.engine.signedSeason + e.engine.years - 1) {
    e.engine.costMult = engR1((e.engine.costMult || 1) * 1.08);
    e.engine.years = newSeason - e.engine.signedSeason + 1;
    add("🔧 Tu contrato de motor con " + engEngineStats(e.engine.id).name + " venció: se renovó automáticamente por 1 año, un 8% más caro. Revisá el Mercado de motores si querés negociar.");
  }
  // 3) mercado de motores de la IA: algunos equipos cambian de proveedor
  const moves = [];
  getTeamsForYear(newSeason).forEach(t => {
    if (t[0] === s.team) return;
    if (engH("aieng_" + t[0] + newSeason) % 100 >= 14) return;
    const ranked = list.map(x => ({ x, v: engEngineStats(x.id).power + engEngineStats(x.id).rel })).sort((a, b) => b.v - a.v);
    const reach = t[1] >= 4 ? 1 : t[1] >= 3 ? 2 : 3;
    const choice = ranked[engH("aiengc_" + t[0] + newSeason) % Math.min(reach, ranked.length)].x.id;
    const old = engAiEngine(t[0]);
    if (choice !== old) {
      e.aiEngines[t[0]] = choice;
      moves.push(t[0] + ": " + engEngineStats(old).name + " → " + engEngineStats(choice).name);
    }
  });
  if (moves.length) add("🔧 Mercado de motores: " + moves.join(" · ") + ".");
}

/* =====================================================================================
   AUTO: ÁREAS DE DESARROLLO, SETUP Y VENTANAS DE MEJORA
   ===================================================================================== */
function engTrackType(i) { return ENG_TRACK_TYPE[engTrackName(i)] || "balanced"; }
function engAttrBonus() {
  const a = engEnsure().attr;
  const type = engTrackType();
  const ct = currentCircuitTraits();
  let b = a.aero * (type === "aero" ? 0.22 : 0.1) + a.chassis * (type === "mech" ? 0.22 : 0.1) + a.tyres * 0.12 * (ct.tireWear || 1);
  if (type === "power") b += (engMyEngine().power - 86) * 0.2;
  return b;
}
/* Setup jugable: 3 perillas por circuito con un valor ideal escondido. Probás en pista,
   el piloto te devuelve sensaciones y ajustás. El conocimiento del circuito hace que el
   feedback sea más preciso y te da más salidas a pista. */
const ENG_SETUP_PARAMS = [
  { id: "fw", name: "✈️ Alerón delantero", lo: "poca carga", hi: "mucha carga" },
  { id: "rw", name: "🛫 Alerón trasero", lo: "poca carga", hi: "mucha carga" },
  { id: "susp", name: "⚫ Suspensión", lo: "blanda", hi: "dura" }
];
function engSetupEra() { return Math.floor((s.season - START_SEASON) / REGULATION_CYCLE); }
function engSetupIdeal(track) {
  const t = track || engTrackName();
  const type = ENG_TRACK_TYPE[t] || "balanced";
  const base = { aero: [8, 8, 5], mech: [9, 9, 3], power: [3, 2, 7], balanced: [6, 6, 5] }[type];
  const out = {};
  ENG_SETUP_PARAMS.forEach((p, i) => { out[p.id] = engClampN(base[i] + (engH("ideal_" + t + p.id + engSetupEra()) % 5) - 2, 1, 10); });
  return out;
}
function engSetupCfg() {
  const e = engEnsure();
  const key = engKey();
  if (!e.setupCfg || e.setupCfg.key !== key) e.setupCfg = { key, fw: 5, rw: 5, susp: 5, runs: 0, last: null, best: null };
  return e.setupCfg;
}
function engSetupQuality(cfg) {
  const c = cfg || engSetupCfg();
  const ideal = engSetupIdeal();
  const dist = ENG_SETUP_PARAMS.reduce((a, p) => a + Math.abs((c[p.id] || 5) - ideal[p.id]), 0);
  return Math.max(0, Math.round(100 - dist * 9));
}
function engSetupRunsMax() {
  const k = engEnsure().setup[engTrackName()] || 0;
  const r = engReserveInfo();
  return 3 + (k >= 50 ? 1 : 0) + (facilityLevel("sim") >= 3 ? 1 : 0) + (r.real && r.rating >= 72 ? 1 : 0);
}
function engSetupSet(id, v) {
  if (engParcFerme()) return;
  const c = engSetupCfg();
  c[id] = engClampN(parseInt(v) || 5, 1, 10);
  const lbl = document.getElementById("engSetVal_" + id);
  if (lbl) lbl.textContent = c[id];
}
function engSetupRun() {
  if (!engOn()) return;
  if (engParcFerme()) return add("🔒 Parc fermé: después de la clasificación el setup no se toca.");
  if (s.raceDone) return add("🏁 La carrera ya terminó: el setup del próximo GP se prueba en el próximo fin de semana.");
  const c = engSetupCfg();
  if (c.runs >= engSetupRunsMax()) return add("⛽ No quedan salidas a pista este fin de semana.");
  c.runs++;
  const k = engEnsure().setup[engTrackName()] || 0;
  const ideal = engSetupIdeal();
  const q = engSetupQuality(c);
  const rec = (trackData[s.gp] || {}).record || "1:30.000";
  const m = rec.match(/(\d+):(\d+\.\d+)/);
  const base = m ? parseInt(m[1]) * 60 + parseFloat(m[2]) : 90;
  const lapT = base + 1.2 + (100 - q) * 0.035 + Math.random() * 0.15;
  const fmt = x => Math.floor(x / 60) + ":" + (x % 60).toFixed(3).padStart(6, "0");
  const fb = ENG_SETUP_PARAMS.map(p => {
    const d = ideal[p.id] - c[p.id];
    if (d === 0) return { id: p.id, txt: "🟢 ¡Perfecto así!" };
    const dir = d > 0 ? "⬆️ Subilo (" + p.hi + ")" : "⬇️ Bajalo (" + p.lo + ")";
    const size = k >= 30 || c.runs >= 2 ? (Math.abs(d) >= 3 ? " · bastante" : " · un poquito") : "";
    return { id: p.id, txt: dir + size };
  });
  c.last = { lap: fmt(lapT), fb, q };
  if (!c.best || q > c.best.q) c.best = { q, lap: fmt(lapT) };
  add("🧰 Salida a pista " + c.runs + "/" + engSetupRunsMax() + " en " + engTrackName() + ": " + fmt(lapT) + " · el piloto siente el auto al " + q + "%.");
  render();
}
function engSetupBonus(kind) {
  const k = engEnsure().setup[engTrackName()] || 0;
  const q = engSetupQuality();
  return (q * 0.06 - 2 + k * 0.02) * (kind === "quali" ? 1.15 : 1);
}
function engAreaCost(id) { return 8 + Math.floor((engEnsure().attr[id] || 0) / 4) * 2; }
function engParcFerme() { return s.session >= 3 && !s.raceDone; }
function engDevelopArea(id) {
  if (!engOn()) return;
  if (engTier() < 1) return add("🔒 El desarrollo por áreas se desbloquea en " + rankTiers[1][0] + ".");
  if (engParcFerme()) return add("🔒 Parc fermé: el auto está precintado hasta después de la carrera.");
  const e = engEnsure();
  const lvl = e.attr[id] || 0;
  if (lvl >= 20) return add("❌ Esa área ya está al máximo (20/20).");
  const cost = engAreaCost(id);
  if (s.money < cost) return add("❌ Presupuesto insuficiente (" + engMoney(cost) + ").");
  s.money -= cost; engRoundMoney();
  const r = Math.random();
  let gain = r < 0.12 ? 0 : r < 0.8 ? 2 : 3;
  const notes = [];
  if (gain > 0 && engReserveInfo().rating >= 72 && engReserveInfo().real) { gain += 1; notes.push("feedback del simulador de tu reserva"); }
  if (gain > 0 && facilityLevel("factory") >= 3) { gain += 1; notes.push("Fábrica nivel " + facilityLevel("factory")); }
  e.attr[id] = Math.min(20, lvl + gain);
  const area = ENG_AREAS.find(x => x.id === id);
  add(gain ? "🏭 " + area.name + ": +" + gain + " (ahora " + e.attr[id] + "/20)" + (notes.length ? " · " + notes.join(", ") : "") + " · −" + engMoney(cost) + "." : "🏭 " + area.name + ": la pieza nueva no correlacionó con el túnel de viento. Sin mejora esta vez (−" + engMoney(cost) + ").");
  render();
}
function engWindowOpen() { return (s.gp === 3 || s.gp === 6) && !engParcFerme() && !s.raceDone; }
function engUpgradePackage() {
  if (!engOn()) return;
  if (engTier() < 2) return add("🔒 Los paquetes de mejoras se desbloquean en " + rankTiers[2][0] + ".");
  const e = engEnsure();
  const key = engKey();
  if (!engWindowOpen()) return add("⏳ La ventana de mejoras abre en el GP 4 y en el GP 7 (antes de la clasificación).");
  if (e.windowUsed[key]) return add("❌ Ya trajiste un paquete en esta ventana.");
  const cost = 25;
  if (s.money < cost) return add("❌ Necesitás " + engMoney(cost) + " para el paquete de mitad de temporada.");
  s.money -= cost; engRoundMoney();
  e.windowUsed[key] = true;
  const r = Math.random();
  let msg;
  if (r < 0.15) {
    s.car = clamp(s.car - 1);
    msg = "📦 El paquete de mitad de temporada fue un fracaso: el auto no lo entendió (−1 de rendimiento). Pasa hasta en los mejores equipos.";
  } else {
    const gain = r < 0.7 ? 4 + Math.floor(Math.random() * 3) : 7 + Math.floor(Math.random() * 4);
    s.car = clamp(s.car + gain);
    const areas = ENG_AREAS.map(a => a.id).sort(() => Math.random() - 0.5).slice(0, 2);
    areas.forEach(a => { e.attr[a] = Math.min(20, (e.attr[a] || 0) + 1); });
    msg = "📦 ¡Paquete de mitad de temporada! +" + gain + " de rendimiento y +1 en " + areas.map(a => ENG_AREAS.find(x => x.id === a).name).join(" y ") + ".";
  }
  add(msg + " (−" + engMoney(cost) + ")");
  render();
}
function engAiUpgrades() {
  const e = engEnsure();
  const who = [];
  getTeamsForYear(s.season).forEach(t => {
    if (t[0] === s.team) return;
    const h = engH("aiup_" + t[0] + engKey()) % 100;
    if (h < 30) {
      const g = ((h % 10) + 5) / 100;
      e.shake[t[0]] = engClampN((e.shake[t[0]] || 0) + g, -0.6, 0.6);
      who.push(t[0]);
    }
  });
  if (who.length) add("📦 Ventana de mejoras: " + who.slice(0, 4).join(", ") + (who.length > 4 ? " y otros" : "") + " trajeron paquetes nuevos. Si no invertís, te pasan por arriba.");
}

/* =====================================================================================
   PILOTOS: FORMA, LESIONES, RESERVA, MERCADO Y PROSPECTOS
   ===================================================================================== */
function engFormIcon(f) {
  if (f >= 3) return "🔥";
  if (f >= 1) return "📈";
  if (f <= -3) return "❄️";
  if (f <= -1) return "📉";
  return "➖";
}
function engFormLabel(f) {
  if (f >= 4) return "Pico de carrera";
  if (f >= 2) return "En racha";
  if (f >= 1) return "Buen momento";
  if (f <= -4) return "Crisis de confianza";
  if (f <= -2) return "Bajón de forma";
  if (f <= -1) return "Algo apagado";
  return "Estable";
}
function engReserveInfo() {
  const e = engEnsure();
  if (e.reserve) {
    const ad = (s.academyDrivers || []).find(d => d.name === e.reserve);
    if (ad) return { name: ad.name, rating: ad.rating, real: true };
    const rp = (e.reservePool || []).find(d => d.name === e.reserve);
    if (rp) return { name: rp.name, rating: rp.rating, real: true };
  }
  return { name: "Piloto de reserva", rating: 66 + (s.stars || 1) * 3, real: false };
}
function engSetReserve(name) {
  const e = engEnsure();
  if (engTier() < 2) return add("🔒 Elegir el piloto de reserva es tarea del " + rankTiers[2][0] + ".");
  if (!name) { e.reserve = null; add("💺 Quedó el piloto de reserva genérico."); render(); return; }
  const ad = (s.academyDrivers || []).find(d => d.name === name);
  if (ad && ad.status === "loan") return add("❌ " + name + " está cedido a préstamo esta temporada.");
  e.reserve = name;
  add("💺 " + name + " es tu nuevo piloto de reserva: corre si se lesiona un titular y, con rating 72+, aporta feedback del simulador al desarrollo.");
  render();
}
function engInjured(name) { return !!(s.eng && s.eng.injuries && s.eng.injuries[name] > 0); }
function engGridDrivers() {
  const list = [];
  const hired = new Set(s.drivers || []);
  getTeamsForYear(s.season).forEach(t => {
    if (t[0] === s.club) return;
    currentTeamLineup(t[0]).forEach(d => {
      if (!d || hired.has(d[0])) return;
      list.push({ name: d[0], base: d[1], rating: effectiveRating(d[0], d[1]), team: t[0], teamRating: t[1] });
    });
  });
  return list.sort((a, b) => b.rating - a.rating);
}
function engBuyout(d) { return engR1(Math.pow(Math.max(60, d.rating) - 55, 2) / 28 + d.teamRating * 2); }
function engApproachChance(d) {
  const e = engEnsure();
  const myStars = s.stars || 1;
  let c = 38 + (myStars - d.teamRating) * 14 + ((s.trust || 50) - 50) * 0.4 + ((s.pop || 50) - 50) * 0.2 - (e.form[d.name] || 0) * 3;
  return Math.round(engClampN(c, 8, 90));
}
function engApproach(name) {
  if (!engOn()) return;
  if (!unlockedSet().has("drivers")) return add("🔒 El mercado de fichajes se desbloquea en " + rankTiers[3][0] + ".");
  const e = engEnsure();
  const d = engGridDrivers().find(x => x.name === name);
  if (!d) return;
  if ((s.drivers || []).length >= 2) return add("❌ Ya tenés dos pilotos fichados. Liberá un asiento primero.");
  if (e.approached[name] === s.season) return add("❌ " + name + " ya te dijo que no esta temporada. Probá el año que viene.");
  const fee = engBuyout(d);
  if (s.money < fee) return add("❌ La cláusula de " + name + " cuesta " + engMoney(fee) + ". No te alcanza.");
  const chance = engApproachChance(d);
  e.approached[name] = s.season;
  if (Math.random() * 100 >= chance) {
    s.money -= 1; engRoundMoney();
    add("📵 " + name + " (" + d.team + ") rechazó tu propuesta — prefiere seguir donde está (gastos de representación −$1M).");
    render();
    return;
  }
  s.money -= fee; engRoundMoney();
  const salary = Math.round(d.base * 0.25);
  if (!drivers.find(x => x[0] === name)) drivers.push([name, d.base, salary]);
  s.drivers.push(name);
  if (!s.driverContracts) s.driverContracts = {};
  s.driverContracts[name] = { years: 2, signedSeason: s.season, baseSalary: salary };
  if (!s.driverPoints) initDriverStandings();
  if (!(name in s.driverPoints)) { s.driverPoints[name] = 0; s.driverWins[name] = 0; }
  // su ex equipo sube un reemplazo de F2 (así no queda duplicado en la parrilla)
  if (!s.rosterOverrides) s.rosterOverrides = {};
  const lineup = currentTeamLineup(d.team).slice(0, 2).map(x => x.slice());
  const idx = lineup.findIndex(x => x[0] === name);
  if (idx >= 0) {
    const rookie = generateRookieName("replace_" + name + "_" + s.season);
    lineup[idx] = [rookie, 68 + (engH(rookie) % 8), 2, d.team];
    s.rosterOverrides[d.team] = lineup;
    if (!(rookie in s.driverPoints)) { s.driverPoints[rookie] = 0; s.driverWins[rookie] = 0; }
  }
  s.trust = clamp(s.trust + 3);
  add("🖊️ ¡Bombazo! Pagaste la cláusula de " + name + " (" + engMoney(fee) + ") y deja " + d.team + " para correr con " + s.team + " (contrato 2 temporadas).");
  render();
}
function engProspects() {
  const e = engEnsure();
  if (!e.prospects || e.prospects.season !== s.season) {
    const list = [];
    const taken = new Set(Object.keys(s.driverPoints || {}).concat((s.academyDrivers || []).map(d => d.name), (e.reservePool || []).map(d => d.name)));
    for (let i = 0; i < 4; i++) {
      let name = generateRookieName("f2_" + s.season + "_" + i + "_" + (s.team || ""));
      for (let k = 1; k < 12 && (taken.has(name) || list.some(p => p.name === name)); k++) name = generateRookieName("f2_" + s.season + "_" + i + "_" + k);
      taken.add(name);
      const rating = 69 + (engH("f2r_" + name + s.season) % 10);
      list.push({
        name, rating, age: 18 + (engH("f2a_" + name) % 4),
        potential: Math.min(96, rating + 5 + (engH("f2p_" + name) % 9)),
        fee: engR1(3 + (rating - 69) * 0.9), series: engH("f2s_" + name) % 3 === 0 ? "F3" : "F2"
      });
    }
    e.prospects = { season: s.season, list };
  }
  const taken = new Set(e.presigned.map(p => p.name));
  return e.prospects.list.filter(p => !taken.has(p.name));
}
function engPresign(name, seat) {
  if (!engOn()) return;
  if (!unlockedSet().has("drivers")) return add("🔒 Pre-fichar prospectos se desbloquea en " + rankTiers[3][0] + ".");
  const e = engEnsure();
  if (e.presigned.length >= 2) return add("❌ Máximo 2 prospectos pre-fichados a la vez.");
  const p = engProspects().find(x => x.name === name);
  if (!p) return;
  if (s.money < p.fee) return add("❌ Presupuesto insuficiente para pre-fichar a " + name + ".");
  s.money -= p.fee; engRoundMoney();
  e.presigned.push(Object.assign({}, p, { seat, joinSeason: s.season + 1 }));
  add("📝 Pre-fichaste a " + name + " (" + p.series + ", " + p.age + " años, rating " + p.rating + ") para " + (seat === "race" ? "un asiento titular" : "ser tu reserva") + " desde " + (s.season + 1) + ". Se lo sacaste al resto antes de que quede libre.");
  render();
}
function engApplyPresigned() {
  const e = engEnsure();
  const joining = e.presigned.filter(p => p.joinSeason <= s.season);
  e.presigned = e.presigned.filter(p => p.joinSeason > s.season);
  joining.forEach(p => {
    const rating = Math.min(p.potential, p.rating + 1 + (engH("f2grow" + p.name) % 3));
    if (p.seat === "race") {
      if ((s.drivers || []).length >= 2) {
        const ratingOf = n => (drivers.find(d => d[0] === n) || [n, 70])[1];
        const out = s.drivers.slice().sort((a, b) => ratingOf(a) - ratingOf(b))[0];
        s.drivers = s.drivers.filter(n => n !== out);
        if (s.driverContracts) delete s.driverContracts[out];
        add("📤 " + out + " deja su asiento para hacerle lugar a " + p.name + ".");
      }
      if (!drivers.find(d => d[0] === p.name)) drivers.push([p.name, rating, Math.round(rating * 0.2)]);
      s.drivers.push(p.name);
      if (!s.driverContracts) s.driverContracts = {};
      s.driverContracts[p.name] = { years: 2, signedSeason: s.season, baseSalary: Math.round(rating * 0.2) };
      if (!s.driverPoints) initDriverStandings();
      if (!(p.name in s.driverPoints)) { s.driverPoints[p.name] = 0; s.driverWins[p.name] = 0; }
      add("🚀 " + p.name + " sube de la " + p.series + " y debuta como titular de " + s.team + " (rating " + rating + ").");
    } else {
      e.reservePool.push({ name: p.name, rating, age: p.age + 1, potential: p.potential });
      e.reserve = p.name;
      add("💺 " + p.name + " llega desde la " + p.series + " como piloto de reserva (rating " + rating + ").");
    }
  });
}
function engUpdateForm(grid) {
  const e = engEnsure();
  const q = e.lastQualiOrder && e.lastQualiOrder.key === engKey() ? e.lastQualiOrder.names : null;
  Object.keys(e.form).forEach(n => { e.form[n] = engR1(e.form[n] * 0.85); if (Math.abs(e.form[n]) < 0.2) delete e.form[n]; });
  grid.forEach(x => {
    const name = x.name.replace(" (reserva)", "");
    let d = 0;
    if (x.status === "DNF") d -= 0.6;
    else if (typeof x.pos === "number") {
      if (x.pos <= 3) d += 1;
      else if (x.pts > 0) d += 0.4;
      if (q) {
        const qi = q.indexOf(x.name);
        if (qi >= 0) {
          const gained = (qi + 1) - x.pos;
          if (gained >= 3) d += 0.8;
          if (gained <= -3) d -= 0.8;
        }
      }
    }
    if (x.penalty) d -= 0.4;
    if (d) e.form[name] = engClampN(engR1((e.form[name] || 0) + d), -5, 5);
  });
}
function engMaybeInjure(grid) {
  const e = engEnsure();
  grid.filter(x => x.mine && x.status === "DNF" && !x.dnfEngine).forEach(x => {
    const name = x.name;
    if (name === "Piloto de reserva" || engInjured(name)) return;
    if (Math.random() < 0.22) {
      const gps = 1 + Math.floor(Math.random() * 3);
      e.injuries[name] = gps;
      add("🚑 " + name + " se lastimó en el accidente y se pierde " + gps + " GP. Lo reemplaza " + engReserveInfo().name + " (rating " + engReserveInfo().rating + ").");
    }
  });
}

/* =====================================================================================
   ACADEMIA MEJORADA (edad, préstamos, reserva)
   ===================================================================================== */
function engAcademyFix(d) {
  if (!d) return d;
  if (!d.age) d.age = 15 + (engH("acadage_" + d.name) % 3);
  if (!d.potential) d.potential = Math.min(97, 78 + (engH("acadpot_" + d.name) % 17));
  if (!d.status) d.status = "academy";
  return d;
}
function engLoanAcademy(name) {
  if (!academyUnlocked()) return;
  const d = (s.academyDrivers || []).find(x => x.name === name);
  if (!d) return;
  engAcademyFix(d);
  if (d.status === "loan") return;
  d.status = "loan";
  d.loanSeason = s.season;
  if (engEnsure().reserve === name) s.eng.reserve = null;
  s.money += 2; engRoundMoney();
  add("🔁 Cediste a " + name + " a préstamo a un equipo de F2/F3 por esta temporada: corre todos los fines de semana y vuelve más curtido (+$2M de cesión).");
  render();
}
function engAcademySeason() {
  const gone = [];
  (s.academyDrivers || []).forEach(d => {
    engAcademyFix(d);
    d.age += 1;
    let g = d.age <= 16 ? 3 + Math.floor(Math.random() * 3) : d.age <= 19 ? 2 + Math.floor(Math.random() * 3) : d.age <= 22 ? 1 + Math.floor(Math.random() * 2) : 0;
    if (d.status === "loan") { g += 3 + Math.floor(Math.random() * 4); d.status = "academy"; }
    const before = d.rating;
    d.rating = Math.min(d.potential, d.rating + g);
    if (d.rating > before) add("🏫 " + d.name + " (" + d.age + " años) creció en la academia: " + before + " → " + d.rating + ".");
    if (d.age >= 23 && d.rating < 70) gone.push(d.name);
  });
  if (gone.length) {
    s.academyDrivers = s.academyDrivers.filter(d => !gone.includes(d.name));
    if (gone.includes(engEnsure().reserve)) s.eng.reserve = null;
    add("👋 Dejan la academia por edad sin llegar al nivel de F1: " + gone.join(", ") + ".");
  }
  // reservas que vinieron de F2: también maduran
  (engEnsure().reservePool || []).forEach(r => { r.age = (r.age || 20) + 1; if (r.age <= 24) r.rating = Math.min(r.potential || 90, r.rating + 1 + Math.floor(Math.random() * 2)); });
}

/* =====================================================================================
   PATROCINADORES CON OBJETIVOS
   ===================================================================================== */
function engSponsorGoal(sp) {
  const map = { 1: { kind: "points", n: 3, label: "Sumar puntos en 3 carreras" }, 2: { kind: "pos", n: 8, label: "Top 8 en Constructores" }, 3: { kind: "pos", n: 6, label: "Top 6 en Constructores" }, 4: { kind: "pos", n: 4, label: "Top 4 en Constructores" }, 5: { kind: "pos", n: 3, label: "Top 3 en Constructores" } };
  return map[sp.stars] || map[3];
}
function engSponsorGoalMet(goal) {
  if (goal.kind === "points") return (engEnsure().seasonStats.pointsRaces || 0) >= goal.n;
  return teamFinishPosition() <= goal.n;
}
function engSponsorTick() {
  const e = engEnsure();
  (s.activeSponsors || []).forEach(id => {
    const sp = sponsorPool.find(x => x.id === id);
    if (!sp) return;
    const goal = engSponsorGoal(sp);
    let h = typeof e.sponsorHappy[id] === "number" ? e.sponsorHappy[id] : 60;
    h += engSponsorGoalMet(goal) ? 3 : -2;
    if (s.lastRace && typeof s.lastRace.pos === "number" && s.lastRace.pos <= 3 && !s.lastRace.status) h += 2;
    e.sponsorHappy[id] = engClampN(h, 0, 100);
  });
}
function engSponsorSeasonEnd() {
  const e = engEnsure();
  (s.activeSponsors || []).slice().forEach(id => {
    const sp = sponsorPool.find(x => x.id === id);
    if (!sp) return;
    const goal = engSponsorGoal(sp);
    const terms = (s.sponsorTerms || {})[id] || { perGP: sp.perGP };
    let h = typeof e.sponsorHappy[id] === "number" ? e.sponsorHappy[id] : 60;
    if (engSponsorGoalMet(goal)) {
      h += 15;
      const bonus = engR1((terms.perGP || sp.perGP) * 2);
      s.money += bonus;
      add("🤝 " + sp.name + " cumplió su objetivo (" + goal.label + "): bono de " + engMoney(bonus) + ".");
    } else {
      h -= 20;
      add("😒 " + sp.name + " no quedó conforme: su objetivo era \"" + goal.label + "\".");
    }
    h = engClampN(h, 0, 100);
    e.sponsorHappy[id] = h;
    if (h >= 80 && s.sponsorTerms && s.sponsorTerms[id]) {
      s.sponsorTerms[id].perGP = engR1(s.sponsorTerms[id].perGP * 1.1);
      add("📈 " + sp.name + " está feliz y renueva con +10% por GP.");
    }
    const guaranteed = terms.guaranteed && s.season < (terms.signedSeason || 0) + 2;
    if (h < 25 && !guaranteed) {
      s.activeSponsors = s.activeSponsors.filter(x => x !== id);
      if (s.sponsorTerms) delete s.sponsorTerms[id];
      delete e.sponsorHappy[id];
      add("📄 " + sp.name + " rescindió el contrato por falta de resultados.");
    }
  });
  engRoundMoney();
}

/* =====================================================================================
   DIRECTIVA
   ===================================================================================== */
function engPrestige() {
  const e = engEnsure();
  const recent = (e.history.seasons || []).slice(-3).filter(x => x.pos === 1).length;
  return engClampN((s.titles || 0) * 0.5 + recent * 0.4 + ((s.stars || 1) >= 4 ? 0.5 : 0) + (s.seasonsCompleted || 0) * 0.08, 0, 3);
}
function engTeamStrengths() {
  const e = engEnsure();
  const aiMult = s.aiLevel || 1;
  return gridTeamsWithClub().map(t => {
    if (t[0] === s.club) {
      const lu = myTeamLineup();
      const avg = lu.reduce((a, d) => a + d.rating, 0) / Math.max(1, lu.length);
      return { team: t[0], v: s.car * 1.08 + avg * 0.42 + 50 * 0.55 + engEngineScore(engMyEngine()) + engAttrBonus() * 0.8 + ((e.setup[engTrackName()] || 0) * 0.07 - 2) };
    }
    const lu = currentTeamLineup(t[0]);
    const avg = lu.reduce((a, d) => a + effectiveRating(d[0], d[1]), 0) / Math.max(1, lu.length);
    return { team: t[0], v: (t[1] * 19 + avg * 0.42 + 34 + engEngineScore(engEngineStats(engAiEngine(t[0]))) * 0.8 + (e.shake[t[0]] || 0) * 19) * aiMult };
  }).sort((a, b) => b.v - a.v);
}
function engBoardNew() {
  const e = engEnsure();
  const ranks = engTeamStrengths();
  const n = ranks.length;
  const expected = Math.max(1, ranks.findIndex(x => x.team === s.club) + 1);
  const prestige = engPrestige();
  const target = engClampN(expected + 1 - Math.round(prestige * 0.8), 1, n);
  const objs = [];
  objs.push({ id: "cons", n: target, label: target === 1 ? "🏆 Ganar el Campeonato de Constructores" : "🏁 Top " + target + " en Constructores" });
  const above = ranks[Math.max(0, expected - 2)];
  const useBeat = above && above.team !== s.club && engH("board2_" + s.season + s.team) % 2 === 0;
  if (useBeat) objs.push({ id: "beat", team: above.team, label: "⚔️ Terminar delante de " + above.team + " en Constructores" });
  else if (target <= 4) { const k = engClampN(2 + Math.round(prestige), 2, 6); objs.push({ id: "podiums", n: k, label: "🥉 Conseguir al menos " + k + " podios" }); }
  else { const k = engClampN(target <= 8 ? 5 + Math.round(prestige) : 2, 2, 8); objs.push({ id: "points", n: k, label: "🔢 Sumar puntos en al menos " + k + " carreras" }); }
  const floor = prestige >= 1 ? 50 : 0;
  objs.push({ id: "money", n: floor, label: floor ? "💰 Terminar la temporada con al menos " + engMoney(floor) + " de presupuesto" : "💰 Terminar la temporada sin deudas (presupuesto ≥ $0M)" });
  e.board = { season: s.season, expected, prestige: engR1(prestige), objectives: objs };
  if (engTier() >= 4) add("🏛️ La directiva fija los objetivos " + s.season + ": " + objs.map(o => o.label.replace(/^\S+\s/, "")).join(" · ") + ".");
}
function engBoardCheck(o) {
  const st = engEnsure().seasonStats;
  if (o.id === "cons") return teamFinishPosition() <= o.n;
  if (o.id === "beat") return (s.teamStandings && (s.teamStandings[s.team] || 0) > (s.teamStandings[o.team] || 0));
  if (o.id === "podiums") return (st.podiums || 0) >= o.n;
  if (o.id === "points") return (st.pointsRaces || 0) >= o.n;
  if (o.id === "money") return s.money >= o.n;
  return false;
}
function engBoardProgress(o) {
  const st = engEnsure().seasonStats;
  if (s.gp === 0 && !s.raceDone && (o.id === "cons" || o.id === "beat")) return "La temporada todavía no arrancó";
  if (o.id === "cons") return "Hoy: P" + teamFinishPosition();
  if (o.id === "beat") return "Hoy: " + ((s.teamStandings || {})[s.team] || 0) + " vs " + ((s.teamStandings || {})[o.team] || 0) + " pts";
  if (o.id === "podiums") return "Llevás " + (st.podiums || 0) + "/" + o.n;
  if (o.id === "points") return "Llevás " + (st.pointsRaces || 0) + "/" + o.n;
  if (o.id === "money") return "Hoy: " + engMoney(s.money);
  return "";
}
function engBoardEvaluate() {
  const e = engEnsure();
  if (engTier() < 4) return;
  if (!e.board || e.board.season !== s.season) return;
  const prestige = e.board.prestige || 0;
  let met = 0;
  const res = e.board.objectives.map(o => { const ok = engBoardCheck(o); if (ok) met++; return { o, ok }; });
  let delta = 0;
  res.forEach(r => { delta += r.ok ? 12 : -(12 + Math.round(prestige * 4)); });
  e.confidence = engClampN(e.confidence + delta, 0, 100);
  const lines = res.map(r => (r.ok ? "✅ " : "❌ ") + r.o.label.replace(/^\S+\s/, "")).join(" · ");
  add("🏛️ Evaluación de la directiva " + s.season + ": " + lines + " → confianza " + (delta >= 0 ? "+" : "") + delta + " (queda en " + e.confidence + "/100).");
  e.boardLog.push({ season: s.season, met, total: res.length, conf: e.confidence });
  if (e.boardLog.length > 12) e.boardLog.shift();
  if (met === res.length) {
    const bonus = Math.round(10 + prestige * 6);
    s.money += bonus;
    add("🎉 ¡Cumpliste TODOS los objetivos! La directiva aprueba un bono de " + engMoney(bonus) + ".");
  }
  if (e.confidence <= 0) {
    if (s.customTeam && s.customTeam.name === s.team) {
      s.money = engR1(s.money * 0.5);
      e.confidence = 35;
      add("💸 Los inversores de " + s.team + " perdieron la paciencia: recortan el presupuesto a la mitad. Es tu equipo, nadie te echa… pero hay que reaccionar YA.");
    } else {
      const pool = getTeamsForYear(s.season).filter(t => t[0] !== s.team).sort((a, b) => a[1] - b[1]);
      const nt = pool[0];
      if (nt) {
        add("🚨 LA DIRECTIVA TE DESPIDIÓ. Tras temporadas sin cumplir, " + s.team + " busca otro jefe. La única que te abre la puerta es " + nt[0] + ".");
        s.team = nt[0]; s.club = nt[0];
        s.stars = Math.max(1, Math.round(nt[1]));
        s.car = clamp(Math.round(20 + nt[1] * 14));
        s.drivers = [];
        s.money = Math.max(s.money, 40);
        e.engine = { id: engDefaultEngineFor(nt[0], s.season), years: 1, signedSeason: s.season + 1, costMult: 1 };
        e.attr = { aero: 0, chassis: 0, tyres: 0, reliab: 0 };
        e.puDev = { power: 0, rel: 0 };
        e.confidence = 55;
        applyTeamColor();
      }
    }
  } else if (e.confidence < 30) {
    add("⚠️ ULTIMÁTUM de la directiva: con la confianza en " + e.confidence + "/100, otra temporada floja y te despiden.");
  }
  engRoundMoney();
}

/* =====================================================================================
   ECONOMÍA DE CARRERA LARGA
   ===================================================================================== */
function engCostBreakdown() {
  const e = engEnsure();
  const seasons = s.seasonsCompleted || 0;
  const ops = 2 + Math.min(12, seasons * 0.8);
  const facil = Object.values(s.facilities || {}).reduce((a, b) => a + (b || 0), 0) * 0.25;
  const engine = engMyEngine().cost;
  const driversW = (s.drivers || []).reduce((a, n) => {
    const c = (s.driverContracts || {})[n];
    const base = c ? c.baseSalary : ((drivers.find(d => d[0] === n) || [0, 0, 10])[2]);
    const yrs = c ? Math.max(0, s.season - c.signedSeason) : 0;
    return a + base * 0.04 * (1 + 0.1 * yrs + seasons * 0.02);
  }, 0);
  const staff = (s.engineers || []).reduce((a, n) => { const g = engineerPool.find(x => x.name === n); return a + (g ? g.salary * 0.08 : 0); }, 0);
  const academy = (s.academyDrivers || []).filter(d => d.status !== "loan").length * 0.3;
  const recentTitles = (e.history.seasons || []).slice(-3).filter(x => x.pos === 1).length;
  const dominance = recentTitles * 1.2 + Math.min(3, (s.titles || 0) * 0.15);
  const items = [
    { label: "🏢 Operación de la escudería (crece con los años de carrera)", v: ops },
    { label: "🏗️ Mantenimiento de instalaciones", v: facil },
    { label: "🔧 Alquiler del motor (" + engMyEngine().name + ")", v: engine },
    { label: "👨‍✈️ Sueldos y bonos de pilotos fichados", v: driversW },
    { label: "👔 Ingenieros especialistas", v: staff },
    { label: "🏫 Academia de pilotos", v: academy },
    { label: "👑 Sobrecosto por dominio (tope presupuestario y exigencias)", v: dominance }
  ];
  const total = items.reduce((a, x) => a + x.v, 0);
  return { items, total: engR1(total) };
}
function engIncomeEstimate() {
  let inc = 0;
  try { inc += salaryForGP(); } catch (err) {}
  const terms = s.sponsorTerms || {};
  inc += sponsorPool.filter(sp => (s.activeSponsors || []).includes(sp.id)).reduce((a, sp) => a + (terms[sp.id]?.perGP ?? sp.perGP), 0);
  return engR1(inc);
}
function engChargeCosts() {
  const e = engEnsure();
  if (engTier() < 4) return; // los costos de la escudería los maneja el presidente
  const b = engCostBreakdown();
  s.money -= b.total;
  engRoundMoney();
  e.lastCosts = { key: engKey(), total: b.total };
  add("💼 Costos del GP: −" + engMoney(b.total) + " (operación, motor, sueldos" + (b.items[6].v > 0 ? ", sobrecosto por dominio" : "") + "). Presupuesto: " + engMoney(s.money) + ".");
  if (s.money < 0) {
    e.confidence = engClampN(e.confidence - 3, 0, 100);
    add("🔴 Estás en rojo: la directiva mira las cuentas con preocupación (confianza −3).");
  }
}
function engPrizeMoney() {
  const pos = teamFinishPosition();
  const n = Object.keys(s.teamStandings || {}).length || s.gridSize || 10;
  if (pos > n) return;
  const prize = engR1((n - pos + 1) * 2.5);
  s.money += prize;
  engRoundMoney();
  add("🏆 Premio del Campeonato de Constructores por terminar P" + pos + ": +" + engMoney(prize) + ".");
}

/* =====================================================================================
   SIMULACIÓN: MODIFICADORES, CONFIABILIDAD, SANCIONES, SPRINT
   ===================================================================================== */
let engRaceCache = null;   // parrilla base de la carrera (se usa en Ver en vivo)
let engLive = null;        // estado de la transmisión en vivo
let engLastRaceGrid = null;
let engForceInstant = false;

function engApplyMods(entries, kind) {
  const e = engEnsure();
  const aiMult = s.aiLevel || 1;
  const my = engEngineScore(engMyEngine()) + engAttrBonus() + engSetupBonus(kind);
  entries.forEach(x => {
    const base = x.name.replace(" (reserva)", "");
    const form = e.form[base] || 0;
    if (x.mine) x.score += my + form * 0.7;
    else x.score += (engEngineScore(engEngineStats(engAiEngine(x.team))) * 0.8 + (e.shake[x.team] || 0) * 19 + form * 0.5) * aiMult;
  });
}
function engApplyReliability(entries) {
  const e = engEnsure();
  const st = engMyEngine();
  const rel = st.rel + (e.attr.reliab || 0) * 0.6;
  entries.forEach(x => {
    if (x.mine) {
      if (!x.status) {
        const risk = Math.max(0, 86 - rel) * 0.35;
        if (Math.random() * 100 < risk) { x.status = "DNF"; x.dnfEngine = true; x.dnfReason = "🔥 Falla de la unidad de potencia"; }
      } else if (x.status === "DNF" && rel > 90 && Math.random() * 100 < (rel - 90) * 3) {
        x.status = null; x.rescued = true;
      }
    } else if (!x.status) {
      const ai = engEngineStats(engAiEngine(x.team));
      if (Math.random() * 100 < Math.max(0, 86 - ai.rel) * 0.2) { x.status = "DNF"; x.dnfReason = "🔥 Motor " + ai.name; }
    }
  });
}
const ENG_PEN_REASONS = ["Exceder los límites de pista varias veces", "Provocar un toque en la pelea", "Ganar ventaja saliéndose de la pista", "Adelantar con bandera amarilla", "Exceso de velocidad en el pit lane", "Maniobra peligrosa al defender la posición"];
function engApplyPenalties(entries) {
  const wet = !!(s.weather && s.weather.wet);
  const pressure = document.getElementById("pressure")?.value || "normal";
  const running = entries.filter(x => !x.status).sort((a, b) => b.score - a.score);
  running.forEach((x, i) => {
    let chance = 3;
    const prev = running[i - 1], next = running[i + 1];
    if ((prev && prev.score - x.score < 1.2) || (next && x.score - next.score < 1.2)) chance += 3;
    if (wet) chance += 3;
    if (s._safetyCarThisRace) chance += 1.5;
    let reason = ENG_PEN_REASONS[Math.floor(Math.random() * ENG_PEN_REASONS.length)];
    if (x.mine && x.seat === 1) {
      if (pressure === "push") chance += 4;
      if (s.pit === "aggressive") { chance += 3; if (Math.random() < 0.5) reason = "Liberación insegura en boxes (unsafe release)"; }
      else if (s.pit === "fast") chance += 1.5;
    }
    if (!x.mine) {
      try { if (isRival(x.name.replace(" (reserva)", ""))) chance += 2; } catch (err) {}
    }
    if (Math.random() * 100 < chance) {
      const sec = Math.random() < 0.28 ? 10 : 5;
      x.penalty = { sec, reason };
      x.score -= sec * 0.5;
    }
  });
}
function engReorder(entries, ptsTable) {
  const ps = ptsTable || s.pointsSystem || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const fin = entries.filter(x => !x.status).sort((a, b) => b.score - a.score);
  const dnf = entries.filter(x => x.status === "DNF").sort((a, b) => b.score - a.score);
  const dns = entries.filter(x => x.status === "DNS");
  const ordered = [...fin, ...dnf, ...dns];
  ordered.forEach((x, i) => {
    if (x.status === "DNS") { x.pos = null; x.pts = 0; return; }
    x.pos = i + 1;
    x.pts = (!x.status && i < ps.length) ? ps[i] : 0;
  });
  return ordered;
}
function engSprintGPs(season) {
  const idx = [];
  let k = 0;
  while (idx.length < 3 && k < 50) {
    const v = 1 + (engH("sprint_" + season + "_" + k) % 8);
    if (!idx.includes(v)) idx.push(v);
    k++;
  }
  return idx.sort((a, b) => a - b);
}
function engIsSprintWeekend(gp) {
  const e = engEnsure();
  if (e.sprintMode === "never") return false;
  if (e.sprintMode === "auto" && s.season < 2021) return false;
  return engSprintGPs(s.season).includes(gp == null ? s.gp : gp);
}
function engRunSprint() {
  const e = engEnsure();
  const key = engKey();
  if (e.sprintDone === key) return;
  e.sprintDone = key;
  if (!s.driverPoints) initDriverStandings();
  if (!s.teamStandings) initTeamStandings();
  s._engSimSprint = true;
  let grid;
  try { grid = simulateGrid("race"); } finally { s._engSimSprint = false; }
  let myPts = 0;
  grid.forEach(x => {
    const base = x.name.replace(" (reserva)", "");
    s.driverPoints[base] = (s.driverPoints[base] || 0) + x.pts;
    if (x.mine) myPts += x.pts;
    else s.teamStandings[x.team] = (s.teamStandings[x.team] || 0) + x.pts;
  });
  s.points += myPts;
  e.seasonStats.sprintPts = (e.seasonStats.sprintPts || 0) + myPts;
  const mine = grid.filter(x => x.mine).sort((a, b) => a.seat - b.seat);
  const winner = grid[0];
  e.lastSprint = {
    key, winner: winner ? winner.name + " (" + winner.team + ")" : "—",
    mine: mine.map(x => ({ name: x.name, res: x.status || ("P" + x.pos), pts: x.pts })),
    top: grid.slice(0, 8).map(x => [x.name, x.team, x.status || ("P" + x.pos), x.pts])
  };
  add("⚡ SPRINT del sábado en " + engTrackName() + ": gana " + e.lastSprint.winner + ". Tu equipo: " + e.lastSprint.mine.map(m => m.name + " " + m.res + " (+" + m.pts + ")").join(" · ") + ".");
}

/* =====================================================================================
   GANCHOS A LAS FUNCIONES ORIGINALES
   ===================================================================================== */
const _engOrigSimulateGrid = simulateGrid;
simulateGrid = function (kind) {
  const res = _engOrigSimulateGrid(kind);
  if (!engOn()) return res;
  try {
    const e = engEnsure();
    if (kind === "quali") {
      engApplyMods(res, "quali");
      res.sort((a, b) => b.score - a.score);
      res.forEach((x, i) => { x.pos = i + 1; x.pts = 0; });
      e.lastQualiOrder = { key: engKey(), names: res.map(x => x.name) };
      return res;
    }
    if (kind !== "race") return res;
    if (s._engSimSprint) {
      engApplyMods(res, "race");
      res.forEach(x => {
        x.status = (engH("sprintdnf_" + x.name + engKey()) % 1000) < 22 ? "DNF" : null;
        x.score += Math.random() * 6 - 3;
      });
      return engReorder(res, ENG_SPRINT_PTS);
    }
    const key = engKey();
    let base;
    if (engRaceCache && engRaceCache.key === key) base = engClone(engRaceCache.entries);
    else {
      engApplyMods(res, "race");
      engApplyReliability(res);
      engApplyPenalties(res);
      engRaceCache = { key, entries: engClone(res) };
      base = res;
    }
    engApplyLive(base);
    const out = engReorder(base);
    engLastRaceGrid = out;
    return out;
  } catch (err) {
    console.warn("[FAWIWE] simulación del ingeniero:", err);
    return res;
  }
};

const _engOrigMyTeamLineup = myTeamLineup;
myTeamLineup = function () {
  const seats = _engOrigMyTeamLineup();
  if (!engOn() || !s.eng) return seats;
  let usedReserve = false;
  return seats.map(seat => {
    if (engInjured(seat.name)) {
      const r = engReserveInfo();
      const sub = usedReserve || seats.some(x => x.name === r.name)
        ? { name: "Piloto de reserva " + (seat.seat + 1), rating: 64 + (s.stars || 1) * 3 }
        : r;
      usedReserve = true;
      return { name: sub.name, rating: sub.rating, seat: seat.seat, subFor: seat.name };
    }
    return seat;
  });
};

const _engOrigFindRating = findRating;
findRating = function (name) {
  if (s && s.customTeam && name === s.customTeam.name) return s.customTeam.rating;
  const tpl = engActiveTemplate();
  if (tpl) { const t = tpl.teams.find(x => x.name === name); if (t) return t.rating; }
  return _engOrigFindRating(name);
};

const _engOrigGetTeamsForYear = getTeamsForYear;
getTeamsForYear = function (year) {
  const tpl = engActiveTemplate();
  if (tpl && tpl.teams && tpl.teams.length) return tpl.teams.map(t => [t.name, t.rating]);
  return _engOrigGetTeamsForYear(year);
};
const _engOrigGetDriversForYear = getDriversForYear;
getDriversForYear = function (year) {
  const tpl = engActiveTemplate();
  if (tpl && tpl.teams && tpl.teams.length) {
    const out = [];
    tpl.teams.forEach(t => (t.drivers || []).forEach(d => out.push([d.name, d.rating, Math.round(d.rating * 0.25), t.name])));
    return out;
  }
  return _engOrigGetDriversForYear(year);
};

const _engOrigShowBigResult = showBigResult;
showBigResult = function (kind, title, sub, cls, grid) {
  _engOrigShowBigResult(kind, title, sub, cls, grid);
  if (!engOn() || !grid || !grid.length) return;
  const box = document.getElementById("resultGridTable");
  if (!box) return;
  const e = engEnsure();
  const isRace = String(kind).indexOf("CARRERA") === 0;
  const sprintLine = isRace && e.lastSprint && e.lastSprint.key === engKey()
    ? `<p class="small" style="text-align:left">⚡ Sprint del sábado: ganó ${engEsc(e.lastSprint.winner)} · Tu equipo: ${e.lastSprint.mine.map(m => engEsc(m.name) + " " + m.res + " (+" + m.pts + ")").join(" · ")}</p>` : "";
  box.innerHTML = sprintLine + `<table><tr><th>Pos</th><th>Piloto</th><th>Equipo</th><th>Pts</th><th>Notas</th></tr>` +
    grid.map(x => {
      const cleanName = x.name.replace(" (reserva)", " · reserva");
      const posLabel = x.status === "DNS" ? "DNS" : x.status === "DNF" ? "DNF" : "P" + x.pos;
      const notes = [];
      if (x.penalty) notes.push(`<span class="eng-badge pen" title="${engEsc(x.penalty.reason)}">+${x.penalty.sec}s</span>`);
      if (x.dnfReason) notes.push(`<span class="eng-badge dnf">${engEsc(x.dnfReason)}</span>`);
      if (x.rescued) notes.push(`<span class="eng-badge ok">🛡️ se salvó</span>`);
      const f = e.form[x.name.replace(" (reserva)", "")] || 0;
      if (Math.abs(f) >= 2) notes.push(`<span class="small">${engFormIcon(f)}</span>`);
      return `<tr class="${x.mine ? "mine-row" : ""}"><td>${posLabel}</td><td>${engEsc(cleanName)}</td><td>${engEsc(x.team)}</td><td>${x.pts || 0}</td><td>${notes.join(" ")}</td></tr>`;
    }).join("") + `</table>`;
};

const _engOrigFinishRace = finishRace;
finishRace = function () {
  if (!engOn() || s.raceDone) return _engOrigFinishRace.apply(this, arguments);
  const e = engEnsure();
  if (engLive && engLive.key === engKey()) return; // ya hay una transmisión en curso
  if (engIsSprintWeekend()) engRunSprint();
  if (e.raceView === "live" && !engForceInstant) { engStartLive(); return; }
  engForceInstant = false;
  engRaceCache = null;
  _engOrigFinishRace();
  engAfterRace();
};

const _engOrigNextGP = nextGP;
nextGP = function () {
  if (!engOn()) return _engOrigNextGP.apply(this, arguments);
  const e = engEnsure();
  const seasonBefore = s.season, gpBefore = s.gp;
  if (s.gp >= 9 && s.raceDone) engSeasonEndPre();
  _engOrigNextGP.apply(this, arguments);
  if (s.gp === gpBefore && s.season === seasonBefore) return;
  engRaceCache = null; engLive = null;
  Object.keys(e.injuries).forEach(n => {
    e.injuries[n]--;
    if (e.injuries[n] <= 0) { delete e.injuries[n]; add("✅ " + n + " recibió el alta médica y vuelve a su asiento."); }
  });
  if (s.season !== seasonBefore) engSeasonStartPost(seasonBefore);
  engApplyPointsSystem();
  engChargeCosts();
  if ((s.gp === 3 || s.gp === 6) && s.season === seasonBefore) {
    engAiUpgrades();
    add("📦 Ventana de mejoras abierta en este GP: podés traer un paquete grande desde el Centro del Ingeniero (pestaña Desarrollo).");
  }
  if (s.gp === 5 && s.season === seasonBefore && e.board && engTier() >= 4) {
    const st = e.board.objectives.map(o => (engBoardCheck(o) ? "✅ " : "⚠️ ") + o.label.replace(/^\S+\s/, "") + " (" + engBoardProgress(o) + ")").join(" · ");
    add("🏛️ Charla de mitad de temporada con la directiva: " + st + ".");
  }
  if (engIsSprintWeekend()) add("⚡ Este fin de semana (" + engTrackName() + ") tiene formato SPRINT: carrera corta el sábado que reparte 8-7-6-5-4-3-2-1.");
  render();
};

const _engOrigStart = start;
start = function (juniorFinalRating) {
  const mode = document.getElementById("playerModeSel")?.value || "engineer";
  const isEng = mode !== "driver" && playMode !== "multi";
  s.eng = null;
  s.rosterOverrides = {};
  s.customTeam = null;
  s.rosterTemplate = null;
  engRaceCache = null; engLive = null;
  let ct = null;
  if (isEng) {
    if (engRosterActive && engRosterDraft && engRosterDraft.teams.length >= 2) {
      s.rosterTemplate = engClone(engRosterDraft);
      engRegisterTemplateColors(s.rosterTemplate);
    }
    ct = engReadCustomTeamForm();
    if (ct) {
      s.customTeam = ct;
      teamColors[ct.name] = ct.color;
      const sel = document.getElementById("club");
      if (sel) {
        if (![...sel.options].some(o => o.value === ct.name)) {
          const opt = document.createElement("option");
          opt.value = ct.name; opt.textContent = ct.name;
          sel.appendChild(opt);
        }
        sel.value = ct.name;
      }
      s.rosterOverrides[ct.name] = ct.drivers.map(d => [d.name, d.rating, 5, ct.name]);
    }
  }
  _engOrigStart(juniorFinalRating);
  if (!engOn()) return;
  const e = engEnsure();
  if (ct) {
    e.engine = { id: ct.engine, years: 2, signedSeason: s.season, costMult: 1 };
    s.originalDrivers = ct.drivers.map(d => ({ name: d.name, rating: d.rating, team: ct.name, points: 0, wins: 0 }));
    s.money = engR1(s.money + ct.startBudgetBonus);
    ct.drivers.forEach(d => { if (!drivers.find(x => x[0] === d.name)) drivers.push([d.name, d.rating, Math.round(d.rating * 0.2)]); });
    add("✨ Fundaste " + ct.name + " (" + ct.nation + "): nivel " + ct.tierLabel + ", motor " + engEngineStats(ct.engine).name + ", pilotos " + ct.drivers.map(d => d.name + " (" + d.rating + ")").join(" y ") + ".");
  }
  if (s.rosterTemplate) add("🛠️ Parrilla personalizada activa: " + s.rosterTemplate.teams.length + " equipos" + (s.rosterTemplate.name ? " (plantilla \"" + s.rosterTemplate.name + "\")" : "") + ".");
  getTeamsForYear(s.season).forEach(t => engAiEngine(t[0]));
  engBoardNew();
  engApplyPointsSystem();
  render();
};

const _engOrigLoadGame = loadGameFromSlot;
loadGameFromSlot = function (mode, i) {
  s.eng = null; s.customTeam = null; s.rosterTemplate = null;
  engRaceCache = null; engLive = null;
  _engOrigLoadGame(mode, i);
  if (s.customTeam) teamColors[s.customTeam.name] = s.customTeam.color;
  if (s.rosterTemplate) engRegisterTemplateColors(s.rosterTemplate);
  try { applyTeamColor(); render(); } catch (err) {}
};

const _engOrigAcceptOffer = acceptOffer;
acceptOffer = function (index) {
  const before = s.team;
  _engOrigAcceptOffer(index);
  if (!engOn() || s.team === before) return;
  const e = engEnsure();
  e.engine = { id: engDefaultEngineFor(s.team, s.season), years: 2, signedSeason: s.season, costMult: 1 };
  e.attr = { aero: Math.floor(e.attr.aero / 3), chassis: Math.floor(e.attr.chassis / 3), tyres: Math.floor(e.attr.tyres / 3), reliab: Math.floor(e.attr.reliab / 3) };
  e.puDev = { power: 0, rel: 0 };
  e.confidence = 60;
  engBoardNew();
  add("🔧 En " + s.team + " corrés con motor " + engEngineStats(e.engine.id).name + ". Tu conocimiento de setup de cada circuito viaja con vos.");
  render();
};

const _engOrigDevelopCar = developCar;
developCar = function () {
  const m0 = s.money;
  _engOrigDevelopCar.apply(this, arguments);
  if (!engOn() || s.money >= m0) return;
  const r = engReserveInfo();
  if (r.real && r.rating >= 72) {
    const g = r.rating >= 80 ? 2 : 1;
    s.car = clamp(s.car + g);
    add("🎮 Feedback del simulador: " + r.name + " (reserva, rating " + r.rating + ") afinó la correlación del desarrollo (+" + g + ").");
    render();
  }
};

const _engOrigRecruitAcademy = recruitAcademyDriver;
recruitAcademyDriver = function (name) {
  const before = (s.academyDrivers || []).length;
  _engOrigRecruitAcademy(name);
  const d = (s.academyDrivers || [])[s.academyDrivers.length - 1];
  if (s.academyDrivers.length > before && d) {
    d.age = 14 + (engH("acadage_" + d.name + s.season) % 4);
    d.potential = Math.min(97, d.rating + 12 + (engH("acadpot_" + d.name) % 14));
    d.status = "academy";
    render();
  }
};
const _engOrigTrainAcademy = trainAcademyDriver;
trainAcademyDriver = function (name) {
  const d = (s.academyDrivers || []).find(x => x.name === name);
  if (d && d.status === "loan") return add("❌ " + name + " está cedido a préstamo: entrena con su equipo de F2/F3.");
  const before = d ? d.rating : 0;
  _engOrigTrainAcademy(name);
  if (d) { engAcademyFix(d); if (d.rating > d.potential) d.potential = d.rating; }
  return before;
};
const _engOrigPromoteAcademy = promoteAcademyDriver;
promoteAcademyDriver = function (name) {
  const d = (s.academyDrivers || []).find(x => x.name === name);
  if (d && d.status === "loan") return add("❌ " + name + " está cedido a préstamo hasta fin de temporada.");
  _engOrigPromoteAcademy(name);
  if (s.eng && s.eng.reserve === name && !(s.academyDrivers || []).find(x => x.name === name)) s.eng.reserve = null;
};

const _engOrigRender = render;
render = function () {
  _engOrigRender.apply(this, arguments);
  try { engRenderAll(); } catch (err) { console.warn("[FAWIWE] render ingeniero:", err); }
};

const _engOrigOnPlayerModeChange = onPlayerModeChange;
onPlayerModeChange = function () {
  _engOrigOnPlayerModeChange.apply(this, arguments);
  engRenderSetupExtras();
};
const _engOrigSetPlayMode = setPlayMode;
setPlayMode = function (mode) {
  _engOrigSetPlayMode(mode);
  engRenderSetupExtras();
};
const _engOrigRefreshTeamLists = refreshTeamLists;
refreshTeamLists = function () {
  _engOrigRefreshTeamLists.apply(this, arguments);
  if (!engInGame()) engRenderSetupExtras(true);
};

function engApplyPointsSystem() {
  const tpl = s.rosterTemplate;
  if (!engOn() || !tpl || !tpl.points || !tpl.points.length) return;
  s.pointsSystem = s.gp === 9 ? tpl.points.map(x => x * 2) : tpl.points.slice();
}

/* ---------- después de cada carrera ---------- */
function engAfterRace() {
  const grid = engLastRaceGrid;
  if (!grid || !engOn()) return;
  const e = engEnsure();
  const mine = grid.filter(x => x.mine).sort((a, b) => a.seat - b.seat);
  const st = e.seasonStats;
  if (mine.some(x => x.pos === 1 && !x.status)) st.wins++;
  st.podiums += mine.filter(x => !x.status && x.pos <= 3).length;
  if (mine.some(x => x.pts > 0)) st.pointsRaces++;
  st.dnfs += mine.filter(x => x.status === "DNF").length;
  st.penalties += mine.filter(x => x.penalty).length;
  mine.forEach(x => {
    if (x.penalty) add("⚠️ Sanción para " + x.name + ": +" + x.penalty.sec + "s (" + x.penalty.reason + ").");
    if (x.dnfReason) add("🔥 " + x.name + " abandonó: " + x.dnfReason.replace(/^\S+\s/, "") + ".");
    if (x.rescued) add("🛡️ La confiabilidad del auto salvó a " + x.name + " de un abandono.");
  });
  const others = grid.filter(x => !x.mine && x.penalty).length;
  if (others) add("⚖️ Comisarios: " + others + " sanción(es) más para otros pilotos en " + engTrackName() + ".");
  engUpdateForm(grid);
  engMaybeInjure(grid);
  // conocimiento del circuito
  const track = engTrackName();
  const r = engReserveInfo();
  const gain = 12 + facilityLevel("sim") * 2 + (r.real && r.rating >= 72 ? 4 : 0) + Math.round((s.sessionMiniScore || 50) / 12) + Math.round(engSetupQuality() / 10);
  const before = e.setup[track] || 0;
  e.setup[track] = Math.min(100, before + gain);
  add("🧰 Conocimiento de setup en " + track + ": " + before + " → " + e.setup[track] + "/100.");
  engSponsorTick();
  // historial de carrera
  e.history.races.push({
    s: s.season, g: s.gp, t: track, w: s.weather ? s.weather.label : "", sc: !!s._safetyCarThisRace,
    sp: !!(e.lastSprint && e.lastSprint.key === engKey()), team: s.team,
    top: grid.slice(0, 10).map(x => [x.name.replace(" (reserva)", ""), x.team, x.status || ("P" + x.pos), x.pts || 0, x.penalty ? x.penalty.sec : 0, x.mine ? 1 : 0]),
    mine: mine.map(x => [x.name, x.status || ("P" + x.pos), x.pts || 0])
  });
  if (e.history.races.length > 160) e.history.races.shift();
  engLastRaceGrid = null;
  render();
}

/* ---------- fin de temporada (con los datos de la temporada que termina) ---------- */
function engSeasonEndPre() {
  const e = engEnsure();
  const table = driverStandingsTable();
  const teams = Object.entries(s.teamStandings || {}).sort((a, b) => b[1] - a[1]);
  const pos = teamFinishPosition();
  const rec = {
    season: s.season, team: s.team, pos, pts: s.points, wins: e.seasonStats.wins, podiums: e.seasonStats.podiums,
    champ: table[0] ? table[0].name + " (" + table[0].pts + ")" : "—",
    champTeam: teams[0] ? teams[0][0] : "—", engine: engMyEngine().name, car: s.car
  };
  engPrizeMoney();
  engSponsorSeasonEnd();
  engBoardEvaluate();
  rec.conf = e.confidence;
  e.history.seasons.push(rec);
  if (e.history.seasons.length > 60) e.history.seasons.shift();
  const leftover = engProspects().filter(p => !e.presigned.find(x => x.name === p.name));
  if (leftover.length) add("📋 Mercado de F2: " + leftover.map(p => p.name).join(", ") + " firmaron con otros equipos antes de que los pre-ficharas.");
}
/* ---------- comienzo de temporada (ya con el año nuevo) ---------- */
function engSeasonStartPost(prevSeason) {
  const e = engEnsure();
  e.seasonStats = { season: s.season, wins: 0, podiums: 0, pointsRaces: 0, dnfs: 0, penalties: 0, sprintPts: 0 };
  const regChange = (s.season - START_SEASON) % REGULATION_CYCLE === 0;
  if (regChange) {
    Object.keys(e.setup).forEach(k => { e.setup[k] = 0; });
    ENG_AREAS.forEach(a => { e.attr[a.id] = Math.floor((e.attr[a.id] || 0) / 2); });
    getTeamsForYear(s.season).forEach(t => { e.shake[t[0]] = ((engH("shake_" + t[0] + s.season) % 81) - 40) / 100; });
    add("📜 Reglamento nuevo: todo el conocimiento de setup vuelve a cero para todos, tus áreas de desarrollo pierden la mitad y el orden de la parrilla se mezcla.");
  } else {
    Object.keys(e.shake).forEach(k => { e.shake[k] = Math.round(((e.shake[k] || 0) * 0.6 + ((engH("drift_" + k + s.season) % 21) - 10) / 200) * 100) / 100; });
  }
  Object.keys(e.form).forEach(n => { e.form[n] = engR1(e.form[n] * 0.5); });
  engSeasonEngines(s.season, regChange);
  engAcademySeason();
  engApplyPresigned();
  engBoardNew();
}

/* =====================================================================================
   CARRERA EN VIVO
   ===================================================================================== */
function engCurrentTyre() { return document.getElementById("tyre")?.value || s.chosenTyre || "Medium"; }
function engStartLive() {
  const prevWeather = s.weather;
  applySafetyCarEvent();
  applyMidRaceWeatherTwist();
  const twist = s.weather !== prevWeather;
  engRaceCache = null;
  engLive = null;
  simulateGrid("race"); // arma la parrilla base (queda en engRaceCache)
  const e = engEnsure();
  const T = 30;
  const L = {
    key: engKey(), T, tick: 0, speed: 1, phase: "running", b1: 0, b2: 0, dnf: [], pens: [], goodCalls: 0,
    sc: !!s._safetyCarThisRace, twist, laps: (trackData[s.gp] || { laps: 58 }).laps,
    feed: [], start: {}, dnfTick: {}, penTick: {}, shownDnf: {}, shownPen: {}, pitted: false, prevOrder: null, decisions: []
  };
  engLive = L;
  engLiveRetarget();
  const q = e.lastQualiOrder && e.lastQualiOrder.key === L.key ? e.lastQualiOrder.names : null;
  L.target.forEach((x, i) => {
    let si = q ? q.indexOf(x.name) : -1;
    if (si < 0) si = engClampN(i + ((engH("st_" + x.name + L.key) % 9) - 4), 0, L.target.length - 1);
    L.start[x.name] = si;
  });
  L.decisions = [{ tick: 9, id: "pit" }];
  if (L.sc) L.decisions.push({ tick: 15, id: "sc" });
  if (L.twist) L.decisions.push({ tick: 19, id: "weather" });
  L.decisions.push({ tick: 25, id: "push" });
  L.feed.push({ lap: 0, txt: "🚦 Semáforos apagados en " + engTrackName() + (s.weather ? " · " + s.weather.label : "") + ". ¡Largaron!" });
  if (e.lastSprint && e.lastSprint.key === L.key) L.feed.push({ lap: 0, txt: "⚡ Ayer en la sprint ganó " + e.lastSprint.winner + "." });
  document.getElementById("engLiveOverlay")?.classList.add("show");
  engLiveDraw();
  engLiveSchedule();
}
function engLiveRetarget() {
  const L = engLive;
  if (!L || !engRaceCache) return;
  const base = engClone(engRaceCache.entries);
  engApplyLive(base);
  L.target = engReorder(base);
  L.target.forEach(x => {
    if (x.status === "DNF" && L.dnfTick[x.name] == null) L.dnfTick[x.name] = Math.min(L.T - 1, L.tick + 2 + (engH("dnf_" + x.name + L.key) % Math.max(1, L.T - L.tick - 3)));
    if (x.penalty && L.penTick[x.name] == null) L.penTick[x.name] = Math.min(L.T - 1, L.tick + 2 + (engH("pen_" + x.name + L.key) % Math.max(1, L.T - L.tick - 3)));
  });
}
function engApplyLive(entries) {
  const L = engLive;
  if (!L || L.key !== engKey()) return;
  entries.forEach(x => {
    if (!x.mine) return;
    x.score += x.seat === 1 ? L.b1 : L.b2;
    if (L.dnf.includes(x.seat) && !x.status) { x.status = "DNF"; x.dnfEngine = true; x.dnfReason = "💥 Rotura por exigir el motor al máximo"; }
    const p = L.pens.find(pp => pp.seat === x.seat);
    if (p && !x.penalty && !x.status) { x.penalty = { sec: p.sec, reason: p.reason }; x.score -= p.sec * 0.5; }
  });
}
let engLiveTimer = null;
let engDecTimer = null;
function engLiveSchedule() {
  if (engLiveTimer) clearInterval(engLiveTimer);
  const L = engLive;
  if (!L) return;
  engLiveTimer = setInterval(engLiveTick, L.skip ? 60 : Math.round(850 / L.speed));
}
function engLiveSpeed(v) { if (!engLive) return; engLive.speed = v; engLiveSchedule(); engLiveDraw(); }
function engLiveSkip() { if (!engLive) return; engLive.skip = true; if (engLive.phase === "decision") engLiveChoose(engLive.dec.def); engLiveSchedule(); }
function engLiveOrder() {
  const L = engLive;
  const p = Math.min(1, L.tick / L.T);
  const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const scNow = L.sc && L.tick >= 14 && L.tick <= 17;
  return L.target.map((x, fi) => {
    const si = L.start[x.name] != null ? L.start[x.name] : fi;
    const noise = (((engH(x.name + "_" + L.tick + L.key) % 100) / 100) - 0.5) * 1.6 * (1 - p) * (scNow ? 0.3 : 1);
    const out = x.status === "DNF" && L.tick >= (L.dnfTick[x.name] || 0);
    const dns = x.status === "DNS";
    const v = dns ? 9999 : out ? 5000 + fi : si + (fi - si) * ease + noise;
    return { x, v, out, dns };
  }).sort((a, b) => a.v - b.v);
}
function engLiveTick() {
  const L = engLive;
  if (!L || L.phase !== "running") return;
  L.tick++;
  const lap = Math.round(L.tick / L.T * L.laps);
  L.target.forEach(x => {
    if (L.dnfTick[x.name] === L.tick && !L.shownDnf[x.name]) {
      L.shownDnf[x.name] = true;
      L.feed.push({ lap, txt: (x.mine ? "💥 ¡NOOO! " : "💥 Abandono: ") + x.name + " (" + x.team + ")" + (x.dnfReason ? " — " + x.dnfReason.replace(/^\S+\s/, "") : " queda afuera"), mine: x.mine });
    }
    if (L.penTick[x.name] === L.tick && !L.shownPen[x.name] && x.penalty) {
      L.shownPen[x.name] = true;
      L.feed.push({ lap, txt: "⚠️ Comisarios: +" + x.penalty.sec + "s para " + x.name + " — " + x.penalty.reason, mine: x.mine });
    }
  });
  if (L.sc && L.tick === 14) L.feed.push({ lap, txt: "🚨 ¡SAFETY CAR! Incidente en pista, el pelotón se agrupa." });
  if (L.sc && L.tick === 18) L.feed.push({ lap, txt: "🟢 Relanzamiento: bandera verde otra vez." });
  if (L.twist && L.tick === 18) L.feed.push({ lap, txt: (s.weather && s.weather.wet ? "🌧️ Empieza a llover en " : "☀️ La pista se está secando en ") + engTrackName() + "." });
  if (L.tick === Math.round(L.T * 0.6)) {
    const fl = L.target.filter(x => !x.status)[engH("fl" + L.key) % Math.max(1, Math.min(5, L.target.length))];
    if (fl) L.feed.push({ lap, txt: "⏱️ Vuelta rápida momentánea para " + fl.name + "." });
  }
  // adelantamientos de tus pilotos
  const order = engLiveOrder();
  const nowIdx = {};
  order.forEach((r, i) => { nowIdx[r.x.name] = i; });
  if (L.prevOrder) {
    L.target.filter(x => x.mine).forEach(x => {
      const a = L.prevOrder[x.name], b = nowIdx[x.name];
      if (a != null && b != null && b < a && !(x.status === "DNF" && L.tick >= L.dnfTick[x.name])) {
        const passed = order[b + 1] ? order[b + 1].x.name : null;
        if (passed && engH("ov" + x.name + L.tick) % 2 === 0) L.feed.push({ lap, txt: "⬆️ " + x.name + " pasa a " + passed + " y sube a P" + (b + 1) + ".", mine: true });
      }
    });
  }
  L.prevOrder = nowIdx;
  const dec = L.decisions.find(d => d.tick === L.tick && !d.done);
  if (dec) { engLiveOpenDecision(dec); return; }
  if (L.tick >= L.T) {
    L.phase = "finished";
    clearInterval(engLiveTimer); engLiveTimer = null;
    const w = L.target.find(x => !x.status);
    L.feed.push({ lap: L.laps, txt: "🏁 ¡BANDERA A CUADROS! Gana " + (w ? w.name + " (" + w.team + ")" : "—") + "." });
  }
  engLiveDraw();
}
function engLiveDecisionDef(id) {
  const L = engLive;
  const e = engEnsure();
  if (id === "pit") {
    const tyre = engCurrentTyre();
    const wear = currentCircuitTraits().tireWear || 1;
    const health = engClampN(Math.round(({ Soft: 38, Medium: 55, Hard: 72, Intermedio: 50, Lluvia: 50 }[tyre] || 55) / wear + (engH("hp" + L.key) % 11) - 5), 15, 90);
    const ov = currentCircuitTraits().overtake || "medio";
    const undercutGood = health <= 48 || ov === "difícil";
    const overcutGood = health >= 62 && ov !== "difícil";
    return {
      q: "📻 Ventana de boxes (vuelta " + Math.round(L.tick / L.T * L.laps) + ")",
      hint: "Ingeniero de neumáticos: \"Los traseros " + tyre + " están al " + health + "%. En " + engTrackName() + " adelantar es " + ov + ".\"",
      def: 2,
      opts: [
        { label: "📦 Box ahora (undercut)", sub: "Gomas nuevas antes que los rivales.", fx: () => { L.pitted = true; return undercutGood ? [4, 3.2] : [0.5, 0.4]; } },
        { label: "⏳ Estirar el stint (overcut)", sub: "Aprovechar pista libre y parar más tarde.", fx: () => overcutGood ? [4, 3.2] : health <= 45 ? [-4, -3] : [1, 0.8] },
        { label: "📋 Seguir el plan original", sub: "Sin sorpresas: parada en la vuelta prevista.", fx: () => [1.5, 1.2] }
      ]
    };
  }
  if (id === "sc") {
    return {
      q: "🚨 ¡Safety Car en pista!",
      hint: L.pitted ? "Ya paraste hace pocas vueltas: si entrás otra vez perdés posiciones." : "Parar ahora cuesta la mitad de tiempo que con bandera verde.",
      def: 2,
      opts: [
        { label: "📦 Parada barata bajo Safety Car", sub: "Gomas nuevas para el relanzamiento.", fx: () => L.pitted ? [-2, -1.5] : [5, 4] },
        { label: "🛣️ Quedarse afuera", sub: "Ganar la posición en pista.", fx: () => L.pitted ? [4, 3] : [-1.5, -1] },
        { label: "🔀 Estrategia dividida", sub: "Un auto entra y el otro no.", fx: () => [3, 1] }
      ]
    };
  }
  if (id === "weather") {
    const wet = !!(s.weather && s.weather.wet);
    const heavy = wet && s.weather.label.indexOf("fuerte") >= 0;
    return wet ? {
      q: "🌧️ ¡Empezó a llover!",
      hint: "El radar muestra " + (heavy ? "lluvia fuerte por un buen rato." : "una nube que puede pasar en pocas vueltas."),
      def: 1,
      opts: [
        { label: "🌧️ Cambiar YA a " + (heavy ? "lluvia extrema" : "intermedios"), sub: "El primero en cambiar gana muchísimo.", fx: () => [7, 6] },
        { label: "⏱️ Esperar 2 vueltas", sub: "A ver si la nube pasa.", fx: () => heavy ? [-2, -2] : [2, 2] },
        { label: "🏎️ Seguir con secos", sub: "Apostar a que no llueve más.", fx: () => [-5, -4] }
      ]
    } : {
      q: "☀️ ¡La pista se está secando!",
      hint: "Ya se ve una línea seca en la trazada ideal.",
      def: 1,
      opts: [
        { label: "☀️ Pasar a secos ya", sub: "Arriesgado en la primera vuelta fría.", fx: () => Math.random() < 0.1 ? [-3, 4] : [6, 5] },
        { label: "⏱️ Esperar un par de vueltas", sub: "Que se seque un poco más.", fx: () => [2, 2] },
        { label: "🌧️ Seguir con intermedios", sub: "Los vas a destrozar en seco.", fx: () => [-5, -4] }
      ]
    };
  }
  // push final
  const rel = engMyEngine().rel + (e.attr.reliab || 0) * 0.6;
  const risk = engClampN(Math.round(4 + Math.max(0, 86 - rel) * 0.6), 2, 25);
  return {
    q: "🔥 Últimas vueltas: ¿modo motor?",
    hint: "Motorista: \"Si vamos al máximo, el riesgo de rotura es de ~" + risk + "% por auto.\"",
    def: 1,
    opts: [
      { label: "🔥 Ataque total", sub: "Motor al máximo y a buscar posiciones.", fx: () => {
        [1, 2].forEach(seat => { if (Math.random() * 100 < risk) L.dnf.push(seat); });
        if (Math.random() < 0.12) L.pens.push({ seat: 1, sec: 5, reason: "Exceder los límites de pista atacando" });
        return [3, 2];
      } },
      { label: "⚖️ Mantener ritmo y cuidar el auto", sub: "Traer los puntos a casa.", fx: () => [0.5, 0.5] },
      { label: "📻 Orden de equipo", sub: "Que el más rápido de los dos pase adelante.", fx: () => {
        const mine = L.target.filter(x => x.mine && !x.status);
        if (mine.length < 2) return [0.5, 0.5];
        const faster = mine.sort((a, b) => b.score - a.score)[0];
        s.trust = clamp(s.trust - 1);
        return faster.seat === 1 ? [2.5, -0.5] : [-0.5, 2.5];
      } }
    ]
  };
}
function engLiveOpenDecision(dec) {
  const L = engLive;
  L.phase = "decision";
  L.dec = Object.assign({ id: dec.id }, engLiveDecisionDef(dec.id));
  L.decRef = dec;
  if (L.skip) { engLiveChoose(L.dec.def); return; }
  L.decLeft = 15;
  if (engDecTimer) clearInterval(engDecTimer);
  engDecTimer = setInterval(() => {
    if (!engLive || engLive.phase !== "decision") { clearInterval(engDecTimer); return; }
    engLive.decLeft--;
    const el = document.getElementById("engDecLeft");
    if (el) el.textContent = engLive.decLeft + "s";
    if (engLive.decLeft <= 0) { clearInterval(engDecTimer); engLiveChoose(engLive.dec.def, true); }
  }, 1000);
  engLiveDraw();
}
function engLiveChoose(i, timeout) {
  const L = engLive;
  if (!L || L.phase !== "decision") return;
  if (engDecTimer) { clearInterval(engDecTimer); engDecTimer = null; }
  const opt = L.dec.opts[i] || L.dec.opts[L.dec.def];
  const [d1, d2] = opt.fx();
  L.b1 += d1; L.b2 += d2;
  L.decRef.done = true;
  const lap = Math.round(L.tick / L.T * L.laps);
  const verdict = d1 >= 3 ? "✅ ¡Gran lectura del box!" : d1 >= 1 ? "👍 Decisión correcta." : d1 >= 0 ? "➖ Sin ganancia ni pérdida." : "❌ Mala decisión: perdiste tiempo.";
  if (d1 >= 3) L.goodCalls++;
  L.feed.push({ lap, txt: "📻 " + (timeout ? "(Se acabó el tiempo) " : "") + "Box: \"" + opt.label.replace(/^\S+\s/, "") + "\" — " + verdict, mine: true });
  L.phase = "running";
  L.dec = null;
  engLiveRetarget();
  engLiveDraw();
}
function engLiveDraw() {
  const L = engLive;
  const ov = document.getElementById("engLiveOverlay");
  if (!L || !ov) return;
  const lap = Math.min(L.laps, Math.round(L.tick / L.T * L.laps));
  const scNow = L.sc && L.tick >= 14 && L.tick <= 17;
  const flag = L.phase === "finished" ? "🏁 Bandera a cuadros" : scNow ? "🟡 SAFETY CAR" : "🟢 Bandera verde";
  document.getElementById("engLiveTitle").textContent = "GP de " + engTrackName() + (engIsSprintWeekend() ? " · fin de semana sprint" : "");
  document.getElementById("engLiveLap").innerHTML = `<b>Vuelta ${lap}/${L.laps}</b>${engBar(lap, L.laps)}`;
  document.getElementById("engLiveStatus").innerHTML = `<span class="eng-flag ${scNow ? "sc" : L.phase === "finished" ? "fin" : ""}">${flag}</span> <span class="small">${s.weather ? engEsc(s.weather.label) : ""} · Neumático de salida: ${engEsc(engCurrentTyre())}</span>`;
  const order = engLiveOrder();
  const leaderIdx = 0;
  const rows = order.map((r, i) => {
    const x = r.x;
    const gap = r.dns ? "DNS" : r.out ? "OUT" : i === leaderIdx ? "Líder" : "+" + (i * (scNow ? 0.4 : 1.35) + ((engH(x.name + L.tick) % 10) / 10)).toFixed(1) + "s";
    const pen = x.penalty && L.shownPen[x.name] ? `<span class="eng-badge pen">+${x.penalty.sec}s</span>` : "";
    const color = teamColors[x.team] || "#888";
    return { i, x, html: `<div class="eng-live-row ${x.mine ? "mine" : ""} ${r.out || r.dns ? "out" : ""}"><span class="p">${r.out || r.dns ? "—" : i + 1}</span><span class="c" style="background:${color}"></span><span class="n">${engEsc(x.name)} ${pen}</span><span class="t">${engEsc(x.team)}</span><span class="g">${gap}</span></div>` };
  });
  const shown = rows.filter(r => r.i < 10 || r.x.mine);
  document.getElementById("engLiveBoard").innerHTML = shown.map(r => r.html).join("");
  document.getElementById("engLiveFeed").innerHTML = L.feed.slice().reverse().map(f => `<p class="${f.mine ? "mine" : ""}"><b>V${f.lap}</b> ${engEsc(f.txt)}</p>`).join("");
  const decBox = document.getElementById("engLiveDecision");
  if (L.phase === "decision" && L.dec) {
    decBox.innerHTML = `<div class="eng-live-dec"><div class="q">${engEsc(L.dec.q)} <span class="eng-dec-left" id="engDecLeft">${L.decLeft}s</span></div><p class="small">${engEsc(L.dec.hint)}</p>
      <div class="choice-grid">${L.dec.opts.map((o, i) => `<button class="choice-card ${i === L.dec.def ? "" : ""}" onclick="engLiveChoose(${i})"><b>${engEsc(o.label)}</b><span class="small">${engEsc(o.sub)}</span></button>`).join("")}</div>
      <p class="small">Si no elegís a tiempo, el box sigue con "${engEsc(L.dec.opts[L.dec.def].label.replace(/^\S+\s/, ""))}".</p></div>`;
  } else decBox.innerHTML = "";
  const ctrl = document.getElementById("engLiveCtrl");
  if (L.phase === "finished") ctrl.innerHTML = `<button class="start-btn" onclick="engLiveFinalize()">🏆 Ver resultado oficial</button>`;
  else ctrl.innerHTML = `<button class="dark ${L.speed === 1 ? "eng-on" : ""}" onclick="engLiveSpeed(1)">▶️ x1</button><button class="dark ${L.speed === 3 ? "eng-on" : ""}" onclick="engLiveSpeed(3)">⏩ x3</button><button class="dark" onclick="engLiveSkip()">⏭️ Saltar al final</button>`;
}
function engLiveFinalize() {
  const L = engLive;
  if (!L) return;
  if (engLiveTimer) { clearInterval(engLiveTimer); engLiveTimer = null; }
  document.getElementById("engLiveOverlay")?.classList.remove("show");
  const origSC = applySafetyCarEvent, origTwist = applyMidRaceWeatherTwist;
  applySafetyCarEvent = function () {};       // ya se aplicaron al empezar la transmisión
  applyMidRaceWeatherTwist = function () {};
  try { _engOrigFinishRace(); } finally { applySafetyCarEvent = origSC; applyMidRaceWeatherTwist = origTwist; }
  if (L.goodCalls > 0) {
    addLicensePoints(L.goodCalls * 0.5);
    add("📻 Lectura de carrera en vivo: " + L.goodCalls + " gran(des) decisión(es) del box · +" + (L.goodCalls * 0.5) + " pts de licencia.");
  }
  engAfterRace();
  engLive = null;
  engRaceCache = null;
}

/* =====================================================================================
   CREAR TU PROPIO EQUIPO + EDITOR DE PARRILLA (pantalla de inicio)
   ===================================================================================== */
let engRosterDraft = null;
let engRosterActive = false;
let engRosterOpen = false;
function engActiveTemplate() {
  if (engInGame()) return (s && s.rosterTemplate && s.rosterTemplate.teams && s.rosterTemplate.teams.length) ? s.rosterTemplate : null;
  if (engRosterActive && engRosterDraft && engRosterDraft.teams.length >= 2 && !engInGame()) {
    const mode = document.getElementById("playerModeSel")?.value || "engineer";
    if (mode !== "driver" && playMode !== "multi") return engRosterDraft;
  }
  return null;
}
function engRegisterTemplateColors(tpl) { (tpl.teams || []).forEach(t => { if (t.color) teamColors[t.name] = t.color; }); }
function engSetupYear() { return parseInt(document.getElementById("startYear")?.value || "2026") || 2026; }
function engSetupEngineOptions(selected) {
  const yr = engSetupYear();
  const list = (engRosterActive && engRosterDraft && engRosterDraft.engines.length) ? engRosterDraft.engines : ENG_BASE_ENGINES.filter(x => yr >= x.from && yr <= (x.to || 3000));
  return list.map(x => `<option value="${engEsc(x.id)}" ${x.id === selected ? "selected" : ""}>${engEsc(x.name)} · pot ${x.power} · conf ${x.rel} · ${formatMoney(x.cost)}/GP</option>`).join("");
}
const ENG_TIERS = {
  back: { label: "🔧 Fondo de parrilla", rating: 1.6, drv: 70, bonus: 25 },
  mid: { label: "⚖️ Mitad de tabla", rating: 2.6, drv: 74, bonus: 10 },
  top: { label: "🚀 Aspirante", rating: 3.6, drv: 79, bonus: 0 }
};
function engReadCustomTeamForm() {
  const on = document.getElementById("engCtOn");
  if (!on || !on.checked) return null;
  const mode = document.getElementById("playerModeSel")?.value || "engineer";
  if (mode === "driver" || playMode === "multi") return null;
  const name = (document.getElementById("engCtName")?.value || "").trim() || "FAWIWE Racing";
  const tierId = document.getElementById("engCtTier")?.value || "mid";
  const tier = ENG_TIERS[tierId] || ENG_TIERS.mid;
  const d1 = (document.getElementById("engCtD1")?.value || "").trim() || generateRookieName("ct1_" + name);
  let d2 = (document.getElementById("engCtD2")?.value || "").trim() || generateRookieName("ct2_" + name);
  if (d2 === d1) d2 = d2 + " Jr.";
  return {
    name, nation: document.getElementById("engCtNation")?.value || "Argentina",
    color: document.getElementById("engCtColor")?.value || "#e3261a",
    engine: document.getElementById("engCtEngine")?.value || "mercedes",
    rating: tier.rating, tierLabel: tier.label, startBudgetBonus: tier.bonus,
    drivers: [{ name: d1, rating: tier.drv + 1 }, { name: d2, rating: tier.drv - 1 }]
  };
}
function engRenderSetupExtras(keepValues) {
  const box = document.getElementById("engSetupExtras");
  if (!box) return;
  const mode = document.getElementById("playerModeSel")?.value || "engineer";
  const show = mode !== "driver" && playMode !== "multi";
  box.classList.toggle("hidden", !show);
  if (!show) return;
  const prev = {};
  ["engCtOn", "engCtName", "engCtNation", "engCtColor", "engCtEngine", "engCtTier", "engCtD1", "engCtD2"].forEach(id => {
    const el = document.getElementById(id);
    if (el) prev[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  const countries = [...(document.getElementById("country")?.options || [])].map(o => o.value);
  const on = !!prev.engCtOn;
  box.innerHTML = `
    <div class="eng-setup-card">
      <h3>✨ Crear tu propia escudería</h3>
      <label class="eng-check"><input type="checkbox" id="engCtOn" ${on ? "checked" : ""} onchange="engRenderSetupExtras(true)"> Quiero fundar mi propio equipo desde cero (se suma a la parrilla junto a los reales)</label>
      <div class="grid ${on ? "" : "hidden"}" style="margin-top:10px">
        <div><label>Nombre del equipo</label><input id="engCtName" maxlength="32" placeholder="Ej: Milo Racing" value="${engEsc(prev.engCtName || "")}"></div>
        <div><label>País</label><select id="engCtNation">${countries.map(c => `<option ${c === (prev.engCtNation || document.getElementById("country")?.value) ? "selected" : ""}>${engEsc(c)}</option>`).join("")}</select></div>
        <div><label>Color del equipo</label><input id="engCtColor" type="color" value="${engEsc(prev.engCtColor || "#e3261a")}" style="height:46px;padding:4px"></div>
        <div><label>Proveedor de motor</label><select id="engCtEngine">${engSetupEngineOptions(prev.engCtEngine || "mercedes")}</select></div>
        <div><label>Nivel inicial</label><select id="engCtTier">${Object.entries(ENG_TIERS).map(([k, v]) => `<option value="${k}" ${k === (prev.engCtTier || "mid") ? "selected" : ""}>${v.label} (⭐${v.rating}${v.bonus ? ", +$" + v.bonus + "M de inversores" : ""})</option>`).join("")}</select></div>
        <div><label>Piloto 1 (opcional)</label><input id="engCtD1" maxlength="28" placeholder="Se genera solo si lo dejás vacío" value="${engEsc(prev.engCtD1 || "")}"></div>
        <div><label>Piloto 2 (opcional)</label><input id="engCtD2" maxlength="28" placeholder="Se genera solo si lo dejás vacío" value="${engEsc(prev.engCtD2 || "")}"></div>
      </div>
      <p class="small">${on ? "Tu equipo reemplaza la elección de \"Equipo de carrera\": corre con los reales, suma en Constructores, consigue sponsors y tiene su propia directiva (inversores)." : ""}</p>
    </div>
    <div class="eng-setup-card">
      <h3>🛠️ Editor de parrilla</h3>
      <p class="small">Cambiá nombres, colores, pilotos, ratings, motores y el sistema de puntos. Guardá hasta 3 plantillas. ${engRosterActive ? "<b style='color:#86efac'>✅ Parrilla personalizada ACTIVA para la próxima partida.</b>" : "Ahora se usa la parrilla real del año elegido."}</p>
      <button class="dark" onclick="engToggleRosterEditor()">${engRosterOpen ? "▲ Cerrar editor" : "▼ Abrir editor"}</button>
      <div id="engRosterBox" class="${engRosterOpen ? "" : "hidden"}">${engRosterOpen ? engRosterEditorHtml() : ""}</div>
    </div>`;
}
function engToggleRosterEditor() {
  engRosterOpen = !engRosterOpen;
  if (engRosterOpen && !engRosterDraft) engRosterLoadReal(true);
  engRenderSetupExtras(true);
}
function engSlug(str) { return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "motor"; }
function engRosterLoadReal(silent) {
  const yr = engSetupYear();
  const wasActive = engRosterActive;
  engRosterActive = false; // leer la parrilla REAL, no la plantilla
  const teams = _engOrigGetTeamsForYear(yr);
  const drv = _engOrigGetDriversForYear(yr);
  const prevSeason = s.season;
  s.season = yr;
  const engines = ENG_BASE_ENGINES.filter(x => yr >= x.from && yr <= (x.to || 3000)).map(x => ({ id: x.id, name: x.name, power: x.power, rel: x.rel, eff: x.eff, cost: x.cost }));
  engRosterDraft = {
    name: "", pointsPreset: "classic", points: ENG_POINT_PRESETS.classic.pts.slice(), engines,
    teams: teams.map(t => {
      const lu = drv.filter(d => d[3] === t[0]).slice(0, 2).map(d => ({ name: d[0], rating: d[1] }));
      while (lu.length < 2) lu.push({ name: generateRookieName("tpl_" + t[0] + lu.length), rating: 72 });
      let eng = "mercedes";
      try { eng = engDefaultEngineFor(t[0], yr); } catch (err) {}
      if (!engines.find(x => x.id === eng)) eng = engines[0].id;
      return { name: t[0], rating: t[1], color: teamColors[t[0]] || "#888888", engine: eng, drivers: lu };
    })
  };
  s.season = prevSeason;
  engRosterActive = wasActive;
  if (!silent) { add("🛠️ Editor: cargaste la parrilla real de " + yr + "."); engRosterRefresh(); }
}
function engRosterRefresh() {
  if (engRosterActive) { try { refreshTeamLists(); } catch (err) {} }
  engRenderSetupExtras(true);
  try { updateTutorialGateNotice(); } catch (err) {}
}
function engRosterSet(i, field, value, di) {
  const d = engRosterDraft;
  if (!d || !d.teams[i]) return;
  const t = d.teams[i];
  if (field === "name") {
    const v = String(value).trim().slice(0, 32) || ("Equipo " + (i + 1));
    t.name = d.teams.some((x, j) => j !== i && x.name === v) ? v + " " + (i + 1) : v;
  } else if (field === "color") t.color = value;
  else if (field === "rating") t.rating = engClampN(Math.round((parseFloat(value) || 2.5) * 10) / 10, 0.5, 5);
  else if (field === "engine") t.engine = value;
  else if (field === "dname") t.drivers[di].name = String(value).trim().slice(0, 28) || generateRookieName("tplx_" + i + "_" + di);
  else if (field === "drating") t.drivers[di].rating = engClampN(parseInt(value) || 72, 40, 99);
  if (field === "name" || field === "rating") engRosterRefresh();
}
function engRosterAddTeam() {
  const d = engRosterDraft;
  if (!d) return;
  if (d.teams.length >= 16) return alert("Máximo 16 equipos en la parrilla.");
  const n = "Equipo Nuevo " + (d.teams.length + 1);
  d.teams.push({ name: n, rating: 2.5, color: "#" + (engH(n) % 0xffffff).toString(16).padStart(6, "0"), engine: d.engines[0] ? d.engines[0].id : "mercedes", drivers: [{ name: generateRookieName("nt1_" + n + Date.now()), rating: 72 }, { name: generateRookieName("nt2_" + n + Date.now()), rating: 70 }] });
  engRosterRefresh();
}
function engRosterDelTeam(i) {
  const d = engRosterDraft;
  if (!d) return;
  if (d.teams.length <= 2) return alert("La parrilla necesita al menos 2 equipos.");
  d.teams.splice(i, 1);
  engRosterRefresh();
}
function engRosterSetEngine(i, field, value) {
  const d = engRosterDraft;
  const en = d && d.engines[i];
  if (!en) return;
  if (field === "name") en.name = String(value).trim().slice(0, 24) || ("Motor " + (i + 1));
  else if (field === "cost") en.cost = engClampN(parseFloat(value) || 1, 0.2, 6);
  else en[field] = engClampN(parseInt(value) || 80, 55, 99);
}
function engRosterAddEngine() {
  const d = engRosterDraft;
  if (!d) return;
  if (d.engines.length >= 10) return alert("Máximo 10 fabricantes.");
  let id = "custom_" + Date.now().toString(36);
  d.engines.push({ id, name: "Fabricante " + (d.engines.length + 1), power: 85, rel: 85, eff: 85, cost: 1.5 });
  engRenderSetupExtras(true);
}
function engRosterDelEngine(i) {
  const d = engRosterDraft;
  if (!d || d.engines.length <= 1) return alert("Tiene que quedar al menos un fabricante.");
  const gone = d.engines.splice(i, 1)[0];
  d.teams.forEach(t => { if (t.engine === gone.id) t.engine = d.engines[0].id; });
  engRenderSetupExtras(true);
}
function engRosterPoints(preset, custom) {
  const d = engRosterDraft;
  if (!d) return;
  d.pointsPreset = preset;
  if (preset === "custom") {
    const arr = String(custom || "").split(/[,;\s]+/).map(x => parseInt(x)).filter(x => x > 0).slice(0, 26);
    if (arr.length) d.points = arr.sort((a, b) => b - a);
  } else d.points = ENG_POINT_PRESETS[preset].pts.slice();
  engRenderSetupExtras(true);
}
function engRosterToggleActive(on) {
  if (on && (!engRosterDraft || engRosterDraft.teams.length < 2)) return alert("Primero armá una parrilla con al menos 2 equipos.");
  engRosterActive = !!on;
  refreshTeamLists();
  engRenderSetupExtras(true);
  try { updateTutorialGateNotice(); } catch (err) {}
}
const ENG_TPL_KEY = "fawiwe_roster_tpl_";
function engTplRead(i) { try { const raw = localStorage.getItem(ENG_TPL_KEY + i); return raw ? JSON.parse(raw) : null; } catch (err) { return null; } }
function engTplSave(i) {
  if (!engRosterDraft) return;
  const nameEl = document.getElementById("engTplName");
  engRosterDraft.name = (nameEl && nameEl.value.trim()) || engRosterDraft.name || ("Plantilla " + (i + 1));
  try { localStorage.setItem(ENG_TPL_KEY + i, JSON.stringify(engRosterDraft)); alert("💾 Plantilla \"" + engRosterDraft.name + "\" guardada en la ranura " + (i + 1) + "."); }
  catch (err) { alert("No se pudo guardar la plantilla (el navegador bloqueó el almacenamiento)."); }
  engRenderSetupExtras(true);
}
function engTplLoad(i) {
  const d = engTplRead(i);
  if (!d) return;
  engRosterDraft = d;
  engRosterRefresh();
}
function engTplDelete(i) {
  if (!confirm("¿Borrar la plantilla de la ranura " + (i + 1) + "?")) return;
  try { localStorage.removeItem(ENG_TPL_KEY + i); } catch (err) {}
  engRenderSetupExtras(true);
}
function engRosterEditorHtml() {
  const d = engRosterDraft;
  if (!d) return "";
  const engOpts = sel => d.engines.map(x => `<option value="${engEsc(x.id)}" ${x.id === sel ? "selected" : ""}>${engEsc(x.name)}</option>`).join("");
  let slots = "";
  for (let i = 0; i < 3; i++) {
    const tp = engTplRead(i);
    slots += `<div class="eng-slot"><b>Ranura ${i + 1}</b><span class="small">${tp ? engEsc(tp.name || "Sin nombre") + " · " + tp.teams.length + " equipos" : "Vacía"}</span>
      <div><button class="dark" onclick="engTplSave(${i})">💾 Guardar acá</button>${tp ? `<button class="dark" onclick="engTplLoad(${i})">📂 Cargar</button><button class="dark" onclick="engTplDelete(${i})">🗑️</button>` : ""}</div></div>`;
  }
  const teamsHtml = d.teams.map((t, i) => `
    <div class="eng-team-edit">
      <input class="en" value="${engEsc(t.name)}" onchange="engRosterSet(${i},'name',this.value)" title="Nombre">
      <input class="ec" type="color" value="${engEsc(t.color)}" onchange="engRosterSet(${i},'color',this.value)" title="Color">
      <input class="er" type="number" step="0.1" min="0.5" max="5" value="${t.rating}" onchange="engRosterSet(${i},'rating',this.value)" title="Nivel del auto (⭐ 0.5 a 5)">
      <select class="ee" onchange="engRosterSet(${i},'engine',this.value)" title="Motor">${engOpts(t.engine)}</select>
      ${t.drivers.map((dr, di) => `<input class="ed${di}" value="${engEsc(dr.name)}" onchange="engRosterSet(${i},'dname',this.value,${di})" title="Piloto ${di + 1}"><input class="edr${di}" type="number" min="40" max="99" value="${dr.rating}" onchange="engRosterSet(${i},'drating',this.value,${di})" title="Rating piloto ${di + 1}">`).join("")}
      <button class="dark ex" onclick="engRosterDelTeam(${i})" title="Borrar equipo">🗑️ <span class="eng-mob">Borrar equipo</span></button>
    </div>`).join("");
  const enginesHtml = d.engines.map((x, i) => `
    <div class="eng-engine-edit">
      <input value="${engEsc(x.name)}" onchange="engRosterSetEngine(${i},'name',this.value)" title="Nombre">
      <label class="small">Pot<input type="number" min="55" max="99" value="${x.power}" onchange="engRosterSetEngine(${i},'power',this.value)"></label>
      <label class="small">Conf<input type="number" min="55" max="99" value="${x.rel}" onchange="engRosterSetEngine(${i},'rel',this.value)"></label>
      <label class="small">Efic<input type="number" min="55" max="99" value="${x.eff}" onchange="engRosterSetEngine(${i},'eff',this.value)"></label>
      <label class="small">$M/GP<input type="number" step="0.1" min="0.2" max="6" value="${x.cost}" onchange="engRosterSetEngine(${i},'cost',this.value)"></label>
      <button class="dark" onclick="engRosterDelEngine(${i})">🗑️</button>
    </div>`).join("");
  return `
    <div class="eng-roster">
      <h4>💾 Plantillas guardadas</h4>
      <div><label class="small">Nombre de la plantilla</label><input id="engTplName" maxlength="30" value="${engEsc(d.name || "")}" placeholder="Ej: Mi parrilla loca"></div>
      <div class="eng-slots">${slots}</div>
      <div style="margin:10px 0">
        <button class="dark" onclick="engRosterLoadReal()">📥 Cargar parrilla real de ${engSetupYear()}</button>
        <label class="eng-check"><input type="checkbox" ${engRosterActive ? "checked" : ""} onchange="engRosterToggleActive(this.checked)"> ✅ Usar esta parrilla en la partida</label>
      </div>
      <h4>🏎️ Equipos (${d.teams.length}) <span class="small">— nombre · color · ⭐ auto · motor · piloto 1 · rating · piloto 2 · rating</span></h4>
      <div class="eng-team-list">${teamsHtml}</div>
      <button onclick="engRosterAddTeam()">➕ Agregar equipo</button>
      <h4>🔧 Fabricantes de motor (${d.engines.length})</h4>
      ${enginesHtml}
      <button onclick="engRosterAddEngine()">➕ Agregar fabricante</button>
      <h4>🔢 Sistema de puntos</h4>
      <select onchange="engRosterPoints(this.value, document.getElementById('engPtsCustom').value)">${Object.entries(ENG_POINT_PRESETS).map(([k, v]) => `<option value="${k}" ${k === d.pointsPreset ? "selected" : ""}>${engEsc(v.label)}</option>`).join("")}</select>
      <input id="engPtsCustom" placeholder="Ej: 30,24,20,16,12,10,8,6,4,2,1" value="${d.pointsPreset === "custom" ? d.points.join(",") : ""}" onchange="engRosterPoints('custom', this.value)" style="margin-top:6px">
      <p class="small">Puntos actuales: <b>${d.points.join(" · ")}</b> (la última carrera del año vale doble).</p>
    </div>`;
}

/* =====================================================================================
   CENTRO DEL INGENIERO (interfaz)
   ===================================================================================== */
const ENG_TABS = [
  ["race", "🏁 Carrera"], ["board", "🏛️ Directiva"], ["engine", "🔧 Motor"], ["dev", "🏭 Desarrollo"],
  ["drivers", "👥 Pilotos"], ["setup", "🧰 Setup"], ["money", "💼 Finanzas"], ["history", "📚 Historial"]
];
let engHistOpen = null;
let engHistSeason = null;
const ENG_TAB_RANK = { race: 0, setup: 0, history: 0, dev: 1, engine: 2, drivers: 2, board: 4, money: 4 };
const ENG_TAB_ROLE = {
  dev: "Como Ingeniero de Equipo trabajás en el box; decidir en qué áreas se invierte el desarrollo es trabajo del Ingeniero Jefe.",
  engine: "Los contratos de motor los negocia el Director Deportivo, no los ingenieros.",
  drivers: "Un ingeniero no elige pilotos: la reserva y la gestión del plantel arrancan como Director Deportivo, y los fichajes como Jefe de Escudería.",
  board: "La directiva le pide resultados al Presidente del Equipo. Hasta entonces, respondés a tu jefe dentro del box.",
  money: "El presupuesto y los costos de la escudería los maneja el Presidente del Equipo."
};
function engTabUnlocked(id) { return engTier() >= (ENG_TAB_RANK[id] || 0); }
function engSetTab(id) { engEnsure().tab = id; engRenderAll(); }
function engSetRaceView(v) { engEnsure().raceView = v; engRenderAll(); }
function engSetSprintMode(v) { engEnsure().sprintMode = v; render(); }
function engRenderAll() {
  const card = document.getElementById("engCenterCard");
  if (!card) return;
  const on = engOn() && engInGame();
  card.classList.toggle("hidden", !on);
  if (!on) return;
  const e = engEnsure();
  const cb = engCostBreakdown();
  const sq = engSetupQuality();
  document.getElementById("engCenterSummary").innerHTML =
    `<span>🏛️ ${engEsc(rank()[0])}</span><span>🧰 Setup ${engEsc(engTrackName())}: <b>${sq}%</b></span>` +
    (engTabUnlocked("engine") ? `<span>🔧 ${engEsc(engMyEngine().name)}</span>` : "") +
    (engTabUnlocked("board") ? `<span>🏛️ Directiva <b>${e.confidence}/100</b></span><span>💼 Costos/GP <b>${engMoney(cb.total)}</b></span>` : "") +
    (engIsSprintWeekend() ? '<span class="eng-badge sprint">⚡ SPRINT</span>' : "");
  document.getElementById("engTabs").innerHTML = ENG_TABS.map(([id, label]) => {
    const ok = engTabUnlocked(id);
    return `<button class="${e.tab === id ? "eng-tab on" : "eng-tab dark"}${ok ? "" : " eng-locked"}" onclick="engSetTab('${id}')" title="${ok ? "" : "Se desbloquea en " + engEsc(rankTiers[ENG_TAB_RANK[id]][0])}">${ok ? "" : "🔒 "}${label}</button>`;
  }).join("");
  const body = document.getElementById("engCenterBody");
  const fn = { race: engTabRace, board: engTabBoard, engine: engTabEngine, dev: engTabDev, drivers: engTabDrivers, setup: engTabSetup, money: engTabMoney, history: engTabHistory }[e.tab] || engTabRace;
  if (!engTabUnlocked(e.tab)) {
    const need = ENG_TAB_RANK[e.tab];
    const ladder = rankTiers.map((r, i) => `<li${i === engTier() ? ' style="color:#ffffff;font-weight:bold"' : ""}>${i <= engTier() ? "✅" : "🔒"} ${engEsc(r[0])}${Object.keys(ENG_TAB_RANK).filter(k => ENG_TAB_RANK[k] === i && i > 0).map(k => " · " + (ENG_TABS.find(t => t[0] === k) || ["", k])[1]).join("")}</li>`).join("");
    body.innerHTML = `<div class="mini-explain"><b>🔒 Se desbloquea al llegar a ${engEsc(rankTiers[need][0])}</b><br>${ENG_TAB_ROLE[e.tab] || ""}<br><span class="small">Te faltan ${formatLicensePoints(Math.max(0, rankTiers[need][1] - s.licensePoints))} pts de licencia.</span></div><p class="small">Qué se abre en cada rango:</p><ul class="small">${ladder}</ul>`;
  } else body.innerHTML = fn();
  // calendario: marcar sprints
  const cal = document.querySelector("#calendar table");
  if (cal) {
    [...cal.rows].slice(1).forEach((row, i) => {
      if (engIsSprintWeekend(i) && row.cells[1] && row.cells[1].innerHTML.indexOf("eng-badge") < 0) row.cells[1].innerHTML += ' <span class="eng-badge sprint">⚡ Sprint</span>';
    });
  }
}
function engTabRace() {
  const e = engEnsure();
  const type = engTrackType();
  const know = e.setup[engTrackName()] || 0;
  const sprint = engIsSprintWeekend();
  const lastPens = (e.history.races.slice(-1)[0] || { top: [] }).top.filter(x => x[4]);
  return `
    <div class="grid">
      <div class="stat"><b>📺 Cómo ver la carrera</b>
        <div style="margin-top:8px"><button class="${e.raceView === "live" ? "" : "dark"}" onclick="engSetRaceView('live')">📺 Ver en vivo</button><button class="${e.raceView === "instant" ? "" : "dark"}" onclick="engSetRaceView('instant')">⚡ Simular al instante</button></div>
        <p class="small">En vivo: vuelta a vuelta, con llamadas de boxes, Safety Car y clima que <strong>cambian el resultado</strong>.</p></div>
      <div class="stat"><b>🏁 Formato del fin de semana</b><p style="margin:6px 0">${sprint ? '<span class="eng-badge sprint">⚡ SPRINT</span> Carrera corta el sábado (8-7-6-5-4-3-2-1) + carrera del domingo.' : "Formato clásico: prácticas, clasificación y carrera."}</p>
        <label class="small">Fines de semana sprint</label>
        <select onchange="engSetSprintMode(this.value)"><option value="auto" ${e.sprintMode === "auto" ? "selected" : ""}>Automático (desde 2021, 3 por año)</option><option value="always" ${e.sprintMode === "always" ? "selected" : ""}>Siempre (3 por año, cualquier época)</option><option value="never" ${e.sprintMode === "never" ? "selected" : ""}>Nunca</option></select>
        <p class="small">${e.sprintMode === "never" ? "Sin sprints." : (e.sprintMode === "auto" && s.season < 2021) ? "En " + s.season + " no hay sprints: llegaron a la F1 en 2021." : "Sprints " + s.season + ": " + engSprintGPs(s.season).map(i => engTrackName(i)).join(", ") + "."}</p></div>
      <div class="stat"><b>🧰 Setup para ${engEsc(engTrackName())}</b> <span class="small">${ENG_TYPE_LABEL[type]}</span>
        ${engBar(engSetupQuality(), 100)}<p class="small">El auto está al ${engSetupQuality()}% · conocimiento ${know}/100 → ${engSetupBonus("race") >= 0 ? "+" : ""}${engSetupBonus("race").toFixed(1)} de ritmo.</p><button class="dark" onclick="engSetTab('setup')">🧰 Ir a ajustar el setup</button></div>
      <div class="stat"><b>⚖️ Comisarios</b><p class="small">Sanciones de <strong>5s o 10s</strong> por agresividad, peleas muy cerradas y condiciones (lluvia, Safety Car). "Presionar" y la salida de boxes agresiva aumentan el riesgo.</p>
        <p class="small">Sanciones de tu equipo este año: <strong>${e.seasonStats.penalties}</strong>${lastPens.length ? " · Última carrera: " + lastPens.map(p => engEsc(p[0]) + " +" + p[4] + "s").join(", ") : ""}</p></div>
    </div>
    ${e.lastSprint && e.lastSprint.key === engKey() ? `<div class="mini-explain"><b>⚡ Sprint de hoy</b><br>Ganó ${engEsc(e.lastSprint.winner)} · Tu equipo: ${e.lastSprint.mine.map(m => engEsc(m.name) + " " + m.res + " (+" + m.pts + ")").join(" · ")}</div>` : ""}`;
}
function engTabBoard() {
  const e = engEnsure();
  const b = e.board;
  const conf = e.confidence;
  const mood = conf >= 75 ? "😄 Muy conforme" : conf >= 50 ? "🙂 Tranquila" : conf >= 30 ? "😐 Preocupada" : "😠 Ultimátum";
  const objs = b && b.season === s.season ? b.objectives.map(o => {
    const ok = engBoardCheck(o);
    return `<div class="driver"><div><b>${engEsc(o.label)}</b><br><span class="small">${engEsc(engBoardProgress(o))}</span></div><span class="pill" style="${ok ? "" : "background:#7f1d1d;color:#fecaca"}">${ok ? "✅ En camino" : "⚠️ En riesgo"}</span></div>`;
  }).join("") : `<p class="small">Los objetivos se fijan al empezar la temporada.</p>`;
  const logs = (e.boardLog || []).slice(-5).reverse().map(l => `<tr><td>${l.season}</td><td>${l.met}/${l.total}</td><td>${l.conf}/100</td></tr>`).join("");
  return `
    <div class="grid">
      <div class="stat"><b>🤝 Confianza de ${s.customTeam && s.customTeam.name === s.team ? "los inversores" : "la directiva"}</b>${engBar(conf, 100, conf < 30 ? "#e3261a" : conf < 50 ? "#f59e0b" : "")}<p class="small">${conf}/100 · ${mood}</p></div>
      <div class="stat"><b>🎚️ Presión</b><p class="small">Prestigio ${b ? b.prestige : 0}/3 · Posición esperada según la parrilla: <strong>P${b ? b.expected : "—"}</strong>. Cuanto más ganás, más te exigen.</p></div>
    </div>
    <h3 class="small">Objetivos ${s.season}</h3>${objs}
    <p class="small">Cada objetivo cumplido: <b>+12</b> de confianza. Cada uno fallado: <b>−${12 + Math.round((b ? b.prestige : 0) * 4)}</b>. Todos cumplidos: bono de presupuesto. Con la confianza en 0 te despiden (o, si el equipo es tuyo, los inversores te cortan la mitad del presupuesto).</p>
    ${logs ? `<table><tr><th>Temporada</th><th>Objetivos</th><th>Confianza</th></tr>${logs}</table>` : ""}`;
}
function engStatBars(st) {
  return `<div class="eng-mini"><span>Potencia ${st.power}</span>${engBar(st.power - 55, 45)}<span>Confiabilidad ${st.rel}</span>${engBar(st.rel - 55, 45, "#22c55e")}<span>Eficiencia ${st.eff}</span>${engBar(st.eff - 55, 45, "#38bdf8")}</div>`;
}
function engTabEngine() {
  const e = engEnsure();
  const my = engMyEngine();
  const endS = e.engine.signedSeason + e.engine.years - 1;
  const locked = engTier() < 2;
  const list = engEngineList().map(x => {
    const st = engEngineStats(x.id);
    const mine = x.id === e.engine.id;
    const btns = locked ? "" : mine
      ? `<button class="dark" onclick="engSignEngine('${x.id}',2)">✍️ Extender 2 años</button>`
      : `<button onclick="engSignEngine('${x.id}',1)">1 año</button><button onclick="engSignEngine('${x.id}',2)">2 años</button><button onclick="engSignEngine('${x.id}',3)">3 años</button>`;
    return `<div class="driver"><div style="flex:1"><b>${engEsc(st.name)}</b> ${mine ? '<span class="pill">TU MOTOR</span>' : ""}<br><span class="small">${formatMoney(st.cost)}/GP · firma ${engMoney(st.cost * 4)} · clientes: ${engEngineClients(x.id)} equipo(s)</span>${engStatBars(st)}</div><div>${btns}</div></div>`;
  }).join("");
  return `
    <div class="grid">
      <div class="stat"><b>🔧 Tu unidad de potencia: ${engEsc(my.name)}</b>${engStatBars(my)}
        <p class="small">Contrato hasta <strong>${endS}</strong> · ${formatMoney(my.cost)} por GP${(e.engine.costMult || 1) > 1 ? " (renovaciones automáticas lo encarecieron)" : ""}.<br>Rendimiento: ${engEngineScore(my) >= 0 ? "+" : ""}${engEngineScore(my).toFixed(1)} de ritmo · en circuitos de motor pesa todavía más.</p></div>
      <div class="stat"><b>🔋 Desarrollo propio de la unidad de potencia</b>
        <p class="small">Los motores se degradan con los años. Invertí para recuperar (máx +10 cada uno). Si cambiás de proveedor perdés la mitad.</p>
        <p class="small">Potencia +${e.puDev.power}/10 · Confiabilidad +${e.puDev.rel}/10</p>
        ${locked ? engLock(2) : `<button onclick="engInvestPU('power')">⚡ Potencia ($12M)</button><button onclick="engInvestPU('rel')">🛡️ Confiabilidad ($12M)</button>`}</div>
    </div>
    <h3 class="small">🏪 Mercado de motores ${s.season}</h3>
    ${locked ? engLock(2) : `<p class="small">Cambiar antes de que venza tu contrato cuesta una rescisión. Los equipos de la IA también cambian de proveedor entre temporadas.</p>`}
    ${list}`;
}
function engTabDev() {
  const e = engEnsure();
  const locked = engTier() < 1;
  const pkgLocked = engTier() < 2;
  const type = engTrackType();
  const pf = engParcFerme();
  const areas = ENG_AREAS.map(a => {
    const lvl = e.attr[a.id] || 0;
    const btn = locked ? "" : pf ? `<span class="small">🔒 Parc fermé</span>` : lvl >= 20 ? `<span class="pill">MÁX</span>` : `<button onclick="engDevelopArea('${a.id}')">Invertir (${engMoney(engAreaCost(a.id))})</button>`;
    return `<div class="driver"><div style="flex:1"><b>${a.name}</b> — ${lvl}/20<br><span class="small">${a.desc}</span>${engBar(lvl, 20)}</div>${btn}</div>`;
  }).join("");
  const win = engWindowOpen();
  const used = e.windowUsed[engKey()];
  return `
    <p class="small">Además de la inversión general del auto (tarjeta 🏭 de abajo), repartí recursos por área. Cada inversión tiene <b>varianza real</b>: a veces rinde de más y a veces la pieza no funciona. Este circuito es <b>${ENG_TYPE_LABEL[type]}</b> → bono de áreas ahora: <b>+${engAttrBonus().toFixed(1)}</b>.</p>
    ${areas}
    <div class="mini-explain"><b>📦 Ventanas de mejoras de mitad de temporada</b> (GP 4 y GP 7)<br>
      ${win ? (used ? "✅ Ya trajiste tu paquete en esta ventana." : `La ventana está <b>ABIERTA</b>. Paquete grande: $25M → normalmente +4 a +10 de rendimiento y +1 en dos áreas… con 15% de chance de que no funcione. ${pkgLocked ? "<br>🔒 Traer paquetes lo decide el " + rankTiers[2][0] + "." : `<br><button onclick="engUpgradePackage()">📦 Traer paquete de mejoras ($25M)</button>`}`) : "Cerrada ahora. Próxima: " + (s.gp < 3 ? "GP 4" : s.gp < 6 ? "GP 7" : "la temporada que viene") + "."}</div>
    <p class="small">📜 Con cada reglamento nuevo las áreas pierden la mitad y el orden de la parrilla se mezcla.</p>`;
}
function engTabDrivers() {
  const e = engEnsure();
  const lineup = myTeamLineup();
  const res = engReserveInfo();
  const mineHtml = lineup.map(d => {
    const f = e.form[d.name] || 0;
    const c = (s.driverContracts || {})[d.name];
    const hired = (s.drivers || []).includes(d.name);
    return `<div class="driver"><div><b>${engEsc(d.name)}</b> ${d.subFor ? `<span class="eng-badge dnf">🚑 reemplaza a ${engEsc(d.subFor)} (${e.injuries[d.subFor]} GP)</span>` : ""}<br>
      <span class="small">Asiento ${d.seat} · Rating ${Math.round(d.rating)} · Forma ${engFormIcon(f)} ${engFormLabel(f)} (${f > 0 ? "+" : ""}${f})${c ? " · contrato hasta " + (c.signedSeason + c.years - 1) : ""} · ${(s.driverPoints || {})[d.name] || 0} pts</span></div>
      ${hired ? `<button class="dark" onclick="fireDriver(${engArg(d.name)})">Liberar</button>` : ""}</div>`;
  }).join("");
  const resOpts = [`<option value="">Genérico (rating ${66 + (s.stars || 1) * 3})</option>`]
    .concat((s.academyDrivers || []).filter(d => d.status !== "loan").map(d => `<option value="${engEsc(d.name)}" ${e.reserve === d.name ? "selected" : ""}>🏫 ${engEsc(d.name)} · ${d.rating}</option>`))
    .concat((e.reservePool || []).map(d => `<option value="${engEsc(d.name)}" ${e.reserve === d.name ? "selected" : ""}>🎓 ${engEsc(d.name)} · ${d.rating}</option>`)).join("");
  const unlocked = unlockedSet().has("drivers");
  let market = "";
  if (unlocked) {
    market = engGridDrivers().slice(0, 12).map(d => {
      const f = e.form[d.name] || 0;
      const tried = e.approached[d.name] === s.season;
      return `<div class="driver"><div><b>${engEsc(d.name)}</b> ${engFormIcon(f)}<br><span class="small">${engEsc(d.team)} · Rating ${Math.round(d.rating)} · Cláusula ${engMoney(engBuyout(d))} · Chance ~${engApproachChance(d)}%</span></div>${tried ? '<span class="small">❌ Dijo que no este año</span>' : `<button onclick="engApproach(${engArg(d.name)})">Ofrecer contrato</button>`}</div>`;
    }).join("");
  }
  const pros = unlocked ? engProspects().map(p => `<div class="driver"><div><b>${engEsc(p.name)}</b> <span class="eng-badge sprint">${p.series}</span><br><span class="small">${p.age} años · Rating ${p.rating} · Potencial ~${p.potential} · Pre-fichaje ${engMoney(p.fee)}</span></div><div><button onclick="engPresign(${engArg(p.name)},'race')">🏁 Titular ${s.season + 1}</button><button class="dark" onclick="engPresign(${engArg(p.name)},'reserve')">💺 Reserva</button></div></div>`).join("") : "";
  const pre = e.presigned.map(p => `<p class="small">📝 ${engEsc(p.name)} (${p.series}, rating ${p.rating}) → ${p.seat === "race" ? "titular" : "reserva"} desde ${p.joinSeason}</p>`).join("");
  return `
    <h3 class="small">🏎️ Tus pilotos esta fecha</h3>${mineHtml}
    <div class="grid"><div><label>💺 Piloto de reserva</label><select onchange="engSetReserve(this.value)">${resOpts}</select>
      <p class="small">Actual: <b>${engEsc(res.name)}</b> (rating ${res.rating}). Si un titular se lesiona, corre él. Con 72+ aporta feedback del simulador al desarrollo y al setup.</p></div></div>
    <h3 class="small">🔍 Mercado de fichajes — pilotos con contrato en otros equipos</h3>
    ${unlocked ? `<p class="small">Pagás la cláusula de rescisión y, si acepta, se viene con vos (su ex equipo sube a un novato). La forma, tu confianza y el nivel de tu equipo pesan en la respuesta.</p>${market}` : engLock(3)}
    <h3 class="small">🎓 Prospectos de F2/F3 — pre-fichaje</h3>
    ${unlocked ? `<p class="small">Asegurá a un chico antes de que quede libre: llega la temporada que viene como titular o como reserva. Máximo 2.</p>${pros || '<p class="small">Ya pre-fichaste a todos los disponibles.</p>'}${pre}` : engLock(3)}`;
}
function engTabSetup() {
  const e = engEnsure();
  const cfg = engSetupCfg();
  const pf = engParcFerme() || s.raceDone;
  const runsMax = engSetupRunsMax();
  const k = e.setup[engTrackName()] || 0;
  const sliders = ENG_SETUP_PARAMS.map(p => {
    const fb = cfg.last ? cfg.last.fb.find(f => f.id === p.id) : null;
    return `<div class="eng-setrow"><div><b>${p.name}</b> <span class="small">(${p.lo} ↔ ${p.hi})</span></div>
      <div class="eng-setctl"><input type="range" min="1" max="10" value="${cfg[p.id]}" ${pf ? "disabled" : ""} oninput="engSetupSet('${p.id}', this.value)"><b id="engSetVal_${p.id}">${cfg[p.id]}</b></div>
      <div class="small eng-setfb">${fb ? engEsc(fb.txt) : "— probá en pista para saber —"}</div></div>`;
  }).join("");
  const rows = trackData.map((t, i) => {
    const kk = e.setup[t.name] || 0;
    return `<tr${i === s.gp ? ' style="color:#ffffff;font-weight:bold"' : ""}><td>${i + 1}</td><td>${engEsc(t.name)}${engIsSprintWeekend(i) ? ' <span class="eng-badge sprint">⚡</span>' : ""}</td><td class="small">${ENG_TYPE_LABEL[ENG_TRACK_TYPE[t.name] || "balanced"]}</td><td style="min-width:110px">${engBar(kk, 100)}</td><td>${kk}</td></tr>`;
  }).join("");
  const q = engSetupQuality();
  return `
    <div class="mini-explain"><b>🧰 Setup para ${engEsc(engTrackName())}</b> · ${ENG_TYPE_LABEL[engTrackType()]}<br>
      <span class="small">Mové las 3 perillas, salí a pista y leé lo que te dice el piloto. Tenés <b>${Math.max(0, runsMax - cfg.runs)} de ${runsMax}</b> salidas este fin de semana. El setup queda fijo en la clasificación (parc fermé).</span></div>
    ${sliders}
    <div style="margin:10px 0">${pf ? `<span class="notice">🔒 Setup fijado para esta carrera${s.raceDone ? " (ya se corrió)" : " (parc fermé)"}.</span>` : `<button onclick="engSetupRun()" ${cfg.runs >= runsMax ? "disabled" : ""}>🏎️ Salir a pista a probar (${Math.max(0, runsMax - cfg.runs)} restantes)</button>`}</div>
    ${cfg.last ? `<div class="grid"><div class="stat">⏱️ Última vuelta<b>${cfg.last.lap}</b></div><div class="stat">🎯 Cómo siente el auto<b>${cfg.last.q}%</b></div><div class="stat">🏁 Ritmo por el setup<b>${engSetupBonus("race") >= 0 ? "+" : ""}${engSetupBonus("race").toFixed(1)}</b></div></div>` : `<p class="small">Sin probar, el auto sale con el setup de arriba a ciegas.</p>`}
    <h3 class="small">📚 Conocimiento de cada circuito</h3>
    <p class="small">Sube cada vez que corrés en un circuito (más si el setup estaba bien). Con más conocimiento el piloto te da pistas más precisas y tenés una salida extra (desde 50). Con un reglamento nuevo vuelve a cero para todos. En ${engEsc(engTrackName())}: <b>${k}/100</b>.</p>
    <div style="overflow-x:auto"><table><tr><th>#</th><th>Circuito</th><th>Tipo</th><th>Conocimiento</th><th></th></tr>${rows}</table></div>`;
}
function engTabMoney() {
  const e = engEnsure();
  const b = engCostBreakdown();
  const inc = engIncomeEstimate();
  const net = engR1(inc - b.total);
  return `
    <div class="grid">
      <div class="stat">💰 Presupuesto<b>${engMoney(s.money)}</b></div>
      <div class="stat">📥 Ingresos por GP<b>${engMoney(inc)}</b></div>
      <div class="stat">📤 Costos por GP<b>${engMoney(b.total)}</b></div>
      <div class="stat">📊 Neto por GP<b style="color:${net >= 0 ? "#86efac" : "#f87171"}">${net >= 0 ? "+" : ""}${engMoney(net)}</b></div>
    </div>
    <table><tr><th>Costo por Gran Premio</th><th>$</th></tr>${b.items.map(x => `<tr><td>${x.label}</td><td>${engMoney(x.v)}</td></tr>`).join("")}<tr><td><b>Total</b></td><td><b>${engMoney(b.total)}</b></td></tr></table>
    <p class="small">Cuanto más larga tu carrera, más caro todo: la operación crece con cada temporada, los pilotos piden más con los años y dominar sale caro (sobrecosto por títulos recientes). Al final de cada temporada cobrás el <b>premio de Constructores</b> según tu posición. Si quedás en rojo, la directiva pierde confianza cada GP.</p>`;
}
function engTabHistory() {
  const e = engEnsure();
  const seasons = e.history.seasons.slice().reverse().map(x => `<tr${x.pos === 1 ? ' style="color:#ffffff;font-weight:bold"' : ""}><td>${x.season}</td><td>${engEsc(x.team)}</td><td>P${x.pos}</td><td>${x.pts}</td><td>${x.wins}</td><td>${x.podiums}</td><td>${engEsc(x.champ)}</td><td>${engEsc(x.champTeam)}</td><td>${engEsc(x.engine || "")}</td></tr>`).join("");
  const yrs = [...new Set(e.history.races.map(r => r.s))];
  if (engHistSeason == null || !yrs.includes(engHistSeason)) engHistSeason = yrs.length ? yrs[yrs.length - 1] : null;
  const races = e.history.races.map((r, i) => ({ r, i })).filter(o => o.r.s === engHistSeason).reverse().map(({ r, i }) => {
    const win = r.top[0] ? r.top[0][0] + " (" + r.top[0][1] + ")" : "—";
    const open = engHistOpen === i;
    const grid = open ? `<table class="eng-hist-grid"><tr><th>Pos</th><th>Piloto</th><th>Equipo</th><th>Pts</th></tr>${r.top.map(x => `<tr${x[5] ? ' style="color:#ffffff;font-weight:bold"' : ""}><td>${x[2]}</td><td>${engEsc(x[0])}${x[4] ? ` <span class="eng-badge pen">+${x[4]}s</span>` : ""}</td><td>${engEsc(x[1])}</td><td>${x[3]}</td></tr>`).join("")}</table>` : "";
    const lk = r.s + "_" + r.g;
    const hasLaps = (e.lapHist || []).some(x => x.key === lk);
    return `<div class="driver" style="flex-direction:column;align-items:stretch;cursor:pointer" onclick="engHistToggle(${i})"><div>${hasLaps ? `<button class="lv-btn red" style="float:right;margin:0!important;padding:6px 12px!important;font-size:12px!important" onclick="event.stopPropagation();engHistLaps('${lk}')">📊 Vuelta por vuelta</button>` : ""}<b>GP ${r.g + 1} · ${engEsc(r.t)}</b> ${r.sp ? '<span class="eng-badge sprint">⚡</span>' : ""}${r.sc ? " 🚨" : ""}${/lluvia|Lluvia/.test(r.w) ? " 🌧️" : ""}<br><span class="small">🏆 ${engEsc(win)} · Tu equipo: ${r.mine.map(m => engEsc(m[0]) + " " + m[1] + " (+" + m[2] + ")").join(" · ")} ${open ? "▲" : "▼ ver parrilla"}</span></div>${grid}</div>`;
  }).join("");
  const best = e.history.seasons.reduce((a, x) => (!a || x.pos < a.pos || (x.pos === a.pos && x.pts > a.pts)) ? x : a, null);
  return `
    <div class="grid">
      <div class="stat">📅 Temporadas registradas<b>${e.history.seasons.length}</b></div>
      <div class="stat">🏁 Carreras registradas<b>${e.history.races.length}</b></div>
      <div class="stat">🏆 Mejor temporada<b>${best ? best.season + " · P" + best.pos : "—"}</b></div>
      <div class="stat">🥇 Títulos de Constructores<b>${e.history.seasons.filter(x => x.pos === 1).length}</b></div>
    </div>
    <h3 class="small">📅 Tu dinastía, temporada por temporada</h3>
    ${seasons ? `<div style="overflow-x:auto"><table><tr><th>Año</th><th>Equipo</th><th>Const.</th><th>Pts</th><th>Vict.</th><th>Podios</th><th>Campeón de pilotos</th><th>Campeón de constructores</th><th>Motor</th></tr>${seasons}</table></div>` : '<p class="small">Todavía no terminaste ninguna temporada.</p>'}
    <h3 class="small">🏁 Historial de carreras ${yrs.length ? `<select style="width:auto;display:inline-block;padding:4px 8px" onchange="engHistSeason=parseInt(this.value);engHistOpen=null;engRenderAll()">${yrs.map(y => `<option ${y === engHistSeason ? "selected" : ""}>${y}</option>`).join("")}</select>` : ""}</h3>
    ${races || '<p class="small">Todavía no corriste ninguna carrera con el Centro del Ingeniero.</p>'}
    <p class="small">El 🏛️ Salón de la Fama y los 📊 Récords del equipo siguen más abajo.</p>`;
}
function engHistToggle(i) { engHistOpen = engHistOpen === i ? null : i; engRenderAll(); }

/* ---------- Academia mejorada ---------- */
function engRenderAcademyPlus() {
  const body = document.getElementById("academyBody");
  if (!body || !academyUnlocked() || !engOn()) return;
  const e = engEnsure();
  const recruited = s.academyDrivers || [];
  recruited.forEach(engAcademyFix);
  if (!s.scoutCountry) s.scoutCountry = s.country || "Argentina";
  const scouted = scoutCandidateNames(s.scoutCountry, s.season);
  const countryPopVal = (s.countryPop && s.countryPop[s.scoutCountry]) ?? 30;
  const available = scouted.filter(n => !recruited.find(d => d.name === n) && !(s.drivers || []).includes(n));
  let html = `<div class="grid"><div><label>🌎 País a scoutear</label>
      <select onchange="s.scoutCountry=this.value;render()">${Object.keys(scoutFirstNames).map(c => `<option value="${c}" ${c === s.scoutCountry ? "selected" : ""}>${c}</option>`).join("")}</select></div></div>
    <p class="small">Tu popularidad en ${engEsc(s.scoutCountry)}: <b>${Math.round(countryPopVal)}/100</b>. Fichás chicos desde los <b>14 años</b>: crecen solos cada temporada (más rápido cuanto más jóvenes), podés entrenarlos, cederlos a préstamo, usarlos de reserva o subirlos a F1 con 75+.</p>`;
  if (recruited.length) {
    html += `<h3 class="small">Tus pilotos de academia</h3>` + recruited.map(d => {
      const st = d.status === "loan" ? "🔁 Cedido a préstamo" : e.reserve === d.name ? "💺 Reserva del equipo" : "🏫 En la academia";
      const q = engArg(d.name);
      return `<div class="driver"><div><b>${engEsc(d.name)}</b> <span class="small">${d.age} años · ${st}</span><br>
        <span class="small">Rating ${d.rating}/100 · Potencial ~${d.potential}${d.rating >= 75 ? " · ✅ Listo para F1" : " · necesita 75+ para debutar"}</span>${engBar(d.rating, 100)}</div>
        <div>${d.status === "loan" ? "" : `<button class="dark" onclick="trainAcademyDriver(${q})">🏋️ Entrenar ($4M)</button><button class="dark" onclick="engLoanAcademy(${q})">🔁 Préstamo</button>${e.reserve === d.name ? "" : `<button class="dark" onclick="engSetReserve(${q})">💺 Reserva</button>`}${d.rating >= 75 ? `<button onclick="promoteAcademyDriver(${q})">🚀 Promover a F1</button>` : ""}`}</div></div>`;
    }).join("");
  }
  if (available.length) {
    html += `<h3 class="small">Promesas disponibles (14 a 17 años)</h3>` + available.map(n => `<div class="driver"><div><b>${engEsc(n)}</b><br><span class="small">Prospecto de karting · rating inicial variable</span></div><button onclick="recruitAcademyDriver(${engArg(n)})">Fichar ($8M)</button></div>`).join("");
  }
  body.innerHTML = html;
}

/* ---------- Patrocinadores con objetivos ---------- */
function engRenderSponsorsPlus() {
  const box = document.getElementById("sponsorBody");
  if (!box || !engOn() || !unlockedSet().has("sponsor")) return;
  const e = engEnsure();
  const active = new Set(s.activeSponsors || []);
  const terms = s.sponsorTerms || {};
  const totalPerGP = sponsorPool.filter(sp => active.has(sp.id)).reduce((a, sp) => a + (terms[sp.id]?.perGP ?? sp.perGP), 0);
  box.innerHTML = `<p class="small">Ingreso actual por sponsors: <b>+${formatMoney(totalPerGP)} por GP</b> (${active.size}/2 firmados). Cada uno tiene un <b>objetivo claro</b>: cumplirlo da bono y renovaciones con aumento; fallarlo baja su satisfacción y pueden irse.</p>` +
    sponsorPool.map(sp => {
      const has = active.has(sp.id);
      const tt = terms[sp.id];
      const perGP = tt?.perGP ?? sp.perGP, signBonus = tt?.signBonus ?? sp.signBonus;
      const stars = "⭐".repeat(sp.stars) + "☆".repeat(5 - sp.stars);
      const goal = engSponsorGoal(sp);
      const h = typeof e.sponsorHappy[sp.id] === "number" ? e.sponsorHappy[sp.id] : 60;
      const met = engSponsorGoalMet(goal);
      const btn = has ? `<button onclick="dropSponsor('${sp.id}')">Terminar contrato</button>` : `<button onclick="signSponsor('${sp.id}')">Negociar y firmar</button>`;
      return `<div class="driver"><div style="flex:1"><b>${engEsc(sp.name)}</b> ${stars}<br><span class="small">${engEsc(sp.desc)}</span><br>
        <span class="small">🎯 Objetivo: <b>${goal.label}</b>${has ? (met ? " · ✅ cumpliendo" : " · ⚠️ no cumplido todavía") : ""}</span><br>
        <span class="small">+${formatMoney(perGP)} por GP · bono de firma ${formatMoney(signBonus)} · +${sp.pop} popularidad${tt?.guaranteed ? " · 🔒 garantizado 2 temporadas" : ""}</span>
        ${has ? `<div class="small">Satisfacción ${h}/100</div>${engBar(h, 100, h < 30 ? "#e3261a" : h < 55 ? "#f59e0b" : "#22c55e")}` : ""}</div>${has ? '<span class="pill">FIRMADO</span>' : ""}${btn}</div>`;
    }).join("");
}
const _engOrigRenderSponsors = renderSponsors;
renderSponsors = function () {
  _engOrigRenderSponsors.apply(this, arguments);
  try { engRenderSponsorsPlus(); } catch (err) { console.warn(err); }
};
const _engOrigRenderAcademy = renderAcademy;
renderAcademy = function () {
  _engOrigRenderAcademy.apply(this, arguments);
  try { engRenderAcademyPlus(); } catch (err) { console.warn(err); }
};
const _engOrigSignSponsor = signSponsor;
signSponsor = function (id) {
  _engOrigSignSponsor(id);
  const sp = sponsorPool.find(x => x.id === id);
  const box = document.getElementById("sponsorBody");
  if (sp && box && engOn() && box.innerHTML.indexOf("Negociación con") >= 0) {
    box.querySelector(".mini-explain").innerHTML += `<br><span class="small">🎯 Su objetivo si firmás: <b>${engSponsorGoal(sp).label}</b></span>`;
  }
};
const _engOrigNegotiateSponsor = negotiateSponsor;
negotiateSponsor = function (mode) {
  const id = s._negotiatingSponsor;
  const had = (s.activeSponsors || []).includes(id);
  _engOrigNegotiateSponsor(mode);
  if (engOn() && !had && (s.activeSponsors || []).includes(id)) { engEnsure().sponsorHappy[id] = 60; engRoundMoney(); }
};

/* ---------- arranque ---------- */
try { engRenderSetupExtras(); } catch (err) { console.warn(err); }
