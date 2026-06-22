import { formatMatchDate, formatScore, matchStatus } from '../../utils/formatters'
import styles from './MatchCard.module.css'

function stageLabel(stage, group) {
  if (stage === 'GROUP_STAGE') {
    return group ? `Group ${group.replace('GROUP_', '')}` : 'Group Stage'
  }
  const MAP = {
    ROUND_OF_32:   'Round of 32',
    ROUND_OF_16:   'Round of 16',
    QUARTER_FINAL: 'Quarter-final',
    SEMI_FINAL:    'Semi-final',
    THIRD_PLACE:   'Third Place',
    FINAL:         'Final',
  }
  return MAP[stage] || stage
}

export default function MatchCard({ match, homeTeam, awayTeam, stadiumName, stadiumCity, onClick }) {
  const status   = matchStatus(match)
  // Only show a score once the match is finished — hide it while live or upcoming
  const score    = status.kind === 'finished' ? formatScore(match.home_score, match.away_score) : null
  const homeName = homeTeam?.name || match.home_team
  const awayName = awayTeam?.name || match.away_team
  const homeFlag = homeTeam?.flag || ''
  const awayFlag = awayTeam?.flag || ''

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick ? () => onClick(match) : undefined}
    >
      <div className={styles.meta}>
        <span className={styles.stage}>{stageLabel(match.stage, match.group)}</span>
        <span className={`${styles.status} ${styles[status.kind]}`}>
          {status.kind === 'live' && <span className={styles.dot} />}
          {status.label}
        </span>
      </div>
      <div className={styles.teams}>
        <span className={styles.team}>
          {homeFlag && <span className={styles.flag}>{homeFlag}</span>} {homeName}
        </span>
        <span className={styles.score}>
          {score ?? <span className={styles.upcoming}>vs</span>}
        </span>
        <span className={`${styles.team} ${styles.away}`}>
          {awayName} {awayFlag && <span className={styles.flag}>{awayFlag}</span>}
        </span>
      </div>
      <div className={styles.footer}>
        <span className={styles.venue}>
          {stadiumName}{stadiumCity ? <span className={styles.city}>, {stadiumCity}</span> : null}
        </span>
        <span className={styles.date}>{formatMatchDate(match.datetime_utc)}</span>
      </div>
    </div>
  )
}
