import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../state'
import { LESSONS, loadDictionary, spoken, type DictEntry } from '../lib/content'
import { greeting, lessonStates } from '../lib/course'
import { UNIT_TITLES } from '../lib/plan'
import { useT } from '../i18n/useT'
import { dayKey, daysUntil, streak } from '../lib/stats'
import { Icon } from '../components/Icon'
import { Say, Tr } from '../components/common'
import { go } from '../router'
import { isNewLearner } from '../lib/welcome'
import { LoginNudge, useCanSignIn } from '../components/Account'
import { SupportCard } from '../components/Support'

export function HomeScreen() {
  const { progress, lessonProgress } = useApp()
  const { t, n, ui, locale } = useT()
  const now = Date.now()
  const xp = progress.activity[dayKey(now)] ?? 0
  const pct = Math.min(1, xp / progress.goal)
  const C = 2 * Math.PI * 36
  const { name: accountName } = useCanSignIn()
  const name = progress.name || accountName?.split(' ')[0] || 'Lerner'
  const days = streak(progress.activity, now)
  const weekday = new Date(now).toLocaleDateString(locale, { weekday: 'long' })
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
          <div className="eyebrow bn">{weekday}{days > 0 ? ` · ${t('home.streak', { n: days })}` : ''}</div>
          <h1>{greeting(new Date(now).getHours())}, {name}!</h1>
          <p className="muted bn" style={{ margin: '4px 0 0' }}>
            {xp >= progress.goal ? t('home.goalDone') : t('home.goalLeft', { n: progress.goal - xp })}
          </p>
        </div>
        <div className="ring" role="img" aria-label={t('home.goalAria', { a: xp, b: progress.goal })}>
          <svg viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </svg>
          <b className="num">{n(xp)}<small>/ {n(progress.goal)} XP</small></b>
        </div>
      </div>

      {!isNewLearner(progress) && <LoginNudge />}

      {isNewLearner(progress) && (
        <a className="card welcome-card" href="#welcome">
          <span className="welcome-emoji" aria-hidden="true">👋</span>
          <div className="grow">
            <div className="eyebrow bn">{t('welcome.card.eyebrow')}</div>
            <div className="bn" style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>{t('welcome.card.title')}</div>
            <div className="bn muted" style={{ fontSize: 14 }}>{t('welcome.card.sub')}</div>
          </div>
          <span className="btn sm bn">{t('welcome.card.go')}</span>
        </a>
      )}

      {next ? (
        <div className="card continue">
          <div className="eyebrow bn">{t('home.continue', { lv: next.level, u: next.unit, l: next.lesson })}</div>
          <h2>{next.title.de}</h2>
          <div className="bn" style={{ opacity: 0.85 }}>{next.title[ui]} · {t('common.minutes', { n: next.minutes })}</div>
          <div className="bar"><i style={{ width: `${(unitPassed / unitLessons.length) * 100}%` }} /></div>
          <div className="bn" style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>{t('home.unitProgress', { u: next.unit, a: unitPassed, b: unitLessons.length })}</div>
          <button className="btn bn" onClick={() => go(`#lesson/${next.id}`)}><Icon name="play" /> {t('common.start')}</button>
        </div>
      ) : (
        <div className="card continue">
          <div className="eyebrow bn">{t('home.allDone')}</div>
          <h2>{LESSONS.some((l) => l.level !== 'A1') ? t('home.allSoFar') : t('home.a1Done')}</h2>
          <div className="bn" style={{ opacity: 0.85 }}>{t('home.reviewSoon')}</div>
          <button className="btn bn" onClick={() => go('#review')}><Icon name="play" /> {t('tab.review')}</button>
        </div>
      )}

      {!progress.placed && a1Passed === 0 && (
        <a className="card row" href="#placement" style={{ textDecoration: 'none' }}>
          <div className="grow">
            <div className="eyebrow bn">{t('home.placeEyebrow')}</div>
            <div className="bn" style={{ fontWeight: 700, marginTop: 4 }}>{t('home.placeTitle')}</div>
            <div className="muted bn" style={{ fontSize: 14 }}>{t('home.placeSub')}</div>
          </div>
          <span className="btn sm ghost bn">{t('home.test')}</span>
        </a>
      )}

      <div className="grid2">
        <a className="card row" href="#review" style={{ textDecoration: 'none' }}>
          <div className="grow">
            <div className="eyebrow bn">{t('home.todayReview')}</div>
            <div className="big num" style={{ marginTop: 6 }}>{n(dueCount)}</div>
            <div className="muted bn" style={{ fontSize: 14 }}>{dueCount ? t('home.dueSome') : t('home.dueNone')}</div>
          </div>
          <span className="btn sm ghost bn">{t('tab.review')}</span>
        </a>
        <ExamCard course={course} />
      </div>

      <WordOfTheDay />

      {!isNewLearner(progress) && <SupportCard compact />}

      {next && UNIT_TITLES[`${next.level}-${next.unit}`] && (
        <p className="foot bn">{t('home.nowOn', { title: UNIT_TITLES[`${next.level}-${next.unit}`][ui] })}</p>
      )}
    </div>
  )
}

function ExamCard({ course }: { course: number }) {
  const { progress } = useApp()
  const { t, n, locale } = useT()
  if (!progress.examDate) {
    return (
      <a className="card" href="#me" style={{ textDecoration: 'none' }}>
        <div className="eyebrow bn">{t('home.examGoal')}</div>
        <div className="bn" style={{ marginTop: 6, fontWeight: 700 }}>{t('home.setExam')}</div>
        <div className="muted bn" style={{ fontSize: 14 }}>{t('home.setExamSub')}</div>
        <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${course}%` }} /></div>
        <div className="muted bn" style={{ fontSize: 13, marginTop: 4 }}>{t('home.a1Pct', { n: course })}</div>
      </a>
    )
  }
  const d = new Date(progress.examDate + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="card">
      <div className="eyebrow bn">{t('home.examGoal')}</div>
      <div className="row" style={{ marginTop: 6 }}>
        <div className="big num">{n(daysUntil(progress.examDate))}</div>
        <div className="bn muted" style={{ fontSize: 14, lineHeight: 1.3 }}>{t('home.daysLeft')}<br />Goethe-Zertifikat A1 · {d}</div>
      </div>
      <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${course}%` }} /></div>
      <div className="muted bn" style={{ fontSize: 13, marginTop: 4 }}>{t('home.a1Pct', { n: course })}</div>
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
