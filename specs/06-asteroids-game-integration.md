# SPEC 06 — Integrar el juego Asteroids en Arcade Vault

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-26
> **Objective:** Portar a TypeScript el juego Asteroids de `references/started-games/02-asteroids` y jugarlo en `/juegos/asteroids/jugar` dentro de `GamePlayer`, con el HUD de React sincronizado con el motor y el modal de fin de partida existente.

---

## Por qué existe esta spec

`GamePlayer` hoy solo simula partidas (puntuación aleatoria sobre una arena decorativa). Asteroids es el primer juego real: ya existe como canvas HTML5 en un único `game.js` con globals y `document.getElementById`. No se puede copiar tal cual a Next.js (App Router, SSR, StrictMode, TypeScript). Hay que decidir cómo se separa el motor del componente y cómo conversan canvas y React, y ese patrón lo reutilizarán los siguientes juegos.

---

## Alcance

**In:**

- Añadir el juego `asteroids` a `src/data/games.ts` como juego nuevo. `rocas` no se toca.
- Portar `game.js` a TypeScript en `src/games/asteroids/` (`constants.ts`, `entities.ts`, `engine.ts`), sin globals ni acceso a `document` fuera de las funciones que reciben el `canvas`.
- Portar todo el contenido original: nave con inercia y envolvimiento de bordes, balas, asteroides de 3 tamaños que se parten, silueta especial fija del asteroide grande, partículas, 3 vidas con invencibilidad al reaparecer, niveles progresivos, power-up de disparo triple y bomba nova.
- Componente cliente `src/components/GamePlayer/AsteroidsCanvas.tsx` con `<canvas width=800 height=600>` lógico, escalado por CSS dentro de la pantalla CRT.
- Modificar `GamePlayer.tsx` para renderizar `AsteroidsCanvas` cuando `game.id === "asteroids"`. El resto de juegos conserva la simulación actual.
- Comunicación motor → React por callbacks: `onScore`, `onLives`, `onLevel`, `onGameOver`.
- Comunicación React → motor por un handle: `pause()`, `resume()`, `end()`, `restart()`.
- Ambos HUDs visibles: el del canvas (pintado por el motor) y el de React (`GamePlayer`), con los mismos valores.
- Los botones PAUSA, FIN, SALIR y el modal «FIN DEL JUEGO» de `GamePlayer` controlan el motor real.
- Teclado: ← → rotar, ↑ propulsar, Espacio disparar, Ctrl derecho bomba nova.
- Limpieza correcta al desmontar (cancelar `requestAnimationFrame`, quitar listeners), compatible con StrictMode.

**Out of scope (para futuras specs):**

- Guardar puntuaciones reales (Supabase, tablas, auth). El botón «GUARDAR PUNTUACIÓN» sigue siendo el toast simulado.
- Récord o ranking en `localStorage`.
- Controles táctiles / móvil.
- Sonido y música.
- Cambiar el estilo visual del juego (queda blanco sobre negro como el original).
- Migrar los otros juegos del catálogo a motores reales.
- Actualizar `best` y `plays` con datos reales.
- Tests automatizados (el proyecto no tiene runner).

---

## Modelo de datos

Entrada nueva en el catálogo (la interfaz `Game` no cambia):

```ts
// src/data/games.ts
{
  id: "asteroids",
  title: "ASTEROIDS",
  short: "Pulveriza asteroides con inercia y bombas nova.",
  long: "...", // texto en español, escrito en la implementación
  cat: "SHOOTER",
  cover: "cover-rocas", // se reutiliza, sin CSS nuevo
  color: "cyan",
  best: 0,
  plays: "0",
}
```

Contrato entre el motor y React:

```ts
// src/games/asteroids/engine.ts
export interface AsteroidsCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onLevel: (level: number) => void;
  onGameOver: (finalScore: number) => void;
}

export interface AsteroidsGame {
  pause: () => void;
  resume: () => void;
  end: () => void; // fuerza game over con la puntuación actual
  restart: () => void;
  destroy: () => void; // cancela el loop y quita listeners
}

export function createAsteroidsGame(
  canvas: HTMLCanvasElement,
  callbacks: AsteroidsCallbacks,
): AsteroidsGame;
```

Convenciones:

- Coordenadas del canvas: origen arriba a la izquierda, 800×600 lógicos.
- Tiempos en segundos (`dt`), velocidades en px/s, como en el original.
- Puntos por asteroide: grande 20, mediano 50, pequeño 100 (valores de `game.js`).
- Los callbacks se invocan solo cuando el valor cambia, no en cada frame.
- El estado del juego vive en el motor, no en React. React solo guarda los valores que muestra.

---

## Plan de implementación

1. Añadir la entrada `asteroids` a `src/data/games.ts`. Verificar: `/juegos` muestra la tarjeta y `/juegos/asteroids/jugar` abre la simulación actual.
2. Crear `src/games/asteroids/constants.ts` (W, H, RADII, SPEEDS, POINTS, TTL de power-ups) y las utilidades `wrap`, `dist`, `rand`, `randInt`. Verificar: `npm run build` pasa.
3. Crear `src/games/asteroids/entities.ts` con `Bullet`, `Particle` y `Asteroid` (incluye la silueta fija), con `update(dt)` y `draw(ctx)`. Verificar: `npm run lint` pasa.
4. Añadir a `entities.ts` `Ship` (rotación, empuje, inercia, invencibilidad, disparo simple y triple) y `PowerUp` (triple y nova). Verificar: `npm run build` pasa.
5. Crear `engine.ts` con el loop (`requestAnimationFrame`), el input de teclado, `update(dt)`, colisiones, partición de asteroides, niveles, power-ups y bomba nova. Todavía sin callbacks de UI. Verificar: build pasa.
6. Añadir a `engine.ts` el dibujo (`draw`), el HUD del canvas y la API `pause/resume/end/restart/destroy` con los callbacks. Quitar el overlay de game over y el reinicio con Espacio del original. Verificar: build y lint pasan.
7. Crear `AsteroidsCanvas.tsx`: monta el motor en `useEffect`, expone el handle por `ref` y destruye el motor al desmontar. Verificar: renderizado aislado en `/juegos/asteroids/jugar` muestra el canvas jugable.
8. Integrar en `GamePlayer.tsx`: usar `AsteroidsCanvas` solo para `asteroids`, desactivar el `setInterval` simulado para ese juego, pasar `score/lives/level` al HUD de React (hoy `lives` es constante). Verificar: puntos y vidas del HUD React coinciden con los del canvas.
9. Conectar los botones: PAUSA/REANUDAR → `pause()/resume()`, FIN → `end()`, `onGameOver` abre el modal, «JUGAR DE NUEVO» → `restart()`. Ajustar el CSS de `GamePlayer.module.css` para escalar el canvas dentro de `crtScreen`. Verificar con los criterios de aceptación.

---

## Criterios de aceptación

- [ ] `/juegos` lista `asteroids` y `rocas` como juegos distintos (9 tarjetas).
- [ ] `/juegos/asteroids/jugar` muestra el canvas del juego dentro de la pantalla CRT, sin errores en consola.
- [ ] Los demás juegos, incluido `rocas`, conservan la simulación actual.
- [ ] ← → rotan la nave, ↑ propulsa, Espacio dispara y Ctrl derecho lanza la bomba nova cuando está disponible.
- [ ] Las flechas y Espacio no hacen scroll de la página mientras se juega.
- [ ] Destruir un asteroide grande suma 20, uno mediano 50 y uno pequeño 100.
- [ ] Un asteroide grande se parte en 2 medianos y uno mediano en 2 pequeños.
- [ ] Chocar con un asteroide resta una vida; la nave reaparece con invencibilidad parpadeante.
- [ ] Al destruir todos los asteroides se pasa al nivel siguiente con más asteroides.
- [ ] El HUD de React y el HUD del canvas muestran siempre la misma puntuación, vidas y nivel.
- [ ] El botón PAUSA congela el juego (nave, asteroides y balas quietos) y REANUDAR lo continúa.
- [ ] El botón FIN abre el modal «FIN DEL JUEGO» con la puntuación actual.
- [ ] Al quedarse sin vidas se abre el modal con la puntuación final real.
- [ ] «JUGAR DE NUEVO» reinicia con 3 vidas, nivel 1 y puntuación 0.
- [ ] «GUARDAR PUNTUACIÓN» sigue mostrando el toast simulado y no escribe en ningún almacenamiento.
- [ ] Al salir con SALIR o al cambiar de ruta no queda ningún listener de teclado ni loop activo (verificable al volver a entrar sin que la velocidad del juego se duplique).
- [ ] `npm run build` y `npm run lint` terminan sin errores.

---

## Decisiones

- **Sí:** port a TypeScript en `src/games/asteroids/`. Tipado, lint y un patrón reutilizable para los siguientes juegos.
- **No:** iframe a `public/`. No se comunica con el HUD ni con el modal de fin de partida.
- **No:** `game.js` pegado en un `useEffect`. Globals frágiles y sin tipos.
- **Sí:** el estado del juego vive en el motor y React solo recibe callbacks. Evita re-renderizar a 60 FPS.
- **Sí:** mantener ambos HUDs (canvas y React) con comunicación entre ellos. Decisión del usuario; el HUD del canvas queda como en el original y el de React es el de la plataforma.
- **Sí:** el motor avisa con `onGameOver` y React muestra el modal existente. Se elimina el overlay propio y el reinicio con Espacio del original para no tener dos flujos de fin de partida.
- **Sí:** canvas fijo 800×600 lógico, escalado por CSS. Conserva física y coordenadas del original.
- **Sí:** `asteroids` es un juego nuevo y `rocas` es otro juego distinto, sin tocar. Decisión del usuario.
- **Sí:** reutilizar `cover-rocas`, `cat: "SHOOTER"` y `color: "cyan"` para la tarjeta nueva, con `best: 0` y `plays: "0"`. Valores por defecto de esta spec, porque no se pidió portada nueva; se cambian sin impacto en el motor.
- **Sí:** «GUARDAR PUNTUACIÓN» sigue simulado. Supabase aún no tiene tablas ni auth (SPEC 05).
- **No:** `localStorage` para récords. Se descartó para no crear un formato que luego haya que migrar.
- **Sí:** portar todo el contenido original (power-ups y bomba nova incluidos). Decisión del usuario.

---

## Riesgos

| Riesgo                                                                | Mitigación                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| StrictMode monta dos veces el efecto y duplica loop o listeners       | `destroy()` cancela el `requestAnimationFrame` y quita los listeners; el efecto lo llama siempre en su cleanup.               |
| Listeners globales de teclado capturan teclas fuera del juego         | Se registran al montar y se quitan al desmontar; `preventDefault` solo sobre flechas y Espacio.                               |
| Callbacks a 60 FPS saturan React                                      | Se notifican solo los cambios de valor.                                                                                       |
| `dt` enorme al volver de otra pestaña (la nave «salta»)               | Limitar `dt` a un máximo (por ejemplo 0,05 s) en el loop.                                                                     |
| Valores del HUD de React desfasados respecto al canvas tras reiniciar | `restart()` emite de nuevo `onScore/onLives/onLevel` con los valores iniciales.                                               |
| El canvas se desborda en pantallas pequeñas                           | Escalado por CSS (`width: 100%`, `aspect-ratio: 4 / 3`); los controles táctiles quedan para otra spec.                        |
| Next.js 16 con APIs distintas a las conocidas                         | Consultar `node_modules/next/dist/docs/` antes de escribir componentes cliente. El canvas solo se toca dentro de `useEffect`. |

---

## Lo que **no** está en esta spec

- Persistencia de puntuaciones (Supabase o `localStorage`).
- Controles táctiles y versión móvil.
- Sonido.
- Rediseño visual del juego o portada nueva.
- Motores reales para los otros juegos del catálogo.
- Cambios en `rocas`.

Cada uno, si se hace, va en su propia spec.
