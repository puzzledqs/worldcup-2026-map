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
