import { NavLink } from 'react-router-dom'
import './BottomTabBar.css'
import homeIcon from '../../assets/icons/tab-home.svg'
import homeIconActive from '../../assets/icons/tab-home-active.svg'
import recordIcon from '../../assets/icons/tab-record.svg'
import recordIconActive from '../../assets/icons/tab-record-active.svg'
import insightIcon from '../../assets/icons/tab-insight.svg'
import insightIconActive from '../../assets/icons/tab-insight-active.svg'
import missionIcon from '../../assets/icons/tab-mission.svg'
import missionIconActive from '../../assets/icons/tab-mission-active.svg'
import moreIcon from '../../assets/icons/tab-more.svg'
import moreIconActive from '../../assets/icons/tab-more-active.svg'

const TABS = [
  { to: '/', label: '홈', icon: homeIcon, activeIcon: homeIconActive },
  { to: '/records', label: '기록', icon: recordIcon, activeIcon: recordIconActive },
  { to: '/insights', label: '인사이트', icon: insightIcon, activeIcon: insightIconActive },
  { to: '/missions', label: '미션', icon: missionIcon, activeIcon: missionIconActive },
  { to: '/more', label: '더보기', icon: moreIcon, activeIcon: moreIconActive },
]

export default function BottomTabBar() {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className="tab-bar-item">
          {({ isActive }) => (
            <>
              <img className="tab-bar-icon" src={isActive ? tab.activeIcon : tab.icon} alt="" />
              <span className="tab-bar-label">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
