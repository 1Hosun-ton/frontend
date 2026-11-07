import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './ToastContext.js'
import './Toast.css'

const SHOW_MS = 2500

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, { bottom } = {}) => {
    clearTimeout(timer.current)
    setToast({ message, bottom })
    timer.current = setTimeout(() => setToast(null), SHOW_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const root = toast ? document.getElementById('overlay-root') : null

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {root &&
        createPortal(
          <div className="toast" style={toast.bottom ? { bottom: toast.bottom } : undefined}>
            {toast.message}
          </div>,
          root,
        )}
    </ToastContext.Provider>
  )
}
