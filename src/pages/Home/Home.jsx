import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import './Home.css'

// S3 홈 화면. 여기에 내용을 만든다.
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <PageHeader subtitle="11월 3주차" title="하린님, 이번 주 소비를 돌아봐요" />
      {/* 내용은 여기에 */}
      <button type="button" className="home-record-button" onClick={() => navigate('/records/new')}>
        + 기록하기
      </button>
    </div>
  )
}
