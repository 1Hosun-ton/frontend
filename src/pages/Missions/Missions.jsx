import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import chevronRightSmall from '../../assets/icons/chevron-right-small.svg'
import missionAchieved from '../../assets/icons/mission-achieved.svg'
import missionDayDone from '../../assets/icons/mission-day-done.svg'
import {
  ACHIEVE_DAYS,
  DIFFICULTY_REASONS,
  fetchMockMission,
  levelLabel,
  MISSION_DAYS,
  MOCK_TODAY,
  patternLabel,
} from './missionsMock.js'
import './Missions.css'

const DAY_MS = 24 * 60 * 60 * 1000
const pad = (n) => String(n).padStart(2, '0')
const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { date: new Date(y, m - 1, d), month: m, day: d }
}

const diffDays = (from, to) => Math.round((to - from) / DAY_MS)

function regretChangeText(change) {
  if (change < 0) return `지난주보다 ${Math.abs(change)}건 줄었어요`
  if (change > 0) return `지난주보다 ${change}건 늘었어요`
  return '지난주와 같아요'
}

export default function Missions() {
  const navigate = useNavigate()
  const [data, setData] = useState(fetchMockMission)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [reasonCode, setReasonCode] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(Boolean(data.mission?.feedbackRequired))

  const { cumulativeExpenseCount, requiredExpenseCount, report, recommendations, mission } = data

  const tooFew = cumulativeExpenseCount < requiredExpenseCount
  const status = tooFew ? 'TOO_FEW' : (mission?.status ?? 'RECOMMENDED')

  const startedOn = mission ? parseDate(mission.startedOn) : null
  const totalDays = mission ? diffDays(startedOn.date, parseDate(mission.endsOn).date) + 1 : MISSION_DAYS
  const todayNumber = mission ? diffDays(startedOn.date, MOCK_TODAY) + 1 : 0

  // 미션을 시작하면 오늘부터 7일이 된다. 실제로는 POST /missions 응답으로 받는다
  const startMission = () => {
    const picked = recommendations.find((item) => item.optionIndex === selectedIndex)
    const endsOn = new Date(MOCK_TODAY.getTime() + (MISSION_DAYS - 1) * DAY_MS)
    setData({
      ...data,
      mission: {
        missionId: null,
        text: picked.text,
        patternGroup: picked.patternGroup,
        level: picked.level,
        startedOn: toDateString(MOCK_TODAY),
        endsOn: toDateString(endsOn),
        doneDays: 0,
        checkedToday: false,
        status: 'IN_PROGRESS',
        feedbackRequired: false,
        difficulty: null,
        memo: '',
      },
    })
  }

  const checkToday = () => {
    const doneDays = mission.doneDays + 1
    setData({
      ...data,
      report: { ...report, missionCompletionRate: doneDays / totalDays },
      mission: { ...mission, doneDays, checkedToday: true },
    })
  }

  const writeMemo = (value) => setData({ ...data, mission: { ...mission, memo: value } })

  const goToNextMission = () => {
    setSelectedIndex(null)
    setReasonCode(null)
    setSheetOpen(false)
    setData({ ...data, mission: null })
  }

  const footnote = <p className="missions-footnote">못 지켜도 괜찮아요. 결과를 바탕으로 다음 미션을 추천해 드려요.</p>

  return (
    <div className="missions-page">
      <PageHeader title="미션" />

      {status === 'TOO_FEW' ? (
        <div className="missions-report">
          <p className="missions-report-label">이번 주 리포트</p>
          <p className="missions-report-headline">{report.highlight}</p>
          <p className="missions-report-sub missions-report-count">누적 기록 {cumulativeExpenseCount}건</p>
        </div>
      ) : (
        <button type="button" className="missions-report" onClick={() => navigate('/insights')}>
          <span className="missions-report-head">
            <span className="missions-report-label">이번 주 리포트</span>
            <img src={chevronRightSmall} alt="" />
          </span>
          <span className="missions-report-headline">{report.highlight}</span>
          <span className="missions-report-sub">
            후회 소비 {report.regretCount}건 · {regretChangeText(report.regretCountChange)}
            <span className="missions-report-divider">|</span>
            미션 실천율 {Math.round(report.missionCompletionRate * 100)}%
          </span>
        </button>
      )}

      {status === 'RECOMMENDED' && (
        <section className="missions-section">
          <h2 className="missions-section-title">이번 주 추천 미션</h2>
          <p className="missions-section-desc">
            하나를 골라 {MISSION_DAYS}일 동안 해 봐요 · {ACHIEVE_DAYS}일 이상 실천하면 달성이에요
          </p>
          <ul className="missions-options">
            {recommendations.map((item) => {
              const selected = item.optionIndex === selectedIndex
              return (
                <li key={item.optionIndex}>
                  <button
                    type="button"
                    className={['missions-option', selected && 'missions-option-selected'].filter(Boolean).join(' ')}
                    onClick={() => setSelectedIndex(item.optionIndex)}
                  >
                    <span className={['missions-radio', selected && 'missions-radio-on'].filter(Boolean).join(' ')} />
                    <span className="missions-option-body">
                      <span className="missions-option-meta">
                        <Tag>{levelLabel(item.level)}</Tag>
                        <span className="missions-option-pattern">{patternLabel(item.patternGroup)}</span>
                      </span>
                      <span className="missions-option-title">{item.text}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <Button fullWidth className="missions-start" disabled={selectedIndex === null} onClick={startMission}>
            미션 시작하기
          </Button>
        </section>
      )}

      {status === 'IN_PROGRESS' && (
        <section className="missions-section">
          <div className="missions-section-head">
            <h2 className="missions-section-title">진행 중인 미션</h2>
            <span className="missions-section-count">
              {mission.doneDays}/{totalDays}일
            </span>
          </div>
          <Card className="missions-mission">
            <h3 className="missions-mission-title">{mission.text}</h3>
            <p className="missions-mission-date">
              {startedOn.month}월 {startedOn.day}일 시작 · 오늘 {todayNumber}일째
            </p>

            <ol className="missions-days">
              {Array.from({ length: totalDays }, (_, i) => {
                const isToday = i === todayNumber - 1
                const earlierDone = mission.checkedToday ? mission.doneDays - 1 : mission.doneDays
                const done = isToday ? mission.checkedToday : i < earlierDone
                return (
                  <li key={i} className={['missions-day', isToday && 'missions-day-today'].filter(Boolean).join(' ')}>
                    {done ? <img src={missionDayDone} alt="" /> : <span className="missions-day-circle" />}
                    <span className="missions-day-label">{isToday ? '오늘' : `${i + 1}일`}</span>
                  </li>
                )
              })}
            </ol>
            <Button
              variant={mission.checkedToday ? 'grey' : 'primary'}
              size="medium"
              fullWidth
              className="missions-check"
              disabled={mission.checkedToday}
              onClick={checkToday}
            >
              {mission.checkedToday ? '오늘 실천 완료' : '오늘 실천 체크'}
            </Button>
            <p className="missions-check-hint">
              {mission.checkedToday
                ? '내일 다시 체크할 수 있어요'
                : `실천한 날만 눌러 주세요. ${ACHIEVE_DAYS}일 이상이면 달성이에요`}
            </p>

            {!mission.checkedToday && (
              <textarea
                className="missions-memo"
                placeholder="한 줄 경험 메모 (선택)"
                value={mission.memo ?? ''}
                onChange={(e) => writeMemo(e.target.value)}
              />
            )}
          </Card>
        </section>
      )}

      {status === 'ACHIEVED' && (
        <Card className="missions-result">
          <img className="missions-result-icon" src={missionAchieved} alt="" />
          <p className="missions-result-title">미션을 달성했어요</p>
          <p className="missions-result-sub">
            {totalDays}일 중 {mission.doneDays}일 실천했어요
          </p>
          <p className="missions-result-name">{mission.text}</p>
          <p className="missions-result-next">다음에는 한 단계 더 해 볼 미션을 추천해 드려요</p>
          <Button size="medium" fullWidth onClick={goToNextMission}>
            다음 미션 보기
          </Button>
        </Card>
      )}

      {status === 'FAILED' && (
        <Card className="missions-ended">
          <h2 className="missions-ended-title">{mission.text}</h2>
          <p className="missions-ended-sub">미션 기간이 끝났어요</p>
          <ProgressBar steps={totalDays} value={mission.doneDays} className="missions-ended-bars" />
        </Card>
      )}

      {status === 'TOO_FEW' && (
        <section className="missions-section">
          <h2 className="missions-section-title">이번 주 추천 미션</h2>
          <Card className="missions-empty">
            <p className="missions-empty-text">
              조금 더 기록해 볼까요?
              <br />
              {requiredExpenseCount}건 이상이면 맞춤 미션을 추천해 드려요.
            </p>
            <Button
              variant="light"
              size="medium"
              className="missions-empty-button"
              onClick={() => navigate('/records/new')}
            >
              기록하러 가기
            </Button>
          </Card>
        </section>
      )}

      {footnote}

      <BottomSheet open={sheetOpen} onClose={() => {}}>
        {mission && (
          <>
            <p className="missions-sheet-eyebrow">
              {totalDays}일 중 {mission.doneDays}일 실천했어요
            </p>
            <h2 className="missions-sheet-title">어떤 점이 어려웠나요?</h2>
            <p className="missions-sheet-desc">못 지켜도 괜찮아요.</p>
            <ul className="missions-reasons">
              {DIFFICULTY_REASONS.map((item) => {
                const selected = item.code === reasonCode
                return (
                  <li key={item.code}>
                    <button
                      type="button"
                      className={['missions-reason', selected && 'missions-reason-selected']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setReasonCode(item.code)}
                    >
                      <span className={['missions-radio', selected && 'missions-radio-on'].filter(Boolean).join(' ')} />
                      <span className="missions-reason-label">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <Button fullWidth className="missions-sheet-button" disabled={!reasonCode} onClick={goToNextMission}>
              선택하고 다음 미션 보기
            </Button>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
