"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Game } from "@/src/data/games";
import styles from "./GamePlayer.module.css";

export default function GamePlayer({ game }: { game: Game }) {
  const [score, setScore] = useState(0);
  const [lives] = useState(3);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("INVITADO");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (over || paused) return;
    const t = setInterval(() => {
      setScore((s) => {
        const next = s + Math.floor(10 + Math.random() * 90);
        if (Math.floor(next / 2500) > Math.floor(s / 2500)) {
          setLevel((l) => l + 1);
        }
        return next;
      });
    }, 220);
    return () => clearInterval(t);
  }, [over, paused]);

  const endGame = () => setOver(true);
  const restart = () => {
    setScore(0);
    setLevel(1);
    setPaused(false);
    setOver(false);
    setSaved(false);
  };

  return (
    <div className={`${styles.player} fade-in`}>
      <div className={styles.hud}>
        <div className={styles.hudStats}>
          <div className={styles.hudStat}>
            <div className={styles.hudLabel}>Jugador</div>
            <div className={styles.hudValue} style={{ color: "var(--ink)" }}>
              {name}
            </div>
          </div>
          <div className={styles.hudStat}>
            <div className={styles.hudLabel}>Puntuación</div>
            <div className={styles.hudValue}>{score.toLocaleString("es-ES")}</div>
          </div>
          <div className={styles.hudStat}>
            <div className={styles.hudLabel}>Vidas</div>
            <div className={styles.hudValueLives}>{"♥ ".repeat(lives).trim() || "—"}</div>
          </div>
          <div className={styles.hudStat}>
            <div className={styles.hudLabel}>Nivel</div>
            <div className={styles.hudValueLevel}>{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className={styles.hudActions}>
          <button type="button" className="btn yellow" onClick={() => setPaused((p) => !p)}>
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button type="button" className="btn magenta" onClick={endGame}>
            FIN
          </button>
          <Link href={`/juegos/${game.id}`} className="btn ghost">
            SALIR
          </Link>
        </div>
      </div>

      <div className={styles.crt}>
        <div className={styles.crtScreen}>
          <div className={styles.arena}>
            <div className={styles.gridFloor} />
            <div className={`${styles.enemy} ${styles.e1}`} />
            <div className={`${styles.enemy} ${styles.e2}`} />
            <div className={`${styles.enemy} ${styles.e3}`} />
            <div className={styles.playerShip} />
          </div>
          {paused && (
            <div className={styles.crtContent} style={{ background: "rgba(0,0,0,0.6)", zIndex: 5 }}>
              <div>
                <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                  EN PAUSA
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 10, letterSpacing: "0.16em" }}
                >
                  PULSA REANUDAR PARA CONTINUAR
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.crtBottom}>
          <span className={styles.led}>SEÑAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>

      {over && (
        <div className={styles.modalBd}>
          <div className={styles.modal}>
            <h2>FIN DEL JUEGO</h2>
            <div className={styles.finalLabel}>PUNTUACIÓN FINAL</div>
            <div className={styles.final}>{score.toLocaleString("es-ES")}</div>
            {!saved ? (
              <div className={styles.inputRow}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="TUS INICIALES"
                />
                <button type="button" className="btn yellow" onClick={() => setSaved(true)}>
                  GUARDAR PUNTUACIÓN
                </button>
              </div>
            ) : (
              <div className={styles.toastSaved}>▸ PUNTUACIÓN GUARDADA_</div>
            )}
            <div className={styles.modalActions}>
              <button type="button" className="btn" onClick={restart}>
                JUGAR DE NUEVO
              </button>
              <Link href="/" className="btn magenta">
                VOLVER AL VAULT
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
