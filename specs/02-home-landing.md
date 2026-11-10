# SPEC 02 — Home landing page

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-10
> **Objective:** Build the prototype's landing page at `/`, move the game library from `/` to `/games`, and add an "Inicio" item to the nav.

## Why this spec exists

SPEC 01 put the library at `/` because no landing existed. The prototype in `references/templates/home-about/` has a separate Home (`home.jsx`) and treats Biblioteca as its own screen. Giving the landing the root URL means the library route moves, so every link that pointed at the library must change in the same spec. The home CSS also does not exist in `app/globals.css` yet; it lives only in `references/templates/home-about/styles.css`.

## Scope

**In:**

- New route `/` — Landing page, UI copy in Spanish, ported from `references/templates/home-about/home.jsx` with these sections:
  - Hero (eyebrow, three-line title, subtitle, two CTAs, scroll hint, floating pixel silhouettes).
  - "¿POR QUÉ ARCADE VAULT?" (4 feature cards with pixel icons).
  - "JUEGOS DISPONIBLES AHORA" (first 6 games as mini cards + "VER TODOS LOS JUEGOS →").
  - Stats strip (3 blocks).
  - "ACTIVIDAD EN VIVO" (latest scores ticker + top 5 players today with "VER SALÓN →").
  - "PRECIOS" (single free plan card + 3 FAQ items).
  - Final CTA ("¿LISTO PARA JUGAR?" / "INSERTAR MONEDA →").
- Scroll-reveal animation for `.reveal` sections (client component using `IntersectionObserver`).
- Library moves from `/` to `/games` (same component, same behavior as SPEC 01).
- Nav: add "Inicio" item (desktop and mobile drawer) before "Biblioteca"; logo links to `/`; active-state rules updated.
- Update every internal link that targeted the library (`/`) to `/games`.
- Home CSS from `references/templates/home-about/styles.css` appended to `app/globals.css`, reusing the prototype's class names.
- Mock data for ticker and top players in `app/data/home.ts` with typed async accessors.
- Per-route `metadata` titles for `/` and `/games`.

**Out of scope (for future specs):**

- About page and Contact form (`about.jsx`), and an "Acerca de" nav link.
- Real "live" activity: ticker and top players stay static mock data.
- Reading `av_scores` into the ticker or top players.
- Real stats (the stats strip is fixed copy).
- Real authentication, payments or a real pricing plan (the pricing card is a visual only; its button goes to `/acceso`).
- Tests and a test runner.
- i18n.
- Theme changes in `app/globals.css` other than appending the home rules.

## Data model

Games reuse `getGames()` from SPEC 01. Only the activity data is new.

```ts
// app/data/home.ts
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export type RecentScore = {
  player: string;   // e.g. "NEONFOX"
  game: string;     // display name, e.g. "Caída"
  score: number;    // formatted with toLocaleString("es-ES"), shown as "+184.220"
  ago: string;      // fixed string, e.g. "hace 2 min"
  color: NeonColor;
};

export type TopPlayer = { rank: number; player: string; score: number };

export async function getRecentScores(): Promise<RecentScore[]>; // 7 rows
export async function getTopPlayersToday(): Promise<TopPlayer[]>; // 5 rows
```

Conventions:

- The 7 ticker rows and 5 top-player rows are copied verbatim from `home.jsx`.
- Feature cards, stats, pricing list and FAQ are static copy inside the landing components, not in `app/data/`.
- The top-player bar width is `100 - index * 16` percent, as in the prototype.
- Numbers are formatted with `toLocaleString("es-ES")`.

## Implementation plan

1. Append the home rules from `references/templates/home-about/styles.css` to `app/globals.css` (hero, silhouettes, sections, features, mini rail, stats, activity, pricing, final CTA, `.reveal`/`.in`, and the keyframes they use). Check: `npm run dev` still renders existing screens unchanged.
2. Move the library: create `app/games/page.tsx` with the content of the current `app/page.tsx`, and set its metadata title. Check: `/games` shows the 8 cards, search and chips work.
3. Update the nav (`app/components/nav.tsx`): add "Inicio" to desktop links and the drawer, point the logo to `/`, point "Biblioteca" to `/games`. Active rules: Inicio on `/` only; Biblioteca on `/games` and `/juegos/*`; Salón on `/salon`. Check: each link navigates and highlights correctly.
4. Update the other library links to `/games`: "VOLVER AL VAULT" in `app/juegos/[id]/page.tsx`, the link in `app/components/game-player.tsx`, and the link in `app/components/hall-of-fame.tsx`. Check: each lands on the library. Auth redirects keep going to `/` (now the landing).
5. Create `app/data/home.ts` with the types, the 7 + 5 rows and the async accessors. Check: a throwaway server page logs both functions; remove it afterwards.
6. Create `app/components/reveal.tsx` (client): wraps children in a `.reveal` section element, adds `in` on first intersection (threshold 0.12) and unobserves. Check: used on a temporary block, it fades in on scroll.
7. Create the landing building blocks as server components: `app/components/home/silhouettes.tsx` (8 SVGs), `feature-icon.tsx` (GAMEPAD, FREE, TROPHY, ROCKET) and `mini-card.tsx` (link to `/juegos/[id]`). Check: they compile and render in a temporary page.
8. Replace the scaffold `app/page.tsx` with the landing (server): hero, "¿POR QUÉ?", games preview (`getGames()` first 6), stats, activity (`getRecentScores()` / `getTopPlayersToday()`), pricing and final CTA, with sections wrapped in `Reveal`. CTAs are `next/link`: "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" and "INSERTAR MONEDA →" go to `/games`; "CREAR CUENTA", "EMPEZAR GRATIS →" go to `/acceso`; "VER SALÓN →" goes to `/salon`. Check: all sections render and every CTA navigates.
9. Set metadata titles for `/` and `/games` and confirm the Playwright screenshots at 1280px and 375px for `/` (saved in `.playwright-screenshots/`). Check: no horizontal scroll at 375px.

## Acceptance criteria

- [ ] `npm run build` completes with no errors.
- [ ] `npm run lint` reports no errors.
- [ ] The browser console shows no errors or hydration warnings on `/`, `/games`, `/juegos/<id>`, `/juegos/<id>/jugar`, `/acceso` and `/salon`.
- [ ] `/` renders the 7 sections in order: hero, "¿POR QUÉ ARCADE VAULT?", "JUEGOS DISPONIBLES AHORA", stats, "ACTIVIDAD EN VIVO", "PRECIOS", "¿LISTO PARA JUGAR?".
- [ ] The hero shows the lines "EL ARCADE", "CLÁSICO ESTÁ", "DE VUELTA" and the 8 floating silhouettes.
- [ ] "¿POR QUÉ ARCADE VAULT?" shows exactly 4 feature cards.
- [ ] "JUEGOS DISPONIBLES AHORA" shows exactly 6 mini cards, the first six of `getGames()`; clicking one goes to `/juegos/<id>`.
- [ ] The ticker shows 7 rows and the top list shows 5 rows with rows 1–3 styled `top1`/`top2`/`top3`.
- [ ] Ticker scores render as `+184.220` style (es-ES) and the top-player scores are es-ES formatted.
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" and "INSERTAR MONEDA →" go to `/games`.
- [ ] "CREAR CUENTA" and "EMPEZAR GRATIS →" go to `/acceso`; "VER SALÓN →" goes to `/salon`.
- [ ] `/games` shows 8 game cards; typing "caí" shows only CAÍDA; the SHOOTER chip shows INVASORES and ROCAS.
- [ ] "VOLVER AL VAULT" at `/juegos/<id>`, the library link in the player and the one at `/salon` all go to `/games`.
- [ ] The nav shows "Inicio", "Biblioteca" and "Salón de la Fama" in that order on desktop and in the mobile drawer.
- [ ] The logo and "Inicio" go to `/`.
- [ ] The nav marks "Inicio" active only on `/`; "Biblioteca" active on `/games`, `/juegos/*` and `/juegos/*/jugar`; "Salón de la Fama" active on `/salon`.
- [ ] Submitting `/acceso` or choosing "JUGAR COMO INVITADO" redirects to `/`.
- [ ] Sections below the fold start hidden and receive the `in` class when scrolled into view.
- [ ] At a 375px viewport width `/` and `/games` do not scroll horizontally and the drawer opens and closes via backdrop click.
- [ ] No file in `app/` imports from `references/templates/`.

## Decisions

- **Yes:** Landing at `/`, library at `/games`. The user chose this explicitly; the landing is the natural root and `/games` is a clear English path for the library.
- **No:** Landing at `/games` with the library staying at `/`. Considered and discarded; the user clarified the library is the one that moves.
- **Yes:** Keep SPEC 01's Spanish URLs for everything else (`/juegos/[id]`, `/acceso`, `/salon`). Only the library route changes; renaming the rest is out of scope.
- **Yes:** Logo and "Inicio" both point to `/`, as the prototype does.
- **Yes:** Auth redirects stay on `/`, which is now the landing. This avoids touching `auth-form.tsx` beyond what SPEC 01 specified.
- **Yes:** Home only. The `home-about` folder also holds `about.jsx`, but About and Contact get their own spec.
- **Yes:** Append the home CSS to `app/globals.css` and reuse the prototype's class names, same approach as SPEC 01. **No:** separate `home.css`, which would split the theme across files.
- **Yes:** Static typed mock data behind async accessors in `app/data/home.ts`, so a later spec can swap in real data without touching the page. **No:** deriving the ticker from the seeded scores; it adds coupling and changes the prototype's numbers.
- **Yes:** Landing is a server component; only `Reveal` is client-side. This keeps the client bundle small and fits the Cache Components setup.
- **Yes:** Buttons in the prototype that called `navigate()` become `next/link` anchors styled with `.btn`, for real links and prefetch.
- **No:** a `useReveal` hook that scans the whole DOM like the prototype. A per-section `Reveal` component is scoped and does not depend on query selectors.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| `.reveal` hides content until JS runs; with JS disabled or a failed observer the sections stay invisible | `Reveal` adds `in` immediately if `IntersectionObserver` is missing; the observer is created in an effect, so SSR output is the hidden state and hydration does not mismatch. |
| Moving `/` to `/games` leaves stale links | Step 4 lists every known link; the acceptance criteria check each one; a final grep for `href="/"` in `app/` confirms only landing links remain. |
| Appended CSS collides with SPEC 01 class names (`.btn`, `.kicker`, `.pixel`, `.neon-*`) | Before appending, diff the prototype's rules against `app/globals.css`; skip rules already defined and keep the existing ones. |
| Heavy decorative CSS (animated silhouettes, ticker, pulse) hurts mobile layout | Step 9 checks the 375px viewport; the prototype's own media queries are included in the append. |
| Next.js 16 / `cacheComponents` behave differently from older versions | Read the relevant guides in `node_modules/next/dist/docs/` before steps 6–8. |

## What is **not** in this spec

- About page, Contact form and the "Acerca de" nav link.
- Live or real activity data, and any use of `av_scores`.
- Real pricing, payments or authentication.
- Renaming SPEC 01's other routes.
- Automated tests.
- i18n or an English version.
- Theme redesign.

Each one of those, if it lands, goes in its own spec.
