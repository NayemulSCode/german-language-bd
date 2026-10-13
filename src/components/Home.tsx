import { LESSONS } from '../lib/content'
import { useApp } from '../state'
import { Prefs } from './common'

export function Home({ onOpen }: { onOpen(id: string): void }) {
  const { progress, lessonProgress } = useApp()
  return (
    <div className="wrap home">
      <h1>Deutsch für Bangla-Sprecher</h1>
      <p className="lead bn">A1 থেকে B1 — বাংলা ও ইংরেজি সহায়তাসহ জার্মান শিখুন।</p>
      <div className="stats bn"><span>{progress.xp} XP</span><span>রিভিউ: {progress.review.length}টি শব্দ</span></div>
      <Prefs />
      <div className="unit-list">
        {LESSONS.map((l, i) => {
          const lp = lessonProgress(l.id)
          // a lesson opens once the one before it has been passed
          const locked = i > 0 && !lessonProgress(LESSONS[i - 1].id).passed
          return (
            <button key={l.id} className={`lesson-card${lp.passed ? ' passed' : ''}`} disabled={locked} onClick={() => onOpen(l.id)}>
              <span className="num">{lp.passed ? '✓' : l.lesson}</span>
              <span className="t">
                <b>{l.level} · ইউনিট {l.unit} · {l.title.de}</b>
                <span className="meta bn">{l.title.bn} · {l.minutes} মিনিট{lp.total ? ` · সেরা ${lp.best}/${lp.total}` : ''}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="foot bn">উচ্চারণ এখন ফোন বা ব্রাউজারের জার্মান ভয়েসে বাজছে। শীঘ্রই তৈরি করা অডিও যোগ হবে।</p>
    </div>
  )
}
