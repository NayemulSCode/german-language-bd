import { UNIT_TITLES, LEVELS } from '../../src/lib/plan.ts'
import type { LessonPair } from './data.ts'
import { art, cover, esc, page } from './html.ts'

/** Vocabulary pack: every word of the level, unit by unit, with article, plural, type, Bangla and English and a tick box for self-testing. */
export function vocabPack(level: string, lessons: LessonPair[], sample = false): string {
  const units = [...new Set(lessons.map((l) => l.bn.unit))].filter((u) => !sample || u === 1)
  const words = lessons.filter((l) => units.includes(l.bn.unit)).reduce((n, l) => n + l.bn.words.length, 0)
  const info = LEVELS[level]
  const parts: string[] = [
    cover({
      level,
      title: `${level} Vocabulary Pack${sample ? ' — free sample' : ''}`,
      subtitle: `Every word from the GLBD ${level} course, with the article, plural, Bangla and English meaning.<br><span class="bn">${level} কোর্সের সব শব্দ — আর্টিকেল, বহুবচন, বাংলা ও ইংরেজি অর্থসহ।</span>`,
      facts: [[String(words), 'words'], [String(units.length), 'units'], [String(lessons.filter((l) => units.includes(l.bn.unit)).length), 'lessons']],
      note: `<b>How to use:</b> cover the Bangla and English columns and say the meaning, then check. Tick the box when you know a word. Colours: <span class="art-der">der</span> · <span class="art-die">die</span> · <span class="art-das">das</span>. ${info ? `Goal: ${esc(info.goal.en)}.` : ''} Learn every noun together with its article.`,
    }),
  ]
  for (const u of units) {
    const key = `${level}-${u}`
    const t = UNIT_TITLES[key]
    const inUnit = lessons.filter((l) => l.bn.unit === u)
    parts.push(`<section class="${parts.length > 1 ? 'pb' : ''}">
      <div class="unit-head"><div class="u">${level} · Unit ${u}</div><h2>${esc(t?.de ?? `Unit ${u}`)}</h2>${t ? `<span class="bn">${esc(t.bn)}</span><span class="en">${esc(t.en)}</span>` : ''}</div>`)
    for (const l of inUnit) {
      parts.push(`<div class="lesson-head"><span class="n">${l.bn.lesson}</span><h3>${esc(l.bn.title.de)}</h3><span class="muted small">${esc(l.en.title.en)}</span></div>
      <table class="vocab"><colgroup><col style="width:7mm"><col style="width:37%"><col style="width:13%"><col style="width:22%"><col></colgroup><thead><tr><th></th><th>German</th><th>Type</th><th>বাংলা</th><th>English</th></tr></thead><tbody>`)
      l.bn.words.forEach((w, i) => {
        const e = l.en.words[i]
        parts.push(`<tr><td class="chk">☐</td><td><span class="de">${art(w.art, w.de)}</span>${w.pl ? ` <span class="pl">· pl. ${esc(w.pl)}</span>` : ''}</td><td class="small muted">${esc(e.pos)}</td><td class="bn">${esc(w.bn)}</td><td>${esc(w.en)}</td></tr>`)
      })
      parts.push('</tbody></table>')
    }
    parts.push('</section>')
  }
  return page(`GLBD ${level} Vocabulary Pack`, parts.join('\n'))
}
