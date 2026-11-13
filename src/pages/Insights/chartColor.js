const COLOR_COUNT = 5

// 도넛 조각과 범례 점이 같은 색을 쓰도록 한 곳에서 정한다.
// 큰 조각부터 파랑·노랑·초록·청록·보라를 쓰고, 그보다 작은 조각은 모두 회색이다.
export const chartColor = (i) => (i < COLOR_COUNT ? `var(--color-chart-${i + 1})` : 'var(--color-chart-rest)')
