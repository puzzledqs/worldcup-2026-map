import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamSelector from './TeamSelector'

const teams = [
  { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' },
  { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' },
  { tla: 'BRA', name: 'Brazil',        shortName: 'Brazil', flag: '🇧🇷', color: '#009C3B' },
]

const noop = () => {}

test('shows search input when no teams selected', () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set()} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

test('opens dropdown with all teams on input focus', async () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set()} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  await userEvent.click(screen.getByRole('textbox'))
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.getByText('United States')).toBeInTheDocument()
})

test('filters dropdown by typed text', async () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set()} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  await userEvent.type(screen.getByRole('textbox'), 'mex')
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.queryByText('United States')).not.toBeInTheDocument()
})

test('calls onAdd with TLA when option clicked', async () => {
  const onAdd = vi.fn()
  render(<TeamSelector teams={teams} selectedTlas={new Set()} onAdd={onAdd} onRemove={noop} onClearAll={noop} />)
  await userEvent.click(screen.getByRole('textbox'))
  await userEvent.click(screen.getByText('Mexico'))
  expect(onAdd).toHaveBeenCalledWith('MEX')
})

test('shows chip for each selected team', () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set(['USA', 'MEX'])} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  expect(screen.getByText('USA')).toBeInTheDocument()
  expect(screen.getByText('Mexico')).toBeInTheDocument()
})

test('selected team is excluded from dropdown', async () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set(['MEX'])} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  await userEvent.click(screen.getByRole('textbox'))
  expect(screen.queryByRole('option', { name: /Mexico/ })).not.toBeInTheDocument()
  expect(screen.getByText('United States')).toBeInTheDocument()
})

test('calls onRemove when chip x clicked', async () => {
  const onRemove = vi.fn()
  render(<TeamSelector teams={teams} selectedTlas={new Set(['USA'])} onAdd={noop} onRemove={onRemove} onClearAll={noop} />)
  await userEvent.click(screen.getByRole('button', { name: /remove United States/i }))
  expect(onRemove).toHaveBeenCalledWith('USA')
})

test('shows clear-all button when 2+ teams selected', () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set(['USA', 'MEX'])} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
})

test('hides clear-all button when only 1 team selected', () => {
  render(<TeamSelector teams={teams} selectedTlas={new Set(['USA'])} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
})

test('calls onClearAll when clear all button clicked', async () => {
  const onClearAll = vi.fn()
  render(<TeamSelector teams={teams} selectedTlas={new Set(['USA', 'MEX'])} onAdd={noop} onRemove={noop} onClearAll={onClearAll} />)
  await userEvent.click(screen.getByRole('button', { name: /clear all/i }))
  expect(onClearAll).toHaveBeenCalled()
})

test('hides input and shows max message when 4 teams selected', () => {
  const allTeams = [...teams, { tla: 'GER', name: 'Germany', shortName: 'GER', flag: '🇩🇪', color: '#000' }]
  render(<TeamSelector teams={allTeams} selectedTlas={new Set(['USA', 'MEX', 'BRA', 'GER'])} onAdd={noop} onRemove={noop} onClearAll={noop} />)
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.getByText(/4 teams selected/)).toBeInTheDocument()
})
