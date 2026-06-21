import { render, screen } from '@testing-library/react'
import Map from './Map'
import stadiums from '../../data/stadiums.json'

// react-simple-maps uses SVG + d3 projections that don't work in jsdom.
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }) => <svg>{children}</svg>,
  Geographies:   ({ children }) => <>{children({ geographies: [] })}</>,
  Geography:     () => null,
  Marker:        ({ children }) => <g>{children}</g>,
}))

const noop = () => {}

test('renders without crashing', () => {
  const { container } = render(
    <Map stadiums={stadiums} highlightedIds={new Set()} selectedId={null} onStadiumClick={noop} />
  )
  expect(container.firstChild).not.toBeNull()
})

test('renders a button for each stadium', () => {
  render(
    <Map stadiums={stadiums} highlightedIds={new Set()} selectedId={null} onStadiumClick={noop} />
  )
  expect(screen.getAllByRole('button')).toHaveLength(16)
})
