import Tag from '../Tag/Tag.jsx'
import { itemEmoji, itemLabel, moodLabel, reasonLabel } from '../../pages/Records/recordCategories.js'
import './RecordItem.css'

/*
 기록 한 줄 (아이콘 · 항목/메모/태그 · 금액/삭제)
 record: { item, memo, reason, mood, regret, amount } - 백엔드 응답 모양 그대로
 onDelete: 삭제 글자를 눌렀을 때 실행할 함수 (없으면 삭제 글자를 숨김)
*/
export default function RecordItem({ record, onDelete }) {
  const { item, memo, reason, mood, regret, amount } = record
  // 모르는 항목이 와도 화면이 죽지 않도록 아이콘은 비우고 이름만 보여 준다
  const emoji = itemEmoji(item)

  return (
    <li className="record-item">
      <span className="record-item-icon" aria-hidden="true">
        {emoji}
      </span>
      <div className="record-item-body">
        <p className="record-item-category">{itemLabel(item)}</p>
        {memo && <p className="record-item-memo">{memo}</p>}
        <div className="record-item-tags">
          {reason && <Tag>{reasonLabel(reason)}</Tag>}
          {mood && <Tag>{moodLabel(mood)}</Tag>}
          {regret && <Tag tone="danger">후회</Tag>}
        </div>
      </div>
      <div className="record-item-side">
        <p className="record-item-amount">{amount.toLocaleString()}원</p>
        {onDelete && (
          <button type="button" className="record-item-delete" onClick={onDelete}>
            삭제
          </button>
        )}
      </div>
    </li>
  )
}
