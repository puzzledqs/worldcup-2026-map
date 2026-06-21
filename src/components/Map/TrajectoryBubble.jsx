import { Marker } from 'react-simple-maps'
import styles from './TrajectoryBubble.module.css'

const R = 13 // highlighted marker radius
const BUBBLE_H = 38

export default function TrajectoryBubble({ stadium, stops }) {
  const n = stops.length
  return (
    <Marker coordinates={[stadium.lon, stadium.lat]}>
      {stops.map((stop, i) => {
        const yCenter = -(R + 6) - (n - 1 - i) * BUBBLE_H
        const scoreStr = stop.homeScore !== null
          ? `${stop.homeScore} – ${stop.awayScore}`
          : 'vs'
        return (
          <g key={stop.seq} transform={`translate(0, ${yCenter})`} style={{ pointerEvents: 'none' }}>
            <rect x={-62} y={-17} width={124} height={34} rx={5} className={styles.bubble} />
            <text textAnchor="middle" y={-4} className={styles.line1}>
              {stop.seq}. {stop.homeFlag} {scoreStr} {stop.awayFlag}
            </text>
            <text textAnchor="middle" y={11} className={styles.date}>
              {stop.dateStr}
            </text>
          </g>
        )
      })}
    </Marker>
  )
}
