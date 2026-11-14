/*
 S6 화면용 임시 데이터. 백엔드 응답 모양을 그대로 따른다.
 API가 생기면 fetchMockInsights를 실제 호출로 바꾸기만 하면 된다.

 화면 확인용 규칙
 - 2026년 11월(월간), 11월 3주차(주간): 분석 결과 있음
 - 2026년 10월(월간), 그 외 주: 뚜렷한 패턴 없음
 - 나머지 기간: 기록 부족
*/

/*
 READY: 정상 분석 완료
 INSUFFICIENT_DATA: 전체 누적 기록이 5건 미만 (기간과 무관한 상태다)
 NO_EXPENSES: 조회 기간에 소비 기록이 없음
 NO_PATTERN: 분석 조건을 만족하는 패턴이 없음. 이유별 통계만 온다
*/
export const STATUS = {
  ready: 'READY',
  insufficient: 'INSUFFICIENT_DATA',
  noExpenses: 'NO_EXPENSES',
  noPattern: 'NO_PATTERN',
}

const SUGGESTION = '배달 앱을 열기 전에 물 한 잔 마시고 5분 뒤에 결정해 보는 건 어때요?'
const REFLECTION = '스트레스를 받을 때 배달 음식을 선택하게 되는 이유는 무엇일까요?'

// ratio는 0~100이고 소수점이 붙는다. previousRatio·changePercentagePoint는 비교할 지난 기간이 없으면 null
const MONTH_BREAKDOWN = [
  { reason: 'STRESS', amount: 84490, ratio: 34.02, previousRatio: 30.1, changePercentagePoint: 3.92 },
  { reason: 'NEED', amount: 69580, ratio: 28.02, previousRatio: 31.4, changePercentagePoint: -3.38 },
  { reason: 'DISCOUNT', amount: 44730, ratio: 18.01, previousRatio: 16.8, changePercentagePoint: 1.21 },
  { reason: 'HABIT', amount: 29820, ratio: 12.01, previousRatio: 13.9, changePercentagePoint: -1.89 },
  { reason: 'IMPULSE', amount: 19880, ratio: 7.94, previousRatio: 7.8, changePercentagePoint: 0.14 },
]

const WEEK_BREAKDOWN = [
  { reason: 'STRESS', amount: 22140, ratio: 41.0, previousRatio: 35.0, changePercentagePoint: 6.0 },
  { reason: 'NEED', amount: 16200, ratio: 30.0, previousRatio: 32.0, changePercentagePoint: -2.0 },
  { reason: 'HABIT', amount: 9180, ratio: 17.0, previousRatio: 19.0, changePercentagePoint: -2.0 },
  { reason: 'DISCOUNT', amount: 6480, ratio: 12.0, previousRatio: 14.0, changePercentagePoint: -2.0 },
]

// trend는 지난 기간과 이번 기간이 한 배열에 담겨 온다. period.startDate를 기준으로 나눠서 두 줄로 그린다.
const MONTH_TREND = [
  { date: '2026-10-05', amount: 52000 },
  { date: '2026-10-12', amount: 182000 },
  { date: '2026-10-19', amount: 262000 },
  { date: '2026-10-26', amount: 371000 },
  { date: '2026-10-31', amount: 400000 },
  { date: '2026-11-07', amount: 69000 },
  { date: '2026-11-14', amount: 171000 },
  { date: '2026-11-18', amount: 310000 },
]

const WEEK_TREND = [
  { date: '2026-11-09', amount: 1000 },
  { date: '2026-11-10', amount: 14000 },
  { date: '2026-11-11', amount: 31000 },
  { date: '2026-11-12', amount: 40000 },
  { date: '2026-11-13', amount: 53000 },
  { date: '2026-11-14', amount: 70000 },
  { date: '2026-11-15', amount: 80000 },
  { date: '2026-11-16', amount: 5000 },
  { date: '2026-11-17', amount: 32000 },
  { date: '2026-11-18', amount: 54000 },
]

const MONTH_READY = {
  key: '2026-11-MONTH',
  status: STATUS.ready,
  cumulativeExpenseCount: 10,
  requiredExpenseCount: 5,
  period: { type: 'MONTH', startDate: '2026-11-01', endDate: '2026-11-30' },
  totalAmount: 248500,
  regretCount: 4,
  keyInsight: {
    message: '스트레스 해소로 주문한 배달 음식은 다른 배달 음식보다 건당 금액이 높게 나타나요.',
    evidence: { reason: 'STRESS', reasonCount: 3, item: 'DELIVERY', itemAmount: 52500 },
  },
  reasonBreakdown: MONTH_BREAKDOWN,
  trend: MONTH_TREND,
  comparisonMessage: '지난달보다 배달 음식이 12% 늘었어요',
  suggestion: SUGGESTION,
  reflectionQuestion: REFLECTION,
  analysisSource: 'AI',
}

const WEEK_READY = {
  key: '2026-11-3-WEEK',
  status: STATUS.ready,
  cumulativeExpenseCount: 10,
  requiredExpenseCount: 5,
  period: { type: 'WEEK', startDate: '2026-11-16', endDate: '2026-11-22' },
  totalAmount: 54000,
  regretCount: 2,
  keyInsight: {
    message: '스트레스 해소로 주문한 배달 음식은 다른 배달 음식보다 건당 금액이 높았어요.',
    evidence: { reason: 'STRESS', reasonCount: 2, item: 'DELIVERY', itemAmount: 39000 },
  },
  reasonBreakdown: WEEK_BREAKDOWN,
  trend: WEEK_TREND,
  comparisonMessage: '지난주보다 스트레스 해소가 6% 늘었어요',
  suggestion: SUGGESTION,
  reflectionQuestion: REFLECTION,
  analysisSource: 'AI',
}

// 패턴 없음: 이유별 통계만 오고 분석 문장은 모두 null
const noPattern = (base) => ({
  ...base,
  status: STATUS.noPattern,
  keyInsight: null,
  trend: [],
  comparisonMessage: null,
  suggestion: null,
  reflectionQuestion: null,
  analysisSource: 'NONE',
})

// 기록 부족 / 기간에 기록 없음: 합계 0, 배열은 빈 배열
const empty = (status, type, cumulativeExpenseCount) => ({
  key: `${type}-${status}`,
  status,
  cumulativeExpenseCount,
  requiredExpenseCount: 5,
  period: { type, startDate: null, endDate: null },
  totalAmount: 0,
  regretCount: 0,
  keyInsight: null,
  reasonBreakdown: [],
  trend: [],
  comparisonMessage: null,
  suggestion: null,
  reflectionQuestion: null,
  analysisSource: 'NONE',
})

// GET /insights?type=MONTH|WEEK&date=... 대신 쓰는 임시 함수
export function fetchMockInsights(period, { year, month, week }) {
  const isNovember = year === 2026 && month === 11
  if (period === 'month') {
    if (isNovember) return MONTH_READY
    if (year === 2026 && month === 10) return noPattern(MONTH_READY)
    if (year === 2026 && month === 9) return empty(STATUS.noExpenses, 'MONTH', 10)
    return empty(STATUS.insufficient, 'MONTH', 3)
  }
  if (isNovember) return week === 3 ? WEEK_READY : noPattern(WEEK_READY)
  if (year === 2026 && month === 10) return empty(STATUS.noExpenses, 'WEEK', 10)
  return empty(STATUS.insufficient, 'WEEK', 3)
}

/*
 근거 기록 목록(S6-6)은 위 응답에 없다. 기록 쪽에서 따로 받아 와야 한다.
 GET /expenses?reason=..&item=..&startDate=..&endDate=.. 자리.
*/
export function fetchMockEvidenceRecords({ type }) {
  const records = [
    { id: 1, date: '2026-11-18', item: 'DELIVERY', memo: '야근하고 늦게 와서 시켰어요', reasons: ['STRESS'], regret: true, amount: 18500 },
    { id: 2, date: '2026-11-11', item: 'DELIVERY', memo: '', reasons: ['STRESS'], regret: false, amount: 17000 },
    { id: 3, date: '2026-11-04', item: 'DELIVERY', memo: '시험 끝나고', reasons: ['STRESS'], regret: true, amount: 17000 },
  ]
  return type === 'WEEK' ? records.slice(0, 2) : records
}
