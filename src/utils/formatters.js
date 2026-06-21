export function formatScore(homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return null
  return `${homeScore} – ${awayScore}`
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
