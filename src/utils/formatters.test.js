import { formatScore, formatMatchDate } from './formatters'

describe('formatScore', () => {
  test('returns null when either score is null', () => {
    expect(formatScore(null, null)).toBeNull()
    expect(formatScore(2, null)).toBeNull()
  })
  test('formats score string', () => {
    expect(formatScore(2, 1)).toBe('2 – 1')
    expect(formatScore(0, 0)).toBe('0 – 0')
  })
})

describe('formatMatchDate', () => {
  test('returns a non-empty string', () => {
    const r = formatMatchDate('2026-06-14T20:00:00Z')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })
  test('includes the month and day', () => {
    // Use a date we can reason about in any timezone
    const r = formatMatchDate('2026-06-14T20:00:00Z')
    expect(r).toMatch(/Jun/)
  })
  test('returns — for null or empty input', () => {
    expect(formatMatchDate(null)).toBe('—')
    expect(formatMatchDate('')).toBe('—')
  })
})
