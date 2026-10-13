import type { Lesson } from '../schema/lesson'

/** Key for an audio clip. Shared by the app (lookup) and scripts/build-audio.ts (generation). */
export const clipKey = (text: string, slow: boolean) => `${slow ? 'slow' : 'normal'}|${text}`

/**
 * Every German string the app can speak for a lesson. These must match the calls in the step
 * components exactly (Say / say()), otherwise the clip is missing and the app falls back to the device voice.
 */
export function speakableTexts(l: Lesson): string[] {
  const out = new Set<string>()
  out.add(l.hook.de)
  for (const w of l.words) out.add((w.art ? w.art + ' ' : '') + w.de)
  for (const line of l.dialog) {
    out.add(line.de.map((t) => t.t).join(' '))
    for (const t of line.de) out.add(t.s ?? t.t)
  }
  for (const q of l.quiz) {
    if (q.type === 'listen') out.add(q.say)
    else if (q.type === 'order') out.add(q.answer.join(' '))
    else if (q.subBn) q.options.forEach((o) => out.add(o)) // picking an option speaks it
  }
  return [...out]
}
