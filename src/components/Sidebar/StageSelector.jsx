import styles from './GroupSelector.module.css'

const STAGE_LABELS = {
  GROUP_STAGE:   'Groups',
  ROUND_OF_32:   'R32',
  ROUND_OF_16:   'R16',
  QUARTER_FINAL: 'QF',
  SEMI_FINAL:    'SF',
  THIRD_PLACE:   '3rd',
  FINAL:         'Final',
}

// Fixed display order
const STAGE_ORDER = [
  'GROUP_STAGE', 'ROUND_OF_32', 'ROUND_OF_16',
  'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL',
]

export default function StageSelector({ stages = [], selectedStage, onSelect, onClear }) {
  const ordered = STAGE_ORDER.filter(s => stages.includes(s))

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Stage</span>
      <div className={styles.buttons}>
        {ordered.map(stage => {
          const active = stage === selectedStage
          return (
            <button
              key={stage}
              className={`${styles.btn} ${styles.stageBtn} ${active ? styles.active : ''}`}
              onClick={() => active ? onClear() : onSelect(stage)}
            >
              {STAGE_LABELS[stage] || stage}
            </button>
          )
        })}
      </div>
    </div>
  )
}
