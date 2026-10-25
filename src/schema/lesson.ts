import { z } from 'zod'

/** Lesson content format. Content lives in /content as JSON and is checked by `npm run validate`. */

const Bilingual = z.object({ bn: z.string(), en: z.string() })

export const Word = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/, 'lowercase ascii id'),
  de: z.string(),
  art: z.enum(['der', 'die', 'das']).optional(),
  pl: z.string().optional(),
  pos: z.string(), // part of speech label, shown in Bangla
  bn: z.string(),
  en: z.string(),
})

/** One German token of a dialogue line, linked to word positions in the Bangla and English sentence. */
export const Token = z.object({
  t: z.string(), // as displayed, with punctuation
  s: z.string().optional(), // text to speak when it differs from t
  b: z.array(z.number().int().min(0)), // indexes into the Bangla words
  e: z.array(z.number().int().min(0)), // indexes into the English words
  l: z.string(), // lemma
  gb: z.string(),
  ge: z.string(),
  n: z.string(), // note (Bangla)
})

export const DialogLine = z.object({
  who: z.string(),
  bn: z.array(z.string()),
  en: z.array(z.string()),
  de: z.array(Token).min(1),
})

const ConjTable = z.object({
  type: z.literal('conjugation'),
  intro: z.string(),
  verbs: z.array(z.string()).min(1),
  rows: z.array(z.object({ pron: z.string(), stems: z.array(z.string()), ends: z.array(z.string()), bn: z.string() })),
  note: z.string().optional(),
})
const WordOrder = z.object({
  type: z.literal('order'),
  title: z.string(),
  text: z.string(),
  de: z.array(z.object({ t: z.string(), v: z.boolean().optional() })),
  bn: z.array(z.object({ t: z.string(), v: z.boolean().optional() })),
})
const Table = z.object({
  type: z.literal('table'),
  title: z.string().optional(),
  intro: z.string().optional(),
  head: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  note: z.string().optional(),
})
/** A grid of tappable cells (letters, numbers, days…): tap to hear it, with a small hint in Bangla and/or English under it. */
const Chips = z.object({
  type: z.literal('chips'),
  title: z.string().optional(),
  intro: z.string().optional(),
  cols: z.number().int().min(2).max(6).default(4),
  items: z
    .array(
      z.object({
        t: z.string(), // shown (and spoken, unless s is given)
        s: z.string().optional(), // text to speak when it differs from t (e.g. a respelled letter name)
        bn: z.string().optional(), // hint shown when Bangla is on (a pronunciation or a meaning); stays Bangla in the English version
        en: z.string().optional(), // hint shown when English is on
        ex: z.string().optional(), // a short German example shown small under the hint
      }),
    )
    .min(1),
  note: z.string().optional(),
  pron: z.boolean().optional(), // false when the hints already are the Bangla pronunciation (letters, sounds): no extra pronunciation line
})
export const GrammarPanel = z.discriminatedUnion('type', [
  Chips,
  z.object({ type: z.literal('text'), title: z.string().optional(), text: z.string() }),
  Table,
  ConjTable,
  WordOrder,
])

const Mcq = z.object({
  type: z.literal('mcq'),
  prompt: z.string(),
  sub: z.string().optional(),
  passage: z.string().optional(), // a short German text to read before answering (exam reading tasks)
  subBn: z.boolean().optional(), // sub is Bangla; picking an option plays it in German
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  why: z.string(),
  word: z.string().optional(), // word id queued for review when answered wrong
})
const Listen = z.object({
  type: z.literal('listen'),
  prompt: z.string(),
  say: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  why: z.string(),
  word: z.string().optional(),
})
const Order = z.object({
  type: z.literal('order'),
  prompt: z.string(),
  tiles: z.array(z.string()).min(2),
  answer: z.array(z.string()).min(2),
  why: z.string(),
  word: z.string().optional(),
})
export const Question = z.discriminatedUnion('type', [Mcq, Listen, Order])

export const Lesson = z.object({
  id: z.string().regex(/^[a-c][12]-u\d{2}-l\d{2}$/, 'e.g. a1-u01-l01'),
  level: z.enum(['A1', 'A2', 'B1']),
  unit: z.number().int().min(0), // 0 = the optional "Start here" unit
  lesson: z.number().int().positive(),
  title: Bilingual.extend({ de: z.string() }),
  status: z.enum(['draft', 'reviewed']),
  minutes: z.number().int().positive(),
  hook: z.object({ de: z.string(), who: z.string(), bn: z.string(), en: z.string() }),
  goals: z.array(z.string()).min(1), // Bangla
  words: z.array(Word).min(1),
  dialog: z.array(DialogLine).min(1),
  grammar: z.array(GrammarPanel).min(1),
  quiz: z.array(Question).min(1),
  passMark: z.number().min(0).max(1).default(0.8),
})

export type Word = z.infer<typeof Word>
export type Token = z.infer<typeof Token>
export type DialogLine = z.infer<typeof DialogLine>
export type GrammarPanel = z.infer<typeof GrammarPanel>
export type Question = z.infer<typeof Question>
export type Lesson = z.infer<typeof Lesson>
