export interface Celebration {
  icon: string
  title: string
  sub?: string
}
type Listener = (c: Celebration) => void
const listeners = new Set<Listener>()
export const onCelebrate = (fn: Listener) => (listeners.add(fn), () => void listeners.delete(fn))
export const celebrate = (c: Celebration) => listeners.forEach((fn) => fn(c))
