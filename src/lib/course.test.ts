import { describe, expect, it } from 'vitest'
import type { LessonMeta } from './content'
import { greeting, groupUnits, isCore, lessonStates } from './course'

const m = (id: string, level: string, unit: number, lesson: number) => ({ id, level, unit, lesson, title: { de: '', bn: '', en: '' }, status: 'draft', minutes: 10, words: 5 }) as LessonMeta
const L = [m('a1-u01-l01', 'A1', 1, 1), m('a1-u01-l02', 'A1', 1, 2), m('a1-u02-l01', 'A1', 2, 1), m('a2-u01-l01', 'A2', 1, 1)]

describe('course helpers', () => {
  it('marks passed lessons done, the first unpassed one as now, the rest locked', () => {
    const s = lessonStates(L, (id) => id === 'a1-u01-l01')
    expect([...s.values()]).toEqual(['done', 'now', 'locked', 'locked'])
  })

  it('starts at the first lesson when nothing is passed, and ends with no "now" when all are', () => {
    expect(lessonStates(L, () => false).get('a1-u01-l01')).toBe('now')
    expect([...lessonStates(L, () => true).values()].every((v) => v === 'done')).toBe(true)
  })

  it('groups a level into ordered units', () => {
    const g = groupUnits(L, 'A1')
    expect(g.map((u) => [u.key, u.lessons.length])).toEqual([['A1-1', 2], ['A1-2', 1]])
  })

  it('keeps the optional Start here unit (unit 0) off the path: always open, never "now", never blocking', () => {
    const S = [m('a1-u00-l01', 'A1', 0, 1), m('a1-u00-l02', 'A1', 0, 2), ...L]
    const s = lessonStates(S, () => false)
    expect(['a1-u00-l01', 'a1-u00-l02'].map((id) => s.get(id))).toEqual(['open', 'open'])
    expect(s.get('a1-u01-l01')).toBe('now')
    expect(lessonStates(S, (id) => id === 'a1-u00-l01').get('a1-u00-l01')).toBe('done')
    expect(lessonStates(S, () => false, { unlockAll: true }).get('a1-u01-l01')).toBe('now')
    expect(isCore(S[0])).toBe(false)
    expect(isCore(S[2])).toBe(true)
    expect(groupUnits(S, 'A1')[0].key).toBe('A1-0')
  })

  it('greets by time of day', () => {
    expect([8, 14, 20].map(greeting)).toEqual(['Guten Morgen', 'Guten Tag', 'Guten Abend'])
  })
})
