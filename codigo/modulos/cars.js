/* =====================================================================================
   FAWIWE · AUTOS DE CADA ÉPOCA (vista de costado, diseños propios) + "La evolución de la F1"
   ===================================================================================== */
const FW_ERAS = [
  { y: 1950, cap: "Motor adelante y ruedas finitas", c: "#c0392b" },
  { y: 1968, cap: "Llegan los primeros alerones", c: "#2e8b57" },
  { y: 1978, cap: "Efecto suelo: el auto se pega al piso", c: "#2563eb" },
  { y: 1988, cap: "Era turbo: más de 1000 caballos", c: "#eab308" },
  { y: 1998, cap: "Neumáticos con ranuras", c: "#f97316" },
  { y: 2009, cap: "KERS: el primer empujón eléctrico", c: "#14b8a6" },
  { y: 2026, cap: "Aerodinámica activa y halo", c: "#e10600" }
];
function fwWheel(cx, cy, r, w, era) {
  // r = radio, w = ancho visual (más grande en autos modernos)
  const spokes = era < 1965 ? [0, 45, 90, 135].map(a => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a * Math.PI / 180) * (r - 4)}" y2="${cy + Math.sin(a * Math.PI / 180) * (r - 4)}" stroke="#bbb" stroke-width="1"/><line x1="${cx}" y1="${cy}" x2="${cx - Math.cos(a * Math.PI / 180) * (r - 4)}" y2="${cy - Math.sin(a * Math.PI / 180) * (r - 4)}" stroke="#bbb" stroke-width="1"/>`).join("") : "";
  const grooves = era >= 1998 && era < 2009 ? `<circle cx="${cx}" cy="${cy}" r="${r - 3}" fill="none" stroke="#333" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="#333" stroke-width="1.2"/>` : "";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#111"/>${grooves}<circle cx="${cx}" cy="${cy}" r="${Math.max(4, r * (era < 1965 ? 0.75 : 0.42))}" fill="${era < 1965 ? "none" : "#55555f"}" stroke="#777" stroke-width="${era < 1965 ? 1.5 : 0}"/>${spokes}`;
}
function fwCarSvg(era, color, cls) {
  const c = color || "#e10600";
  const helmet = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#f5f5f5"/><rect x="${x - 2}" y="${y - 3}" width="9" height="4" rx="2" fill="#222"/>`;
  let body = "";
  if (era < 1960) {
    body = `<path d="M18 52 Q20 34 70 32 L210 30 Q262 30 282 46 Q288 52 282 56 L30 60 Q16 58 18 52 Z" fill="${c}"/>
      <ellipse cx="270" cy="47" rx="10" ry="8" fill="#1a1a1a"/>${helmet(150, 26)}<path d="M136 30 L144 22" stroke="#cfe" stroke-width="2"/>
      <rect x="40" y="44" width="200" height="3" fill="#ffffff55"/>
      <text x="96" y="50" font-family="Titillium Web,Arial" font-weight="900" font-size="13" fill="#fff">8</text>
      ${fwWheel(60, 62, 19, 6, era)}${fwWheel(236, 62, 19, 6, era)}`;
  } else if (era < 1975) {
    body = `<path d="M20 56 L40 40 L190 36 Q250 36 286 52 L286 58 L22 62 Z" fill="${c}"/>${helmet(126, 30)}
      <line x1="44" y1="40" x2="40" y2="8" stroke="#222" stroke-width="3"/><line x1="64" y1="40" x2="60" y2="8" stroke="#222" stroke-width="3"/>
      <rect x="22" y="2" width="56" height="8" rx="2" fill="${c}" stroke="#111" stroke-width="1.5"/>
      <path d="M262 50 L292 46 L292 52 Z" fill="#222"/>
      ${fwWheel(62, 62, 21, 9, era)}${fwWheel(238, 63, 18, 8, era)}`;
  } else if (era < 1985) {
    body = `<path d="M16 58 L24 34 L64 30 L110 34 L130 26 L150 26 L162 36 L210 42 L292 56 L292 62 L16 64 Z" fill="${c}"/>
      <rect x="70" y="40" width="120" height="16" fill="#00000033"/>${helmet(142, 24)}
      <rect x="6" y="16" width="44" height="10" rx="2" fill="#111"/><rect x="20" y="24" width="6" height="16" fill="#111"/>
      <path d="M262 58 L296 54 L296 62 Z" fill="#111"/>
      <rect x="80" y="46" width="90" height="4" fill="#fff"/>
      ${fwWheel(60, 62, 22, 12, era)}${fwWheel(236, 64, 17, 9, era)}`;
  } else if (era < 1995) {
    body = `<path d="M18 60 L24 44 L80 40 L130 38 L146 30 L170 30 L184 40 L240 46 L294 56 L294 62 L18 64 Z" fill="${c}"/>${helmet(160, 28)}
      <rect x="4" y="18" width="40" height="12" rx="2" fill="#111"/><rect x="18" y="28" width="6" height="16" fill="#111"/>
      <rect x="2" y="32" width="38" height="5" rx="2" fill="${c}"/>
      <path d="M256 58 L298 54 L298 64 Z" fill="#111"/>
      <rect x="40" y="50" width="200" height="4" fill="#111"/>
      ${fwWheel(62, 62, 21, 12, era)}${fwWheel(236, 64, 17, 10, era)}`;
  } else if (era < 2005) {
    body = `<path d="M18 60 L24 42 L90 38 L136 36 L150 28 L176 28 L188 38 L232 40 L270 44 L294 50 L294 56 L250 58 L18 64 Z" fill="${c}"/>${helmet(164, 26)}
      <rect x="4" y="14" width="34" height="14" rx="2" fill="#222"/><rect x="16" y="26" width="6" height="18" fill="#222"/>
      <path d="M244 60 L298 58 L298 66 L244 66 Z" fill="#222"/><line x1="268" y1="50" x2="268" y2="60" stroke="#222" stroke-width="3"/>
      <rect x="50" y="48" width="160" height="5" fill="#ffffff"/>
      ${fwWheel(62, 62, 20, 10, era)}${fwWheel(240, 64, 18, 10, era)}`;
  } else if (era < 2015) {
    body = `<path d="M18 60 L22 40 L96 36 L138 34 L150 26 L178 26 L190 36 L236 40 L276 48 L296 52 L296 58 L18 64 Z" fill="${c}"/>${helmet(166, 24)}
      <rect x="6" y="6" width="26" height="22" rx="2" fill="#1a1a1a"/><rect x="2" y="4" width="34" height="4" fill="${c}"/><rect x="16" y="26" width="6" height="18" fill="#1a1a1a"/>
      <path d="M230 62 L300 60 L300 68 L230 68 Z" fill="#1a1a1a"/><path d="M96 36 L120 26 L126 36 Z" fill="#1a1a1a"/>
      <rect x="40" y="48" width="190" height="4" fill="#fff"/>
      ${fwWheel(64, 62, 19, 10, era)}${fwWheel(240, 64, 18, 10, era)}`;
  } else {
    body = `<rect x="4" y="14" width="8" height="40" rx="2" fill="#111"/><rect x="2" y="10" width="30" height="9" rx="2" fill="${c}"/>
      <path d="M14 54 L58 42 L118 38 L146 27 L176 27 L192 39 L250 47 L294 55 L294 63 L14 66 Z" fill="${c}"/>
      <path d="M146 27 L176 27 L186 38 L140 38 Z" fill="#111"/><path d="M150 29 Q165 14 182 31" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>
      <rect x="60" y="48" width="180" height="5" fill="#fff"/><text x="105" y="47" font-family="Titillium Web,Arial" font-weight="900" font-style="italic" font-size="13" fill="#fff">FW</text>
      <rect x="252" y="63" width="44" height="6" rx="2" fill="#111"/>${fwWheel(70, 66, 20, 14, era)}${fwWheel(232, 68, 17, 12, era)}`;
  }
  return `<svg class="${cls || "evo-svg"}" viewBox="0 0 300 92" aria-hidden="true">${body}</svg>`;
}
/* Arma la capa "La evolución de la F1" dentro de un contenedor. t0 = segundo de arranque, slot = duración de cada auto */
function fwBuildEvolution(host, t0, slot, layerCls) {
  if (!host) return;
  const el = document.createElement("div");
  el.className = layerCls || "ci-layer ci-evo";
  el.style.setProperty("--evo-in", t0 + "s");
  el.style.setProperty("--evo-out", (t0 + slot * FW_ERAS.length) + "s");
  el.style.setProperty("--evo-len", (slot * FW_ERAS.length) + "s");
  el.innerHTML = `<div class="evo-bg"></div><div class="evo-road"></div>
    <div class="evo-k"><span class="bc-badge">F1</span>LA EVOLUCIÓN DE LA FÓRMULA 1</div>
    ${FW_ERAS.map((e, k) => {
      const d = (t0 + k * slot).toFixed(2);
      return `<div class="evo-year" style="animation-delay:${d}s;animation-duration:${slot}s">${e.y}</div>
        <div class="evo-car" style="animation-delay:${d}s;animation-duration:${slot}s">${fwCarSvg(e.y, e.c)}</div>
        <div class="evo-cap" style="animation-delay:${d}s;animation-duration:${slot}s"><b>${e.y}</b> · ${e.cap}</div>`;
    }).join("")}
    <div class="evo-bar"><span>1950</span><div><i></i></div><span>2026</span></div>`;
  host.appendChild(el);
  return el;
}
