/** Progress model and local storage. Everything goes through ProgressStore so sync can be layered on without touching components. */

export type Lang = 'bn' | 'en' | 'both'
export type Theme = 'system' | 'light' | 'dark' | 'night'
export type Ui = 'bn' | 'en' // interface language
export const GOALS = [20, 50, 100] as const

export interface LessonProgress {
  done: number[] // completed step indexes
  best: number // best quiz score (correct answers)
  total: number // quiz length when best was set
  passed: boolean
}

/** Spaced-repetition state of one word, keyed "<lessonId>:<wordId>". */
export interface Card {
  due: number // ms since epoch when it is next due
  ivl: number // current interval in days (0 while still being learned)
  reps: number // successful reviews in a row
  lapses: number // times forgotten
  last: number // ms of the last change; decides which device's copy wins when merging
}

export interface Progress {
  // settings (last writer wins, see mergeProgress)
  lang: Lang // which translations to show in lessons
  ui: Ui // language of the app's own menus, buttons and messages
  slow: boolean
  theme: Theme
  goal: number // daily XP goal
  name: string
  examDate: string // YYYY-MM-DD or ''
  startUnit: number // A1 units before this one are open without being passed (set by the placement test)
  unlockAll: boolean // every lesson open, no strict order
  placed: boolean // the placement test has been taken
  startUnitB1: number // same for B1: all of A1 and A2 and the B1 units before this one are open
  startUnitA2: number // 0 = the A2 placement test has not been taken; otherwise A1 and A2 units before this one are open
  // learning data (merged by union / max)
  xp: number // always derived from lessons, see computeXp
  lessons: Record<string, LessonProgress>
  srs: Record<string, Card>
  activity: Record<string, number> // YYYY-MM-DD → XP earned that day (streaks, heatmap)
  updatedAt: number // ms of the last local change; decides which device's settings win
}

export const emptyProgress = (): Progress => ({
  lang: 'both', ui: 'bn', slow: false, theme: 'system', goal: 50, name: '', examDate: '', startUnit: 1, unlockAll: false, placed: false, startUnitA2: 0, startUnitB1: 0,
  xp: 0, lessons: {}, srs: {}, activity: {}, updatedAt: 0,
})

/** XP is derived, so merging two devices can never double-count: 10 per step 1–4, 5 per correct quiz answer (best run), 20 for the first pass. */
export function computeXp(lessons: Record<string, LessonProgress>): number {
  let xp = 0
  for (const lp of Object.values(lessons)) xp += 10 * lp.done.filter((s) => s >= 0 && s < 4).length + 5 * lp.best + (lp.passed ? 20 : 0)
  return xp
}

const isInt = (n: unknown, max: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max
const isNum = (n: unknown, max: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= max
const CARD_KEY = /^[a-c][12]-u\d{2}-l\d{2}:[a-z0-9_]{1,60}$/
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const FAR_FUTURE = 4102444800000 // year 2100

/** Coerces untrusted JSON (localStorage, or the server) into a valid Progress. Unknown or malformed parts are dropped. */
export function sanitizeProgress(raw: unknown): Progress {
  const out = emptyProgress()
  if (!raw || typeof raw !== 'object') return out
  const r = raw as Record<string, unknown>
  if (r.lang === 'bn' || r.lang === 'en' || r.lang === 'both') out.lang = r.lang
  if (r.ui === 'bn' || r.ui === 'en') out.ui = r.ui
  if (r.theme === 'system' || r.theme === 'light' || r.theme === 'dark' || r.theme === 'night') out.theme = r.theme
  out.slow = r.slow === true
  if (typeof r.goal === 'number' && (GOALS as readonly number[]).includes(r.goal)) out.goal = r.goal
  if (typeof r.name === 'string') out.name = r.name.trim().slice(0, 30)
  if (typeof r.examDate === 'string' && DAY_KEY.test(r.examDate)) out.examDate = r.examDate
  if (isInt(r.startUnit, 99) && r.startUnit >= 1) out.startUnit = r.startUnit
  out.unlockAll = r.unlockAll === true
  out.placed = r.placed === true
  if (isInt(r.startUnitA2, 99)) out.startUnitA2 = r.startUnitA2
  if (isInt(r.startUnitB1, 99)) out.startUnitB1 = r.startUnitB1
  if (isNum(r.updatedAt, FAR_FUTURE)) out.updatedAt = r.updatedAt
  if (r.lessons && typeof r.lessons === 'object') {
    for (const [id, v] of Object.entries(r.lessons as Record<string, unknown>)) {
      if (!/^[a-c][12]-u\d{2}-l\d{2}$/.test(id) || !v || typeof v !== 'object') continue
      const l = v as Record<string, unknown>
      const done = Array.isArray(l.done) ? [...new Set(l.done.filter((s): s is number => isInt(s, 4)))].sort() : []
      out.lessons[id] = { done, best: isInt(l.best, 100) ? l.best : 0, total: isInt(l.total, 100) ? l.total : 0, passed: l.passed === true }
    }
  }
  if (r.srs && typeof r.srs === 'object') {
    for (const [k, v] of Object.entries(r.srs as Record<string, unknown>).slice(0, 6000)) {
      if (!CARD_KEY.test(k) || !v || typeof v !== 'object') continue
      const c = v as Record<string, unknown>
      if (!isNum(c.due, FAR_FUTURE) || !isNum(c.last, FAR_FUTURE)) continue
      out.srs[k] = { due: c.due, last: c.last, ivl: isNum(c.ivl, 3650) ? c.ivl : 0, reps: isInt(c.reps, 10000) ? c.reps : 0, lapses: isInt(c.lapses, 10000) ? c.lapses : 0 }
    }
  }
  // older saves kept a plain list of missed words: make them due now
  if (Array.isArray(r.review)) {
    for (const k of r.review) if (typeof k === 'string' && CARD_KEY.test(k) && !out.srs[k]) out.srs[k] = { due: 0, ivl: 0, reps: 0, lapses: 1, last: 0 }
  }
  if (r.activity && typeof r.activity === 'object') {
    for (const [d, v] of Object.entries(r.activity as Record<string, unknown>).slice(0, 1000)) if (DAY_KEY.test(d) && isInt(v, 100000)) out.activity[d] = v
  }
  out.xp = computeXp(out.lessons)
  return out
}

export interface ProgressStore {
  load(): Progress
  save(p: Progress): void
}

const KEY = 'deutsch-bd:progress:v1'

export const localStore: ProgressStore = {
  load() {
    try {
      return sanitizeProgress(JSON.parse(localStorage.getItem(KEY) || 'null'))
    } catch {
      return emptyProgress()
    }
  },
  save(p) {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* private mode or storage full: progress just won't persist */
    }
  },
}
