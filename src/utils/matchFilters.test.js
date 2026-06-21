import { filterByTeam, filterByStadium, filterByGroup, getUpcoming } from './matchFilters'

const PAST   = '2020-01-01T20:00:00Z'
const FUTURE = '2099-01-01T20:00:00Z'

const matches = [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', group: 'A', datetime_utc: PAST,   home_score: 2,    away_score: 1    },
  { id: '2', home_team: 'BRA', away_team: 'USA', stadium_id: 'LA',  group: 'A', datetime_utc: FUTURE, home_score: null, away_score: null },
  { id: '3', home_team: 'GER', away_team: 'FRA', stadium_id: 'NYC', group: 'B', datetime_utc: FUTURE, home_score: null, away_score: null },
  { id: '4', home_team: 'ARG', away_team: 'BRA', stadium_id: 'DAL', group: 'B', datetime_utc: FUTURE, home_score: null, away_score: null },
]

describe('filterByTeam', () => {
  test('returns matches where team is home or away', () => {
    expect(filterByTeam(matches, 'USA').map(m => m.id)).toEqual(['1', '2'])
  })
  test('returns empty array for unknown team', () => {
    expect(filterByTeam(matches, 'XYZ')).toEqual([])
  })
})

describe('filterByGroup', () => {
  test('returns matches in the given group', () => {
    expect(filterByGroup(matches, 'A').map(m => m.id)).toEqual(['1', '2'])
  })
  test('returns empty array for unknown group', () => {
    expect(filterByGroup(matches, 'Z')).toEqual([])
  })
})

describe('filterByStadium', () => {
  test('returns matches at the given stadium', () => {
    expect(filterByStadium(matches, 'NYC').map(m => m.id)).toEqual(['1', '3'])
  })
})

describe('getUpcoming', () => {
  test('returns future matches only, sorted ascending, limited to n', () => {
    const result = getUpcoming(matches, 2)
    expect(result).toHaveLength(2)
    result.forEach(m => expect(new Date(m.datetime_utc).getTime()).toBeGreaterThan(Date.now()))
  })
  test('returns all future matches when n exceeds count', () => {
    expect(getUpcoming(matches, 100)).toHaveLength(3)
  })
  test('sorts ascending by datetime', () => {
    const near   = '2099-01-01T20:00:00Z'
    const far    = '2099-06-01T20:00:00Z'
    const result = getUpcoming([
      { ...matches[2], datetime_utc: far  },
      { ...matches[1], datetime_utc: near },
    ], 10)
    expect(new Date(result[0].datetime_utc) < new Date(result[1].datetime_utc)).toBe(true)
  })
})
