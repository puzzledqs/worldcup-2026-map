# 2026 World Cup Schedule Map ⚽

An interactive map of the 2026 FIFA World Cup (USA · Canada · Mexico). Explore all
104 matches across the 16 host stadiums — filter by team, group, or stage, and see
each match's time, venue, and score laid out on a map of North America.

🔗 **Live:** https://worldcup-2026-map.netlify.app/

## Features

- **16 stadium markers** with photo thumbnails, host-city labels, and per-venue match counts
- **Multi-team selection** (up to 4) — highlights each team's venues and draws a colored trajectory line through their matches, with score bubbles at every stop
- **Group filter** (A–L) and **stage filter** (Groups → R32 → R16 → QF → SF → 3rd → Final)
- **Click a stadium** to list its matches; **click a match card** to pulse its venue on the map
- **Live status** on every card (Upcoming / LIVE / Finished), computed from kickoff time in real time
- **Dark mode** with a neon-tech card style, remembered across visits and defaulting to your system preference

## Tech Stack

- **React 18** + **Vite 5** — SPA, CSS Modules for scoped styling
- **react-simple-maps** (SVG, `geoMercator` projection) over a static TopoJSON of North America — no map tiles, no API keys, no server
- **Vitest** + **Testing Library** — 53 tests (the map library is mocked in tests)
- Match data from the **ESPN public API**; stadium photos from **Wikipedia**
- Deployed as a static site on **Netlify**

## Getting Started

```bash
npm install          # use --legacy-peer-deps if your npm is strict (see .npmrc)
npm run dev          # start the dev server
npm run build        # production build into dist/
npm run preview      # preview the production build
npm test             # run the test suite
```

## Data

Match data is fetched at build/refresh time and committed as static JSON, so the
running site never calls an external API directly.

```bash
npm run fetch-data     # refresh src/data/{matches,teams}.json from ESPN
npm run fetch-images   # download stadium thumbnails into public/stadiums/
```

A **GitHub Action** (`.github/workflows/update-data.yml`) runs `fetch-data` every
6 hours and commits any changes; Netlify then redeploys automatically, keeping
scores current without manual work.

## Project Structure

```
src/
  App.jsx                  # global state, layout, theme, filter wiring
  components/
    Map/                   # ComposableMap, StadiumMarker, TrajectoryBubble
    Sidebar/               # TeamSelector, GroupSelector, StageSelector,
                           #   MatchList, MatchCard
  utils/                   # matchFilters, formatters (incl. live status)
  data/                    # matches.json, teams.json, stadiums.json
scripts/
  fetch-data.js            # ESPN → matches.json / teams.json
  fetch-images.js          # Wikipedia → public/stadiums/*.jpg
```

## Credits

Designed and built with [Claude Code](https://claude.com/claude-code), Anthropic's
agentic coding tool — from the initial concept and architecture through the data
pipeline, UI, tests, and deployment.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
