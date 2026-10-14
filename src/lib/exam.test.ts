import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Exam } from '../schema/exam'
import { checkExam } from '../../scripts/validate-content'
import { missed, scoreExam, type Answers } from './exam'

const raw = JSON.parse(readFileSync(new URL('../../exams/a1-mock-01.json', import.meta.url), 'utf8'))
const exam = Exam.parse(raw)

const correctAnswers = (): Answers => exam.parts.map((p) => p.questions.map((q) => (q.type === 'order' ? null : q.answer)))

describe('A1 mock exam content', () => {
  it('passes the content checks', () => {
    expect(checkExam(raw)).toEqual([])
  })
  it('has ten listening and ten reading questions, none of them ordering tasks', () => {
    expect(exam.parts.map((p) => [p.kind, p.questions.length])).toEqual([['hoeren', 10], ['lesen', 10]])
    expect(exam.parts.flatMap((p) => p.questions).every((q) => q.type !== 'order')).toBe(true)
  })
  it('does not always put the right answer in the same position', () => {
    const positions = new Set(exam.parts.flatMap((p) => p.questions.map((q) => (q.type === 'order' ? -1 : q.answer))))
    expect(positions.size).toBeGreaterThan(1)
  })
  it('reading questions carry a passage and listening questions carry audio text', () => {
    for (const q of exam.parts[0].questions) expect(q.type === 'listen' && q.say.length > 20).toBe(true)
    for (const q of exam.parts[1].questions) expect(q.type === 'mcq' && !!q.passage).toBe(true)
  })
})

describe('scoreExam', () => {
  it('gives full marks and a pass for all-correct answers', () => {
    const s = scoreExam(exam, correctAnswers())
    expect(s.correct).toBe(20)
    expect(s.pct).toBe(1)
    expect(s.passed).toBe(true)
    expect(s.parts).toEqual([{ correct: 10, total: 10 }, { correct: 10, total: 10 }])
  })
  it('counts unanswered questions as wrong', () => {
    const s = scoreExam(exam, [[], []])
    expect(s.correct).toBe(0)
    expect(s.passed).toBe(false)
  })
  it('passes at exactly 60% and not below', () => {
    const a = correctAnswers()
    // make 8 wrong → 12/20 = 60%
    const flip = (x: number | null) => (x === 0 ? 1 : 0)
    let wrong = 0
    for (const part of a) for (let i = 0; i < part.length && wrong < 8; i++, wrong++) part[i] = flip(part[i])
    expect(scoreExam(exam, a).correct).toBe(12)
    expect(scoreExam(exam, a).passed).toBe(true)
    a[1][9] = flip(a[1][9])
    expect(scoreExam(exam, a).passed).toBe(false)
  })
})

describe('missed', () => {
  it('lists skipped and wrong questions only', () => {
    const a = correctAnswers()
    a[0][2] = null
    a[1][0] = a[1][0] === 0 ? 1 : 0
    expect(missed(exam, a).map((m) => [m.part, m.index])).toEqual([[0, 2], [1, 0]])
  })
})
