import { useState } from 'react'

/** A round profile picture; falls back to the first letter of the name when there is no picture or it fails to load (e.g. offline). */
export function Avatar({ name, url, size = 32, className = '' }: { name: string; url?: string | null; size?: number; className?: string }) {
  const [bad, setBad] = useState<string | null>(null)
  const initial = (Array.from(name.trim())[0] ?? '?').toUpperCase()
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {url && bad !== url ? <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setBad(url)} /> : initial}
    </span>
  )
}
