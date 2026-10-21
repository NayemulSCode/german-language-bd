import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Lesson, type Question } from '../src/schema/lesson.ts'
import { Exam } from '../src/schema/exam.ts'
import { coverage, examCoverage, hasBangla, localizeExam, localizeLesson, translatable, translatableExam, type Glossary, type Overlay } from '../src/lib/localize.ts'

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

/** English overlay for one lesson: every key must point at real Bangla text of that lesson, values must be non-empty English, and the result must still be a valid lesson (e.g. no duplicate options). */
export function checkOverlay(lesson: Lesson, overlay: unknown, glossary: Glossary): string[] {
  if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) return ['overlay must be an object of "path": "English text"']
  const errs: string[] = []
  const valid = new Set([...translatable(lesson)].map(([path]) => path))
  for (const [path, v] of Object.entries(overlay)) {
    if (!valid.has(path)) errs.push(`"${path}": not a Bangla text in this lesson`)
    else if (typeof v !== 'string' || !v.trim()) errs.push(`"${path}": must be a non-empty string`)
    else if (hasBangla(v)) errs.push(`"${path}": English text must not contain Bangla ("${v.slice(0, 40)}")`)
  }
  if (errs.length) return errs
  return checkLesson(localizeLesson(lesson, overlay as Overlay, glossary)).map((e) => `after applying English: ${e}`)
}

/** English overlay for one mock exam: keys must point at real Bangla text of that exam and the localized exam must still be valid. */
export function checkExamOverlay(exam: Exam, overlay: unknown): string[] {
  if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) return ['overlay must be an object of "path": "English text"']
  const errs: string[] = []
  const valid = new Set([...translatableExam(exam)].map(([path]) => path))
  for (const [path, v] of Object.entries(overlay)) {
    if (!valid.has(path)) errs.push(`"${path}": not a Bangla text in this exam`)
    else if (typeof v !== 'string' || !v.trim()) errs.push(`"${path}": must be a non-empty string`)
    else if (hasBangla(v)) errs.push(`"${path}": English text must not contain Bangla ("${v.slice(0, 40)}")`)
  }
  if (errs.length) return errs
  return checkExam(localizeExam(exam, overlay as Overlay)).map((e) => `after applying English: ${e}`)
}

export function checkGlossary(g: unknown): string[] {
  if (!g || typeof g !== 'object' || Array.isArray(g)) return ['common.json must be an object of "Bangla phrase": "English text"']
  const errs: string[] = []
  for (const [k, v] of Object.entries(g)) {
    if (!hasBangla(k)) errs.push(`"${k}": key must be Bangla text`)
    if (typeof v !== 'string' || !v.trim()) errs.push(`"${k}": must be a non-empty string`)
    else if (hasBangla(v)) errs.push(`"${k}": English text must not contain Bangla`)
  }
  return errs
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
  const lessons = new Map<string, Lesson>()
  for (const file of jsonFiles(ROOT)) {
    count++
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    const errs = checkLesson(raw)
    const lid = (raw as { id?: string }).id
    if (lid && seen.has(lid)) errs.push(`duplicate lesson id ${lid}`)
    if (lid) seen.add(lid)
    if (!errs.length) {
      const l = Lesson.parse(raw)
      lessons.set(l.id, l)
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
  // English versions of the Bangla teaching text live in /content-en (see src/lib/localize.ts)
  const EN = new URL('../content-en/', import.meta.url).pathname
  let enFailed = 0
  let glossary: Glossary = {}
  try {
    glossary = JSON.parse(readFileSync(join(EN, 'common.json'), 'utf8'))
    const errs = checkGlossary(glossary)
    if (errs.length) { enFailed++; console.error('✗ content-en/common.json'); for (const e of errs) console.error(`    ${e}`) }
  } catch { /* no glossary yet */ }
  const done: Record<string, [number, number]> = {}
  for (const l of lessons.values()) {
    const m = /^([a-c][12])-u(\d{2})-l(\d{2})$/.exec(l.id)!
    const file = join(EN, m[1], `unit${m[2]}`, `lesson${m[3]}.json`)
    let overlay: unknown = null
    try { overlay = JSON.parse(readFileSync(file, 'utf8')) } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') { enFailed++; console.error(`✗ ${file.replace(EN, 'content-en/')}: ${(e as Error).message}`); continue }
    }
    if (overlay) {
      const errs = checkOverlay(l, overlay, glossary)
      if (errs.length) { enFailed++; console.error(`✗ ${file.replace(EN, 'content-en/')}`); for (const e of errs) console.error(`    ${e}`) }
    }
    // only lessons with their own overlay count as translated (the app leaves the others in Bangla)
    const c = overlay ? coverage(l, overlay as Overlay, glossary) : { done: 0, total: [...translatable(l)].length }
    const d = (done[l.level] ??= [0, 0])
    d[0] += c.done
    d[1] += c.total
  }
  if (enFailed) {
    console.error(`\n${enFailed} English file(s) invalid`)
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
  // English text for the mock exams (content-en/exams/<id>.json)
  const examEn: [number, number] = [0, 0]
  let examsTranslated = 0
  for (const name of readdirSync(EXAMS).filter((n) => n.endsWith('.json')).sort()) {
    const exam = Exam.parse(JSON.parse(readFileSync(join(EXAMS, name), 'utf8')))
    const file = join(EN, 'exams', name)
    let overlay: unknown = null
    try { overlay = JSON.parse(readFileSync(file, 'utf8')) } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') { examFailed++; console.error(`✗ ${file.replace(EN, 'content-en/')}: ${(e as Error).message}`); continue }
    }
    if (overlay) {
      const errs = checkExamOverlay(exam, overlay)
      if (errs.length) { examFailed++; console.error(`✗ ${file.replace(EN, 'content-en/')}`); for (const e of errs) console.error(`    ${e}`) }
      else examsTranslated++
    }
    const c = overlay ? examCoverage(exam, overlay as Overlay) : { done: 0, total: [...translatableExam(exam)].length }
    examEn[0] += c.done
    examEn[1] += c.total
  }
  if (examFailed) process.exit(1)
  // small lesson list for the home screen, so lesson bodies can stay lazy-loaded
  const out = new URL('../src/generated/', import.meta.url).pathname
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'lessons-index.json'), JSON.stringify(index, null, 2) + '\n')
  writeFileSync(join(out, 'dictionary.json'), JSON.stringify(dictionary) + '\n')
  writeFileSync(join(out, 'exams-index.json'), JSON.stringify(examIndex, null, 2) + '\n')
  console.log(`✓ ${count} lesson file(s) and ${examIndex.length} exam(s) valid`)
  console.log('English teaching text: ' + Object.entries(done).map(([lv, [a, b]]) => `${lv} ${b ? Math.round((a / b) * 100) : 0}% (${a}/${b})`).join(' · ') + ` · mock exams ${examEn[1] ? Math.round((examEn[0] / examEn[1]) * 100) : 0}% (${examEn[0]}/${examEn[1]})`)
}
