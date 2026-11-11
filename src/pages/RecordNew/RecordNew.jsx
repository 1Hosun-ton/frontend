import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AmountInput from '../../components/AmountInput/AmountInput.jsx'
import Button from '../../components/Button/Button.jsx'
import Chip from '../../components/Chip/Chip.jsx'
import TextField from '../../components/TextField/TextField.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { createExpense } from '../../api/mock.js'
import { EXPENSE_ITEMS, EXPENSE_MOODS, EXPENSE_REASONS } from '../../constants/expense.js'
import { dateFieldLabel, todayString } from '../../utils/date.js'
import chevronRight from '../../assets/icons/chevron-right-grey.svg'
import './RecordNew.css'

const QUICK_AMOUNTS = [
  { label: '+1만', value: 10000 },
  { label: '+5천', value: 5000 },
  { label: '+1천', value: 1000 },
]

// S4 소비 기록 입력 화면
export default function RecordNew() {
  const navigate = useNavigate()
  const showToast = useToast()
  const dateInputRef = useRef(null)
  const [amount, setAmount] = useState(null)
  const [amountFocused, setAmountFocused] = useState(false)
  const [item, setItem] = useState('FOOD')
  const [spentAt, setSpentAt] = useState(todayString())
  const [reason, setReason] = useState(null)
  const [regret, setRegret] = useState(null)
  const [mood, setMood] = useState(null)
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const addAmount = (value) => setAmount((prev) => (prev ?? 0) + value)

  // 빠른 금액 칩을 바로 숨기면 화면이 밀려 다른 칩이 눌려서 조금 늦게 숨긴다
  const blurTimer = useRef(null)
  const handleAmountFocus = () => {
    clearTimeout(blurTimer.current)
    setAmountFocused(true)
  }
  const handleAmountBlur = () => {
    blurTimer.current = setTimeout(() => setAmountFocused(false), 200)
  }
  useEffect(() => () => clearTimeout(blurTimer.current), [])

  const openDatePicker = () => {
    const input = dateInputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') input.showPicker()
    else input.click()
  }

  const handleDateChange = (e) => {
    const value = e.target.value
    if (value && value <= todayString()) setSpentAt(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!amount) return showToast('금액을 입력해 주세요')
    if (!reason || regret === null) return showToast('이유와 후회 여부를 선택해 주세요')

    setSubmitting(true)
    try {
      await createExpense({ amount, item, spentAt, reason, regret, mood, memo })
      // 홈 화면 플로팅 버튼 위 위치
      showToast('오늘의 기록 완료!', { bottom: '9.75rem' })
      navigate('/', { replace: true })
    } catch (error) {
      if (error.code === 'UNAUTHORIZED') return navigate('/login', { replace: true })
      showToast(error.message)
      setSubmitting(false)
    }
  }

  return (
    <form className="record-new-page" onSubmit={handleSubmit} noValidate>
      <header className="record-new-header">
        <h1 className="record-new-title">소비 기록</h1>
        <button type="button" className="record-new-close" onClick={() => navigate(-1)}>
          닫기
        </button>
      </header>

      <section className="record-new-amount">
        <p className="record-new-amount-label">얼마를 썼나요?</p>
        <AmountInput
          value={amount}
          onChange={setAmount}
          autoFocus
          aria-label="금액"
          onFocus={handleAmountFocus}
          onBlur={handleAmountBlur}
        />
        {amountFocused && (
          <div className="record-new-chips record-new-quick">
            {QUICK_AMOUNTS.map((quick) => (
              <Chip
                key={quick.label}
                // 누르는 동안 금액 칸 포커스를 유지한다
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addAmount(quick.value)}
              >
                {quick.label}
              </Chip>
            ))}
          </div>
        )}
      </section>

      <section className="record-new-section">
        <h2 className="record-new-label">항목</h2>
        <div className="record-new-chips">
          {EXPENSE_ITEMS.map((option) => (
            <Chip key={option.value} selected={item === option.value} onClick={() => setItem(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="record-new-section">
        <h2 className="record-new-label">날짜</h2>
        <div className="record-new-date">
          <button type="button" className="record-new-date-button" onClick={openDatePicker}>
            {dateFieldLabel(spentAt)}
            <img src={chevronRight} alt="" />
          </button>
          <input
            ref={dateInputRef}
            className="record-new-date-input"
            type="date"
            max={todayString()}
            value={spentAt}
            onChange={handleDateChange}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="record-new-section">
        <h2 className="record-new-label">소비 이유</h2>
        <div className="record-new-chips">
          {EXPENSE_REASONS.map((option) => (
            <Chip key={option.value} selected={reason === option.value} onClick={() => setReason(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="record-new-section">
        <h2 className="record-new-label">후회 여부</h2>
        <div className="record-new-regret">
          <button
            type="button"
            className={`record-new-regret-option${regret === true ? ' record-new-regret-yes' : ''}`}
            onClick={() => setRegret(true)}
            aria-pressed={regret === true}
          >
            후회돼요
          </button>
          <button
            type="button"
            className={`record-new-regret-option${regret === false ? ' record-new-regret-no' : ''}`}
            onClick={() => setRegret(false)}
            aria-pressed={regret === false}
          >
            괜찮아요
          </button>
        </div>
      </section>

      <section className="record-new-section">
        <h2 className="record-new-label">기분 (선택)</h2>
        <div className="record-new-chips">
          {EXPENSE_MOODS.map((option) => (
            <Chip
              key={option.value}
              selected={mood === option.value}
              onClick={() => setMood((prev) => (prev === option.value ? null : option.value))}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="record-new-section">
        <TextField
          label="한 줄 메모 (선택)"
          placeholder="한 줄로 남겨 두면 나중에 돌아보기 쉬워요"
          maxLength={100}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </section>

      <Button type="submit" fullWidth className="record-new-submit" disabled={submitting}>
        저장하기
      </Button>
    </form>
  )
}
