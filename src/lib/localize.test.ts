import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Lesson } from '../schema/lesson'
import { coverage, localizeLesson, translatable } from './localize'
import { checkOverlay, checkGlossary } from '../../scripts/validate-content'

const lesson = (): Lesson => JSON.parse(readFileSync(new URL('../../content/a1/unit01/lesson01.json', import.meta.url), 'utf8'))

describe('localizeLesson', () => {
  it('finds the Bangla teaching text and nothing that is German or already bilingual', () => {
    const paths = [...translatable(lesson())].map(([p]) => p)
    expect(paths).toContain('goals.0')
    expect(paths).toContain('quiz.0.why')
    expect(paths).toContain('words.0.pos')
    expect(paths.some((p) => p.startsWith('hook') || p.startsWith('title') || p.endsWith('.say'))).toBe(false)
  })

  it('applies overlay text first, then the shared glossary, and leaves the rest in Bangla', () => {
    const l = lesson()
    const prompt = l.quiz[0].prompt
    const out = localizeLesson(l, { 'goals.0': 'Greet someone' }, { [prompt]: 'What does this word mean?' })
    expect(out.goals[0]).toBe('Greet someone')
    expect(out.goals[1]).toBe(l.goals[1])
    expect(out.quiz[0].prompt).toBe('What does this word mean?')
    expect(l.goals[0]).not.toBe('Greet someone') // the original is not changed
  })

  it('overlay text wins over the glossary', () => {
    const l = lesson()
    const out = localizeLesson(l, { 'quiz.0.prompt': 'A' }, { [l.quiz[0].prompt]: 'B' })
    expect(out.quiz[0].prompt).toBe('A')
  })

  it('counts coverage', () => {
    const l = lesson()
    const total = [...translatable(l)].length
    expect(coverage(l, null, {})).toEqual({ done: 0, total })
    expect(coverage(l, { 'goals.0': 'x' }, {}).done).toBe(1)
  })
})

describe('checkOverlay', () => {
  it('accepts valid overlays and glossaries', () => {
    expect(checkOverlay(lesson(), { 'goals.0': 'Greet someone' }, {})).toEqual([])
    expect(checkGlossary({ 'এই শব্দের অর্থ কী?': 'What does this word mean?' })).toEqual([])
  })

  it('rejects unknown paths, empty text and text that is still Bangla', () => {
    const errs = checkOverlay(lesson(), { 'goals.99': 'x', 'goals.0': '', 'goals.1': 'আমি' }, {})
    expect(errs.length).toBe(3)
    expect(checkGlossary({ English: 'x', 'আমি': 'আমি' }).length).toBe(2)
  })

  it('rejects an overlay that would make two options of one question identical', () => {
    const l = lesson()
    const q = l.quiz.findIndex((x) => x.type === 'mcq' && x.options.every((o) => /[ঀ-৿]/.test(o)))
    expect(q).toBeGreaterThanOrEqual(0)
    const errs = checkOverlay(l, { [`quiz.${q}.options.0`]: 'same', [`quiz.${q}.options.1`]: 'same' }, {})
    expect(errs.some((e) => e.includes('duplicate options'))).toBe(true)
  })
})
