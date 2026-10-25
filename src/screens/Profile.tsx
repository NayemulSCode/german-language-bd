import { useState } from 'react'
import { useApp } from '../state'
import { LESSONS } from '../lib/content'
import { isCore } from '../lib/course'
import { GOALS, type Lang, type Theme, type Ui } from '../lib/storage'
import { useT } from '../i18n/useT'
import type { Key } from '../i18n/core'
import { heatLevel, recentWeeks, streak } from '../lib/stats'
import { Account, SignInDialog, useCanSignIn, usePerks } from '../components/Account'
import { Avatar } from '../components/Avatar'
import { SupportCard } from '../components/Support'
import { BADGES, badgeDesc, badgeTitle, earnedBadges } from '../lib/badges'

const sw = (a: string, b: string) => [a, b]
const THEMES: [Theme, Key, string[], Key][] = [
  ['system', 'theme.system', sw('#F3F5F9', '#0E1322'), 'theme.system.d'],
  ['light', 'theme.light', sw('#FFFFFF', '#E3A21A'), 'theme.light.d'],
  ['dark', 'theme.dark', sw('#161D31', '#F0B43C'), 'theme.dark.d'],
  ['night', 'theme.night', sw('#1C160F', '#D9952E'), 'theme.night.d'],
]
/** A settings switch for a signed-in perk: when signed out it shows a lock and opens sign-in instead. */
function Perk({ id, title, sub, on, allowed, onChange, onLocked }: { id: string; title: string; sub: string; on: boolean; allowed: boolean; onChange(v: boolean): void; onLocked(): void }) {
  const { t } = useT()
  return (
    <div className={`set perk${allowed ? '' : ' locked'}`}>
      <label htmlFor={id} className="bn">
        {title} {!allowed && <span className="lock-tag">🔒 {t('perk.loginOnly')}</span>}
        <span className="muted" style={{ fontSize: 13, display: 'block' }}>{sub}</span>
      </label>
      {allowed
        ? <input id={id} type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accent-ink)' }} />
        : <button id={id} className="btn sm ghost bn" onClick={onLocked}>{t('perk.login')}</button>}
    </div>
  )
}

const GOAL_LABEL: Record<number, Key> = { 20: 'goal.20', 50: 'goal.50', 100: 'goal.100' }

export function ProfileScreen() {
  const { progress, setLang, setUi, setSlow, setSettings, lessonProgress } = useApp()
  const { t, n, ui } = useT()
  const passedLessons = LESSONS.filter((l) => lessonProgress(l.id).passed)
  const learnedWords = passedLessons.reduce((n, l) => n + l.words, 0)
  const a1 = LESSONS.filter((l) => l.level === 'A1' && isCore(l))
  const a1Done = a1.filter((l) => lessonProgress(l.id).passed).length
  const a1Pct = a1.length ? (a1Done / a1.length) * 100 : 0
  const days = recentWeeks(5)
  const earned = earnedBadges(progress, LESSONS)
  const { show: canSignIn, email, name: accountName, avatarUrl } = useCanSignIn()
  const name = progress.name || accountName || 'Lerner'
  const perks = usePerks()
  const [signIn, setSignIn] = useState(false)

  return (
    <>
      <div className="row">
        <Avatar name={name} url={avatarUrl} size={56} />
        <div className="grow"><h1 style={{ fontSize: 28 }}>{name}</h1><div className="muted bn">{t('me.goal')}</div></div>
      </div>

      <div style={{ marginTop: 16 }}><Account /></div>

      <div className="stats" style={{ marginTop: 16 }}>
        <div className="stat"><b className="num">{n(learnedWords)}</b><span className="bn">{t('me.words')}</span></div>
        <div className="stat"><b className="num">{n(streak(progress.activity))}</b><span className="bn">{t('me.streak')}</span></div>
        <div className="stat"><b className="num">{n(progress.xp)}</b><span className="bn">{t('me.xp')}</span></div>
        <div className="stat"><b className="num">{n(a1Done)} / {n(a1.length)}</b><span className="bn">{t('me.a1')}</span></div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">{t('me.badges', { a: earned.size, b: BADGES.length })}</div>
        <ul className="badges">
          {BADGES.map((b) => (
            <li key={b.id} className={earned.has(b.id) ? 'got' : 'locked'} title={badgeDesc(t, b.id)}>
              <span className="b-icon" aria-hidden="true">{earned.has(b.id) ? b.icon : '🔒'}</span>
              <b className="bn">{badgeTitle(t, b.id)}</b>
              <span className="bn">{badgeDesc(t, b.id)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">{t('me.oc.title')}</div>
        <p className="bn" style={{ margin: '6px 0 0' }}>{t('me.oc.body')}</p>
        <div className="meter bn">
          <div><i><u style={{ width: `${a1Pct}%` }} /></i><b>A1</b><span>{t('me.oc.min')}</span></div>
          <div><i /><b>A2</b><span>{t('me.oc.soon')}</span></div>
          <div><i /><b>B1</b><span>{t('me.oc.soon')}</span></div>
          <div><i /><b>B2</b><span>{t('me.oc.planned')}</span></div>
        </div>
        <p className="muted bn" style={{ fontSize: 13, margin: '10px 0 0' }}>{t('me.oc.note')}</p>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">{t('me.heat')}</div>
        <div className="heat" role="img" aria-label={t('me.heatAria')}>
          {days.map((d) => <i key={d} className={`l${heatLevel(progress.activity[d] ?? 0)}`} title={`${d}: ${progress.activity[d] ?? 0} XP`} />)}
        </div>
        <div className="muted bn" style={{ fontSize: 13, marginTop: 6 }}>{t('me.heatLegend')}</div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow bn">{t('me.settings')}</div>
        <div className="set" style={{ display: 'block' }}>
          <span className="bn">{t('me.theme')}</span>
          <div className="themes" role="group" aria-label={t('me.theme')}>
            {THEMES.map(([k, label, colors]) => (
              <button key={k} className="th bn" id={`th-${k}`} aria-pressed={progress.theme === k} onClick={() => setSettings({ theme: k })}>
                <span className="sw" aria-hidden="true"><i style={{ background: colors[0] }} /><i style={{ background: colors[1] }} /></span>{t(label)}
              </button>
            ))}
          </div>
          <div className="muted bn" style={{ fontSize: 13, marginTop: 8 }}>{t(THEMES.find((th) => th[0] === progress.theme)![3])}</div>
        </div>
        <div className="set">
          <span className="bn">{t('me.uiLang')}</span>
          <div className="seg" role="group" aria-label={t('me.uiLang')}>
            {([['bn', 'বাংলা'], ['en', 'English']] as [Ui, string][]).map(([k, l]) => (
              <button key={k} id={`ui-${k}`} className={k === 'en' ? '' : 'bn'} aria-pressed={ui === k} onClick={() => setUi(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="set">
          <span className="bn">{t('lang.aria')}</span>
          <div className="seg" role="group" aria-label={t('lang.aria')}>
            {([['bn', 'বাংলা'], ['en', 'English'], ['both', t('lang.both')]] as [Lang, string][]).map(([k, l]) => (
              <button key={k} id={`sl-${k}`} className={k === 'en' ? '' : 'bn'} aria-pressed={progress.lang === k} onClick={() => setLang(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="set"><label htmlFor="slow" className="bn">{t('lang.slow')}</label><input id="slow" type="checkbox" checked={progress.slow} onChange={(e) => setSlow(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accent-ink)' }} /></div>
        <div className="set">
          <label htmlFor="goal" className="bn">{t('me.goalLabel')}</label>
          <select id="goal" className="bn" value={progress.goal} onChange={(e) => setSettings({ goal: +e.target.value })}>
            {GOALS.map((g) => <option key={g} value={g}>{t(GOAL_LABEL[g])}</option>)}
          </select>
        </div>
        <Perk id="unlock" title={t('me.unlock')} sub={t('me.unlockSub')} on={perks.unlockAll} allowed={perks.allowed} onChange={(v) => setSettings({ unlockAll: v })} onLocked={() => setSignIn(true)} />
        <Perk id="bnpron" title={t('me.bnPron')} sub={t('me.bnPronSub')} on={perks.bnPron} allowed={perks.allowed} onChange={(v) => setSettings({ bnPron: v })} onLocked={() => setSignIn(true)} />
        <div className="set"><span className="bn">{t('place.test')} {progress.placed ? `· ${t('me.startUnit', { n: progress.startUnit })}` : ''}</span><a className="btn sm ghost bn" href="#placement">{progress.placed ? t('me.retake') : t('me.take')}</a></div>
        <div className="set"><span className="bn">A2 {t('place.test')} {progress.startUnitA2 > 0 ? `· ${t('me.startUnit', { n: progress.startUnitA2 })}` : ''}</span><a className="btn sm ghost bn" href="#placement/a2">{progress.startUnitA2 > 0 ? t('me.retake') : t('me.take')}</a></div>
        <div className="set"><span className="bn">B1 {t('place.test')} {progress.startUnitB1 > 0 ? `· ${t('me.startUnit', { n: progress.startUnitB1 })}` : ''}</span><a className="btn sm ghost bn" href="#placement/b1">{progress.startUnitB1 > 0 ? t('me.retake') : t('me.take')}</a></div>
        <div className="set"><label htmlFor="pname" className="bn">{t('me.name')}</label><span className="field"><input id="pname" type="text" maxLength={30} placeholder={t('me.namePh')} value={progress.name} onChange={(e) => setSettings({ name: e.target.value })} /></span></div>
        <div className="set"><label htmlFor="exam" className="bn">{t('me.examDate')}</label><span className="field"><input id="exam" type="date" value={progress.examDate} onChange={(e) => setSettings({ examDate: e.target.value })} /></span></div>
      </div>
      <div style={{ marginTop: 14 }}>
        <a className="card row packs-card" href="#packs" style={{ textDecoration: 'none' }}>
          <span className="save-emoji" aria-hidden="true">🖨️</span>
          <div className="grow">
            <div className="bn save-title">{t('packs.card.title')}</div>
            <div className="bn muted" style={{ fontSize: 14 }}>{t('packs.card.sub')}</div>
          </div>
          <span className="btn sm ghost bn">{t('packs.card.go')}</span>
        </a>
      </div>
      <div style={{ marginTop: 14 }}><SupportCard /></div>
      <p className="foot bn">{canSignIn ? t(email ? 'me.foot.in' : 'me.foot') : t('me.foot.local')}</p>
      {signIn && <SignInDialog onClose={() => setSignIn(false)} />}
    </>
  )
}
