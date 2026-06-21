import stadiums from './stadiums.json'

describe('stadiums.json', () => {
  test('has 16 entries', () => {
    expect(stadiums).toHaveLength(16)
  })

  test('each stadium has required fields', () => {
    for (const s of stadiums) {
      expect(typeof s.id).toBe('string')
      expect(typeof s.name).toBe('string')
      expect(typeof s.city).toBe('string')
      expect(['USA', 'CAN', 'MEX']).toContain(s.country)
      expect(typeof s.lat).toBe('number')
      expect(typeof s.lon).toBe('number')
    }
  })

  test('all ids are unique', () => {
    const ids = stadiums.map(s => s.id)
    expect(new Set(ids).size).toBe(16)
  })
})
