import type { Lesson } from '../../schema/lesson'
import { NextButton, Say, Tr } from '../common'

export function Hook({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const h = lesson.hook
  return (
    <section>
      <div className="hook">
        <Say text={h.de} label="উক্তিটি শুনুন" />
        <div className="eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>আজকের উক্তি</div>
        <q style={{ marginTop: 8, paddingRight: 44 }}>{h.de}</q>
        <div className="who">— {h.who}</div>
        <div className="tr"><Tr bn={h.bn} en={h.en} /></div>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 22 }}>{lesson.title.de}! {lesson.title.bn}</h2>
        <ul className="goals bn">{lesson.goals.map((g) => <li key={g}>{g}</li>)}</ul>
        <p className="hint bn">সময় লাগবে প্রায় {lesson.minutes} মিনিট।</p>
      </div>
      <NextButton onClick={onNext}>শুরু করি</NextButton>
    </section>
  )
}
