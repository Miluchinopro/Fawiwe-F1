/* =====================================================================================
   FAWIWE · CAMINO A LA F1: minijuegos por categoría y por época
   Cada carrera de las categorías chicas (karting, F4 / F. Renault / F. BMW, F3, F2 / F3000 /
   GP2) se juega en dos partes: una clasificación y una carrera, cada una con un minijuego.
   Los minijuegos cambian según la categoría y la época (caja en H, levas, DRS, pit stop,
   largada con bandera antes de 1971…). Las carreras y la tabla son las mismas de siempre:
   solo cambian los minijuegos. El resultado sale de lo bien que hiciste los dos.
   ===================================================================================== */
(function () {
  if (typeof renderJuniorStep !== "function" || typeof juniorRaceResult !== "function") return;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const yr = () => { try { return juniorCareerYear || 2026; } catch (e) { return 2026; } };
  let J = null; // minijuego en curso

  /* ---------- motores de minijuegos: cada uno llama a done(calidad 0..1, detalle) ---------- */
  function stop() { if (J) { J.dead = true; cancelAnimationFrame(J.raf); clearTimeout(J.to); clearInterval(J.iv); if (J.keys) document.removeEventListener("keydown", J.keys); if (J.keysUp) document.removeEventListener("keyup", J.keysUp); } J = null; }
  function base(el, g, done) {
    stop();
    J = { dead: false, raf: 0, to: 0, iv: 0, done: (q, d) => { if (!J || J.dead) return; const k = J; stop(); k.dead = true; done(clamp01(q), d); } };
    return J;
  }
  function onKey(fn, up) { const h = ev => { if (["Space", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD"].includes(ev.code)) { ev.preventDefault(); fn(ev.code); } }; if (up) J.keysUp = h; else J.keys = h; document.addEventListener(up ? "keyup" : "keydown", h); }
  const ENG = {
    // tocá cuando la marca pasa por la zona verde
    tap(el, g, done) {
      const j = base(el, g, done);
      const z = g.zone || [0.62, 0.74], c = (z[0] + z[1]) / 2, w = (z[1] - z[0]) / 2, dur = g.dur || 2200;
      el.innerHTML = `<div class="jg-bar"><div class="jg-zone" style="left:${z[0] * 100}%;width:${(z[1] - z[0]) * 100}%"></div><div class="jg-mark"></div></div><button type="button" class="go-btn jg-act">${g.act || "¡AHORA!"}</button>`;
      const m = el.querySelector(".jg-mark"), t0 = performance.now();
      const hit = () => { const p = (performance.now() - t0) / dur; const q = 1 - Math.max(0, Math.abs(p - c) - w * 0.35) / (w * 2.4); j.done(q, Math.round(clamp01(q) * 100) + "%"); };
      const step = () => { if (j.dead) return; const p = (performance.now() - t0) / dur; m.style.left = Math.min(100, p * 100) + "%"; if (p >= 1) { j.done(0, g.late || "Tarde"); return; } j.raf = requestAnimationFrame(step); };
      el.querySelector(".jg-act").onclick = hit; onKey(hit); j.raf = requestAnimationFrame(step);
    },
    // mantené apretado y soltá cuando la barra llega a la zona
    hold(el, g, done) {
      const j = base(el, g, done);
      const z = g.zone || [0.55, 0.7], c = (z[0] + z[1]) / 2, w = (z[1] - z[0]) / 2, rate = g.rate || 0.55;
      el.innerHTML = `<div class="jg-bar jg-v"><div class="jg-zone" style="left:${z[0] * 100}%;width:${(z[1] - z[0]) * 100}%"></div><div class="jg-fill"></div></div><button type="button" class="go-btn jg-act">${g.act || "MANTENÉ"}</button>`;
      const f = el.querySelector(".jg-fill"), b = el.querySelector(".jg-act");
      let v = 0, on = false, last = 0;
      const step = now => { if (j.dead) return; if (on) { v += (now - last) / 1000 * rate; if (v >= 1) { j.done(0, g.over || "Te pasaste"); return; } } last = now; f.style.width = v * 100 + "%"; j.raf = requestAnimationFrame(step); };
      const down = () => { if (!on) { on = true; last = performance.now(); } };
      const up = () => { if (!on) return; on = false; if (v < 0.05) return; const q = 1 - Math.max(0, Math.abs(v - c) - w * 0.4) / (w * 2.6); j.done(q, Math.round(clamp01(q) * 100) + "%"); };
      b.addEventListener("pointerdown", ev => { ev.preventDefault(); down(); }); b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up);
      onKey(down); onKey(up, true); j.raf = requestAnimationFrame(n => { last = n; step(n); });
    },
    // tocá rápido muchas veces antes de que se acabe el tiempo
    mash(el, g, done) {
      const j = base(el, g, done);
      const n = g.n || 22, T = g.time || 4000;
      el.innerHTML = `<div class="jg-bar"><div class="jg-fill"></div></div><p class="jg-info"><b class="jg-cnt">0</b> / ${n} · <span class="jg-t">${(T / 1000).toFixed(1)}</span>s</p><button type="button" class="go-btn jg-act">${g.act || "¡DALE!"}</button>`;
      const f = el.querySelector(".jg-fill"), cnt = el.querySelector(".jg-cnt"), tt = el.querySelector(".jg-t"), t0 = performance.now();
      let k = 0;
      const fin = () => { const used = performance.now() - t0; const q = k >= n ? 0.75 + 0.25 * clamp01((T - used) / (T * 0.5)) : (k / n) * 0.8; j.done(q, k + "/" + n); };
      const hit = () => { k++; cnt.textContent = k; f.style.width = Math.min(100, k / n * 100) + "%"; if (k >= n) fin(); };
      j.iv = setInterval(() => { const left = T - (performance.now() - t0); tt.textContent = Math.max(0, left / 1000).toFixed(1); if (left <= 0) fin(); }, 100);
      el.querySelector(".jg-act").onclick = hit; onKey(hit);
    },
    // memorizá la secuencia de curvas y repetila
    seq(el, g, done) {
      const j = base(el, g, done);
      const len = g.len || 5, S = Array.from({ length: len }, () => Math.random() < 0.5 ? "L" : "R"), ic = x => x === "L" ? "◀" : "▶";
      el.innerHTML = `<div class="jg-seq"></div><p class="jg-info jg-msg">${g.watch || "Mirá…"}</p><div class="jg-two"><button type="button" class="go-btn jg-l" disabled>◀</button><button type="button" class="go-btn jg-r" disabled>▶</button></div>`;
      const box = el.querySelector(".jg-seq"), msg = el.querySelector(".jg-msg"), bl = el.querySelector(".jg-l"), br = el.querySelector(".jg-r");
      let i = 0, ok = 0, phase = "show";
      j.iv = setInterval(() => {
        if (i < len) { box.innerHTML = `<span class="jg-big">${ic(S[i])}</span><small>${i + 1}/${len}</small>`; i++; return; }
        clearInterval(j.iv); box.innerHTML = ""; msg.textContent = g.yourTurn || "¡Tu turno!"; phase = "in"; i = 0; bl.disabled = br.disabled = false;
      }, g.speed || 700);
      const press = x => { if (phase !== "in" || j.dead) return; box.insertAdjacentHTML("beforeend", `<span class="jg-pip ${x === S[i] ? "ok" : "bad"}">${ic(x)}</span>`); if (x === S[i]) { ok++; i++; if (i >= len) j.done(1, ok + "/" + len); } else { j.to = setTimeout(() => j.done(ok / len * 0.85, ok + "/" + len), 350); phase = "x"; } };
      bl.onclick = () => press("L"); br.onclick = () => press("R");
      onKey(code => press(code === "ArrowLeft" || code === "KeyA" ? "L" : code === "ArrowRight" || code === "KeyD" ? "R" : ""));
    },
    // esquivá autos en 3 carriles
    lanes(el, g, done) {
      const j = base(el, g, done);
      const T = g.time || 9000, sp = g.speed || 0.55;
      el.innerHTML = `<div class="jg-road"><div class="jg-car me">🏎️</div></div><p class="jg-info">${g.hint || "◀ ▶ para cambiar de carril"} · <span class="jg-t"></span></p><div class="jg-two"><button type="button" class="go-btn jg-l">◀</button><button type="button" class="go-btn jg-r">▶</button></div>`;
      const road = el.querySelector(".jg-road"), me = el.querySelector(".me"), tt = el.querySelector(".jg-t");
      let lane = 1, hits = 0, obs = [], next = 600, t0 = performance.now(), last = t0;
      const put = () => { me.style.left = (lane * 33.33 + 16.66) + "%"; };
      put();
      const mv = d => { lane = Math.max(0, Math.min(2, lane + d)); put(); };
      el.querySelector(".jg-l").onclick = () => mv(-1); el.querySelector(".jg-r").onclick = () => mv(1);
      onKey(code => mv(code === "ArrowLeft" || code === "KeyA" ? -1 : code === "ArrowRight" || code === "KeyD" ? 1 : 0));
      const step = now => {
        if (j.dead) return;
        const dt = now - last; last = now; const el2 = now - t0;
        next -= dt;
        if (next <= 0 && el2 < T - 900) { const l = Math.floor(Math.random() * 3); const d = document.createElement("div"); d.className = "jg-car op"; d.textContent = g.obs || "🚗"; d.style.left = (l * 33.33 + 16.66) + "%"; road.appendChild(d); obs.push({ d, l, y: -12, hit: false }); next = 520 + Math.random() * 520 / sp; }
        obs.forEach(o => { o.y += dt * 0.06 * sp * (1 + el2 / T); o.d.style.top = o.y + "%"; if (!o.hit && o.l === lane && o.y > 70 && o.y < 92) { o.hit = true; hits++; o.d.classList.add("hit"); road.classList.add("bump"); setTimeout(() => road.classList.remove("bump"), 200); } });
        obs = obs.filter(o => { if (o.y > 110) { o.d.remove(); return false; } return true; });
        tt.textContent = (g.hitsLabel || "toques") + ": " + hits;
        if (el2 >= T) { j.done(1 - hits * 0.28, hits + " " + (g.hitsLabel || "toques")); return; }
        j.raf = requestAnimationFrame(step);
      };
      j.raf = requestAnimationFrame(n => { last = n; t0 = n; step(n); });
    },
    // cambiá de marcha cuando la aguja entra en la zona verde
    shift(el, g, done) {
      const j = base(el, g, done);
      const gears = g.gears || 5, sp = g.speed || 0.8, z = g.zone || [0.72, 0.88];
      el.innerHTML = `<div class="jg-rpm"><div class="jg-zone" style="left:${z[0] * 100}%;width:${(z[1] - z[0]) * 100}%"></div><div class="jg-fill"></div></div><p class="jg-info">${g.gearLabel || "Marcha"} <b class="jg-g">1</b> / ${gears}</p><button type="button" class="go-btn jg-act">${g.act || "⬆️ CAMBIO"}</button>`;
      const f = el.querySelector(".jg-fill"), gl = el.querySelector(".jg-g");
      let gear = 1, v = 0, last = performance.now(), sc = 0;
      const next = q => { sc += q; gear++; v = 0.25; if (gear > gears) { j.done(sc / gears, Math.round(sc / gears * 100) + "%"); return; } gl.textContent = gear; };
      const hit = () => { if (j.dead) return; const c = (z[0] + z[1]) / 2, w = (z[1] - z[0]) / 2; next(v < z[0] - 0.25 ? 0 : 1 - Math.max(0, Math.abs(v - c) - w * 0.3) / (w * 2.2)); };
      const step = now => { if (j.dead) return; v += (now - last) / 1000 * sp * (1 - gear * 0.06); last = now; if (v >= 1) { next(0.15); } f.style.width = Math.min(100, v * 100) + "%"; f.classList.toggle("red", v > z[1]); j.raf = requestAnimationFrame(step); };
      el.querySelector(".jg-act").onclick = hit; onKey(hit); j.raf = requestAnimationFrame(n => { last = n; step(n); });
    },
    // mantené el valor (temperatura, desgaste) dentro de la ventana
    win(el, g, done) {
      const j = base(el, g, done);
      const T = g.time || 7000, lo = g.lo || 0.5, hi = g.hi || 0.72;
      el.innerHTML = `<div class="jg-bar"><div class="jg-zone" style="left:${lo * 100}%;width:${(hi - lo) * 100}%"></div><div class="jg-mark"></div></div><p class="jg-info">${g.hint || "Mantené apretado para subir, soltá para bajar"} · <span class="jg-t"></span></p><button type="button" class="go-btn jg-act">${g.act || "🔥 EMPUJAR"}</button>`;
      const m = el.querySelector(".jg-mark"), tt = el.querySelector(".jg-t"), b = el.querySelector(".jg-act");
      let v = 0.2, on = false, inT = 0, t0 = performance.now(), last = t0, drift = 0;
      const down = () => { on = true; }, up = () => { on = false; };
      b.addEventListener("pointerdown", ev => { ev.preventDefault(); down(); }); b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up);
      onKey(down); onKey(up, true);
      const step = now => {
        if (j.dead) return; const dt = (now - last) / 1000; last = now;
        drift += dt; v += (on ? 0.42 : -0.3) * dt + Math.sin(drift * 3.1) * 0.04 * dt; v = clamp01(v);
        if (v >= lo && v <= hi) inT += dt * 1000;
        m.style.left = v * 100 + "%"; m.classList.toggle("ok", v >= lo && v <= hi);
        const left = T - (now - t0); tt.textContent = Math.max(0, left / 1000).toFixed(1) + "s";
        if (left <= 0) { const q = inT / (T - 1200); j.done(q, Math.round(clamp01(q) * 100) + "%"); return; }
        j.raf = requestAnimationFrame(step);
      };
      j.raf = requestAnimationFrame(n => { last = n; t0 = n; step(n); });
    },
    // largada: luces (o bandera antes de 1971)
    lights(el, g, done) {
      const j = base(el, g, done);
      const flag = yr() < 1971;
      el.innerHTML = flag ? `<div class="jg-flag">🏳️</div>` : `<div class="reaction-lights">${"<div class='reaction-light'></div>".repeat(5)}</div>`;
      el.insertAdjacentHTML("beforeend", `<p class="jg-info jg-msg">${flag ? "Esperá que baje la bandera…" : "Esperá que se apaguen las 5 luces…"}</p><button type="button" class="go-btn jg-act">${g.act || "🚀 ¡LARGAR!"}</button>`);
      const L = [...el.querySelectorAll(".reaction-light")], fl = el.querySelector(".jg-flag"), msg = el.querySelector(".jg-msg");
      let st = "wait", t0 = 0, n = 0;
      j.iv = setInterval(() => { n++; if (L[n - 1]) L[n - 1].classList.add("on"); if (n >= 5) { clearInterval(j.iv); j.to = setTimeout(() => { L.forEach(x => x.classList.remove("on")); if (fl) { fl.textContent = "🏁"; fl.classList.add("down"); } msg.textContent = "¡YA!"; st = "go"; t0 = performance.now(); j.to = setTimeout(() => j.done(0, "Te quedaste"), 1500); }, 700 + Math.random() * 2000); } }, flag ? 300 : 480);
      const hit = () => { if (st === "wait") { j.done(0, "Largada en falso"); return; } if (st === "go") { const rt = performance.now() - t0; j.done((480 - rt) / 300, Math.round(rt) + " ms"); } };
      el.querySelector(".jg-act").onclick = hit; onKey(hit);
    }
  };

  /* ---------- qué minijuegos tiene cada categoría según la época ---------- */
  function pools(kind, y) {
    const flagStart = y < 1971, hbox = y < 1990, paddles = y >= 1990;
    const P = {
      kart: {
        q: [
          { e: "seq", t: "🗺️ Aprendé el kartódromo", how: "Mirá el orden de las curvas y repetilo sin equivocarte.", len: 5 },
          { e: "tap", t: "🎯 Vértice de la horquilla", how: "Tocá justo cuando el kart pasa por el vértice (zona verde).", zone: [0.55, 0.66], dur: 1900, act: "↪️ DOBLAR" }
        ],
        r: [
          y < 1990 ? { e: "mash", t: "💪 Arranque a empujón", how: "En los kartódromos de antes el kart se arrancaba empujando: tocá rápido para que el motor prenda.", n: 18, time: 3500, act: "💪 EMPUJAR" }
                   : { e: "tap", t: "🚦 Largada lanzada", how: "Los karts largan en movimiento: acelerá justo cuando cruzás la línea verde.", zone: [0.7, 0.78], dur: 2000, act: "🔥 ACELERAR" },
          { e: "lanes", t: "🏎️ Primera vuelta en el pelotón", how: "Esquivá los karts que se tocan adelante.", obs: "🛻", time: 8500 },
          { e: "seq", t: "🧠 Defendé la punta", how: "Mirá por dónde te ataca en cada curva y repetí el orden para cubrirte.", len: 4 }
        ]
      },
      f4: {
        q: [
          { e: "shift", t: paddles ? "⚡ Cambios con levas" : "🕹️ Caja en H", how: "Cambiá de marcha cuando la aguja entra en la zona verde. Si llegás al corte, perdés tiempo.", gears: paddles ? 6 : 5, speed: paddles ? 0.9 : 0.7 },
          { e: "win", t: "🌡️ Vuelta de salida: calentá las gomas", how: "Mantené la temperatura de las gomas en la ventana verde hasta la vuelta lanzada.", lo: 0.48, hi: 0.68, act: "🔥 ZIGZAG" }
        ],
        r: [
          { e: "lights", t: flagStart ? "🏁 Largada con bandera" : "🚦 Largada", how: flagStart ? "Largá apenas baja la bandera. Si salís antes, te sancionan." : "Largá apenas se apagan las 5 luces." },
          { e: "lanes", t: "💨 Rebufo en la recta", how: "Pegate a los de adelante sin chocarlos: cambiá de carril a tiempo.", obs: "🏎️", speed: 0.7 },
          { e: "tap", t: "🛑 Frenada en la chicana", how: "Frená en el último metro posible (zona verde).", zone: [0.7, 0.78], dur: 1700, act: "🛑 FRENAR" }
        ]
      },
      f3: {
        q: [
          { e: "tap", t: "⏱️ Vuelta lanzada", how: "La frenada más importante de la vuelta: tocá justo en la zona verde, que es angosta.", zone: [0.66, 0.73], dur: 1800, act: "🛑 FRENAR" },
          y < 1985 ? { e: "shift", t: "🕹️ Caja en H", how: "Cambiá con cuidado: en esta época una marcha mal puesta rompía el motor.", gears: 4, speed: 0.65 }
                   : { e: "win", t: "🌡️ Gomas frías", how: "Calentá las gomas sin pasarte antes de la vuelta lanzada.", lo: 0.52, hi: 0.7, act: "🔥 ZIGZAG" }
        ],
        r: [
          { e: "hold", t: "🦶 Largada con embrague", how: "Mantené apretado para soltar el embrague y soltá en la zona verde: ni patinar ni quedarte.", zone: [0.58, 0.72], act: "🦶 EMBRAGUE" },
          { e: "lanes", t: y < 1985 ? "💨 Rebufo en Monza" : "🏎️ Pelotón de F3", how: "Muchos autos y todos al límite: esquivá los toques.", obs: "🏎️", speed: 0.8 },
          y >= 2017 ? { e: "tap", t: "🟢 DRS", how: "Abrí el DRS justo cuando estás a menos de un segundo (zona verde).", zone: [0.6, 0.72], dur: 1700, act: "🟢 ABRIR DRS" }
                    : { e: "seq", t: "🧠 Puntos de frenada", how: "Memorizá dónde frena el de adelante y repetilo para pasarlo.", len: 5 }
        ]
      },
      f2: {
        q: [
          { e: "tap", t: "⏱️ Vuelta de clasificación", how: "Una sola vuelta para la pole: frenada al límite.", zone: [0.68, 0.74], dur: 1650, act: "🛑 FRENAR" },
          { e: "shift", t: paddles ? "⚡ Cambios con levas" : "🕹️ Caja en H", how: "Cambios perfectos en la recta más larga.", gears: paddles ? 6 : 5, speed: paddles ? 1.0 : 0.75 }
        ],
        r: [
          { e: "hold", t: "🦶 Largada", how: "Soltá el embrague justo en la zona verde.", zone: [0.6, 0.72], act: "🦶 EMBRAGUE" },
          y >= 2005 ? { e: "mash", t: "🔧 Parada obligatoria", how: "Tu equipo cambia las 4 gomas: tocá rápido para ayudar a los mecánicos.", n: 24, time: 4000, act: "🔧 ¡RUEDA!" }
                    : { e: "lanes", t: "🛡️ Defendé la posición", how: "Te atacan por todos lados: cerrá los huecos.", obs: "🏎️", speed: 0.85 },
          { e: "win", t: "🛞 Gestión de gomas", how: "Ritmo constante: ni tan lento que te pasen, ni tan rápido que se gasten las gomas.", lo: 0.45, hi: 0.66, act: "🔥 EMPUJAR", hint: "Apretá para ir más rápido, soltá para cuidar" },
          y >= 2017 ? { e: "tap", t: "🟢 DRS en la recta", how: "Abrí el DRS a menos de un segundo del de adelante.", zone: [0.62, 0.72], dur: 1600, act: "🟢 ABRIR DRS" }
                    : { e: "lanes", t: "💨 Rebufo y pase", how: "Usá el rebufo y cambiá de carril para pasar.", obs: "🏎️", speed: 0.75 }
        ]
      }
    };
    return P[kind] || P.f2;
  }

  /* ---------- la carrera junior: clasificación + carrera ---------- */
  function play(box, stage, isLast) {
    const kind = typeof jrKind === "function" ? jrKind(stage, isLast) : "f2";
    const y = yr(), ri = s._juniorRaceIdx || 0, P = pools(kind, y);
    const gq = P.q[ri % P.q.length], gr = P.r[(ri + (ri >= P.r.length ? 1 : 0)) % P.r.length];
    const host = document.createElement("div"); host.className = "jg-card"; host.id = "jgCard";
    const ex = box.querySelector(".mini-explain");
    if (ex && ex.nextSibling) box.insertBefore(host, ex.nextSibling); else box.appendChild(host);
    let qQ = 0, qQd = "";
    const card = (phase, g, onDone) => {
      host.innerHTML = `<div class="jg-head"><span class="jg-ph">${phase}</span><b>${g.t}</b></div><p class="jg-how">${g.how}</p><div class="jg-stage"></div><button type="button" class="start-btn jg-start">▶ Empezar</button>`;
      host.querySelector(".jg-start").onclick = ev => { ev.currentTarget.remove(); ENG[g.e](host.querySelector(".jg-stage"), g, onDone); };
    };
    card("1 · CLASIFICACIÓN", gq, (q, d) => {
      qQ = q; qQd = d;
      const grid = Math.max(1, Math.round((1 - q) * 14) + 1);
      host.innerHTML = `<div class="jg-head"><span class="jg-ph">1 · CLASIFICACIÓN</span><b>${gq.t}</b></div><p class="jg-res">${q >= 0.85 ? "🔥" : q >= 0.5 ? "👍" : "😬"} ${d} · largás P${grid}</p><button type="button" class="start-btn jg-next">🏁 A la carrera</button>`;
      host.querySelector(".jg-next").onclick = () => card("2 · CARRERA", gr, (q2, d2) => {
        const tot = 0.35 * qQ + 0.65 * q2;
        const score = 610 - tot * 450;
        juniorRaceResult(score, gq.t.replace(/^\S+\s/, "") + ": " + qQd + " · " + gr.t.replace(/^\S+\s/, "") + ": " + d2);
      });
    });
  }

  const o = renderJuniorStep;
  window.renderJuniorStep = renderJuniorStep = function () {
    stop();
    const r = o.apply(this, arguments);
    try {
      const box = document.getElementById("juniorCareerBody");
      const sb = box && box.querySelector("#startMiniBtn");
      if (!sb || !/startJunior(Reaction|Braking)/.test(sb.getAttribute("onclick") || "")) return r;
      if (typeof juniorStep === "undefined" || juniorStep >= juniorStagesCache.length) return r;
      const stage = juniorStagesCache[juniorStep], isLast = juniorStep === juniorStagesCache.length - 1;
      box.querySelectorAll(".brake-track, .reaction-lights, #brakeHint, #reactionHint, #goBtn, #startMiniBtn").forEach(e => e.remove());
      play(box, stage, isLast);
    } catch (e) { console.error(e); }
    return r;
  };
  const ar = window.advanceJuniorRace;
  if (typeof ar === "function") window.advanceJuniorRace = advanceJuniorRace = function () { stop(); return ar.apply(this, arguments); };
})();
