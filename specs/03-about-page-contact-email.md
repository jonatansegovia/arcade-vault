# SPEC 03 — Página About y envío de correo de contacto (Resend)

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-09-29
> **Objective:** Implementar la página `/about` (Acerca de + Contacto) portada de `references/templates/home-about/about.jsx`, con envío real del formulario de contacto por correo usando la API de Resend.

---

## Scope

**In:**

- Ruta `/about` — About: hero ("ACERCA DE ARCADE VAULT" + misión), fila de 3 highlights (HECHO CON ❤️ / JUEGOS EN HTML / PROYECTO EN CRECIMIENTO), divisor animado de píxeles y sección de contacto (intro + tips + formulario), portada desde `about.jsx`.
- Formulario de contacto funcional: campos Nombre, Correo electrónico, Mensaje, validación de campos vacíos (shake, igual que el template), y envío real de un correo vía la API de Resend al enviar.
- Server Action `sendContactMessage` que recibe los datos del formulario, valida server-side, y envía el correo con el SDK `resend` (paquete npm `resend`).
- Correo enviado desde `onboarding@resend.dev` (dominio de pruebas de Resend, sin verificación de dominio propio) hacia `jsegovia.ush@gmail.com`, con `reply_to` seteado al correo ingresado por el visitante.
- Estado de éxito ("terminal success") igual al template al confirmarse el envío, y estado de error inline (línea de error en la terminal) si el envío falla, sin perder los datos escritos.
- `.env.example` con la variable `RESEND_API_KEY=` documentada.
- Actualizar `Nav`: agregar el link "Acerca de" → `/about` (desktop y panel móvil), ajustando el estado activo.

**Out of scope (para futuros specs):**

- Protección anti-spam (honeypot, captcha, rate limiting). Se puede agregar en un spec futuro si aparece spam real.
- Envío desde un dominio propio verificado en Resend (se usa `onboarding@resend.dev` en este spec).
- Persistencia de los mensajes de contacto (no se guarda ningún mensaje en base de datos ni archivo; solo se envía el correo).
- Notificaciones al usuario por email (ej. copia de confirmación al visitante). Solo se le notifica en pantalla (estado "terminal success"/error).
- Tests automatizados.
- Cualquier cambio a las rutas `/home`, `/juegos`, `/login`, `/salon` ya implementadas.

---

## Data model

No se introduce persistencia. Sí se define la forma de los datos que viajan entre el formulario y la Server Action:

```ts
// src/actions/contact.ts
export interface ContactFormPayload {
  name: string;
  email: string;
  msg: string;
}

export interface ContactFormResult {
  success: boolean;
  error?: string;
}

export async function sendContactMessage(
  payload: ContactFormPayload,
): Promise<ContactFormResult>;
```

`sendContactMessage` es una Server Action (`"use server"`) que valida que los 3 campos no estén vacíos, instancia el cliente `Resend` con `process.env.RESEND_API_KEY`, y llama a `resend.emails.send({ from: "onboarding@resend.dev", to: "jsegovia.ush@gmail.com", reply_to: payload.email, subject: ..., text/html: ... })`. No se define ningún modelo con ID, versionado ni almacenamiento.

---

## Implementation plan

1. Instalar la dependencia `resend` (`npm install resend`). El proyecto sigue compilando.
2. Crear `.env.example` en la raíz con `RESEND_API_KEY=` (vacío) y confirmar que `.env*.local` ya está ignorado por `.gitignore` (default de `create-next-app`).
3. Crear `src/actions/contact.ts` con la Server Action `sendContactMessage` descrita en Data model: validación server-side de campos vacíos, envío vía `resend.emails.send`, devuelve `{ success, error? }` capturando cualquier excepción del SDK como `error`.
4. Crear `src/components/About/About.tsx` + `About.module.css`, portando de `about.jsx` el hero (kicker, título, misión), la fila de highlights (3 tarjetas con íconos SVG pixel) y el divisor animado de píxeles, con la misma animación `.reveal` (IntersectionObserver) que usa `Home`.
5. Crear `src/components/About/ContactForm.tsx` (client component) portando el formulario de `about.jsx`: estado `form`/`sent`/`shake`/`error`, validación de campos vacíos con shake, `onSubmit` que llama a `sendContactMessage`; en éxito muestra el bloque "terminal success" (con el nombre del remitente); en error muestra una línea de error dentro de la misma terminal y permite reintentar sin perder los datos escritos.
6. Crear `app/about/page.tsx` que renderiza `<About />` (incluye `<ContactForm />` dentro de la sección de contacto). Verificar que `/about` es navegable directamente.
7. Actualizar `src/components/Nav/Nav.tsx`: agregar el link "Acerca de" → `/about` (desktop y panel móvil) y ajustar `isActive` para la nueva ruta.
8. Migrar los estilos de `about.jsx` (`about-hero`, `highlight-row`, `about-divider`, `about-contact`, `contact-grid`, `contact-form`, `terminal-success`, animación `.shake`) desde `styles.css` a `About.module.css`, siguiendo el mismo patrón CSS Modules + tokens Tailwind v4 usado en `Home`.
9. Correr `npm run build` y revisar visualmente `/about` contra el template de referencia. Con `RESEND_API_KEY` configurada localmente en `.env.local`, enviar un mensaje de prueba real y confirmar que llega a `jsegovia.ush@gmail.com` con `reply_to` correcto.

---

## Acceptance criteria

- [ ] `npm run build` termina sin errores.
- [ ] `/about` muestra el hero ("ACERCA DE ARCADE VAULT"), la misión, los 3 highlights y el divisor animado.
- [ ] La sección de contacto muestra la intro, los 3 tips y el formulario con campos Nombre, Correo electrónico y Mensaje.
- [ ] Enviar el formulario con algún campo vacío dispara la animación shake y no envía el correo.
- [ ] Enviar el formulario completo con `RESEND_API_KEY` configurada envía un correo real a `jsegovia.ush@gmail.com` con `reply_to` igual al correo ingresado.
- [ ] Al enviar exitosamente, el formulario se reemplaza por el bloque "terminal success" mostrando el nombre ingresado en mayúsculas.
- [ ] "ENVIAR OTRO MENSAJE" en el estado de éxito limpia el formulario y permite un nuevo envío.
- [ ] Si el envío falla (ej. `RESEND_API_KEY` inválida o ausente), se muestra una línea de error dentro de la terminal y los datos del formulario no se pierden.
- [ ] El Nav (desktop y panel móvil) muestra "Acerca de" y queda activo en `/about`.
- [ ] Recargar `/about` directamente (sin navegar desde otra ruta) la renderiza correctamente.
- [ ] `.env.example` existe y documenta `RESEND_API_KEY`.

---

## Decisions

- **Sí:** Server Action (`"use server"`) en vez de un API Route (`app/api/contact/route.ts`) para el envío del formulario. Es el patrón idiomático de App Router para mutaciones desde un form sin exponer un endpoint HTTP adicional.
- **Sí:** enviar desde `onboarding@resend.dev` (dominio de pruebas de Resend) en vez de un dominio propio verificado. No hay dominio verificado disponible todavía; queda documentado como decisión explícita para no bloquear este spec.
- **Sí:** `reply_to` en el correo enviado, seteado al email que ingresó el visitante, para poder responderle directamente desde el inbox de destino.
- **Sí:** agregar el link "Acerca de" al Nav en este spec, cerrando el pendiente que dejó SPEC 02 explícitamente fuera de alcance.
- **No:** protección anti-spam (honeypot/captcha/rate limiting). Se define fuera de alcance para este MVP; se evalúa en un spec futuro si aparece spam real.
- **No:** persistir los mensajes de contacto en ningún storage. El formulario solo dispara un envío de correo; si el correo falla, el usuario ve el error y puede reintentar, pero nada queda guardado.
- **Sí:** manejo de error inline (línea de error dentro de la terminal) en vez de mostrar siempre "success" aunque el envío falle. Evita confundir al usuario cuando el correo realmente no llegó.

---

## What is **not** in this spec

- Protección anti-spam (honeypot, captcha, rate limiting).
- Dominio propio verificado en Resend.
- Persistencia de mensajes de contacto.
- Email de confirmación al visitante.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
