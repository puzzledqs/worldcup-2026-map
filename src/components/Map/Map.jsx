import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps'
import StadiumMarker from './StadiumMarker'
import TrajectoryBubble from './TrajectoryBubble'
import styles from './Map.module.css'

const GEO_URL = '/world-110m.json'
// ISO numeric IDs from world-atlas 2.x: USA=840, Canada=124, Mexico=484
const NA_IDS = new Set([840, 124, 484])

export default function Map({
  stadiums, highlightedIds, selectedId, focusedId,
  stadiumMatchCounts, perTeamTrajectories, trajectoryStopsByStadium,
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
        projectionConfig={{ scale: 660, center: [-96, 37] }}
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

        {(perTeamTrajectories || []).map(({ tla, teamColor, points }) =>
          points.length >= 2 ? (
            <Line
              key={tla}
              coordinates={points}
              stroke={teamColor}
              strokeWidth={2}
              strokeDasharray="6 3"
              strokeLinecap="round"
              fill="transparent"
            />
          ) : null
        )}

        {/* Focus ring for a stadium clicked from a match card */}
        {focusedId && (() => {
          const s = stadiums.find(st => st.id === focusedId)
          if (!s) return null
          return (
            <Marker coordinates={[s.lon, s.lat]}>
              <circle className={styles.focusRingStatic} r={34} />
              <circle className={styles.focusRing} r={38} />
            </Marker>
          )
        })()}

        {/* Pass 1: thumbnails (no labels) */}
        {stadiums.map(s => (
          <StadiumMarker
            key={s.id}
            stadium={s}
            state={markerState(s.id)}
            matchCount={stadiumMatchCounts.get(s.id) ?? 0}
            onClick={onStadiumClick}
          />
        ))}

        {/* Pass 2: city labels on top of all thumbnails */}
        {stadiums.map(s => (
          <StadiumMarker
            key={`lbl-${s.id}`}
            stadium={s}
            state={markerState(s.id)}
            matchCount={0}
            onClick={onStadiumClick}
            labelOnly
          />
        ))}

        {/* Pass 3: trajectory bubbles — topmost */}
        {stadiums.map(s => {
          const stops = trajectoryStopsByStadium?.get(s.id)
          if (!stops?.length) return null
          return <TrajectoryBubble key={`b-${s.id}`} stadium={s} stops={stops} />
        })}
      </ComposableMap>
    </div>
  )
}
