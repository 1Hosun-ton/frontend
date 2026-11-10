import delivery from '../../assets/icons/category-delivery.svg'
import cafe from '../../assets/icons/category-cafe.svg'
import shopping from '../../assets/icons/category-shopping.svg'
import food from '../../assets/icons/category-food.svg'
import transport from '../../assets/icons/category-transport.svg'

/*
 서버가 주는 코드(enum)를 화면에 쓰는 이름으로 바꾸는 곳.
 코드 이름이 백엔드와 다르면 여기만 고치면 된다.
*/

// 소비 항목. 기타는 시안에 아이콘이 없어서 비워 둔다
export const RECORD_ITEMS = {
  FOOD: { name: '식비', icon: food },
  DELIVERY: { name: '배달 음식', icon: delivery },
  CAFE: { name: '카페', icon: cafe },
  SHOPPING: { name: '쇼핑', icon: shopping },
  TRANSPORT: { name: '교통비', icon: transport },
  ETC: { name: '기타', icon: null },
}

// 소비 이유. 기록 하나에 하나만 붙는다
export const RECORD_REASONS = {
  NEED: '필요해서',
  STRESS: '스트레스 해소',
  DISCOUNT: '할인',
  IMPULSE: '충동',
  REWARD: '보상',
  HABIT: '습관',
}

// 소비 당시 기분. 선택 값이라 없을 수 있다
export const RECORD_MOODS = {
  GOOD: '좋음',
  NORMAL: '보통',
  TIRED: '지침',
  DOWN: '우울',
}

// 모르는 코드가 와도 화면이 비지 않도록 코드를 그대로 보여 준다
export const itemLabel = (code) => RECORD_ITEMS[code]?.name ?? code
export const itemIcon = (code) => RECORD_ITEMS[code]?.icon ?? null
export const reasonLabel = (code) => RECORD_REASONS[code] ?? code
export const moodLabel = (code) => RECORD_MOODS[code] ?? code
