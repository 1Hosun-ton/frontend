import { Outlet } from 'react-router-dom'
import './layouts.css'

/**
 * 로그인·회원가입·주간 예산(S0~S2)용 레이아웃. 하단 탭이 없는 흰 화면.
 * - 좌우 여백 20px, 내용이 길면 스크롤된다.
 * - 위쪽 모양(로고, 뒤로가기 헤더, 큰 제목)은 화면마다 달라서 각 페이지가 직접 만든다.
 * - 페이지의 맨 바깥 요소는 화면 높이를 채우는 세로 flex라서, 마지막 버튼에
 *   margin-top: auto 를 주면 화면 맨 아래에 붙는다.
 */
export default function AuthLayout() {
  return (
    <main className="auth-layout">
      <Outlet />
    </main>
  )
}
