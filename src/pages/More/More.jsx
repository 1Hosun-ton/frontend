import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AmountInput from '../../components/AmountInput/AmountInput.jsx'
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { deleteMe, getMe, logout, setWeeklyBudget } from '../../api/dolabom.js'
import { APP_VERSION } from '../../constants/app.js'
import { formatWon } from '../../utils/format.js'
import chevronRight from '../../assets/icons/chevron-right-grey.svg'
import './More.css'

export default function More() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [me, setMe] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [budgetDraft, setBudgetDraft] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let ignore = false
    getMe()
      .then((data) => !ignore && setMe(data))
      .catch((error) => {
        if (!ignore && error.code === 'UNAUTHORIZED') navigate('/login', { replace: true })
      })
    return () => {
      ignore = true
    }
  }, [navigate])

  const closeSheet = () => setSheet(null)

  const openBudgetSheet = () => {
    setBudgetDraft(me?.weeklyBudget ?? null)
    setSheet('budget')
  }

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!budgetDraft) return showToast('1원 이상 입력해 주세요')
    setBusy(true)
    try {
      const { weeklyBudget } = await setWeeklyBudget(budgetDraft)
      setMe((prev) => ({ ...prev, weeklyBudget }))
      closeSheet()
    } catch (error) {
      showToast(error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    if (busy) return
    setBusy(true)
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const handleDeleteAccount = async () => {
    if (busy) return
    setBusy(true)
    try {
      await deleteMe()
      navigate('/login', { replace: true })
    } catch (error) {
      showToast(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="more-page">
      <PageHeader title="더보기" />

      <Card tone="grey" className="more-account">
        <p className="more-account-label">내 계정</p>
        <p className="more-account-name">{me?.nickname ?? ''}</p>
        <p className="more-account-email">{me?.email ?? ''}</p>
      </Card>

      <ul className="more-menu">
        <li>
          <button type="button" className="more-menu-item" onClick={openBudgetSheet} disabled={!me}>
            <span>주간 예산</span>
            <span className="more-menu-value">
              {me?.weeklyBudget ? formatWon(me.weeklyBudget) : ''}
              <img src={chevronRight} alt="" />
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="more-menu-item" onClick={handleLogout}>
            로그아웃
          </button>
        </li>
        <li>
          <button type="button" className="more-menu-item more-menu-item-sub" onClick={() => setSheet('delete')}>
            계정 삭제
          </button>
        </li>
        <li>
          <button type="button" className="more-menu-item" onClick={() => navigate('/more/info')}>
            <span>앱 정보</span>
            <span className="more-menu-value">
              돌아봄 {APP_VERSION}
              <img src={chevronRight} alt="" />
            </span>
          </button>
        </li>
      </ul>

      <BottomSheet open={sheet === 'budget'} onClose={closeSheet} title="주간 예산 수정">
        <form className="more-sheet-form" onSubmit={handleSaveBudget} noValidate>
          <AmountInput
            value={budgetDraft}
            onChange={setBudgetDraft}
            size="md"
            autoFocus
            aria-label="주간 예산"
            className="more-budget-input"
          />
          <p className="more-sheet-help">저장하면 홈의 남은 예산에 바로 반영돼요</p>
          <Button type="submit" fullWidth className="more-sheet-actions" disabled={busy}>
            저장하기
          </Button>
        </form>
      </BottomSheet>

      <BottomSheet open={sheet === 'delete'} onClose={closeSheet} title="계정을 삭제할까요?">
        <p className="more-sheet-description">모든 기록·미션이 삭제되고 복구할 수 없어요.</p>
        <div className="more-sheet-actions more-sheet-buttons">
          <Button variant="light" fullWidth onClick={closeSheet}>
            취소
          </Button>
          <Button fullWidth onClick={handleDeleteAccount} disabled={busy}>
            삭제할게요
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
