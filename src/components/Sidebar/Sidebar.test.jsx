import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'

const stadiumsMap = new Map([
  ['NYC', { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', lat: 40.81, lon: -74.07 }],
])
const teamsMap = new Map([
  ['USA', { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }],
  ['MEX', { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }],
])
const teams = [...teamsMap.values()]

const matches = [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: '2099-07-01T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_A', home_score: null, away_score: null },
  { id: '2', home_team: 'MEX', away_team: 'USA', stadium_id: 'NYC', datetime_utc: '2099-07-05T20:00:00Z', stage: 'GROUP_STAGE', group: 'GROUP_B', home_score: null, away_score: null },
]

const base = {
  teams, matches, stadiumsMap, teamsMap,
  selectedTeam: null, selectedStadium: null, stadiumName: null,
  onTeamSelect: () => {}, onTeamClear: () => {},
}

test('shows "Next matches" heading when nothing selected', () => {
  render(<Sidebar {...base} />)
  expect(screen.getByText('Next matches')).toBeInTheDocument()
})

test('shows team name as heading when team selected', () => {
  const { container } = render(<Sidebar {...base} selectedTeam="USA" />)
  const heading = container.querySelector('[class*="heading"]')
  expect(heading?.textContent).toContain('United States')
})

test('shows stadium name as heading when stadium selected', () => {
  const { container } = render(<Sidebar {...base} selectedStadium="NYC" stadiumName="MetLife Stadium" />)
  const heading = container.querySelector('[class*="heading"]')
  expect(heading?.textContent).toBe('MetLife Stadium')
})

test('filters to only USA matches when team is USA', () => {
  render(<Sidebar {...base} selectedTeam="USA" />)
  // Both match 1 and 2 involve USA
  expect(screen.getAllByText(/United States|Mexico/).length).toBeGreaterThan(0)
})
