/* =====================================================================================
   FAWIWE · CALENDARIO QUE CAMBIA CADA TEMPORADA
   - Pool de circuitos reales con su cantidad de vueltas real de carrera y récord de vuelta.
   - Cada temporada se arman 10 fechas distintas (según los circuitos que existían ese año).
   - Mónaco, Silverstone y Monza casi siempre están; el resto rota. Abu Dhabi cierra desde 2009.
   ===================================================================================== */
const CAL_POOL = [
  // n, laps, rec, from, to, icon, tipo, adelantar, desgaste, clima, nota, curvas, minis, era, país
  { n: "Bahréin", laps: 57, rec: "1:31.447", from: 2004, to: 9999, icon: "🏜️", type: "power", ov: "fácil", wear: 1.3, wv: 0.7, note: "Sakhir: noche en el desierto, frenadas fuertes y mucha degradación trasera.", c: ["Curva 1", "Curva 4", "Curva 10", "Curva 11"], m: [["trkLaunch", "Largada bajo las luces de Sakhir"], ["trkDrs", "Tres zonas de DRS"], ["trkTemp", "Arena y calor: cuidá las gomas"], ["trkWall", "Frenada de la Curva 10"]], era: "en el desierto de Sakhir", country: "Emiratos Árabes" },
  { n: "Arabia Saudita", laps: 50, rec: "1:30.734", from: 2021, to: 9999, icon: "🌴", type: "power", ov: "medio", wear: 0.9, wv: 0.7, note: "Jeddah: el callejero más rápido del mundo, muros a centímetros.", c: ["Curva 1", "Curva 13", "Curva 22", "Curva 27"], m: [["trkDodge", "Muros a 250 km/h"], ["trkDrs", "DRS en la recta de la costanera"], ["trkEsses", "Las eses ciegas del sector 1"], ["trkSide", "Ataque en la Curva 1"]], era: "en la Corniche de Jeddah", country: "Emiratos Árabes" },
  { n: "Australia", laps: 58, rec: "1:19.813", from: 1985, to: 9999 },
  { n: "Japón", laps: 53, rec: "1:30.983", from: 1987, to: 9999 },
  { n: "China", laps: 56, rec: "1:32.238", from: 2004, to: 9999, icon: "🐉", type: "balanced", ov: "medio-alto", wear: 1.2, wv: 1.0, note: "Shanghái: la Curva 1 interminable y la recta más larga del año.", c: ["Curva 1", "Curva 6", "Curva 13", "Horquilla 14"], m: [["trkBand", "La Curva 1 que nunca termina"], ["trkSlip", "Rebufo en la recta de 1,2 km"], ["trkWall", "Frenada de la horquilla 14"], ["trkSide", "Ataque en la Curva 6"]], era: "en Shanghái", country: "China" },
  { n: "Miami", laps: 57, rec: "1:29.708", from: 2022, to: 9999, icon: "🌊", type: "balanced", ov: "medio", wear: 1.1, wv: 1.1, note: "Miami: calor, humedad y una chicana lentísima entre muros.", c: ["Curva 1", "Curva 11", "Curva 14", "Curva 17"], m: [["trkTemp", "Calor de Florida: cuidá las gomas"], ["trkDrs", "DRS en la recta de atrás"], ["trkDodge", "La chicana entre muros"], ["trkLaunch", "Largada frente al estadio"]], era: "alrededor del Hard Rock Stadium", country: "Estados Unidos" },
  { n: "San Marino", laps: 62, rec: "1:20.411", from: 1981, to: 2006, icon: "🏰", type: "aero", ov: "difícil", wear: 1.0, wv: 1.0, note: "Imola: Tamburello, Acque Minerali y Rivazza. Historia pura.", c: ["Tamburello", "Tosa", "Acque Minerali", "Rivazza"], m: [["trkEsses", "Variante Alta"], ["trkWall", "Frenada de la Tosa"], ["trkBand", "Piratella a fondo"], ["trkSide", "Ataque en Rivazza"]], era: "en Imola", country: "Italia" },
  { n: "Emilia-Romaña", laps: 63, rec: "1:15.484", from: 2020, to: 2025, icon: "🏰", type: "aero", ov: "difícil", wear: 1.0, wv: 1.1, note: "Imola volvió: estrecha, vieja escuela, casi no se puede pasar.", c: ["Tamburello", "Tosa", "Acque Minerali", "Rivazza"], m: [["trkEsses", "Variante Alta"], ["trkWall", "Frenada de la Tosa"], ["trkWet", "Lluvia en Imola"], ["trkSide", "Ataque en Tamburello"]], era: "en Imola", country: "Italia" },
  { n: "Mónaco", laps: 78, rec: "1:12.909", from: 1950, to: 9999, fixed: true },
  { n: "Canadá", laps: 70, rec: "1:13.078", from: 1978, to: 9999 },
  { n: "España", laps: 66, rec: "1:16.330", from: 1991, to: 9999 },
  { n: "Austria", laps: 71, rec: "1:05.619", from: 1997, to: 9999, icon: "🏔️", type: "power", ov: "fácil", wear: 1.0, wv: 1.2, note: "Red Bull Ring: vuelta cortísima en las montañas, cuidado con los límites de pista.", c: ["Curva 1", "Curva 3", "Curva 4", "Rindt"], m: [["trkWall", "Frenada de la Curva 3 en subida"], ["trkDrs", "DRS en las rectas de la montaña"], ["trkLaunch", "Largada cuesta arriba"], ["trkSide", "Ataque en la Curva 4"]], era: "en las montañas de Spielberg", country: "Alemania" },
  { n: "Gran Bretaña", laps: 52, rec: "1:27.097", from: 1950, to: 9999, fixed: true },
  { n: "Hungría", laps: 70, rec: "1:16.627", from: 1986, to: 9999, icon: "🌻", type: "mech", ov: "difícil", wear: 1.1, wv: 0.9, note: "Hungaroring: \"Mónaco sin muros\", curvas lentas y calor de verano.", c: ["Curva 1", "Curva 2", "Curva 4", "Curva 11"], m: [["trkSimon", "Curvas encadenadas de memoria"], ["trkTemp", "Calor del verano húngaro"], ["trkPit", "La carrera se gana en boxes"], ["trkSide", "Única chance: la Curva 1"]], era: "en el Hungaroring", country: "Alemania" },
  { n: "Bélgica", laps: 44, rec: "1:46.286", from: 1983, to: 9999 },
  { n: "Países Bajos", laps: 72, rec: "1:11.097", from: 1952, to: 2026, skip: [1986, 2020], icon: "🧡", type: "aero", ov: "difícil", wear: 1.1, wv: 1.2, note: "Zandvoort: dunas, peraltes y una marea naranja en las tribunas.", c: ["Tarzan", "Hugenholtz", "Scheivlak", "Arie Luyendyk"], m: [["trkBand", "El peralte de Arie Luyendyk"], ["trkEsses", "Scheivlak entre las dunas"], ["trkWall", "Frenada en Tarzan"], ["trkWet", "Viento y lluvia del Mar del Norte"]], era: "entre las dunas de Zandvoort", country: "Países Bajos" },
  { n: "Italia", laps: 53, rec: "1:21.046", from: 1950, to: 9999, fixed: true },
  { n: "Azerbaiyán", laps: 51, rec: "1:43.009", from: 2016, to: 9999, icon: "🏙️", type: "power", ov: "fácil", wear: 0.9, wv: 0.9, note: "Bakú: la curva del castillo y una recta de 2 km. Caos asegurado.", c: ["Curva 1", "Curva 8 (castillo)", "Curva 15", "Curva 16"], m: [["trkDodge", "La curva del castillo"], ["trkSlip", "Rebufo en la recta de 2 km"], ["trkWall", "Frenada de la Curva 1"], ["trkPit", "Safety Car: ¡a boxes!"]], era: "en las calles de Bakú", country: "Emiratos Árabes" },
  { n: "Singapur", laps: 62, rec: "1:34.486", from: 2008, to: 9999 },
  { n: "Estados Unidos", laps: 56, rec: "1:36.169", from: 2012, to: 9999, icon: "🤠", type: "balanced", ov: "medio-alto", wear: 1.2, wv: 1.0, note: "Austin: la subida a la Curva 1 y eses tipo Silverstone.", c: ["Curva 1", "Curva 3-6", "Curva 12", "Curva 19"], m: [["trkLaunch", "La subida a la Curva 1"], ["trkEsses", "Las eses del sector 1"], ["trkDrs", "DRS en la recta de atrás"], ["trkSide", "Ataque en la Curva 12"]], era: "en Austin, Texas", country: "Estados Unidos" },
  { n: "México", laps: 71, rec: "1:17.774", from: 2015, to: 9999, icon: "🌮", type: "power", ov: "medio", wear: 0.9, wv: 0.9, note: "Hermanos Rodríguez: 2.200 m de altura, aire finito y el estadio de fondo.", c: ["Curva 1", "Curva 4", "Foro Sol", "Peraltada"], m: [["trkSlip", "Rebufo en la recta más larga"], ["trkTemp", "Aire finito: frenos al límite"], ["trkWall", "Frenada de la Curva 1"], ["trkSide", "Ataque en el Foro Sol"]], era: "en el Autódromo Hermanos Rodríguez", country: "México" },
  { n: "Brasil", laps: 71, rec: "1:10.540", from: 1990, to: 9999, icon: "🇧🇷", type: "balanced", ov: "fácil", wear: 1.0, wv: 1.3, note: "Interlagos: la S de Senna, lluvia repentina y carreras locas.", c: ["S de Senna", "Descida do Lago", "Junção", "Subida dos Boxes"], m: [["trkWet", "Tormenta en San Pablo"], ["trkSide", "Ataque en la S de Senna"], ["trkSlip", "Rebufo en la subida de boxes"], ["trkLaunch", "Largada en Interlagos"]], era: "en Interlagos", country: "Brasil" },
  { n: "Las Vegas", laps: 50, rec: "1:34.876", from: 2023, to: 9999, icon: "🎲", type: "power", ov: "fácil", wear: 0.8, wv: 0.6, note: "Las Vegas: de noche, por el Strip, con gomas que no entran en temperatura.", c: ["Curva 1", "Curva 5", "Curva 12", "Curva 14"], m: [["trkTemp", "Gomas frías en la noche del desierto"], ["trkSlip", "Rebufo por el Strip"], ["trkDrs", "DRS frente a los casinos"], ["trkWall", "Frenada de la Curva 14"]], era: "por el Strip de Las Vegas", country: "Estados Unidos" },
  { n: "Qatar", laps: 57, rec: "1:22.384", from: 2021, to: 9999, skip: [2022], icon: "🌙", type: "aero", ov: "medio", wear: 1.4, wv: 0.6, note: "Lusail: curvas rápidas sin fin, calor extremo y gomas al límite.", c: ["Curva 1", "Curva 6", "Curva 12-14", "Curva 16"], m: [["trkEsses", "Curvas rápidas encadenadas"], ["trkTemp", "Calor extremo: gomas al límite"], ["trkBand", "Curva 12 a fondo"], ["trkPit", "Paradas obligatorias"]], era: "en Lusail", country: "Emiratos Árabes" },
  { n: "Abu Dhabi", laps: 58, rec: "1:26.103", from: 2009, to: 9999, finale: true },
  // clásicos que pueden volver
  { n: "Argentina", laps: 72, rec: "1:27.981", from: 1995, to: 1998, back: true, icon: "🧉", type: "mech", ov: "difícil", wear: 1.0, wv: 1.0, note: "Autódromo Oscar Gálvez: el regreso a Buenos Aires con las tribunas llenas.", c: ["Curva 1", "Ascari", "Senna", "Tobogán"], m: [["trkSimon", "El mixto de Buenos Aires"], ["trkSide", "Ataque en la Curva 1"], ["trkTemp", "Calor porteño"], ["trkLaunch", "Largada frente a la hinchada"]], era: "en Buenos Aires", country: "Argentina" },
  { n: "Malasia", laps: 56, rec: "1:34.223", from: 1999, to: 2017, back: true, icon: "🌧️", type: "balanced", ov: "fácil", wear: 1.2, wv: 1.4, note: "Sepang: calor, humedad y tormentas tropicales a la tarde.", c: ["Curva 1", "Curva 4", "Curva 9", "Curva 15"], m: [["trkWet", "Tormenta tropical"], ["trkTemp", "Humedad infernal"], ["trkSlip", "Rebufo en la recta doble"], ["trkSide", "Ataque en la Curva 1"]], era: "en Sepang", country: "Singapur" },
  { n: "Turquía", laps: 58, rec: "1:24.770", from: 2005, to: 2011, more: [2020, 2021], back: true, icon: "🌀", type: "aero", ov: "medio-alto", wear: 1.1, wv: 1.0, note: "Istanbul Park: la mítica Curva 8 de cuatro vértices.", c: ["Curva 1", "Curva 8", "Curva 9", "Curva 12"], m: [["trkBand", "La Curva 8 de cuatro vértices"], ["trkWall", "Frenada de la Curva 12"], ["trkDrs", "DRS en la recta de atrás"], ["trkSide", "Ataque en la Curva 1"]], era: "en Istanbul Park", country: "Alemania" },
  { n: "Portugal", laps: 66, rec: "1:18.750", from: 2020, to: 2021, back: true, icon: "🎢", type: "aero", ov: "medio", wear: 1.1, wv: 1.1, note: "Portimão: una montaña rusa con subidas y bajadas ciegas.", c: ["Curva 1", "Curva 5", "Curva 11", "Curva 15"], m: [["trkBand", "La bajada ciega de la Curva 11"], ["trkEsses", "Montaña rusa"], ["trkWall", "Frenada de la Curva 1"], ["trkSide", "Ataque en la recta"]], era: "en el Algarve", country: "España" },
  { n: "Alemania", laps: 67, rec: "1:13.780", from: 1977, to: 2019, skip: [1985, 2007, 2015, 2017], back: true, icon: "🍺", type: "power", ov: "fácil", wear: 1.0, wv: 1.2, note: "Hockenheim: la horquilla, el Motodrom y lluvia que aparece de la nada.", c: ["Curva 1", "Horquilla", "Sachs", "Motodrom"], m: [["trkWall", "Frenada de la horquilla"], ["trkSlip", "Rebufo en la Parabolika"], ["trkWet", "Lluvia en el Motodrom"], ["trkSide", "Ataque en la horquilla"]], era: "en Hockenheim", country: "Alemania" },
  { n: "Francia", laps: 70, rec: "1:15.377", from: 1991, to: 2008, back: true, icon: "🥖", type: "aero", ov: "difícil", wear: 1.1, wv: 1.0, note: "Magny-Cours: horquilla Adelaide y curvas técnicas en el campo francés.", c: ["Estoril", "Adelaide", "Nürburgring", "Lycée"], m: [["trkWall", "Frenada en Adelaide"], ["trkSimon", "El sector técnico"], ["trkTemp", "Asfalto abrasivo"], ["trkSide", "Ataque en Adelaide"]], era: "en Magny-Cours", country: "Francia" }
];
// circuitos del calendario original: ya tienen sus datos en los otros módulos
const CAL_CLASSIC = ["Australia", "Japón", "Italia", "Mónaco", "España", "Canadá", "Gran Bretaña", "Bélgica", "Singapur", "Abu Dhabi"];

function calHash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function calRunsIn(c, y) {
  if ((c.skip || []).includes(y)) return false;
  if ((c.more || []).includes(y)) return true;
  return y >= c.from && y <= c.to;
}
function calForSeason(y) {
  y = parseInt(y, 10) || 2026;
  const seed = String((s && s.calSeed) || 1);
  const real = CAL_POOL.filter(c => calRunsIn(c, y));
  // en el futuro (después de 2026) los clásicos pueden volver al calendario
  const backs = y > 2026 ? CAL_POOL.filter(c => c.back && !real.includes(c) && calHash("back" + c.n + y + seed) % 100 < 13).slice(0, 2) : [];
  let elig = real.concat(backs);
  if (elig.length < 10) {
    const rest = CAL_POOL.filter(c => !elig.includes(c)).sort((a, b) => Math.min(Math.abs(a.from - y), Math.abs(a.to - y)) - Math.min(Math.abs(b.from - y), Math.abs(b.to - y)));
    elig = elig.concat(rest.slice(0, 10 - elig.length));
  }
  const pick = [];
  const fin = elig.find(c => c.finale);
  elig.filter(c => c.fixed).forEach(c => { if (calHash("fx" + c.n + y + seed) % 100 < 88) pick.push(c); });
  if (fin) pick.push(fin);
  const others = elig.filter(c => !pick.includes(c)).map(c => ({ c, r: calHash("r" + c.n + y + seed) + (c.back ? 0 : 0) })).sort((a, b) => a.r - b.r).map(o => o.c);
  // los que vuelven tienen prioridad para que se note
  backs.forEach(b => { if (pick.length < 10 && !pick.includes(b)) pick.push(b); });
  others.forEach(c => { if (pick.length < 10 && !pick.includes(c)) pick.push(c); });
  const order = c => c.finale ? 999 : CAL_POOL.indexOf(c);
  return pick.slice(0, 10).sort((a, b) => order(a) - order(b));
}

// completa las tablas de los otros módulos con los circuitos nuevos
(function calRegister() {
  CAL_POOL.forEach(c => {
    if (!c.icon) return;
    try { if (typeof circuitTraits !== "undefined" && !circuitTraits[c.n]) circuitTraits[c.n] = { overtake: c.ov, tireWear: c.wear, weatherVar: c.wv, note: c.note }; } catch (e) {}
    try { if (typeof ENG_TRACK_TYPE !== "undefined" && !ENG_TRACK_TYPE[c.n]) ENG_TRACK_TYPE[c.n] = c.type; } catch (e) {}
    try { if (typeof EM_CORNERS !== "undefined" && !EM_CORNERS[c.n]) EM_CORNERS[c.n] = c.c; } catch (e) {}
    try { if (typeof FAME_TRACK_COUNTRY !== "undefined" && !FAME_TRACK_COUNTRY[c.n]) FAME_TRACK_COUNTRY[c.n] = c.country; } catch (e) {}
    try { if (typeof FW_TRACK_MINI !== "undefined" && !FW_TRACK_MINI[c.n]) FW_TRACK_MINI[c.n] = { icon: c.icon, v: c.m.concat([["era", c.era]]) }; } catch (e) {}
  });
})();

let calAppliedFor = null;
function calApply(force) {
  if (typeof s === "undefined" || !s || typeof trackData === "undefined") return;
  if (!s.calSeed) s.calSeed = 1 + Math.floor(Math.random() * 99999);
  const key = s.season + "_" + s.calSeed;
  if (!force && calAppliedFor === key) return;
  const prevNames = trackData.map(t => t.name);
  const list = calForSeason(s.season);
  trackData.splice(0, trackData.length, ...list.map(c => ({ name: c.n, laps: c.laps, record: c.rec })));
  calAppliedFor = key;
  // aviso de calendario nuevo (una vez por temporada)
  try {
    if (s.team && s._calNotice !== s.season && typeof add === "function") {
      s._calNotice = s.season;
      const inn = list.filter(c => !prevNames.includes(c.n)).map(c => c.n);
      const out = prevNames.filter(n => !list.find(c => c.n === n));
      const backs = list.filter(c => c.back && s.season > 2026).map(c => c.n);
      let msg = "🗓️ Calendario " + s.season + ": " + list.map(c => c.n).join(" · ") + ".";
      if (s._calPrevSeason && inn.length) msg += " Entran: " + inn.join(", ") + "." + (out.length ? " Salen: " + out.join(", ") + "." : "");
      if (backs.length) msg += " 🔙 ¡Vuelve" + (backs.length > 1 ? "n" : "") + " " + backs.join(" y ") + "!";
      add(msg);
      s._calPrevSeason = s.season;
    }
  } catch (e) {}
}
(function () {
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { try { calApply(); } catch (e) { console.warn(e); } return rd.apply(this, arguments); };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () { const r = ng.apply(this, arguments); try { calApply(); } catch (e) {} return r; };
  try { calApply(); } catch (e) {}
})();

/* =====================================================================================
   EQUILIBRIO: tu manejo pesa un poco más y cada carrera tiene algo de caos
   (un auto lento puede robar puntos en una carrera loca; ganar con el mejor auto no es automático).
   ===================================================================================== */
const FW_BAL = { skill: 0.12, chaos: 5, wet: 1.5, lucky: 8, unlucky: 5, spike: 11 };
(function () {
  const o = window.simulateGrid;
  if (typeof o !== "function") return;
  window.simulateGrid = function (kind) {
    const r0 = o.apply(this, arguments);
    if (!Array.isArray(r0) || s.player2 || (kind !== "race" && kind !== "quali")) return r0;
    const r = r0.map(x => Object.assign({}, x)); // copias: nunca tocar la grilla guardada en caché
    try {
      const raw = kind === "race" ? (s.raceMiniScore ?? s.sessionMiniScore ?? 50) : (s.qualiMiniScore ?? s.sessionMiniScore ?? 50);
      const wet = s.weather && s.weather.wet ? FW_BAL.wet : 1;
      const sc = kind === "race" && s._safetyCarThisRace ? 1.3 : 1;
      const key = s.season + "_" + s.gp + "_" + kind + (s._dlSprint ? "_spr" : "");
      r.forEach(x => {
        let h = 0; const str = "bal" + x.name + key; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
        const u = ((Math.abs(h) % 1000) / 1000) - 0.5;
        x.score += u * 2 * FW_BAL.chaos * (kind === "race" ? 1 : 0.6) * wet * sc;
        if (x.mine) x.score += (Math.max(0, Math.min(100, raw)) - 50) * FW_BAL.skill * (x.seat === 1 ? 1 : 0.5);
        if (x.mine && x.seat === 2 && s.playerMode === "driver" && s.mateEvo && s.mateEvo.name === x.name) x.score += s.mateEvo.form || 0;
        // carreras locas: a veces la suerte te da una mano (o te la saca)
        if (x.mine && kind === "race") { const k = Math.abs(h >> 4) % 100; if (k < FW_BAL.lucky) x.score += FW_BAL.spike; else if (k >= 100 - FW_BAL.unlucky) x.score -= FW_BAL.spike; }
      });
      if (kind === "quali") { const q = [...r.filter(x => !x.noTime).sort((a, b) => b.score - a.score), ...r.filter(x => x.noTime)]; q.forEach((x, i) => { x.pos = i + 1; x.pts = 0; }); return q; }
      const ps = s.pointsSystem || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      const ord = [...r.filter(x => !x.status).sort((a, b) => b.score - a.score), ...r.filter(x => x.status === "DNF").sort((a, b) => b.score - a.score), ...r.filter(x => x.status === "DNS")];
      ord.forEach((x, i) => { if (x.status === "DNS") { x.pos = null; x.pts = 0; return; } x.pos = i + 1; x.pts = (!x.status && i < ps.length) ? ps[i] : 0; });
      return ord;
    } catch (e) { return r0; }
  };
})();
