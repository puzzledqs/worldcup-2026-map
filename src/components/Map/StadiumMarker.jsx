import { Marker } from 'react-simple-maps'
import styles from './StadiumMarker.module.css'

const SIZE_DEFAULT     = 44
const SIZE_HIGHLIGHTED = 52

export default function StadiumMarker({ stadium, state, matchCount, onClick, labelOnly }) {
  const size = state === 'highlighted' ? SIZE_HIGHLIGHTED : SIZE_DEFAULT
  const half = size / 2
  const rx   = 8

  if (labelOnly) {
    return (
      <Marker coordinates={[stadium.lon, stadium.lat]}>
        <text
          className={`${styles.label} ${styles[state]}`}
          textAnchor="middle"
          y={half + 13}
          style={{ pointerEvents: 'none' }}
        >
          {stadium.city}
        </text>
      </Marker>
    )
  }

  const clipId = `clip-${stadium.id}`

  return (
    <Marker coordinates={[stadium.lon, stadium.lat]}>
      <g
        role="button"
        aria-label={stadium.name}
        className={`${styles.marker} ${styles[state]}`}
        onClick={() => onClick(stadium.id)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={-half} y={-half} width={size} height={size} rx={rx} />
          </clipPath>
        </defs>

        {stadium.thumbnail ? (
          <image
            href={stadium.thumbnail}
            x={-half} y={-half}
            width={size} height={size}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <rect x={-half} y={-half} width={size} height={size} rx={rx} className={styles.fallback} />
        )}

        {/* border ring */}
        <rect
          x={-half} y={-half}
          width={size} height={size}
          rx={rx}
          className={styles.border}
        />

        {/* match count badge — top-right corner */}
        <g transform={`translate(${half - 9}, ${-half + 9})`}>
          <circle r={9} className={styles.badge} />
          <text textAnchor="middle" dominantBaseline="central" className={styles.count}>
            {matchCount}
          </text>
        </g>
      </g>
    </Marker>
  )
}
