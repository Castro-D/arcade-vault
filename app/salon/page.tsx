import { HallOfFame } from "../components/hall-of-fame";
import { getGames } from "../data/games";
import { getScores, type ScoreRow } from "../data/scores";

export default async function HallPage() {
  const games = await getGames();
  const entries = await Promise.all(
    games.map(async (g): Promise<[string, ScoreRow[]]> => [g.id, await getScores(g.id, 12)]),
  );
  return <HallOfFame games={games} rowsByGame={Object.fromEntries(entries)} />;
}
