import { sendContactEmail } from "@/src/lib/contact-mail";

const REQUIRED_FIELDS_ERROR = "Todos los campos son obligatorios.";
const SEND_FAILED_ERROR =
  "No se pudo enviar el mensaje. Intenta de nuevo más tarde.";

function badRequest() {
  return Response.json(
    { success: false, error: REQUIRED_FIELDS_ERROR },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const msg = typeof data.msg === "string" ? data.msg.trim() : "";

  if (!name || !email || !msg) {
    return badRequest();
  }

  const result = await sendContactEmail({ name, email, msg });

  if (!result.ok) {
    return Response.json(
      { success: false, error: SEND_FAILED_ERROR },
      { status: 500 },
    );
  }

  return Response.json({ success: true });
}
