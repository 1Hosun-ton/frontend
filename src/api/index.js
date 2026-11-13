import { request } from './client.js'
import { clearTokens, getRefreshToken, setTokens } from './tokens.js'

export { ApiError } from './client.js'

// ── 계정 ──

export async function login({ email, password }) {
  const data = await request('POST', '/api/v1/auth/login', { body: { email, password }, auth: false })
  setTokens(data)
  return data
}

export async function signup({ nickname, email, password }) {
  const data = await request('POST', '/api/v1/auth/signup', { body: { nickname, email, password }, auth: false })
  setTokens(data)
  return data
}

// 서버 요청이 실패해도 이 기기에서는 로그아웃한다
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) await request('POST', '/api/v1/auth/logout', { body: { refreshToken }, auth: false })
  } catch {
    // 무시
  } finally {
    clearTokens()
  }
  return null
}

export function getMe() {
  return request('GET', '/api/v1/me')
}

export async function deleteAccount() {
  await request('DELETE', '/api/v1/me')
  clearTokens()
  return null
}

export function updateWeeklyBudget({ weeklyBudget }) {
  return request('PUT', '/api/v1/me/weekly-budget', { body: { weeklyBudget } })
}

// ── 홈 ──

export function getHome() {
  return request('GET', '/api/v1/home')
}

export function checkMission(missionId, { memo = null } = {}) {
  return request('POST', `/api/v1/missions/${missionId}/checks`, { body: { memo } })
}

// ── 소비 기록 ──

export function createExpense({ amount, item, spentAt, reason, regret, mood, memo }) {
  return request('POST', '/api/v1/expenses', {
    body: { amount, item, spentAt, reason, regret, mood: mood ?? null, memo: memo?.trim() || null },
  })
}
