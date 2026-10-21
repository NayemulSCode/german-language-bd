import type { Lesson } from '../schema/lesson'
import index from '../generated/lessons-index.json'
import { localizeLesson, type Glossary, type Overlay } from './localize'
import type { Ui } from './storage'

export type LessonMeta = (typeof index)[number]

/** Sorted lesson list (level → unit → lesson). Bodies are loaded on demand, one chunk per lesson. */
export const LESSONS: LessonMeta[] = [...index].sort(
  (a, b) => a.level.localeCompare(b.level) || a.unit - b.unit || a.lesson - b.lesson,
)

const loaders = import.meta.glob<Lesson>('../../content/**/*.json', { import: 'default' })

/** Every lesson body (used by the placement test). Each is its own small chunk. */
export const loadAllLessons = (): Promise<Lesson[]> => Promise.all(Object.values(loaders).map((load) => load()))

/** a1-u01-l02 → content/a1/unit01/lesson02.json */
export async function loadLesson(id: string): Promise<Lesson> {
  const m = /^([a-c][12])-u(\d{2})-l(\d{2})$/.exec(id)
  const load = m && loaders[`../../content/${m[1]}/unit${m[2]}/lesson${m[3]}.json`]
  if (!load) throw new Error(`Lesson not found: ${id}`)
  return load()
}

export interface DictEntry {
  k: string // "<lessonId>:<wordId>", also the review-card key
  de: string
  art?: 'der' | 'die' | 'das'
  pl?: string
  pos: string
  bn: string
  en: string
  lv: string
}

let dict: Promise<DictEntry[]> | null = null
/** All vocabulary, loaded on first use (the Dictionary and Review screens). */
export const loadDictionary = (): Promise<DictEntry[]> => (dict ??= import('../generated/dictionary.json').then((m) => m.default as DictEntry[]))

/** The spoken form of an entry, article first. */
export const spoken = (e: Pick<DictEntry, 'de' | 'art'>) => (e.art ? `${e.art} ${e.de}` : e.de)

const overlays = import.meta.glob<Overlay>('../../content-en/**/*.json', { import: 'default' })
let glossary: Promise<Glossary> | null = null
const loadGlossary = (): Promise<Glossary> => (glossary ??= (overlays['../../content-en/common.json']?.() ?? Promise.resolve({})).catch(() => ({})))

/** The lesson's English teaching text (grammar, quiz, goals…) when the interface is English. Without an English version it stays Bangla. */
export async function localizeFor(lesson: Lesson, ui: Ui): Promise<Lesson> {
  if (ui !== 'en') return lesson
  const m = /^([a-c][12])-u(\d{2})-l(\d{2})$/.exec(lesson.id)
  const load = m && overlays[`../../content-en/${m[1]}/unit${m[2]}/lesson${m[3]}.json`]
  // a lesson is either translated (it has an overlay) or left entirely in Bangla, never half and half
  const o = load ? await load().catch(() => null) : null
  if (!o) return lesson
  return localizeLesson(lesson, o, await loadGlossary())
}
