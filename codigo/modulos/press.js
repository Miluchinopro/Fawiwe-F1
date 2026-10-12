/* =====================================================================================
   FAWIWE · PRENSA SEGÚN TU ROL Y TU RANGO
   Modo Ingeniero: te entrevistan como lo que sos (ingeniero de pista → director → presidente),
   nunca como piloto. Modo Piloto: las preguntas cambian si sos novato, establecido o estrella.
   ===================================================================================== */
const PRESS_ENG = [
  { // 0 · Ingeniero de Equipo / Ingeniero Jefe
    who: "INGENIERO DE PISTA", intro: "Te paran a la salida del box para hablar del trabajo técnico.",
    win: [["Como ingeniero, ¿qué decisión técnica definió la victoria en {gp}?", ["El setup y la lectura de la degradación de los neumáticos", "Nada, el piloto lo hizo todo solo", "Copiamos el setup de otro equipo", "Fue pura suerte"]],
      ["En {gp} te preguntan por la llamada a boxes que dio la victoria.", ["La tomamos con los datos de ritmo y del undercut", "La decidimos tirando una moneda", "No hubo ninguna llamada", "Fue un error que salió bien"]]],
    podium: [["¿Qué ajuste del auto marcó la diferencia para el podio en {gp}?", ["Bajar carga en el alerón para las rectas, según la telemetría", "Ninguno, el auto ya era perfecto", "Cambiamos todo sin probar", "No me corresponde hablar del auto"]],
      ["La prensa de {gp} pregunta si el podio fue mérito del box o del piloto.", ["De los dos: buen setup y buena ejecución en pista", "Solo del box", "Solo del piloto, nosotros no hicimos nada", "Prefiero no responder"]]],
    points: [["Sumaron puntos en {gp}. ¿Qué te dicen los datos?", ["Que perdimos tiempo en el sector lento: hay que ajustar la suspensión", "Que todo está perfecto", "Nada, no miro los datos", "Que es culpa del piloto"]],
      ["¿Se podría haber elegido otra estrategia de neumáticos en {gp}?", ["Sí, la revisamos: parar una vuelta antes nos daba aire limpio", "No, nunca nos equivocamos", "La estrategia no importa", "No sé qué neumáticos usamos"]]],
    none: [["Quedaron fuera de los puntos en {gp}. ¿Qué falló en lo técnico?", ["El balance del auto: corregimos el setup para la próxima", "Nada, fue culpa del piloto", "No sabemos y no vamos a investigar", "El auto no tiene arreglo"]],
      ["En {gp} hubo problemas en boxes. ¿Qué cambiarías?", ["Practicar las paradas y ordenar la comunicación por radio", "Echar a todos los mecánicos", "Nada, fue mala suerte", "No responder"]]],
    role: [["Como ingeniero de pista, ¿qué le pedís a tu piloto por radio cuando se gastan las gomas?", ["Que cuide las salidas de curva y la temperatura", "Que vaya a fondo igual", "Que entre a boxes ya mismo, siempre", "Nada, no hablo por radio"]],
      ["¿Te gustaría ser jefe del equipo algún día?", ["Paso a paso: primero hacer bien mi trabajo en el box", "Sí, mañana mismo", "No, odio este trabajo", "Ya debería serlo"]],
      ["¿Cómo trabajás con los mecánicos durante el fin de semana?", ["Con datos claros y escuchando lo que ven en el auto", "Les grito hasta que salga", "No hablo con ellos", "Que hagan lo que quieran"]]]
  },
  { // 1 · Director Deportivo / Jefe de Escudería
    who: "DIRECTOR DEL EQUIPO", intro: "La prensa busca al director para hablar del equipo y de los pilotos.",
    win: [["Como director, ¿qué te llevás de la victoria en {gp}?", ["Que la organización funcionó: estrategia, pilotos y fábrica alineados", "Que somos invencibles", "Que ya no hace falta mejorar", "Nada, fue suerte"]],
      ["¿Hubo órdenes de equipo en {gp}?", ["Dejamos correr hasta el final y priorizamos el resultado del equipo", "Sí, siempre sacrificamos a uno sin explicar", "Los pilotos hacen lo que quieren", "No voy a contestar"]]],
    podium: [["En {gp} preguntan si van a traer mejoras para pelear la victoria.", ["Sí, hay un paquete planificado con los datos del túnel de viento", "No, así estamos bien", "Vamos a cambiar todo el auto de golpe", "No hay plata"]],
      ["¿Cómo manejás la pelea entre tus dos pilotos después del podio en {gp}?", ["Reglas claras: libertad para pelear, pero sin tocarse", "Que se arreglen solos", "Favorezco siempre al mismo", "Prefiero no hablar"]]],
    points: [["¿El equipo está donde esperabas después de {gp}?", ["Estamos sumando, pero el objetivo es dar el salto con las mejoras", "Sí, ya cumplimos todo", "No, es un desastre", "No tengo objetivos"]],
      ["Se rumorea que buscás un piloto nuevo después de {gp}. ¿Es verdad?", ["Siempre miramos el mercado, pero confiamos en nuestros pilotos", "Sí, echo a uno mañana", "No sé de qué me hablás", "Lo decido acá en la prensa"]]],
    none: [["Otra carrera sin puntos en {gp}. ¿Peligra tu puesto?", ["Asumo la responsabilidad y tenemos un plan para reaccionar", "No, la culpa es de todos menos mía", "Renuncio ya mismo", "Sin comentarios"]],
      ["¿Vas a hacer cambios en el equipo técnico después de {gp}?", ["Primero analizar los datos y después decidir con calma", "Echar a todos hoy mismo", "Nada va a cambiar nunca", "Que decida la prensa"]]],
    role: [["¿Cómo está el mercado de pilotos? ¿Negociás con otros jefes de equipo?", ["Hablamos con todos, pero las negociaciones se hacen en privado", "Sí, y les voy a robar a sus pilotos", "No hablo con nadie", "Contrato al que me digan"]],
      ["¿Qué importancia tiene el desarrollo del auto a esta altura de la temporada?", ["Mucha: las ventanas de mejoras deciden el campeonato", "Ninguna", "Solo importa el piloto", "Ya no se puede mejorar"]],
      ["¿Cómo es tu relación con la dirección del equipo?", ["Buena: les presento objetivos claros y resultados", "Mala, no me importan", "No los conozco", "Hago lo que quiero"]]]
  },
  { // 2 · Presidente del Equipo / de Élite / Leyenda
    who: "PRESIDENTE DEL EQUIPO", intro: "Conferencia de prensa del presidente: el proyecto, los sponsors y el futuro.",
    win: [["Como presidente, ¿qué significa esta victoria en {gp} para el proyecto?", ["Que la inversión a largo plazo está dando frutos", "Que ya no hace falta invertir más", "Que el mérito es solo mío", "Nada"]],
      ["Después de {gp}, ¿ya pensás en el campeonato de constructores?", ["Es el objetivo, pero se gana carrera a carrera", "Ya lo ganamos", "No me interesa", "Prefiero no opinar"]]],
    podium: [["¿Los sponsors están contentos con el podio en {gp}?", ["Sí: más visibilidad, y eso nos deja invertir más", "Los sponsors no importan", "No sé quiénes son nuestros sponsors", "Les vamos a cobrar el doble"]],
      ["¿Qué le decís a los inversores después de {gp}?", ["Que el proyecto crece y el plan se está cumpliendo", "Que pongan más plata ya", "Nada, no les debo explicaciones", "Que se vayan"]]],
    points: [["¿El presupuesto alcanza para pelear arriba después de {gp}?", ["Lo vamos a usar mejor: más desarrollo y más fábrica", "Sí, sobra", "No, cerramos el equipo", "No sé cuánto tenemos"]],
      ["Con los puntos de {gp}, ¿qué le decís a la directiva?", ["Que vamos en camino, y les explico los próximos pasos", "Que no me molesten", "Que la culpa es de los pilotos", "Nada"]]],
    none: [["¿Hay crisis en el equipo después de {gp}?", ["Es un mal momento, pero el proyecto tiene rumbo y respaldo", "Sí, todo está perdido", "No, todo es perfecto", "Sin comentarios"]],
      ["¿Van a cambiar al director deportivo después de {gp}?", ["Decidimos con datos y con calma, no por un resultado", "Sí, lo echo hoy", "Que lo decidan los hinchas", "No sé quién es"]]],
    role: [["¿Cómo ves las nuevas reglas que vienen para la F1?", ["Una oportunidad: ya hay gente trabajando en el próximo auto", "Un desastre, nos vamos", "No las leí", "No me importan"]],
      ["¿El equipo puede ser campeón en los próximos años?", ["Ese es el plan: fábrica, pilotos y talento joven de la academia", "Ya somos los mejores de la historia", "Imposible", "No sé"]],
      ["¿Venderías el equipo si llega una buena oferta?", ["No está en venta: estamos construyendo algo a largo plazo", "Sí, al mejor postor", "Mañana mismo", "Sin comentarios"]]]
  }
];
const PRESS_DRV_ROLE = [
  { who: "PILOTO NOVATO", role: [["Sos de los más jóvenes de la parrilla: ¿qué aprendiste en {gp}?", ["A escuchar al ingeniero y a cuidar las gomas", "Nada, ya sé todo", "Que el auto es malo", "No sé"]],
    ["¿Sentís presión por mantener tu asiento?", ["Sí, pero me enfoco en mejorar carrera a carrera", "No, el asiento es mío para siempre", "Mucha, me quiero ir", "No me importa"]],
    ["¿Cómo es correr al lado de pilotos con tanta experiencia?", ["Un aprendizaje: miro sus datos y mejoro", "Les tengo miedo", "Son todos lentos", "No los miro"]]] },
  { who: "PILOTO ESTABLECIDO", role: [["Ya sos un piloto establecido: ¿qué te falta para pelear el título?", ["Constancia, y que el auto dé el paso con las mejoras", "Nada, el título ya es mío", "Un equipo nuevo, este no sirve", "Suerte"]],
    ["Se habla de tu renovación de contrato. ¿Qué podés decir?", ["Mi representante habla con el equipo; yo me enfoco en correr", "Me voy si no me pagan el doble", "Ya firmé con otro equipo", "Pregúntenle al equipo"]],
    ["¿Qué rol querés tener en el equipo?", ["Ser referencia técnica y ayudar a desarrollar el auto", "Que el otro piloto me obedezca", "Ninguno, solo manejar", "El que me den"]]] },
  { who: "ESTRELLA DE LA F1", role: [["Sos una de las estrellas de la F1: ¿cómo manejás la presión de los medios?", ["Con calma: hablo en la pista y respeto a todos", "Ignoro a la prensa", "Me quejo de todo", "No doy entrevistas"]],
    ["¿Qué legado querés dejar en la F1?", ["Ganar limpio y ayudar a los pilotos jóvenes", "Que nadie me supere nunca", "Ninguno", "Hacer plata"]],
    ["¿Pensás en el retiro?", ["Mientras tenga ganas y nivel, sigo compitiendo", "Mañana mismo", "Nunca, voy a correr hasta los 80", "No contesto eso"]]] }
];
function pressTierGroup() { const t = (typeof tierIndex === "function") ? tierIndex() : 0; return t <= 1 ? 0 : t <= 3 ? 1 : 2; }
function pressMake(item, gpName, seedStr) {
  const sh = shuffleKeepCorrect(item[1], 0, seedStr);
  return { q: item[0].replace(/\{gp\}/g, gpName), opts: sh.opts, correct: sh.correct };
}
(function () {
  const o = window.pickPressQuestions;
  if (typeof o !== "function") return;
  window.pickPressQuestions = function (category, gpName, nextGpName, pos2) {
    const qs = o.apply(this, arguments);
    try {
      const g = pressTierGroup();
      const seed = "_" + s.gp + "_" + s.season;
      const rivalQ = Object.keys(s.rivalries || {}).some(n => qs[2] && qs[2].q.indexOf(n) >= 0);
      if (s.playerMode === "driver") {
        const R = PRESS_DRV_ROLE[g].role;
        if (!rivalQ && qs[2]) qs[2] = pressMake(R[deterministicHash("drvrole" + seed) % R.length], gpName, "drvrole_o" + seed);
      } else {
        const P = PRESS_ENG[g];
        const pool = P[category] || P.points;
        qs[0] = pressMake(pool[deterministicHash("engres" + category + seed) % pool.length], gpName, "engres_o" + seed);
        if (!rivalQ && qs[2]) qs[2] = pressMake(P.role[deterministicHash("engrole" + seed) % P.role.length], gpName, "engrole_o" + seed);
        else if (rivalQ && qs[2]) qs[2].q = qs[2].q.replace("¿Qué sentiste al cruzarte con", "¿Cómo vivió el equipo el cruce con").replace("es tu rival de verdad", "es el gran rival de tu equipo");
      }
    } catch (e) { console.warn(e); }
    return qs;
  };
})();
(function () {
  const o = window.showPress;
  if (typeof o !== "function") return;
  window.showPress = function (pos, pts, pos2) {
    const r = o.apply(this, arguments);
    try {
      const g = pressTierGroup();
      const rk = (s.playerMode === "driver" && typeof driverRankName === "function") ? driverRankName() : rank()[0];
      const kicker = document.querySelector("#pressOverlay .press-kicker");
      const body = document.getElementById("pressBody");
      if (s.playerMode === "driver") {
        if (kicker) kicker.textContent = "📰 PRENSA POST-CARRERA · " + PRESS_DRV_ROLE[g].who + " · " + String(rk).toUpperCase();
      } else {
        const P = PRESS_ENG[g];
        if (kicker) kicker.textContent = "📰 PRENSA POST-CARRERA · ENTREVISTA AL " + P.who + " · " + String(rk).toUpperCase();
        if (body) {
          const res = pos === 1 ? "Tu piloto ganó en " : pos <= 3 ? "Tu piloto hizo podio (P" + pos + ") en " : pts > 0 ? "Tu piloto terminó P" + pos + " y sumó puntos en " : "Tu piloto terminó P" + pos + ", fuera de los puntos, en ";
          const gp = (trackData[s.gp] || {}).name || "el Gran Premio";
          body.textContent = P.intro + " " + res + gp + "." + (pos2 !== null && pos2 !== undefined ? " Tu segundo piloto fue P" + pos2 + "." : "");
        }
      }
    } catch (e) { console.warn(e); }
    return r;
  };
})();

/* ---------- carteles de resultado en Modo Ingeniero: hablan de TU PILOTO, no de vos ---------- */
function pressMainDriver() { try { const l = myTeamLineup(); return (l[0] && l[0].name) || "Tu piloto"; } catch (e) { return "Tu piloto"; } }
(function () {
  const o = window.raceMessage;
  if (typeof o === "function") window.raceMessage = function (pos, pts, status) {
    if (s.playerMode === "driver" || s.player2) return o.apply(this, arguments);
    const n = pressMainDriver();
    if (status === "DNS") return { title: "🚑 " + n.toUpperCase() + " NO LARGÓ", sub: "Un problema antes del semáforo dejó afuera a " + n + ". Cero puntos para él y a revisar qué pasó en el box.", cls: "nopoints" };
    if (status === "DNF") return { title: "💥 ABANDONO DE " + n.toUpperCase(), sub: "El auto de " + n + " no aguantó hasta la bandera a cuadros. Cero puntos: toca revisar la confiabilidad.", cls: "nopoints" };
    if (pos === 1) return { title: "🏆 ¡VICTORIA DEL EQUIPO!", sub: n + " ganó y suma +" + pts + " puntos. El box explota: el setup y la estrategia funcionaron.", cls: "win" };
    if (pos <= 3) return { title: "🏆 ¡PODIO PARA EL EQUIPO!", sub: n + " terminó P" + pos + " y suma +" + pts + " puntos. Champagne en el garaje y la directiva sonríe.", cls: "podium" };
    if (pts > 0) return { title: "P" + pos + " · EN LOS PUNTOS", sub: n + " sumó +" + pts + (pts === 1 ? " punto" : " puntos") + " para el equipo. Domingo sólido: la estrategia funcionó y la directiva toma nota.", cls: "points" };
    return { title: "P" + pos + " · FUERA DE LOS PUNTOS", sub: n + " terminó P" + pos + ": fuera del top 10, cero puntos para él. A revisar setup y estrategia antes del próximo GP.", cls: "nopoints" };
  };
  const sb = window.showBigResult;
  if (typeof sb === "function") window.showBigResult = function (kicker, title, sub) {
    const a = [].slice.call(arguments);
    if (s.playerMode !== "driver" && !s.player2 && typeof a[2] === "string") {
      a[2] = a[2].replace(/ · Compañero: /g, " · Segundo piloto: ")
        .replace("No pasaste a Q2. Hay que encontrar ritmo el sábado que viene.", "Tu piloto no pasó a Q2: hay que encontrar ritmo con el setup.")
        .replace("Cerca de la Q3, pero el corte te dejó afuera.", "Cerca de la Q3, pero el corte lo dejó afuera.")
        .replace("Primera caja el domingo. La Q3 fue perfecta.", "¡Tu piloto larga primero! El setup de clasificación fue perfecto.")
        .replace("Estás en la pelea de la última tanda.", "Tu piloto está en la pelea de la última tanda.");
    }
    return sb.apply(this, a);
  };
})();
