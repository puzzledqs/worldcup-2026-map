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
