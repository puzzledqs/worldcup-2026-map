import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }) => <svg>{children}</svg>,
  Geographies:   ({ children }) => <>{children({ geographies: [] })}</>,
  Geography:     () => null,
  Marker:        ({ children }) => <g>{children}</g>,
  Line:          () => null,
}))

vi.mock('./data/matches.json', () => ({ default: [
  { id: '1', home_team: 'USA', away_team: 'MEX', stadium_id: 'NYC',
    datetime_utc: '2099-07-01T20:00:00Z', stage: 'GROUP_STAGE',
    group: 'A', home_score: null, away_score: null },
]}))
vi.mock('./data/teams.json', () => ({ default: [
  { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' },
  { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' },
]}))
vi.mock('./data/stadiums.json', () => ({ default: [
  { id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford',
    country: 'USA', lat: 40.81, lon: -74.07 },
]}))

test('renders without crashing and shows search input', () => {
  render(<App />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

test('shows Live & upcoming by default', () => {
  render(<App />)
  expect(screen.getByText('Live & upcoming')).toBeInTheDocument()
})
