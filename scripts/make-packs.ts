import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadExams, loadLessons } from './packs/data.ts'
import { vocabPack } from './packs/vocab.ts'
import { grammarPack } from './packs/grammar.ts'
import { examPack } from './packs/exams.ts'

/**
 * Printable study packs built from the app's own content (and its English text):
 *   npm run packs                      all packs, all levels
 *   npm run packs -- --level a1        one level
 *   npm run packs -- --only vocab      vocab | grammar | exams
 *   npm run packs -- --sample          unit 1 only (a free sample)
 *   npm run packs -- --html            write the HTML only (skip the PDF step)
 * PDFs need Chromium via Playwright: set PLAYWRIGHT (path to its index.mjs) and CHROMIUM_PATH if they are not on the default path.
 */
const args = process.argv.slice(2)
const flag = (n: string) => args.includes(`--${n}`)
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const levels = opt('level') ? [opt('level')!.toLowerCase()] : ['a1', 'a2', 'b1']
const only = opt('only')
const sample = flag('sample')

const OUT = new URL('../packs/', import.meta.url).pathname
mkdirSync(join(OUT, 'html'), { recursive: true })
const jobs: [string, string][] = []
const add = (name: string, html: string) => {
  const h = join(OUT, 'html', `${name}.html`)
  writeFileSync(h, html)
  jobs.push([h, join(OUT, `${name}.pdf`)])
}

for (const lv of levels) {
  const L = lv.toUpperCase()
  const suffix = sample ? '-SAMPLE' : ''
  if (!only || only === 'vocab') add(`GLBD-${L}-Vocabulary${suffix}`, vocabPack(L, loadLessons(lv), sample))
  if (!only || only === 'grammar') add(`GLBD-${L}-Grammar${suffix}`, grammarPack(L, loadLessons(lv), sample))
  if ((!only || only === 'exams') && !sample) add(`GLBD-${L}-Mock-Exams`, examPack(L, loadExams(lv)))
}
console.log(`wrote ${jobs.length} HTML file(s) to packs/html`)
if (!flag('html')) execFileSync('node', [new URL('./packs/render-pdf.mjs', import.meta.url).pathname, ...jobs.flat()], { stdio: 'inherit' })
