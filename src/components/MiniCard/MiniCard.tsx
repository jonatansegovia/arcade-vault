"use client";

import Link from "next/link";
import type { Game } from "@/src/data/games";
import styles from "./MiniCard.module.css";

export default function MiniCard({ game }: { game: Game }) {
  return (
    <Link href={`/juegos/${game.id}`} className={styles.card}>
      <div className={styles.cover}>
        <div className={`cover-bg ${game.cover}`} />
      </div>
      <div className={styles.meta}>
        <div className={styles.title}>{game.title}</div>
        <div className={styles.cat}>{game.cat}</div>
      </div>
    </Link>
  );
}
