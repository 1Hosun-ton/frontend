import { useState } from 'react'
import BottomSheet from '../components/BottomSheet/BottomSheet.jsx'
import Button from '../components/Button/Button.jsx'
import Card from '../components/Card/Card.jsx'
import Chip from '../components/Chip/Chip.jsx'
import Tag from '../components/Tag/Tag.jsx'
import PageHeader from '../components/PageHeader/PageHeader.jsx'
import PeriodSwitcher from '../components/PeriodSwitcher/PeriodSwitcher.jsx'
import ProgressBar from '../components/ProgressBar/ProgressBar.jsx'
import TextField from '../components/TextField/TextField.jsx'
import { useToast } from '../components/Toast/useToast.js'

// 공통 컴포넌트를 브라우저에서 확인하는 임시 페이지(/preview). 지워도 된다.
export default function ComponentPreview() {
  const gap = { display: 'grid', gap: '1rem' }
  const showToast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [month, setMonth] = useState(11)
  return (
    <div style={gap}>
      <PageHeader subtitle="공통 컴포넌트" title="미리보기" />

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-sub)', fontSize: 'var(--font-body)' }}>남은 예산</p>
        <p style={{ margin: '0.25rem 0 1rem', fontSize: 'var(--font-amount)', fontWeight: 700 }}>62,000원</p>
        <ProgressBar value={38000} max={100000} label="예산 사용" />
      </Card>

      <Card>
        <p style={{ margin: '0 0 1rem' }}>예산 초과 (danger)</p>
        <ProgressBar value={112000} max={100000} tone="danger" />
      </Card>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Card size="sm" style={{ flex: 1 }}>이번 주 기록 5건</Card>
        <Card size="sm" tone="grey" style={{ flex: 1 }}>grey 카드</Card>
      </div>

      <Card>
        <p style={{ margin: '0 0 0.75rem' }}>미션 3일째</p>
        <ProgressBar steps={7} value={3} label="미션 진행" />
        <div style={{ ...gap, marginTop: '1rem' }}>
          <Button variant="light" size="small" fullWidth>오늘 실천 체크</Button>
          <Button variant="grey" size="small" fullWidth>오늘 실천 완료</Button>
          <Button variant="outline" size="small" fullWidth>미션 고르러 가기</Button>
        </div>
      </Card>

      <Button fullWidth>+ 소비 기록하기 (large)</Button>
      <Button size="medium" fullWidth>medium</Button>
      <Button disabled fullWidth>disabled</Button>

      <PeriodSwitcher
        label={`${month}월`}
        onPrev={() => setMonth((m) => m - 1 <= 0 ? 12 : m - 1)}
        onNext={() => setMonth((m) => m + 1)}
        nextDisabled={month >= 11}
      />

      <Card>
        <TextField label="이메일" type="email" placeholder="harin@example.com" />
        <div style={{ marginTop: '1rem' }}>
          <TextField label="비밀번호" type="password" placeholder="비밀번호" />
        </div>
      </Card>

      <Button variant="outline" size="medium" fullWidth onClick={() => showToast('이유와 후회 여부를 선택해 주세요')}>
        토스트 띄우기
      </Button>
      <Button variant="outline" size="medium" fullWidth onClick={() => setSheetOpen(true)}>
        바텀시트 열기
      </Button>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="이 기록을 삭제할까요?">
        <p style={{ margin: '0 0 1rem', color: 'var(--color-text-muted)', fontSize: 'var(--font-body)' }}>
          삭제하면 복구할 수 없어요.
        </p>
        <Button variant="light" onClick={() => setSheetOpen(false)} fullWidth>취소</Button>
      </BottomSheet>

      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Chip selected>식비</Chip>
          <Chip>배달 음식</Chip>
          <Chip>카페</Chip>
          <Chip selected tone="danger">후회돼요</Chip>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Tag>스트레스 해소</Tag>
          <Tag tone="danger">후회</Tag>
        </div>
      </Card>
    </div>
  )
}
