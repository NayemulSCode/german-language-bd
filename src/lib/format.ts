const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
/** Western digits → Bangla digits. */
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d])

import type { T } from '../i18n/core'

export const MIN = 60_000
export const HOUR = 3_600_000
export const DAY = 86_400_000

/** "1 min", "10 min", "3 h", "4 d", "2 mo" (digits follow the interface language) */
export function fmtInterval(ms: number, t: T): string {
  if (ms < HOUR) return t('time.min', { n: Math.max(1, Math.round(ms / MIN)) })
  if (ms < DAY) return t('time.hour', { n: Math.round(ms / HOUR) })
  const days = Math.round(ms / DAY)
  return days < 60 ? t('time.day', { n: days }) : t('time.month', { n: Math.round(days / 30) })
}
