import { render, screen } from '@testing-library/react'
import TrajectoryBubble from './TrajectoryBubble'

vi.mock('react-simple-maps', () => ({
  Marker: ({ children }) => <g>{children}</g>,
}))

const stadium = { id: 'GDL', name: 'Estadio Akron', city: 'Guadalajara', lat: 20.69, lon: -103.46 }

test('renders bubble with sequence, score and date', () => {
  const stops = [
    { seq: 1, dateStr: 'Jun 12', homeFlag: '🇰🇷', awayFlag: '🇨🇿', homeScore: 2, awayScore: 1 },
  ]
  render(<TrajectoryBubble stadium={stadium} stops={stops} />)
  expect(screen.getByText(/1\./)).toBeInTheDocument()
  expect(screen.getByText('Jun 12')).toBeInTheDocument()
  expect(screen.getByText(/2 – 1/)).toBeInTheDocument()
})

test('shows "vs" when match not yet played', () => {
  const stops = [
    { seq: 1, dateStr: 'Jul 10', homeFlag: '🇺🇸', awayFlag: '🇲🇽', homeScore: null, awayScore: null },
  ]
  render(<TrajectoryBubble stadium={stadium} stops={stops} />)
  expect(screen.getByText(/vs/)).toBeInTheDocument()
})
