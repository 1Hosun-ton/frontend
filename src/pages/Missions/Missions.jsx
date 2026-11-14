import { useEffect, useState } from 'react'
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
import { useToast } from '../../components/Toast/useToast.js'
import {
  checkMissionToday,
  getMissionsOverview,
  setMissionDifficulty,
  startMission as startMissionApi,
} from '../../api/dolabom.js'
import { useApiData } from '../../api/useApiData.js'
import { fromDateString, todayString } from '../../utils/date.js'
import { ACHIEVE_DAYS, DIFFICULTY_REASONS, levelLabel, MISSION_DAYS, patternLabel } from './missionConstants.js'
import './Missions.css'

const DAY_MS = 24 * 60 * 60 * 1000

/*
 날짜만 센다. new Date()를 그대로 쓰면 지금 시각이 섞여서,
 낮 12시를 넘긴 뒤에는 하루 치가 반올림되어 '오늘 2일째'로 밀린다.
*/
const TODAY = fromDateString(todayString())

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
  const showToast = useToast()
  const { data, error, loading, reload } = useApiData(getMissionsOverview)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [reasonCode, setReasonCode] = useState(null)
  // 체크를 누를 때 함께 보내는 메모. 아직 보내지 않은 초고라서 화면에만 둔다
  const [memo, setMemo] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // 지난 미션 사유를 아직 안 남겼으면(feedbackRequired) 시트를 띄운다
  const feedbackRequired = Boolean(data?.mission?.feedbackRequired)
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSheetOpen(feedbackRequired)
  }, [feedbackRequired])

  if (loading || error) {
    return (
      <div className="missions-page">
        <PageHeader title="미션" />
        <div className="missions-state">
          <p className="missions-state-message">{error ? error.message : '미션을 불러오고 있어요'}</p>
          {error && (
            <Button variant="light" size="medium" onClick={reload}>
              다시 시도
            </Button>
          )}
        </div>
      </div>
    )
  }

  const { cumulativeExpenseCount, requiredExpenseCount, report, recommendationSetId, recommendations, mission } = data

  const tooFew = cumulativeExpenseCount < requiredExpenseCount
  const status = tooFew ? 'TOO_FEW' : (mission?.status ?? 'RECOMMENDED')

  const startedOn = mission ? parseDate(mission.startedOn) : null
  const totalDays = mission ? diffDays(startedOn.date, parseDate(mission.endsOn).date) + 1 : MISSION_DAYS
  const todayNumber = mission ? diffDays(startedOn.date, TODAY) + 1 : 0

  // 서버에 보내고, 끝나면 미션 탭을 다시 불러온다. 실패하면 서버 문구를 토스트로 보여 준다
  const run = async (task) => {
    setBusy(true)
    try {
      await task()
      reload()
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusy(false)
    }
  }

  const startMission = () =>
    run(async () => {
      await startMissionApi({ recommendationSetId, optionIndex: selectedIndex })
      setSelectedIndex(null)
    })

  const checkToday = () =>
    run(async () => {
      await checkMissionToday(mission.missionId, memo || undefined)
      setMemo('')
    })

  // 달성 카드에서는 사유 없이, 시트에서는 고른 사유와 함께 다음 미션으로 넘어간다
  const goToNextMission = () =>
    run(async () => {
      if (reasonCode) await setMissionDifficulty(mission.missionId, reasonCode)
      setReasonCode(null)
      setSheetOpen(false)
    })

  const footnote = <p className="missions-footnote">못 지켜도 괜찮아요. 결과를 바탕으로 다음 미션을 추천해 드려요.</p>

  return (
    <div className="missions-page">
      <PageHeader title="미션" />

      {report &&
        (status === 'TOO_FEW' ? (
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
            {/* 서버가 퍼센트 값으로 준다 (예: 14.29 = 14%) */}
            미션 실천율 {Math.round(report.missionCompletionRate)}%
          </span>
        </button>
        ))}

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
          <Button fullWidth className="missions-start" disabled={selectedIndex === null || busy} onClick={startMission}>
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
              disabled={mission.checkedToday || busy}
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
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
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
          <Button size="medium" fullWidth disabled={busy} onClick={goToNextMission}>
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
            <Button fullWidth className="missions-sheet-button" disabled={!reasonCode || busy} onClick={goToNextMission}>
              선택하고 다음 미션 보기
            </Button>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
