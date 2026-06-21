import { useState, useMemo } from 'react'
import matchesData  from './data/matches.json'
import teamsData    from './data/teams.json'
import stadiumsData from './data/stadiums.json'
import MapComponent from './components/Map/Map'
import Sidebar      from './components/Sidebar/Sidebar'
import styles  from './App.module.css'

export default function App() {
  const [selectedTeam,    setSelectedTeam]    = useState(null)
  const [selectedStadium, setSelectedStadium] = useState(null)
  const [selectedGroup,   setSelectedGroup]   = useState(null)

  const stadiumsMap = useMemo(
    () => new Map(stadiumsData.map(s => [s.id, s])), []
  )
  const teamsMap = useMemo(
    () => new Map(teamsData.map(t => [t.tla, t])), []
  )
  const groups = useMemo(
    () => [...new Set(matchesData.filter(m => m.group).map(m => m.group))].sort(),
    []
  )

  const stadiumMatchCounts = useMemo(() => {
    const counts = new Map()
    matchesData.forEach(m => {
      if (m.stadium_id) counts.set(m.stadium_id, (counts.get(m.stadium_id) || 0) + 1)
    })
    return counts
  }, [])

  const highlightedStadiumIds = useMemo(() => {
    if (selectedTeam) {
      return new Set(
        matchesData
          .filter(m => m.home_team === selectedTeam || m.away_team === selectedTeam)
          .map(m => m.stadium_id)
          .filter(Boolean)
      )
    }
    if (selectedGroup) {
      return new Set(
        matchesData
          .filter(m => m.group === selectedGroup)
          .map(m => m.stadium_id)
          .filter(Boolean)
      )
    }
    return new Set()
  }, [selectedTeam, selectedGroup])

  // Chronological sequence of [lon, lat] for selected team's matches (dedup consecutive)
  const trajectoryPoints = useMemo(() => {
    if (!selectedTeam) return []
    const stadia = matchesData
      .filter(m => (m.home_team === selectedTeam || m.away_team === selectedTeam) && m.stadium_id)
      .sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc))
      .map(m => stadiumsMap.get(m.stadium_id))
      .filter(Boolean)
    // Remove consecutive duplicates so we don't draw zero-length segments
    const deduped = stadia.filter((s, i) => i === 0 || s.id !== stadia[i - 1].id)
    return deduped.map(s => [s.lon, s.lat])
  }, [selectedTeam, stadiumsMap])

  const accentColor = selectedTeam
    ? (teamsMap.get(selectedTeam)?.color || '#3b82f6')
    : '#3b82f6'

  function handleTeamSelect(tla) {
    setSelectedTeam(tla)
    setSelectedStadium(null)
    setSelectedGroup(null)
  }
  function handleTeamClear() { setSelectedTeam(null) }

  function handleGroupSelect(g) {
    setSelectedGroup(g)
    setSelectedTeam(null)
    setSelectedStadium(null)
  }
  function handleGroupClear() { setSelectedGroup(null) }

  function handleStadiumClick(id) {
    setSelectedStadium(prev => prev === id ? null : id)
    setSelectedTeam(null)
    setSelectedGroup(null)
  }

  const stadiumName = selectedStadium
    ? stadiumsMap.get(selectedStadium)?.name || null
    : null

  return (
    <div className={styles.app} style={{ '--accent-color': accentColor }}>
      <div className={styles.mapPanel}>
        <MapComponent
          stadiums={stadiumsData}
          highlightedIds={highlightedStadiumIds}
          selectedId={selectedStadium}
          stadiumMatchCounts={stadiumMatchCounts}
          trajectoryPoints={trajectoryPoints}
          onStadiumClick={handleStadiumClick}
        />
      </div>
      <div className={styles.sidebarPanel}>
        <Sidebar
          teams={teamsData}
          matches={matchesData}
          groups={groups}
          stadiumsMap={stadiumsMap}
          teamsMap={teamsMap}
          selectedTeam={selectedTeam}
          selectedStadium={selectedStadium}
          stadiumName={stadiumName}
          selectedGroup={selectedGroup}
          onTeamSelect={handleTeamSelect}
          onTeamClear={handleTeamClear}
          onGroupSelect={handleGroupSelect}
          onGroupClear={handleGroupClear}
        />
      </div>
    </div>
  )
}
