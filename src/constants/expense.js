// value = 서버 저장 값, label = 화면 표시

export const EXPENSE_ITEMS = [
  { value: 'FOOD', label: '식비' },
  { value: 'DELIVERY', label: '배달 음식' },
  { value: 'CAFE', label: '카페' },
  { value: 'SHOPPING', label: '쇼핑' },
  { value: 'TRANSPORT', label: '교통비' },
  { value: 'ETC', label: '기타' },
]

export const EXPENSE_REASONS = [
  { value: 'NEED', label: '필요해서' },
  { value: 'STRESS', label: '스트레스 해소' },
  { value: 'DISCOUNT', label: '할인' },
  { value: 'IMPULSE', label: '충동' },
  { value: 'REWARD', label: '보상' },
  { value: 'HABIT', label: '습관' },
]

// 기분 저장 값은 백엔드와 아직 정하지 않았다
export const EXPENSE_MOODS = [
  { value: 'GOOD', label: '좋음' },
  { value: 'NORMAL', label: '보통' },
  { value: 'TIRED', label: '지침' },
  { value: 'DOWN', label: '우울' },
]
