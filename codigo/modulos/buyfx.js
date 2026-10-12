/* =====================================================================================
   FAWIWE · COMPRAS CON CINEMÁTICA + 2 MINIJUEGOS (Modo Piloto y Modo Ingeniero)
   Cada compra se hace igual que antes; después arranca una cinemática según lo que
   compraste y dos minijuegos distintos. Si te salen bien, conseguís un descuento y un bonus.
   ===================================================================================== */
const BFX_DEFS = {
  life_gear: { scene: "unbox", icon: "🎽", title: "¡Llegó tu equipo de entrenamiento!", bonus: "focus",
    games: [["mash", { label: "🏋️ Estrená las pesas: hacé las repeticiones", icon: "🏋️" }], ["timing", { label: "⏱️ Sprint de prueba: frená el cronómetro en la zona verde", icon: "⏱️" }]] },
  life_bike: { scene: "drive", icon: "🚲", title: "Tu bicicleta sale a la ruta", bonus: "pop",
    games: [["hold", { label: "⚙️ Cambiá de marcha: soltá en la zona verde", icon: "⚙️" }], ["catch", { label: "💧 Agarrá las botellas de agua de la ruta", icon: "💧" }]] },
  life_apartment: { scene: "build", icon: "🏢", title: "Tu departamento en Montecarlo está listo", bonus: "pop",
    games: [["code", { label: "🔑 Marcá el código del portero" }], ["odd", { label: "🗝️ Encontrá la llave de tu departamento", a: "🔑", b: "🗝️" }]] },
  life_sportscar: { scene: "drive", icon: "🚗", title: "Tu auto deportivo sale del concesionario", bonus: "pop",
    games: [["reaction", { label: "🚦 Arrancá justo cuando se ponga verde" }], ["slider", { label: "⚫ Calibrá la presión de los neumáticos", unit: " psi", min: 20, max: 40, step: 1 }]] },
  life_house: { scene: "build", icon: "🏡", title: "Te entregan las llaves de la mansión", bonus: "pop",
    games: [["order", { label: "🛋️ Ordená los ambientes del más chico al más grande", unit: " m²", pool: ["Baño", "Cocina", "Living", "Garaje", "Pileta", "Dormitorio"] }], ["simon", { label: "🚨 Configurá la alarma: repetí la secuencia", icons: ["🔴", "🟢", "🔵", "🟡"] }]] },
  life_supercars: { scene: "unbox", icon: "🏎️", title: "Llega tu colección de superautos", bonus: "pop",
    games: [["odd", { label: "🔍 Encontrá el auto distinto del garaje", a: "🏎️", b: "🚓" }], ["timing", { label: "🅱️ Vuelta de prueba: frená justo en la curva", icon: "🅱️" }]] },
  life_villa: { scene: "build", icon: "🏛️", title: "Tu villa en la Toscana abre sus puertas", bonus: "trust",
    games: [["catch", { label: "🍇 Cosechá los racimos de uvas del viñedo", icon: "🍇" }], ["quiz", { label: "🍝 Pregunta del vecino", q: "¿En qué país está la Toscana?", opts: ["Italia", "Francia", "España"], ok: 0 }]] },
  life_yacht: { scene: "sail", icon: "🛥️", title: "Tu yate zarpa del puerto de Mónaco", bonus: "pop",
    games: [["slider", { label: "🧭 Fijá el rumbo del yate", unit: "°", min: 0, max: 360, step: 1 }], ["hold", { label: "⚓ Levá el ancla: soltá en la zona verde", icon: "⚓" }]] },
  fac_factory: { scene: "build", icon: "🏢", title: "Se amplía la fábrica del equipo", bonus: "car",
    games: [["mash", { label: "🔩 Remachá el chasis nuevo", icon: "🔩" }], ["order", { label: "🏭 Línea de montaje: de la pieza más liviana a la más pesada", unit: " kg", pool: ["Alerón", "Pontón", "Caja", "Motor", "Chasis", "Piso"] }]] },
  fac_windtunnel: { scene: "tunnel", icon: "🔬", title: "¡Encendieron el nuevo túnel de viento!", bonus: "car",
    games: [["slider", { label: "💨 Poné el viento a la velocidad pedida", unit: " km/h", min: 0, max: 400, step: 5 }], ["timing", { label: "📈 Medí la carga aerodinámica en el pico", icon: "📈" }]] },
  fac_lab: { scene: "build", icon: "🧪", title: "Laboratorio renovado", bonus: "car",
    games: [["simon", { label: "🧪 Repetí la secuencia de pruebas", icons: ["🧪", "🔬", "🧲", "⚗️"] }], ["odd", { label: "🔧 Encontrá la pieza fallada", a: "⚙️", b: "🔩" }]] },
  fac_sim: { scene: "screen", icon: "🎮", title: "Simulador de última generación instalado", bonus: "car",
    games: [["reaction", { label: "🎮 Primera vuelta en el simulador: largá con la verde" }], ["catch", { label: "🎯 Tocá los ápices de las curvas", icon: "🎯" }]] },
  fac_tires: { scene: "build", icon: "⚫", title: "Nueva área de neumáticos", bonus: "car",
    games: [["hold", { label: "⚫ Inflá el neumático: soltá en la zona verde", icon: "⚫" }], ["quiz", { label: "⚫ Pregunta del proveedor", q: "¿De qué color es el compuesto blando (Soft)?", opts: ["Rojo", "Amarillo", "Blanco"], ok: 0 }]] },
  cardev: { scene: "tunnel", icon: "🏎️", title: "Pieza nueva probada en el túnel", bonus: "car",
    games: [["code", { label: "🔢 Cargá el número de la pieza nueva" }], ["timing", { label: "💨 Medí el flujo de aire en el momento justo", icon: "💨" }]] },
  hire_engineer: { scene: "sign", icon: "👔", title: "Nuevo ingeniero en el equipo", bonus: "trust",
    games: [["quiz", { label: "🧠 Entrevista técnica", q: "¿Qué mide la telemetría?", opts: ["Los datos del auto en pista", "El clima del fin de semana", "Las ventas de entradas"], ok: 0 }], ["code", { label: "✍️ Firmá el contrato con tu código" }]] },
  hire_driver: { scene: "sign", icon: "👨‍✈️", title: "¡Fichaje confirmado!", bonus: "trust",
    games: [["reaction", { label: "⚡ Prueba de reflejos del piloto nuevo" }], ["order", { label: "⏱️ Ordená sus vueltas de la más rápida a la más lenta", unit: "s", pool: ["Vuelta 1", "Vuelta 2", "Vuelta 3", "Vuelta 4", "Vuelta 5"], time: true }]] },
  approach: { scene: "sign", icon: "🖊️", title: "¡Bombazo en el mercado de pases!", bonus: "pop",
    games: [["simon", { label: "🤫 Reunión secreta: repetí la contraseña", icons: ["🕶️", "📱", "💼", "🤝"] }], ["code", { label: "📄 Escribí el código de la cláusula" }]] },
  presign: { scene: "sign", icon: "🎓", title: "Prospecto asegurado para el año que viene", bonus: "prospect",
    games: [["quiz", { label: "🔎 Scouting", q: "¿Cuál es la categoría justo antes de la F1?", opts: ["Fórmula 2", "Fórmula 4", "Karting"], ok: 0 }], ["reaction", { label: "🏁 Probalo en una largada" }]] },
  acad_recruit: { scene: "kart", icon: "🧒", title: "¡Nuevo chico en la academia!", bonus: "academy",
    games: [["catch", { label: "🟠 Karting: pasá por los conos", icon: "🟠" }], ["odd", { label: "👀 Encontrá al chico del casco distinto", a: "⛑️", b: "🧢" }]] },
  acad_train: { scene: "kart", icon: "🏋️", title: "Día de entrenamiento en la academia", bonus: "academyTrain",
    games: [["mash", { label: "🏋️ Entrenamiento físico: dale con todo", icon: "💪" }], ["hold", { label: "🧘 Ejercicio de respiración: soltá en la zona", icon: "🧘" }]] },
  engine_sign: { scene: "engine", icon: "⚙️", title: "Llega el nuevo motor a la fábrica", bonus: "engineDiscount",
    games: [["slider", { label: "🔊 Llevá las RPM al valor pedido", unit: " rpm", min: 0, max: 15000, step: 100 }], ["simon", { label: "🔌 Conectá los sensores en orden", icons: ["🔴", "🟠", "🟢", "🔵"] }]] },
  pu_power: { scene: "engine", icon: "🔋", title: "Banco de pruebas: más potencia", bonus: "puPower",
    games: [["hold", { label: "🔋 Cargá la batería: soltá en la zona verde", icon: "🔋" }], ["code", { label: "💻 Cargá el mapa motor nuevo" }]] },
  pu_rel: { scene: "engine", icon: "🛡️", title: "Prueba de resistencia del motor", bonus: "puRel",
    games: [["timing", { label: "🌡️ Cortá el motor antes de que recaliente", icon: "🌡️" }], ["odd", { label: "🔍 Encontrá la válvula rota", a: "🔩", b: "🔨" }]] },
  area_aero: { scene: "tunnel", icon: "🌬️", title: "Nuevo alerón en el túnel de viento", bonus: "area",
    games: [["slider", { label: "✈️ Ajustá el ángulo del alerón", unit: "°", min: 0, max: 30, step: 1 }], ["odd", { label: "🌀 Encontrá la turbulencia", a: "💨", b: "🌀" }]] },
  area_chassis: { scene: "build", icon: "⚙️", title: "Suspensión nueva en el chasis", bonus: "area",
    games: [["order", { label: "🔧 Apretá los bulones del más chico al más grande", unit: " mm", pool: ["Bulón A", "Bulón B", "Bulón C", "Bulón D", "Bulón E"] }], ["timing", { label: "⚫ Probá el amortiguador en el momento justo", icon: "⚫" }]] },
  area_tyres: { scene: "unbox", icon: "⚫", title: "Nuevo programa de neumáticos", bonus: "area",
    games: [["hold", { label: "🌡️ Calentá la goma a la temperatura ideal", icon: "🌡️" }], ["catch", { label: "⚫ Agarrá los neumáticos que se escapan rodando", icon: "⚫" }]] },
  area_reliab: { scene: "engine", icon: "🔧", title: "Revisión completa de confiabilidad", bonus: "area",
    games: [["simon", { label: "🔧 Seguí la secuencia de chequeo", icons: ["🔧", "🔩", "⚙️", "🔨"] }], ["reaction", { label: "🚨 Detectá la alarma apenas suene" }]] },
  package: { scene: "tunnel", icon: "📦", title: "¡Llegó el paquete de mejoras!", bonus: "car",
    games: [["timing", { label: "🏗️ Bajá el paquete del camión con la grúa", icon: "📦" }], ["mash", { label: "🏃 Montalo antes de la clasificación", icon: "🔧" }]] }
};
const BFX_DEFAULT = { scene: "unbox", icon: "🛍️", title: "¡Compra nueva!", bonus: null, games: [["timing", { label: "⏱️ Frená en la zona verde", icon: "⏱️" }], ["mash", { label: "👆 Tocá rápido", icon: "👆" }]] };

let BFX = null;
function bfxDiff() { return s.miniDiff === "easy" ? 1.3 : s.miniDiff === "hard" ? 0.8 : 1; }
function bfxEl(id) { return document.getElementById(id); }
function bfxClear() {
  if (!BFX) return;
  (BFX.timers || []).forEach(t => { clearTimeout(t); clearInterval(t); });
  BFX.timers = [];
  if (BFX.raf) cancelAnimationFrame(BFX.raf);
  BFX.raf = null;
}
function bfxT(fn, ms, interval) { const id = interval ? setInterval(fn, ms) : setTimeout(fn, ms); BFX.timers.push(id); return id; }

/* ---------- cinemáticas ---------- */
function bfxConfetti(n) {
  let h = "";
  const bits = ["✨", "🎉", "⭐", "🎊", "💫"];
  for (let i = 0; i < n; i++) h += `<span class="bfx-conf" style="left:${Math.round(Math.random() * 100)}%;animation-delay:${(1.6 + Math.random() * 1.2).toFixed(2)}s">${bits[i % bits.length]}</span>`;
  return h;
}
function bfxScene(def) {
  const i = def.icon;
  const scenes = {
    drive: `<div class="bfx-sky day"></div><div class="bfx-sun">☀️</div><div class="bfx-city">🏙️ 🌳 🏢 🌳 🏙️ 🌳 🏢</div><div class="bfx-road"><i></i></div><div class="bfx-hero bfx-a-drive"><span class="flip">${i}</span></div><div class="bfx-dust">💨</div>`,
    sail: `<div class="bfx-sky sunset"></div><div class="bfx-sun low">🌅</div><div class="bfx-gull">🕊️</div><div class="bfx-sea"><div class="w1">〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️</div><div class="w2">〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️</div></div><div class="bfx-hero bfx-a-sail"><span class="flip">${i}</span></div>`,
    build: `<div class="bfx-sky day"></div><div class="bfx-crane">🏗️</div><div class="bfx-ground"></div><div class="bfx-blocks"><b style="animation-delay:.2s"></b><b style="animation-delay:.6s"></b><b style="animation-delay:1s"></b></div><div class="bfx-hero bfx-a-pop" style="animation-delay:1.6s">${i}</div>`,
    sign: `<div class="bfx-sky office"></div><div class="bfx-flash"></div><div class="bfx-desk"></div><div class="bfx-paper">📄</div><div class="bfx-pen">✒️</div><div class="bfx-hero bfx-a-pop" style="animation-delay:1.5s">🤝</div><div class="bfx-side">${i}</div><div class="bfx-cams">📸 📸 📸</div>`,
    tunnel: `<div class="bfx-sky tunnel"></div>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<i class="bfx-air" style="top:${14 + k * 10}%;animation-delay:${(k * 0.17).toFixed(2)}s"></i>`).join("")}<div class="bfx-hero bfx-a-shake">${i}</div><div class="bfx-gauge">🌡️ <span></span></div>`,
    engine: `<div class="bfx-sky garage"></div><div class="bfx-gear g1">⚙️</div><div class="bfx-gear g2">⚙️</div><div class="bfx-hero bfx-a-pulse">${i}</div><div class="bfx-charge"><span></span></div>`,
    unbox: `<div class="bfx-sky room"></div><div class="bfx-box">📦</div><div class="bfx-hero bfx-a-rise" style="animation-delay:1.3s">${i}</div>`,
    kart: `<div class="bfx-sky day"></div><div class="bfx-oval"></div><div class="bfx-orbit"><span>🏎️</span></div><div class="bfx-hero bfx-a-pop small" style="animation-delay:1.4s">${i}</div>`,
    screen: `<div class="bfx-sky garage"></div><div class="bfx-monitor"><div class="bfx-scr"><span>🏁</span></div></div><div class="bfx-hero bfx-a-pop small" style="animation-delay:1.6s">${i}</div>`
  };
  return `<div class="bfx-stage">${scenes[def.scene] || scenes.unbox}${bfxConfetti(14)}<div class="bfx-caption">${engEsc(def.title)}</div></div>`;
}

/* ---------- flujo ---------- */
function bfxStart(key, price, arg) {
  if (BFX) return;
  const def = BFX_DEFS[key] || BFX_DEFAULT;
  BFX = { key, def, price, arg, step: 0, wins: 0, results: [], timers: [] };
  const ov = bfxEl("bfxOverlay");
  if (!ov) { BFX = null; return; }
  ov.classList.add("show");
  bfxEl("bfxKicker").textContent = "🛍️ COMPRA · " + formatMoney(price);
  bfxEl("bfxBody").innerHTML = bfxScene(def) + `<div class="bfx-ctrl"><button class="dark" onclick="bfxToGames()">⏭️ Saltar cinemática</button></div>`;
  bfxT(bfxToGames, 3900);
}
function bfxToGames() {
  if (!BFX || BFX.step !== 0 || BFX.inGames) return;
  bfxClear();
  BFX.inGames = true;
  bfxIntro(0);
}
function bfxIntro(idx) {
  bfxClear();
  const [type, cfg] = BFX.def.games[idx];
  const dots = BFX.def.games.map((g, k) => `<span class="bfx-dot ${k < idx ? (BFX.results[k] ? "ok" : "bad") : k === idx ? "now" : ""}"></span>`).join("");
  bfxEl("bfxBody").innerHTML = `<div class="bfx-gamehead"><div>${dots}</div><b>Minijuego ${idx + 1} de 2</b></div>
    <h2 class="bfx-gametitle">${engEsc(cfg.label)}</h2>
    <p class="small">${bfxHowTo(type)}</p>
    <div class="bfx-ctrl"><button class="start-btn" onclick="bfxPlay(${idx})">▶ ARRANCAR</button> <button class="dark" onclick="bfxSkipAll()">Saltar minijuegos (sin bonus)</button></div>`;
}
function bfxHowTo(type) {
  return {
    timing: "Una marca va y viene: tocá ¡AHORA! cuando esté en la zona verde. Una sola chance.",
    mash: "Tocá el botón lo más rápido que puedas antes de que se acabe el tiempo.",
    simon: "Mirá la secuencia y repetila en el mismo orden.",
    catch: "Van a aparecer íconos en lugares al azar: tocalos antes de que desaparezcan.",
    hold: "Mantené apretado el botón para llenar la barra y soltalo dentro de la zona verde.",
    odd: "Hay uno distinto entre todos: encontralo antes de que se acabe el tiempo.",
    order: "Tocá los botones en el orden que te piden.",
    slider: "Mové la barra hasta el valor pedido (con poco margen de error) y confirmá.",
    code: "Escribí el código exactamente como aparece y confirmá.",
    reaction: "Esperá a que la luz se ponga verde y tocá lo más rápido posible. ¡Si tocás antes, perdés!",
    quiz: "Elegí la respuesta correcta antes de que se acabe el tiempo."
  }[type] || "";
}
function bfxTimerBar(sec, onEnd) {
  const bar = bfxEl("bfxTimer");
  const t0 = Date.now();
  const total = sec * 1000;
  bfxT(() => {
    const left = Math.max(0, total - (Date.now() - t0));
    if (bar) bar.style.width = (left / total * 100) + "%";
    const lbl = bfxEl("bfxTimeLbl");
    if (lbl) lbl.textContent = (left / 1000).toFixed(1) + "s";
    if (left <= 0) onEnd();
  }, 100, true);
}
function bfxFrame(inner, sec) {
  return `<div class="bfx-gamehead"><b>${engEsc(BFX.def.games[BFX.step][1].label)}</b>${sec ? `<span id="bfxTimeLbl">${sec}s</span>` : ""}</div>${sec ? '<div class="bfx-tbar"><i id="bfxTimer"></i></div>' : ""}<div class="bfx-arena">${inner}</div>`;
}
function bfxPlay(idx) {
  bfxClear();
  BFX.step = idx;
  BFX.done = false;
  const [type, cfg] = BFX.def.games[idx];
  (BFX_GAMES[type] || BFX_GAMES.timing)(cfg);
}
function bfxFinishGame(ok, note) {
  if (!BFX || BFX.done) return;
  BFX.done = true;
  bfxClear();
  BFX.results[BFX.step] = !!ok;
  if (ok) BFX.wins++;
  try { ok ? playClickSound() : null; } catch (e) {}
  const box = bfxEl("bfxBody");
  box.insertAdjacentHTML("beforeend", `<div class="bfx-verdict ${ok ? "ok" : "bad"}">${ok ? "✅ ¡Bien hecho!" : "❌ No salió"}${note ? "<br><span class='small'>" + engEsc(note) + "</span>" : ""}</div>`);
  bfxT(() => { if (BFX.step === 0) bfxIntro(1); else bfxResult(); }, 1300);
}
function bfxSkipAll() {
  bfxClear();
  BFX.results = [false, false];
  BFX.wins = 0;
  bfxResult(true);
}
function bfxResult(skipped) {
  bfxClear();
  const r = bfxReward(BFX.key, BFX.wins, BFX.price, BFX.arg);
  const stars = BFX.wins === 2 ? "⭐⭐" : BFX.wins === 1 ? "⭐" : "—";
  const title = skipped ? "Compra hecha" : BFX.wins === 2 ? "🌟 ¡COMPRA PERFECTA!" : BFX.wins === 1 ? "👍 ¡Buena compra!" : "😅 Compra sin bonus";
  bfxEl("bfxBody").innerHTML = `<div class="bfx-result ${BFX.wins === 2 ? "perfect" : ""}">
    <div class="bfx-bigicon">${BFX.def.icon}</div><h2>${title}</h2>
    <p>${BFX.results.map((x, k) => (x ? "✅" : "❌") + " Minijuego " + (k + 1)).join(" · ")} · ${stars}</p>
    <p class="bfx-reward">${r || "Sin descuento ni bonus esta vez. ¡La próxima sale!"}</p>
    <button class="start-btn" onclick="bfxClose()">Continuar</button></div>`;
}
function bfxClose() {
  bfxClear();
  BFX = null;
  bfxEl("bfxOverlay")?.classList.remove("show");
  try { render(); } catch (e) {}
}

/* ---------- premios ---------- */
function bfxReward(key, wins, price, arg) {
  const parts = [];
  const refundPct = wins === 2 ? 0.15 : wins === 1 ? 0.05 : 0;
  const refund = Math.round(price * refundPct * 10) / 10;
  if (refund > 0) { s.money = Math.round((s.money + refund) * 10) / 10; parts.push("💸 Negociaste un descuento: te devuelven " + formatMoney(refund)); }
  if (wins === 2) {
    const b = (BFX_DEFS[key] || {}).bonus;
    const e = s.eng;
    if (b === "focus") { s.focus = clamp((s.focus || 55) + 2); parts.push("🎯 +2 Enfoque extra"); }
    else if (b === "pop") { s.pop = clamp(s.pop + 2); parts.push("❤️ +2 Popularidad extra (las fotos se hicieron virales)"); }
    else if (b === "trust") { s.trust = clamp(s.trust + 2); parts.push("🤝 +2 Confianza extra"); }
    else if (b === "car") { s.car = clamp(s.car + 1); parts.push("🏎️ +1 de rendimiento del auto extra"); }
    else if (b === "prospect" && e && e.presigned.length) { e.presigned[e.presigned.length - 1].rating += 2; parts.push("🎓 El prospecto llega con +2 de rating"); }
    else if (b === "academy" && s.academyDrivers && s.academyDrivers.length) { const d = s.academyDrivers[s.academyDrivers.length - 1]; d.rating = Math.min(d.potential || 99, d.rating + 3); parts.push("🧒 " + d.name + " arranca con +3 de rating"); }
    else if (b === "academyTrain" && arg) { const d = (s.academyDrivers || []).find(x => x.name === arg[0]); if (d) { d.rating = Math.min(99, d.rating + 1); parts.push("💪 " + d.name + " suma +1 de rating extra"); } }
    else if (b === "engineDiscount" && e) { e.engine.costMult = Math.round((e.engine.costMult || 1) * 0.95 * 100) / 100; parts.push("🔧 El proveedor te baja 5% el alquiler por GP"); }
    else if (b === "puPower" && e) { e.puDev.power = Math.min(10, (e.puDev.power || 0) + 1); parts.push("⚡ +1 de potencia extra en la unidad de potencia"); }
    else if (b === "puRel" && e) { e.puDev.rel = Math.min(10, (e.puDev.rel || 0) + 1); parts.push("🛡️ +1 de confiabilidad extra"); }
    else if (b === "area" && e) { const id = key.replace("area_", ""); e.attr[id] = Math.min(20, (e.attr[id] || 0) + 1); parts.push("🏭 +1 extra en esa área de desarrollo"); }
  }
  const txt = parts.join(" · ");
  add("🛍️ " + ((BFX_DEFS[key] || BFX_DEFAULT).title) + " — minijuegos " + wins + "/2" + (txt ? " · " + txt : "") + ".");
  return txt;
}

/* ---------- minijuegos ---------- */
const BFX_GAMES = {
  timing(cfg) {
    const zw = 20 * bfxDiff();
    const z0 = 10 + Math.random() * (80 - zw);
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-meter"><div class="zone" style="left:${z0}%;width:${zw}%"></div><div class="mark" id="bfxMark">${cfg.icon || "▼"}</div></div><button class="start-btn" onclick="bfxTimingHit()">¡AHORA!</button>`, 0);
    let pos = 0, dir = 1;
    const speed = 1.35 / bfxDiff();
    BFX.tm = { z0, zw, get pos() { return pos; } };
    const step = () => {
      pos += dir * speed;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      const m = bfxEl("bfxMark");
      if (m) m.style.left = pos + "%";
      BFX.raf = requestAnimationFrame(step);
    };
    BFX.raf = requestAnimationFrame(step);
    bfxT(() => bfxFinishGame(false, "Se acabó el tiempo"), 9000);
  },
  mash(cfg) {
    const need = Math.round(18 / bfxDiff());
    const sec = 5;
    BFX.mash = 0;
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-count"><span id="bfxMashN">0</span> / ${need}</div><button class="bfx-mash" onclick="bfxMashHit(${need})">${cfg.icon || "👆"}<br><span class="small">¡TOCÁ!</span></button>`, sec);
    bfxTimerBar(sec, () => bfxFinishGame(BFX.mash >= need, BFX.mash + " de " + need));
  },
  simon(cfg) {
    const len = s.miniDiff === "easy" ? 3 : s.miniDiff === "hard" ? 5 : 4;
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * cfg.icons.length));
    BFX.simon = { seq, pos: 0, ready: false };
    bfxEl("bfxBody").innerHTML = bfxFrame(`<p class="small" id="bfxSimonMsg">👀 Mirá la secuencia…</p><div class="bfx-simon">${cfg.icons.map((ic, k) => `<button class="bfx-pad" id="bfxPad${k}" onclick="bfxSimonHit(${k})">${ic}</button>`).join("")}</div>`, 0);
    seq.forEach((k, n) => {
      bfxT(() => { const p = bfxEl("bfxPad" + k); if (p) p.classList.add("lit"); }, 500 + n * 750);
      bfxT(() => { const p = bfxEl("bfxPad" + k); if (p) p.classList.remove("lit"); }, 500 + n * 750 + 480);
    });
    bfxT(() => {
      BFX.simon.ready = true;
      const m = bfxEl("bfxSimonMsg"); if (m) m.textContent = "👆 ¡Tu turno! Repetila.";
      bfxT(() => bfxFinishGame(false, "Se acabó el tiempo"), 9000 * bfxDiff());
    }, 500 + len * 750);
  },
  catch(cfg) {
    const need = 5;
    const sec = Math.round(8 * bfxDiff());
    BFX.caught = 0;
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-count"><span id="bfxCatchN">0</span> / ${need}</div><div class="bfx-field" id="bfxField"></div>`, sec);
    const spawn = () => {
      const f = bfxEl("bfxField");
      if (!f) return;
      f.innerHTML = `<button class="bfx-target" style="left:${5 + Math.random() * 80}%;top:${5 + Math.random() * 70}%" onclick="bfxCatchHit(${need})">${cfg.icon || "🎯"}</button>`;
    };
    spawn();
    bfxT(spawn, Math.round(950 * bfxDiff()), true);
    bfxTimerBar(sec, () => bfxFinishGame(BFX.caught >= need, BFX.caught + " de " + need));
  },
  hold(cfg) {
    const zw = 16 * bfxDiff();
    const z0 = 45 + Math.random() * (40 - zw);
    BFX.hold = { v: 0, on: false, z0, zw };
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-meter tall"><div class="zone" style="left:${z0}%;width:${zw}%"></div><div class="fill" id="bfxFill"></div></div>
      <button class="bfx-mash" id="bfxHoldBtn" onpointerdown="bfxHoldDown(event)" onpointerup="bfxHoldUp()" onpointerleave="bfxHoldUp()">${cfg.icon || "✋"}<br><span class="small">MANTENÉ APRETADO</span></button>`, 0);
    bfxT(() => bfxFinishGame(false, "Se acabó el tiempo"), 10000);
  },
  odd(cfg) {
    const n = s.miniDiff === "hard" ? 30 : 20;
    const target = Math.floor(Math.random() * n);
    const sec = Math.round(8 * bfxDiff());
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-grid ${n > 20 ? "g6" : ""}">${Array.from({ length: n }, (_, k) => `<button onclick="bfxFinishGame(${k === target}, ${k === target ? "''" : "'Ese no era'"})">${k === target ? cfg.b : cfg.a}</button>`).join("")}</div>`, sec);
    bfxTimerBar(sec, () => bfxFinishGame(false, "Se acabó el tiempo"));
  },
  order(cfg) {
    const n = s.miniDiff === "easy" ? 3 : 4;
    const names = cfg.pool.slice().sort(() => Math.random() - 0.5).slice(0, n);
    const vals = [];
    while (vals.length < n) {
      const v = cfg.time ? Math.round((78 + Math.random() * 6) * 1000) / 1000 : 5 + Math.floor(Math.random() * 95);
      if (!vals.includes(v)) vals.push(v);
    }
    const items = names.map((nm, k) => ({ nm, v: vals[k] }));
    BFX.order = { sorted: items.slice().sort((a, b) => a.v - b.v).map(x => x.nm), pos: 0 };
    const sec = Math.round(9 * bfxDiff());
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-order">${items.map(x => `<button id="bfxOrd_${engEsc(x.nm).replace(/\s/g, "_")}" onclick="bfxOrderHit(${engArg(x.nm)}, this)"><b>${engEsc(x.nm)}</b><br>${cfg.time ? "1:" + x.v.toFixed(3) : x.v + cfg.unit}</button>`).join("")}</div>`, sec);
    bfxTimerBar(sec, () => bfxFinishGame(false, "Se acabó el tiempo"));
  },
  slider(cfg) {
    const span = cfg.max - cfg.min;
    let target = cfg.min + span * (0.15 + Math.random() * 0.7);
    target = Math.round(target / cfg.step) * cfg.step;
    const tol = Math.max(cfg.step, Math.round(span * 0.02 * bfxDiff() / cfg.step) * cfg.step);
    BFX.slider = { target, tol };
    const sec = Math.round(9 * bfxDiff());
    const mid = Math.round((cfg.min + span / 2) / cfg.step) * cfg.step;
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-target-val">Objetivo: <b>${target.toLocaleString("es-AR")}${cfg.unit}</b> <span class="small">(margen ±${tol}${cfg.unit})</span></div>
      <input type="range" id="bfxRange" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${mid}" oninput="document.getElementById('bfxRangeV').textContent=Number(this.value).toLocaleString('es-AR')+'${cfg.unit}'">
      <div class="bfx-count" id="bfxRangeV">${mid.toLocaleString("es-AR")}${cfg.unit}</div><button class="start-btn" onclick="bfxSliderOk()">✅ Confirmar</button>`, sec);
    bfxTimerBar(sec, () => bfxFinishGame(false, "Se acabó el tiempo"));
  },
  code(cfg) {
    const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const len = s.miniDiff === "hard" ? 4 : 3;
    let c = "";
    for (let i = 0; i < len; i++) c += L[Math.floor(Math.random() * L.length)];
    c += "-" + (10 + Math.floor(Math.random() * 90));
    BFX.code = c;
    const sec = Math.round(12 * bfxDiff());
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-code">${c}</div><input id="bfxCodeIn" autocomplete="off" autocapitalize="characters" placeholder="Escribilo acá" onkeydown="if(event.key==='Enter')bfxCodeOk()"><button class="start-btn" onclick="bfxCodeOk()">✅ Confirmar</button>`, sec);
    setTimeout(() => bfxEl("bfxCodeIn")?.focus(), 50);
    bfxTimerBar(sec, () => bfxFinishGame(false, "Se acabó el tiempo"));
  },
  reaction() {
    BFX.react = { armed: false, t: 0 };
    bfxEl("bfxBody").innerHTML = bfxFrame(`<div class="bfx-lights" id="bfxLights"><span></span><span></span><span></span><span></span><span></span></div><button class="bfx-mash" onclick="bfxReactHit()">🚦<br><span class="small">¡TOCÁ CON LA VERDE!</span></button><p class="small" id="bfxReactMsg">Esperá…</p>`, 0);
    const lights = [...document.querySelectorAll("#bfxLights span")];
    lights.forEach((l, k) => bfxT(() => l.classList.add("red"), 300 + k * 400));
    const go = 300 + 5 * 400 + 500 + Math.random() * 1800;
    bfxT(() => {
      lights.forEach(l => { l.classList.remove("red"); l.classList.add("green"); });
      BFX.react.armed = true; BFX.react.t = performance.now();
      const m = bfxEl("bfxReactMsg"); if (m) m.textContent = "¡YA!";
      bfxT(() => bfxFinishGame(false, "Muy lento"), Math.round(650 * bfxDiff()));
    }, go);
  },
  quiz(cfg) {
    const order = cfg.opts.map((o, k) => k).sort(() => Math.random() - 0.5);
    const sec = Math.round(9 * bfxDiff());
    bfxEl("bfxBody").innerHTML = bfxFrame(`<h3>${engEsc(cfg.q)}</h3><div class="choice-grid">${order.map(k => `<button class="choice-card" onclick="bfxFinishGame(${k === cfg.ok}, ${k === cfg.ok ? "''" : engArg("Era: " + cfg.opts[cfg.ok])})"><b>${engEsc(cfg.opts[k])}</b></button>`).join("")}</div>`, sec);
    bfxTimerBar(sec, () => bfxFinishGame(false, "Se acabó el tiempo"));
  }
};
function bfxTimingHit() {
  if (!BFX || BFX.done || !BFX.tm) return;
  const p = BFX.tm.pos;
  bfxFinishGame(p >= BFX.tm.z0 && p <= BFX.tm.z0 + BFX.tm.zw, "La marca quedó en " + Math.round(p) + "%");
}
function bfxMashHit(need) {
  if (!BFX || BFX.done) return;
  BFX.mash++;
  const n = bfxEl("bfxMashN"); if (n) n.textContent = BFX.mash;
  if (BFX.mash >= need) bfxFinishGame(true);
}
function bfxSimonHit(k) {
  const sm = BFX && BFX.simon;
  if (!sm || BFX.done || !sm.ready) return;
  const p = bfxEl("bfxPad" + k);
  if (p) { p.classList.add("lit"); setTimeout(() => p.classList.remove("lit"), 180); }
  if (sm.seq[sm.pos] !== k) return bfxFinishGame(false, "Te equivocaste de orden");
  sm.pos++;
  if (sm.pos >= sm.seq.length) bfxFinishGame(true);
}
function bfxCatchHit(need) {
  if (!BFX || BFX.done) return;
  BFX.caught++;
  const n = bfxEl("bfxCatchN"); if (n) n.textContent = BFX.caught;
  const f = bfxEl("bfxField"); if (f) f.innerHTML = "";
  if (BFX.caught >= need) bfxFinishGame(true);
}
function bfxHoldDown(ev) {
  const h = BFX && BFX.hold;
  if (!h || BFX.done || h.on) return;
  if (ev) ev.preventDefault();
  h.on = true;
  const t0 = performance.now();
  const dur = 2200 / bfxDiff();
  const step = () => {
    if (!BFX || !BFX.hold || !BFX.hold.on) return;
    h.v = Math.min(100, (performance.now() - t0) / dur * 100);
    const f = bfxEl("bfxFill"); if (f) f.style.width = h.v + "%";
    if (h.v >= 100) return bfxFinishGame(false, "Te pasaste");
    BFX.raf = requestAnimationFrame(step);
  };
  BFX.raf = requestAnimationFrame(step);
}
function bfxHoldUp() {
  const h = BFX && BFX.hold;
  if (!h || !h.on || BFX.done) return;
  h.on = false;
  bfxFinishGame(h.v >= h.z0 && h.v <= h.z0 + h.zw, "Soltaste en " + Math.round(h.v) + "%");
}
function bfxOrderHit(nm, btn) {
  const o = BFX && BFX.order;
  if (!o || BFX.done) return;
  if (o.sorted[o.pos] !== nm) return bfxFinishGame(false, "Ese no iba ahí");
  o.pos++;
  if (btn) { btn.disabled = true; btn.classList.add("done"); }
  if (o.pos >= o.sorted.length) bfxFinishGame(true);
}
function bfxSliderOk() {
  const sl = BFX && BFX.slider;
  if (!sl || BFX.done) return;
  const v = Number(bfxEl("bfxRange")?.value || 0);
  bfxFinishGame(Math.abs(v - sl.target) <= sl.tol, "Pusiste " + v.toLocaleString("es-AR"));
}
function bfxCodeOk() {
  if (!BFX || BFX.done) return;
  const v = (bfxEl("bfxCodeIn")?.value || "").trim().toUpperCase().replace(/\s/g, "");
  bfxFinishGame(v === BFX.code, v === BFX.code ? "" : "El código era " + BFX.code);
}
function bfxReactHit() {
  const r = BFX && BFX.react;
  if (!r || BFX.done) return;
  if (!r.armed) return bfxFinishGame(false, "¡Largada en falso! Tocaste antes de la verde");
  const ms = Math.round(performance.now() - r.t);
  bfxFinishGame(true, "Reacción: " + ms + " ms");
}

/* ---------- enganchar cada compra ---------- */
function bfxWrap(name, keyFn, okFn) {
  const orig = window[name];
  if (typeof orig !== "function") return;
  window[name] = function (...args) {
    if (BFX) return; // hay una compra en curso
    const m0 = s.money;
    const before = okFn ? okFn.before(args) : null;
    const r = orig.apply(this, args);
    const paid = Math.round((m0 - s.money) * 10) / 10;
    const ok = okFn ? okFn.after(args, before) : paid > 0;
    if (ok && paid > 0) bfxStart(keyFn(args), paid, args);
    return r;
  };
}
bfxWrap("buyLifestyleItem", a => "life_" + a[0]);
bfxWrap("upgradeFacility", a => "fac_" + a[0]);
bfxWrap("developCar", () => "cardev");
bfxWrap("hireEngineer", () => "hire_engineer");
bfxWrap("hire", () => "hire_driver");
bfxWrap("recruitAcademyDriver", () => "acad_recruit", { before: () => (s.academyDrivers || []).length, after: (a, b) => (s.academyDrivers || []).length > b });
bfxWrap("trainAcademyDriver", () => "acad_train");
bfxWrap("engSignEngine", () => "engine_sign");
bfxWrap("engInvestPU", a => a[0] === "power" ? "pu_power" : "pu_rel");
bfxWrap("engDevelopArea", a => "area_" + a[0]);
bfxWrap("engUpgradePackage", () => "package");
bfxWrap("engPresign", () => "presign");
bfxWrap("engApproach", () => "approach", { before: () => (s.drivers || []).length, after: (a, b) => (s.drivers || []).length > b });
