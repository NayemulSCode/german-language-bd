import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../schema/lesson'
import { speakableTexts } from './speakable'

const lesson1 = Lesson.parse(JSON.parse(readFileSync(new URL('../../content/a1/unit01/lesson01.json', import.meta.url), 'utf8')))

describe('speakableTexts', () => {
  const texts = speakableTexts(lesson1)
  it('includes words with their article, as the Words step speaks them', () => {
    expect(texts).toContain('der Name')
    expect(texts).toContain('Guten Morgen')
  })
  it('includes whole dialogue lines and the spoken form of single tokens', () => {
    expect(texts).toContain('Hallo! Wie heißt du?')
    expect(texts).toContain('Hallo') // token with an explicit "s"
  })
  it('includes listening prompts, order answers and options of Bangla-prompt questions', () => {
    expect(texts).toContain('Woher kommst du, Mou?')
    expect(texts).toContain('Woher kommst du?')
    expect(texts).toContain('Ich wohne in Dhaka.')
  })
  it('has no duplicates', () => {
    expect(new Set(texts).size).toBe(texts.length)
  })
})
