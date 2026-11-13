import { NavLink } from 'react-router-dom'
import {
  ChartPieSliceIcon,
  DotsThreeOutlineIcon,
  HouseIcon,
  ReceiptIcon,
  TargetIcon,
} from '@phosphor-icons/react'
import './BottomTabBar.css'

const TABS = [
  { to: '/', label: '홈', Icon: HouseIcon },
  { to: '/records', label: '기록', Icon: ReceiptIcon },
  { to: '/insights', label: '인사이트', Icon: ChartPieSliceIcon },
  { to: '/missions', label: '미션', Icon: TargetIcon },
  { to: '/more', label: '더보기', Icon: DotsThreeOutlineIcon },
]

export default function BottomTabBar() {
  return (
    <nav className="tab-bar">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="tab-bar-item">
          {({ isActive }) => (
            <>
              <Icon className="tab-bar-icon" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="tab-bar-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
