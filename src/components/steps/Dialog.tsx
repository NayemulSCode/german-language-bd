import { useState } from 'react'
import type { Lesson } from '../../schema/lesson'
import { useApp } from '../../state'
import { NextButton, Say } from '../common'

export function Dialog({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const { progress, say } = useApp()
  const [sel, setSel] = useState<[number, number] | null>(null)
  const showBn = progress.lang !== 'en'
  const showEn = progress.lang !== 'bn'
  const speakers = [...new Set(lesson.dialog.map((l) => l.who))]
  const [a, b] = speakers

  return (
    <section>
      <div className="eyebrow bn">ধাপ ৩ · সংলাপ</div>
      <h2 style={{ fontSize: 24, marginTop: 4 }}>{a}{b && ` ও ${b}`}-এর সংলাপ</h2>
      <p className="lead bn">যেকোনো জার্মান শব্দে ট্যাপ করুন — বাংলা আর ইংরেজি বাক্যে মিলে যাওয়া শব্দ হাইলাইট হবে।</p>
      {lesson.dialog.map((ln, li) => {
        const tok = sel && sel[0] === li ? ln.de[sel[1]] : null
        return (
          <div className="line" key={li}>
            <div className="line-head">
              <span className="speaker">
                <span className={`av s${speakers.indexOf(ln.who)}`}>{ln.who[0]}</span>
                {ln.who}
              </span>
              <Say text={ln.de.map((t) => t.t).join(' ')} label="পুরো বাক্য শুনুন" />
            </div>
            <div className="toks" lang="de">
              {ln.de.map((t, ti) => (
                <button
                  key={ti}
                  className={`tok${sel && sel[0] === li && sel[1] === ti ? ' sel' : ''}`}
                  onClick={() => {
                    const same = sel && sel[0] === li && sel[1] === ti
                    setSel(same ? null : [li, ti])
                    if (!same) void say(t.s ?? t.t)
                  }}
                >
                  {t.t}
                </button>
              ))}
            </div>
            {showBn && (
              <div className="row bn">
                <span className="tag">বাংলা</span>
                {ln.bn.map((w, i) => <span key={i} className={`w${tok?.b.includes(i) ? ' hit' : ''}`}>{w}</span>)}
              </div>
            )}
            {showEn && (
              <div className="row">
                <span className="tag">English</span>
                {ln.en.map((w, i) => <span key={i} className={`w${tok?.e.includes(i) ? ' hit' : ''}`}>{w}</span>)}
              </div>
            )}
            {tok && (
              <div className="info">
                <Say text={tok.s ?? tok.t} />
                <div className="body">
                  <div>
                    <span className="lemma" lang="de">{tok.t.replace(/[.,!?]/g, '')}</span>{' '}
                    <span className="meta">মূল রূপ: <span lang="de">{tok.l}</span></span>
                  </div>
                  <div className="mean">
                    {showBn && <span className="bn">{tok.gb}</span>}
                    {showEn && <span>{tok.ge}</span>}
                  </div>
                  {tok.n && <div className="hint bn" style={{ marginTop: 4 }}>{tok.n}</div>}
                  {tok.b.length === 0 && showBn && <div className="hint bn">বাংলা বাক্যে এর সরাসরি কোনো শব্দ নেই।</div>}
                </div>
              </div>
            )}
          </div>
        )
      })}
      <NextButton onClick={onNext}>গ্রামারে যাই</NextButton>
    </section>
  )
}
