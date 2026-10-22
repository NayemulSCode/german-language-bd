/**
 * Optional "support the app" settings, read from environment variables at build time (all public):
 *  - VITE_SUPPORT_URL: a Buy Me a Coffee / Ko-fi / similar page (https only)
 *  - VITE_BKASH_NUMBER: a bKash number people can Send Money to
 *  - VITE_PACKS_CONTACT_URL: where buyers message you after paying (WhatsApp, Telegram, Facebook… https only)
 *  - VITE_PACKS_PRICE: a short price line for the printable packs page, e.g. "৳199 per level"
 * With neither set, the support card is not shown at all.
 */
const url = (import.meta.env.VITE_SUPPORT_URL as string | undefined)?.trim() ?? ''
const number = (import.meta.env.VITE_BKASH_NUMBER as string | undefined)?.trim() ?? ''

export const SUPPORT_URL: string | null = /^https:\/\/[^\s]+$/.test(url) ? url : null
export const BKASH_NUMBER: string | null = /^[+\d][\d\s-]{6,19}$/.test(number) ? number : null
export const supportEnabled = Boolean(SUPPORT_URL || BKASH_NUMBER)

const contact = (import.meta.env.VITE_PACKS_CONTACT_URL as string | undefined)?.trim() ?? ''
const price = (import.meta.env.VITE_PACKS_PRICE as string | undefined)?.trim() ?? ''
export const PACKS_CONTACT_URL: string | null = /^https:\/\/[^\s]+$/.test(contact) ? contact : null
export const PACKS_PRICE: string | null = price && price.length <= 60 ? price : null
