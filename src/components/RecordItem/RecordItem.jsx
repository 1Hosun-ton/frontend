import Tag from '../Tag/Tag.jsx'
import { RECORD_CATEGORIES } from '../../pages/Records/recordCategories.js'
import './RecordItem.css'

/*
 기록 한 줄 (아이콘 · 항목/메모/태그 · 금액/삭제)
 record: { category, memo, reasons, regret, amount }
 onDelete: 삭제 글자를 눌렀을 때 실행할 함수
*/
export default function RecordItem({ record, onDelete }) {
  const { category, memo, reasons, regret, amount } = record
  const { name, icon } = RECORD_CATEGORIES[category]

  return (
    <li className="record-item">
      <span className="record-item-icon">
        <img src={icon} alt="" />
      </span>
      <div className="record-item-body">
        <p className="record-item-category">{name}</p>
        {memo && <p className="record-item-memo">{memo}</p>}
        <div className="record-item-tags">
          {reasons.map((reason) => (
            <Tag key={reason}>{reason}</Tag>
          ))}
          {regret && <Tag tone="danger">후회</Tag>}
        </div>
      </div>
      <div className="record-item-side">
        <p className="record-item-amount">{amount.toLocaleString()}원</p>
        <button type="button" className="record-item-delete" onClick={onDelete}>
          삭제
        </button>
      </div>
    </li>
  )
}
