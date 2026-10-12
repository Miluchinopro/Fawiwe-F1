/* =====================================================================================
   FAWIWE · NEGOCIACIONES (estilo F1 Manager)
   - Modo Ingeniero (desde Jefe de Escudería): perfilar 30 días, negociar con el JEFE DE EQUIPO
     rival (compensación) y con el PILOTO (sueldo, años, opción 1+1 / 2+1, rol), con plazo de
     respuesta (inmediata o 7 días) y paciencia (si se enojan, 1 a 3 meses sin hablarte).
   - Modo Piloto: negociás TU contrato: sueldo por temporada (se aplica todos los años del
     contrato), paquete de patrocinio (pay driver), cláusula de rendimiento al parón de verano,
     derechos de imagen y opción de renovación.
   ===================================================================================== */
function ngAbsGP() { return (parseInt(s.season, 10) || 2026) * 20 + (s.gp || 0); }
function ngState() { if (!s.nego || typeof s.nego !== "object") s.nego = { people: {}, pend: [] }; if (!s.nego.people) s.nego.people = {}; if (!s.nego.pend) s.nego.pend = []; return s.nego; }
function ngPerson(id) { const st = ngState(); if (!st.people[id]) st.people[id] = { patience: 3, lockedUntil: 0, scout: 0, scoutAt: 0 }; return st.people[id]; }
function ngLockedGP(p) { return Math.max(0, (p.lockedUntil || 0) - ngAbsGP()); }
function ngR1(x) { return Math.round(x * 10) / 10; }
function ngHash(t) { return typeof fwHash === "function" ? fwHash(t) : Math.abs(deterministicHash(t)); }
function ngIsDriverMode() { return s.playerMode === "driver" && !!s.playedDriverName; }
function ngPend(kind, id) { return ngState().pend.find(p => p.kind === kind && p.id === id); }

/* ---------- barra con zona azul e indicador móvil ---------- */
// a = qué tan aceptable es la propuesta para el otro (1 = justo en el borde de la zona azul)
function ngPos(a) { return Math.max(1, Math.min(99, (a - 0.5) * 100)); }
function ngBarHtml(id, label) {
  return `<div class="ng-barwrap"><div class="ng-barlbl"><span>${label}</span><b id="${id}Txt">—</b></div>
    <div class="ng-bar" id="${id}"><i class="z r"></i><i class="z y"></i><i class="z b"></i><span class="ng-ind" id="${id}Ind"></span></div>
    <div class="ng-barlegend"><span>❌ Rechazo</span><span>🤔 Lo piensa</span><span>💙 Aceptable</span></div></div>`;
}
function ngSetBar(id, a, fuzzy) {
  const ind = document.getElementById(id + "Ind"), bar = document.getElementById(id), tx = document.getElementById(id + "Txt");
  if (!ind || !bar) return;
  ind.style.left = ngPos(a) + "%";
  bar.classList.toggle("fuzzy", !!fuzzy);
  if (tx) tx.textContent = a >= 1 ? "💙 Zona azul" : a >= 0.85 ? "🤔 Cerca" : "❌ Lejos";
  if (tx) tx.style.color = a >= 1 ? "#60a5fa" : a >= 0.85 ? "#facc15" : "#f87171";
}
function ngPatienceHtml(p) { return `<span class="ng-pat">Paciencia: ${[0, 1, 2].map(i => i < p.patience ? "●" : "○").join("")}</span>`; }

/* ---------- ventana ---------- */
function ngOpenModal(html, forced) {
  let ov = document.getElementById("ngOverlay");
  if (!ov) { ov = document.createElement("div"); ov.id = "ngOverlay"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="ng-card">${forced ? "" : `<button class="dark ng-x" onclick="ngClose()">✕</button>`}${html}</div>`;
  ov.classList.toggle("forced", !!forced);
  ov.classList.add("show");
}
function ngClose() { const ov = document.getElementById("ngOverlay"); if (ov) ov.classList.remove("show"); NG.cur = null; }
function ngResult(ok, title, txt) {
  const body = document.querySelector("#ngOverlay .ng-card");
  if (!body) return;
  body.innerHTML = `<div class="ng-result ${ok ? "ok" : "bad"}"><div class="ng-big">${ok ? "🖊️" : "📵"}</div><h2>${title}</h2><p>${txt}</p><button class="${ok ? "" : "dark"}" onclick="ngClose();render()">Continuar</button></div>`;
  try { if (typeof FWAudio !== "undefined") ok ? FWAudio.fanfare() : FWAudio.bad(); } catch (e) {}
}
const NG = { cur: null };
const NG_DEADLINE_HTML = `<div class="ng-sec"><h4>⏳ Plazo de respuesta</h4><div class="ng-radio">
  <label><input type="radio" name="ngDl" value="now" onchange="ngUpdate()"> ⚡ Inmediata <span class="small">(contestan ya, pero se ofenden fácil)</span></label>
  <label><input type="radio" name="ngDl" value="7d" checked onchange="ngUpdate()"> 📅 En 7 días <span class="small">(contestan en el próximo GP, con más paciencia)</span></label></div></div>`;
const NG_YEARS = [["1", "1 temporada", 1, ""], ["2", "2 temporadas", 2, ""], ["3", "3 temporadas", 3, ""], ["1+1", "1+1 (con opción)", 1, "opt"], ["2+1", "2+1 (con opción)", 2, "opt"]];
function ngYearsHtml(def) {
  return `<div class="ng-sec"><h4>📅 Duración y opción de renovación</h4><select id="ngYears" onchange="ngUpdate()">${NG_YEARS.map(y => `<option value="${y[0]}" ${y[0] === def ? "selected" : ""}>${y[1]}</option>`).join("")}</select>
    <div class="ng-radio" id="ngOptWrap"><label><input type="radio" name="ngOpt" value="team" checked onchange="ngUpdate()"> La opción la tiene el <b>equipo</b></label><label><input type="radio" name="ngOpt" value="driver" onchange="ngUpdate()"> La opción la tiene el <b>piloto</b></label></div>
    <p class="small">Con 1+1 o 2+1, quien tiene la opción decide si se agrega un año más antes de que venza.</p></div>`;
}
function ngVal(id) { const el = document.getElementById(id); return el ? el.value : null; }
function ngRadio(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; }
function ngYearsSel() {
  const v = ngVal("ngYears") || "2";
  const y = NG_YEARS.find(x => x[0] === v) || NG_YEARS[1];
  const w = document.getElementById("ngOptWrap"); if (w) w.style.display = y[3] ? "" : "none";
  return { years: y[2], opt: y[3] ? { type: y[0], holder: ngRadio("ngOpt") || "team", used: false } : null };
}

/* ===================================================================================
   MODO INGENIERO · fichajes negociados
   =================================================================================== */
function ngEngDriver(name) { return engGridDrivers().find(x => x.name === name); }
function ngEngExpect(d) { return Math.max(1, ngR1(d.base * 0.25)); }
function ngEngTPReq(d) { return ngR1(engBuyout(d) * (d.teamRating >= (s.stars || 1) ? 1.15 : 0.95)); }
function ngEngPrefYears(name) { return 1 + (ngHash("pref_" + name) % 3); }
function ngEngNoise(id) { return ((ngHash("noise_" + id + s.season) % 37) - 18) / 100; } // ±18% si no lo perfilaste
function ngOpenEng(name, renew) {
  const d = renew ? null : ngEngDriver(name);
  if (!renew && !d) return;
  if (!renew && !unlockedSet().has("drivers")) return add("🔒 Negociar fichajes se desbloquea en " + rankTiers[3][0] + ".");
  if (!renew && (s.drivers || []).length >= 2) return add("❌ Ya tenés dos pilotos fichados. Liberá un asiento primero.");
  const pid = "drv:" + name, p = ngPerson(pid);
  const lk = ngLockedGP(p);
  const c = renew ? (s.driverContracts || {})[name] : null;
  const base = renew ? Math.max(1, (c && c.baseSalary) || 8) : ngEngExpect(d);
  const pend = ngPend("eng", name);
  NG.cur = { kind: "eng", name, renew: !!renew, d, ex: renew ? ngR1(base * (1 + Math.min(0.4, ((s.driverPoints || {})[name] || 0) / 250))) : base, req: renew ? 0 : ngEngTPReq(d) };
  const team = renew ? s.team : d.team;
  const tpid = "tp:" + team, tp = ngPerson(tpid);
  const scouted = p.scout === 2 || renew;
  const head = `<div class="ng-head"><span class="bc-badge">F1</span><div><div class="ng-k">${renew ? "RENOVACIÓN DE CONTRATO" : "MESA DE NEGOCIACIÓN · FICHAJE"}</div><h2>${engEsc(name)}</h2>
    <div class="small">${renew ? "Tu piloto · contrato hasta " + (c.signedSeason + c.years - 1) : engEsc(d.team) + " · Rating " + Math.round(d.rating) + " · Cláusula " + engMoney(engBuyout(d))}</div></div></div>`;
  if (lk > 0 || (!renew && ngLockedGP(tp) > 0)) {
    const who = lk > 0 ? name : "el jefe de equipo de " + team;
    return ngOpenModal(head + `<div class="ng-result bad"><div class="ng-big">😠</div><h2>No te atiende</h2><p>${engEsc(who)} quedó ofendido con la última propuesta. Vuelve a hablar en <b>${Math.max(lk, ngLockedGP(tp))} GP</b> (≈ ${Math.max(lk, ngLockedGP(tp))} mes/es).</p><button class="dark" onclick="ngClose()">Cerrar</button></div>`);
  }
  if (pend) return ngOpenModal(head + `<div class="ng-result"><div class="ng-big">📨</div><h2>Propuesta enviada</h2><p>Esperando respuesta: llega después del próximo GP (plazo de 7 días).</p><button class="dark" onclick="ngClose()">Cerrar</button></div>`);
  const scoutHtml = renew ? "" : `<div class="ng-scout ${scouted ? "done" : ""}">${scouted ? "🔎 <b>Perfil completo:</b> conocés sus pretensiones reales — la zona azul es exacta." : p.scout === 1 ? "🔎 <b>Perfilando…</b> en 30 días (al terminar el próximo GP) vas a conocer sus pretensiones reales. Mientras tanto la zona azul es un <b>estimado</b>." : `🔎 <b>Sin perfilar:</b> la zona azul es un estimado (puede estar corrida). <button class="dark" onclick="ngScout(${engArg(name)})">Perfilar 30 días ($0.5M)</button>`}</div>`;
  const tpHtml = renew ? "" : `<div class="ng-sec"><h4>🤝 Jefe de equipo de ${engEsc(d.team)} ${ngPatienceHtml(tp)}</h4>
    <label class="small">Compensación por liberarlo: <b id="ngFeeV"></b></label><input type="range" id="ngFee" min="${ngR1(NG.cur.req * 0.4)}" max="${ngR1(NG.cur.req * 1.8)}" step="0.1" value="${ngR1(NG.cur.req * 0.8)}" oninput="ngUpdate()">
    ${ngBarHtml("ngBarTP", "Lo que opina el jefe de equipo")}</div>`;
  ngOpenModal(head + scoutHtml + tpHtml + `
    <div class="ng-sec"><h4>🧑‍✈️ ${engEsc(name)} ${ngPatienceHtml(p)}</h4>
      <label class="small">Sueldo por temporada: <b id="ngSalV"></b></label><input type="range" id="ngSal" min="${ngR1(NG.cur.ex * 0.4)}" max="${ngR1(NG.cur.ex * 2)}" step="0.1" value="${ngR1(NG.cur.ex * 0.75)}" oninput="ngUpdate()">
      <label class="small">Rol en el equipo</label><select id="ngRole" onchange="ngUpdate()"><option value="n1">🥇 Piloto N°1 (prioridad en las órdenes)</option><option value="eq" selected>⚖️ Igualdad</option><option value="n2">🥈 Piloto N°2 (ayuda al compañero)</option></select>
      ${ngBarHtml("ngBarDrv", "Lo que opina " + engEsc(name))}</div>
    ${ngYearsHtml("2")}${NG_DEADLINE_HTML}
    <div class="ng-sum" id="ngSum"></div>
    <div class="ng-actions"><button onclick="ngSendEng()">📨 Enviar propuesta</button><button class="dark" onclick="ngClose()">Cerrar</button></div>`);
  ngUpdate();
}
function ngEngAppeal() {
  const C = NG.cur;
  const sal = parseFloat(ngVal("ngSal")) || 0;
  const fee = parseFloat(ngVal("ngFee")) || 0;
  const role = ngVal("ngRole") || "eq";
  const ys = ngYearsSel();
  const pref = ngEngPrefYears(C.name);
  let aD = sal / C.ex;
  aD += C.renew ? 0 : ((s.stars || 1) - C.d.teamRating) * 0.08;
  aD += role === "n1" ? 0.08 : role === "n2" ? -0.07 : 0;
  aD -= Math.abs(ys.years - pref) * 0.04;
  if (ys.opt) aD += ys.opt.holder === "team" ? -0.06 : 0.05;
  aD += ((s.trust || 50) - 50) / 500;
  const p = ngPerson("drv:" + C.name);
  aD -= (3 - p.patience) * 0.04;
  const aT = C.renew ? 9 : fee / C.req - (3 - ngPerson("tp:" + C.d.team).patience) * 0.04;
  return { aD, aT, sal, fee, role, ys };
}
function ngUpdate() {
  if (!NG.cur) return;
  if (NG.cur.kind === "drv") return ngDrvUpdate();
  const A = ngEngAppeal(), C = NG.cur;
  const scouted = C.renew || ngPerson("drv:" + C.name).scout === 2;
  const nz = scouted ? 0 : ngEngNoise(C.name);
  const sv = document.getElementById("ngSalV"); if (sv) sv.textContent = engMoney(A.sal) + " / temporada";
  const fv = document.getElementById("ngFeeV"); if (fv) fv.textContent = engMoney(A.fee);
  ngSetBar("ngBarDrv", A.aD * (1 + nz), !scouted);
  if (!C.renew) ngSetBar("ngBarTP", A.aT, false);
  const tot = A.sal * (A.ys.years) + (C.renew ? 0 : A.fee);
  const sum = document.getElementById("ngSum");
  if (sum) sum.innerHTML = `Costo total: <b>${engMoney(tot)}</b>${C.renew ? "" : ` (compensación ${engMoney(A.fee)} + sueldos)`} · Presupuesto: <b>${engMoney(s.money)}</b>`;
}
function ngScout(name) {
  const p = ngPerson("drv:" + name);
  if (p.scout) return;
  if (s.money < 0.5) return add("❌ No te alcanza para perfilarlo.");
  s.money = ngR1(s.money - 0.5);
  p.scout = 1; p.scoutAt = ngAbsGP() + 1;
  add("🔎 Empezaste a perfilar a " + name + " durante 30 días: después del próximo GP vas a conocer sus pretensiones reales.");
  ngOpenEng(name);
}
function ngSendEng() {
  const C = NG.cur;
  if (!C) return;
  const A = ngEngAppeal();
  const dl = ngRadio("ngDl") || "7d";
  if (!C.renew && s.money < A.fee) return ngResult(false, "No te alcanza", "La compensación que ofrecés (" + engMoney(A.fee) + ") supera tu presupuesto.");
  const terms = { sal: A.sal, fee: A.fee, role: A.role, years: A.ys.years, opt: A.ys.opt };
  if (dl === "7d") {
    ngState().pend.push({ kind: "eng", id: C.name, renew: C.renew, team: C.renew ? s.team : C.d.team, terms, aD: A.aD, aT: A.aT, at: ngAbsGP() + 1 });
    add("📨 Le mandaste una propuesta a " + C.name + (C.renew ? "" : " y a " + C.d.team) + ". Contestan en 7 días (después del próximo GP).");
    return ngResult(true, "Propuesta enviada", "Van a contestar en 7 días: la respuesta llega después del próximo GP. Con este plazo son más tolerantes si quedaste cerca.");
  }
  ngResolveEng({ kind: "eng", id: C.name, renew: C.renew, team: C.renew ? s.team : C.d.team, terms, aD: A.aD, aT: A.aT }, false);
}
// strict = inmediata (sin tolerancia). 7 días: tolera hasta 5% abajo y si no, contraoferta.
function ngResolveEng(P, late) {
  const tol = late ? 0.05 : 0;
  const pd = ngPerson("drv:" + P.id), pt = ngPerson("tp:" + P.team);
  const okD = P.aD >= 1 - tol, okT = P.renew || P.aT >= 1 - tol;
  const show = (ok, t, x) => { add((ok ? "🖊️ " : "📵 ") + t + " — " + x.replace(/<[^>]+>/g, "")); if (!late) ngResult(ok, t, x); else ngNotice(ok, t, x); };
  if (okD && okT) {
    if (P.renew) {
      const c = (s.driverContracts || {})[P.id];
      if (!c) return;
      c.years = (s.season - c.signedSeason) + P.terms.years + 1; c.baseSalary = P.terms.sal; c.opt = P.terms.opt; c.role = P.terms.role;
      pd.patience = 3;
      return show(true, "¡Renovó!", `<b>${engEsc(P.id)}</b> sigue en ${engEsc(s.team)} hasta ${c.signedSeason + c.years - 1} por ${engMoney(P.terms.sal)} por temporada${P.terms.opt ? " (" + P.terms.opt.type + ", opción del " + (P.terms.opt.holder === "team" ? "equipo" : "piloto") + ")" : ""}.`);
    }
    const d = ngEngDriver(P.id);
    if (!d) return show(false, "Se cayó el fichaje", "El piloto ya no está disponible.");
    if ((s.drivers || []).length >= 2) return show(false, "Sin asiento libre", "Ya tenés dos pilotos fichados.");
    if (s.money < P.terms.fee) return show(false, "No te alcanza", "Cuando llegó el sí, ya no tenías la plata de la compensación.");
    ngEngSign(d, P.terms);
    pd.patience = 3; pt.patience = 3;
    return show(true, "¡Bombazo! Firmó con " + s.team, `<b>${engEsc(P.id)}</b> deja ${engEsc(d.team)}: compensación ${engMoney(P.terms.fee)} al jefe de equipo y ${engMoney(P.terms.sal)} por temporada durante ${P.terms.years}${P.terms.opt ? "+1" : ""} año(s). Rol: ${P.terms.role === "n1" ? "piloto N°1" : P.terms.role === "n2" ? "piloto N°2" : "igualdad"}.`);
  }
  // rechazo: quién y cuánto
  const angryOf = (pp, a) => { pp.patience = Math.max(0, pp.patience - 1); const angry = (!late && a < 0.85) || pp.patience <= 0; if (angry) { pp.lockedUntil = ngAbsGP() + 1 + (ngHash("lock" + P.id + ngAbsGP()) % 3); pp.patience = 2; } return angry; };
  const msgs = [];
  if (!okT) { const ang = angryOf(pt, P.aT); msgs.push(ang ? `😠 El jefe de equipo de ${engEsc(P.team)} se ofendió y no te atiende por ${ngLockedGP(pt)} GP (≈ meses).` : `🤝 El jefe de equipo de ${engEsc(P.team)} dice que no: ${late ? "pide al menos " + engMoney(ngR1(P.terms.fee / Math.max(0.3, P.aT))) + " de compensación." : "la compensación es poca."}`); }
  if (!okD) { const ang = angryOf(pd, P.aD); msgs.push(ang ? `😠 ${engEsc(P.id)} se enojó con la propuesta: no te habla por ${ngLockedGP(pd)} GP (≈ meses).` : `🧑‍✈️ ${engEsc(P.id)} dice que no: ${late ? "quiere cerca de " + engMoney(ngR1(P.terms.sal / Math.max(0.3, P.aD))) + " por temporada." : "esperaba más."}`); }
  show(false, "Rechazaron la propuesta", msgs.join("<br>"));
}
function ngEngSign(d, T) {
  const name = d.name;
  s.money = ngR1(s.money - T.fee); try { engRoundMoney(); } catch (e) {}
  if (!drivers.find(x => x[0] === name)) drivers.push([name, d.base, T.sal]);
  s.drivers.push(name);
  if (!s.driverContracts) s.driverContracts = {};
  s.driverContracts[name] = { years: T.years, signedSeason: s.season, baseSalary: T.sal, opt: T.opt, role: T.role };
  if (!s.driverPoints) initDriverStandings();
  if (!(name in s.driverPoints)) { s.driverPoints[name] = 0; s.driverWins[name] = 0; }
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
}
function ngEngExercise(name) {
  const c = (s.driverContracts || {})[name];
  if (!c || !c.opt || c.opt.used || c.opt.holder !== "team") return;
  c.opt.used = true; c.years += 1;
  add("✅ Ejecutaste la opción: " + name + " sigue un año más (hasta " + (c.signedSeason + c.years - 1) + ").");
  render();
}
// mercado y pilotos propios: cambia "Ofrecer contrato" por la negociación
(function () {
  const o = window.engTabDrivers;
  if (typeof o !== "function") return;
  window.engTabDrivers = function () {
    let h = o.apply(this, arguments);
    h = h.replace(/<button onclick="engApproach\(([^)]*)\)">Ofrecer contrato<\/button>/g, (m, arg) => {
      const nm = arg.slice(1, -1).replace(/\\'/g, "'").replace(/&quot;/g, '"').replace(/\\x3c/g, "<").replace(/\\\\/g, "\\");
      const p = ngPerson("drv:" + nm), lk = ngLockedGP(p), pend = ngPend("eng", nm);
      const tag = lk > 0 ? `<span class="small">😠 ${lk} GP</span> ` : pend ? `<span class="small">📨 esperando</span> ` : p.scout === 2 ? `<span class="small">🔎 perfilado</span> ` : p.scout === 1 ? `<span class="small">🔎 perfilando…</span> ` : "";
      return `${tag}<button onclick="ngOpenEng(${arg})">🤝 Negociar</button>`;
    });
    h = h.replace(/ · Chance ~\d+%/g, "");
    h = h.replace("Pagás la cláusula de rescisión y, si acepta, se viene con vos (su ex equipo sube a un novato). La forma, tu confianza y el nivel de tu equipo pesan en la respuesta.",
      "Estilo F1 Manager: <b>perfilalo 30 días</b> para conocer sus pretensiones reales, negociá la <b>compensación con su jefe de equipo</b> y el <b>contrato con el piloto</b> hasta que los indicadores queden en la <b>zona azul</b>. Con plazo de 7 días son más pacientes; si se ofenden, no te hablan por 1 a 3 meses.");
    // renovar / ejecutar opción para tus pilotos
    (s.drivers || []).forEach(name => {
      const c = (s.driverContracts || {})[name];
      if (!c) return;
      const last = s.season >= c.signedSeason + c.years - 1;
      const safe = engEsc(name);
      const btns = (last && c.opt && !c.opt.used && c.opt.holder === "team" ? `<button onclick="ngEngExercise(${engArg(name)})">✅ Ejecutar opción +1</button>` : "") +
        (last ? `<button class="dark" onclick="ngOpenEng(${engArg(name)},true)">✍️ Renovar</button>` : "");
      const optTxt = c.opt ? ` · ${c.opt.type} (opción del ${c.opt.holder === "team" ? "equipo" : "piloto"}${c.opt.used ? ", usada" : ""})` : "";
      const marker = `<b>${safe}</b>`;
      const i = h.indexOf(marker);
      if (i < 0) return;
      const j = h.indexOf("</div>", h.indexOf("</span>", i)) ;
      if (j < 0) return;
      h = h.slice(0, j) + (optTxt ? `<span class="small">${optTxt}</span>` : "") + h.slice(j, j + 6) + (btns ? `<div>${btns}</div>` : "") + h.slice(j + 6);
    });
    return h;
  };
})();
// opciones en manos del piloto: deciden solos al vencer
(function () {
  const o = window.processDriverContracts;
  if (typeof o !== "function") return;
  window.processDriverContracts = function () {
    (s.drivers || []).forEach(name => {
      const c = (s.driverContracts || {})[name];
      if (!c || !c.opt || c.opt.used) return;
      if (s.season >= c.signedSeason + c.years) {
        if (c.opt.holder === "driver") {
          const happy = ((s.driverPoints || {})[name] || 0) >= 20 || (s.stars || 1) >= 3;
          c.opt.used = true;
          if (happy) { c.years += 1; add("✍️ " + name + " ejecutó SU opción: se queda un año más."); }
          else add("👋 " + name + " no ejecutó su opción de +1: su contrato termina.");
        }
      }
    });
    return o.apply(this, arguments);
  };
})();

/* ===================================================================================
   MODO PILOTO · tu contrato
   =================================================================================== */
const NG_SPOTS = { casco: { label: "⛑️ Casco y buzo", mult: 1, conflict: 0 }, pontones: { label: "🏎️ Pontones", mult: 1.6, conflict: 0.04 }, aleron: { label: "🪧 Alerón trasero", mult: 2.2, conflict: 0.1 } };
const NG_CLAUSES = [["none", "Sin cláusula", 0, null], ["pts10", "10 puntos al parón de verano", 0.05, { k: "pts", v: 10 }], ["pts25", "25 puntos al parón de verano", 0.1, { k: "pts", v: 25 }], ["pts50", "50 puntos al parón de verano", 0.16, { k: "pts", v: 50 }],
  ["pos10", "Top 10 del campeonato al parón", 0.08, { k: "pos", v: 10 }], ["pos5", "Top 5 del campeonato al parón", 0.16, { k: "pos", v: 5 }]];
function ngOVR() { try { return Math.round(computeOVR()); } catch (e) { return s.playedDriverRating || 75; } }
function ngDrvTeamMax() {
  const ovr = ngOVR();
  let annual = 1;
  try { annual = ovrBasedAnnualSalaryUSD(ovr) / 1e6; } catch (e) { annual = Math.max(0.5, (ovr - 60) * 0.6); }
  let cur = 0;
  try { if (window.__ngSalOrig) cur = window.__ngSalOrig() * 10; } catch (e) {}
  return ngR1(Math.max(0.5, Math.max(annual, cur) * (0.85 + (s.stars || 1) * 0.07) * (1 + ((s.pop || 50) - 50) / 250)));
}
function ngDrvStar() { return ngOVR() >= 88; }
function ngDrvReqSponsor() { return ngDrvStar() ? 0 : ngR1(ngDrvSpCap("pontones") * Math.max(0, Math.min(0.75, (86 - ngOVR()) / 50))); }
function ngDrvSpCap(spot) { return ngR1((3 + (s.pop || 50) * 0.12) * (NG_SPOTS[spot] || NG_SPOTS.casco).mult); }
function ngDrvActive() {
  const c = s.drvC;
  return !!(c && c.team === s.team && !c.expired);
}
function ngDrvEndSeason(c) { return c.start + c.years - 1; }
function ngDrvMustSign() { const c = s.drvC; return ngIsDriverMode() && !s.player2 && (!c || c.team !== s.team || (c.expired && !c.optAsk)); }
function ngOpenDrv() {
  if (!ngIsDriverMode()) return;
  if (!ngDrvMustSign()) return add("📝 Tu contrato sigue vigente: no se puede tocar hasta que venza.");
  const forced = true;
  const pid = "team:" + s.team, p = ngPerson(pid);
  p.lockedUntil = 0;
  const lk = 0;
  const head = `<div class="ng-head"><span class="bc-badge">F1</span><div><div class="ng-k">${s.drvC && s.drvC.team === s.team ? "RENOVACIÓN OBLIGATORIA" : "TU PRIMER CONTRATO"} · NO PODÉS CORRER SIN FIRMAR</div><h2>${engEsc(s.team)}</h2><div class="small">${engEsc(s.playedDriverName)} · OVR ${ngOVR()}${ngDrvStar() ? " · ⭐ Superestrella" : ""} · Popularidad ${Math.round(s.pop || 50)}</div></div></div>`;
  if (lk > 0) return ngOpenModal(head + `<div class="ng-result bad"><div class="ng-big">😠</div><h2>El jefe de equipo no te atiende</h2><p>Quedó molesto con tu última propuesta. Vuelve a sentarse a negociar en <b>${lk} GP</b> (≈ ${lk} mes/es).</p><button class="dark" onclick="ngClose()">Cerrar</button></div>`);
  if (false && ngPend("drv", s.team)) return ngOpenModal(head + `<div class="ng-result"><div class="ng-big">📨</div><h2>Propuesta enviada</h2><p>${engEsc(s.team)} te contesta después del próximo GP (plazo de 7 días).</p><button class="dark" onclick="ngClose()">Cerrar</button></div>`);
  const max = ngDrvTeamMax(), req = ngDrvReqSponsor();
  NG.cur = { kind: "drv", max, req };
  const cap = ngDrvSpCap("pontones");
  ngOpenModal(head + `
    <div class="ng-sec"><h4>💰 Tu sueldo por temporada ${ngPatienceHtml(p)}</h4>
      <label class="small">Pedís: <b id="ngSalV"></b> <span id="ngSalTot" class="small"></span></label>
      <input type="range" id="ngSal" min="${ngR1(Math.max(0.2, max * 0.3))}" max="${ngR1(max * 2)}" step="0.1" value="${ngR1(max * 1.15)}" oninput="ngUpdate()">
      <p class="small">Se te paga en cada GP y se aplica <b>todas las temporadas</b> que dure el contrato.</p></div>
    ${ngYearsHtml("2")}
    <div class="ng-sec"><h4>💼 Paquete de patrocinio (pay driver)</h4>
      <p class="small">${req > 0 ? `Salvo las superestrellas, el equipo pide que tus sponsors pongan plata. <b>Te piden al menos ${formatMoney(req)} por temporada</b> a cambio del asiento y espacio publicitario en el auto.` : "⭐ Sos superestrella: no hace falta que traigas sponsors, pero si traés, el equipo lo valora."}</p>
      <label class="small">Lugar en el auto para tus sponsors</label><select id="ngSpot" onchange="ngDrvSpot()">${Object.entries(NG_SPOTS).map(([k, v]) => `<option value="${k}" ${k === "pontones" ? "selected" : ""}>${v.label} (hasta ${formatMoney(ngDrvSpCap(k))})</option>`).join("")}</select>
      <label class="small">Tus sponsors ponen: <b id="ngSpV"></b> por temporada</label><input type="range" id="ngSp" min="0" max="${cap}" step="0.1" value="${Math.min(cap, req)}" oninput="ngUpdate()">
      <p class="small">La plata va al equipo, que la invierte en el auto. Cuanto más visible el lugar, más ponen… pero choca más con los sponsors de la escudería.</p></div>
    <div class="ng-sec"><h4>📉 Cláusula de rendimiento</h4><select id="ngClause" onchange="ngUpdate()">${NG_CLAUSES.map(c => `<option value="${c[0]}">${c[1]}</option>`).join("")}</select>
      <p class="small">Si no cumplís el objetivo al <b>parón de verano (después del GP 5)</b>, el equipo puede rescindir tu contrato: te quedás de reserva cobrando 30% hasta fin de año. A cambio, aceptan pagarte más.</p></div>
    <div class="ng-sec"><h4>📸 Derechos de imagen</h4>
      <label class="small">Eventos comerciales del equipo por temporada: <b id="ngEvV"></b></label><input type="range" id="ngEv" min="0" max="10" step="1" value="3" oninput="ngUpdate()">
      <label class="ng-check"><input type="checkbox" id="ngBrands" onchange="ngUpdate()"> Mantener mis marcas personales (bebida, reloj, ropa) — te pagan aparte, pero pueden chocar con los sponsors del equipo</label>
      <p class="small">Cada evento suma popularidad pero te cansa un poco (−enfoque).</p></div>
    <div class="ng-sum" id="ngSum"></div>
    ${ngBarHtml("ngBarTeam", "Lo que opina " + engEsc(s.team))}
    <p class="small">⚠️ Lo que firmes queda fijo hasta que el contrato venza: no se puede renegociar antes.</p>
    <div class="ng-actions"><button onclick="ngSendDrv()">📨 Enviar propuesta</button></div>`, forced);
  ngUpdate();
}
function ngForcedReject(why, pat) {
  const body = document.querySelector("#ngOverlay .ng-card");
  if (!body) return;
  try { FWAudio.bad(); } catch (e) {}
  const msg = document.createElement("div");
  msg.className = "ng-result bad ng-inline";
  msg.innerHTML = `<h2>Rechazaron tu propuesta</h2><p>${why} Mové las condiciones hasta que el indicador quede en la <b>zona azul</b> y volvé a enviarla. Paciencia que les queda: <b>${"●".repeat(pat)}${"○".repeat(3 - pat)}</b>${pat === 1 ? " — ¡si te rechazan otra vez, te imponen el contrato!" : ""}</p>`;
  body.querySelectorAll(".ng-inline").forEach(x => x.remove());
  const act = body.querySelector(".ng-actions");
  if (act) act.parentNode.insertBefore(msg, act); else body.appendChild(msg);
  body.querySelectorAll(".ng-pat").forEach(x => { x.textContent = "Paciencia: " + "●".repeat(pat) + "○".repeat(3 - pat); });
  msg.scrollIntoView({ block: "center" });
}
function ngDrvSpot() {
  const spot = ngVal("ngSpot") || "casco", el = document.getElementById("ngSp");
  if (el) { el.max = ngDrvSpCap(spot); if (parseFloat(el.value) > parseFloat(el.max)) el.value = el.max; }
  ngUpdate();
}
function ngDrvTerms() {
  const ys = ngYearsSel();
  const cl = NG_CLAUSES.find(c => c[0] === ngVal("ngClause")) || NG_CLAUSES[0];
  return { sal: parseFloat(ngVal("ngSal")) || 0, years: ys.years, opt: ys.opt, sponsor: parseFloat(ngVal("ngSp")) || 0, spot: ngVal("ngSpot") || "casco", clause: cl[3], clauseId: cl[0], clauseBonus: cl[2], clauseLabel: cl[1], events: parseInt(ngVal("ngEv"), 10) || 0, brands: !!(document.getElementById("ngBrands") || {}).checked };
}
function ngDrvAppeal(T, C) {
  const ovr = ngOVR();
  let mult = 1 + T.clauseBonus + T.events * 0.012 - (T.brands ? 0.08 : 0) - (NG_SPOTS[T.spot] || NG_SPOTS.casco).conflict;
  if (T.opt) mult += T.opt.holder === "team" ? 0.07 : -0.07;
  mult += (ovr >= 82 ? 0.02 : -0.03) * (T.years - 1);
  const capRef = Math.max(1, C.req, ngDrvSpCap("pontones"));
  let worth = C.max * mult * (1 + (T.sponsor - C.req) / capRef * 0.35);
  let a = worth / Math.max(0.1, T.sal);
  if (C.req > 0 && T.sponsor < C.req) a *= 0.7 + 0.3 * (T.sponsor / C.req);
  a -= (3 - ngPerson("team:" + s.team).patience) * 0.04;
  return a;
}
function ngDrvUpdate() {
  const T = ngDrvTerms(), C = NG.cur;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("ngSalV", formatMoney(T.sal) + " por temporada");
  set("ngSalTot", "· " + formatMoney(T.sal / 10) + " por GP · total " + formatMoney(T.sal * T.years) + (T.opt ? " (+1 si se ejecuta la opción)" : ""));
  set("ngSpV", formatMoney(T.sponsor));
  set("ngEvV", T.events + (T.events === 1 ? " evento" : " eventos"));
  ngSetBar("ngBarTeam", ngDrvAppeal(T, C), false);
  const sum = document.getElementById("ngSum");
  if (sum) sum.innerHTML = `Resumen: <b>${formatMoney(T.sal)}</b>/temporada × ${T.years}${T.opt ? "+1 (" + (T.opt.holder === "team" ? "opción del equipo" : "tu opción") + ")" : ""} · sponsors ${formatMoney(T.sponsor)} en ${NG_SPOTS[T.spot].label} · ${T.clauseLabel} · ${T.events} eventos${T.brands ? " · con tus marcas" : ""}`;
}
function ngSendDrv() {
  const C = NG.cur; if (!C) return;
  const T = ngDrvTerms();
  const a = ngDrvAppeal(T, C);
  const dl = "now";
  if (dl === "7d") {
    ngState().pend.push({ kind: "drv", id: s.team, terms: T, a, at: ngAbsGP() + 1 });
    add("📨 Le mandaste tu propuesta de contrato a " + s.team + ". Contestan en 7 días (después del próximo GP).");
    return ngResult(true, "Propuesta enviada", "El equipo te contesta después del próximo GP. Con este plazo son más tolerantes si quedaste cerca de la zona azul.");
  }
  ngResolveDrv({ kind: "drv", id: s.team, terms: T, a }, false);
}
function ngResolveDrv(P, late) {
  const p = ngPerson("team:" + P.id);
  const show = (ok, t, x) => { add((ok ? "🖊️ " : "📵 ") + t + " — " + x.replace(/<[^>]+>/g, "")); if (!late) ngResult(ok, t, x); else ngNotice(ok, t, x); };
  if (P.id !== s.team) return;
  if (P.a >= (late ? 0.95 : 1)) {
    const T = P.terms;
    s.drvC = { team: s.team, salary: T.sal, years: T.years, start: s.season, opt: T.opt, sponsor: T.sponsor, spot: T.spot, clause: T.clause, clauseLabel: T.clauseLabel, events: T.events, brands: T.brands, terminated: false, expired: false, checked: {} };
    const boost = Math.min(6, Math.round(T.sponsor / 3));
    if (boost > 0) { s.car = clamp((s.car || 40) + boost); }
    p.patience = 3;
    return show(true, "¡Contrato firmado!", `Firmaste con <b>${engEsc(s.team)}</b> hasta ${s.season + T.years - 1}${T.opt ? " (" + T.opt.type + ")" : ""} por <b>${formatMoney(T.sal)}</b> por temporada.${boost ? " El equipo invierte la plata de tus sponsors: <b>+" + boost + " al auto</b>." : ""}`);
  }
  p.patience = Math.max(0, p.patience - 1);
  if (!late && ngDrvMustSign()) {
    if (p.patience <= 0) {
      const max = ngDrvTeamMax();
      s.drvC = { team: s.team, salary: ngR1(max * 0.7), years: 1, start: s.season, opt: null, sponsor: 0, spot: "casco", clause: null, clauseLabel: "Sin cláusula", events: 3, brands: false, terminated: false, expired: false, checked: {}, imposed: true };
      p.patience = 3;
      return ngResult(false, "El equipo te impuso el contrato", `Se les acabó la paciencia: firmás por <b>1 temporada</b> a <b>${formatMoney(s.drvC.salary)}</b> (70% de lo que valían pagarte), sin sponsors ni cláusulas. La próxima negociá mejor.`);
    }
    const body = document.querySelector("#ngOverlay .ng-card");
    if (body) { const btn = body.querySelector(".ng-result button"); }
    add("📵 " + s.team + " rechazó tu propuesta de contrato.");
    return ngForcedReject(P.a < 0.85 ? "Tu pedido les pareció exagerado." : "Estuviste cerca.", p.patience);
  }
  const angry = (!late && P.a < 0.85) || p.patience <= 0;
  if (angry) { p.lockedUntil = ngAbsGP() + 1 + (ngHash("lockt" + s.team + ngAbsGP()) % 3); p.patience = 2; return show(false, "El equipo se ofendió", `Tu pedido les pareció una falta de respeto. No vuelven a negociar por <b>${ngLockedGP(p)} GP</b> (≈ meses).`); }
  const fair = ngR1(P.terms.sal * Math.min(1, P.a));
  show(false, "Rechazaron tu propuesta", late ? `Te contestan que como mucho pagan cerca de <b>${formatMoney(fair)}</b> por temporada con esas condiciones (o que mejores el paquete de sponsors / cláusulas).` : "No llegaste a la zona azul. Probá bajar el sueldo, traer más sponsors o aceptar una cláusula.");
}
function ngNotice(ok, t, x) {
  let el = document.getElementById("ngNotice");
  if (!el) { el = document.createElement("div"); el.id = "ngNotice"; document.body.appendChild(el); }
  el.className = ok ? "ok" : "bad";
  el.innerHTML = `<b>${ok ? "🖊️" : "📵"} ${t}</b><div>${x}</div><button class="dark" onclick="this.parentNode.classList.remove('show')">OK</button>`;
  void el.offsetWidth; el.classList.add("show");
}
function ngDrvExercise(yes) {
  const c = s.drvC; if (!c || !c.optAsk) return;
  c.optAsk = false; c.opt.used = true;
  if (yes) { c.years += 1; add("✅ Ejecutaste tu opción: seguís en " + s.team + " hasta " + ngDrvEndSeason(c) + " por " + formatMoney(c.salary) + " por temporada."); }
  else { c.expired = true; add("✍️ Dejaste vencer tu opción: toca negociar un contrato nuevo."); }
  render();
}
/* tarjeta "Tu contrato" */
function ngDrvCardHtml() {
  const c = s.drvC;
  const btn = `<button onclick="ngOpenDrv()">✍️ Negociar contrato</button>`;
  if (!c || c.team !== s.team) return `<h2>📝 Tu contrato</h2><p class="small">Todavía no firmaste un contrato propio con <b>${engEsc(s.team)}</b>: cobrás según tu OVR. Negociá tu sueldo (por todas las temporadas que dure), tus sponsors, cláusulas y derechos de imagen.</p>${btn}`;
  const end = ngDrvEndSeason(c);
  const rows = [
    ["💰 Sueldo", formatMoney(c.salary) + " por temporada" + (c.terminated ? " → <b style='color:#f87171'>rescindido: cobrás 30%</b>" : "")],
    ["📅 Vigencia", c.start + "–" + end + (c.opt ? " · " + c.opt.type + " (opción " + (c.opt.holder === "team" ? "del equipo" : "tuya") + (c.opt.used ? ", usada" : "") + ")" : "")],
    ["💼 Sponsors", formatMoney(c.sponsor) + " por temporada en " + NG_SPOTS[c.spot].label],
    ["📉 Cláusula", c.clauseLabel || "Sin cláusula"],
    ["📸 Imagen", c.events + " eventos" + (c.brands ? " · con tus marcas personales" : "")]
  ];
  const last = s.season >= end;
  const extra = c.optAsk ? `<div class="mini-explain">⏰ Tu contrato base terminó y <b>la opción es tuya</b>: ¿seguís un año más por ${formatMoney(c.salary)}?<br><button onclick="ngDrvExercise(true)">✅ Ejecutar opción (+1 año)</button><button class="dark" onclick="ngDrvExercise(false)">✍️ Negociar uno nuevo</button></div>`
    : c.expired ? `<p class="notice">⏰ Tu contrato venció. Tenés que negociar uno nuevo para seguir corriendo.</p>${btn}`
    : c.terminated ? `<p class="notice">❌ No cumpliste la cláusula al parón: el equipo rescindió. Cobrás 30% hasta fin de año y al vencer negociás uno nuevo.</p>`
    : `<p class="small">🔒 Contrato vigente: no se puede renegociar hasta que venza${last ? " (vence al terminar esta temporada" + (c.opt && !c.opt.used ? ", con opción de +1" : "") + ")" : ""}.</p>`;
  return `<h2>📝 Tu contrato con ${engEsc(s.team)}</h2><div class="ng-ctable">${rows.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>${extra}`;
}
function ngRenderDrvCard() {
  let card = document.getElementById("drvContractCard");
  const on = ngIsDriverMode() && !s.player2 && !!document.getElementById("game") && !document.getElementById("game").classList.contains("hidden");
  if (!card) {
    if (!on) return;
    const anchor = document.getElementById("offersCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = "drvContractCard"; card.className = "card";
    anchor.parentNode.insertBefore(card, anchor);
  }
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = ngDrvCardHtml();
  if (on && ngDrvMustSign()) setTimeout(ngForceOpen, 400);
}
function ngForceOpen() {
  if (!ngDrvMustSign()) return;
  const g = document.getElementById("game");
  if (!g || g.classList.contains("hidden")) return;
  const ov = document.getElementById("ngOverlay");
  if (ov && ov.classList.contains("show")) return;
  if (document.getElementById("jrPromo") || document.getElementById("rankCine") || (typeof BFX !== "undefined" && BFX) || document.querySelector("#mcGo.show")) { setTimeout(ngForceOpen, 800); return; }
  ngOpenDrv();
}

/* ---------- sueldo del piloto con contrato ---------- */
(function () {
  const o = window.salaryForGP;
  if (typeof o !== "function") return;
  window.__ngSalOrig = () => o();
  window.salaryForGP = function (player) {
    if (!player && ngIsDriverMode() && ngDrvActive()) {
      const c = s.drvC;
      const base = (c.terminated ? c.salary * 0.3 : c.salary) / 10;
      const brands = c.brands ? Math.max(0.05, (s.pop || 50) / 100 * 0.25) : 0;
      return Math.max(0.05, ngR1(base + brands));
    }
    return o.apply(this, arguments);
  };
})();

/* ---------- cada GP: respuestas a 7 días, perfiles, eventos, parón de verano y fin de contrato ---------- */
function ngDrvStanding() {
  const name = s.playedDriverName;
  const pts = s.driverPoints && name in s.driverPoints ? s.driverPoints[name] : (s.points || 0);
  const all = s.driverPoints ? Object.values(s.driverPoints) : [pts];
  const pos = 1 + all.filter(v => v > pts).length;
  return { pts, pos };
}
function ngOnAdvance(prevSeason, prevGp) {
  const st = ngState(), now = ngAbsGP();
  // perfiles listos
  Object.entries(st.people).forEach(([id, p]) => { if (p.scout === 1 && now >= p.scoutAt) { p.scout = 2; add("🔎 Perfil completo de " + id.replace(/^drv:/, "") + ": ya conocés sus pretensiones reales."); } });
  // respuestas a 7 días
  const due = st.pend.filter(p => now >= p.at);
  st.pend = st.pend.filter(p => now < p.at);
  due.forEach(P => { try { P.kind === "eng" ? ngResolveEng(P, true) : ngResolveDrv(P, true); } catch (e) { console.warn(e); } });
  if (!ngIsDriverMode() || !s.drvC) return;
  const c = s.drvC;
  if (c.team !== s.team) return;
  // derechos de imagen: cada GP
  if (c.events > 0 && !c.expired) {
    s._ngEv = (s._ngEv || 0) + c.events * 0.08;
    s._ngFo = (s._ngFo || 0) + c.events * 0.05;
    if (s._ngEv >= 1) { const k = Math.floor(s._ngEv); s.pop = clamp((s.pop || 50) + k); s._ngEv -= k; }
    if (s._ngFo >= 1) { const k = Math.floor(s._ngFo); s.focus = clamp((s.focus || 55) - k); s._ngFo -= k; }
  }
  // parón de verano: después del GP 5
  if (s.season === prevSeason && prevGp < 5 && s.gp >= 5 && c.clause && !c.terminated && !c.expired && !(c.checked || {})[s.season]) {
    c.checked = c.checked || {}; c.checked[s.season] = true;
    const { pts, pos } = ngDrvStanding();
    const ok = c.clause.k === "pts" ? pts >= c.clause.v : pos <= c.clause.v;
    if (ok) { add("✅ Parón de verano: cumpliste tu cláusula (" + c.clauseLabel + "). Contrato asegurado."); ngNotice(true, "Cláusula cumplida", "Llegaste al parón con " + pts + " puntos (P" + pos + "). " + engEsc(c.clauseLabel) + ": ✅"); }
    else {
      c.terminated = true; s.trust = clamp((s.trust || 50) - 8);
      add("❌ Parón de verano: no cumpliste la cláusula (" + c.clauseLabel + "). " + s.team + " rescindió tu contrato: pasás a cobrar 30% hasta fin de año.");
      ngNotice(false, "El equipo rescindió tu contrato", "Llegaste al parón con " + pts + " puntos (P" + pos + ") y la cláusula pedía: " + engEsc(c.clauseLabel) + ". Cobrás 30% del sueldo hasta fin de temporada y después tenés que negociar uno nuevo.");
    }
  }
  // cambio de temporada
  if (s.season !== prevSeason) {
    if (c.terminated) { c.expired = true; return; }
    if (s.season > ngDrvEndSeason(c) && !c.optAsk) {
      if (c.opt && !c.opt.used) {
        if (c.opt.holder === "team") {
          const { pts, pos } = ngDrvStanding();
          c.opt.used = true;
          if (pos <= 12 || pts >= 30) { c.years += 1; add("✅ " + s.team + " ejecutó su opción: seguís un año más por " + formatMoney(c.salary) + "."); }
          else { c.expired = true; add("👋 " + s.team + " no ejecutó la opción: tu contrato venció. Negociá uno nuevo."); }
        } else { c.optAsk = true; add("⏰ Tu contrato base venció y la opción de +1 es tuya: decidí en la tarjeta 📝 Tu contrato."); }
      } else { c.expired = true; add("⏰ Tu contrato con " + s.team + " venció: negociá uno nuevo."); }
    }
    if (!c.expired && c.sponsor > 0) { const boost = Math.min(6, Math.round(c.sponsor / 3)); if (boost) { s.car = clamp((s.car || 40) + boost); add("💼 Tus sponsors renovaron su aporte: el equipo invierte y el auto sube +" + boost + "."); } }
  }
}
(function () {
  const o = window.nextGP;
  if (typeof o !== "function") return;
  window.nextGP = function () {
    const ps = s.season, pg = s.gp;
    const r = o.apply(this, arguments);
    if (s.season !== ps || s.gp !== pg) { try { ngOnAdvance(ps, pg); } catch (e) { console.warn(e); } try { render(); } catch (e) {} }
    return r;
  };
  const a = window.acceptOffer;
  if (typeof a === "function") window.acceptOffer = function () {
    const r = a.apply(this, arguments);
    if (ngIsDriverMode()) { s.drvC = null; add("📝 Nuevo equipo: negociá tu contrato con " + s.team + " en la tarjeta 📝 Tu contrato."); try { render(); } catch (e) {} }
    return r;
  };
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { const r = rd.apply(this, arguments); try { ngRenderDrvCard(); } catch (e) { console.warn(e); } return r; };
})();
