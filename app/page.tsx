"use client";

import { useMemo, useState } from "react";
import GameCard from "@/src/components/GameCard/GameCard";
import { CATEGORIES, GAMES } from "@/src/data/games";
import styles from "./page.module.css";

export default function Home() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("TODOS");

  const filtered = useMemo(() => {
    return GAMES.filter(
      (g) =>
        (cat === "TODOS" || g.cat === cat) &&
        g.title.toLowerCase().includes(q.toLowerCase()),
    );
  }, [q, cat]);

  return (
    <div className="fade-in">
      <section className={styles.hero}>
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className={styles.sub}>
          INSERTA UNA MONEDA PARA JUGAR <span className={styles.blink}>_</span>
        </div>
      </section>

      <div className={styles.filters}>
        <div className={styles.search}>
          <span className={styles.ico}>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar un juego por nombre…"
          />
        </div>
        <div className={styles.chips}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chip} ${cat === c ? styles.active : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <div className={`pixel ${styles.emptyTitle}`}>NO HAY RESULTADOS</div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </div>
  );
}
