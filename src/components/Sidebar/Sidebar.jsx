import { filterByTeam, filterByStadium, filterByGroup, getUpcoming } from '../../utils/matchFilters'
import TeamSelector from './TeamSelector'
import GroupSelector from './GroupSelector'
import MatchList from './MatchList'
import styles from './Sidebar.module.css'

export default function Sidebar({
  teams, matches, groups, stadiumsMap, teamsMap,
  selectedTeam, selectedStadium, stadiumName,
  selectedGroup,
  onTeamSelect, onTeamClear,
  onGroupSelect, onGroupClear,
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

  if (selectedTeam) {
    const team = teamsMap.get(selectedTeam)
    displayedMatches = filterByTeam(matches, selectedTeam)
    heading          = `${team?.flag || ''} ${team?.name || selectedTeam}`.trim()
    emptyMessage     = 'No matches found for this team'
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
        selectedTla={selectedTeam}
        onSelect={onTeamSelect}
        onClear={onTeamClear}
      />
      <GroupSelector
        groups={groups}
        selectedGroup={selectedGroup}
        onSelect={onGroupSelect}
        onClear={onGroupClear}
      />
      <div className={styles.heading}>{heading}</div>
      <MatchList
        matches={displayedMatches}
        stadiumsMap={stadiumsMap}
        teamsMap={teamsMap}
        emptyMessage={emptyMessage}
      />
    </aside>
  )
}
