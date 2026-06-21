# 2026 World Cup Interactive Schedule Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop web app showing 2026 World Cup fixtures on an interactive SVG map, with two exploration modes: select a team to see their schedule, or click a stadium to see matches there.

**Architecture:** React + Vite SPA that reads static JSON data files. A separate Node.js script (`scripts/fetch-data.js`) pulls data from football-data.org once per day and writes it to `src/data/`. The map is an inline SVG rendered via `react-simple-maps` (no tile layers, no runtime API keys). Global state lives in `App.jsx` using `useState` — no Redux needed.

**Tech Stack:** React 18, Vite 5, `react-simple-maps` 1.x, CSS Modules, Vitest + @testing-library/react + jsdom for tests, Node.js (fetch script only)

## Global Constraints

- Desktop-only layout — no mobile breakpoints
- Light theme; team accent color is the only dynamic color (`--accent-color` CSS variable)
- All datetimes displayed in the user's local timezone via `Intl.DateTimeFormat`
- No backend, no runtime API calls — the web app reads static JSON only
- Static JSON lives in `src/data/` and is bundled by Vite
- API key in `.env` (never committed) — used only by the fetch script

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via Vite scaffold)
- Create: `vite.config.js`
- Create: `src/test-setup.js`
- Create: `.env.example`
- Create folder structure

- [ ] **Step 1: Scaffold Vite + React project**

```bash
npm create vite@latest . -- --template react
npm install
```

- [ ] **Step 2: Install runtime dependency**

```bash
npm install react-simple-maps
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom dotenv
```

- [ ] **Step 4: Configure Vitest — replace vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

Create `src/test-setup.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Create folder structure**

```bash
mkdir -p src/components/Map
mkdir -p src/components/Sidebar
mkdir -p src/utils
mkdir -p src/data
mkdir -p scripts
mkdir -p public
```

- [ ] **Step 6: Create .env.example**

```
FOOTBALL_DATA_API_KEY=your_api_key_here
```

Add to `.gitignore` (append after the Vite defaults):
```
.env
src/data/matches.json
src/data/teams.json
```

(stadiums.json IS committed — it's hand-curated and static. matches.json and teams.json are generated.)

- [ ] **Step 7: Add fetch-data script to package.json**

In `package.json`, update the `"scripts"` section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "fetch-data": "node scripts/fetch-data.js"
}
```

- [ ] **Step 8: Verify Vitest starts**

```bash
npx vitest run
```
Expected: "No test files found" or exit 0.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React project with Vitest"
```

---

### Task 2: Static Data — stadiums.json

**Files:**
- Create: `src/data/stadiums.json`
- Create: `src/data/stadiums.test.js`

**Interfaces:**
- Produces: `Stadium[]` — `{ id: string, name: string, city: string, country: 'USA'|'CAN'|'MEX', lat: number, lon: number }`

- [ ] **Step 1: Create stadiums.json**

Create `src/data/stadiums.json`:
```json
[
  { "id": "ATL", "name": "Mercedes-Benz Stadium",  "city": "Atlanta",         "country": "USA", "lat": 33.7553, "lon": -84.4006  },
  { "id": "BOS", "name": "Gillette Stadium",        "city": "Foxborough",      "country": "USA", "lat": 42.0909, "lon": -71.2643  },
  { "id": "DAL", "name": "AT&T Stadium",            "city": "Arlington",       "country": "USA", "lat": 32.7473, "lon": -97.0945  },
  { "id": "HOU", "name": "NRG Stadium",             "city": "Houston",         "country": "USA", "lat": 29.6847, "lon": -95.4107  },
  { "id": "KC",  "name": "Arrowhead Stadium",       "city": "Kansas City",     "country": "USA", "lat": 39.0489, "lon": -94.4839  },
  { "id": "LA",  "name": "SoFi Stadium",            "city": "Inglewood",       "country": "USA", "lat": 33.9535, "lon": -118.3392 },
  { "id": "MIA", "name": "Hard Rock Stadium",       "city": "Miami Gardens",   "country": "USA", "lat": 25.9580, "lon": -80.2389  },
  { "id": "NYC", "name": "MetLife Stadium",         "city": "East Rutherford", "country": "USA", "lat": 40.8135, "lon": -74.0745  },
  { "id": "PHI", "name": "Lincoln Financial Field", "city": "Philadelphia",    "country": "USA", "lat": 39.9008, "lon": -75.1675  },
  { "id": "SEA", "name": "Lumen Field",             "city": "Seattle",         "country": "USA", "lat": 47.5952, "lon": -122.3316 },
  { "id": "SF",  "name": "Levi's Stadium",          "city": "Santa Clara",     "country": "USA", "lat": 37.4033, "lon": -121.9694 },
  { "id": "VAN", "name": "BC Place",                "city": "Vancouver",       "country": "CAN", "lat": 49.2767, "lon": -123.1116 },
  { "id": "TOR", "name": "BMO Field",               "city": "Toronto",         "country": "CAN", "lat": 43.6332, "lon": -79.4187  },
  { "id": "MEX", "name": "Estadio Azteca",          "city": "Mexico City",     "country": "MEX", "lat": 19.3029, "lon": -99.1505  },
  { "id": "MTY", "name": "Estadio BBVA",            "city": "Monterrey",       "country": "MEX", "lat": 25.6694, "lon": -100.2464 },
  { "id": "GDL", "name": "Estadio Akron",           "city": "Guadalajara",     "country": "MEX", "lat": 20.6482, "lon": -103.4093 }
]
```

- [ ] **Step 2: Write test**

Create `src/data/stadiums.test.js`:
```js
import stadiums from './stadiums.json'

describe('stadiums.json', () => {
  test('has 16 entries', () => {
    expect(stadiums).toHaveLength(16)
  })

  test('each stadium has required fields', () => {
    for (const s of stadiums) {
      expect(typeof s.id).toBe('string')
      expect(typeof s.name).toBe('string')
      expect(typeof s.city).toBe('string')
      expect(['USA', 'CAN', 'MEX']).toContain(s.country)
      expect(typeof s.lat).toBe('number')
      expect(typeof s.lon).toBe('number')
    }
  })

  test('all ids are unique', () => {
    const ids = stadiums.map(s => s.id)
    expect(new Set(ids).size).toBe(16)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/data/stadiums.json src/data/stadiums.test.js
git commit -m "feat: add hand-curated stadiums.json with 16 World Cup venues"
```

---

### Task 3: Data Fetch Script

**Files:**
- Create: `scripts/fetch-data.js`
- Generates: `src/data/matches.json`, `src/data/teams.json`

**Interfaces:**
- Consumes: `FOOTBALL_DATA_API_KEY` from `.env`
- Produces:
  - `Match[]` → `src/data/matches.json` — `{ id, stage, group, datetime_utc, stadium_id, home_team, away_team, home_score, away_score }`
  - `Team[]` → `src/data/teams.json` — `{ tla, name, shortName, flag, color }`

- [ ] **Step 1: Create scripts/fetch-data.js**

```js
import 'dotenv/config'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/data')

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
if (!API_KEY) throw new Error('Missing FOOTBALL_DATA_API_KEY in .env')

// Maps football-data.org venue strings to our stadium IDs
const VENUE_TO_STADIUM_ID = {
  'Mercedes-Benz Stadium': 'ATL',
  'Gillette Stadium': 'BOS',
  'AT&T Stadium': 'DAL',
  'NRG Stadium': 'HOU',
  'Arrowhead Stadium': 'KC',
  'SoFi Stadium': 'LA',
  'Hard Rock Stadium': 'MIA',
  'MetLife Stadium': 'NYC',
  'Lincoln Financial Field': 'PHI',
  'Lumen Field': 'SEA',
  "Levi's Stadium": 'SF',
  'BC Place': 'VAN',
  'BMO Field': 'TOR',
  'Estadio Azteca': 'MEX',
  'Estadio BBVA': 'MTY',
  'Estadio Akron': 'GDL',
}

// FIFA TLA → ISO 3166-1 alpha-2 for flag emoji generation
const TLA_TO_ALPHA2 = {
  USA: 'US', MEX: 'MX', CAN: 'CA', BRA: 'BR', ARG: 'AR',
  GER: 'DE', FRA: 'FR', ESP: 'ES', ENG: 'GB', POR: 'PT',
  NED: 'NL', JPN: 'JP', KOR: 'KR', AUS: 'AU', MAR: 'MA',
  SEN: 'SN', NGA: 'NG', EGY: 'EG', COL: 'CO', URU: 'UY',
  CHI: 'CL', ECU: 'EC', VEN: 'VE', PAN: 'PA', CRC: 'CR',
  HND: 'HN', SAU: 'SA', IRN: 'IR', IRQ: 'IQ', JOR: 'JO',
  QAT: 'QA', SUI: 'CH', AUT: 'AT', CRO: 'HR', SRB: 'RS',
  DEN: 'DK', SCO: 'GB', TUR: 'TR', CZE: 'CZ', SVK: 'SK',
  GRE: 'GR', ALB: 'AL', SVN: 'SI', NZL: 'NZ', CMR: 'CM',
  CIV: 'CI', GHA: 'GH', ITA: 'IT', BEL: 'BE', UKR: 'UA',
  POL: 'PL', ROU: 'RO', HUN: 'HU', NOR: 'NO', SWE: 'SE',
  WAL: 'GB', MLI: 'ML', UGA: 'UG', AGO: 'AO', ZIM: 'ZW',
  IDN: 'ID', THA: 'TH', VNM: 'VN', PHI: 'PH', MYS: 'MY',
}

// Primary team colors (hex) — fallback #666666 for unknowns
const TEAM_COLORS = {
  USA: '#B22234', MEX: '#006847', CAN: '#FF0000',
  BRA: '#009C3B', ARG: '#74ACDF', GER: '#000000',
  FRA: '#002395', ESP: '#AA151B', ENG: '#FFFFFF',
  POR: '#FF0000', NED: '#FF6600', JPN: '#BC002D',
  KOR: '#CD2E3A', AUS: '#00843D', MAR: '#C1272D',
  SEN: '#00853F', NGA: '#008751', EGY: '#CE1126',
  COL: '#FCD116', URU: '#5EB6E4', CHI: '#D52B1E',
  ECU: '#FFD100', VEN: '#CF142B', PAN: '#005293',
  CRC: '#002B7F', HND: '#0073CF', SAU: '#006C35',
  IRN: '#239F40', IRQ: '#007A3D', QAT: '#8D1B3D',
  SUI: '#FF0000', AUT: '#ED2939', CRO: '#FF0000',
  SRB: '#C6363C', DEN: '#C60C30', TUR: '#E30A17',
  CZE: '#D7141A', ITA: '#003F87', BEL: '#000000',
}

function toFlagEmoji(alpha2) {
  return alpha2.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  )
}

async function fetchMatches() {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': API_KEY },
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data.matches
}

function normalizeMatch(m) {
  return {
    id: String(m.id),
    stage: m.stage,
    group: m.group || null,
    datetime_utc: m.utcDate,
    stadium_id: VENUE_TO_STADIUM_ID[m.venue] || null,
    home_team: m.homeTeam.tla,
    away_team: m.awayTeam.tla,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null,
  }
}

function extractTeams(rawMatches) {
  const seen = new Map()
  for (const m of rawMatches) {
    for (const t of [m.homeTeam, m.awayTeam]) {
      if (t.tla && !seen.has(t.tla)) {
        const alpha2 = TLA_TO_ALPHA2[t.tla]
        seen.set(t.tla, {
          tla: t.tla,
          name: t.name,
          shortName: t.shortName,
          flag: alpha2 ? toFlagEmoji(alpha2) : '🏳️',
          color: TEAM_COLORS[t.tla] || '#666666',
        })
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function main() {
  console.log('Fetching from football-data.org...')
  const rawMatches = await fetchMatches()
  console.log(`Got ${rawMatches.length} matches`)

  const matches = rawMatches.map(normalizeMatch)
  const teams = extractTeams(rawMatches)

  writeFileSync(join(DATA_DIR, 'matches.json'), JSON.stringify(matches, null, 2))
  writeFileSync(join(DATA_DIR, 'teams.json'), JSON.stringify(teams, null, 2))
  console.log(`Wrote ${matches.length} matches, ${teams.length} teams`)
}

main().catch(err => { console.error(err); process.exit(1) })
```

Note: this script uses `import 'dotenv/config'` which reads `.env` automatically. The npm script (`node scripts/fetch-data.js`) does not need `--env-file`.

- [ ] **Step 2: Set up .env**

```bash
cp .env.example .env
# Register for a free API key at https://www.football-data.org/client/register
# Paste the key into .env: FOOTBALL_DATA_API_KEY=abc123...
```

- [ ] **Step 3: Run the fetch script**

```bash
npm run fetch-data
```
Expected output:
```
Fetching from football-data.org...
Got 104 matches
Wrote 104 matches, 48 teams
```

If `stadium_id` is null for any matches, the venue string didn't match `VENUE_TO_STADIUM_ID`. Check the raw venue name and add it to the map.

- [ ] **Step 4: Spot-check output**

```bash
node -e "const m=JSON.parse(require('fs').readFileSync('src/data/matches.json','utf8')); console.log(JSON.stringify(m[0],null,2))"
```
Expected: a match object with all fields. `home_score`/`away_score` will be `null` for future matches and numbers for completed ones.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-data.js package.json .env.example
git commit -m "feat: add daily data fetch script for football-data.org"
```

---

### Task 4: Match Filter Utils + Formatters

**Files:**
- Create: `src/utils/matchFilters.js`
- Create: `src/utils/matchFilters.test.js`
- Create: `src/utils/formatters.js`
- Create: `src/utils/formatters.test.js`

**Interfaces:**
- Produces:
  - `filterByTeam(matches: Match[], tla: string): Match[]`
  - `filterByStadium(matches: Match[], stadiumId: string): Match[]`
  - `getUpcoming(matches: Match[], n: number): Match[]` — future only, sorted asc, limited to n
  - `formatMatchDate(datetimeUtc: string): string` — e.g. "Sat, Jun 14 · 8:00 PM" in local timezone
  - `formatScore(homeScore: number|null, awayScore: number|null): string|null` — "2 – 1" or null

- [ ] **Step 1: Write failing tests for matchFilters**

Create `src/utils/matchFilters.test.js`:
```js
import { filterByTeam, filterByStadium, getUpcoming } from './matchFilters'

const PAST   = '2020-01-01T20:00:00Z'
const FUTURE = '2099-01-01T20:00:00Z'

const matches = [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: PAST,   home_score: 2,    away_score: 1    },
  { id: '2', home_team: 'BRA', away_team: 'USA', stadium_id: 'LA',  datetime_utc: FUTURE, home_score: null, away_score: null },
  { id: '3', home_team: 'GER', away_team: 'FRA', stadium_id: 'NYC', datetime_utc: FUTURE, home_score: null, away_score: null },
  { id: '4', home_team: 'ARG', away_team: 'BRA', stadium_id: 'DAL', datetime_utc: FUTURE, home_score: null, away_score: null },
]

describe('filterByTeam', () => {
  test('returns matches where team is home or away', () => {
    expect(filterByTeam(matches, 'USA').map(m => m.id)).toEqual(['1', '2'])
  })
  test('returns empty array for unknown team', () => {
    expect(filterByTeam(matches, 'XYZ')).toEqual([])
  })
})

describe('filterByStadium', () => {
  test('returns matches at the given stadium', () => {
    expect(filterByStadium(matches, 'NYC').map(m => m.id)).toEqual(['1', '3'])
  })
})

describe('getUpcoming', () => {
  test('returns future matches only, sorted ascending, limited to n', () => {
    const result = getUpcoming(matches, 2)
    expect(result).toHaveLength(2)
    result.forEach(m => expect(new Date(m.datetime_utc).getTime()).toBeGreaterThan(Date.now()))
  })
  test('returns all future matches when n exceeds count', () => {
    expect(getUpcoming(matches, 100)).toHaveLength(3)
  })
  test('sorts ascending by datetime', () => {
    const near   = '2099-01-01T20:00:00Z'
    const far    = '2099-06-01T20:00:00Z'
    const result = getUpcoming([
      { ...matches[2], datetime_utc: far  },
      { ...matches[1], datetime_utc: near },
    ], 10)
    expect(new Date(result[0].datetime_utc) < new Date(result[1].datetime_utc)).toBe(true)
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/utils/matchFilters.test.js
```
Expected: FAIL — "Cannot find module './matchFilters'"

- [ ] **Step 3: Implement matchFilters.js**

Create `src/utils/matchFilters.js`:
```js
export function filterByTeam(matches, tla) {
  return matches.filter(m => m.home_team === tla || m.away_team === tla)
}

export function filterByStadium(matches, stadiumId) {
  return matches.filter(m => m.stadium_id === stadiumId)
}

export function getUpcoming(matches, n) {
  const now = Date.now()
  return matches
    .filter(m => new Date(m.datetime_utc).getTime() > now)
    .sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc))
    .slice(0, n)
}
```

- [ ] **Step 4: Run passing tests**

```bash
npx vitest run src/utils/matchFilters.test.js
```
Expected: all pass.

- [ ] **Step 5: Write failing tests for formatters**

Create `src/utils/formatters.test.js`:
```js
import { formatScore, formatMatchDate } from './formatters'

describe('formatScore', () => {
  test('returns null when either score is null', () => {
    expect(formatScore(null, null)).toBeNull()
    expect(formatScore(2, null)).toBeNull()
  })
  test('formats score string', () => {
    expect(formatScore(2, 1)).toBe('2 – 1')
    expect(formatScore(0, 0)).toBe('0 – 0')
  })
})

describe('formatMatchDate', () => {
  test('returns a non-empty string', () => {
    const r = formatMatchDate('2026-06-14T20:00:00Z')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })
  test('includes the month and day', () => {
    // Use a date we can reason about in any timezone
    const r = formatMatchDate('2026-06-14T20:00:00Z')
    expect(r).toMatch(/Jun/)
  })
})
```

- [ ] **Step 6: Run failing tests**

```bash
npx vitest run src/utils/formatters.test.js
```
Expected: FAIL

- [ ] **Step 7: Implement formatters.js**

Create `src/utils/formatters.js`:
```js
export function formatScore(homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return null
  return `${homeScore} – ${awayScore}`
}

export function formatMatchDate(datetimeUtc) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(new Date(datetimeUtc))
}
```

- [ ] **Step 8: Run all passing**

```bash
npx vitest run src/utils/
```
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/utils/
git commit -m "feat: add match filter utils and date/score formatters with tests"
```

---

### Task 5: StadiumMarker Component

**Files:**
- Create: `src/components/Map/StadiumMarker.jsx`
- Create: `src/components/Map/StadiumMarker.module.css`
- Create: `src/components/Map/StadiumMarker.test.jsx`

**Interfaces:**
- Props: `stadium: Stadium, state: 'default'|'highlighted'|'dimmed', onClick: (stadiumId: string) => void`
- Produces: A `<Marker>` from react-simple-maps containing a clickable `<g>` with a circle and city label

- [ ] **Step 1: Write failing tests**

Create `src/components/Map/StadiumMarker.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import StadiumMarker from './StadiumMarker'

// react-simple-maps uses SVG and d3 projections that don't work in jsdom.
// Mock the library so tests focus on our component logic.
vi.mock('react-simple-maps', () => ({
  Marker: ({ coordinates, children }) => <g data-coords={coordinates.join(',')}>{children}</g>,
}))

const stadium = {
  id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford',
  country: 'USA', lat: 40.81, lon: -74.07,
}

test('renders the stadium city name', () => {
  render(<StadiumMarker stadium={stadium} state="default" onClick={() => {}} />)
  expect(screen.getByText('East Rutherford')).toBeInTheDocument()
})

test('calls onClick with stadium id when clicked', () => {
  const onClick = vi.fn()
  render(<StadiumMarker stadium={stadium} state="default" onClick={onClick} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledWith('NYC')
})

test('applies highlighted class when state is highlighted', () => {
  const { container } = render(
    <StadiumMarker stadium={stadium} state="highlighted" onClick={() => {}} />
  )
  expect(container.querySelector('[class*="highlighted"]')).not.toBeNull()
})

test('applies dimmed class when state is dimmed', () => {
  const { container } = render(
    <StadiumMarker stadium={stadium} state="dimmed" onClick={() => {}} />
  )
  expect(container.querySelector('[class*="dimmed"]')).not.toBeNull()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/components/Map/StadiumMarker.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement StadiumMarker.jsx**

Create `src/components/Map/StadiumMarker.jsx`:
```jsx
import { Marker } from 'react-simple-maps'
import styles from './StadiumMarker.module.css'

export default function StadiumMarker({ stadium, state, onClick }) {
  return (
    <Marker coordinates={[stadium.lon, stadium.lat]}>
      <g
        role="button"
        aria-label={stadium.name}
        className={`${styles.marker} ${styles[state]}`}
        onClick={() => onClick(stadium.id)}
      >
        <circle r={state === 'highlighted' ? 10 : 7} />
        <text className={styles.label} textAnchor="middle" y={-14}>
          {stadium.city}
        </text>
      </g>
    </Marker>
  )
}
```

- [ ] **Step 4: Create StadiumMarker.module.css**

Create `src/components/Map/StadiumMarker.module.css`:
```css
.marker {
  cursor: pointer;
  transition: all 0.2s ease;
}
.marker circle {
  fill: #9ca3af;
  stroke: #fff;
  stroke-width: 2;
}
.label {
  fill: #374151;
  font-size: 10px;
  font-family: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
}
.marker:hover .label { opacity: 1; }

.highlighted circle {
  fill: var(--accent-color, #3b82f6);
  filter: drop-shadow(0 0 4px var(--accent-color, #3b82f6));
}
.highlighted .label {
  opacity: 1;
  font-weight: 600;
  fill: #111827;
}

.dimmed circle { fill: #d1d5db; opacity: 0.4; }
.dimmed .label { opacity: 0; }

.default:hover circle { fill: #6b7280; }
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/components/Map/StadiumMarker.test.jsx
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Map/
git commit -m "feat: add StadiumMarker with highlighted/dimmed/default states"
```

---

### Task 6: Map Component

**Files:**
- Create: `src/components/Map/Map.jsx`
- Create: `src/components/Map/Map.module.css`
- Create: `src/components/Map/Map.test.jsx`
- Download: `public/world-110m.json`

**Interfaces:**
- Props: `stadiums: Stadium[], highlightedIds: Set<string>, selectedId: string|null, onStadiumClick: (id: string) => void`
- Logic: if `selectedId` is set → selected marker is 'highlighted', others 'dimmed'. If `highlightedIds` is non-empty → those markers 'highlighted', others 'dimmed'. Otherwise → all 'default'.

- [ ] **Step 1: Download geography data**

```bash
curl -L -o public/world-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```

- [ ] **Step 2: Write failing tests**

Create `src/components/Map/Map.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import Map from './Map'
import stadiums from '../../data/stadiums.json'

// react-simple-maps uses SVG + d3 projections that don't work in jsdom.
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }) => <svg>{children}</svg>,
  Geographies:   ({ children }) => <>{children({ geographies: [] })}</>,
  Geography:     () => null,
  Marker:        ({ children }) => <g>{children}</g>,
}))

const noop = () => {}

test('renders without crashing', () => {
  const { container } = render(
    <Map stadiums={stadiums} highlightedIds={new Set()} selectedId={null} onStadiumClick={noop} />
  )
  expect(container.firstChild).not.toBeNull()
})

test('renders a button for each stadium', () => {
  render(
    <Map stadiums={stadiums} highlightedIds={new Set()} selectedId={null} onStadiumClick={noop} />
  )
  expect(screen.getAllByRole('button')).toHaveLength(16)
})
```

- [ ] **Step 3: Run failing tests**

```bash
npx vitest run src/components/Map/Map.test.jsx
```
Expected: FAIL

- [ ] **Step 4: Implement Map.jsx**

Create `src/components/Map/Map.jsx`:
```jsx
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import StadiumMarker from './StadiumMarker'
import styles from './Map.module.css'

const GEO_URL = '/world-110m.json'
// ISO numeric IDs from world-atlas 2.x: USA=840, Canada=124, Mexico=484
const NA_IDS = new Set([840, 124, 484])

export default function Map({ stadiums, highlightedIds, selectedId, onStadiumClick }) {
  function markerState(id) {
    if (selectedId) return id === selectedId ? 'highlighted' : 'dimmed'
    if (highlightedIds.size > 0) return highlightedIds.has(id) ? 'highlighted' : 'dimmed'
    return 'default'
  }

  return (
    <div className={styles.container}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 500, center: [-97, 40] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => NA_IDS.has(Number(geo.id)))
              .map(geo => (
                <Geography key={geo.rsmKey} geography={geo} className={styles.country} />
              ))
          }
        </Geographies>
        {stadiums.map(s => (
          <StadiumMarker
            key={s.id}
            stadium={s}
            state={markerState(s.id)}
            onClick={onStadiumClick}
          />
        ))}
      </ComposableMap>
    </div>
  )
}
```

- [ ] **Step 5: Create Map.module.css**

Create `src/components/Map/Map.module.css`:
```css
.container {
  width: 100%;
  height: 100%;
  background: #f0f4f8;
}
.country {
  fill: #e2e8f0;
  stroke: #cbd5e1;
  stroke-width: 0.5;
  outline: none;
}
```

- [ ] **Step 6: Run passing tests**

```bash
npx vitest run src/components/Map/Map.test.jsx
```
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/Map/Map.jsx src/components/Map/Map.module.css src/components/Map/Map.test.jsx public/world-110m.json
git commit -m "feat: add Map component with North America outline and stadium markers"
```

---

### Task 7: MatchCard Component

**Files:**
- Create: `src/components/Sidebar/MatchCard.jsx`
- Create: `src/components/Sidebar/MatchCard.module.css`
- Create: `src/components/Sidebar/MatchCard.test.jsx`

**Interfaces:**
- Props: `match: Match, homeTeam: Team|undefined, awayTeam: Team|undefined, stadiumName: string`
- Produces: A card with date, stage, team names, score or "Upcoming" badge, venue

- [ ] **Step 1: Write failing tests**

Create `src/components/Sidebar/MatchCard.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import MatchCard from './MatchCard'

const match = {
  id: '1', stage: 'GROUP_STAGE', group: 'GROUP_A',
  datetime_utc: '2026-06-14T20:00:00Z', stadium_id: 'NYC',
  home_team: 'USA', away_team: 'MEX', home_score: null, away_score: null,
}
const homeTeam = { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }
const awayTeam = { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }

test('shows Upcoming when scores are null', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('Upcoming')).toBeInTheDocument()
})

test('shows formatted score when match is played', () => {
  render(
    <MatchCard
      match={{ ...match, home_score: 2, away_score: 1 }}
      homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium"
    />
  )
  expect(screen.getByText('2 – 1')).toBeInTheDocument()
})

test('shows both team names', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('United States')).toBeInTheDocument()
  expect(screen.getByText('Mexico')).toBeInTheDocument()
})

test('shows stadium name', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('MetLife Stadium')).toBeInTheDocument()
})

test('falls back to TLA when team data is missing', () => {
  render(<MatchCard match={match} homeTeam={undefined} awayTeam={undefined} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('USA')).toBeInTheDocument()
  expect(screen.getByText('MEX')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/components/Sidebar/MatchCard.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement MatchCard.jsx**

Create `src/components/Sidebar/MatchCard.jsx`:
```jsx
import { formatMatchDate, formatScore } from '../../utils/formatters'
import styles from './MatchCard.module.css'

function stageLabel(stage, group) {
  if (stage === 'GROUP_STAGE') {
    return group ? `Group ${group.replace('GROUP_', '')}` : 'Group Stage'
  }
  const MAP = {
    ROUND_OF_32:   'Round of 32',
    ROUND_OF_16:   'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS:   'Semi-final',
    THIRD_PLACE:   'Third Place',
    FINAL:         'Final',
  }
  return MAP[stage] || stage
}

export default function MatchCard({ match, homeTeam, awayTeam, stadiumName }) {
  const score    = formatScore(match.home_score, match.away_score)
  const homeName = homeTeam?.name || match.home_team
  const awayName = awayTeam?.name || match.away_team
  const homeFlag = homeTeam?.flag || ''
  const awayFlag = awayTeam?.flag || ''

  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.stage}>{stageLabel(match.stage, match.group)}</span>
        <span className={styles.date}>{formatMatchDate(match.datetime_utc)}</span>
      </div>
      <div className={styles.teams}>
        <span className={styles.team}>{homeFlag} {homeName}</span>
        <span className={styles.score}>
          {score ?? <span className={styles.upcoming}>Upcoming</span>}
        </span>
        <span className={`${styles.team} ${styles.away}`}>{awayName} {awayFlag}</span>
      </div>
      <div className={styles.venue}>{stadiumName}</div>
    </div>
  )
}
```

- [ ] **Step 4: Create MatchCard.module.css**

Create `src/components/Sidebar/MatchCard.module.css`:
```css
.card {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.card:hover { background: #f8fafc; }

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stage {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.date { font-size: 12px; color: #64748b; }

.teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.team { font-size: 14px; font-weight: 500; color: #1e293b; flex: 1; }
.away { text-align: right; }

.score {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  min-width: 56px;
  text-align: center;
}
.upcoming {
  font-size: 11px;
  font-weight: 600;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 12px;
}

.venue { font-size: 12px; color: #94a3b8; }
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/components/Sidebar/MatchCard.test.jsx
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar/MatchCard.jsx src/components/Sidebar/MatchCard.module.css src/components/Sidebar/MatchCard.test.jsx
git commit -m "feat: add MatchCard with score/upcoming display"
```

---

### Task 8: MatchList Component

**Files:**
- Create: `src/components/Sidebar/MatchList.jsx`
- Create: `src/components/Sidebar/MatchList.module.css`
- Create: `src/components/Sidebar/MatchList.test.jsx`

**Interfaces:**
- Props: `matches: Match[], stadiumsMap: Map<string,Stadium>, teamsMap: Map<string,Team>, emptyMessage: string`
- Produces: Chronologically sorted list of MatchCards, or empty-state text

- [ ] **Step 1: Write failing tests**

Create `src/components/Sidebar/MatchList.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import MatchList from './MatchList'

const stadiumsMap = new Map([
  ['NYC', { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', lat: 40.81, lon: -74.07 }],
])
const teamsMap = new Map([
  ['USA', { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }],
  ['MEX', { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }],
])

const matches = [
  { id: '1', home_team: 'MEX', away_team: 'USA', stadium_id: 'NYC', datetime_utc: '2099-06-14T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: null, away_score: null },
  { id: '2', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: '2026-06-11T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: 2,    away_score: 1    },
]

test('renders a card for each match', () => {
  render(<MatchList matches={matches} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="None" />)
  // Both teams appear
  expect(screen.getAllByText(/United States|Mexico/).length).toBeGreaterThan(0)
})

test('shows empty message when matches array is empty', () => {
  render(<MatchList matches={[]} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="No matches found" />)
  expect(screen.getByText('No matches found')).toBeInTheDocument()
})

test('sorts matches chronologically (earliest first)', () => {
  render(<MatchList matches={matches} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="None" />)
  const scores = screen.getAllByText(/2 – 1|Upcoming/)
  // Jun 11 (score 2-1) should appear before Jun 14 (Upcoming)
  expect(scores[0]).toHaveTextContent('2 – 1')
  expect(scores[1]).toHaveTextContent('Upcoming')
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/components/Sidebar/MatchList.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement MatchList.jsx**

Create `src/components/Sidebar/MatchList.jsx`:
```jsx
import MatchCard from './MatchCard'
import styles from './MatchList.module.css'

export default function MatchList({ matches, stadiumsMap, teamsMap, emptyMessage }) {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc)
  )

  if (sorted.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>
  }

  return (
    <div className={styles.list}>
      {sorted.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          homeTeam={teamsMap.get(match.home_team)}
          awayTeam={teamsMap.get(match.away_team)}
          stadiumName={stadiumsMap.get(match.stadium_id)?.name || match.stadium_id || '—'}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create MatchList.module.css**

Create `src/components/Sidebar/MatchList.module.css`:
```css
.list {
  overflow-y: auto;
  flex: 1;
}
.empty {
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/components/Sidebar/MatchList.test.jsx
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar/MatchList.jsx src/components/Sidebar/MatchList.module.css src/components/Sidebar/MatchList.test.jsx
git commit -m "feat: add MatchList with chronological sort and empty state"
```

---

### Task 9: TeamSelector Component

**Files:**
- Create: `src/components/Sidebar/TeamSelector.jsx`
- Create: `src/components/Sidebar/TeamSelector.module.css`
- Create: `src/components/Sidebar/TeamSelector.test.jsx`

**Interfaces:**
- Props: `teams: Team[], selectedTla: string|null, onSelect: (tla: string) => void, onClear: () => void`
- Produces: A controlled text input that filters teams and renders a dropdown; a clear button appears when a team is selected

- [ ] **Step 1: Write failing tests**

Create `src/components/Sidebar/TeamSelector.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamSelector from './TeamSelector'

const teams = [
  { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' },
  { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' },
  { tla: 'BRA', name: 'Brazil',        shortName: 'Brazil', flag: '🇧🇷', color: '#009C3B' },
]

test('opens dropdown and shows all teams when input focused', async () => {
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={() => {}} onClear={() => {}} />)
  await userEvent.click(screen.getByRole('textbox'))
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.getByText('United States')).toBeInTheDocument()
})

test('filters teams by typed text', async () => {
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={() => {}} onClear={() => {}} />)
  await userEvent.type(screen.getByRole('textbox'), 'mex')
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.queryByText('United States')).not.toBeInTheDocument()
})

test('calls onSelect with TLA when option clicked', async () => {
  const onSelect = vi.fn()
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={onSelect} onClear={() => {}} />)
  await userEvent.click(screen.getByRole('textbox'))
  await userEvent.click(screen.getByText('Mexico'))
  expect(onSelect).toHaveBeenCalledWith('MEX')
})

test('shows clear button when a team is selected', () => {
  render(<TeamSelector teams={teams} selectedTla="MEX" onSelect={() => {}} onClear={() => {}} />)
  expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
})

test('calls onClear when clear button clicked', async () => {
  const onClear = vi.fn()
  render(<TeamSelector teams={teams} selectedTla="MEX" onSelect={() => {}} onClear={onClear} />)
  await userEvent.click(screen.getByRole('button', { name: /clear/i }))
  expect(onClear).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/components/Sidebar/TeamSelector.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement TeamSelector.jsx**

Create `src/components/Sidebar/TeamSelector.jsx`:
```jsx
import { useState, useRef, useEffect } from 'react'
import styles from './TeamSelector.module.css'

export default function TeamSelector({ teams, selectedTla, onSelect, onClear }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const containerRef        = useRef(null)

  const selectedTeam = teams.find(t => t.tla === selectedTla)

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.tla.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleSelect(tla) {
    onSelect(tla)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onClear()
    setQuery('')
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.row}>
        <input
          type="text"
          className={styles.input}
          placeholder={
            selectedTeam
              ? `${selectedTeam.flag} ${selectedTeam.name}`
              : 'Search team…'
          }
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          aria-label="Search team"
        />
        {selectedTla && (
          <button className={styles.clearBtn} onClick={handleClear} aria-label="clear selection">
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {filtered.length === 0 && (
            <li className={styles.empty}>No teams found</li>
          )}
          {filtered.map(team => (
            <li
              key={team.tla}
              className={`${styles.option} ${team.tla === selectedTla ? styles.selected : ''}`}
              role="option"
              aria-selected={team.tla === selectedTla}
              onMouseDown={() => handleSelect(team.tla)}
            >
              <span className={styles.flag}>{team.flag}</span>
              <span>{team.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create TeamSelector.module.css**

Create `src/components/Sidebar/TeamSelector.module.css`:
```css
.container {
  position: relative;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}
.row { display: flex; align-items: center; gap: 8px; }
.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
}
.input:focus { border-color: var(--accent-color, #3b82f6); }

.clearBtn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #94a3b8;
  padding: 4px;
  line-height: 1;
}
.clearBtn:hover { color: #475569; }

.dropdown {
  position: absolute;
  top: calc(100% - 8px);
  left: 16px;
  right: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;
  list-style: none;
  margin: 0;
  padding: 4px 0;
}
.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
}
.option:hover { background: #f1f5f9; }
.selected { background: #eff6ff; font-weight: 600; }
.flag { font-size: 18px; line-height: 1; }
.empty { padding: 12px; text-align: center; color: #94a3b8; font-size: 13px; }
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/components/Sidebar/TeamSelector.test.jsx
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar/TeamSelector.jsx src/components/Sidebar/TeamSelector.module.css src/components/Sidebar/TeamSelector.test.jsx
git commit -m "feat: add searchable TeamSelector dropdown"
```

---

### Task 10: Sidebar Component

**Files:**
- Create: `src/components/Sidebar/Sidebar.jsx`
- Create: `src/components/Sidebar/Sidebar.module.css`
- Create: `src/components/Sidebar/Sidebar.test.jsx`

**Interfaces:**
- Props: `teams: Team[], matches: Match[], stadiumsMap: Map<string,Stadium>, teamsMap: Map<string,Team>, selectedTeam: string|null, selectedStadium: string|null, stadiumName: string|null, onTeamSelect: (tla:string)=>void, onTeamClear: ()=>void`
- Consumes: `filterByTeam`, `filterByStadium`, `getUpcoming` from `../../utils/matchFilters`
- Logic: selectedTeam → filter by team; selectedStadium → filter by stadium; neither → `getUpcoming(matches, 5)`

- [ ] **Step 1: Write failing tests**

Create `src/components/Sidebar/Sidebar.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'

const stadiumsMap = new Map([
  ['NYC', { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', lat: 40.81, lon: -74.07 }],
])
const teamsMap = new Map([
  ['USA', { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }],
  ['MEX', { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }],
])
const teams = [...teamsMap.values()]

const matches = [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: '2099-07-01T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: null, away_score: null },
  { id: '2', home_team: 'MEX', away_team: 'USA', stadium_id: 'NYC', datetime_utc: '2099-07-05T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_B', home_score: null, away_score: null },
]

const base = {
  teams, matches, stadiumsMap, teamsMap,
  selectedTeam: null, selectedStadium: null, stadiumName: null,
  onTeamSelect: () => {}, onTeamClear: () => {},
}

test('shows "Next matches" heading when nothing selected', () => {
  render(<Sidebar {...base} />)
  expect(screen.getByText('Next matches')).toBeInTheDocument()
})

test('shows team name as heading when team selected', () => {
  render(<Sidebar {...base} selectedTeam="USA" />)
  expect(screen.getByText(/United States/)).toBeInTheDocument()
})

test('shows stadium name as heading when stadium selected', () => {
  render(<Sidebar {...base} selectedStadium="NYC" stadiumName="MetLife Stadium" />)
  expect(screen.getByText('MetLife Stadium')).toBeInTheDocument()
})

test('filters to only USA matches when team is USA', () => {
  render(<Sidebar {...base} selectedTeam="USA" />)
  // Both match 1 and 2 involve USA
  expect(screen.getAllByText(/United States|Mexico/).length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run failing tests**

```bash
npx vitest run src/components/Sidebar/Sidebar.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement Sidebar.jsx**

Create `src/components/Sidebar/Sidebar.jsx`:
```jsx
import { filterByTeam, filterByStadium, getUpcoming } from '../../utils/matchFilters'
import TeamSelector from './TeamSelector'
import MatchList from './MatchList'
import styles from './Sidebar.module.css'

export default function Sidebar({
  teams, matches, stadiumsMap, teamsMap,
  selectedTeam, selectedStadium, stadiumName,
  onTeamSelect, onTeamClear,
}) {
  let displayedMatches, heading, emptyMessage

  if (selectedTeam) {
    const team = teamsMap.get(selectedTeam)
    displayedMatches = filterByTeam(matches, selectedTeam)
    heading          = `${team?.flag || ''} ${team?.name || selectedTeam}`.trim()
    emptyMessage     = 'No matches found for this team'
  } else if (selectedStadium) {
    displayedMatches = filterByStadium(matches, selectedStadium)
    heading          = stadiumName || selectedStadium
    emptyMessage     = 'No matches at this venue'
  } else {
    displayedMatches = getUpcoming(matches, 5)
    heading          = 'Next matches'
    emptyMessage     = 'No upcoming matches'
  }

  return (
    <aside className={styles.sidebar}>
      <TeamSelector
        teams={teams}
        selectedTla={selectedTeam}
        onSelect={onTeamSelect}
        onClear={onTeamClear}
      />
      <div className={styles.heading}>{heading}</div>
      <MatchList
        matches={displayedMatches}
        stadiumsMap={stadiumsMap}
        teamsMap={teamsMap}
        emptyMessage={emptyMessage}
      />
    </aside>
  )
}
```

- [ ] **Step 4: Create Sidebar.module.css**

Create `src/components/Sidebar/Sidebar.module.css`:
```css
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  overflow: hidden;
}
.heading {
  padding: 10px 16px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/components/Sidebar/Sidebar.test.jsx
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar/Sidebar.jsx src/components/Sidebar/Sidebar.module.css src/components/Sidebar/Sidebar.test.jsx
git commit -m "feat: add Sidebar composing TeamSelector + MatchList with filter logic"
```

---

### Task 11: App.jsx — Global State + Wiring

**Files:**
- Modify: `src/App.jsx`
- Create: `src/App.module.css`
- Create: `src/App.test.jsx`

**Interfaces:**
- State: `selectedTeam: string|null`, `selectedStadium: string|null`
- Mutual exclusivity: `handleTeamSelect` clears stadium; `handleStadiumClick` clears team; clicking the same stadium twice deselects it
- Derives `highlightedStadiumIds: Set<string>` from `selectedTeam`'s matches

- [ ] **Step 1: Write failing test**

Create `src/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }) => <svg>{children}</svg>,
  Geographies:   ({ children }) => <>{children({ geographies: [] })}</>,
  Geography:     () => null,
  Marker:        ({ children }) => <g>{children}</g>,
}))

vi.mock('./data/matches.json', () => ({ default: [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC',
    datetime_utc: '2099-07-01T20:00:00Z', stage: 'GROUP_STAGE',
    group: 'GROUP_A', home_score: null, away_score: null },
]}))
vi.mock('./data/teams.json', () => ({ default: [
  { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' },
  { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' },
]}))
vi.mock('./data/stadiums.json', () => ({ default: [
  { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford',
    country: 'USA', lat: 40.81, lon: -74.07 },
]}))

test('renders without crashing and shows search input', () => {
  render(<App />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

test('shows Next matches by default', () => {
  render(<App />)
  expect(screen.getByText('Next matches')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run failing test**

```bash
npx vitest run src/App.test.jsx
```
Expected: FAIL

- [ ] **Step 3: Implement App.jsx**

Replace `src/App.jsx`:
```jsx
import { useState, useMemo } from 'react'
import matchesData  from './data/matches.json'
import teamsData    from './data/teams.json'
import stadiumsData from './data/stadiums.json'
import Map     from './components/Map/Map'
import Sidebar from './components/Sidebar/Sidebar'
import styles  from './App.module.css'

export default function App() {
  const [selectedTeam,    setSelectedTeam]    = useState(null)
  const [selectedStadium, setSelectedStadium] = useState(null)

  const stadiumsMap = useMemo(
    () => new Map(stadiumsData.map(s => [s.id, s])), []
  )
  const teamsMap = useMemo(
    () => new Map(teamsData.map(t => [t.tla, t])), []
  )

  const highlightedStadiumIds = useMemo(() => {
    if (!selectedTeam) return new Set()
    return new Set(
      matchesData
        .filter(m => m.home_team === selectedTeam || m.away_team === selectedTeam)
        .map(m => m.stadium_id)
        .filter(Boolean)
    )
  }, [selectedTeam])

  const accentColor = selectedTeam
    ? (teamsMap.get(selectedTeam)?.color || '#3b82f6')
    : '#3b82f6'

  function handleTeamSelect(tla) {
    setSelectedTeam(tla)
    setSelectedStadium(null)
  }

  function handleTeamClear() {
    setSelectedTeam(null)
  }

  function handleStadiumClick(id) {
    setSelectedStadium(prev => prev === id ? null : id)
    setSelectedTeam(null)
  }

  const stadiumName = selectedStadium
    ? stadiumsMap.get(selectedStadium)?.name || null
    : null

  return (
    <div className={styles.app} style={{ '--accent-color': accentColor }}>
      <div className={styles.mapPanel}>
        <Map
          stadiums={stadiumsData}
          highlightedIds={highlightedStadiumIds}
          selectedId={selectedStadium}
          onStadiumClick={handleStadiumClick}
        />
      </div>
      <div className={styles.sidebarPanel}>
        <Sidebar
          teams={teamsData}
          matches={matchesData}
          stadiumsMap={stadiumsMap}
          teamsMap={teamsMap}
          selectedTeam={selectedTeam}
          selectedStadium={selectedStadium}
          stadiumName={stadiumName}
          onTeamSelect={handleTeamSelect}
          onTeamClear={handleTeamClear}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create App.module.css**

Create `src/App.module.css`:
```css
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.mapPanel {
  flex: 3;
  position: relative;
}
.sidebarPanel {
  flex: 2;
  min-width: 360px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- [ ] **Step 5: Run passing tests**

```bash
npx vitest run src/App.test.jsx
```
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.module.css src/App.test.jsx
git commit -m "feat: wire App — team/stadium selection with mutual exclusivity and accent color"
```

---

### Task 12: Global Styles + Final Check

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.jsx` (remove default App.css import if present)
- Delete: `src/App.css` (Vite boilerplate)

- [ ] **Step 1: Replace src/index.css**

```css
:root {
  --accent-color: #3b82f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #f8fafc;
  color: #0f172a;
}
```

- [ ] **Step 2: Remove Vite boilerplate**

```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```

Open `src/main.jsx` and remove the line `import './App.css'` if it exists.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```
Expected: all tests pass, no failures.

- [ ] **Step 4: Start dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:5173` and check:
- North America map renders with country fills
- 16 stadium markers are visible as grey circles
- Hovering a marker shows the city name label
- Clicking a marker highlights it and shows that venue's matches in the sidebar
- Clicking the same marker again deselects (returns to "Next matches")
- Selecting a team from the dropdown highlights the correct stadiums and filters the sidebar
- Clearing the team selection returns to "Next matches"

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/main.jsx
git commit -m "chore: global styles and remove Vite boilerplate"
```
