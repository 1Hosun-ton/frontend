import delivery from '../../assets/icons/category-delivery.svg'
import cafe from '../../assets/icons/category-cafe.svg'
import shopping from '../../assets/icons/category-shopping.svg'
import food from '../../assets/icons/category-food.svg'
import transport from '../../assets/icons/category-transport.svg'

// 항목(카테고리)별 이름과 아이콘
export const RECORD_CATEGORIES = {
  delivery: { name: '배달 음식', icon: delivery },
  cafe: { name: '카페', icon: cafe },
  shopping: { name: '쇼핑', icon: shopping },
  food: { name: '식비', icon: food },
  transport: { name: '교통비', icon: transport },
}

// 소비 이유 코드 → 화면에 쓰는 이름. 백엔드 enum과 맞춰야 한다
export const RECORD_REASONS = {
  STRESS: '스트레스 해소',
  NEED: '필요해서',
  DISCOUNT: '할인',
  HABIT: '습관',
  IMPULSE: '충동·보상',
}

// 모르는 코드가 와도 화면이 비지 않도록 코드를 그대로 보여 준다
export const reasonLabel = (code) => RECORD_REASONS[code] ?? code
export const itemLabel = (code) => RECORD_CATEGORIES[String(code).toLowerCase()]?.name ?? code
