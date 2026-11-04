import { Library } from "./components/library";
import { getGames } from "./data/games";

export default async function Home() {
  const games = await getGames();
  return <Library games={games} />;
}
