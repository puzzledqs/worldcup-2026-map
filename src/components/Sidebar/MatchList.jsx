import MatchCard from './MatchCard'
import styles from './MatchList.module.css'

export default function MatchList({ matches, stadiumsMap, teamsMap, emptyMessage }) {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc)
  )

  if (sorted.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>
  }

  return (
    <div className={styles.list}>
      {sorted.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          homeTeam={teamsMap.get(match.home_team)}
          awayTeam={teamsMap.get(match.away_team)}
          stadiumName={stadiumsMap.get(match.stadium_id)?.name || match.stadium_id || '—'}
          stadiumCity={stadiumsMap.get(match.stadium_id)?.city || ''}
        />
      ))}
    </div>
  )
}
