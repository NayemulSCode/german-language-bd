import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { LESSONS, type LessonMeta } from '../lib/content'
import { groupUnits, lessonStates } from '../lib/course'
import { LEVELS, LEVEL_ORDER, UNIT_TITLES } from '../lib/plan'
import { bn } from '../lib/format'
import { toast } from '../lib/toast'
import { go } from '../router'
import { Icon } from '../components/Icon'

export function CourseScreen() {
  const { lessonProgress, progress } = useApp()
  const [level, setLevel] = useState<string>('A1')
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [sheet, setSheet] = useState<LessonMeta | null>(null)

  const states = lessonStates(LESSONS, (id) => lessonProgress(id).passed, { startUnit: progress.startUnit, unlockAll: progress.unlockAll })
  const info = LEVELS[level]
  const units = groupUnits(LESSONS, level)
  const built = units.length > 0
  const total = LESSONS.filter((l) => l.level === level)
  const passed = total.filter((l) => lessonProgress(l.id).passed).length
  const words = total.reduce((n, l) => n + l.words, 0)

  // open the unit that holds the next lesson the first time the screen shows
  useEffect(() => {
    const now = LESSONS.find((l) => states.get(l.id) === 'now')
    if (now && now.level === 'A1') setOpen(new Set([now.unit]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (u: number) => setOpen((s) => {
    const n = new Set(s)
    n.has(u) ? n.delete(u) : n.add(u)
    return n
  })

  const pick = (l: LessonMeta) => {
    if (states.get(l.id) === 'locked') {
      toast('আগের লেসনগুলো শেষ করলে এটা খুলবে।')
      return
    }
    setSheet(l)
  }

  return (
    <>
      <div className="eyebrow bn">কোর্স ম্যাপ</div>
      <h1 style={{ fontSize: 30, marginTop: 4 }}>শূন্য থেকে B1</h1>
      <a className="btn sm ghost bn" href="#placement" style={{ marginTop: 12 }}>{progress.placed ? 'প্লেসমেন্ট টেস্ট আবার দিন' : 'কোথা থেকে শুরু করবেন? প্লেসমেন্ট টেস্ট'}</a>
      <div className="levels" role="group" aria-label="লেভেল" style={{ gridTemplateColumns: `repeat(${LEVEL_ORDER.length},1fr)` }}>
        {LEVEL_ORDER.map((k) => (
          <button key={k} className="lv" aria-pressed={k === level} onClick={() => { setLevel(k); setOpen(new Set()) }}>
            <b>{k}</b><span className="bn">{LEVELS[k].tag}</span>
          </button>
        ))}
      </div>

      <div className="lvhead">
        <div>
          <h2>{level}</h2>
          <div className="muted bn">{built ? `${bn(words)}টি শব্দ · ${bn(total.length)}টি লেসন · ${info.goal}` : info.goal}</div>
        </div>
        {built ? <span className="tag now bn">চলছে · {bn(Math.round((passed / total.length) * 100))}%</span> : <span className="tag bn">শীঘ্রই আসছে</span>}
      </div>

      <div className="path">
        {units.map((u) => {
          const t = UNIT_TITLES[u.key]
          const done = u.lessons.filter((l) => lessonProgress(l.id).passed).length
          const active = u.lessons.some((l) => states.get(l.id) === 'now')
          const isOpen = open.has(u.unit)
          return (
            <div key={u.key} className={`unit ${active ? 'active' : ''} ${isOpen ? 'open' : ''}`}>
              <button onClick={() => toggle(u.unit)} aria-expanded={isOpen}>
                <span className="n num">{bn(u.unit)}</span>
                <span>
                  <span className="t">{t?.de ?? `Einheit ${u.unit}`}</span><br />
                  <span className="s bn">{t?.bn} · {bn(u.lessons.length)} লেসন</span>
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
                          <span className="ls bn">{l.title.bn} · {bn(l.minutes)} মিনিট</span>
                        </span>
                        {st === 'now' ? <span className="tag now bn">পরেরটা</span> : st === 'done' ? <span className="tag bn">{bn(Math.round((lp.best / Math.max(1, lp.total)) * 100))}%</span> : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {!built && info.planned.map(([de, b], i) => (
          <div key={de} className="unit soon">
            <div className="hd">
              <span className="n num" style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--paper)', border: '1px solid var(--line)', fontFamily: 'var(--display)', fontWeight: 800, color: 'var(--muted)' }}>{bn(i + 1)}</span>
              <span><span className="t">{de}</span><br /><span className="s bn">{b}</span></span>
              <span className="tag bn">শীঘ্রই</span>
            </div>
          </div>
        ))}

        <div className="card exam">
          <div className="eyebrow bn">লেভেলের শেষে</div>
          <h3 style={{ fontSize: 20, marginTop: 4 }}>{level} মক এক্সাম</h3>
          <p className="muted bn" style={{ margin: '4px 0 0' }}>Goethe-Zertifikat {level}-এর ফরম্যাট ধরে পূর্ণ পরীক্ষা। সব ইউনিট শেষ হলে খুলবে — এটি শীঘ্রই আসছে।</p>
          <div className="mods"><span>Lesen</span><span>Hören</span><span>Schreiben</span><span>Sprechen</span></div>
        </div>
      </div>

      {sheet && <LessonSheet lesson={sheet} done={states.get(sheet.id) === 'done'} onClose={() => setSheet(null)} />}
    </>
  )
}

function LessonSheet({ lesson, done, onClose }: { lesson: LessonMeta; done: boolean; onClose(): void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow bn">{lesson.level} · ইউনিট {bn(lesson.unit)} · লেসন {bn(lesson.lesson)} · {bn(lesson.minutes)} মিনিট</div>
        <h3 id="sh-t">{lesson.title.de}</h3>
        <div className="muted bn">{lesson.title.bn}</div>
        <ol className="steps5 bn">
          <li>হুক: আজকের উক্তি বা প্রবাদ</li>
          <li>নতুন শব্দ ({bn(lesson.words)}টি), উচ্চারণসহ</li>
          <li>সংলাপ: ট্যাপে তিন ভাষায় তুলনা</li>
          <li>বাংলায় গ্রামার কার্ড</li>
          <li>কুইজ: ৮০% পেলে পরের লেসন খোলে</li>
        </ol>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="btn bn" style={{ flex: 1 }} autoFocus onClick={() => go(`#lesson/${lesson.id}`)}>{done ? 'আবার করুন' : 'শুরু করুন'}</button>
          <button className="btn ghost bn" onClick={onClose}>বন্ধ</button>
        </div>
        {lesson.status === 'draft' && <p className="muted bn" style={{ fontSize: 13, margin: '10px 0 0' }}>এই লেসনটি খসড়া — শিক্ষক বা জার্মানভাষীর যাচাই বাকি আছে।</p>}
      </div>
    </div>
  )
}
