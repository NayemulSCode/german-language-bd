import { useEffect, useMemo, useState } from 'react'
import type { Exam } from '../schema/exam'
import { loadExam, missed, saveAttempt, scoreExam, type Answers } from '../lib/exam'
import { bn } from '../lib/format'
import { Icon } from '../components/Icon'
import { Say } from '../components/common'
import { QuestionBody } from '../components/Question'

type Phase = { k: 'intro' } | { k: 'part'; pi: number; qi: number } | { k: 'writing'; i: number } | { k: 'speaking'; i: number } | { k: 'result' }

const PART_NAMES: Record<string, string> = { hoeren: 'Hören', lesen: 'Lesen' }

/**
 * A full A1 mock exam in the shape of Start Deutsch 1: Hören and Lesen are scored automatically (no feedback until the end),
 * Schreiben and Sprechen are practised and self-checked against a model answer.
 */
export function ExamScreen({ id }: { id: string }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState<Phase>({ k: 'intro' })
  const [answers, setAnswers] = useState<Answers>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [writingDone, setWritingDone] = useState<Record<number, number>>({}) // task index → checklist items ticked
  const [spoken, setSpoken] = useState<Record<string, boolean>>({})
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    loadExam(id).then(setExam, () => setError(true))
  }, [id])

  const score = useMemo(() => (exam && phase.k === 'result' ? scoreExam(exam, answers) : null), [exam, phase.k, answers])
  useEffect(() => {
    if (score) saveAttempt(id, score.pct)
  }, [score, id])

  const header = (
    <header className="lbar">
      <div className="lbar-top">
        <a className="lclose" href="#course" aria-label="বন্ধ করে কোর্সে ফিরুন"><Icon name="close" /></a>
        <span className="lvl">{exam?.level ?? ''}</span>
        <span className="lbar-title">{exam?.title.bn ?? 'মক পরীক্ষা'}</span>
      </div>
    </header>
  )
  const shell = (children: React.ReactNode) => <div className="lx"><div className="wrap">{header}{children}</div></div>

  if (error) return shell(<p className="bn" style={{ marginTop: 24 }}>এই পরীক্ষাটি খুঁজে পাওয়া যায়নি। <a href="#course">কোর্সে ফিরুন</a></p>)
  if (!exam) return shell(<div className="loading bn">লোড হচ্ছে…</div>)

  const restart = () => {
    setAnswers([])
    setPicked(null)
    setWritingDone({})
    setSpoken({})
    setAttempt((n) => n + 1)
    setPhase({ k: 'intro' })
    window.scrollTo({ top: 0 })
  }
  const to = (p: Phase) => {
    setPhase(p)
    window.scrollTo({ top: 0 })
  }

  /* ---------- intro ---------- */
  if (phase.k === 'intro') {
    const total = exam.parts.reduce((n, p) => n + p.questions.length, 0)
    return shell(
      <section key={attempt}>
        <div className="eyebrow bn">{exam.level === 'A1' ? 'মডেল টেস্ট · Start Deutsch 1-এর ধাঁচে' : `মডেল টেস্ট · Goethe-Zertifikat ${exam.level}-এর ধাঁচে`}</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }} lang="de">{exam.title.de}</h1>
        <div className="panel" style={{ marginTop: 14 }}>
          <ul className="goals bn">
            <li><b>Hören</b> — {bn(exam.parts[0].questions.length)}টি প্রশ্ন, প্রায় {bn(exam.parts[0].minutes)} মিনিট (শুনে উত্তর)।</li>
            <li><b>Lesen</b> — {bn(exam.parts[1].questions.length)}টি প্রশ্ন, প্রায় {bn(exam.parts[1].minutes)} মিনিট (পড়ে উত্তর)।</li>
            <li><b>Schreiben</b> — {bn(exam.writing.length)}টি লেখার কাজ; নমুনা উত্তরের সাথে নিজে মিলিয়ে দেখবেন।</li>
            <li><b>Sprechen</b> — {bn(exam.speaking.length)}টি কথা বলার অংশ; জোরে বলে নমুনা শুনে মিলিয়ে নেবেন।</li>
            <li>Hören ও Lesen মিলিয়ে মোট {bn(total)}টি প্রশ্ন — প্রতিটির উত্তরের পর ঠিক-ভুল দেখানো হবে না, শেষে সব দেখবেন। {bn(Math.round(exam.passMark * 100))}% বা বেশি হলে ভালো।</li>
          </ul>
          <p className="hint bn">এটা অফিশিয়াল পরীক্ষা নয়, অনুশীলনের জন্য। আসল পরীক্ষার ধরন, সময় ও নম্বর বদলাতে পারে — Goethe-Institut-এর ওয়েবসাইটে সর্বশেষ নিয়ম দেখে নিন।</p>
        </div>
        <div className="actions"><button className="btn bn" onClick={() => to({ k: 'part', pi: 0, qi: 0 })}>পরীক্ষা শুরু করি</button></div>
      </section>,
    )
  }

  /* ---------- Hören / Lesen ---------- */
  if (phase.k === 'part') {
    const part = exam.parts[phase.pi]
    const q = part.questions[phase.qi]
    const last = phase.qi === part.questions.length - 1
    const next = (value: number | null) => {
      setAnswers((a) => {
        const copy = a.map((x) => [...x])
        copy[phase.pi] = [...(copy[phase.pi] ?? [])]
        copy[phase.pi][phase.qi] = value
        return copy
      })
      setPicked(null)
      if (!last) to({ k: 'part', pi: phase.pi, qi: phase.qi + 1 })
      else if (phase.pi + 1 < exam.parts.length) to({ k: 'part', pi: phase.pi + 1, qi: 0 })
      else to({ k: 'writing', i: 0 })
    }
    return shell(
      <section key={`${phase.pi}-${phase.qi}`}>
        <div className="eyebrow bn">{PART_NAMES[part.kind]} · {part.title.split('—')[1]?.trim()}</div>
        {phase.qi === 0 && <p className="hint bn" style={{ marginTop: 6 }}>{part.instructions}</p>}
        <div className="qhead bn" style={{ marginTop: 10 }}><span>প্রশ্ন {bn(phase.qi + 1)} / {bn(part.questions.length)}</span><span>{PART_NAMES[part.kind]}</span></div>
        <div className="qbar"><i style={{ width: `${(phase.qi / part.questions.length) * 100}%` }} /></div>
        <div className="qprompt" lang="de">{q.prompt}</div>
        <QuestionBody q={q} picked={picked} order={[]} checked={false} onPick={setPicked} onOrder={() => undefined} />
        <div className="actions">
          <button className="btn ghost bn" onClick={() => next(null)}>বাদ দিন</button>
          <button className="btn bn" disabled={picked === null} onClick={() => next(picked)}>{last && phase.pi + 1 === exam.parts.length ? 'Lesen শেষ' : 'পরের প্রশ্ন'}</button>
        </div>
      </section>,
    )
  }

  /* ---------- Schreiben ---------- */
  if (phase.k === 'writing') {
    const w = exam.writing[phase.i]
    return <WritingTask key={phase.i} task={w} index={phase.i} count={exam.writing.length} shell={shell} onDone={(ticked) => {
      setWritingDone((d) => ({ ...d, [phase.i]: ticked }))
      to(phase.i + 1 < exam.writing.length ? { k: 'writing', i: phase.i + 1 } : { k: 'speaking', i: 0 })
    }} />
  }

  /* ---------- Sprechen ---------- */
  if (phase.k === 'speaking') {
    const sp = exam.speaking[phase.i]
    const lastSp = phase.i === exam.speaking.length - 1
    return shell(
      <section key={phase.i}>
        <div className="eyebrow bn">Sprechen · {bn(phase.i + 1)} / {bn(exam.speaking.length)}</div>
        <h2 style={{ fontSize: 22, marginTop: 4 }} lang="de">{sp.title}</h2>
        <p className="hint bn">{sp.instructions}</p>
        <div className="speak-list">
          {sp.prompts.map((pr, i) => {
            const key = `${phase.i}-${i}`
            const done = !!spoken[key]
            return (
              <div key={key} className={`speak${done ? ' done' : ''}`}>
                <div className="speak-q">
                  <b lang="de">{pr.de}</b>
                  <span className="bn muted">{pr.bn}</span>
                </div>
                {done && <div className="speak-a" lang="de">{pr.model}</div>}
                <div className="speak-act">
                  {done && <Say text={pr.model} label="নমুনা উত্তর শুনুন" />}
                  <button className="btn sm ghost bn" onClick={() => setSpoken((s) => ({ ...s, [key]: !s[key] }))}>{done ? 'আবার লুকান' : 'বলেছি — নমুনা দেখি'}</button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="actions"><button className="btn bn" onClick={() => to(lastSp ? { k: 'result' } : { k: 'speaking', i: phase.i + 1 })}>{lastSp ? 'ফলাফল দেখি' : 'পরের অংশ'}</button></div>
      </section>,
    )
  }

  /* ---------- result ---------- */
  const s = score!
  const wrong = missed(exam, answers)
  const wTotal = exam.writing.reduce((n, w) => n + w.checklist.length, 0)
  const wTicked = Object.values(writingDone).reduce((n, t) => n + t, 0)
  const sTotal = exam.speaking.reduce((n, sp) => n + sp.prompts.length, 0)
  const sDone = Object.values(spoken).filter(Boolean).length
  return shell(
    <section className="panel result" style={{ marginTop: 22 }}>
      <div className="eyebrow bn">আপনার ফলাফল</div>
      <div className="score" style={{ marginTop: 10 }}>{bn(s.correct)}<small> / {bn(s.total)}</small></div>
      <h2 className="bn" style={{ fontSize: 22, marginTop: 6 }}>{bn(Math.round(s.pct * 100))}% — {s.passed ? 'পাস মার্কের উপরে!' : 'পাস মার্কের নিচে'}</h2>
      <p className="bn" style={{ margin: '4px 0 0' }}>
        {s.passed
          ? 'দারুণ! আসল পরীক্ষায় Schreiben ও Sprechen-ও মূল্যায়ন হয়, তাই ওই দুটিও নিয়মিত অনুশীলন করুন।'
          : 'কোনো সমস্যা নেই — নিচের ভুলগুলো দেখে সংশ্লিষ্ট ইউনিট আবার করুন, তারপর আরেকবার দিন।'}
      </p>
      <div className="meter bn" style={{ gridTemplateColumns: `repeat(${s.parts.length + 2},1fr)` }} aria-label="অংশ অনুযায়ী ফল">
        {s.parts.map((p, i) => (
          <div key={i}>
            <i><u style={{ width: `${(p.correct / p.total) * 100}%`, background: p.correct / p.total >= exam.passMark ? 'var(--good)' : 'var(--accent)' }} /></i>
            <span>{PART_NAMES[exam.parts[i].kind]} {bn(p.correct)}/{bn(p.total)}</span>
          </div>
        ))}
        <div>
          <i><u style={{ width: `${(wTicked / wTotal) * 100}%` }} /></i>
          <span>Schreiben (নিজে) {bn(wTicked)}/{bn(wTotal)}</span>
        </div>
        <div>
          <i><u style={{ width: `${(sDone / sTotal) * 100}%` }} /></i>
          <span>Sprechen (নিজে) {bn(sDone)}/{bn(sTotal)}</span>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="review" style={{ marginTop: 18 }}>
          <div className="eyebrow bn">ভুল বা বাদ দেওয়া প্রশ্ন ({bn(wrong.length)})</div>
          {wrong.map((m) => (
            <div key={`${m.part}-${m.index}`}>
              <div className="bn muted" style={{ fontSize: 12 }}>{PART_NAMES[exam.parts[m.part].kind]} · প্রশ্ন {bn(m.index + 1)}</div>
              {m.q.type === 'listen' && <div lang="de" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Say text={m.q.say} /><span>{m.q.say}</span></div>}
              {m.q.type === 'mcq' && m.q.passage && <div className="passage" lang="de">{m.q.passage}</div>}
              <div lang="de"><b>{m.q.prompt}</b></div>
              {m.q.type !== 'order' && (
                <>
                  <div className="bn">{m.picked === null ? 'আপনি বাদ দিয়েছেন।' : <>আপনার উত্তর: <span lang="de">{m.q.options[m.picked]}</span></>}</div>
                  <div className="bn">ঠিক উত্তর: <b lang="de">{m.q.options[m.q.answer]}</b></div>
                </>
              )}
              <div className="bn muted">{m.q.why}</div>
            </div>
          ))}
        </div>
      )}
      <div className="actions" style={{ flexDirection: 'column' }}>
        <button className="btn bn" onClick={restart}>আবার পরীক্ষা দিন</button>
        <a className="btn ghost bn" href="#course">কোর্সে ফিরুন</a>
      </div>
    </section>,
  )
}

function WritingTask({ task, index, count, shell, onDone }: {
  task: Exam['writing'][number]
  index: number
  count: number
  shell: (c: React.ReactNode) => React.ReactElement
  onDone(ticked: number): void
}) {
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  const [ticks, setTicks] = useState<boolean[]>(() => task.checklist.map(() => false))
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return shell(
    <section>
      <div className="eyebrow bn">Schreiben · {bn(index + 1)} / {bn(count)}</div>
      <h2 style={{ fontSize: 22, marginTop: 4 }} lang="de">{task.title}</h2>
      <p className="bn" style={{ marginTop: 6 }}>{task.taskBn}</p>
      <div className="passage" lang="de">{task.taskDe}</div>
      <textarea className="txt" lang="de" rows={task.minWords > 0 ? 6 : 7} value={text} onChange={(e) => setText(e.target.value)} placeholder="এখানে লিখুন (ঐচ্ছিক — কাগজেও লিখতে পারেন)…" aria-label="আপনার উত্তর" />
      {task.minWords > 0 && <div className="hint bn">{bn(words)} শব্দ · আসল পরীক্ষায় প্রায় {bn(task.minWords)} শব্দ চাওয়া হয়</div>}
      {!shown ? (
        <div className="actions"><button className="btn bn" onClick={() => setShown(true)}>নমুনা উত্তর দেখি</button></div>
      ) : (
        <>
          <div className="eyebrow bn" style={{ marginTop: 18 }}>নমুনা উত্তর</div>
          <div className="passage model" lang="de">{task.model}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}><Say text={task.model.replace(/\n/g, ' ')} label="নমুনা উত্তর শুনুন" /><span className="hint bn" style={{ margin: 0 }}>উচ্চারণসহ পড়ে দেখুন</span></div>
          <div className="eyebrow bn" style={{ marginTop: 18 }}>নিজে মিলিয়ে দেখুন</div>
          <ul className="checks bn">
            {task.checklist.map((c, i) => (
              <li key={i}>
                <label><input type="checkbox" checked={ticks[i]} onChange={() => setTicks(ticks.map((t, j) => (j === i ? !t : t)))} /> {c}</label>
              </li>
            ))}
          </ul>
          <div className="actions"><button className="btn bn" onClick={() => onDone(ticks.filter(Boolean).length)}>{index + 1 < count ? 'পরের কাজ' : 'Sprechen-এ যাই'}</button></div>
        </>
      )}
    </section>,
  )
}
