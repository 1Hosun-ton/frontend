import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import PeriodSwitcher from '../../components/PeriodSwitcher/PeriodSwitcher.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import RecordItem from '../../components/RecordItem/RecordItem.jsx'
import chevronRightSmall from '../../assets/icons/chevron-right-small.svg'
import coachCharacter from '../../assets/icons/coach-character.png'
import spinner from '../../assets/icons/spinner.svg'
import { itemLabel, reasonLabel } from '../../constants/expense.js'
import { startOfWeek, toDateString, todayString } from '../../utils/date.js'
import { getExpenses, getInsights, INSIGHT_STATUS as STATUS } from '../../api/dolabom.js'
import { useApiData } from '../../api/useApiData.js'
import ReasonDonut from './ReasonDonut.jsx'
import { chartColor } from './chartColor.js'
import TrendChart from './TrendChart.jsx'
import './Insights.css'

const PERIODS = [
  { key: 'week', label: '주간' },
  { key: 'month', label: '월간' },
]
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = new Date()
const pad = (n) => String(n).padStart(2, '0')

/*
 서버에는 기간 시작 날짜로 물어본다.
 스웨거: "주간은 월요일, 월간은 1일이어야 하며 미래 기간은 조회할 수 없습니다."
 그래서 주간은 주차 번호로 셈하지 않고 그 주 월요일 날짜를 그대로 들고 다닌다.
 돌려받은 period.startDate/endDate가 실제 기준이므로 그래프와 목록은 그 값을 쓴다.
*/
const addDays = (date, days) => {
  const moved = new Date(date)
  moved.setDate(moved.getDate() + days)
  return moved
}

// 화면에 쓰는 '몇째 주'. 그 달의 몇 번째 월요일인지로 센다
const weekOfMonth = (monday) => Math.ceil(monday.getDate() / 7)

const THIS_MONDAY = startOfWeek(TODAY)

const parseDate = (text) => {
  const [y, m, d] = text.split('-').map(Number)
  return { date: new Date(y, m - 1, d), month: m, day: d }
}

/*
 아래 칸 이름.
 주간은 하루에 한 점씩 오므로 요일을 쓴다.
 월간은 주마다 한 점씩, 그 주가 시작하는 날짜로 온다. 그래서 날짜가 아니라 온 순서대로 센다.
 날짜에서 ceil(일/7)로 세면 안 된다. 서버의 주는 월요일에 시작해서, 1일이 월요일이 아닌 달은
 1일과 첫 월요일이 둘 다 '1주'가 되어 칸 이름이 겹친다. (2026년 11월은 1일이 일요일이라 6주로 온다)
*/
const toLabels = (points, isWeekly) =>
  isWeekly
    ? points.map((point) => WEEKDAYS[parseDate(point.date).date.getDay()])
    : points.map((_, index) => `${index + 1}주`)

/*
 trend는 지난 기간과 이번 기간이 한 배열에 담겨 온다. period.startDate를 기준으로 나눠서 두 줄로 그린다.
 칸 이름은 점이 더 많은 쪽을 따른다. 이번 기간은 아직 끝나지 않아 지난 기간보다 짧다.
*/
function toTrendChart(trend, period) {
  const isWeekly = period.type === 'WEEK'
  /*
   아직 오지 않은 주·날도 금액 0으로 함께 온다. 그대로 그리면 선이 남은 기간 동안 바닥으로 떨어진다.
   시작 날짜가 오늘보다 뒤인 칸은 아직 오지 않은 칸이라 뺀다. 지난 기간은 전부 지나갔으므로 그대로 남는다.
  */
  const arrived = trend.filter((point) => point.date <= todayString())
  const previous = arrived.filter((point) => point.date < period.startDate)
  const current = arrived.filter((point) => point.date >= period.startDate)
  const longer = previous.length >= current.length ? previous : current
  return {
    labels: toLabels(longer, isWeekly),
    current: current.map((point) => point.amount),
    previous: previous.map((point) => point.amount),
    currentLabel: isWeekly ? '이번 주' : '이번 달',
    previousLabel: isWeekly ? '지난주' : '지난달',
  }
}

function toEvidenceRecord(expense) {
  const { month, day } = parseDate(expense.spentAt)
  return { ...expense, memo: `${month}월 ${day}일${expense.memo ? ` · ${expense.memo}` : ''}` }
}

export default function Insights() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')
  const [view, setView] = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() + 1 })
  // 주간은 달·주차로는 월요일을 집어낼 수 없어서 월요일 날짜 자체를 들고 있는다
  const [weekStart, setWeekStart] = useState(THIS_MONDAY)
  const [evidenceOpen, setEvidenceOpen] = useState(false)

  const isWeek = period === 'week'
  // 다음으로 넘어갈 수 없는 자리(미래 기간은 서버가 막는다)
  const isCurrent = isWeek
    ? weekStart.getTime() === THIS_MONDAY.getTime()
    : view.year === TODAY.getFullYear() && view.month === TODAY.getMonth() + 1

  const periodStart = isWeek ? toDateString(weekStart) : `${view.year}-${pad(view.month)}-01`

  // 기간이 바뀌면 다시 조회한다. 응답이 오기 전까지는 분석 중 화면을 보여 준다
  const load = useCallback(
    () => getInsights({ periodType: isWeek ? 'WEEK' : 'MONTH', periodStart }),
    [isWeek, periodStart],
  )
  const { data, error, reload } = useApiData(load)

  const moveMonth = (delta) => {
    const next = new Date(view.year, view.month - 1 + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() + 1 })
  }

  // 7일씩 움직이면 달·해 넘김은 저절로 맞는다
  const moveWeek = (delta) => setWeekStart((prev) => addDays(prev, delta * 7))

  const periodName = isWeek ? '이번 주' : '이번 달'
  const keyInsight = data?.keyInsight
  const trend = data?.trend?.length ? toTrendChart(data.trend, data.period) : null
  const reasons = data ? [...data.reasonBreakdown].sort((a, b) => b.ratio - a.ratio) : []
  const [evidence, setEvidence] = useState({ records: [], loading: false, error: null })
  useEffect(() => {
    if (!evidenceOpen || !keyInsight) return
    let alive = true
    // oxlint-disable-next-line react/set-state-in-effect
    setEvidence({ records: [], loading: true, error: null })
    getExpenses({
      reason: keyInsight.evidence.reason,
      from: data.period.startDate,
      to: data.period.endDate,
    })
      .then((res) => alive && setEvidence({ records: res.expenses ?? [], loading: false, error: null }))
      .catch((err) => alive && setEvidence({ records: [], loading: false, error: err }))
    return () => {
      alive = false
    }
  }, [evidenceOpen, keyInsight, data?.period.startDate, data?.period.endDate])

  return (
    <div className="insights-page">
      <PageHeader title="인사이트" />

      <div className="insights-tabs" role="tablist">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={period === key}
            className={`insights-tab${period === key ? ' insights-tab-active' : ''}`}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="insights-period">
        <PeriodSwitcher
          label={isWeek ? `${weekStart.getMonth() + 1}월 ${weekOfMonth(weekStart)}주차` : `${view.month}월`}
          onPrev={() => (isWeek ? moveWeek(-1) : moveMonth(-1))}
          onNext={() => (isWeek ? moveWeek(1) : moveMonth(1))}
          nextDisabled={isCurrent}
        />
      </div>

      {error && (
        <div className="insights-empty">
          <p className="insights-empty-message">{error.message}</p>
          <Button variant="light" size="medium" className="insights-empty-button" onClick={reload}>
            다시 시도
          </Button>
        </div>
      )}

      {!data && !error && (
        <>
          <Card className="insights-card" aria-busy="true">
            <div className="insights-skeleton insights-skeleton-label" />
            <div className="insights-skeleton insights-skeleton-line" />
            <div className="insights-skeleton insights-skeleton-line insights-skeleton-line-short" />
            <div className="insights-loading">
              <img className="insights-loading-spinner" src={spinner} alt="" />
              <p className="insights-loading-text">소비 패턴을 분석하고 있어요</p>
            </div>
          </Card>
          <Card className="insights-card">
            <div className="insights-skeleton insights-skeleton-title" />
            <div className="insights-reasons">
              <div className="insights-skeleton insights-skeleton-donut" />
              <div className="insights-skeleton-legend">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="insights-skeleton insights-skeleton-legend-row" />
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {data?.status === STATUS.insufficient && (
        <div className="insights-empty">
          <img className="insights-empty-character" src={coachCharacter} alt="" />
          <p className="insights-empty-message">
            조금 더 기록하면 나만의 소비 패턴을
            <br />
            분석해 드릴게요.
          </p>
          <p className="insights-empty-count">
            현재 {data.cumulativeExpenseCount}건 / {data.requiredExpenseCount}건 필요
          </p>
          <ProgressBar
            className="insights-empty-progress"
            value={data.cumulativeExpenseCount}
            max={data.requiredExpenseCount}
          />
          <Button variant="light" size="medium" className="insights-empty-button" onClick={() => navigate('/records/new')}>
            기록하러 가기
          </Button>
        </div>
      )}

      {data?.status === STATUS.noExpenses && (
        <div className="insights-empty">
          <img className="insights-empty-character" src={coachCharacter} alt="" />
          <p className="insights-empty-message">
            {isWeek ? '이 주에는' : '이 달에는'} 기록이 없어요.
            <br />
            기록을 남기면 분석해 드릴게요.
          </p>
          <Button variant="light" size="medium" className="insights-empty-button" onClick={() => navigate('/records/new')}>
            기록하러 가기
          </Button>
        </div>
      )}

      {(data?.status === STATUS.ready || data?.status === STATUS.noPattern) && (
        <>
          <Card className="insights-card">
            <div className="insights-key-header">
              <p className="insights-key-label">{periodName} 핵심 인사이트</p>
              {keyInsight && (
                <button type="button" className="insights-evidence-button" onClick={() => setEvidenceOpen(true)}>
                  근거 기록
                  <img src={chevronRightSmall} alt="" />
                </button>
              )}
            </div>

            {keyInsight ? (
              <>
                <p className="insights-key-text">{keyInsight.message}</p>
                <p className="insights-key-evidence">
                  근거: {reasonLabel(keyInsight.evidence.reason)} {keyInsight.evidence.reasonCount}건 ·{' '}
                  {itemLabel(keyInsight.evidence.item)} {keyInsight.evidence.itemAmount.toLocaleString()}원
                </p>
                {trend && trend.labels.length > 1 && <TrendChart {...trend} />}
              </>
            ) : (
              <p className="insights-key-text insights-key-text-single">아직 뚜렷한 패턴은 보이지 않아요</p>
            )}
          </Card>

          <Card className="insights-card">
            <h2 className="insights-card-title">이유별 비중</h2>
            <div className="insights-reasons">
              <ReasonDonut items={reasons.map(({ reason, ratio }) => ({ name: reason, percent: ratio }))} />
              <ul className="insights-legend">
                {reasons.map(({ reason, ratio }, i) => (
                  <li key={reason} className="insights-legend-row">
                    <i className="insights-legend-dot" style={{ background: chartColor(i) }} />
                    <span className="insights-legend-name">{reasonLabel(reason)}</span>
                    <span className="insights-legend-percent">{Math.round(ratio)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            {data.comparisonMessage && <p className="insights-note">{data.comparisonMessage}</p>}
            <p className="insights-note">후회한 소비 {data.regretCount}건</p>
          </Card>

          {data.suggestion && (
            <Card className="insights-card">
              <h2 className="insights-card-title">지금은 이런 게 필요해요</h2>
              <p className="insights-suggestion">{data.suggestion}</p>
              <Button variant="outline" size="small" fullWidth onClick={() => navigate('/missions')}>
                이 습관에 맞는 미션 보기
              </Button>
            </Card>
          )}

          {keyInsight && (
            <BottomSheet
              open={evidenceOpen}
              onClose={() => setEvidenceOpen(false)}
              title={`근거가 된 기록 ${keyInsight.evidence.reasonCount}건`}
            >
              <p className="insights-sheet-subtitle">
                {reasonLabel(keyInsight.evidence.reason)} · {itemLabel(keyInsight.evidence.item)} · {view.month}월
              </p>
              {evidence.loading && <p className="insights-note">기록을 불러오고 있어요</p>}
              {evidence.error && <p className="insights-note">{evidence.error.message}</p>}
              <ul className="insights-evidence-list">
                {evidence.records.map((record) => (
                  <RecordItem key={record.expenseId} record={toEvidenceRecord(record)} />
                ))}
              </ul>
              <Button variant="light" fullWidth className="insights-sheet-close" onClick={() => setEvidenceOpen(false)}>
                닫기
              </Button>
            </BottomSheet>
          )}
        </>
      )}
    </div>
  )
}
