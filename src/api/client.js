/*
  공통 API 호출. 모든 화면은 request()로 서버를 부른다.
  - 성공: 응답의 data를 돌려준다 (204는 null)
  - 실패: ApiError(code, message)를 던진다. 화면은 error.code로 분기하고 error.message를 토스트에 쓴다
  - 401 TOKEN_EXPIRED: 토큰을 재발급받고 원래 요청을 한 번 더 보낸다
  - 401 UNAUTHORIZED / INVALID_REFRESH_TOKEN: 토큰을 지우고 로그인 화면으로 보낸다
*/
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens.js'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dolabom.duckdns.org').replace(/\/$/, '')
const RETRY_MESSAGE = '잠시 후 다시 시도해 주세요'
const LOGIN_AGAIN_MESSAGE = '다시 로그인해 주세요'

export class ApiError extends Error {
  constructor(code, message, fieldErrors = []) {
    super(message)
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

async function send(method, path, { body, auth }) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const accessToken = getAccessToken()
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  }

  let response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', RETRY_MESSAGE)
  }

  if (response.status === 204) return null
  const json = await response.json().catch(() => null)
  if (response.ok) return json?.data ?? null

  const error = json?.error
  throw new ApiError(error?.code ?? 'INTERNAL_ERROR', error?.message ?? RETRY_MESSAGE, error?.fieldErrors)
}

// 여러 요청이 동시에 만료돼도 재발급은 한 번만 한다
let refreshing = null

function refreshTokens() {
  if (!refreshing) {
    const refreshToken = getRefreshToken()
    refreshing = (
      refreshToken
        ? send('POST', '/api/v1/auth/refresh', { body: { refreshToken }, auth: false })
        : Promise.reject(new ApiError('INVALID_REFRESH_TOKEN', LOGIN_AGAIN_MESSAGE))
    )
      .then((tokens) => setTokens(tokens))
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

function isLoginError(error) {
  return error.code === 'UNAUTHORIZED' || error.code === 'INVALID_REFRESH_TOKEN'
}

function goToLogin() {
  clearTokens()
  if (window.location.pathname !== '/login') window.location.replace('/login')
}

// auth: false는 로그인·회원가입처럼 토큰 없이 부르는 API
export async function request(method, path, { body, auth = true } = {}) {
  try {
    return await send(method, path, { body, auth })
  } catch (error) {
    if (!auth) throw error

    if (error.code === 'TOKEN_EXPIRED') {
      try {
        await refreshTokens()
      } catch {
        goToLogin()
        throw new ApiError('UNAUTHORIZED', LOGIN_AGAIN_MESSAGE)
      }
      try {
        return await send(method, path, { body, auth })
      } catch (retryError) {
        if (isLoginError(retryError) || retryError.code === 'TOKEN_EXPIRED') goToLogin()
        throw retryError
      }
    }

    if (isLoginError(error)) goToLogin()
    throw error
  }
}
