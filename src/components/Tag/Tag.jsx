import './Tag.css'

/**
 * 작은 알약 라벨.
 * - tone: "grey"(기본, 소비 이유 등) 또는 "danger"(빨강, 후회·예산 초과)
 */
export default function Tag({ tone = 'grey', className = '', children }) {
  return <span className={['tag', `tag-${tone}`, className].filter(Boolean).join(' ')}>{children}</span>
}
