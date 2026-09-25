"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GAMES } from "@/src/data/games";
import { seededScores } from "@/src/data/scores";
import styles from "./HallOfFame.module.css";

export default function HallOfFame() {
  const [tab, setTab] = useState(GAMES[0].id);
  const rows = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);

  return (
    <div className={`${styles.hall} fade-in`}>
      <div className={styles.head}>
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className={styles.tabs}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip ${tab === g.id ? "active" : ""}`}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className={styles.podium}>
        <div className={`${styles.slot} ${styles.silver}`}>
          <div className={styles.rankNum}>02</div>
          <div className={styles.slotName}>{rows[1].name}</div>
          <div className={styles.slotScore}>{rows[1].score.toLocaleString("es-ES")}</div>
          <div className={styles.slotDate}>{rows[1].date}</div>
        </div>
        <div className={`${styles.slot} ${styles.gold}`}>
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
            CAMPEÓN
          </div>
          <div className={styles.rankNum} style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className={styles.slotName}>{rows[0].name}</div>
          <div className={styles.slotScore} style={{ fontSize: 20 }}>
            {rows[0].score.toLocaleString("es-ES")}
          </div>
          <div className={styles.slotDate}>{rows[0].date}</div>
        </div>
        <div className={`${styles.slot} ${styles.bronze}`}>
          <div className={styles.rankNum}>03</div>
          <div className={styles.slotName}>{rows[2].name}</div>
          <div className={styles.slotScore}>{rows[2].score.toLocaleString("es-ES")}</div>
          <div className={styles.slotDate}>{rows[2].date}</div>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.th}>
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.name + i}
            className={`${styles.tr} ${
              i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ""
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={styles.rk}>#{String(r.rank).padStart(2, "0")}</div>
            <div className={styles.pl}>{r.name}</div>
            <div className={styles.sc}>{r.score.toLocaleString("es-ES")}</div>
            <div className={styles.dt}>{r.date}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
