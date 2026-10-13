import { useEffect, useState, type ReactNode } from 'react'
import { useApp } from '../state'
import { onToast } from '../lib/toast'
import type { Lang } from '../lib/storage'

const ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
    <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
)

export function Say({ text, label }: { text: string; label?: string }) {
  const { say } = useApp()
  const [playing, setPlaying] = useState(false)
  return (
    <button
      className={`say${playing ? ' playing' : ''}`}
      aria-label={label ?? `শুনুন: ${text}`}
      onClick={() => {
        setPlaying(true)
        say(text).finally(() => setPlaying(false))
      }}
    >
      {ICON}
    </button>
  )
}

/** Bangla and/or English text depending on the support-language preference. */
export function Tr({ bn, en }: { bn: string; en: string }) {
  const { progress } = useApp()
  return (
    <>
      {progress.lang !== 'en' && <span className="bn">{bn}</span>}
      {progress.lang !== 'bn' && <span>{en}</span>}
    </>
  )
}

export function Prefs() {
  const { progress, setLang, setSlow } = useApp()
  const opts: [Lang, string][] = [['bn', 'বাংলা'], ['en', 'English'], ['both', 'দুটোই']]
  return (
    <div className="prefs">
      <div className="seg" role="group" aria-label="সাপোর্ট ভাষা">
        {opts.map(([k, label]) => (
          <button key={k} className={k === 'en' ? '' : 'bn'} aria-pressed={progress.lang === k} onClick={() => setLang(k)}>
            {label}
          </button>
        ))}
      </div>
      <label className="toggle bn">
        <input type="checkbox" checked={progress.slow} onChange={(e) => setSlow(e.target.checked)} /> ধীর উচ্চারণ
      </label>
    </div>
  )
}

export function NextButton({ children, onClick }: { children: ReactNode; onClick(): void }) {
  return (
    <div className="actions">
      <button className="btn bn" onClick={onClick}>{children}</button>
    </div>
  )
}

export function Toast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number
    const off = onToast((m) => {
      setMsg(m)
      clearTimeout(t)
      t = window.setTimeout(() => setMsg(null), 3200)
    })
    return () => (off(), clearTimeout(t))
  }, [])
  return msg ? <div className="toast" role="status">{msg}</div> : null
}
