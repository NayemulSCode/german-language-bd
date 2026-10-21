import type { Progress } from './storage'

const SKIP = 'deutsch-bd:welcome-skipped'

/** A visitor who has not done anything yet: no lesson steps, no activity, no placement test. */
export const isNewLearner = (p: Progress) =>
  Object.keys(p.lessons).length === 0 && Object.keys(p.activity).length === 0 && !p.placed && p.startUnitA2 === 0 && p.startUnitB1 === 0

export function welcomeSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP) === '1'
  } catch {
    return false
  }
}

export function skipWelcome(): void {
  try {
    localStorage.setItem(SKIP, '1')
  } catch {
    /* private mode: the welcome simply shows again next visit */
  }
}

export interface Phrase {
  de: string
  bn: string
  en: string
}

export const PHRASES: Phrase[] = [
  { de: 'Hallo', bn: 'হ্যালো', en: 'Hello' },
  { de: 'Guten Morgen', bn: 'সুপ্রভাত', en: 'Good morning' },
  { de: 'Danke', bn: 'ধন্যবাদ', en: 'Thank you' },
  { de: 'Auf Wiedersehen', bn: 'বিদায়', en: 'Goodbye' },
]

export interface Bi {
  bn: string
  en: string
}
/** An answer option: German text is shown as it is, meanings follow the interface language. */
export type Opt = string | Bi

export interface WelcomeQ {
  prompt: Bi
  options: Opt[]
  answer: number
}

export const QUESTIONS: WelcomeQ[] = [
  { prompt: { bn: '“ধন্যবাদ” জার্মান ভাষায় কী?', en: 'How do you say “thank you” in German?' }, options: ['Hallo', 'Danke', 'Auf Wiedersehen'], answer: 1 },
  { prompt: { bn: '“Guten Morgen” মানে কী?', en: 'What does “Guten Morgen” mean?' }, options: [{ bn: 'সুপ্রভাত', en: 'Good morning' }, { bn: 'বিদায়', en: 'Goodbye' }, { bn: 'ধন্যবাদ', en: 'Thank you' }], answer: 0 },
  { prompt: { bn: 'কাউকে বিদায় জানাতে কী বলবেন?', en: 'What do you say to say goodbye?' }, options: ['Guten Morgen', 'Danke', 'Auf Wiedersehen'], answer: 2 },
]

export const pick = (b: Bi, ui: 'bn' | 'en') => b[ui]
export const optText = (o: Opt, ui: 'bn' | 'en') => (typeof o === 'string' ? o : o[ui])
