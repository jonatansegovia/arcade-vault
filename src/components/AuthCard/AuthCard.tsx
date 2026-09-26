"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./AuthCard.module.css";

export default function AuthCard() {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`${styles.wrap} fade-in`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.mark} />
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.16em", marginTop: 6 }}
          >
            ACCESO AL SISTEMA · v2.6
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === "in" ? styles.on : ""}
            onClick={() => setTab("in")}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            className={tab === "up" ? styles.on : ""}
            onClick={() => setTab("up")}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit}>
          <div className={styles.field}>
            <label>Usuario</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="px_kai" />
          </div>
          {tab === "up" && (
            <div className={`${styles.field} slide-in`}>
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugador@vault.gg"
              />
            </div>
          )}
          <div className={styles.field}>
            <label>Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn lg" type="submit" style={{ width: "100%", marginTop: 8 }}>
            {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <Link href="/" className="btn ghost" style={{ width: "100%", marginTop: 10 }}>
          JUGAR COMO INVITADO
        </Link>

        <div className={styles.divider}>O CONTINÚA CON</div>
        <div className={styles.social}>
          <button className="btn ghost" type="button">
            ◆ GOOGLE
          </button>
          <button className="btn ghost" type="button">
            ▣ GITHUB
          </button>
        </div>

        <div className={styles.terms}>AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE</div>
      </div>
    </div>
  );
}
