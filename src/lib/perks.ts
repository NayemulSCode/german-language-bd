import type { Progress } from './storage'

/**
 * Extras for signed-in learners: every lesson unlocked and the Bangla pronunciation line.
 * They are a reason to sign in, so they only make sense where signing in is possible: without Supabase everyone gets them.
 */
export interface Perks {
  allowed: boolean // the learner may use the perks (signed in, or sign-in is not available here)
  unlockAll: boolean // effective value: the setting, if allowed
  bnPron: boolean
}

export function perksFor(signInAvailable: boolean, signedIn: boolean, p: Pick<Progress, 'unlockAll' | 'bnPron'>): Perks {
  const allowed = !signInAvailable || signedIn
  return { allowed, unlockAll: allowed && p.unlockAll, bnPron: allowed && p.bnPron }
}
