import { readFileSync } from 'node:fs'
import { hasBangla } from '../../src/lib/localize.ts'

export const SITE = 'german-language-bd.vercel.app'

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const nl = (s: string) => esc(s).replace(/\n/g, '<br>')

/** Bangla text with its English version underneath; plain text when both are the same (German, numbers…). */
export function bi(bn: string | undefined, en: string | undefined): string {
  if (bn === undefined) return ''
  if (en === undefined || en === bn || !hasBangla(bn)) return nl(bn)
  return `<span class="bn">${nl(bn)}</span><span class="en">${nl(en)}</span>`
}

export const art = (a: string | undefined, de: string) => (a ? `<span class="art-${a}">${a}</span> ${esc(de)}` : esc(de))

const logo = () => readFileSync(new URL('../../public/logo.svg', import.meta.url), 'utf8').replace(/<\?xml[^>]*>/, '')

export const CSS = `
@page { size: A4; margin: 16mm 14mm 18mm 14mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Noto Sans", "Hind Siliguri", sans-serif; font-size: 10pt; line-height: 1.4; color: #17203A; margin: 0; }
.bn { font-family: "Hind Siliguri", "Noto Sans", sans-serif; }
.en { color: #58617A; display: block; }
.bn + .en { margin-top: 1px; }
h1, h2, h3, h4 { font-family: "Bricolage Grotesque", "Hind Siliguri", sans-serif; margin: 0; line-height: 1.15; }
h1 { font-size: 30pt; }
h2 { font-size: 17pt; }
h3 { font-size: 12.5pt; }
.muted { color: #58617A; }
.art-der { color: #2457C5; font-weight: 700; } .art-die { color: #C0373A; font-weight: 700; } .art-das { color: #1B8550; font-weight: 700; }
.pb { break-before: page; }
.cover { min-height: 255mm; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 10mm; break-after: page; }
.cover svg, .cover img { width: 38mm; height: 38mm; }
.cover .level { display: inline-block; background: #E3A21A; color: #1b1300; font-weight: 800; padding: 2mm 5mm; border-radius: 3mm; font-size: 14pt; font-family: "Bricolage Grotesque", sans-serif; }
.cover .sub { font-size: 14pt; color: #58617A; max-width: 150mm; }
.cover .facts { display: flex; gap: 8mm; flex-wrap: wrap; }
.cover .fact { border: 1px solid #DCE1EB; border-radius: 3mm; padding: 3mm 5mm; min-width: 32mm; }
.cover .fact b { display: block; font-size: 18pt; font-family: "Bricolage Grotesque", sans-serif; }
.cover .brand { font-family: "Bricolage Grotesque", sans-serif; font-weight: 800; font-size: 16pt; }
.note { border-left: 3px solid #E3A21A; background: #FCF1D8; padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; margin: 4mm 0; }
.unit-head { background: #17203A; color: #fff; padding: 4mm 5mm; border-radius: 2.5mm; margin: 0 0 4mm; break-after: avoid; }
.unit-head .u { font-size: 9pt; letter-spacing: .08em; text-transform: uppercase; color: #F0B43C; }
.unit-head h2 { color: #fff; margin-top: 1mm; }
.unit-head .en, .unit-head .bn { color: #D5DBEA; }
.lesson-head { margin: 5mm 0 2mm; break-after: avoid; display: flex; gap: 3mm; align-items: baseline; }
.lesson-head .n { background: #E3A21A; color: #1b1300; font-weight: 800; border-radius: 50%; min-width: 6mm; height: 6mm; display: inline-grid; place-items: center; font-size: 9pt; }
table { border-collapse: collapse; width: 100%; margin: 1mm 0 3mm; }
th { background: #E8ECF4; text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .04em; color: #44506E; padding: 1.6mm 2mm; }
td { padding: 1.6mm 2mm; border-bottom: 1px solid #E3E7F0; vertical-align: top; }
tr { break-inside: avoid; }
tr:nth-child(even) td { background: #F7F8FB; }
table.vocab { table-layout: fixed; }
td.chk { width: 6mm; color: #9AA3B8; font-size: 11pt; }
.de { font-size: 11pt; font-weight: 700; }
.pl { color: #58617A; font-size: 8.5pt; font-weight: 400; }
.panel { margin: 3mm 0 4mm; break-inside: avoid; }
.panel h4 { font-size: 11pt; margin-bottom: 1.5mm; }
.panel p { margin: 1mm 0; }
.v { text-decoration: underline; text-decoration-color: #E3A21A; text-decoration-thickness: 2px; font-weight: 700; }
.opt { display: flex; gap: 2mm; margin: .8mm 0; }
.opt .b { width: 4.5mm; height: 4.5mm; border: 1.2px solid #44506E; border-radius: 1mm; flex: none; margin-top: .6mm; }
.q { margin: 3mm 0; break-inside: avoid; }
.q .qn { font-weight: 800; }
.passage { background: #F3F5F9; border: 1px solid #DCE1EB; border-radius: 2mm; padding: 2.5mm 3.5mm; margin: 1.5mm 0; white-space: pre-line; font-size: 10pt; }
.chip { display: inline-block; border: 1px solid #44506E; border-radius: 1.5mm; padding: .5mm 2mm; margin: .6mm 1mm .6mm 0; }
.lines { margin: 2mm 0; }
.lines i { display: block; height: 7.2mm; border-bottom: 1px solid #B8C0D2; }
.card { border: 1.5px solid #17203A; border-radius: 3mm; padding: 3mm 4mm; margin: 2.5mm 0; break-inside: avoid; }
.key h3 { margin: 4mm 0 1.5mm; }
.key .row { display: grid; grid-template-columns: 9mm 1fr; gap: 2mm; margin: 1.2mm 0; break-inside: avoid; }
.key .ans { font-weight: 800; background: #E3F4EA; color: #146B3E; border-radius: 1.5mm; text-align: center; padding: .3mm 0; height: fit-content; }
.small { font-size: 8.5pt; }
`

export function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Noto+Sans:wght@400;700&family=Hind+Siliguri:wght@400;600;700&display=swap">
<style>${CSS}</style></head><body>${body}</body></html>`
}

export function cover(opts: { level: string; title: string; subtitle: string; facts: [string, string][]; note: string }): string {
  return `<section class="cover">
  <div class="brand">${logo()}<div>GLBD · German Language BD</div></div>
  <div><span class="level">${esc(opts.level)}</span></div>
  <div><h1>${esc(opts.title)}</h1><div class="sub" style="margin-top:4mm">${opts.subtitle}</div></div>
  <div class="facts">${opts.facts.map(([n, l]) => `<div class="fact"><b>${esc(n)}</b>${esc(l)}</div>`).join('')}</div>
  <div class="note small" style="max-width:150mm">${opts.note}</div>
  <div class="muted small">Free interactive course: ${SITE} · For personal study. Please do not share or resell this file.</div>
</section>`
}
