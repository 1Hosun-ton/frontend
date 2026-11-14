const WIDTH = 310
const HEIGHT = 64
const PAD = 8 // 선 안쪽 여백. 아래 칸 이름 위치(0.5rem)와 맞춘다

// 칸 수(count)에 맞춰 가로로 고르게 놓고, 값(value)은 가장 큰 값(max)을 기준으로 높이를 정한다.
// 칸이 하나뿐이거나 값이 전부 0이어도 0으로 나누지 않도록 최솟값을 1로 둔다.
const toPoints = (values, max, count) =>
  values.map((value, i) => [
    PAD + (i * (WIDTH - PAD * 2)) / Math.max(count - 1, 1),
    Number((HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2)).toFixed(1)),
  ])
const toPath = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

/*
 이번 기간 vs 지난 기간 누적 소비 추이 선 그래프
 labels: 아래 칸 이름 (예: 1주~5주, 월~일)
 current / previous: 칸마다 누적 금액, current는 지금까지의 칸만 있으면 됨
 currentLabel / previousLabel: 범례 글자
*/
export default function TrendChart({ labels, current, previous, currentLabel, previousLabel }) {
  const count = labels.length
  const max = Math.max(...current, ...previous, 1)
  const currentPoints = toPoints(current, max, count)
  // 이번 기간 값이 아직 없으면 점을 찍지 않는다
  const lastPoint = currentPoints[currentPoints.length - 1]
  const activeIndex = current.length - 1

  return (
    <div className="trend-chart">
      <div className="trend-legend">
        <span className="trend-legend-item trend-legend-current">
          <i className="trend-legend-line" />
          {currentLabel}
        </span>
        <span className="trend-legend-item">
          <i className="trend-legend-line trend-legend-line-previous" />
          {previousLabel}
        </span>
      </div>

      <svg className="trend-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} aria-hidden="true">
        <path className="trend-line trend-line-previous" pathLength="1" d={toPath(toPoints(previous, max, count))} />
        <path className="trend-line trend-line-current" pathLength="1" d={toPath(currentPoints)} />
        {lastPoint && <circle className="trend-dot" cx={lastPoint[0]} cy={lastPoint[1]} r="4" />}
      </svg>

      <div className="trend-labels">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`trend-label${i === activeIndex ? ' trend-label-active' : ''}`}
            style={{ left: `calc(0.5rem + ${i} * (100% - 1rem) / ${count - 1})` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
