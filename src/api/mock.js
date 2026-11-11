/*
  백엔드 API 연결 전까지 쓰는 임시 데이터 (브라우저 localStorage에 저장).
  함수 이름·인자·돌려주는 값은 실제 API의 요청 body와 응답 data에 맞춰 두었다.
  실제 API로 바꿀 때는 각 함수 안쪽만 위에 적힌 엔드포인트 호출로 바꾸면 된다.
  오류는 서버 응답과 같은 모양({ code, message })으로 던진다.

  테스트 계정: harin@example.com / 123456
*/
import { startOfWeek, toDateString, todayString, weekLabel } from '../utils/date.js'

const STORAGE_KEY = 'dolabom-mock-v2'
const SESSION_KEY = 'dolabom-mock-session'
const DELAY_MS = 200

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const ERRORS = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호를 다시 확인해 주세요',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일이에요',
  UNAUTHORIZED: '다시 로그인해 주세요',
  INVALID_BUDGET: '1원 이상 입력해 주세요',
  BUDGET_NOT_SET: '주간 예산을 먼저 설정해 주세요',
  AMOUNT_REQUIRED: '금액을 입력해 주세요',
  REASON_REGRET_REQUIRED: '이유와 후회 여부를 선택해 주세요',
  FUTURE_DATE_NOT_ALLOWED: '미래 날짜는 선택할 수 없어요',
  ALREADY_CHECKED_TODAY: '오늘은 이미 체크했어요',
  MISSION_NOT_ACTIVE: '진행 중인 미션이 아니에요',
}

function fail(code) {
  throw new ApiError(code, ERRORS[code])
}

function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS))
}

function dayInThisWeek(offset) {
  const date = startOfWeek(new Date())
  date.setDate(date.getDate() + offset)
  const day = toDateString(date)
  return day > todayString() ? todayString() : day
}

function yesterday() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return toDateString(date)
}

function seed() {
  return {
    nextId: 6,
    users: [
      {
        id: 1,
        email: 'harin@example.com',
        password: '123456',
        nickname: '하린',
        weeklyBudget: 100000,
      },
    ],
    expenses: [
      { id: 1, userId: 1, spentAt: dayInThisWeek(0), item: 'FOOD', amount: 8000, reason: 'NEED', regret: false },
      { id: 2, userId: 1, spentAt: dayInThisWeek(1), item: 'DELIVERY', amount: 18500, reason: 'STRESS', regret: true },
      { id: 3, userId: 1, spentAt: dayInThisWeek(2), item: 'CAFE', amount: 4500, reason: 'HABIT', regret: false },
      { id: 4, userId: 1, spentAt: dayInThisWeek(3), item: 'SHOPPING', amount: 5000, reason: 'IMPULSE', regret: true },
      { id: 5, userId: 1, spentAt: dayInThisWeek(4), item: 'TRANSPORT', amount: 2000, reason: 'NEED', regret: false },
    ],
    missions: [
      {
        id: 1,
        userId: 1,
        text: '주문 전 집에 있는 식재료 확인하기',
        doneDays: 2,
        lastCheckedOn: yesterday(),
        result: null,
      },
    ],
  }
}

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // 저장소를 못 쓰면 새 데이터로 시작
  }
  return seed()
}

function save(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // 저장 실패는 무시
  }
}

function getSessionUserId() {
  try {
    return Number(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

function setSessionUserId(id) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, String(id))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // 무시
  }
}

function requireUser(db) {
  const user = db.users.find((u) => u.id === getSessionUserId())
  if (!user) fail('UNAUTHORIZED')
  return user
}

function authResponse(user) {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { userId: user.id, nickname: user.nickname, weeklyBudget: user.weeklyBudget },
  }
}

// 백엔드와 같이 이메일은 앞뒤 공백 제거 + 소문자로 비교
function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function activeMission(db, userId) {
  return db.missions.find((m) => m.userId === userId && m.result === null) ?? null
}

// POST /api/v1/auth/login
export async function login({ email, password }) {
  const db = load()
  const user = db.users.find((u) => u.email === normalizeEmail(email) && u.password === password)
  if (!user) fail('INVALID_CREDENTIALS')
  setSessionUserId(user.id)
  return respond(authResponse(user))
}

// POST /api/v1/auth/signup
export async function signup({ nickname, email, password }) {
  const db = load()
  if (db.users.some((u) => u.email === normalizeEmail(email))) fail('EMAIL_ALREADY_EXISTS')
  const user = {
    id: db.nextId++,
    email: normalizeEmail(email),
    password,
    nickname: nickname.trim(),
    weeklyBudget: null,
  }
  db.users.push(user)
  save(db)
  setSessionUserId(user.id)
  return respond(authResponse(user))
}

// POST /api/v1/auth/logout (body: { refreshToken })
export async function logout() {
  setSessionUserId(null)
  return respond(null)
}

// GET /api/v1/me
export async function getMe() {
  const db = load()
  const user = requireUser(db)
  return respond({
    userId: user.id,
    nickname: user.nickname,
    email: user.email,
    weeklyBudget: user.weeklyBudget,
    budgetSet: user.weeklyBudget !== null,
    totalExpenseCount: db.expenses.filter((e) => e.userId === user.id).length,
  })
}

// DELETE /api/v1/me
export async function deleteAccount() {
  const db = load()
  const user = requireUser(db)
  db.users = db.users.filter((u) => u.id !== user.id)
  db.expenses = db.expenses.filter((e) => e.userId !== user.id)
  db.missions = db.missions.filter((m) => m.userId !== user.id)
  save(db)
  setSessionUserId(null)
  return respond(null)
}

// PUT /api/v1/me/weekly-budget
export async function updateWeeklyBudget({ weeklyBudget }) {
  const db = load()
  const user = requireUser(db)
  if (!weeklyBudget || weeklyBudget <= 0) fail('INVALID_BUDGET')
  user.weeklyBudget = weeklyBudget
  save(db)
  return respond({ weeklyBudget })
}

// GET /api/v1/home
export async function getHome() {
  const db = load()
  const user = requireUser(db)
  if (user.weeklyBudget === null) fail('BUDGET_NOT_SET')
  const start = startOfWeek(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startDate = toDateString(start)
  const thisWeek = db.expenses.filter((e) => e.userId === user.id && e.spentAt >= startDate)
  const spentAmount = thisWeek.reduce((sum, e) => sum + e.amount, 0)
  const mission = activeMission(db, user.id)

  return respond({
    nickname: user.nickname,
    week: { label: weekLabel(), startDate, endDate: toDateString(end) },
    budget: {
      weeklyBudget: user.weeklyBudget,
      spentAmount,
      remainingBudget: Math.max(0, user.weeklyBudget - spentAmount),
      overBudget: spentAmount > user.weeklyBudget,
    },
    summary: {
      expenseCount: thisWeek.length,
      regretCount: thisWeek.filter((e) => e.regret).length,
    },
    mission: mission && {
      missionId: mission.id,
      text: mission.text,
      doneDays: mission.doneDays,
      checkedToday: mission.lastCheckedOn === todayString(),
    },
  })
}

// POST /api/v1/missions/{missionId}/checks (body: { memo })
export async function checkMission(missionId, { memo = null } = {}) {
  const db = load()
  const user = requireUser(db)
  const mission = activeMission(db, user.id)
  if (!mission || mission.id !== missionId) fail('MISSION_NOT_ACTIVE')
  if (mission.lastCheckedOn === todayString()) fail('ALREADY_CHECKED_TODAY')
  mission.doneDays = Math.min(7, mission.doneDays + 1)
  mission.lastCheckedOn = todayString()
  save(db)
  return respond({
    missionId: mission.id,
    checkedOn: mission.lastCheckedOn,
    doneDays: mission.doneDays,
    checkedToday: true,
    memo,
    status: 'IN_PROGRESS',
  })
}

// POST /api/v1/expenses
export async function createExpense({ amount, item, spentAt, reason, regret, mood, memo }) {
  const db = load()
  const user = requireUser(db)
  if (!amount || amount <= 0) fail('AMOUNT_REQUIRED')
  if (!reason || regret === null || regret === undefined) fail('REASON_REGRET_REQUIRED')
  if (spentAt > todayString()) fail('FUTURE_DATE_NOT_ALLOWED')
  const expense = {
    id: db.nextId++,
    userId: user.id,
    spentAt,
    item,
    amount,
    reason,
    regret,
    mood: mood ?? null,
    memo: memo?.trim() || null,
    createdAt: new Date().toISOString(),
  }
  db.expenses.push(expense)
  save(db)
  return respond({
    expenseId: expense.id,
    amount,
    item,
    spentAt,
    reason,
    regret,
    mood: expense.mood,
    memo: expense.memo,
    createdAt: expense.createdAt,
  })
}
