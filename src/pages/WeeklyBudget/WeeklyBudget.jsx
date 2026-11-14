import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AmountInput from '../../components/AmountInput/AmountInput.jsx'
import Button from '../../components/Button/Button.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { setWeeklyBudget } from '../../api/dolabom.js'
import './WeeklyBudget.css'

export default function WeeklyBudget() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [budget, setBudget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!budget) return showToast('1원 이상 입력해 주세요')

    setSubmitting(true)
    try {
      await setWeeklyBudget(budget)
      navigate('/', { replace: true })
    } catch (error) {
      if (error.code === 'UNAUTHORIZED') return navigate('/login', { replace: true })
      showToast(error.message)
      setSubmitting(false)
    }
  }

  return (
    <form className="weekly-budget-page" onSubmit={handleSubmit} noValidate>
      <h1 className="weekly-budget-title">
        이번 주에 쓸 수 있는 금액을
        <br />
        알려 주세요
      </h1>

      <p className="weekly-budget-label">주간 예산</p>
      <AmountInput value={budget} onChange={setBudget} autoFocus aria-label="주간 예산" />
      <p className="weekly-budget-help">매주 같은 금액으로 이어져요</p>

      <Button type="submit" fullWidth className="weekly-budget-submit" disabled={submitting}>
        시작하기
      </Button>
    </form>
  )
}
