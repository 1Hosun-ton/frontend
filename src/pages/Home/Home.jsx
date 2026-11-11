import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { checkMission, getHome } from '../../api/mock.js'
import { weekLabel } from '../../utils/date.js'
import { formatNumber, formatWon } from '../../utils/format.js'
import './Home.css'

// S3 홈 화면
export default function Home() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [home, setHome] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let ignore = false
    getHome()
      .then((data) => {
        if (ignore) return
        // 주간 예산이 없으면 예산 설정부터
        if (data.budget?.weeklyBudget == null) return navigate('/budget', { replace: true })
        setHome(data)
      })
      .catch((error) => {
        if (ignore) return
        if (error.code === 'UNAUTHORIZED') navigate('/login', { replace: true })
        else if (error.code === 'BUDGET_NOT_SET') navigate('/budget', { replace: true })
      })
    return () => {
      ignore = true
    }
  }, [navigate])

  const handleCheck = async () => {
    if (checking || !home.mission) return
    setChecking(true)
    try {
      const { doneDays, checkedToday } = await checkMission(home.mission.missionId)
      setHome((prev) => ({ ...prev, mission: { ...prev.mission, doneDays, checkedToday } }))
    } catch (error) {
      showToast(error.message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="home-page">
      <PageHeader
        subtitle={home?.week.label ?? weekLabel()}
        title={home ? `${home.nickname}님, 이번 주 소비를 돌아봐요` : '이번 주 소비를 돌아봐요'}
      />

      {home && (
        <div className="home-cards">
          <BudgetCard budget={home.budget} />

          <div className="home-stats">
            <Card size="sm" className="home-stat">
              <p className="home-card-label">이번 주 기록</p>
              <p className="home-stat-value">{formatNumber(home.summary.expenseCount)}건</p>
            </Card>
            <Card size="sm" className="home-stat">
              <p className="home-card-label">후회한 소비</p>
              <p className="home-stat-value">{formatNumber(home.summary.regretCount)}건</p>
            </Card>
          </div>

          <MissionCard
            mission={home.mission}
            checking={checking}
            onCheck={handleCheck}
            onPick={() => navigate('/missions')}
          />
        </div>
      )}

      <button type="button" className="home-record-button" onClick={() => navigate('/records/new')}>
        + 기록하기
      </button>
    </div>
  )
}

function BudgetCard({ budget }) {
  const { weeklyBudget, spentAmount, remainingBudget, overBudget } = budget

  return (
    <Card className="home-budget">
      <div className="home-budget-label">
        <p className="home-card-label home-card-label-lg">남은 예산</p>
        {overBudget && <Tag tone="danger">예산 초과</Tag>}
      </div>
      <p className="home-budget-amount">{formatWon(remainingBudget)}</p>
      <ProgressBar
        value={spentAmount}
        max={weeklyBudget}
        tone={overBudget ? 'danger' : 'primary'}
        className="home-budget-bar"
      />
      <p className="home-budget-caption">
        {formatWon(spentAmount)} 썼어요 · 총 예산 {formatWon(weeklyBudget)}
      </p>
    </Card>
  )
}

function MissionCard({ mission, checking, onCheck, onPick }) {
  if (!mission) {
    return (
      <Card>
        <p className="home-card-label">진행 중인 미션</p>
        <p className="home-mission-title">아직 미션이 없어요</p>
        <Button variant="outline" size="small" fullWidth className="home-mission-pick" onClick={onPick}>
          미션 고르러 가기
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <p className="home-card-label">진행 중인 미션</p>
      <p className="home-mission-title">{mission.text}</p>
      <ProgressBar steps={7} value={mission.doneDays} className="home-mission-steps" />
      <p className="home-mission-days">{mission.doneDays}일 실천했어요</p>
      {mission.checkedToday ? (
        <Button variant="grey" size="small" fullWidth className="home-mission-check home-mission-done" disabled>
          오늘 실천 완료
        </Button>
      ) : (
        <Button
          variant="light"
          size="small"
          fullWidth
          className="home-mission-check"
          onClick={onCheck}
          disabled={checking}
        >
          오늘 실천 체크
        </Button>
      )}
    </Card>
  )
}
