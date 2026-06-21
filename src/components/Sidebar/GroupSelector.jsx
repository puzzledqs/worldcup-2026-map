import styles from './GroupSelector.module.css'

export default function GroupSelector({ groups, selectedGroup, onSelect, onClear }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Group</span>
      <div className={styles.buttons}>
        {groups.map(g => (
          <button
            key={g}
            className={`${styles.btn} ${selectedGroup === g ? styles.active : ''}`}
            onClick={() => selectedGroup === g ? onClear() : onSelect(g)}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}
