import chevronLeft from '../../assets/icons/chevron-left.svg'
import chevronRight from '../../assets/icons/chevron-right.svg'
import chevronRightDisabled from '../../assets/icons/chevron-right-disabled.svg'
import './PeriodSwitcher.css'

/*
 label로 가운데 글자 설정
 nextDisabled로 다음 달로 이동 못하게 막기
*/
export default function PeriodSwitcher({ label, onPrev, onNext, nextDisabled = false }) {
  return (
    <div className="period-switcher">
      <button type="button" className="period-switcher-button" onClick={onPrev}>
        <img src={chevronLeft} alt="" />
      </button>
      <span className="period-switcher-label">{label}</span>
      <button
        type="button"
        className="period-switcher-button"
        onClick={onNext}
        disabled={nextDisabled}
      >
        <img src={nextDisabled ? chevronRightDisabled : chevronRight} alt="" />
      </button>
    </div>
  )
}
