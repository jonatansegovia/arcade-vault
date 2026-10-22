import { createClient } from "@/src/lib/supabase/server";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

function unavailable(error: string) {
  return Response.json({ ok: false, error }, { status: 503 });
}

export async function GET() {
  const missing = REQUIRED_ENV.find((name) => !process.env[name]);
  if (missing) {
    return unavailable(`Falta la variable de entorno ${missing}.`);
  }

  try {
    await createClient();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return unavailable("Supabase respondió con error.");
    }
  } catch {
    return unavailable("No se pudo conectar con Supabase.");
  }

  return Response.json({ ok: true });
}
