import { useId, useLayoutEffect, useRef } from 'react'
import { formatNumber } from '../../utils/format.js'
import './AmountInput.css'

const MAX_AMOUNT = 999999999

/*
 큰 금액 입력 (밑줄 + "원"). 주간 예산·소비 기록·예산 수정에서 쓴다.
 value: 숫자 또는 null(빈칸)
 onChange: 숫자 또는 null을 넘겨준다
 size: lg(30px, 기본) 또는 md(28px, 바텀시트)
 나머지 props(autoFocus, onFocus, onBlur 등)는 input에 그대로 전달
*/
export default function AmountInput({ value, onChange, size = 'lg', id, className = '', ...rest }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const inputRef = useRef(null)
  const text = value === null || value === undefined ? '' : formatNumber(value)

  // 글자가 늘어날 때 입력칸 안쪽이 옆으로 밀리는 것을 되돌린다
  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.scrollLeft = 0
  }, [text])

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) return onChange(null)
    onChange(Math.min(Number(digits), MAX_AMOUNT))
  }

  return (
    <label className={['amount-input', `amount-input-${size}`, className].filter(Boolean).join(' ')} htmlFor={inputId}>
      <span className="amount-input-box">
        <span className="amount-input-sizer" aria-hidden="true">
          {text || '0'}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          className="amount-input-field"
          type="text"
          inputMode="numeric"
          size={1}
          autoComplete="off"
          placeholder="0"
          value={text}
          onChange={handleChange}
          {...rest}
        />
      </span>
      <span className={text ? 'amount-input-unit' : 'amount-input-unit amount-input-unit-empty'}>원</span>
    </label>
  )
}
