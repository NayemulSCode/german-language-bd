import { z } from 'zod'
import { Question } from './lesson'

/** A mock exam modelled on the structure of Goethe-Zertifikat Start Deutsch 1 / Goethe A2 (Hören, Lesen, Schreiben, Sprechen). Not an official test. */
const Part = z.object({
  kind: z.enum(['hoeren', 'lesen']),
  title: z.string(), // Bangla
  instructions: z.string(), // Bangla
  minutes: z.number().int().positive(), // suggested time
  questions: z.array(Question).min(1),
})

const Writing = z.object({
  title: z.string(),
  taskBn: z.string(),
  taskDe: z.string(),
  minWords: z.number().int().nonnegative(),
  model: z.string(), // a sample answer shown after the learner has tried
  checklist: z.array(z.string()).min(2), // Bangla self-check items
})

const Speaking = z.object({
  title: z.string(),
  instructions: z.string(), // Bangla
  prompts: z.array(z.object({ de: z.string(), bn: z.string(), model: z.string() })).min(1),
})

export const Exam = z.object({
  id: z.string().regex(/^(a1|a2|b1)-mock-\d{2}$/, 'e.g. b1-mock-01'),
  level: z.enum(['A1', 'A2', 'B1']),
  title: z.object({ de: z.string(), bn: z.string(), en: z.string() }),
  passMark: z.number().min(0).max(1).default(0.6),
  parts: z.array(Part).min(2),
  writing: z.array(Writing).min(1),
  speaking: z.array(Speaking).min(1),
})

export type Part = z.infer<typeof Part>
export type Writing = z.infer<typeof Writing>
export type Speaking = z.infer<typeof Speaking>
export type Exam = z.infer<typeof Exam>
