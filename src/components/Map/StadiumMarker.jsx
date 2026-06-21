import { Marker } from 'react-simple-maps'
import styles from './StadiumMarker.module.css'

export default function StadiumMarker({ stadium, state, matchCount, trajectoryStops = [], onClick }) {
  const r = state === 'highlighted' ? 13 : 11
  const n = trajectoryStops.length
  // Each bubble is 38px tall; stack upward from just above the circle
  const bubbleHeight = 38

  return (
    <Marker coordinates={[stadium.lon, stadium.lat]}>
      <g
        role="button"
        aria-label={stadium.name}
        className={`${styles.marker} ${styles[state]}`}
        onClick={() => onClick(stadium.id)}
      >
        {/* Trajectory bubbles — chronological order top to bottom */}
        {trajectoryStops.map((stop, i) => {
          const yCenter = -(r + 6) - (n - 1 - i) * bubbleHeight
          const scoreStr = stop.homeScore !== null
            ? `${stop.homeScore} – ${stop.awayScore}`
            : 'vs'
          return (
            <g key={stop.seq} transform={`translate(0, ${yCenter})`}>
              <rect
                x={-62} y={-17} width={124} height={34} rx={5}
                className={styles.bubble}
              />
              <text textAnchor="middle" y={-4} className={styles.bubbleLine1}>
                {stop.seq}. {stop.homeFlag} {scoreStr} {stop.awayFlag}
              </text>
              <text textAnchor="middle" y={11} className={styles.bubbleDate}>
                {stop.dateStr}
              </text>
            </g>
          )
        })}

        {/* Marker circle */}
        <circle r={r} />
        <text className={styles.count} textAnchor="middle" dominantBaseline="central">
          {matchCount}
        </text>
        <text className={styles.label} textAnchor="middle" y={r + 13}>
          {stadium.city}
        </text>
      </g>
    </Marker>
  )
}
