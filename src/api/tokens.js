const ACCESS_KEY = 'dolabom-access-token'
const REFRESH_KEY = 'dolabom-refresh-token'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getAccessToken() {
  return read(ACCESS_KEY)
}

export function getRefreshToken() {
  return read(REFRESH_KEY)
}

export function setTokens({ accessToken, refreshToken }) {
  try {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  } catch {
    // 저장소를 못 쓰면 이번 접속 동안만 로그인 상태가 유지되지 않는다
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // 무시
  }
}
