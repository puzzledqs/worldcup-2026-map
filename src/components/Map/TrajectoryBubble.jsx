import { Marker } from 'react-simple-maps'
import styles from './TrajectoryBubble.module.css'

const R = 26 // half-size of highlighted thumbnail marker (52/2)
const BUBBLE_H = 58 // rect height 46 + 12px gap

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
          <g key={i} transform={`translate(0, ${yCenter})`} style={{ pointerEvents: 'none' }}>
            <rect x={-62} y={-23} width={124} height={46} rx={5} className={styles.bubble} />
            {stop.teamColor && (
              <rect x={-62} y={-23} width={6} height={46} rx={3} fill={stop.teamColor} />
            )}
            <text textAnchor="middle" y={-10} className={styles.venue}>
              {stadium.name}
            </text>
            <text textAnchor="middle" y={3} className={styles.line1}>
              {stop.seq}. {stop.homeFlag} {scoreStr} {stop.awayFlag}
            </text>
            <text textAnchor="middle" y={16} className={styles.date}>
              {stop.dateStr}
            </text>
          </g>
        )
      })}
    </Marker>
  )
}
