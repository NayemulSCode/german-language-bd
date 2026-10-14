import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { loadAllLessons } from '../lib/content'
import { pickQuestions, placementResult, type PlacementItem } from '../lib/placement'
import { UNIT_TITLES } from '../lib/plan'
import { bn } from '../lib/format'
import { Icon } from '../components/Icon'
import { QuestionBody, isReady, isRight } from '../components/Question'
import { go } from '../router'

/** A short mixed test over all A1 units: no feedback while answering, then a recommended starting unit. */
export function PlacementScreen({ level = 'A1' }: { level?: 'A1' | 'A2' | 'B1' }) {
  const { setSettings } = useApp()
  const [items, setItems] = useState<PlacementItem[] | null>(null)
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [correct, setCorrect] = useState<boolean[]>([])

  useEffect(() => {
    loadAllLessons().then((ls) => setItems(pickQuestions(ls, level)))
  }, [level])

  const header = (
    <header className="lbar">
      <div className="lbar-top">
        <a className="lclose" href="#course" aria-label="বন্ধ করে কোর্সে ফিরুন"><Icon name="close" /></a>
        <span className="lvl">{level}</span>
        <span className="lbar-title">প্লেসমেন্ট টেস্ট</span>
      </div>
    </header>
  )

  if (!items) return <div className="lx"><div className="wrap">{header}<div className="loading bn">লোড হচ্ছে…</div></div></div>

  if (!started) {
    return (
      <div className="lx"><div className="wrap">
        {header}
        <section>
          <h1 style={{ fontSize: 28 }} className="bn">কোথা থেকে শুরু করবেন?</h1>
          <div className="panel" style={{ marginTop: 14 }}>
            <ul className="goals bn">
              <li>{bn(items.length)}টি প্রশ্ন, প্রায় ৫ মিনিট — সব {bn(new Set(items.map((x) => x.unit)).size)}টি ইউনিট থেকে।</li>
              <li>প্রতিটি উত্তরের পর ঠিক-ভুল দেখানো হবে না।</li>
              <li>না জানলে অনুমান না করে „জানি না“ চাপুন — তাতে ঠিক জায়গাটা বোঝা যায়।</li>
              <li>এতে আপনার XP বা লেসনের অবস্থা বদলাবে না; শুধু আগের ইউনিটগুলো খুলে যাবে।{level === 'A2' && ' A2 টেস্টে আপনার সব A1 লেসনও খুলে যাবে।'}{level === 'B1' && ' B1 টেস্টে আপনার সব A1 ও A2 লেসনও খুলে যাবে।'}</li>
            </ul>
          </div>
          <div className="actions"><button className="btn bn" onClick={() => setStarted(true)}>শুরু করি</button></div>
        </section>
      </div></div>
    )
  }

  if (i >= items.length) {
    const r = placementResult(items, correct)
    const t = UNIT_TITLES[`${level}-${r.startUnit}`]
    const apply = (unit: number) => {
      setSettings(level === 'B1' ? { startUnitB1: unit } : level === 'A2' ? { startUnitA2: unit } : { startUnit: unit, placed: true })
      go('#course')
    }
    return (
      <div className="lx"><div className="wrap">
        {header}
        <section className="panel result" style={{ marginTop: 22 }}>
          <div className="eyebrow bn">আপনার শুরুর জায়গা</div>
          <div className="score" style={{ marginTop: 10 }}>{bn(r.startUnit)}<small> / {bn(r.perUnit.length)}</small></div>
          <h2 style={{ fontSize: 24, marginTop: 6 }}>{t?.de}</h2>
          <p className="bn" style={{ margin: '4px 0 0' }}>
            {r.perfect ? 'আপনি প্রায় সবই জানেন! শেষ ইউনিট থেকে শুরু করে ঝালিয়ে নিন।' : `${t?.bn ?? 'এই ইউনিট'} থেকে শুরু করা ভালো। আগের ইউনিটগুলো খোলা থাকবে — চাইলে দেখে নিতে পারবেন।`}
          </p>
          <div className="meter bn" style={{ gridTemplateColumns: `repeat(${r.perUnit.length},1fr)` }} aria-label="ইউনিট অনুযায়ী ফল">
            {r.perUnit.map((u) => (
              <div key={u.unit} title={`ইউনিট ${u.unit}: ${u.correct}/${u.total}`}>
                <i><u style={{ width: `${(u.correct / u.total) * 100}%`, background: u.correct === u.total ? 'var(--good)' : 'var(--accent)' }} /></i>
                <span style={{ textAlign: 'center' }}>{bn(u.unit)}</span>
              </div>
            ))}
          </div>
          <div className="actions" style={{ flexDirection: 'column' }}>
            <button className="btn bn" onClick={() => apply(r.startUnit)}>ইউনিট {bn(r.startUnit)} থেকে শুরু করি</button>
            {r.startUnit > 1 && <button className="btn ghost bn" onClick={() => apply(1)}>ইউনিট ১ থেকেই শুরু করি</button>}
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
        <div className="qhead bn"><span>প্রশ্ন {bn(i + 1)} / {bn(items.length)}</span><span>ইউনিট {bn(cur.unit)}</span></div>
        <div className="qbar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>
        <div className="qprompt bn">{cur.q.prompt}</div>
        <QuestionBody q={cur.q} picked={picked} order={order} checked={false} onPick={setPicked} onOrder={setOrder} />
        <div className="actions">
          <button className="btn ghost bn" onClick={() => answer(false)}>জানি না</button>
          <button className="btn bn" disabled={!isReady(cur.q, picked, order)} onClick={() => answer(isRight(cur.q, picked, order))}>পরের প্রশ্ন</button>
        </div>
      </section>
    </div></div>
  )
}
