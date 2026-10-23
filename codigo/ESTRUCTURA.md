# 🏎️ FAWIWE F1 · cómo está armado el código

Versión: **Versión 1.0**. El juego final es **una sola página** (`juego.html`), pero se arma a partir de estos archivos.

## Cómo armar el juego

```
cd codigo
python3 build.py        # arma game_new.html (el juego) y out/fawiwe.html
cd sitio && python3 build_site.py   # arma la página con el juego adentro
```

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `base/` | La página original del juego (`game.html`) y pedazos de HTML que se le insertan. |
| `estilos/` | Todos los estilos (CSS), en el orden en que se cargan. |
| `modulos/` | Las partes grandes del juego: modo ingeniero, carrera en vivo, minijuegos, cinemáticas, sonido… |
| `parches/` | Las mejoras de cada versión (v110 a v148). Cada una **envuelve** funciones anteriores para cambiarlas, por eso **el orden importa**. |
| `sitio/` | La página de presentación (index.html) y sus capturas. |
| `logo/` | El logo de FAWIWE (pestaña del navegador e íconos de la app). |

`manifest.json` dice qué archivos entran y en qué orden. Para agregar algo nuevo: crear el archivo en la carpeta que corresponda y sumarlo al final de la lista en `manifest.json`.

## Estilos

| # | Archivo | Carpeta | Qué hace | Cambia estas funciones |
|---|---|---|---|---|
| 1 | `eng.css` | estilos | Centro del Ingeniero |  |
| 2 | `bfx.css` | estilos | Compras con cinemática + minijuegos |  |
| 3 | `menu.css` | estilos | Menú cinematográfico |  |
| 4 | `laps.css` | estilos | Carrera en vivo: torre de tiempos estilo transmisión |  |
| 5 | `cine.css` | estilos | CINE: evolución de la F1, autos por época, transmisión |  |
| 6 | `dash.css` | estilos | FAWIWE · DASHBOARD (estilo panel) |  |
| 7 | `radio.css` | estilos | radio con voz + transmisión modo piloto |  |
| 8 | `v133.css` | estilos | V133: mapa, podio, salón de la fama, pretemporada, celular |  |
| 9 | `v134.css` | estilos | V134 · estilos de personajes, modos nuevos, repetición y accesibilidad |  |
| 10 | `v138.css` | estilos | V138 · estilos de largada, pases, bandera a cuadros y campeón |  |
| 11 | `v139.css` | estilos | V139 · estilos de estrategia, boxes y tarjeta de temporada |  |
| 12 | `v140.css` | estilos | V140 · estilos de los 30 arreglos |  |
| 13 | `v141.css` | estilos | V141 · estilos de las novedades del modo piloto |  |
| 14 | `v142.css` | estilos | V142 · celular |  |
| 15 | `v143.css` | estilos | V143 · multijugador |  |
| 16 | `v144.css` | estilos | V144 · novedades del multijugador |  |
| 17 | `v145.css` | estilos | Prototipo 1.4 · estilos de los 43 arreglos |  |
| 18 | `v146.css` | estilos | Prototipo 1.4 · estilos de las dos cinemáticas nuevas |  |
| 19 | `v147.css` | estilos | Prototipo 1.5 · minijuegos enteros en pantalla, celular acostado y largada con bandera |  |
| 20 | `v148.css` | estilos | Prototipo 1.5 · estilo de la pizarra del box (antes de 1980) |  |
| 21 | `v149.css` | estilos | Versión 1.0 · estilos de los minijuegos del camino a la F1 |  |

## Módulos y parches (en orden de carga)

| # | Archivo | Carpeta | Qué hace | Cambia estas funciones |
|---|---|---|---|---|
| 1 | `audio.js` | modulos | FAWIWE · SONIDO |  |
| 2 | `confirmfix.js` | modulos | Confirmaciones sin ventanas del navegador: algunos lugares (como una página publicada) |  |
| 3 | `eng.js` | modulos | FAWIWE · EXPANSIÓN DEL MODO INGENIERO — "Centro del Ingeniero" |  |
| 4 | `laps.js` | modulos | FAWIWE · VUELTA POR VUELTA |  |
| 5 | `buyfx.js` | modulos | FAWIWE · COMPRAS CON CINEMÁTICA + 2 MINIJUEGOS (Modo Piloto y Modo Ingeniero) |  |
| 6 | `menu.js` | modulos | Menú cinematográfico: tarjetas con estado, pasos, entrada animada y largada |  |
| 7 | `sound.js` | modulos | Sonido en todos los clics del juego |  |
| 8 | `gamesound.js` | modulos | Sonido en todo el juego: cada clic suena, y las cinemáticas tienen música. |  |
| 9 | `cars.js` | modulos | FAWIWE · AUTOS DE CADA ÉPOCA (vista de costado, diseños propios) + "La evolución de la F1" |  |
| 10 | `cine.js` | modulos | FAWIWE · CINE |  |
| 11 | `era.js` | modulos | FAWIWE · MANEJO DE ÉPOCA (Modo Piloto) |  |
| 12 | `circuit.js` | modulos | FAWIWE · DESAFÍOS DE CIRCUITO (Modo Piloto) |  |
| 13 | `nego.js` | modulos | FAWIWE · NEGOCIACIONES (estilo F1 Manager) |  |
| 14 | `press.js` | modulos | FAWIWE · PRENSA SEGÚN TU ROL Y TU RANGO |  |
| 15 | `press2.js` | modulos | FAWIWE · MÁS VARIEDAD EN LAS ENTREVISTAS (los dos modos) |  |
| 16 | `wallet.js` | modulos | FAWIWE · TU SUELDO Y TU PLATA (Modo Ingeniero) |  |
| 17 | `fame.js` | modulos | FAWIWE · MEDIOS DEL MUNDO Y FAMA MUNDIAL |  |
| 18 | `junior.js` | modulos | FAWIWE · CAMINO A LA F1: elegí dónde arrancás (Karting, F4, F3, F2 o directo a F1) |  |
| 19 | `career.js` | modulos | FAWIWE · DEBUT EN F1 (titular o reserva) + CINEMÁTICA DE CAMBIO DE RANGO (los dos modos) |  |
| 20 | `duel.js` | modulos | FAWIWE · MULTIJUGADOR: EL DUELO |  |
| 21 | `engmini.js` | modulos | FAWIWE · MINIJUEGOS NUEVOS |  |
| 22 | `home.js` | modulos | FAWIWE · TU CASA (los dos modos) |  |
| 23 | `home2.js` | modulos | FAWIWE · TU CASA 2: mudanzas, mejoras y el humor que se nota |  |
| 24 | `rant.js` | modulos | FAWIWE · EXPLOTAR CONTRA LOS MEDIOS (opcional) |  |
| 25 | `realism.js` | modulos | FAWIWE · REALISMO |  |
| 26 | `v110.js` | parches | V110 · inicio y menú actualizados, ajustes de realismo antes de empezar | `start` |
| 27 | `wheel.js` | modulos | FAWIWE · EL VOLANTE CAMBIA SEGÚN EL AÑO |  |
| 28 | `racecine.js` | modulos | MOTOR DE CINEMÁTICAS DE PISTA · 4 modos |  |
| 29 | `seat.js` | modulos | FAWIWE · TITULAR O RESERVA SE DEFINE EN EL CONTRATO |  |
| 30 | `dash.js` | modulos | FAWIWE · NUEVA DISPOSICIÓN "DASHBOARD" (solo cambia cómo se ve) |  |
| 31 | `ovr.js` | modulos | FAWIWE · OVR QUE SE MUEVE |  |
| 32 | `calendar.js` | modulos | FAWIWE · CALENDARIO QUE CAMBIA CADA TEMPORADA |  |
| 33 | `radio.js` | modulos | FAWIWE · RADIO CON VOZ |  |
| 34 | `dl.js` | modulos | FAWIWE · TRANSMISIÓN DE CARRERA EN MODO PILOTO |  |
| 35 | `qlive.js` | modulos | FAWIWE · CLASIFICACIÓN EN VIVO (modo piloto) |  |
| 36 | `v133.js` | parches | V133 · mapa del circuito en las transmisiones, récords por circuito y salón de la fama, pretemporada, rumores del mercado, podio con cinemática y autoguardado | `dlEnsureOverlay`, `engLiveTick`, `engStartLive`, `nextGP`, `render`, `renderLoadScreen`, `retireCareer`, `rlRelCardHtml`, `showBigResult` |
| 37 | `v134.js` | parches | V134 · jefe de equipo, redes sociales, mánager, desafíos, toda una vida, temporada rápida, medallas, repetición, casco, música por época y accesibilidad | `dlDraw`, `dlSkip`, `dlSprintScore`, `dlStart`, `nextGP`, `ngDrvTeamMax`, `qlSkip`, `qlStart`, `render`, `renderAchievements`, `showBigResult`, `start` |
| 38 | `engx.js` | modulos | FAWIWE · MODO INGENIERO AL DÍA |  |
| 39 | `v135.js` | parches | V135 · desafíos por época, presentación del auto nuevo cada temporada y tutorial | `render` |
| 40 | `v136.js` | parches | V136 · carrera rápida y de ensueño, tarjeta para compartir, personalizar el auto y arreglos de carga de partidas | `fwCarSvg`, `loadGameFromSlot`, `render`, `showBigResult`, `triggerAIEventIfNeeded`, `v4MenuBox`, `v5LaunchBusy`, `v5LaunchWanted` |
| 41 | `v138.js` | parches | V138 · largada, pases y defensas jugables, bandera a cuadros, campeón del mundo, relanzamiento del Safety Car y lluvia en la qualy | `dismissIntro`, `dlDraw`, `dlEnd`, `dlEnsureOverlay`, `dlRaceExtras`, `dlSkip`, `dlStart`, `engLiveTick`, `fwRadioSay`, `nextGP`, `qlFinalTime`, `qlStart` |
| 42 | `v139.js` | parches | V139 · estrategia antes de largar, entrada a boxes jugable, órdenes de ataque del ingeniero, repetición del pase y voz del periodista | `answerPress`, `closePress`, `dlDraw`, `dlRaceExtras`, `dlSkip`, `engLiveDraw`, `engLiveSkip`, `engLiveTick`, `fwMapDraw`, `fwRadioSay`, `nextGP`, `render` |
| 43 | `v140.js` | parches | FAWIWE · V140 — 30 arreglos | `answerPress`, `applySafetyCarEvent`, `dlExtrasInit`, `dlFeed`, `dlLap`, `dlSay`, `dlSkip`, `engApplyPenalties`, `engLiveDraw`, `engLiveSkip`, `fwMapDraw`, `fwRadioSay` |
| 44 | `v141.js` | parches | FAWIWE · V141 — 5 novedades (modo piloto) | `dlDraw`, `dlEnd`, `dlExtrasInit`, `dlFinalize`, `dlLap`, `dlOpenEvent`, `dlRaceExtras`, `dlSkip`, `dlStart`, `fwMapDraw`, `render`, `v7QteFinish` |
| 45 | `v142.js` | parches | FAWIWE · V142 — paquete de CELULAR (16) | `dlFeed`, `eraEnd`, `fwMapDraw`, `fwRadioToast`, `render`, `v4A11yApply`, `v4A11yHtml`, `v7Flag`, `v7QteOpen`, `v7StartHit` |
| 46 | `v143.js` | parches | FAWIWE · V143 — MULTIJUGADOR | `announceQuali`, `calcQualiPos`, `calcRacePos`, `currentTeamLineup`, `dlApplyLocks`, `dlDraw`, `dlEnd`, `dlLap`, `dlOn`, `dlRaceExtras`, `dlSkip`, `dlSprintWeekend` |
| 47 | `v144.js` | parches | FAWIWE · V144 — NOVEDADES DEL MULTIJUGADOR | `dlDraw`, `dlFinalize`, `dlLap`, `dlRaceExtras`, `dlSkip`, `duelCardHtml`, `duelShowChampion`, `render`, `v7StartOpen` |
| 48 | `v145data.js` | parches | Prototipo 1.4 · grillas reales año por año (1950–1999). Equipos privados reales para que cada año tenga la cantidad real de autos. |  |
| 49 | `v145.js` | parches | Prototipo 1.4 · 43 arreglos: grillas reales, calendarios y puntos de cada época, multijugador y textos | `calForSeason`, `currentTeamLineup`, `dashTeamPos`, `engReserveInfo`, `engSprintGPs`, `findRating`, `finishRace`, `formatMoney`, `fwRadioSay`, `getDriversForYear`, `getTeamsForYear`, `myTeamLineup` |
| 50 | `v146.js` | parches | Prototipo 1.4 · cinemática de inicio y cinemática de Jugar (viaje en el tiempo y credencial del paddock) | `beginCareer`, `dismissIntro` |
| 51 | `v147.js` | parches | Prototipo 1.5 · compañero alineado, sin pilotos repetidos, quiz y textos de época, pizarra antes de 1980, minijuegos enteros en pantalla, multijugador acostado | `currentTeamLineup`, `fwRadioSay`, `fwSquelch`, `myTeamLineup`, `pickF1Quiz`, `playRadioSound` |
| 52 | `v148.js` | parches | Prototipo 1.5 · nivel real del piloto, abandonos por época, épocas y autos bien marcados, novatos de época, cuidar las gomas y pizarra en código corto. Choque en la carrera = abandono en la vuelta 1, contratos de hasta 4 temporadas y mánager a comisión (10% del sueldo). Tu casa: más actividades en cada ambiente, según la época. En la clasificación manda tu vuelta (una vuelta mala ya no da la pole). Modo leyenda arreglado (pilotos repetidos, nivel real del auto, historia de cada escudería) y números reales de los pilotos según la época. Nuevo: práctica libre, "¿Sabías que…?" de cada circuito y la historia real de cada temporada. Vuelta rápida con una sola verdad (y punto para los rivales) y sprints de 2021 con 3-2-1. | `computeOVR`, `deterministicHash`, `eraKers`, `fwCarSvg`, `fwEra`, `fwEraCardHtml`, `fwEraIdx`, `fwRadioToast`, `generateRookieName`, `myTeamLineup`, `ngYearsHtml`, `rollRaceStatus` |
| 53 | `v149.js` | parches | Versión 1.0 · minijuegos del camino a la F1 según categoría y época | `advanceJuniorRace`, `renderJuniorStep` |
| 54 | `i18n_en_dict.js` | idiomas | Diccionario español → inglés (generado) |  |
| 55 | `i18n_pt_dict.js` | idiomas | Diccionario español → portugués (generado) |  |
| 56 | `i18n_en.js` | idiomas | FAWIWE · ENGLISH: traducción de la pantalla al inglés y botón de idioma |  |

## Funciones que más parches cambian

Si querés cambiar una de estas, mirá todos los parches que la tocan (la última versión que se carga es la que manda).

| Función | Parches que la cambian |
|---|---|
| `render` | 11 |
| `showBigResult` | 7 |
| `dlSkip` | 7 |
| `nextGP` | 6 |
| `dlDraw` | 6 |
| `start` | 5 |
| `dlRaceExtras` | 5 |
| `fwRadioSay` | 5 |
| `dlStart` | 4 |
| `fwMapDraw` | 4 |
| `v7QteFinish` | 4 |
| `dlLap` | 4 |
| `myTeamLineup` | 4 |
| `engLiveTick` | 3 |
| `triggerAIEventIfNeeded` | 3 |

