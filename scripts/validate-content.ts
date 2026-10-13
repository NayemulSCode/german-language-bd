import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Lesson } from '../src/schema/lesson.ts'

/** Validates every lesson JSON in /content: schema first, then cross-reference checks the schema can't express. */

const ROOT = new URL('../content/', import.meta.url).pathname

function* jsonFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* jsonFiles(p)
    else if (name.endsWith('.json') && name !== 'pronunciation.json') yield p
  }
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
  l.quiz.forEach((q, qi) => {
    if (q.word && !ids.has(q.word)) errs.push(`quiz[${qi}].word: unknown word id "${q.word}"`)
    if (q.type === 'order') {
      const a = [...q.answer].sort().join('|')
      const t = [...q.tiles].sort().join('|')
      if (a !== t) errs.push(`quiz[${qi}]: tiles and answer must contain the same words`)
    } else if (q.answer >= q.options.length) {
      errs.push(`quiz[${qi}].answer: ${q.answer} out of range`)
    }
  })
  const expectedId = `${l.level.toLowerCase()}-u${String(l.unit).padStart(2, '0')}-l${String(l.lesson).padStart(2, '0')}`
  if (l.id !== expectedId) errs.push(`id "${l.id}" does not match level/unit/lesson (${expectedId})`)
  return errs
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let failed = 0
  let count = 0
  const index: unknown[] = []
  for (const file of jsonFiles(ROOT)) {
    count++
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    const errs = checkLesson(raw)
    if (!errs.length) {
      const l = Lesson.parse(raw)
      index.push({ id: l.id, level: l.level, unit: l.unit, lesson: l.lesson, title: l.title, status: l.status, minutes: l.minutes })
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
  // small lesson list for the home screen, so lesson bodies can stay lazy-loaded
  const out = new URL('../src/generated/', import.meta.url).pathname
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'lessons-index.json'), JSON.stringify(index, null, 2) + '\n')
  console.log(`✓ ${count} lesson file(s) valid`)
}
