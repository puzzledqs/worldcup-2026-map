import { render, screen, fireEvent } from '@testing-library/react'
import StadiumMarker from './StadiumMarker'

// react-simple-maps uses SVG and d3 projections that don't work in jsdom.
// Mock the library so tests focus on our component logic.
vi.mock('react-simple-maps', () => ({
  Marker: ({ coordinates, children }) => <g data-coords={coordinates.join(',')}>{children}</g>,
}))

const stadium = {
  id: 'NYC', name: 'MetLife Stadium', city: 'East Rutherford',
  country: 'USA', lat: 40.81, lon: -74.07,
}

test('renders the stadium city name in label-only mode', () => {
  render(<StadiumMarker stadium={stadium} state="default" matchCount={6} onClick={() => {}} labelOnly />)
  expect(screen.getByText('East Rutherford')).toBeInTheDocument()
})

test('shows match count', () => {
  render(<StadiumMarker stadium={stadium} state="default" matchCount={7} onClick={() => {}} />)
  expect(screen.getByText('7')).toBeInTheDocument()
})


test('calls onClick with stadium id when clicked', () => {
  const onClick = vi.fn()
  render(<StadiumMarker stadium={stadium} state="default" matchCount={0} onClick={onClick} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledWith('NYC')
})

test('applies highlighted class when state is highlighted', () => {
  const { container } = render(
    <StadiumMarker stadium={stadium} state="highlighted" matchCount={4} onClick={() => {}} />
  )
  expect(container.querySelector('[class*="highlighted"]')).not.toBeNull()
})

test('applies dimmed class when state is dimmed', () => {
  const { container } = render(
    <StadiumMarker stadium={stadium} state="dimmed" matchCount={4} onClick={() => {}} />
  )
  expect(container.querySelector('[class*="dimmed"]')).not.toBeNull()
})
