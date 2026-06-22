import { filterByTeams, filterByStadium, filterByGroup, filterByStage, getUpcoming } from '../../utils/matchFilters'
import TeamSelector from './TeamSelector'
import GroupSelector from './GroupSelector'
import StageSelector from './StageSelector'
import MatchList from './MatchList'
import styles from './Sidebar.module.css'

const STAGE_LABELS = {
  GROUP_STAGE: 'Group Stage', ROUND_OF_32: 'Round of 32', ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-finals', SEMI_FINAL: 'Semi-finals', THIRD_PLACE: 'Third Place', FINAL: 'Final',
}

export default function Sidebar({
  teams, matches, groups, stages, stadiumsMap, teamsMap,
  selectedTlas, selectedStadium, stadiumName, selectedGroup, selectedStage,
  onTeamAdd, onTeamRemove, onTeamClearAll,
  onGroupSelect, onGroupClear,
  onStageSelect, onStageClear,
  onStadiumClear, onMatchClick,
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
  } else if (selectedStage) {
    displayedMatches = filterByStage(matches, selectedStage)
    heading          = STAGE_LABELS[selectedStage] || selectedStage
    emptyMessage     = 'No matches in this stage'
  } else if (selectedStadium) {
    displayedMatches = filterByStadium(matches, selectedStadium)
    heading          = stadiumName || selectedStadium
    emptyMessage     = 'No matches at this venue'
  } else {
    displayedMatches = getUpcoming(matches, 5)
    heading          = 'Live & upcoming'
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
      <StageSelector
        stages={stages}
        selectedStage={selectedStage}
        onSelect={onStageSelect}
        onClear={onStageClear}
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
        onMatchClick={onMatchClick}
      />
    </aside>
  )
}
