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
import { itemLabel, reasonLabel } from '../Records/recordCategories.js'
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
 월간은 그 달 1일, 주간은 이 화면이 쓰는 '몇째 주' 셈법대로 (주차-1)*7+1 일이다.
 돌려받은 period.startDate/endDate가 실제 기준이므로 그래프와 목록은 그 값을 쓴다.
*/
const toPeriodStart = (period, { year, month, week }) =>
  period === 'week' ? `${year}-${pad(month)}-${pad((week - 1) * 7 + 1)}` : `${year}-${pad(month)}-01`

const weeksInMonth = (year, month) => Math.ceil(new Date(year, month, 0).getDate() / 7)

const parseDate = (text) => {
  const [y, m, d] = text.split('-').map(Number)
  return { date: new Date(y, m - 1, d), month: m, day: d }
}

// 아래 칸 이름. 주간은 요일, 월간은 날짜가 속한 주차
const toLabel = (text, isWeekly) => {
  const { date, day } = parseDate(text)
  return isWeekly ? WEEKDAYS[date.getDay()] : `${Math.ceil(day / 7)}주`
}

// trend는 지난 기간과 이번 기간이 한 배열로 온다. period.startDate를 기준으로 두 줄로 나눈다
function toTrendChart(trend, period) {
  const previous = trend.filter((point) => point.date < period.startDate)
  const current = trend.filter((point) => point.date >= period.startDate)
  const longer = previous.length >= current.length ? previous : current
  const isWeekly = period.type === 'WEEK'
  return {
    labels: longer.map((point) => toLabel(point.date, isWeekly)),
    current: current.map((point) => point.amount),
    previous: previous.map((point) => point.amount),
    currentLabel: isWeekly ? '이번 주' : '이번 달',
    previousLabel: isWeekly ? '지난주' : '지난달',
  }
}

// 소비 기록 응답을 그대로 쓰면서 메모만 "11월 18일 · 메모"로 바꾼다
function toEvidenceRecord(expense) {
  const { month, day } = parseDate(expense.spentAt)
  return { ...expense, memo: `${month}월 ${day}일${expense.memo ? ` · ${expense.memo}` : ''}` }
}

// S6 인사이트 화면. 월간/주간 · 분석 결과 · 패턴 없음 · 기록 부족 · 분석 중 · 근거 기록 시트
export default function Insights() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')
  const [view, setView] = useState({
    year: TODAY.getFullYear(),
    month: TODAY.getMonth() + 1,
    week: Math.ceil(TODAY.getDate() / 7),
  })
  const [evidenceOpen, setEvidenceOpen] = useState(false)

  const isWeek = period === 'week'
  const isCurrent =
    view.year === TODAY.getFullYear() &&
    view.month === TODAY.getMonth() + 1 &&
    (!isWeek || view.week === Math.ceil(TODAY.getDate() / 7))

  // 기간이 바뀌면 다시 조회한다. 응답이 오기 전까지는 분석 중 화면을 보여 준다
  const load = useCallback(
    () => getInsights({ periodType: isWeek ? 'WEEK' : 'MONTH', periodStart: toPeriodStart(period, view) }),
    [isWeek, period, view],
  )
  const { data, error, reload } = useApiData(load)

  const moveMonth = (delta) => {
    const next = new Date(view.year, view.month - 1 + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() + 1, week: 1 })
  }

  const moveWeek = (delta) => {
    const week = view.week + delta
    if (week < 1) {
      const prev = new Date(view.year, view.month - 2, 1)
      const year = prev.getFullYear()
      const month = prev.getMonth() + 1
      setView({ year, month, week: weeksInMonth(year, month) })
    } else if (week > weeksInMonth(view.year, view.month)) {
      const next = new Date(view.year, view.month, 1)
      setView({ year: next.getFullYear(), month: next.getMonth() + 1, week: 1 })
    } else {
      setView({ ...view, week })
    }
  }

  const periodName = isWeek ? '이번 주' : '이번 달'
  const keyInsight = data?.keyInsight
  const trend = data?.trend?.length ? toTrendChart(data.trend, data.period) : null
  // 시안처럼 비중이 큰 순서로 보여 준다 (응답 순서는 섞여 올 수 있다)
  const reasons = data ? [...data.reasonBreakdown].sort((a, b) => b.ratio - a.ratio) : []
  /*
   근거 기록만 주는 엔드포인트가 없어서, 소비 기록을 이유와 기간으로 걸러서 쓴다.
   시트를 열 때만 불러온다.
  */
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
          label={isWeek ? `${view.month}월 ${view.week}주차` : `${view.month}월`}
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

      {/* 이 기간에 기록이 없는 상태. 시안에 없어서 기록 부족 화면을 따라 만들었다 */}
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
