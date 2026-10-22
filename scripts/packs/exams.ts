import type { Question } from '../../src/schema/lesson.ts'
import type { ExamPair } from './data.ts'
import { bi, cover, esc, nl, page } from './html.ts'

const L = 'ABCDEFGH'

function question(q: Question, n: number, prevPassage: string | undefined): string {
  const head = `<div><span class="qn">${n}.</span> ${esc(q.prompt)}</div>`
  if (q.type === 'order') {
    return `<div class="q">${head}<div style="margin:1.5mm 0">${q.tiles.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div><div class="lines"><i></i></div></div>`
  }
  const passage = q.type === 'mcq' && q.passage && q.passage !== prevPassage ? `<div class="passage">${nl(q.passage).replace(/<br>/g, '\n')}</div>` : ''
  const sub = q.type === 'mcq' && q.sub ? `<div class="muted">${esc(q.sub)}</div>` : ''
  return `<div class="q">${passage}${head}${sub}${q.options.map((o, i) => `<div class="opt"><span class="b"></span><span><b>${L[i]}</b> ${esc(o)}</span></div>`).join('')}</div>`
}

/** Mock exam booklets: the question paper (Hören, Lesen, Schreiben, Sprechen) followed by an answer key with transcripts and model answers. */
export function examPack(level: string, exams: ExamPair[]): string {
  const parts: string[] = [
    cover({
      level,
      title: `${level} Mock Exams`,
      subtitle: `${exams.length} full practice papers in the style of the Goethe-Zertifikat ${level}, with an answer key, transcripts and model answers.<br><span class="bn">Goethe-Zertifikat ${level}-এর ধাঁচে ${exams.length}টি পূর্ণ অনুশীলন পরীক্ষা — উত্তরমালা ও নমুনা উত্তরসহ।</span>`,
      facts: [[String(exams.length), 'practice papers'], [String(exams.reduce((n, e) => n + e.bn.parts.reduce((m, p) => m + p.questions.length, 0), 0)), 'questions'], ['60%', 'pass mark']],
      note: `<b>Not an official test.</b> Hören: read the transcript aloud to a friend, or listen to the audio in the GLBD app. Time yourself with the suggested minutes. Answers and model texts are at the end of each paper.`,
    }),
  ]
  for (const { bn, en } of exams) {
    const total = bn.parts.reduce((n, p) => n + p.questions.length, 0)
    const minutes = bn.parts.reduce((n, p) => n + p.minutes, 0)
    parts.push(`<section class="pb"><div class="unit-head"><div class="u">${level} · Mock exam</div><h2>${esc(bn.title.de)}</h2><span class="en">${esc(bn.title.en)} · ${total} questions · about ${minutes} min · pass mark ${Math.round(bn.passMark * 100)}% (${Math.ceil(total * bn.passMark)} / ${total})</span></div>
      <div class="note small">Name: ______________________ &nbsp;&nbsp; Date: ______________ &nbsp;&nbsp; Score: ______ / ${total}</div>`)
    let n = 0
    bn.parts.forEach((p, pi) => {
      parts.push(`<h3 style="margin-top:5mm">${esc(p.title.split('—')[0].trim())} <span class="muted">· ${esc(en.parts[pi].title.split('—')[1]?.trim() ?? '')} · ${p.minutes} min</span></h3><p class="small">${bi(p.instructions, en.parts[pi].instructions)}</p>`)
      p.questions.forEach((q, qi) => parts.push(question(q, ++n, qi > 0 && p.questions[qi - 1].type === 'mcq' ? (p.questions[qi - 1] as { passage?: string }).passage : undefined)))
    })
    bn.writing.forEach((w, i) => {
      parts.push(`<div style="break-inside:avoid-page"><h3 style="margin-top:6mm">Schreiben ${bn.writing.length > 1 ? i + 1 : ''} <span class="muted">· ${esc(w.title)}</span></h3>
        <p>${bi(w.taskBn, en.writing[i].taskBn)}</p><div class="passage">${esc(w.taskDe)}</div>${w.minWords > 0 ? `<p class="small muted">At least ${w.minWords} words.</p>` : ''}
        <div class="lines">${'<i></i>'.repeat(Math.max(8, Math.min(14, Math.ceil(w.minWords / 7))))}</div></div>`)
    })
    bn.speaking.forEach((s, i) => {
      parts.push(`<h3 style="margin-top:6mm;break-after:avoid">Sprechen ${i + 1} <span class="muted">· ${esc(s.title)}</span></h3><p class="small">${bi(s.instructions, en.speaking[i].instructions)}</p>`)
      s.prompts.forEach((pr, j) => parts.push(`<div class="card"><b>${esc(pr.de)}</b><div class="small">${bi(pr.bn, en.speaking[i].prompts[j].bn)}</div></div>`))
    })
    // ---- answer key
    parts.push(`<div class="pb key"><h2>Answer key · ${esc(bn.title.de)}</h2>`)
    n = 0
    bn.parts.forEach((p, pi) => {
      parts.push(`<h3>${esc(p.title.split('—')[0].trim())}</h3>`)
      p.questions.forEach((q, qi) => {
        n++
        const why = bi(q.why, en.parts[pi].questions[qi].why)
        const ans = q.type === 'order' ? esc(q.answer.join(' ')) : `<b>${L[q.answer]}</b> ${esc(q.options[q.answer])}`
        const say = q.type === 'listen' ? `<div class="small muted">🎧 ${esc(q.say)}</div>` : ''
        parts.push(`<div class="row"><div class="ans">${n}</div><div>${ans}${say}<div class="small">${why}</div></div></div>`)
      })
    })
    bn.writing.forEach((w, i) => {
      parts.push(`<h3>Schreiben ${bn.writing.length > 1 ? i + 1 : ''} · model answer</h3><div class="passage">${esc(w.model)}</div><div class="small"><b>Checklist</b><ul style="margin:1mm 0 0 5mm;padding:0">${w.checklist.map((c, k) => `<li>${bi(c, en.writing[i].checklist[k])}</li>`).join('')}</ul></div>`)
    })
    bn.speaking.forEach((s, i) => {
      parts.push(`<h3>Sprechen ${i + 1} · model answers</h3>${s.prompts.map((pr) => `<div class="row"><div></div><div><b>${esc(pr.de)}</b><div>${esc(pr.model)}</div></div></div>`).join('')}`)
    })
    parts.push('</div></section>')
  }
  return page(`GLBD ${level} Mock Exams`, parts.join('\n'))
}
