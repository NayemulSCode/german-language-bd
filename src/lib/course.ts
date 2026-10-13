import type { LessonMeta } from './content'

export type LessonState = 'done' | 'now' | 'locked'

/** done = quiz passed; now = the first lesson not yet passed; everything after it is locked. */
export function lessonStates(lessons: LessonMeta[], passed: (id: string) => boolean): Map<string, LessonState> {
  const out = new Map<string, LessonState>()
  let foundNow = false
  for (const l of lessons) {
    if (passed(l.id)) out.set(l.id, 'done')
    else if (!foundNow) {
      out.set(l.id, 'now')
      foundNow = true
    } else out.set(l.id, 'locked')
  }
  return out
}

export interface UnitGroup {
  key: string // "A1-3"
  level: string
  unit: number
  lessons: LessonMeta[]
}

export function groupUnits(lessons: LessonMeta[], level: string): UnitGroup[] {
  const map = new Map<number, LessonMeta[]>()
  for (const l of lessons) if (l.level === level) map.set(l.unit, [...(map.get(l.unit) ?? []), l])
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([unit, ls]) => ({ key: `${level}-${unit}`, level, unit, lessons: ls }))
}

export const greeting = (hour: number) => (hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend')
