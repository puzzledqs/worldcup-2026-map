import { useState, useRef, useEffect } from 'react'
import styles from './TeamSelector.module.css'

export default function TeamSelector({ teams, selectedTlas, onAdd, onRemove, onClearAll }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const containerRef        = useRef(null)

  const selectedList = [...selectedTlas]
  const canAddMore   = selectedTlas.size < 4

  const filtered = teams.filter(t =>
    !selectedTlas.has(t.tla) && (
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.tla.toLowerCase().includes(query.toLowerCase())
    )
  )

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleAdd(tla) {
    onAdd(tla)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {selectedList.length > 0 && (
        <div className={styles.chips}>
          {selectedList.map(tla => {
            const team = teams.find(t => t.tla === tla)
            return (
              <span key={tla} className={styles.chip} style={{ '--chip-color': team?.color || '#3b82f6' }}>
                <span className={styles.chipFlag}>{team?.flag}</span>
                <span className={styles.chipName}>{team?.shortName || tla}</span>
                <button
                  className={styles.chipRemove}
                  onClick={() => onRemove(tla)}
                  aria-label={`remove ${team?.name || tla}`}
                >×</button>
              </span>
            )
          })}
          {selectedList.length > 1 && (
            <button className={styles.clearAll} onClick={onClearAll} aria-label="clear all teams">
              Clear all
            </button>
          )}
        </div>
      )}

      {canAddMore ? (
        <div className={styles.row}>
          <input
            type="text"
            className={styles.input}
            placeholder={selectedList.length === 0 ? 'Search team…' : `Add team (${4 - selectedTlas.size} left)…`}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            aria-label="Search team"
          />
        </div>
      ) : (
        <div className={styles.maxReached}>4 teams selected (max)</div>
      )}

      {open && canAddMore && (
        <ul className={styles.dropdown} role="listbox">
          {filtered.length === 0 && (
            <li className={styles.empty}>No teams found</li>
          )}
          {filtered.map(team => (
            <li
              key={team.tla}
              className={styles.option}
              role="option"
              aria-selected={false}
              onMouseDown={() => handleAdd(team.tla)}
            >
              <span className={styles.flag}>{team.flag}</span>
              <span>{team.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
