/* =====================================================================================
   FAWIWE · VUELTA POR VUELTA
   Arma el cronometraje completo de cada carrera: tiempo de cada vuelta, diferencias,
   paradas en boxes, Safety Car y abandonos. Los tiempos cierran exacto con el resultado
   oficial (el orden final no cambia), así que lo que ves vuelta a vuelta es la carrera real.
   ===================================================================================== */
function lapRecSec() {
  const rec = (trackData[s.gp] || {}).record || "1:30.000";
  const m = rec.match(/(\d+):(\d+\.\d+)/);
  return m ? parseInt(m[1]) * 60 + parseFloat(m[2]) : 90;
}
function lapFmt(x) {
  if (x == null || !isFinite(x)) return "—";
  const m = Math.floor(x / 60);
  return m + ":" + (x - m * 60).toFixed(3).padStart(6, "0");
}
function lapShort(name) {
  const p = String(name).replace(" (reserva)", "").trim().split(/\s+/);
  return (p[p.length - 1] || String(name)).toUpperCase();
}
let engLastLaps = null;
let engLapsLogLen = 0;

function engBuildLaps(entries, opt) {
  opt = opt || {};
  const N = (trackData[s.gp] || { laps: 58 }).laps;
  const key = engKey();
  const wet = !!(s.weather && s.weather.wet);
  const B = lapRecSec() + 2.2 + (wet ? 6 : 0);
  const e = engEnsure();
  const q = e.lastQualiOrder && e.lastQualiOrder.key === key ? e.lastQualiOrder.names : null;
  const scStart = opt.sc ? Math.max(3, Math.round(N * 14 / 30)) : -1;
  const scLen = 4;
  const isSC = l => scStart > 0 && l >= scStart && l < scStart + scLen;
  const startList = q ? q.slice() : entries.map(x => x.name);
  const fin = entries.filter(x => !x.status);
  const rows = [];
  let gap = 0;
  entries.forEach((x, i) => {
    if (x.status === "DNS") { rows.push({ name: x.name, team: x.team, mine: !!x.mine, seat: x.seat, status: "DNS", t: [], cum: [], pits: [], pos: [] }); return; }
    const h = engH("lap_" + x.name + key);
    let T = null;
    if (!x.status) {
      const k = fin.indexOf(x);
      if (k > 0) gap += (0.55 + (engH("gap" + x.name + key) % 280) / 100) * (1 + k * 0.11) * Math.max(0.6, N / 55);
      T = N * B + gap;
    }
    let dnfLap = null;
    if (x.status === "DNF") dnfLap = engClampN((opt.dnfLaps && opt.dnfLaps[x.name]) || (2 + h % Math.max(1, N - 4)), 1, N - 1);
    let pits;
    if (opt.noPits) pits = [];
    else if (x.mine && opt.myPits && opt.myPits[x.seat]) pits = opt.myPits[x.seat].slice();
    else {
      const two = h % 3 === 0;
      pits = two ? [Math.round(N * (0.26 + (h % 9) / 100)), Math.round(N * (0.6 + (h % 11) / 100))] : [Math.round(N * (0.36 + (h % 17) / 100))];
    }
    const extra = (!opt.noPits && x.mine && opt.extraPits && opt.extraPits[x.seat]) || [];
    pits = [...new Set(pits.concat(extra))].filter(p => p > 1 && p < N).sort((a, b) => a - b);
    const cheap = new Set(extra);
    const gi = startList.indexOf(x.name);
    const o = (gi >= 0 ? gi : i) * 0.28;
    const r = [];
    let last = 0;
    for (let l = 1; l <= N; l++) {
      let v = (((engH("n" + x.name + "_" + l + key) % 100) / 100) - 0.5) * 0.8;
      v += 0.035 * (l - last);
      if (pits.includes(l)) { v += (cheap.has(l) || isSC(l)) ? 11 : 21.5; last = l; }
      if (isSC(l)) v += 9;
      if (l === 1) v += 3.5;
      r.push(v);
    }
    const base = T != null ? (T - o - r.reduce((a, b) => a + b, 0)) / N : B + 0.6 + i * 0.04;
    let t = r.map(v => base + v);
    if (dnfLap) t = t.slice(0, dnfLap - 1);
    rows.push({ name: x.name, team: x.team, mine: !!x.mine, seat: x.seat, status: x.status || null, penalty: x.penalty || null, dnfReason: x.dnfReason || null, finalPos: x.pos, o, t, pits: pits.filter(p => p <= t.length), dnfLap, cum: [], pos: [] });
  });
  const data = { key, N, B, sc: scStart > 0 ? [scStart, scLen] : null, rows, track: engTrackName(), startList };
  lapFinalize(data);
  return data;
}
function lapFinalize(data) {
  const N = data.N;
  data.rows.forEach(r => {
    r.cum = [];
    let c = r.o || 0;
    r.t.forEach(v => { c += v; r.cum.push(c); });
    r.pos = new Array(N + 1).fill(null);
  });
  const live = data.rows.filter(r => r.status !== "DNS");
  // vuelta 0 = grilla
  live.slice().sort((a, b) => (a.o || 0) - (b.o || 0)).forEach((r, i) => { r.pos[0] = i + 1; });
  for (let l = 1; l <= N; l++) {
    const running = live.filter(r => r.t.length >= l).sort((a, b) => a.cum[l - 1] - b.cum[l - 1]);
    const out = live.filter(r => r.t.length < l).sort((a, b) => b.t.length - a.t.length || a.cum[a.cum.length - 1] - b.cum[b.cum.length - 1]);
    running.forEach((r, i) => { r.pos[l] = i + 1; });
    out.forEach((r, i) => { r.pos[l] = running.length + i + 1; r.outAt = r.outAt || r.t.length + 1; });
  }
  let best = { time: Infinity, name: null, lap: null };
  data.rows.forEach(r => {
    r.best = Infinity;
    r.t.forEach((v, k) => {
      const l = k + 1;
      if (l === 1 || r.pits.includes(l) || (data.sc && l >= data.sc[0] && l < data.sc[0] + data.sc[1])) return;
      if (v < r.best) { r.best = v; r.bestLap = l; }
      if (v < best.time) best = { time: v, name: r.name, lap: l };
    });
  });
  data.fastest = best;
}
function lapForceFastest(data, name) {
  const r = data.rows.find(x => x.name === name);
  if (!r || !r.t.length || data.fastest.name === name) return;
  const N = r.t.length;
  let Lf = Math.round(N * 0.82);
  const bad = l => l <= 1 || r.pits.includes(l) || r.pits.includes(l + 1) || (data.sc && l >= data.sc[0] && l < data.sc[0] + data.sc[1] + 1);
  while (Lf > 2 && bad(Lf)) Lf--;
  if (Lf < 2 || Lf >= N) return;
  const target = data.fastest.time - 0.091;
  const delta = r.t[Lf - 1] - target;
  r.t[Lf - 1] = target;
  r.t[Lf] += delta;
  lapFinalize(data);
}
function lapOrderAt(data, l) {
  return data.rows.filter(r => r.status !== "DNS").slice().sort((a, b) => (a.pos[l] || 999) - (b.pos[l] || 999));
}

/* ---------- ganchos: cada carrera final arma su cronometraje ---------- */
function engLiveLapOpts(L) {
  const dnfLaps = {};
  Object.keys(L.dnfTick || {}).forEach(n => { dnfLaps[n] = Math.max(1, Math.round(L.dnfTick[n] / L.T * L.laps)); });
  return { sc: L.sc, dnfLaps, myPits: L.myPits || null, extraPits: L.extraPits || null };
}
(function lapHooks() {
  const prevSim = simulateGrid;
  simulateGrid = function (kind) {
    const res = prevSim(kind);
    try {
      if (engOn() && kind === "race" && !s._engSimSprint && Array.isArray(res)) {
        const L = engLive && engLive.key === engKey() ? engLive : null;
        engLastLaps = engBuildLaps(res, L ? engLiveLapOpts(L) : { sc: !!s._safetyCarThisRace });
        engLapsLogLen = s.log.length;
      }
    } catch (err) { console.warn("[FAWIWE] vueltas:", err); }
    return res;
  };
  const prevRetarget = engLiveRetarget;
  engLiveRetarget = function () {
    prevRetarget();
    const L = engLive;
    if (L && L.target) { try { L.lapData = engBuildLaps(L.target, engLiveLapOpts(L)); } catch (err) { console.warn(err); } }
  };
  engLiveOrder = function () {
    const L = engLive;
    const d = L.lapData;
    if (!d) return L.target.map(x => ({ x, v: 0, out: false, dns: x.status === "DNS" }));
    const cur = Math.min(d.N, Math.floor(L.tick / L.T * d.N));
    const byName = {};
    L.target.forEach(x => { byName[x.name] = x; });
    const order = lapOrderAt(d, cur).map(r => ({ x: byName[r.name] || r, row: r, v: r.pos[cur], out: r.t.length < cur, dns: false }));
    L.target.filter(x => x.status === "DNS").forEach(x => order.push({ x, v: 999, out: true, dns: true }));
    return order;
  };
  const prevChoose = engLiveChoose;
  engLiveChoose = function (i, timeout) {
    const L = engLive;
    if (L && L.phase === "decision" && L.dec) {
      const cur = Math.max(2, Math.floor(L.tick / L.T * L.laps));
      const N = L.laps;
      const idx = L.dec.opts[i] ? i : L.dec.def;
      if (L.dec.id === "pit") {
        if (idx === 0) L.myPits = { 1: [cur + 1], 2: [cur + 2] };
        else if (idx === 1) L.myPits = { 1: [Math.min(N - 3, cur + 7)], 2: [Math.min(N - 3, cur + 8)] };
      } else if (L.dec.id === "sc" && L.lapData && L.lapData.sc) {
        const scl = L.lapData.sc[0] + 1;
        if (idx === 0) L.extraPits = { 1: [scl], 2: [scl] };
        else if (idx === 2) L.extraPits = { 1: [scl] };
      } else if (L.dec.id === "weather") {
        if (idx === 0) L.extraPits = Object.assign({}, L.extraPits, { 1: (L.extraPits && L.extraPits[1] || []).concat([cur + 1]), 2: (L.extraPits && L.extraPits[2] || []).concat([cur + 1]) });
      }
    }
    return prevChoose.apply(this, arguments);
  };
  const prevTick = engLiveTick;
  engLiveTick = function () {
    const L = engLive;
    const before = L && L.lapData ? Math.floor(L.tick / L.T * L.lapData.N) : 0;
    prevTick.apply(this, arguments);
    if (!L || !L.lapData) return;
    L.feed = L.feed.filter(f => f.txt.indexOf("Vuelta rápida momentánea") < 0);
    const d = L.lapData;
    const now = Math.min(d.N, Math.floor(L.tick / L.T * d.N));
    for (let l = before + 1; l <= now; l++) {
      d.rows.forEach(r => {
        if (r.mine && r.pits.includes(l)) L.feed.push({ lap: l, txt: "🔧 " + r.name + " entra a boxes en la vuelta " + l + " y sale con gomas nuevas.", mine: true });
      });
      let bestSoFar = L._bestSoFar || { time: Infinity };
      d.rows.forEach(r => {
        const v = r.t[l - 1];
        if (v == null || l === 1 || r.pits.includes(l) || (d.sc && l >= d.sc[0] && l < d.sc[0] + d.sc[1])) return;
        if (v < bestSoFar.time) bestSoFar = { time: v, name: r.name, mine: r.mine, lap: l };
      });
      if (bestSoFar.name && (!L._bestSoFar || L._bestSoFar.name !== bestSoFar.name || L._bestSoFar.time !== bestSoFar.time) && l > 3 && (bestSoFar.mine || l % 6 === 0)) {
        L.feed.push({ lap: l, txt: "🟣 Vuelta más rápida: " + bestSoFar.name + " · " + lapFmt(bestSoFar.time), mine: bestSoFar.mine });
      }
      L._bestSoFar = bestSoFar;
    }
    if (L.phase === "finished" || now !== before) engLiveDraw();
  };
  engLiveDraw = function () {
    const L = engLive;
    const ov = document.getElementById("engLiveOverlay");
    if (!L || !ov) return;
    const d = L.lapData;
    const N = d ? d.N : L.laps;
    const lap = Math.min(N, Math.floor(L.tick / L.T * N));
    const scNow = d && d.sc && lap >= d.sc[0] && lap < d.sc[0] + d.sc[1];
    const flag = L.phase === "finished" ? "🏁 Bandera a cuadros" : scNow ? "SAFETY CAR" : "Bandera verde";
    document.getElementById("engLiveTitle").textContent = "GP de " + engTrackName() + (engIsSprintWeekend() ? " · fin de semana sprint" : "");
    document.getElementById("engLiveLap").innerHTML = `<div class="lv-lap"><span>VUELTA</span><b>${Math.max(lap, 0)}</b><i>/${N}</i></div>${engBar(lap, N)}`;
    document.getElementById("engLiveStatus").innerHTML = `<span class="eng-flag ${scNow ? "sc" : L.phase === "finished" ? "fin" : ""}">${flag}</span> <span class="small">${s.weather ? engEsc(s.weather.label) : ""} · Neumático de salida: ${engEsc(engCurrentTyre())}</span>`;
    const order = engLiveOrder();
    const fastestName = L._bestSoFar && L._bestSoFar.name;
    const rows = order.map((o, i) => {
      const x = o.x, r = o.row;
      let gap = "—", lastLap = "", cls = "";
      if (o.dns) gap = "DNS";
      else if (o.out) gap = "OUT";
      else if (r && lap > 0) {
        const leader = order[0].row;
        const g = r.cum[lap - 1] - leader.cum[lap - 1];
        gap = i === 0 ? "LÍDER" : "+" + g.toFixed(3);
        const lt = r.t[lap - 1];
        lastLap = lapFmt(lt);
        if (r.pits.includes(lap)) { lastLap = "BOX"; cls = "pit"; }
        else if (fastestName === r.name && L._bestSoFar.lap === lap) cls = "purple";
        else if (lt === Math.min(...r.t.slice(1, lap).filter((v, k) => !r.pits.includes(k + 2)))) cls = "green";
      } else if (lap === 0) gap = "GRILLA";
      const pitsDone = r ? r.pits.filter(p => p <= lap).length : 0;
      const pen = x.penalty && L.shownPen[x.name] ? `<span class="eng-badge pen">+${x.penalty.sec}s</span>` : "";
      const color = teamColors[x.team] || "#888";
      return { i, x, html: `<div class="eng-live-row ${x.mine ? "mine" : ""} ${o.out || o.dns ? "out" : ""}"><span class="p">${o.out || o.dns ? "—" : i + 1}</span><span class="c" style="background:${color}"></span><span class="n">${engEsc(lapShort(x.name))} ${pen}</span><span class="t">${engEsc(x.team)}</span><span class="g">${gap}</span><span class="lt ${cls}">${lastLap}</span><span class="ps">${pitsDone ? pitsDone + "×" : ""}</span></div>` };
    });
    const shown = rows.filter(r => r.i < 10 || r.x.mine);
    document.getElementById("engLiveBoard").innerHTML = `<div class="eng-live-row head"><span class="p">P</span><span class="c"></span><span class="n">PILOTO</span><span class="t">EQUIPO</span><span class="g">DIF.</span><span class="lt">ÚLTIMA</span><span class="ps">BOX</span></div>` + shown.map(r => r.html).join("");
    const tab = L.tab || "feed";
    const feedBox = document.getElementById("engLiveFeed");
    const tabs = `<div class="lv-tabs"><button class="lv-tab ${tab === "feed" ? "on" : ""}" onclick="engLive.tab='feed';engLiveDraw()">📻 Comentarios</button><button class="lv-tab ${tab === "laps" ? "on" : ""}" onclick="engLive.tab='laps';engLiveDraw()">📊 Vuelta por vuelta</button></div>`;
    if (tab === "laps" && d) feedBox.innerHTML = tabs + lapTableHtml(d, lap, true);
    else feedBox.innerHTML = tabs + L.feed.slice().reverse().map(f => `<p class="${f.mine ? "mine" : ""}"><b>V${f.lap}</b> ${engEsc(f.txt)}</p>`).join("");
    const decBox = document.getElementById("engLiveDecision");
    if (L.phase === "decision" && L.dec) {
      decBox.innerHTML = `<div class="eng-live-dec"><div class="q">${engEsc(L.dec.q)} <span class="eng-dec-left" id="engDecLeft">${L.decLeft}s</span></div><p class="small">${engEsc(L.dec.hint)}</p>
        <div class="choice-grid">${L.dec.opts.map((o, i) => `<button class="choice-card" onclick="engLiveChoose(${i})"><b>${engEsc(o.label)}</b><span class="small">${engEsc(o.sub)}</span></button>`).join("")}</div>
        <p class="small">Si no elegís a tiempo, el box sigue con "${engEsc(L.dec.opts[L.dec.def].label.replace(/^\S+\s/, ""))}".</p></div>`;
    } else decBox.innerHTML = "";
    const ctrl = document.getElementById("engLiveCtrl");
    if (L.phase === "finished") ctrl.innerHTML = `<button class="lv-btn red" onclick="engLiveFinalize()">🏆 Ver resultado oficial</button>`;
    else ctrl.innerHTML = `<button class="lv-btn ${L.speed === 1 ? "on" : ""}" onclick="engLiveSpeed(1)">▶ x1</button><button class="lv-btn ${L.speed === 3 ? "on" : ""}" onclick="engLiveSpeed(3)">⏩ x3</button><button class="lv-btn" onclick="engLiveSkip()">⏭ Saltar al final</button>`;
  };
  const prevAfter = engAfterRace;
  engAfterRace = function () {
    try {
      if (engOn() && engLastLaps && engLastLaps.key === engKey()) {
        const won = s.log.slice(engLapsLogLen).some(l => l.indexOf("Vuelta rápida de la carrera") >= 0);
        const main = engLastLaps.rows.find(r => r.mine && r.seat === 1);
        if (won && main) lapForceFastest(engLastLaps, main.name);
        const e = engEnsure();
        e.lapHist = e.lapHist || [];
        e.lapHist = e.lapHist.filter(x => x.key !== engLastLaps.key);
        e.lapHist.push(lapCompact(engLastLaps));
        if (e.lapHist.length > 12) e.lapHist.shift();
        const fl = engLastLaps.fastest;
        if (fl && fl.name) add("⏱️ Vuelta más rápida de " + engTrackName() + ": " + fl.name + " · " + lapFmt(fl.time) + " (vuelta " + fl.lap + ").");
      }
    } catch (err) { console.warn("[FAWIWE] vueltas:", err); }
    return prevAfter.apply(this, arguments);
  };
  const prevShow = showBigResult;
  showBigResult = function (kind, title, sub, cls, grid) {
    prevShow.apply(this, arguments);
    if (!engOn() || String(kind).indexOf("CARRERA") !== 0 || !engLastLaps || engLastLaps.key !== engKey()) return;
    const box = document.getElementById("resultGridTable");
    if (box) box.insertAdjacentHTML("afterbegin", `<button class="lv-btn red" style="margin:0 0 10px" onclick="lapOpenView(engLastLaps)">📊 Ver vuelta por vuelta</button>`);
  };
})();

/* ---------- versión compacta para el historial ---------- */
function lapCompact(d) {
  const keep = d.rows.filter(r => r.mine || (r.finalPos && r.finalPos <= 3));
  const leaders = [];
  for (let l = 1; l <= d.N; l++) {
    const r = d.rows.find(x => x.pos[l] === 1 && x.t.length >= l);
    leaders.push(r ? [r.name, Math.round(r.t[l - 1] * 1000)] : null);
  }
  return {
    key: d.key, track: d.track, N: d.N, sc: d.sc, fastest: d.fastest, leaders,
    rows: keep.map(r => ({ name: r.name, team: r.team, mine: r.mine, seat: r.seat, status: r.status, finalPos: r.finalPos, pits: r.pits, pos: r.pos, t: r.t.map(v => Math.round(v * 1000)), best: r.best, bestLap: r.bestLap }))
  };
}
function lapNormalize(d) {
  if (!d) return null;
  if (d.leaders) {
    return Object.assign({}, d, { rows: d.rows.map(r => Object.assign({}, r, { t: r.t.map(v => v / 1000) })), leadersSec: d.leaders.map(x => x ? [x[0], x[1] / 1000] : null) });
  }
  const leadersSec = [];
  for (let l = 1; l <= d.N; l++) {
    const r = d.rows.find(x => x.pos[l] === 1 && x.t.length >= l);
    leadersSec.push(r ? [r.name, r.t[l - 1]] : null);
  }
  return Object.assign({}, d, { leadersSec });
}

/* ---------- tabla y gráfico ---------- */
function lapTableHtml(raw, upTo, compact) {
  const d = lapNormalize(raw);
  const mine = d.rows.filter(r => r.mine).sort((a, b) => a.seat - b.seat);
  const last = Math.min(d.N, upTo == null ? d.N : upTo);
  const isSC = l => d.sc && l >= d.sc[0] && l < d.sc[0] + d.sc[1];
  let body = "";
  for (let l = last; l >= 1; l--) {
    const cells = mine.map(r => {
      const v = r.t[l - 1];
      if (v == null) return `<td class="muted">—</td><td class="muted">${r.pos[l] ? "P" + r.pos[l] : ""}</td>`;
      const pit = r.pits.includes(l);
      const cls = d.fastest && d.fastest.name === r.name && d.fastest.lap === l && !compact ? "purple" : (r.bestLap === l && !compact ? "green" : "");
      return `<td class="tn ${cls}">${lapFmt(v)}${pit ? ' <span class="lv-chip">BOX</span>' : ""}</td><td class="tn">P${r.pos[l]}</td>`;
    }).join("");
    const ld = d.leadersSec[l - 1];
    body += `<tr><td class="tn">${l}${isSC(l) ? ' <span class="lv-chip sc">SC</span>' : ""}</td>${cells}<td class="small">${ld ? engEsc(lapShort(ld[0])) + " · " + lapFmt(ld[1]) : "—"}</td></tr>`;
  }
  const head = `<tr><th>V</th>${mine.map(r => `<th colspan="2" style="border-bottom-color:${teamColors[r.team] || "#888"}">${engEsc(lapShort(r.name))}</th>`).join("")}<th>Líder</th></tr>`;
  return `<div class="lv-table-wrap"><table class="lv-table">${head}${body || `<tr><td colspan="9" class="small">Todavía no se completó ninguna vuelta.</td></tr>`}</table></div>`;
}
function lapChartSvg(raw) {
  const d = lapNormalize(raw);
  const series = d.rows.filter(r => r.status !== "DNS" && (r.mine || (r.finalPos && r.finalPos <= 3))).sort((a, b) => (b.mine - a.mine) || (a.seat || 9) - (b.seat || 9) || (a.finalPos || 99) - (b.finalPos || 99));
  const W = 820, H = 320, ml = 44, mr = 120, mt = 14, mb = 30;
  const maxPos = Math.max(10, ...series.map(r => Math.max(...r.pos.filter(p => p != null))));
  const x = l => ml + (l / d.N) * (W - ml - mr);
  const y = p => mt + ((p - 1) / Math.max(1, maxPos - 1)) * (H - mt - mb);
  let g = "";
  if (d.sc) g += `<rect x="${x(d.sc[0] - 1)}" y="${mt}" width="${x(d.sc[0] + d.sc[1] - 1) - x(d.sc[0] - 1)}" height="${H - mt - mb}" fill="#facc15" opacity=".12"/><text x="${x(d.sc[0] - 1) + 4}" y="${mt + 12}" font-size="11" fill="#facc15">SAFETY CAR</text>`;
  [1, 5, 10, 15, 20].filter(p => p <= maxPos).forEach(p => {
    g += `<line x1="${ml}" x2="${W - mr}" y1="${y(p)}" y2="${y(p)}" stroke="#ffffff14"/><text x="${ml - 8}" y="${y(p) + 4}" font-size="11" fill="#949498" text-anchor="end">P${p}</text>`;
  });
  for (let l = 0; l <= d.N; l += 10) g += `<text x="${x(l)}" y="${H - 8}" font-size="11" fill="#949498" text-anchor="middle">${l}</text>`;
  const labels = [];
  series.forEach(r => {
    const pts = [];
    for (let l = 0; l <= Math.min(d.N, r.t.length); l++) if (r.pos[l] != null) pts.push([x(l), y(r.pos[l])]);
    if (pts.length < 2) return;
    const col = r.mine ? (teamColors[r.team] || "#e10600") : "#8b8b96";
    const dash = r.mine && r.seat === 2 ? ' stroke-dasharray="7 5"' : "";
    g += `<polyline points="${pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}" fill="none" stroke="${col}" stroke-width="${r.mine ? 2.5 : 1.5}" stroke-linejoin="round" stroke-linecap="round"${dash}/>`;
    if (r.mine) r.pits.forEach(pl => { if (r.pos[pl] != null) g += `<circle cx="${x(pl)}" cy="${y(r.pos[pl])}" r="4" fill="#15151e" stroke="${col}" stroke-width="2"/>`; });
    const lastPt = pts[pts.length - 1];
    labels.push({ y: lastPt[1], x: lastPt[0], text: lapShort(r.name) + (r.status ? " (" + r.status + ")" : " P" + r.pos[Math.min(d.N, r.t.length)]), mine: r.mine });
  });
  labels.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 13) labels[i].y = labels[i - 1].y + 13;
  labels.forEach(lb => { g += `<text x="${Math.min(W - mr + 6, lb.x + 6)}" y="${lb.y + 4}" font-size="11.5" font-weight="${lb.mine ? 700 : 400}" fill="${lb.mine ? "#ffffff" : "#c4c4cc"}">${engEsc(lb.text)}</text>`; });
  g += `<line id="lvCross" x1="0" x2="0" y1="${mt}" y2="${H - mb}" stroke="#ffffff55" visibility="hidden"/><rect x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" fill="transparent" onmousemove="lapChartHover(event)" onmouseleave="lapChartHover(null)" ontouchmove="lapChartHover(event.touches[0])"/>`;
  window._lapChart = { d, x, ml, mr, W, series };
  const legend = series.map(r => `<span class="lv-leg"><i style="background:${r.mine ? (teamColors[r.team] || "#e10600") : "#8b8b96"};${r.mine && r.seat === 2 ? "background:repeating-linear-gradient(90deg," + (teamColors[r.team] || "#e10600") + " 0 6px,transparent 6px 10px)" : ""}"></i>${engEsc(r.name)}${r.mine ? "" : " (P" + (r.finalPos || "—") + ")"}</span>`).join("");
  return `<div class="lv-legend">${legend}<span class="lv-leg"><i class="dot"></i>Parada en boxes</span></div><div class="lv-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Posición vuelta por vuelta">${g}</svg><div class="lv-tip" id="lvTip"></div></div>`;
}
function lapChartHover(ev) {
  const c = window._lapChart;
  const tip = document.getElementById("lvTip");
  const cross = document.getElementById("lvCross");
  if (!c || !tip || !cross) return;
  if (!ev) { tip.style.display = "none"; cross.setAttribute("visibility", "hidden"); return; }
  const svg = cross.ownerSVGElement;
  const rect = svg.getBoundingClientRect();
  const sx = (ev.clientX - rect.left) / rect.width * c.W;
  const l = Math.max(1, Math.min(c.d.N, Math.round((sx - c.ml) / (c.W - c.ml - c.mr) * c.d.N)));
  cross.setAttribute("x1", c.x(l)); cross.setAttribute("x2", c.x(l)); cross.setAttribute("visibility", "visible");
  tip.innerHTML = `<b>Vuelta ${l}</b>` + c.series.map(r => `<div>${engEsc(lapShort(r.name))}: ${r.t[l - 1] != null ? "P" + r.pos[l] + " · " + lapFmt(r.t[l - 1]) : "fuera"}</div>`).join("");
  tip.style.display = "block";
  const px = (c.x(l) / c.W) * rect.width;
  tip.style.left = Math.min(rect.width - 170, Math.max(0, px + 10)) + "px";
}
function lapOpenView(raw) {
  if (!raw) return;
  let ov = document.getElementById("engLapsOverlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "engLapsOverlay";
    ov.addEventListener("click", ev => { if (ev.target === ov) lapCloseView(); });
    document.body.appendChild(ov);
  }
  const d = lapNormalize(raw);
  const mine = d.rows.filter(r => r.mine).sort((a, b) => a.seat - b.seat);
  const fl = d.fastest;
  ov.innerHTML = `<div class="lv-card">
    <div class="lv-head"><div><div class="lv-k">VUELTA POR VUELTA</div><h2>GP de ${engEsc(d.track)}</h2></div><button class="lv-btn" onclick="lapCloseView()">✕ Cerrar</button></div>
    <div class="lv-stats">${mine.map(r => `<div><span>${engEsc(r.name)}</span><b>${r.status || "P" + (r.finalPos || r.pos[d.N])}</b><i>Mejor vuelta ${lapFmt(r.best)} · ${r.pits.length} parada(s)</i></div>`).join("")}<div><span>Vuelta más rápida</span><b class="purple">${lapFmt(fl && fl.time)}</b><i>${fl && fl.name ? engEsc(fl.name) + " · vuelta " + fl.lap : ""}</i></div></div>
    ${lapChartSvg(raw)}
    <h3 class="lv-sub">Cronometraje de tus pilotos</h3>
    ${lapTableHtml(raw, null, false)}
    <p class="small"><span class="purple">Violeta</span> = vuelta más rápida de la carrera · <span class="green">Verde</span> = mejor vuelta personal · <span class="lv-chip">BOX</span> = parada en boxes · <span class="lv-chip sc">SC</span> = Safety Car.</p>
  </div>`;
  ov.classList.add("show");
}
function lapCloseView() { document.getElementById("engLapsOverlay")?.classList.remove("show"); }
function engHistLaps(key) {
  const e = engEnsure();
  const d = (e.lapHist || []).find(x => x.key === key);
  if (d) lapOpenView(d);
}
