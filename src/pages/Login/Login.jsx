import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button.jsx'
import TextField from '../../components/TextField/TextField.jsx'
import { useToast } from '../../components/Toast/useToast.js'
import { login } from '../../api/mock.js'
import logo from '../../assets/logo.svg'
import './Login.css'

const LOGIN_FAILED = '이메일 또는 비밀번호를 다시 확인해 주세요.'
const TOAST_BOTTOM = '2.31rem'

// S0 로그인 화면
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!email.trim() || !password) return showToast(LOGIN_FAILED, { bottom: TOAST_BOTTOM })

    setSubmitting(true)
    try {
      const { user } = await login({ email, password })
      // 주간 예산이 없으면 예산 설정부터
      navigate(user.weeklyBudget === null ? '/budget' : '/', { replace: true })
    } catch (error) {
      showToast(error.message || LOGIN_FAILED, { bottom: TOAST_BOTTOM })
      setSubmitting(false)
    }
  }

  return (
    <form className="login-page" onSubmit={handleSubmit} noValidate>
      <div className="login-brand">
        <img className="login-logo" src={logo} alt="" />
        <h1 className="login-title">돌아봄</h1>
        <p className="login-slogan">
          「얼마 썼는지」가 아니라
          <br />
          「왜 썼는지」를 돌아봐요
        </p>
      </div>

      <div className="login-fields">
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
          placeholder="비밀번호"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" fullWidth className="login-submit" disabled={submitting}>
        로그인
      </Button>

      <p className="login-signup">
        아직 계정이 없나요?
        <Link className="login-signup-link" to="/signup" state={{ email }}>
          회원가입
        </Link>
      </p>
    </form>
  )
}
