import type { Question } from '../schema/lesson'
import { useApp } from '../state'
import { Say } from './common'

/** Order questions track picked tiles by index so repeated words work. */
export const isRight = (q: Question, picked: number | null, order: number[]) =>
  q.type === 'order' ? order.map((i) => q.tiles[i]).join(' ') === q.answer.join(' ') : picked === q.answer

export const isReady = (q: Question, picked: number | null, order: number[]) => (q.type === 'order' ? order.length === q.tiles.length : picked !== null)

interface Props {
  q: Question
  picked: number | null
  order: number[]
  checked: boolean // true shows right/wrong colouring and locks the inputs
  onPick(i: number): void
  onOrder(next: number[]): void
}

/** The answer area of one question (multiple choice, listening, or word ordering). Used by lesson quizzes and the placement test. */
export function QuestionBody({ q, picked, order, checked, onPick, onOrder }: Props) {
  const { say } = useApp()
  if (q.type === 'order') {
    return (
      <>
        <div className="answer" lang="de" aria-label="আপনার বাক্য">
          {order.length === 0 && <span className="hint bn" style={{ margin: 6 }}>নিচের শব্দে ট্যাপ করে বাক্য বানান</span>}
          {order.map((ti) => (
            <button key={ti} className="tile" disabled={checked} onClick={() => onOrder(order.filter((x) => x !== ti))}>{q.tiles[ti]}</button>
          ))}
        </div>
        <div className="bank" lang="de">
          {q.tiles.map((t, ti) => !order.includes(ti) && (
            <button key={ti} className="tile" disabled={checked} onClick={() => onOrder([...order, ti])}>{t}</button>
          ))}
        </div>
      </>
    )
  }
  return (
    <>
      {q.type === 'listen' && (
        <div className="big-audio"><Say text={q.say} label="প্রশ্নটি শুনুন" /><span className="hint bn" style={{ margin: 0 }}>ট্যাপ করে শুনুন, দরকার হলে আবার</span></div>
      )}
      {q.type === 'mcq' && q.sub && (
        <div className={`qsub${q.subBn ? ' bn' : ''}`} {...(q.subBn ? {} : { lang: 'de' })}>{q.sub}</div>
      )}
      <div className="opts">
        {q.options.map((o, i) => {
          const cls = checked ? (i === q.answer ? 'right' : i === picked ? 'wrong' : '') : ''
          return (
            <button
              key={i}
              className={`opt ${cls}${q.type === 'listen' ? ' bn' : ''}`}
              aria-pressed={picked === i}
              disabled={checked}
              onClick={() => {
                onPick(i)
                if (q.type === 'mcq' && q.subBn) void say(o)
              }}
            >
              {o}
            </button>
          )
        })}
      </div>
    </>
  )
}
