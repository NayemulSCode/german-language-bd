import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { useApp } from '../state'

const STATUS: Record<string, string> = { syncing: 'সিঙ্ক হচ্ছে…', synced: 'সব ডিভাইসে সেভ আছে', error: 'সিঙ্ক হয়নি — ইন্টারনেট দেখুন', off: '' }

/** Login / sync status. Renders nothing when Supabase is not configured, so the app stays fully usable offline. */
export function Account() {
  const { configured, loading, email, signOut } = useAuth()
  const { syncStatus, syncNow } = useApp()
  const [open, setOpen] = useState(false)
  if (!configured || loading) return null

  if (email) {
    return (
      <div className="account" aria-live="polite">
        <div className="who bn">
          <b>{email}</b>
          <span className={`sync ${syncStatus}`}>{STATUS[syncStatus]}</span>
        </div>
        <div className="acts">
          {syncStatus === 'error' && <button className="link bn" onClick={syncNow}>আবার চেষ্টা</button>}
          <button className="link bn" onClick={() => void signOut()}>লগআউট</button>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="account">
        <span className="bn who">লগইন করলে অগ্রগতি ফোন ও কম্পিউটার — সব ডিভাইসে সেভ থাকবে।</span>
        <button className="btn bn small" onClick={() => setOpen(true)}>লগইন</button>
      </div>
      {open && <SignInDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function SignInDialog({ onClose }: { onClose(): void }) {
  const { signInGoogle, signInEmail } = useAuth()
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
    if (err) setMsg({ kind: 'err', text: err })
    setBusy(false)
  }
  const mail = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const err = await signInEmail(email.trim())
    setMsg(err ? { kind: 'err', text: err } : { kind: 'ok', text: 'ইমেইল পাঠানো হয়েছে — ইনবক্স (স্প্যামও) দেখে লিংকে ক্লিক করুন।' })
    setBusy(false)
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="signin-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="signin-title" className="bn">লগইন</h2>
        <button className="btn ghost bn" disabled={busy} onClick={() => void google()}>Google দিয়ে লগইন</button>
        <div className="or bn"><span>অথবা</span></div>
        <form onSubmit={mail}>
          <label className="bn" htmlFor="email">ইমেইল</label>
          <input ref={input} id="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn bn" type="submit" disabled={busy || !email.trim()}>লগইন লিংক পাঠান</button>
        </form>
        {msg && <p className={`msg ${msg.kind} bn`} role="status">{msg.text}</p>}
        <p className="hint bn">পাসওয়ার্ড লাগবে না। লগইন ছাড়াও অ্যাপ চলবে — তখন অগ্রগতি শুধু এই ডিভাইসে থাকবে।</p>
        <button className="link bn" onClick={onClose}>বন্ধ করুন</button>
      </div>
    </div>
  )
}
