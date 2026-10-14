import type { Lesson, Question } from '../schema/lesson'

export interface PlacementItem {
  unit: number
  q: Question
}

export const PER_UNIT = 2

/**
 * Two questions per unit of the level (A1 or A2), from the first and the last lesson of the unit (so they differ and the later one is harder),
 * easiest unit first. Listening questions are left out so the test never depends on the device's voice.
 */
export function pickQuestions(lessons: Lesson[], level: 'A1' | 'A2' | 'B1' = 'A1'): PlacementItem[] {
  const byUnit = new Map<number, Lesson[]>()
  for (const l of lessons) if (l.level === level) byUnit.set(l.unit, [...(byUnit.get(l.unit) ?? []), l])
  const items: PlacementItem[] = []
  for (const unit of [...byUnit.keys()].sort((a, b) => a - b)) {
    const ls = byUnit.get(unit)!.sort((a, b) => a.lesson - b.lesson)
    const used = new Set<Question>()
    for (let k = 0; k < PER_UNIT; k++) {
      const lesson = k === 0 ? ls[0] : ls[ls.length - 1]
      const pool = lesson.quiz.filter((q) => q.type !== 'listen' && !used.has(q))
      const from = pool.length ? pool : lesson.quiz.filter((q) => !used.has(q))
      const q = from[(unit * 5 + k * 3) % from.length]
      used.add(q)
      items.push({ unit, q })
    }
  }
  return items
}

export interface PlacementResult {
  startUnit: number
  perUnit: { unit: number; correct: number; total: number }[]
  perfect: boolean
}

/** The first unit with a mistake is where to start; with no mistakes at all, the last unit (so there is still something to do). */
export function placementResult(items: PlacementItem[], correct: boolean[]): PlacementResult {
  const map = new Map<number, { correct: number; total: number }>()
  items.forEach((it, i) => {
    const e = map.get(it.unit) ?? { correct: 0, total: 0 }
    e.total++
    if (correct[i]) e.correct++
    map.set(it.unit, e)
  })
  const perUnit = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([unit, e]) => ({ unit, ...e }))
  const weak = perUnit.find((u) => u.correct < u.total)
  return { startUnit: weak ? weak.unit : perUnit[perUnit.length - 1]?.unit ?? 1, perUnit, perfect: !weak }
}
