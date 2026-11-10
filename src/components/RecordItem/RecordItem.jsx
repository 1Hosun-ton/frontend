import Tag from '../Tag/Tag.jsx'
import { itemIcon, itemLabel, moodLabel, reasonLabel } from '../../pages/Records/recordCategories.js'
import './RecordItem.css'

/*
 기록 한 줄 (아이콘 · 항목/메모/태그 · 금액/삭제)
 record: 서버가 주는 소비 기록 하나 { item, memo, reason, regret, mood, amount }
 onDelete: 삭제 글자를 눌렀을 때 실행할 함수 (없으면 삭제 글자를 숨김)
*/
export default function RecordItem({ record, onDelete }) {
  const { item, memo, reason, regret, mood, amount } = record
  const icon = itemIcon(item)

  return (
    <li className="record-item">
      {/* 기타 항목은 아이콘이 없어서 빈 동그라미만 둔다 */}
      <span className="record-item-icon">{icon && <img src={icon} alt="" />}</span>
      <div className="record-item-body">
        <p className="record-item-category">{itemLabel(item)}</p>
        {memo && <p className="record-item-memo">{memo}</p>}
        <div className="record-item-tags">
          <Tag>{reasonLabel(reason)}</Tag>
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
