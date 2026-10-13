import type { Lesson } from '../../schema/lesson'
import { NextButton } from '../common'

export function Grammar({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  return (
    <section>
      <div className="eyebrow bn">ধাপ ৪ · গ্রামার কার্ড</div>
      {lesson.grammar.map((g, i) => {
        if (g.type === 'text') {
          return (
            <div className="panel" style={{ marginTop: 12 }} key={i}>
              {g.title && <h3 style={{ fontSize: 19 }}>{g.title}</h3>}
              <p className="bn" style={{ margin: '6px 0 0' }}>{g.text}</p>
            </div>
          )
        }
        if (g.type === 'conjugation') {
          return (
            <div className="panel" style={{ marginTop: 12 }} key={i}>
              <p className="bn" style={{ margin: 0 }}>{g.intro}</p>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>কর্তা</th>
                      {g.verbs.map((v) => <th key={v} lang="de">{v}</th>)}
                      <th>বাংলা</th>
                    </tr>
                  </thead>
                  <tbody lang="de">
                    {g.rows.map((r) => (
                      <tr key={r.pron}>
                        <td>{r.pron}</td>
                        {r.stems.map((s, k) => <td key={k}>{s}<em>{r.ends[k]}</em></td>)}
                        <td className="bn" lang="bn">{r.bn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {g.note && <div className="note bn">{g.note}</div>}
            </div>
          )
        }
        return (
          <div className="panel" style={{ marginTop: 12 }} key={i}>
            <h3 style={{ fontSize: 19 }}>{g.title}</h3>
            <p className="bn" style={{ margin: '6px 0 0' }}>{g.text}</p>
            <div className="order">
              <div className="slots" lang="de">
                <small className="bn" lang="bn">জার্মান</small>
                {g.de.map((s, k) => <span key={k} className={`slot${s.v ? ' v' : ''}`}>{s.t}</span>)}
              </div>
              <div className="slots bn">
                <small>বাংলা</small>
                {g.bn.map((s, k) => <span key={k} className={`slot${s.v ? ' v' : ''}`}>{s.t}</span>)}
              </div>
            </div>
          </div>
        )
      })}
      <NextButton onClick={onNext}>কুইজ শুরু করি</NextButton>
    </section>
  )
}
