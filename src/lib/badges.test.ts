import { describe, expect, it } from 'vitest'
import { emptyProgress, type Progress } from './storage'
import { earnedBadges, longestStreak, type LessonRef } from './badges'
import { announcements, type LessonTitle } from './announce'

const L: LessonTitle[] = [
  { id: 'a1-u01-l01', level: 'A1', words: 60, title: { bn: 'এক' } },
  { id: 'a1-u01-l02', level: 'A1', words: 60, title: { bn: 'দুই' } },
]
const passed = (ids: string[], extra: Partial<Progress> = {}): Progress => ({
  ...emptyProgress(),
  lessons: Object.fromEntries(ids.map((id) => [id, { done: [0, 1, 2, 3, 4], best: 6, total: 8, passed: true }])),
  ...extra,
})
const noon = (m: number, d: number) => new Date(2026, m - 1, d, 12).getTime()

describe('badges', () => {
  it('finds the longest run of active days, not the current one', () => {
    expect(longestStreak({ '2026-03-01': 5, '2026-03-02': 5, '2026-03-03': 5, '2026-03-09': 5 })).toBe(3)
    expect(longestStreak({})).toBe(0)
    expect(longestStreak({ '2026-03-01': 0 })).toBe(0)
  })

  it('earns lesson, word and level badges from passed lessons', () => {
    const none = earnedBadges(emptyProgress(), L as LessonRef[])
    expect(none.size).toBe(0)
    const one = earnedBadges(passed(['a1-u01-l01']), L)
    expect(one.has('first-lesson')).toBe(true)
    expect(one.has('a1-done')).toBe(false)
    const all = earnedBadges(passed(['a1-u01-l01', 'a1-u01-l02']), L)
    expect(all.has('a1-done')).toBe(true)
    expect(all.has('words-100')).toBe(true)
    expect(all.has('a2-done')).toBe(false) // no A2 lessons in the list: never "done"
  })

  it('earns perfect only on a real (5+) full-marks quiz', () => {
    expect(earnedBadges(passed([], { lessons: { x: { done: [], best: 3, total: 3, passed: true } } }), L).has('perfect')).toBe(false)
    expect(earnedBadges(passed([], { lessons: { x: { done: [], best: 8, total: 8, passed: true } } }), L).has('perfect')).toBe(true)
  })
})

describe('announcements', () => {
  const now = noon(3, 9)
  const key = '2026-03-09'

  it('celebrates a newly passed lesson together with its first-lesson badge', () => {
    const a = announcements(emptyProgress(), passed(['a1-u01-l01']), L, now)
    expect(a.map((c) => c.title)).toEqual(['লেসন পাস!', 'নতুন ব্যাজ: প্রথম পদক্ষেপ'])
  })

  it('does not repeat for a lesson that was already passed', () => {
    expect(announcements(passed(['a1-u01-l01']), passed(['a1-u01-l01']), L, now)).toEqual([])
  })

  it('fires once when today crosses the daily goal', () => {
    const before = { ...emptyProgress(), goal: 20, activity: { [key]: 15 } }
    const after = { ...before, activity: { [key]: 25 } }
    expect(announcements(before, after, L, now).map((c) => c.title)).toEqual(['দৈনিক লক্ষ্য পূরণ!'])
    expect(announcements(after, { ...after, activity: { [key]: 40 } }, L, now)).toEqual([])
  })

  it('fires on a streak milestone', () => {
    const before = { ...emptyProgress(), activity: { '2026-03-07': 5, '2026-03-08': 5 } }
    const after = { ...before, activity: { ...before.activity, [key]: 5 } }
    const titles = announcements(before, after, L, now).map((c) => c.title)
    expect(titles).toContain('৩ দিনের স্ট্রিক!')
  })
})
