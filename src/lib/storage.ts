/** Progress model and local storage. Everything goes through ProgressStore so sync can be layered on without touching components. */

export type Lang = 'bn' | 'en' | 'both'

export interface LessonProgress {
  done: number[] // completed step indexes
  best: number // best quiz score (correct answers)
  total: number // quiz length when best was set
  passed: boolean
}

export interface Progress {
  lang: Lang
  slow: boolean
  xp: number // always derived from lessons, see computeXp
  lessons: Record<string, LessonProgress>
  review: string[] // "<lessonId>:<wordId>" items answered wrong, waiting for spaced repetition
  updatedAt: number // ms since epoch of the last local change; decides which device's settings win
}

export const emptyProgress = (): Progress => ({ lang: 'both', slow: false, xp: 0, lessons: {}, review: [], updatedAt: 0 })

/** XP is derived, so merging two devices can never double-count: 10 per step 1–4, 5 per correct quiz answer (best run), 20 for the first pass. */
export function computeXp(lessons: Record<string, LessonProgress>): number {
  let xp = 0
  for (const lp of Object.values(lessons)) xp += 10 * lp.done.filter((s) => s >= 0 && s < 4).length + 5 * lp.best + (lp.passed ? 20 : 0)
  return xp
}

const isInt = (n: unknown, max: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max

/** Coerces untrusted JSON (localStorage, or the server) into a valid Progress. Unknown or malformed parts are dropped. */
export function sanitizeProgress(raw: unknown): Progress {
  const out = emptyProgress()
  if (!raw || typeof raw !== 'object') return out
  const r = raw as Record<string, unknown>
  if (r.lang === 'bn' || r.lang === 'en' || r.lang === 'both') out.lang = r.lang
  out.slow = r.slow === true
  if (typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt) && r.updatedAt >= 0) out.updatedAt = r.updatedAt
  if (r.lessons && typeof r.lessons === 'object') {
    for (const [id, v] of Object.entries(r.lessons as Record<string, unknown>)) {
      if (!/^[a-c][12]-u\d{2}-l\d{2}$/.test(id) || !v || typeof v !== 'object') continue
      const l = v as Record<string, unknown>
      const done = Array.isArray(l.done) ? [...new Set(l.done.filter((s): s is number => isInt(s, 4)))].sort() : []
      out.lessons[id] = { done, best: isInt(l.best, 100) ? l.best : 0, total: isInt(l.total, 100) ? l.total : 0, passed: l.passed === true }
    }
  }
  if (Array.isArray(r.review)) out.review = [...new Set(r.review.filter((x): x is string => typeof x === 'string' && x.length < 80))].slice(0, 5000)
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
