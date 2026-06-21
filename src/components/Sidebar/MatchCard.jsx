import { formatMatchDate, formatScore } from '../../utils/formatters'
import styles from './MatchCard.module.css'

function stageLabel(stage, group) {
  if (stage === 'GROUP_STAGE') {
    return group ? `Group ${group.replace('GROUP_', '')}` : 'Group Stage'
  }
  const MAP = {
    ROUND_OF_32:   'Round of 32',
    ROUND_OF_16:   'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS:   'Semi-final',
    THIRD_PLACE:   'Third Place',
    FINAL:         'Final',
  }
  return MAP[stage] || stage
}

export default function MatchCard({ match, homeTeam, awayTeam, stadiumName }) {
  const score    = formatScore(match.home_score, match.away_score)
  const homeName = homeTeam?.name || match.home_team
  const awayName = awayTeam?.name || match.away_team
  const homeFlag = homeTeam?.flag || ''
  const awayFlag = awayTeam?.flag || ''

  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.stage}>{stageLabel(match.stage, match.group)}</span>
        <span className={styles.date}>{formatMatchDate(match.datetime_utc)}</span>
      </div>
      <div className={styles.teams}>
        <span className={styles.team}>{homeFlag} {homeName}</span>
        <span className={styles.score}>
          {score ?? <span className={styles.upcoming}>Upcoming</span>}
        </span>
        <span className={`${styles.team} ${styles.away}`}>{awayName} {awayFlag}</span>
      </div>
      <div className={styles.venue}>{stadiumName}</div>
    </div>
  )
}
