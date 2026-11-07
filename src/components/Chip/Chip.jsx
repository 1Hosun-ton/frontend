import './Chip.css'

/*
 selected: 선택 유무 (배경 파란색)
 tone: default나 danger 중 선택
*/
export default function Chip({ selected = false, tone = 'default', className = '', children, ...rest }) {
  const classes = ['chip', selected && `chip-selected-${tone}`, className].filter(Boolean).join(' ')
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
