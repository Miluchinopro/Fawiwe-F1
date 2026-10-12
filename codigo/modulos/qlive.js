/* =====================================================================================
   FAWIWE · CLASIFICACIÓN EN VIVO (modo piloto)
   Q1 → Q2 → Q3 con la tabla de tiempos moviéndose, la zona de eliminación marcada y
   la decisión de salir (o no) a una última vuelta. Lo que decidís cambia tu posición.
   ===================================================================================== */
let QL = null, qlTimer = null, qlDecTimer = null;
function qlKey() { return s.season + "_" + s.gp; }
function qlRec() { try { return lapRecSec(); } catch (e) { return 90; } }
function qlFmt(x) { try { return lapFmt(x); } catch (e) { return x.toFixed(3); } }
function qlSay(a, b, c) { if (QL && !QL.skip && typeof fwRadioSay === "function") fwRadioSay(a, b, c); }
function qlSessions(n) {
  let q1Last = n - (n >= 22 ? 6 : 5) + 1;
  try { q1Last = qualiCutLines().q1Last; } catch (e) {}
  const q2N = Math.max(11, Math.min(n, q1Last - 1));
  return n <= 12 ? [{ id: "Q", k: n, cut: n }] : [{ id: "Q1", k: n, cut: q2N }, { id: "Q2", k: q2N, cut: 10 }, { id: "Q3", k: 10, cut: 10 }];
}
function qlStart(grid, who) {
  const S = qlSessions(grid.length);
  QL = { eng: s.playerMode !== "driver", key: qlKey(), grid, who, order: grid.slice(), S, si: 0, tick: 0, speed: 1, phase: "run", feed: [], best: {}, shown: {}, out: [], dec: null, decided: {} };
  qlEnsure();
  document.getElementById("qlOverlay").classList.add("show");
  const nm = (trackData[s.gp] || {}).name || "";
  qlFeed("⏱️ Arranca la clasificación en " + nm + (s.weather ? " · " + s.weather.label : "") + ".");
  qlSay(QL.eng ? "Clasificación. Los dos autos a pista con blandos." : "Clasificación. Primera tanda, gomas blandas. Concentrado.", QL.eng ? "you" : "eng");
  qlSessionStart();
  qlDraw();
  qlSchedule();
}
function qlFeed(txt, cls) { QL.feed.push({ s: QL.S[QL.si] ? QL.S[QL.si].id : "", txt, cls: cls || "" }); }
function qlSchedule() { clearInterval(qlTimer); if (!QL) return; qlTimer = setInterval(qlTick, QL.skip ? 30 : Math.round(800 / QL.speed)); }
function qlPart() { const S = QL.S[QL.si]; return QL.order.slice(0, S.k); }
function qlSessionStart() {
  const S = QL.S[QL.si];
  QL.tick = 0; QL.best = {}; QL.shown = {}; QL.dec = null;
  const base = qlRec() + (s.weather && s.weather.wet ? 7 : 0) + (S.id === "Q1" ? 0.75 : S.id === "Q2" ? 0.4 : 0.1);
  QL.base = base;
  QL.prov = {};
  qlPart().forEach((x, i) => {
    QL.prov[x.name] = 0.25 + ((Math.abs(deterministicHash("qp" + x.name + S.id + QL.key)) % 70) / 100);
  });
}
function qlFinalTime(x, rank) {
  const S = QL.S[QL.si];
  return QL.base + rank * 0.075 + ((Math.abs(deterministicHash("qf" + x.name + S.id + QL.key)) % 40) / 1000) + (x.noTime ? 9 : 0);
}
function qlTick() {
  if (!QL || QL.phase !== "run") return;
  const S = QL.S[QL.si], P = qlPart();
  QL.tick++;
  const me = P.find(x => x.mine && x.seat === 1);
  if (QL.tick <= 6) {
    // primeras vueltas: tiempos provisorios
    P.forEach((x, rank) => {
      const when = 1 + Math.abs(deterministicHash("qw" + x.name + S.id + QL.key)) % 6;
      if (when === QL.tick && !x.noTime) {
        QL.best[x.name] = qlFinalTime(x, rank) + QL.prov[x.name];
        if (x.mine && x.seat === 1) qlFeed("⏱️ Tu primera vuelta: " + qlFmt(QL.best[x.name]) + ".", "mine");
      }
    });
    if (QL.tick === 4 && Math.abs(deterministicHash("qtl" + S.id + QL.key)) % 100 < 45) {
      const v = P.filter(x => !x.mine && QL.best[x.name])[Math.abs(deterministicHash("qtlw" + S.id + QL.key)) % 4];
      if (v) { delete QL.best[v.name]; qlFeed("⚠️ Tiempo borrado a " + v.name + " por límites de pista.", "bad"); }
    }
    if (QL.tick === 6 && me && S.id !== "Q3" && S.id !== "Q") {
      const rk = qlRank(me);
      if (rk > S.cut) { qlFeed("🚨 Estás en zona de eliminación (P" + rk + ").", "bad"); qlSay("Estás en zona de eliminación. Necesitamos mejorar.", "eng"); }
      else qlSay("Por ahora P" + rk + ". Estás adentro, pero el corte está cerca.", "eng");
    }
  } else if (QL.tick === 7) {
    // decisión: última vuelta (en modo ingeniero, para cada uno de tus autos)
    const cands = P.filter(x => x.mine && !x.noTime && (QL.eng || x.seat === 1)).sort((a, b) => a.seat - b.seat);
    for (const c of cands) {
      if (QL.decided[S.id + c.name]) continue;
      const finalRank = P.indexOf(c) + 1;
      const near = S.id === "Q3" || S.id === "Q" ? true : Math.abs(finalRank - S.cut) <= 3;
      if (near) { qlOpenDec(S, c); return; }
    }
  } else if (QL.tick <= 10) {
    // vueltas finales: aparecen los tiempos definitivos
    P.forEach((x, rank) => {
      const when = 8 + Math.abs(deterministicHash("qz" + x.name + S.id + QL.key)) % 3;
      if (when === QL.tick && !x.noTime) {
        const old = QL.best[x.name];
        QL.best[x.name] = qlFinalTime(x, rank);
        if (x.mine && x.seat === 1) qlFeed("🔥 Tu última vuelta: " + qlFmt(QL.best[x.name]) + (old ? " (" + (QL.best[x.name] < old ? "−" : "+") + Math.abs(old - QL.best[x.name]).toFixed(3) + ")" : "") + ".", "mine");
      }
    });
  } else {
    qlSessionEnd();
    return;
  }
  qlDraw();
}
function qlRank(x) {
  const P = qlPart().filter(y => QL.best[y.name] != null).sort((a, b) => QL.best[a.name] - QL.best[b.name]);
  const i = P.indexOf(x);
  return i < 0 ? qlPart().length : i + 1;
}
function qlOpenDec(S, me) {
  QL.decided[S.id + me.name] = true;
  const P = qlPart(), rk = P.indexOf(me) + 1;
  const skill = (s.qualiMiniScore ?? 50) / 100, focus = (s.focus ?? 55) / 100;
  const pOk = Math.max(0.2, Math.min(0.85, 0.3 + skill * 0.35 + focus * 0.2));
  const roll = (Math.abs(deterministicHash("qroll" + S.id + QL.key)) % 100) / 100;
  QL.dec = {
    car: me.name,
    q: "📻 " + S.id + (QL.eng ? " · ¿Mandás a " + me.name.replace(" (reserva)", "") + " a una última vuelta?" : " · ¿Salís a una última vuelta?"),
    hint: (QL.eng ? "Estratega" : (typeof dlEngFirst === "function" ? dlEngFirst() : "Ingeniero")) + ": «" + (S.id === "Q3" ? "Queda tiempo para un último intento por la pole." : "Estás cerca del corte (P" + rk + " de " + P.length + ", pasan " + S.cut + ").") + " Hay riesgo de que te borren la vuelta por límites de pista.»",
    def: 1,
    opts: [
      { label: QL.eng ? "🔥 Que salga a una última vuelta" : "🔥 Salgo a una última vuelta", say: QL.eng ? "Salí, una vuelta más a fondo." : "Salgo. Una vuelta más, a fondo.", fx: () => roll < pOk ? { d: -1 - (roll < pOk * 0.4 ? 1 : 0), txt: "🔥 ¡Vueltón! Mejoraste en el último intento." , cls: "ok" } : { d: 2, txt: "⚠️ Te borraron la última vuelta por límites de pista.", cls: "bad" } },
      { label: QL.eng ? "🛡️ Que se quede en boxes" : "🛡️ Me quedo con este tiempo", say: QL.eng ? "Quedate en boxes, cuidamos las gomas." : "Me quedo, cuidamos las gomas.", fx: () => ({ d: S.id === "Q3" ? 1 : 0, txt: S.id === "Q3" ? "🛡️ Te quedaste en boxes: los demás mejoraron un poco." : "🛡️ Te quedaste en boxes y guardaste un juego de gomas.", cls: "" }) }
    ]
  };
  QL.phase = "dec"; QL.decLeft = 10;
  qlSay(S.id === "Q3" ? "¿Vamos por la pole? Una vuelta más." : "Estás cerca del corte. ¿Salimos a una última vuelta?", "eng", { toast: false });
  clearInterval(qlDecTimer);
  qlDecTimer = setInterval(() => {
    if (!QL || QL.phase !== "dec") { clearInterval(qlDecTimer); return; }
    QL.decLeft--; const el = document.getElementById("qlDecLeft"); if (el) el.textContent = QL.decLeft + "s";
    if (QL.decLeft <= 0) qlChoose(QL.dec.def);
  }, 1000);
  qlDraw();
}
function qlChoose(i) {
  if (!QL || QL.phase !== "dec" || !QL.dec) return;
  clearInterval(qlDecTimer);
  const o = QL.dec.opts[i] || QL.dec.opts[QL.dec.def];
  const r = o.fx();
  const S = QL.S[QL.si], me = QL.order.find(x => x.name === QL.dec.car) || QL.order.find(x => x.mine && x.seat === 1);
  // mover tu posición dentro de los que están en esta tanda
  const idx = QL.order.indexOf(me), lim = S.k - 1;
  const ni = Math.max(0, Math.min(lim, idx + r.d));
  if (ni !== idx) { QL.order.splice(idx, 1); QL.order.splice(ni, 0, me); }
  if (!QL.skip && typeof fwRadioSay === "function") fwRadioSay(o.say, "you");
  qlFeed("🎙️ «" + o.say + "»", "radio");
  qlFeed(r.txt, r.cls);
  QL.dec = null; QL.phase = "run";
  // ¿otro auto tuyo cerca del corte? (modo ingeniero)
  if (QL.eng && QL.tick === 7) { QL.tick = 6; }
  qlDraw();
}
function qlSessionEnd() {
  const S = QL.S[QL.si], P = qlPart();
  P.forEach((x, rank) => { if (!x.noTime) QL.best[x.name] = qlFinalTime(x, rank); });
  const out = P.slice(S.cut);
  const me = P.find(x => x.mine && x.seat === 1);
  if (S.id !== "Q3" && S.id !== "Q") {
    QL.out = QL.out.concat(out.map(x => ({ x, s: S.id, t: QL.best[x.name] })));
    qlFeed("🏁 Fin de la " + S.id + ". Eliminados: " + out.map(x => (typeof lapShort === "function" ? lapShort(x.name) : x.name)).join(", ") + ".");
    if (me) {
      const rk = P.indexOf(me) + 1;
      if (rk > S.cut) { qlFeed("❌ Quedaste eliminado en " + S.id + " (P" + rk + ").", "bad"); qlSay("Eliminados en " + S.id + ". Mañana a remontar.", "eng"); }
      else { qlFeed("✅ ¡Pasaste a " + QL.S[QL.si + 1].id + "! (P" + rk + ")", "ok"); qlSay("Adentro. Pasamos a " + QL.S[QL.si + 1].id + ".", "eng"); }
    }
  } else {
    const pole = P[0];
    qlFeed("🏆 POLE POSITION para " + pole.name + " · " + qlFmt(QL.best[pole.name]) + ".", "fin");
    if (me) { const rk = P.indexOf(me) + 1; qlSay(rk === 1 ? "¡Pole position! ¡Qué vuelta!" : "Terminamos P" + rk + ". Buen sábado.", "eng", { priority: true }); }
  }
  QL.lastS = S;
  if (QL.si < QL.S.length - 1) {
    QL.phase = "between";
  } else { QL.phase = "end"; clearInterval(qlTimer); }
  qlDraw();
}
function qlNext() { if (!QL || QL.phase !== "between") return; QL.si++; qlSessionStart(); QL.phase = "run"; qlFeed("⏱️ Arranca la " + QL.S[QL.si].id + "."); qlDraw(); qlSchedule(); }
function qlSkip() {
  if (!QL) return;
  QL.skip = true; try { fwRadioStop(); } catch (e) {}
  let guard = 0;
  while (QL.phase !== "end" && guard++ < 200) {
    if (QL.phase === "dec") qlChoose(QL.dec.def);
    else if (QL.phase === "between") { QL.si++; qlSessionStart(); QL.phase = "run"; }
    else qlTick();
  }
  qlDraw();
}
function qlSpeed(v) { if (!QL) return; QL.speed = v; qlSchedule(); qlDraw(); }
function qlFinish() {
  if (!QL) return;
  clearInterval(qlTimer); clearInterval(qlDecTimer);
  const q = QL; QL = null;
  document.getElementById("qlOverlay").classList.remove("show");
  q.order.forEach((x, i) => { x.pos = i + 1; x.pts = 0; });
  const grid = q.order;
  const me = grid.find(x => x.mine && x.seat === 1), mate = grid.find(x => x.mine && x.seat === 2);
  s._qlKey = q.key;
  s.qualiPos = me ? me.pos : s.qualiPos;
  const mateRes = mate ? { name: mate.name, pos: mate.pos } : null;
  s.lastTeammateQuali = mateRes;
  s._dlQuali = { key: q.key, names: grid.map(x => x.name) };
  try { const e = engEnsure(); e.lastQualiOrder = { key: engKey(), names: grid.map(x => x.name) }; } catch (e) {}
  _qlOrigAnnounce(me ? me.pos : 1, q.who, mateRes, grid);
  try { render(); } catch (e) {}
}
function qlEnsure() {
  if (document.getElementById("qlOverlay")) return;
  const ov = document.createElement("div");
  ov.id = "qlOverlay";
  ov.innerHTML = `<div class="eng-live-card ql-card"><div class="eng-live-head"><div><div class="kicker">⏱️ EN VIVO · CLASIFICACIÓN</div><h2 id="qlTitle"></h2><div id="qlStatus" class="small"></div></div><div class="ql-sess" id="qlSess"></div></div>
    <div id="qlDecision"></div>
    <div class="eng-live-body"><div><div class="eng-live-board" id="qlBoard"></div></div><div><div class="dl-cols"><span>EN VIVO</span></div><div class="eng-live-feed" id="qlFeed"></div></div></div>
    <div id="qlCtrl" style="text-align:center;margin-top:10px"></div></div>`;
  document.body.appendChild(ov);
  document.addEventListener("keydown", ev => {
    if (!QL || !ov.classList.contains("show")) return;
    const k = ev.key.toLowerCase();
    if (QL.phase === "dec" && (k === "1" || k === "2")) { ev.preventDefault(); qlChoose(+k - 1); }
    else if (QL.phase === "between" && (k === "enter" || k === " ")) { ev.preventDefault(); qlNext(); }
    else if (QL.phase === "end" && (k === "enter" || k === " ")) { ev.preventDefault(); qlFinish(); }
  });
}
function qlDraw() {
  if (!QL) return;
  const S = QL.S[QL.si], P = qlPart();
  document.getElementById("qlTitle").textContent = "GP de " + ((trackData[s.gp] || {}).name || "") + " · " + (QL.eng ? s.team : (s.playedDriverName || ""));
  document.getElementById("qlStatus").innerHTML = `<span class="eng-flag">${QL.phase === "end" ? "🏁 Clasificación terminada" : "🟢 Pista abierta"}</span> ${s.weather ? engEsc(s.weather.label) : ""}`;
  document.getElementById("qlSess").innerHTML = QL.S.map((x, i) => `<span class="${i === QL.si ? "on" : i < QL.si ? "done" : ""}">${x.id}</span>`).join("") + `<div class="ql-clock">${QL.phase === "run" ? "⏱️ " + Math.max(0, 12 - QL.tick) + " min" : ""}</div>`;
  const timed = P.filter(x => QL.best[x.name] != null).sort((a, b) => QL.best[a.name] - QL.best[b.name]);
  const untimed = P.filter(x => QL.best[x.name] == null);
  const rows = timed.concat(untimed);
  const leadT = timed.length ? QL.best[timed[0].name] : null;
  const col = x => (typeof teamColors !== "undefined" && teamColors[x.team]) || "#888";
  let html = rows.map((x, i) => {
    const t = QL.best[x.name];
    const cutLine = S.id !== "Q3" && S.id !== "Q" && i === S.cut ? `<div class="ql-cut">✂️ ZONA DE ELIMINACIÓN</div>` : "";
    return cutLine + `<div class="eng-live-row ql-row ${x.mine ? "mine" : ""} ${S.id !== "Q3" && S.id !== "Q" && i >= S.cut ? "danger" : ""}"><span class="p">${i + 1}</span><span class="c" style="background:${col(x)}"></span><span class="n">${engEsc(x.name.replace(" (reserva)", ""))}${x.noTime && x.mine ? ' <span class="eng-badge pen">SIN TIEMPO</span>' : ""}</span><span class="t">${t != null ? qlFmt(t) : "—"}</span><span class="g">${t != null && leadT != null ? (t === leadT ? "" : "+" + (t - leadT).toFixed(3)) : ""}</span></div>`;
  }).join("");
  if (QL.out.length) html += `<div class="ql-cut out">ELIMINADOS</div>` + QL.out.slice().reverse().map(o => `<div class="eng-live-row ql-row out ${o.x.mine ? "mine" : ""}"><span class="p">${o.s}</span><span class="c" style="background:${col(o.x)}"></span><span class="n">${engEsc(o.x.name.replace(" (reserva)", ""))}</span><span class="t">${o.t != null ? qlFmt(o.t) : "—"}</span><span class="g"></span></div>`).join("");
  document.getElementById("qlBoard").innerHTML = html;
  document.getElementById("qlFeed").innerHTML = QL.feed.slice().reverse().map(f => `<p class="${f.cls}"><b>${f.s}</b> ${engEsc(f.txt)}</p>`).join("");
  const dec = document.getElementById("qlDecision");
  dec.innerHTML = QL.phase === "dec" && QL.dec ? `<div class="eng-live-dec"><div class="q">${engEsc(QL.dec.q)} <span class="eng-dec-left" id="qlDecLeft">${QL.decLeft}s</span></div><p class="small">${engEsc(QL.dec.hint)}</p><div class="choice-grid">${QL.dec.opts.map((o, i) => `<button class="choice-card" onclick="qlChoose(${i})"><b>${engEsc(o.label)}</b><span class="small"><kbd>${i + 1}</kbd></span></button>`).join("")}</div></div>` : "";
  document.getElementById("qlCtrl").innerHTML = QL.phase === "end" ? `<button class="lv-btn red" onclick="qlFinish()">🏆 Ver la grilla de largada <kbd>Enter</kbd></button>`
    : QL.phase === "between" ? `<button class="lv-btn red" onclick="qlNext()">▶ Arrancar la ${QL.S[QL.si + 1].id} <kbd>Enter</kbd></button><button class="lv-btn" onclick="qlSkip()">⏭ Saltar al final</button>`
    : `<button class="lv-btn ${QL.speed === 1 ? "on" : ""}" onclick="qlSpeed(1)">▶ x1</button><button class="lv-btn ${QL.speed === 3 ? "on" : ""}" onclick="qlSpeed(3)">⏩ x3</button><button class="lv-btn" onclick="qlSkip()">⏭ Saltar al final</button>`;
}
const _qlOrigAnnounce = window.announceQuali;
(function () {
  if (typeof _qlOrigAnnounce !== "function") return;
  window.announceQuali = function (pos, who, mate, grid) {
    try {
      const engOk = typeof engOn === "function" && engOn() && s.eng && s.eng.raceView !== "instant";
      if (typeof dlOn === "function" && (dlOn() || engOk) && Array.isArray(grid) && grid.length >= 10 && s.qlLive !== false && s._qlKey !== qlKey() && !QL && !s._dlSkip) { qlStart(grid, who); return; }
    } catch (e) { console.warn("[FAWIWE] clasificación en vivo:", e); QL = null; }
    return _qlOrigAnnounce.apply(this, arguments);
  };
})();
