/*
 S5 화면용 임시 데이터. 백엔드 응답 모양을 그대로 따른다.
 GET /expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD 자리이고,
 API가 생기면 fetchMockRecords를 실제 호출로 바꾸기만 하면 된다.

 MOCK_TODAY는 시안(11월 18일 기준)에 맞춘 고정 날짜다. API 연결 후에는 new Date()를 쓴다.
 mood도 코드(enum)로 오고, 선택 값이라 없는 기록도 있다.
*/
export const MOCK_TODAY = new Date(2026, 10, 18)

const pad = (n) => String(n).padStart(2, '0')

// 서버가 들고 있는 전체 소비 기록. 날짜 최신순
const EXPENSES = [
  { expenseId: 1, amount: 18500, item: 'DELIVERY', spentAt: '2026-11-18', reason: 'STRESS', regret: true, mood: 'TIRED', memo: '야근하고 늦게 와서 시켰어요', createdAt: '2026-11-18T22:10:00+09:00' },
  { expenseId: 2, amount: 4800, item: 'CAFE', spentAt: '2026-11-18', reason: 'HABIT', regret: false, mood: null, memo: '출근길 아메리카노', createdAt: '2026-11-18T08:30:00+09:00' },
  { expenseId: 3, amount: 32000, item: 'SHOPPING', spentAt: '2026-11-17', reason: 'DISCOUNT', regret: true, mood: 'NORMAL', memo: '1+1 행사라서', createdAt: '2026-11-17T20:05:00+09:00' },
  { expenseId: 4, amount: 9000, item: 'FOOD', spentAt: '2026-11-17', reason: 'NEED', regret: false, mood: null, memo: '점심', createdAt: '2026-11-17T12:40:00+09:00' },
  { expenseId: 5, amount: 1550, item: 'TRANSPORT', spentAt: '2026-11-16', reason: 'NEED', regret: false, mood: null, memo: null, createdAt: '2026-11-16T09:12:00+09:00' },
  { expenseId: 6, amount: 89000, item: 'SHOPPING', spentAt: '2026-11-14', reason: 'NEED', regret: false, mood: 'GOOD', memo: '겨울 외투', createdAt: '2026-11-14T15:22:00+09:00' },
  { expenseId: 7, amount: 48000, item: 'FOOD', spentAt: '2026-11-12', reason: 'STRESS', regret: true, mood: 'TIRED', memo: '팀 회식', createdAt: '2026-11-12T21:48:00+09:00' },
  { expenseId: 8, amount: 21500, item: 'DELIVERY', spentAt: '2026-11-09', reason: 'IMPULSE', regret: false, mood: null, memo: null, createdAt: '2026-11-09T19:30:00+09:00' },
  { expenseId: 9, amount: 4500, item: 'CAFE', spentAt: '2026-11-07', reason: 'HABIT', regret: false, mood: null, memo: null, createdAt: '2026-11-07T10:05:00+09:00' },
  { expenseId: 10, amount: 19650, item: 'TRANSPORT', spentAt: '2026-11-05', reason: 'NEED', regret: false, mood: null, memo: null, createdAt: '2026-11-05T08:00:00+09:00' },
]

/*
 월 조회 응답을 흉내 낸다. 합계·평균은 서버가 계산해서 주는 값이라 여기서 만든다.
 하루 평균 = 총 소비 ÷ 경과 일수. 지난달이면 그 달 전체 일수를 쓴다.
*/
export function fetchMockRecords(year, month) {
  const lastDay = new Date(year, month, 0).getDate()
  const startDate = `${year}-${pad(month)}-01`
  const endDate = `${year}-${pad(month)}-${pad(lastDay)}`
  const expenses = EXPENSES.filter((e) => e.spentAt >= startDate && e.spentAt <= endDate)

  const isCurrentMonth = year === MOCK_TODAY.getFullYear() && month === MOCK_TODAY.getMonth() + 1
  const elapsedDays = isCurrentMonth ? MOCK_TODAY.getDate() : lastDay
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  return {
    period: { type: 'MONTH', startDate, endDate },
    summary: expenses.length
      ? {
          totalAmount,
          dailyAverage: Math.round(totalAmount / elapsedDays),
          weeklyAverage: Math.round((totalAmount / elapsedDays) * 7),
        }
      : null,
    totalCount: expenses.length,
    expenses,
  }
}
