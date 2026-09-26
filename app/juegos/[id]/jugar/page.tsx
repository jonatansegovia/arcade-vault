"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import GamePlayer from "@/src/components/GamePlayer/GamePlayer";
import { GAMES } from "@/src/data/games";

export default function GamePlayerPage() {
  const params = useParams<{ id: string }>();
  const game = GAMES.find((g) => g.id === params.id);

  if (!game) {
    return (
      <div className="fade-in" style={{ padding: 80, textAlign: "center" }}>
        <div className="pixel neon-magenta" style={{ fontSize: 16, marginBottom: 12 }}>
          JUEGO NO ENCONTRADO
        </div>
        <Link href="/" className="btn">
          VOLVER AL VAULT
        </Link>
      </div>
    );
  }

  return <GamePlayer game={game} />;
}
