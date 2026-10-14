import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../schema/lesson'
import { lessonStates } from './course'
import type { LessonMeta } from './content'
import { pickQuestions, placementResult } from './placement'

const dir = new URL('../../content/a1/', import.meta.url).pathname
const lessons = readdirSync(dir).sort().flatMap((u) => readdirSync(join(dir, u)).sort().map((f) => Lesson.parse(JSON.parse(readFileSync(join(dir, u, f), 'utf8')))))

describe('pickQuestions', () => {
  const items = pickQuestions(lessons)
  it('asks two questions for each of the ten A1 units, easiest first', () => {
    expect(items).toHaveLength(20)
    expect(items.map((i) => i.unit)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10])
  })
  it('never asks a listening question and never repeats one within a unit', () => {
    expect(items.every((i) => i.q.type !== 'listen')).toBe(true)
    for (let u = 1; u <= 10; u++) {
      const qs = items.filter((i) => i.unit === u).map((i) => i.q)
      expect(new Set(qs).size).toBe(qs.length)
    }
  })
  it('is deterministic', () => {
    expect(pickQuestions(lessons).map((i) => i.q.prompt)).toEqual(items.map((i) => i.q.prompt))
  })
})

describe('pickQuestions for A2', () => {
  const dirA2 = new URL('../../content/a2/', import.meta.url).pathname
  const a2 = readdirSync(dirA2).sort().flatMap((u) => readdirSync(join(dirA2, u)).sort().map((f) => Lesson.parse(JSON.parse(readFileSync(join(dirA2, u, f), 'utf8')))))
  const items = pickQuestions(a2, 'A2')
  it('asks two non-listening questions for each of the twelve A2 units', () => {
    expect(items.map((i) => i.unit)).toEqual(Array.from({ length: 12 }, (_, k) => [k + 1, k + 1]).flat())
    expect(items.every((i) => i.q.type !== 'listen')).toBe(true)
  })
  it('ignores A1 lessons', () => {
    expect(pickQuestions(lessons, 'A2')).toEqual([])
  })
  it('starts at the last unit when all are right', () => {
    expect(placementResult(items, items.map(() => true)).startUnit).toBe(12)
  })
})

describe('placementResult', () => {
  const items = pickQuestions(lessons)
  const answers = (wrongAt: number[]) => items.map((_, i) => !wrongAt.includes(i))
  it('starts at the first unit with a mistake', () => {
    expect(placementResult(items, answers([5])).startUnit).toBe(3) // question 5 belongs to unit 3
    expect(placementResult(items, answers([0, 1])).startUnit).toBe(1)
  })
  it('starts at the last unit when everything is right', () => {
    const r = placementResult(items, answers([]))
    expect(r.startUnit).toBe(10)
    expect(r.perfect).toBe(true)
  })
  it('reports per-unit scores', () => {
    const r = placementResult(items, answers([2]))
    expect(r.perUnit[1]).toEqual({ unit: 2, correct: 1, total: 2 })
    expect(r.perUnit).toHaveLength(10)
  })
})

describe('lessonStates with placement and unlock-all', () => {
  const m = (id: string, unit: number, lesson: number) => ({ id, level: 'A1', unit, lesson, title: { de: '', bn: '', en: '' }, status: 'draft', minutes: 5, words: 1 }) as LessonMeta
  const L = [m('a1-u01-l01', 1, 1), m('a1-u01-l02', 1, 2), m('a1-u02-l01', 2, 1), m('a1-u03-l01', 3, 1), m('a1-u03-l02', 3, 2)]
  const states = (o: Parameters<typeof lessonStates>[2], passed: string[] = []) => [...lessonStates(L, (id) => passed.includes(id), o).values()]

  it('units before the placement are open, the placed unit is "now", the rest locked', () => {
    expect(states({ startUnit: 3 })).toEqual(['open', 'open', 'open', 'now', 'locked'])
  })
  it('an A2 placement opens all of A1 and the earlier A2 units', () => {
    const M = (id: string, level: string, unit: number) => ({ id, level, unit, lesson: 1, title: { de: '', bn: '', en: '' }, status: 'draft', minutes: 5, words: 1 }) as LessonMeta
    const LL = [M('a1-u01-l01', 'A1', 1), M('a1-u02-l01', 'A1', 2), M('a2-u01-l01', 'A2', 1), M('a2-u02-l01', 'A2', 2), M('a2-u03-l01', 'A2', 3)]
    expect([...lessonStates(LL, () => false, { startUnitA2: 2 }).values()]).toEqual(['open', 'open', 'open', 'now', 'locked'])
    expect([...lessonStates(LL, () => false, { startUnitA2: 0 }).values()]).toEqual(['now', 'locked', 'locked', 'locked', 'locked'])
  })
  it('passed lessons stay done and progress continues from the placed unit', () => {
    expect(states({ startUnit: 3 }, ['a1-u03-l01'])).toEqual(['open', 'open', 'open', 'done', 'now'])
  })
  it('unlock-all opens everything and keeps one natural next lesson', () => {
    expect(states({ unlockAll: true }, ['a1-u01-l01'])).toEqual(['done', 'now', 'open', 'open', 'open'])
  })
  it('default behaviour is unchanged', () => {
    expect(states({})).toEqual(['now', 'locked', 'locked', 'locked', 'locked'])
  })
})
