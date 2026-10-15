import type { Progress } from './storage'
import type { Celebration } from './celebrate'
import { BADGES, earnedBadges, type LessonRef } from './badges'
import { bn } from './format'
import { dayKey, streak } from './stats'

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

export interface LessonTitle extends LessonRef {
  title: { bn: string }
}

/** What deserves a celebration when progress goes from `prev` to `next` (lesson passed, goal reached, streak milestone, new badge). */
export function announcements(prev: Progress, next: Progress, lessons: LessonTitle[], now = Date.now()): Celebration[] {
  const out: Celebration[] = []

  const newly = lessons.filter((l) => next.lessons[l.id]?.passed && !prev.lessons[l.id]?.passed)
  if (newly.length > 0) out.push({ icon: '🎉', title: 'লেসন পাস!', sub: newly[0].title.bn })

  const today = dayKey(now)
  if ((prev.activity[today] ?? 0) < next.goal && (next.activity[today] ?? 0) >= next.goal) {
    out.push({ icon: '🎯', title: 'দৈনিক লক্ষ্য পূরণ!', sub: `আজ ${bn(next.goal)} XP হয়ে গেছে — দারুণ!` })
  }

  const before = streak(prev.activity, now)
  const after = streak(next.activity, now)
  const hit = STREAK_MILESTONES.filter((m) => before < m && after >= m).pop()
  if (hit) out.push({ icon: '🔥', title: `${bn(hit)} দিনের স্ট্রিক!`, sub: 'টানা শেখা চালিয়ে যান' })

  const had = earnedBadges(prev, lessons)
  for (const id of earnedBadges(next, lessons)) {
    if (had.has(id)) continue
    const b = BADGES.find((x) => x.id === id)!
    out.push({ icon: b.icon, title: `নতুন ব্যাজ: ${b.bn}`, sub: b.desc })
  }
  return out
}
