import type { Exam } from '../schema/exam'
import index from '../generated/exams-index.json'
import { isRight } from '../components/Question'
import { localizeExam, type Overlay } from './localize'
import type { Ui } from './storage'

export type ExamMeta = (typeof index)[number]
export const EXAMS: ExamMeta[] = index

const loaders = import.meta.glob<Exam>('../../exams/*.json', { import: 'default' })

const overlays = import.meta.glob<Overlay>('../../content-en/exams/*.json', { import: 'default' })

/** The exam, with its Bangla instructions and notes in English when the interface is English and an English version exists (never half and half). */
export async function loadExam(id: string, ui: Ui = 'bn'): Promise<Exam> {
  const load = loaders[`../../exams/${id}.json`]
  if (!load) throw new Error(`Exam not found: ${id}`)
  const exam = await load()
  if (ui !== 'en') return exam
  const o = await overlays[`../../content-en/exams/${id}.json`]?.().catch(() => null)
  return localizeExam(exam, o)
}

/** One answer per question: a picked option index, or null when left unanswered. */
export type Answers = (number | null)[][]

export interface PartScore {
  correct: number
  total: number
}
export interface ExamScore {
  parts: PartScore[]
  correct: number
  total: number
  pct: number // 0–1
  passed: boolean
}

export function scoreExam(exam: Exam, answers: Answers): ExamScore {
  const parts = exam.parts.map((p, pi) => ({
    total: p.questions.length,
    correct: p.questions.filter((q, qi) => (answers[pi]?.[qi] ?? null) !== null && isRight(q, answers[pi][qi], [])).length,
  }))
  const correct = parts.reduce((n, p) => n + p.correct, 0)
  const total = parts.reduce((n, p) => n + p.total, 0)
  const pct = total ? correct / total : 0
  return { parts, correct, total, pct, passed: pct >= exam.passMark }
}

/** The questions answered wrongly or skipped, with the part they belong to (for the review list). */
export function missed(exam: Exam, answers: Answers) {
  return exam.parts.flatMap((p, pi) =>
    p.questions.flatMap((q, qi) => {
      const a = answers[pi]?.[qi] ?? null
      return a !== null && isRight(q, a, []) ? [] : [{ part: pi, index: qi, q, picked: a }]
    }),
  )
}

/** Attempt history lives only on this device (it is not part of the synced progress). */
export interface ExamRecord {
  best: number // best score, 0–1
  last: number
  attempts: number
  at: number // ms of the last attempt
}
const KEY = 'deutsch-bd:exams:v1'

export function loadRecords(): Record<string, ExamRecord> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Partial<ExamRecord>>
    const out: Record<string, ExamRecord> = {}
    for (const [id, r] of Object.entries(raw)) {
      if (!/^(a1|a2|b1)-mock-\d{2}$/.test(id) || !r) continue
      const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0)
      out[id] = { best: Math.min(1, n(r.best)), last: Math.min(1, n(r.last)), attempts: Math.floor(n(r.attempts)), at: n(r.at) }
    }
    return out
  } catch {
    return {}
  }
}

export function saveAttempt(id: string, pct: number, now = Date.now()): Record<string, ExamRecord> {
  const all = loadRecords()
  const prev = all[id]
  all[id] = { best: Math.max(prev?.best ?? 0, pct), last: pct, attempts: (prev?.attempts ?? 0) + 1, at: now }
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable: the result is still shown, just not remembered */
  }
  return all
}
