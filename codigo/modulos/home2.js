/* =====================================================================================
   FAWIWE · TU CASA 2: mudanzas, mejoras y el humor que se nota
   - Dónde vivís depende de tu plata: desde un catre en la FÁBRICA del equipo hasta una
     MANSIÓN EN MÓNACO DE 35 HABITACIONES. Te mudás desde adentro de la casa.
   - Mejoras para cada ambiente (colchón premium, cocina gourmet, jacuzzi, home theater…)
     que multiplican lo que te da cada actividad o suman actividades nuevas.
   - Si tenés poca salud, ánimo, calma o carisma: en las entrevistas hablás mal y en la
     pista rendís menos.
   ===================================================================================== */
const HOMES = [
  { id: "fabrica", name: "🏭 Cuartito en la fábrica del equipo", sub: "Un catre al lado de los autos, el comedor de los mecánicos y el vestuario.", rooms: ["cuarto", "cocina", "bano"], comfort: 0.6, eur: 0, m: 0, habs: 1 },
  { id: "alquiler", name: "🏢 Departamento alquilado", sub: "Chiquito, pero es tuyo (bueno, del dueño).", rooms: ["cuarto", "cocina", "living", "bano", "balcon"], comfort: 0.85, eur: 12000, m: 0.1, habs: 2 },
  { id: "depto", name: "🏢 Tu departamento propio", sub: "Luminoso, cerca de la fábrica.", rooms: ["cuarto", "cocina", "living", "bano", "balcon"], comfort: 1, eur: 220000, m: 1.5, habs: 3, own: () => (s.engOwned || {}).depto || ((s.lifestyleLevels || {}).apartment || 0) > 0 },
  { id: "casa", name: "🏡 Casa con jardín", sub: "Con sala de música y lugar para los amigos.", rooms: ["cuarto", "cocina", "living", "bano", "balcon", "musica"], comfort: 1.15, eur: 750000, m: 5, habs: 6, own: () => (s.engOwned || {}).casa || ((s.lifestyleLevels || {}).house || 0) > 0 },
  { id: "mansion", name: "🏰 Mansión", sub: "Pileta, jardín enorme y fiestas.", rooms: ["cuarto", "cocina", "living", "bano", "balcon", "musica", "pile"], comfort: 1.3, eur: 4500000, m: 20, habs: 14, own: () => (s.engOwned || {}).mansion || ((s.lifestyleLevels || {}).house || 0) >= 2 },
  { id: "monaco", name: "🛥️ Mansión en Mónaco · 35 habitaciones", sub: "Vista al puerto, cine propio, spa y helipuerto. Tus vecinos son pilotos campeones.", rooms: ["cuarto", "cocina", "living", "bano", "balcon", "musica", "pile", "cine", "spa", "terraza"], comfort: 1.5, eur: 15000000, m: 60, habs: 35, own: () => (s.engOwned || {}).villa || ((s.lifestyleLevels || {}).villa || 0) > 0 }
];
// ambientes nuevos de las casas grandes
HOME_ROOMS.push(
  { id: "cine", icon: "🎬", name: "Cine propio", bg: "#1f2937", acts: [
    { id: "estreno", icon: "🍿", name: "Estreno con amigos", cine: "movie", fx: { animo: 5, carisma: 3 }, txt: "Estreno exclusivo en tu sala: tus amigos no lo podían creer." },
    { id: "maraton", icon: "📺", name: "Maratón de series", cine: "movie", fx: { calma: 5, animo: 2 }, txt: "Una temporada entera en una tarde." }] },
  { id: "spa", icon: "💆", name: "Spa", bg: "#134e4a", acts: [
    { id: "masaje", icon: "💆", name: "Masaje descontracturante", cine: "bath", fx: { salud: 6, calma: 5 }, txt: "Una hora de masaje: salís flotando." },
    { id: "sauna", icon: "♨️", name: "Sauna", cine: "bath", fx: { salud: 4, calma: 3 }, txt: "Calor, vapor y la cabeza en blanco." }] },
  { id: "terraza", icon: "🌊", name: "Terraza al puerto", bg: "#0c4a6e", acts: [
    { id: "yates", icon: "🛥️", name: "Mirar los yates del puerto", cine: "sun", fx: { calma: 5, animo: 2 }, txt: "El puerto de Mónaco a tus pies." },
    { id: "gala", icon: "🥂", name: "Cena con celebridades", cine: "party", fx: { carisma: 7, animo: 3, salud: -1 }, txt: "Actores, músicos y campeones en tu terraza." }] }
);
const HOME_UPS = [
  { id: "colchon", room: "cuarto", name: "🛏️ Colchón premium", eur: 2000, mult: 1.5 },
  { id: "blackout", room: "cuarto", name: "🌑 Cortinas blackout", eur: 800, mult: 1.25 },
  { id: "gourmet", room: "cocina", name: "👨‍🍳 Cocina gourmet", eur: 18000, mult: 1.5 },
  { id: "theater", room: "living", name: "📽️ Home theater", eur: 25000, mult: 1.5 },
  { id: "consola", room: "living", name: "🎮 Consola nueva", eur: 600, mult: 1.2 },
  { id: "jacuzzi", room: "bano", name: "🛁 Jacuzzi", eur: 12000, mult: 1.5 },
  { id: "jardinv", room: "balcon", name: "🌿 Jardín vertical", eur: 3000, mult: 1.4 },
  { id: "perro", room: "balcon", name: "🐶 Adoptar un perro", eur: 300, mult: 1, act: { id: "pasear", icon: "🐕", name: "Pasear al perro", cine: "plants", fx: { animo: 5, salud: 2 }, txt: "Tu perro te espera siempre contento." } },
  { id: "piano", room: "musica", name: "🎹 Piano de cola", eur: 40000, mult: 1.5 },
  { id: "climat", room: "pile", name: "🌴 Pileta climatizada", eur: 120000, mult: 1.5 },
  { id: "butacas", room: "cine", name: "🍿 Butacas VIP", eur: 60000, mult: 1.5 },
  { id: "saunap", room: "spa", name: "🧖 Spa completo", eur: 90000, mult: 1.5 },
  { id: "heli", room: "terraza", name: "🚁 Helipuerto", eur: 500000, mult: 1.2, act: { id: "heliv", icon: "🚁", name: "Paseo en helicóptero", cine: "sun", fx: { calma: 4, animo: 5, carisma: 2 }, txt: "Mónaco, Niza y la costa desde el aire." } }
];
function homeIsEng() { return s.playerMode !== "driver"; }
function homeCash() { return homeIsEng() ? (s.engWallet || 0) : (s.money || 0); }
function homePriceTxt(eur, m) { return homeIsEng() ? walEur(eur) : formatMoney(m != null ? m : Math.max(0.001, eur / 1e6 * 1.2)); }
function homePay(eur, m) {
  const cost = homeIsEng() ? eur : (m != null ? m : Math.max(0.001, eur / 1e6 * 1.2));
  if (homeCash() < cost) return false;
  if (homeIsEng()) s.engWallet -= cost; else s.money = Math.round((s.money - cost) * 1000) / 1000;
  return true;
}
function homeCur() {
  if (!s.homeId) s.homeId = homeIsEng() && tierIndex() === 0 ? "fabrica" : "alquiler";
  return HOMES.find(h => h.id === s.homeId) || HOMES[1];
}
function homeOwned(h) { if (!s.homesOwned) s.homesOwned = {}; return h.eur === 0 || s.homesOwned[h.id] || (h.own && h.own()); }
function homeUps() { if (!s.homeUp) s.homeUp = {}; return s.homeUp; }
// reemplaza el nivel de casa viejo por la casa en la que vivís
window.homeLevel = function () { const i = HOMES.indexOf(homeCur()); return i >= 5 ? 3 : i >= 4 ? 3 : i >= 3 ? 2 : i >= 2 ? 1 : 0; };

/* ---------- humor: cuando estás mal, se nota ---------- */
function homeMood() {
  const L = homeLife(), r = [];
  if ((s.health ?? 92) < 40) r.push({ k: "salud", t: "🤒 cansado y con poca salud", pre: "*bosteza* " });
  if (L.animo < 25) r.push({ k: "animo", t: "😞 de muy mal ánimo", pre: "*suspira* " });
  if (L.calma < 25) r.push({ k: "calma", t: "😤 muy nervioso", pre: "¡¿Otra vez con eso?! " });
  if (L.carisma < 25) r.push({ k: "carisma", t: "😶 sin nada de carisma", pre: "Ehh… mmm… " });
  return r;
}

/* ---------- la casa por dentro (nueva versión) ---------- */
window.homeOpen = function (tab) {
  const H = homeCur(), left = homeSlotsLeft(), L = homeLife(), mood = homeMood();
  let ov = document.getElementById("homeOv");
  if (!ov) { ov = document.createElement("div"); ov.id = "homeOv"; document.body.appendChild(ov); }
  const rooms = HOME_ROOMS.filter(r => H.rooms.indexOf(r.id) >= 0);
  ov.innerHTML = `<div class="home-wrap">
    <div class="home-top"><div><div class="home-k">🚪 ENTRASTE A</div><h2>${H.name}</h2><div class="small">${H.sub} · ${H.habs} ${H.habs === 1 ? "ambiente" : "habitaciones"} · confort ×${H.comfort}</div></div><button class="dark era-btn" onclick="homeClose()">✕ Salir</button></div>
    <div class="home-stats"><span>❤️ Salud <b>${Math.round(s.health ?? 92)}</b></span>${Object.keys(HOME_STATS).map(k => `<span>${HOME_STATS[k]} <b>${Math.round(L[k])}</b></span>`).join("")}<span class="home-slots">🕐 Momentos libres: <b>${left}</b>/2</span><span>👛 ${homePriceTxt(homeCash(), homeCash())}</span></div>
    ${mood.length ? `<p class="notice">⚠️ Estás ${mood.map(m => m.t).join(", ")}: en las entrevistas vas a hablar mal y en la pista rendís menos. ¡Cuidate!</p>` : ""}
    <div class="home-tabs"><button class="era-btn ${tab ? "dark" : ""}" onclick="homeOpen()">🏠 Ambientes</button><button class="era-btn ${tab === "up" ? "" : "dark"}" onclick="homeOpen('up')">🛠️ Mejorar la casa</button><button class="era-btn ${tab === "move" ? "" : "dark"}" onclick="homeOpen('move')">🏘️ Mudarte</button></div>
    ${tab === "up" ? homeUpHtml(H) : tab === "move" ? homeMoveHtml(H) : `<div class="home-plan">${rooms.map(r => {
      const ups = HOME_UPS.filter(u => u.room === r.id && homeUps()[u.id]).map(u => u.name.split(" ")[0]).join("");
      return `<button class="home-room era-btn" style="--bg:${r.bg}" onclick="homeRoom('${r.id}')"><span class="hr-ic">${r.icon}</span><b>${r.name}</b><span class="small">${homeActs(r).length} actividades ${ups}</span></button>`;
    }).join("")}</div><div id="homeRoomBox" class="home-roombox"><p class="small">Elegí un ambiente para ver qué podés hacer.</p></div>`}
  </div>`;
  ov.classList.add("show");
  try { FWAudio.click(); } catch (e) {}
};
function homeActs(r) { return r.acts.concat(HOME_UPS.filter(u => u.room === r.id && u.act && homeUps()[u.id]).map(u => u.act)); }
function homeMult(roomId) { let m = homeCur().comfort; HOME_UPS.forEach(u => { if (u.room === roomId && homeUps()[u.id]) m *= u.mult; }); return m; }
function homeFx(roomId, fx) { const m = homeMult(roomId), o = {}; Object.entries(fx).forEach(([k, v]) => { o[k] = v > 0 ? Math.max(1, Math.round(v * m)) : v; }); return o; }
window.homeRoom = function (id) {
  const r = HOME_ROOMS.find(x => x.id === id); if (!r) return;
  document.querySelectorAll(".home-room").forEach(b => b.classList.toggle("on", b.getAttribute("onclick") === `homeRoom('${id}')`));
  const left = homeSlotsLeft();
  const fxTxt = fx => Object.entries(fx).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k === "salud" ? "❤️ salud" : HOME_STATS[k]}`).join(" · ");
  const box = document.getElementById("homeRoomBox"); if (!box) return;
  box.innerHTML = `<h3>${r.icon} ${r.name} <span class="small">(×${homeMult(id).toFixed(2)})</span></h3><div class="home-acts">${homeActs(r).map(a => `<button class="home-act era-btn" ${left <= 0 ? "disabled" : ""} onclick="homeDo('${r.id}','${a.id}')"><span class="ha-ic">${a.icon}</span><b>${a.name}</b><span class="small">${fxTxt(homeFx(id, a.fx))}</span></button>`).join("")}</div>
    ${left <= 0 ? `<p class="notice">🕐 Ya usaste tus 2 momentos libres de este Gran Premio. Volvé después de la próxima carrera.</p>` : ""}`;
};
window.homeDo = function (rid, aid) {
  const r = HOME_ROOMS.find(x => x.id === rid), a = r && homeActs(r).find(x => x.id === aid);
  if (!a || homeSlotsLeft() <= 0) return;
  s.homeSlots.used++;
  const fx = homeFx(rid, a.fx);
  homeCine(a, () => {
    const L = homeLife(), got = [];
    Object.entries(fx).forEach(([k, v]) => {
      if (k === "salud") { s.health = clamp((s.health ?? 92) + v); got.push((v > 0 ? "+" : "") + v + " ❤️ salud"); }
      else { L[k] = Math.max(0, Math.min(100, L[k] + v)); got.push((v > 0 ? "+" : "") + v + " " + HOME_STATS[k]); }
    });
    add("🏠 " + a.icon + " " + a.name + ": " + a.txt + " (" + got.join(", ") + ")");
    homeOpen(); homeRoom(rid);
    const box = document.getElementById("homeRoomBox");
    if (box) box.insertAdjacentHTML("afterbegin", `<div class="home-done">✅ ${a.txt}<br><b>${got.join(" · ")}</b></div>`);
  });
};
function homeUpHtml(H) {
  const list = HOME_UPS.filter(u => H.rooms.indexOf(u.room) >= 0);
  return `<p class="small">Las mejoras multiplican lo que te da cada actividad de ese ambiente (o suman actividades nuevas). Si te mudás, te las llevás.</p>
    <div class="home-acts">${list.map(u => {
      const has = homeUps()[u.id], room = HOME_ROOMS.find(r => r.id === u.room);
      return `<div class="home-act"><b>${u.name}</b><span class="small">${room.icon} ${room.name} · ${u.act ? "nueva actividad: " + u.act.name : "×" + u.mult + " a lo que da"}</span>
        ${has ? `<span class="pill">✅ Instalado</span>` : `<button class="era-btn" onclick="homeBuyUp('${u.id}')">${homePriceTxt(u.eur)}</button>`}</div>`;
    }).join("")}</div>`;
}
function homeBuyUp(id) {
  const u = HOME_UPS.find(x => x.id === id); if (!u || homeUps()[id]) return;
  if (!homePay(u.eur)) return add("❌ No te alcanza para " + u.name + " (" + homePriceTxt(u.eur) + ").");
  homeUps()[id] = true;
  add("🛠️ Mejoraste tu casa: " + u.name + ".");
  try { FWAudio.ok(); } catch (e) {}
  homeOpen("up");
}
function homeMoveHtml(H) {
  return `<p class="small">Dónde vivís depende de tu plata. Las casas que ya compraste (en tus compras) te las mudás gratis.</p>
    <div class="home-acts">${HOMES.map(h => {
      const cur = h.id === H.id, own = homeOwned(h);
      return `<div class="home-act ${cur ? "on" : ""}"><b>${h.name}</b><span class="small">${h.sub}<br>${h.habs} ${h.habs === 1 ? "ambiente" : "habitaciones"} · confort ×${h.comfort}</span>
        ${cur ? `<span class="pill">🏠 Vivís acá</span>` : `<button class="era-btn ${own ? "" : "dark"}" onclick="homeMove('${h.id}')">${own ? "Mudarte (ya es tuya)" : "Comprar y mudarte · " + homePriceTxt(h.eur, h.m)}</button>`}</div>`;
    }).join("")}</div>`;
}
function homeMove(id) {
  const h = HOMES.find(x => x.id === id); if (!h) return;
  if (!homeOwned(h)) {
    if (!homePay(h.eur, h.m)) return add("❌ No te alcanza para " + h.name + " (" + homePriceTxt(h.eur, h.m) + ").");
    s.homesOwned[h.id] = true;
  }
  s.homeId = h.id;
  add("🚚 ¡Mudanza! Ahora vivís en: " + h.name + ".");
  try { FWAudio.fanfare(); } catch (e) {}
  homeOpen();
}
// la tarjeta muestra la casa real y avisa si estás mal
(function () {
  const o = window.homeCardHtml;
  if (typeof o === "function") window.homeCardHtml = function () {
    let h = o.apply(this, arguments);
    const H = homeCur(), mood = homeMood();
    h = h.replace(/<b>(🏢|🏡|🏰)[^<]*<\/b>/, `<b>${H.name}</b>`);
    if (mood.length) h = h.replace("<h2>🏠 Tu casa</h2>", `<h2>🏠 Tu casa</h2><p class="notice">⚠️ Estás ${mood.map(m => m.t).join(", ")}: hablás mal en las entrevistas y rendís menos en la pista. Andá a casa a recuperarte.</p>`);
    return h;
  };
})();

/* ---------- efectos del mal humor ---------- */
(function () {
  // en la pista
  const lp = window.lowAttributePenalty;
  if (typeof lp === "function") window.lowAttributePenalty = function () {
    const r = lp.apply(this, arguments);
    try {
      const mood = homeMood();
      if (mood.length) {
        const pen = Math.min(9, mood.length * 3);
        return { penalty: (r.penalty || 0) - pen, note: (r.note ? r.note + " " : "") + (s.playerMode === "driver" ? "😩 Llegaste " + mood.map(m => m.t.replace(/^\S+ /, "")).join(" y ") + ": se notó en la pista." : "😩 Llegaste " + mood.map(m => m.t.replace(/^\S+ /, "")).join(" y ") + ": tus decisiones en el box fueron peores.") };
      }
    } catch (e) {}
    return r;
  };
  // en la prensa: las respuestas suenan mal y a veces salen mal aunque elijas bien
  const sp = window.showPress;
  if (typeof sp === "function") window.showPress = function () {
    const r = sp.apply(this, arguments);
    try {
      const mood = homeMood();
      if (mood.length) {
        const pre = mood[0].pre;
        document.querySelectorAll("#pressQuestions .press-option").forEach(b => { b.textContent = b.textContent.replace(/^([A-D]\) )/, "$1" + pre); });
        const q = document.getElementById("pressQuestions");
        if (q && !document.getElementById("pressMood")) q.insertAdjacentHTML("beforebegin", `<p class="notice" id="pressMood">😩 Hoy estás ${mood.map(m => m.t).join(", ")}: aunque elijas bien, tus respuestas pueden salir mal.</p>`);
      } else { const pm = document.getElementById("pressMood"); if (pm) pm.remove(); }
    } catch (e) {}
    return r;
  };
  const ap = window.answerPress;
  if (typeof ap === "function") window.answerPress = function (i, chosen, correct) {
    const already = window.pressAnswers && window.pressAnswers[i];
    const r = ap.apply(this, arguments);
    try {
      const mood = homeMood();
      if (!already && chosen === correct && mood.length && Math.random() < Math.min(0.6, 0.25 * mood.length)) {
        window.pressCorrect = Math.max(0, (window.pressCorrect || 0) - 1);
        s.trust = clamp((s.trust || 50) - 2); s.pop = clamp((s.pop || 50) - 2);
        const fb = document.getElementById("pressFeedback" + i);
        if (fb) fb.textContent = "😒 Elegiste bien, pero lo dijiste de mala manera (" + mood[0].t.replace(/^\S+ /, "") + "): la prensa lo tomó mal.";
        const sc = document.getElementById("pressScore"); if (sc) sc.textContent = "Decisiones correctas: " + window.pressCorrect + "/3";
      }
    } catch (e) {}
    return r;
  };
})();
