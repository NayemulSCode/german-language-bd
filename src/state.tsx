import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { computeXp, localStore, type Lang, type LessonProgress, type Progress } from './lib/storage'
import { mergeProgress, progressKey, syncOnce } from './lib/sync'
import { speak } from './lib/audio'
import { useAuth } from './auth'

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'error'

interface Ctx {
  progress: Progress
  syncStatus: SyncStatus
  syncNow(): void
  setLang(l: Lang): void
  setSlow(s: boolean): void
  say(text: string): Promise<void>
  lessonProgress(id: string): LessonProgress
  completeStep(lessonId: string, step: number): void
  finishQuiz(lessonId: string, r: { score: number; total: number; passed: boolean; wrong: string[] }): void
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
      const stamped = { ...next, xp: computeXp(next.lessons), updatedAt: Date.now() }
      localStore.save(stamped)
      return stamped
    })
  }, [])

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
          return {
            ...p,
            review: [...new Set([...p.review, ...r.wrong.map((w) => `${lessonId}:${w}`)])],
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
