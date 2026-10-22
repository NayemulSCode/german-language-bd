/**
 * The printable study packs (built by `npm run packs`, see scripts/make-packs.ts).
 * Page counts are those of the current PDFs: update them when the packs are rebuilt after content changes.
 * The free samples live in public/downloads (also written by `npm run packs -- --sample --level a1`).
 */
export type PackLevel = 'A1' | 'A2' | 'B1'
export type PackKind = 'vocab' | 'grammar' | 'exams'

export const PACK_LEVELS: PackLevel[] = ['A1', 'A2', 'B1']
export const PACK_KINDS: PackKind[] = ['vocab', 'grammar', 'exams']

export const PACK_PAGES: Record<PackLevel, Record<PackKind, number>> = {
  A1: { vocab: 29, grammar: 55, exams: 19 },
  A2: { vocab: 37, grammar: 65, exams: 20 },
  B1: { vocab: 37, grammar: 61, exams: 23 },
}

export const SAMPLES: { kind: 'vocab' | 'grammar'; file: string; pages: number }[] = [
  { kind: 'vocab', file: 'GLBD-A1-Vocabulary-SAMPLE.pdf', pages: 4 },
  { kind: 'grammar', file: 'GLBD-A1-Grammar-SAMPLE.pdf', pages: 7 },
]

/** URL of a file in public/downloads, correct under any base path. */
export const downloadUrl = (file: string) => `${import.meta.env.BASE_URL}downloads/${file}`
