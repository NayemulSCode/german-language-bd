import { useEffect, useMemo, useState } from 'react'
import { onCelebrate, type Celebration as C } from '../lib/celebrate'

const COLORS = ['var(--accent)', 'var(--der)', 'var(--die)', 'var(--das)', 'var(--ink)']

/** Shows queued celebrations one at a time: a card with a burst of confetti (hidden for reduced-motion users). */
export function Celebration() {
  const [queue, setQueue] = useState<C[]>([])
  useEffect(() => onCelebrate((c) => setQueue((q) => (q.length < 4 ? [...q, c] : q))), [])
  const cur = queue[0]
  useEffect(() => {
    if (!cur) return
    const t = window.setTimeout(() => setQueue((q) => q.slice(1)), 3400)
    return () => clearTimeout(t)
  }, [cur])
  const bits = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      left: 10 + Math.random() * 80,
      dx: (Math.random() - 0.5) * 220,
      delay: Math.random() * 0.25,
      dur: 1.1 + Math.random() * 0.9,
      rot: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
    })),
    [cur],
  )
  if (!cur) return null
  return (
    <div className="cele" role="status" onClick={() => setQueue((q) => q.slice(1))}>
      <div className="cele-bits" aria-hidden="true">
        {bits.map((b, i) => (
          <i key={i} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, ['--dx' as string]: `${b.dx}px`, ['--rot' as string]: `${b.rot}deg` }} />
        ))}
      </div>
      <div className="cele-card">
        <span className="cele-icon" aria-hidden="true">{cur.icon}</span>
        <div>
          <b className="bn">{cur.title}</b>
          {cur.sub && <div className="bn muted">{cur.sub}</div>}
        </div>
      </div>
    </div>
  )
}
