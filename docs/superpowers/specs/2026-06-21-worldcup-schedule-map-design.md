# 2026 World Cup Interactive Schedule Map — Design Spec

**Date:** 2026-06-21  
**Status:** Approved

---

## Overview

A personal-use interactive webpage showing the 2026 FIFA World Cup schedule. Users can explore matches by selecting a team or clicking a stadium on a stylized SVG map of North America.

---

## User-Facing Features

### Two Interaction Modes

**Mode 1 — Select a Team:**
- A search/dropdown at the top of the sidebar lists all 48 teams
- Selecting a team filters the sidebar to show that team's matches (all stages)
- Stadiums hosting that team's matches are highlighted on the map
- Each match card shows: date/time (local timezone), opponent, stage, venue, result (if played) or upcoming indicator

**Mode 2 — Click a Stadium:**
- Clicking any stadium marker on the map highlights it and filters the sidebar to show all matches at that venue
- Match cards show: date/time, both teams, stage, result (if played)

**State Reset:**
- Clicking the selected stadium again, clearing the team selector, or clicking a neutral map area resets to the default state (no filter, all stadiums in neutral style)

---

## Data

### Sources
- **football-data.org free API** — provides official 2026 World Cup fixtures, results, and team metadata
- Data is fetched via a Node.js script (`scripts/fetch-data.js`) and written to local JSON files
- The webpage reads only static JSON — no runtime API calls

### Update Cadence
- Run `node scripts/fetch-data.js` manually (or via a cron job) once per day during the tournament to pull latest results

### Data Files
```
src/data/
  matches.json    # all fixtures with results
  stadiums.json   # 16 venues with name, city, country, SVG coordinates
  teams.json      # 48 teams with name, flag emoji or code, group
```

### Match Record Shape
```json
{
  "id": "M001",
  "stage": "Group Stage",
  "group": "A",
  "datetime_utc": "2026-06-11T19:00:00Z",
  "stadium_id": "ATL",
  "home_team": "USA",
  "away_team": "MEX",
  "home_score": null,
  "away_score": null
}
```
Scores are `null` until the match is played. The fetch script populates them from the API.

---

## Layout

### Overall Structure
- **Left panel (60%):** SVG map of North America
- **Right panel (40%):** Sidebar with team selector + match list
- Light background, clean typography, team primary color as accent when a team is selected

### Map
- Custom SVG outline of USA, Canada, and Mexico (no tile layers, no external map API)
- 16 stadium markers as styled SVG circles with a label on hover
- Marker states: default (neutral grey) / highlighted (accent color, slightly larger) / dimmed (when another selection is active)
- Clicking a marker triggers Mode 2

### Sidebar
- **Top:** Searchable dropdown listing all 48 teams with flag
- **Below:** Scrollable list of match cards, sorted chronologically
- Match card shows: opponent flag + name, stage label, date + local time, result badge (score if played, "Upcoming" if not)
- When no selection: show next 5 upcoming matches across all teams as a default view

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Component state for two interaction modes; fast dev server |
| Map | Custom SVG (inline) | Full style control, no API key, truly stylized |
| Styling | CSS Modules | Scoped styles per component, no build complexity |
| Data fetch script | Node.js + `node-fetch` | Simple one-file script, runs on demand |
| Deployment | Static files (no server) | Open `index.html` in browser or deploy to GitHub Pages |

No external map library, no Redux, no backend.

---

## Component Structure

```
App.jsx                  — global state: selectedTeam, selectedStadium
├── Map.jsx              — renders SVG, handles stadium clicks
│   └── StadiumMarker.jsx — single marker with hover/selected states
└── Sidebar.jsx
    ├── TeamSelector.jsx — searchable dropdown
    └── MatchList.jsx    — filtered match cards
        └── MatchCard.jsx
```

---

## Data Fetch Script

`scripts/fetch-data.js`:
1. Reads `FOOTBALL_DATA_API_KEY` from `.env`
2. Fetches all 2026 World Cup matches from `api.football-data.org/v4/competitions/WC/matches`
3. Normalizes response into `matches.json`, `teams.json`
4. Stadiums are hand-curated in `stadiums.json` (16 venues don't change during the tournament)

---

## Out of Scope

- Mobile layout (desktop-only for now)
- Live/streaming score updates (daily refresh is sufficient)
- Group standings table
- Bracket visualization
- User accounts or saved preferences
