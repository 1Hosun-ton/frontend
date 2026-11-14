/*
 소비 기록 enum을 한 곳에서만 들고 있는다.
 코드(value)는 스웨거(https://dolabom.duckdns.org/swagger-ui/index.html)의 enum과 글자까지 같아야 한다.
   item   FOOD DELIVERY CAFE SHOPPING TRANSPORT ETC
   reason NEED STRESS DISCOUNT IMPULSE REWARD HABIT
   mood   GOOD NORMAL TIRED DEPRESSED

 label은 기록 입력 화면의 칩에 쓰는 이름이다.
 tagLabel은 기록 목록의 태그처럼 앞에 설명이 없는 자리에서 쓰는 이름으로, 없으면 label을 쓴다.
 emoji는 토스페이스 이모지 '문자'다. index.html에서 글꼴을 불러오므로 그림 파일이 필요 없다.
*/

export const EXPENSE_ITEMS = [
  { value: 'FOOD', label: '식비', emoji: '\u{1F35A}' }, // 밥
  { value: 'DELIVERY', label: '배달 음식', emoji: '\u{1F6F5}' }, // 스쿠터
  { value: 'CAFE', label: '카페', emoji: '\u{2615}' }, // 커피
  { value: 'SHOPPING', label: '쇼핑', emoji: '\u{1F6CD}\u{FE0F}' }, // 쇼핑백
  { value: 'TRANSPORT', label: '교통비', emoji: '\u{1F68C}' }, // 버스
  { value: 'ETC', label: '기타', emoji: '\u{1F4E6}' }, // 상자
]

export const EXPENSE_REASONS = [
  { value: 'NEED', label: '필요해서' },
  { value: 'STRESS', label: '스트레스 해소' },
  { value: 'DISCOUNT', label: '할인' },
  { value: 'IMPULSE', label: '충동' },
  { value: 'REWARD', label: '보상' },
  { value: 'HABIT', label: '습관' },
]

export const EXPENSE_MOODS = [
  { value: 'GOOD', label: '좋음', tagLabel: '기분 좋음' },
  { value: 'NORMAL', label: '보통' },
  { value: 'TIRED', label: '지침' },
  { value: 'DEPRESSED', label: '우울' },
]

const byValue = (options) => new Map(options.map((option) => [option.value, option]))
const ITEMS = byValue(EXPENSE_ITEMS)
const REASONS = byValue(EXPENSE_REASONS)
const MOODS = byValue(EXPENSE_MOODS)

// 모르는 코드가 와도 화면이 비지 않도록 코드를 그대로 보여 준다
const find = (map, code) => map.get(String(code).toUpperCase())

export const itemLabel = (code) => find(ITEMS, code)?.label ?? code
export const reasonLabel = (code) => find(REASONS, code)?.label ?? code
export const moodLabel = (code) => {
  const mood = find(MOODS, code)
  return mood?.tagLabel ?? mood?.label ?? code
}

// 모르는 항목이면 아이콘 없이 둔다
export const itemEmoji = (code) => find(ITEMS, code)?.emoji ?? null
