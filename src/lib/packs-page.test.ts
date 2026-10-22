import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PACK_KINDS, PACK_LEVELS, PACK_PAGES, SAMPLES } from './packs'

describe('packs page data', () => {
  it('every free sample is published in public/downloads', () => {
    for (const s of SAMPLES) expect(existsSync(new URL(`../../public/downloads/${s.file}`, import.meta.url)), s.file).toBe(true)
  })
  it('has a page count for every level and kind', () => {
    for (const lv of PACK_LEVELS) for (const k of PACK_KINDS) expect(PACK_PAGES[lv][k], `${lv} ${k}`).toBeGreaterThan(0)
  })
})
