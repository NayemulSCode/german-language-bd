import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { useApp } from '../state'
import { useT } from '../i18n/useT'

/** The few facts that make signing in worth it (shown on the Home card, in the Profile card and in the dialog). */
function Benefits() {
  const { t } = useT()
  return (
    <ul className="benefits">
      {(['auth.benefit.1', 'auth.benefit.2', 'auth.benefit.3'] as const).map((k) => (
        <li key={k} className="bn"><span aria-hidden="true">✓</span>{t(k)}</li>
      ))}
    </ul>
  )
}

/** Whether the sign-in UI exists at all: it needs Supabase to be configured, and stays hidden while we find out if someone is already signed in. */
export function useCanSignIn() {
  const { configured, loading, email } = useAuth()
  return { show: configured && !loading, email }
}

/** Signed-in status (email, sync state, log out) or, when signed out, the "save your progress" card. Renders nothing when Supabase is not configured. */
export function Account() {
  const { email, signOut } = useAuth()
  const { show } = useCanSignIn()
  const { syncStatus, syncNow } = useApp()
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (!show) return null

  if (email) {
    return (
      <div className="account" aria-live="polite">
        <div className="who bn">
          <b>{email}</b>
          <span className={`sync ${syncStatus}`}>{syncStatus === 'off' ? '' : t(`auth.status.${syncStatus}`)}</span>
        </div>
        <div className="acts">
          {syncStatus === 'error' && <button className="link bn" onClick={syncNow}>{t('auth.retry')}</button>}
          <button className="link bn" onClick={() => void signOut()}>{t('auth.logout')}</button>
        </div>
      </div>
    )
  }
  return (
    <>
      <section className="card save-card" aria-labelledby="save-title">
        <span className="save-emoji" aria-hidden="true">☁️</span>
        <h2 id="save-title" className="bn">{t('auth.card.title')}</h2>
        <p className="bn muted">{t('auth.card.sub')}</p>
        <Benefits />
        <button className="btn bn" onClick={() => setOpen(true)}>{t('auth.cta')}</button>
      </section>
      {open && <SignInDialog onClose={() => setOpen(false)} />}
    </>
  )
}

const NUDGE_KEY = 'deutsch-bd:loginNudge'
const NUDGE_DAYS = 3

/** A compact prompt for the Home screen. "Maybe later" hides it for a few days on this device. */
export function LoginNudge() {
  const { show, email } = useCanSignIn()
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(() => {
    try {
      return Date.now() - Number(localStorage.getItem(NUDGE_KEY) || 0) < NUDGE_DAYS * 864e5
    } catch {
      return false
    }
  })
  if (!show || email || hidden) return null
  const later = () => {
    try {
      localStorage.setItem(NUDGE_KEY, String(Date.now()))
    } catch { /* private mode: it just comes back next visit */ }
    setHidden(true)
  }
  return (
    <>
      <section className="card save-card compact" aria-labelledby="nudge-title">
        <span className="save-emoji" aria-hidden="true">☁️</span>
        <div className="grow">
          <div id="nudge-title" className="bn save-title">{t('auth.card.title')}</div>
          <div className="bn muted" style={{ fontSize: 14 }}>{t('auth.nudge.sub')}</div>
          <div className="save-acts">
            <button className="btn sm bn" onClick={() => setOpen(true)}>{t('auth.cta')}</button>
            <button className="link bn" onClick={later}>{t('auth.later')}</button>
          </div>
        </div>
      </section>
      {open && <SignInDialog onClose={() => setOpen(false)} />}
    </>
  )
}

/** A small "Log in" button (top bar and side menu). When signed in it becomes a round avatar that opens the profile. */
export function LoginChip({ className = '' }: { className?: string }) {
  const { show, email } = useCanSignIn()
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (!show) return null
  if (email) return <a className={`avatar-chip ${className}`} href="#me" aria-label={email} title={email}>{email[0].toUpperCase()}</a>
  return (
    <>
      <button className={`btn sm bn login-chip ${className}`} onClick={() => setOpen(true)}>{t('auth.login')}</button>
      {open && <SignInDialog onClose={() => setOpen(false)} />}
    </>
  )
}

export function SignInDialog({ onClose }: { onClose(): void }) {
  const { signInGoogle, signInEmail } = useAuth()
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const google = async () => {
    setBusy(true)
    const err = await signInGoogle()
    if (err) setMsg({ kind: 'err', text: t(`auth.err.${err}`) })
    setBusy(false)
  }
  const mail = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const err = await signInEmail(email.trim())
    setMsg(err ? { kind: 'err', text: t(`auth.err.${err}`) } : { kind: 'ok', text: t('auth.sent') })
    setBusy(false)
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="signin-title" onClick={(e) => e.stopPropagation()}>
        <span className="save-emoji" aria-hidden="true">☁️</span>
        <h2 id="signin-title" className="bn">{t('auth.dialog.title')}</h2>
        <p className="bn muted" style={{ margin: 0 }}>{t('auth.dialog.sub')}</p>
        <button className="btn ghost bn" disabled={busy} onClick={() => void google()}>{t('auth.google')}</button>
        <div className="or bn"><span>{t('auth.or')}</span></div>
        <form onSubmit={mail}>
          <label className="bn" htmlFor="email">{t('auth.email')}</label>
          <input ref={input} id="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn bn" type="submit" disabled={busy || !email.trim()}>{t('auth.sendLink')}</button>
        </form>
        {msg && <p className={`msg ${msg.kind} bn`} role="status">{msg.text}</p>}
        <p className="hint bn">{t('auth.hint')}</p>
        <button className="link bn" onClick={onClose}>{t('common.closeLong')}</button>
      </div>
    </div>
  )
}
