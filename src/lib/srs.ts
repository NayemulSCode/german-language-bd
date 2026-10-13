import type { Card } from './storage'
import { DAY, MIN } from './format'

/** 0 = again, 1 = hard, 2 = good, 3 = easy */
export type Grade = 0 | 1 | 2 | 3

export const newCard = (now: number, dueIn = 0): Card => ({ due: now + dueIn, ivl: dueIn / DAY, reps: 0, lapses: 0, last: now })

/** Interval in days after answering with `g`; 0 means "again within the session". */
function nextIvlDays(c: Card, g: Grade): number {
  const learning = c.ivl < 1
  switch (g) {
    case 0: return 0
    case 1: return learning ? 0 : Math.max(1, Math.round(c.ivl * 1.2))
    case 2: return learning ? 1 : Math.min(365, Math.round(c.ivl * 2.2))
    case 3: return learning ? 4 : Math.min(365, Math.round(c.ivl * 3.5))
  }
}

/** How long until the card is due again if answered with `g` (shown on the rating buttons). */
export function intervalMs(c: Card, g: Grade): number {
  if (g === 0) return MIN
  if (g === 1 && c.ivl < 1) return 10 * MIN
  return nextIvlDays(c, g) * DAY
}

export function rateCard(c: Card, g: Grade, now: number): Card {
  return {
    due: now + intervalMs(c, g),
    ivl: nextIvlDays(c, g),
    reps: g === 0 ? 0 : c.reps + 1,
    lapses: g === 0 ? c.lapses + 1 : c.lapses,
    last: now,
  }
}

export const isDue = (c: Card, now: number) => c.due <= now
