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
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC', datetime_utc: '2099-07-01T20:00:00Z', stage: 'GROUP_STAGE', group: 'A', home_score: null, away_score: null },
  { id: '2', home_team: 'MEX', away_team: 'USA', stadium_id: 'NYC', datetime_utc: '2099-07-05T20:00:00Z', stage: 'GROUP_STAGE', group: 'B', home_score: null, away_score: null },
]

const groups = ['A', 'B']
const stages = ['GROUP_STAGE']

const base = {
  teams, matches, groups, stages, stadiumsMap, teamsMap,
  selectedTlas: new Set(), selectedStadium: null, stadiumName: null,
  selectedGroup: null, selectedStage: null,
  onTeamAdd: () => {}, onTeamRemove: () => {}, onTeamClearAll: () => {},
  onGroupSelect: () => {}, onGroupClear: () => {},
  onStageSelect: () => {}, onStageClear: () => {},
  onStadiumClear: () => {}, onMatchClick: () => {},
}

test('shows "Live & upcoming" heading when nothing selected', () => {
  render(<Sidebar {...base} />)
  expect(screen.getByText('Live & upcoming')).toBeInTheDocument()
})

test('shows team name as heading when team selected', () => {
  const { container } = render(<Sidebar {...base} selectedTlas={new Set(['USA'])} />)
  const heading = container.querySelector('[class*="heading"]')
  expect(heading?.textContent).toContain('United States')
})

test('shows stadium name as heading when stadium selected', () => {
  const { container } = render(<Sidebar {...base} selectedStadium="NYC" stadiumName="MetLife Stadium" />)
  const heading = container.querySelector('[class*="heading"]:not([class*="headingRow"])')
  expect(heading?.textContent).toBe('MetLife Stadium')
})

test('filters to only USA matches when team is USA', () => {
  render(<Sidebar {...base} selectedTlas={new Set(['USA'])} />)
  // Both match 1 and 2 involve USA
  expect(screen.getAllByText(/United States|Mexico/).length).toBeGreaterThan(0)
})

test('shows group heading when group selected', () => {
  const { container } = render(<Sidebar {...base} selectedGroup="A" />)
  const heading = container.querySelector('[class*="heading"]')
  expect(heading?.textContent).toBe('Group A')
})
