import { UNIT_TITLES } from '../../src/lib/plan.ts'
import type { GrammarPanel } from '../../src/schema/lesson.ts'
import type { LessonPair } from './data.ts'
import { bi, cover, esc, page } from './html.ts'

const pill = (ts: { t: string; v?: boolean }[]) => ts.map((x) => (x.v ? `<span class="v">${esc(x.t)}</span>` : esc(x.t))).join(' ')

function panel(bn: GrammarPanel, en: GrammarPanel): string {
  if (bn.type === 'text' && en.type === 'text') {
    return `<div class="panel">${bn.title ? `<h4>${bi(bn.title, en.title)}</h4>` : ''}<p>${bi(bn.text, en.text)}</p></div>`
  }
  if (bn.type === 'table' && en.type === 'table') {
    return `<div class="panel">${bn.title ? `<h4>${bi(bn.title, en.title)}</h4>` : ''}${bn.intro ? `<p>${bi(bn.intro, en.intro)}</p>` : ''}
      <table><thead><tr>${bn.head.map((h, i) => `<th>${bi(h, en.head[i])}</th>`).join('')}</tr></thead><tbody>
      ${bn.rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td>${bi(c, en.rows[ri][ci])}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ${bn.note ? `<div class="note small">${bi(bn.note, en.note)}</div>` : ''}</div>`
  }
  if (bn.type === 'conjugation' && en.type === 'conjugation') {
    return `<div class="panel"><p>${bi(bn.intro, en.intro)}</p>
      <table><thead><tr><th></th>${bn.verbs.map((v) => `<th>${esc(v)}</th>`).join('')}<th>বাংলা / English</th></tr></thead><tbody>
      ${bn.rows.map((r, ri) => `<tr><td><b>${esc(r.pron)}</b></td>${r.stems.map((s, i) => `<td class="de">${esc(s)}<span class="v">${esc(r.ends[i])}</span></td>`).join('')}<td>${bi(r.bn, en.rows[ri].bn)}</td></tr>`).join('')}</tbody></table>
      ${bn.note ? `<div class="note small">${bi(bn.note, en.note)}</div>` : ''}</div>`
  }
  if (bn.type === 'order' && en.type === 'order') {
    return `<div class="panel"><h4>${bi(bn.title, en.title)}</h4><p>${bi(bn.text, en.text)}</p>
      <table><tbody><tr><td class="small muted" style="width:20mm">Deutsch</td><td class="de">${pill(bn.de)}</td></tr><tr><td class="small muted bn">বাংলা</td><td class="bn">${pill(bn.bn)}</td></tr></tbody></table></div>`
  }
  return ''
}

/** Grammar sheets: every grammar panel of the level, with the Bangla explanation and its English version together. */
export function grammarPack(level: string, lessons: LessonPair[], sample = false): string {
  const units = [...new Set(lessons.map((l) => l.bn.unit))].filter((u) => !sample || u === 1)
  const chosen = lessons.filter((l) => units.includes(l.bn.unit))
  const panels = chosen.reduce((n, l) => n + l.bn.grammar.length, 0)
  const parts: string[] = [
    cover({
      level,
      title: `${level} Grammar Sheets${sample ? ' — free sample' : ''}`,
      subtitle: `All grammar tables and rules of the GLBD ${level} course on printable pages, explained in Bangla and English.<br><span class="bn">${level} কোর্সের সব ব্যাকরণের ছক ও নিয়ম — বাংলা ও ইংরেজি ব্যাখ্যাসহ।</span>`,
      facts: [[String(panels), 'grammar panels'], [String(units.length), 'units'], [String(chosen.length), 'lessons']],
      note: `<b>How to use:</b> read one lesson's sheet, cover the right-hand column of each table, and recall it. The <span class="v">underlined</span> part marks the verb or the ending to notice.`,
    }),
  ]
  for (const u of units) {
    const t = UNIT_TITLES[`${level}-${u}`]
    parts.push(`<section class="${parts.length > 1 ? 'pb' : ''}"><div class="unit-head"><div class="u">${level} · Unit ${u}</div><h2>${esc(t?.de ?? `Unit ${u}`)}</h2>${t ? `<span class="bn">${esc(t.bn)}</span><span class="en">${esc(t.en)}</span>` : ''}</div>`)
    for (const l of chosen.filter((x) => x.bn.unit === u)) {
      parts.push(`<div class="lesson-head"><span class="n">${l.bn.lesson}</span><h3>${esc(l.bn.title.de)}</h3><span class="muted small">${esc(l.en.title.en)}</span></div>`)
      l.bn.grammar.forEach((g, i) => parts.push(panel(g, l.en.grammar[i])))
    }
    parts.push('</section>')
  }
  return page(`GLBD ${level} Grammar Sheets`, parts.join('\n'))
}
