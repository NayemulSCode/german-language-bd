import type { Lesson } from '../schema/lesson'

/**
 * English for lessons whose teaching text is written in Bangla.
 * `content/**` stays the single source of truth; English lives beside it in `content-en/**`:
 *  - `content-en/common.json`: exact Bangla phrase → English, for text that repeats across lessons (quiz prompts, word-class labels…)
 *  - `content-en/<level>/unitNN/lessonNN.json`: path → English, for one lesson (e.g. "quiz.3.why": "…")
 * A lesson is shown in English only if it has its own overlay file; otherwise it stays entirely in Bangla (never half and half).
 * Text inside an overlayed lesson with no English version stays Bangla.
 */
export type Overlay = Record<string, string>
export type Glossary = Record<string, string>

export const hasBangla = (s: string) => /[ঀ-৿]/.test(s)

/** Parts of a lesson that carry Bangla teaching text (words, dialogue translations and the hook already have English). */
function* walk(x: unknown, path: string): Generator<[string, string]> {
  if (typeof x === 'string') {
    if (hasBangla(x)) yield [path, x]
  } else if (Array.isArray(x)) {
    for (let i = 0; i < x.length; i++) yield* walk(x[i], path ? `${path}.${i}` : String(i))
  } else if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) yield* walk(v, path ? `${path}.${k}` : k)
  }
}

/**
 * The word-order panels set German against the Bangla sentence on purpose (verb in second place, not at the end),
 * so the Bangla words there are the lesson, not a translation to replace.
 */
const KEEP_BANGLA = /^grammar\.\d+\.bn\.\d+\.t$/

/** Every [path, Bangla text] in a lesson that can have an English version. */
export function* translatable(lesson: Lesson): Generator<[string, string]> {
  yield* walk(lesson.goals, 'goals')
  for (const [path, text] of walk(lesson.grammar, 'grammar')) if (!KEEP_BANGLA.test(path)) yield [path, text]
  yield* walk(lesson.quiz, 'quiz')
  for (let i = 0; i < lesson.words.length; i++) yield* walk(lesson.words[i].pos, `words.${i}.pos`)
  for (let li = 0; li < lesson.dialog.length; li++)
    for (let ti = 0; ti < lesson.dialog[li].de.length; ti++) yield* walk(lesson.dialog[li].de[ti].n, `dialog.${li}.de.${ti}.n`)
}

function setAt(root: unknown, path: string, value: string): void {
  const keys = path.split('.')
  let cur = root as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] as Record<string, unknown>
  cur[keys[keys.length - 1]] = value
}

/** A copy of the lesson with English wherever the overlay (first) or the glossary has it. */
export function localizeLesson(lesson: Lesson, overlay: Overlay | null | undefined, glossary: Glossary): Lesson {
  const out = structuredClone(lesson)
  for (const [path, text] of translatable(lesson)) {
    const en = overlay?.[path] ?? glossary[text]
    if (en !== undefined) setAt(out, path, en)
  }
  return out
}

/** How much of a lesson's Bangla teaching text has an English version. */
export function coverage(lesson: Lesson, overlay: Overlay | null | undefined, glossary: Glossary): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const [path, text] of translatable(lesson)) {
    total++
    if (overlay?.[path] !== undefined || glossary[text] !== undefined) done++
  }
  return { done, total }
}
