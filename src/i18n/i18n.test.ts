import { describe, expect, it } from 'vitest'
import { BN } from './bn'
import { EN } from './en'
import { fmtNum, makeT, type Key } from './core'
import { BADGES } from '../lib/badges'

const keys = Object.keys(BN) as Key[]
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
const hasBangla = (s: string) => /[ঀ-৿]/.test(s)

describe('interface translations', () => {
  it('English has exactly the same keys as Bangla', () => {
    expect(Object.keys(EN).sort()).toEqual([...keys].sort())
  })

  it('no string is empty', () => {
    for (const k of keys) {
      expect(BN[k].trim(), `bn ${k}`).not.toBe('')
      expect(EN[k].trim(), `en ${k}`).not.toBe('')
    }
  })

  it('both languages use the same {placeholders}', () => {
    for (const k of keys) expect(placeholders(EN[k]), k).toEqual(placeholders(BN[k]))
  })

  it('English strings contain no Bangla, apart from deliberate examples', () => {
    const allowed = new Set<Key>(['dict.placeholder', 'me.bnPronSub'])
    for (const k of keys) if (!allowed.has(k)) expect(hasBangla(EN[k]), `en ${k} contains Bangla: ${EN[k]}`).toBe(false)
  })

  it('every badge has a title and a description in both languages', () => {
    for (const b of BADGES) {
      expect(BN[`badge.${b.id}.t` as Key], b.id).toBeTruthy()
      expect(EN[`badge.${b.id}.d` as Key], b.id).toBeTruthy()
    }
  })
})

describe('makeT', () => {
  it('formats numbers in the language of the interface', () => {
    expect(makeT('bn')('home.streak', { n: 12 })).toBe('স্ট্রিক ১২')
    expect(makeT('en')('home.streak', { n: 12 })).toBe('Streak 12')
  })

  it('inserts string params unchanged and leaves unknown placeholders visible', () => {
    expect(makeT('en')('home.nowOn', { title: 'Hallo 123' })).toBe('Now on: Hallo 123')
    expect(makeT('en')('home.nowOn')).toBe('Now on: {title}')
  })

  it('fmtNum switches digits by language', () => {
    expect(fmtNum('bn', '2026')).toBe('২০২৬')
    expect(fmtNum('en', 2026)).toBe('2026')
  })
})
