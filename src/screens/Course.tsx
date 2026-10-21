import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { LESSONS, type LessonMeta } from '../lib/content'
import { groupUnits, lessonStates } from '../lib/course'
import { LEVELS, LEVEL_ORDER, UNIT_TITLES } from '../lib/plan'
import { useT } from '../i18n/useT'
import { toast } from '../lib/toast'
import { go } from '../router'
import { Icon } from '../components/Icon'
import { EXAMS, loadRecords } from '../lib/exam'

export function CourseScreen() {
  const { lessonProgress, progress } = useApp()
  const { t, n, ui } = useT()
  const states = lessonStates(LESSONS, (id) => lessonProgress(id).passed, { startUnit: progress.startUnit, startUnitA2: progress.startUnitA2, startUnitB1: progress.startUnitB1, unlockAll: progress.unlockAll })
  const [level, setLevel] = useState<string>(() => LESSONS.find((l) => states.get(l.id) === 'now')?.level ?? 'A1')
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [sheet, setSheet] = useState<LessonMeta | null>(null)
  const info = LEVELS[level]
  const units = groupUnits(LESSONS, level)
  const built = units.length > 0
  const total = LESSONS.filter((l) => l.level === level)
  const passed = total.filter((l) => lessonProgress(l.id).passed).length
  const words = total.reduce((n, l) => n + l.words, 0)

  // open the unit that holds the next lesson the first time the screen shows
  useEffect(() => {
    const now = LESSONS.find((l) => states.get(l.id) === 'now')
    if (now && now.level === level) setOpen(new Set([now.unit]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (u: number) => setOpen((s) => {
    const n = new Set(s)
    n.has(u) ? n.delete(u) : n.add(u)
    return n
  })

  const pick = (l: LessonMeta) => {
    if (states.get(l.id) === 'locked') {
      toast(t('course.locked'))
      return
    }
    setSheet(l)
  }

  return (
    <>
      <div className="eyebrow bn">{t('course.map')}</div>
      <h1 style={{ fontSize: 30, marginTop: 4 }}>{t('course.zeroToB1')}</h1>
      <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
        <a className="btn sm ghost bn" href="#placement">{progress.placed ? t('course.retakeA1') : t('course.takeA1')}</a>
        {LESSONS.some((l) => l.level === 'A2') && <a className="btn sm ghost bn" href="#placement/a2">{progress.startUnitA2 > 0 ? t('course.retakeA2') : t('course.takeA2')}</a>}
        {LESSONS.some((l) => l.level === 'B1') && <a className="btn sm ghost bn" href="#placement/b1">{progress.startUnitB1 > 0 ? t('course.retakeB1') : t('course.takeB1')}</a>}
      </div>
      {EXAMS.filter((ex) => ex.level === level).map((ex) => {
        const rec = loadRecords()[ex.id]
        return (
          <a key={ex.id} className="card row" href={`#exam/${ex.id}`} style={{ textDecoration: 'none', marginTop: 12 }}>
            <div className="grow">
              <div className="eyebrow bn">{t('course.mock')}</div>
              <div className="bn" style={{ fontWeight: 700, marginTop: 2 }}>{ex.title[ui]}</div>
              <div className="muted bn" style={{ fontSize: 14 }}>{t('course.examMeta', { q: ex.questions, m: ex.minutes + 35 })}{rec ? ` · ${t('course.examBest', { n: Math.round(rec.best * 100) })}` : ''}</div>
            </div>
            <span className="btn sm ghost bn">{rec ? t('course.examAgain') : t('welcome.card.go')}</span>
          </a>
        )
      })}
      <div className="levels" role="group" aria-label={t('course.level')} style={{ gridTemplateColumns: `repeat(${LEVEL_ORDER.length},1fr)` }}>
        {LEVEL_ORDER.map((k) => (
          <button key={k} className="lv" aria-pressed={k === level} onClick={() => { setLevel(k); setOpen(new Set()) }}>
            <b>{k}</b><span className="bn">{LEVELS[k].tag[ui]}</span>
          </button>
        ))}
      </div>

      <div className="lvhead">
        <div>
          <h2>{level}</h2>
          <div className="muted bn">{built ? `${t('course.wordsLessons', { w: words, l: total.length })} · ${info.goal[ui]}` : info.goal[ui]}</div>
        </div>
        {built ? <span className="tag now bn">{t('course.inProgress', { n: Math.round((passed / total.length) * 100) })}</span> : <span className="tag bn">{t('course.comingSoon')}</span>}
      </div>

      <div className="path">
        {units.map((u) => {
          const ut = UNIT_TITLES[u.key]
          const done = u.lessons.filter((l) => lessonProgress(l.id).passed).length
          const active = u.lessons.some((l) => states.get(l.id) === 'now')
          const isOpen = open.has(u.unit)
          return (
            <div key={u.key} className={`unit ${active ? 'active' : ''} ${isOpen ? 'open' : ''}`}>
              <button onClick={() => toggle(u.unit)} aria-expanded={isOpen}>
                <span className="n num">{n(u.unit)}</span>
                <span>
                  <span className="t">{ut?.de ?? `Einheit ${u.unit}`}</span><br />
                  <span className="s bn">{ut?.[ui]} · {t('course.lessonsCount', { n: u.lessons.length })}</span>
                  <div className="bar"><i style={{ width: `${(done / u.lessons.length) * 100}%` }} /></div>
                </span>
                <Icon name="chev" className="chev" />
              </button>
              {isOpen && (
                <div className="lessons">
                  {u.lessons.map((l) => {
                    const st = states.get(l.id)!
                    const lp = lessonProgress(l.id)
                    return (
                      <button key={l.id} className={`lesson ${st}`} aria-disabled={st === 'locked' || undefined} onClick={() => pick(l)}>
                        <span className="ic"><Icon name={st === 'done' ? 'check' : st === 'locked' ? 'lock' : 'play'} /></span>
                        <span>
                          <span className="lt">{l.title.de}</span><br />
                          <span className="ls bn">{l.title[ui]} · {t('common.minutes', { n: l.minutes })}</span>
                        </span>
                        {st === 'now' ? <span className="tag now bn">{t('course.next')}</span> : st === 'done' ? <span className="tag bn">{n(Math.round((lp.best / Math.max(1, lp.total)) * 100))}%</span> : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {!EXAMS.some((ex) => ex.level === level) && <div className="card exam">
          <div className="eyebrow bn">{t('course.atEnd')}</div>
          <h3 style={{ fontSize: 20, marginTop: 4 }}>{t('course.mockExam', { lv: level })}</h3>
          <p className="muted bn" style={{ margin: '4px 0 0' }}>{t('course.mockSoon', { lv: level })}</p>
          <div className="mods"><span>Lesen</span><span>Hören</span><span>Schreiben</span><span>Sprechen</span></div>
        </div>}
      </div>

      {sheet && <LessonSheet lesson={sheet} done={states.get(sheet.id) === 'done'} onClose={() => setSheet(null)} />}
    </>
  )
}

function LessonSheet({ lesson, done, onClose }: { lesson: LessonMeta; done: boolean; onClose(): void }) {
  const { t, ui } = useT()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow bn">{lesson.level} · {t('lesson.barTitle', { u: lesson.unit, l: lesson.lesson })} · {t('common.minutes', { n: lesson.minutes })}</div>
        <h3 id="sh-t">{lesson.title.de}</h3>
        <div className="muted bn">{lesson.title[ui]}</div>
        <ol className="steps5 bn">
          <li>{t('sheet.hook')}</li>
          <li>{t('sheet.words', { n: lesson.words })}</li>
          <li>{t('sheet.dialog')}</li>
          <li>{t('sheet.grammar')}</li>
          <li>{t('sheet.quiz')}</li>
        </ol>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="btn bn" style={{ flex: 1 }} autoFocus onClick={() => go(`#lesson/${lesson.id}`)}>{done ? t('sheet.again') : t('common.start')}</button>
          <button className="btn ghost bn" onClick={onClose}>{t('common.close')}</button>
        </div>
        {lesson.status === 'draft' && <p className="muted bn" style={{ fontSize: 13, margin: '10px 0 0' }}>{t('sheet.draft')}</p>}
      </div>
    </div>
  )
}
