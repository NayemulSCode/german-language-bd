import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Lesson, type Question } from '../src/schema/lesson.ts'
import { Exam } from '../src/schema/exam.ts'

/** Validates every lesson JSON in /content: schema first, then cross-reference checks the schema can't express. */

const ROOT = new URL('../content/', import.meta.url).pathname

function* jsonFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* jsonFiles(p)
    else if (name.endsWith('.json') && name !== 'pronunciation.json') yield p
  }
}

/** Cross-reference checks for a list of questions. wordIds is given for lesson quizzes (exam questions have no word ids). */
export function checkQuestions(qs: Question[], label: string, wordIds?: Set<string>): string[] {
  const errs: string[] = []
  qs.forEach((q, qi) => {
    if (q.word && wordIds && !wordIds.has(q.word)) errs.push(`${label}[${qi}].word: unknown word id "${q.word}"`)
    if (q.word && !wordIds) errs.push(`${label}[${qi}].word: not allowed here`)
    if (q.type === 'order') {
      const a = [...q.answer].sort().join('|')
      const t = [...q.tiles].sort().join('|')
      if (a !== t) errs.push(`${label}[${qi}]: tiles and answer must contain the same words`)
    } else {
      if (q.answer >= q.options.length) errs.push(`${label}[${qi}].answer: ${q.answer} out of range`)
      if (new Set(q.options).size !== q.options.length) errs.push(`${label}[${qi}]: duplicate options`)
    }
  })
  return errs
}

export function checkExam(raw: unknown): string[] {
  const parsed = Exam.safeParse(raw)
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  return parsed.data.parts.flatMap((p, pi) => checkQuestions(p.questions, `parts[${pi}].questions`))
}

export function checkLesson(raw: unknown): string[] {
  const parsed = Lesson.safeParse(raw)
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  const l = parsed.data
  const errs: string[] = []

  const ids = new Set<string>()
  for (const w of l.words) {
    if (ids.has(w.id)) errs.push(`duplicate word id "${w.id}"`)
    ids.add(w.id)
  }
  l.dialog.forEach((line, li) => {
    line.de.forEach((tok, ti) => {
      for (const i of tok.b) if (i >= line.bn.length) errs.push(`dialog[${li}].de[${ti}].b: index ${i} out of range`)
      for (const i of tok.e) if (i >= line.en.length) errs.push(`dialog[${li}].de[${ti}].e: index ${i} out of range`)
    })
  })
  errs.push(...checkQuestions(l.quiz, 'quiz', ids))
  const expectedId = `${l.level.toLowerCase()}-u${String(l.unit).padStart(2, '0')}-l${String(l.lesson).padStart(2, '0')}`
  if (l.id !== expectedId) errs.push(`id "${l.id}" does not match level/unit/lesson (${expectedId})`)
  return errs
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let failed = 0
  let count = 0
  const index: unknown[] = []
  const dictionary: unknown[] = []
  const seen = new Set<string>()
  for (const file of jsonFiles(ROOT)) {
    count++
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    const errs = checkLesson(raw)
    const lid = (raw as { id?: string }).id
    if (lid && seen.has(lid)) errs.push(`duplicate lesson id ${lid}`)
    if (lid) seen.add(lid)
    if (!errs.length) {
      const l = Lesson.parse(raw)
      index.push({ id: l.id, level: l.level, unit: l.unit, lesson: l.lesson, title: l.title, status: l.status, minutes: l.minutes, words: l.words.length })
      // every word with its review key, for the Dictionary and Review screens (loaded on demand)
      for (const w of l.words) dictionary.push({ k: `${l.id}:${w.id}`, de: w.de, art: w.art, pl: w.pl, pos: w.pos, bn: w.bn, en: w.en, lv: l.level })
    }
    if (errs.length) {
      failed++
      console.error(`✗ ${file.replace(ROOT, 'content/')}`)
      for (const e of errs) console.error(`    ${e}`)
    }
  }
  if (failed) {
    console.error(`\n${failed} of ${count} lesson file(s) invalid`)
    process.exit(1)
  }
  // mock exams live in /exams (outside /content so they are not treated as lessons)
  const EXAMS = new URL('../exams/', import.meta.url).pathname
  const examIndex: unknown[] = []
  let examFailed = 0
  for (const name of readdirSync(EXAMS).filter((n) => n.endsWith('.json')).sort()) {
    const raw = JSON.parse(readFileSync(join(EXAMS, name), 'utf8'))
    const errs = checkExam(raw)
    if (errs.length) {
      examFailed++
      console.error(`✗ exams/${name}`)
      for (const e of errs) console.error(`    ${e}`)
    } else {
      const e = Exam.parse(raw)
      if (name !== `${e.id}.json`) { examFailed++; console.error(`✗ exams/${name}: file name must be ${e.id}.json`) }
      else examIndex.push({ id: e.id, level: e.level, title: e.title, questions: e.parts.reduce((n, p) => n + p.questions.length, 0), minutes: e.parts.reduce((n, p) => n + p.minutes, 0) })
    }
  }
  if (examFailed) process.exit(1)
  // small lesson list for the home screen, so lesson bodies can stay lazy-loaded
  const out = new URL('../src/generated/', import.meta.url).pathname
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'lessons-index.json'), JSON.stringify(index, null, 2) + '\n')
  writeFileSync(join(out, 'dictionary.json'), JSON.stringify(dictionary) + '\n')
  writeFileSync(join(out, 'exams-index.json'), JSON.stringify(examIndex, null, 2) + '\n')
  console.log(`✓ ${count} lesson file(s) and ${examIndex.length} exam(s) valid`)
}
