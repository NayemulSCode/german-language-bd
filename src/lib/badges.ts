import type { Progress } from './storage'
import { DAY } from './format'
import type { Key, T } from '../i18n/core'

export interface Badge {
  id: string
  icon: string
}

/** Titles and how-to-earn text live in the dictionaries as `badge.<id>.t` and `badge.<id>.d`. */
export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: '🌱' },
  { id: 'lessons-10', icon: '📚' },
  { id: 'words-100', icon: '🔤' },
  { id: 'words-500', icon: '🧠' },
  { id: 'streak-3', icon: '🔥' },
  { id: 'streak-7', icon: '⚡' },
  { id: 'streak-30', icon: '🏅' },
  { id: 'perfect', icon: '⭐' },
  { id: 'review', icon: '🔁' },
  { id: 'xp-500', icon: '🚀' },
  { id: 'xp-2000', icon: '💎' },
  { id: 'placed', icon: '🎯' },
  { id: 'a1-done', icon: '🏆' },
  { id: 'a2-done', icon: '🥈' },
  { id: 'b1-done', icon: '🥇' },
]

export const badgeTitle = (t: T, id: string) => t(`badge.${id}.t` as Key)
export const badgeDesc = (t: T, id: string) => t(`badge.${id}.d` as Key)

export interface LessonRef {
  id: string
  level: string
  words: number
}

/** Longest run of consecutive active days ever (a badge must not vanish when the current streak breaks). */
export function longestStreak(activity: Record<string, number>): number {
  const days = Object.keys(activity).filter((d) => activity[d] > 0).sort()
  let best = 0
  let run = 0
  let prev = NaN
  for (const d of days) {
    const t = new Date(d + 'T12:00:00').getTime()
    run = Math.round((t - prev) / DAY) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = t
  }
  return best
}

/** Badges are derived from progress, so they sync and merge for free and can never be double-counted. */
export function earnedBadges(p: Progress, lessons: LessonRef[]): Set<string> {
  const passed = lessons.filter((l) => p.lessons[l.id]?.passed)
  const words = passed.reduce((n, l) => n + l.words, 0)
  const best = longestStreak(p.activity)
  const levelDone = (lv: string) => {
    const all = lessons.filter((l) => l.level === lv)
    return all.length > 0 && all.every((l) => p.lessons[l.id]?.passed)
  }
  const checks: Record<string, boolean> = {
    'first-lesson': passed.length >= 1,
    'lessons-10': passed.length >= 10,
    'words-100': words >= 100,
    'words-500': words >= 500,
    'streak-3': best >= 3,
    'streak-7': best >= 7,
    'streak-30': best >= 30,
    perfect: Object.values(p.lessons).some((l) => l.total >= 5 && l.best === l.total),
    review: Object.values(p.srs).some((c) => c.reps >= 1),
    'xp-500': p.xp >= 500,
    'xp-2000': p.xp >= 2000,
    placed: p.placed || p.startUnitA2 > 0 || p.startUnitB1 > 0,
    'a1-done': levelDone('A1'),
    'a2-done': levelDone('A2'),
    'b1-done': levelDone('B1'),
  }
  return new Set(BADGES.filter((b) => checks[b.id]).map((b) => b.id))
}
