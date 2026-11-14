import { client, unwrap } from './client.js'
import { clearTokens, getRefreshToken, setTokens } from './tokens.js'

/*
 돌아봄 API 호출을 한 곳에 모아 둔다. (스웨거: https://dolabom.duckdns.org/swagger-ui/index.html)
 응답 봉투({ data })는 client가 벗겨 주므로 여기서는 안쪽 값만 돌려준다.
*/

// 서버 enum. 화면에서 쓰는 이름은 recordCategories.js가 들고 있다
export const INSIGHT_STATUS = {
  insufficient: 'INSUFFICIENT_DATA',
  noExpenses: 'NO_EXPENSES',
  noPattern: 'NO_PATTERN',
  ready: 'READY',
}

export const MISSION_STATUS = {
  inProgress: 'IN_PROGRESS',
  achieved: 'ACHIEVED',
  failed: 'FAILED',
}

/* ===== 인증 ===== */

export async function login({ email, password }) {
  const res = await client.post('/api/v1/auth/login', { email, password }, { skipAuth: true })
  const auth = unwrap(res)
  setTokens(auth)
  return auth
}

export async function signup({ nickname, email, password }) {
  const res = await client.post('/api/v1/auth/signup', { nickname, email, password }, { skipAuth: true })
  const auth = unwrap(res)
  setTokens(auth)
  return auth
}

// 토큰이 이미 못 쓰는 상태여도 로그아웃은 끝까지 되게 한다
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) await client.post('/api/v1/auth/logout', { refreshToken }, { skipAuth: true })
  } finally {
    clearTokens()
  }
}

/* ===== 내 정보 ===== */

export const getMe = () => client.get('/api/v1/me').then(unwrap)
export const deleteMe = () => client.delete('/api/v1/me').then(() => undefined)
export const setWeeklyBudget = (weeklyBudget) =>
  client.put('/api/v1/me/weekly-budget', { weeklyBudget }).then(unwrap)

/* ===== 홈 ===== */

export const getHome = () => client.get('/api/v1/home').then(unwrap)

/* ===== 소비 기록 ===== */

/*
 month('2026-11')만 주거나 from/to를 주면 된다. item·reason으로 걸러낼 수도 있다.
*/
export const getExpenses = ({ month, from, to, item, reason } = {}) =>
  client.get('/api/v1/expenses', { params: { month, from, to, item, reason } }).then(unwrap)

export const createExpense = (expense) => client.post('/api/v1/expenses', expense).then(unwrap)

export const deleteExpense = (expenseId) =>
  client.delete(`/api/v1/expenses/${expenseId}`).then(() => undefined)

/* ===== 인사이트 ===== */

export const getInsights = ({ periodType, periodStart } = {}) =>
  client.get('/api/v1/insights', { params: { periodType, periodStart } }).then(unwrap)

/* ===== 미션 ===== */

export const getMissionsOverview = () => client.get('/api/v1/missions/overview').then(unwrap)

export const startMission = ({ recommendationSetId, optionIndex }) =>
  client.post('/api/v1/missions', { recommendationSetId, optionIndex }).then(unwrap)

export const checkMissionToday = (missionId, memo) =>
  client.post(`/api/v1/missions/${missionId}/checks`, { memo }).then(unwrap)

export const setMissionDifficulty = (missionId, difficulty) =>
  client.patch(`/api/v1/missions/${missionId}/difficulty`, { difficulty }).then(unwrap)
