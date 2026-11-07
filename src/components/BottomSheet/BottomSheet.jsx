import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './BottomSheet.css'

/*
 open: 열려 있는지 여부
 onClose: 어두운 곳이나 Esc 눌렀을 때 실행할 함수
 title: 위쪽 큰 제목
 children: title 아래 나머지 내용
*/
export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const root = open ? document.getElementById('overlay-root') : null
  if (!root) return null

  return createPortal(
    <div className="bottom-sheet-dim" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        {title && <h2 className="bottom-sheet-title">{title}</h2>}
        {children}
      </div>
    </div>,
    root,
  )
}
