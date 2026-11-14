/*
 로그인 토큰을 한 곳에서만 다룬다.
 브라우저를 닫아도 로그인이 남아 있어야 해서 localStorage에 둔다.
 사생활 보호 모드처럼 저장이 막힌 곳에서도 화면이 죽지 않도록 전부 try로 감싼다.
*/
const ACCESS_KEY = 'dolabom.accessToken'
const REFRESH_KEY = 'dolabom.refreshToken'

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // 저장이 막혀 있으면 이번 화면에서만 로그인이 유지된다
  }
}

export const getAccessToken = () => read(ACCESS_KEY)
export const getRefreshToken = () => read(REFRESH_KEY)

export function setTokens({ accessToken, refreshToken }) {
  write(ACCESS_KEY, accessToken ?? null)
  write(REFRESH_KEY, refreshToken ?? null)
}

export function clearTokens() {
  write(ACCESS_KEY, null)
  write(REFRESH_KEY, null)
}
