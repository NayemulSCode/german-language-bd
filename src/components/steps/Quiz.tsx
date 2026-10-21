import { useState } from 'react'
import type { Lesson } from '../../schema/lesson'
import { useApp } from '../../state'
import { Say, Tr } from '../common'
import { QuestionBody, isReady, isRight } from '../Question'
import { useT } from '../../i18n/useT'

interface Props {
  lesson: Lesson
  onFinish(r: { score: number; total: number; passed: boolean; wrong: string[] }): void
  onRestart(): void
}

export function Quiz({ lesson, onFinish, onRestart }: Props) {
  const { say, lessonProgress } = useApp()
  const { t, n } = useT()
  const quiz = lesson.quiz
  const [q, setQ] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const best = lessonProgress(lesson.id).best

  if (q >= quiz.length) {
    const passed = score / quiz.length >= lesson.passMark
    const words = [...new Set(wrong)].map((id) => lesson.words.find((w) => w.id === id)).filter((w) => !!w)
    return (
      <section className="panel result">
        <div className="eyebrow bn">{t('quiz.result')}</div>
        <div className="score" style={{ marginTop: 10 }}>{n(score)}<small> / {n(quiz.length)}</small></div>
        <p className="bn" style={{ margin: '10px 0 0' }}>
          {passed
            ? t('quiz.passed')
            : t('quiz.failed', { pct: Math.round(lesson.passMark * 100), need: Math.ceil(lesson.passMark * quiz.length) })}
        </p>
        <p className="hint bn">{t('quiz.best', { a: Math.max(best, score), b: quiz.length })}</p>
        {words.length > 0 && (
          <div className="review">
            <div className="eyebrow bn">{t('quiz.addedReview')}</div>
            {words.map((w) => (
              <div key={w.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Say text={(w.art ? w.art + ' ' : '') + w.de} />
                <span><b lang="de">{w.art ? w.art + ' ' : ''}{w.de}</b> — <Tr bn={w.bn} en={w.en} /></span>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          <button className="btn bn" onClick={onRestart}>{t('quiz.again')}</button>
          <a className="btn ghost bn" href="#course">{t('common.back.course')}</a>
        </div>
      </section>
    )
  }

  const cur = quiz[q]
  const ok = checked && isRight(cur, picked, order)
  const ready = isReady(cur, picked, order)

  const check = () => {
    setChecked(true)
    if (isRight(cur, picked, order)) setScore((s) => s + 1)
    else if (cur.word) setWrong((w) => [...w, cur.word!])
    if (cur.type === 'order') void say(cur.answer.join(' '))
    else if (cur.type === 'mcq' && cur.subBn && picked !== null) void say(cur.options[cur.answer])
  }
  const advance = () => {
    const nextQ = q + 1
    setQ(nextQ)
    setPicked(null)
    setChecked(false)
    setOrder([])
    window.scrollTo({ top: 0 })
    if (nextQ >= quiz.length) onFinish({ score, total: quiz.length, passed: score / quiz.length >= lesson.passMark, wrong })
  }

  return (
    <section>
      <div className="qhead bn"><span>{t('q.of', { a: q + 1, b: quiz.length })}</span><span>{t('quiz.correct', { n: score })}</span></div>
      <div className="qbar"><i style={{ width: `${(q / quiz.length) * 100}%` }} /></div>
      <div className="qprompt bn">{cur.prompt}</div>

      <QuestionBody q={cur} picked={picked} order={order} checked={checked} onPick={setPicked} onOrder={setOrder} />

      {checked && (
        <div className={`fb ${ok ? 'ok' : 'no'} bn`}>
          <strong>{ok ? t('q.right') : t('quiz.wrong')}</strong>
          {cur.type === 'order' && !ok && <><span lang="de">{cur.answer.join(' ')}</span><br /></>}
          {cur.why}
        </div>
      )}
      <div className="actions">
        {checked
          ? <button className="btn bn" onClick={advance}>{q + 1 < quiz.length ? t('q.next') : t('quiz.seeResult')}</button>
          : <button className="btn bn" disabled={!ready} onClick={check}>{t('quiz.check')}</button>}
      </div>
    </section>
  )
}
