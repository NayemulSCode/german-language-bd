import { describe, expect, it } from 'vitest'
import { DAY, MIN, fmtInterval, bn } from './format'
import { makeT } from '../i18n/core'
import { intervalMs, isDue, newCard, rateCard } from './srs'

const NOW = 1_700_000_000_000

const t = makeT('bn')

describe('spaced repetition', () => {
  it('a new card is due immediately and offers 1 min / 10 min / 1 day / 4 days', () => {
    const c = newCard(NOW)
    expect(isDue(c, NOW)).toBe(true)
    expect([0, 1, 2, 3].map((g) => intervalMs(c, g as 0 | 1 | 2 | 3))).toEqual([MIN, 10 * MIN, DAY, 4 * DAY])
  })

  it('good reviews push the interval out; again resets it', () => {
    let c = newCard(NOW)
    c = rateCard(c, 2, NOW) // 1 day
    expect(c.ivl).toBe(1)
    c = rateCard(c, 2, NOW) // 2 days
    c = rateCard(c, 2, NOW) // 4–5 days
    expect(c.ivl).toBeGreaterThan(3)
    expect(c.reps).toBe(3)
    const lapsed = rateCard(c, 0, NOW)
    expect(lapsed.ivl).toBe(0)
    expect(lapsed.reps).toBe(0)
    expect(lapsed.lapses).toBe(1)
    expect(lapsed.due).toBe(NOW + MIN)
  })

  it('easy grows faster than good, hard slower', () => {
    const c = { ...newCard(NOW), ivl: 10 }
    expect(rateCard(c, 3, NOW).ivl).toBeGreaterThan(rateCard(c, 2, NOW).ivl)
    expect(rateCard(c, 2, NOW).ivl).toBeGreaterThan(rateCard(c, 1, NOW).ivl)
  })

  it('never schedules more than a year out', () => {
    expect(rateCard({ ...newCard(NOW), ivl: 300 }, 3, NOW).ivl).toBe(365)
  })

  it('formats intervals in Bangla', () => {
    expect(fmtInterval(MIN, t)).toBe('১ মিনিট')
    expect(fmtInterval(10 * MIN, t)).toBe('১০ মিনিট')
    expect(fmtInterval(DAY, t)).toBe('১ দিন')
    expect(fmtInterval(4 * DAY, t)).toBe('৪ দিন')
    expect(fmtInterval(90 * DAY, t)).toBe('৩ মাস')
    expect(bn(2026)).toBe('২০২৬')
  })

  it('formats intervals in English with Western digits', () => {
    const en = makeT('en')
    expect(fmtInterval(10 * MIN, en)).toBe('10 min')
    expect(fmtInterval(4 * DAY, en)).toBe('4 d')
  })
})
