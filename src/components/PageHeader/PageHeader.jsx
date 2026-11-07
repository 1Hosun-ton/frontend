import './PageHeader.css'

// 제목 위에 작은 글자 필요 시 subtitle 사용
export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      <h1 className="page-header-title">{title}</h1>
    </header>
  )
}
