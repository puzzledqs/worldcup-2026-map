import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamSelector from './TeamSelector'

const teams = [
  { tla: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', color: '#B22234' },
  { tla: 'MEX', name: 'Mexico',        shortName: 'Mexico', flag: '🇲🇽', color: '#006847' },
  { tla: 'BRA', name: 'Brazil',        shortName: 'Brazil', flag: '🇧🇷', color: '#009C3B' },
]

test('opens dropdown and shows all teams when input focused', async () => {
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={() => {}} onClear={() => {}} />)
  await userEvent.click(screen.getByRole('textbox'))
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.getByText('United States')).toBeInTheDocument()
})

test('filters teams by typed text', async () => {
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={() => {}} onClear={() => {}} />)
  await userEvent.type(screen.getByRole('textbox'), 'mex')
  expect(screen.getByText('Mexico')).toBeInTheDocument()
  expect(screen.queryByText('United States')).not.toBeInTheDocument()
})

test('calls onSelect with TLA when option clicked', async () => {
  const onSelect = vi.fn()
  render(<TeamSelector teams={teams} selectedTla={null} onSelect={onSelect} onClear={() => {}} />)
  await userEvent.click(screen.getByRole('textbox'))
  await userEvent.click(screen.getByText('Mexico'))
  expect(onSelect).toHaveBeenCalledWith('MEX')
})

test('shows clear button when a team is selected', () => {
  render(<TeamSelector teams={teams} selectedTla="MEX" onSelect={() => {}} onClear={() => {}} />)
  expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
})

test('calls onClear when clear button clicked', async () => {
  const onClear = vi.fn()
  render(<TeamSelector teams={teams} selectedTla="MEX" onSelect={() => {}} onClear={onClear} />)
  await userEvent.click(screen.getByRole('button', { name: /clear/i }))
  expect(onClear).toHaveBeenCalled()
})
