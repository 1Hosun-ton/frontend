const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateString(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayString() {
  return toDateString(new Date())
}

export function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - diff)
  return result
}

// 그 주 목요일이 속한 달의 N주차 (예: "11월 3주차")
export function weekLabel(date = new Date()) {
  const thursday = startOfWeek(date)
  thursday.setDate(thursday.getDate() + 3)
  const week = Math.ceil(thursday.getDate() / 7)
  return `${thursday.getMonth() + 1}월 ${week}주차`
}

// "오늘 · 11월 18일 (수)" / "11월 15일 (일)"
export function dateFieldLabel(value) {
  const date = fromDateString(value)
  const text = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_NAMES[date.getDay()]})`
  return value === todayString() ? `오늘 · ${text}` : text
}
