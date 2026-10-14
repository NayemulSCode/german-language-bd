import { describe, expect, it } from 'vitest'
import { computeXp, emptyProgress, sanitizeProgress, type Card, type Progress } from './storage'
import { mergeProgress, progressKey, syncOnce, type RemoteStore } from './sync'

const p = (over: Partial<Progress> = {}): Progress => ({ ...emptyProgress(), ...over })
const lesson = (done: number[], best = 0, passed = false) => ({ done, best, total: 8, passed })
const card = (last: number, ivl = 0): Card => ({ due: last + 1000, ivl, reps: 0, lapses: 0, last })

describe('computeXp', () => {
  it('matches the in-app rules: 10 per step 1-4, 5 per best answer, 20 for the first pass', () => {
    expect(computeXp({ a: lesson([0, 1, 2, 3, 4], 7, true) })).toBe(40 + 35 + 20)
    expect(computeXp({ a: lesson([0, 1], 0, false) })).toBe(20)
  })
})

describe('mergeProgress', () => {
  it('unions steps and keeps the higher best score and any pass', () => {
    const a = p({ lessons: { 'a1-u01-l01': lesson([0, 1], 5, false) } })
    const b = p({ lessons: { 'a1-u01-l01': lesson([1, 2, 3], 7, true) } })
    const m = mergeProgress(a, b)
    expect(m.lessons['a1-u01-l01']).toEqual({ done: [0, 1, 2, 3], best: 7, total: 8, passed: true })
    expect(m.xp).toBe(computeXp(m.lessons))
  })

  it('keeps lessons that exist on only one side', () => {
    const m = mergeProgress(p({ lessons: { 'a1-u01-l01': lesson([0]) } }), p({ lessons: { 'a1-u01-l02': lesson([0, 1]) } }))
    expect(Object.keys(m.lessons).sort()).toEqual(['a1-u01-l01', 'a1-u01-l02'])
  })

  it('is commutative and idempotent for progress (settings aside)', () => {
    const a = p({ updatedAt: 5, srs: { 'a1-u01-l01:name': card(5) }, activity: { '2026-01-01': 10 }, lessons: { 'a1-u01-l01': lesson([0], 3) } })
    const b = p({ updatedAt: 9, srs: { 'a1-u01-l01:land': card(9) }, activity: { '2026-01-01': 30 }, lessons: { 'a1-u01-l01': lesson([1], 6, true) } })
    expect(progressKey(mergeProgress(a, b))).toBe(progressKey(mergeProgress(b, a)))
    const m = mergeProgress(a, b)
    expect(progressKey(mergeProgress(m, m))).toBe(progressKey(m))
    expect(progressKey(mergeProgress(m, a))).toBe(progressKey(m))
  })

  it('settings from the more recently updated side win', () => {
    const m = mergeProgress(p({ lang: 'bn', updatedAt: 10 }), p({ lang: 'en', slow: true, updatedAt: 20 }))
    expect(m.lang).toBe('en')
    expect(m.slow).toBe(true)
    expect(m.updatedAt).toBe(20)
  })

  it('keeps the most recently reviewed copy of each card and the higher daily XP', () => {
    const k = 'a1-u01-l01:name'
    const m = mergeProgress(
      p({ srs: { [k]: card(100, 1) }, activity: { '2026-01-01': 10, '2026-01-02': 5 } }),
      p({ srs: { [k]: card(200, 4), 'a1-u01-l01:land': card(50) }, activity: { '2026-01-01': 30 } }),
    )
    expect(m.srs[k].ivl).toBe(4)
    expect(Object.keys(m.srs)).toHaveLength(2)
    expect(m.activity).toEqual({ '2026-01-01': 30, '2026-01-02': 5 })
  })

  it('settings (theme, goal, name, exam date) follow the newer device', () => {
    const m = mergeProgress(p({ updatedAt: 1, theme: 'light', goal: 20, name: 'A', examDate: '2027-01-01' }), p({ updatedAt: 2, theme: 'night', goal: 100, name: 'B', examDate: '2027-02-02' }))
    expect([m.theme, m.goal, m.name, m.examDate]).toEqual(['night', 100, 'B', '2027-02-02'])
  })

  it('placement settings follow the newer device too', () => {
    const m = mergeProgress(p({ updatedAt: 1, startUnit: 1, placed: false, unlockAll: false }), p({ updatedAt: 2, startUnit: 4, placed: true, unlockAll: true }))
    expect([m.startUnit, m.placed, m.unlockAll]).toEqual([4, true, true])
  })
})

describe('sanitizeProgress', () => {
  it('drops malformed data and recomputes xp', () => {
    const s = sanitizeProgress({
      lang: 'xx', slow: 'yes', xp: 999999, updatedAt: -1,
      lessons: { 'a1-u01-l01': { done: [0, 1, 1, 9, 'x'], best: 7, total: 8, passed: true }, bogus: { done: [0] }, 'a1-u01-l02': 5 },
      review: ['a1-u01-l01:ok', 42, { a: 1 }],
      theme: 'neon', goal: 7, name: '  Saheb  ', examDate: 'soon', startUnit: 'x', unlockAll: 'yes', placed: 1,
      srs: { 'a1-u01-l01:name': { due: 5, last: 4, ivl: 2, reps: 1, lapses: 0 }, 'bad key': { due: 1, last: 1 }, 'a1-u01-l02:x': { due: 'no' } },
      activity: { '2026-03-01': 40, 'yesterday': 9, '2026-03-02': -5 },
    })
    expect(s.lang).toBe('both')
    expect(s.slow).toBe(false)
    expect(s.updatedAt).toBe(0)
    expect(s.lessons).toEqual({ 'a1-u01-l01': { done: [0, 1], best: 7, total: 8, passed: true } })
    expect(Object.keys(s.srs).sort()).toEqual(['a1-u01-l01:name', 'a1-u01-l01:ok'])
    expect(s.srs['a1-u01-l01:ok'].due).toBe(0) // legacy missed-word list becomes cards due now
    expect([s.theme, s.goal, s.name, s.examDate]).toEqual(['system', 50, 'Saheb', ''])
    expect([s.startUnit, s.unlockAll, s.placed]).toEqual([1, false, false])
    expect(sanitizeProgress({ startUnit: 6, placed: true, unlockAll: true })).toMatchObject({ startUnit: 6, placed: true, unlockAll: true })
    expect(sanitizeProgress({ startUnit: 0 }).startUnit).toBe(1)
    expect(sanitizeProgress({ startUnitA2: 5 }).startUnitA2).toBe(5)
    expect(sanitizeProgress({ startUnitA2: 'x' }).startUnitA2).toBe(0)
    expect(s.activity).toEqual({ '2026-03-01': 40 })
    expect(s.xp).toBe(20 + 35 + 20)
  })

  it('survives non-objects', () => {
    expect(sanitizeProgress(null)).toEqual(emptyProgress())
    expect(sanitizeProgress('nope')).toEqual(emptyProgress())
  })
})

function fakeRemote(initial: Progress | null) {
  const state = { data: initial, saves: 0 }
  const store: RemoteStore = {
    async load() { return state.data },
    async save(x) { state.data = x; state.saves++ },
  }
  return { state, store }
}

describe('syncOnce', () => {
  it('uploads local progress when the server has nothing', async () => {
    const { state, store } = fakeRemote(null)
    const local = p({ lessons: { 'a1-u01-l01': lesson([0, 1], 4) } })
    const out = await syncOnce(store, local)
    expect(state.saves).toBe(1)
    expect(state.data?.lessons['a1-u01-l01'].best).toBe(4)
    expect(out.lessons['a1-u01-l01'].best).toBe(4)
  })

  it('downloads server progress into an empty device without a pointless upload', async () => {
    const server = p({ lessons: { 'a1-u01-l01': lesson([0, 1, 2, 3, 4], 8, true) } })
    const { state, store } = fakeRemote(server)
    const out = await syncOnce(store, emptyProgress())
    expect(out.lessons['a1-u01-l01'].passed).toBe(true)
    expect(state.saves).toBe(0)
  })

  it('merges two devices and pushes the combination', async () => {
    const { state, store } = fakeRemote(p({ lessons: { 'a1-u01-l01': lesson([0, 1, 2, 3, 4], 8, true) } }))
    const out = await syncOnce(store, p({ lessons: { 'a1-u01-l02': lesson([0], 0) } }))
    expect(Object.keys(out.lessons)).toHaveLength(2)
    expect(Object.keys(state.data!.lessons)).toHaveLength(2)
    expect(state.saves).toBe(1)
  })

  it('does not write when nothing changed', async () => {
    const same = p({ lessons: { 'a1-u01-l01': lesson([0, 1], 3) } })
    const { state, store } = fakeRemote(same)
    await syncOnce(store, same)
    expect(state.saves).toBe(0)
  })

  it('propagates server errors so the caller can show an offline state', async () => {
    const store: RemoteStore = { load: async () => { throw new Error('offline') }, save: async () => {} }
    await expect(syncOnce(store, emptyProgress())).rejects.toThrow('offline')
  })
})
