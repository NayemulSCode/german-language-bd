import { useState } from 'react'
import { useApp } from '../state'
import { Say } from '../components/common'
import { Logo } from '../components/Icon'
import { celebrate } from '../lib/celebrate'
import { go } from '../router'
import { useT } from '../i18n/useT'
import { PHRASES, QUESTIONS, optText, skipWelcome } from '../lib/welcome'

type Stage = 'intro' | 'learn' | 'quiz' | 'done'

/** A 60-second taste of German for first-time visitors: hear four phrases, answer three questions, get a first win. */
export function WelcomeScreen() {
  const { completeWelcome } = useApp()
  const { t, ui } = useT()
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
    celebrate({ icon: '👋', title: t('cele.welcome'), sub: t('cele.welcomeSub') })
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
        {stage !== 'done' && <button className="btn sm ghost bn" onClick={() => leave('#home')}>{t('welcome.skip')}</button>}
      </header>

      {stage === 'intro' && (
        <section className="wl-body center">
          <div className="wl-hero" aria-hidden="true">Hallo!</div>
          <h1 className="bn">{t('welcome.title')}</h1>
          <p className="bn muted">{t('welcome.intro')}</p>
          <button className="btn bn" onClick={() => setStage('learn')}>{t('welcome.start')}</button>
        </section>
      )}

      {stage === 'learn' && (
        <section className="wl-body">
          <div className="eyebrow bn">{t('welcome.learn', { a: heard.size, b: PHRASES.length })}</div>
          <div className="bar"><i style={{ width: `${(heard.size / PHRASES.length) * 100}%` }} /></div>
          <div className="wl-list">
            {PHRASES.map((p, i) => (
              <div key={p.de} className={`card row wl-phrase${heard.has(i) ? ' heard' : ''}`} onClick={() => setHeard((h) => new Set(h).add(i))}>
                <Say text={p.de} />
                <div className="grow">
                  <div className="wl-de" lang="de">{p.de}</div>
                  <div className="muted">
                    {ui === 'en' ? p.en : p.bn}
                  </div>
                </div>
                {heard.has(i) && <span className="wl-tick" aria-label={t('welcome.heard')}>✓</span>}
              </div>
            ))}
          </div>
          <p className="muted bn" style={{ fontSize: 14 }}>{t('welcome.tapHint')}</p>
          <button className="btn bn" disabled={heard.size < PHRASES.length} onClick={() => setStage('quiz')}>
            {heard.size < PHRASES.length ? t('welcome.hearAll') : t('welcome.toQuiz')}
          </button>
        </section>
      )}

      {stage === 'quiz' && (
        <section className="wl-body">
          <div className="eyebrow bn">{t('q.of', { a: q + 1, b: QUESTIONS.length })}</div>
          <div className="bar"><i style={{ width: `${(q / QUESTIONS.length) * 100}%` }} /></div>
          <h2 className="bn" style={{ margin: '16px 0 12px' }}>{cur.prompt[ui]}</h2>
          <div className="wl-opts">
            {cur.options.map((o, i) => {
              const state = picked === null ? '' : i === cur.answer ? ' ok' : i === picked ? ' no' : ''
              return <button key={i} className={`wl-opt${state}`} disabled={picked !== null} onClick={() => answer(i)}>{optText(o, ui)}</button>
            })}
          </div>
          {picked !== null && (
            <>
              <div className={`fb ${picked === cur.answer ? 'ok' : 'no'} bn`}>{picked === cur.answer ? t('q.right') : t('welcome.answerIs', { a: optText(cur.options[cur.answer], ui) })}</div>
              <button className="btn bn" onClick={nextQ}>{q + 1 < QUESTIONS.length ? t('q.next') : t('welcome.finish')}</button>
            </>
          )}
        </section>
      )}

      {stage === 'done' && (
        <section className="wl-body center">
          <div className="wl-hero" aria-hidden="true">🎉</div>
          <h1 className="bn">{t('welcome.doneTitle')}</h1>
          <p className="bn">{t('welcome.doneScore', { a: score, b: QUESTIONS.length })} 🔥</p>
          <p className="muted bn">{t('welcome.doneNext')}</p>
          <button className="btn bn" onClick={() => leave('#lesson/a1-u01-l01')}>{t('welcome.firstLesson')}</button>
          <button className="btn ghost bn" onClick={() => leave('#placement')}>{t('welcome.toTest')}</button>
          <button className="btn ghost bn" onClick={() => leave('#home')}>{t('welcome.toHome')}</button>
        </section>
      )}
    </div>
  )
}
