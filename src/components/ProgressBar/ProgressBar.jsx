import './ProgressBar.css'

/*
 예산 표기용으로 사용 시 value와 max 지정
 미션 진행 프로그레스용으로 사용 시 steps와 value 지정
 색은 primary, danger로 지정 가능
*/
export default function ProgressBar({ value = 0, max = 100, steps, tone = 'primary', className = '' }) {
  if (steps) {
    const done = Math.max(0, Math.min(steps, value))
    return (
      <div className={['progress-steps', className].filter(Boolean).join(' ')}>
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            className={['progress-step', i < done && `progress-step-${tone}`].filter(Boolean).join(' ')}
          />
        ))}
      </div>
    )
  }

  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className={['progress-bar', className].filter(Boolean).join(' ')}>
      <div className={`progress-bar-fill progress-bar-fill-${tone}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
