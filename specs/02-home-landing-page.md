# SPEC 02 — Home (landing) y reorganización de rutas

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-09-27
> **Objective:** Integrar la página Home (landing) de Arcade Vault en `/home` a partir de `references/templates/home-about/home.jsx`, mover la Biblioteca actual de `/` a `/juegos`, y redirigir `/` a `/home`.

---

## Scope

**In:**

- Ruta `/home` — Home/landing: hero con silhouettes flotantes, sección "¿Por qué Arcade Vault?" (feature grid), sección "Juegos disponibles ahora" (mini-rail con 6 juegos reales), sección de stats (12+ / MILES / GLOBAL), sección de precios (plan único + FAQ) y CTA final. Migrado desde `home.jsx`.
- Redirect permanente `/` → `/home` (`next.config`).
- Mover la Biblioteca (contenido actual de `app/page.tsx`) a `app/juegos/page.tsx`, ruta `/juegos`, sin cambios funcionales (buscador, chips, grid).
- Nuevo componente `src/components/MiniCard` para el mini-rail de juegos de Home, portado del `MiniCard` de `home.jsx` (portada cuadrada, título, categoría, sin badge de score).
- Nuevo componente `src/components/Home` con la lógica/markup de la landing, portado de `home.jsx`, usando `GAMES.slice(0, 6)` del dataset real (`src/data/games.ts`).
- Actualizar `Nav`: agregar link "Inicio" → `/home`, actualizar el link "Biblioteca" → `/juegos`, y ajustar el estado activo para ambas rutas (desktop y panel móvil).
- Migrar los estilos de Home (`home-hero`, `home-silos`, `feature-grid`, `mini-rail`, `home-stats`, `home-final`, animación `.reveal`) desde `styles.css` a CSS Modules del nuevo componente, siguiendo el mismo patrón que el resto del proyecto (CSS Modules + tokens Tailwind v4).
- Los CTAs de Home navegan con `next/link` / `useRouter`: "Explorar juegos" e "Insertar moneda" → `/juegos`; "Crear cuenta" y "Empezar gratis" → `/login`; las mini-cards → `/juegos/[id]`.

**Out of scope (para futuros specs):**

- Página About (`about.jsx`) y su ruta `/about`: no se implementa en este MVP, no se crea el archivo ni se agrega link en el Nav.
- Formulario de contacto de About: fuera de alcance al no implementarse About.
- Sección "ACTIVIDAD EN VIVO" de Home (ticker "últimas puntuaciones" + "top jugadores · hoy"): no se incluye en este MVP.
- Cualquier dato en tiempo real o lógica de actividad de usuarios.
- Tests automatizados (la verificación con Playwright MCP, descrita más abajo, es manual y ocurre después de la aprobación del usuario; no se generan archivos de test).
- Autenticación, persistencia de sesión/puntuaciones y créditos reales (fuera de alcance desde SPEC 01, sin cambios).

---

## Data model

No se introducen estructuras de datos nuevas. Home reutiliza el tipo `Game` y el dataset `GAMES` ya definidos en `src/data/games.ts` (SPEC 01), tomando `GAMES.slice(0, 6)` para el mini-rail.

---

## Implementation plan

1. Mover `app/page.tsx` (+ `page.module.css`) a `app/juegos/page.tsx` (+ mismo módulo CSS), sin cambiar su contenido ni su lógica. El build sigue pasando; la Biblioteca ahora vive en `/juegos`.
2. Actualizar `src/components/Nav/Nav.tsx`: agregar link "Inicio" (`/home`), cambiar el destino de "Biblioteca" a `/juegos`, actualizar `isActive`/`isBiblioteca` para matchear `/juegos` y `/juegos/[id]...`, y agregar `isHome` para `/home`. Reflejar los mismos cambios en el panel móvil.
3. Crear `src/components/MiniCard/MiniCard.tsx` + `MiniCard.module.css`, portando el componente `MiniCard` de `home.jsx` (cover cuadrado con la clase de cover generado + título + categoría).
4. Crear `src/components/Home/Home.tsx` + `Home.module.css`, portando `home.jsx` completo excepto la sección "ACTIVIDAD EN VIVO": hero con `FloatingSilhouettes`, feature grid ("¿Por qué Arcade Vault?"), mini-rail usando `MiniCard` y `GAMES.slice(0, 6)`, sección de stats, sección de precios + FAQ, y CTA final. Incluye el hook `useReveal` (IntersectionObserver) para las animaciones `.reveal`.
5. Crear `app/home/page.tsx` que renderiza `<Home />`. Verificar que `/home` es navegable directamente y muestra todas las secciones.
6. Configurar un redirect permanente `/` → `/home` en `next.config.ts`. Verificar que visitar `/` redirige a `/home`.
7. Correr `npm run build` y revisar visualmente `/home` y `/juegos` contra el template de referencia, ajustando detalles finos de estilo.
8. (Post-aprobación del usuario) Verificar el flujo completo con Playwright MCP: navegación Home → Biblioteca → Detalle, el redirect de `/`, los estados activos del Nav y los CTAs.

---

## Acceptance criteria

- [x] `npm run build` termina sin errores.
- [x] Visitar `/` redirige a `/home`.
- [x] `/home` muestra el hero ("EL ARCADE CLÁSICO ESTÁ DE VUELTA"), los 4 feature cards, el mini-rail con 6 juegos del dataset real, el bloque de stats, la sección de precios con FAQ, y el CTA final.
- [x] El botón "Explorar juegos" del hero de Home navega a `/juegos`.
- [x] El botón "Crear cuenta" del hero de Home navega a `/login`.
- [x] Click en una mini-card de Home navega a `/juegos/[id]` con los datos de ese juego.
- [x] El botón "Ver todos los juegos" navega a `/juegos`.
- [x] El botón "Empezar gratis" de la sección de precios navega a `/login`.
- [x] El botón final "Insertar moneda" navega a `/juegos`.
- [x] `/juegos` muestra la Biblioteca (hero, buscador, chips, grid) exactamente igual que antes en `/`.
- [x] El Nav muestra "Inicio" activo en `/home` y "Biblioteca" activo en `/juegos` y `/juegos/[id]...`.
- [x] El Nav (desktop y panel móvil) no muestra ningún link a "Acerca de"/About.
- [x] Recargar `/home` y `/juegos` directamente (sin navegar desde otra ruta) los renderiza correctamente.

---

## Decisions

- **Sí:** mover Biblioteca a `/juegos` y Home a `/home`, con redirect `/` → `/home`, según lo definido por el usuario en la fase de clarificación. Alinea la estructura de rutas con el `nav.jsx` de referencia, donde "Inicio" y "Biblioteca" son links separados.
- **Sí:** redirect permanente vía `next.config.ts` en lugar de un `app/page.tsx` que llame a `redirect()`. Es la forma idiomática de un alias de ruta estático en Next.js App Router y evita un componente innecesario.
- **No:** implementar About (`/about`) en este spec, aunque el usuario confirmó que la ruta correcta sería `/about` (en inglés). Queda documentado para un spec futuro.
- **No:** portar la sección "ACTIVIDAD EN VIVO" (ticker de puntuaciones + top jugadores) de Home. El usuario decidió excluirla explícitamente de este MVP.
- **Sí:** crear `MiniCard` como componente nuevo en vez de reutilizar `GameCard`, para mantener paridad visual con el template de referencia (portada cuadrada, sin stats).
- **Sí:** Home reutiliza el dataset real `GAMES` (`src/data/games.ts`) en vez de datos ficticios adicionales, igual que el resto del proyecto desde SPEC 01.
- **Nota sobre idioma de rutas:** el usuario indicó que, idealmente, los nombres de rutas deberían estar en inglés. Para no rehacer rutas ya existentes de SPEC 01, `/juegos`, `/login` y `/salon` se mantienen sin cambios en este spec; solo la ruta nueva (`/home`) sigue esa convención.

---

## What is **not** in this spec

- Página About y su ruta `/about`.
- Formulario de contacto.
- Sección "ACTIVIDAD EN VIVO" de Home (ticker + top jugadores).
- Tests automatizados.
- Autenticación real, persistencia y créditos reales.

Cada uno de estos, si se implementa, va en su propio spec.
