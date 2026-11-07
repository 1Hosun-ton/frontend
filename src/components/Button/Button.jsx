import './Button.css'

/*
  variant는 primary, light, grey, outline 중 선택 가능
  사이즈는 large, medium, small 중 선택 가능
  fullWidth로 부모 너비 채우기 가능 (대부분 경우 필요함)
*/
export default function Button({
  variant = 'primary',
  size = 'large',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['button', `button-${variant}`, `button-${size}`, fullWidth && 'button-full', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
