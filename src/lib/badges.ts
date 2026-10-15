import type { Progress } from './storage'
import { DAY } from './format'

export interface Badge {
  id: string
  icon: string
  bn: string // title
  desc: string // how to earn it (Bangla)
}

export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: '🌱', bn: 'প্রথম পদক্ষেপ', desc: 'প্রথম লেসন পাস করুন' },
  { id: 'lessons-10', icon: '📚', bn: 'নিয়মিত শিক্ষার্থী', desc: '১০টি লেসন পাস করুন' },
  { id: 'words-100', icon: '🔤', bn: '১০০ শব্দ', desc: '১০০টি শব্দ শিখুন' },
  { id: 'words-500', icon: '🧠', bn: '৫০০ শব্দ', desc: '৫০০টি শব্দ শিখুন' },
  { id: 'streak-3', icon: '🔥', bn: '৩ দিনের স্ট্রিক', desc: 'টানা ৩ দিন শিখুন' },
  { id: 'streak-7', icon: '⚡', bn: '১ সপ্তাহের স্ট্রিক', desc: 'টানা ৭ দিন শিখুন' },
  { id: 'streak-30', icon: '🏅', bn: '১ মাসের স্ট্রিক', desc: 'টানা ৩০ দিন শিখুন' },
  { id: 'perfect', icon: '⭐', bn: 'পুরো নম্বর', desc: 'একটি কুইজে সবগুলো সঠিক উত্তর দিন' },
  { id: 'review', icon: '🔁', bn: 'রিভিউ শুরু', desc: 'একটি শব্দ সফলভাবে রিভিউ করুন' },
  { id: 'xp-500', icon: '🚀', bn: '৫০০ XP', desc: 'মোট ৫০০ XP অর্জন করুন' },
  { id: 'xp-2000', icon: '💎', bn: '২০০০ XP', desc: 'মোট ২০০০ XP অর্জন করুন' },
  { id: 'placed', icon: '🎯', bn: 'লক্ষ্য ঠিক', desc: 'একটি প্লেসমেন্ট টেস্ট দিন' },
  { id: 'a1-done', icon: '🏆', bn: 'A1 সম্পূর্ণ', desc: 'A1-এর সব লেসন পাস করুন' },
  { id: 'a2-done', icon: '🥈', bn: 'A2 সম্পূর্ণ', desc: 'A2-এর সব লেসন পাস করুন' },
  { id: 'b1-done', icon: '🥇', bn: 'B1 সম্পূর্ণ', desc: 'B1-এর সব লেসন পাস করুন' },
]

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
