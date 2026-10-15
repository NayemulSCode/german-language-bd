import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../state'
import { LESSONS, loadDictionary, spoken, type DictEntry } from '../lib/content'
import { greeting, lessonStates } from '../lib/course'
import { UNIT_TITLES } from '../lib/plan'
import { bn } from '../lib/format'
import { dayKey, daysUntil, streak } from '../lib/stats'
import { Icon } from '../components/Icon'
import { Say, Tr } from '../components/common'
import { go } from '../router'
import { isNewLearner } from '../lib/welcome'

export function HomeScreen() {
  const { progress, lessonProgress } = useApp()
  const now = Date.now()
  const xp = progress.activity[dayKey(now)] ?? 0
  const pct = Math.min(1, xp / progress.goal)
  const C = 2 * Math.PI * 36
  const name = progress.name || 'Lerner'
  const days = streak(progress.activity, now)
  const weekday = new Date(now).toLocaleDateString('bn-BD', { weekday: 'long' })
  const dueCount = useMemo(() => Object.values(progress.srs).filter((c) => c.due <= now).length, [progress.srs, now])

  const states = lessonStates(LESSONS, (id) => lessonProgress(id).passed, { startUnit: progress.startUnit, startUnitA2: progress.startUnitA2, startUnitB1: progress.startUnitB1, unlockAll: progress.unlockAll })
  const next = LESSONS.find((l) => states.get(l.id) === 'now')
  const unitLessons = next ? LESSONS.filter((l) => l.level === next.level && l.unit === next.unit) : []
  const unitPassed = unitLessons.filter((l) => lessonProgress(l.id).passed).length
  const a1 = LESSONS.filter((l) => l.level === 'A1')
  const a1Passed = a1.filter((l) => lessonProgress(l.id).passed).length
  const course = a1.length ? Math.round((a1Passed / a1.length) * 100) : 0

  return (
    <div className="stack">
      <div className="hello">
        <div>
          <div className="eyebrow bn">{weekday}{days > 0 ? ` · স্ট্রিক ${bn(days)}` : ''}</div>
          <h1>{greeting(new Date(now).getHours())}, {name}!</h1>
          <p className="muted bn" style={{ margin: '4px 0 0' }}>
            {xp >= progress.goal ? 'আজকের লক্ষ্য পূরণ — দারুণ!' : `আজ আর ${bn(progress.goal - xp)} XP হলে দৈনিক লক্ষ্য পূরণ।`}
          </p>
        </div>
        <div className="ring" role="img" aria-label={`দৈনিক লক্ষ্য ${xp} / ${progress.goal} XP`}>
          <svg viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </svg>
          <b className="num">{bn(xp)}<small>/ {bn(progress.goal)} XP</small></b>
        </div>
      </div>

      {isNewLearner(progress) && (
        <a className="card welcome-card" href="#welcome">
          <span className="welcome-emoji" aria-hidden="true">👋</span>
          <div className="grow">
            <div className="eyebrow bn">নতুন? এখানে শুরু করুন</div>
            <div className="bn" style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>৬০ সেকেন্ডে প্রথম জার্মান শিখুন</div>
            <div className="bn muted" style={{ fontSize: 14 }}>৪টি শব্দ শুনুন, ৩টি প্রশ্নের উত্তর দিন — আজই স্ট্রিক শুরু।</div>
          </div>
          <span className="btn sm bn">শুরু</span>
        </a>
      )}

      {next ? (
        <div className="card continue">
          <div className="eyebrow bn">চালিয়ে যান · {next.level} · ইউনিট {bn(next.unit)} · লেসন {bn(next.lesson)}</div>
          <h2>{next.title.de}</h2>
          <div className="bn" style={{ opacity: 0.85 }}>{next.title.bn} · {bn(next.minutes)} মিনিট</div>
          <div className="bar"><i style={{ width: `${(unitPassed / unitLessons.length) * 100}%` }} /></div>
          <div className="bn" style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>ইউনিট {bn(next.unit)}: {bn(unitLessons.length)}টির মধ্যে {bn(unitPassed)}টি লেসন শেষ</div>
          <button className="btn bn" onClick={() => go(`#lesson/${next.id}`)}><Icon name="play" /> শুরু করুন</button>
        </div>
      ) : (
        <div className="card continue">
          <div className="eyebrow bn">সব লেসন শেষ</div>
          <h2>{LESSONS.some((l) => l.level !== 'A1') ? 'এখন পর্যন্ত সব শেষ!' : 'A1 সম্পূর্ণ!'}</h2>
          <div className="bn" style={{ opacity: 0.85 }}>রিভিউ করে শব্দগুলো পাকা করুন। নতুন লেসন শীঘ্রই আসছে।</div>
          <button className="btn bn" onClick={() => go('#review')}><Icon name="play" /> রিভিউ</button>
        </div>
      )}

      {!progress.placed && a1Passed === 0 && (
        <a className="card row" href="#placement" style={{ textDecoration: 'none' }}>
          <div className="grow">
            <div className="eyebrow bn">নতুন? কিছু জানা আছে?</div>
            <div className="bn" style={{ fontWeight: 700, marginTop: 4 }}>৫ মিনিটের প্লেসমেন্ট টেস্ট দিন</div>
            <div className="muted bn" style={{ fontSize: 14 }}>আপনার জন্য সঠিক ইউনিট থেকে শুরু করুন — সব গোড়া থেকে করতে হবে না।</div>
          </div>
          <span className="btn sm ghost bn">টেস্ট</span>
        </a>
      )}

      <div className="grid2">
        <a className="card row" href="#review" style={{ textDecoration: 'none' }}>
          <div className="grow">
            <div className="eyebrow bn">আজকের রিভিউ</div>
            <div className="big num" style={{ marginTop: 6 }}>{bn(dueCount)}</div>
            <div className="muted bn" style={{ fontSize: 14 }}>{dueCount ? 'শব্দ আজ আবার দেখার সময়' : 'এখন কোনো শব্দ বাকি নেই'}</div>
          </div>
          <span className="btn sm ghost bn">রিভিউ</span>
        </a>
        <ExamCard course={course} />
      </div>

      <WordOfTheDay />

      {next && UNIT_TITLES[`${next.level}-${next.unit}`] && (
        <p className="foot bn">এখন চলছে: {UNIT_TITLES[`${next.level}-${next.unit}`].bn}</p>
      )}
    </div>
  )
}

function ExamCard({ course }: { course: number }) {
  const { progress } = useApp()
  if (!progress.examDate) {
    return (
      <a className="card" href="#me" style={{ textDecoration: 'none' }}>
        <div className="eyebrow bn">পরীক্ষার লক্ষ্য</div>
        <div className="bn" style={{ marginTop: 6, fontWeight: 700 }}>পরীক্ষার তারিখ ঠিক করুন</div>
        <div className="muted bn" style={{ fontSize: 14 }}>Goethe-Zertifikat A1 · প্রোফাইলে গিয়ে যোগ করুন</div>
        <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${course}%` }} /></div>
        <div className="muted bn" style={{ fontSize: 13, marginTop: 4 }}>A1 কোর্সের {bn(course)}% শেষ</div>
      </a>
    )
  }
  const d = new Date(progress.examDate + 'T00:00:00').toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="card">
      <div className="eyebrow bn">পরীক্ষার লক্ষ্য</div>
      <div className="row" style={{ marginTop: 6 }}>
        <div className="big num">{bn(daysUntil(progress.examDate))}</div>
        <div className="bn muted" style={{ fontSize: 14, lineHeight: 1.3 }}>দিন বাকি<br />Goethe-Zertifikat A1 · {d}</div>
      </div>
      <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${course}%` }} /></div>
      <div className="muted bn" style={{ fontSize: 13, marginTop: 4 }}>A1 কোর্সের {bn(course)}% শেষ</div>
    </div>
  )
}

function WordOfTheDay() {
  const [entry, setEntry] = useState<DictEntry | null>(null)
  useEffect(() => {
    loadDictionary().then((all) => {
      const nouns = all.filter((e) => e.art)
      const day = Math.floor(Date.now() / 86_400_000)
      setEntry(nouns[day % nouns.length] ?? null)
    })
  }, [])
  if (!entry) return null
  return (
    <div className="card row">
      <Say text={spoken(entry)} />
      <div className="grow">
        <div className="eyebrow">Wort des Tages</div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22 }}>
          <span className={`art ${entry.art}`}>{entry.art}</span> {entry.de}
        </div>
        <div className="muted" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Tr bn={entry.bn} en={entry.en} /></div>
      </div>
    </div>
  )
}
