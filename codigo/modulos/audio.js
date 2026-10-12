/* =====================================================================================
   FAWIWE · SONIDO
   Todo se sintetiza en vivo con Web Audio (no hay archivos de música): clics, whoosh,
   pitidos del semáforo y una música original estilo "synth de carreras" en La menor.
   Los navegadores solo dejan sonar audio después de que tocás algo en la página.
   ===================================================================================== */
const FWAudio = (function () {
  let ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let IT = { build: 1.8, h0: 4.1, h1: 6.0 };
  let timer = null, nextTime = 0, step = 0, playing = false, startAt = 0, mode = "full", lastClick = 0;
  const BPM = 128, STEP = 60 / BPM / 4; // semicorchea
  // progresión Am – F – C – G (raíces en Hz)
  const PROG = [[110, [220, 261.63, 329.63]], [87.31, [174.61, 220, 261.63]], [130.81, [261.63, 329.63, 392]], [98, [196, 246.94, 293.66]]];
  const ARP = [0, 1, 2, 1, 2, 0, 1, 2, 0, 2, 1, 2, 0, 1, 2, 1];
  function enabled() {
    try { if (typeof window.FW_SOUND_ON === "function") return !!window.FW_SOUND_ON(); } catch (e) {}
    return true;
  }
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(comp);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(comp);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(freq, t, dur, type, gain, dest, attack, glideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + (attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function noise(t, dur, gain, filterType, freq, dest, freqTo) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.setValueAtTime(freq, t);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }
  /* ---- instrumentos de la música ---- */
  function kick(t) { tone(150, t, 0.28, "sine", 0.9, musicBus, 0.002, 42); }
  function snare(t) { noise(t, 0.16, 0.35, "bandpass", 1900, musicBus); tone(190, t, 0.1, "triangle", 0.18, musicBus); }
  function hat(t, open) { noise(t, open ? 0.14 : 0.035, open ? 0.12 : 0.09, "highpass", 7500, musicBus); }
  function bass(t, f) {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    flt.type = "lowpass"; flt.Q.value = 6; flt.frequency.setValueAtTime(1400, t); flt.frequency.exponentialRampToValueAtTime(220, t + STEP * 1.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + STEP * 1.9);
    o.connect(flt); flt.connect(g); g.connect(musicBus); o.start(t); o.stop(t + STEP * 2);
  }
  function pad(t, freqs, len) {
    freqs.forEach(f => [-6, 6].forEach(det => {
      const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = f; o.detune.value = det;
      flt.type = "lowpass"; flt.frequency.value = 1300;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022, t + 0.25); g.gain.linearRampToValueAtTime(0.0001, t + len);
      o.connect(flt); flt.connect(g); g.connect(musicBus); o.start(t); o.stop(t + len + 0.05);
    }));
  }
  function lead(t, f) { tone(f, t, STEP * 0.9, "square", 0.05, musicBus); }
  function scheduleStep(t, i) {
    const bar = Math.floor(i / 16), s16 = i % 16;
    const [root, chord] = PROG[bar % 4];
    const elapsed = t - startAt;
    const build = mode === "intro" && elapsed < IT.build;      // arranque: solo pad y arpegio
    const lightsHold = mode === "intro" && elapsed >= IT.h0 && elapsed < IT.h1; // semáforo: tensión
    if (s16 === 0) pad(t, chord, STEP * 16);
    if (!lightsHold) lead(t, chord[ARP[s16]] * (bar % 2 ? 2 : 1));
    if (build) { if (s16 % 4 === 2) hat(t); return; }
    if (lightsHold) { if (s16 % 4 === 0) tone(root * 0.5, t, 0.3, "sine", 0.4, musicBus); return; }
    if (s16 % 4 === 0) kick(t);
    if (s16 === 4 || s16 === 12) snare(t);
    hat(t, s16 % 4 === 2);
    if (s16 % 2 === 0) bass(t, root * (s16 === 6 || s16 === 14 ? 2 : 1));
  }
  function scheduler() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 0.15) { scheduleStep(nextTime, step); nextTime += STEP; step++; }
  }
  const api = {
    unlock() { if (!enabled()) return; ensure(); },
    ready() { return !!ctx && ctx.state === "running"; },
    click() {
      if (!enabled() || !ensure()) return;
      const now = performance.now(); if (now - lastClick < 45) return; lastClick = now;
      const t = ctx.currentTime;
      tone(2100, t, 0.035, "sine", 0.22, sfxBus, 0.001, 900);
      noise(t, 0.02, 0.12, "highpass", 4000);
    },
    whoosh() {
      if (!enabled() || !ensure()) return;
      const t = ctx.currentTime;
      noise(t, 0.55, 0.55, "bandpass", 350, sfxBus, 3200);
      tone(90, t, 0.5, "sawtooth", 0.08, sfxBus, 0.05, 220);
    },
    beep(high) {
      if (!enabled() || !ensure()) return;
      const t = ctx.currentTime;
      tone(high ? 880 : 440, t, high ? 0.6 : 0.22, "sine", 0.35, sfxBus, 0.004);
      if (high) noise(t, 0.9, 0.18, "highpass", 5000);
    },
    fanfare() {
      if (!enabled() || !ensure()) return;
      const t = ctx.currentTime + 0.02;
      [440, 523.25, 659.25, 880].forEach((f, k) => tone(f, t + k * 0.09, 0.22, "triangle", 0.22, sfxBus, 0.005));
      [440, 554.37, 659.25].forEach(f => tone(f, t + 0.4, 0.9, "sawtooth", 0.06, sfxBus, 0.02));
      noise(t + 0.4, 0.8, 0.12, "highpass", 6000);
      tone(110, t + 0.4, 0.5, "sine", 0.5, sfxBus, 0.005, 55);
    },
    rev() {
      if (!enabled() || !ensure()) return;
      const t = ctx.currentTime;
      tone(70, t, 0.8, "sawtooth", 0.16, sfxBus, 0.02, 560);
      tone(140, t, 0.8, "square", 0.045, sfxBus, 0.02, 1120);
      noise(t, 0.75, 0.22, "bandpass", 300, sfxBus, 2600);
    },
    ok() { if (!enabled() || !ensure()) return; const t = ctx.currentTime; tone(660, t, 0.12, "triangle", 0.25); tone(990, t + 0.1, 0.2, "triangle", 0.25); },
    bad() { if (!enabled() || !ensure()) return; const t = ctx.currentTime; tone(180, t, 0.3, "sawtooth", 0.12, sfxBus, 0.005, 110); },
    musicStart(m) {
      if (!enabled() || !ensure()) return;
      mode = m || "full";
      if (playing) return;
      playing = true; step = 0; nextTime = ctx.currentTime + 0.05; startAt = nextTime;
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
      musicBus.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 0.4);
      clearInterval(timer); timer = setInterval(scheduler, 25); scheduler();
    },
    musicMode(m) { mode = m; },
    introTimes(o) { IT = Object.assign({}, IT, o || {}); },
    musicStop(fade) {
      if (!ctx || !playing) return;
      const f = fade == null ? 1.2 : fade;
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), ctx.currentTime);
      musicBus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + f);
      setTimeout(() => { playing = false; clearInterval(timer); }, f * 1000 + 50);
    },
    isPlaying() { return playing; }
  };
  return api;
})();
