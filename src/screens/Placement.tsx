import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { loadAllLessons, localizeFor } from '../lib/content'
import { pickQuestions, placementResult, type PlacementItem } from '../lib/placement'
import { UNIT_TITLES } from '../lib/plan'
import { useT } from '../i18n/useT'
import { Icon } from '../components/Icon'
import { QuestionBody, isReady, isRight } from '../components/Question'
import { go } from '../router'

/** A short mixed test over all A1 units: no feedback while answering, then a recommended starting unit. */
export function PlacementScreen({ level = 'A1' }: { level?: 'A1' | 'A2' | 'B1' }) {
  const { setSettings } = useApp()
  const { t, n, ui } = useT()
  const [items, setItems] = useState<PlacementItem[] | null>(null)
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [correct, setCorrect] = useState<boolean[]>([])

  useEffect(() => {
    loadAllLessons().then((ls) => Promise.all(ls.map((l) => localizeFor(l, ui)))).then((ls) => setItems(pickQuestions(ls, level)))
  }, [level, ui])

  const header = (
    <header className="lbar">
      <div className="lbar-top">
        <a className="lclose" href="#course" aria-label={t('common.closeToCourse')}><Icon name="close" /></a>
        <span className="lvl">{level}</span>
        <span className="lbar-title">{t('place.test')}</span>
      </div>
    </header>
  )

  if (!items) return <div className="lx"><div className="wrap">{header}<div className="loading bn">{t('common.loading')}</div></div></div>

  if (!started) {
    return (
      <div className="lx"><div className="wrap">
        {header}
        <section>
          <h1 style={{ fontSize: 28 }} className="bn">{t('place.whereStart')}</h1>
          <div className="panel" style={{ marginTop: 14 }}>
            <ul className="goals bn">
              <li>{t('place.rule1', { q: items.length, u: new Set(items.map((x) => x.unit)).size })}</li>
              <li>{t('place.rule2')}</li>
              <li>{t('place.rule3')}</li>
              <li>{t('place.rule4')}{level === 'A2' && ` ${t('place.rule4a2')}`}{level === 'B1' && ` ${t('place.rule4b1')}`}</li>
            </ul>
          </div>
          <div className="actions"><button className="btn bn" onClick={() => setStarted(true)}>{t('welcome.start')}</button></div>
        </section>
      </div></div>
    )
  }

  if (i >= items.length) {
    const r = placementResult(items, correct)
    const ut = UNIT_TITLES[`${level}-${r.startUnit}`]
    const apply = (unit: number) => {
      setSettings(level === 'B1' ? { startUnitB1: unit } : level === 'A2' ? { startUnitA2: unit } : { startUnit: unit, placed: true })
      go('#course')
    }
    return (
      <div className="lx"><div className="wrap">
        {header}
        <section className="panel result" style={{ marginTop: 22 }}>
          <div className="eyebrow bn">{t('place.yourStart')}</div>
          <div className="score" style={{ marginTop: 10 }}>{n(r.startUnit)}<small> / {n(r.perUnit.length)}</small></div>
          <h2 style={{ fontSize: 24, marginTop: 6 }}>{ut?.de}</h2>
          <p className="bn" style={{ margin: '4px 0 0' }}>
            {r.perfect ? t('place.perfect') : t('place.startFrom', { title: ut?.[ui] ?? t('place.thisUnit') })}
          </p>
          <div className="meter bn" style={{ gridTemplateColumns: `repeat(${r.perUnit.length},1fr)` }} aria-label={t('place.perUnit')}>
            {r.perUnit.map((u) => (
              <div key={u.unit} title={`${t('place.unit', { n: u.unit })}: ${u.correct}/${u.total}`}>
                <i><u style={{ width: `${(u.correct / u.total) * 100}%`, background: u.correct === u.total ? 'var(--good)' : 'var(--accent)' }} /></i>
                <span style={{ textAlign: 'center' }}>{n(u.unit)}</span>
              </div>
            ))}
          </div>
          <div className="actions" style={{ flexDirection: 'column' }}>
            <button className="btn bn" onClick={() => apply(r.startUnit)}>{t('place.startAt', { n: r.startUnit })}</button>
            {r.startUnit > 1 && <button className="btn ghost bn" onClick={() => apply(1)}>{t('place.startAt', { n: 1 })}</button>}
          </div>
        </section>
      </div></div>
    )
  }

  const cur = items[i]
  const answer = (isCorrect: boolean) => {
    setCorrect([...correct, isCorrect])
    setI(i + 1)
    setPicked(null)
    setOrder([])
    window.scrollTo({ top: 0 })
  }
  return (
    <div className="lx"><div className="wrap">
      {header}
      <section>
        <div className="qhead bn"><span>{t('q.of', { a: i + 1, b: items.length })}</span><span>{t('place.unit', { n: cur.unit })}</span></div>
        <div className="qbar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>
        <div className="qprompt bn">{cur.q.prompt}</div>
        <QuestionBody q={cur.q} picked={picked} order={order} checked={false} onPick={setPicked} onOrder={setOrder} />
        <div className="actions">
          <button className="btn ghost bn" onClick={() => answer(false)}>{t('place.dontKnow')}</button>
          <button className="btn bn" disabled={!isReady(cur.q, picked, order)} onClick={() => answer(isRight(cur.q, picked, order))}>{t('q.next')}</button>
        </div>
      </section>
    </div></div>
  )
}
