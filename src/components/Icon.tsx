const PATHS = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  course: <><path d="M5 19c3-1 4-4 7-4s4 3 7 4M5 5c3 1 4 4 7 4s4-3 7-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></>,
  review: <><rect x="4" y="6" width="13" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 3h9.5A2.5 2.5 0 0 1 20 5.5V17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  dict: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  me: <><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  say: <><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.4" /></>,
  play: <path d="M8 5l11 7-11 7z" fill="currentColor" />,
  chev: <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  search: <><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />,
}

export type IconName = keyof typeof PATHS

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>{PATHS[name]}</svg>
}

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 22c4-8 9-12 13-12s9 4 13 12" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M3 24h26M9 17v7M16 13v11M23 17v7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
