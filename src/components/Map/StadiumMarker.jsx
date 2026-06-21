import { Marker } from 'react-simple-maps'
import styles from './StadiumMarker.module.css'

export default function StadiumMarker({ stadium, state, matchCount, onClick }) {
  const r = state === 'highlighted' ? 13 : 11
  return (
    <Marker coordinates={[stadium.lon, stadium.lat]}>
      <g
        role="button"
        aria-label={stadium.name}
        className={`${styles.marker} ${styles[state]}`}
        onClick={() => onClick(stadium.id)}
      >
        <circle r={r} />
        <text className={styles.count} textAnchor="middle" dominantBaseline="central">
          {matchCount}
        </text>
        <text className={styles.label} textAnchor="middle" y={r + 12}>
          {stadium.city}
        </text>
      </g>
    </Marker>
  )
}
