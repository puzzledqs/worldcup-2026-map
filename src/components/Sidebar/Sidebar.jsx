import { filterByTeams, filterByStadium, filterByGroup, getUpcoming } from '../../utils/matchFilters'
import TeamSelector from './TeamSelector'
import GroupSelector from './GroupSelector'
import MatchList from './MatchList'
import styles from './Sidebar.module.css'

export default function Sidebar({
  teams, matches, groups, stadiumsMap, teamsMap,
  selectedTlas, selectedStadium, stadiumName,
  selectedGroup,
  onTeamAdd, onTeamRemove, onTeamClearAll,
  onGroupSelect, onGroupClear,
  onStadiumClear,
}) {
  if (matches.length === 0 && teams.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.setup}>
          <p>No match data loaded.</p>
          <code>npm run fetch-data</code>
          <p>then refresh the page.</p>
        </div>
      </aside>
    )
  }

  let displayedMatches, heading, emptyMessage

  if (selectedTlas.size > 0) {
    displayedMatches = filterByTeams(matches, selectedTlas)
    if (selectedTlas.size === 1) {
      const tla  = [...selectedTlas][0]
      const team = teamsMap.get(tla)
      heading    = `${team?.flag || ''} ${team?.name || tla}`.trim()
    } else {
      const flags = [...selectedTlas].map(t => teamsMap.get(t)?.flag || '').join(' ')
      heading     = `${flags} ${selectedTlas.size} teams`
    }
    emptyMessage = 'No matches found'
  } else if (selectedGroup) {
    displayedMatches = filterByGroup(matches, selectedGroup)
    heading          = `Group ${selectedGroup}`
    emptyMessage     = 'No matches in this group'
  } else if (selectedStadium) {
    displayedMatches = filterByStadium(matches, selectedStadium)
    heading          = stadiumName || selectedStadium
    emptyMessage     = 'No matches at this venue'
  } else {
    displayedMatches = getUpcoming(matches, 5)
    heading          = 'Next matches'
    emptyMessage     = 'No upcoming matches'
  }

  return (
    <aside className={styles.sidebar}>
      <TeamSelector
        teams={teams}
        selectedTlas={selectedTlas}
        onAdd={onTeamAdd}
        onRemove={onTeamRemove}
        onClearAll={onTeamClearAll}
      />
      <GroupSelector
        groups={groups}
        selectedGroup={selectedGroup}
        onSelect={onGroupSelect}
        onClear={onGroupClear}
      />
      {selectedStadium && (() => {
        const stadium = stadiumsMap.get(selectedStadium)
        return stadium?.thumbnail ? (
          <div className={styles.stadiumHero}>
            <img src={stadium.thumbnail} alt={stadium.name} className={styles.stadiumImg} />
          </div>
        ) : null
      })()}
      <div className={styles.headingRow}>
        <span className={styles.heading}>{heading}</span>
        {selectedStadium && (
          <button className={styles.clearStadium} onClick={onStadiumClear} aria-label="unselect stadium">✕</button>
        )}
      </div>
      <MatchList
        matches={displayedMatches}
        stadiumsMap={stadiumsMap}
        teamsMap={teamsMap}
        emptyMessage={emptyMessage}
      />
    </aside>
  )
}
