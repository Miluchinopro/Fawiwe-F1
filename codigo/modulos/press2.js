/* =====================================================================================
   FAWIWE · MÁS VARIEDAD EN LAS ENTREVISTAS (los dos modos)
   - Muchas más preguntas por rol, rango y resultado.
   - Preguntas según lo que pasó: lluvia, Safety Car, sanciones, abandono, última fecha.
   - No repite preguntas hasta agotar el banco (recuerda las últimas).
   Formato: [pregunta, [CORRECTA, mal, mal, mal]] — las opciones se mezclan al mostrarse.
   ===================================================================================== */
const PX_ENG = [
  { // Ingeniero de pista
    win: [["¿Cuándo supiste en {gp} que la carrera era tuya?", ["Cuando vimos en la telemetría que el ritmo con gomas usadas era el mejor", "Desde el viernes, nunca dudé", "Cuando el rival chocó solo", "No lo supe nunca"]],
      ["En {gp} la parada fue clave. ¿Qué la hizo tan rápida?", ["Mucha práctica de los mecánicos y una llamada en el momento justo", "Suerte pura", "Nos salteamos los controles de seguridad", "Fue lenta, pero ganamos igual"]],
      ["¿Qué le dijiste a tu piloto en la última vuelta de {gp}?", ["Que mantuviera el ritmo y cuidara los pianos hasta el final", "Que fuera a fondo y se arriesgara", "Nada, apagué la radio", "Que frenara para no gastar el auto"]],
      ["¿El auto estaba tan bien como parecía en {gp}?", ["Sí, el setup del viernes encajó con las condiciones del domingo", "No, ganamos de casualidad", "El auto es malo, el piloto es un genio", "No miro esas cosas"]]],
    podium: [["¿Qué faltó para ganar en {gp}?", ["Un poco de tracción en las curvas lentas: ya sabemos qué ajustar", "Nada, el podio es lo máximo que podemos", "Un piloto mejor", "Que llueva"]],
      ["¿La estrategia de una parada fue la correcta en {gp}?", ["Sí, los datos de degradación lo justificaban", "No sé, la eligió otro", "La cambiamos tirando una moneda", "No hubo estrategia"]],
      ["¿Cómo resolvieron el problema de frenos del viernes en {gp}?", ["Cambiamos la refrigeración y ajustamos el balance de frenada", "No lo resolvimos, rezamos", "Le dijimos al piloto que no frenara", "¿Qué problema?"]],
      ["Tu piloto elogió el auto en {gp}. ¿Qué respondés?", ["Que es mérito de todo el equipo de ingeniería y de la fábrica", "Que es todo mérito mío", "Que exagera", "Nada"]]],
    points: [["¿Qué aprendieron del ritmo de carrera en {gp}?", ["Que perdemos en las salidas lentas: lo vamos a trabajar en el simulador", "Nada nuevo", "Que el auto no tiene arreglo", "Que hay que copiar a otro equipo"]],
      ["¿Por qué tardó tanto la parada en {gp}?", ["Una tuerca trabada; ya revisamos el procedimiento con los mecánicos", "Los mecánicos estaban distraídos, los voy a echar", "No tardó nada", "No sé"]],
      ["¿El viento cambió el comportamiento del auto en {gp}?", ["Sí, nos movió el balance y el piloto se adaptó con el diferencial", "No existe el viento en la F1", "No nos dimos cuenta", "Prefiero no responder"]],
      ["¿Cuánto les aportaron las mejoras nuevas en {gp}?", ["Algo, pero todavía estamos entendiendo cómo sacarles el máximo", "Muchísimo, ya somos los más rápidos", "Nada, fueron plata tirada", "No trajimos nada"]]],
    none: [["¿Se equivocaron con la elección de gomas en {gp}?", ["Sí, y lo asumo: leímos mal la temperatura de la pista", "No, fue culpa del piloto", "Las gomas eran todas iguales", "No hablo de gomas"]],
      ["¿El auto tenía algún problema técnico en {gp}?", ["Hubo una pérdida de carga aerodinámica que estamos analizando", "No, el auto es perfecto", "Muchos, pero no los vamos a arreglar", "No sé"]],
      ["Tu piloto se quejó por radio en {gp}. ¿Qué le contestás?", ["Que tiene razón en parte y que lo vamos a trabajar juntos", "Que deje de llorar", "Nada, lo ignoro", "Que se busque otro equipo"]],
      ["¿Qué vas a hacer distinto en la próxima práctica después de {gp}?", ["Más vueltas largas para entender la degradación", "Nada, lo mismo", "Saltear las prácticas", "Cambiar todo el auto sin probar"]]],
    role: [["¿Cuántas horas trabajás un fin de semana de carrera?", ["Muchas, pero con un plan: el descanso también es parte del rendimiento", "Ninguna, delego todo", "Las 24 horas sin dormir, siempre", "No llevo la cuenta"]],
      ["¿Qué te gusta más de ser ingeniero de pista?", ["Convertir los datos en décimas de segundo en la pista", "Salir en la tele", "Gritarle al piloto", "Nada"]],
      ["¿Cómo te llevás con el simulador del equipo?", ["Es clave: probamos setups antes de llegar al circuito", "No lo uso, es un juego", "Lo uso para jugar en los ratos libres", "No sé dónde está"]],
      ["¿Qué consejo le darías a alguien que quiere ser ingeniero de F1?", ["Estudiar mucho, trabajar en equipo y aprender de cada error", "Que se olvide, es imposible", "Que se haga piloto mejor", "Ninguno"]],
      ["¿Te llevás bien con los otros ingenieros del paddock?", ["Hay respeto: en la pista somos rivales, afuera colegas", "No hablo con nadie", "Los odio a todos", "Les copio todo"]]]
  },
  { // Director deportivo / jefe de escudería
    win: [["¿Esta victoria en {gp} cambia los objetivos del año?", ["Nos da confianza, pero el plan sigue: carrera a carrera", "Ahora vamos por todo, el título es nuestro", "No, fue de casualidad", "No tenemos objetivos"]],
      ["¿Hubo tensión en el muro de boxes durante {gp}?", ["Hubo decisiones difíciles, pero las tomamos juntos y con datos", "Sí, casi nos peleamos", "Yo decidí todo solo", "No me acuerdo"]],
      ["¿Qué le dijiste al equipo después de ganar en {gp}?", ["Que disfruten esta noche y mañana volvemos a trabajar", "Que se tomen un mes de vacaciones", "Nada, no hablé", "Que el mérito es mío"]],
      ["Los rivales dicen que tu auto es ilegal tras {gp}. ¿Qué respondés?", ["Que pasamos todos los controles de la FIA y estamos tranquilos", "Que se callen", "Que sí, pero no nos van a agarrar", "Sin comentarios"]]],
    podium: [["¿El podio en {gp} confirma que el equipo va en la dirección correcta?", ["Sí: estrategia, pilotos y desarrollo están alineados", "No, fue suerte", "Ya estamos en lo más alto", "No lo sé"]],
      ["¿Vas a usar órdenes de equipo para ayudar a un piloto a pelear el título?", ["Si las matemáticas lo piden, sí, y lo explicaremos a los dos", "Nunca, que se maten en la pista", "Siempre, desde la primera fecha", "No respondo"]],
      ["Otro equipo quiere a tu piloto después de {gp}. ¿Qué hacés?", ["Tiene contrato y está feliz acá; nos enfocamos en el auto", "Lo vendo al mejor postor", "No sabía", "Que se vaya"]],
      ["¿Te preocupa el desgaste de motores después de {gp}?", ["Lo controlamos: tenemos un plan de unidades para todo el año", "No, los motores duran para siempre", "Sí, vamos a romper todos", "No sé cuántos usamos"]]],
    points: [["¿El equipo puede pelear el podio en {nextgp}?", ["Si damos el paso con el setup, podemos estar cerca", "Ganamos seguro", "Imposible", "No me importa"]],
      ["¿Hay que cambiar algo en la estrategia del equipo tras {gp}?", ["Ajustar detalles: ser más agresivos con el undercut", "Cambiar todo", "Nada, somos perfectos", "No sé qué es una estrategia"]],
      ["¿Cómo está la relación entre tus dos pilotos después de {gp}?", ["Competitiva pero sana: hay reglas claras", "Se odian y está bien así", "No sé, no les hablo", "Uno se va mañana"]],
      ["¿Cómo usan los datos del piloto de reserva después de {gp}?", ["Su trabajo en el simulador nos ayuda con el setup", "No tenemos reserva", "Para nada", "No sé quién es"]]],
    none: [["¿El equipo está en crisis después de {gp}?", ["Es un mal resultado, no una crisis: tenemos un plan", "Sí, se viene todo abajo", "No, ganamos en realidad", "Sin comentarios"]],
      ["¿Pensás despedir a algún piloto después de {gp}?", ["No; vamos a revisar todo con datos antes de decidir nada", "Sí, mañana", "A los dos", "Que decidan los hinchas"]],
      ["¿Qué falló en la comunicación del equipo en {gp}?", ["La llamada a boxes llegó tarde: vamos a ordenar el protocolo", "Nada, fue el piloto", "No hablamos por radio", "No sé"]],
      ["¿Qué le decís a los hinchas después de {gp}?", ["Que entendemos su enojo y vamos a responder en la pista", "Que no entienden nada", "Nada", "Que se busquen otro equipo"]]],
    role: [["¿Cómo elegís a los pilotos jóvenes de la academia?", ["Por talento, actitud y cómo aprenden de los datos", "Por quién tiene más seguidores", "Al azar", "No tenemos academia"]],
      ["¿Qué es lo más difícil de dirigir un equipo de F1?", ["Mantener a cientos de personas alineadas con el mismo objetivo", "Nada, es fácil", "Levantarme temprano", "Hablar con la prensa"]],
      ["¿Cómo negociás con otros jefes de equipo un fichaje?", ["Con respeto y en privado: primero perfilo al piloto y después ofrezco", "Les grito hasta que acepten", "Por redes sociales", "No negocio"]],
      ["¿Qué pensás del límite de presupuesto?", ["Obliga a ser más eficientes: cada peso tiene que sumar rendimiento", "Hay que eliminarlo", "No lo respetamos", "No sé qué es"]],
      ["¿Cuál es tu objetivo para los próximos dos años?", ["Pelear el campeonato de constructores con un auto propio fuerte", "Ser famoso", "Ninguno", "Irme a otro equipo"]]]
  },
  { // Presidente
    win: [["¿Esta victoria en {gp} atrae más sponsors?", ["Sí, y eso nos permite invertir más en el auto y en la gente", "Ya tenemos demasiados", "Los sponsors no importan", "No sé"]],
      ["¿Qué sentiste al ver ganar a tu equipo en {gp}?", ["Orgullo por todas las personas que trabajan en la fábrica", "Que todo es gracias a mí", "Nada", "Alivio porque iba a vender el equipo"]],
      ["¿Vas a renovar al director deportivo después de {gp}?", ["Su trabajo habla solo; vamos a hablar del futuro con calma", "No, lo echo igual", "No sé quién es", "Sin comentarios"]],
      ["¿El proyecto está adelantado a lo que planearon?", ["Vamos bien, pero el objetivo es sostenerlo varios años", "Ya terminamos, somos los mejores", "No hay proyecto", "Prefiero no hablar"]]],
    podium: [["¿El podio en {gp} justifica la inversión en la fábrica nueva?", ["Sí: el túnel de viento y el simulador ya se notan en la pista", "No, fue plata tirada", "No tenemos fábrica", "No sé"]],
      ["¿Hay interés de una marca de autos en comprar el equipo después de {gp}?", ["Hay interés, pero el proyecto no está en venta", "Sí, lo vendo mañana", "No sé de qué me hablás", "Sin comentarios"]],
      ["¿Qué le dijiste a los empleados después de {gp}?", ["Que este podio es de todos, desde la fábrica hasta el box", "Nada", "Que trabajen más", "Que el mérito es mío"]],
      ["¿Cómo ves la pelea de constructores después de {gp}?", ["Abierta: cada punto cuenta y vamos a pelear hasta el final", "Ya la ganamos", "Perdida", "No me interesa"]]],
    points: [["¿El equipo está cumpliendo el plan de negocios después de {gp}?", ["Sí: crecen los ingresos y el rendimiento acompaña", "No, estamos en quiebra", "No tenemos plan", "No sé"]],
      ["¿Vas a invertir más en la academia de pilotos después de {gp}?", ["Sí: el talento propio es el futuro del equipo", "No, es plata perdida", "No tenemos academia", "Ya invertimos demasiado"]],
      ["¿Qué le pedís al equipo para la segunda mitad del año?", ["Consistencia y aprovechar cada ventana de mejoras", "Ganar todas las carreras", "Nada", "Que no gasten plata"]],
      ["¿Cómo te afecta el resultado de {gp} con los inversores?", ["Les muestro datos: el proyecto crece aunque haya fines de semana normales", "Les miento", "No les hablo", "Me van a echar"]]],
    none: [["¿Pensás vender el equipo después de {gp}?", ["No: un mal domingo no cambia un proyecto de largo plazo", "Sí, al primero que pase", "Mañana mismo", "Sin comentarios"]],
      ["¿Los sponsors amenazan con irse después de {gp}?", ["Hablamos seguido con ellos y entienden el plan", "Sí, y que se vayan", "No sé quiénes son", "No me importa"]],
      ["¿Vas a cambiar a toda la dirección después de {gp}?", ["No; los cambios se deciden con calma y con datos", "Sí, a todos hoy", "Que decidan los hinchas", "No sé"]],
      ["¿Cuál es el mensaje para los hinchas después de {gp}?", ["Que el equipo va a responder y que el proyecto sigue firme", "Que dejen de quejarse", "Nada", "Que se vayan a otro equipo"]]],
    role: [["¿Por qué decidiste presidir un equipo de F1?", ["Por pasión y para construir algo que dure muchos años", "Por la plata", "Me obligaron", "No sé"]],
      ["¿Qué lugar ocupa la sustentabilidad en tu equipo?", ["Es parte del plan: combustibles sostenibles y menos emisiones", "Ninguno", "No me importa", "No sé qué es"]],
      ["¿Cómo elegís a tus socios comerciales?", ["Que compartan valores y le sumen al proyecto", "El que pague más", "Al azar", "No tengo"]],
      ["¿Te gustaría que el equipo tenga su propio motor algún día?", ["Es un sueño a largo plazo; primero hay que ser fuertes con el chasis", "Mañana mismo", "Nunca", "No sé qué es un motor"]],
      ["¿Qué legado querés dejar como presidente?", ["Un equipo campeón, sano y que forme talento propio", "Que se acuerden de mí", "Ninguno", "Plata"]]]
  }
];
const PX_DRV = [
  { // novato
    win: [["¡Primera gran victoria en {gp}! ¿Lo podés creer?", ["Todavía no: es el trabajo de todo el equipo hecho realidad", "Sí, siempre supe que era el mejor", "No, fue suerte", "Me da igual"]],
      ["¿Qué le dijiste a tu familia después de ganar en {gp}?", ["Que gracias por todo el sacrificio de estos años", "Nada", "Que ahora soy famoso", "Que me dejen tranquilo"]],
      ["¿Tuviste nervios en la largada de {gp}?", ["Un poco, pero me concentré en mi rutina", "Ninguno, nunca tengo nervios", "Muchísimos, casi me bajo", "No me acuerdo"]],
      ["¿Qué vas a aprender de esta victoria en {gp}?", ["Cómo cuidé las gomas en el último stint", "Nada, ya sé todo", "Que ganar es fácil", "No pienso aprender nada"]]],
    podium: [["Primer podio en {gp}: ¿qué sentiste arriba?", ["Una felicidad enorme y ganas de ganar la próxima", "Nada especial", "Que me merezco más", "Frío"]],
      ["¿Qué te dijo tu ingeniero por radio en {gp}?", ["Que mantuviera la calma y cuidara las gomas", "Nada, no lo escucho", "Que frenara", "Que soy el peor"]],
      ["¿El podio te da más confianza para {nextgp}?", ["Sí, pero sin relajarme: cada carrera es distinta", "Ya gané {nextgp} seguro", "No, me da miedo", "Me da igual"]],
      ["¿Cómo te llevaste con los pilotos experimentados en la pelea de {gp}?", ["Fue duro pero limpio; aprendí mucho", "Les gané a todos fácil", "Me chocaron a propósito", "No los vi"]]],
    points: [["Tus primeros puntos en {gp}: ¿cómo los festejás?", ["Con el equipo, y mañana a estudiar los datos", "Con una fiesta de una semana", "No los festejo, son pocos", "Comprándome un auto"]],
      ["¿Te costó adaptarte al auto en {gp}?", ["Al principio sí, pero cada vuelta lo entendí mejor", "No, el auto se adapta a mí", "Sí, es imposible de manejar", "No sé"]],
      ["¿Qué te falta para pelear más adelante?", ["Experiencia en las largadas y en la gestión de gomas", "Nada", "Un auto mejor, nada más", "Suerte"]],
      ["¿Qué tal la pelea con tu rival en {gp}?", ["Muy linda, al límite pero respetándonos", "Lo voy a chocar la próxima", "No me importa", "No había rival"]]],
    none: [["¿Qué te pasó en {gp}?", ["Cometí un error en la largada y lo voy a corregir", "Nada, el auto es malo", "Me chocaron todos", "No quiero hablar"]],
      ["¿Sentís que el equipo confía en vos después de {gp}?", ["Sí, y voy a responder con trabajo", "No, me quieren echar", "No me importa", "No sé"]],
      ["¿Cómo te recuperás de un mal día como {gp}?", ["Descansando, mirando los datos y entrenando", "Enojándome con todos", "No me recupero", "Comprándome algo"]],
      ["¿Le pediste disculpas al equipo después de {gp}?", ["Sí, mi error les costó puntos y lo asumo", "No, fue culpa de ellos", "¿Para qué?", "No hablé con nadie"]]],
    role: [["¿Quién es tu ídolo en la F1?", ["Admiro a muchos, pero quiero escribir mi propia historia", "Yo mismo", "Nadie", "No miro F1"]],
      ["¿Cómo es tu entrenamiento físico?", ["Todos los días: cuello, cardio y reflejos", "No entreno", "Solo juego videojuegos", "Una vez por año"]],
      ["¿Usás mucho el simulador?", ["Sí, me ayuda a aprender los circuitos nuevos", "Nunca", "Solo para jugar online", "No sé qué es"]],
      ["¿Qué es lo más difícil de llegar a la F1?", ["La presión: cada carrera es un examen", "Nada, fue fácil", "Hablar con la prensa", "Despertarse temprano"]],
      ["¿Cómo manejás las redes sociales?", ["Con cuidado: lo importante es lo que hago en la pista", "Peleándome con todos", "No tengo", "Publico cada minuto"]]]
  },
  { // establecido
    win: [["¿Esta victoria en {gp} te pone en la pelea por el título?", ["Estamos ahí, pero falta mucho: carrera a carrera", "El título ya es mío", "No, imposible", "No me importa"]],
      ["¿Cuál fue la clave del triunfo en {gp}?", ["La estrategia y una gran parada del equipo", "Solo mi talento", "La suerte", "El auto, yo no hice nada"]],
      ["¿Le dedicás la victoria de {gp} a alguien?", ["A todo el equipo que trabaja en la fábrica", "A mí mismo", "A nadie", "Al rival que se rompió"]],
      ["¿Cómo manejaste la presión del auto de atrás en {gp}?", ["Con calma: sin errores y cuidando las gomas", "Lo ignoré", "Casi me equivoco", "No había nadie atrás"]]],
    podium: [["¿El podio en {gp} sabe a poco?", ["Un poco, pero suma muchísimo para el campeonato", "Sí, es una vergüenza", "No, es lo máximo que puedo", "No sé"]],
      ["¿Qué le pediste al equipo para pelear la victoria?", ["Un poco más de ritmo en clasificación; están trabajando", "Que me den el auto del compañero", "Nada", "Que despidan al ingeniero"]],
      ["¿Cómo fue la pelea por el podio en {gp}?", ["Dura y limpia: así tiene que ser", "Me tiraron afuera", "Fácil", "Aburrida"]],
      ["¿Pensás en cambiar de equipo después de {gp}?", ["Estoy enfocado acá; mi representante se ocupa del resto", "Sí, me voy mañana", "Ya firmé con otro", "Depende de la plata"]]],
    points: [["¿Te conformás con estos puntos en {gp}?", ["Suman, pero quiero más; vamos a mejorar", "Sí, con esto alcanza", "No sirven de nada", "No miro los puntos"]],
      ["¿Qué tan bien estaba el auto en {gp}?", ["Bien en curvas rápidas, nos falta en las lentas", "Perfecto", "Horrible", "No sé"]],
      ["¿Cómo te llevás con tu ingeniero de pista?", ["Muy bien: confiamos mucho el uno en el otro", "Lo quiero cambiar", "No le hablo", "Me molesta"]],
      ["¿Qué pensás de tu largada en {gp}?", ["Pude ser mejor; perdí dos lugares en la primera curva", "Perfecta", "Fue culpa del semáforo", "No me acuerdo"]]],
    none: [["¿Estás preocupado después de {gp}?", ["Un poco, pero tenemos claro qué mejorar", "Muchísimo, me voy", "Para nada", "No hablo"]],
      ["¿Se te fue la temporada después de {gp}?", ["No: quedan carreras y hay que seguir sumando", "Sí, ya está", "Nunca tuve temporada", "No sé"]],
      ["¿El equipo te dio un mal auto en {gp}?", ["Todos tuvimos un mal día; lo vamos a analizar juntos", "Sí, me sabotean", "El auto es un desastre", "Sin comentarios"]],
      ["¿Qué cambiarías de tu carrera en {gp}?", ["La gestión de gomas en el segundo stint", "Nada, manejé perfecto", "El equipo entero", "No sé"]]],
    role: [["¿Qué consejo le das a los pilotos jóvenes?", ["Escuchar al equipo y trabajar el físico y la cabeza", "Que me copien", "Ninguno", "Que se dediquen a otra cosa"]],
      ["¿Cómo se negocia un contrato de piloto?", ["Con mi representante: sueldo, años, cláusulas y derechos de imagen", "Pido el doble y listo", "Firmo lo que me den", "No sé"]],
      ["¿Qué marcas personales tenés?", ["Algunas, siempre que no choquen con los sponsors del equipo", "Muchas, y que el equipo se aguante", "Ninguna", "No sé qué es eso"]],
      ["¿Cuál es tu circuito favorito?", ["Los de curvas rápidas: ahí se siente el auto de verdad", "Ninguno, son todos aburridos", "El más corto", "No sé los nombres"]],
      ["¿Qué hacés en tus días libres?", ["Entreno, descanso y paso tiempo con la familia", "Nada", "Fiestas todos los días", "Miro mis videos"]]]
  },
  { // estrella
    win: [["Otra victoria en {gp}: ¿cuál es tu secreto?", ["Trabajo, un gran equipo y no conformarme nunca", "Soy el mejor de la historia", "Suerte", "Es secreto"]],
      ["¿Sentís que podés romper récords después de {gp}?", ["Los récords llegan si sigo haciendo bien mi trabajo", "Ya los rompí todos", "No me importan", "Imposible"]],
      ["¿Qué te motiva después de tantas victorias?", ["Las ganas de mejorar y de ganar con este equipo", "La plata", "Nada", "Que me admiren"]],
      ["¿Cómo viviste la vuelta de honor en {gp}?", ["Emocionado, saludando a los hinchas que vinieron", "Aburrido", "Apurado para irme", "No la di"]]],
    podium: [["¿Un podio es un mal resultado para vos después de {gp}?", ["Para nada: suma para el campeonato y el equipo lo valora", "Sí, es un desastre", "Es lo máximo", "No sé"]],
      ["Los jóvenes te están alcanzando: ¿qué pensás tras {gp}?", ["Es bueno para la F1; me obliga a seguir mejorando", "Nunca me van a alcanzar", "Me molesta", "No los conozco"]],
      ["¿Qué le dirías al piloto que te ganó en {gp}?", ["Felicitaciones: hizo una gran carrera", "Que tuvo suerte", "Nada", "Que lo voy a destruir"]],
      ["¿Cómo está tu relación con los sponsors después de {gp}?", ["Excelente: cumplo los eventos y ellos apoyan al equipo", "No los soporto", "No tengo", "Les cobro el doble"]]],
    points: [["¿Te preocupa no haber estado arriba en {gp}?", ["No: fue un fin de semana difícil y sumamos igual", "Sí, me voy a retirar", "No me importa nada", "Es culpa de todos"]],
      ["¿Te sentís presionado por ser una estrella?", ["Es parte del trabajo; la presión la convierto en motivación", "No siento nada", "Sí, no aguanto más", "No soy una estrella"]],
      ["¿Qué le pedís al equipo después de {gp}?", ["Seguir con el plan de desarrollo, sin desesperarse", "Un auto nuevo ya", "Más plata para mí", "Nada"]],
      ["¿Cómo ves la pelea por el título tras {gp}?", ["Abierta: quedan muchas carreras", "Ya la gané", "Perdida", "No miro el campeonato"]]],
    none: [["¿Es el fin de tu mejor época después de {gp}?", ["No: un mal día no borra el trabajo de años", "Sí, me retiro", "Nunca tuve buena época", "Sin comentarios"]],
      ["¿Qué pasó en {gp}?", ["Nos equivocamos con el setup; lo vamos a corregir juntos", "Me sabotearon", "Nada", "No me acuerdo"]],
      ["¿Hablaste con el equipo después de {gp}?", ["Sí: analizamos todo y estamos tranquilos", "No, estoy enojado", "No hablo con ellos", "Les grité"]],
      ["Los hinchas están preocupados tras {gp}. ¿Qué les decís?", ["Que vamos a volver más fuertes en {nextgp}", "Que no entienden nada", "Nada", "Que miren otro deporte"]]],
    role: [["¿Qué te falta ganar en la F1?", ["Siempre hay un título más por el que pelear", "Nada, gané todo", "No me importa ganar", "No sé"]],
      ["¿Te gustaría tener tu propio equipo algún día?", ["Quizás, pero ahora estoy enfocado en correr", "Mañana mismo", "Nunca", "Ya tengo tres"]],
      ["¿Cómo cuidás tu imagen pública?", ["Siendo respetuoso dentro y fuera de la pista", "No me importa", "Peleándome en redes", "Con un ejército de abogados"]],
      ["¿Ayudás a pilotos jóvenes?", ["Sí, comparto lo que aprendí con los de la academia", "No, son competencia", "No los conozco", "Que se arreglen solos"]],
      ["¿Qué le dirías a tu yo de 15 años?", ["Que disfrute el camino y no deje de trabajar", "Que se dedique a otra cosa", "Nada", "Que compre más autos"]]]
  }
];
// preguntas según lo que pasó en la carrera
const PX_CTX = {
  rain: { eng: [["Con lluvia en {gp}, ¿cómo decidieron cuándo cambiar a gomas de lluvia?", ["Mirando los tiempos por sector y lo que decía el piloto por radio", "Tiramos una moneda", "No cambiamos nunca", "Esperamos a que pare"]], ["¿El auto funciona bien con lluvia como en {gp}?", ["Tiene buena tracción, pero nos falta temperatura en las gomas", "Es el mejor del mundo con lluvia", "Es horrible", "No sé, no miré"]]],
    drv: [["¿Cómo fue manejar con tanta agua en {gp}?", ["Muy difícil: buscaba agarre fuera de la línea ideal", "Fácil, como en seco", "No veía nada y aceleré igual", "No me gusta hablar de eso"]], ["¿Te gusta correr con lluvia como en {gp}?", ["Sí: es donde el piloto marca más la diferencia", "No, la odio", "Me da igual", "Debería prohibirse"]]] },
  sc: { eng: [["En {gp} salió el Safety Car: ¿por qué decidieron parar o no?", ["Calculamos cuánto perdíamos en boxes con el pelotón lento", "No nos dimos cuenta del Safety Car", "Paramos porque sí", "No hubo Safety Car"]], ["¿El Safety Car de {gp} les arruinó la estrategia?", ["Nos obligó a cambiar el plan, pero reaccionamos rápido", "Sí, todo fue un desastre", "No, ni nos enteramos", "La culpa es de la FIA"]]],
    drv: [["¿Cómo viviste el relanzamiento después del Safety Car en {gp}?", ["Calenté bien las gomas y aproveché la salida", "Me quedé dormido", "Me pasaron todos", "No hubo relanzamiento"]], ["¿Qué te dijo el box cuando salió el Safety Car en {gp}?", ["Que entrara a boxes en esa vuelta para aprovecharlo", "Nada, estaban comiendo", "Que me bajara del auto", "No me acuerdo"]]] },
  pen: { eng: [["En {gp} hubo una sanción para el equipo. ¿Fue justa?", ["La aceptamos y vamos a revisar qué hicimos mal", "Es una injusticia, la FIA nos odia", "No sabíamos las reglas", "Sin comentarios"]], ["¿Vas a apelar la sanción de {gp}?", ["Primero analizamos las imágenes con los comisarios", "Sí, y vamos a la justicia", "No sé qué es apelar", "No hubo sanción"]]],
    drv: [["Te sancionaron en {gp}. ¿Fue justo?", ["Lo acepto: fui demasiado agresivo en esa maniobra", "No, me odian", "Fue culpa del otro", "No me importa"]], ["¿Vas a cambiar tu forma de atacar después de la sanción en {gp}?", ["Voy a medir mejor los riesgos sin dejar de pelear", "No, voy a ser más agresivo", "Voy a dejar de atacar", "No sé"]]] },
  dnf: { eng: [["Uno de tus autos abandonó en {gp}. ¿Qué pasó?", ["Una falla que estamos investigando con el proveedor del motor", "Fue el piloto", "No sabemos y no vamos a mirar", "Sabotaje"]], ["¿Te preocupa la confiabilidad después del abandono en {gp}?", ["Sí, y por eso vamos a invertir en confiabilidad", "No, nunca se rompe", "No sé qué es confiabilidad", "Que se rompa"]]],
    drv: [["Abandonaste en {gp}. ¿Qué sentiste?", ["Bronca, pero son cosas que pasan en las carreras", "Me alegré, estaba cansado", "Que el equipo es un desastre", "Nada"]], ["¿Qué le decís a los mecánicos después del abandono en {gp}?", ["Que confío en ellos y que vamos a volver", "Que son unos inútiles", "Nada", "Que me den otro auto"]]] },
  last: { eng: [["Fue la última carrera del año. ¿Qué balance hacés de la temporada?", ["Aprendimos mucho y ya trabajamos en el auto del año que viene", "Fue perfecta", "Un desastre total", "No hago balances"]]],
    drv: [["Terminó la temporada en {gp}. ¿Qué balance hacés?", ["Crecí mucho como piloto y quiero más para el año que viene", "Fue perfecta", "Quiero olvidarla", "No sé"]]] }
};
const PX_MATE = {
  eng: [["Tus dos pilotos terminaron cerca en {gp}. ¿Hubo órdenes de equipo?", ["Los dejamos pelear con reglas claras de respeto", "Sí, siempre favorecemos al mismo", "No sé, no miré", "Que se choquen"]],
    ["¿Cuál de tus pilotos rindió mejor en {gp}?", ["Los dos aportaron; los datos dicen quién mejoró en cada sector", "Uno es un desastre", "No sé quiénes son", "El que me cae mejor"]],
    ["¿Tus pilotos comparten los datos entre ellos?", ["Sí, toda la información es del equipo", "No, que se arreglen", "Se los escondo", "No sé"]]],
  drv: [["¿Le ganaste a tu compañero en {gp}? ¿Qué significa?", ["Es una referencia, pero los dos trabajamos para el equipo", "Que soy el número uno y él no vale nada", "Nada", "Que lo tienen que echar"]],
    ["¿Compartís el setup con tu compañero?", ["Sí, los datos son del equipo y nos ayudamos", "No, que se arregle", "Le doy datos falsos", "No sé"]],
    ["¿Cómo te llevás con tu compañero fuera de la pista?", ["Bien: hay respeto y competencia sana", "No nos hablamos", "Lo odio", "No sé quién es"]]]
};
function pxSeen() { if (!Array.isArray(s.pressSeen)) s.pressSeen = []; return s.pressSeen; }
function pxPick(pool, keyPrefix, salt, strict) {
  const seen = pxSeen();
  const start = deterministicHash(keyPrefix + salt) % pool.length;
  for (let k = 0; k < pool.length; k++) {
    const i = (start + k) % pool.length, key = keyPrefix + i;
    if (seen.indexOf(key) < 0) { seen.push(key); if (seen.length > 120) seen.splice(0, seen.length - 120); return pool[i]; }
  }
  return strict ? null : pool[start];
}
function pxMake(item, gpName, nextGp, seed) {
  const sh = shuffleKeepCorrect(item[1], 0, seed);
  return { q: item[0].replace(/\{gp\}/g, gpName).replace(/\{nextgp\}/g, nextGp || "la próxima carrera"), opts: sh.opts, correct: sh.correct };
}
function pxContext() {
  const w = s.weather && (s.weather.label || "");
  const mine = (typeof engLastRaceGrid !== "undefined" && engLastRaceGrid) ? engLastRaceGrid.filter(e => e.mine) : [];
  if (s.gp >= 9) return "last";
  if (mine.some(e => e.status === "DNF")) return "dnf";
  if (mine.some(e => e.penalty)) return "pen";
  if (s._safetyCarThisRace) return "sc";
  if (/lluvia|tormenta|mojad/i.test(w)) return "rain";
  return null;
}
(function () {
  const o = window.pickPressQuestions;
  if (typeof o !== "function") return;
  window.pickPressQuestions = function (category, gpName, nextGpName, pos2) {
    const qs = o.apply(this, arguments);
    try {
      const drv = s.playerMode === "driver";
      const g = pressTierGroup();
      const salt = "_" + s.gp + "_" + s.season + "_" + (s.licensePoints || 0);
      const seed = "px" + salt;
      const base = drv ? PX_DRV[g] : PX_ENG[g];
      // 1) resultado: banco grande (los de antes + los nuevos)
      const oldPool = drv ? ((pressQuestionPoolsDriver[category] || []).map(x => [x.q, [x.opts[x.correct]].concat(x.opts.filter((_, i) => i !== x.correct))])) : ((PRESS_ENG[g][category] || []));
      const resPool = oldPool.concat(base[category] || []);
      qs[0] = pxMake(pxPick(resPool, (drv ? "d" : "e") + g + category, salt), gpName, nextGpName, seed + "a");
      // 2) lo que pasó en la carrera (o el compañero, con más variantes)
      const ctx = pxContext();
      const rivalQ = Object.keys(s.rivalries || {}).some(n => qs[2] && qs[2].q.indexOf(n) >= 0);
      let mid = ctx && PX_CTX[ctx] ? pxPick(PX_CTX[ctx][drv ? "drv" : "eng"], "c" + ctx + (drv ? "d" : "e") + s.season, salt, true) : null;
      if (!mid && deterministicHash("mate" + salt) % 3 !== 0) mid = pxPick(PX_MATE[drv ? "drv" : "eng"], "m" + (drv ? "d" : "e") + s.season, salt, true);
      if (mid) qs[1] = pxMake(mid, gpName, nextGpName, seed + "b");
      // 3) sobre tu rol/rango (los de antes + los nuevos), salvo que sea la pregunta del rival
      if (!rivalQ) {
        const rolePool = (drv ? PRESS_DRV_ROLE[g].role : PRESS_ENG[g].role).concat(base.role || []);
        qs[2] = pxMake(pxPick(rolePool, "r" + (drv ? "d" : "e") + g, salt), gpName, nextGpName, seed + "c");
      }
    } catch (e) { console.warn(e); }
    return qs;
  };
})();
