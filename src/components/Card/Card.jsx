import './Card.css'

/*
  tone은 white, grey 중 선택 가능
  size는 md, sm 중 선택 가능 (여백 크기 지정용)
*/
export default function Card({ tone = 'white', size = 'md', className = '', children, ...rest }) {
  const classes = ['card', `card-${tone}`, `card-${size}`, className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
