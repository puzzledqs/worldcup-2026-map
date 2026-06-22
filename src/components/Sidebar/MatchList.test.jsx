import { render, screen } from '@testing-library/react'
import MatchList from './MatchList'

const stadiumsMap = new Map([
  ['NYC', { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', lat: 40.81, lon: -74.07 }],
])
const teamsMap = new Map([
  ['USA', { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }],
  ['MEX', { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }],
])

const matches = [
  { id: '1', home_team: 'MEX', away_team: 'USA', stadium_id: 'NYC', datetime_utc: '2099-06-14T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: null, away_score: null },
  { id: '2', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: '2026-06-11T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: 2,    away_score: 1    },
]

test('renders a card for each match', () => {
  render(<MatchList matches={matches} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="None" />)
  // Both teams appear
  expect(screen.getAllByText(/United States|Mexico/).length).toBeGreaterThan(0)
})

test('shows empty message when matches array is empty', () => {
  render(<MatchList matches={[]} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="No matches found" />)
  expect(screen.getByText('No matches found')).toBeInTheDocument()
})

test('sorts matches chronologically (earliest first)', () => {
  render(<MatchList matches={matches} stadiumsMap={stadiumsMap} teamsMap={teamsMap} emptyMessage="None" />)
  const scores = screen.getAllByText(/2 – 1|vs/)
  // Jun 11 (score 2-1) should appear before the later, unplayed match (vs)
  expect(scores[0]).toHaveTextContent('2 – 1')
  expect(scores[1]).toHaveTextContent('vs')
})
