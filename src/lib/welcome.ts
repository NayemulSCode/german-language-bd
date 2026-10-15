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

export interface WelcomeQ {
  prompt: string // Bangla question
  options: string[]
  answer: number
}

export const QUESTIONS: WelcomeQ[] = [
  { prompt: '“ধন্যবাদ” জার্মান ভাষায় কী?', options: ['Hallo', 'Danke', 'Auf Wiedersehen'], answer: 1 },
  { prompt: '“Guten Morgen” মানে কী?', options: ['সুপ্রভাত', 'বিদায়', 'ধন্যবাদ'], answer: 0 },
  { prompt: 'কাউকে বিদায় জানাতে কী বলবেন?', options: ['Guten Morgen', 'Danke', 'Auf Wiedersehen'], answer: 2 },
]
