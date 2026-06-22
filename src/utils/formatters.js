export function formatScore(homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return null
  return `${homeScore} – ${awayScore}`
}

// Returns { kind: 'live'|'finished'|'upcoming', label } for a match.
// Computed live from kickoff time vs the current clock — NOT from the
// fetched ESPN status, which is a stale snapshot (data refreshes every 6h).
const MATCH_DURATION_MS = 2.5 * 60 * 60 * 1000 // ~2.5h covers extra time + penalties

export function matchStatus(match, now = Date.now()) {
  const kickoff = new Date(match.datetime_utc).getTime()
  if (Number.isNaN(kickoff)) return { kind: 'upcoming', label: 'Upcoming' }
  if (now < kickoff)                    return { kind: 'upcoming', label: 'Upcoming' }
  if (now < kickoff + MATCH_DURATION_MS) return { kind: 'live',     label: 'LIVE' }
  return { kind: 'finished', label: 'Finished' }
}

export function formatMatchDateShort(datetimeUtc) {
  if (!datetimeUtc) return '—'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(datetimeUtc))
}

export function formatMatchDate(datetimeUtc) {
  if (!datetimeUtc) return '—'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(new Date(datetimeUtc))
}
