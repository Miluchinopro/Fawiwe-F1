/* =====================================================================================
   MOTOR DE CINEMÁTICAS DE PISTA · 4 modos
     qd = clasificación del PILOTO (vuelta rápida: frená / soltá / acelerá sobre la cinemática)
     rd = carrera del PILOTO (largada con semáforo, ataque con ERS y frenada, defensa cubriendo)
     qe = clasificación del INGENIERO (tu piloto maneja solo; vos largás la vuelta con las gomas
          en temperatura, manejás el despliegue y reaccionás a la bandera amarilla)
     re = carrera del INGENIERO (modo ataque, ventana de boxes y orden de defender)
   En modo piloto se controla con el VOLANTE de la época; en modo ingeniero con el OBJETO de tu
   rango: laptop de telemetría, muro de boxes, tablet de estrategia o teléfono del palco.
   ===================================================================================== */
function lcCarSvg(y, color) {
  // auto visto desde arriba, apuntando hacia arriba (‑y), según la época
  const wing = y >= 1968, wide = y >= 2017, halo = y >= 2018;
  const body = y < 1968
    ? `<path d="M-7,-30 Q0,-38 7,-30 L9,18 Q0,26 -9,18 Z" fill="${color}"/>`
    : `<path d="M-5,-34 L5,-34 L8,-6 L13,4 L13,16 L6,22 L-6,22 L-13,16 L-13,4 L-8,-6 Z" fill="${color}"/>`;
  const tyres = `<rect x="${wide ? -21 : -18}" y="-26" width="${wide ? 8 : 7}" height="12" rx="2" fill="#111"/><rect x="${wide ? 13 : 11}" y="-26" width="${wide ? 8 : 7}" height="12" rx="2" fill="#111"/>
    <rect x="${wide ? -22 : -19}" y="8" width="${wide ? 9 : 8}" height="14" rx="2" fill="#111"/><rect x="${wide ? 13 : 11}" y="8" width="${wide ? 9 : 8}" height="14" rx="2" fill="#111"/>`;
  const wings = wing ? `<rect x="-17" y="-40" width="34" height="5" rx="1.5" fill="#222"/><rect x="-14" y="23" width="28" height="6" rx="1.5" fill="#222"/>` : "";
  const cock = `<ellipse cx="0" cy="-4" rx="4" ry="6" fill="#0b0b0b"/><circle cx="0" cy="-4" r="2.6" fill="${y < 1980 ? "#f5f5f5" : "#facc15"}"/>` + (halo ? `<path d="M-5,-9 Q0,-14 5,-9" stroke="#333" stroke-width="2" fill="none"/>` : "");
  return `<g class="lc-car">${tyres}${wings}${body}${cock}</g>`;
}
function lcBuildSector(i, slow, dir) {
  // recta hacia arriba, curva (izq/der), recta de salida
  const S = 900, R = slow ? 110 : 190, ang = (slow ? 150 : 90) * Math.PI / 180;
  const sx = 0, sy = -S;
  const cx = sx + dir * R, cy = sy; // centro del arco
  // calcular el final del arco a mano
  const endAng = dir > 0 ? Math.PI + ang : -ang;
  const ex = cx + R * Math.cos(endAng), ey = cy + R * Math.sin(endAng);
  // tangente de salida
  const tx = -Math.sin(endAng) * (dir > 0 ? 1 : -1), ty = Math.cos(endAng) * (dir > 0 ? 1 : -1);
  const ox = ex + tx * 700, oy = ey + ty * 700;
  const large = ang > Math.PI ? 1 : 0, sweep = dir > 0 ? 1 : 0;
  const d = `M0,0 L${sx},${sy} A${R},${R} 0 ${large} ${sweep} ${ex.toFixed(1)},${ey.toFixed(1)} L${ox.toFixed(1)},${oy.toFixed(1)}`;
  const arc = `M${sx},${sy} A${R},${R} 0 ${large} ${sweep} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  return { d, arc, S, arcLen: R * ang, R, dir };
}
function lcEngObject(t) {
  if (t <= 0) return { k: "laptop", ic: "💻", name: "Laptop de telemetría", who: "Ingeniero de equipo · auriculares puestos" };
  if (t === 1) return { k: "wall", ic: "📡", name: "Muro de boxes", who: "Director deportivo · en el muro" };
  if (t === 2) return { k: "tablet", ic: "📋", name: "Tablet de estrategia", who: "Jefe de escudería · en el garaje" };
  return { k: "phone", ic: "📱", name: "Línea directa desde el palco", who: "Presidente · palco del equipo" };
}
function lcEngObjectHtml(O, PW, mode) {
  const aLbl = mode === "re" ? "⚡ MODO ATAQUE" : "⚡ DESPLIEGUE " + PW.k;
  const traces = `<svg class="eo-trace" viewBox="0 0 120 30" preserveAspectRatio="none"><polyline id="eoTr" points="0,15 120,15" fill="none" stroke="#22c55e" stroke-width="1.6"/><polyline points="0,20 20,8 40,22 60,6 80,18 100,10 120,16" fill="none" stroke="#ffffff33" stroke-width="1"/></svg>`;
  const screen = `<div class="eo-screen"><div class="eo-top"><span id="eoL">${O.ic} ${O.name}</span><b id="eoV">—</b></div>${traces}
    <div class="eo-gauge"><i class="eo-win" id="eoWin"></i><i class="eo-fill" id="eoBar"></i><span id="eoG">—</span></div></div>`;
  const btns = `<div class="eo-btns"><button class="era-btn cool eo-a" id="eErsB">${aLbl}<small>mantener · <kbd>ESPACIO</kbd></small></button><button class="era-btn hot eo-b" id="eRadio">📻 RADIO <kbd>R</kbd><small id="eoRadioTxt">tocá en el momento justo</small></button></div>`;
  return `<div class="eo eo-${O.k}"><div class="eo-tag">${O.ic} ${O.who}</div><div class="eo-dev">${O.k === "wall" ? `<div class="eo-mons"><i></i><i></i><i></i></div>` : ""}${screen}${O.k === "laptop" ? `<div class="eo-keys"></div>` : ""}</div>${btns}<div class="mw-keys"><b>⌨️ Teclas</b><span><kbd>ESPACIO</kbd> ${mode === "re" ? "modo ataque" : "despliegue"}</span><span><kbd>R</kbd> / <kbd>Enter</kbd> radio</span></div></div>`;
}
function lcRun(mode) {
  const st = document.getElementById("eraStage");
  const E = ERA, sp = eraSpeed();
  const y = s.season || 2026;
  const isDrv = mode[1] === "d", isRace = mode[0] === "r";
  const PW = typeof rlPower === "function" ? rlPower(y) : { k: "ERS", ic: "⚡", name: "ERS", drain: 45, gain: 0.12, corner: "¡ERS en curva!", short: "ERS" };
  const BK = typeof rlBrakes === "function" ? rlBrakes(y) : { v: 1, w: 1, note: "" };
  const tr = trackData[s.gp] || { name: "Australia", record: "1:25.000" };
  const names = (typeof EM_CORNERS !== "undefined" && EM_CORNERS[tr.name]) || ["Curva 1", "Curva 2", "Curva 3", "Curva 4"];
  const NS = 3;
  const color = (typeof teamColors !== "undefined" && (teamColors[s.club] || teamColors[s.team])) || "#e10600";
  const rivalCols = ["#e3261a", "#ff8000", "#00d2be", "#1e41ff", "#f5f5f5", "#ffcc00", "#52e252"].filter(c => c.toLowerCase() !== String(color).toLowerCase());
  const KINDS = mode === "rd" ? ["start", "attack", "defend"] : mode === "re" ? ["attack", "pit", "defend"] : mode === "qe" ? ["release", "flag", "push"] : ["lap", "lap", "lap"];
  const KTXT = { start: "LARGADA", attack: "ATAQUE", defend: "DEFENSA", pit: "VENTANA DE BOXES", release: "VUELTA LANZADA", flag: "BANDERAS", push: "ÚLTIMO SECTOR", lap: "" };
  const GEARS = y < 1970 ? 5 : y < 1990 ? 6 : y < 2014 ? 7 : 8;
  const VMAX = y < 1970 ? 260 : y < 2000 ? 300 : 325;
  const flameCol = PW.k === "REBUFO" ? "#f97316" : "#38bdf8";
  const O = isDrv ? null : lcEngObject(tierIndex());
  E.mode = mode; E.c = 0; E.ph = 0; E.p = 0; E.loss = []; E.cur = 0; E.wait = 0; E.ers = 100; E.ersOn = false; E.brakeOn = false; E.ersGain = 0;
  E.gain = 0; E.cold = false; E.extra = 0;
  E.startPos = Math.max(1, Math.min(20, (typeof s.qualiPos === "number" && s.qualiPos) || 8));
  E.base = emParseLap(tr.record) + 0.45;
  E.pole = E.base - 0.05 + emRand(60) * 0.25;
  const w = 9 / sp * BK.w;
  E.corners = [names[0], names[Math.min(1, names.length - 1)], names[names.length - 1]].slice(0, NS).map((n, i) => {
    const b = 34 + emRand(i + 61) * 10;
    const slow = /Horquilla|Hairpin|Loews|Sainte|Chicane|Variante|Source|Bus|Curva 3/.test(n);
    return { n, slow, kind: KINDS[i], dir: emRand(i + 71) < 0.5 ? -1 : 1, b, a: b + (slow ? 22 : 26), e: b + (slow ? 42 : 46), v: (slow ? 30 : 36) * sp * BK.v };
  });
  // ayudas según la dificultad: Fácil = frena y acelera solo · Normal = vos frenás · Difícil = vos frenás y acelerás
  const AE = !isDrv ? (s.miniDiff === "easy" ? { deploy: true, cue: true, lbl: "🟢 FÁCIL · el despliegue es automático y te avisamos cuándo tocar RADIO" } : s.miniDiff === "hard" ? { lbl: "🔴 DIFÍCIL · despliegue y radio a mano" } : { deploy: true, lbl: "🟡 NORMAL · el despliegue es automático: vos manejás la radio" }) : {};
  E.engAssist = AE;
  const AS = isDrv ? (s.miniDiff === "easy" ? { brake: true, gas: true, lbl: "🟢 FÁCIL · el auto frena y acelera solo: vos doblás y usás el ERS" } : s.miniDiff === "hard" ? { lbl: "🔴 DIFÍCIL · vos frenás y acelerás" } : { gas: true, lbl: "🟡 NORMAL · vos frenás, el auto acelera solo" }) : {};
  E.assist = AS;
  const hint = isDrv
    ? (AS.brake ? "<b>" + AS.lbl + "</b> · <kbd>←</kbd><kbd>→</kbd> = <b>doblar</b>" + (isRace ? " / cubrir" : "") + " · <kbd>ESPACIO</kbd> = <b>ERS</b>" : AS.gas ? "<b>" + AS.lbl + "</b> · Tocá (o <kbd>↓</kbd>) = <b>frenar</b> · <kbd>←</kbd><kbd>→</kbd> = <b>doblar</b>" + (isRace ? " / cubrir" : "") + " · <kbd>ESPACIO</kbd> = <b>ERS</b>" : isRace ? "👆 Tocá (o <kbd>↓</kbd> / <kbd>↑</kbd>) = <b>frenar</b> y <b>gas</b> · <kbd>←</kbd><kbd>→</kbd> = <b>doblar</b> / cubrir · <kbd>ESPACIO</kbd> = <b>ERS</b>" : "👆 Tocá (o <kbd>↓</kbd> / <kbd>↑</kbd>) = <b>frenar</b> y <b>gas</b> · <kbd>←</kbd><kbd>→</kbd> = <b>doblar</b> · <kbd>ESPACIO</kbd> = <b>ERS</b>")
    : "<b>" + AE.lbl + "</b> · 📺 tu piloto maneja";
  const ctrl = isDrv
    ? `<div class="era-row"><button class="era-btn lc-steer" id="eStL">◀<br><small>doblar <kbd>←</kbd></small></button><button class="era-btn cool" id="eErsB">${PW.ic} ${isRace && y >= 2011 && y < 2026 ? PW.k + " + DRS" : PW.k}<br><small>mantener · <kbd>ESPACIO</kbd></small></button><button class="era-btn lc-steer" id="eStR">▶<br><small>doblar <kbd>→</kbd></small></button></div>`
    : lcEngObjectHtml(O, PW, mode);
  st.innerHTML = `<div class="era-stat"><span id="lcTel">N · 0 km/h</span><span>Sectores: <span id="eSec"></span></span><b id="eCn" hidden></b></div>
    <div class="lc-cine ${isRace ? "race" : "quali"} ${isDrv ? "drv" : "eng"}" id="lcCine" tabindex="0">
      <svg viewBox="-200 -330 400 400" preserveAspectRatio="xMidYMid meet" id="lcSvg"><defs>
        <pattern id="lcGrass" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#2a5f26"/><rect width="40" height="20" fill="#306b2b"/></pattern>
        <pattern id="lcCrowd" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#26262e"/><circle cx="3" cy="3" r="2.2" fill="#e10600"/><circle cx="8" cy="7" r="2.2" fill="#f5f5f5"/><circle cx="8" cy="2" r="1.8" fill="#facc15"/><circle cx="3" cy="8" r="1.8" fill="#38bdf8"/></pattern>
        <radialGradient id="lcGlow"><stop offset="0" stop-color="#ff7a1a" stop-opacity="1"/><stop offset="1" stop-color="#ff2414" stop-opacity="0"/></radialGradient>
        <linearGradient id="lcFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${flameCol}"/><stop offset="1" stop-color="${flameCol}" stop-opacity="0"/></linearGradient></defs>
        <g id="lcCam"><rect x="-3000" y="-3000" width="6000" height="6000" fill="url(#lcGrass)"/><g id="lcWorld"></g></g>
        <g id="lcCarG"><ellipse cx="3" cy="4" rx="17" ry="34" fill="#000" opacity=".35"/><path class="lc-flame" d="M-4,26 Q0,62 4,26 Z" fill="url(#lcFlame)"/>${lcCarSvg(y, color)}<g class="lc-glow"><circle cx="${y >= 2017 ? -17 : -14}" cy="-20" r="9" fill="url(#lcGlow)"/><circle cx="${y >= 2017 ? 17 : 14}" cy="-20" r="9" fill="url(#lcGlow)"/></g><g id="lcSparks"></g></g>
      </svg>
      <div class="lc-lines"></div><div class="lc-vig"></div>
      <div class="lc-bar t"></div><div class="lc-bar b"></div>
      <div class="lc-plate"><b id="lcSec">SECTOR 1</b><span id="lcCorner"></span></div>
      <div class="lc-speed"><b id="lcKmh">0</b><span>KM/H</span></div>
      <div class="lc-gear"><b id="lcGear">N</b><span>MARCHA</span></div>
      ${isRace ? `<div class="lc-pos"><span>POS</span><b id="lcPos">P${E.startPos}</b></div><div class="lc-gap" id="lcGap"></div>` : `<div class="lc-delta" id="lcDelta">Δ 0.000</div>`}
      <div class="lc-lights" id="lcLights"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="lc-warn" id="lcWarn"></div>
      <div class="lc-flag" id="lcFlag">🟨 BANDERA AMARILLA</div>
      ${isDrv ? `<div class="lc-radio" id="lcRadio"></div>` : `<div class="lc-radio" id="lcRadio"></div><div class="lc-tv"><i></i>EN VIVO · CÁMARA ONBOARD · ${(() => { try { return engEsc((myTeamLineup()[0] || {}).name || "tu piloto"); } catch (e) { return "tu piloto"; } })()}</div>`}
      <div class="lc-call" id="lcCall"></div>
      <div class="lc-slam" id="lcSlam"><i></i><b></b><span></span></div>
      <div class="lc-hint">${hint}</div>
    </div>
    <div class="em-lapbar thin" id="eBar"><div class="z s" id="eZs"></div><div class="z b" id="eZb"></div><div class="z a" id="eZa"></div><div class="z e" id="eZe"></div><div class="gn" id="eN"></div></div>
    <div class="era-batt"><i id="eErs" style="width:100%;background:#38bdf8"></i></div>
    <div class="em-phase" id="ePh"></div>
    ${ctrl}
    <div class="em-timing" id="eTime">${isRace ? "🏁 Carrera en curso…" : "⏱️ Vuelta en curso…"} <span class="small">${PW.name}: solo en la recta.${BK.note ? " " + BK.note : ""}</span></div>`;
  const world = document.getElementById("lcWorld"), cam = document.getElementById("lcCam"), cine = document.getElementById("lcCine");
  if (!isDrv && AE.deploy) { const k1 = st.querySelector(".eo .mw-keys span"); if (k1) k1.innerHTML = "⚡ despliegue: <b>automático</b>"; const sm = st.querySelector("#eErsB small"); if (sm) sm.textContent = "automático"; }
  let path = null, L = 0, G = null;
  const $ = id => document.getElementById(id);
  const call = (t, cls) => { const c = $("lcCall"); if (!c) return; c.className = "lc-call show " + (cls || ""); c.textContent = t; clearTimeout(c._t); c._t = setTimeout(() => c.classList.remove("show"), 900); };
  const radio = t => { const r = $("lcRadio"); if (!r) return; r.innerHTML = "📻 " + t; r.classList.remove("show"); void r.offsetWidth; r.classList.add("show"); };
  const warn = (t, cls) => { const el = $("lcWarn"); if (!el) return; el.innerHTML = t; el.className = "lc-warn" + (t ? " show " + (cls || "") : ""); };
  const shake = () => { cine.classList.remove("shake"); void cine.offsetWidth; cine.classList.add("shake"); };
  const C0 = () => E.corners[E.c];
  /* ---------- mundo ---------- */
  const buildWorld = () => {
    const C = C0();
    G = lcBuildSector(E.c, C.slow, C.dir);
    const brakeAt = G.S * 0.82;
    const side = -C.dir;
    const boards = ["FAWIWE", "MILO OIL", "TURBO-X", "PADDOCK", "FAWIWE", "GOMAS 2X"];
    const grid = C.kind === "start" ? [0, 1, 2, 3, 4, 5].map(k => `<g transform="translate(${k % 2 ? 22 : -22},${110 - k * 70})"><rect x="-16" y="-4" width="32" height="5" fill="#fff"/><text y="16" text-anchor="middle" font-size="9" fill="#fff" opacity=".6">${E.startPos - 2 + k > 0 ? E.startPos - 2 + k : ""}</text></g>`).join("") : "";
    const pitLane = C.kind === "pit" ? `<path d="M${C.dir > 0 ? -70 : 70},-80 L${C.dir > 0 ? -70 : 70},${-brakeAt + 120}" stroke="#55555f" stroke-width="40"/><path d="M${C.dir > 0 ? -70 : 70},-80 L${C.dir > 0 ? -70 : 70},${-brakeAt + 120}" stroke="#fff" stroke-width="2" stroke-dasharray="10 8"/><text transform="translate(${C.dir > 0 ? -70 : 70},${-brakeAt / 2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="900" fill="#facc15">PIT LANE</text>` : "";
    world.innerHTML = `<rect x="${side > 0 ? 168 : -262}" y="${-G.S + 40}" width="94" height="${G.S - 60}" fill="url(#lcCrowd)" stroke="#111" stroke-width="4"/>
      <rect x="${side > 0 ? 160 : -170}" y="${-G.S + 40}" width="10" height="${G.S - 60}" fill="#e10600"/>
      <path d="${G.d}" fill="none" stroke="#a7adb5" stroke-width="300" stroke-dasharray="14 4"/>
      <path d="${G.d}" fill="none" stroke="#2a5f26" stroke-width="284"/>
      <path d="${G.arc}" fill="none" stroke="#cdb67f" stroke-width="250"/>
      ${boards.map((b, k) => `<text transform="translate(${side > 0 ? -70 : 70},${-120 - k * 120}) rotate(-90)" text-anchor="middle" font-size="13" font-weight="900" font-style="italic" fill="#fff" opacity=".8" letter-spacing="2">${b}</text>`).join("")}
      <path d="${G.d}" fill="none" stroke="#c8b98a" stroke-width="150" stroke-linecap="round" opacity=".35"/>
      ${pitLane}
      <path d="${G.d}" fill="none" stroke="#f2f2f2" stroke-width="96"/>
      <path d="${G.d}" fill="none" stroke="#3d3d45" stroke-width="86" id="lcRoad"/>
      <path d="${G.arc}" fill="none" stroke="#e10600" stroke-width="92" stroke-dasharray="14 14" opacity=".9"/>
      <path d="${G.arc}" fill="none" stroke="#3d3d45" stroke-width="80"/>
      <path d="${G.d}" fill="none" stroke="#ffffff22" stroke-width="2" stroke-dasharray="30 30"/>
      ${grid}
      ${[300, 200, 100].map(m => `<g transform="translate(${C.dir > 0 ? -62 : 62},${-(brakeAt - m * 1.1)})"><rect x="-11" y="-14" width="22" height="28" rx="2" fill="#fff" stroke="#111" stroke-width="2"/><text y="5" text-anchor="middle" font-size="12" font-weight="900" fill="#111">${m}</text></g>`).join("")}
      <rect x="-43" y="${-brakeAt - 3}" width="86" height="6" fill="#e10600" opacity=".85"/>
      <text x="0" y="${-brakeAt + 22}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" opacity=".85">FRENÁ</text>
      <path id="lcArcRef" d="${G.arc}" fill="none" stroke="none"/>`;
    path = $("lcRoad"); L = path.getTotalLength();
    const arcRef = $("lcArcRef"), al = arcRef.getTotalLength();
    const apexC = arcRef.getPointAtLength(al / 2), ex = arcRef.getPointAtLength(al);
    const acx = C.dir * G.R, acy = -G.S, an = Math.hypot(acx - apexC.x, acy - apexC.y) || 1;
    const apex = { x: apexC.x + (acx - apexC.x) / an * 30, y: apexC.y + (acy - apexC.y) / an * 30 };
    world.insertAdjacentHTML("beforeend", `<circle cx="${apex.x}" cy="${apex.y}" r="9" fill="#f97316" stroke="#fff" stroke-width="3"/><text x="${apex.x}" y="${apex.y - 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">VÉRTICE</text><path d="${G.arc}" fill="none" stroke="#f9731655" stroke-width="3" stroke-dasharray="6 8" transform="translate(0,0)"/>
      <circle cx="${ex.x}" cy="${ex.y}" r="9" fill="#22c55e" stroke="#fff" stroke-width="3"/><text x="${ex.x}" y="${ex.y - 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">GAS</text>
      <g id="lcFx"></g><g id="lcRivals"></g>`);
    G.brakeAt = brakeAt; G.apexL = G.S + G.arcLen / 2; G.exitL = G.S + G.arcLen;
  };
  const distFor = p => {
    const C = C0();
    if (p <= C.b) return (p / C.b) * G.brakeAt;
    if (p <= C.a) return G.brakeAt + (p - C.b) / (C.a - C.b) * (G.apexL - G.brakeAt);
    if (p <= C.e) return G.apexL + (p - C.a) / (C.e - C.a) * (G.exitL - G.apexL);
    return G.exitL + (p - C.e) / Math.max(1, 100 - C.e) * Math.min(600, L - G.exitL);
  };
  const kmhFor = p => {
    const C = C0(), vmin = C.slow ? 85 : 165, vmax = VMAX;
    if (E.hold || E.stall > 0) return 0;
    if (C.kind === "start" && p < 20) return vmax * (0.15 + p / 20 * 0.8);
    if (p <= C.b) return vmax - 8 + (E.ersOn && E.ers > 0 ? 12 : 0);
    if (p <= C.a) return vmax - (vmax - vmin) * ((p - C.b) / (C.a - C.b));
    if (p <= C.e) return vmin + 25 * ((p - C.a) / (C.e - C.a));
    return Math.min(vmax, vmin + 25 + (p - C.e) * 6);
  };
  /* ---------- rivales ---------- */
  const rivalSvg = col => `<g class="lc-rival">${lcCarSvg(y, col)}</g>`;
  const addRival = (off, lat, col) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = rivalSvg(col);
    $("lcRivals").appendChild(g);
    const R = { off, lat, toOff: off, toLat: lat, el: g, col };
    E.rv.push(R); return R;
  };
  const placeRivals = d => {
    (E.rv || []).forEach(R => {
      R.off += (R.toOff - R.off) * 0.035; R.lat += (R.toLat - R.lat) * 0.05;
      const dr = Math.max(0, Math.min(L - 1, d + R.off));
      const p1 = path.getPointAtLength(dr), p2 = path.getPointAtLength(Math.min(L, dr + 4));
      const tx = p2.x - p1.x, ty = p2.y - p1.y, n = Math.hypot(tx, ty) || 1;
      const nx = -ty / n, ny = tx / n;
      const hd = Math.atan2(ty, tx) * 180 / Math.PI + 90;
      if (R.spin) R.spinA = (R.spinA || 0) + (R.spin - (R.spinA || 0)) * 0.05;
      R.el.setAttribute("transform", `translate(${(p1.x + nx * R.lat).toFixed(1)},${(p1.y + ny * R.lat).toFixed(1)}) rotate(${(hd + (R.spinA || 0)).toFixed(1)})`);
    });
  };
  /* ---------- cámara + telemetría + volante ---------- */
  const place = () => {
    if (!path) return;
    const d = Math.max(0, Math.min(L - 1, distFor(E.p)));
    const pt = path.getPointAtLength(d), pt2 = path.getPointAtLength(Math.min(L, d + 4));
    const hd = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI + 90;
    E.hd = E.hd === undefined ? hd : E.hd + ((((hd - E.hd) % 360) + 540) % 360 - 180) * 0.25;
    const v = kmhFor(E.p), f = v / VMAX;
    const zT = 1.22 - f * 0.42; E.z = E.z === undefined ? zT : E.z + (zT - E.z) * 0.06;
    const lat = E.lat || 0; E.myLatC = (E.myLatC || 0) + (lat - (E.myLatC || 0)) * 0.08;
    cam.setAttribute("transform", `scale(${E.z.toFixed(3)}) rotate(${(-E.hd).toFixed(2)}) translate(${(-pt.x).toFixed(1)},${(-pt.y).toFixed(1)})`);
    if (E.spin) E.spinA = (E.spinA || 0) + (E.spin - (E.spinA || 0)) * 0.06;
    const cg = $("lcCarG"); if (cg) cg.setAttribute("transform", `scale(${E.z.toFixed(3)}) translate(${E.myLatC.toFixed(1)},0) rotate(${(E.spinA || 0).toFixed(1)})`);
    E.pt = pt;
    placeRivals(d);
    const kmh = $("lcKmh"); if (kmh) kmh.textContent = Math.round(v);
    cine.style.setProperty("--spd", Math.max(0, (f - 0.55) / 0.45).toFixed(2));
    const band = VMAX / GEARS, gear = v < 3 ? 0 : Math.max(1, Math.min(GEARS, Math.ceil(v / band)));
    E.rpm = E.hold ? (E.revs || 0) : Math.max(0, Math.min(100, ((v - (gear - 1) * band) / band) * 100));
    if (E.gear !== gear) { const mw = document.querySelector("#eraStage .mw"); if (mw && E.gear) { mw.classList.remove("shift"); void mw.offsetWidth; mw.classList.add("shift"); } E.gear = gear; }
    const gEl = $("lcGear"); if (gEl) gEl.textContent = gear || "N";
    const fr = Math.min(1, (E.c + Math.min(100, E.p) / 100) / NS);
    const delta = (E.base - E.pole) * fr + E.loss.reduce((a, b) => a + b, 0) + E.cur - E.ersGain + E.extra;
    const dEl = $("lcDelta"); if (dEl) { dEl.textContent = "Δ " + (delta >= 0 ? "+" : "−") + Math.abs(delta).toFixed(3); dEl.className = "lc-delta " + (delta <= 0 ? "pb" : delta < 0.35 ? "ok" : "bad"); }
    const pos = E.startPos - E.gain;
    const tel = $("lcTel"); if (tel) tel.textContent = (gear || "N") + (gear ? "ª" : "") + " · " + Math.round(v) + " km/h · " + (isRace ? "P" + pos : "Δ" + (delta >= 0 ? "+" : "−") + Math.abs(delta).toFixed(2));
    const eoV = $("eoV"); if (eoV) eoV.textContent = isRace ? "P" + pos + " · " + Math.round(v) + " km/h" : (delta >= 0 ? "+" : "−") + Math.abs(delta).toFixed(3);
    const tr2 = $("eoTr"); if (tr2) { E.trace = (E.trace || []).concat([v]).slice(-60); tr2.setAttribute("points", E.trace.map((q, i) => `${(i * 2).toFixed(0)},${(28 - q / VMAX * 26).toFixed(1)}`).join(" ")); }
    const C = C0();
    let steerT = 0;
    if (isDrv) steerT = (E.steerIn || 0) * 85; else
    if (d > G.S - 40 && d < G.exitL + 60) { const k = Math.max(0, Math.min(1, (d - (G.S - 40)) / (G.arcLen + 100))); steerT = C.dir * (C.slow ? 95 : 55) * Math.sin(Math.PI * k); }
    E.steer = (E.steer || 0) + (steerT - (E.steer || 0)) * 0.15;
    const mw = document.querySelector("#eraStage .mw"); if (mw) mw.style.transform = `rotate(${(E.steer * (mw.classList.contains("mw-round") ? 1 : 0.3)).toFixed(1)}deg)`;
  };
  const setPos = () => { const el = $("lcPos"); if (el) { el.textContent = "P" + (E.startPos - E.gain); el.parentNode.classList.remove("up", "down"); void el.offsetWidth; } };
  const posChange = (dlt, txt) => {
    E.gain += dlt; setPos();
    const el = $("lcPos"); if (el) el.parentNode.classList.add(dlt > 0 ? "up" : "down");
    slam(dlt > 0 ? "▲ P" + (E.startPos - E.gain) : "▼ P" + (E.startPos - E.gain), txt, dlt > 0 ? "ok" : "bad");
  };
  const zone = ph => { const C = C0(); return ph === 0 ? C.b : ph === 1 ? C.a : C.e; };
  /* ---------- objeto del ingeniero: barra ---------- */
  const eoBar = (val, win, label) => {
    const b = $("eoBar"), wv = $("eoWin"), g = $("eoG");
    if (b) b.style.width = Math.max(0, Math.min(100, val)) + "%";
    if (wv) { if (win) { wv.style.left = win[0] + "%"; wv.style.width = (win[1] - win[0]) + "%"; wv.style.display = "block"; } else wv.style.display = "none"; }
    if (g && label !== undefined) g.textContent = label;
  };
  const radioTxt = t => { const el = $("eoRadioTxt"); if (el) el.textContent = t; };
  /* ---------- por sector ---------- */
  const setup = () => {
    const C = C0();
    $("eCn").textContent = "Sector " + (E.c + 1) + "/3 · " + C.n;
    $("lcSec").innerHTML = (KTXT[C.kind] ? `<i class="lc-k">${KTXT[C.kind]} · </i>` : "") + "SECTOR " + (E.c + 1) + "/3";
    $("lcCorner").textContent = C.n + (C.dir > 0 ? " ↱" : " ↰");
    const zs = $("eZs"); zs.style.left = "0%"; zs.style.width = (C.b - w / 2 - 2) + "%";
    [["eZb", C.b], ["eZa", C.a], ["eZe", C.e]].forEach(([id, x]) => { const z = $(id); z.style.left = (x - w / 2) + "%"; z.style.width = w + "%"; z.classList.remove("hit", "miss"); });
    E.p = 0; E.ph = 0; E.cur = 0; E.brakeOn = false; E.hd = undefined; E.rv = []; E.ev = {}; E.myLat = 0; E.lat = 0; E.offT = false; E.hold = false; E.aiErr = isDrv ? 0 : (E.cold ? 0.9 + emRand(800 + E.c) * 0.6 : emRand(810 + E.c) * 0.25);
    const sv = $("lcSvg");
    if (sv && cine.clientHeight) { const vh = 400, vw = Math.max(300, vh * cine.clientWidth / cine.clientHeight); sv.setAttribute("viewBox", `${(-vw / 2).toFixed(0)} -330 ${vw.toFixed(0)} ${vh}`); }
    buildWorld();
    const rc = k => rivalCols[(E.c * 2 + k) % rivalCols.length];
    // rivales y eventos según el tipo de sector
    if (C.kind === "start") { E.hold = true; E.lights = 0; E.lt = 0; E.goAt = 1.6 + emRand(80 + E.c) * 1.4; addRival(70, -26, rc(0)); E.side = addRival(4, 30, rc(1)); addRival(-75, -4, rc(2)); E.myLat = -30; }
    if (C.kind === "attack") { E.tgt = addRival(110, 0, rc(0)); addRival(-160, 10, rc(1)); E.gapPx = 110; const tS = Math.max(0.2, (C.b - 10) / C.v); E.ersClose = 92 / tS; E.baseClose = 14 / tS; }
    if (C.kind === "defend") { E.atk = addRival(-120, 0, rc(0)); E.ev.side = emRand(90 + E.c) < 0.5 ? -1 : 1; }
    if (C.kind === "pit") { addRival(110, 0, rc(0)); addRival(-110, 0, rc(1)); E.wear = 72; }
    if (C.kind === "release") { E.temp = 40; }
    if (C.kind === "flag") { E.ev.flagAt = 12 + emRand(95) * (C.b - 30); E.ev.flagOn = false; }
    if (!isDrv) {
      // la IA de tu piloto: dónde va a frenar, soltar y acelerar (con gomas frías se equivoca más)
      const amp = w * (E.cold ? 2.2 : 0.5);
      E.ai = [C.b, C.a, C.e].map((z, k) => z + (emRand(200 + E.c * 3 + k) - 0.5) * amp);
      eoBar(0, null, "—"); radioTxt(C.kind === "release" ? "largá la vuelta con las gomas en temperatura" : C.kind === "flag" ? "avisale si hay bandera" : C.kind === "pit" ? "llamalo a boxes en la ventana" : C.kind === "defend" ? "ordená defender cuando ataquen" : C.kind === "attack" ? "usá el modo ataque en la recta" : "dale ánimo: empujá");
    }
    if (isDrv && isRace) { const CUE = { start: "«Luces en un momento. Concentrado, buena largada.»", attack: "«Lo tenés a menos de un segundo. ERS en la recta y a la frenada.»", defend: "«Te viene atacando por atrás. Cubrí el interior.»" }; if (CUE[C.kind]) setTimeout(() => radio(CUE[C.kind]), 900); }
    else if (isDrv && E.c === 0) setTimeout(() => radio("«Vuelta rápida. Todo tuyo, empujá.»"), 900);
    place();
    const ph = $("ePh"); delete ph.dataset.pw;
    ph.textContent = C.kind === "start" ? "Semáforo: esperá que se apaguen las 5 luces y tocá la cinemática…" : C.kind === "attack" ? (isDrv ? "Pegate con el " + PW.short + " en la recta y frená justo para pasarlo…" : "Tu piloto lo tiene adelante: modo ataque en la recta…") : C.kind === "defend" ? (isDrv ? "Te atacan: cuando veas por dónde, apretá ◀ o ▶ (o tocá ese lado de la cinemática) para cubrir…" : "Te vienen a atacar: tocá RADIO cuando entre en el rango de 1 segundo…") : C.kind === "pit" ? "Mirá el desgaste en el objeto: BOX en la ventana verde…" : C.kind === "release" ? "Las gomas calientan: tocá RADIO cuando estén en la ventana verde…" : C.kind === "flag" ? "Atento a las banderas: si aparece una amarilla, RADIO enseguida…" : isDrv ? (AS.brake ? "Recta: usá el " + PW.short + ". El auto frena y acelera solo: vos doblá con ◀ ▶ hasta el cono naranja…" : "Recta: usá el " + PW.short + " y esperá el cartel de FRENÁ. En la curva doblá con ◀ ▶ hasta el cono naranja…" + (AS.gas ? " (el gas es automático)" : "")) : "Último sector: usá el despliegue en la recta…";
    cine.classList.add("intro"); setTimeout(() => cine.classList.remove("intro"), 700);
    slam(KTXT[C.kind] || "SECTOR " + (E.c + 1), C.n + (C.slow ? " · curva lenta" : " · curva rápida"));
    const lights = $("lcLights"); if (lights) { lights.classList.toggle("show", C.kind === "start"); lights.querySelectorAll("i").forEach(l => l.classList.remove("on")); }
    warn("");
  };
  const slam = (big, small, cls) => { const el = $("lcSlam"); if (!el) return; el.querySelector("b").textContent = big; el.querySelector("span").textContent = small; el.className = "lc-slam " + (cls || ""); void el.offsetWidth; el.classList.add("go"); };
  const fx = kind => {
    const g = $("lcFx"); if (!g || !E.pt) return;
    const NS2 = "http://www.w3.org/2000/svg";
    if (kind === "skid") { const r = document.createElementNS(NS2, "rect"); r.setAttribute("x", E.pt.x - 14); r.setAttribute("y", E.pt.y - 3); r.setAttribute("width", 6); r.setAttribute("height", 7); r.setAttribute("fill", "#111"); r.setAttribute("opacity", ".55"); const r2 = r.cloneNode(); r2.setAttribute("x", E.pt.x + 8); g.append(r, r2); }
    if (kind === "smoke") { const c = document.createElementNS(NS2, "circle"); c.setAttribute("cx", E.pt.x + (Math.random() * 30 - 15)); c.setAttribute("cy", E.pt.y + (Math.random() * 20 - 10)); c.setAttribute("r", 10); c.setAttribute("class", "lc-smoke"); g.appendChild(c); setTimeout(() => c.remove(), 900); }
    if (kind === "dust") { const c = document.createElementNS(NS2, "circle"); c.setAttribute("cx", E.pt.x + (Math.random() * 30 - 15)); c.setAttribute("cy", E.pt.y + (Math.random() * 20 - 10)); c.setAttribute("r", 9); c.setAttribute("class", "lc-smoke lc-dust"); g.appendChild(c); setTimeout(() => c.remove(), 900); }
    while (g.childNodes.length > 260) g.firstChild.remove();
  };
  const spark = () => {
    const g = $("lcSparks"); if (!g) return;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const x = Math.random() * 20 - 10; l.setAttribute("x1", x); l.setAttribute("y1", 24); l.setAttribute("x2", x + Math.random() * 10 - 5); l.setAttribute("y2", 40 + Math.random() * 30); l.setAttribute("class", "lc-spark"); g.appendChild(l); setTimeout(() => l.remove(), 260);
  };
  /* ---------- COLISIONES (en los dos modos) ---------- */
  const later = (ms, fn) => setTimeout(() => { if (ERA === E) fn(); }, ms);
  const crash = (R, o) => {
    o = o || {};
    const big = !!o.big;
    E.crashes = (E.crashes || 0) + 1;
    cine.classList.remove("crash"); void cine.offsetWidth; cine.classList.add("crash"); later(800, () => cine.classList.remove("crash"));
    shake(); E.lock = 0.9;
    for (let i = 0; i < 10; i++) later(i * 25, spark);
    const g = $("lcFx");
    if (g && E.pt) {
      const NS2 = "http://www.w3.org/2000/svg";
      for (let i = 0; i < (big ? 24 : 14); i++) {
        const wrap = document.createElementNS(NS2, "g");
        wrap.setAttribute("transform", `translate(${(E.pt.x + Math.random() * 24 - 12).toFixed(1)},${(E.pt.y - 22 + Math.random() * 20 - 10).toFixed(1)})`);
        const s0 = 3 + Math.random() * 5, pg = document.createElementNS(NS2, "polygon");
        pg.setAttribute("points", `0,0 ${s0},${(s0 * 0.4).toFixed(1)} ${(s0 * 0.3).toFixed(1)},${s0}`);
        pg.setAttribute("fill", i % 3 ? "#151515" : (i % 2 ? color : (R && R.col) || "#e5e7eb"));
        pg.setAttribute("class", "lc-debris");
        pg.style.setProperty("--dx", (Math.random() * 180 - 90).toFixed(0) + "px"); pg.style.setProperty("--dy", (Math.random() * 180 - 110).toFixed(0) + "px"); pg.style.setProperty("--r", (Math.random() * 900 - 450).toFixed(0) + "deg");
        wrap.appendChild(pg); g.appendChild(wrap); later(1700, () => wrap.remove());
      }
    }
    if (R) { R.spin = (o.rivalSpin || 380) * (Math.random() < 0.5 ? -1 : 1); R.toLat = (R.lat >= 0 ? 1 : -1) * 70; R.toOff = R.off - (o.rivalBack || 120); }
    if (o.wall) { E.dnf = true; E.stall = 99; }
    if (big) { if (!o.wall) E.stall = 1.4; E.lat = (o.wall ? -C0().dir : 1) * 60; E.spin = 380 * (o.wall ? C0().dir * -1 : 1); E.myLat = (o.wall ? -C0().dir : 1) * 40; }
    else E.myLat = (E.myLat || 0) + (R && R.lat > 0 ? -12 : 12);
    try { FWAudio.bad(); } catch (e) {}
    E.extra += big ? 1.2 : 0.4;
    slam(o.wall ? "¡AL MURO!" : big ? "¡CHOQUE!" : "¡CONTACTO!", o.txt || "", "bad");
    if (o.wall) {
      const cn = C0().n;
      (E.rv || []).forEach(Rv => { Rv.toOff = Math.max(Rv.off, 0) + 600; Rv.toLat = 0; }); const gp0 = $("lcGap"); if (gp0) gp0.classList.remove("show"); warn("");
      const real = isRace ? s.session === 3 : s.session === 2;
      if (isRace && real) { try { s._crashDNF = { key: s.season + "_" + s.gp }; } catch (e) {} }
      if (!isRace && real) { try { s._crashQuali = { key: s.season + "_" + s.gp }; } catch (e) {} }
      radio(isDrv ? (isRace ? "«Box, box… no, quedate ahí. Se terminó la carrera.»" : "«Sin vuelta. Volvé despacio si podés.»") : (isRace ? "Piloto: «Lo siento, chicos. El auto está destruido.»" : "Piloto: «Perdón, se me fue. No hay tiempo.»"));
      try { add("💥 " + (isDrv ? "Te fuiste" : "Tu piloto se fue") + " contra las barreras en " + C0().n + (isRace ? ": ABANDONO (DNF)." : ": sin tiempo en la clasificación.")); } catch (e) {}
      try { FWAudio.bad(); } catch (e) {}
      later(2700, () => {
        slam(isRace ? "DNF" : "SIN TIEMPO", isRace ? "abandono · " + cn : "largás desde el fondo", "bad");
        $("eTime").innerHTML = isRace ? `💥 <b style="color:#ff4b3e">ABANDONO (DNF)</b> · contra las barreras en ${cn}` : `💥 <b style="color:#ff4b3e">SIN TIEMPO</b> · vuelta terminada contra las barreras`;
        E.acc = 0; window.__emLapAcc = 0; window.__emRaceGain = -20;
        eraEnd(false, isRace ? (isDrv ? "💥 DNF: te fuiste contra el muro. Cero puntos este domingo. Frená en el cartel de FRENÁ." : "💥 DNF: tu piloto se fue contra el muro. Cero puntos.") : (isDrv ? "💥 Al muro: sin vuelta válida, largás desde el fondo." : "💥 Tu piloto se fue al muro: sin tiempo, larga desde el fondo."));
      });
      return;
    }
    radio(o.radio || (isDrv ? (big ? "«¿Estás bien? Contame del auto…»" : "«Tocaste, revisá los datos del alerón.»") : (big ? "Piloto: «¡Me chocaron! El auto está muy dañado.»" : "Piloto: «Hubo contacto, el auto tira para un lado.»")));
    // daño que se lleva a la carrera / al resultado del GP
    try { s._rlDamage = { key: s.season + "_" + s.gp, pen: big ? -12 : -6, note: big ? "💥 Choque fuerte: alerón y suspensión dañados." : "🔧 Contacto: alerón delantero tocado." }; add((big ? "💥 " : "🔧 ") + (o.wall ? "Se fue contra las barreras en " : "Contacto en ") + C0().n + ": " + (o.txt || "") + "."); } catch (e) {}
    // posiciones (en carrera) y sanción si fue culpa tuya
    if (isRace) {
      const d = -(o.pos || 0) + (o.gainBack || 0);
      const g0 = E.gain, p1 = E.startPos - (g0 + d);
      const showPos = p => { const el = $("lcPos"); if (el) { el.textContent = "P" + p; el.parentNode.classList.remove("up", "down"); void el.offsetWidth; } };
      E.crashT = Date.now();
      if (d) { E.gain += d; later(1150, () => { showPos(p1); const el = $("lcPos"); if (el) el.parentNode.classList.add(d > 0 ? "up" : "down"); slam((d > 0 ? "▲ P" : "▼ P") + p1, d > 0 ? "Quedó girando: lo pasaste" : "Perdiste " + (-d) + (d < -1 ? " posiciones" : " posición"), d > 0 ? "ok" : "bad"); }); }
      if (o.fault) { E.gain -= 1; E.extra += 0.5; const p2 = p1 + 1; later(2300, () => { showPos(p2); const el = $("lcPos"); if (el) el.parentNode.classList.add("down"); slam("⚖️ +5 SEG", (isDrv ? "Sanción por provocar el choque" : "Sanción: tu piloto provocó el choque") + " · P" + p2, "bad"); radio("Comisarios: «Coche " + (isDrv ? "tuyo" : "de tu equipo") + ", 5 segundos por provocar una colisión.»"); }); }
    }
  };
  const mark = (ok, id) => { const z = $(id); if (z) z.classList.add(ok ? "hit" : "miss"); };
  /* ---------- vértice: depende de por dónde pasa el auto (lo doblás vos) ---------- */
  const scoreApex = () => {
    const C = C0(), aLat = C.dir * 30, err = Math.abs(E.lat - aLat), inside = (E.lat - aLat) * C.dir > 0;
    let pen, txt;
    const who = isDrv ? "" : "Tu piloto: ";
    if (err <= 11) { pen = err / 11 * 0.05; txt = "Pasaste justo por el vértice"; }
    else if (inside) { pen = Math.min(0.3, 0.08 + (err - 11) * 0.01); txt = "Te cerraste de más y pisaste el piano"; }
    else { pen = Math.min(0.5, 0.12 + (err - 11) * 0.012); txt = err > 40 ? "Doblaste tarde: pasaste lejísimo del vértice" : "Te abriste: lejos del vértice"; }
    E.cur += pen; E.brakeOn = false;
    mark(pen < 0.1, "eZa");
    $("ePh").innerHTML = (pen < 0.1 ? "✅ " : "⚠️ ") + who + txt + (pen >= 0.01 ? ` <b>(+${pen.toFixed(2)}s)</b>` : "");
    call(pen < 0.1 ? "¡VÉRTICE!" : inside ? "¡PIANO!" : "¡ABIERTO!", pen < 0.1 ? "ok" : "bad");
    if (pen >= 0.1) shake();
    E.ph = 2;
  };
  /* ---------- puntaje de cada acción (frenar / soltar / acelerar) ---------- */
  const score = (ph, auto) => {
    const C = C0();
    const center = zone(ph), d = E.p - center, ad = Math.abs(d);
    let pen, txt;
    const who = isDrv ? "" : "Tu piloto: ";
    const T = [
      ["Frenada en línea recta, perfecta", "Frenaste temprano", "¡Bloqueaste! Frenaste tarde, ya girando", "¡No frenaste! Te pasaste de largo"],
      ["Soltaste el freno progresivo justo en el vértice", "Soltaste muy temprano: te fuiste ancho", "Seguiste frenando en plena curva: subviraje", "Nunca soltaste el freno"],
      ["Tracción perfecta a la salida", "Aceleraste temprano: patinó la trasera", "Aceleraste tarde: perdiste velocidad", "No aceleraste a tiempo"]
    ][ph];
    if (auto) { pen = 0.45; txt = T[3]; }
    else if (ad <= w / 2) { pen = ad / (w / 2) * 0.05; txt = T[0]; }
    else if (d < 0) { pen = Math.min(0.35, 0.08 + (ad - w / 2) * 0.012); txt = T[1]; }
    else { pen = Math.min(0.5, 0.12 + (ad - w / 2) * 0.018); txt = T[2]; }
    E.cur += pen;
    mark(pen < 0.1, ["eZb", "eZa", "eZe"][ph]);
    $("ePh").innerHTML = (pen < 0.1 ? "✅ " : "⚠️ ") + who + txt + (pen >= 0.01 ? ` <b>(+${pen.toFixed(2)}s)</b>` : "");
    call(pen < 0.1 ? ["¡FRENADA!", "¡VÉRTICE!", "¡GAS!"][ph] : ["¡BLOQUEO!", "¡ANCHO!", "¡PATINA!"][ph], pen < 0.1 ? "ok" : "bad");
    if (pen >= 0.1) shake();
    if (pen >= 0.1 && (ph === 0 && (d > 0 || auto) || ph === 2 && d < 0)) E.lock = 0.6;
    if (pen < 0.1 && ph === 2) E.flash = 0.25;
    try { if (pen < 0.1) FWAudio.click(); } catch (e) {}
    // no frenar = al muro (los dos modos, clasificación y carrera)
    if (ph === 0 && auto) crash(null, { big: true, wall: true, pos: isRace ? 2 : 0, txt: isDrv ? "No frenaste y te fuiste contra las barreras" : "Tu piloto no frenó y se fue contra las barreras" });
    else if (ph === 0 && !isDrv && !isRace && E.cold && pen >= 0.3) crash(null, { big: true, wall: true, txt: "Con las gomas frías bloqueó y se fue al muro" });
    if (E.dnf) return;
    // momentos de carrera que se deciden en la frenada
    if (ph === 0 && C.kind === "attack" && !E.ev.done) {
      E.ev.done = true;
      const divebomb = E.gapPx <= 45 && !auto && ((pen >= 0.1 && d > 0) || (!isDrv && E.ersOn));
      if (divebomb) { E.tgt.toLat = C.dir * -24; crash(E.tgt, { pos: 0, gainBack: 1, fault: true, txt: isDrv ? "Te tiraste muy tarde y le pegaste" : (E.ersOn ? "Modo ataque metido en la frenada: se tiró tarde y le pegó" : "Tu piloto se tiró tarde y le pegó") }); }
      else if (E.gapPx <= 45 && pen < 0.1) { E.tgt.toOff = -95; E.tgt.toLat = C.dir * -18; E.myLat = 0; posChange(1, isDrv ? "¡Lo pasaste en la frenada!" : "¡Tu piloto lo pasó en la frenada!"); radio(isDrv ? "¡Bien ahí, qué frenada!" : "Piloto: «¡Adentro! ¡Gracias por el modo ataque!»"); }
      else { E.tgt.toOff = 120; call(E.gapPx > 45 ? "¡NO LLEGÓ!" : "¡SE TE ESCAPÓ!", "bad"); $("ePh").innerHTML += ` · <b>${E.gapPx > 45 ? "No te pegaste lo suficiente en la recta" : "Frenada imprecisa: no pudiste pasarlo"}</b>`; }
    }
    if (ph === 0 && C.kind === "defend" && !E.ev.done) {
      E.ev.done = true;
      if (E.ev.late) { E.atk.toLat = E.ev.side * 20; crash(E.atk, { pos: 1, fault: true, txt: isDrv ? "Te moviste en plena frenada y te chocaron" : "Le pediste defender tarde: se movió en la frenada y lo chocaron" }); }
      else if (!E.ev.covered && pen >= 0.1 && d > 0 && !auto) { crash(E.atk, { pos: 1, txt: isDrv ? "Frenaste mal con él al lado: contacto" : "Frenada imprecisa con el rival al lado: contacto" }); }
      else if (E.ev.covered && pen < 0.1) { E.atk.toOff = -140; E.atk.toLat = 0; call("¡DEFENDIDO!", "ok"); radio(isDrv ? "¡Bien cubierto, mantené la posición!" : "Piloto: «Cerré la puerta, copiado.»"); }
      else { E.atk.toOff = 110; E.atk.toLat = 0; posChange(-1, E.ev.covered ? "Frenada imprecisa: te pasó igual" : (isDrv ? "No cubriste su lado: te pasó" : "No le avisaste a tiempo: lo pasaron")); }
      warn("");
    }
    E.ph++;
    if (E.ph >= 3) finishCorner();
  };
  const finishCorner = () => {
    E.loss.push(E.cur);
    const C = C0();
    if (C.kind === "pit" && !E.ev.pitted) { E.extra += 0.6; posChange(-2, "No paraste: la goma se destruyó"); }
    if (C.kind === "release" && !E.ev.released) E.cold = true;
    const col = E.cur < 0.08 ? "p" : E.cur < 0.25 ? "g" : "y";
    $("eSec").innerHTML += `<span class="em-sec ${col}">S${E.c + 1}</span>`;
    E.c++; E.wait = isRace ? 1.6 : 0.9; E.brakeOn = false;
    if (E.c >= NS) { if (E.crashT && Date.now() - E.crashT < 2800) later(2800 - (Date.now() - E.crashT), finishAll); else finishAll(); }
  };
  const finishAll = () => {
    const cr = E.crashes ? " 💥 " + E.crashes + (E.crashes > 1 ? " choques" : " choque") + " en el tramo." : "";
    const lap = E.base + E.loss.reduce((a, b) => a + b, 0) - E.ersGain + E.extra;
    const gap = lap - E.pole;
    if (!isRace) {
      E.acc = Math.max(0, Math.min(1, 1 - gap / 1.2));
      window.__emLapAcc = E.acc;
      slam(gap <= 0 ? "¡POLE!" : "VUELTA", emFmtLap(lap) + " · " + (gap <= 0 ? "−" : "+") + Math.abs(gap).toFixed(3), gap <= 0 ? "pole" : gap < 0.35 ? "ok" : "bad");
      $("eTime").innerHTML = `⏱️ <b>${emFmtLap(lap)}</b> · Pole: ${emFmtLap(E.pole)} · <b style="color:${gap <= 0 ? "#a855f7" : gap < 0.4 ? "#22c55e" : "#facc15"}">${gap <= 0 ? "−" + Math.abs(gap).toFixed(3) + " ¡VUELTA MÁS RÁPIDA!" : "+" + gap.toFixed(3)}</b> <span class="small">(${PW.k}: −${E.ersGain.toFixed(2)}s)</span>`;
      const who = isDrv ? "" : "Tu piloto: ";
      eraEnd(gap < 0.35, (gap <= 0 ? who + "¡Pole provisoria!" + (isDrv ? " Frenadas, vértices y " + PW.short + " perfectos." : " Gomas en temperatura, despliegue y banderas perfectos.") : gap < 0.35 ? who + "gran vuelta: a " + gap.toFixed(3) + " de la pole." : who + "vuelta lenta: " + gap.toFixed(3) + " de la pole." + (isDrv ? " Frená recto, doblá hacia el vértice con ◀ ▶ y usá el " + PW.short + " en las rectas." : " Largá la vuelta con las gomas a punto y avisá las banderas.")) + cr);
    } else {
      const endPos = Math.max(1, E.startPos - E.gain);
      window.__emRaceGain = E.gain;
      E.acc = Math.max(0, Math.min(1, 0.55 + E.gain * 0.2 - Math.max(0, gap) * 0.1));
      slam("P" + E.startPos + " → P" + endPos, E.gain > 0 ? "+" + E.gain + " posiciones" : E.gain < 0 ? E.gain + " posiciones" : "posición mantenida", E.gain > 0 ? "pole" : E.gain === 0 ? "ok" : "bad");
      $("eTime").innerHTML = `🏁 Largó <b>P${E.startPos}</b> · terminó el tramo <b style="color:${E.gain > 0 ? "#a855f7" : E.gain === 0 ? "#22c55e" : "#ff4b3e"}">P${endPos}</b> (${E.gain >= 0 ? "+" : ""}${E.gain})`;
      const ok = E.gain >= 0 && !(E.crashes >= 2);
      eraEnd(ok, (ok ? (E.gain > 0 ? "¡Ganaste " + E.gain + (E.gain > 1 ? " posiciones" : " posición") + "! " : "Mantuviste la posición. ") + (isDrv ? "Largada, ataque y defensa." : "Buenas órdenes desde " + O.name.toLowerCase() + ".") : "Perdiste " + (-E.gain) + (E.gain < -1 ? " posiciones" : " posición") + ". " + (isDrv ? "Largá cuando se apagan las luces, pegate con el " + PW.short + " y cubrí el lado del ataque." : "Modo ataque en la recta, BOX en la ventana y avisá a tiempo cuando te atacan.")) + cr);
    }
  };
  /* ---------- controles ---------- */
  const eb = $("eErsB"), rb = $("eRadio");
  const inDefWin = () => { const C = C0(); return C.kind === "defend" && E.p >= C.b - 28 && E.p < C.b - 4 && !E.ev.done; };
  const down = ev => {
    ev && ev.preventDefault && ev.preventDefault();
    if (!eraAlive(E.id) || E.wait > 0 || E.c >= NS || E.dnf) return;
    const C = C0();
    if (!isDrv) { radio("Sos el ingeniero: tu piloto maneja. Usá " + O.name.toLowerCase() + "."); return; }
    if (C.kind === "start" && E.hold) {
      if (E.lights < 5 || !E.out) { E.hold = false; E.jump = true; call("¡LARGADA EN FALSO!", "bad"); shake(); E.side.toOff = 90; E.side.toLat = 0; posChange(-1, "Largaste antes: te pasaron"); E.extra += 0.3; return; }
      const rt = E.lt; E.hold = false; $("lcLights").classList.remove("show");
      if (rt < 0.3) { E.side.toOff = -90; E.side.toLat = 30; posChange(1, "¡Reacción de " + rt.toFixed(3) + "s! Lo pasaste en la largada"); }
      else if (rt < 0.55) { call("LARGADA " + rt.toFixed(2) + "s", "ok"); }
      else if (rt > 0.7 && emRand(700 + E.c) < 0.5) { E.side.toLat = 12; crash(E.side, { pos: 1, rivalBack: -60, rivalSpin: 40, txt: "Largaste lento y te tocaron de atrás" }); }
      else { E.side.toOff = 90; E.side.toLat = 0; posChange(-1, "Reacción lenta (" + rt.toFixed(2) + "s): te pasaron"); }
      return;
    }
    if (inDefWin() && E.ev.shown && E.ev.covered === undefined) {
      const r = cine.getBoundingClientRect();
      const x = ev && typeof ev.clientX === "number" ? ev.clientX : (E._fakeX !== undefined ? E._fakeX : r.left);
      const sideTap = x < r.left + r.width / 2 ? -1 : 1;
      E.ev.covered = sideTap === E.ev.side; E.myLat = sideTap * 24; if (E.ev.covered && E.p > C.b - 9) E.ev.late = true;
      call(E.ev.covered ? "¡CUBIERTO!" : "¡LADO EQUIVOCADO!", E.ev.covered ? "ok" : "bad");
      return;
    }
    if (E.ph === 0 && AS.brake) return; if (E.ph === 2 && AS.gas) return;
    if (E.ph === 0) { E.brakeOn = true; score(0, false); } else if (E.ph === 2) score(2, false);
  };
  const up = ev => { ev && ev.preventDefault && ev.preventDefault(); if (!eraAlive(E.id) || !E.brakeOn || !isDrv) return; E.brakeOn = false; };
  const radioPress = () => {
    if (!eraAlive(E.id) || E.wait > 0 || E.c >= NS || isDrv || E.dnf) return;
    const C = C0();
    if (C.kind === "release" && !E.ev.released && E.ev.relDone === undefined) {
      E.ev.relDone = true;
      if (E.temp >= 85 && E.temp <= 100) { E.ev.released = true; radio("«¡Gomas a punto, empujá ahora!» — " + Math.round(E.temp) + " °C"); call("¡EMPUJÁ!", "ok"); }
      else { E.cold = E.temp < 85; E.extra += E.temp > 100 ? 0.15 : 0; radio(E.temp < 85 ? "«Empujá…» con las gomas frías (" + Math.round(E.temp) + " °C)" : "Gomas pasadas de temperatura (" + Math.round(E.temp) + " °C)"); call(E.temp < 85 ? "¡GOMAS FRÍAS!" : "¡GOMAS PASADAS!", "bad"); const amp = w * (E.cold ? 2.2 : 0.5); E.ai = [C.b, C.a, C.e].map((z, k) => z + (emRand(300 + E.c * 3 + k) - 0.5) * amp); }
      return;
    }
    if (C.kind === "flag") {
      if (E.ev.flagOn && !E.ev.flagOk) { E.ev.flagOk = true; radio("«¡Amarilla! Levantá en este sector.»"); call("¡AVISADO!", "ok"); return; }
      if (!E.ev.flagOn) { E.extra += 0.05; radio("«…» Le hablaste de más: se desconcentró"); return; }
    }
    if (C.kind === "pit" && !E.ev.pitted && E.ev.pitTry === undefined) {
      E.ev.pitTry = true;
      const okWin = E.wear <= 45 && E.wear >= 28;
      E.ev.pitted = true;
      slam("PIT STOP", (okWin ? (2.1 + emRand(400) * 0.4).toFixed(1) : (2.8 + emRand(401) * 0.6).toFixed(1)) + " s", okWin ? "ok" : "bad");
      radio(okWin ? "«Box, box. Box, box.» Gomas nuevas en la ventana perfecta" : E.wear > 45 ? "«Box, box» — paraste muy temprano" : "«Box, box» — paraste tarde, con la goma muerta");
      E.wear = 100;
      if (okWin) setTimeout(() => posChange(1, "¡Undercut! Saliste adelante"), 900); else setTimeout(() => posChange(-1, "Mala ventana: saliste detrás"), 900);
      return;
    }
    if (C.kind === "defend" && !E.ev.done && E.ev.covered === undefined) {
      if (E.gapAtk !== undefined && E.gapAtk <= 1.0) { E.ev.covered = true; if (E.gapAtk < 0.5) E.ev.late = true; radio("«¡Defendé! Cerrá el interior.»"); call("¡DEFENDÉ!", "ok"); E.myLat = E.ev.side * 24; }
      else { E.extra += 0.03; radio("«Todavía está lejos…»"); }
      return;
    }
    radio("«Todo bien, seguí así.»");
  };
  if (isDrv) {
    cine.addEventListener("pointerdown", down);
    ["pointerup", "pointerleave", "pointercancel"].forEach(t => cine.addEventListener(t, up));
  } else {
    cine.addEventListener("pointerdown", down);
    rb && rb.addEventListener("pointerdown", e => { e.preventDefault(); radioPress(); });
  }
  eraHold(eb, () => (E.ersOn = true), () => (E.ersOn = false));
  const st8 = { kL: 0, kR: 0, bL: 0, bR: 0 };
  const steerUpd = () => { E.steerIn = (st8.kR || st8.bR ? 1 : 0) - (st8.kL || st8.bL ? 1 : 0); };
  const coverTry = side => { if (isDrv && inDefWin() && E.ev.shown && E.ev.covered === undefined) { E.tapSide(side); return true; } return false; };
  const sl = $("eStL"), sr = $("eStR");
  // el volante gira bajo el dedo: capturamos el puntero para que no se suelte solo
  const steerHold = (btn, on, off) => {
    if (!btn) return;
    btn.addEventListener("pointerdown", e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) {} on(); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => btn.addEventListener(ev, e => { e.preventDefault(); off(); }));
  };
  steerHold(sl, () => { if (!coverTry(-1)) { st8.bL = 1; steerUpd(); } }, () => { st8.bL = 0; steerUpd(); });
  steerHold(sr, () => { if (!coverTry(1)) { st8.bR = 1; steerUpd(); } }, () => { st8.bR = 0; steerUpd(); });
  const key = ev => {
    if (!eraAlive(E.id)) { document.removeEventListener("keydown", key); document.removeEventListener("keyup", key); return; }
    const kd = ev.type === "keydown";
    // ESPACIO (o E) = ERS / despliegue, mantenido
    if (ev.code === "Space" || ev.key === "e" || ev.key === "E") { ev.preventDefault(); E.ersOn = kd; eb && eb.classList.toggle("kbd-on", kd); return; }
    // ↓ / S = frenar · ↑ / W / Enter = acelerar (y largar con el semáforo)
    const isBrake = ev.key === "ArrowDown" || ev.key === "s" || ev.key === "S";
    const isGas = ev.key === "ArrowUp" || ev.key === "w" || ev.key === "W" || ev.key === "Enter";
    if (isDrv && (isBrake || isGas)) { ev.preventDefault(); if (kd && !ev.repeat) down(); else if (!kd) up(); return; }
    // modo ingeniero: R / Enter / ↑ = RADIO
    if (!isDrv && (ev.key === "r" || ev.key === "R" || isGas)) { ev.preventDefault(); if (kd && !ev.repeat) radioPress(); return; }
    if (isDrv && (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A")) { ev.preventDefault(); if (ev.type === "keydown" && !ev.repeat && coverTry(-1)) return; st8.kL = ev.type === "keydown" ? 1 : 0; steerUpd(); }
    if (isDrv && (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D")) { ev.preventDefault(); if (ev.type === "keydown" && !ev.repeat && coverTry(1)) return; st8.kR = ev.type === "keydown" ? 1 : 0; steerUpd(); }
  };
  document.addEventListener("keydown", key); document.addEventListener("keyup", key);
  E.tapDown = down; E.tapUp = up; E.radio = radioPress;
  E.tapSide = side => { const r = cine.getBoundingClientRect(); E._fakeX = side < 0 ? r.left + 5 : r.right - 5; down(); E._fakeX = undefined; };
  setup();
  if (isDrv && typeof mwWheelize === "function") { try { mwWheelize(); } catch (e) {} }
  eraLoop(dt => {
    if (E.dnf) { if (Math.random() < 0.4) fx("smoke"); place(); return; }
    if (E.wait > 0) { E.wait -= dt; if (E.wait <= 0 && E.c < NS) setup(); return; }
    if (E.c >= NS) return;
    const C = C0();
    // semáforo de largada
    if (C.kind === "start" && E.hold) {
      E.lt += dt; E.revs = 60 + Math.random() * 35;
      const lights = $("lcLights");
      if (!E.out) {
        const n = Math.min(5, Math.floor(E.lt / 0.55));
        if (n !== E.lights) { E.lights = n; lights && lights.querySelectorAll("i").forEach((l, i) => l.classList.toggle("on", i < n)); }
        if (E.lights >= 5 && E.lt >= 5 * 0.55 + E.goAt - 1.6) { E.out = true; E.lt = 0; lights && lights.querySelectorAll("i").forEach(l => l.classList.remove("on")); call("¡YA!", "ok"); if (!isDrv) { /* el piloto larga solo */ } }
      } else if (!isDrv && E.lt > 0.18 + emRand(500) * 0.3) { E.hold = false; lights && lights.classList.remove("show"); }
      else if (isDrv && AS.gas && E.lt >= 0.36) { down(); }
      else if (E.out && E.lt > 1.2) { E.hold = false; lights && lights.classList.remove("show"); E.side.toOff = 90; posChange(-1, "Te quedaste: largaste tardísimo"); }
      place(); return;
    }
    if (E.stall > 0) { E.stall -= dt; if (Math.random() < 0.5) fx("smoke"); place(); if (E.stall <= 0) { call("VUELVE A PISTA", ""); E.myLat = 0; } return; }
    E.p += dt * C.v * (E.ph === 0 ? 1 : 0.8) * (C.kind === "release" && !E.ev.relDone ? 0.3 : 1) * (E.offT ? 0.7 : 1);
    // dinámica lateral: en la curva el auto se va para afuera; vos (o tu piloto) lo doblás
    {
      const dNow = distFor(E.p), v = kmhFor(E.p);
      E.inArc = dNow > G.S - 10 && dNow < G.exitL + 50;
      if (E.lat === undefined) E.lat = E.myLat || 0;
      if (isDrv) {
        if (E.inArc) { const drift = -C.dir * (v * v / G.R) * 0.42; E.lat += (drift + (E.steerIn || 0) * 150) * dt; }
        else E.lat += ((E.myLat || 0) - E.lat) * Math.min(1, dt * 3);
      } else {
        if (E.inArc) { const k = Math.max(0, Math.min(1, (dNow - (G.S - 10)) / (G.arcLen + 60))); const ideal = C.dir * 30 * Math.sin(Math.PI * Math.min(1, k * 1.15)); const err = (E.aiErr || 0) * -C.dir * 26 * Math.sin(Math.PI * k); E.lat += (ideal + err - E.lat) * Math.min(1, dt * 6); }
        else E.lat += ((E.myLat || 0) - E.lat) * Math.min(1, dt * 3);
      }
      const off = Math.abs(E.lat) > 44;
      if (off && !E.offT) { call("¡AFUERA DE LA PISTA!", "bad"); $("ePh").innerHTML = "⚠️ " + (isDrv ? "Te fuiste afuera de la pista: doblá para volver" : "Tu piloto se fue afuera de la pista"); }
      E.offT = off;
      if (off) { E.cur += dt * 0.5; if (Math.random() < 0.5) fx("dust"); }
      if (E.inArc && Math.abs(E.lat) > 84) { crash(null, { big: true, wall: true, pos: isRace ? 2 : 0, txt: isDrv ? "No doblaste: te fuiste largo contra las barreras" : "Tu piloto se fue largo contra las barreras" }); return; }
    }
    cine.classList.toggle("boost", !!(E.ersOn && E.ers > 0 && E.ph === 0));
    cine.classList.toggle("braking", !!E.brakeOn);
    if (E.ersOn && E.ers > 0) {
      E.ers = Math.max(0, E.ers - dt * PW.drain);
      if (E.ph === 0 && E.p < C.b - w / 2) { E.ersGain += dt * PW.gain; if (C.kind === "attack") E.gapPx -= dt * E.ersClose; }
      else { E.cur += dt * 0.25; const ph = $("ePh"); if (ph && !ph.dataset.pw) { ph.dataset.pw = 1; ph.innerHTML = "⚠️ " + PW.corner + " <b>(+tiempo)</b>"; } }
    }
    // ataque: el rebufo solo acerca un poco; el ERS/DRS hace la diferencia
    if (C.kind === "attack" && !E.ev.done && E.ph === 0) {
      E.gapPx = Math.max(10, E.gapPx - dt * E.baseClose);
      E.tgt.toOff = E.gapPx; E.myLat = E.gapPx < 70 ? C.dir * 22 : 0;
      const gap = $("lcGap"); if (gap) { const sgap = E.gapPx / 110; gap.innerHTML = `🎯 Al de adelante: <b>${sgap.toFixed(2)}s</b>${sgap <= 0.3 ? " · ¡EN RANGO!" : ""}`; gap.className = "lc-gap show " + (sgap <= 0.3 ? "ok" : ""); }
      if (!isDrv) eoBar(100 - E.gapPx / 1.1, [60, 100], (E.gapPx / 110).toFixed(2) + " s");
    } else if (C.kind === "attack") { const gap = $("lcGap"); gap && gap.classList.remove("show"); }
    // defensa: el de atrás se acerca y elige un lado
    if (C.kind === "defend" && !E.ev.done) {
      const tgtOff = E.p < C.b - 30 ? -120 + (E.p / Math.max(1, C.b - 30)) * 90 : -26;
      E.atk.toOff = tgtOff; E.atk.off = tgtOff; E.gapAtk = Math.abs(E.atk.off) / 60;
      const gap = $("lcGap"); if (gap) { gap.innerHTML = `⚠️ El de atrás: <b>${E.gapAtk.toFixed(2)}s</b>${E.gapAtk <= 1 ? " · ¡TE ATACA!" : ""}`; gap.className = "lc-gap show " + (E.gapAtk <= 1 ? "bad" : ""); }
      if (!isDrv) eoBar(100 - E.gapAtk * 40, [60, 100], E.gapAtk.toFixed(2) + " s");
      if (inDefWin()) {
        if (!E.ev.shown) { E.ev.shown = true; E.atk.toLat = E.ev.side * 30; warn(E.ev.side < 0 ? "◀ ¡ATACA POR LA IZQUIERDA!" : "¡ATACA POR LA DERECHA! ▶", E.ev.side < 0 ? "l" : "r"); }
      }
    } else if (C.kind === "defend") { const gap = $("lcGap"); gap && gap.classList.remove("show"); }
    // ingeniero: gomas que calientan, desgaste, banderas
    if (C.kind === "release") {
      if (!E.ev.relDone) { E.temp = Math.min(130, E.temp + dt * (34 + emRand(600) * 10)); eoBar((E.temp - 40) / 0.9, [50, 66.7], Math.round(E.temp) + " °C"); if (E.temp >= 128 || E.p > C.b - 8) { E.ev.relDone = true; E.cold = true; radio("Te pasaste: las gomas se sobrecalentaron y perdieron agarre"); const amp = w * 2.2; E.ai = [C.b, C.a, C.e].map((z, k) => z + (emRand(310 + k) - 0.5) * amp); } }
    }
    if (C.kind === "flag" && E.ev.flagAt !== undefined) {
      const fl = $("lcFlag");
      if (!E.ev.flagOn && !E.ev.flagGone && E.p >= E.ev.flagAt) { E.ev.flagOn = true; E.ev.flagT = 0; fl && fl.classList.add("show"); eoBar(100, [0, 100], "🟨 AMARILLA"); }
      if (E.ev.flagOn) { E.ev.flagT += dt; if (E.ev.flagT > 1.3 || E.ev.flagOk) { E.ev.flagOn = false; E.ev.flagGone = true; fl && fl.classList.remove("show"); if (!E.ev.flagOk) { E.extra += 0.5; radio("No avisaste la amarilla: vuelta investigada (+0.5s)"); call("¡INVESTIGADO!", "bad"); } eoBar(0, null, "pista libre"); } }
    }
    if (C.kind === "pit" && !E.ev.pitted) { E.wear = Math.max(0, E.wear - dt * 22); eoBar(E.wear, [28, 45], Math.round(E.wear) + "% goma"); }
    if (C.kind === "push" && !isDrv) eoBar(E.ers, null, "batería " + Math.round(E.ers) + "%");
    const be = $("eErs"); if (be) be.style.width = E.ers + "%";
    const n = $("eN"); if (n) n.style.left = Math.min(100, E.p) + "%";
    place();
    if (E.lock > 0) { E.lock -= dt; fx("skid"); if (Math.random() < 0.6) fx("smoke"); }
    if (E.flash > 0) E.flash -= dt;
    cine.classList.toggle("launch", E.flash > 0);
    if (E.ph === 0 && E.p < C.b - 6 && (y >= 2022 || (y >= 1977 && y <= 1982)) && Math.random() < 0.35) spark();
    // ayudas del ingeniero: despliegue automático y aviso para la radio
    if (!isDrv && AE.deploy) { E.ersOn = E.ph === 0 && E.p < C.b - w / 2 - 1 && E.ers > 0; const be2 = $("eErsB"); be2 && be2.classList.toggle("kbd-on", E.ersOn); }
    if (!isDrv && AE.cue) {
      const want = (C.kind === "release" && !E.ev.relDone && E.temp >= 88 && E.temp <= 98) || (C.kind === "flag" && E.ev.flagOn && !E.ev.flagOk) || (C.kind === "pit" && !E.ev.pitted && E.wear <= 42 && E.wear >= 30) || (C.kind === "defend" && !E.ev.done && E.ev.covered === undefined && E.gapAtk <= 0.95 && E.gapAtk >= 0.55);
      const rb2 = $("eRadio"); if (rb2) rb2.classList.toggle("cue", !!want);
    }
    // ayudas de manejo (modo piloto, según la dificultad)
    if (isDrv && AS.brake && E.ph === 0 && E.p >= C.b) { E.brakeOn = true; score(0, false); call("FRENO AUTO", "ok"); }
    else if (isDrv && AS.gas && E.ph === 2 && E.p >= C.e) { score(2, false); }
    if (E.c >= NS || E.wait > 0 || E.dnf) return;
    // la IA de tu piloto (modo ingeniero)
    if (!isDrv && E.ai) {
      if (E.ph === 0 && E.p >= E.ai[0]) { E.brakeOn = true; score(0, false); }
      else if (E.ph === 2 && E.p >= E.ai[2]) { score(2, false); }
      if (E.c >= NS || E.wait > 0) return;
    }
    if (E.ph === 0 && E.p > C.b + w / 2 + 6) score(0, true);
    else if (E.ph === 1 && E.p >= C.a) scoreApex();
    else if (E.ph === 2 && E.p > C.e + w / 2 + 6) score(2, true);
  });
}
window.emLap = function () { return lcRun("qd"); };
window.emRace = function () { return lcRun("rd"); };
window.emEngQ = function () { return lcRun("qe"); };
window.emEngR = function () { return lcRun("re"); };

/* ---------- dónde aparecen ---------- */
(function () {
  // PILOTO · carrera: la cinemática de carrera (distinta de la vuelta de clasificación)
  const o = window.renderDriverRace;
  if (typeof o === "function") window.renderDriverRace = function (idx, rName) {
    const key = "drvtask_" + s.gp + "_" + s.session + "_" + s.activePlayer;
    if (ERA && !ERA.dead && ERA.key === key && document.getElementById("eraStage")) return;
    const r = o.apply(this, arguments);
    try {
      if (fwHash("rcine|" + s.gp + "_" + s.season + "_" + s.activePlayer) % 10 < 6) {
        const tr = trackData[s.gp] || {};
        const turnLabel = s.player2 ? (s.activePlayer === 1 ? " · Turno P1" : " · Turno P2") : "";
        const injuryBanner = (idx === 0 && s._reserveGPType === "injury" && typeof renderReserveInjuryBanner === "function") ? renderReserveInjuryBanner() : "";
        window.__emKey = key;
        emFrame(injuryBanner, "🏁", "Carrera en " + (tr.name || "") + " · " + (rName || "") + turnLabel, "La carrera no es una vuelta de clasificación: tiene <b>3 momentos</b>. <b>Largada</b>: tocá la cinemática cuando se apagan las 5 luces. <b>Ataque</b>: pegate al de adelante con el " + (typeof rlPower === "function" ? rlPower(s.season).short : "ERS") + " del volante en la recta y frená justo para pasarlo. <b>Defensa</b>: cuando veas por dónde te ataca, apretá <b>◀ o ▶</b> de ese lado para cubrir y después frená bien. En cada curva <b>doblás vos</b> con ◀ ▶ (o las flechas): si no doblás, te vas afuera o al muro (DNF). Ganá posiciones (o al menos no pierdas).", "emRace", ok => finishRaceJob(ok), key);
      }
    } catch (e) { console.warn(e); }
    return r;
  };
  // INGENIERO · clasificación (desde Director Deportivo): la vuelta de tu piloto en cinemática
  const q = window.renderQualiSkillTest;
  if (typeof q === "function") window.renderQualiSkillTest = function () {
    if (s.playerMode === "driver") return q.apply(this, arguments);
    const tr = trackData[s.gp] || {};
    const O = lcEngObject(tierIndex());
    emFrame("", O.ic, "Vuelta de clasificación de tu piloto en " + (tr.name || ""), "Tu piloto maneja solo; vos lo guiás con <b>" + O.name.toLowerCase() + "</b>. <b>Sector 1</b>: tocá <b>📻 RADIO</b> cuando las gomas estén en la ventana verde (85–100 °C) para que empuje. <b>Sector 2</b>: si aparece una <b>bandera amarilla</b>, RADIO enseguida. En las rectas mantené el <b>⚡ despliegue</b>. Quedá a menos de 0.35s de la pole.", "emEngQ", ok => { const a = typeof window.__emLapAcc === "number" ? window.__emLapAcc : (ok ? 0.8 : 0.3); resolveQualiSkill(a); });
  };
  // INGENIERO · prácticas: las dos cinemáticas se suman a los minijuegos del ingeniero
  if (typeof EM_GAMES !== "undefined") {
    EM_GAMES.push(
      { fn: "emEngQ", icon: "🎬", title: "Simulación de clasificación", how: "Tu piloto hace una vuelta y vos lo guiás con el objeto de tu rango: <b>📻 RADIO</b> cuando las gomas están en temperatura, RADIO si aparece una <b>bandera amarilla</b> y <b>⚡ despliegue</b> en las rectas.", tiers: [0, 1, 2, 3, 4, 5, 6] },
      { fn: "emEngR", icon: "🏁", title: "Simulación de carrera", how: "Tres momentos de carrera desde tu puesto: <b>⚡ modo ataque</b> en la recta para pasar al de adelante, <b>📻 BOX</b> cuando el desgaste entra en la ventana verde y <b>📻 DEFENDÉ</b> cuando el de atrás entra en el segundo.", tiers: [0, 1, 2, 3, 4, 5, 6] }
    );
  }
})();

/* ---------- al muro = DNF de verdad en el resultado del GP ---------- */
(function () {
  const rs = window.rollRaceStatus;
  if (typeof rs === "function") window.rollRaceStatus = function (name, teamRating, seedKey, isMine) {
    try {
      const k = s._crashDNF;
      if (k && k.key === s.season + "_" + s.gp && isMine) {
        const target = s.playerMode === "driver" ? s.playedDriverName : ((typeof myTeamLineup === "function" && myTeamLineup()[0]) || {}).name;
        if (name === target) return "DNF";
      }
    } catch (e) {}
    return rs.apply(this, arguments);
  };
  const rm = window.raceMessage;
  if (typeof rm === "function") window.raceMessage = function (pos, pts, status) {
    const r = rm.apply(this, arguments);
    try {
      const k = s._crashDNF;
      if (status === "DNF" && r && k && k.key === s.season + "_" + s.gp) {
        r.title = s.playerMode === "driver" ? "💥 AL MURO · ABANDONO (DNF)" : "💥 TU PILOTO AL MURO · DNF";
        r.sub = s.playerMode === "driver" ? "No frenaste, te fuiste contra las barreras y el auto quedó destruido. Cero puntos este domingo." : "Tu piloto no frenó y se fue contra las barreras. El auto quedó destruido: cero puntos.";
      }
    } catch (e) {}
    return r;
  };
  // en la clasificación: sin tiempo = largás desde el fondo
  const fq = window.finalizeQuali;
  if (typeof fq === "function") window.finalizeQuali = function (timing, risky, acc) {
    const k = s._crashQuali;
    if (k && k.key === s.season + "_" + s.gp) acc = 0;
    return fq.call(this, timing, risky, acc);
  };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () { s._crashDNF = null; s._crashQuali = null; return ng.apply(this, arguments); };
})();
(function () {
  // clasificación sin tiempo: tu piloto queda último en la parrilla
  const sg = window.simulateGrid;
  if (typeof sg === "function") window.simulateGrid = function (kind) {
    const r = sg.apply(this, arguments);
    try {
      const k = s._crashQuali;
      if (kind === "quali" && Array.isArray(r) && k && k.key === s.season + "_" + s.gp) {
        const target = s.playerMode === "driver" ? s.playedDriverName : ((typeof myTeamLineup === "function" && myTeamLineup()[0]) || {}).name;
        const i = r.findIndex(e => e.mine && e.name === target);
        if (i >= 0) { const [e] = r.splice(i, 1); e.noTime = true; r.push(e); r.forEach((x, j) => { x.pos = j + 1; }); }
      }
    } catch (e) {}
    return r;
  };
})();
