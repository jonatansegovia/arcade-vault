"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MiniCard from "@/src/components/MiniCard/MiniCard";
import { GAMES } from "@/src/data/games";
import styles from "./Home.module.css";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.in);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function FloatingSilhouettes() {
  return (
    <div className={styles.homeSilos} aria-hidden="true">
      <svg className={`${styles.silo} ${styles.s1}`} viewBox="0 0 40 32">
        <g fill="#00f5ff">
          <rect x="6" y="4" width="4" height="4" />
          <rect x="30" y="4" width="4" height="4" />
          <rect x="2" y="8" width="36" height="4" />
          <rect x="2" y="12" width="4" height="4" />
          <rect x="14" y="12" width="4" height="4" />
          <rect x="22" y="12" width="4" height="4" />
          <rect x="34" y="12" width="4" height="4" />
          <rect x="2" y="16" width="36" height="4" />
          <rect x="6" y="20" width="4" height="4" />
          <rect x="30" y="20" width="4" height="4" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s2}`} viewBox="0 0 32 32">
        <g fill="#ff006e">
          <rect x="8" y="0" width="16" height="4" />
          <rect x="4" y="4" width="24" height="4" />
          <rect x="0" y="8" width="32" height="12" />
          <rect x="0" y="20" width="6" height="6" />
          <rect x="10" y="20" width="4" height="6" />
          <rect x="18" y="20" width="4" height="6" />
          <rect x="26" y="20" width="6" height="6" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s3}`} viewBox="0 0 32 32">
        <g fill="#f5ff00">
          <rect x="10" y="0" width="12" height="4" />
          <rect x="6" y="4" width="20" height="4" />
          <rect x="4" y="8" width="6" height="6" />
          <rect x="22" y="8" width="6" height="6" />
          <rect x="2" y="14" width="28" height="10" />
          <rect x="6" y="24" width="4" height="4" />
          <rect x="14" y="24" width="4" height="4" />
          <rect x="22" y="24" width="4" height="4" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s4}`} viewBox="0 0 24 24">
        <g fill="#00ff88">
          <rect x="10" y="0" width="4" height="24" />
          <rect x="0" y="10" width="24" height="4" />
          <rect x="6" y="6" width="12" height="12" fill="none" stroke="#00ff88" strokeWidth="2" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s5}`} viewBox="0 0 36 24">
        <g fill="#aa00ff">
          <rect x="14" y="2" width="8" height="4" />
          <rect x="10" y="6" width="16" height="4" />
          <rect x="4" y="10" width="28" height="4" />
          <rect x="0" y="14" width="36" height="4" />
          <rect x="6" y="18" width="4" height="2" />
          <rect x="16" y="18" width="4" height="2" />
          <rect x="26" y="18" width="4" height="2" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s6}`} viewBox="0 0 20 20">
        <g fill="#ffcf3a">
          <rect x="6" y="0" width="8" height="2" />
          <rect x="2" y="2" width="16" height="2" />
          <rect x="0" y="4" width="20" height="12" />
          <rect x="2" y="16" width="16" height="2" />
          <rect x="6" y="18" width="8" height="2" />
          <rect x="8" y="4" width="4" height="12" fill="#0a0a0f" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s7}`} viewBox="0 0 24 22">
        <g fill="#ff3060">
          <rect x="2" y="2" width="6" height="2" />
          <rect x="16" y="2" width="6" height="2" />
          <rect x="0" y="4" width="10" height="4" />
          <rect x="14" y="4" width="10" height="4" />
          <rect x="0" y="8" width="24" height="4" />
          <rect x="2" y="12" width="20" height="2" />
          <rect x="4" y="14" width="16" height="2" />
          <rect x="6" y="16" width="12" height="2" />
          <rect x="8" y="18" width="8" height="2" />
          <rect x="10" y="20" width="4" height="2" />
        </g>
      </svg>
      <svg className={`${styles.silo} ${styles.s8}`} viewBox="0 0 24 24">
        <g fill="#00d4ff">
          <rect x="8" y="2" width="8" height="6" />
          <rect x="2" y="8" width="20" height="8" />
          <rect x="8" y="16" width="8" height="6" />
          <rect x="11" y="6" width="2" height="2" fill="#0a0a0f" />
          <rect x="11" y="16" width="2" height="2" fill="#0a0a0f" />
          <rect x="4" y="11" width="2" height="2" fill="#0a0a0f" />
          <rect x="18" y="11" width="2" height="2" fill="#0a0a0f" />
        </g>
      </svg>
    </div>
  );
}

function FeatureIcon({ kind }: { kind: string }) {
  const C = "currentColor";
  if (kind === "GAMEPAD")
    return (
      <svg className={styles.ftIcon} viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="2" y="6" width="12" height="6" />
          <rect x="0" y="8" width="2" height="4" />
          <rect x="14" y="8" width="2" height="4" />
          <rect x="3" y="8" width="2" height="2" />
          <rect x="2" y="9" width="4" height="0.5" />
          <rect x="11" y="7" width="1.5" height="1.5" />
          <rect x="11" y="10" width="1.5" height="1.5" />
        </g>
      </svg>
    );
  if (kind === "FREE")
    return (
      <svg className={styles.ftIcon} viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="3" y="3" width="10" height="10" fill="none" stroke={C} strokeWidth="1.5" />
          <rect x="5" y="6" width="1.5" height="4" />
          <rect x="5" y="6" width="4" height="1.5" />
          <rect x="5" y="8" width="3" height="1" />
          <rect x="10" y="6" width="1.5" height="4" />
        </g>
      </svg>
    );
  if (kind === "TROPHY")
    return (
      <svg className={styles.ftIcon} viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="3" y="2" width="10" height="2" />
          <rect x="3" y="2" width="2" height="6" />
          <rect x="11" y="2" width="2" height="6" />
          <rect x="5" y="8" width="6" height="2" />
          <rect x="7" y="10" width="2" height="3" />
          <rect x="5" y="13" width="6" height="1.5" />
          <rect x="1" y="3" width="2" height="3" />
          <rect x="13" y="3" width="2" height="3" />
        </g>
      </svg>
    );
  if (kind === "ROCKET")
    return (
      <svg className={styles.ftIcon} viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="7" y="1" width="2" height="2" />
          <rect x="6" y="3" width="4" height="2" />
          <rect x="5" y="5" width="6" height="6" />
          <rect x="4" y="11" width="2" height="2" />
          <rect x="10" y="11" width="2" height="2" />
          <rect x="7" y="6" width="2" height="2" fill="#0a0a0f" />
          <rect x="6" y="13" width="1" height="2" />
          <rect x="9" y="13" width="1" height="2" />
        </g>
      </svg>
    );
  return null;
}

const FEATURES = [
  {
    i: "GAMEPAD",
    t: "JUEGOS CLÁSICOS",
    d: "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    c: "cyan",
  },
  {
    i: "FREE",
    t: "100% GRATIS",
    d: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    c: "yellow",
  },
  {
    i: "TROPHY",
    t: "LADDER BOARDS",
    d: "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    c: "magenta",
  },
  {
    i: "ROCKET",
    t: "SIEMPRE CRECIENDO",
    d: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    c: "green",
  },
] as const;

const STATS = [
  { n: "12+", u: "JUEGOS", s: "Y CONTANDO" },
  { n: "MILES", u: "DE PARTIDAS", s: "JUGADAS CADA DÍA" },
  { n: "GLOBAL", u: "RANKING", s: "COMPITE CON EL MUNDO" },
] as const;

const FEATURE_COLOR_CLASS: Record<(typeof FEATURES)[number]["c"], string> = {
  cyan: styles.cyan,
  magenta: styles.magenta,
  yellow: styles.yellow,
  green: styles.green,
};

export default function Home() {
  useReveal();
  const router = useRouter();
  const featured = GAMES.slice(0, 6);

  return (
    <div className={`fade-in ${styles.home}`}>
      {/* HERO */}
      <section className={styles.homeHero}>
        <FloatingSilhouettes />
        <div className={styles.homeHeroInner}>
          <div className={`${styles.heroEyebrow} pixel neon-yellow`}>
            ▸ INSERTA UNA MONEDA<span className={styles.blink}>_</span>
          </div>
          <h1 className={styles.homeTitle}>
            <span className={styles.line1}>EL ARCADE</span>
            <span className={styles.line2}>CLÁSICO ESTÁ</span>
            <span className={styles.line3}>DE VUELTA</span>
          </h1>
          <p className={styles.homeSub}>
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className={styles.homeCtas}>
            <button
              type="button"
              className="btn xl pulse"
              onClick={() => router.push("/juegos")}
            >
              ▶ EXPLORAR JUEGOS
            </button>
            <button
              type="button"
              className="btn xl magenta"
              onClick={() => router.push("/login")}
            >
              ✦ CREAR CUENTA
            </button>
          </div>
          <div className={styles.heroScroll} aria-hidden="true">
            <span>DESLIZA</span>
            <span className={styles.arrow}>▼</span>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className={`${styles.homeSection} ${styles.reveal}`}>
        <div className={styles.sectionHead}>
          <div className={`${styles.kicker} pixel neon-magenta`}>// 01</div>
          <h2 className={styles.sectionTitle}>¿POR QUÉ ARCADE VAULT?</h2>
          <div className={styles.sectionRule} />
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.t}
              className={`${styles.featureCard} ${FEATURE_COLOR_CLASS[f.c]}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <FeatureIcon kind={f.i} />
              <div className={`${styles.ftTitle} pixel`}>{f.t}</div>
              <div className={styles.ftDesc}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GAMES PREVIEW */}
      <section className={`${styles.homeSection} ${styles.reveal}`}>
        <div className={styles.sectionHead}>
          <div className={`${styles.kicker} pixel neon-cyan`}>// 02</div>
          <h2 className={styles.sectionTitle}>JUEGOS DISPONIBLES AHORA</h2>
          <div className={styles.sectionRule} />
        </div>
        <div className={styles.miniRail}>
          {featured.map((g) => (
            <MiniCard key={g.id} game={g} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/juegos" className="btn lg">
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className={`${styles.homeStats} ${styles.reveal}`}>
        <div className={styles.statsInner}>
          {STATS.map((st, i) => (
            <div key={st.u} className={styles.statBlock} style={{ transitionDelay: `${i * 90}ms` }}>
              <div className={`${styles.statN} neon-yellow`}>{st.n}</div>
              <div className={`${styles.statU} pixel`}>{st.u}</div>
              <div className={styles.statS}>{st.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className={`${styles.homeSection} ${styles.reveal}`}>
        <div className={styles.sectionHead}>
          <div className={`${styles.kicker} pixel neon-green`}>// 04</div>
          <h2 className={styles.sectionTitle}>PRECIOS</h2>
          <div className={styles.sectionRule} />
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.priceCard}>
            <div className={`${styles.pcLabel} pixel`}>PLAN ÚNICO</div>
            <div className={`${styles.pcName} pixel`}>JUGADOR VAULT</div>
            <div className={styles.pcAmount}>
              <span className={styles.pcAmountN}>$0</span>
              <span className={styles.pcAmountU}>/ SIEMPRE</span>
            </div>
            <div className={`${styles.pcTag} pixel`}>SIN TRUCOS · SIN LETRA PEQUEÑA</div>
            <ul className={styles.pcList}>
              <li>✔ Acceso a todos los juegos</li>
              <li>✔ Ranking global y salón de la fama</li>
              <li>✔ Sin anuncios entre partidas</li>
              <li>✔ Guarda tus puntuaciones</li>
              <li>✔ Nuevos juegos cada mes</li>
              <li>✔ Funciona en cualquier navegador</li>
            </ul>
            <button
              type="button"
              className="btn xl pulse"
              style={{ width: "100%" }}
              onClick={() => router.push("/login")}
            >
              EMPEZAR GRATIS →
            </button>
            <div className={styles.pcFoot}>No pedimos tarjeta. Nunca lo haremos.</div>
            <div className={`${styles.pcStamp} pixel`}>
              FREE
              <br />
              PLAY
            </div>
          </div>

          <div className={styles.pricingFaq}>
            <div className={styles.faqItem}>
              <div className={`${styles.faqQ} pixel`}>¿REALMENTE ES GRATIS?</div>
              <div className={styles.faqA}>
                Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No
                hay versión &quot;premium&quot; escondida.
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={`${styles.faqQ} pixel`}>¿NECESITO CREAR CUENTA?</div>
              <div className={styles.faqA}>
                No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el
                ranking, regístrate en 10 segundos.
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={`${styles.faqQ} pixel`}>¿CÓMO SOBREVIVEN SIN COBRAR?</div>
              <div className={styles.faqA}>
                Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que
                aceptamos.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={`${styles.homeFinal} ${styles.reveal}`}>
        <h2 className={`${styles.finalTitle} pixel`}>¿LISTO PARA JUGAR?</h2>
        <button
          type="button"
          className={`btn xl pulse ${styles.finalCta}`}
          onClick={() => router.push("/juegos")}
        >
          INSERTAR MONEDA →
        </button>
        <div className={styles.finalTag}>Gratis. Sin registro obligatorio. Empieza en segundos.</div>
      </section>
    </div>
  );
}
