/* =====================================================================================
   FAWIWE · RADIO CON VOZ
   - Usa la voz del navegador (Web Speech) para leer los mensajes de radio en voz alta.
   - Ruido de radio (squelch) antes y después de cada mensaje.
   - Voces distintas para el ingeniero, el piloto y los comisarios (sin imitar a nadie real).
   - Se apaga con el sonido general o con el botón 🎙️ de la transmisión.
   ===================================================================================== */
const FW_RADIO = { q: [], busy: false, voices: [], ctx: null };
function fwRadioOn() { return typeof s !== "undefined" && s && s.soundOn !== false && s.radioVoice !== false; }
function fwRadioVoices() {
  try {
    const all = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const es = all.filter(v => /^es/i.test(v.lang));
    const pref = ["es-AR", "es-419", "es-US", "es-MX", "es-ES"];
    es.sort((a, b) => { const ia = pref.indexOf(a.lang), ib = pref.indexOf(b.lang); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib); });
    FW_RADIO.voices = es;
  } catch (e) {}
  return FW_RADIO.voices;
}
try { if (window.speechSynthesis) { fwRadioVoices(); speechSynthesis.onvoiceschanged = fwRadioVoices; } } catch (e) {}
function fwSquelch(len) {
  try {
    if (!fwRadioOn()) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!FW_RADIO.ctx) FW_RADIO.ctx = new AC();
    const c = FW_RADIO.ctx;
    if (c.state === "suspended") c.resume();
    const t = c.currentTime, d = len || 0.16;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 1.4;
    const g = c.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t); src.stop(t + d);
    const o = c.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(1250, t);
    const g2 = c.createGain(); g2.gain.setValueAtTime(0.035, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g2); g2.connect(c.destination); o.start(t); o.stop(t + 0.08);
  } catch (e) {}
}
const FW_WHO = {
  eng: { tag: "📻 INGENIERO", color: "#22c55e", pitch: 0.85, rate: 1.08, v: 0 },
  drv: { tag: "🎧 PILOTO", color: "#38bdf8", pitch: 1.12, rate: 1.16, v: 1 },
  fia: { tag: "⚖️ COMISARIOS", color: "#facc15", pitch: 0.75, rate: 0.98, v: 0 },
  you: { tag: "🎙️ VOS", color: "#e10600", pitch: 1.05, rate: 1.14, v: 1 }
};
function fwRadioClean(t) {
  return String(t || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/^(Piloto|Comisarios|Ingeniero|Box)\s*:\s*/i, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
    .replace(/[«»"“”]/g, "")
    .replace(/\bP(\d+)\b/g, "pe $1")
    .replace(/\bV(\d+)\b/g, "vuelta $1")
    .replace(/\+(\d+)s\b/g, "más $1 segundos")
    .replace(/\s+/g, " ").trim();
}
function fwRadioToast(text, who) {
  let el = document.getElementById("fwRadioToast");
  if (!el) {
    el = document.createElement("div"); el.id = "fwRadioToast";
    el.innerHTML = `<div class="fr-tag"><i></i><i></i><i></i><span></span></div><div class="fr-txt"></div>`;
    document.body.appendChild(el);
  }
  const w = FW_WHO[who] || FW_WHO.eng;
  el.style.setProperty("--fr", w.color);
  el.querySelector(".fr-tag span").textContent = w.tag;
  el.querySelector(".fr-txt").textContent = String(text).replace(/<[^>]+>/g, "");
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), Math.max(2600, String(text).length * 75));
}
// who: "eng" | "drv" | "fia" | "you". opt.toast=false para no mostrar el cartel (cuando ya hay uno en pantalla)
function fwRadioSay(text, who, opt) {
  opt = opt || {};
  if (!text) return;
  if (opt.toast !== false) fwRadioToast(text, who);
  if (!fwRadioOn() || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
  const clean = fwRadioClean(text);
  if (!clean) return;
  if (FW_RADIO.q.length >= 2 && !opt.priority) FW_RADIO.q.shift();
  FW_RADIO.q.push({ clean, who });
  fwRadioPump();
}
function fwRadioPump() {
  if (FW_RADIO.busy || !FW_RADIO.q.length) return;
  const it = FW_RADIO.q.shift();
  const w = FW_WHO[it.who] || FW_WHO.eng;
  FW_RADIO.busy = true;
  fwSquelch(0.14);
  try {
    const u = new SpeechSynthesisUtterance(it.clean);
    const vs = FW_RADIO.voices.length ? FW_RADIO.voices : fwRadioVoices();
    if (vs.length) { u.voice = vs[Math.min(w.v, vs.length - 1)]; u.lang = u.voice.lang; } else u.lang = "es-AR";
    u.pitch = w.pitch; u.rate = w.rate; u.volume = 1;
    let done = false;
    const fin = () => { if (done) return; done = true; fwSquelch(0.1); FW_RADIO.busy = false; setTimeout(fwRadioPump, 180); };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 1500 + it.clean.length * 110); // por si el navegador no avisa el final
    setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { fin(); } }, 120);
  } catch (e) { FW_RADIO.busy = false; }
}
function fwRadioStop() { FW_RADIO.q = []; try { speechSynthesis.cancel(); } catch (e) {} FW_RADIO.busy = false; }
function fwRadioToggle() {
  s.radioVoice = s.radioVoice === false;
  if (s.radioVoice === false) fwRadioStop();
  document.querySelectorAll(".fr-voicebtn").forEach(b => { b.classList.toggle("off", s.radioVoice === false); b.textContent = s.radioVoice === false ? "🔇 Voz radio" : "🎙️ Voz radio"; });
  if (s.radioVoice !== false) fwRadioSay("Radio check. Fuerte y claro.", "eng");
}
function fwVoiceBtn() { const off = typeof s !== "undefined" && s && s.radioVoice === false; return `<button type="button" class="lv-btn fr-voicebtn ${off ? "off" : ""}" onclick="fwRadioToggle()">${off ? "🔇 Voz radio" : "🎙️ Voz radio"}</button>`; }

/* ---------- ganchos: la radio de las cinemáticas y del minijuego de radio se escucha ---------- */
(function () {
  let last = "", lastQ = "";
  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      const t = r.target && r.target.nodeType === 1 ? r.target : r.target && r.target.parentElement;
      if (!t) continue;
      if (t.id === "lcRadio") {
        const txt = t.textContent.replace(/^📻\s*/, "").trim();
        if (txt && txt !== last) {
          last = txt;
          const isDrv = typeof s !== "undefined" && s.playerMode === "driver";
          const who = /^Piloto:/i.test(txt) ? "drv" : /^Comisarios:/i.test(txt) ? "fia" : "eng";
          if (!isDrv && who === "eng" && !/^«/.test(txt)) continue; // carteles de ayuda del modo ingeniero: no se leen
          fwRadioSay(txt, who, { toast: false });
        }
      } else if (t.id === "eQ" && t.closest && t.closest(".em-radio")) {
        const txt = t.textContent.replace(/^🎧\s*Piloto:\s*/i, "").trim();
        if (txt && txt !== lastQ) { lastQ = txt; fwRadioSay(txt, "drv", { toast: false }); }
      }
    }
  });
  const go = () => { try { mo.observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) {} };
  if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
})();

/* ---------- modo ingeniero: el piloto te habla en la transmisión en vivo ---------- */
const FW_DRV_ASK = {
  pit: ["Los traseros se están yendo, ¿cuándo paramos?", "Siento las gomas muertas, ¿qué hacemos?", "¿Box esta vuelta o sigo?"],
  sc: ["Safety car, safety car. ¿Entro?", "Está el auto de seguridad, decime qué hago.", "¿Paramos ahora que es barato?"],
  weather: ["¡Está empezando a llover, no tengo agarre!", "La pista cambia, ¿qué gomas?", "Hay agua en la curva uno, ojo."],
  push: ["¿Puedo ir a fondo hasta el final?", "Tengo ritmo, ¿subimos el motor?", "Decime el modo de motor para el final."]
};
const FW_DRV_OK = ["Copiado.", "Entendido, vamos.", "Recibido, confío en vos.", "Dale, copiado."];
(function () {
  if (typeof engLiveOpenDecision === "function") {
    const o = engLiveOpenDecision;
    engLiveOpenDecision = function (dec) {
      const r = o.apply(this, arguments);
      try { if (engLive && !engLive.skip) { const a = FW_DRV_ASK[dec.id] || FW_DRV_ASK.pit; fwRadioSay(a[(s.gp + engLive.tick) % a.length], "drv"); } } catch (e) {}
      return r;
    };
  }
  if (typeof engLiveChoose === "function") {
    const o = engLiveChoose;
    engLiveChoose = function (i) {
      const L = engLive, opt = L && L.dec && (L.dec.opts[i] || L.dec.opts[L.dec.def]);
      const r = o.apply(this, arguments);
      try {
        if (opt && L && !L.skip) {
          fwRadioSay(opt.label.replace(/^\S+\s/, ""), "you");
          fwRadioSay(FW_DRV_OK[(s.gp + L.tick) % FW_DRV_OK.length], "drv", { toast: false });
        }
      } catch (e) {}
      return r;
    };
  }
  // feed de la transmisión: el piloto reacciona a lo que le pasa
  if (typeof engLiveDraw === "function") {
    const o = engLiveDraw;
    engLiveDraw = function () {
      const r = o.apply(this, arguments);
      try {
        const L = engLive;
        if (!L || L.skip) return r;
        L._spoken = L._spoken || 0;
        const fresh = L.feed.slice(L._spoken);
        L._spoken = L.feed.length;
        fresh.forEach(f => {
          const t = f.txt;
          if (/^⬆️/.test(t) && f.mine) fwRadioSay("¡Adentro! Lo pasé.", "drv");
          else if (/^💥 ¡NOOO!/.test(t)) fwRadioSay("¡No! Se terminó, el auto no anda.", "drv");
          else if (/^🚨/.test(t)) fwRadioSay("Safety car en pista.", "eng", { toast: false });
          else if (/^🏁/.test(t)) fwRadioSay("Bandera a cuadros. " + t.replace(/^🏁[^!]*!\s*/, ""), "eng");
          else if (/^⚠️ Comisarios/.test(t) && f.mine) fwRadioSay(t.replace(/^⚠️ Comisarios:\s*/, ""), "fia");
        });
      } catch (e) {}
      return r;
    };
  }
})();
