import { useNavigate } from 'react-router-dom'
import { APP_VERSION } from '../../constants/app.js'
import backIcon from '../../assets/icons/back.svg'
import chevronRight from '../../assets/icons/chevron-right-grey.svg'
import logo from '../../assets/logo-large.svg'
import './AppInfo.css'

// TODO: 약관·처리방침·라이선스 링크 연결
const LINKS = ['이용약관', '개인정보 처리방침', '오픈소스 라이선스']

// S8-4 앱 정보 화면
export default function AppInfo() {
  const navigate = useNavigate()

  return (
    <div className="app-info-page">
      <header className="app-info-header">
        <button type="button" className="app-info-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <img src={backIcon} alt="" />
        </button>
        <h1 className="app-info-title">앱 정보</h1>
      </header>

      <div className="app-info-brand">
        <img src={logo} alt="" />
        <p className="app-info-name">돌아봄</p>
        <p className="app-info-version">버전 {APP_VERSION}</p>
      </div>

      <ul className="app-info-links">
        {LINKS.map((label) => (
          <li key={label}>
            <button type="button" className="app-info-link">
              {label}
              <img src={chevronRight} alt="" />
            </button>
          </li>
        ))}
      </ul>

      <section className="app-info-credits">
        <h2 className="app-info-credits-title">출처</h2>
        <p className="app-info-credits-text">
          토스페이스는 토스팀의 저작물입니다.
          <br />
          아이콘 일부: Phosphor Icons (MIT)
          <br />
          글꼴: Pretendard (SIL OFL 1.1)
        </p>
      </section>
    </div>
  )
}
