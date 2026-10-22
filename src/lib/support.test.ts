import { afterEach, describe, expect, it, vi } from 'vitest'

async function load(env: Record<string, string>) {
  vi.resetModules()
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v)
  return import('./support')
}

afterEach(() => vi.unstubAllEnvs())

describe('support settings', () => {
  it('is off when nothing is configured', async () => {
    const s = await load({ VITE_SUPPORT_URL: '', VITE_BKASH_NUMBER: '' })
    expect(s.supportEnabled).toBe(false)
  })
  it('accepts an https link and a phone-like number', async () => {
    const s = await load({ VITE_SUPPORT_URL: 'https://buymeacoffee.com/someone', VITE_BKASH_NUMBER: '01700-000000' })
    expect(s.SUPPORT_URL).toBe('https://buymeacoffee.com/someone')
    expect(s.BKASH_NUMBER).toBe('01700-000000')
    expect(s.supportEnabled).toBe(true)
  })
  it('ignores a link that is not https and a number that is not a number', async () => {
    const s = await load({ VITE_SUPPORT_URL: 'javascript:alert(1)', VITE_BKASH_NUMBER: 'call me' })
    expect(s.SUPPORT_URL).toBeNull()
    expect(s.BKASH_NUMBER).toBeNull()
    expect(s.supportEnabled).toBe(false)
  })
  it('reads the packs contact links (https only, several allowed) and a short price line', async () => {
    const ok = await load({ VITE_PACKS_CONTACT_URL: 'https://t.me/someone https://wa.me/8801700000000, https://example.com/chat', VITE_PACKS_PRICE: '৳199 per level' })
    expect(ok.PACKS_CONTACTS).toEqual([
      { url: 'https://t.me/someone', name: 'Telegram' },
      { url: 'https://wa.me/8801700000000', name: 'WhatsApp' },
      { url: 'https://example.com/chat', name: null },
    ])
    expect(ok.PACKS_PRICE).toBe('৳199 per level')
    const bad = await load({ VITE_PACKS_CONTACT_URL: 'http://example.com javascript:alert(1) not-a-link', VITE_PACKS_PRICE: 'x'.repeat(61) })
    expect(bad.PACKS_CONTACTS).toEqual([])
    expect(bad.PACKS_PRICE).toBeNull()
  })
})
