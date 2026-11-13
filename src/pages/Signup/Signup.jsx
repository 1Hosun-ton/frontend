import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button.jsx'
import TextField from '../../components/TextField/TextField.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { signup } from '../../api/index.js'
import backIcon from '../../assets/icons/back.svg'
import checkIcon from '../../assets/icons/check-circle.svg'
import checkIconActive from '../../assets/icons/check-circle-active.svg'
import checkLargeIcon from '../../assets/icons/check-circle-large.svg'
import checkLargeIconActive from '../../assets/icons/check-circle-large-active.svg'
import './Signup.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TERMS = [
  { key: 'service', label: '[필수] 이용약관 동의' },
  { key: 'privacy', label: '[필수] 개인정보 수집·이용 동의' },
]

function validate({ nickname, email, password, passwordConfirm, agreed }) {
  if (!nickname.trim()) return '닉네임을 입력해 주세요'
  if (!EMAIL_PATTERN.test(email.trim())) return '이메일 형식이 아니에요'
  if (password.length < 6 || password.length > 64) return '비밀번호는 6~64자로 입력해 주세요'
  if (password !== passwordConfirm) return '비밀번호가 서로 달라요'
  if (!TERMS.every((term) => agreed[term.key])) return '필수 약관에 동의해 주세요'
  return null
}

// S1 회원가입 화면
export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [agreed, setAgreed] = useState({ service: false, privacy: false })
  const [submitting, setSubmitting] = useState(false)

  const allAgreed = TERMS.every((term) => agreed[term.key])

  const toggleAll = () => {
    const next = !allAgreed
    setAgreed({ service: next, privacy: next })
  }

  const toggleTerm = (key) => setAgreed((prev) => ({ ...prev, [key]: !prev[key] }))

  const goBack = () => navigate('/login', { replace: true, state: { email } })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const message = validate({ nickname, email, password, passwordConfirm, agreed })
    if (message) return showToast(message)

    setSubmitting(true)
    try {
      // 약관 동의 값은 서버로 보내지 않는다
      await signup({ nickname, email, password })
      navigate('/budget', { replace: true })
    } catch (error) {
      showToast(error.message)
      setSubmitting(false)
    }
  }

  return (
    <form className="signup-page" onSubmit={handleSubmit} noValidate>
      <header className="signup-header">
        <button type="button" className="signup-back" onClick={goBack} aria-label="뒤로">
          <img src={backIcon} alt="" />
        </button>
        <h1 className="signup-title">회원가입</h1>
      </header>

      <div className="signup-fields">
        <TextField
          label="닉네임"
          placeholder="돌아봄에서 불릴 이름 (20자까지)"
          maxLength={20}
          autoComplete="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <TextField
          label="이메일"
          type="email"
          placeholder="이메일 주소"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="비밀번호"
          type="password"
          placeholder="6자 이상"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 한 번 더 입력해 주세요"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>

      <div className="signup-terms">
        <button type="button" className="signup-terms-all" onClick={toggleAll} aria-pressed={allAgreed}>
          <img src={allAgreed ? checkLargeIconActive : checkLargeIcon} alt="" />
          전체 동의
        </button>
        <ul className="signup-terms-list">
          {TERMS.map((term) => (
            <li key={term.key} className="signup-terms-item">
              <button
                type="button"
                className="signup-terms-check"
                onClick={() => toggleTerm(term.key)}
                aria-pressed={agreed[term.key]}
              >
                <span className="signup-terms-icon">
                  <img src={agreed[term.key] ? checkIconActive : checkIcon} alt="" />
                </span>
                {term.label}
              </button>
              {/* TODO: 약관 링크 연결 */}
              <button type="button" className="signup-terms-view">
                보기
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" fullWidth className="signup-submit" disabled={submitting}>
        가입하기
      </Button>
    </form>
  )
}
