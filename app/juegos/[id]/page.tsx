import { notFound } from "next/navigation";
import GameDetail from "@/src/components/GameDetail/GameDetail";
import { GAMES } from "@/src/data/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

export default async function GameDetailPage({
  params,
}: PageProps<"/juegos/[id]">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);

  if (!game) {
    notFound();
  }

  return <GameDetail game={game} />;
}
