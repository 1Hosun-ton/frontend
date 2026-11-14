export const MISSION_DAYS = 7
export const ACHIEVE_DAYS = 5

// 미션 난이도
const LEVEL_LABELS = { EASY: '쉬운', BASIC: '기본', ADVANCED: '심화' }
export const levelLabel = (level) => LEVEL_LABELS[level] ?? level

// 어떤 소비 패턴에 맞춘 미션인지(패턴 그룹). 소비 이유·항목 이름을 그대로 쓴다
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
