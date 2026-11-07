import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import './Records.css'

// S5 기록 화면. 여기에 내용을 만든다.
export default function Records() {
  const navigate = useNavigate()

  return (
    <div className="records-page">
      <PageHeader title="기록" />
      {/* 내용은 여기에 */}
      <div className="records-action-bar">
        <Button fullWidth onClick={() => navigate('/records/new')}>
          + 소비 기록하기
        </Button>
      </div>
    </div>
  )
}
