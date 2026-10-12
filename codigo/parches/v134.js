/* claves que agregan los módulos nuevos: se limpian al empezar una partida nueva o al cargar otra */
const V5_KEYS = ["challenge", "shortSeason", "lifetime", "_launchSeen", "_dl", "_dlQuali", "_qlKey", "trkRec", "hof", "social", "boss", "manager", "mateEvo", "raceEng", "helmet", "preseason", "preseasonRes", "_carHist", "_v4Grid", "_v4ResKey", "_trkRecKey", "_rumorTag", "_rumorSaid", "_calNotice", "_calPrevSeason", "calSeed", "_slowTitle", "_rainWins", "_comebackWin", "_duelWins", "_sprintWins", "livery", "quickRace", "_hofShown"];
/* =====================================================================================
   FAWIWE · V134
   Personajes: jefe de equipo, redes sociales, mánager, compañero que evoluciona.
   Modos: desafíos, carrera de toda una vida, temporada rápida, medallas.
   Presentación: repetición, gráfico de posiciones, casco, música por época,
   tutorial de la transmisión y accesibilidad.
   ===================================================================================== */
function v4H(t) { return v3H(t); }
function v4Esc(t) { return v3Esc(t); }
function v4Drv() { return s.playerMode === "driver" && !!s.playedDriverName; }
function v4Pick(arr, salt) { return arr[v4H(salt) % arr.length]; }
function v4Clamp(v) { return Math.max(0, Math.min(100, v)); }
function v4Expected() {
  // posición "esperable" según el auto: cuántos equipos tienen mejor auto que vos
  try {
    const teams = getTeamsForYear(s.season);
    const my = (s.car || 50) / 100 * 5;
    const better = teams.filter(t => t[0] !== s.club && t[1] > my).length;
    return Math.max(1, Math.min(teams.length * 2, better * 2 + 2));
  } catch (e) { return 10; }
}

/* ============================ 👔 JEFE DE EQUIPO ============================ */
const V4_BOSS = ["Franz Keller", "Giulia Moretti", "Arthur Blake", "Hiro Tanaka", "Claire Dubois", "Rafael Ortega", "Ingrid Solberg", "Victor Lang"];
function v4Boss() {
  if (!s.boss || s.boss.team !== s.team) s.boss = { team: s.team, name: v4Pick(V4_BOSS, "boss" + s.team), mood: 60, bad: 0, last: "" };
  return s.boss;
}
function v4BossReact(me) {
  if (!me) return null;
  const B = v4Boss(), exp = v4Expected();
  const pos = me.status ? 30 : me.pos;
  const diff = exp - pos; // positivo = mejor de lo esperado
  let msg, d;
  const drv = v4Drv(), tu = drv ? "" : " del equipo";
  if (me.status === "DNS" || me.status === "DNF") { d = -2; msg = v4Pick(["Un abandono duele. Quiero un informe completo mañana a primera hora.", "Cero puntos. Esto no se puede repetir.", "Mala suerte o error, no me importa: el domingo que viene necesito puntos."], "bd" + s.gp + s.season); }
  else if (pos === 1) { d = 10; msg = v4Pick(["¡ESO! Hoy todo el equipo está orgulloso.", "Victoria. Esto es exactamente para lo que trabajamos.", "Ganar así es lo más lindo que hay. ¡Bravo!"], "bw" + s.gp); }
  else if (diff >= 3) { d = 6; msg = v4Pick(["Mucho mejor de lo que esperábamos con este auto. Excelente.", "Le sacaste jugo de más al auto. Así me gusta.", "Resultado enorme para el nivel del auto."], "bg" + s.gp); }
  else if (diff >= -1) { d = 1; msg = v4Pick(["Correcto. Hiciste el trabajo.", "Lo esperado. Seguimos sumando.", "Bien, sin brillo pero sólido."], "bo" + s.gp); }
  else { d = -5; msg = v4Pick(["Esperaba bastante más" + tu + " hoy.", "Con este auto tenemos que estar más adelante.", "No estoy contento. Hablemos esta semana."], "bb" + s.gp); }
  B.mood = v4Clamp(B.mood + d);
  B.bad = d < 0 ? B.bad + 1 : 0;
  if (B.bad >= 3) { msg += drv ? " Y te lo digo claro: si esto sigue, vamos a revisar tu contrato." : " La junta directiva empieza a hacer preguntas sobre tu puesto."; s.trust = Math.max(0, (s.trust || 50) - 3); }
  B.last = msg;
  return msg;
}

/* ============================ 📱 REDES SOCIALES ============================ */
const V4_USERS = ["@pitwall_fan", "@la_curva_uno", "@boxbox_daily", "@telemetria_ok", "@velocidad_ar", "@gomasblandas", "@dataf1nerd", "@paddock_gossip", "@banderaacuadros", "@vuelta_rapida", "@chicana_total", "@motorhead99"];
function v4Social() { if (!s.social || typeof s.social !== "object") s.social = { followers: 20000 + Math.round((s.pop || 30) * 1500), posts: [] }; return s.social; }
function v4Post(user, txt, likes) { const S = v4Social(); S.posts.unshift({ u: user, t: txt, l: likes, y: s.season, g: s.gp }); S.posts = S.posts.slice(0, 12); }
function v4SocialRace(me) {
  if (!me) return;
  const S = v4Social(), nm = v4Drv() ? (s.playedDriverName || "vos") : s.team;
  const trk = (trackData[s.gp] || {}).name || "";
  const pos = me.status ? null : me.pos;
  const k = "so" + s.season + s.gp;
  const good = pos && pos <= 3, ok = pos && pos <= 10;
  const pool = me.status ? ["Qué bronca lo de " + nm + " hoy 😤", "Abandono... la temporada es larga, fuerza " + nm + " 💪", "Ese auto no aguanta más, hay que arreglar la confiabilidad 🔧"]
    : pos === 1 ? ["¡¡¡" + nm.toUpperCase() + " GANADOR EN " + trk.toUpperCase() + "!!! 🏆🏆", "Llorando de emoción con esta victoria 😭🏁", "Esto es un campeón en potencia, no me discutan"]
    : good ? ["Podio para " + nm + " en " + trk + " 🍾", "Qué carrerón, se merecía el podio", "Cada vez más arriba 📈"]
    : ok ? ["P" + pos + " y puntos, bien ahí " + nm, "Carrera sólida, sin errores 👏", "Sumar siempre suma 😅"]
    : ["P" + pos + "... hoy no fue el día", "Con ese auto no se puede hacer magia 🤷", "Queremos ver a " + nm + " más arriba 😕"];
  const n = 2 + v4H(k) % 2;
  for (let i = 0; i < n; i++) v4Post(v4Pick(V4_USERS, k + i), v4Pick(pool, k + "t" + i), Math.round((good ? 8000 : ok ? 2500 : 900) * (0.5 + (v4H(k + "l" + i) % 100) / 100)));
  const delta = Math.round((pos === 1 ? 0.06 : good ? 0.035 : ok ? 0.012 : me.status ? -0.01 : -0.004) * S.followers + (s.pop || 30) * 30);
  S.followers = Math.max(1000, S.followers + delta);
  S.last = delta;
}
function v4Fmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n); }

/* ============================ 🤵 MÁNAGER ============================ */
const V4_MGR = ["Lucía Ferraro", "Tobias Wren", "Mateo Quiroga", "Anouk de Vries"];
function v4Mgr() { return s.manager && s.manager.on ? s.manager : null; }
function v4MgrHire() {
  if (v4Mgr()) return;
  const cost = 0.5;
  if ((s.money || 0) < cost) { add("🤵 No te alcanza la plata para contratar un mánager ($0,5M por temporada)."); render(); return; }
  s.money = Math.round(((s.money || 0) - cost) * 100) / 100;
  s.manager = { on: true, name: v4Pick(V4_MGR, "mgr" + s.playedDriverName), since: s.season, paid: s.season, sponsorSeason: null };
  add("🤵 Contrataste a " + s.manager.name + " como mánager ($0,5M por temporada): negocia tus contratos y te busca sponsors.");
  render();
}
function v4MgrFire() { if (!v4Mgr()) return; add("🤵 Despediste a " + s.manager.name + "."); s.manager.on = false; render(); }
function v4MgrSponsor() {
  const M = v4Mgr(); if (!M || M.sponsorSeason === s.season) return;
  M.sponsorSeason = s.season;
  const amt = Math.round((1 + (s.pop || 30) / 40 + (v4H("ms" + s.season) % 10) / 10) * 10) / 10;
  s.money = Math.round(((s.money || 0) + amt) * 100) / 100;
  s.pop = v4Clamp((s.pop || 30) + 2);
  const brand = v4Pick(["una marca de relojes", "una bebida energética", "una marca de zapatillas", "un banco digital", "una app de delivery", "una marca de anteojos"], "msb" + s.season);
  add("🤵 " + M.name + " te consiguió un acuerdo personal con " + brand + ": +$" + amt + "M y +2 de popularidad.");
  render();
}
function v4MgrIntel() {
  try {
    const ovr = typeof computeOVR === "function" ? computeOVR() : 75;
    const teams = getTeamsForYear(s.season).filter(t => t[0] !== s.team).sort((a, b) => b[1] - a[1]);
    const want = teams.filter(t => ovr >= 60 + t[1] * 6).slice(0, 3).map(t => t[0]);
    return want.length ? want : teams.slice(-2).map(t => t[0]);
  } catch (e) { return []; }
}

/* ============================ 🤝 COMPAÑERO QUE EVOLUCIONA ============================ */
function v4Mate() { try { const l = myTeamLineup(); const m = l.find(d => d.seat === 2) || l[1]; return m ? m.name : null; } catch (e) { return null; } }
function v4MateUpdate(grid) {
  if (!v4Drv()) return;
  const me = grid.find(e => e.mine && e.seat === 1), mate = grid.find(e => e.mine && e.seat === 2);
  if (!me || !mate) return;
  if (!s.mateEvo || s.mateEvo.name !== mate.name) s.mateEvo = { name: mate.name, form: 0, me: 0, him: 0, first: null };
  const M = s.mateEvo;
  const meP = me.status ? 99 : me.pos, hiP = mate.status ? 99 : mate.pos;
  if (meP < hiP) M.me++; else if (hiP < meP) M.him++;
  // el compañero evoluciona: los jóvenes mejoran, los que pierden mucho se motivan
  const young = (mate.rating || 80) < 84;
  M.form = Math.max(-5, Math.min(6, M.form + (young ? 0.35 : 0.1) + (hiP > meP ? 0.15 : -0.1) + ((v4H("mf" + s.gp + s.season) % 7) - 3) * 0.05));
  M.form = Math.round(M.form * 100) / 100;
  const prev = M.first;
  const tot = M.me + M.him;
  if (tot >= 4) M.first = M.me >= M.him + 2 ? "me" : M.him >= M.me + 2 ? "him" : M.first;
  if (M.first !== prev && M.first) {
    if (M.first === "me") add("🥇 El equipo te nombra primer piloto: le venís ganando a " + mate.name + " (" + M.me + "-" + M.him + ").");
    else add("⚠️ " + mate.name + " pasa a ser el primer piloto del equipo (" + M.him + "-" + M.me + "): en las órdenes de equipo lo van a favorecer a él.");
  }
}

/* ============================ 🏅 MEDALLAS ============================ */
(function () {
  if (typeof achievementDefs === "undefined") return;
  const add2 = (id, icon, label, check, tier) => { if (!achievementDefs.find(a => a.id === id)) achievementDefs.push({ id, icon, label, check, tier }); };
  add2("monaco_win", "🎰", "Ganar en Mónaco", () => !!(s.trkRec && s.trkRec["Mónaco"] && s.trkRec["Mónaco"].wins > 0), "gold");
  add2("ten_podiums", "🍾", "10 podios", () => (s.podiums || 0) >= 10, "silver");
  add2("slow_title", "🐢", "Campeón con un auto lento (menos de 70)", () => !!s._slowTitle, "gold");
  add2("rain_win", "🌧️", "Ganar bajo la lluvia", () => (s._rainWins || 0) >= 1, "silver");
  add2("comeback", "🚀", "Ganar largando desde P10 o más atrás", () => !!s._comebackWin, "gold");
  add2("duel_master", "⚔️", "Ganar 3 duelos finales", () => (s._duelWins || 0) >= 3, "bronze");
  add2("sprint_win", "⚡", "Ganar una sprint", () => (s._sprintWins || 0) >= 1, "silver");
  add2("challenge", "🎯", "Superar un desafío", () => { try { return Object.keys(JSON.parse(localStorage.getItem("fw_chal") || "{}")).length > 0; } catch (e) { return false; } }, "bronze");
  add2("all_tracks", "🗺️", "Correr en 15 circuitos distintos", () => Object.keys(s.trkRec || {}).length >= 15, "bronze");
  add2("social_star", "📱", "1 millón de seguidores", () => (s.social && s.social.followers || 0) >= 1e6, "silver");
  const tierOf = { first_title: "gold", title_streak3: "gold", grand_slam: "gold", five_wins: "silver", ten_seasons: "silver", first_win: "silver", rich: "silver", max_car: "silver" };
  achievementDefs.forEach(a => { if (!a.tier) a.tier = tierOf[a.id] || "bronze"; });
  const ra = window.renderAchievements;
  if (typeof ra === "function") window.renderAchievements = function () {
    const box = document.getElementById("achievementsBody");
    if (!box) return ra.apply(this, arguments);
    const list = achievementDefs.map(a => ({ a, ok: (() => { try { return a.check(); } catch (e) { return false; } })() }));
    const got = list.filter(x => x.ok).length;
    box.innerHTML = `<div class="v4-medal-head">🏅 ${got}/${list.length} medallas · 🥇 ${list.filter(x => x.ok && x.a.tier === "gold").length} · 🥈 ${list.filter(x => x.ok && x.a.tier === "silver").length} · 🥉 ${list.filter(x => x.ok && x.a.tier === "bronze").length}</div>
      <div class="v4-medals">${list.map(x => `<div class="v4-medal ${x.a.tier} ${x.ok ? "ok" : "lock"}" title="${v4Esc(x.a.label)}"><i>${x.ok ? x.a.icon : "🔒"}</i><span>${v4Esc(x.a.label)}</span></div>`).join("")}</div>`;
  };
})();

/* ============================ 📈 GRÁFICO DE POSICIONES ============================ */
function v4Chart(d) {
  if (!d || !d.rows) return "";
  const me = s.playerMode === "driver" ? d.rows.find(r => r.mine && r.seat === 1) : d.rows.filter(r => r.mine).sort((a, b) => (a.finalPos || 99) - (b.finalPos || 99))[0];
  if (!me || !me.pos || me.status === "DNS") return "";
  const mate = d.rows.find(r => r.mine && r !== me && r.status !== "DNS");
  const N = d.N, n = d.rows.filter(r => r.status !== "DNS").length;
  const W = 520, H = 170, L = 30, R = 10, T = 10, B = 22;
  const x = l => L + (W - L - R) * (l / N), y = p => T + (H - T - B) * ((p - 1) / Math.max(1, n - 1));
  const line = r => { const pts = []; for (let l = 0; l <= Math.min(N, r.t.length); l++) if (r.pos[l]) pts.push(x(l).toFixed(1) + "," + y(r.pos[l]).toFixed(1)); return pts.join(" "); };
  const grid = [1, 5, 10, 15, 20].filter(p => p <= n).map(p => `<line x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}" class="g"/><text x="${L - 6}" y="${y(p) + 3}" class="a" text-anchor="end">P${p}</text>`).join("");
  const pits = me.pits.filter(p => p <= me.t.length).map(p => `<circle cx="${x(p)}" cy="${y(me.pos[p])}" r="3.5" class="pit"><title>Parada en boxes · vuelta ${p}</title></circle>`).join("");
  const endL = Math.min(N, me.t.length);
  return `<div class="v4-chart"><div class="v4-chart-h"><b>📈 Tu carrera vuelta por vuelta</b><span><i class="k me"></i>${v4Esc(lapShort(me.name))}${mate ? ` <i class="k mate"></i>${v4Esc(lapShort(mate.name))}` : ""} <i class="k pitk"></i>boxes</span></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Posición por vuelta">${grid}
      <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="ax"/><text x="${L}" y="${H - 6}" class="a" text-anchor="start" style="text-anchor:start">Largada</text><text x="${W - R}" y="${H - 6}" class="a" text-anchor="end">Vuelta ${N}</text>
      ${mate ? `<polyline points="${line(mate)}" class="mate"/>` : ""}<polyline points="${line(me)}" class="me"/>${pits}
      <text x="${x(0) + 4}" y="${y(me.pos[0]) - 5}" class="lbl">P${me.pos[0]}</text><text x="${x(endL) - 4}" y="${y(me.pos[endL] || n) - 5}" class="lbl" text-anchor="end">${me.status === "DNF" ? "DNF" : "P" + (me.pos[endL] || "?")}</text></svg></div>`;
}

/* ============================ 🎬 REPETICIÓN ============================ */
let v4RepRaf = null;
function v4Replay() {
  const d = window.dlLastData; const st = s._dl;
  if (!d || !st || !st.highlights) return;
  const best = st.highlights.find(h => /¡GANASTE EL DUELO|¡Pasaste a|Duelo ganado|ganaste \d/.test(h.txt)) || st.highlights.find(h => /⬆️|🏁 Largada/.test(h.txt)) || st.highlights[0];
  if (!best) return;
  let ov = document.getElementById("v4Rep");
  if (!ov) { ov = document.createElement("div"); ov.id = "v4Rep"; document.body.appendChild(ov); ov.addEventListener("click", e => { if (e.target === ov) v4ReplayClose(); }); }
  ov.innerHTML = `<div class="v4-rep-card"><div class="v4-rep-k"><span class="rec">●</span> REPETICIÓN · VUELTA ${best.lap}</div><div class="fw-map big" id="v4RepMap"></div><div class="v4-rep-cap">${v4Esc(best.txt)}</div><button type="button" class="lv-btn red" onclick="v4ReplayClose()">Cerrar</button></div>`;
  ov.classList.add("show");
  const host = document.getElementById("v4RepMap");
  const L = Math.max(1, best.lap);
  const from = Math.max(0, L - 1.6), to = Math.min(d.N, L + 0.4), dur = 6000, t0 = performance.now();
  cancelAnimationFrame(v4RepRaf);
  const step = now => {
    if (!ov.classList.contains("show")) return;
    const k = ((now - t0) % dur) / dur;
    try { fwMapDraw(host, d, from + (to - from) * k); } catch (e) {}
    v4RepRaf = requestAnimationFrame(step);
  };
  v4RepRaf = requestAnimationFrame(step);
}
function v4ReplayClose() { const ov = document.getElementById("v4Rep"); if (ov) ov.classList.remove("show"); cancelAnimationFrame(v4RepRaf); }

/* ============================ 🪖 CASCO ============================ */
const V4_PAT = { franja: "Franja", rayo: "Rayo", estrellas: "Estrellas", cuadros: "Cuadros", llamas: "Llamas" };
function v4Custom() { return v4Drv() && s.playedDriverType && s.playedDriverType !== "actual"; }
function v4Helmet() {
  const tc = (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
  if (!v4Custom()) return { c1: tc, c2: "#ffffff", pat: "franja", num: s.driverNumber || "", team: true };
  if (!s.helmet) s.helmet = { c1: tc, c2: "#ffffff", pat: "rayo", num: s.driverNumber || "7" };
  return s.helmet;
}
function v4HelmetSvg(h, size) {
  h = h || v4Helmet(); size = size || 120;
  const id = "hg" + Math.abs(v4H(JSON.stringify(h))) % 100000;
  const pat = {
    franja: `<path d="M18,58 Q60,30 104,44 L104,54 Q60,42 20,68 Z" fill="${h.c2}"/>`,
    rayo: `<path d="M30,40 L58,40 L48,54 L78,54 L40,82 L52,62 L28,62 Z" fill="${h.c2}"/>`,
    estrellas: [[34, 44], [60, 34], [82, 46], [46, 64]].map(([x, y]) => `<path transform="translate(${x},${y}) scale(.9)" d="M0,-8 L2.4,-2.5 8,-2.5 3.5,1 5,7 0,3.5 -5,7 -3.5,1 -8,-2.5 -2.4,-2.5Z" fill="${h.c2}"/>`).join(""),
    cuadros: `<g clip-path="url(#${id})">${Array.from({ length: 6 }, (_, i) => Array.from({ length: 5 }, (_, j) => (i + j) % 2 ? `<rect x="${14 + i * 16}" y="${22 + j * 16}" width="16" height="16" fill="${h.c2}" opacity=".9"/>` : "").join("")).join("")}</g>`,
    llamas: `<path d="M16,80 Q30,60 40,72 Q46,52 58,68 Q66,46 78,64 Q86,50 96,62 L104,86 L16,92 Z" fill="${h.c2}"/>`
  }[h.pat] || "";
  return `<svg class="v4-helmet" viewBox="0 0 120 110" width="${size}" height="${size * 110 / 120}" aria-label="Casco"><defs><clipPath id="${id}"><path d="M12,70 Q10,22 60,18 Q108,18 110,62 L110,84 Q110,94 98,94 L28,94 Q12,94 12,80 Z"/></clipPath><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <path d="M12,70 Q10,22 60,18 Q108,18 110,62 L110,84 Q110,94 98,94 L28,94 Q12,94 12,80 Z" fill="${h.c1}" stroke="#000" stroke-width="2.5"/>
    <g clip-path="url(#${id})">${h.pat === "cuadros" ? "" : pat}</g>${h.pat === "cuadros" ? pat : ""}
    <path d="M64,48 L110,50 L110,72 L70,72 Q60,72 60,62 Z" fill="#0b1220" stroke="#000" stroke-width="2"/><path d="M68,52 L106,54 L106,60 L70,60 Z" fill="#7dd3fc" opacity=".35"/>
    <path d="M12,70 Q10,22 60,18 Q108,18 110,62 L110,84 Q110,94 98,94 L28,94 Q12,94 12,80 Z" fill="url(#${id}s)"/>
    ${h.num ? `<text x="36" y="86" font-family="Arial Black,Arial" font-weight="900" font-size="16" fill="${h.c2}" stroke="#000" stroke-width=".8">${v4Esc(h.num)}</text>` : ""}</svg>`;
}
function v4HelmetSet(k, v) { if (!v4Custom()) return; v4Helmet()[k] = v; render(); }
function v4HelmetCardHtml() {
  const h = v4Helmet();
  if (!v4Custom()) return `<h2>🪖 Casco</h2><div class="v4-helm-row">${v4HelmetSvg(h, 110)}<p class="small">Corrés con un casco con los colores de ${v4Esc(s.team)} y tu número. El diseño propio está disponible para pilotos personalizados.</p></div>`;
  return `<h2>🪖 Tu casco</h2><div class="v4-helm-row">${v4HelmetSvg(h, 150)}<div class="v4-helm-ed">
    <label>Color principal <input type="color" value="${h.c1}" onchange="v4HelmetSet('c1', this.value)"></label>
    <label>Color del diseño <input type="color" value="${h.c2}" onchange="v4HelmetSet('c2', this.value)"></label>
    <label>Diseño <select onchange="v4HelmetSet('pat', this.value)">${Object.entries(V4_PAT).map(([k, v]) => `<option value="${k}" ${h.pat === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
    <label>Número <input type="text" maxlength="2" value="${v4Esc(h.num)}" onchange="v4HelmetSet('num', this.value.replace(/[^0-9]/g,'').slice(0,2))"></label>
    <span class="small">Se ve en el podio, en la transmisión y en el salón de la fama.</span></div></div>`;
}

/* ============================ 🎵 MÚSICA DE MENÚ POR ÉPOCA ============================ */
const V4_MUS = {
  50: { n: "Años 50-60 · swing", bpm: 120, bass: [0, 4, 7, 9, 12, 9, 7, 4], lead: [12, null, 16, null, 19, 16, null, 12], wave: "triangle", root: 220 },
  70: { n: "Años 70 · funk", bpm: 104, bass: [0, null, 0, 12, null, 10, 7, null], lead: [null, 15, null, 12, 15, null, 17, null], wave: "square", root: 196 },
  80: { n: "Años 80 · synth", bpm: 118, bass: [0, 0, 12, 0, 0, 12, 7, 10], lead: [12, 15, 19, 24, 19, 15, 12, 15], wave: "sawtooth", root: 174.6 },
  90: { n: "Años 90-2000 · rock", bpm: 132, bass: [0, 0, 0, 0, 5, 5, 3, 3], lead: [12, null, 12, 15, 17, null, 15, 12], wave: "square", root: 164.8 },
  10: { n: "Era moderna · electrónica", bpm: 124, bass: [0, null, 0, null, 3, null, 5, null], lead: [12, 19, 15, 19, 12, 19, 22, 19], wave: "sawtooth", root: 146.8 }
};
let V4M = { on: false, timer: null, ctx: null, era: null, step: 0 };
function v4MusEra() { const y = parseInt(document.getElementById("startYear")?.value || "2026", 10); return y < 1970 ? 50 : y < 1980 ? 70 : y < 1990 ? 80 : y < 2010 ? 90 : 10; }
function v4MusWanted() {
  const setup = document.getElementById("setup"), intro = document.getElementById("introScreen");
  const menu = setup && !setup.classList.contains("hidden") && (!intro || intro.style.display === "none" || intro.classList.contains("intro-hidden"));
  return menu && s.soundOn !== false && localStorage.getItem("fw_menu_music") !== "off";
}
function v4MusStart() {
  if (V4M.timer) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  if (!V4M.ctx) V4M.ctx = new AC();
  if (V4M.ctx.state === "suspended") V4M.ctx.resume();
  V4M.era = v4MusEra(); V4M.step = 0;
  const tick = () => {
    if (!v4MusWanted()) { v4MusStop(); return; }
    const E = V4_MUS[v4MusEra()], c = V4M.ctx, t = c.currentTime + 0.02;
    const note = (semi, dur, type, vol) => { const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = type; o.frequency.value = E.root * Math.pow(2, semi / 12); f.type = "lowpass"; f.frequency.value = 1600; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f); f.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02); };
    const i = V4M.step % 8, beat = 60 / E.bpm / 2;
    if (E.bass[i] != null) note(E.bass[i] - 12, beat * 0.9, "triangle", 0.05);
    if (E.lead[i] != null && (V4M.step >> 3) % 2 === 1) note(E.lead[i], beat * 0.8, E.wave, 0.018);
    if (i % 2 === 0) { const b = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate), ch = b.getChannelData(0); for (let k = 0; k < ch.length; k++) ch[k] = (Math.random() * 2 - 1) * (1 - k / ch.length); const sN = c.createBufferSource(), g = c.createGain(); sN.buffer = b; g.gain.value = i === 0 ? 0.05 : 0.02; sN.connect(g); g.connect(c.destination); sN.start(t); }
    V4M.step++;
    const chip = document.getElementById("v4MusChip"); if (chip) chip.innerHTML = "🎵 " + E.n;
    V4M.timer = setTimeout(tick, beat * 1000);
  };
  V4M.timer = setTimeout(tick, 50);
}
function v4MusStop() { clearTimeout(V4M.timer); V4M.timer = null; }
function v4MusToggle() { const off = localStorage.getItem("fw_menu_music") === "off"; try { localStorage.setItem("fw_menu_music", off ? "on" : "off"); } catch (e) {} if (off) v4MusStart(); else v4MusStop(); v4MenuBox(); }

/* ============================ 🎯 DESAFÍOS ============================ */
const V4_CHAL = [
  { id: "rain", ic: "🌧️", t: "Remontada bajo la lluvia", d: "Largás último en Interlagos con lluvia fuerte. Terminá en el top 5.", trk: "Brasil", start: 99, wet: true, car: 70, goal: me => !me.status && me.pos <= 5 },
  { id: "lead", ic: "🛡️", t: "Defender la punta", d: "Largás desde la pole con un auto más lento que los de atrás. Ganá la carrera.", trk: "Mónaco", start: 1, car: 62, goal: me => me.pos === 1 && !me.status },
  { id: "title", ic: "👑", t: "Final por el título", d: "Última fecha en Abu Dhabi. Estás 8 puntos atrás del líder. Salí campeón.", trk: "Abu Dhabi", start: 4, car: 82, title: true, goal: me => !me.status && v4ChalTitleOk(me) },
  { id: "rookie", ic: "🌱", t: "Debut de novato", d: "Primer GP con el auto más lento de la grilla. Sumá al menos un punto.", trk: "Australia", start: 18, car: 30, goal: me => !me.status && me.pos <= 10 },
  { id: "monza", ic: "🍝", t: "Rebufo en Monza", d: "Largás P8 en el templo de la velocidad. Terminá en el podio.", trk: "Italia", start: 8, car: 78, goal: me => !me.status && me.pos <= 3 }
];
function v4ChalDone() { try { return JSON.parse(localStorage.getItem("fw_chal") || "{}"); } catch (e) { return {}; } }
function v4ChalTitleOk(me) {
  const C = s.challenge; if (!C || !C.rival) return false;
  const mine = (C.myPts || 0) + (me.pts || 0);
  const g = s._v4Grid;
  const rv = (g || []).find(e => e.name === C.rival);
  const theirs = (C.rivalPts || 0) + (rv ? rv.pts || 0 : 0);
  return mine > theirs;
}
function v4ChalOpen() {
  let ov = document.getElementById("v4Chal");
  if (!ov) { ov = document.createElement("div"); ov.id = "v4Chal"; ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("show"); }); document.body.appendChild(ov); }
  const done = v4ChalDone();
  ov.innerHTML = `<div class="v4-chal-card"><div class="hof-k">🎯 DESAFÍOS</div><h2>Situaciones para rejugar</h2><p class="small">Una sola carrera, en modo piloto, con una meta. Cada desafío superado te da una medalla.</p>
    <p class="small">✅ Superados: ${V4_CHAL.filter(c => done[c.id]).length}/${V4_CHAL.length}</p>
    <div class="v4-chal-list">${[...new Set(V4_CHAL.map(c => c.era || "Hoy"))].map(era => `<div class="v4-chal-era">${era}</div>` + V4_CHAL.filter(c => (c.era || "Hoy") === era).map(c => `<button type="button" class="choice-card" onclick="v4ChalStart('${c.id}')"><b>${c.ic} ${c.t} ${done[c.id] ? "✅" : ""}</b><span class="small">${c.d}</span></button>`).join("")).join("")}</div>
    <button type="button" class="lv-btn" onclick="document.getElementById('v4Chal').classList.remove('show')">Cerrar</button></div>`;
  ov.classList.add("show");
}
function v4ChalStart(id) {
  const C = V4_CHAL.find(c => c.id === id); if (!C) return;
  document.getElementById("v4Chal")?.classList.remove("show");
  const decEl = document.getElementById("decade"), ysEl = document.getElementById("startYear");
  const keepDec = decEl ? decEl.value : null, keepYear = ysEl ? ysEl.value : null;
  try {
    setPlayMode("solo"); setMode("actual"); mcPickRole("driver");
    const yr = C.year || 2026;
    const dec = document.getElementById("decade");
    if (dec) { const dv = String(Math.floor(yr / 10) * 10); if ([...dec.options].some(o => o.value === dv)) { dec.value = dv; try { updateYearOptions(); } catch (e) {} } }
    const ys = document.getElementById("startYear"); if (ys) { ys.value = String(yr); try { refreshTeamLists(); } catch (e) {} }
    const dt = document.getElementById("driverTypeSel"); if (dt) dt.value = "actual";
    refreshDriverPickList();
    start();
  } catch (e) { console.warn("[FAWIWE] desafío:", e); return; }
  // el menú vuelve a quedar como estaba (año y década)
  try { if (decEl && keepDec) { decEl.value = keepDec; updateYearOptions(); } if (ysEl && keepYear) ysEl.value = keepYear; } catch (e) {}
  // escenario
  s.challenge = { id, done: false };
  s.drvC = { team: s.team, salary: 5, years: 1, start: s.season, opt: null, sponsor: 0, spot: "casco", clause: null, clauseLabel: "Sin cláusula", events: 3, brands: false, terminated: false, expired: false, checked: {} };
  s.preseason = s.season; s.preseasonRes = null;
  s.calSeed = s.calSeed || 1;
  try { calApply(true); } catch (e) {}
  let gi = trackData.findIndex(t => t.name === C.trk);
  const slot = C.title ? 9 : 0;
  if (gi >= 0 && gi !== slot) { const tmp = trackData[slot]; trackData[slot] = trackData[gi]; trackData[gi] = tmp; gi = slot; }
  else if (gi < 0) { const P = CAL_POOL.find(c => c.n === C.trk) || {}; trackData[slot] = { name: C.trk, laps: P.laps || 58, record: P.rec || "1:30.000" }; gi = slot; }
  s.gp = gi;
  s.car = C.car;
  s.session = 3; s.raceDone = false; s.quizDone = true;
  if (C.wet) { const w = (typeof weatherOptions !== "undefined" ? weatherOptions : []).find(x => x.wet && /fuerte/i.test(x.label)) || (typeof weatherOptions !== "undefined" ? weatherOptions.find(x => x.wet) : null); if (w) s.weather = w; s.weekendForecast = null; }
  // orden de largada
  s._simulatingBackground = false;
  const q = simulateGrid("quali");
  const names = q.map(x => x.name).filter(n => n !== s.playedDriverName);
  names.splice(Math.min(names.length, Math.max(0, C.start - 1)), 0, s.playedDriverName);
  s._dlQuali = { key: s.season + "_" + s.gp, names };
  s._qlKey = s.season + "_" + s.gp;
  s.qualiPos = names.indexOf(s.playedDriverName) + 1;
  if (C.title) {
    if (!s.driverPoints) initDriverStandings();
    const rival = names.find(n => n !== s.playedDriverName && !(myTeamLineup().some(d => d.name === n))) || names[0];
    const gap = C.gap || 8;
    s.challenge.rival = rival; s.challenge.myPts = 300; s.challenge.rivalPts = 300 + gap;
    s.driverPoints[s.playedDriverName] = 300; s.driverPoints[rival] = 300 + gap;
  }
  add("🎯 DESAFÍO: " + C.ic + " " + C.t + " — " + C.d);
  render();
  setTimeout(() => { try { fwRadioSay("Desafío: " + C.d, "eng"); } catch (e) {} }, 400);
}
function v4ChalCheck(grid) {
  const C = s.challenge; if (!C || C.done) return;
  const D = V4_CHAL.find(c => c.id === C.id); if (!D) return;
  const me = grid.find(e => e.mine && e.seat === 1); if (!me) return;
  C.done = true;
  let ok = false; try { ok = !!D.goal(me); } catch (e) {}
  if (ok) { const d = v4ChalDone(); d[C.id] = s.season; try { localStorage.setItem("fw_chal", JSON.stringify(d)); } catch (e) {} }
  add(ok ? "🎯✅ ¡DESAFÍO SUPERADO! " + D.t + "." : "🎯❌ Desafío no superado: " + D.t + ". Podés volver a intentarlo desde el menú.");
  setTimeout(() => { try { const box = document.getElementById("resultGridTable"); if (box) box.insertAdjacentHTML("afterbegin", `<div class="v4-chal-res ${ok ? "ok" : "bad"}">${ok ? "🎯✅ ¡DESAFÍO SUPERADO!" : "🎯❌ Desafío no superado"} · ${v4Esc(D.t)} <button type="button" class="lv-btn" onclick="returnToMenu()">Volver al menú</button></div>`); } catch (e) {} }, 50);
}

/* ============================ 🕰️ TODA UNA VIDA + ⚡ TEMPORADA RÁPIDA ============================ */
function v4Lifetime() {
  try { setPlayMode("solo"); setMode("actual"); mcPickRole("engineer"); } catch (e) {}
  const dec = document.getElementById("decade");
  if (dec && [...dec.options].some(o => o.value === "1970")) { dec.value = "1970"; try { updateYearOptions(); } catch (e) {} }
  const ys = document.getElementById("startYear");
  if (ys) { const opt = [...ys.options].map(o => +o.value).filter(Boolean); const y = opt.includes(1975) ? 1975 : Math.min(...opt.filter(v => v >= 1970)); ys.value = String(y); try { refreshTeamLists(); } catch (e) {} }
  window._v4Life = true;
  const n = document.getElementById("v4MenuNote"); if (n) n.textContent = "🕰️ Listo: arrancás en " + (ys ? ys.value : "1975") + " como jefe de equipo. Poné tu nombre y empezá: vas a vivir todas las épocas hasta hoy.";
  document.getElementById("teamSetup")?.scrollIntoView({ behavior: "smooth" });
}
function v4ShortToggle() { window._v4Short = !window._v4Short; v4MenuBox(); }
const V4_SHORT = [0, 2, 4, 6, 9];
function v4EraName(y) { try { let e = FW_ERAS[0]; FW_ERAS.forEach(x => { if (y >= x.y) e = x; }); return e; } catch (e) { return null; } }
function v4SimGP() {
  // simula un GP completo sin jugarlo (temporada rápida)
  const keepLive = s.drvLive, keepQ = s.qlLive;
  window._v4SimUntil = Date.now() + 2000;
  s.drvLive = false; s.qlLive = false; s._dlSkip = true;
  let eng = null; try { eng = engEnsure(); } catch (e) {}
  const rv = eng ? eng.raceView : null;
  try {
    if (eng) eng.raceView = "instant";
    s.session = 3; s.raceDone = false; s.miniStarted = false; s.advancing = false;
    finishRace();
  } catch (e) { console.warn("[FAWIWE] temporada rápida:", e); }
  finally { s.drvLive = keepLive; s.qlLive = keepQ; s._dlSkip = false; if (eng) eng.raceView = rv; }
  try { document.getElementById("resultOverlay")?.classList.remove("show"); v3PodClose(); s.pendingPress = null; const po = document.getElementById("pressOverlay"); if (po) po.style.display = "none"; } catch (e) {}
}

/* ============================ 🧭 TUTORIAL DE LA TRANSMISIÓN ============================ */
function v4Coach(key, steps, onDone) {
  let seen = {}; try { seen = JSON.parse(localStorage.getItem("fw_coach") || "{}"); } catch (e) {}
  if (seen[key]) return false;
  let i = 0;
  let ov = document.getElementById("v4Coach");
  if (!ov) { ov = document.createElement("div"); ov.id = "v4Coach"; document.body.appendChild(ov); }
  const show = () => {
    const st = steps[i], el = st.sel ? document.querySelector(st.sel) : null;
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2 - 10, top: innerHeight / 2 - 10, width: 20, height: 20 };
    const below = r.top + r.height + 170 < innerHeight;
    ov.innerHTML = `<div class="v4-spot" style="left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px"></div>
      <div class="v4-tip" style="left:${Math.max(10, Math.min(innerWidth - 330, r.left))}px;top:${below ? r.top + r.height + 14 : Math.max(10, r.top - 160)}px"><b>${st.t}</b><p>${st.d}</p><div><span class="small">${i + 1}/${steps.length}</span><button type="button" class="lv-btn red" id="v4CoachNext">${i < steps.length - 1 ? "Siguiente ▶" : "¡Entendido!"}</button></div></div>`;
    ov.classList.add("show");
    document.getElementById("v4CoachNext").onclick = () => { i++; if (i >= steps.length) { ov.classList.remove("show"); seen[key] = 1; try { localStorage.setItem("fw_coach", JSON.stringify(seen)); } catch (e) {} if (onDone) onDone(); } else show(); };
  };
  show();
  return true;
}

/* ============================ ♿ ACCESIBILIDAD ============================ */
function v4A11y() { try { return JSON.parse(localStorage.getItem("fw_a11y") || "{}"); } catch (e) { return {}; } }
function v4A11ySet(k, v) {
  const A = v4A11y(); A[k] = v; try { localStorage.setItem("fw_a11y", JSON.stringify(A)); } catch (e) {}
  v4A11yApply(); try { render(); } catch (e) {}
}
function v4A11yApply() {
  const A = v4A11y();
  document.documentElement.style.fontSize = A.text === "xl" ? "125%" : A.text === "l" ? "112%" : "";
  document.body.classList.toggle("fw-reduce", !!A.motion);
  document.body.classList.toggle("fw-contrast", !!A.contrast);
  try { const f = A.voice === "slow" ? 0.8 : A.voice === "fast" ? 1.15 : 1; Object.values(FW_WHO).forEach(w => { if (w._r == null) w._r = w.rate; w.rate = w._r * f; }); } catch (e) {}
}
function v4A11yHtml() {
  const A = v4A11y();
  const sel = (k, opts) => `<select onchange="v4A11ySet('${k}', this.value)">${opts.map(([v, l]) => `<option value="${v}" ${String(A[k] || "") === v ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  return `<h2>♿ Accesibilidad</h2><div class="v4-a11y">
    <label>🔠 Tamaño del texto ${sel("text", [["", "Normal"], ["l", "Grande"], ["xl", "Muy grande"]])}</label>
    <label>🎙️ Velocidad de la voz de radio ${sel("voice", [["", "Normal"], ["slow", "Más lenta"], ["fast", "Más rápida"]])}</label>
    <label class="ng-check"><input type="checkbox" ${A.motion ? "checked" : ""} onchange="v4A11ySet('motion', this.checked)"> <span>Menos animaciones (sin confeti, lluvia ni parpadeos)</span></label>
    <label class="ng-check"><input type="checkbox" ${A.contrast ? "checked" : ""} onchange="v4A11ySet('contrast', this.checked)"> <span>Más contraste en los textos</span></label>
  </div>`;
}

/* ============================ tarjetas ============================ */
function v4BossCardHtml() {
  const B = v4Boss(), drv = v4Drv();
  return `<h2>👔 ${drv ? "Jefe de equipo" : "Dueño del equipo"}</h2>
    <div class="v4-boss"><div class="v4-boss-av">${B.name.split(" ").map(x => x[0]).join("")}</div><div><b>${v4Esc(B.name)}</b> <span class="small">· ${v4Esc(s.team)}</span>
    <div class="home-bar"><i style="width:${B.mood}%;background:${B.mood >= 65 ? "#22c55e" : B.mood >= 40 ? "#facc15" : "#ef4444"}"></i></div>
    <span class="small">${B.mood >= 75 ? "😄 Está feliz con vos" : B.mood >= 50 ? "🙂 Conforme" : B.mood >= 30 ? "😐 Te mira con lupa" : "😠 Muy enojado: tu puesto corre peligro"} (${B.mood}/100)</span></div></div>
    ${B.last ? `<p class="v4-quote">«${v4Esc(B.last)}»</p>` : `<p class="small">Después de cada carrera te va a decir lo que piensa.</p>`}`;
}
function v4SocialCardHtml() {
  const S = v4Social();
  return `<h2>📱 Redes sociales</h2><div class="v4-soc-top"><b>${v4Fmt(S.followers)}</b> seguidores ${S.last ? `<span class="${S.last >= 0 ? "up" : "down"}">${S.last >= 0 ? "▲" : "▼"} ${v4Fmt(Math.abs(S.last))}</span>` : ""}</div>
    ${S.posts.length ? `<div class="v4-posts">${S.posts.slice(0, 5).map(p => `<div class="v4-post"><b>${v4Esc(p.u)}</b><p>${v4Esc(p.t)}</p><span>❤️ ${v4Fmt(p.l)}</span></div>`).join("")}</div>` : `<p class="small">Cuando corras, los fans van a reaccionar acá.</p>`}`;
}
function v4MgrCardHtml() {
  const M = v4Mgr();
  if (!M) return `<h2>🤵 Mánager personal</h2><p class="small">Un mánager negocia por vos (contratos un 6% mejores), te consigue un sponsor personal por temporada y te avisa qué equipos te quieren. Cuesta $0,5M por temporada.</p><button type="button" onclick="v4MgrHire()">🤵 Contratar mánager</button>`;
  const want = v4MgrIntel();
  return `<h2>🤵 Tu mánager: ${v4Esc(M.name)}</h2>
    <p>📡 Equipos interesados en vos: <b>${want.length ? want.map(v4Esc).join(", ") : "por ahora ninguno"}</b></p>
    <p class="small">✍️ Tus próximos contratos salen un 6% mejores.</p>
    <div class="v4-row"><button type="button" ${M.sponsorSeason === s.season ? "disabled" : ""} onclick="v4MgrSponsor()">💼 ${M.sponsorSeason === s.season ? "Sponsor de esta temporada conseguido" : "Buscar sponsor personal"}</button><button type="button" class="dark" onclick="v4MgrFire()">Despedir</button></div>`;
}
function v4MenuBox() {
  const setup = document.getElementById("setup"); if (!setup) return;
  let box = document.getElementById("v4MenuBox");
  if (!box) {
    box = document.createElement("div"); box.id = "v4MenuBox"; box.className = "v4-menu";
    const anchor = document.getElementById("mcNews") || document.querySelector("#setup .mc-hero") || setup.firstElementChild;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling); else setup.appendChild(box);
  }
  const mOff = localStorage.getItem("fw_menu_music") === "off";
  box.innerHTML = `<div class="v4-menu-h">🎮 MÁS FORMAS DE JUGAR</div><div class="v4-menu-g">
    <button type="button" onclick="v4ChalOpen()"><b>🎯 Desafíos</b><span>Situaciones para rejugar en una carrera</span></button>
    <button type="button" onclick="v4Lifetime()"><b>🕰️ Toda una vida</b><span>Arrancá en los 70 y viví todas las épocas</span></button>
    <button type="button" class="${window._v4Short ? "on" : ""}" onclick="v4ShortToggle()"><b>⚡ Temporada rápida ${window._v4Short ? "✓" : ""}</b><span>Jugás 5 GP por temporada, el resto se simula</span></button>
    <button type="button" class="${mOff ? "" : "on"}" onclick="v4MusToggle()"><b>🎵 Música de época ${mOff ? "" : "✓"}</b><span id="v4MusChip">Cambia según el año que elijas</span></button>
  </div><p class="small" id="v4MenuNote"></p>`;
}

/* ============================ ganchos ============================ */
(function () {
  try { if (typeof DASH_NAV !== "undefined") { const g = DASH_NAV.find(x => x[0] === "MÁS"); if (g && !g[1].find(i => i[0] === "JEF")) g[1].unshift(["JEF", "Jefe de equipo", "#v4BossCard"], ["RED", "Redes sociales", "#v4SocialCard"], ["MAN", "Mánager", "#v4MgrCard"], ["CSC", "Casco", "#v4HelmetCard"], ["ACC", "Accesibilidad", "#v4A11yCard"]); } } catch (e) {}
  // eventos del paddock: no interrumpen las transmisiones
  const tai = window.triggerAIEventIfNeeded;
  if (typeof tai === "function") window.triggerAIEventIfNeeded = function () {
    const busy = ["dlOverlay", "qlOverlay", "engLiveOverlay", "podOverlay"].some(id => { const el = document.getElementById(id); return el && el.classList.contains("show"); });
    if (busy) return false;
    return tai.apply(this, arguments);
  };
  // resultado de carrera: jefe, redes, compañero, medallas, gráfico, repetición, desafío
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kind, title, sub, cls, grid) {
    const r = sb.apply(this, arguments);
    try {
      if (/^CARRERA/.test(String(kind)) && Array.isArray(grid) && !s.player2 && s._v4ResKey !== s.season + "_" + s.gp) {
        s._v4ResKey = s.season + "_" + s.gp;
        const me = v3MyRace(grid);
        s._v4Grid = grid.map(e => ({ name: e.name, pos: e.pos, pts: e.pts, status: e.status || null }));
        const bossMsg = v4BossReact(me);
        v4SocialRace(me);
        v4MateUpdate(grid);
        if (me && !me.status && me.pos === 1) {
          if (s.weather && s.weather.wet) s._rainWins = (s._rainWins || 0) + 1;
          if ((s.qualiPos || 0) >= 10) s._comebackWin = true;
        }
        if (s._dl && s._dl.duel && s._dl.duel.res !== "lose" && s._dl.key === s.season + "_" + s.gp) { const D = s._dl.duel; if ((D.res === "gain") || D.res === "keep") s._duelWins = (s._duelWins || 0) + (D.res === "gain" || D.res === "keep" ? 1 : 0); }
        if (s.challenge) v4ChalCheck(grid);
        const box = document.getElementById("resultGridTable");
        if (box) {
          const d = v4Drv() ? window.dlLastData : (typeof engLastLaps !== "undefined" ? engLastLaps : null);
          let extra = "";
          if (bossMsg) extra += `<div class="v4-boss-res"><b>👔 ${v4Esc(v4Boss().name)}:</b> «${v4Esc(bossMsg)}»</div>`;
          if (d && d.key === s.season + "_" + s.gp) extra += v4Chart(d);
          if (v4Drv() && window.dlLastData && s._dl && s._dl.highlights && s._dl.highlights.length) extra += `<button type="button" class="lv-btn" style="margin:0 0 10px" onclick="v4Replay()">🎬 Ver repetición de tu mejor momento</button>`;
          const sum = box.querySelector(".dl-sum");
          if (sum) sum.insertAdjacentHTML("afterend", extra); else box.insertAdjacentHTML("afterbegin", extra);
        }
      }
    } catch (e) { console.warn("[FAWIWE] v134:", e); }
    return r;
  };
  // sprint ganada
  if (typeof dlSprintScore === "function") { const o = dlSprintScore; dlSprintScore = function () { const r = o.apply(this, arguments); try { const me = DL && DL.grid.find(x => x.mine && x.seat === 1); if (me && me.pos === 1 && !me.status) s._sprintWins = (s._sprintWins || 0) + 1; } catch (e) {} return r; }; }
  // mánager: contratos mejores
  const tm = window.ngDrvTeamMax;
  if (typeof tm === "function") window.ngDrvTeamMax = function () { const v = tm.apply(this, arguments); return v4Mgr() ? Math.round(v * 1.06 * 10) / 10 : v; };
  // nueva temporada: era nueva, título con auto lento, mánager cobra, temporada rápida
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const ps = s.season, titles = s.titles || 0, car = s.car;
    const r = ng.apply(this, arguments);
    try {
      if ((s.titles || 0) > titles && car < 70) s._slowTitle = true;
      if (s.season !== ps) {
        const a = v4EraName(ps), b = v4EraName(s.season);
        if (a && b && a.y !== b.y) { add("🕰️ ¡NUEVA ERA EN LA F1! " + s.season + ": " + b.cap + "."); try { v3Moment("🕰️ Viviste el cambio de era: " + b.cap, s.season); } catch (e) {} }
        const M = v4Mgr(); if (M && M.paid !== s.season) { M.paid = s.season; s.money = Math.round(((s.money || 0) - 0.5) * 100) / 100; add("🤵 Le pagaste $0,5M a tu mánager por esta temporada."); }
      }
      // temporada rápida: los GP que no se juegan se simulan solos
      let guard = 0;
      while (s.shortSeason && !s.gameOver && !V4_SHORT.includes(s.gp) && guard++ < 6) {
        const before = s.season + "_" + s.gp;
        v4SimGP();
        add("⚡ Temporada rápida: se simuló el GP de " + ((trackData[s.gp] || {}).name || "") + ".");
        ng.apply(this, []);
        if (s.season + "_" + s.gp === before) break;
      }
    } catch (e) { console.warn("[FAWIWE] v134 nextGP:", e); }
    return r;
  };
  // el juego empieza: marcar modos elegidos en el menú
  const st = window.start;
  if (typeof st === "function") window.start = function () {
    try { V5_KEYS.forEach(k => { delete s[k]; }); } catch (e) {}
    const r = st.apply(this, arguments);
    try {
      if (window._v4Life) { s.lifetime = true; window._v4Life = false; add("🕰️ Modo Toda una vida: arrancás en " + s.season + ". Vas a atravesar todas las eras de la F1."); }
      if (window._v4Short) { s.shortSeason = true; add("⚡ Temporada rápida: jugás 5 GP por temporada (el resto se simula)."); }
      v4MusStop();
    } catch (e) {}
    return r;
  };
  // render: tarjetas
  const rd = window.render;
  if (typeof rd === "function") window.render = function () {
    const x = rd.apply(this, arguments);
    try {
      const on = v3Game() && !s.player2, drv = v4Drv();
      v3Card("v4BossCard", v4BossCardHtml, on, "#rlRelCard, #homeCard, #jobCard");
      v3Card("v4SocialCard", v4SocialCardHtml, on, "#v4BossCard");
      v3Card("v4MgrCard", v4MgrCardHtml, on && drv, "#v4SocialCard");
      v3Card("v4HelmetCard", v4HelmetCardHtml, on && drv, "#v4MgrCard, #v4SocialCard");
      const setH = [...document.querySelectorAll('#game h2 [data-i18n="title_settings"]')].map(e => e.closest(".card"))[0];
      if (setH && !setH.id) setH.id = "fwSettingsCard";
      v3Card("v4A11yCard", v4A11yHtml, v3Game(), "#fwSettingsCard, #hofCard");
      const sub = document.getElementById("dashSub");
      if (sub && on && (s.shortSeason || s.lifetime) && !/RÁPIDA|TODA UNA VIDA/.test(sub.textContent)) sub.textContent += (s.shortSeason ? " · ⚡ TEMPORADA RÁPIDA" : "") + (s.lifetime ? " · 🕰️ TODA UNA VIDA" : "") + (s.challenge && !s.challenge.done ? " · 🎯 DESAFÍO" : "");
    } catch (e) { console.warn("[FAWIWE] v134 render:", e); }
    return x;
  };
  // casco: podio, transmisión y salón de la fama
  if (typeof v3Podium === "function") { const o = v3Podium; v3Podium = function () { const r = o.apply(this, arguments); try { document.querySelectorAll("#podOverlay .pod-step.mine .pod-cap").forEach(c => { if (s.playerMode === "driver") c.outerHTML = `<span class="pod-helm">${v4HelmetSvg(null, 64)}</span>`; }); } catch (e) {} return r; }; }
  if (typeof v3HofOpen === "function") { const o = v3HofOpen; v3HofOpen = function () { const r = o.apply(this, arguments); try { if (v4Drv()) { const p = document.querySelector("#hofOverlay .hof-plate"); if (p) p.innerHTML = v4HelmetSvg(null, 110); } } catch (e) {} return r; }; }
  if (typeof dlDraw === "function") { const o = dlDraw; dlDraw = function () { const r = o.apply(this, arguments); try { const row = [...document.querySelectorAll("#dlBoard .dl-row.mine .n")].find(n => n.textContent.indexOf(s.playedDriverName) >= 0); if (row && !row.querySelector(".v4-mini-helm")) row.insertAdjacentHTML("afterbegin", `<span class="v4-mini-helm">${v4HelmetSvg(null, 22)}</span>`); } catch (e) {} return r; }; }
  // tutorial: la primera transmisión y la primera clasificación en vivo
  if (typeof dlStart === "function") { const o = dlStart; dlStart = function () { const r = o.apply(this, arguments); try {
    if (DL && !DL.skip) setTimeout(() => { if (!DL || DL.phase !== "run") return; const prev = DL.phase; DL.phase = "coach"; const ok = v4Coach("dl", [
      { sel: "#dlBoard", t: "📺 La transmisión", d: "Acá ves la carrera vuelta por vuelta: posiciones, diferencias y paradas en boxes (🔧)." },
      { sel: "#dlMap", t: "🗺️ El mapa", d: "Los puntitos son los autos. El tuyo es el más grande, con borde blanco." },
      { sel: "#dlRadioBar", t: "📻 Tu radio", d: "Quejate con Q o cambiá la estrategia con T. También ves tus gomas y a tu ingeniero." },
      { sel: "#dlFeed", t: "🎬 Highlights", d: "Todo lo importante: pases, intentos, banderas y decisiones. Cuando el ingeniero te pregunte algo, la carrera se pausa." }
    ], () => { if (DL) { DL.phase = "run"; dlSchedule(); } }); if (!ok && DL) DL.phase = prev; }, 600);
  } catch (e) {} return r; }; }
  if (typeof qlStart === "function") { const o = qlStart; qlStart = function () { const r = o.apply(this, arguments); try {
    setTimeout(() => { if (!QL || QL.phase !== "run") return; QL.phase = "coach"; const ok = v4Coach("ql", [
      { sel: "#qlSess", t: "⏱️ Q1, Q2 y Q3", d: "La clasificación tiene tres tandas. En cada una quedan afuera los más lentos." },
      { sel: "#qlBoard", t: "✂️ Zona de eliminación", d: "Los que están debajo de la línea roja quedan eliminados si no mejoran." },
      { sel: "#qlFeed", t: "🔥 Última vuelta", d: "Si estás cerca del corte, vas a poder elegir salir a una última vuelta. Ojo con los límites de pista." }
    ], () => { if (QL) { QL.phase = "run"; qlSchedule(); } }); if (!ok && QL) QL.phase = "run"; }, 500);
  } catch (e) {} return r; }; }
  // saltar cierra el tutorial
  if (typeof dlSkip === "function") { const o = dlSkip; dlSkip = function () { document.getElementById("v4Coach")?.classList.remove("show"); if (DL && DL.phase === "coach") DL.phase = "run"; return o.apply(this, arguments); }; }
  if (typeof qlSkip === "function") { const o = qlSkip; qlSkip = function () { document.getElementById("v4Coach")?.classList.remove("show"); if (QL && QL.phase === "coach") QL.phase = "run"; return o.apply(this, arguments); }; }
  if (typeof v3Podium === "function") { const o = v3Podium; v3Podium = function () { if (window._v4SimUntil && Date.now() < window._v4SimUntil) return; return o.apply(this, arguments); }; }
  // menú: caja con los modos + música
  const addMenu = () => { try { v4MenuBox(); } catch (e) {} };
  if (document.readyState !== "loading") addMenu(); else document.addEventListener("DOMContentLoaded", addMenu);
  document.addEventListener("pointerdown", () => { try { if (v4MusWanted()) v4MusStart(); } catch (e) {} }, true);
  try { v4A11yApply(); } catch (e) {}
})();
