import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { localStore, type Lang, type LessonProgress, type Progress } from './lib/storage'
import { speak } from './lib/audio'

interface Ctx {
  progress: Progress
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
  const [progress, setProgress] = useState<Progress>(() => localStore.load())

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev)
      localStore.save(next)
      return next
    })
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      progress,
      setLang: (lang) => update((p) => ({ ...p, lang })),
      setSlow: (slow) => update((p) => ({ ...p, slow })),
      say: (text) => speak(text, { slow: progress.slow }),
      lessonProgress: (id) => progress.lessons[id] ?? blank,
      // XP is only awarded the first time a step is completed, so repeating steps can't farm points
      completeStep: (lessonId, step) =>
        update((p) => {
          const lp = p.lessons[lessonId] ?? blank
          if (lp.done.includes(step)) return p
          return { ...p, xp: p.xp + 10, lessons: { ...p.lessons, [lessonId]: { ...lp, done: [...lp.done, step] } } }
        }),
      // quiz XP: 5 per newly-better correct answer, plus a one-time 20 for the first pass
      finishQuiz: (lessonId, r) =>
        update((p) => {
          const lp = p.lessons[lessonId] ?? blank
          const gain = Math.max(0, r.score - lp.best) * 5 + (r.passed && !lp.passed ? 20 : 0)
          const better = r.score >= lp.best
          const review = [...new Set([...p.review, ...r.wrong.map((w) => `${lessonId}:${w}`)])]
          return {
            ...p,
            xp: p.xp + gain,
            review,
            lessons: {
              ...p.lessons,
              [lessonId]: {
                done: lp.done.includes(4) ? lp.done : [...lp.done, 4],
                best: better ? r.score : lp.best,
                total: better ? r.total : lp.total,
                passed: lp.passed || r.passed,
              },
            },
          }
        }),
    }),
    [progress, update],
  )
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useApp() {
  const v = useContext(C)
  if (!v) throw new Error('useApp outside ProgressProvider')
  return v
}
