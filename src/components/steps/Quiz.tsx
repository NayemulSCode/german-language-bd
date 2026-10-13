import { useState } from 'react'
import type { Lesson, Question } from '../../schema/lesson'
import { useApp } from '../../state'
import { Say } from '../common'

interface Props {
  lesson: Lesson
  onFinish(r: { score: number; total: number; passed: boolean; wrong: string[] }): void
  onRestart(): void
}

/** Order questions track picked tiles by index so repeated words work. */
const isRight = (q: Question, picked: number | null, order: number[]) =>
  q.type === 'order' ? order.map((i) => q.tiles[i]).join(' ') === q.answer.join(' ') : picked === q.answer

export function Quiz({ lesson, onFinish, onRestart }: Props) {
  const { say, lessonProgress } = useApp()
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
        <div className="eyebrow bn">কুইজের ফলাফল</div>
        <div className="score" style={{ marginTop: 10 }}>{score}<small> / {quiz.length}</small></div>
        <p className="bn" style={{ margin: '10px 0 0' }}>
          {passed
            ? 'চমৎকার! পরের লেসন খুলে গেছে।'
            : `পরের লেসন খুলতে ${Math.round(lesson.passMark * 100)}% (${Math.ceil(lesson.passMark * quiz.length)}টি সঠিক) লাগবে। আরেকবার চেষ্টা করুন।`}
        </p>
        <p className="hint bn">সেরা স্কোর: {Math.max(best, score)} / {quiz.length}</p>
        {words.length > 0 && (
          <div className="review">
            <div className="eyebrow bn">রিভিউ তালিকায় গেল</div>
            {words.map((w) => (
              <div key={w.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Say text={(w.art ? w.art + ' ' : '') + w.de} />
                <span><b lang="de">{w.art ? w.art + ' ' : ''}{w.de}</b> — <span className="bn">{w.bn}</span></span>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          <button className="btn bn" onClick={onRestart}>আবার কুইজ</button>
          <a className="btn ghost bn" href="#course">কোর্সে ফিরুন</a>
        </div>
      </section>
    )
  }

  const cur = quiz[q]
  const ok = checked && isRight(cur, picked, order)
  const ready = cur.type === 'order' ? order.length === cur.tiles.length : picked !== null

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
      <div className="qhead bn"><span>প্রশ্ন {q + 1} / {quiz.length}</span><span>সঠিক: {score}</span></div>
      <div className="qbar"><i style={{ width: `${(q / quiz.length) * 100}%` }} /></div>
      <div className="qprompt bn">{cur.prompt}</div>

      {cur.type === 'order' ? (
        <>
          <div className="answer" lang="de" aria-label="আপনার বাক্য">
            {order.length === 0 && <span className="hint bn" style={{ margin: 6 }}>নিচের শব্দে ট্যাপ করে বাক্য বানান</span>}
            {order.map((ti) => (
              <button key={ti} className="tile" disabled={checked} onClick={() => setOrder(order.filter((x) => x !== ti))}>{cur.tiles[ti]}</button>
            ))}
          </div>
          <div className="bank" lang="de">
            {cur.tiles.map((t, ti) => !order.includes(ti) && (
              <button key={ti} className="tile" disabled={checked} onClick={() => setOrder([...order, ti])}>{t}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          {cur.type === 'listen' && (
            <div className="big-audio"><Say text={cur.say} label="প্রশ্নটি শুনুন" /><span className="hint bn" style={{ margin: 0 }}>ট্যাপ করে শুনুন, দরকার হলে আবার</span></div>
          )}
          {cur.type === 'mcq' && cur.sub && (
            <div className={`qsub${cur.subBn ? ' bn' : ''}`} {...(cur.subBn ? {} : { lang: 'de' })}>{cur.sub}</div>
          )}
          <div className="opts">
            {cur.options.map((o, i) => {
              const cls = checked ? (i === cur.answer ? 'right' : i === picked ? 'wrong' : '') : ''
              return (
                <button
                  key={i}
                  className={`opt ${cls}${cur.type === 'listen' ? ' bn' : ''}`}
                  aria-pressed={picked === i}
                  disabled={checked}
                  onClick={() => {
                    setPicked(i)
                    if (cur.type === 'mcq' && cur.subBn) void say(o)
                  }}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </>
      )}

      {checked && (
        <div className={`fb ${ok ? 'ok' : 'no'} bn`}>
          <strong>{ok ? 'ঠিক হয়েছে!' : 'হয়নি — রিভিউতে যোগ হলো'}</strong>
          {cur.type === 'order' && !ok && <><span lang="de">{cur.answer.join(' ')}</span><br /></>}
          {cur.why}
        </div>
      )}
      <div className="actions">
        {checked
          ? <button className="btn bn" onClick={advance}>{q + 1 < quiz.length ? 'পরের প্রশ্ন' : 'ফলাফল দেখি'}</button>
          : <button className="btn bn" disabled={!ready} onClick={check}>যাচাই করুন</button>}
      </div>
    </section>
  )
}
