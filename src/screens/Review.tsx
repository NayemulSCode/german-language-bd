import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../state'
import { loadDictionary, spoken, type DictEntry } from '../lib/content'
import { fmtInterval } from '../lib/format'
import { useT } from '../i18n/useT'
import type { Key } from '../i18n/core'
import { intervalMs, type Grade } from '../lib/srs'
import { BnPron, Say, Tr } from '../components/common'

const GRADES: [Grade, Key][] = [[0, 'review.again'], [1, 'review.hard'], [2, 'review.good'], [3, 'review.easy']]

export function ReviewScreen() {
  const { progress, rateCard, say } = useApp()
  const { t } = useT()
  const [dict, setDict] = useState<Map<string, DictEntry> | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    loadDictionary().then((all) => setDict(new Map(all.map((e) => [e.k, e]))))
  }, [])

  // cards due now, most overdue first; cards whose lesson no longer exists are ignored
  const due = useMemo(() => {
    if (!dict) return []
    const now = Date.now()
    return Object.entries(progress.srs).filter(([k, c]) => c.due <= now && dict.has(k)).sort((a, b) => a[1].due - b[1].due)
  }, [progress.srs, dict])

  if (!dict) return <div className="loading bn">{t('common.loading')}</div>

  const total = Object.keys(progress.srs).length
  if (due.length === 0) {
    const upcoming = Object.values(progress.srs).filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0]
    return (
      <>
        <div className="eyebrow bn">{t('tab.review')}</div>
        <div className="card empty" style={{ marginTop: 14 }}>
          <h2 style={{ fontSize: 26 }}>{total === 0 ? t('review.empty') : reviewed > 0 ? t('review.finished') : t('home.dueNone')}</h2>
          <p className="muted bn">
            {total === 0
              ? t('review.emptyHint')
              : upcoming
                ? t('review.upcoming', { when: fmtInterval(upcoming.due - Date.now(), t), n: total })
                : t('review.moreWords')}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <a className="btn bn" href="#course">{t('review.toCourse')}</a>
          </div>
        </div>
      </>
    )
  }

  const [key, card] = due[0]
  const e = dict.get(key)!
  const rate = (g: Grade) => {
    rateCard(key, g)
    setFlipped(false)
    setReviewed((n) => n + 1)
  }
  const flip = () => {
    setFlipped(!flipped)
    if (!flipped) void say(spoken(e))
  }

  return (
    <>
      <div className="eyebrow bn">{t('review.eyebrow')}</div>
      <div className="row" style={{ marginTop: 4 }}><h1 className="grow" style={{ fontSize: 28 }}>{t('review.dueToday', { n: due.length })}</h1></div>
      <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${(reviewed / (reviewed + due.length)) * 100}%` }} /></div>
      <div className="flash">
        <button className="face" onClick={flip} aria-label={t('review.flip')}>
          <div className="w">{e.art && <span className={`art ${e.art}`}>{e.art} </span>}{e.de}</div>
          {flipped
            ? <><BnPron text={spoken(e)} /><div style={{ fontSize: 19, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}><Tr bn={e.bn} en={e.en} /></div></>
            : <div className="tapnote bn">{t('review.tapNote')}</div>}
        </button>
      </div>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}><Say text={spoken(e)} /></div>
      {flipped ? (
        <div className="rate bn">
          {GRADES.map(([g, label]) => (
            <button key={g} onClick={() => rate(g)}>{t(label)}<small>{fmtInterval(intervalMs(card, g), t)}</small></button>
          ))}
        </div>
      ) : (
        <p className="muted bn" style={{ textAlign: 'center', fontSize: 14 }}>{t('review.rateHint')}</p>
      )}
    </>
  )
}
