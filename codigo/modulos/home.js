/* =====================================================================================
   FAWIWE · TU CASA (los dos modos)
   Actividad "Ir a casa": entrás, elegís un ambiente (dormitorio, cocina, living, baño,
   balcón…) y una actividad. Cada una tiene su cinemática (dormir: noche, luna, Zzz y
   amanecer) y te da SALUD y PERSONALIDAD (calma, ánimo, carisma). Nada deportivo.
   Tenés 2 momentos libres por Gran Premio.
   ===================================================================================== */
const HOME_STATS = { calma: "😌 Calma", animo: "😄 Ánimo", carisma: "🗣️ Carisma" };
const HOME_ROOMS = [
  { id: "cuarto", icon: "🛏️", name: "Dormitorio", bg: "#1e1b4b", acts: [
    { id: "dormir", icon: "😴", name: "Dormir 8 horas", cine: "sleep", fx: { salud: 6, calma: 4 }, txt: "Dormiste como un bebé. El cuerpo lo agradece." },
    { id: "siesta", icon: "🛌", name: "Siesta corta", cine: "nap", fx: { salud: 3, animo: 2 }, txt: "Una siesta de 20 minutos y como nuevo." }] },
  { id: "cocina", icon: "🍳", name: "Cocina", bg: "#422006", acts: [
    { id: "cocinar", icon: "🥗", name: "Cocinar algo sano", cine: "cook", fx: { salud: 4, animo: 2 }, txt: "Verduras, pescado y arroz: rico y sano." },
    { id: "asado", icon: "🥩", name: "Asado con amigos", cine: "bbq", fx: { animo: 5, carisma: 3, salud: -1 }, txt: "Un asado con los amigos de siempre. Se habló de todo menos de carreras." },
    { id: "delivery", icon: "🍕", name: "Pedir delivery", cine: "pizza", fx: { animo: 3, salud: -2 }, txt: "Pizza en el sillón. No es lo más sano, pero qué rico." }] },
  { id: "living", icon: "🛋️", name: "Living", bg: "#172554", acts: [
    { id: "peli", icon: "🎬", name: "Ver una película", cine: "movie", fx: { animo: 3, calma: 3 }, txt: "Pochoclos, manta y una buena película." },
    { id: "juegos", icon: "🎮", name: "Videojuegos con amigos", cine: "games", fx: { animo: 4, carisma: 2 }, txt: "Partida online con amigos. Ganaste vos, obvio." },
    { id: "leer", icon: "📖", name: "Leer un libro", cine: "read", fx: { calma: 5 }, txt: "Un par de capítulos y la cabeza en otro lado." }] },
  { id: "bano", icon: "🛁", name: "Baño", bg: "#083344", acts: [
    { id: "banio", icon: "🛀", name: "Baño de espuma", cine: "bath", fx: { calma: 4, salud: 2 }, txt: "Agua caliente, espuma y música tranquila." },
    { id: "skincare", icon: "🧴", name: "Cuidarte la piel", cine: "skincare", fx: { carisma: 3, animo: 1 }, txt: "Para salir impecable en las fotos." }] },
  { id: "balcon", icon: "🌇", name: "Balcón", bg: "#4a1d0e", acts: [
    { id: "meditar", icon: "🧘", name: "Meditar al atardecer", cine: "meditate", fx: { calma: 6 }, txt: "Respirás hondo mirando el atardecer." },
    { id: "familia", icon: "📞", name: "Llamar a la familia", cine: "call", fx: { animo: 4, calma: 2 }, txt: "Una charla larga con tu familia: te hace bien." },
    { id: "plantas", icon: "🌱", name: "Regar las plantas", cine: "plants", fx: { calma: 3, animo: 1 }, txt: "Tus plantas están más lindas que nunca." }] },
  { id: "musica", icon: "🎸", name: "Sala de música", bg: "#3b0764", need: 2, acts: [
    { id: "guitarra", icon: "🎸", name: "Tocar la guitarra", cine: "music", fx: { animo: 4, carisma: 2 }, txt: "Sacaste una canción nueva de oído." },
    { id: "karaoke", icon: "🎤", name: "Karaoke con amigos", cine: "karaoke", fx: { carisma: 5, animo: 3 }, txt: "Desafinaste, pero fuiste el alma de la fiesta." }] },
  { id: "pile", icon: "🏊", name: "Pileta y jardín", bg: "#064e3b", need: 3, acts: [
    { id: "sol", icon: "🌞", name: "Descansar al sol", cine: "sun", fx: { calma: 4, salud: 2 }, txt: "Reposera, sombrilla y nada que hacer." },
    { id: "fiesta", icon: "🎉", name: "Fiesta en casa", cine: "party", fx: { carisma: 6, animo: 4, salud: -2 }, txt: "Música, amigos y una noche inolvidable." }] }
];
// nivel de tu casa según lo que compraste (ingeniero: tu bolsillo; piloto: lifestyle)
function homeLevel() {
  const o = s.engOwned || {}, L = s.lifestyleLevels || {};
  if (o.villa || o.mansion || (L.villa || 0) > 0 || (L.house || 0) >= 2) return 3;
  if (o.casa || (L.house || 0) > 0) return 2;
  if (o.depto || (L.apartment || 0) > 0) return 1;
  return 0;
}
const HOME_NAMES = ["🏢 Departamento alquilado", "🏢 Tu departamento", "🏡 Tu casa con jardín", "🏰 Tu mansión"];
function homeLife() { if (!s.life || typeof s.life !== "object") s.life = { calma: 50, animo: 55, carisma: 45 }; return s.life; }
function homeSlotsLeft() { const k = s.season + "_" + s.gp; if (!s.homeSlots || s.homeSlots.k !== k) s.homeSlots = { k, used: 0 }; return 2 - s.homeSlots.used; }

/* ---------- la casa por dentro ---------- */
function homeOpen() {
  const lvl = homeLevel(), left = homeSlotsLeft();
  let ov = document.getElementById("homeOv");
  if (!ov) { ov = document.createElement("div"); ov.id = "homeOv"; document.body.appendChild(ov); }
  const L = homeLife();
  ov.innerHTML = `<div class="home-wrap">
    <div class="home-top"><div><div class="home-k">🚪 ENTRASTE A</div><h2>${HOME_NAMES[lvl]}</h2></div><button class="dark era-btn" onclick="homeClose()">✕ Salir</button></div>
    <div class="home-stats"><span>❤️ Salud <b>${Math.round(s.health ?? 92)}</b></span>${Object.keys(HOME_STATS).map(k => `<span>${HOME_STATS[k]} <b>${Math.round(L[k])}</b></span>`).join("")}<span class="home-slots">🕐 Momentos libres este GP: <b>${left}</b>/2</span></div>
    <div class="home-plan">${HOME_ROOMS.map(r => {
      const lock = (r.need || 0) > lvl;
      return `<button class="home-room era-btn ${lock ? "lock" : ""}" style="--bg:${r.bg}" onclick="${lock ? "" : `homeRoom('${r.id}')`}" ${lock ? "disabled" : ""}><span class="hr-ic">${r.icon}</span><b>${r.name}</b><span class="small">${lock ? "🔒 " + (r.need === 2 ? "Con una casa más grande" : "Con una mansión") : r.acts.length + " actividades"}</span></button>`;
    }).join("")}</div>
    <div id="homeRoomBox" class="home-roombox"><p class="small">Elegí un ambiente para ver qué podés hacer.</p></div>
  </div>`;
  ov.classList.add("show");
  try { FWAudio.click(); } catch (e) {}
}
function homeClose() { const ov = document.getElementById("homeOv"); if (ov) ov.classList.remove("show"); try { render(); } catch (e) {} }
function homeRoom(id) {
  const r = HOME_ROOMS.find(x => x.id === id); if (!r) return;
  document.querySelectorAll(".home-room").forEach(b => b.classList.toggle("on", b.getAttribute("onclick") === `homeRoom('${id}')`));
  const left = homeSlotsLeft();
  const fxTxt = fx => Object.entries(fx).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k === "salud" ? "❤️ salud" : HOME_STATS[k]}`).join(" · ");
  document.getElementById("homeRoomBox").innerHTML = `<h3>${r.icon} ${r.name}</h3><div class="home-acts">${r.acts.map(a => `<button class="home-act era-btn" ${left <= 0 ? "disabled" : ""} onclick="homeDo('${r.id}','${a.id}')"><span class="ha-ic">${a.icon}</span><b>${a.name}</b><span class="small">${fxTxt(a.fx)}</span></button>`).join("")}</div>
    ${left <= 0 ? `<p class="notice">🕐 Ya usaste tus 2 momentos libres de este Gran Premio. Volvé después de la próxima carrera.</p>` : ""}`;
}
function homeDo(rid, aid) {
  const r = HOME_ROOMS.find(x => x.id === rid), a = r && r.acts.find(x => x.id === aid);
  if (!a || homeSlotsLeft() <= 0) return;
  s.homeSlots.used++;
  homeCine(a, () => {
    const L = homeLife(), got = [];
    Object.entries(a.fx).forEach(([k, v]) => {
      if (k === "salud") { s.health = clamp((s.health ?? 92) + v); got.push((v > 0 ? "+" : "") + v + " ❤️ salud"); }
      else { L[k] = Math.max(0, Math.min(100, L[k] + v)); got.push((v > 0 ? "+" : "") + v + " " + HOME_STATS[k]); }
    });
    add("🏠 " + a.icon + " " + a.name + ": " + a.txt + " (" + got.join(", ") + ")");
    homeOpen(); homeRoom(rid);
    const box = document.getElementById("homeRoomBox");
    if (box) box.insertAdjacentHTML("afterbegin", `<div class="home-done">✅ ${a.txt}<br><b>${got.join(" · ")}</b></div>`);
  });
}

/* ---------- cinemáticas ---------- */
const HOME_SCENES = {
  sleep: { cls: "night", big: "🛏️", floats: ["💤", "💤", "⭐", "💤", "🌙"], title: "Buenas noches…", sub: "23:00 → 07:00", dur: 4200 },
  nap: { cls: "dusk", big: "🛌", floats: ["💤", "💤", "😌"], title: "Siesta", sub: "20 minutos", dur: 2800 },
  cook: { cls: "kitchen", big: "🍳", floats: ["♨️", "🥦", "🐟", "🍚", "♨️"], title: "A cocinar", sub: "Algo rico y sano", dur: 3000 },
  bbq: { cls: "sunset", big: "🔥", floats: ["🥩", "🌭", "🍖", "🥗", "😂"], title: "¡Asado!", sub: "Con los amigos de siempre", dur: 3200 },
  pizza: { cls: "room", big: "🛵", floats: ["🍕", "🍕", "🥤"], title: "Delivery en camino", sub: "Ding dong", dur: 2800 },
  movie: { cls: "cinema", big: "📺", floats: ["🍿", "🎬", "🍿", "⭐"], title: "Noche de película", sub: "Pochoclos y manta", dur: 3200 },
  games: { cls: "cinema", big: "🎮", floats: ["👾", "🏆", "🕹️", "💥"], title: "¡A jugar!", sub: "Partida online con amigos", dur: 3000 },
  read: { cls: "dusk", big: "📖", floats: ["📚", "☕", "✨"], title: "Un buen libro", sub: "Un par de capítulos", dur: 3000 },
  bath: { cls: "bath", big: "🛁", floats: ["💧", "💧", "💧", "🦆", "💧"], title: "Baño de espuma", sub: "Música tranquila", dur: 3200 },
  skincare: { cls: "bath", big: "🧴", floats: ["✨", "💧", "✨"], title: "Cuidado personal", sub: "Listo para las fotos", dur: 2600 },
  meditate: { cls: "sunset", big: "🧘", floats: ["🌅", "🍃", "✨"], title: "Respirá…", sub: "Inhalá · exhalá", dur: 4000, breathe: true },
  call: { cls: "dusk", big: "📱", floats: ["❤️", "😂", "❤️"], title: "Llamando a casa…", sub: "Tu familia atiende", dur: 3000 },
  plants: { cls: "garden", big: "🌱", floats: ["💧", "🌱", "🌼", "💧"], title: "Regando", sub: "Tus plantas crecen", dur: 2800 },
  music: { cls: "studio", big: "🎸", floats: ["🎵", "🎶", "🎵", "🎶"], title: "Tocando", sub: "Una canción nueva", dur: 3200 },
  karaoke: { cls: "studio", big: "🎤", floats: ["🎶", "🎵", "😂", "🎶"], title: "¡Karaoke!", sub: "Desafinando con estilo", dur: 3200 },
  sun: { cls: "garden", big: "🌞", floats: ["🏖️", "🍹", "☀️"], title: "Al sol", sub: "Reposera y sombrilla", dur: 3000 },
  party: { cls: "studio", big: "🎉", floats: ["🎊", "🎶", "🥳", "🎊", "🎵"], title: "¡Fiesta en casa!", sub: "Una noche inolvidable", dur: 3400 }
};
function homeCine(a, done) {
  const sc = HOME_SCENES[a.cine] || HOME_SCENES.read;
  const ov = document.createElement("div");
  ov.id = "homeCine";
  ov.className = sc.cls;
  const floats = sc.floats.map((f, i) => `<span class="hc-f" style="left:${12 + i * 17}%;animation-delay:${(0.3 + i * 0.35).toFixed(2)}s">${f}</span>`).join("");
  const stars = sc.cls === "night" ? Array.from({ length: 22 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 23) % 60}%;animation-delay:${(i % 7) * 0.3}s"></i>`).join("") : "";
  ov.innerHTML = `<div class="hc-sky">${stars}</div>${sc.cls === "night" ? '<div class="hc-moon">🌙</div><div class="hc-sun">☀️</div>' : ""}
    <div class="hc-big">${sc.big}</div>${floats}
    ${sc.breathe ? '<div class="hc-breath"></div>' : ""}
    <div class="hc-plate"><div class="hc-t">${a.icon} ${sc.title}</div><div class="hc-s" id="hcClock">${sc.sub}</div></div>
    <div class="hc-skip">Tocá para saltar ⏭️</div>`;
  document.body.appendChild(ov);
  let gone = false;
  const end = () => { if (gone) return; gone = true; ov.classList.add("bye"); setTimeout(() => ov.remove(), 400); done(); };
  if (a.cine === "sleep") {
    // el reloj avanza de 23:00 a 07:00 y amanece
    const clock = document.getElementById("hcClock");
    let h = 23;
    const iv = setInterval(() => { h = (h + 1) % 24; if (clock) clock.textContent = "🕐 " + String(h).padStart(2, "0") + ":00"; if (h === 7) { clearInterval(iv); ov.classList.add("dawn"); if (clock) clock.textContent = "☀️ 07:00 · ¡Buen día!"; } }, 380);
    try { FWAudio.musicStop && FWAudio.musicStop(0.5); } catch (e) {}
  }
  ov.addEventListener("click", end);
  setTimeout(end, sc.dur);
}

/* ---------- tarjeta "Tu casa" ---------- */
function homeCardHtml() {
  const L = homeLife(), left = homeSlotsLeft(), lvl = homeLevel();
  const bar = (v, c) => `<div class="home-bar"><i style="width:${Math.round(v)}%;background:${c}"></i></div>`;
  return `<h2>🏠 Tu casa</h2>
    <div class="home-hero"><div class="home-door">🚪</div><div><b>${HOME_NAMES[lvl]}</b><p class="small">Fuera de la pista también hay vida: dormí, cociná, mirá una peli o llamá a tu familia. Te da <b>salud y personalidad</b> (nada deportivo). Tenés <b>2 momentos libres por GP</b>.</p>
      <button class="era-btn hot" onclick="homeOpen()" ${left <= 0 ? "" : ""}>🚪 Ir a casa ${left > 0 ? "(" + left + " momentos libres)" : "(sin momentos libres)"}</button></div></div>
    <div class="home-grid">
      <div>❤️ Salud ${bar(s.health ?? 92, "#e10600")}</div>
      <div>${HOME_STATS.calma} ${bar(L.calma, "#38bdf8")}</div>
      <div>${HOME_STATS.animo} ${bar(L.animo, "#facc15")}</div>
      <div>${HOME_STATS.carisma} ${bar(L.carisma, "#a855f7")}</div>
    </div>
    <p class="small">😌 Con <b>calma</b> alta los errores en la prensa te restan menos · 🗣️ con <b>carisma</b> alto las buenas respuestas te dan más popularidad · 😄 el <b>ánimo</b> y la calma bajan un poco cada GP si no te cuidás.</p>`;
}
function homeRender() {
  let card = document.getElementById("homeCard");
  const g = document.getElementById("game");
  const on = !!g && !g.classList.contains("hidden") && !s.player2;
  if (!card) {
    if (!on) return;
    const anchor = document.getElementById("worldFameCard") || document.getElementById("engWalletCard") || document.getElementById("jobCard");
    if (!anchor || !anchor.parentNode) return;
    card = document.createElement("div"); card.id = "homeCard"; card.className = "card";
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  card.classList.toggle("hidden", !on);
  if (on) card.innerHTML = homeCardHtml();
}
(function () {
  const rd = window.render;
  if (typeof rd === "function") window.render = function () { const x = rd.apply(this, arguments); try { homeRender(); } catch (e) { console.warn(e); } return x; };
  const ng = window.nextGP;
  if (typeof ng === "function") window.nextGP = function () {
    const ps = s.season, pg = s.gp;
    const r = ng.apply(this, arguments);
    if (s.season !== ps || s.gp !== pg) { const L = homeLife(); L.animo = Math.max(0, L.animo - 2); L.calma = Math.max(0, L.calma - 1); }
    return r;
  };
  // personalidad en la prensa: carisma suma popularidad, calma amortigua los errores
  const ap = window.answerPress;
  if (typeof ap === "function") window.answerPress = function (i, chosen, correct) {
    const already = window.pressAnswers && window.pressAnswers[i];
    const pop0 = s.pop;
    const r = ap.apply(this, arguments);
    try {
      if (!already) {
        const L = homeLife(), d = s.pop - pop0;
        if (d > 0 && L.carisma >= 60) s.pop = clamp(s.pop + 0.5);
        if (d < 0 && L.calma >= 60) s.pop = clamp(s.pop - d / 2);
      }
    } catch (e) {}
    return r;
  };
})();
