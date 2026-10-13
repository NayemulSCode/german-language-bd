import { LESSONS } from '../lib/content'
import { UNIT_TITLES } from '../lib/units'
import { useApp } from '../state'
import { Prefs } from './common'
import { Account } from './Account'

export function Home({ onOpen }: { onOpen(id: string): void }) {
  const { progress, lessonProgress } = useApp()
  const unitKeys = [...new Set(LESSONS.map((l) => `${l.level}-${l.unit}`))]
  return (
    <div className="wrap home">
      <h1>Deutsch für Bangla-Sprecher</h1>
      <p className="lead bn">A1 থেকে B1 — বাংলা ও ইংরেজি সহায়তাসহ জার্মান শিখুন।</p>
      <Account />
      <div className="stats bn"><span>{progress.xp} XP</span><span>রিভিউ: {progress.review.length}টি শব্দ</span></div>
      <Prefs />
      {unitKeys.map((key) => {
        const lessons = LESSONS.filter((l) => `${l.level}-${l.unit}` === key)
        const t = UNIT_TITLES[key]
        const passed = lessons.filter((l) => lessonProgress(l.id).passed).length
        return (
          <section key={key} className="unit">
            <div className="unit-head">
              <h2>{lessons[0].level} · ইউনিট {lessons[0].unit}{t ? ` — ${t.de}` : ''}</h2>
              <span className="meta bn">{t?.bn} · {passed}/{lessons.length}</span>
            </div>
            <div className="unit-list">
              {lessons.map((l) => {
                const lp = lessonProgress(l.id)
                // a lesson opens once the one before it has been passed
                const idx = LESSONS.indexOf(l)
                const locked = idx > 0 && !lessonProgress(LESSONS[idx - 1].id).passed
                return (
                  <button key={l.id} className={`lesson-card${lp.passed ? ' passed' : ''}`} disabled={locked} onClick={() => onOpen(l.id)}>
                    <span className="num">{lp.passed ? '✓' : l.lesson}</span>
                    <span className="t">
                      <b>{l.title.de}</b>
                      <span className="meta bn">{l.title.bn} · {l.minutes} মিনিট{lp.total ? ` · সেরা ${lp.best}/${lp.total}` : ''}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
      <p className="foot bn">উচ্চারণ এখন ফোন বা ব্রাউজারের জার্মান ভয়েসে বাজছে। শীঘ্রই তৈরি করা অডিও যোগ হবে।</p>
    </div>
  )
}
