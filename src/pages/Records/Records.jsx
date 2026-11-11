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
import { itemLabel } from './recordCategories.js'
import { fetchMockRecords, MOCK_TODAY } from './recordsMock.js'
import './Records.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { month: m, day: d, weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()] }
}

export default function Records() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [view, setView] = useState({ year: MOCK_TODAY.getFullYear(), month: MOCK_TODAY.getMonth() + 1 })
  const [data, setData] = useState(() => fetchMockRecords(view.year, view.month))
  const [deleteTarget, setDeleteTarget] = useState(null)
  const isCurrentMonth = view.year === MOCK_TODAY.getFullYear() && view.month === MOCK_TODAY.getMonth() + 1

  const moveMonth = (delta) => {
    const next = new Date(view.year, view.month - 1 + delta, 1)
    const nextView = { year: next.getFullYear(), month: next.getMonth() + 1 }
    setView(nextView)
    setData(fetchMockRecords(nextView.year, nextView.month))
  }

  const { summary, expenses } = data

  // 날짜별로 묶기. 날짜 옆 그날 합계는 응답에 없어서 여기서 더한다
  // 같은 날이 떨어져 오면 묶음이 쪼개져서, 묶기 전에 최신순으로 한 번 정렬한다
  const groups = []
  const sorted = [...expenses].sort((a, b) => (a.spentAt < b.spentAt ? 1 : a.spentAt > b.spentAt ? -1 : 0))
  sorted.forEach((expense) => {
    const last = groups[groups.length - 1]
    if (last && last.date === expense.spentAt) last.items.push(expense)
    else groups.push({ date: expense.spentAt, items: [expense] })
  })
  const dayTotal = (items) => items.reduce((sum, e) => sum + e.amount, 0)

  const confirmDelete = () => {
    // 실제 API에서는 DELETE 후 목록을 다시 불러온다. 지금은 목록에서만 뺀다
    setData({ ...data, expenses: expenses.filter((e) => e.expenseId !== deleteTarget.expenseId) })
    setDeleteTarget(null)
    showToast('기록을 삭제했어요')
  }

  const target = deleteTarget && parseDate(deleteTarget.spentAt)

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
          {summary && (
            <Card tone="grey" className="records-summary">
              <p className="records-summary-label">{view.month}월 총 소비</p>
              <p className="records-summary-total">{summary.totalAmount.toLocaleString()}원</p>
              <p className="records-summary-average">
                주간 평균 {summary.weeklyAverage.toLocaleString()}원 · 하루 평균{' '}
                {summary.dailyAverage.toLocaleString()}원
              </p>
            </Card>
          )}

          {groups.map((group) => {
            const { month, day, weekday } = parseDate(group.date)
            return (
              <section key={group.date} className="records-group">
                <div className="records-group-header">
                  <span>
                    {month}월 {day}일 ({weekday})
                  </span>
                  <span>{dayTotal(group.items).toLocaleString()}원</span>
                </div>
                <ul className="records-list">
                  {group.items.map((expense) => (
                    <RecordItem key={expense.expenseId} record={expense} onDelete={() => setDeleteTarget(expense)} />
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
              {itemLabel(deleteTarget.item)} · {deleteTarget.amount.toLocaleString()}원 · {target.month}월{' '}
              {target.day}일
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
