import { DAY } from './format'

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(ts = Date.now()): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Consecutive days with activity, counting back from today (or from yesterday if nothing yet today). */
export function streak(activity: Record<string, number>, now = Date.now()): number {
  let n = 0
  let t = now
  if (!(activity[dayKey(t)] > 0)) t -= DAY
  while (activity[dayKey(t)] > 0) {
    n++
    t -= DAY
  }
  return n
}

/** 0 (none) … 3 (a lot) for the heatmap. */
export const heatLevel = (xp: number) => (xp <= 0 ? 0 : xp < 20 ? 1 : xp < 50 ? 2 : 3)

/** The last `weeks` weeks as Monday-first rows of day keys, ending with the current week. */
export function recentWeeks(weeks: number, now = Date.now()): string[] {
  const d = new Date(now)
  const sinceMonday = (d.getDay() + 6) % 7
  const start = now - sinceMonday * DAY - (weeks - 1) * 7 * DAY
  return Array.from({ length: weeks * 7 }, (_, i) => dayKey(start + i * DAY))
}

/** Whole days from today until an ISO date (0 if it is today or past). */
export function daysUntil(iso: string, now = Date.now()): number {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / DAY))
}
