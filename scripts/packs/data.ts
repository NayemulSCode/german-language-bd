import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { Lesson } from '../../src/schema/lesson.ts'
import { Exam } from '../../src/schema/exam.ts'
import { localizeExam, localizeLesson, type Glossary, type Overlay } from '../../src/lib/localize.ts'

const ROOT = new URL('../../', import.meta.url).pathname
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))

/** A lesson as written (Bangla teaching text) next to the same lesson in English, so a pack can print both. */
export interface LessonPair {
  bn: Lesson
  en: Lesson
}
export interface ExamPair {
  bn: Exam
  en: Exam
}

export function loadGlossary(): Glossary {
  return json(join(ROOT, 'content-en/common.json'))
}

export function loadLessons(level: string): LessonPair[] {
  const glossary = loadGlossary()
  const dir = join(ROOT, 'content', level)
  const out: LessonPair[] = []
  for (const unit of readdirSync(dir).filter((u) => u.startsWith('unit')).sort()) {
    for (const f of readdirSync(join(dir, unit)).filter((n) => n.endsWith('.json')).sort()) {
      const bn = Lesson.parse(json(join(dir, unit, f)))
      const ov = join(ROOT, 'content-en', level, unit, f)
      out.push({ bn, en: existsSync(ov) ? localizeLesson(bn, json(ov) as Overlay, glossary) : bn })
    }
  }
  return out
}

export function loadExams(level: string): ExamPair[] {
  const dir = join(ROOT, 'exams')
  const out: ExamPair[] = []
  for (const f of readdirSync(dir).filter((n) => n.startsWith(`${level}-mock-`) && n.endsWith('.json')).sort()) {
    const bn = Exam.parse(json(join(dir, f)))
    const ov = join(ROOT, 'content-en/exams', f)
    out.push({ bn, en: existsSync(ov) ? localizeExam(bn, json(ov) as Overlay) : bn })
  }
  return out
}
