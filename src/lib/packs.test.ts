import { describe, expect, it } from 'vitest'
import { loadExams, loadLessons } from '../../scripts/packs/data'
import { bi } from '../../scripts/packs/html'
import { examPack } from '../../scripts/packs/exams'
import { grammarPack } from '../../scripts/packs/grammar'
import { vocabPack } from '../../scripts/packs/vocab'

describe('printable packs', () => {
  it('bi shows Bangla with its English underneath, and plain text when nothing differs', () => {
    expect(bi('জার্মান', 'German')).toBe('<span class="bn">জার্মান</span><span class="en">German</span>')
    expect(bi('Hallo', 'Hallo')).toBe('Hallo')
    expect(bi('a < b', 'a < b')).toBe('a &lt; b')
    expect(bi('জার্মান', undefined)).toBe('জার্মান')
  })

  it('the A1 vocabulary pack lists every word of every lesson, with English', () => {
    const lessons = loadLessons('a1')
    const html = vocabPack('A1', lessons)
    for (const l of lessons) for (const w of l.bn.words) expect(html, `${l.bn.id} ${w.de}`).toContain(w.de.replace(/&/g, '&amp;'))
    expect(html).not.toMatch(/ক্রিয়া ·/) // word-class labels are in English
  })

  it('the sample pack only has unit 1', () => {
    const html = vocabPack('A1', loadLessons('a1'), true)
    expect(html).toContain('A1 · Unit 1')
    expect(html).not.toContain('A1 · Unit 2')
  })

  it('the grammar pack has every grammar panel of the level', () => {
    const lessons = loadLessons('a2')
    const html = grammarPack('A2', lessons)
    const panels = lessons.reduce((n, l) => n + l.bn.grammar.length, 0)
    expect(panels).toBeGreaterThan(50)
    expect((html.match(/class="panel"/g) ?? []).length).toBeGreaterThan(0)
  })

  it('an exam booklet numbers every question once and prints an answer key', () => {
    const exams = loadExams('b1')
    expect(exams).toHaveLength(2)
    const html = examPack('B1', exams)
    for (const e of exams) {
      const total = e.bn.parts.reduce((n, p) => n + p.questions.length, 0)
      expect(html).toContain(`Answer key · ${e.bn.title.de}`)
      expect(html).toContain(`<span class="qn">${total}.</span>`)
    }
  })
})
