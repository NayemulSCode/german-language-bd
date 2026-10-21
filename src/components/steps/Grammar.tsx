import type { Lesson } from '../../schema/lesson'
import { NextButton } from '../common'
import { useT } from '../../i18n/useT'

export function Grammar({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const { t } = useT()
  return (
    <section>
      <div className="eyebrow bn">{t('grammar.step')}</div>
      {lesson.grammar.map((g, i) => {
        if (g.type === 'text') {
          return (
            <div className="panel" style={{ marginTop: 12 }} key={i}>
              {g.title && <h3 style={{ fontSize: 19 }}>{g.title}</h3>}
              <p className="bn" style={{ margin: '6px 0 0' }}>{g.text}</p>
            </div>
          )
        }
        if (g.type === 'table') {
          return (
            <div className="panel" style={{ marginTop: 12 }} key={i}>
              {g.title && <h3 style={{ fontSize: 19 }}>{g.title}</h3>}
              {g.intro && <p className="bn" style={{ margin: '6px 0 0' }}>{g.intro}</p>}
              <div className="tbl-wrap">
                <table>
                  <thead><tr>{g.head.map((h, k) => <th key={k}>{h}</th>)}</tr></thead>
                  <tbody>{g.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
              {g.note && <div className="note bn">{g.note}</div>}
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
                      <th>{t('grammar.subject')}</th>
                      {g.verbs.map((v) => <th key={v} lang="de">{v}</th>)}
                      <th>{t('grammar.bangla')}</th>
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
                <small className="bn" lang="bn">{t('grammar.german')}</small>
                {g.de.map((s, k) => <span key={k} className={`slot${s.v ? ' v' : ''}`}>{s.t}</span>)}
              </div>
              <div className="slots bn">
                <small>{t('grammar.bangla')}</small>
                {g.bn.map((s, k) => <span key={k} className={`slot${s.v ? ' v' : ''}`}>{s.t}</span>)}
              </div>
            </div>
          </div>
        )
      })}
      <NextButton onClick={onNext}>{t('grammar.next')}</NextButton>
    </section>
  )
}
