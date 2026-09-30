# SPEC 04 — Migrar el envío de correo de contacto a un API Route

> **Status:** Implemented  
> **Depends on:** SPEC 03
> **Date:** 2026-09-29
> **Objective:** Reemplazar la Server Action `sendContactMessage` por un Route Handler `POST /api/contact` que concentre todo el envío por Resend en el servidor, sin exponer al cliente secretos, destinatario ni errores del proveedor.

---

## Why this spec exists

SPEC 03 usó una Server Action. La API key ya no viaja al navegador, pero el destinatario está hardcodeado en código commiteado y el `error.message` de Resend se devuelve tal cual al cliente. Además, se quiere un patrón único y explícito para todo servicio de envío de datos: el cliente solo habla con `/api/*`, y toda credencial vive en variables de entorno del servidor.

---

## Scope

**In:**

- Route Handler `app/api/contact/route.ts` con `POST`: parsea JSON, valida campos vacíos server-side, envía el correo y responde con códigos HTTP.
- Módulo `src/lib/contact-mail.ts` con la lógica de envío por Resend (cliente `Resend`, `escapeHtml`, armado de subject/text/html), invocado solo desde el route handler.
- Destinatario movido a la variable de entorno `CONTACT_TO_EMAIL` (ya no hardcodeado en código).
- Respuestas de error genéricas al cliente; el detalle real (`error.message` de Resend, excepciones) solo se registra en servidor con `console.error`.
- `ContactForm.tsx` deja de importar la Server Action y usa `fetch("/api/contact", { method: "POST" })`, manteniendo los mismos estados (`idle`/`sending`/`sent`/`error`) y UX de SPEC 03.
- Eliminar `src/actions/contact.ts`.
- Actualizar `.env.example` con `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=`.

**Out of scope (para futuros specs):**

- Mover el remitente (`onboarding@resend.dev`) a variable de entorno: queda como constante en `src/lib/contact-mail.ts`.
- Validación reforzada (formato de email, longitudes máximas).
- Protección anti-spam (honeypot, captcha, rate limiting).
- Protección CSRF / verificación de origen del request.
- Endpoint genérico reutilizable (`/api/send`) o cualquier otro API Route.
- Cambios visuales en `/about` o en el formulario.
- Tests automatizados.

---

## Data model

No se introduce persistencia. Cambia el contrato entre cliente y servidor:

```ts
// src/lib/contact-mail.ts
export interface ContactPayload {
  name: string;
  email: string;
  msg: string;
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false }>;
```

```ts
// POST /api/contact
// Request body (JSON): ContactPayload
// Responses (JSON):
//   200 { success: true }
//   400 { success: false, error: "Todos los campos son obligatorios." }
//   500 { success: false, error: "No se pudo enviar el mensaje. Intenta de nuevo más tarde." }
```

Variables de entorno (solo servidor, sin prefijo `NEXT_PUBLIC_`):

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`

`sendContactEmail` devuelve `{ ok: false }` si falta `RESEND_API_KEY` o `CONTACT_TO_EMAIL`, si Resend devuelve `error`, o si el SDK lanza una excepción; en todos los casos registra el detalle con `console.error` y no lo propaga.

---

## Implementation plan

1. Actualizar `.env.example` agregando `CONTACT_TO_EMAIL=` (vacío) junto a `RESEND_API_KEY=`. Agregar `CONTACT_TO_EMAIL` al `.env.local` local. El proyecto sigue igual.
2. Crear `src/lib/contact-mail.ts` moviendo desde `src/actions/contact.ts` el cliente `Resend`, `escapeHtml` y el armado del correo; leer el destinatario de `process.env.CONTACT_TO_EMAIL`; devolver `{ ok }` y loguear errores con `console.error`. Sin `"use server"`.
3. Crear `app/api/contact/route.ts` con `POST`: leer el body con `request.json()` (JSON inválido → 400), validar los 3 campos no vacíos tras `trim()` (→ 400), llamar a `sendContactEmail` y responder 200 o 500 según el contrato de Data model. Consultar `node_modules/next/dist/docs/01-app/` para la convención vigente de Route Handlers en Next 16.
4. Actualizar `src/components/About/ContactForm.tsx`: reemplazar la llamada a `sendContactMessage` por `fetch("/api/contact", ...)` con `Content-Type: application/json`; tratar `!res.ok` y fallos de red (`catch`) como estado `error` con el mensaje genérico. Estados y textos de UI sin cambios.
5. Eliminar `src/actions/contact.ts` y confirmar con búsqueda que ningún archivo lo importa.
6. Correr `npm run build`. Con `.env.local` configurado, enviar un mensaje real desde `/about` y confirmar llegada a la casilla de `CONTACT_TO_EMAIL`, con `reply_to` correcto.

---

## Acceptance criteria

- [x] `npm run build` termina sin errores.
- [x] `src/actions/contact.ts` no existe y ningún archivo referencia `sendContactMessage`.
- [x] `POST /api/contact` con body válido y variables configuradas responde 200 `{ success: true }` y llega el correo a `CONTACT_TO_EMAIL` con `reply_to` igual al correo ingresado.
- [x] `POST /api/contact` con algún campo vacío responde 400 sin enviar correo.
- [x] `POST /api/contact` con body que no es JSON válido responde 400.
- [x] Con `RESEND_API_KEY` inválida o ausente responde 500 con el mensaje genérico; el body de la respuesta no contiene texto del error de Resend.
- [x] Con `CONTACT_TO_EMAIL` ausente responde 500 con el mensaje genérico y no envía correo.
- [x] El detalle del fallo aparece en la consola del servidor (`console.error`).
- [x] El código fuente no contiene el correo `jsegovia.ush@gmail.com` (búsqueda en `src/` y `app/`).
- [x] En el navegador, la pestaña Network muestra una llamada a `/api/contact` al enviar el formulario, y ni la API key ni el destinatario aparecen en request, response ni bundle del cliente.
- [x] Enviar el formulario con campos vacíos sigue disparando el shake sin llamar a `/api/contact`.
- [x] Éxito muestra el bloque "terminal success"; fallo muestra la línea de error y "REINTENTAR" conserva los datos escritos.
- [x] `.env.example` documenta `RESEND_API_KEY` y `CONTACT_TO_EMAIL`.

---

## Decisions

- **Sí:** Route Handler `POST /api/contact` específico. Un endpoint por propósito; más simple y auditable que uno genérico.
- **No:** endpoint genérico `/api/send`. Sobreingeniería sin un segundo servicio que lo justifique; se evalúa cuando exista otro envío.
- **Sí:** eliminar la Server Action. Un solo camino de entrada al envío reduce superficie y cumple el patrón "el cliente solo habla con `/api/*`".
- **No:** mantener la Server Action como wrapper. Duplica entradas al mismo servicio.
- **Sí:** errores genéricos + códigos HTTP (400/500); detalle solo en logs de servidor. Evita filtrar información del proveedor al navegador.
- **Sí:** `CONTACT_TO_EMAIL` como variable de entorno. Saca el correo personal del código commiteado.
- **No:** `CONTACT_FROM` como variable de entorno. Se mantiene constante hasta que exista dominio verificado (fuera de alcance de SPEC 03 y 04).
- **No:** validación reforzada (email/longitudes). Se mantiene la validación de campos vacíos de SPEC 03; se puede agregar en un spec futuro.
- **Sí:** lógica de envío en `src/lib/contact-mail.ts`, separada del route handler. El handler queda solo con HTTP; el módulo es reutilizable si aparecen otros envíos.

---

## Risks

| Risk                                                                    | Mitigation                                                                        |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Endpoint HTTP público queda abierto a abuso (spam, agotar cuota Resend) | Aceptado en este spec; anti-spam/rate limiting quedan para un spec futuro.        |
| Falta `CONTACT_TO_EMAIL` en el entorno de deploy                        | Responde 500 genérico y loguea la causa; `.env.example` lo documenta.             |
| Convenciones de Route Handlers cambiaron en Next 16                     | Leer `node_modules/next/dist/docs/01-app/` antes de escribir el handler (paso 3). |

---

## What is **not** in this spec

- Remitente configurable por variable de entorno.
- Validación de formato de email y longitudes máximas.
- Anti-spam, rate limiting o verificación de origen.
- Endpoint genérico de envíos.
- Cambios visuales o de copy en el formulario.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
