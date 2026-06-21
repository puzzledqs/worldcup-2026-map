import { ComposableMap, Geographies, Geography, Line } from 'react-simple-maps'
import StadiumMarker from './StadiumMarker'
import styles from './Map.module.css'

const GEO_URL = '/world-110m.json'
// ISO numeric IDs from world-atlas 2.x: USA=840, Canada=124, Mexico=484
const NA_IDS = new Set([840, 124, 484])

export default function Map({
  stadiums, highlightedIds, selectedId,
  stadiumMatchCounts, trajectoryPoints,
  onStadiumClick,
}) {
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

        {trajectoryPoints.length >= 2 && (
          <Line
            coordinates={trajectoryPoints}
            stroke="var(--accent-color, #3b82f6)"
            strokeWidth={2}
            strokeDasharray="6 3"
            strokeLinecap="round"
            fill="transparent"
          />
        )}

        {stadiums.map(s => (
          <StadiumMarker
            key={s.id}
            stadium={s}
            state={markerState(s.id)}
            matchCount={stadiumMatchCounts.get(s.id) ?? 0}
            onClick={onStadiumClick}
          />
        ))}
      </ComposableMap>
    </div>
  )
}
