const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
/** Western digits → Bangla digits. */
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d])

export const MIN = 60_000
export const HOUR = 3_600_000
export const DAY = 86_400_000

/** "১ মিনিট", "১০ মিনিট", "৩ ঘণ্টা", "৪ দিন", "২ মাস" */
export function fmtInterval(ms: number): string {
  if (ms < HOUR) return `${bn(Math.max(1, Math.round(ms / MIN)))} মিনিট`
  if (ms < DAY) return `${bn(Math.round(ms / HOUR))} ঘণ্টা`
  const days = Math.round(ms / DAY)
  return days < 60 ? `${bn(days)} দিন` : `${bn(Math.round(days / 30))} মাস`
}
