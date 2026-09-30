"use server";

import { Resend } from "resend";

export interface ContactFormPayload {
  name: string;
  email: string;
  msg: string;
}

export interface ContactFormResult {
  success: boolean;
  error?: string;
}

const CONTACT_FROM = "onboarding@resend.dev";
const CONTACT_TO = "jsegovia.ush@gmail.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactMessage(
  payload: ContactFormPayload,
): Promise<ContactFormResult> {
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const msg = payload.msg?.trim();

  if (!name || !email || !msg) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${msg}`,
      html: `<p><strong>De:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(msg).replace(/\n/g, "<br />")}</p>`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "No se pudo enviar el mensaje.",
    };
  }
}
