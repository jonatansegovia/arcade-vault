# SPEC 01 — MVP visual de Arcade Vault

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-09-24
> **Objective:** Implementar, solo a nivel visual y con datos mock, las 5 pantallas de Arcade Vault (Biblioteca, Detalle, Reproductor, Login/Auth y Salón de la Fama) migrando el diseño de `references/templates/` a rutas reales de Next.js App Router con CSS Modules + Tailwind v4.

---

## Scope

**In:**

- Ruta `/` — Biblioteca: hero, buscador, chips de categoría, grid de tarjetas de juego (`GameCard`).
- Ruta `/juegos/[id]` — Detalle: portada, tags, descripción, stat-strip, acciones (Jugar / Volver) y leaderboard lateral.
- Ruta `/juegos/[id]/jugar` — Reproductor: HUD (jugador, puntuación, vidas, nivel), arena CRT animada con simulación mock de partida (score sube solo, pausa/reanuda, botón FIN abre modal "Fin del juego").
- Ruta `/login` — Auth: tarjeta con tabs "Iniciar sesión" / "Crear cuenta", campos controlados, botones sociales decorativos. Formulario 100% visual, sin submit real ni persistencia.
- Ruta `/salon` — Salón de la Fama: tabs por juego, podio (oro/plata/bronce) y tabla de puntuaciones.
- `Nav` (barra superior + panel móvil) y footer, compartidos vía `app/layout.tsx`.
- Dataset mock de 8 juegos portado a TypeScript (mismo shape que `references/templates/data.jsx`), reutilizado por Biblioteca, Detalle, Reproductor y Salón.
- Generador `seededScores` portado tal cual para leaderboards pseudoaleatorios deterministas.
- Migración del look retro-arcade (neón, scanlines, grid de perspectiva, CRT) a CSS Modules por componente, usando utilidades/tokens de Tailwind v4 (`@theme`, `@apply`) en lugar de un `globals.css` monolítico.
- Navegación entre pantallas con `next/link` y `useRouter` (sin hash routing).

**Out of scope (para futuros specs):**

- Lógica real de cualquier juego (Bloque Buster, Caída, Serpentina, etc.). La arena del Reproductor es una animación CSS + contador mock, no un juego jugable.
- Autenticación real (backend, validación de credenciales, OAuth con Google/GitHub).
- Persistencia de sesión de usuario o de puntuaciones (nada se guarda en localStorage ni en ningún backend).
- Guardar la puntuación final desde el modal "Fin del juego" (el botón puede mostrarse pero no persiste nada).
- Sistema de créditos/monedas real (el contador "CRÉDITOS · 03" del Nav queda como valor fijo decorativo).
- Responsive design exhaustivo más allá de los breakpoints que ya trae el CSS portado.
- Tests automatizados.

---

## Data model

```ts
// src/data/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS del cover generado (ej. "cover-bricks")
  color: GameColor;
  best: number;
  plays: string; // ej. "12.4K"
}

export const GAMES: Game[] = [
  /* los mismos 8 juegos de references/templates/data.jsx */
];
export const CATEGORIES: Array<"TODOS" | GameCategory> = [
  "TODOS",
  "ARCADE",
  "PUZZLE",
  "SHOOTER",
  "VERSUS",
];
```

```ts
// src/data/scores.ts
export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
}

export function seededScores(seed: number, count?: number): ScoreRow[];
// Misma implementación determinista que references/templates/data.jsx (PLAYERS + PRNG lineal).
```

No hay estado de usuario ni de puntuaciones persistido: no se introduce ningún modelo de sesión ni de guardado.

---

## Implementation plan

1. Crear `src/data/games.ts` y `src/data/scores.ts` con el dataset y el generador portados desde `references/templates/data.jsx`. El proyecto sigue compilando y `/` (starter actual) sigue funcionando.
2. Configurar tokens de tema en Tailwind v4 (`app/globals.css`, bloque `@theme`) con la paleta retro (`--bg`, `--cyan`, `--magenta`, `--yellow`, `--green`, `--gold`, `--silver`, `--bronze`, fuentes pixel/mono) y los elementos de fondo compartidos (`av-bg`, `av-noise`, scanlines, grid de perspectiva) que ya usa `app/layout.tsx`.
3. Crear `src/components/Nav/Nav.tsx` + `Nav.module.css`, portando `references/templates/nav.jsx` (logo, links activos por ruta con `usePathname`, contador de créditos fijo, botón "Iniciar Sesión" fijo ya que no hay sesión, panel móvil). Integrarlo en `app/layout.tsx` junto al footer. El layout renderiza Nav + footer sobre la página starter.
4. Crear `src/components/GameCard/GameCard.tsx` + módulo CSS (tarjeta con tilt on mouse-move, cover generado por clase CSS, badge de mejor puntuación, botón Jugar) y `app/page.tsx` como Biblioteca (hero, buscador, chips, grid), reemplazando el contenido starter. `/` queda funcional y navegable visualmente.
5. Crear `app/juegos/[id]/page.tsx` con `generateStaticParams` desde `GAMES`, componente `GameDetail` + módulo CSS (portada, tags, descripción, stat-strip, leaderboard con `seededScores`). Las tarjetas de la Biblioteca enlazan aquí con `next/link`.
6. Crear `app/juegos/[id]/jugar/page.tsx` (client component) con `GamePlayer` + módulo CSS: HUD, arena CRT animada, contador de score mock por `setInterval`, pausa/reanuda, botón FIN que abre el modal "Fin del juego" (sin guardar puntuación). El botón "Jugar ahora" del Detalle enlaza aquí.
7. Crear `app/login/page.tsx` con `AuthCard` + módulo CSS: tabs, campos controlados sin submit real, botones sociales decorativos, botón "Jugar como invitado" que navega a `/`. El botón "Iniciar Sesión" del Nav enlaza aquí.
8. Crear `app/salon/page.tsx` con `HallOfFame` + módulo CSS: tabs por juego, podio y tabla, usando `seededScores`. El link "Salón de la Fama" del Nav enlaza aquí.
9. Revisar todas las pantallas contra `references/templates/Arcade Vault.html` renderizado, ajustar detalles visuales finos y correr `npm run build` para confirmar que las 5 rutas compilan sin errores.

---

## Acceptance criteria

- [ ] `npm run build` termina sin errores.
- [ ] `/` muestra el hero, el buscador, los chips de categoría y el grid de 8 tarjetas de juego.
- [ ] Escribir en el buscador o cambiar de categoría filtra las tarjetas visibles en `/`.
- [ ] Click en una tarjeta o su botón "Jugar" navega a `/juegos/[id]` con los datos de ese juego.
- [ ] `/juegos/[id]` muestra portada, tags, descripción, stat-strip y un leaderboard con 10 filas.
- [ ] El botón "Jugar ahora" en `/juegos/[id]` navega a `/juegos/[id]/jugar`.
- [ ] En `/juegos/[id]/jugar` la puntuación del HUD sube sola con el tiempo.
- [ ] El botón "Pausa" detiene el incremento de puntuación y cambia su etiqueta a "Reanudar".
- [ ] El botón "Fin" abre el modal "Fin del juego" mostrando la puntuación alcanzada.
- [ ] El botón "Iniciar Sesión" del Nav navega a `/login` y muestra el formulario con tabs "Iniciar sesión"/"Crear cuenta".
- [ ] El link "Salón de la Fama" navega a `/salon` y muestra el podio (3 puestos) y la tabla de puntuaciones para el juego seleccionado en las tabs.
- [ ] Cambiar de tab en `/salon` cambia las puntuaciones mostradas.
- [ ] El Nav y el footer aparecen en las 5 rutas.
- [ ] Recargar cualquiera de las 5 rutas directamente (sin navegar desde `/`) la renderiza correctamente.

---

## Decisions

- **Sí:** rutas reales de App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/login`, `/salon`) en vez de hash routing como el template original. Da URLs limpias, SSG vía `generateStaticParams` y es el patrón nativo de esta versión de Next.
- **No:** mantener el router client-side por hash del template (`app.jsx`). Es una copia fiel pero renuncia a SSR/URLs reales sin necesidad, ya que el proyecto es Next App Router desde el inicio.
- **Sí:** simulación mock activa en el Reproductor (score sube solo, pausa/reanuda, modal de fin). Da la sensación de partida real sin implementar lógica de juego, que queda fuera de este spec.
- **Sí:** CSS Modules por componente/pantalla usando utilidades y tokens de Tailwind v4, en vez de portar `styles.css` como un único `globals.css`. Evita un archivo monolítico y aprovecha el setup Tailwind v4 ya configurado en el proyecto (`@tailwindcss/postcss`).
- **No:** reescribir todo en utilities de Tailwind puro sin CSS Modules. Los efectos (scanlines, grid en perspectiva, glow, CRT) son más mantenibles como CSS declarado con `@apply`/tokens que como cadenas largas de utilities inline.
- **No:** persistencia de ningún tipo (sesión de usuario, puntuaciones, créditos). Todo el flujo de Auth y "Guardar puntuación" es decorativo; se define explícitamente así para no generar estado que nada en esta etapa lee de forma consistente.
- **Sí:** `seededScores` y el dataset de 8 juegos se portan tal cual desde `references/templates/data.jsx`, tipados en TypeScript. Mantiene paridad visual exacta con el template sin inventar contenido nuevo.
- **No:** reducir el dataset a 3-4 juegos. Se mantienen los 8 para paridad completa con el template de referencia.

---

## What is **not** in this spec

- Lógica jugable de cualquiera de los 8 juegos.
- Autenticación real y persistencia de sesión o puntuaciones.
- Guardado real de la puntuación final del Reproductor.
- Sistema de créditos/monedas funcional.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
