import { Outlet } from 'react-router-dom'
import BottomTabBar from '../components/BottomTabBar/BottomTabBar.jsx'
import './layouts.css'

// 하단 탭이 있는 화면 - bg를 grey나 white로 지정
export default function TabLayout({ bg = 'white' }) {
  return (
    <>
      <main className={`layout-content layout-content-${bg}`}>
        <Outlet />
      </main>
      <BottomTabBar />
    </>
  )
}
