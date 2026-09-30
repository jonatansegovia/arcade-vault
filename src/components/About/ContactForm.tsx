"use client";

import { useState } from "react";
import styles from "./About.module.css";

type Status = "idle" | "sending" | "sent" | "error";

const SEND_ERROR_MESSAGE =
  "No se pudo enviar el mensaje. Intenta de nuevo más tarde.";

const EMPTY_FORM = { name: "", email: "", msg: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === "sending") return;
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSentName(form.name.trim());
      setStatus("sent");
    } catch {
      setError(SEND_ERROR_MESSAGE);
      setStatus("error");
    }
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setSentName("");
    setError("");
    setStatus("idle");
  };

  return (
    <form
      className={`${styles.contactForm}${shake ? ` ${styles.shake}` : ""}`}
      onSubmit={onSubmit}
    >
      {status === "sent" ? (
        <div className={styles.terminalSuccess}>
          <div className={styles.termBar}>
            <span className={`${styles.dot} ${styles.r}`} />
            <span className={`${styles.dot} ${styles.y}`} />
            <span className={`${styles.dot} ${styles.g}`} />
            <span className={styles.termTitle}>VAULT-OS // TERMINAL</span>
          </div>
          <div className={styles.termBody}>
            <div className={styles.line}>
              <span className={styles.prompt}>vault@arcade:~$</span>{" "}
              ./send_message --to=team
            </div>
            <div className={`${styles.line} ${styles.dim}`}>
              [OK] Conectando con servidor…
            </div>
            <div className={`${styles.line} ${styles.dim}`}>
              [OK] Validando contenido…
            </div>
            <div className={`${styles.line} ${styles.dim}`}>
              [OK] Transmitiendo paquete…
            </div>
            <div className={`${styles.line} ${styles.success}`}>
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{" "}
              {sentName.toUpperCase()}.<span className={styles.caret}>_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      ) : status === "error" ? (
        <div className={`${styles.terminalSuccess} ${styles.terminalError}`}>
          <div className={styles.termBar}>
            <span className={`${styles.dot} ${styles.r}`} />
            <span className={`${styles.dot} ${styles.y}`} />
            <span className={`${styles.dot} ${styles.g}`} />
            <span className={styles.termTitle}>VAULT-OS // TERMINAL</span>
          </div>
          <div className={styles.termBody}>
            <div className={styles.line}>
              <span className={styles.prompt}>vault@arcade:~$</span>{" "}
              ./send_message --to=team
            </div>
            <div className={`${styles.line} ${styles.dim}`}>
              [OK] Conectando con servidor…
            </div>
            <div className={`${styles.line} ${styles.errorLine}`} role="alert">
              &gt; [ERROR] NO SE PUDO ENVIAR EL MENSAJE: {error}
              <span className={styles.caret}>_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setStatus("idle")}
              >
                REINTENTAR
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-msg">MENSAJE</label>
            <textarea
              id="contact-msg"
              rows={5}
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
            />
          </div>
          <button
            className={`btn xl ${styles.press}`}
            type="submit"
            style={{ width: "100%" }}
            disabled={status === "sending"}
          >
            {status === "sending" ? "ENVIANDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      )}
    </form>
  );
}
