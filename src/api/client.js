import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens.js'

/*
 서버 주소는 .env의 VITE_API_BASE_URL로 바꿀 수 있다. 없으면 배포된 서버를 쓴다.
*/
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://dolabom.duckdns.org'

export const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/*
 서버 에러는 { error: { code, message, fieldErrors } } 모양으로 온다.
 화면에서는 err.message를 그대로 보여 주면 되도록 여기서 한 번만 정리한다.
 message는 서버가 주는 한국어 문구를 그대로 쓴다 (화면 문구와 글자까지 같아야 한다).
*/
export class ApiError extends Error {
  constructor({ code, message, fieldErrors, status }) {
    super(message || '잠시 후 다시 시도해 주세요')
    this.name = 'ApiError'
    this.code = code ?? 'UNKNOWN'
    this.fieldErrors = fieldErrors ?? []
    this.status = status ?? 0
  }
}

function toApiError(error) {
  if (error.response) {
    const body = error.response.data?.error
    return new ApiError({ ...body, status: error.response.status })
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError({ code: 'TIMEOUT', message: '응답이 늦어요. 잠시 후 다시 시도해 주세요' })
  }
  return new ApiError({ code: 'NETWORK', message: '연결에 실패했어요. 네트워크를 확인해 주세요' })
}

// 로그인 토큰 붙이기
client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`
  return config
})

/*
 401이 오면 refreshToken으로 한 번만 다시 받아 보고, 원래 요청을 그대로 재시도한다.
 여러 요청이 동시에 401을 받아도 재발급은 한 번만 하도록 진행 중인 약속을 공유한다.
*/
let refreshing = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError({ code: 'UNAUTHORIZED', message: '다시 로그인해 주세요', status: 401 })
  const { data } = await client.post('/api/v1/auth/refresh', { refreshToken }, { skipAuth: true, skipRetry: true })
  setTokens(data.data)
  return data.data.accessToken
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config ?? {}
    const is401 = error.response?.status === 401

    if (!is401 || config.skipRetry || config.skipAuth) return Promise.reject(toApiError(error))

    try {
      refreshing = refreshing ?? refreshAccessToken()
      const accessToken = await refreshing
      refreshing = null
      return client({ ...config, skipRetry: true, headers: { ...config.headers, Authorization: `Bearer ${accessToken}` } })
    } catch {
      refreshing = null
      clearTokens()
      return Promise.reject(
        new ApiError({ code: 'UNAUTHORIZED', message: '다시 로그인해 주세요', status: 401 }),
      )
    }
  },
)

// 모든 응답이 { data: ... } 봉투에 담겨 오므로 안쪽만 꺼내 준다
export const unwrap = (response) => response.data?.data
