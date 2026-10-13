import { computeXp, type LessonProgress, type Progress } from './storage'

/** A server-side copy of one user's progress. */
export interface RemoteStore {
  load(): Promise<Progress | null>
  save(p: Progress): Promise<void>
}

/**
 * Merge two devices' progress. Only ever adds: steps are unioned, the best quiz score and the pass flag
 * only go up, review items are unioned. Because of that it is safe to merge in any order, any number of times.
 * Only settings (language, slow audio) are last-writer-wins, decided by updatedAt.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const lessons: Record<string, LessonProgress> = {}
  for (const id of new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)])) {
    const x = a.lessons[id]
    const y = b.lessons[id]
    if (!x || !y) {
      lessons[id] = { ...(x ?? y) }
      continue
    }
    const hi = y.best > x.best ? y : x
    lessons[id] = { done: [...new Set([...x.done, ...y.done])].sort(), best: hi.best, total: hi.total, passed: x.passed || y.passed }
  }
  const newer = b.updatedAt > a.updatedAt ? b : a
  return {
    lang: newer.lang,
    slow: newer.slow,
    lessons,
    review: [...new Set([...a.review, ...b.review])],
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    xp: computeXp(lessons),
  }
}

/** What counts as "the same" for sync purposes (ignores updatedAt, which changes on every local edit). */
export function progressKey(p: Progress): string {
  const ids = Object.keys(p.lessons).sort()
  return JSON.stringify([p.lang, p.slow, ids.map((id) => [id, p.lessons[id]]), [...p.review].sort()])
}

/** Pull → merge → push. Returns the merged progress; pushes only when the server copy is missing or different. */
export async function syncOnce(remote: RemoteStore, local: Progress): Promise<Progress> {
  const server = await remote.load()
  const merged = server ? mergeProgress(local, server) : local
  if (!server || progressKey(merged) !== progressKey(server)) await remote.save(merged)
  return merged
}
