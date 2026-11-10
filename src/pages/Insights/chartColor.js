const COLOR_COUNT = 5

// 도넛 조각과 범례 점이 같은 색을 쓰도록 한 곳에서 정한다.
// 이유가 5개를 넘으면 색을 처음부터 다시 쓴다.
export const chartColor = (i) => `var(--color-chart-${(i % COLOR_COUNT) + 1})`
