import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/stadiums')

const STADIUMS = [
  { id: 'ATL', wiki: 'Mercedes-Benz_Stadium' },
  { id: 'BOS', wiki: 'Gillette_Stadium' },
  { id: 'DAL', wiki: 'AT%26T_Stadium' },
  { id: 'HOU', wiki: 'NRG_Stadium' },
  { id: 'KC',  wiki: 'Arrowhead_Stadium' },
  { id: 'LA',  wiki: 'SoFi_Stadium' },
  { id: 'MIA', wiki: 'Hard_Rock_Stadium' },
  { id: 'NYC', wiki: 'MetLife_Stadium' },
  { id: 'PHI', wiki: 'Lincoln_Financial_Field' },
  { id: 'SEA', wiki: 'Lumen_Field' },
  { id: 'SF',  wiki: "Levi%27s_Stadium" },
  { id: 'VAN', wiki: 'BC_Place' },
  { id: 'TOR', wiki: 'BMO_Field' },
  { id: 'MEX', wiki: 'Estadio_Azteca' },
  { id: 'MTY', wiki: 'Estadio_BBVA' },
  { id: 'GDL', wiki: 'Estadio_Akron' },
]

async function fetchThumbnailUrl(wikiTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`
  const res = await fetch(url, { headers: { 'User-Agent': 'worldcup-schedule-map/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.thumbnail?.source || null
}

async function downloadImage(url, path) {
  const res = await fetch(url, { headers: { 'User-Agent': 'worldcup-schedule-map/1.0' } })
  if (!res.ok) throw new Error(`Image HTTP ${res.status}`)
  writeFileSync(path, Buffer.from(await res.arrayBuffer()))
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const delay = ms => new Promise(r => setTimeout(r, ms))

  for (const { id, wiki } of STADIUMS) {
    const outPath = join(OUT_DIR, `${id.toLowerCase()}.jpg`)
    if (existsSync(outPath)) { console.log(`  – ${id}: already exists, skipping`); continue }
    try {
      const thumbUrl = await fetchThumbnailUrl(wiki)
      if (!thumbUrl) { console.warn(`  ⚠ ${id}: no thumbnail on Wikipedia`); continue }
      await delay(800)
      await downloadImage(thumbUrl, outPath)
      console.log(`  ✓ ${id}`)
    } catch (e) {
      console.error(`  ✗ ${id}: ${e.message}`)
    }
    await delay(400)
  }
  console.log('Done — images in public/stadiums/')
}

main().catch(e => { console.error(e); process.exit(1) })
