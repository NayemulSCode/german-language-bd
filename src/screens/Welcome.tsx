import { useState } from 'react'
import { useApp } from '../state'
import { Say } from '../components/common'
import { Logo } from '../components/Icon'
import { celebrate } from '../lib/celebrate'
import { go } from '../router'
import { bn } from '../lib/format'
import { PHRASES, QUESTIONS, skipWelcome } from '../lib/welcome'

type Stage = 'intro' | 'learn' | 'quiz' | 'done'

/** A 60-second taste of German for first-time visitors: hear four phrases, answer three questions, get a first win. */
export function WelcomeScreen() {
  const { completeWelcome, progress } = useApp()
  const [stage, setStage] = useState<Stage>('intro')
  const [heard, setHeard] = useState<Set<number>>(new Set())
  const [q, setQ] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const leave = (to: string) => {
    skipWelcome()
    go(to)
  }
  const finish = (s: number) => {
    completeWelcome()
    celebrate({ icon: '👋', title: 'প্রথম ১০ XP!', sub: 'আপনার স্ট্রিক শুরু হলো' })
    setScore(s)
    setStage('done')
  }

  const cur = QUESTIONS[q]
  const answer = (i: number) => {
    if (picked !== null) return
    setPicked(i)
  }
  const nextQ = () => {
    const s = score + (picked === cur.answer ? 1 : 0)
    if (q + 1 < QUESTIONS.length) {
      setScore(s)
      setQ(q + 1)
      setPicked(null)
    } else finish(s)
  }

  return (
    <div className="wl">
      <header className="wl-top">
        <span className="brand"><Logo />Sprachbrücke</span>
        {stage !== 'done' && <button className="btn sm ghost bn" onClick={() => leave('#home')}>এড়িয়ে যান</button>}
      </header>

      {stage === 'intro' && (
        <section className="wl-body center">
          <div className="wl-hero" aria-hidden="true">Hallo!</div>
          <h1 className="bn">৬০ সেকেন্ডে আপনার প্রথম জার্মান</h1>
          <p className="bn muted">অ্যাকাউন্ট লাগবে না। চারটি শব্দ শুনুন, তিনটি প্রশ্নের উত্তর দিন — আর আজই আপনার স্ট্রিক শুরু।</p>
          <button className="btn bn" onClick={() => setStage('learn')}>শুরু করি</button>
        </section>
      )}

      {stage === 'learn' && (
        <section className="wl-body">
          <div className="eyebrow bn">শুনুন ও শিখুন · {bn(heard.size)} / {bn(PHRASES.length)}</div>
          <div className="bar"><i style={{ width: `${(heard.size / PHRASES.length) * 100}%` }} /></div>
          <div className="wl-list">
            {PHRASES.map((p, i) => (
              <div key={p.de} className={`card row wl-phrase${heard.has(i) ? ' heard' : ''}`} onClick={() => setHeard((h) => new Set(h).add(i))}>
                <Say text={p.de} />
                <div className="grow">
                  <div className="wl-de" lang="de">{p.de}</div>
                  <div className="muted">
                    {progress.lang !== 'en' && <span className="bn">{p.bn}</span>}
                    {progress.lang === 'both' && ' · '}
                    {progress.lang !== 'bn' && <span>{p.en}</span>}
                  </div>
                </div>
                {heard.has(i) && <span className="wl-tick" aria-label="শোনা হয়েছে">✓</span>}
              </div>
            ))}
          </div>
          <p className="muted bn" style={{ fontSize: 14 }}>প্রতিটি কার্ডে ট্যাপ করে উচ্চারণ শুনুন।</p>
          <button className="btn bn" disabled={heard.size < PHRASES.length} onClick={() => setStage('quiz')}>
            {heard.size < PHRASES.length ? 'সবগুলো শুনুন' : 'এবার পরীক্ষা'}
          </button>
        </section>
      )}

      {stage === 'quiz' && (
        <section className="wl-body">
          <div className="eyebrow bn">প্রশ্ন {bn(q + 1)} / {bn(QUESTIONS.length)}</div>
          <div className="bar"><i style={{ width: `${(q / QUESTIONS.length) * 100}%` }} /></div>
          <h2 className="bn" style={{ margin: '16px 0 12px' }}>{cur.prompt}</h2>
          <div className="wl-opts">
            {cur.options.map((o, i) => {
              const state = picked === null ? '' : i === cur.answer ? ' ok' : i === picked ? ' no' : ''
              return <button key={o} className={`wl-opt${state}`} disabled={picked !== null} onClick={() => answer(i)}>{o}</button>
            })}
          </div>
          {picked !== null && (
            <>
              <div className={`fb ${picked === cur.answer ? 'ok' : 'no'} bn`}>{picked === cur.answer ? 'ঠিক হয়েছে!' : `উত্তর: ${cur.options[cur.answer]}`}</div>
              <button className="btn bn" onClick={nextQ}>{q + 1 < QUESTIONS.length ? 'পরের প্রশ্ন' : 'শেষ'}</button>
            </>
          )}
        </section>
      )}

      {stage === 'done' && (
        <section className="wl-body center">
          <div className="wl-hero" aria-hidden="true">🎉</div>
          <h1 className="bn">চমৎকার! আপনি শুরু করে ফেলেছেন</h1>
          <p className="bn">{bn(score)} / {bn(QUESTIONS.length)} সঠিক · +১০ XP · আপনার স্ট্রিক শুরু হলো 🔥</p>
          <p className="muted bn">এবার সত্যিকারের কোর্সে যান — প্রথম লেসনে আরও ১০টি শব্দ ও একটি সংলাপ আছে।</p>
          <button className="btn bn" onClick={() => leave('#lesson/a1-u01-l01')}>প্রথম লেসন শুরু করুন</button>
          <button className="btn ghost bn" onClick={() => leave('#placement')}>আগে থেকে কিছু জানি — টেস্ট দেব</button>
          <button className="btn ghost bn" onClick={() => leave('#home')}>হোমে যান</button>
        </section>
      )}
    </div>
  )
}
