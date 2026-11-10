import { chartColor } from './chartColor.js'

const SIZE = 104
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 1.5

export default function ReasonDonut({ items }) {
  return (
    <svg className="reason-donut" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} aria-hidden="true">
      {items.map(({ name, percent }, i) => {
        const length = (percent / 100) * CIRCUMFERENCE
        const offset = items.slice(0, i).reduce((sum, item) => sum + (item.percent / 100) * CIRCUMFERENCE, 0)
        return (
          <circle
            key={name}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={chartColor(i)}
            strokeWidth={STROKE}
            strokeDasharray={`${Math.max(length - GAP, 0)} ${CIRCUMFERENCE}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )
      })}
    </svg>
  )
}
