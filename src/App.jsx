import { useState, useMemo } from 'react'
import { formatMatchDateShort } from './utils/formatters'
import matchesData  from './data/matches.json'
import teamsData    from './data/teams.json'
import stadiumsData from './data/stadiums.json'
import MapComponent from './components/Map/Map'
import Sidebar      from './components/Sidebar/Sidebar'
import styles  from './App.module.css'

export default function App() {
  const [selectedTeams,  setSelectedTeams]  = useState(new Set())
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
    if (selectedTeams.size > 0) {
      return new Set(
        matchesData
          .filter(m => (selectedTeams.has(m.home_team) || selectedTeams.has(m.away_team)) && m.stadium_id)
          .map(m => m.stadium_id)
      )
    }
    if (selectedGroup) {
      return new Set(
        matchesData.filter(m => m.group === selectedGroup && m.stadium_id).map(m => m.stadium_id)
      )
    }
    return new Set()
  }, [selectedTeams, selectedGroup])

  // Per-team trajectory data: stops, line points, and team color
  const perTeamTrajectories = useMemo(() => {
    return [...selectedTeams].map(tla => {
      const team = teamsMap.get(tla)
      const teamColor = team?.color || '#3b82f6'

      const teamMatches = matchesData
        .filter(m => (m.home_team === tla || m.away_team === tla) && m.stadium_id)
        .sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc))
        .map((m, idx) => ({
          seq: idx + 1,
          tla,
          teamColor,
          stadium_id: m.stadium_id,
          datetime_utc: m.datetime_utc,
          dateStr: formatMatchDateShort(m.datetime_utc),
          homeFlag: teamsMap.get(m.home_team)?.flag || m.home_team,
          awayFlag: teamsMap.get(m.away_team)?.flag || m.away_team,
          homeScore: m.home_score,
          awayScore: m.away_score,
        }))

      const stopsByStadium = new Map()
      teamMatches.forEach(stop => {
        if (!stopsByStadium.has(stop.stadium_id)) stopsByStadium.set(stop.stadium_id, [])
        stopsByStadium.get(stop.stadium_id).push(stop)
      })

      const stadia = teamMatches.map(m => stadiumsMap.get(m.stadium_id)).filter(Boolean)
      const deduped = stadia.filter((s, i) => i === 0 || s.id !== stadia[i - 1].id)
      const points = deduped.map(s => [s.lon, s.lat])

      return { tla, teamColor, points, stopsByStadium }
    })
  }, [selectedTeams, teamsMap, stadiumsMap])

  // Combined stops by stadium from all selected teams (sorted by datetime)
  const trajectoryStopsByStadium = useMemo(() => {
    const combined = new Map()
    perTeamTrajectories.forEach(({ stopsByStadium }) => {
      stopsByStadium.forEach((stops, stadiumId) => {
        if (!combined.has(stadiumId)) combined.set(stadiumId, [])
        combined.get(stadiumId).push(...stops)
      })
    })
    combined.forEach((stops, key) => {
      combined.set(key, [...stops].sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc)))
    })
    return combined
  }, [perTeamTrajectories])

  // Use the single selected team's color, otherwise default blue
  const accentColor = selectedTeams.size === 1
    ? (teamsMap.get([...selectedTeams][0])?.color || '#3b82f6')
    : '#3b82f6'

  function handleTeamAdd(tla) {
    if (selectedTeams.size >= 4) return
    setSelectedTeams(prev => new Set([...prev, tla]))
    setSelectedStadium(null)
    setSelectedGroup(null)
  }
  function handleTeamRemove(tla) {
    setSelectedTeams(prev => {
      const next = new Set(prev)
      next.delete(tla)
      return next
    })
  }
  function handleTeamClearAll() { setSelectedTeams(new Set()) }

  function handleGroupSelect(g) {
    setSelectedGroup(g)
    setSelectedTeams(new Set())
    setSelectedStadium(null)
  }
  function handleGroupClear() { setSelectedGroup(null) }

  function handleStadiumClick(id) {
    setSelectedStadium(prev => prev === id ? null : id)
    setSelectedTeams(new Set())
    setSelectedGroup(null)
  }
  function handleStadiumClear() { setSelectedStadium(null) }

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
          perTeamTrajectories={perTeamTrajectories}
          trajectoryStopsByStadium={trajectoryStopsByStadium}
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
          selectedTlas={selectedTeams}
          selectedStadium={selectedStadium}
          stadiumName={stadiumName}
          selectedGroup={selectedGroup}
          onTeamAdd={handleTeamAdd}
          onTeamRemove={handleTeamRemove}
          onTeamClearAll={handleTeamClearAll}
          onGroupSelect={handleGroupSelect}
          onGroupClear={handleGroupClear}
          onStadiumClear={handleStadiumClear}
        />
      </div>
    </div>
  )
}
