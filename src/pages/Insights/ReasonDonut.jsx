import { chartColor } from './chartColor.js'

const SIZE = 104
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 1.5

export default function ReasonDonut({ items }) {
  return (
    /* 조각이 자라는 움직임에서 쓰도록 둘레 길이를 CSS에 넘긴다 */
    <svg
      className="reason-donut"
      style={{ '--donut-circumference': String(CIRCUMFERENCE) }}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      aria-hidden="true"
    >
      {items.map(({ name, percent }, i) => {
        const length = (percent / 100) * CIRCUMFERENCE
        const offset = items.slice(0, i).reduce((sum, item) => sum + (item.percent / 100) * CIRCUMFERENCE, 0)
        return (
          <circle
            key={name}
            className="reason-donut-arc"
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
