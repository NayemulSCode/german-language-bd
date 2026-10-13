import { useApp } from '../state'
import { LESSONS } from '../lib/content'
import { GOALS, type Lang, type Theme } from '../lib/storage'
import { bn } from '../lib/format'
import { heatLevel, recentWeeks, streak } from '../lib/stats'
import { Account } from '../components/Account'

const sw = (a: string, b: string) => [a, b]
const THEMES: [Theme, string, string[], string][] = [
  ['system', 'সিস্টেম', sw('#F3F5F9', '#0E1322'), 'ফোন বা কম্পিউটারের সেটিং অনুযায়ী লাইট বা ডার্ক।'],
  ['light', 'লাইট', sw('#FFFFFF', '#E3A21A'), 'দিনের আলোয় পড়ার জন্য উজ্জ্বল থিম।'],
  ['dark', 'ডার্ক', sw('#161D31', '#F0B43C'), 'কম আলোয় চোখে আরামদায়ক গাঢ় থিম।'],
  ['night', 'নাইট', sw('#1C160F', '#D9952E'), 'রাতে পড়ার জন্য উষ্ণ রঙ, নীল আলো কম — ঘুমের আগে পড়লে চোখে কম চাপ।'],
]
const GOAL_LABEL: Record<number, string> = { 20: 'হালকা · ২০ XP', 50: 'নিয়মিত · ৫০ XP', 100: 'সিরিয়াস · ১০০ XP' }

export function ProfileScreen() {
  const { progress, setLang, setSlow, setSettings, lessonProgress } = useApp()
  const name = progress.name || 'Lerner'
  const passedLessons = LESSONS.filter((l) => lessonProgress(l.id).passed)
  const learnedWords = passedLessons.reduce((n, l) => n + l.words, 0)
  const a1 = LESSONS.filter((l) => l.level === 'A1')
  const a1Done = a1.filter((l) => lessonProgress(l.id).passed).length
  const a1Pct = a1.length ? (a1Done / a1.length) * 100 : 0
  const days = recentWeeks(5)

  return (
    <>
      <div className="row">
        <span className="av" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24 }}>{name[0].toUpperCase()}</span>
        <div className="grow"><h1 style={{ fontSize: 28 }}>{name}</h1><div className="muted bn">লক্ষ্য: Opportunity Card</div></div>
      </div>

      <div className="stats" style={{ marginTop: 16 }}>
        <div className="stat"><b className="num">{bn(learnedWords)}</b><span className="bn">শেখা শব্দ</span></div>
        <div className="stat"><b className="num">{bn(streak(progress.activity))}</b><span className="bn">দিনের স্ট্রিক</span></div>
        <div className="stat"><b className="num">{bn(progress.xp)}</b><span className="bn">মোট XP</span></div>
        <div className="stat"><b className="num">{bn(a1Done)} / {bn(a1.length)}</b><span className="bn">A1 লেসন</span></div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">Opportunity Card · ভাষার ধাপ</div>
        <p className="bn" style={{ margin: '6px 0 0' }}>আবেদনের জন্য সাধারণত A1 জার্মান (বা B2 ইংরেজি) লাগে; জার্মানের উচ্চতর স্তরে বাড়তি পয়েন্ট মেলে। পয়েন্টের হিসাব ও শর্ত সময়ে সময়ে বদলায় — Make it in Germany পোর্টালে সর্বশেষ নিয়ম দেখে নিন।</p>
        <div className="meter bn">
          <div><i><u style={{ width: `${a1Pct}%` }} /></i><b>A1</b><span>ন্যূনতম শর্ত</span></div>
          <div><i /><b>A2</b><span>শীঘ্রই</span></div>
          <div><i /><b>B1</b><span>শীঘ্রই</span></div>
          <div><i /><b>B2</b><span>পরিকল্পনায়</span></div>
        </div>
        <p className="muted bn" style={{ fontSize: 13, margin: '10px 0 0' }}>এই অ্যাপ প্রস্তুতির জন্য — স্বীকৃত সার্টিফিকেট নয়। আবেদনে Goethe, telc বা ÖSD-এর মতো অফিসিয়াল পরীক্ষার সনদ লাগবে।</p>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">গত ৫ সপ্তাহ</div>
        <div className="heat" role="img" aria-label="প্রতিদিনের পড়ার সময়">
          {days.map((d) => <i key={d} className={`l${heatLevel(progress.activity[d] ?? 0)}`} title={`${d}: ${progress.activity[d] ?? 0} XP`} />)}
        </div>
        <div className="muted bn" style={{ fontSize: 13, marginTop: 6 }}>গাঢ় রং = সেদিন বেশি পড়া হয়েছে</div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">সেটিংস</div>
        <div className="set" style={{ display: 'block' }}>
          <span className="bn">থিম</span>
          <div className="themes" role="group" aria-label="থিম">
            {THEMES.map(([k, label, colors]) => (
              <button key={k} className="th bn" id={`th-${k}`} aria-pressed={progress.theme === k} onClick={() => setSettings({ theme: k })}>
                <span className="sw" aria-hidden="true"><i style={{ background: colors[0] }} /><i style={{ background: colors[1] }} /></span>{label}
              </button>
            ))}
          </div>
          <div className="muted bn" style={{ fontSize: 13, marginTop: 8 }}>{THEMES.find((t) => t[0] === progress.theme)![3]}</div>
        </div>
        <div className="set">
          <span className="bn">সাপোর্ট ভাষা</span>
          <div className="seg" role="group" aria-label="সাপোর্ট ভাষা">
            {([['bn', 'বাংলা'], ['en', 'English'], ['both', 'দুটোই']] as [Lang, string][]).map(([k, l]) => (
              <button key={k} id={`sl-${k}`} className={k === 'en' ? '' : 'bn'} aria-pressed={progress.lang === k} onClick={() => setLang(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="set"><label htmlFor="slow" className="bn">ধীর উচ্চারণ</label><input id="slow" type="checkbox" checked={progress.slow} onChange={(e) => setSlow(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accent-ink)' }} /></div>
        <div className="set">
          <label htmlFor="goal" className="bn">দৈনিক লক্ষ্য</label>
          <select id="goal" className="bn" value={progress.goal} onChange={(e) => setSettings({ goal: +e.target.value })}>
            {GOALS.map((g) => <option key={g} value={g}>{GOAL_LABEL[g]}</option>)}
          </select>
        </div>
        <div className="set"><label htmlFor="pname" className="bn">আপনার নাম</label><span className="field"><input id="pname" type="text" maxLength={30} placeholder="যেমন: Saheb" value={progress.name} onChange={(e) => setSettings({ name: e.target.value })} /></span></div>
        <div className="set"><label htmlFor="exam" className="bn">পরীক্ষার তারিখ</label><span className="field"><input id="exam" type="date" value={progress.examDate} onChange={(e) => setSettings({ examDate: e.target.value })} /></span></div>
        <Account />
      </div>
      <p className="foot bn">সব অগ্রগতি এই ডিভাইসে সেভ হয়। লগইন করলে (সেটআপ থাকলে) সব ডিভাইসে মিলে যায়।</p>
    </>
  )
}
