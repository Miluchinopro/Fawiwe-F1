/* =====================================================================================
   FAWIWE · TITULAR O RESERVA SE DEFINE EN EL CONTRATO
   Cuando ascendés a la F1 desde las categorías inferiores, el primer contrato incluye tu ROL:
   el equipo te ofrece titular o reserva según tu nivel y el de la escudería. Podés pedir el
   asiento titular, pero cuesta convencerlos (menos sueldo, más sponsors, una cláusula…).
   ===================================================================================== */
function seatActive() { return ngIsDriverMode() && !!s._seatByContract; }
function seatOffer() {
  const ovr = ngOVR(), need = 66 + (s.stars || 2) * 2.5;
  return { role: ovr >= need ? "titular" : "reserva", ovr, need: Math.round(need) };
}
function seatRole() { return (document.getElementById("ngRole") || {}).value || seatOffer().role; }
function seatApply(role) {
  const tit = role === "titular";
  s._startTitular = tit; s._forceReserve = !tit; s._reserveHasRaced = tit; s._seatByContract = false;
  if (s.drvC) s.drvC.role = role;
  add(tit ? "🏎️ El contrato te da el asiento TITULAR: sos Piloto de Carrera y corrés todas las carreras." : "💺 El contrato te pone como piloto de RESERVA: prensa, prácticas y tu chance si se lesiona un titular.");
  try { s.lastRankName = driverRankName(); } catch (e) {}
  setTimeout(() => { try { render(); } catch (e) {} }, 50);
}
(function () {
  // la sección "Tu rol en el equipo" dentro del contrato
  const od = window.ngOpenDrv;
  if (typeof od === "function") window.ngOpenDrv = function () {
    const r = od.apply(this, arguments);
    try {
      if (!seatActive()) return r;
      const card = document.querySelector("#ngOverlay .ng-card");
      const first = card && card.querySelector(".ng-sec");
      if (!first || document.getElementById("ngRole")) return r;
      const O = seatOffer();
      const sec = document.createElement("div");
      sec.className = "ng-sec ng-role";
      sec.innerHTML = `<h4>🏎️ Tu rol en el equipo</h4>
        <div class="ng-offer ${O.role}">${engEsc(s.team)} te ofrece: <b>${O.role === "titular" ? "🏎️ ASIENTO TITULAR" : "💺 PILOTO DE RESERVA"}</b><span class="small">Tu OVR ${O.ovr} · para ser titular acá piden ~${O.need}</span></div>
        <label class="small">Lo que pedís en el contrato</label>
        <select id="ngRole" onchange="ngUpdate()">
          <option value="titular" ${O.role === "titular" ? "selected" : ""}>🏎️ Titular — corrés todas las carreras</option>
          <option value="reserva" ${O.role === "reserva" ? "selected" : ""}>💺 Reserva — prensa, prácticas y correr si se lesiona un titular</option>
        </select>
        <p class="small" id="ngRoleTip"></p>`;
      first.parentNode.insertBefore(sec, first);
      window.ngUpdate && ngUpdate();
    } catch (e) { console.warn(e); }
    return r;
  };
  const tm = window.ngDrvTerms;
  if (typeof tm === "function") window.ngDrvTerms = function () { const T = tm.apply(this, arguments); if (seatActive()) T.role = seatRole(); return T; };
  const ap = window.ngDrvAppeal;
  if (typeof ap === "function") window.ngDrvAppeal = function (T, C) {
    let a = ap.apply(this, arguments);
    if (seatActive() && T && T.role) {
      const off = seatOffer().role;
      if (T.role === "titular" && off === "reserva") a *= 0.74;   // tenés que convencerlos
      if (T.role === "reserva" && off === "titular") a *= 1.12;   // les sale más barato
    }
    return a;
  };
  const up = window.ngDrvUpdate;
  if (typeof up === "function") window.ngDrvUpdate = function () {
    const r = up.apply(this, arguments);
    try {
      if (!seatActive()) return r;
      const role = seatRole(), off = seatOffer().role, tip = document.getElementById("ngRoleTip");
      if (tip) tip.innerHTML = role === off ? "✅ Pedís lo mismo que te ofrecen: no cambia la negociación." : role === "titular" ? "⚠️ Pedís el asiento titular que no te ofrecían: para que acepten, bajá el sueldo, traé más sponsors o aceptá una cláusula de rendimiento." : "💡 Aceptás ser reserva aunque te ofrecían titular: el equipo lo ve con buenos ojos (te pagan igual, corrés menos).";
      const sum = document.getElementById("ngSum");
      if (sum && !/Rol:/.test(sum.innerHTML)) sum.innerHTML = `Rol: <b>${role === "titular" ? "🏎️ Titular" : "💺 Reserva"}</b> · ` + sum.innerHTML;
    } catch (e) {}
    return r;
  };
  // al firmar (o si te imponen el contrato), se aplica el asiento
  const rd = window.ngResolveDrv;
  if (typeof rd === "function") window.ngResolveDrv = function (P) {
    const wasActive = seatActive(), before = s.drvC;
    const r = rd.apply(this, arguments);
    try {
      if (wasActive && s.drvC && s.drvC !== before) {
        const role = s.drvC.imposed ? seatOffer().role : ((P && P.terms && P.terms.role) || seatOffer().role);
        seatApply(role);
        const res = document.querySelector("#ngOverlay .ng-result p");
        if (res) res.insertAdjacentHTML("beforeend", ` <b>Rol: ${role === "titular" ? "🏎️ piloto TITULAR" : "💺 piloto de RESERVA"}.</b>`);
      }
    } catch (e) { console.warn(e); }
    return r;
  };
  // la tarjeta del contrato muestra el rol
  const ch = window.ngDrvCardHtml;
  if (typeof ch === "function") window.ngDrvCardHtml = function () {
    let h = ch.apply(this, arguments);
    try {
      const c = s.drvC;
      if (c && c.team === s.team) {
        const role = c.role || ((s.playedDriverType !== "actual" || s._forceReserve) && tierIndex() === 0 && !s._reserveHasRaced ? "reserva" : "titular");
        h = h.replace('<div class="ng-ctable">', `<div class="ng-ctable"><div><span>🏎️ Rol</span><b>${role === "titular" ? "Titular" : "Reserva (3er piloto)"}</b></div>`);
      }
    } catch (e) {}
    return h;
  };
})();
