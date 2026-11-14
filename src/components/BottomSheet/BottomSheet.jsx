import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './BottomSheet.css'

const CLOSE_MS = 200 /* 내려가는 데 걸리는 시간. CSS의 --motion-sheet-out과 같아야 한다 */

/*
 open: 열려 있는지 여부
 onClose: 어두운 곳이나 Esc 눌렀을 때 실행할 함수
 title: 위쪽 큰 제목
 children: title 아래 나머지 내용
*/
export default function BottomSheet({ open, onClose, title, children }) {
  const [root, setRoot] = useState(null)

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setRoot(document.getElementById('overlay-root'))
  }, [])

  /*
   닫힐 때도 내려가는 움직임을 보여 주려면 바로 지우지 말고 조금 더 그려 둬야 한다.
   그래서 open과 별개로 '아직 그리는 중'(mounted)과 '내려가는 중'(closing)을 따로 둔다.
  */
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      // oxlint-disable-next-line react/set-state-in-effect
      setMounted(true)
      // oxlint-disable-next-line react/set-state-in-effect
      setClosing(false)
      return
    }
    if (!mounted) return
    // oxlint-disable-next-line react/set-state-in-effect
    setClosing(true)
    const timer = setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, CLOSE_MS)
    return () => clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!mounted || !root) return null

  return createPortal(
    <div
      className={['bottom-sheet-dim', closing && 'bottom-sheet-dim-closing'].filter(Boolean).join(' ')}
      onClick={onClose}
    >
      <div
        className={['bottom-sheet', closing && 'bottom-sheet-closing'].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle" />
        {title && <h2 className="bottom-sheet-title">{title}</h2>}
        {children}
      </div>
    </div>,
    root,
  )
}
