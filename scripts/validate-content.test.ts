import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { checkLesson } from './validate-content.ts'

const lesson1 = () => JSON.parse(readFileSync(new URL('../content/a1/unit01/lesson01.json', import.meta.url), 'utf8'))

describe('checkLesson', () => {
  it('accepts lesson 1', () => {
    expect(checkLesson(lesson1())).toEqual([])
  })

  it('rejects a token linked past the end of the Bangla sentence', () => {
    const l = lesson1()
    l.dialog[0].de[0].b = [99]
    expect(checkLesson(l).join()).toMatch(/dialog\[0\]\.de\[0\]\.b/)
  })

  it('rejects a quiz question pointing at an unknown word id', () => {
    const l = lesson1()
    l.quiz[0].word = 'nope'
    expect(checkLesson(l).join()).toMatch(/unknown word id "nope"/)
  })

  it('rejects an order question whose tiles do not match its answer', () => {
    const l = lesson1()
    const q = l.quiz.find((x: { type: string }) => x.type === 'order')
    q.tiles = ['a', 'b', 'c']
    expect(checkLesson(l).join()).toMatch(/same words/)
  })

  it('rejects an id that disagrees with level/unit/lesson', () => {
    const l = lesson1()
    l.unit = 2
    expect(checkLesson(l).join()).toMatch(/does not match/)
  })
})
