import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { computeXp, localStore, type Card, type Lang, type LessonProgress, type Progress, type Theme } from './lib/storage'
import { mergeProgress, progressKey, syncOnce } from './lib/sync'
import { dayKey } from './lib/stats'
import { DAY } from './lib/format'
import { newCard, rateCard as nextCard, type Grade } from './lib/srs'
import { speak } from './lib/audio'
import { useAuth } from './auth'

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'error'

interface Ctx {
  progress: Progress
  syncStatus: SyncStatus
  syncNow(): void
  setLang(l: Lang): void
  setSlow(s: boolean): void
  setSettings(patch: Partial<Pick<Progress, 'theme' | 'goal' | 'name' | 'examDate'>> & { theme?: Theme }): void
  rateCard(key: string, grade: Grade): void
  say(text: string): Promise<void>
  lessonProgress(id: string): LessonProgress
  completeStep(lessonId: string, step: number): void
  finishQuiz(lessonId: string, r: { score: number; total: number; passed: boolean; wrong: string[]; wordIds: string[] }): void
}

const C = createContext<Ctx | null>(null)
const blank: LessonProgress = { done: [], best: 0, total: 0, passed: false }

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { remote } = useAuth()
  const [progress, setProgress] = useState<Progress>(() => localStore.load())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off')
  const latest = useRef(progress)
  latest.current = progress
  const serverKey = useRef('') // what the server is known to hold, so we only sync real changes
  const running = useRef(false)

  // every local change: derive XP from lessons, stamp the time, persist
  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev)
      if (next === prev) return prev
      const xp = computeXp(next.lessons)
      const now = Date.now()
      // XP earned by this change counts toward today (daily goal, streak, heatmap)
      const gained = xp - computeXp(prev.lessons)
      const activity = gained > 0 ? { ...next.activity, [dayKey(now)]: (next.activity[dayKey(now)] ?? 0) + gained } : next.activity
      const stamped = { ...next, xp, activity, updatedAt: now }
      localStore.save(stamped)
      return stamped
    })
  }, [])

  // the chosen theme overrides the system light/dark setting (CSS keys off data-app-theme)
  useEffect(() => {
    const root = document.documentElement
    if (progress.theme === 'system') root.removeAttribute('data-app-theme')
    else root.setAttribute('data-app-theme', progress.theme)
  }, [progress.theme])

  const runSync = useCallback(async () => {
    if (!remote || running.current) return
    running.current = true
    setSyncStatus('syncing')
    try {
      const merged = await syncOnce(remote, latest.current)
      serverKey.current = progressKey(merged)
      // keep anything the learner did while the request was in flight
      setProgress((prev) => {
        const m = mergeProgress(prev, merged)
        localStore.save(m)
        return progressKey(m) === progressKey(prev) ? prev : m
      })
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    } finally {
      running.current = false
    }
  }, [remote])

  // signed in (or signed out)
  useEffect(() => {
    if (!remote) {
      serverKey.current = ''
      setSyncStatus('off')
      return
    }
    void runSync()
  }, [remote, runSync])

  // push changes shortly after they happen
  useEffect(() => {
    if (!remote || progressKey(progress) === serverKey.current) return
    const t = setTimeout(() => void runSync(), 1500)
    return () => clearTimeout(t)
  }, [progress, remote, runSync])

  // catch up when the device comes back online or the tab regains focus
  useEffect(() => {
    if (!remote) return
    const again = () => void runSync()
    window.addEventListener('online', again)
    window.addEventListener('focus', again)
    return () => {
      window.removeEventListener('online', again)
      window.removeEventListener('focus', again)
    }
  }, [remote, runSync])

  const value = useMemo<Ctx>(
    () => ({
      progress,
      syncStatus,
      syncNow: () => void runSync(),
      setLang: (lang) => update((p) => ({ ...p, lang })),
      setSlow: (slow) => update((p) => ({ ...p, slow })),
      setSettings: (patch) => update((p) => ({ ...p, ...patch })),
      rateCard: (key, grade) =>
        update((p) => {
          const c = p.srs[key]
          return c ? { ...p, srs: { ...p.srs, [key]: nextCard(c, grade, Date.now()) } } : p
        }),
      say: (text) => speak(text, { slow: progress.slow }),
      lessonProgress: (id) => progress.lessons[id] ?? blank,
      completeStep: (lessonId, step) =>
        update((p) => {
          const lp = p.lessons[lessonId] ?? blank
          if (lp.done.includes(step)) return p
          return { ...p, lessons: { ...p.lessons, [lessonId]: { ...lp, done: [...lp.done, step].sort() } } }
        }),
      finishQuiz: (lessonId, r) =>
        update((p) => {
          const lp = p.lessons[lessonId] ?? blank
          const better = r.score >= lp.best
          const now = Date.now()
          const srs: Record<string, Card> = { ...p.srs }
          // words answered wrong are due for review right away
          for (const w of r.wrong) {
            const k = `${lessonId}:${w}`
            srs[k] = { ...newCard(now), lapses: (srs[k]?.lapses ?? 0) + 1 }
          }
          // passing a lesson puts all of its words into the review cycle, first review tomorrow
          if (r.passed && !lp.passed) for (const w of r.wordIds) srs[`${lessonId}:${w}`] ??= newCard(now, DAY)
          return {
            ...p,
            srs,
            lessons: {
              ...p.lessons,
              [lessonId]: {
                done: lp.done.includes(4) ? lp.done : [...lp.done, 4].sort(),
                best: better ? r.score : lp.best,
                total: better ? r.total : lp.total,
                passed: lp.passed || r.passed,
              },
            },
          }
        }),
    }),
    [progress, syncStatus, runSync, update],
  )
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useApp() {
  const v = useContext(C)
  if (!v) throw new Error('useApp outside ProgressProvider')
  return v
}
