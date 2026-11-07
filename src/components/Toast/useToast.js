import { useContext } from 'react'
import { ToastContext } from './ToastContext.js'

export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요')
  return showToast
}
