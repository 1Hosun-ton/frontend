/*
 항목(카테고리)별 이름과 아이콘.
 아이콘은 토스페이스 이모지 '문자'다. index.html에서 글꼴을 불러오므로 그림 파일이 필요 없다.
*/
export const RECORD_CATEGORIES = {
  delivery: { name: '배달 음식', emoji: '\u{1F6F5}' }, // 스쿠터
  cafe: { name: '카페', emoji: '\u{2615}' }, // 커피
  shopping: { name: '쇼핑', emoji: '\u{1F6CD}\u{FE0F}' }, // 쇼핑백
  food: { name: '식비', emoji: '\u{1F35A}' }, // 밥
  transport: { name: '교통비', emoji: '\u{1F68C}' }, // 버스
  etc: { name: '기타', emoji: '\u{1F4E6}' }, // 상자
}

// 소비 이유 코드 → 화면에 쓰는 이름. 백엔드 enum과 맞춰야 한다
export const RECORD_REASONS = {
  STRESS: '스트레스 해소',
  NEED: '필요해서',
  DISCOUNT: '할인',
  HABIT: '습관',
  IMPULSE: '충동',
  REWARD: '보상',
}

// 기분 코드 → 화면에 쓰는 이름. 백엔드 enum과 맞춰야 한다
export const RECORD_MOODS = {
  GOOD: '기분 좋음',
  NORMAL: '보통',
  TIRED: '지침',
}

// 모르는 코드가 와도 화면이 비지 않도록 코드를 그대로 보여 준다
export const reasonLabel = (code) => RECORD_REASONS[code] ?? code
export const moodLabel = (code) => RECORD_MOODS[code] ?? code
export const itemLabel = (code) => RECORD_CATEGORIES[String(code).toLowerCase()]?.name ?? code
// 모르는 항목이면 아이콘 없이 둔다
export const itemEmoji = (code) => RECORD_CATEGORIES[String(code).toLowerCase()]?.emoji ?? null
