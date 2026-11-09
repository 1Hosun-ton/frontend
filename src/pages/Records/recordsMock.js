/*
 S5 화면용 임시 데이터. API가 생기면 이 파일을 교체한다.
 MOCK_TODAY는 시안(11월 18일 기준, 하루 평균 = 248,500 ÷ 18)에 맞춘 고정 날짜다.
 API 연결 후에는 new Date()를 쓴다.
*/
export const MOCK_TODAY = new Date(2026, 10, 18)

// GET /records?month=YYYY-MM 대신 쓰는 임시 함수. 서버처럼 그 달 기록만, 날짜 내림차순으로 돌려준다.
export const fetchMockRecords = (month) => MOCK_RECORDS.filter((r) => r.date.startsWith(month))

// 날짜 최신순으로 두고, 같은 날은 이 배열 순서대로 보여 준다.
export const MOCK_RECORDS = [
  { id: 1, date: '2026-11-18', category: 'delivery', memo: '야근하고 늦게 와서 시켰어요', reasons: ['스트레스 해소'], regret: true, amount: 18500 },
  { id: 2, date: '2026-11-18', category: 'cafe', memo: '출근길 아메리카노', reasons: ['습관'], regret: false, amount: 4800 },
  { id: 3, date: '2026-11-17', category: 'shopping', memo: '1+1 행사라서', reasons: ['할인'], regret: true, amount: 32000 },
  { id: 4, date: '2026-11-17', category: 'food', memo: '점심', reasons: ['필요해서'], regret: false, amount: 9000 },
  { id: 5, date: '2026-11-16', category: 'transport', memo: '', reasons: ['필요해서'], regret: false, amount: 1550 },
  { id: 6, date: '2026-11-14', category: 'shopping', memo: '겨울 외투', reasons: ['필요해서'], regret: false, amount: 89000 },
  { id: 7, date: '2026-11-12', category: 'food', memo: '팀 회식', reasons: ['스트레스 해소'], regret: true, amount: 48000 },
  { id: 8, date: '2026-11-09', category: 'delivery', memo: '', reasons: ['귀찮아서'], regret: false, amount: 21500 },
  { id: 9, date: '2026-11-07', category: 'cafe', memo: '', reasons: ['습관'], regret: false, amount: 4500 },
  { id: 10, date: '2026-11-05', category: 'transport', memo: '', reasons: ['필요해서'], regret: false, amount: 19650 },
]
