import { describe, expect, it } from 'vitest'
import { bnPron, bnWord } from './bnPron'
import { perksFor } from './perks'

describe('bnPron', () => {
  it('writes German as it sounds, in Bangla letters', () => {
    expect(bnPron('Wie schreibt man das?')).toBe('ভি শ্রাইপ্ট মান দাস?')
    expect(bnPron('groß')).toBe('গ্রোস')
    expect(bnPron('Das Haus ist groß.')).toBe('দাস হাউস ইস্ট গ্রোস।')
  })

  it('follows the main German sound rules', () => {
    expect(bnWord('Wasser')).toBe('ভাসার') // w = ভ, ss = স, -er = আর
    expect(bnWord('viel')).toBe('ফিল') // v = ফ, ie = ই
    expect(bnWord('zehn')).toBe('ৎসেন') // z = ৎস, h after a vowel is silent
    expect(bnWord('Jahr')).toBe('ইয়ার') // j = ইয়
    expect(bnWord('Schule')).toBe('শুলে') // sch = শ
    expect(bnWord('acht')).toBe('আখ্ট') // ch after a = খ
    expect(bnWord('Tag')).toBe('টাক') // final g sounds k
    expect(bnWord('Sonne')).toBe('জোনে') // s before a vowel = জ
    expect(bnWord('Straße')).toBe('শ্ট্রাসে') // st at the start = শ্ট
    expect(bnWord('heute')).toBe('হয়টে') // eu = অয়
    expect(bnWord('zwanzig')).toBe('ৎস্ভান্ৎসিশ') // -ig = ইশ
  })

  it('uses the override list for words the rules get wrong, and keeps the dot of a date', () => {
    expect(bnWord('Familie')).toBe('ফামিলিয়ে')
    expect(bnPron('am 15. Mai.')).toBe('আম 15. মাই।')
  })
})

describe('perksFor', () => {
  const on = { unlockAll: true, bnPron: true }
  it('gives the perks only to signed-in learners when sign-in exists', () => {
    expect(perksFor(true, false, on)).toEqual({ allowed: false, unlockAll: false, bnPron: false })
    expect(perksFor(true, true, on)).toEqual({ allowed: true, unlockAll: true, bnPron: true })
    expect(perksFor(true, true, { unlockAll: false, bnPron: false }).bnPron).toBe(false)
  })
  it('gives them to everyone where sign-in is not available', () => {
    expect(perksFor(false, false, on).allowed).toBe(true)
  })
})
