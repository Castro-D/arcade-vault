# SPEC 01 — MVP visual screens

> **Status:** Approved
> **Depends on:** None (theme already ported to `app/globals.css` and fonts/background wired in `app/layout.tsx`)
> **Date:** 2026-10-29
> **Objective:** Build all five prototype screens (library, game detail, player, auth, hall of fame) as Next.js App Router routes with mock data, visuals only, no real game logic.

## Why this spec exists

`references/templates/` is a React-in-the-browser prototype with a hash router and global `window.*` components. It cannot be copied; it has to be re-expressed in the Next.js App Router. This spec fixes the route map, the server/client split and the shape of the mock data layer so a later spec can swap `app/data` for a real DB and add real games without touching the screens.

## Scope

**In:**

- Routes (UI copy stays in Spanish, as in the prototype):
  - `/` — Library (hero, search, category chips, game grid).
  - `/juegos/[id]` — Game detail (cover, tags, stats, play button, top-10 leaderboard).
  - `/juegos/[id]/jugar` — Player (HUD, CRT frame with decorative arena, pause, end, game-over modal with save score).
  - `/acceso` — Auth (sign in / create account tabs, guest button, social buttons that do nothing).
  - `/salon` — Hall of Fame (game tabs, podium, top-12 table, "your best" row when logged in).
- Shared shell: `Nav` (desktop links, coin counter, auth button, mobile drawer) and footer, rendered from `app/layout.tsx`.
- Mock data in `app/data/` with typed async accessor functions.
- Fake session and saved scores persisted in `localStorage` (`av_user`, `av_scores`) behind a small client module.
- Mock player: an interval increments the score so the game-over and save-score flow can be exercised.
- 404 for unknown game ids.
- Responsive behavior already defined in `app/globals.css` (mobile drawer, grids).

**Out of scope (for future specs):**

- Any real game logic, canvas, input handling or game loop.
- Real authentication (OAuth, passwords, sessions, cookies) and a real database.
- Social login buttons doing anything.
- Reading `av_scores` back into the leaderboards (they keep showing seeded data).
- Tests and a test runner.
- i18n (copy is Spanish only).
- Changes to the theme in `app/globals.css`, except fixes for bugs found while building screens.

## Data model

Types and accessors live in `app/data/`. The seeded generator is ported from `references/templates/data.jsx` and stays deterministic.

```ts
// app/data/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
  id: string;            // slug, e.g. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;         // CSS class, e.g. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;         // display string, e.g. "12.4K"
};

export const CATEGORIES = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;

export async function getGames(): Promise<Game[]>;
export async function getGame(id: string): Promise<Game | undefined>;
```

```ts
// app/data/scores.ts
export type ScoreRow = { rank: number; name: string; score: number; date: string }; // date "DD/MM/2026"

export async function getScores(gameId: string, count?: number): Promise<ScoreRow[]>;
```

```ts
// app/lib/session.ts (client only)
export type SessionUser = { name: string };            // uppercased, max 10 chars
export type SavedScore = { game: string; score: number; name: string; at: number };

// localStorage keys: "av_user", "av_scores"
```

Conventions:

- The 8 games and the player pool are copied verbatim from the prototype.
- Seeds: detail uses `id.length * 17 + 3` with 10 rows; hall of fame uses `gameId.length * 23 + 7` with 12 rows. This keeps the prototype's numbers.
- Numbers are formatted with `toLocaleString("es-ES")`.
- `localStorage` access is wrapped in try/catch and falls back to "no user" / no-op.

## Implementation plan

1. Create `app/data/games.ts` and `app/data/scores.ts` with the types, the 8 games and the seeded generator. Check: a throwaway server page logs `getGames()` and `getScores("caida")`; remove it afterwards.
2. Create `app/lib/session.ts` plus a `SessionProvider` client component (`app/components/session-provider.tsx`) exposing `user`, `login`, `logout`, `saveScore` via a `useSession` hook. Mount it in `app/layout.tsx`. Check: the app still renders.
3. Create `app/components/nav.tsx` (client) and the footer; mount both in `app/layout.tsx` around `{children}` inside `<main className="av-main">`. Replace the scaffold `app/page.tsx` with a placeholder. Check: nav links, active state, mobile drawer open/close and logo link.
4. Build the library at `/`: `app/page.tsx` (server, calls `getGames()`) and `app/components/library.tsx` (client: search, chips, empty state) with `game-card.tsx` (tilt effect, links to `/juegos/[id]`). Check: filtering by text and category, empty state, card and "JUGAR" button navigate to detail.
5. Build the detail at `/juegos/[id]`: `app/juegos/[id]/page.tsx` (server, `getGame` + `getScores`, `notFound()` when missing). Check: all 8 ids render, an unknown id shows 404, "JUGAR AHORA" and "VOLVER AL VAULT" navigate.
6. Build the auth screen at `/acceso`: `app/acceso/page.tsx` and `app/components/auth-form.tsx` (client: tabs, fields, submit, guest). Submit calls `login` and redirects to `/`; guest calls `logout` and redirects to `/`. Check: nav shows the user name after login and keeps it after reload.
7. Build the player at `/juegos/[id]/jugar`: `app/juegos/[id]/jugar/page.tsx` (server) and `app/components/game-player.tsx` (client: HUD, pause, end, mock score interval, game-over modal, save score via `saveScore`). Check: score ticks, pause stops it, FIN opens the modal, saving writes to `av_scores` and shows the toast, "JUGAR DE NUEVO" resets.
8. Build the hall of fame at `/salon`: `app/salon/page.tsx` (server, loads games and rows) and `app/components/hall-of-fame.tsx` (client: tab switching, podium, table, "your best" row only when logged in). Check: switching tabs changes rows and podium; the "your best" row appears only when logged in.
9. Update `metadata` in `app/layout.tsx` and set per-route titles. Remove unused scaffold assets from `public/` only if nothing references them.

## Acceptance criteria

- [ ] `npm run build` completes with no errors.
- [ ] `npm run lint` reports no errors.
- [ ] The browser console shows no errors or hydration warnings on any of the 5 routes.
- [ ] `/` shows 8 game cards; typing "caí" in the search shows only CAÍDA; selecting the SHOOTER chip shows exactly INVASORES and ROCAS.
- [ ] A search with no match shows "NO HAY RESULTADOS".
- [ ] Clicking a card or its "JUGAR" button goes to `/juegos/<id>`.
- [ ] `/juegos/<id>` renders for each of the 8 ids with title, long description, plays, best score and 10 leaderboard rows with ranks 1–3 styled as top1/top2/top3.
- [ ] `/juegos/no-existe` returns the 404 page.
- [ ] "JUGAR AHORA" goes to `/juegos/<id>/jugar`; "VOLVER AL VAULT" goes to `/`.
- [ ] In the player the score increases while running and stops increasing while paused; the button label toggles PAUSA / REANUDAR.
- [ ] FIN opens the game-over modal showing the final score; the name input is uppercased and limited to 10 characters.
- [ ] "GUARDAR PUNTUACIÓN" appends `{ game, score, name, at }` to `localStorage["av_scores"]` and shows "PUNTUACIÓN GUARDADA_".
- [ ] "JUGAR DE NUEVO" resets score to 0, lives to 3, level to 01 and closes the modal.
- [ ] SALIR in the player goes to `/juegos/<id>`.
- [ ] Submitting `/acceso` with user "px_kai" stores `{"name":"PX_KAI"}` in `localStorage["av_user"]` and redirects to `/`.
- [ ] After a reload the nav shows the stored user name instead of "Iniciar Sesión"; clicking it signs out and removes `av_user`.
- [ ] "JUGAR COMO INVITADO" redirects to `/` without a stored user.
- [ ] The "CREAR CUENTA" tab shows the email field; "INICIAR SESIÓN" hides it.
- [ ] `/salon` shows a podium and 12 rows for the first game; selecting another tab changes the rows.
- [ ] The "TU MEJOR MARCA" row at `/salon` appears only when a user is stored.
- [ ] At a 375px viewport width the nav shows the hamburger, the drawer opens and closes via backdrop click, and no screen scrolls horizontally.
- [ ] The nav marks "Biblioteca" active on `/`, `/juegos/*` and `/juegos/*/jugar`, and "Salón de la Fama" active on `/salon`.
- [ ] No screen imports from `references/templates/`.

## Decisions

- **Yes:** App Router routes with Spanish URLs matching the prototype. They give real deep links and fit Next.js; the prototype's hash router is dropped.
- **No:** a single page with client-side state. It fights the framework and would be rewritten later.
- **Yes:** server components by default, client components only for nav, library filter, auth form, player and hall-of-fame tabs. This respects the Cache Components setup in `next.config.ts` and keeps the client bundle small.
- **Yes:** typed data plus async accessors in `app/data/`. The screens call functions, so swapping in a DB changes only that folder.
- **No:** importing constants directly like the prototype. It would force edits on every page at migration time.
- **Yes:** `localStorage` for fake login and saved scores, same keys as the prototype. The nav state survives reloads, so the flow can be demoed. It sits behind `app/lib/session.ts` so it can be replaced.
- **No:** reading `av_scores` into leaderboards in this spec. Seeded data is enough for a visual MVP, and merging real and mock scores deserves its own design.
- **Yes:** keep the prototype's mock player (fake score interval). It exercises the game-over and save flow before any game exists.
- **Yes:** reuse the existing classes in `app/globals.css` (verified: `.btn`, `.crt`, `.modal`, `.podium`, `.hall-table`, `.lb-row`, `.auth-card`, `.av-mobile-panel`, `.cover-*` and others are present) and use Tailwind for anything new. No stylesheet is rewritten.
- **No:** rewriting the theme in Tailwind utilities or CSS Modules. The theme is already ported and is the visual source of truth.
- **Yes:** UI copy in Spanish, as in the prototype and `lang="es"`.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Next.js 16 / `cacheComponents` behave differently from older versions (dynamic params, uncached data access, client-only APIs during prerender) | Before steps 3–8, read the relevant guides in `node_modules/next/dist/docs/`. Keep `localStorage` access inside effects or client components only. |
| Hydration mismatch because the session is read from `localStorage` after mount | `SessionProvider` starts with `user = null` and loads the stored value in an effect; the nav renders the guest state on first paint. |
| `Math.random` in the mock player or tilt handlers breaks prerendering | Both run only in client effects and event handlers, never during render. |
| Prototype relies on `window.*` globals and inline styles | Each component is ported to an explicit module with typed props; inline styles become Tailwind classes or existing CSS classes. |
| `localStorage` unavailable (private mode, blocked) | All access is wrapped in try/catch; the app behaves as logged out and saves nothing. |

## What is **not** in this spec

- Real game logic or any playable game.
- Real authentication, social login or a database.
- Leaderboards that reflect scores saved by the player.
- Automated tests.
- i18n or an English version.
- Theme redesign.

Each one of those, if it lands, goes in its own spec.
