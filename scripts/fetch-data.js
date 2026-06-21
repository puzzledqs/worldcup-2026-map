import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/data')

// ESPN public API — no key required
const ESPN_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/FIFA.WORLD/scoreboard' +
  '?dates=20260601-20260720&limit=120'

// Maps ESPN venue strings to our stadium IDs
const VENUE_TO_STADIUM_ID = {
  'Mercedes-Benz Stadium': 'ATL',
  'Gillette Stadium': 'BOS',
  'AT&T Stadium': 'DAL',
  'NRG Stadium': 'HOU',
  'GEHA Field at Arrowhead Stadium': 'KC',
  'SoFi Stadium': 'LA',
  'Hard Rock Stadium': 'MIA',
  'MetLife Stadium': 'NYC',
  'Lincoln Financial Field': 'PHI',
  'Lumen Field': 'SEA',
  "Levi's Stadium": 'SF',
  'BC Place': 'VAN',
  'BMO Field': 'TOR',
  'Estadio Banorte': 'MEX',
  'Estadio BBVA': 'MTY',
  'Estadio Akron': 'GDL',
}

// ESPN team abbreviation → ISO 3166-1 alpha-2 for flag emoji generation
const TLA_TO_ALPHA2 = {
  USA: 'US', MEX: 'MX', CAN: 'CA', BRA: 'BR', ARG: 'AR',
  GER: 'DE', FRA: 'FR', ESP: 'ES', ENG: 'GB', POR: 'PT',
  NED: 'NL', JPN: 'JP', KOR: 'KR', AUS: 'AU', MAR: 'MA',
  SEN: 'SN', NGA: 'NG', EGY: 'EG', COL: 'CO', URU: 'UY',
  CHI: 'CL', ECU: 'EC', VEN: 'VE', PAN: 'PA', CRC: 'CR',
  HND: 'HN', KSA: 'SA', IRN: 'IR', IRQ: 'IQ', JOR: 'JO',
  QAT: 'QA', SUI: 'CH', AUT: 'AT', CRO: 'HR', SRB: 'RS',
  DEN: 'DK', SCO: 'GB', TUR: 'TR', CZE: 'CZ', SVK: 'SK',
  GRE: 'GR', ALB: 'AL', SVN: 'SI', NZL: 'NZ', CMR: 'CM',
  CIV: 'CI', GHA: 'GH', ITA: 'IT', BEL: 'BE', UKR: 'UA',
  POL: 'PL', ROU: 'RO', HUN: 'HU', NOR: 'NO', SWE: 'SE',
  WAL: 'GB', MLI: 'ML', UGA: 'UG', AGO: 'AO', ZIM: 'ZW',
  IDN: 'ID', THA: 'TH', VNM: 'VN', PHI: 'PH', MYS: 'MY',
  RSA: 'ZA', BIH: 'BA', PAR: 'PY', ALG: 'DZ', CPV: 'CV',
  COD: 'CD', HAI: 'HT', CUW: 'CW', UZB: 'UZ',
}

// Primary team colors (hex)
const TEAM_COLORS = {
  USA: '#B22234', MEX: '#006847', CAN: '#FF0000',
  BRA: '#009C3B', ARG: '#74ACDF', GER: '#000000',
  FRA: '#002395', ESP: '#AA151B', ENG: '#FFFFFF',
  POR: '#FF0000', NED: '#FF6600', JPN: '#BC002D',
  KOR: '#CD2E3A', AUS: '#00843D', MAR: '#C1272D',
  SEN: '#00853F', NGA: '#008751', EGY: '#CE1126',
  COL: '#FCD116', URU: '#5EB6E4', CHI: '#D52B1E',
  ECU: '#FFD100', VEN: '#CF142B', PAN: '#005293',
  CRC: '#002B7F', HND: '#0073CF', KSA: '#006C35',
  IRN: '#239F40', IRQ: '#007A3D', QAT: '#8D1B3D',
  SUI: '#FF0000', AUT: '#ED2939', CRO: '#FF0000',
  SRB: '#C6363C', DEN: '#C60C30', TUR: '#E30A17',
  CZE: '#D7141A', ITA: '#003F87', BEL: '#000000',
  RSA: '#007A4D', BIH: '#002395', PAR: '#D52B1E',
  ALG: '#006233', CPV: '#003893', COD: '#007FFF',
  HAI: '#00209F', CUW: '#002B7F', UZB: '#1EB53A',
  GHA: '#006B3F', CIV: '#F77F00', JOR: '#007A3D',
  NZL: '#00247D', NOR: '#EF2B2D', SCO: '#0065BD',
  SWE: '#006AA7', TUN: '#E70013',
}

function toFlagEmoji(alpha2) {
  return alpha2.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  )
}

// Determine knockout round from event date (UTC)
function knockoutStage(dateStr) {
  const d = new Date(dateStr)
  const day = d.toISOString().slice(0, 10)
  if (day <= '2026-07-07') return 'ROUND_OF_32'
  if (day <= '2026-07-13') return 'ROUND_OF_16'
  if (day <= '2026-07-18') return 'QUARTER_FINAL'
  if (day <= '2026-07-23') return 'SEMI_FINAL'
  if (day === '2026-07-25') return 'THIRD_PLACE'
  return 'FINAL'
}

// ESPN abbreviations like "1B", "RD16 W1" are TBD placeholders
function isTbd(abbr) {
  return !abbr || /\d/.test(abbr) || abbr.includes(' ')
}

function normalizeMatch(event) {
  const comp = event.competitions[0]
  const home = comp.competitors.find(c => c.homeAway === 'home')
  const away = comp.competitors.find(c => c.homeAway === 'away')

  const altNote = comp.altGameNote || ''
  const groupMatch = altNote.match(/Group ([A-Z]+)/)
  const stage = groupMatch ? 'GROUP_STAGE' : knockoutStage(event.date)
  const group = groupMatch ? groupMatch[1] : null

  const homeTla = isTbd(home?.team?.abbreviation) ? 'TBD' : home.team.abbreviation
  const awayTla = isTbd(away?.team?.abbreviation) ? 'TBD' : away.team.abbreviation

  const homeScore = home?.score != null ? parseInt(home.score, 10) : null
  const awayScore = away?.score != null ? parseInt(away.score, 10) : null
  const isPlayed = comp.status?.type?.name === 'STATUS_FULL_TIME' ||
                   comp.status?.type?.name === 'STATUS_FINAL'

  return {
    id: String(event.id),
    stage,
    group,
    datetime_utc: event.date,
    stadium_id: VENUE_TO_STADIUM_ID[comp.venue?.fullName] || null,
    home_team: homeTla,
    away_team: awayTla,
    home_score: isPlayed ? homeScore : null,
    away_score: isPlayed ? awayScore : null,
  }
}

function extractTeams(events) {
  const seen = new Map()
  for (const event of events) {
    for (const competitor of event.competitions[0].competitors) {
      const abbr = competitor.team?.abbreviation
      const name = competitor.team?.displayName
      if (!abbr || isTbd(abbr) || seen.has(abbr)) continue
      const alpha2 = TLA_TO_ALPHA2[abbr]
      seen.set(abbr, {
        tla: abbr,
        name: name || abbr,
        shortName: competitor.team?.shortDisplayName || abbr,
        flag: alpha2 ? toFlagEmoji(alpha2) : '🏳️',
        color: TEAM_COLORS[abbr] || '#666666',
      })
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function main() {
  console.log('Fetching from ESPN...')
  const res = await fetch(ESPN_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`ESPN API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  const events = data.events || []
  console.log(`Got ${events.length} events`)

  const matches = events.map(normalizeMatch)
  const teams = extractTeams(events)

  writeFileSync(join(DATA_DIR, 'matches.json'), JSON.stringify(matches, null, 2))
  writeFileSync(join(DATA_DIR, 'teams.json'), JSON.stringify(teams, null, 2))
  console.log(`Wrote ${matches.length} matches, ${teams.length} teams`)

  const unmapped = [...new Set(
    events.map(e => e.competitions[0].venue?.fullName).filter(v => v && !VENUE_TO_STADIUM_ID[v])
  )]
  if (unmapped.length) console.warn('Unmapped venues:', unmapped)

  const uncolored = teams.filter(t => t.color === '#666666').map(t => t.tla)
  if (uncolored.length) console.warn('No color defined for:', uncolored)
}

main().catch(err => { console.error(err); process.exit(1) })
