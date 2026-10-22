/**
 * Optional "support the app" settings, read from environment variables at build time (all public):
 *  - VITE_SUPPORT_URL: a Buy Me a Coffee / Ko-fi / similar page (https only)
 *  - VITE_BKASH_NUMBER: a bKash number people can Send Money to
 *  - VITE_PACKS_CONTACT_URL: where buyers message you after paying: one or more https links separated by spaces or commas (Telegram, WhatsApp, Facebook…)
 *  - VITE_PACKS_PRICE: a short price line for the printable packs page, e.g. "৳199 per level"
 * With neither set, the support card is not shown at all.
 */
const url = (import.meta.env.VITE_SUPPORT_URL as string | undefined)?.trim() ?? ''
const number = (import.meta.env.VITE_BKASH_NUMBER as string | undefined)?.trim() ?? ''

export const SUPPORT_URL: string | null = /^https:\/\/[^\s]+$/.test(url) ? url : null
export const BKASH_NUMBER: string | null = /^[+\d][\d\s-]{6,19}$/.test(number) ? number : null
export const supportEnabled = Boolean(SUPPORT_URL || BKASH_NUMBER)

const contact = (import.meta.env.VITE_PACKS_CONTACT_URL as string | undefined) ?? ''
const price = (import.meta.env.VITE_PACKS_PRICE as string | undefined)?.trim() ?? ''
export interface ContactLink {
  url: string
  name: string | null // "Telegram", "WhatsApp", "Facebook", or null for any other site
}

/** Names the well-known chat links so each button says where it goes. */
export function parseContacts(raw: string): ContactLink[] {
  return raw
    .split(/[\s,]+/)
    .filter((u) => /^https:\/\/[^\s/]+\S*$/.test(u))
    .slice(0, 4)
    .map((url) => {
      const host = new URL(url).hostname.replace(/^www\./, '')
      const name = host === 't.me' || host === 'telegram.me' ? 'Telegram' : host === 'wa.me' || host.endsWith('whatsapp.com') ? 'WhatsApp' : host === 'm.me' || host.endsWith('facebook.com') ? 'Facebook' : null
      return { url, name }
    })
}
export const PACKS_CONTACTS: ContactLink[] = parseContacts(contact)
export const PACKS_PRICE: string | null = price && price.length <= 60 ? price : null
