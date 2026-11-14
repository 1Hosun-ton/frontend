import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './ToastContext.js'
import './Toast.css'

const SHOW_MS = 2000 /* 올라온 뒤 2초 동안 보여 준다 */
const FADE_MS = 200 /* 그 뒤 흐려지며 사라지는 시간 */

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timers = useRef([])
  const nextId = useRef(0)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const showToast = useCallback((message, { bottom } = {}) => {
    clearTimers()
    nextId.current += 1
    setToast({ id: nextId.current, message, bottom, leaving: false })
    timers.current.push(setTimeout(() => setToast((prev) => prev && { ...prev, leaving: true }), SHOW_MS))
    timers.current.push(setTimeout(() => setToast(null), SHOW_MS + FADE_MS))
  }, [])

  useEffect(() => clearTimers, [])

  const root = toast ? document.getElementById('overlay-root') : null

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {root &&
        createPortal(
          <div
            key={toast.id}
            className={['toast', toast.leaving && 'toast-leaving'].filter(Boolean).join(' ')}
            style={toast.bottom ? { bottom: toast.bottom } : undefined}
          >
            {toast.message}
          </div>,
          root,
        )}
    </ToastContext.Provider>
  )
}
