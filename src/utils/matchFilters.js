export function filterByTeam(matches, tla) {
  return matches.filter(m => m.home_team === tla || m.away_team === tla)
}

export function filterByTeams(matches, tlas) {
  return matches.filter(m => tlas.has(m.home_team) || tlas.has(m.away_team))
}

export function filterByStadium(matches, stadiumId) {
  return matches.filter(m => m.stadium_id === stadiumId)
}

export function filterByGroup(matches, group) {
  return matches.filter(m => m.group === group)
}

export function getUpcoming(matches, n) {
  const now = Date.now()
  return matches
    .filter(m => new Date(m.datetime_utc).getTime() > now)
    .sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc))
    .slice(0, n)
}
