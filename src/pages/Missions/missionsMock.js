/*
 S7 화면용 임시 데이터. 백엔드 응답 모양을 그대로 따른다.
 GET /missions/current 자리이고, API가 생기면 fetchMockMission을 실제 호출로 바꾸기만 하면 된다.

 MOCK_TODAY는 시안(11월 18일 기준)에 맞춘 고정 날짜다. API 연결 후에는 new Date()를 쓴다.
 MOCK_SCENARIO를 바꾸면 각 상태 화면을 볼 수 있다.
   RECOMMENDED  S7-1 추천 미션 3개 (진행 중인 미션이 없는 상태)
   IN_PROGRESS  S7-2 진행 중 (오늘 체크하면 S7-2b)
   ACHIEVED     S7-3 달성 판정
   FAILED       S7-4 미달성 (어려웠던 점 바텀시트)
   TOO_FEW      S7-5 누적 기록이 모자란 상태
*/
export const MOCK_TODAY = new Date(2026, 10, 18)
export const MOCK_SCENARIO = 'RECOMMENDED'

/*
 미션 기간과 달성 기준.
 기간은 미션마다 startedOn~endsOn으로 오지만, 미션을 고르기 전에는 안내 문구에 쓸 값이 없어서 여기 둔다.
*/
export const MISSION_DAYS = 7
export const ACHIEVE_DAYS = 5

/*
 서버가 주는 코드(enum)를 화면에 쓰는 말로 바꾸는 곳.
 코드 이름이 백엔드와 다르면 여기만 고치면 된다.
*/

// 미션 난이도
const LEVEL_LABELS = { EASY: '쉬운', BASIC: '기본', ADVANCED: '심화' }
export const levelLabel = (level) => LEVEL_LABELS[level] ?? level

// 어떤 소비 패턴에 맞춘 미션인지(7-2 패턴 그룹). 소비 이유·항목 이름을 그대로 쓴다
const PATTERN_LABELS = {
  STRESS_DELIVERY: '스트레스·보상 × 배달 음식 패턴',
  IMPULSE_SHOPPING: '충동 × 쇼핑 패턴',
  HABIT_CAFE_FOOD: '습관 × 카페·식비 패턴',
  DEFAULT: '모든 패턴 공통',
}
export const patternLabel = (patternGroup) => PATTERN_LABELS[patternGroup] ?? patternGroup

// 미달성일 때 고르는 어려웠던 점. 서버에는 difficulty 코드로 보낸다
export const DIFFICULTY_REASONS = [
  { code: 'NO_TIME', label: '시간이 없었어요' },
  { code: 'HABIT_UNCHANGED', label: '습관이 안 바뀌었어요' },
  { code: 'FORGOT', label: '잊었어요' },
  { code: 'OTHER', label: '기타' },
]

// 이번 주 리포트. S6 인사이트가 계산해서 주는 값이다
const REPORT = {
  weekStart: '2026-11-16',
  weekEnd: '2026-11-22',
  highlight: '이번 주 지출의 42%가 스트레스·충동 소비예요',
  totalAmount: 186500,
  regretCount: 2,
  previousRegretCount: 3,
  // 이번 주 - 지난주. 음수면 줄어든 것으로 본다. 백엔드 부호가 반대면 Missions.jsx의 regretChangeText만 고치면 된다
  regretCountChange: -1,
  stressImpulseRatio: 0.42,
  reasonBreakdown: [
    { reason: 'STRESS', amount: 66500, ratio: 0.36 },
    { reason: 'NEED', amount: 59550, ratio: 0.32 },
    { reason: 'DISCOUNT', amount: 32000, ratio: 0.17 },
    { reason: 'HABIT', amount: 9300, ratio: 0.05 },
    { reason: 'IMPULSE', amount: 19150, ratio: 0.1 },
  ],
  missionCompletionRate: 0.29,
}

// 기록이 모자랄 때는 비교를 못 해서 리포트 문구가 달라진다
const TOO_FEW_REPORT = {
  ...REPORT,
  highlight: '기록이 아직 적어서 비교하기 어려워요',
}

// 추천 미션 3개. 고를 때까지 그대로 유지된다(P-04)
const RECOMMENDATIONS = [
  {
    optionIndex: 0,
    text: '주문 전 집에 있는 식재료 확인하기',
    patternGroup: 'STRESS_DELIVERY',
    level: 'BASIC',
  },
  {
    optionIndex: 1,
    text: '주문 전 물 한 잔 마시고 5분 뒤 결정하기',
    patternGroup: 'STRESS_DELIVERY',
    level: 'EASY',
  },
  {
    optionIndex: 2,
    text: '결제 전 이번 주 남은 예산 확인하기',
    patternGroup: 'DEFAULT',
    level: 'BASIC',
  },
]

/*
 상태별 진행 중인 미션.
 며칠에 실천했는지는 안 오고 doneDays(실천한 날 수)와 checkedToday만 온다.
 안 누른 날은 못 한 날로 본다(P-05).
*/
const MISSIONS = {
  IN_PROGRESS: {
    missionId: 41,
    text: '주문 전 집에 있는 식재료 확인하기',
    patternGroup: 'STRESS_DELIVERY',
    level: 'BASIC',
    startedOn: '2026-11-16',
    endsOn: '2026-11-22',
    doneDays: 2,
    checkedToday: false,
    status: 'IN_PROGRESS',
    feedbackRequired: false,
    difficulty: null,
    memo: '',
  },
  ACHIEVED: {
    missionId: 40,
    text: '주문 전 집에 있는 식재료 확인하기',
    patternGroup: 'STRESS_DELIVERY',
    level: 'BASIC',
    startedOn: '2026-11-09',
    endsOn: '2026-11-15',
    doneDays: 6,
    checkedToday: false,
    status: 'ACHIEVED',
    feedbackRequired: false,
    difficulty: null,
    memo: '',
  },
  FAILED: {
    missionId: 40,
    text: '주문 전 집에 있는 식재료 확인하기',
    patternGroup: 'STRESS_DELIVERY',
    level: 'BASIC',
    startedOn: '2026-11-09',
    endsOn: '2026-11-15',
    doneDays: 3,
    checkedToday: false,
    status: 'FAILED',
    feedbackRequired: true,
    difficulty: null,
    memo: '',
  },
}

export function fetchMockMission() {
  const tooFew = MOCK_SCENARIO === 'TOO_FEW'

  return {
    cumulativeExpenseCount: tooFew ? 3 : 12,
    requiredExpenseCount: 5,
    report: tooFew ? TOO_FEW_REPORT : REPORT,
    recommendationSetId: 7,
    recommendations: RECOMMENDATIONS,
    mission: MISSIONS[MOCK_SCENARIO] ?? null,
  }
}
