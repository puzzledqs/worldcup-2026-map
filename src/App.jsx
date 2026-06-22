import { useState, useMemo, useEffect, useRef } from 'react'
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
  const [selectedStage,   setSelectedStage]   = useState(null)
  const [focusedStadium,  setFocusedStadium]  = useState(null)
  const focusTimer = useRef(null)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Tick every minute so time-based match status (live/finished) stays current
  // while the page is left open, without re-fetching data.
  const [, setNowTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setNowTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

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
  const stages = useMemo(
    () => [...new Set(matchesData.map(m => m.stage))],
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
    if (selectedStage) {
      return new Set(
        matchesData.filter(m => m.stage === selectedStage && m.stadium_id).map(m => m.stadium_id)
      )
    }
    return new Set()
  }, [selectedTeams, selectedGroup, selectedStage])

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
    setSelectedStage(null)
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
    setSelectedStage(null)
  }
  function handleGroupClear() { setSelectedGroup(null) }

  function handleStageSelect(s) {
    setSelectedStage(s)
    setSelectedTeams(new Set())
    setSelectedStadium(null)
    setSelectedGroup(null)
  }
  function handleStageClear() { setSelectedStage(null) }

  function handleStadiumClick(id) {
    setSelectedStadium(prev => prev === id ? null : id)
    setSelectedTeams(new Set())
    setSelectedGroup(null)
    setSelectedStage(null)
  }
  function handleStadiumClear() { setSelectedStadium(null) }

  // Click a match card → briefly pulse its venue on the map (non-destructive)
  function handleMatchClick(match) {
    if (!match.stadium_id) return
    setFocusedStadium(null)
    if (focusTimer.current) clearTimeout(focusTimer.current)
    // re-set on next frame so the CSS animation restarts even for same stadium
    requestAnimationFrame(() => setFocusedStadium(match.stadium_id))
    focusTimer.current = setTimeout(() => setFocusedStadium(null), 2800)
  }

  const stadiumName = selectedStadium
    ? stadiumsMap.get(selectedStadium)?.name || null
    : null

  return (
    <div className={styles.app} style={{ '--accent-color': accentColor }}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>⚽ 2026 World Cup Schedule Map</h1>
          <p className={styles.subtitle}>
            Pick teams (up to 4), a group, or a stage to see every match's time, venue and score across North America
          </p>
        </div>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      <div className={styles.body}>
        <div className={styles.mapPanel}>
          <MapComponent
            stadiums={stadiumsData}
            highlightedIds={highlightedStadiumIds}
            selectedId={selectedStadium}
            focusedId={focusedStadium}
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
            stages={stages}
            stadiumsMap={stadiumsMap}
            teamsMap={teamsMap}
            selectedTlas={selectedTeams}
            selectedStadium={selectedStadium}
            stadiumName={stadiumName}
            selectedGroup={selectedGroup}
            selectedStage={selectedStage}
            onTeamAdd={handleTeamAdd}
            onTeamRemove={handleTeamRemove}
            onTeamClearAll={handleTeamClearAll}
            onGroupSelect={handleGroupSelect}
            onGroupClear={handleGroupClear}
            onStageSelect={handleStageSelect}
            onStageClear={handleStageClear}
            onStadiumClear={handleStadiumClear}
            onMatchClick={handleMatchClick}
          />
        </div>
      </div>
    </div>
  )
}
