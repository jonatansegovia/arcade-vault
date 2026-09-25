"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Game } from "@/src/data/games";
import styles from "./GameCard.module.css";

export default function GameCard({ game }: { game: Game }) {
  const tiltRef = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  const btnColorClass =
    game.color === "magenta" ? "magenta" : game.color === "yellow" ? "yellow" : "";

  return (
    <Link
      href={`/juegos/${game.id}`}
      ref={tiltRef}
      className={styles.card}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className={styles.cover}>
        <div className={`cover-bg ${game.cover}`} />
        <div className={styles.label}>{game.cat}</div>
      </div>
      <div className={styles.meta}>
        <div className={styles.title}>{game.title}</div>
        <div className={styles.desc}>{game.short}</div>
        <div className={styles.row}>
          <div className={styles.scoreBadge}>
            <span>MEJOR PUNTUACIÓN</span>
            <b>{game.best.toLocaleString("es-ES")}</b>
          </div>
          <span className={`btn ${btnColorClass}`}>JUGAR</span>
        </div>
      </div>
    </Link>
  );
}
