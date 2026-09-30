import { Resend } from "resend";

export interface ContactPayload {
  name: string;
  email: string;
  msg: string;
}

const CONTACT_FROM = "onboarding@resend.dev";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    console.error(
      "[contact-mail] Falta configuración: RESEND_API_KEY o CONTACT_TO_EMAIL no definidas.",
    );
    return { ok: false };
  }

  const { name, email, msg } = payload;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${msg}`,
      html: `<p><strong>De:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(msg).replace(/\n/g, "<br />")}</p>`,
    });

    if (error) {
      console.error("[contact-mail] Resend devolvió un error:", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact-mail] Excepción al enviar el correo:", err);
    return { ok: false };
  }
}
