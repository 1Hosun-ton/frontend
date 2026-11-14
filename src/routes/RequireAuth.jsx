import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '../api/tokens.js'

/*
 로그인이 필요한 화면을 감싸는 문지기.
 화면을 그리기 전에 토큰을 보고 없으면 바로 로그인으로 보낸다.
 서버 응답(401)을 기다리면 홈이 한 번 깜빡이고, 네트워크가 끊긴 곳에서는
 아예 못 넘어가기 때문에 여기서 먼저 막는다.
 들어오려던 주소는 state.from에 담아 두고 로그인 후에 쓸 수 있게 한다.
*/
export default function RequireAuth() {
  const location = useLocation()

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
