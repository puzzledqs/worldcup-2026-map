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
    home_team: m.homeTeam?.tla ?? 'TBD',
    away_team: m.awayTeam?.tla ?? 'TBD',
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null,
  }
}

function extractTeams(rawMatches) {
  const seen = new Map()
  for (const m of rawMatches) {
    for (const t of [m.homeTeam, m.awayTeam]) {
      if (t?.tla && !seen.has(t.tla)) {
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
