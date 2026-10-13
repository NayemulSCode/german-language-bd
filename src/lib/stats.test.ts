import { describe, expect, it } from 'vitest'
import { DAY } from './format'
import { dayKey, daysUntil, heatLevel, recentWeeks, streak } from './stats'

const noon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime()

describe('stats', () => {
  it('dayKey is the local calendar date', () => {
    expect(dayKey(noon(2026, 3, 9))).toBe('2026-03-09')
  })

  it('counts consecutive days including today', () => {
    const now = noon(2026, 3, 9)
    expect(streak({ '2026-03-09': 10, '2026-03-08': 5, '2026-03-07': 5, '2026-03-05': 5 }, now)).toBe(3)
  })

  it('keeps the streak alive until the end of today when only yesterday is done', () => {
    const now = noon(2026, 3, 9)
    expect(streak({ '2026-03-08': 5, '2026-03-07': 5 }, now)).toBe(2)
  })

  it('is zero after a missed day', () => {
    expect(streak({ '2026-03-07': 5 }, noon(2026, 3, 9))).toBe(0)
    expect(streak({}, noon(2026, 3, 9))).toBe(0)
  })

  it('heat levels', () => {
    expect([0, 5, 25, 80].map(heatLevel)).toEqual([0, 1, 2, 3])
  })

  it('recentWeeks returns Monday-first full weeks ending this week', () => {
    const now = noon(2026, 3, 11) // a Wednesday
    const days = recentWeeks(5, now)
    expect(days).toHaveLength(35)
    expect(new Date(days[0] + 'T12:00:00').getDay()).toBe(1) // Monday
    expect(days).toContain('2026-03-11')
    expect(days[days.length - 1]).toBe(dayKey(noon(2026, 3, 11) + 4 * DAY)) // Sunday of this week
  })

  it('daysUntil never goes negative', () => {
    expect(daysUntil('2026-03-12', noon(2026, 3, 9))).toBe(3)
    expect(daysUntil('2026-03-01', noon(2026, 3, 9))).toBe(0)
  })
})
