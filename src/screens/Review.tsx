import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../state'
import { loadDictionary, spoken, type DictEntry } from '../lib/content'
import { bn, fmtInterval } from '../lib/format'
import { intervalMs, type Grade } from '../lib/srs'
import { Say, Tr } from '../components/common'

const GRADES: [Grade, string][] = [[0, 'আবার'], [1, 'কঠিন'], [2, 'ভালো'], [3, 'সহজ']]

export function ReviewScreen() {
  const { progress, rateCard, say } = useApp()
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

  if (!dict) return <div className="loading bn">লোড হচ্ছে…</div>

  const total = Object.keys(progress.srs).length
  if (due.length === 0) {
    const upcoming = Object.values(progress.srs).filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0]
    return (
      <>
        <div className="eyebrow bn">রিভিউ</div>
        <div className="card empty" style={{ marginTop: 14 }}>
          <h2 style={{ fontSize: 26 }}>{total === 0 ? 'এখনো কোনো শব্দ নেই' : reviewed > 0 ? 'আজকের রিভিউ শেষ' : 'এখন কোনো শব্দ বাকি নেই'}</h2>
          <p className="muted bn">
            {total === 0
              ? 'একটি লেসন পাস করলে তার শব্দগুলো পরের দিন থেকে এখানে আসবে। ভুল করা শব্দ সঙ্গে সঙ্গে যোগ হয়।'
              : upcoming
                ? `পরের শব্দ ${fmtInterval(upcoming.due - Date.now())} পরে আসবে। মোট ${bn(total)}টি শব্দ রিভিউ চক্রে আছে।`
                : 'নতুন লেসন করলে আরও শব্দ যোগ হবে।'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <a className="btn bn" href="#course">কোর্সে যাই</a>
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
      <div className="eyebrow bn">রিভিউ · স্পেসড রিপিটিশন</div>
      <div className="row" style={{ marginTop: 4 }}><h1 className="grow" style={{ fontSize: 28 }}>আজ {bn(due.length)}টি শব্দ বাকি</h1></div>
      <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${(reviewed / (reviewed + due.length)) * 100}%` }} /></div>
      <div className="flash">
        <button className="face" onClick={flip} aria-label="কার্ড উল্টান">
          <div className="w">{e.art && <span className={`art ${e.art}`}>{e.art} </span>}{e.de}</div>
          {flipped
            ? <div style={{ fontSize: 19, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}><Tr bn={e.bn} en={e.en} /></div>
            : <div className="tapnote bn">মনে আছে অর্থ কী? ট্যাপ করে দেখুন</div>}
        </button>
      </div>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}><Say text={spoken(e)} /></div>
      {flipped ? (
        <div className="rate bn">
          {GRADES.map(([g, label]) => (
            <button key={g} onClick={() => rate(g)}>{label}<small>{fmtInterval(intervalMs(card, g))}</small></button>
          ))}
        </div>
      ) : (
        <p className="muted bn" style={{ textAlign: 'center', fontSize: 14 }}>উল্টানোর পর নিজেই বলুন কতটা মনে ছিল — সেই অনুযায়ী পরের রিভিউর তারিখ ঠিক হবে।</p>
      )}
    </>
  )
}
