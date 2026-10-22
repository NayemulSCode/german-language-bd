/**
 * Optional "support the app" settings, read from environment variables at build time (all public):
 *  - VITE_SUPPORT_URL: a Buy Me a Coffee / Ko-fi / similar page (https only)
 *  - VITE_BKASH_NUMBER: a bKash number people can Send Money to
 * With neither set, the support card is not shown at all.
 */
const url = (import.meta.env.VITE_SUPPORT_URL as string | undefined)?.trim() ?? ''
const number = (import.meta.env.VITE_BKASH_NUMBER as string | undefined)?.trim() ?? ''

export const SUPPORT_URL: string | null = /^https:\/\/[^\s]+$/.test(url) ? url : null
export const BKASH_NUMBER: string | null = /^[+\d][\d\s-]{6,19}$/.test(number) ? number : null
export const supportEnabled = Boolean(SUPPORT_URL || BKASH_NUMBER)
