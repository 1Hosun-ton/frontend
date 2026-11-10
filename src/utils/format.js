export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

export function formatWon(value) {
  return `${formatNumber(value)}원`
}
