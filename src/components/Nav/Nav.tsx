"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/home";
  const isBiblioteca = pathname.startsWith("/juegos");
  const isSalon = pathname === "/salon";
  const isLogin = pathname === "/login";

  const close = () => setOpen(false);

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark} />
          <div className={`${styles.logoText} pixel neon-cyan`}>
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>

        <div className={styles.links}>
          <Link
            href="/home"
            className={`${styles.link} ${isHome ? styles.active : ""}`}
          >
            Inicio
          </Link>
          <Link
            href="/juegos"
            className={`${styles.link} ${isBiblioteca ? styles.active : ""}`}
          >
            Biblioteca
          </Link>
          <Link
            href="/salon"
            className={`${styles.link} ${isSalon ? styles.active : ""}`}
          >
            Salón de la Fama
          </Link>
        </div>

        <div className={styles.spacer} />

        <div className={styles.coinCounter}>
          <span className={styles.coin} />
          <span>CRÉDITOS · 03</span>
        </div>

        <Link href="/login" className={`btn ${styles.authBtn}`}>
          Iniciar Sesión
        </Link>

        <button
          type="button"
          className={`btn ghost ${styles.hamburger}`}
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={`${styles.mobileBackdrop} ${open ? styles.open : ""}`}
        onClick={close}
      />
      <aside className={`${styles.mobilePanel} ${open ? styles.open : ""}`}>
        <div
          className="pixel neon-cyan"
          style={{ fontSize: 11, marginBottom: 16 }}
        >
          MENÚ
        </div>
        <Link href="/home" onClick={close} className={isHome ? styles.active : undefined}>
          Inicio
        </Link>
        <Link href="/juegos" onClick={close} className={isBiblioteca ? styles.active : undefined}>
          Biblioteca
        </Link>
        <Link href="/salon" onClick={close} className={isSalon ? styles.active : undefined}>
          Salón de la Fama
        </Link>
        <Link href="/login" onClick={close} className={isLogin ? styles.active : undefined}>
          Iniciar Sesión
        </Link>
        <div style={{ flex: 1 }} />
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
