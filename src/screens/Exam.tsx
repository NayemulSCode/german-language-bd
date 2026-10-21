import { useEffect, useMemo, useState } from 'react'
import type { Exam } from '../schema/exam'
import { loadExam, missed, saveAttempt, scoreExam, type Answers } from '../lib/exam'
import { useT } from '../i18n/useT'
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
  const { t, n, ui } = useT()
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
        <a className="lclose" href="#course" aria-label={t('common.closeToCourse')}><Icon name="close" /></a>
        <span className="lvl">{exam?.level ?? ''}</span>
        <span className="lbar-title">{exam?.title[ui] ?? t('course.mock')}</span>
      </div>
    </header>
  )
  const shell = (children: React.ReactNode) => <div className="lx"><div className="wrap">{header}{children}</div></div>

  if (error) return shell(<p className="bn" style={{ marginTop: 24 }}>{t('exam.notFound')} <a href="#course">{t('common.back.course')}</a></p>)
  if (!exam) return shell(<div className="loading bn">{t('common.loading')}</div>)

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
        <div className="eyebrow bn">{exam.level === 'A1' ? t('exam.modelA1') : t('exam.modelLv', { lv: exam.level })}</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }} lang="de">{exam.title.de}</h1>
        <div className="panel" style={{ marginTop: 14 }}>
          <ul className="goals bn">
            <li><b>Hören</b> — {t('exam.hoeren', { q: exam.parts[0].questions.length, m: exam.parts[0].minutes })}</li>
            <li><b>Lesen</b> — {t('exam.lesen', { q: exam.parts[1].questions.length, m: exam.parts[1].minutes })}</li>
            <li><b>Schreiben</b> — {t('exam.schreiben', { n: exam.writing.length })}</li>
            <li><b>Sprechen</b> — {t('exam.sprechen', { n: exam.speaking.length })}</li>
            <li>{t('exam.total', { n: total, pct: Math.round(exam.passMark * 100) })}</li>
          </ul>
          <p className="hint bn">{t('exam.disclaimer')}</p>
        </div>
        <div className="actions"><button className="btn bn" onClick={() => to({ k: 'part', pi: 0, qi: 0 })}>{t('exam.begin')}</button></div>
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
        <div className="qhead bn" style={{ marginTop: 10 }}><span>{t('q.of', { a: phase.qi + 1, b: part.questions.length })}</span><span>{PART_NAMES[part.kind]}</span></div>
        <div className="qbar"><i style={{ width: `${(phase.qi / part.questions.length) * 100}%` }} /></div>
        <div className="qprompt" lang="de">{q.prompt}</div>
        <QuestionBody q={q} picked={picked} order={[]} checked={false} onPick={setPicked} onOrder={() => undefined} />
        <div className="actions">
          <button className="btn ghost bn" onClick={() => next(null)}>{t('exam.skip')}</button>
          <button className="btn bn" disabled={picked === null} onClick={() => next(picked)}>{last && phase.pi + 1 === exam.parts.length ? t('exam.lesenDone') : t('q.next')}</button>
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
        <div className="eyebrow bn">Sprechen · {n(phase.i + 1)} / {n(exam.speaking.length)}</div>
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
                  {done && <Say text={pr.model} label={t('exam.hearModel')} />}
                  <button className="btn sm ghost bn" onClick={() => setSpoken((s) => ({ ...s, [key]: !s[key] }))}>{done ? t('exam.hide') : t('exam.spoke')}</button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="actions"><button className="btn bn" onClick={() => to(lastSp ? { k: 'result' } : { k: 'speaking', i: phase.i + 1 })}>{lastSp ? t('quiz.seeResult') : t('exam.nextPart')}</button></div>
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
      <div className="eyebrow bn">{t('exam.yourResult')}</div>
      <div className="score" style={{ marginTop: 10 }}>{n(s.correct)}<small> / {n(s.total)}</small></div>
      <h2 className="bn" style={{ fontSize: 22, marginTop: 6 }}>{n(Math.round(s.pct * 100))}% — {s.passed ? t('exam.abovePass') : t('exam.belowPass')}</h2>
      <p className="bn" style={{ margin: '4px 0 0' }}>
        {s.passed
          ? t('exam.goodMsg')
          : t('exam.badMsg')}
      </p>
      <div className="meter bn" style={{ gridTemplateColumns: `repeat(${s.parts.length + 2},1fr)` }} aria-label={t('exam.byPart')}>
        {s.parts.map((p, i) => (
          <div key={i}>
            <i><u style={{ width: `${(p.correct / p.total) * 100}%`, background: p.correct / p.total >= exam.passMark ? 'var(--good)' : 'var(--accent)' }} /></i>
            <span>{PART_NAMES[exam.parts[i].kind]} {n(p.correct)}/{n(p.total)}</span>
          </div>
        ))}
        <div>
          <i><u style={{ width: `${(wTicked / wTotal) * 100}%` }} /></i>
          <span>{t('exam.selfW', { a: wTicked, b: wTotal })}</span>
        </div>
        <div>
          <i><u style={{ width: `${(sDone / sTotal) * 100}%` }} /></i>
          <span>{t('exam.selfS', { a: sDone, b: sTotal })}</span>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="review" style={{ marginTop: 18 }}>
          <div className="eyebrow bn">{t('exam.missed', { n: wrong.length })}</div>
          {wrong.map((m) => (
            <div key={`${m.part}-${m.index}`}>
              <div className="bn muted" style={{ fontSize: 12 }}>{PART_NAMES[exam.parts[m.part].kind]} · {t('exam.qn', { n: m.index + 1 })}</div>
              {m.q.type === 'listen' && <div lang="de" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Say text={m.q.say} /><span>{m.q.say}</span></div>}
              {m.q.type === 'mcq' && m.q.passage && <div className="passage" lang="de">{m.q.passage}</div>}
              <div lang="de"><b>{m.q.prompt}</b></div>
              {m.q.type !== 'order' && (
                <>
                  <div className="bn">{m.picked === null ? t('exam.skipped') : <>{t('exam.yourAnswer')}: <span lang="de">{m.q.options[m.picked]}</span></>}</div>
                  <div className="bn">{t('exam.correctAnswer')}: <b lang="de">{m.q.options[m.q.answer]}</b></div>
                </>
              )}
              <div className="bn muted">{m.q.why}</div>
            </div>
          ))}
        </div>
      )}
      <div className="actions" style={{ flexDirection: 'column' }}>
        <button className="btn bn" onClick={restart}>{t('exam.retake')}</button>
        <a className="btn ghost bn" href="#course">{t('common.back.course')}</a>
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
  const { t, n } = useT()
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  const [ticks, setTicks] = useState<boolean[]>(() => task.checklist.map(() => false))
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return shell(
    <section>
      <div className="eyebrow bn">Schreiben · {n(index + 1)} / {n(count)}</div>
      <h2 style={{ fontSize: 22, marginTop: 4 }} lang="de">{task.title}</h2>
      <p className="bn" style={{ marginTop: 6 }}>{task.taskBn}</p>
      <div className="passage" lang="de">{task.taskDe}</div>
      <textarea className="txt" lang="de" rows={task.minWords > 0 ? 6 : 7} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('exam.writeHere')} aria-label={t('exam.yourAnswerLbl')} />
      {task.minWords > 0 && <div className="hint bn">{t('exam.wordCount', { a: words, b: task.minWords })}</div>}
      {!shown ? (
        <div className="actions"><button className="btn bn" onClick={() => setShown(true)}>{t('exam.showModel')}</button></div>
      ) : (
        <>
          <div className="eyebrow bn" style={{ marginTop: 18 }}>{t('exam.model')}</div>
          <div className="passage model" lang="de">{task.model}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}><Say text={task.model.replace(/\n/g, ' ')} label={t('exam.hearModel')} /><span className="hint bn" style={{ margin: 0 }}>{t('exam.readAloud')}</span></div>
          <div className="eyebrow bn" style={{ marginTop: 18 }}>{t('exam.selfCheck')}</div>
          <ul className="checks bn">
            {task.checklist.map((c, i) => (
              <li key={i}>
                <label><input type="checkbox" checked={ticks[i]} onChange={() => setTicks(ticks.map((t, j) => (j === i ? !t : t)))} /> {c}</label>
              </li>
            ))}
          </ul>
          <div className="actions"><button className="btn bn" onClick={() => onDone(ticks.filter(Boolean).length)}>{index + 1 < count ? t('exam.nextTask') : t('exam.toSprechen')}</button></div>
        </>
      )}
    </section>,
  )
}
