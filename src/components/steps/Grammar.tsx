import { useState } from 'react'
import type { Lesson, GrammarPanel } from '../../schema/lesson'
import { useApp } from '../../state'
import { NextButton } from '../common'
import { usePerks } from '../Account'
import { bnPron } from '../../lib/bnPron'
import { useT } from '../../i18n/useT'
import { hasBangla } from '../../lib/localize'

type ChipsPanel = Extract<GrammarPanel, { type: 'chips' }>

/** Tap a cell to hear it; the hint under it follows the Bangla / English preference. */
function Chips({ g }: { g: ChipsPanel }) {
  const { say, progress } = useApp()
  const { t } = useT()
  const [playing, setPlaying] = useState<number | null>(null)
  const showPron = usePerks().bnPron && g.pron !== false
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      {g.title && <h3 style={{ fontSize: 19 }}>{g.title}</h3>}
      {g.intro && <p className="bn" style={{ margin: '6px 0 0' }}>{g.intro}</p>}
      <div className="chips" style={{ ['--cols' as string]: g.cols }}>
        {g.items.map((it, k) => (
          <button
            key={k}
            className={`chip${playing === k ? ' playing' : ''}`}
            aria-label={t('say.listen', { text: it.s ?? it.t })}
            onClick={() => {
              setPlaying(k)
              say(it.s ?? it.t).finally(() => setPlaying((p) => (p === k ? null : p)))
            }}
          >
            <span className="chip-t" lang="de">{it.t}</span>
            {((progress.lang !== 'en' && it.bn) || (progress.lang !== 'bn' && it.en)) && (
              <span className="chip-h">
                {progress.lang !== 'en' && it.bn && <span className="bn">{it.bn}</span>}
                {progress.lang !== 'bn' && it.en && <span>{it.en}</span>}
              </span>
            )}
            {showPron && <span className="chip-p bn">{bnPron(it.s ?? it.t)}</span>}
            {it.ex && <span className="chip-x" lang="de">{it.ex}</span>}
          </button>
        ))}
      </div>
      {g.note && <div className="note bn">{g.note}</div>}
    </div>
  )
}

export function Grammar({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const { t } = useT()
  /** the column says which language its text is in: Bangla, or English once the lesson has been translated */
  const langLabel = (sample: string | undefined) => (sample && !hasBangla(sample) ? t('grammar.english') : t('grammar.bangla'))
  return (
    <section>
      <div className="eyebrow bn">{t('grammar.step')}</div>
      {lesson.grammar.map((g, i) => {
        if (g.type === 'chips') return <Chips key={i} g={g} />
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
                      <th>{langLabel(g.rows[0]?.bn)}</th>
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
                <small>{langLabel(g.bn[0]?.t)}</small>
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
