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
  it('reads the packs contact link (https only) and a short price line', async () => {
    const ok = await load({ VITE_PACKS_CONTACT_URL: 'https://wa.me/8801700000000', VITE_PACKS_PRICE: '৳199 per level' })
    expect(ok.PACKS_CONTACT_URL).toBe('https://wa.me/8801700000000')
    expect(ok.PACKS_PRICE).toBe('৳199 per level')
    const bad = await load({ VITE_PACKS_CONTACT_URL: 'http://example.com', VITE_PACKS_PRICE: 'x'.repeat(61) })
    expect(bad.PACKS_CONTACT_URL).toBeNull()
    expect(bad.PACKS_PRICE).toBeNull()
  })
})
