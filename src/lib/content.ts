import type { Lesson } from '../schema/lesson'
import index from '../generated/lessons-index.json'

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
