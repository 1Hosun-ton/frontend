import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './BottomSheet.css'

/*
 open: 열려 있는지 여부
 onClose: 어두운 곳이나 Esc 눌렀을 때 실행할 함수
 title: 위쪽 큰 제목
 children: title 아래 나머지 내용
*/
export default function BottomSheet({ open, onClose, title, children }) {
  /*
   바텀시트는 App이 그린 overlay-root 안에 들어간다.
   그런데 처음 그릴 때는 overlay-root가 아직 화면에 없어서,
   화면에 올라온 뒤에 한 번 더 찾는다. (처음부터 열려 있는 바텀시트도 보이게)
  */
  const [root, setRoot] = useState(null)

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setRoot(document.getElementById('overlay-root'))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !root) return null

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
