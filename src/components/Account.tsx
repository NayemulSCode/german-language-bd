import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { useApp } from '../state'
import { useT } from '../i18n/useT'

/** Login / sync status. Renders nothing when Supabase is not configured, so the app stays fully usable offline. */
export function Account() {
  const { configured, loading, email, signOut } = useAuth()
  const { syncStatus, syncNow } = useApp()
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (!configured || loading) return null

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
      <div className="account">
        <span className="bn who">{t('auth.promo')}</span>
        <button className="btn sm bn" onClick={() => setOpen(true)}>{t('auth.login')}</button>
      </div>
      {open && <SignInDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function SignInDialog({ onClose }: { onClose(): void }) {
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
        <h2 id="signin-title" className="bn">{t('auth.login')}</h2>
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
