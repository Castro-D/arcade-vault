import { notFound } from "next/navigation";
import { GamePlayer } from "@/app/components/game-player";
import { getGame, getGames } from "@/app/data/games";

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((g) => ({ id: g.id }));
}

export default async function PlayerPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
