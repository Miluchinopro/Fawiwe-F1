/* =====================================================================================
   FAWIWE · V141 — 5 novedades (modo piloto)
   🔁 responder al undercut · 📡 radar de lluvia · 🟡 VSC y banderas amarillas jugables ·
   😤 rival de la temporada (cara a cara) · 🏁 vuelta de enfriamiento con radio
   ===================================================================================== */
function v11Esc(t) { return v9Esc(t); }
function v11Me() { return DL && DL.me; }
try { FW_WHO.riv = { tag: "😤 RIVAL", color: "#f97316", pitch: 0.92, rate: 1.1, v: 1 }; } catch (e) {}
let v11Raf = null;

/* ============================ 😤 RIVAL DE LA TEMPORADA ============================ */
function v11RivalOn() { return s.playerMode === "driver" && !s.player2 && !s.quickRace && !s.challenge; }
function v11Rating(name) { try { const i = findDriverInfo(name); return i ? i[1] : 75; } catch (e) { return 75; } }
function v11Rival() {
  if (!v11RivalOn()) return null;
  let R = s.v11Rival;
  if (R && R.season === s.season) {
    if (DL && DL.grid && !DL.grid.some(x => x.name === R.name)) return null; // no corre este GP
    return R;
  }
  if (!DL || !DL.grid) return null;
  const mineNames = DL.grid.filter(x => x.mine).map(x => x.name);
  const base = n => n.replace(" (reserva)", "");
  const me = base(s.playedDriverName || "");
  const myPts = (s.driverPoints || {})[me] || 0, myR = s.playedDriverRating || v11Rating(me);
  const pool = DL.grid.filter(x => !mineNames.includes(x.name) && !/reserva/.test(x.name) && x.status !== "DNS");
  if (!pool.length) return null;
  const myG = DL.grid.find(x => x.mine && x.seat === 1), myPos = myG && !myG.status ? myG.pos : 10;
  pool.sort((a, b) => {
    const pa = Math.abs(((s.driverPoints || {})[base(a.name)] || 0) - myPts), pb = Math.abs(((s.driverPoints || {})[base(b.name)] || 0) - myPts);
    if (pa !== pb && s.gp > 0) return pa - pb;
    const ga = Math.abs((a.status ? 30 : a.pos) - myPos), gb = Math.abs((b.status ? 30 : b.pos) - myPos);
    if (ga !== gb) return ga - gb;
    return Math.abs(v11Rating(a.name) - myR) - Math.abs(v11Rating(b.name) - myR);
  });
  const pick = pool[0];
  R = s.v11Rival = { season: s.season, name: pick.name, team: pick.team, w: 0, l: 0, seen: {}, duels: 0 };
  add("😤 Rival de la temporada: " + pick.name + " (" + pick.team + "). Cada carrera cuenta en el cara a cara.");
  return R;
}
function v11RivalLine(R) {
  const n = (s.playedDriverName || "").split(" ").slice(-1)[0];
  if (!R.w && !R.l) return ["Así que vos sos " + n + ". Nos vemos en la curva uno.", "Este año el que manda en la pista soy yo.", "Disfrutá la largada, después no me vas a ver más."][dlH("rl" + dlKey()) % 3];
  if (R.w > R.l) return ["Fueron suerte esas carreras. Hoy se termina.", "Me ganaste " + R.w + " veces. No va a haber otra.", "Hoy te paso, " + n + ". Avisale a tu ingeniero."][dlH("rl" + dlKey()) % 3];
  if (R.l > R.w) return ["Vas " + R.w + " a " + R.l + " abajo. Ya sabés cómo termina esto.", "Mirá mis escapes de cerca, es lo único que vas a ver.", "Otra vez atrás mío, " + n + ". Acostumbrate."][dlH("rl" + dlKey()) % 3];
  return ["Empatados. Hoy se define quién es el mejor.", "Igualados. A ver quién frena más tarde.", "Todo empatado. Que gane el más valiente."][dlH("rl" + dlKey()) % 3];
}
function v11Face() {
  const R = v11Rival(); if (!R || !DL || DL.skip) return;
  let ov = document.getElementById("v11Face");
  if (!ov) { ov = document.createElement("div"); ov.id = "v11Face"; ov.addEventListener("click", () => ov.classList.remove("show")); document.body.appendChild(ov); }
  const myCol = (typeof teamColors !== "undefined" && teamColors[s.team]) || "#e10600";
  const rCol = (typeof teamColors !== "undefined" && teamColors[R.team]) || "#f97316";
  const myH = typeof v4HelmetSvg === "function" ? v4HelmetSvg(null, 130) : "";
  const rH = typeof v4HelmetSvg === "function" ? v4HelmetSvg({ c1: rCol, c2: "#111111", pat: "franja", num: "", team: true }, 130) : "";
  const line = v11RivalLine(R);
  ov.innerHTML = `<div class="v11-face"><div class="v11-k">😤 CARA A CARA · GP DE ${v11Esc(((trackData[s.gp] || {}).name || "").toUpperCase())}</div>
    <div class="v11-vs"><div class="v11-side me" style="--c:${myCol}">${myH}<b>${v11Esc(s.playedDriverName || "")}</b><span>${v11Esc(s.team)}</span></div>
    <div class="v11-mid"><i>VS</i><div class="v11-h2h"><b>${R.w}</b><span>–</span><b>${R.l}</b></div><small>en la temporada</small></div>
    <div class="v11-side riv" style="--c:${rCol}">${rH}<b>${v11Esc(R.name)}</b><span>${v11Esc(R.team)}</span></div></div>
    <p class="v11-quote">«${v11Esc(line)}»</p><div class="v7-flag-tap">Tocá para seguir</div></div>`;
  ov.classList.remove("show"); void ov.offsetWidth; ov.classList.add("show");
  clearTimeout(ov._t); ov._t = setTimeout(() => ov.classList.remove("show"), 5600);
  setTimeout(() => { try { if (ov.classList.contains("show")) fwRadioSay(line, "riv", { toast: false, priority: true }); } catch (e) {} }, 700);
}
function v11RivalResult() {
  try {
    const R = s.v11Rival, st = dlState();
    if (!R || R.season !== s.season || !st.final || R.seen[s.gp]) return null;
    const me = st.final.find(f => (myTeamLineup() || []).some(d => d.seat === 1 && d.name === f.name));
    const rv = st.final.find(f => f.name === R.name);
    if (!me || !rv) return null;
    R.seen[s.gp] = 1;
    const val = f => f.status === "DNS" ? 999 : f.status === "DNF" ? 500 + (f.pos || 0) : f.pos;
    const won = val(me) < val(rv);
    if (won) R.w++; else R.l++;
    return { won, R, rpos: rv.status || "P" + rv.pos };
  } catch (e) { return null; }
}

/* ============================ 🔁 RESPONDER AL UNDERCUT ============================ */
function v11UnderCheck(l) {
  const me = v11Me(); if (!me || DL.mode !== "race" || DL.skip || DL.phase !== "run") return false;
  if ((DL._v11U || 0) >= 2 || l < 4 || l > DL.N - 7 || me.t.length < l || me.status === "DNS") return false;
  if (DL._v11ULast && l - DL._v11ULast < 8) return false;
  if (me.pits.some(p => p >= l - 1 && p <= l + 2)) return false;
  const d = DL.data, p0 = me.pos[l - 1];
  const ahead = d.rows.find(r => r.pos[l - 1] === p0 - 1 && r.t.length >= l);
  const behind = d.rows.find(r => r.pos[l - 1] === p0 + 1 && r.t.length >= l);
  let who = null, atk = false;
  if (behind && behind.pits.includes(l) && behind.cum[l - 2] - me.cum[l - 2] < 2.8) who = behind;
  else if (ahead && ahead.pits.includes(l) && me.cum[l - 2] - ahead.cum[l - 2] < 2.8) { who = ahead; atk = true; }
  if (!who) return false;
  DL._v11U = (DL._v11U || 0) + 1; DL._v11ULast = l;
  const w = dlWear(l), next = me.pits.find(p => p > l);
  const nm = dlShort(who.name), early = w >= 60;
  const boxGain = early ? 0.3 : 2.2, stayGain = early ? 1.8 : -1.2;
  const opts = [
    { label: atk ? "📦 Box ya: salir pegado a él" : "📦 Cubrirlo: box esta vuelta", say: atk ? "Box ya, quiero salir pegado a " + nm + "." : "Box, box. Lo cubro.", fx: () => { DL.pits = DL.pits.filter(p => p <= l || p !== next).concat([l + 1]); return boxGain; }, note: (boxGain > 1 ? "✅ " : "➖ ") + (atk ? "Paraste atrás de " + who.name + "." : "Cubriste el undercut de " + who.name + ".") + (early ? " Igual tus gomas todavía estaban bien." : "") },
    { label: "⏳ Me quedo afuera (overcut)", say: "Me quedo afuera, voy a apretar con pista libre.", fx: () => stayGain, note: (stayGain > 0 ? "✅ Con gomas sanas, el overcut funcionó." : "❌ Tus gomas estaban gastadas: " + who.name + " te sacó tiempo con gomas nuevas.") },
    { label: "📋 Seguimos con el plan", say: "Seguimos con el plan.", fx: () => 0, note: "➖ Seguiste con el plan." }
  ];
  const rec = boxGain > stayGain ? 0 : 1;
  DL.dec = { q: (atk ? "🔁 ¡" + who.name + " (adelante) paró en boxes!" : "🔁 ¡" + who.name + " (atrás) entró a boxes: quiere el undercut!") + " — vuelta " + l, def: 2, rec, hint: dlEngFirst() + ": «" + dlEngPre() + "Tus gomas están al " + w + "%. " + (rec === 0 ? "Yo pararía ya." : "Yo me quedaría afuera, todavía rinden.") + "»", opts };
  DL.phase = "dec"; DL.decLeft = 10;
  dlFeed(l, atk ? "🔁 " + who.name + " entra a boxes delante tuyo." : "🔁 " + who.name + " entra a boxes: te quiere hacer el undercut.", true);
  dlSay(atk ? nm + " paró. ¿Respondemos o nos quedamos afuera?" : nm + " entró a boxes, te quiere hacer el undercut. ¿Lo cubrimos?", "eng", { toast: false });
  dlDecStartTimer();
  return true;
}

/* ============================ 🟡 VSC Y BANDERAS AMARILLAS ============================ */
function v11VscOpen(l) {
  DL.vsc = { lap: l, t0: performance.now() + 1300, last: 0, x: 55, hold: false, red: 0, slow: 0, dur: 5500 };
  DL.phase = "vsc";
  dlFeed(l, "🟡 ¡AUTO DE SEGURIDAD VIRTUAL! Mantené el delta: ni muy rápido ni muy lento.", true, "sc");
  dlSay("VSC, VSC. Respetá el delta, no te pases a rojo.", "eng");
  cancelAnimationFrame(v11Raf);
  const step = () => {
    const V = DL && DL.vsc; if (!V || DL.phase !== "vsc") return;
    const now = performance.now();
    const cd = document.getElementById("v11Cd");
    if (now < V.t0) { if (cd) cd.textContent = String(Math.ceil((V.t0 - now) / 450)); V.last = now; v11Raf = requestAnimationFrame(step); return; }
    if (cd && cd.textContent) cd.textContent = "";
    const dt = Math.min(0.05, (now - (V.last || now)) / 1000); V.last = now;
    const push = s.miniDiff === "easy" ? 26 : s.miniDiff === "hard" ? 40 : 32;
    V.x += V.hold ? -58 * dt : (push + 10 * Math.sin(now / 300)) * dt;
    V.x = Math.max(0, Math.min(100, V.x));
    if (V.x > 72) V.red += dt; if (V.x < 36) V.slow += dt;
    const m = document.getElementById("v11VscMark"); if (m) m.style.left = V.x + "%";
    const bar = document.getElementById("v11VscT"); if (bar) bar.style.width = Math.min(100, (now - V.t0) / V.dur * 100) + "%";
    if (now - V.t0 >= V.dur) { v11VscEnd(); return; }
    v11Raf = requestAnimationFrame(step);
  };
  v11Raf = requestAnimationFrame(step);
  dlDraw();
  return true;
}
function v11VscHold(on) { if (DL && DL.vsc) DL.vsc.hold = !!on; }
function v11VscEnd(auto) {
  const V = DL && DL.vsc; if (!V) return;
  cancelAnimationFrame(v11Raf);
  const st = dlState(), l = V.lap;
  let txt, cls, say;
  if (auto) { txt = "🟢 Termina el VSC. Lo pasaste sin problemas."; cls = ""; say = ""; }
  else if (V.red > 0.8) { st.pens.push({ name: DL.me.name, reason: "No respetar el delta del VSC" }); txt = "⚖️ Te pasaste del delta del VSC (" + V.red.toFixed(1) + "s en rojo): +5 segundos."; cls = "bad"; say = "Comisarios: cinco segundos por no respetar el delta."; }
  else if (V.slow > 1.5) { st.bonus -= 0.6; txt = "🐢 Fuiste demasiado lento con el VSC: perdiste tiempo."; cls = "bad"; say = "Muy lento con el VSC, perdimos un poco."; }
  else { st.bonus += 0.4; txt = "✅ Delta perfecto durante el VSC."; cls = "ok"; say = "Delta perfecto. Verde, verde, ¡a fondo!"; }
  dlFeed(l, txt, true, cls);
  if (say) v7Say(say, cls === "bad" && /Comisarios/.test(say) ? "fia" : "eng");
  DL.vsc = null; DL.phase = "run";
  dlRebuild(); dlSchedule(); dlDraw();
}
function v11VscHtml() {
  const V = DL.vsc;
  return `<div class="eng-live-dec v11-vsc"><div class="q">🟡 VSC · vuelta ${V.lap}</div>
    <p class="small">El auto acelera solo: <b>mantené apretado</b> para frenar y quedate en la zona verde hasta que termine.</p>
    <div class="v11-delta"><i class="slow"></i><i class="ok"></i><i class="red"></i><b id="v11VscMark" style="left:${V.x}%"></b><em id="v11Cd" class="v10-cd"></em></div>
    <div class="v11-time"><i id="v11VscT"></i></div>
    <button type="button" class="lv-btn red v11-hold" onpointerdown="v11VscHold(true)" onpointerup="v11VscHold(false)" onpointerleave="v11VscHold(false)" onpointercancel="v11VscHold(false)" oncontextmenu="return false">🛑 MANTENÉ PARA FRENAR <kbd>Espacio</kbd></button></div>`;
}
function v11YelOpen(l) {
  DL.yel = { lap: l, t0: performance.now() + 1100, x: 0, zone: [46, 66], speed: s.miniDiff === "easy" ? 0.03 : s.miniDiff === "hard" ? 0.046 : 0.038 };
  DL.phase = "yellow";
  dlFeed(l, "🟡 ¡Doble bandera amarilla! Un auto quedó en la pista. Levantá antes de llegar al sector.", true, "sc");
  dlSay("Doble amarilla más adelante. Levantá a tiempo y no pases a nadie.", "eng");
  cancelAnimationFrame(v11Raf);
  const step = () => {
    const Y = DL && DL.yel; if (!Y || DL.phase !== "yellow") return;
    const now = performance.now();
    if (now >= Y.t0) Y.x = Math.min(100, (now - Y.t0) * Y.speed);
    const m = document.getElementById("v11YelCar"); if (m) m.style.left = Y.x + "%";
    if (Y.x >= 100) { v11YelHit(true); return; }
    v11Raf = requestAnimationFrame(step);
  };
  v11Raf = requestAnimationFrame(step);
  dlDraw();
  return true;
}
function v11YelHit(timeout) {
  const Y = DL && DL.yel; if (!Y || DL.phase !== "yellow") return;
  if (!timeout && performance.now() < Y.t0) return;
  cancelAnimationFrame(v11Raf);
  const st = dlState();
  let txt, cls;
  if (!timeout && Y.x < Y.zone[0]) { st.bonus -= 0.4; txt = "🐢 Levantaste muy temprano: perdiste un poco de tiempo."; cls = "bad"; }
  else if (!timeout && Y.x <= Y.zone[1]) { st.bonus += 0.3; txt = "✅ Levantaste justo antes de la bandera amarilla. Impecable."; cls = "ok"; }
  else { st.pens.push({ name: DL.me.name, reason: "No levantar con bandera amarilla" }); txt = "⚖️ No levantaste con doble amarilla: +5 segundos."; cls = "bad"; }
  dlFeed(Y.lap, txt, true, cls);
  v7Say(cls === "ok" ? "Bien, bien. Ya pasó la amarilla." : cls === "bad" && /segundos/.test(txt) ? "Nos sancionaron por la amarilla." : "Muy temprano, pero está bien.", "eng");
  DL.yel = null; DL.phase = "run";
  dlRebuild(); dlSchedule(); dlDraw();
}
function v11YelHtml() {
  const Y = DL.yel;
  return `<div class="eng-live-dec v11-yel"><div class="q">🟡 DOBLE BANDERA AMARILLA · vuelta ${Y.lap}</div>
    <p class="small">Levantá en la zona blanca, justo antes de la bandera. Si llegás a fondo, te sancionan.</p>
    <div class="v9-lane"><i class="z" style="left:${Y.zone[0]}%;width:${Y.zone[1] - Y.zone[0]}%"></i><span class="v11-flagzone" style="left:${Y.zone[1]}%">🟨🟨</span><b id="v11YelCar" style="left:${Y.x}%">🏎️</b></div>
    <button type="button" class="lv-btn red" onclick="v11YelHit(false)">🦶 ¡LEVANTÁ! <kbd>Espacio</kbd></button></div>`;
}

/* ============================ 📡 RADAR DE LLUVIA ============================ */
function v11RadarHtml() {
  const R = DL.dec.radar;
  return `<div class="v11-radar"><canvas id="v11Radar" width="220" height="220" aria-label="Radar de lluvia"></canvas><div><b>📡 RADAR</b><p class="small">${R.wet ? "Se acerca una zona de lluvia" + (R.heavy ? " <b>fuerte</b>" : "") + ". Llega de lleno en <b>~2 vueltas</b>." : "Las nubes se van: la pista se seca en <b>~2 vueltas</b>."}</p><p class="small">🟢 llovizna · 🟡 lluvia · 🔴 lluvia fuerte</p></div></div>`;
}
function v11RadarLoop() {
  cancelAnimationFrame(v11RadarLoop._r);
  const draw = () => {
    const R = DL && DL.phase === "dec" && DL.dec && DL.dec.radar;
    if (!R) return;
    const c = document.getElementById("v11Radar");
    if (c) {
      const x = c.getContext("2d"), W = c.width, H = c.height, cx = W / 2, cy = H / 2, now = performance.now(), t = (now - R.t0) / 1000;
      x.clearRect(0, 0, W, H);
      x.fillStyle = "#06120c"; x.beginPath(); x.arc(cx, cy, W / 2 - 2, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "rgba(34,197,94,.35)"; x.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(k => { x.beginPath(); x.arc(cx, cy, (W / 2 - 4) * k, 0, Math.PI * 2); x.stroke(); });
      x.beginPath(); x.moveTo(cx, 4); x.lineTo(cx, H - 4); x.moveTo(4, cy); x.lineTo(W - 4, cy); x.stroke();
      // celdas de lluvia: entran (lluvia) o se van (se seca)
      const prog = Math.min(1, t / 8), dir = R.wet ? 1 : -1;
      const cells = [[-0.95, -0.35, 26, 2], [-1.05, 0.1, 34, R.heavy ? 3 : 2], [-0.85, 0.45, 22, 1], [-1.25, -0.05, 18, 1], [-1.2, 0.3, 24, 2]];
      cells.forEach(([px, py, r, lv], i) => {
        const off = R.wet ? prog * 0.85 : -prog * 0.9;
        const gx = cx + (px + 0.85 + off) * (W / 2) * (R.wet ? 1 : 1) + (R.wet ? 0 : 0), gy = cy + py * (H / 2) + Math.sin(t + i) * 3;
        const col = lv === 3 ? "239,68,68" : lv === 2 ? "250,204,21" : "34,197,94";
        const g = x.createRadialGradient(gx, gy, 2, gx, gy, r); g.addColorStop(0, `rgba(${col},.85)`); g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(gx, gy, r, 0, Math.PI * 2); x.fill();
      });
      // circuito en el centro
      x.strokeStyle = "#fff"; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, 16, 9, -0.4, 0, Math.PI * 2); x.stroke();
      x.fillStyle = "#fff"; x.font = "11px Arial"; x.textAlign = "center"; x.fillText("🏁", cx, cy + 4);
      // barrido
      const a = (t * 1.6) % (Math.PI * 2);
      const sg = x.createLinearGradient(cx, cy, cx + Math.cos(a) * W / 2, cy + Math.sin(a) * H / 2);
      sg.addColorStop(0, "rgba(34,197,94,.0)"); sg.addColorStop(1, "rgba(34,197,94,.7)");
      x.strokeStyle = sg; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * (W / 2 - 4), cy + Math.sin(a) * (H / 2 - 4)); x.stroke();
      if (dir < 0) {}
    }
    v11RadarLoop._r = requestAnimationFrame(draw);
  };
  v11RadarLoop._r = requestAnimationFrame(draw);
}

/* ============================ 🏁 VUELTA DE ENFRIAMIENTO ============================ */
function v11CoolStart() {
  const myG = DL.grid.find(x => x.mine && x.seat === 1);
  if (!myG || myG.status) return;
  const pos = myG.pos, nm = (s.playedDriverName || myG.name || "").replace(" (reserva)", "").split(" ")[0];
  const mineFeed = DL.feed.filter(f => f.mine);
  const passes = mineFeed.filter(f => /Pasaste|¡ADENTRO!|LARGADÓN|ganás (un|dos) lugar/.test(f.txt)).length;
  const lines = [];
  lines.push(["eng", "Bandera a cuadros, " + nm + ". Terminaste P" + pos + ". " + (pos === 1 ? "¡Ganaste! ¡Increíble carrera!" : pos <= 3 ? "¡Podio! Enorme." : pos <= 10 ? "Sumamos puntos." : "Hoy no alcanzó.")]);
  const parts = [];
  if (passes) parts.push(passes === 1 ? "hiciste un gran adelantamiento" : "hiciste " + passes + " adelantamientos");
  if (DL._plan) parts.push("la estrategia de " + (DL._plan.length - 1 === 0 ? "cero" : DL._plan.length - 1) + " parada" + (DL._plan.length - 1 === 1 ? "" : "s") + " salió como esperábamos");
  if (DL.data.fastest && DL.data.fastest.name === DL.me.name) parts.push("y la vuelta rápida es nuestra");
  lines.push(["eng", parts.length ? "Buen trabajo: " + parts.join(", ") + "." : "Carrera limpia, sin errores. Así se suman puntos."]);
  const R = s.v11Rival && s.v11Rival.season === s.season ? s.v11Rival : null;
  if (R) { const rv = DL.grid.find(x => x.name === R.name); if (rv) { const won = !rv.status && rv.pos > pos || !!rv.status; lines.push(["eng", won ? R.name + " terminó " + (rv.status === "DNF" ? "afuera" : rv.status || "P" + rv.pos) + ". Le ganaste el cara a cara." : R.name + " terminó P" + rv.pos + ", adelante nuestro. La próxima es nuestra."]); } }
  lines.push(["eng", pos <= 3 ? "Andá despacio al parque cerrado, te esperan en el podio." : "Entrá despacio por la calle de boxes. Gracias por el laburo, " + nm + "."]);
  const now = performance.now();
  DL._cool = { t0: now + 3300, dur: 10000, lines, shown: [], timers: [] };
  lines.forEach((ln, i) => DL._cool.timers.push(setTimeout(() => {
    if (!DL || !DL._cool) return;
    DL._cool.shown.push(ln);
    try { fwRadioSay(ln[1], ln[0], { toast: false }); } catch (e) {}
    dlDraw();
  }, 3300 + i * 2500)));
  dlDraw();
}
function v11CoolStop() { if (DL && DL._cool) { DL._cool.timers.forEach(clearTimeout); DL._cool = null; document.querySelectorAll("#dlMap .v9-replay").forEach(x => x.remove()); try { fwRadioStop(); } catch (e) {} dlDraw(); } }
function v11CoolHtml() {
  const C = DL._cool;
  return `<div class="eng-live-dec v11-cool"><div class="q">🏁 VUELTA DE ENFRIAMIENTO <button type="button" class="lv-btn" onclick="v11CoolStop()">⏭ Saltar</button></div>
    <div class="v11-cool-lines">${C.shown.length ? C.shown.map(([w, t]) => `<p><b>${w === "eng" ? "📻 " + v11Esc(dlEngFirst()) : "🎙️ Vos"}:</b> ${v11Esc(t)}</p>`).join("") : `<p class="small">📻 Tu ingeniero está por hablar…</p>`}</div></div>`;
}

/* ============================ ganchos ============================ */
(function () {
  if (typeof dlExtrasInit === "function") {
    const o = dlExtrasInit;
    dlExtrasInit = function () {
      const r = o.apply(this, arguments);
      try {
        const N = DL.N, key = dlKey(), sc = DL.data && DL.data.sc;
        const free = l => !(sc && l >= sc[0] - 3 && l <= sc[0] + sc[1] + 3) && l !== DL.redLap && l !== DL.duelLap;
        const pick = (salt) => { for (let k = 0; k < 6; k++) { const l = Math.round(N * (0.25 + ((dlH(salt + k + key) % 50) / 100))); if (free(l)) return l; } return 0; };
        if (s.season >= 2015) { if (!s._safetyCarThisRace && dlH("vsc" + key) % 100 < 32) DL._v11Vsc = pick("vscl"); }
        else {
          if (DL._v10Yellow) { DL._v11Yel = DL._v10Yellow; DL._v10Yellow = 0; }
          else if (s.season >= 1993 && dlH("yel" + key) % 100 < 30) DL._v11Yel = pick("yell");
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlRaceExtras === "function") {
    const o = dlRaceExtras;
    dlRaceExtras = function (l) {
      const r = o.apply(this, arguments);
      if (r) return r;
      try {
        if (!DL || DL.mode !== "race" || DL.skip || DL.phase !== "run" || !DL.me || DL.me.t.length < l) return r;
        if (DL._v11Vsc && l >= DL._v11Vsc) { DL._v11Vsc = 0; return v11VscOpen(l); }
        if (DL._v11Yel && l >= DL._v11Yel) { DL._v11Yel = 0; return v11YelOpen(l); }
        if (v11UnderCheck(l)) return true;
      } catch (e) { console.warn("[FAWIWE] v141:", e); }
      return r;
    };
  }
  if (typeof dlLap === "function") {
    const o = dlLap;
    dlLap = function (l) {
      const r = o.apply(this, arguments);
      try {
        if (DL && DL.mode === "race" && !DL.skip) {
          const ev = DL.events.find(e => e.kind === "weather" && !e.done && !e._v11w && e.lap - l <= 3 && e.lap - l >= 2);
          if (ev) { ev._v11w = true; dlFeed(l, ev.wet ? "📡 Radar: se viene la lluvia en unas " + (ev.lap - l) + " vueltas." : "📡 Radar: las nubes se van, la pista se va a secar.", false, "sc"); dlSay(ev.wet ? "Ojo, el radar muestra lluvia en un par de vueltas." : "El radar dice que se va la lluvia.", "eng"); }
        }
        if (DL && DL._v11Yel === 0 && DL._v10Yellow) DL._v10Yellow = 0;
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlOpenEvent === "function") {
    const o = dlOpenEvent;
    dlOpenEvent = function (ev, l) {
      const r = o.apply(this, arguments);
      try { if (r && ev.kind === "weather" && DL && DL.dec && !DL.skip) { DL.dec.radar = { wet: !!ev.wet, heavy: !!(s.weather && /fuerte/i.test(s.weather.label || "")), t0: performance.now() }; v11RadarLoop(); dlDraw(); } } catch (e) {}
      return r;
    };
  }
  if (typeof dlDraw === "function") {
    const o = dlDraw;
    dlDraw = function () {
      const r = o.apply(this, arguments);
      try {
        const box = document.getElementById("dlDecision");
        if (box && DL) {
          if (DL.phase === "vsc" && DL.vsc) box.innerHTML = v11VscHtml();
          else if (DL.phase === "yellow" && DL.yel) box.innerHTML = v11YelHtml();
          else if (DL.phase === "end" && DL._cool) box.innerHTML = v11CoolHtml();
          else if (DL.phase === "dec" && DL.dec && DL.dec.radar && !box.querySelector(".v11-radar")) { const d = box.querySelector(".eng-live-dec"); const q = d && d.querySelector(".q"); if (q) q.insertAdjacentHTML("afterend", v11RadarHtml()); }
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof dlSkip === "function") {
    const o = dlSkip;
    dlSkip = function () {
      try {
        if (DL && DL.phase === "vsc") { DL.skip = true; v11VscEnd(true); }
        if (DL && DL.phase === "yellow") { cancelAnimationFrame(v11Raf); DL.yel = null; DL.phase = "run"; }
        if (DL && DL._cool) v11CoolStop();
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  if (typeof dlStart === "function") {
    const o = dlStart;
    dlStart = function () {
      const r = o.apply(this, arguments);
      try { if (DL && DL.mode === "race" && !DL.skip && DL.me && DL.me.status !== "DNS") setTimeout(v11Face, 250); } catch (e) {}
      return r;
    };
  }
  if (typeof dlEnd === "function") {
    const o = dlEnd;
    dlEnd = function () {
      const skip = DL && DL.skip, mode = DL && DL.mode;
      const r = o.apply(this, arguments);
      try { if (!skip && mode === "race" && DL) v11CoolStart(); } catch (e) { console.warn("[FAWIWE] enfriamiento:", e); }
      return r;
    };
  }
  if (typeof dlFinalize === "function") {
    const o = dlFinalize;
    dlFinalize = function () {
      try { if (DL && DL._cool) { DL._cool.timers.forEach(clearTimeout); DL._cool = null; } } catch (e) {}
      const mode = DL && DL.mode;
      const r = o.apply(this, arguments);
      try {
        if (mode === "race") { const res = v11RivalResult(); if (res) { add("😤 Cara a cara con " + res.R.name + " (" + res.rpos + "): " + (res.won ? "le ganaste" : "te ganó") + ". Van " + res.R.w + " a " + res.R.l + "."); setTimeout(() => v9Toast("😤 Cara a cara con " + dlShort(res.R.name) + ": " + (res.won ? "¡ganaste!" : "te ganó") + " · " + res.R.w + "–" + res.R.l), 600); } }
      } catch (e) {}
      return r;
    };
  }
  // pases contra tu rival
  if (typeof v7QteOpen === "function") {
    const o = v7QteOpen;
    v7QteOpen = function () {
      const P = DL && DL.pendingQte;
      const r = o.apply(this, arguments);
      try { const R = s.v11Rival; if (r && P && R && R.season === s.season && P.other === R.name && DL.qte) { DL.qte.rival = true; R.duels = (R.duels || 0) + 1; v7Say("¡Es " + dlShort(R.name) + ", tu rival! Este vale el doble.", "eng", { priority: true }); dlDraw(); } } catch (e) {}
      return r;
    };
  }
  if (typeof v7QteHtml === "function") {
    const o = v7QteHtml;
    v7QteHtml = function () { const h = o.apply(this, arguments); try { if (DL && DL.qte && DL.qte.rival) return h.replace('<div class="q">', '<div class="q v11-rq">😤 DUELO CON TU RIVAL · '); } catch (e) {} return h; };
  }
  if (typeof v7QteFinish === "function") {
    const o = v7QteFinish;
    v7QteFinish = function (ok, auto) {
      const Q = DL && DL.qte, riv = Q && Q.rival, atk = Q && Q.atk;
      const r = o.apply(this, arguments);
      try { if (riv && !auto) { if (ok) dlState().bonus += 0.5; dlFeed(DL.lap, ok ? (atk ? "😤 ¡Le ganaste el mano a mano a tu rival!" : "😤 ¡Tu rival no pudo con vos!") : "😤 Esta vez tu rival se salió con la suya.", true, ok ? "ok" : "bad"); setTimeout(() => { try { fwRadioSay(ok ? ["¡Esto no termina acá!", "Disfrutalo, no se va a repetir.", "Tuviste suerte."][dlH("rq" + DL.lap) % 3] : ["¡Chau! Nos vemos en la meta.", "Te dije que no me ibas a pasar.", "Mirá cómo se defiende."][dlH("rq" + DL.lap) % 3], "riv", { toast: true }); } catch (e) {} }, 1400); } } catch (e) {}
      return r;
    };
  }
  // mapa: vuelta de enfriamiento
  if (typeof fwMapDraw === "function") {
    const o = fwMapDraw;
    fwMapDraw = function (host, data, tLap) {
      try {
        const C = typeof DL !== "undefined" && DL && DL._cool;
        if (C && host && host.id === "dlMap" && performance.now() >= C.t0) {
          const k = Math.min(1, (performance.now() - C.t0) / C.dur);
          tLap = Math.max(0, data.N - 1) + k * 0.999;
          if (!host.querySelector(".v9-replay")) host.insertAdjacentHTML("beforeend", `<div class="v9-replay v11-coolb">🏁 VUELTA DE ENFRIAMIENTO</div>`);
        }
      } catch (e) {}
      return o.call(this, host, data, tLap);
    };
  }
  // teclas: VSC (mantener) y amarilla
  window.addEventListener("keydown", ev => {
    if (typeof DL === "undefined" || !DL || !document.getElementById("dlOverlay")?.classList.contains("show")) return;
    const k = ev.key;
    if (DL.phase === "vsc" && (k === " " || k === "ArrowDown")) { ev.preventDefault(); ev.stopImmediatePropagation(); v11VscHold(true); }
    else if (DL.phase === "yellow" && (k === " " || k === "Enter" || k === "ArrowDown")) { ev.preventDefault(); ev.stopImmediatePropagation(); v11YelHit(false); }
  }, true);
  window.addEventListener("keyup", ev => { if (typeof DL !== "undefined" && DL && DL.phase === "vsc" && (ev.key === " " || ev.key === "ArrowDown")) v11VscHold(false); }, true);
})();
try { V5_KEYS.push("v11Rival"); } catch (e) {}

/* ============================ 📖 tutorial ============================ */
function v11Tut() {
  const pg = document.querySelector('#v10Tut .v10-page[data-t="drv"]');
  if (!pg || pg.querySelector(".v11-tut")) return;
  pg.insertAdjacentHTML("beforeend", `<h3 class="v11-tut">🆕 Más carrera</h3><ul>
    <li><b>😤 Rival de la temporada</b>: antes de cada carrera, el cara a cara. Si lo cruzás en pista, el duelo vale el doble. Al final del GP se suma al marcador.</li>
    <li><b>🔁 Undercut</b>: si para el auto de atrás (o el de adelante), elegís si lo cubrís entrando a boxes o te quedás afuera. Mirá cómo están tus gomas.</li>
    <li><b>📡 Radar de lluvia</b>: te avisa un par de vueltas antes y en la decisión ves cómo se acercan (o se van) las nubes.</li>
    <li><b>🟡 VSC</b> (desde 2015): mantené apretado para frenar y quedate en la zona verde. <b>Doble amarilla</b> (antes de 2015): levantá justo antes de la bandera.</li>
    <li><b>🏁 Vuelta de enfriamiento</b>: después de la bandera a cuadros, tu ingeniero te cuenta cómo salió todo.</li></ul>`);
}
(function () {
  if (document.readyState !== "loading") setTimeout(v11Tut, 0); else document.addEventListener("DOMContentLoaded", v11Tut);
  const rd = window.render;
  if (typeof rd === "function") { render = function () { const r = rd.apply(this, arguments); try { v11Tut(); } catch (e) {} return r; }; window.render = render; }
})();
