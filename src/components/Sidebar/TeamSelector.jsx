import { useState, useRef, useEffect } from 'react'
import styles from './TeamSelector.module.css'

export default function TeamSelector({ teams, selectedTla, onSelect, onClear }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const containerRef        = useRef(null)

  const selectedTeam = teams.find(t => t.tla === selectedTla)

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.tla.toLowerCase().includes(query.toLowerCase())
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

  function handleSelect(tla) {
    onSelect(tla)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onClear()
    setQuery('')
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.row}>
        <input
          type="text"
          className={styles.input}
          placeholder={
            selectedTeam
              ? `${selectedTeam.flag} ${selectedTeam.name}`
              : 'Search team…'
          }
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          aria-label="Search team"
        />
        {selectedTla && (
          <button className={styles.clearBtn} onClick={handleClear} aria-label="clear selection">
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {filtered.length === 0 && (
            <li className={styles.empty}>No teams found</li>
          )}
          {filtered.map(team => (
            <li
              key={team.tla}
              className={`${styles.option} ${team.tla === selectedTla ? styles.selected : ''}`}
              role="option"
              aria-selected={team.tla === selectedTla}
              onMouseDown={() => handleSelect(team.tla)}
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
