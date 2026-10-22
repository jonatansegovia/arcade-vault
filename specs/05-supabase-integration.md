# SPEC 01 — Integración base de Supabase

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-10-22
> **Objective:** Dejar Arcade Vault conectado a un proyecto Supabase existente mediante clientes de navegador y servidor, variables de entorno y una ruta de verificación, sin tablas ni cambios de UI.

---

## Alcance

**In:**

- Instalar `@supabase/supabase-js` y `@supabase/ssr` con `npm install @supabase/supabase-js @supabase/ssr`.
- Crear `src/lib/supabase/client.ts` (cliente de navegador).
- Crear `src/lib/supabase/server.ts` (cliente de servidor con cookies de Next).
- Añadir las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` a `.env.local` y `.env.example`.
- Crear la carpeta `supabase/migrations/` vacía (con `.gitkeep`).
- Crear la ruta `app/api/health/supabase/route.ts` para comprobar la conexión.
- Documentar la integración en `CLAUDE.md` (sección de arquitectura).

**Out of scope (para futuras specs):**

- Tablas, migraciones con contenido y políticas RLS.
- Guardar o leer puntuaciones reales (`GamePlayer`, `GameDetail`, `HallOfFame`).
- Autenticación (`AuthCard`, email/contraseña, Google, GitHub) y `proxy.ts` de refresco de sesión.
- Decidir el destino de los datos simulados (`src/data/scores.ts`, campos `best`/`plays` de `src/data/games.ts`). No se tocan.
- Mover el catálogo de juegos a Supabase.
- Supabase CLI (`supabase init`, `link`, `db push`) y clave `service_role`.

---

## Modelo de datos

Esta feature no introduce estructuras de datos de aplicación. Solo añade variables de entorno:

```bash
# .env.example (valores de ejemplo; los reales van en .env.local)
NEXT_PUBLIC_SUPABASE_URL=XXXXX
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=XXXXX
```

Convenciones:

- `SUPABASE_DB_PASSWORD` ya existe en `.env.local` y no se usa en esta spec.
- Solo se usa la clave pública. Nunca se añade `service_role` al repo ni al navegador.
- `.env.local` no se versiona. `.env.example` solo lleva marcadores `XXXXX`.

---

## Plan de implementación

1. Ejecutar `npm install @supabase/supabase-js @supabase/ssr`. Verificar: ambos aparecen en `package.json` y `npm run build` sigue pasando.
2. Añadir las dos variables a `.env.local` (valores reales del panel de Supabase, Project Settings → API) y a `.env.example` (con `XXXXX`).
3. Crear `src/lib/supabase/client.ts` con `createBrowserClient` leyendo las dos variables.
4. Crear `src/lib/supabase/server.ts` con `createServerClient` y las cookies de `next/headers`. Consultar antes `node_modules/next/dist/docs/` por cambios de API en Next 16.
5. Crear `supabase/migrations/.gitkeep`.
6. Crear `app/api/health/supabase/route.ts`: `GET` que pide `${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health` con el header `apikey` y devuelve `{ ok: true }` (200) o `{ ok: false, error }` (503). Además instancia el cliente de `server.ts` para validar que las variables existen.
7. Añadir a `CLAUDE.md` una nota sobre `src/lib/supabase/`, las variables y la ruta de salud.

---

## Criterios de aceptación

- [ ] `package.json` lista `@supabase/supabase-js` y `@supabase/ssr` como dependencias.
- [ ] `.env.example` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con valor `XXXXX`.
- [ ] `.env.local` contiene ambas variables con valores reales y no aparece en `git status`.
- [ ] Existen `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` y `supabase/migrations/.gitkeep`.
- [ ] Con `npm run dev`, `GET /api/health/supabase` responde 200 y `{ "ok": true }`.
- [ ] Con la URL de Supabase alterada, `GET /api/health/supabase` responde 503 y `{ "ok": false, ... }`.
- [ ] Con `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ausente, la ruta responde 503 con un mensaje que nombra la variable que falta.
- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] Ninguna página existente (`/home`, `/juegos`, `/salon`, `/login`) cambia su comportamiento.
- [ ] Ningún archivo del repo contiene la clave real ni la contraseña de la base de datos.

---

## Decisiones

- **Sí:** `@supabase/ssr` junto a `supabase-js`. Es el estándar para App Router y deja listos los clientes para la spec de Auth.
- **Sí:** clientes `client.ts` y `server.ts` separados. Evita mezclar código de navegador y servidor.
- **Sí:** nombre `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Es el nombre actual de Supabase; sirve también si el panel solo ofrece la clave `anon` (el valor se pega igual).
- **Sí:** ruta `/api/health/supabase` como verificación. Se comprueba con `curl` y no crea esquema.
- **Sí:** `supabase/migrations/` vacía. La estructura queda lista sin acoplar esta spec a la CLI.
- **No:** `proxy.ts` de refresco de sesión. Sin Auth sería código sin uso; va con la spec de Auth.
- **No:** Supabase CLI en esta spec. Requiere login y enlace del proyecto; se decide cuando haya la primera migración.
- **No:** tabla de prueba. Crearía esquema que no se quiere conservar.
- **No:** `service_role`. Sin uso todavía y es un riesgo de seguridad si se filtra.
- **Pendiente (otra spec):** si se conservan los datos simulados. Se decide cuando se integren puntuaciones reales.

---

## Riesgos

| Riesgo                                                    | Mitigación                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Clave pegada en un archivo versionado                     | Solo se escribe en `.env.local`; `.env.example` lleva `XXXXX`; criterio de aceptación lo verifica. |
| API de `cookies()` de Next 16 distinta a la conocida      | Consultar `node_modules/next/dist/docs/` antes de escribir `server.ts`.                            |
| Proyecto Supabase pausado (plan gratuito)                 | La ruta de salud devuelve 503; reactivar el proyecto desde el panel.                               |
| Ruta de salud pública expone estado de la infraestructura | Respuesta mínima (`ok` y mensaje corto), sin URL ni claves en el cuerpo.                           |

---

## Lo que **no** está en esta spec

- Tablas, RLS y migraciones con contenido.
- Puntuaciones reales y ranking.
- Login, registro y sesiones.
- Reemplazo o eliminación de datos simulados.
- Supabase CLI y `service_role`.

Cada uno, si se hace, va en su propia spec.
