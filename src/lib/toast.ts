type Listener = (msg: string) => void
const listeners = new Set<Listener>()
export const onToast = (fn: Listener) => (listeners.add(fn), () => void listeners.delete(fn))
export const toast = (msg: string) => listeners.forEach((fn) => fn(msg))
