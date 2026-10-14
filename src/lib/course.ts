import type { LessonMeta } from './content'

/** done = passed; now = the next lesson to do; open = can be started but is not the next one; locked = not yet. */
export type LessonState = 'done' | 'now' | 'open' | 'locked'

export interface StateOptions {
  startUnit?: number // A1 units below this are open (placement result)
  startUnitA2?: number // A2 placement: when set (≥ 1), all of A1 and the A2 units below this are open
  unlockAll?: boolean // nothing is locked
}

export function lessonStates(lessons: LessonMeta[], passed: (id: string) => boolean, opts: StateOptions = {}): Map<string, LessonState> {
  const out = new Map<string, LessonState>()
  const start = opts.startUnit ?? 1
  const a2 = opts.startUnitA2 && opts.startUnitA2 >= 1 ? opts.startUnitA2 : 0
  const skipped = (l: LessonMeta) => (l.level === 'A1' && (a2 > 0 || l.unit < start)) || (l.level === 'A2' && l.unit < a2)
  let foundNow = false
  for (const l of lessons) {
    if (passed(l.id)) out.set(l.id, 'done')
    else if (opts.unlockAll || skipped(l)) out.set(l.id, 'open')
    else if (!foundNow) {
      out.set(l.id, 'now')
      foundNow = true
    } else out.set(l.id, 'locked')
  }
  // with everything unlocked there is still a natural "next": the first lesson not passed
  if (opts.unlockAll && !foundNow) {
    const first = lessons.find((l) => !passed(l.id) && !skipped(l))
    if (first) out.set(first.id, 'now')
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
