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

  const stadiumsMap = useMemo(
    () => new Map(stadiumsData.map(s => [s.id, s])), []
  )
  const teamsMap = useMemo(
    () => new Map(teamsData.map(t => [t.tla, t])), []
  )

  const highlightedStadiumIds = useMemo(() => {
    if (!selectedTeam) return new Set()
    return new Set(
      matchesData
        .filter(m => m.home_team === selectedTeam || m.away_team === selectedTeam)
        .map(m => m.stadium_id)
        .filter(Boolean)
    )
  }, [selectedTeam])

  const accentColor = selectedTeam
    ? (teamsMap.get(selectedTeam)?.color || '#3b82f6')
    : '#3b82f6'

  function handleTeamSelect(tla) {
    setSelectedTeam(tla)
    setSelectedStadium(null)
  }

  function handleTeamClear() {
    setSelectedTeam(null)
  }

  function handleStadiumClick(id) {
    setSelectedStadium(prev => prev === id ? null : id)
    setSelectedTeam(null)
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
          onStadiumClick={handleStadiumClick}
        />
      </div>
      <div className={styles.sidebarPanel}>
        <Sidebar
          teams={teamsData}
          matches={matchesData}
          stadiumsMap={stadiumsMap}
          teamsMap={teamsMap}
          selectedTeam={selectedTeam}
          selectedStadium={selectedStadium}
          stadiumName={stadiumName}
          onTeamSelect={handleTeamSelect}
          onTeamClear={handleTeamClear}
        />
      </div>
    </div>
  )
}
