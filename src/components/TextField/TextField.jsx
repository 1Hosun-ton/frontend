import { useId } from 'react'
import './TextField.css'

/*
 label로 위에 라벨
 나머지 props(type, value, onChange, placeholder 등)는 input에 그대로 전달
*/
export default function TextField({ label, id, className = '', ...rest }) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className={['text-field', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="text-field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="text-field-input" {...rest} />
    </div>
  )
}
