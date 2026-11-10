/*
  백엔드 API 연결 전까지 쓰는 임시 데이터 (브라우저 localStorage에 저장).
  실제 API가 나오면 같은 이름의 함수를 fetch 호출로 바꾸면 화면 코드는 그대로 쓸 수 있다.
  오류는 서버 응답과 같은 모양({ code, message })으로 던진다.

  테스트 계정: harin@example.com / 123456
*/
import { startOfWeek, toDateString, todayString } from '../utils/date.js'

const STORAGE_KEY = 'dolabom-mock'
const SESSION_KEY = 'dolabom-mock-session'
const DELAY_MS = 200

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const ERRORS = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호를 다시 확인해 주세요.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일이에요',
  UNAUTHORIZED: '다시 로그인해 주세요',
  INVALID_BUDGET: '1원 이상 입력해 주세요',
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
      { id: 1, userId: 1, spentOn: dayInThisWeek(0), item: 'FOOD', amount: 8000, reason: 'NEED', regret: false },
      { id: 2, userId: 1, spentOn: dayInThisWeek(1), item: 'DELIVERY', amount: 18500, reason: 'STRESS', regret: true },
      { id: 3, userId: 1, spentOn: dayInThisWeek(2), item: 'CAFE', amount: 4500, reason: 'HABIT', regret: false },
      { id: 4, userId: 1, spentOn: dayInThisWeek(3), item: 'SHOPPING', amount: 5000, reason: 'IMPULSE', regret: true },
      { id: 5, userId: 1, spentOn: dayInThisWeek(4), item: 'TRANSPORT', amount: 2000, reason: 'NEED', regret: false },
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

function publicUser(user) {
  return { id: user.id, email: user.email, nickname: user.nickname, weeklyBudget: user.weeklyBudget }
}

// 백엔드 회원가입 응답과 같은 모양: { accessToken, refreshToken, user: { userId, nickname, weeklyBudget } }
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

export async function login({ email, password }) {
  const db = load()
  const user = db.users.find((u) => u.email === normalizeEmail(email) && u.password === password)
  if (!user) fail('INVALID_CREDENTIALS')
  setSessionUserId(user.id)
  return respond(authResponse(user))
}

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

export async function getMe() {
  const db = load()
  return respond(publicUser(requireUser(db)))
}

export async function logout() {
  setSessionUserId(null)
  return respond(null)
}

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

export async function updateWeeklyBudget(weeklyBudget) {
  const db = load()
  const user = requireUser(db)
  if (!weeklyBudget || weeklyBudget <= 0) fail('INVALID_BUDGET')
  user.weeklyBudget = weeklyBudget
  save(db)
  return respond(publicUser(user))
}

export async function getHome() {
  const db = load()
  const user = requireUser(db)
  const weekStart = toDateString(startOfWeek(new Date()))
  const thisWeek = db.expenses.filter((e) => e.userId === user.id && e.spentOn >= weekStart)
  const mission = activeMission(db, user.id)

  return respond({
    nickname: user.nickname,
    weeklyBudget: user.weeklyBudget,
    spentAmount: thisWeek.reduce((sum, e) => sum + e.amount, 0),
    recordCount: thisWeek.length,
    regretCount: thisWeek.filter((e) => e.regret).length,
    mission: mission && {
      id: mission.id,
      text: mission.text,
      doneDays: mission.doneDays,
      checkedToday: mission.lastCheckedOn === todayString(),
    },
  })
}

export async function checkMission(missionId) {
  const db = load()
  const user = requireUser(db)
  const mission = activeMission(db, user.id)
  if (!mission || mission.id !== missionId) fail('MISSION_NOT_ACTIVE')
  if (mission.lastCheckedOn === todayString()) fail('ALREADY_CHECKED_TODAY')
  mission.doneDays = Math.min(7, mission.doneDays + 1)
  mission.lastCheckedOn = todayString()
  save(db)
  return respond({ doneDays: mission.doneDays })
}

export async function createExpense({ amount, item, spentOn, reason, regret, mood, memo }) {
  const db = load()
  const user = requireUser(db)
  if (!amount || amount <= 0) fail('AMOUNT_REQUIRED')
  if (!reason || regret === null || regret === undefined) fail('REASON_REGRET_REQUIRED')
  if (spentOn > todayString()) fail('FUTURE_DATE_NOT_ALLOWED')
  const expense = {
    id: db.nextId++,
    userId: user.id,
    spentOn,
    item,
    amount,
    reason,
    regret,
    mood: mood ?? null,
    memo: memo?.trim() || null,
  }
  db.expenses.push(expense)
  save(db)
  return respond(expense)
}
