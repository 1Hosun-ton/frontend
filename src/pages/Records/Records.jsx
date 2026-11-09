import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import PeriodSwitcher from '../../components/PeriodSwitcher/PeriodSwitcher.jsx'
import RecordItem from '../../components/RecordItem/RecordItem.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import emptyRecord from '../../assets/icons/empty-record.svg'
import { RECORD_CATEGORIES } from './recordCategories.js'
import { fetchMockRecords, MOCK_TODAY } from './recordsMock.js'
import './Records.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const pad = (n) => String(n).padStart(2, '0')
const sumAmount = (list) => list.reduce((sum, r) => sum + r.amount, 0)
const toMonthKey = ({ year, month }) => `${year}-${pad(month)}`

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { month: m, day: d, weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()] }
}

export default function Records() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [view, setView] = useState({ year: MOCK_TODAY.getFullYear(), month: MOCK_TODAY.getMonth() + 1 })
  const [records, setRecords] = useState(() => fetchMockRecords(toMonthKey(view)))
  const [deleteTarget, setDeleteTarget] = useState(null)
  const isCurrentMonth = view.year === MOCK_TODAY.getFullYear() && view.month === MOCK_TODAY.getMonth() + 1

  const moveMonth = (delta) => {
    const next = new Date(view.year, view.month - 1 + delta, 1)
    const nextView = { year: next.getFullYear(), month: next.getMonth() + 1 }
    setView(nextView)
    setRecords(fetchMockRecords(toMonthKey(nextView)))
  }

  // 날짜별로 묶기
  const groups = []
  records.forEach((record) => {
    const last = groups[groups.length - 1]
    if (last && last.date === record.date) last.items.push(record)
    else groups.push({ date: record.date, items: [record] })
  })

  const total = sumAmount(records)
  const elapsedDays = isCurrentMonth ? MOCK_TODAY.getDate() : new Date(view.year, view.month, 0).getDate()
  const dailyAverage = Math.round(total / elapsedDays)
  const weeklyAverage = Math.round((total / elapsedDays) * 7)

  const confirmDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast('기록을 삭제했어요')
  }

  const target = deleteTarget && { ...parseDate(deleteTarget.date), ...RECORD_CATEGORIES[deleteTarget.category] }

  return (
    <div className="records-page">
      <PageHeader title="기록" />
      <div className="records-period">
        <PeriodSwitcher
          label={`${view.month}월`}
          onPrev={() => moveMonth(-1)}
          onNext={() => moveMonth(1)}
          nextDisabled={isCurrentMonth}
        />
      </div>

      {groups.length === 0 ? (
        <div className="records-empty">
          <img className="records-empty-illustration" src={emptyRecord} alt="" />
          <p className="records-empty-message">
            이 달에는 기록이 없어요.
            <br />첫 소비를 기록해 볼까요?
          </p>
          <Button variant="light" size="medium" className="records-empty-button" onClick={() => navigate('/records/new')}>
            소비 기록하기
          </Button>
        </div>
      ) : (
        <>
          <Card tone="grey" className="records-summary">
            <p className="records-summary-label">{view.month}월 총 소비</p>
            <p className="records-summary-total">{total.toLocaleString()}원</p>
            <p className="records-summary-average">
              주간 평균 {weeklyAverage.toLocaleString()}원 · 하루 평균 {dailyAverage.toLocaleString()}원
            </p>
          </Card>

          {groups.map((group) => {
            const { month, day, weekday } = parseDate(group.date)
            return (
              <section key={group.date} className="records-group">
                <div className="records-group-header">
                  <span>
                    {month}월 {day}일 ({weekday})
                  </span>
                  <span>{sumAmount(group.items).toLocaleString()}원</span>
                </div>
                <ul className="records-list">
                  {group.items.map((record) => (
                    <RecordItem key={record.id} record={record} onDelete={() => setDeleteTarget(record)} />
                  ))}
                </ul>
              </section>
            )
          })}

          <div className="records-action-bar">
            <Button fullWidth onClick={() => navigate('/records/new')}>
              + 소비 기록하기
            </Button>
          </div>
        </>
      )}

      <BottomSheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="이 기록을 삭제할까요?">
        {target && (
          <>
            <p className="records-sheet-description">
              삭제하면 복구할 수 없어요.
              <br />
              잘못 입력했다면 삭제 후 다시 기록해 주세요.
            </p>
            <p className="records-sheet-target">
              {target.name} · {deleteTarget.amount.toLocaleString()}원 · {target.month}월 {target.day}일
            </p>
            <div className="records-sheet-actions">
              <Button variant="light" onClick={() => setDeleteTarget(null)}>
                취소
              </Button>
              <Button onClick={confirmDelete}>삭제할게요</Button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
