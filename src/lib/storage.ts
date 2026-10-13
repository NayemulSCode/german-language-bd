/** Progress storage. Everything goes through this interface so a Supabase sync layer can be added without touching components. */

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
  xp: number
  lessons: Record<string, LessonProgress>
  review: string[] // "<lessonId>:<wordId>" items answered wrong, waiting for spaced repetition
}

export const emptyProgress = (): Progress => ({ lang: 'both', slow: false, xp: 0, lessons: {}, review: [] })

export interface ProgressStore {
  load(): Progress
  save(p: Progress): void
}

const KEY = 'deutsch-bd:progress:v1'

export const localStore: ProgressStore = {
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
      return raw ? { ...emptyProgress(), ...raw } : emptyProgress()
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
