import type { Progress } from './storage'
import type { Celebration } from './celebrate'
import { BADGES, badgeDesc, badgeTitle, earnedBadges, type LessonRef } from './badges'
import { makeT, type Ui } from '../i18n/core'
import { dayKey, streak } from './stats'

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

export interface LessonTitle extends LessonRef {
  title: { bn: string; en: string }
}

/** What deserves a celebration when progress goes from `prev` to `next` (lesson passed, goal reached, streak milestone, new badge). */
export function announcements(prev: Progress, next: Progress, lessons: LessonTitle[], ui: Ui, now = Date.now()): Celebration[] {
  const t = makeT(ui)
  const out: Celebration[] = []

  const newly = lessons.filter((l) => next.lessons[l.id]?.passed && !prev.lessons[l.id]?.passed)
  if (newly.length > 0) out.push({ icon: '🎉', title: t('cele.lesson'), sub: ui === 'en' ? newly[0].title.en : newly[0].title.bn })

  const today = dayKey(now)
  if ((prev.activity[today] ?? 0) < next.goal && (next.activity[today] ?? 0) >= next.goal) {
    out.push({ icon: '🎯', title: t('cele.goal'), sub: t('cele.goalSub', { n: next.goal }) })
  }

  const before = streak(prev.activity, now)
  const after = streak(next.activity, now)
  const hit = STREAK_MILESTONES.filter((m) => before < m && after >= m).pop()
  if (hit) out.push({ icon: '🔥', title: t('cele.streak', { n: hit }), sub: t('cele.streakSub') })

  const had = earnedBadges(prev, lessons)
  for (const id of earnedBadges(next, lessons)) {
    if (had.has(id)) continue
    const b = BADGES.find((x) => x.id === id)!
    out.push({ icon: b.icon, title: t('cele.badge', { name: badgeTitle(t, id) }), sub: badgeDesc(t, id) })
  }
  return out
}
