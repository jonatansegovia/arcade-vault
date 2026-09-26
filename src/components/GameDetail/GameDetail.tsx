import Link from "next/link";
import type { Game } from "@/src/data/games";
import { seededScores } from "@/src/data/scores";
import styles from "./GameDetail.module.css";

export default function GameDetail({ game }: { game: Game }) {
  const scores = seededScores(game.id.length * 17 + 3, 10);

  return (
    <div className={`${styles.detail} fade-in`}>
      <div>
        <div className={styles.cover}>
          <div className={`cover-bg ${game.cover}`} />
        </div>
        <div className={styles.info}>
          <div className={styles.tags}>
            <span>{game.cat}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
            <span>RETRO 1985</span>
          </div>
          <h2 className="neon-cyan">{game.title}</h2>
          <p>{game.long}</p>
          <div className={styles.statStrip}>
            <div>
              <div className={styles.statLabel}>Partidas</div>
              <div className={styles.statValue}>{game.plays}</div>
            </div>
            <div>
              <div className={styles.statLabel}>Mejor global</div>
              <div
                className={styles.statValue}
                style={{ color: "var(--magenta)", textShadow: "0 0 6px rgba(255,0,110,0.5)" }}
              >
                {game.best.toLocaleString("es-ES")}
              </div>
            </div>
            <div>
              <div className={styles.statLabel}>Dificultad</div>
              <div
                className={styles.statValue}
                style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}
              >
                ★ ★ ★ ☆ ☆
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Link href={`/juegos/${game.id}/jugar`} className="btn xl pulse">
              ▶ JUGAR AHORA
            </Link>
            <Link href="/" className="btn ghost lg">
              VOLVER AL VAULT
            </Link>
          </div>
        </div>
      </div>

      <aside>
        <div className={styles.leaderboard}>
          <h3>MEJORES PUNTUACIONES</h3>
          {scores.map((r, i) => (
            <div
              key={r.name}
              className={`${styles.lbRow} ${
                i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ""
              }`}
            >
              <div className={styles.lbRank}>#{String(r.rank).padStart(2, "0")}</div>
              <div className={styles.lbPlayer}>
                {r.name}
                <div className={styles.lbDate}>{r.date}</div>
              </div>
              <div className={styles.lbScore}>{r.score.toLocaleString("es-ES")}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
