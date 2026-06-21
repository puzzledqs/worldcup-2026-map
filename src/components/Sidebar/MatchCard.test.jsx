import { render, screen } from '@testing-library/react'
import MatchCard from './MatchCard'

const match = {
  id: '1', stage: 'GROUP_STAGE', group: 'GROUP_A',
  datetime_utc: '2026-06-14T20:00:00Z', stadium_id: 'NYC',
  home_team: 'USA', away_team: 'MEX', home_score: null, away_score: null,
}
const homeTeam = { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' }
const awayTeam = { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' }

test('shows Upcoming when scores are null', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('Upcoming')).toBeInTheDocument()
})

test('shows formatted score when match is played', () => {
  render(
    <MatchCard
      match={{ ...match, home_score: 2, away_score: 1 }}
      homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium"
    />
  )
  expect(screen.getByText('2 – 1')).toBeInTheDocument()
})

test('shows both team names', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText(/United States/)).toBeInTheDocument()
  expect(screen.getByText(/Mexico/)).toBeInTheDocument()
})

test('shows stadium name', () => {
  render(<MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('MetLife Stadium')).toBeInTheDocument()
})

test('falls back to TLA when team data is missing', () => {
  render(<MatchCard match={match} homeTeam={undefined} awayTeam={undefined} stadiumName="MetLife Stadium" />)
  expect(screen.getByText('USA')).toBeInTheDocument()
  expect(screen.getByText('MEX')).toBeInTheDocument()
})
